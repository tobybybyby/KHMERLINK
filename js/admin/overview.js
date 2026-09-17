// "Tổng quan" — Cổng dữ liệu quản lý, redesign dashboard kiểu Power BI (canvas grid 12 cột, KPI +
// biểu đồ cross-filter với nhau qua js/admin/filters.js#adminFilters — KHÔNG tạo state lọc riêng,
// KHÔNG đổi công thức/nguồn số liệu, chỉ thay layout + thêm tương tác click-để-lọc/làm nổi bật lên
// trên các selector đã có sẵn (networkMetrics.js, managementService.js, hostBookingService.js).
import { getState } from '../storage.js';
import { escapeHtml, formatMoney, formatDateShort, qs, qsa } from '../utils.js';
import { adminFilters, filterBarHtml, wireFilterBar, destinationInScope, providerInScope, getScopedDestinations } from './filters.js';
import {
  getNetworkKpis, getNetworkMonthlyRevenue, getParticipantsAndVisitsSeries,
  getRevenueByProviderDonut, getRevenueByType, getRatingByListingBar, getTopFeedbackTable,
} from './networkMetrics.js';
import { getNetworkMetrics, getCurrentPeriod } from '../services/hostBookingService.js';
import { getCapacityUtilisation } from '../services/managementService.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import { t, localize, registerTranslations, getCurrentLanguage, formatNumber } from '../services/i18nService.js';
import { localizeTag } from '../services/tagCatalog.js';
import { dashCardHtml, kpiCardHtml, rowLabelHtml, wireFocusButtons, toneColors } from './dashboardShell.js';
import { renderNetworkMap } from './networkMap.js';

registerTranslations('management', {
  overview: {
    title: 'Tổng quan hoạt động',
    subtitle: 'Kết quả trong kỳ trên toàn mạng lưới.',
    performanceTitle: 'Hiệu suất theo đơn vị — tháng {month}',
    totalActiveBookings: 'Active bookings',
    completed: 'Hoàn thành',
    confirmed: 'Đã xác nhận',
    pending: 'Đang chờ',
    totalGuests: 'Tổng khách',
    totalGrossValue: 'Tổng giá trị booking',
    communityIncome: 'Thu nhập community providers',
    ticketRevenue: 'Doanh thu vé dự kiến (bảo tàng)',
    platformFee: 'Phí nền tảng dự kiến (3 trải nghiệm)',
    freeSiteNote: 'Điểm miễn phí (chùa/cụm) không đưa vào doanh thu.',
    noPendingProposals: 'Không có đề án nào đang chờ xử lý.',
    proposalStatus: { sent: 'Đã gửi', pending_review: 'Chờ duyệt', reviewing: 'Đang xem xét', in_review: 'Đang xem xét', needs_info: 'Cần bổ sung', needs_revision: 'Cần bổ sung' },
    thTitle: 'Tiêu đề',
    thSubmitter: 'Hộ gửi',
    thStatus: 'Trạng thái',
    thDate: 'Ngày gửi',
    viewAllProposals: 'Xem đầy đủ Đề án →',
    noReviewsInScope: 'Chưa có đánh giá nào trong phạm vi lọc.',
    thListing: 'Listing',
    thStars: 'Sao',
    thComment: 'Nhận xét',
    thDate2: 'Ngày',
    showMore: 'Xem thêm',
    showLess: 'Thu gọn',
    totalExperienceInstances: 'Tổng lượt trải nghiệm',
    completedBookings: 'Booking hoàn thành',
    platformRevenue: 'Doanh thu qua nền tảng',
    providerIncome: 'Thu nhập chuyển cho hộ/nghệ nhân',
    weightedRating: 'Điểm đánh giá (trọng số)',
    recommendRate: 'Tỷ lệ muốn giới thiệu',
    activeHosts: 'Host đang hoạt động',
    pendingBookings: 'Pending bookings',
    kpiFootnote: '"Tổng lượt trải nghiệm" gộp khách tham gia hoạt động trả phí + lượt ghé điểm miễn phí, không đếm trùng 1 lượt trải nghiệm ở 2 chỉ số. Điểm đánh giá trung bình có trọng số theo số lượt đánh giá thật của từng listing, không phải trung bình cộng của 7 con số. "Active bookings"/"Tổng khách"/"Tổng giá trị booking"/"Thu nhập community providers" ở dải KPI trên cùng là số liệu THÁNG HIỆN TẠI (so kỳ trước); dải KPI bên dưới là số liệu LUỸ KẾ theo khoảng thời gian đang lọc.',
    revenueByMonthTitle: 'Doanh thu ghi nhận qua mạng lưới pilot theo tháng',
    participationByMonthTitle: 'Booking và lượng khách theo tháng',
    participationByMonthSubtitle: 'Lượt tham gia (trả phí) + lượt ghé (miễn phí) — bấm 1 tháng để làm nổi bật, bấm lại để bỏ chọn.',
    revenueByProviderTitle: 'Cơ cấu giá trị theo đơn vị cung cấp',
    revenueByProviderSubtitle: 'Bấm 1 đơn vị để lọc toàn dashboard theo đơn vị đó.',
    noRevenueInScope: 'Chưa có doanh thu nào trong phạm vi lọc.',
    revenueByTypeTitle: 'Doanh thu theo loại hình',
    ratingByListingTitle: 'Điểm đánh giá theo listing',
    topFeedbackTitle: 'Top phản hồi',
    pendingProposalsTitle: 'Đề án hỗ trợ đang chờ xử lý',
    revenueLabel: 'Doanh thu (đ)',
    paidParticipation: 'Lượt tham gia (trả phí)',
    freeVisits: 'Lượt ghé (miễn phí)',
    ratingLabel: 'Điểm đánh giá',
    chartLoadError: 'Không tải được thư viện biểu đồ (mạng chặn CDN) — xem số liệu ở bảng bên dưới.',
    providerCategory: { 'Đơn vị văn hóa công': 'Đơn vị văn hóa công', 'Hộ dân/nghệ nhân': 'Hộ dân/nghệ nhân' },
    // ---- Visual mới trong redesign dashboard ----
    bookingStatusTitle: 'Trạng thái booking',
    bookingStatusSubtitle: 'Bấm 1 trạng thái để lọc dashboard.',
    statusCompleted: 'Hoàn thành',
    statusConfirmed: 'Đã xác nhận',
    statusPending: 'Đang chờ',
    statusCancelled: 'Đã huỷ/từ chối',
    quickAlertsTitle: 'Cảnh báo vận hành',
    quickAlertsSubtitle: 'Cần xử lý sớm.',
    alertPendingBookings: 'Booking đang chờ xác nhận',
    alertHighOccupancy: 'Listing gần hết chỗ (≥80%)',
    alertPendingProposals: 'Đề án cần duyệt',
    alertPendingSubmissions: 'Nội dung cần kiểm duyệt',
    noAlerts: 'Không có cảnh báo nào — mọi thứ đang ổn.',
    networkMapTitle: 'Bản đồ mạng lưới',
    networkMapSubtitle: 'Kích thước marker theo số khách trong kỳ — bấm marker để lọc theo listing.',
    demandCapacityTitle: 'Nhu cầu và sức chứa',
    demandCapacitySubtitle: 'Bấm 1 hoạt động để lọc dashboard.',
    occupancyUnlimited: 'Miễn phí',
    kpiMonthLabel: 'Tháng {month} (so tháng trước)',
    kpiCumulativeLabel: 'Luỹ kế theo bộ lọc hiện tại',
    viewAllContent: 'Xem Kiểm duyệt nội dung →',
  },
}, {
  overview: {
    title: 'Operations Overview',
    subtitle: 'Network-wide results for the period.',
    performanceTitle: 'Provider performance — {month}',
    totalActiveBookings: 'Active bookings',
    completed: 'Completed',
    confirmed: 'Confirmed',
    pending: 'Pending',
    totalGuests: 'Total guests',
    totalGrossValue: 'Total booking value',
    communityIncome: 'Community providers income',
    ticketRevenue: 'Expected ticket revenue (museum)',
    platformFee: 'Expected platform fee (3 experiences)',
    freeSiteNote: 'Free sites (pagodas/clusters) are not counted in revenue.',
    noPendingProposals: 'No proposals pending.',
    proposalStatus: { sent: 'Sent', pending_review: 'Pending Review', reviewing: 'Under Review', in_review: 'Under Review', needs_info: 'Needs More Info', needs_revision: 'Needs More Info' },
    thTitle: 'Title',
    thSubmitter: 'Submitted by',
    thStatus: 'Status',
    thDate: 'Date sent',
    viewAllProposals: 'View all Proposals →',
    noReviewsInScope: 'No reviews within the current filter scope.',
    thListing: 'Listing',
    thStars: 'Stars',
    thComment: 'Comment',
    thDate2: 'Date',
    showMore: 'Show more',
    showLess: 'Show less',
    totalExperienceInstances: 'Total experience instances',
    completedBookings: 'Completed bookings',
    platformRevenue: 'Platform revenue',
    providerIncome: 'Income paid to providers',
    weightedRating: 'Weighted rating',
    recommendRate: 'Would recommend rate',
    activeHosts: 'Active hosts',
    pendingBookings: 'Pending bookings',
    kpiFootnote: '"Total experience instances" combines paying activity guests + free-site visits, without double-counting the same visit across both metrics. The average rating is weighted by each listing\'s real review count, not a simple average of the 7 figures. "Active bookings"/"Total guests"/"Total booking value"/"Community providers income" in the top KPI row are for the CURRENT MONTH (vs. last month); the row below is CUMULATIVE over the currently-filtered date range.',
    revenueByMonthTitle: 'Recorded revenue across the pilot network by month',
    participationByMonthTitle: 'Bookings and guests by month',
    participationByMonthSubtitle: 'Paid participation + free visits — click a month to highlight it, click again to clear.',
    revenueByProviderTitle: 'Value breakdown by provider',
    revenueByProviderSubtitle: 'Click a provider to filter the whole dashboard by it.',
    noRevenueInScope: 'No revenue within the current filter scope.',
    revenueByTypeTitle: 'Revenue by type',
    ratingByListingTitle: 'Rating by listing',
    topFeedbackTitle: 'Top Feedback',
    pendingProposalsTitle: 'Support proposals pending action',
    revenueLabel: 'Revenue (VND)',
    paidParticipation: 'Paid participation',
    freeVisits: 'Free visits',
    ratingLabel: 'Rating',
    chartLoadError: 'Could not load the chart library (network blocked the CDN) — see the tabular figures below.',
    providerCategory: { 'Đơn vị văn hóa công': 'Public cultural organisation', 'Hộ dân/nghệ nhân': 'Household/artisan' },
    bookingStatusTitle: 'Booking status',
    bookingStatusSubtitle: 'Click a status to filter the dashboard.',
    statusCompleted: 'Completed',
    statusConfirmed: 'Confirmed',
    statusPending: 'Pending',
    statusCancelled: 'Cancelled/Declined',
    quickAlertsTitle: 'Operational alerts',
    quickAlertsSubtitle: 'Needs attention soon.',
    alertPendingBookings: 'Bookings awaiting confirmation',
    alertHighOccupancy: 'Listings near full (≥80%)',
    alertPendingProposals: 'Proposals to review',
    alertPendingSubmissions: 'Content pending moderation',
    noAlerts: 'No alerts — everything looks fine.',
    networkMapTitle: 'Network map',
    networkMapSubtitle: 'Marker size reflects guests this period — click a marker to filter by listing.',
    demandCapacityTitle: 'Demand & capacity',
    demandCapacitySubtitle: 'Click an activity to filter the dashboard.',
    occupancyUnlimited: 'Free',
    kpiMonthLabel: '{month} (vs. last month)',
    kpiCumulativeLabel: 'Cumulative over the current filter range',
    viewAllContent: 'View Content Moderation →',
  },
});

function providerCategoryLabel(v) { return t(`management.overview.providerCategory.${v}`) || v; }

function scopedProviderIds(state) {
  return state.hosts
    .filter((h) => destinationInScope(state.destinations.find((d) => d.id === h.destinationId)) && providerInScope(state, h.id))
    .map((h) => h.id);
}

// getScopedDestinations()/getTopFeedbackTable() (filters.js/networkMetrics.js) lọc theo khu vực/
// loại hình/listing/financial mode/trạng thái — KHÔNG lọc theo "Đơn vị cung cấp" (thiết kế có chủ
// đích, xem ghi chú tại filters.js#getScopedDestinations — providerId chỉ áp dụng ở cấp host qua
// getScopedHostIds/providerInScope, dùng cho số liệu booking). Bản đồ + Top phản hồi ở dashboard
// này hiển thị theo LISTING nên cần thêm lọc providerId phía hiển thị — không đổi 2 hàm gốc.
function destinationsScopedByProvider(state, dests) {
  if (!adminFilters.providerId) return dests;
  return dests.filter((d) => {
    const host = state.hosts.find((h) => h.destinationId === d.id);
    return host ? host.id === adminFilters.providerId : false;
  });
}

function monthCurrentLabel(period) { return getCurrentLanguage() === 'vi' ? `T${period.month + 1}/${period.year}` : `${period.month + 1}/${period.year}`; }

function previousPeriod(period) {
  return period.month === 0 ? { year: period.year - 1, month: 11 } : { year: period.year, month: period.month - 1 };
}

function pctDelta(curr, prev) {
  if (!prev) return undefined;
  return ((curr - prev) / prev) * 100;
}

let selectedMonthIndex = null; // cross-highlight thuần hiển thị cho trend chart — KHÔNG phải data filter

function toggleBookingStatusFilter(code, container) {
  adminFilters.bookingStatus = adminFilters.bookingStatus === code ? '' : code;
  renderAdminOverview(container);
}

function toggleProviderFilter(providerId, container) {
  adminFilters.providerId = adminFilters.providerId === providerId ? '' : providerId;
  renderAdminOverview(container);
}

function toggleListingFilter(listingId, container) {
  adminFilters.listingId = adminFilters.listingId === listingId ? '' : listingId;
  renderAdminOverview(container);
}

// ---------- Row 1: KPI tháng hiện tại (so kỳ trước) ----------
function kpiRowHtml(net, prevNet, kpi) {
  return `
    ${rowLabelHtml(t('management.overview.kpiMonthLabel', { month: monthCurrentLabel(net.period) }))}
    ${kpiCardHtml({ id: 'kpi-active-bookings', label: t('management.overview.totalActiveBookings'), value: formatNumber(net.totalActiveBookings), deltaPct: pctDelta(net.totalActiveBookings, prevNet.totalActiveBookings), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-total-guests', label: t('management.overview.totalGuests'), value: formatNumber(net.totalGuests), deltaPct: pctDelta(net.totalGuests, prevNet.totalGuests), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-gross-value', label: t('management.overview.totalGrossValue'), value: formatMoney(net.totalGrossValue), deltaPct: pctDelta(net.totalGrossValue, prevNet.totalGrossValue), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-community-income', label: t('management.overview.communityIncome'), value: formatMoney(net.communityProviderIncome), deltaPct: pctDelta(net.communityProviderIncome, prevNet.communityProviderIncome), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-pending', label: t('management.overview.pendingBookings'), value: formatNumber(net.totalPending), span: 2, tooltip: t('management.overview.freeSiteNote') })}
    ${kpiCardHtml({ id: 'kpi-rating', label: t('management.overview.weightedRating'), value: kpi.weightedAverageRating === null ? '—' : `⭐ ${kpi.weightedAverageRating.toFixed(1)}`, unit: kpi.weightedAverageRating === null ? '' : `(${kpi.totalReviewCount})`, span: 2 })}
  `;
}

// ---------- Dải KPI luỹ kế theo bộ lọc (giữ nguyên như bản cũ, chỉ đổi khung hiển thị) ----------
function cumulativeKpiRowHtml(kpi) {
  return `
    ${rowLabelHtml(t('management.overview.kpiCumulativeLabel'))}
    ${kpiCardHtml({ id: 'kpi-instances', label: t('management.overview.totalExperienceInstances'), value: formatNumber(kpi.totalExperienceInstances), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-completed-bookings', label: t('management.overview.completedBookings'), value: formatNumber(kpi.totalCompletedBookings), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-platform-revenue', label: t('management.overview.platformRevenue'), value: formatMoney(kpi.totalGrossRevenue), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-provider-income', label: t('management.overview.providerIncome'), value: formatMoney(kpi.totalProviderIncome), span: 2 })}
    ${kpiCardHtml({ id: 'kpi-recommend', label: t('management.overview.recommendRate'), value: kpi.recommendRate === null ? '—' : `${Math.round(kpi.recommendRate * 100)}%`, span: 2 })}
    ${kpiCardHtml({ id: 'kpi-active-hosts', label: t('management.overview.activeHosts'), value: formatNumber(kpi.activeHostCount), span: 2 })}
    <p class="text-sm text-faint mdash-col-12" style="margin:0;">${t('management.overview.kpiFootnote')}</p>
  `;
}

function pendingProposalsHtml(state) {
  const pending = state.proposals.filter((p) => ['sent', 'pending_review', 'reviewing', 'in_review', 'needs_info', 'needs_revision'].includes(p.status));
  if (!pending.length) return `<p class="text-sm text-faint">${t('management.overview.noPendingProposals')}</p>`;
  return `
    <table class="admin-table">
      <thead><tr><th>${t('management.overview.thTitle')}</th><th>${t('management.overview.thSubmitter')}</th><th>${t('management.overview.thStatus')}</th><th>${t('management.overview.thDate')}</th></tr></thead>
      <tbody>
        ${pending.map((p) => {
          const host = state.hosts.find((h) => h.id === (p.hostId || p.providerId));
          return `<tr><td>${escapeHtml(localize(p.title))}</td><td>${host ? escapeHtml(host.name) : '—'}</td><td>${escapeHtml(t(`management.overview.proposalStatus.${p.status}`) || p.status)}</td><td>${formatDateShort(p.submittedAt || p.createdAt)}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
    <a class="btn btn-secondary btn-sm" href="#/admin/proposals" style="margin-top:10px;">${t('management.overview.viewAllProposals')}</a>
  `;
}

function topFeedbackHtml(rows) {
  if (!rows.length) return `<p class="text-sm text-faint">${t('management.overview.noReviewsInScope')}</p>`;
  const cardsHtml = `
    <div class="flex-col gap-2">
      ${rows.slice(0, 5).map((r, i) => {
        const comment = localize(r.comment) || '';
        const isLong = comment.length > 110;
        return `
          <div class="feedback-card" data-feedback-card="${i}">
            <div class="feedback-card__head">
              <strong class="feedback-card__title" style="font-size:0.82rem;">${escapeHtml(r.listingName)}</strong>
              <span class="feedback-card__rating" style="font-size:0.78rem;">★ ${r.overallRating.toFixed(1)}</span>
            </div>
            ${(r.selectedTags || []).slice(0, 2).length ? `<div class="feedback-card__tags">${r.selectedTags.slice(0, 2).map((tagId) => `<span class="chip" style="padding:2px 8px;font-size:0.68rem;">${escapeHtml(localizeTag(tagId))}</span>`).join('')}</div>` : ''}
            ${comment ? `<p class="feedback-card__comment${isLong ? ' feedback-card__comment--clamped' : ''}" data-comment="${i}" style="font-size:0.8rem;">${escapeHtml(comment)}</p>` : ''}
            <div class="feedback-card__footer">
              <span class="text-sm text-faint">${formatDateShort(r.createdAt)}</span>
              ${isLong ? `<button type="button" class="btn-back-link text-sm" data-expand-feedback="${i}">${t('management.overview.showMore')}</button>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  return cardsHtml;
}

// ---------- Row 2 Visual C: trạng thái booking ----------
const BOOKING_STATUS_KEYS = ['completed', 'accepted', 'pending', 'cancelled'];
const BOOKING_STATUS_LABEL_KEY = { completed: 'statusCompleted', accepted: 'statusConfirmed', pending: 'statusPending', cancelled: 'statusCancelled' };

function bookingStatusCounts(net) {
  const cancelled = net.perProvider.reduce((s, p) => s + p.cancelledCount, 0);
  return { completed: net.totalCompleted, accepted: net.totalConfirmed, pending: net.totalPending, cancelled };
}

// ---------- Row 2 Visual D: cảnh báo vận hành ----------
function quickAlertsHtml(state, net, capacityRows) {
  const highOccupancy = capacityRows.filter((r) => r.occupancyRate !== null && r.occupancyRate >= 0.8);
  const pendingProposals = state.proposals.filter((p) => ['sent', 'pending_review', 'reviewing', 'in_review'].includes(p.status));
  const pendingSubmissions = (state.contentSubmissions || []).filter((s) => ['pending_review', 'in_review'].includes(s.status));

  const items = [
    { key: 'pending-bookings', label: t('management.overview.alertPendingBookings'), count: net.totalPending, tone: net.totalPending > 0 ? 'danger' : 'success', clickable: true },
    { key: 'high-occupancy', label: t('management.overview.alertHighOccupancy'), count: highOccupancy.length, tone: highOccupancy.length > 0 ? 'danger' : 'success', clickable: highOccupancy.length > 0 },
    { key: 'pending-proposals', label: t('management.overview.alertPendingProposals'), count: pendingProposals.length, tone: pendingProposals.length > 0 ? 'danger' : 'success', href: '#/admin/proposals' },
    { key: 'pending-submissions', label: t('management.overview.alertPendingSubmissions'), count: pendingSubmissions.length, tone: pendingSubmissions.length > 0 ? 'danger' : 'success', href: '#/ops/content' },
  ];
  if (items.every((it) => it.count === 0)) return `<p class="text-sm text-faint">${t('management.overview.noAlerts')}</p>`;
  return `
    <div class="mdash-alert-list">
      ${items.map((it) => {
        const inner = `<span class="mdash-alert-item__label">${escapeHtml(it.label)}</span><span class="mdash-alert-item__count mdash-alert-item__count--${it.tone}">${it.count}</span>`;
        if (it.href) return `<a class="mdash-alert-item" href="${it.href}">${inner}</a>`;
        if (it.clickable) return `<button type="button" class="mdash-alert-item" data-alert-action="${it.key}" style="width:100%;text-align:left;border:1px solid var(--color-border);">${inner}</button>`;
        return `<div class="mdash-alert-item">${inner}</div>`;
      }).join('')}
    </div>
  `;
}

// ---------- Row 3 Visual F: nhu cầu & sức chứa (compact) ----------
function demandCapacityHtml(rows) {
  const sorted = rows.slice().sort((a, b) => (b.occupancyRate ?? -1) - (a.occupancyRate ?? -1));
  return `
    <div class="flex-col gap-2">
      ${sorted.map((r) => {
        const isSelected = adminFilters.listingId === r.activityId;
        const pct = r.occupancyRate === null ? null : Math.round(r.occupancyRate * 100);
        const barColor = r.occupancyRate === null ? 'var(--color-border-strong)' : r.occupancyRate >= 0.8 ? 'var(--color-danger)' : r.occupancyRate >= 0.5 ? 'var(--color-accent)' : 'var(--color-success)';
        return `
          <button type="button" class="mdash-list-item${isSelected ? ' is-selected' : ''}" data-capacity-row="${escapeHtml(r.activityId)}" style="width:100%;text-align:left;border:1px solid var(--color-border);border-radius:6px;padding:6px 9px;background:var(--color-surface);">
            <div class="flex justify-between items-center gap-2" style="font-size:0.8rem;">
              <strong style="overflow-wrap:anywhere;">${escapeHtml(r.name)}</strong>
              <span class="text-sm text-muted" style="white-space:nowrap;">${pct === null ? t('management.overview.occupancyUnlimited') : `${pct}%`}</span>
            </div>
            <div style="background:var(--color-border);border-radius:6px;height:8px;overflow:hidden;margin-top:4px;">
              <div style="width:${pct === null ? 100 : Math.max(4, pct)}%;background:${barColor};height:100%;"></div>
            </div>
            <div class="text-sm text-faint" style="margin-top:3px;">${formatNumber(r.demandGuests)} ${t('management.overview.totalGuests').toLowerCase()}${r.pendingCount ? ` · ${r.pendingCount} ${t('management.overview.pendingBookings').toLowerCase()}` : ''}</div>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

export function renderAdminOverview(container) {
  const state = getState();
  container.id = container.id || 'admin-overview-root';
  const kpi = getNetworkKpis(state);
  const period = getCurrentPeriod();
  const scopedIds = scopedProviderIds(state);
  const netCurrentMonth = getNetworkMetrics(state, period, scopedIds);
  const prevNet = getNetworkMetrics(state, previousPeriod(period), scopedIds);
  const monthlyRevenue = getNetworkMonthlyRevenue(state);
  const series = getParticipantsAndVisitsSeries(state);
  const providerDonut = getRevenueByProviderDonut(state);
  const revenueByType = getRevenueByType(state);
  const ratingByListing = getRatingByListingBar(state);
  const topFeedback = destinationsScopedByProvider(state, getTopFeedbackTable(state, 24).map((r) => ({ ...r, id: r.listingId }))).slice(0, 8);
  const capacityRows = getCapacityUtilisation(state, period, { providerId: adminFilters.providerId, activityId: adminFilters.listingId, category: adminFilters.group });
  const scopedDests = destinationsScopedByProvider(state, getScopedDestinations(state));
  const guestsByListingId = Object.fromEntries(capacityRows.map((r) => [r.activityId, r.demandGuests]));
  const statusCounts = bookingStatusCounts(netCurrentMonth);

  container.innerHTML = `
    <div class="mdash">
      <div class="mdash-header">
        <div>
          <h1>${t('management.overview.title')}</h1>
          <p class="text-sm text-muted" style="margin:0;">${t('management.overview.subtitle')}</p>
        </div>
      </div>

      ${filterBarHtml(state)}

      <div class="mdash-grid">
        ${kpiRowHtml(netCurrentMonth, prevNet, kpi)}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'card-trend', title: t('management.overview.participationByMonthTitle'), subtitle: t('management.overview.participationByMonthSubtitle'),
          span: 5, tabletFull: true, focusable: true, chartWrap: true, chartHeight: 240, bodyHtml: '<canvas id="net-participation-chart"></canvas>',
        })}
        ${dashCardHtml({
          id: 'card-provider-donut', title: t('management.overview.revenueByProviderTitle'), subtitle: t('management.overview.revenueByProviderSubtitle'),
          span: 3, focusable: true, chartWrap: true, chartHeight: 240,
          bodyHtml: providerDonut.rows.length ? '<canvas id="net-provider-donut"></canvas>' : `<p class="text-sm text-faint">${t('management.overview.noRevenueInScope')}</p>`,
        })}
        ${dashCardHtml({
          id: 'card-booking-status', title: t('management.overview.bookingStatusTitle'), subtitle: t('management.overview.bookingStatusSubtitle'),
          span: 2, chartWrap: true, chartHeight: 240, bodyHtml: '<canvas id="net-status-donut"></canvas>',
        })}
        ${dashCardHtml({
          id: 'card-alerts', title: t('management.overview.quickAlertsTitle'), subtitle: t('management.overview.quickAlertsSubtitle'),
          span: 2, bodyHtml: quickAlertsHtml(state, netCurrentMonth, capacityRows),
        })}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'card-map', title: t('management.overview.networkMapTitle'), subtitle: t('management.overview.networkMapSubtitle'),
          span: 4, tabletFull: true, bodyHtml: '<div class="mdash-map-wrap" id="admin-network-map"></div>',
        })}
        ${dashCardHtml({
          id: 'card-demand-capacity', title: t('management.overview.demandCapacityTitle'), subtitle: t('management.overview.demandCapacitySubtitle'),
          span: 5, bodyHtml: demandCapacityHtml(capacityRows),
        })}
        ${dashCardHtml({
          id: 'card-top-feedback', title: t('management.overview.topFeedbackTitle'), span: 3, focusable: true,
          bodyHtml: topFeedbackHtml(topFeedback),
        })}
      </div>

      <div class="mdash-grid">
        ${cumulativeKpiRowHtml(kpi)}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({ id: 'card-revenue-month', title: t('management.overview.revenueByMonthTitle'), span: 7, tabletFull: true, focusable: true, chartWrap: true, bodyHtml: '<canvas id="net-revenue-chart"></canvas>' })}
        ${dashCardHtml({
          id: 'card-revenue-type', title: t('management.overview.revenueByTypeTitle'), span: 5, chartWrap: true,
          bodyHtml: revenueByType.length ? '<canvas id="net-type-chart"></canvas>' : `<p class="text-sm text-faint">${t('management.overview.noRevenueInScope')}</p>`,
        })}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'card-rating-listing', title: t('management.overview.ratingByListingTitle'), span: 6, tabletFull: true, chartWrap: true, chartHeight: 260,
          bodyHtml: ratingByListing.length ? '<canvas id="net-rating-chart"></canvas>' : `<p class="text-sm text-faint">${t('management.overview.noReviewsInScope')}</p>`,
        })}
        ${dashCardHtml({ id: 'card-pending-proposals', title: t('management.overview.pendingProposalsTitle'), span: 6, tabletFull: true, bodyHtml: `<div style="overflow-x:auto;">${pendingProposalsHtml(state)}</div>` })}
      </div>
    </div>
  `;

  wireFilterBar(container, () => renderAdminOverview(container));

  qsa('[data-expand-feedback]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = btn.dataset.expandFeedback;
      const p = container.querySelector(`[data-comment="${i}"]`);
      p?.classList.toggle('feedback-card__comment--clamped');
      btn.textContent = p?.classList.contains('feedback-card__comment--clamped') ? t('management.overview.showMore') : t('management.overview.showLess');
    });
  });

  qsa('[data-capacity-row]', container).forEach((btn) => {
    btn.addEventListener('click', () => toggleListingFilter(btn.dataset.capacityRow, container));
  });
  qsa('[data-alert-action]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.alertAction === 'pending-bookings') toggleBookingStatusFilter('pending', container);
      else if (btn.dataset.alertAction === 'high-occupancy') {
        const first = capacityRows.find((r) => r.occupancyRate !== null && r.occupancyRate >= 0.8);
        if (first) toggleListingFilter(first.activityId, container);
      }
    });
  });

  // ---------- Bản đồ mạng lưới — click marker cập nhật listingId, không tự reset zoom giữa các lần lọc ----------
  renderNetworkMap({
    elId: 'admin-network-map',
    destinations: scopedDests,
    guestsByListingId,
    selectedListingId: adminFilters.listingId || null,
    onSelectListing: (id) => toggleListingFilter(id, container),
  });

  loadChartJs().then((Chart) => {
    createChart(Chart, qs('#net-revenue-chart', container), 'net-revenue-chart', {
      type: 'bar',
      data: { labels: monthlyRevenue.map((m) => m.label), datasets: [{ label: t('management.overview.revenueLabel'), data: monthlyRevenue.map((m) => m.revenue), backgroundColor: CHART_COLORS[0] }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) } } },
        scales: { y: { ticks: { callback: (v) => formatNumber(v) } } },
      },
    });

    const participationChart = createChart(Chart, qs('#net-participation-chart', container), 'net-participation-chart', {
      type: 'line',
      data: {
        labels: series.map((m) => m.label),
        datasets: [
          { label: t('management.overview.paidParticipation'), data: series.map((m) => m.participants), borderColor: CHART_COLORS[1], backgroundColor: `${CHART_COLORS[1]}33`, fill: true, tension: 0.3, pointRadius: series.map((_, i) => (i === selectedMonthIndex ? 6 : 3)) },
          { label: t('management.overview.freeVisits'), data: series.map((m) => m.visits), borderColor: CHART_COLORS[2], backgroundColor: `${CHART_COLORS[2]}33`, fill: true, tension: 0.3, pointRadius: series.map((_, i) => (i === selectedMonthIndex ? 6 : 3)) },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        onClick: (evt, elements) => {
          if (!elements.length) return;
          const idx = elements[0].index;
          selectedMonthIndex = selectedMonthIndex === idx ? null : idx;
          if (participationChart) {
            participationChart.data.datasets.forEach((ds) => { ds.pointRadius = series.map((_, i) => (i === selectedMonthIndex ? 6 : 3)); });
            participationChart.update();
          }
        },
      },
    });

    if (providerDonut.rows.length) {
      const baseColors = CHART_COLORS.slice(0, providerDonut.rows.length);
      const selectedIdx = adminFilters.providerId ? providerDonut.rows.findIndex((r) => r.providerId === adminFilters.providerId) : null;
      createChart(Chart, qs('#net-provider-donut', container), 'net-provider-donut', {
        type: 'doughnut',
        data: {
          labels: providerDonut.rows.map((r) => `${r.name} (${providerCategoryLabel(r.categoryLabel)})`),
          datasets: [{ data: providerDonut.rows.map((r) => r.revenue), backgroundColor: toneColors(baseColors, selectedIdx === -1 ? null : selectedIdx) }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatMoney(ctx.parsed)} (${(ctx.parsed / providerDonut.total * 100).toFixed(1)}%)` } },
          },
          onClick: (evt, elements) => {
            if (!elements.length) return;
            toggleProviderFilter(providerDonut.rows[elements[0].index].providerId, container);
          },
        },
      });
    }

    const statusBase = [CHART_COLORS[1], CHART_COLORS[0], CHART_COLORS[4], CHART_COLORS[6] || '#b3413a'];
    const statusSelectedIdx = adminFilters.bookingStatus ? BOOKING_STATUS_KEYS.indexOf(adminFilters.bookingStatus) : null;
    createChart(Chart, qs('#net-status-donut', container), 'net-status-donut', {
      type: 'doughnut',
      data: {
        labels: BOOKING_STATUS_KEYS.map((k) => t(`management.overview.${BOOKING_STATUS_LABEL_KEY[k]}`)),
        datasets: [{ data: BOOKING_STATUS_KEYS.map((k) => statusCounts[k]), backgroundColor: toneColors(statusBase, statusSelectedIdx === -1 ? null : statusSelectedIdx) }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, font: { size: 9 } } } },
        onClick: (evt, elements) => {
          if (!elements.length) return;
          toggleBookingStatusFilter(BOOKING_STATUS_KEYS[elements[0].index], container);
        },
      },
    });

    if (revenueByType.length) {
      createChart(Chart, qs('#net-type-chart', container), 'net-type-chart', {
        type: 'bar',
        data: { labels: revenueByType.map((r) => providerCategoryLabel(r.label)), datasets: [{ label: t('management.overview.revenueLabel'), data: revenueByType.map((r) => r.revenue), backgroundColor: CHART_COLORS[4] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => formatNumber(v) } } } },
      });
    }

    if (ratingByListing.length) {
      createChart(Chart, qs('#net-rating-chart', container), 'net-rating-chart', {
        type: 'bar',
        data: { labels: ratingByListing.map((r) => r.name), datasets: [{ label: t('management.overview.ratingLabel'), data: ratingByListing.map((r) => Number(r.averageRating.toFixed(2))), backgroundColor: CHART_COLORS[5] }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 5 } } },
      });
    }

    // ---------- Focus mode: vẽ lại đúng chart vào canvas mới trong modal lớn hơn ----------
    wireFocusButtons(container, {
      'card-trend': {
        title: t('management.overview.participationByMonthTitle'),
        renderInto: (body) => {
          body.innerHTML = '<div class="mdash-focus-modal__chart"><canvas id="focus-net-participation-chart"></canvas></div>';
          createChart(Chart, qs('#focus-net-participation-chart', body), 'focus-net-participation-chart', {
            type: 'line',
            data: { labels: series.map((m) => m.label), datasets: [
              { label: t('management.overview.paidParticipation'), data: series.map((m) => m.participants), borderColor: CHART_COLORS[1], backgroundColor: `${CHART_COLORS[1]}33`, fill: true, tension: 0.3 },
              { label: t('management.overview.freeVisits'), data: series.map((m) => m.visits), borderColor: CHART_COLORS[2], backgroundColor: `${CHART_COLORS[2]}33`, fill: true, tension: 0.3 },
            ] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
          });
        },
      },
      'card-provider-donut': {
        title: t('management.overview.revenueByProviderTitle'),
        renderInto: (body) => {
          if (!providerDonut.rows.length) { body.innerHTML = `<p class="text-sm text-faint">${t('management.overview.noRevenueInScope')}</p>`; return; }
          body.innerHTML = '<div class="mdash-focus-modal__chart"><canvas id="focus-net-provider-donut"></canvas></div>';
          createChart(Chart, qs('#focus-net-provider-donut', body), 'focus-net-provider-donut', {
            type: 'doughnut',
            data: { labels: providerDonut.rows.map((r) => `${r.name} (${providerCategoryLabel(r.categoryLabel)})`), datasets: [{ data: providerDonut.rows.map((r) => r.revenue), backgroundColor: CHART_COLORS.slice(0, providerDonut.rows.length) }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatMoney(ctx.parsed)}` } } } },
          });
        },
      },
      'card-revenue-month': {
        title: t('management.overview.revenueByMonthTitle'),
        renderInto: (body) => {
          body.innerHTML = '<div class="mdash-focus-modal__chart"><canvas id="focus-net-revenue-chart"></canvas></div>';
          createChart(Chart, qs('#focus-net-revenue-chart', body), 'focus-net-revenue-chart', {
            type: 'bar',
            data: { labels: monthlyRevenue.map((m) => m.label), datasets: [{ label: t('management.overview.revenueLabel'), data: monthlyRevenue.map((m) => m.revenue), backgroundColor: CHART_COLORS[0] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) } } }, scales: { y: { ticks: { callback: (v) => formatNumber(v) } } } },
          });
        },
      },
      'card-top-feedback': {
        title: t('management.overview.topFeedbackTitle'),
        renderInto: (body) => { body.innerHTML = topFeedbackHtml(topFeedback); },
      },
    });
  }).catch(() => {
    qs('#net-revenue-chart', container)?.insertAdjacentHTML('afterend', `<p class="text-sm text-faint">${t('management.overview.chartLoadError')}</p>`);
  });
}
