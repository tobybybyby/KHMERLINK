import { getState } from '../storage.js';
import { escapeHtml, formatMoney, categoryGroup, categoryGroupLabel, formatDateShort } from '../utils.js';
import { toCsv, downloadCsv } from '../services/csvService.js';
import { NotificationService } from '../services/notificationService.js';
import { adminFilters, filterBarHtml, wireFilterBar, getScopedBookingItems, getScopedDestinations } from './filters.js';
import { t, registerTranslations } from '../services/i18nService.js';

registerTranslations('management', {
  reports: {
    title: 'Báo cáo',
    subtitle: 'Tổng hợp phản hồi ẩn danh, tách hoa hồng Network khỏi chi tiêu ước tính, và xuất CSV theo đúng bộ lọc đang chọn.',
    commissionTitle: 'Hoa hồng Network và chi tiêu ước tính',
    estimatedSpend: 'Chi tiêu du khách ước tính',
    networkCommission: 'Hoa hồng Network ({pct}%, minh hoạ)',
    commissionNote: '"Chi tiêu ước tính" = tổng giá trị booking đã xác nhận/hoàn thành trong phạm vi lọc — đây là ước lượng dựa trên dữ liệu demo, chưa có kỳ gốc để so sánh nên KHÔNG được trình bày là "mức tăng chi tiêu" hay tác động nhân quả.',
    anonFeedbackTitle: 'Tổng hợp phản hồi ẩn danh theo nhóm hoạt động',
    thGroup: 'Nhóm hoạt động',
    thObservations: 'Số quan sát',
    thAvgScore: 'Điểm TB',
    noGroupsEnough: 'Chưa có nhóm nào đủ quan sát để hiển thị.',
    hiddenGroupsNote: 'Đã ẩn {count} nhóm có dưới {min} quan sát để giảm nguy cơ nhận diện cá nhân/hộ.',
    exportCsvTitle: 'Xuất CSV theo bộ lọc đang chọn',
    exportCsvNote: 'File xuất khớp đúng với KPI/bảng đang hiển thị ở các trang khác trong Cổng dữ liệu quản lý (cùng phạm vi lọc: {scope}).',
    exportBookings: '⬇️ Xuất booking ({count} dòng)',
    exportFeedback: '⬇️ Xuất phản hồi ẩn danh',
    bookingsCsvNotify: 'Đã tạo file CSV booking theo bộ lọc hiện tại.',
    feedbackCsvNotify: 'Đã tạo file CSV phản hồi ẩn danh.',
    lastMonths: '{count} tháng gần nhất',
    regionEq: 'khu vực={value}',
    typeEq: 'loại hình={value}',
    partyEq: 'nhóm khách={value}',
    all: 'tất cả',
  },
}, {
  reports: {
    title: 'Reports',
    subtitle: 'Aggregated anonymous feedback, separates Network commission from estimated spend, and exports CSV matching the current filter.',
    commissionTitle: 'Network Commission & Estimated Spend',
    estimatedSpend: 'Estimated visitor spend',
    networkCommission: 'Network commission ({pct}%, illustrative)',
    commissionNote: '"Estimated spend" = total value of confirmed/completed bookings within the current filter scope — this is an estimate based on demo data with no baseline period for comparison, so it must NOT be presented as a "spend increase" or causal impact.',
    anonFeedbackTitle: 'Aggregated anonymous feedback by activity group',
    thGroup: 'Activity group',
    thObservations: 'Observations',
    thAvgScore: 'Avg. score',
    noGroupsEnough: 'No group has enough observations to display yet.',
    hiddenGroupsNote: '{count} groups with fewer than {min} observations were hidden to reduce the risk of identifying individuals/providers.',
    exportCsvTitle: 'Export CSV matching the current filter',
    exportCsvNote: 'The exported file matches the KPIs/tables shown on other Management Data Portal pages (same filter scope: {scope}).',
    exportBookings: '⬇️ Export bookings ({count} rows)',
    exportFeedback: '⬇️ Export anonymous feedback',
    bookingsCsvNotify: 'Booking CSV file generated for the current filter.',
    feedbackCsvNotify: 'Anonymous feedback CSV file generated.',
    lastMonths: 'last {count} months',
    regionEq: 'region={value}',
    typeEq: 'type={value}',
    partyEq: 'guest group={value}',
    all: 'all',
  },
});

const MIN_OBSERVATIONS = 3;
const NETWORK_COMMISSION_RATE = 0.1; // cấu hình minh hoạ — có thể chỉnh

function anonymizedFeedback(state, scopedDestIds) {
  const reviews = state.reviews.filter((r) => r.status === 'published' && scopedDestIds.has(r.listingId));
  const byGroup = {};
  reviews.forEach((r) => {
    const dest = state.destinations.find((d) => d.id === r.listingId);
    const group = categoryGroup(dest?.category);
    if (!byGroup[group]) byGroup[group] = { count: 0, sum: 0 };
    byGroup[group].count += 1;
    byGroup[group].sum += Number(r.overallRating);
  });
  return Object.entries(byGroup).map(([group, v]) => ({ group, count: v.count, avg: v.count ? (v.sum / v.count).toFixed(1) : null }));
}

function filterSummaryText() {
  const parts = [];
  parts.push(t('management.reports.lastMonths', { count: adminFilters.months }));
  parts.push(t('management.reports.regionEq', { value: adminFilters.region || t('management.reports.all') }));
  parts.push(t('management.reports.typeEq', { value: adminFilters.group ? categoryGroupLabel(adminFilters.group) : t('management.reports.all') }));
  parts.push(t('management.reports.partyEq', { value: adminFilters.partyType || t('management.reports.all') }));
  return parts.join(', ');
}

function csvMetaHeader() {
  return [
    `# Xuất lúc: ${new Date().toLocaleString('vi-VN')}`,
    `# Phạm vi lọc: ${filterSummaryText()}`,
    '# Lưu ý: dữ liệu demo/minh hoạ trong localStorage của trình duyệt, không phải số liệu chính thức của tỉnh.',
    '',
  ].join('\r\n');
}

export function renderAdminReports(container) {
  const state = getState();
  const scoped = getScopedBookingItems(state);
  const scopedDests = getScopedDestinations(state);
  const scopedDestIds = new Set(scopedDests.map((d) => d.id));

  const revenue = scoped.filter((bi) => ['accepted', 'completed'].includes(bi.status)).reduce((s, bi) => s + bi.subtotal, 0);
  const commission = Math.round(revenue * NETWORK_COMMISSION_RATE);
  const feedback = anonymizedFeedback(state, scopedDestIds).filter((f) => f.count >= MIN_OBSERVATIONS);
  const feedbackHidden = anonymizedFeedback(state, scopedDestIds).filter((f) => f.count < MIN_OBSERVATIONS).length;

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">${t('management.reports.title')}</h1>
      <p class="text-sm text-muted">${t('management.reports.subtitle')}</p>
    </div>
    ${filterBarHtml(state)}

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('management.reports.commissionTitle')}</h3>
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">${t('management.reports.estimatedSpend')}</span><span class="quick-fact__value">${formatMoney(revenue)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('management.reports.networkCommission', { pct: Math.round(NETWORK_COMMISSION_RATE * 100) })}</span><span class="quick-fact__value">${formatMoney(commission)}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:8px;">${t('management.reports.commissionNote')}</p>
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">${t('management.reports.anonFeedbackTitle')}</h3>
      ${feedback.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>${t('management.reports.thGroup')}</th><th>${t('management.reports.thObservations')}</th><th>${t('management.reports.thAvgScore')}</th></tr></thead>
          <tbody>${feedback.map((f) => `<tr><td>${escapeHtml(categoryGroupLabel(f.group))}</td><td>${f.count}</td><td>⭐ ${f.avg}</td></tr>`).join('')}</tbody>
        </table>
      ` : `<p class="text-sm text-faint" style="margin-top:10px;">${t('management.reports.noGroupsEnough')}</p>`}
      <p class="text-sm text-faint" style="margin-top:8px;">${t('management.reports.hiddenGroupsNote', { count: feedbackHidden, min: MIN_OBSERVATIONS })}</p>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('management.reports.exportCsvTitle')}</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">${t('management.reports.exportCsvNote', { scope: escapeHtml(filterSummaryText()) })}</p>
      <div class="cta-row" style="margin-top:10px;">
        <button type="button" class="btn btn-primary btn-sm" id="export-bookings-csv">${t('management.reports.exportBookings', { count: scoped.length })}</button>
        <button type="button" class="btn btn-secondary btn-sm" id="export-feedback-csv">${t('management.reports.exportFeedback')}</button>
      </div>
    </section>
  `;

  wireFilterBar(container, () => renderAdminReports(container));

  container.querySelector('#export-bookings-csv').addEventListener('click', () => {
    const destById = new Map(state.destinations.map((d) => [d.id, d]));
    const csv = toCsv(scoped, [
      { label: 'Ngày tạo', value: (bi) => formatDateShort(bi.statusHistory[0]?.at) },
      { label: 'Địa điểm', value: (bi) => destById.get(bi.destinationId)?.name || bi.destinationId },
      { label: 'Khu vực', value: (bi) => destById.get(bi.destinationId)?.region || '' },
      { label: 'Nhóm hoạt động', value: (bi) => categoryGroup(destById.get(bi.destinationId)?.category) },
      { label: 'Trải nghiệm', key: 'title' },
      { label: 'Số khách', key: 'quantity' },
      { label: 'Thành tiền (đ)', key: 'subtotal' },
      { label: 'Trạng thái', key: 'status' },
      { label: 'Mã booking', value: (bi) => state.bookings.find((b) => b.id === bi.bookingId)?.code || '' },
    ]);
    downloadCsv(`booking-loc-${Date.now()}.csv`, csvMetaHeader() + csv);
    NotificationService.notify(t('management.reports.bookingsCsvNotify'), 'success');
  });

  container.querySelector('#export-feedback-csv').addEventListener('click', () => {
    const csv = toCsv(feedback, [
      { label: 'Nhóm hoạt động', key: 'group' },
      { label: 'Số quan sát', key: 'count' },
      { label: 'Điểm trung bình', key: 'avg' },
    ]);
    downloadCsv(`phan-hoi-an-danh-${Date.now()}.csv`, csvMetaHeader() + csv);
    NotificationService.notify(t('management.reports.feedbackCsvNotify'), 'success');
  });
}
