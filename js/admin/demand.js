// "Nhu cầu & Cơ hội" — Cổng dữ liệu quản lý (PHASE cập nhật gần nhất). Toàn bộ số liệu đọc qua
// js/services/managementService.js (selector trung tâm, không tự tính KPI ở đây) — trước phase này
// trang dùng state.bookingItems/state.experiences/state.viewCounts trực tiếp, một bộ dữ liệu KHÁC
// với Tổng quan/Lịch & Booking (chỉ phản ánh 3 listing có "trải nghiệm thật", bỏ sót 7/7 booking
// demo) — đã thay hoàn toàn bằng nguồn chung.
import { getState, setOpportunityActionStatus } from '../storage.js';
import { escapeHtml, formatMoney, qs, qsa } from '../utils.js';
import { adminFilters, filterBarHtml, wireFilterBar } from './filters.js';
import { getCurrentPeriod } from '../services/hostBookingService.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import {
  getCustomerDemandMetrics, getDemandFunnel, getInterestDistribution, getCapacityUtilisation,
  getRevenueMetrics, getDemandTrendSeries, getForecast, getOpportunityRecommendations, hasUnscopableFilters,
} from '../services/managementService.js';
import { MANAGEMENT_SIMULATED_NOTE, LOW_SAMPLE_NOTE, FORECAST_DISCLAIMER } from '../../data/pilot-seed-data.js';
import { t, registerTranslations, getCurrentLanguage, formatNumber } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';
import { dashCardHtml, kpiCardHtml, rowLabelHtml } from './dashboardShell.js';

registerTranslations('management', {
  demand: {
    title: 'Nhu cầu & Cơ hội',
    subtitle: 'Du khách đang quan tâm điều gì, nhu cầu tăng/giảm ra sao, năng lực hiện tại có đáp ứng được không, và Cổng quản lý nên hành động thế nào — tổng hợp trực tiếp từ Activity Catalog + booking records + review, không dùng bộ dữ liệu riêng.',
    dataTags: '🏷️ Historical demo data (6 tháng mô phỏng) · 🏷️ Current operational data (tính lại từ booking records tháng hiện tại) · 🏷️ Forecast (ngoại suy tuyến tính). {note}',
    paidFree: 'Paid / Free',
    all: 'Tất cả',
    paidExperience: 'Paid experience',
    freeVisit: 'Free visit',
    groupTypeBooking: 'Group type (booking)',
    family: 'Gia đình',
    friends: 'Nhóm bạn',
    solo: 'Đi một mình',
    schoolCorp: 'Trường học / doanh nghiệp',
    bookingStatus: 'Booking status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    tripDuration: 'Trip duration',
    short24h: '2–4 giờ',
    halfDay: 'Nửa ngày',
    fullDay: 'Cả ngày',
    budgetRange: 'Budget range',
    under300: 'Dưới 300.000₫',
    range300to600: '300.000–600.000₫',
    over600: 'Trên 600.000₫',
    tripBudgetNote: '"Trip duration"/"Budget range" chưa có trường tương ứng trên booking record (chỉ tồn tại dưới dạng % cố định toàn mạng lưới) — chọn 2 bộ lọc này sẽ hiện ghi chú mẫu nhỏ thay vì số liệu bị cắt sai.',
    demandMonth: 'Nhu cầu tháng {month}',
    destinationViews: 'Lượt xem địa điểm',
    vsLastMonth: '{value} so với tháng trước',
    activeBookings: 'Active bookings',
    totalGuests: 'Tổng khách',
    totalGrossValue: 'Tổng giá trị booking',
    partialMatchRate: 'Partial-match rate',
    bookingConversion: 'Booking conversion (từ hành trình submit)',
    scopedNote: 'Đang lọc theo đơn vị/hoạt động: active booking/khách/giá trị đã áp dụng đúng bộ lọc, nhưng % tăng trưởng bị ẩn (tháng trước không có dữ liệu tách theo từng đơn vị để so sánh công bằng) — lượt xem vẫn hiển thị theo quy mô toàn mạng lưới.',
    funnelTitle: 'Customer Demand Funnel',
    funnelNote: 'Đơn vị mỗi bước khác nhau (lượt xem/yêu cầu/hành trình/đoàn booking/review) — không cộng gộp trực tiếp giữa các bước.',
    viewsToCart: 'Lượt xem → Thêm giỏ',
    customToItinerary: 'Cá nhân hóa → Hành trình submit',
    itineraryToBooking: 'Hành trình submit → Booking',
    bookingToCompleted: 'Booking → Hoàn thành',
    completedToReview: 'Hoàn thành → Review',
    digitalDemandTitle: 'Digital demand theo tháng',
    digitalDemandNote: 'Bấm vào tên trong chú thích để bật/tắt từng đường.',
    convertedDemandTitle: 'Converted demand theo tháng',
    revenueByMonthTitle: 'Doanh thu ghi nhận theo tháng',
    revenueByMonthNote: 'Điểm miễn phí (Cụm Nguyệt Hóa, Chùa Âng, Chùa Lò Gạch) không đưa vào biểu đồ này.',
    interestTrendTitle: 'Xu hướng sở thích (Interest trend)',
    preferencesTitle: 'Sở thích khách hiện tại',
    tripDurationLabel: 'Thời lượng chuyến đi',
    budgetLabel: 'Ngân sách',
    groupTypeLabel: 'Loại nhóm',
    preferredTimeLabel: 'Khung giờ ưa thích',
    weekendUplift: 'Nhu cầu cuối tuần cao hơn ngày thường khoảng {pct}%.',
    interestInsight: 'Hands-on craft tăng từ 18% lên {craft}%. Local food tăng từ 18% lên {food}%. Tổng nhu cầu dành cho craft và food đạt {total}%. Heritage vẫn là nhóm quan tâm lớn nhất với {heritage}%.',
    interestInsightNote: '🔎 Insight từ dữ liệu mô phỏng: du khách đang chuyển dần từ chỉ tham quan sang trải nghiệm có tương tác — không phải kết luận nghiên cứu chính thức.',
    capacityGapTitle: 'Demand–Capacity Gap',
    capacityGapNote: 'occupancyRate = bookedSeats / availableSeatCapacity (ước lượng: sức chứa mỗi lượt × số khung giờ/ngày × số ngày mở cửa trong tháng). Điểm miễn phí không có khái niệm sức chứa cố định.',
    unlimitedFree: 'Không giới hạn (miễn phí)',
    nearFull: '{pct}% — gần đầy',
    moderate: '{pct}% — trung bình',
    plentyRoom: '{pct}% — còn nhiều chỗ',
    demandGuests: 'Demand (khách)',
    estimatedCapacity: 'Capacity ước lượng',
    unlimited: 'Không giới hạn',
    pendingLabel: 'Pending',
    opportunityLabel: 'Cơ hội',
    forecastTitle: 'Dự báo 3 tháng tiếp theo',
    forecastMetric: {
      destinationViews: 'Lượt xem địa điểm',
      customisationRequests: 'Yêu cầu cá nhân hóa',
      activeBookings: 'Active bookings',
      guests: 'Tổng khách',
      grossValue: 'Tổng giá trị booking',
    },
    statusLabel: { new: 'Chưa xử lý', planned: 'Đã lên kế hoạch', assigned: 'Đã giao', in_progress: 'Đang xử lý', done: 'Hoàn thành' },
    statusPrefix: 'Trạng thái:',
    assignedTo: ' · Giao cho: {name}',
    responsibleParty: 'Phụ trách',
    timeframe: 'Thời hạn',
    expected: 'Kỳ vọng',
    evidenceCount: 'Bằng chứng: {count} mục đề cập',
    recommendedAction: 'Hành động đề xuất:',
    createActionPlan: 'Tạo kế hoạch hành động',
    assignToProvider: 'Giao cho đơn vị',
    markInProgress: 'Đánh dấu đang xử lý',
    markDone: 'Đánh dấu hoàn thành',
    opportunitiesTitle: 'Cơ hội ({count})',
    opportunitiesNote: 'Tự động bật/tắt theo dữ liệu hiện tại (pending rate, partial-match rate, occupancy, điểm đánh giá...) — không phải danh sách cố định.',
    assignPrompt: 'Giao gợi ý này cho đơn vị/người phụ trách nào?',
    unnamed: 'Chưa nêu tên',
    chartLoadError: 'Không tải được thư viện biểu đồ (mạng chặn CDN) — xem số liệu ở các thẻ/bảng bên trên.',
    grossValueLabel: 'Tổng giá trị booking (đ)',
    totalValueTooltip: 'Tổng giá trị: {amount}',
    communityIncomeTooltip: 'Thu nhập community providers: {amount}',
    platformFeeTooltip: 'Platform fee: {amount}',
    museumTicketTooltip: 'Museum ticket revenue: {amount}',
    currentMonthOnlyNote: '(Chi tiết theo nguồn chỉ có cho tháng hiện tại)',
    viewsLabel: 'Lượt xem',
    cartAddsLabel: 'Lượt thêm giỏ',
    customisationRequestsLabel: 'Yêu cầu cá nhân hóa',
    guestsLabel: 'Khách',
    actual: 'Actual',
    forecastRange: 'Forecast (khoảng ước lượng)',
    forecastBelow: 'Forecast (dưới)',
    forecast: 'Forecast',
  },
}, {
  demand: {
    title: 'Demand & Opportunities',
    subtitle: "What travellers care about, how demand is trending, whether current capacity meets it, and what the Management Portal should do — aggregated directly from the Activity Catalog + booking records + reviews, no separate dataset.",
    dataTags: '🏷️ Historical demo data (6 simulated months) · 🏷️ Current operational data (recalculated from this month\'s booking records) · 🏷️ Forecast (linear extrapolation). {note}',
    paidFree: 'Paid / Free',
    all: 'All',
    paidExperience: 'Paid experience',
    freeVisit: 'Free visit',
    groupTypeBooking: 'Group type (booking)',
    family: 'Family',
    friends: 'Friends',
    solo: 'Solo',
    schoolCorp: 'School / corporate',
    bookingStatus: 'Booking status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    tripDuration: 'Trip duration',
    short24h: '2–4 hours',
    halfDay: 'Half day',
    fullDay: 'Full day',
    budgetRange: 'Budget range',
    under300: 'Under VND 300,000',
    range300to600: 'VND 300,000–600,000',
    over600: 'Over VND 600,000',
    tripBudgetNote: '"Trip duration"/"Budget range" have no corresponding field on the booking record yet (they only exist as fixed network-wide percentages) — selecting these two filters shows a small sample note instead of incorrectly-sliced figures.',
    demandMonth: 'Demand for {month}',
    destinationViews: 'Place views',
    vsLastMonth: '{value} vs. last month',
    activeBookings: 'Active bookings',
    totalGuests: 'Total guests',
    totalGrossValue: 'Total booking value',
    partialMatchRate: 'Partial-match rate',
    bookingConversion: 'Booking conversion (from submitted trips)',
    scopedNote: 'Filtered by provider/activity: active bookings/guests/value reflect the filter, but growth % is hidden (last month has no per-provider breakdown for a fair comparison) — views still reflect the whole network.',
    funnelTitle: 'Customer Demand Funnel',
    funnelNote: 'Each step uses a different unit (views/requests/trips/booking groups/reviews) — not directly additive between steps.',
    viewsToCart: 'Views → Added to cart',
    customToItinerary: 'Customisation → Submitted trip',
    itineraryToBooking: 'Submitted trip → Booking',
    bookingToCompleted: 'Booking → Completed',
    completedToReview: 'Completed → Review',
    digitalDemandTitle: 'Digital demand by month',
    digitalDemandNote: 'Click a name in the legend to toggle that line.',
    convertedDemandTitle: 'Converted demand by month',
    revenueByMonthTitle: 'Recorded revenue by month',
    revenueByMonthNote: 'Free sites (Nguyệt Hóa Cluster, Ang Pagoda, Lo Gach Pagoda) are not included in this chart.',
    interestTrendTitle: 'Interest trend',
    preferencesTitle: 'Current guest preferences',
    tripDurationLabel: 'Trip duration',
    budgetLabel: 'Budget',
    groupTypeLabel: 'Group type',
    preferredTimeLabel: 'Preferred time slot',
    weekendUplift: 'Weekend demand is about {pct}% higher than weekdays.',
    interestInsight: 'Hands-on craft rose from 18% to {craft}%. Local food rose from 18% to {food}%. Combined craft and food demand reached {total}%. Heritage remains the largest interest group at {heritage}%.',
    interestInsightNote: '🔎 Insight from simulated data: travellers are gradually shifting from sightseeing-only to interactive experiences — not an official research conclusion.',
    capacityGapTitle: 'Demand–Capacity Gap',
    capacityGapNote: 'occupancyRate = bookedSeats / availableSeatCapacity (estimated: capacity per slot × slots/day × open days in the month). Free sites have no fixed capacity concept.',
    unlimitedFree: 'Unlimited (free)',
    nearFull: '{pct}% — nearly full',
    moderate: '{pct}% — moderate',
    plentyRoom: '{pct}% — plenty of room',
    demandGuests: 'Demand (guests)',
    estimatedCapacity: 'Estimated capacity',
    unlimited: 'Unlimited',
    pendingLabel: 'Pending',
    opportunityLabel: 'Opportunity',
    forecastTitle: 'Next 3-month forecast',
    forecastMetric: {
      destinationViews: 'Place views',
      customisationRequests: 'Customisation requests',
      activeBookings: 'Active bookings',
      guests: 'Total guests',
      grossValue: 'Total booking value',
    },
    statusLabel: { new: 'Not Started', planned: 'Planned', assigned: 'Assigned', in_progress: 'In Progress', done: 'Done' },
    statusPrefix: 'Status:',
    assignedTo: ' · Assigned to: {name}',
    responsibleParty: 'Responsible',
    timeframe: 'Timeframe',
    expected: 'Expected',
    evidenceCount: 'Evidence: {count} items mentioned',
    recommendedAction: 'Recommended action:',
    createActionPlan: 'Create action plan',
    assignToProvider: 'Assign to provider',
    markInProgress: 'Mark in progress',
    markDone: 'Mark done',
    opportunitiesTitle: 'Opportunities ({count})',
    opportunitiesNote: 'Automatically toggled based on current data (pending rate, partial-match rate, occupancy, ratings...) — not a fixed list.',
    assignPrompt: 'Assign this suggestion to which provider/person?',
    unnamed: 'Unnamed',
    chartLoadError: 'Could not load the chart library (network blocked the CDN) — see the figures in the cards/tables above.',
    grossValueLabel: 'Total booking value (VND)',
    totalValueTooltip: 'Total value: {amount}',
    communityIncomeTooltip: 'Community providers income: {amount}',
    platformFeeTooltip: 'Platform fee: {amount}',
    museumTicketTooltip: 'Museum ticket revenue: {amount}',
    currentMonthOnlyNote: '(Source breakdown available for the current month only)',
    viewsLabel: 'Views',
    cartAddsLabel: 'Cart adds',
    customisationRequestsLabel: 'Customisation requests',
    guestsLabel: 'Guests',
    actual: 'Actual',
    forecastRange: 'Forecast (estimated range)',
    forecastBelow: 'Forecast (lower)',
    forecast: 'Forecast',
  },
});

// ---------- Bộ lọc bổ sung riêng cho trang này (không có trường tương đương trong adminFilters
// dùng chung — theo đúng tiền lệ filter riêng của proposals.js) — module-level, không lưu localStorage. ----------
const demandLocalFilters = { paidOrFree: '', groupType: '', tripDuration: '', budgetRange: '', bookingStatus: '' };
let forecastMetric = 'grossValue';

function buildFilters() {
  return {
    providerId: adminFilters.providerId,
    activityId: adminFilters.listingId,
    category: adminFilters.group,
    paidOrFree: demandLocalFilters.paidOrFree,
    groupType: demandLocalFilters.groupType,
    tripDuration: demandLocalFilters.tripDuration,
    budgetRange: demandLocalFilters.budgetRange,
    bookingStatus: demandLocalFilters.bookingStatus,
  };
}

function pctLabel(v, { signed = false } = {}) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const sign = signed && v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

function monthLabelOf(monthKey) {
  const [y, m] = monthKey.split('-');
  return getCurrentLanguage() === 'vi' ? `T${Number(m)}/${y}` : `${Number(m)}/${y}`;
}

// ---------- Bộ lọc bổ sung (paidOrFree/groupType/tripDuration/budgetRange/bookingStatus) ----------
function localFilterBarHtml() {
  return `
    <div class="mdash-filterbar">
      <div class="mdash-filterbar__row">
        <div class="mdash-filterbar__field">
          <label for="df-paid">${t('management.demand.paidFree')}</label>
          <select id="df-paid">
            <option value="">${t('management.demand.all')}</option>
            <option value="paid" ${demandLocalFilters.paidOrFree === 'paid' ? 'selected' : ''}>${t('management.demand.paidExperience')}</option>
            <option value="free" ${demandLocalFilters.paidOrFree === 'free' ? 'selected' : ''}>${t('management.demand.freeVisit')}</option>
          </select>
        </div>
        <div class="mdash-filterbar__field">
          <label for="df-group">${t('management.demand.groupTypeBooking')}</label>
          <select id="df-group">
            <option value="">${t('management.demand.all')}</option>
            <option value="family" ${demandLocalFilters.groupType === 'family' ? 'selected' : ''}>${t('management.demand.family')}</option>
            <option value="friends" ${demandLocalFilters.groupType === 'friends' ? 'selected' : ''}>${t('management.demand.friends')}</option>
            <option value="solo" ${demandLocalFilters.groupType === 'solo' ? 'selected' : ''}>${t('management.demand.solo')}</option>
            <option value="school_or_corporate" ${demandLocalFilters.groupType === 'school_or_corporate' ? 'selected' : ''}>${t('management.demand.schoolCorp')}</option>
          </select>
        </div>
        <div class="mdash-filterbar__field">
          <label for="df-status">${t('management.demand.bookingStatus')}</label>
          <select id="df-status">
            <option value="">${t('management.demand.all')}</option>
            <option value="pending" ${demandLocalFilters.bookingStatus === 'pending' ? 'selected' : ''}>${t('management.demand.pending')}</option>
            <option value="confirmed" ${demandLocalFilters.bookingStatus === 'confirmed' ? 'selected' : ''}>${t('management.demand.confirmed')}</option>
            <option value="completed" ${demandLocalFilters.bookingStatus === 'completed' ? 'selected' : ''}>${t('management.demand.completed')}</option>
          </select>
        </div>
        <div class="mdash-filterbar__field">
          <label for="df-duration">${t('management.demand.tripDuration')}</label>
          <select id="df-duration">
            <option value="">${t('management.demand.all')}</option>
            <option value="short" ${demandLocalFilters.tripDuration === 'short' ? 'selected' : ''}>${t('management.demand.short24h')}</option>
            <option value="half" ${demandLocalFilters.tripDuration === 'half' ? 'selected' : ''}>${t('management.demand.halfDay')}</option>
            <option value="full" ${demandLocalFilters.tripDuration === 'full' ? 'selected' : ''}>${t('management.demand.fullDay')}</option>
          </select>
        </div>
        <div class="mdash-filterbar__field">
          <label for="df-budget">${t('management.demand.budgetRange')}</label>
          <select id="df-budget">
            <option value="">${t('management.demand.all')}</option>
            <option value="under300" ${demandLocalFilters.budgetRange === 'under300' ? 'selected' : ''}>${t('management.demand.under300')}</option>
            <option value="300to600" ${demandLocalFilters.budgetRange === '300to600' ? 'selected' : ''}>${t('management.demand.range300to600')}</option>
            <option value="over600" ${demandLocalFilters.budgetRange === 'over600' ? 'selected' : ''}>${t('management.demand.over600')}</option>
          </select>
        </div>
      </div>
      <p class="text-sm text-faint" style="margin:0;">${t('management.demand.tripBudgetNote')}</p>
    </div>
  `;
}

function wireLocalFilterBar(container, onChange) {
  const bind = (id, key) => {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('change', () => { demandLocalFilters[key] = el.value; onChange(); });
  };
  bind('df-paid', 'paidOrFree');
  bind('df-group', 'groupType');
  bind('df-status', 'bookingStatus');
  bind('df-duration', 'tripDuration');
  bind('df-budget', 'budgetRange');
}

// ---------- 6.1 KPI cards ----------
function kpiCardsHtml(demand) {
  function delta(pct) { return pct === null || pct === undefined || Number.isNaN(pct) ? undefined : pct; }
  return `
    ${rowLabelHtml(t('management.demand.demandMonth', { month: monthLabelOf(demand.monthKey) }))}
    ${kpiCardHtml({ id: 'demand-kpi-views', label: t('management.demand.destinationViews'), value: formatNumber(demand.destinationViews), deltaPct: delta(demand.destinationViewsGrowthPct), span: 2 })}
    ${kpiCardHtml({ id: 'demand-kpi-active', label: t('management.demand.activeBookings'), value: formatNumber(demand.activeBookings), deltaPct: delta(demand.activeBookingsGrowthPct), span: 2 })}
    ${kpiCardHtml({ id: 'demand-kpi-guests', label: t('management.demand.totalGuests'), value: formatNumber(demand.guests), deltaPct: delta(demand.guestsGrowthPct), span: 2 })}
    ${kpiCardHtml({ id: 'demand-kpi-gross', label: t('management.demand.totalGrossValue'), value: formatMoney(demand.grossValue), deltaPct: delta(demand.grossValueGrowthPct), span: 2 })}
    ${kpiCardHtml({ id: 'demand-kpi-partial', label: t('management.demand.partialMatchRate'), value: pctLabel(demand.partialMatchRate), span: 2 })}
    ${kpiCardHtml({ id: 'demand-kpi-conversion', label: t('management.demand.bookingConversion'), value: pctLabel(demand.bookingConversionFromItineraryPct), span: 2 })}
    ${demand.scopedToProviderOrActivity ? `<p class="text-sm text-faint mdash-col-12" style="margin:0;">${t('management.demand.scopedNote')}</p>` : ''}
  `;
}

// ---------- Phase 5: demand funnel ----------
function funnelHtml(funnel) {
  const max = funnel.steps[0].value || 1;
  const rows = funnel.steps.map((s, i) => {
    const widthPct = Math.max(4, Math.round((s.value / max) * 100));
    return `
      <div style="margin-bottom:8px;">
        <div class="flex justify-between items-center" style="font-size:0.85rem;">
          <span>${escapeHtml(s.label)}</span>
          <span><strong>${formatNumber(s.value)}</strong> ${escapeHtml(s.unit)}</span>
        </div>
        <div style="background:var(--color-border);border-radius:6px;height:14px;overflow:hidden;margin-top:3px;">
          <div style="width:${widthPct}%;background:${CHART_COLORS[i % CHART_COLORS.length]};height:100%;"></div>
        </div>
      </div>
    `;
  }).join('');
  const c = funnel.conversions;
  const body = `
    ${rows}
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-top:10px;">
      <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.viewsToCart')}</span><span class="quick-fact__value">${pctLabel(c.cartAddRate * 100)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.customToItinerary')}</span><span class="quick-fact__value">${pctLabel(c.customisationCompletionRate * 100)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.itineraryToBooking')}</span><span class="quick-fact__value">${pctLabel(c.bookingConversionRate * 100)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.bookingToCompleted')}</span><span class="quick-fact__value">${pctLabel(c.completedRate * 100)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.completedToReview')}</span><span class="quick-fact__value">${pctLabel(c.reviewRate * 100)}</span></div>
    </div>
  `;
  return dashCardHtml({ id: 'demand-funnel', title: t('management.demand.funnelTitle'), subtitle: t('management.demand.funnelNote'), span: 12, bodyHtml: body });
}

// ---------- Phase 6.5: current preferences (bar ngang, không dùng pie) ----------
function preferenceGroupHtml(title, items) {
  return `
    <div>
      <p class="text-sm" style="font-weight:600;margin:0 0 6px;">${escapeHtml(title)}</p>
      ${items.map((it, i) => `
        <div style="margin-bottom:6px;">
          <div class="flex justify-between" style="font-size:0.82rem;"><span>${escapeHtml(it.label)}</span><span>${it.pct}%</span></div>
          <div style="background:var(--color-border);border-radius:6px;height:10px;overflow:hidden;margin-top:2px;">
            <div style="width:${it.pct}%;background:${CHART_COLORS[i % CHART_COLORS.length]};height:100%;"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function preferencesHtml(pref) {
  const body = `
    <div class="flex gap-4 wrap">
      ${preferenceGroupHtml(t('management.demand.tripDurationLabel'), pref.tripDuration)}
      ${preferenceGroupHtml(t('management.demand.budgetLabel'), pref.budget)}
      ${preferenceGroupHtml(t('management.demand.groupTypeLabel'), pref.groupType)}
      ${preferenceGroupHtml(t('management.demand.preferredTimeLabel'), pref.preferredTime)}
    </div>
    <p class="text-sm text-muted" style="margin-top:10px;">${t('management.demand.weekendUplift', { pct: `<strong>${pref.weekendUpliftPct}</strong>` })}</p>
  `;
  return dashCardHtml({ id: 'demand-preferences', title: t('management.demand.preferencesTitle'), span: 12, bodyHtml: body });
}

// ---------- Phase 6.4: interest insight ----------
function interestInsightHtml(interest) {
  const cur = interest.currentMonth;
  return `
    <p class="text-sm" style="margin-top:8px;">
      ${t('management.demand.interestInsight', { craft: cur.handsOnCraft, food: cur.localFood, total: cur.handsOnCraft + cur.localFood, heritage: cur.heritage })}
    </p>
    <p class="text-sm text-faint" style="margin:4px 0 0;">${t('management.demand.interestInsightNote')}</p>
  `;
}

// ---------- Phase 7: demand–capacity gap (dạng card, tự chuyển responsive trên mọi kích thước) ----------
function occupancyTone(rate) {
  if (rate === null) return { label: t('management.demand.unlimitedFree'), cls: 'badge-type' };
  if (rate >= 0.80) return { label: t('management.demand.nearFull', { pct: (rate * 100).toFixed(1) }), cls: 'badge-recognized' };
  if (rate >= 0.50) return { label: t('management.demand.moderate', { pct: (rate * 100).toFixed(1) }), cls: 'badge-demo' };
  return { label: t('management.demand.plentyRoom', { pct: (rate * 100).toFixed(1) }), cls: 'badge-free' };
}

function capacityCardsHtml(rows) {
  const body = `
    <div class="flex-col gap-3">
      ${rows.map((r) => {
        const tone = occupancyTone(r.occupancyRate);
        const isSelected = adminFilters.listingId === r.activityId;
        return `
          <button type="button" class="activity-card mdash-list-item${isSelected ? ' is-selected' : ''}" data-capacity-activity="${escapeHtml(r.activityId)}" style="width:100%;text-align:left;cursor:pointer;">
            <div class="activity-card__head">
              <strong>${escapeHtml(r.name)}</strong>
              <span class="badge ${tone.cls}">${escapeHtml(tone.label)}</span>
            </div>
            <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin-top:6px;">
              <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.demandGuests')}</span><span class="quick-fact__value">${r.demandGuests}</span></div>
              <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.estimatedCapacity')}</span><span class="quick-fact__value">${r.availableSeatCapacity ? formatNumber(r.availableSeatCapacity) : t('management.demand.unlimited')}</span></div>
              <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.pendingLabel')}</span><span class="quick-fact__value">${r.pendingCount}</span></div>
              <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.opportunityLabel')}</span><span class="quick-fact__value">${escapeHtml(r.opportunity)}</span></div>
            </div>
          </button>
        `;
      }).join('')}
    </div>
  `;
  return dashCardHtml({ id: 'demand-capacity', title: t('management.demand.capacityGapTitle'), subtitle: t('management.demand.capacityGapNote'), span: 7, tabletFull: true, bodyHtml: body });
}

// ---------- Phase 8: forecast ----------
function getForecastMetricOptions() {
  return [
    { key: 'destinationViews', label: t('management.demand.forecastMetric.destinationViews') },
    { key: 'customisationRequests', label: t('management.demand.forecastMetric.customisationRequests') },
    { key: 'activeBookings', label: t('management.demand.forecastMetric.activeBookings') },
    { key: 'guests', label: t('management.demand.forecastMetric.guests') },
    { key: 'grossValue', label: t('management.demand.forecastMetric.grossValue') },
  ];
}

function forecastSectionHtml() {
  const body = `
    <select class="field-select" id="df-forecast-metric" style="max-width:220px;margin-bottom:8px;">
      ${getForecastMetricOptions().map((m) => `<option value="${m.key}" ${forecastMetric === m.key ? 'selected' : ''}>${escapeHtml(m.label)}</option>`).join('')}
    </select>
    <div class="mdash-card__chart-wrap" style="height:240px;"><canvas id="df-forecast-chart"></canvas></div>
    <p class="text-sm text-faint" style="margin-top:8px;">${escapeHtml(FORECAST_DISCLAIMER)}</p>
  `;
  return dashCardHtml({ id: 'demand-forecast', title: t('management.demand.forecastTitle'), span: 5, tabletFull: true, chartWrap: false, bodyHtml: body });
}

// ---------- Phase 9/10: opportunity recommendations ----------
const STATUS_CLS = { new: 'badge-demo', planned: 'badge-type', assigned: 'badge-type', in_progress: 'badge-recognized', done: 'badge-free' };
const PRIORITY_CLS = { High: 'badge-recognized', 'Medium–High': 'badge-type', Medium: 'badge-demo' };

function opportunityCardHtml(rec) {
  const actionList = Array.isArray(rec.recommendedAction) ? rec.recommendedAction : [rec.recommendedAction];
  const statusLabel = t(`management.demand.statusLabel.${rec.status}`) || rec.status;
  return `
    <div class="opportunity-card" data-opp-card="${rec.id}">
      <div class="opportunity-card__head">
        <strong class="opportunity-card__title">${escapeHtml(rec.title)}</strong>
        <span class="badge opportunity-card__priority ${PRIORITY_CLS[rec.priority] || 'badge-type'}">${escapeHtml(rec.priority)}</span>
      </div>
      <p class="opportunity-card__row text-sm text-muted">${escapeHtml(rec.opportunity)}</p>
      <p class="opportunity-card__row text-sm"><strong>${t('management.demand.statusPrefix')}</strong> <span class="badge ${STATUS_CLS[rec.status] || 'badge-demo'}">${escapeHtml(statusLabel)}</span>${rec.assignedTo ? t('management.demand.assignedTo', { name: escapeHtml(rec.assignedTo) }) : ''}</p>
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin:2px 0 0;">
        <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.responsibleParty')}</span><span class="quick-fact__value" style="font-size:0.82rem;">${escapeHtml(rec.responsibleParty)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.timeframe')}</span><span class="quick-fact__value" style="font-size:0.82rem;">${escapeHtml(rec.timeframe)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('management.demand.expected')}</span><span class="quick-fact__value" style="font-size:0.82rem;">${escapeHtml(rec.expectedImpact)}</span></div>
      </div>
      <details style="margin-top:6px;">
        <summary class="text-sm" style="cursor:pointer;">${t('management.demand.evidenceCount', { count: rec.evidence.length })}</summary>
        <ul style="padding-left:18px;margin:6px 0 0;">${rec.evidence.map((e) => `<li class="text-sm">${escapeHtml(e)}</li>`).join('')}</ul>
        <p class="text-sm text-muted" style="margin-top:6px;"><strong>${t('management.demand.recommendedAction')}</strong></p>
        <ul style="padding-left:18px;margin:2px 0 0;">${actionList.map((a) => `<li class="text-sm">${escapeHtml(a)}</li>`).join('')}</ul>
        ${rec.internalNote ? `<p class="text-sm text-faint" style="margin-top:6px;">${escapeHtml(rec.internalNote)}</p>` : ''}
      </details>
      <div class="opportunity-card__actions" style="margin-top:8px;">
        <button type="button" class="btn btn-secondary btn-sm" data-opp-action="planned" data-opp-id="${rec.id}">${t('management.demand.createActionPlan')}</button>
        <button type="button" class="btn btn-secondary btn-sm" data-opp-assign="${rec.id}">${t('management.demand.assignToProvider')}</button>
        <button type="button" class="btn btn-secondary btn-sm" data-opp-action="in_progress" data-opp-id="${rec.id}">${t('management.demand.markInProgress')}</button>
        <button type="button" class="btn btn-primary btn-sm" data-opp-action="done" data-opp-id="${rec.id}">${t('management.demand.markDone')}</button>
      </div>
    </div>
  `;
}

function opportunitiesHtml(recs) {
  const body = `<div class="flex-col gap-3">${recs.map(opportunityCardHtml).join('')}</div>`;
  return dashCardHtml({ id: 'demand-opportunities', title: t('management.demand.opportunitiesTitle', { count: recs.length }), subtitle: t('management.demand.opportunitiesNote'), span: 12, bodyHtml: body });
}

export function renderAdminDemand(container) {
  const state = getState();
  const period = getCurrentPeriod();
  const filters = buildFilters();

  const demand = getCustomerDemandMetrics(state, period, filters);
  const funnel = getDemandFunnel(state, period, filters);
  const interest = getInterestDistribution(state, period, filters);
  const capacityRows = getCapacityUtilisation(state, period, filters);
  const revenue = getRevenueMetrics(state, period, filters);
  const recs = getOpportunityRecommendations(state, period, filters);
  const monthsWindow = Math.min(adminFilters.months || 6, 6);
  const trendSlice = (arr) => arr.slice(-monthsWindow);

  container.innerHTML = `
    <div class="mdash">
      <div class="mdash-header">
        <div>
          <h1>${t('management.demand.title')}</h1>
          <p class="text-sm text-muted" style="margin:0;">${t('management.demand.subtitle')}</p>
        </div>
      </div>
      <p class="text-sm text-faint" style="margin:0;">${t('management.demand.dataTags', { note: escapeHtml(MANAGEMENT_SIMULATED_NOTE) })}</p>

      ${filterBarHtml(state)}
      ${localFilterBarHtml()}
      ${hasUnscopableFilters(filters) ? `<div class="demo-note">${escapeHtml(LOW_SAMPLE_NOTE)}</div>` : ''}

      <div class="mdash-grid">
        ${kpiCardsHtml(demand)}
      </div>

      <div class="mdash-grid">
        ${funnelHtml(funnel)}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'demand-digital-chart', title: t('management.demand.digitalDemandTitle'), subtitle: t('management.demand.digitalDemandNote'),
          span: 6, tabletFull: true, chartWrap: true, chartHeight: 240, bodyHtml: '<canvas id="df-digital-chart"></canvas>',
        })}
        ${dashCardHtml({
          id: 'demand-converted-chart', title: t('management.demand.convertedDemandTitle'),
          span: 6, tabletFull: true, chartWrap: true, chartHeight: 240, bodyHtml: '<canvas id="df-converted-chart"></canvas>',
        })}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'demand-revenue-chart', title: t('management.demand.revenueByMonthTitle'), subtitle: t('management.demand.revenueByMonthNote'),
          span: 7, tabletFull: true, chartWrap: true, chartHeight: 240, bodyHtml: '<canvas id="df-revenue-chart"></canvas>',
        })}
        ${dashCardHtml({
          id: 'demand-interest-chart', title: t('management.demand.interestTrendTitle'),
          span: 5, tabletFull: true, bodyHtml: `<div class="mdash-card__chart-wrap" style="height:240px;"><canvas id="df-interest-chart"></canvas></div>${interestInsightHtml(interest)}`,
        })}
      </div>

      <div class="mdash-grid">
        ${preferencesHtml(interest.preferences)}
      </div>

      <div class="mdash-grid">
        ${capacityCardsHtml(capacityRows)}
        ${forecastSectionHtml()}
      </div>

      <div class="mdash-grid">
        ${opportunitiesHtml(recs)}
      </div>
    </div>
  `;

  wireFilterBar(container, () => renderAdminDemand(container));
  wireLocalFilterBar(container, () => renderAdminDemand(container));

  qsa('[data-capacity-activity]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      adminFilters.listingId = adminFilters.listingId === btn.dataset.capacityActivity ? '' : btn.dataset.capacityActivity;
      renderAdminDemand(container);
    });
  });

  qs('#df-forecast-metric', container).addEventListener('change', (e) => {
    forecastMetric = e.target.value;
    renderAdminDemand(container);
  });

  qsa('[data-opp-action]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      setOpportunityActionStatus(btn.dataset.oppId, btn.dataset.oppAction);
      renderAdminDemand(container);
    });
  });
  qsa('[data-opp-assign]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = window.prompt(t('management.demand.assignPrompt'), '');
      if (name === null) return;
      setOpportunityActionStatus(btn.dataset.oppAssign, 'assigned', { assignedTo: name.trim() || t('management.demand.unnamed') });
      renderAdminDemand(container);
    });
  });

  const trendRows = trendSlice(getDemandTrendSeries(state, period, filters));

  loadChartJs().then((Chart) => {
    const monthLabel = monthLabelOf;

    createChart(Chart, qs('#df-digital-chart', container), 'df-digital-chart', {
      type: 'line',
      data: {
        labels: trendRows.map((r) => monthLabel(r.month)),
        datasets: buildDigitalDatasets(trendRows),
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, interaction: { mode: 'index', intersect: false } },
    });

    createChart(Chart, qs('#df-converted-chart', container), 'df-converted-chart', {
      type: 'line',
      data: {
        labels: trendRows.map((r) => monthLabel(r.month)),
        datasets: buildConvertedDatasets(trendRows),
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, interaction: { mode: 'index', intersect: false } },
    });

    createChart(Chart, qs('#df-revenue-chart', container), 'df-revenue-chart', {
      type: 'bar',
      data: {
        labels: trendSlice(revenue.monthlySeries).map((m) => monthLabel(m.month)),
        datasets: [{ label: t('management.demand.grossValueLabel'), data: trendSlice(revenue.monthlySeries).map((m) => m.grossValue), backgroundColor: CHART_COLORS[0] }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const isCurrent = ctx.label === monthLabel(revenue.monthKey);
                const lines = [t('management.demand.totalValueTooltip', { amount: formatMoney(ctx.parsed.y) })];
                if (isCurrent) {
                  lines.push(t('management.demand.communityIncomeTooltip', { amount: formatMoney(revenue.currentMonth.communityIncome) }));
                  lines.push(t('management.demand.platformFeeTooltip', { amount: formatMoney(revenue.currentMonth.communityFee) }));
                  lines.push(t('management.demand.museumTicketTooltip', { amount: formatMoney(revenue.currentMonth.ticketGross) }));
                } else {
                  lines.push(t('management.demand.currentMonthOnlyNote'));
                }
                return lines;
              },
            },
          },
        },
        scales: { y: { ticks: { callback: (v) => formatNumber(v) } } },
      },
    });

    createChart(Chart, qs('#df-interest-chart', container), 'df-interest-chart', {
      type: 'line',
      data: {
        labels: trendSlice(interest.trend).map((m) => monthLabel(m.month)),
        datasets: Object.keys(interest.labels).map((key, i) => ({
          label: interest.labels[key],
          data: trendSlice(interest.trend).map((m) => m[key]),
          borderColor: CHART_COLORS[i % CHART_COLORS.length],
          backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}22`,
          tension: 0.3,
        })),
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { ticks: { callback: (v) => `${v}%` } } } },
    });

    const forecast = getForecast(state, period, forecastMetric, 3);
    const allMonths = [...forecast.actualMonths, ...forecast.forecastMonths];
    const actualData = [...forecast.actual, ...Array(forecast.forecastMonths.length).fill(null)];
    // Nối điểm cuối actual với điểm đầu forecast để đường liền/đứt nối liên tục, không đứt gãy.
    const forecastData = [...Array(forecast.actual.length - 1).fill(null), forecast.actual[forecast.actual.length - 1], ...forecast.forecast.map((f) => f.value)];
    const forecastHigh = [...Array(forecast.actual.length - 1).fill(null), forecast.actual[forecast.actual.length - 1], ...forecast.forecast.map((f) => f.high)];
    const forecastLow = [...Array(forecast.actual.length - 1).fill(null), forecast.actual[forecast.actual.length - 1], ...forecast.forecast.map((f) => f.low)];

    createChart(Chart, qs('#df-forecast-chart', container), 'df-forecast-chart', {
      type: 'line',
      data: {
        labels: allMonths.map(monthLabel),
        datasets: [
          { label: t('management.demand.actual'), data: actualData, borderColor: CHART_COLORS[0], backgroundColor: `${CHART_COLORS[0]}22`, pointStyle: 'circle', tension: 0.25, spanGaps: false },
          { label: t('management.demand.forecastRange'), data: forecastHigh, borderColor: 'transparent', backgroundColor: `${CHART_COLORS[1]}22`, pointRadius: 0, fill: '+1', tension: 0.25 },
          { label: t('management.demand.forecastBelow'), data: forecastLow, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false, tension: 0.25, hidden: false },
          { label: t('management.demand.forecast'), data: forecastData, borderColor: CHART_COLORS[1], borderDash: [8, 5], pointStyle: 'triangle', tension: 0.25, spanGaps: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { filter: (item) => item.text !== t('management.demand.forecastBelow') } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatNumber(Math.round(ctx.parsed.y))}` } },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }).catch(() => {
    qs('#df-digital-chart', container)?.insertAdjacentHTML('afterend', `<p class="text-sm text-faint">${t('management.demand.chartLoadError')}</p>`);
  });
}

function buildDigitalDatasets(rows) {
  return [
    { label: t('management.demand.viewsLabel'), data: rows.map((r) => r.destinationViews), borderColor: CHART_COLORS[0], backgroundColor: `${CHART_COLORS[0]}22`, tension: 0.3 },
    { label: t('management.demand.cartAddsLabel'), data: rows.map((r) => r.tripCartAdds), borderColor: CHART_COLORS[2], backgroundColor: `${CHART_COLORS[2]}22`, tension: 0.3 },
    { label: t('management.demand.customisationRequestsLabel'), data: rows.map((r) => r.customisationRequests), borderColor: CHART_COLORS[3], backgroundColor: `${CHART_COLORS[3]}22`, tension: 0.3 },
  ];
}

function buildConvertedDatasets(rows) {
  return [
    { label: t('management.demand.activeBookings'), data: rows.map((r) => r.activeBookings), borderColor: CHART_COLORS[1], backgroundColor: `${CHART_COLORS[1]}22`, tension: 0.3 },
    { label: t('management.demand.guestsLabel'), data: rows.map((r) => r.guests), borderColor: CHART_COLORS[4], backgroundColor: `${CHART_COLORS[4]}22`, tension: 0.3 },
  ];
}
