import { getState } from '../storage.js';
import { escapeHtml, formatMoney, categoryGroup, formatDateShort } from '../utils.js';
import { toCsv, downloadCsv } from '../services/csvService.js';
import { NotificationService } from '../services/notificationService.js';
import { adminFilters, filterBarHtml, wireFilterBar, getScopedBookingItems, getScopedDestinations } from './filters.js';

const MIN_OBSERVATIONS = 3;
const NETWORK_COMMISSION_RATE = 0.1; // cấu hình minh hoạ — có thể chỉnh

function anonymizedFeedback(state, scopedDestIds) {
  const reviews = [...state.reviews, ...state.userReviews].filter((r) => scopedDestIds.has(r.destinationId));
  const byGroup = {};
  reviews.forEach((r) => {
    const dest = state.destinations.find((d) => d.id === r.destinationId);
    const group = categoryGroup(dest?.category);
    if (!byGroup[group]) byGroup[group] = { count: 0, sum: 0 };
    byGroup[group].count += 1;
    byGroup[group].sum += r.rating;
  });
  return Object.entries(byGroup).map(([group, v]) => ({ group, count: v.count, avg: v.count ? (v.sum / v.count).toFixed(1) : null }));
}

function filterSummaryText() {
  const parts = [];
  parts.push(`${adminFilters.months} tháng gần nhất`);
  parts.push(`khu vực=${adminFilters.region || 'tất cả'}`);
  parts.push(`loại hình=${adminFilters.group || 'tất cả'}`);
  parts.push(`nhóm khách=${adminFilters.partyType || 'tất cả'}`);
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
      <h1 style="margin-bottom:4px;">Báo cáo</h1>
      <p class="text-sm text-muted">Tổng hợp phản hồi ẩn danh, tách hoa hồng Network khỏi chi tiêu ước tính, và xuất CSV theo đúng bộ lọc đang chọn.</p>
    </div>
    ${filterBarHtml(state)}

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Hoa hồng Network và chi tiêu ước tính</h3>
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">Chi tiêu du khách ước tính</span><span class="quick-fact__value">${formatMoney(revenue)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Hoa hồng Network (${Math.round(NETWORK_COMMISSION_RATE * 100)}%, minh hoạ)</span><span class="quick-fact__value">${formatMoney(commission)}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:8px;">"Chi tiêu ước tính" = tổng giá trị booking đã xác nhận/hoàn thành trong phạm vi lọc — đây là ước lượng dựa trên dữ liệu demo, chưa có kỳ gốc để so sánh nên KHÔNG được trình bày là "mức tăng chi tiêu" hay tác động nhân quả.</p>
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Tổng hợp phản hồi ẩn danh theo nhóm hoạt động</h3>
      ${feedback.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>Nhóm hoạt động</th><th>Số quan sát</th><th>Điểm TB</th></tr></thead>
          <tbody>${feedback.map((f) => `<tr><td>${escapeHtml(f.group)}</td><td>${f.count}</td><td>⭐ ${f.avg}</td></tr>`).join('')}</tbody>
        </table>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa có nhóm nào đủ quan sát để hiển thị.</p>'}
      <p class="text-sm text-faint" style="margin-top:8px;">Đã ẩn ${feedbackHidden} nhóm có dưới ${MIN_OBSERVATIONS} quan sát để giảm nguy cơ nhận diện cá nhân/hộ.</p>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Xuất CSV theo bộ lọc đang chọn</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">File xuất khớp đúng với KPI/bảng đang hiển thị ở các trang khác trong Cổng dữ liệu quản lý (cùng phạm vi lọc: ${escapeHtml(filterSummaryText())}).</p>
      <div class="cta-row" style="margin-top:10px;">
        <button type="button" class="btn btn-primary btn-sm" id="export-bookings-csv">⬇️ Xuất booking (${scoped.length} dòng)</button>
        <button type="button" class="btn btn-secondary btn-sm" id="export-feedback-csv">⬇️ Xuất phản hồi ẩn danh</button>
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
    NotificationService.notify('Đã tạo file CSV booking theo bộ lọc hiện tại.', 'success');
  });

  container.querySelector('#export-feedback-csv').addEventListener('click', () => {
    const csv = toCsv(feedback, [
      { label: 'Nhóm hoạt động', key: 'group' },
      { label: 'Số quan sát', key: 'count' },
      { label: 'Điểm trung bình', key: 'avg' },
    ]);
    downloadCsv(`phan-hoi-an-danh-${Date.now()}.csv`, csvMetaHeader() + csv);
    NotificationService.notify('Đã tạo file CSV phản hồi ẩn danh.', 'success');
  });
}
