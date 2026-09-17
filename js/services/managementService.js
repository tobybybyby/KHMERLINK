// Lớp selector TRUNG TÂM cho Cổng dữ liệu quản lý — "Nhu cầu & Cơ hội" (PHASE cập nhật gần nhất).
// Nguyên tắc: KHÔNG tạo bộ dữ liệu độc lập — mọi con số đọc qua getProviderMetrics()/getNetworkMetrics()
// (hostBookingService.js, đã là nguồn KPI dùng chung Studio Overview/Lịch & Booking/Admin Overview)
// + activityCatalog/getOperations() (operationsService.js) + reviewsService.js + 2 mảng "historical
// demo data" quy mô mạng lưới trong data/pilot-seed-data.js (networkMonthlyHistory/interestTrend —
// xem ghi chú tại đó về vì sao đây KHÔNG suy ra được từ hành vi 1 traveller demo duy nhất).
//
// Quy ước KHÁC với networkMetrics.js (module admin/ cũ hơn, dùng historicalMetrics/visitMetrics 12
// tháng cho Tổng quan) — module NÀY dành riêng cho "Nhu cầu & Cơ hội", dùng networkMonthlyHistory 6
// tháng theo đúng yêu cầu Phase 4. Không hợp nhất 2 module vì phục vụ 2 trang có yêu cầu số liệu
// khác nhau (đã có từ phase trước, không đụng vào để tránh phá vỡ Tổng quan đang chạy đúng).
import {
  getNetworkMetrics as hostGetNetworkMetrics, getProviderMetrics, getCurrentPeriod, getAllProviderBookings,
} from './hostBookingService.js';
import { getOperations } from './operationsService.js';
import { getRatingStatsForListingIds, getDisplayReviewsForListingIds } from './reviewsService.js';
import { localizedDestinationName } from './destinationsService.js';
import { categoryGroup } from '../utils.js';
import {
  activityCatalog, networkMonthlyHistory, interestTrend, INTEREST_TREND_LABELS, customerPreferenceSeed,
  OPPORTUNITY_COPY_BY_ACTIVITY, CURRENT_MONTH_REVIEWS_SUBMITTED_BASELINE,
} from '../../data/pilot-seed-data.js';

export function periodKeyOf(period) {
  return `${period.year}-${String(period.month + 1).padStart(2, '0')}`;
}

function historyRowFor(period) {
  const key = periodKeyOf(period);
  return networkMonthlyHistory.find((m) => m.month === key) || networkMonthlyHistory[networkMonthlyHistory.length - 1];
}

function historyIndexFor(period) {
  return networkMonthlyHistory.findIndex((m) => m.month === periodKeyOf(period));
}

// ---------- Bộ lọc: providerId/activityId/category/paidOrFree -> danh sách providerId hợp lệ ----------
// groupType/bookingStatus áp dụng ở CẤP BOOKING (capacity table, demand funnel chi tiết) — KHÔNG
// đưa vào đây để không phải "nhánh lại" công thức getProviderMetrics()/getNetworkMetrics() đã được
// xác minh khớp Tổng quan/Lịch & Booking (rủi ro tạo 2 công thức KPI lệch nhau). tripDuration/
// budgetRange không có trường tương ứng trên booking record — xem hasUnscopableFilters() bên dưới.
export function resolveProviderIds(state, filters = {}) {
  let ids = state.hosts.map((h) => h.id);
  if (filters.providerId) ids = ids.filter((id) => id === filters.providerId);
  if (filters.activityId) {
    const host = state.hosts.find((h) => h.destinationId === filters.activityId);
    ids = host ? ids.filter((id) => id === host.id) : [];
  }
  if (filters.category) {
    ids = ids.filter((id) => {
      const host = state.hosts.find((h) => h.id === id);
      const dest = host && state.destinations.find((d) => d.id === host.destinationId);
      return dest && categoryGroup(dest.category) === filters.category;
    });
  }
  if (filters.paidOrFree) {
    ids = ids.filter((id) => {
      const host = state.hosts.find((h) => h.id === id);
      const ops = host && getOperations(host.destinationId);
      if (!ops) return true;
      return filters.paidOrFree === 'paid' ? ops.financialMode !== 'free_visit' : ops.financialMode === 'free_visit';
    });
  }
  return ids;
}

/** true khi filter hiện tại không thể áp dụng lên dữ liệu booking/funnel thật (chưa có trường
 * tripDuration/budgetRange lưu trên booking record — chỉ tồn tại dưới dạng % cố định toàn mạng
 * lưới trong customerPreferenceSeed) — UI hiển thị LOW_SAMPLE_NOTE thay vì bịa số đã lọc. */
export function hasUnscopableFilters(filters = {}) {
  return !!(filters.tripDuration || filters.budgetRange);
}

function applyBookingLevelFilters(bookings, filters = {}) {
  return bookings.filter((b) => {
    if (filters.groupType && b.groupType !== filters.groupType) return false;
    if (filters.bookingStatus && b.status !== filters.bookingStatus) return false;
    return true;
  });
}

// ---------- 1. getNetworkMetrics(state, period, filters) — bọc hostBookingService, filter-aware ----------
export function getNetworkMetrics(state, period = getCurrentPeriod(), filters = {}) {
  return hostGetNetworkMetrics(state, period, resolveProviderIds(state, filters));
}

// ---------- 2. getProviderPerformance(state, providerId, period) ----------
export function getProviderPerformance(state, providerId, period = getCurrentPeriod()) {
  const pm = getProviderMetrics(state, providerId, period);
  const host = state.hosts.find((h) => h.id === providerId);
  const ratingStats = host ? getRatingStatsForListingIds(state, [host.destinationId]) : { averageRating: null, reviewCount: 0 };
  return { ...pm, hostName: host ? host.name : providerId, destinationId: host ? host.destinationId : null, ratingStats };
}

// ---------- Lượt review THẬT phát sinh trong phiên demo, trong đúng kỳ (year/month) ----------
function countLiveReviewsInPeriod(state, period) {
  return (state.reviews || []).filter((r) => {
    const d = new Date(r.createdAt);
    return d.getFullYear() === period.year && d.getMonth() === period.month;
  }).length;
}

// ---------- 3. getCustomerDemandMetrics — thẻ KPI 6.1 ----------
export function getCustomerDemandMetrics(state, period = getCurrentPeriod(), filters = {}) {
  const row = historyRowFor(period);
  const idx = historyIndexFor(period);
  const prevRow = idx > 0 ? networkMonthlyHistory[idx - 1] : null;
  const net = getNetworkMetrics(state, period, filters);
  const pct = (curr, prev) => (prev ? ((curr - prev) / prev) * 100 : null);
  // Lịch sử 5 tháng trước KHÔNG có breakdown theo từng provider/activity (chỉ có tổng mạng lưới) —
  // khi filter đang thu hẹp theo đơn vị/hoạt động, so curr (đã lọc) với prev (toàn mạng lưới) sẽ
  // cho % sai lệch gây hiểu nhầm (vd "-80%" chỉ vì đang xem 1 đơn vị nhỏ) — ẩn % tăng trưởng cho 3
  // chỉ số booking-derived trong trường hợp này thay vì hiển thị số gây hiểu lầm.
  const scoped = !!(filters.providerId || filters.activityId);

  return {
    period,
    monthKey: periodKeyOf(period),
    scopedToProviderOrActivity: scoped,
    destinationViews: row.destinationViews,
    destinationViewsGrowthPct: pct(row.destinationViews, prevRow?.destinationViews),
    activeBookings: net.totalActiveBookings,
    activeBookingsGrowthPct: scoped ? null : pct(net.totalActiveBookings, prevRow?.activeBookings),
    guests: net.totalGuests,
    guestsGrowthPct: scoped ? null : pct(net.totalGuests, prevRow?.guests),
    grossValue: net.totalGrossValue,
    grossValueGrowthPct: scoped ? null : pct(net.totalGrossValue, prevRow?.grossValue),
    partialMatchRate: row.partialMatchRate,
    bookingConversionFromItineraryPct: row.itinerariesSubmitted ? (net.totalActiveBookings / row.itinerariesSubmitted) * 100 : null,
  };
}

// ---------- 4. getDemandFunnel — Phase 5 ----------
export function getDemandFunnel(state, period = getCurrentPeriod(), filters = {}) {
  const row = historyRowFor(period);
  const net = getNetworkMetrics(state, period, filters);
  const reviewsSubmitted = CURRENT_MONTH_REVIEWS_SUBMITTED_BASELINE + countLiveReviewsInPeriod(state, period);
  const rate = (a, b) => (b ? a / b : null);

  const steps = [
    { key: 'views', label: 'Lượt xem', unit: 'lượt', value: row.destinationViews },
    { key: 'cartAdds', label: 'Lượt thêm vào giỏ', unit: 'lượt', value: row.tripCartAdds },
    { key: 'customisationRequests', label: 'Yêu cầu cá nhân hóa', unit: 'yêu cầu', value: row.customisationRequests },
    { key: 'itinerariesSubmitted', label: 'Hành trình được submit', unit: 'hành trình', value: row.itinerariesSubmitted },
    { key: 'bookings', label: 'Đoàn booking', unit: 'đoàn', value: net.totalActiveBookings },
    { key: 'completedVisits', label: 'Đoàn hoàn thành', unit: 'đoàn', value: net.totalCompleted },
    { key: 'reviews', label: 'Review', unit: 'review', value: reviewsSubmitted },
  ];

  return {
    period,
    monthKey: periodKeyOf(period),
    steps,
    conversions: {
      cartAddRate: rate(row.tripCartAdds, row.destinationViews),
      customisationCompletionRate: rate(row.itinerariesSubmitted, row.customisationRequests),
      bookingConversionRate: rate(net.totalActiveBookings, row.itinerariesSubmitted),
      completedRate: rate(net.totalCompleted, net.totalActiveBookings),
      reviewRate: rate(reviewsSubmitted, net.totalCompleted),
    },
  };
}

// ---------- 5. getInterestDistribution — Phase 6.4 + 6.5 ----------
export function getInterestDistribution(state, period = getCurrentPeriod(), filters = {}) {
  const monthKey = periodKeyOf(period);
  return {
    period,
    monthKey,
    trend: interestTrend,
    labels: INTEREST_TREND_LABELS,
    currentMonth: interestTrend.find((m) => m.month === monthKey) || interestTrend[interestTrend.length - 1],
    preferences: customerPreferenceSeed,
  };
}

// ---------- 6. getCapacityUtilisation — Phase 7 ----------
const WEEKDAY_KEYS_BY_JS_DAY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function countOpenDaysInMonth(ops, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dow = new Date(year, month, d).getDay();
    const spec = ops.openingHours.everyday || ops.openingHours[WEEKDAY_KEYS_BY_JS_DAY[dow]];
    if (spec && spec !== 'closed') count += 1;
  }
  return count;
}

/** occupancyRate = bookedSeats / availableSeatCapacity (đúng công thức yêu cầu). availableSeatCapacity
 * là ƯỚC LƯỢNG = capacityPerSlot × số khung giờ/ngày × số ngày mở cửa trong kỳ — vì 7 listing pilot
 * chưa có hệ "slot thật" theo từng ngày cụ thể (chỉ hộ tự tạo experience mới qua Studio mới có slot
 * thật, xem js/services/bookingService.js) — ghi rõ đây là ước lượng năng lực demo, không phải sức
 * chứa đã đặt trước xác nhận theo lịch thật. */
export function getCapacityUtilisation(state, period = getCurrentPeriod(), filters = {}) {
  const providerIdSet = new Set(resolveProviderIds(state, filters));
  const allBookings = applyBookingLevelFilters(getAllProviderBookings(state, period), filters);

  return Object.keys(activityCatalog)
    .filter((activityId) => {
      if (filters.activityId && filters.activityId !== activityId) return false;
      const host = state.hosts.find((h) => h.destinationId === activityId);
      return !host || providerIdSet.has(host.id);
    })
    .map((activityId) => {
      const ops = getOperations(activityId);
      const dest = state.destinations.find((d) => d.id === activityId);
      const acts = allBookings.filter((b) => b.activityId === activityId && b.status !== 'cancelled');
      const demandGuests = acts.reduce((s, b) => s + b.groupSize, 0);
      const pendingCount = acts.filter((b) => b.status === 'pending').length;

      let availableSeatCapacity = null;
      let occupancyRate = null;
      if (ops.capacityPerSlot) {
        const openDays = countOpenDaysInMonth(ops, period.year, period.month);
        const slotsPerDay = Math.max(1, (ops.availableTimeSlots || []).length);
        availableSeatCapacity = ops.capacityPerSlot * slotsPerDay * openDays;
        occupancyRate = availableSeatCapacity ? demandGuests / availableSeatCapacity : null;
      }

      return {
        activityId,
        name: dest ? localizedDestinationName(dest) : activityId,
        financialMode: ops.financialMode,
        isFree: ops.financialMode === 'free_visit',
        demandGuests,
        activeBookingCount: acts.length,
        capacityPerSlot: ops.capacityPerSlot,
        availableSeatCapacity,
        occupancyRate,
        pendingCount,
        opportunity: OPPORTUNITY_COPY_BY_ACTIVITY[activityId] || '',
      };
    });
}

// ---------- 7. getRevenueMetrics — Phase 6.3 ----------
export function getRevenueMetrics(state, period = getCurrentPeriod(), filters = {}) {
  const net = getNetworkMetrics(state, period, filters);
  const monthKey = periodKeyOf(period);
  return {
    period,
    monthKey,
    // Tháng hiện tại thay bằng số TÍNH LẠI từ booking records (không double-count với seed) — 5
    // tháng lịch sử còn lại giữ nguyên số liệu mô phỏng mạng lưới (mục 4 yêu cầu).
    monthlySeries: networkMonthlyHistory.map((m) => ({
      month: m.month,
      grossValue: m.month === monthKey ? net.totalGrossValue : m.grossValue,
    })),
    currentMonth: {
      grossValue: net.totalGrossValue,
      communityIncome: net.communityProviderIncome,
      communityFee: net.communityPlatformFee,
      ticketGross: net.ticketGrossRevenue,
    },
  };
}

/** Chuỗi 6 tháng đầy đủ (views/cartAdds/customisationRequests/activeBookings/guests) cho 2 chart
 * "Digital demand"/"Converted demand" (Phase 6.2) — tháng hiện tại thay 3 trường booking-derived
 * bằng số LIVE, y hệt nguyên tắc ở getRevenueMetrics()/getForecast(), gộp vào 1 hàm để demand.js
 * không phải tự lắp ghép lại. */
export function getDemandTrendSeries(state, period = getCurrentPeriod(), filters = {}) {
  const net = getNetworkMetrics(state, period, filters);
  const monthKey = periodKeyOf(period);
  return networkMonthlyHistory.map((m) => (m.month === monthKey ? {
    month: m.month,
    destinationViews: m.destinationViews,
    tripCartAdds: m.tripCartAdds,
    customisationRequests: m.customisationRequests,
    activeBookings: net.totalActiveBookings,
    guests: net.totalGuests,
  } : {
    month: m.month,
    destinationViews: m.destinationViews,
    tripCartAdds: m.tripCartAdds,
    customisationRequests: m.customisationRequests,
    activeBookings: m.activeBookings,
    guests: m.guests,
  }));
}

// ---------- 8. getFeedbackMetrics ----------
export function getFeedbackMetrics(state, period = getCurrentPeriod(), filters = {}) {
  const providerIds = resolveProviderIds(state, filters);
  const listingIds = providerIds
    .map((pid) => state.hosts.find((h) => h.id === pid)?.destinationId)
    .filter(Boolean);
  const stats = getRatingStatsForListingIds(state, listingIds);
  const lowRatingCount = getDisplayReviewsForListingIds(state, listingIds).filter((r) => r.overallRating < 4.3).length;
  const reviewsThisMonth = CURRENT_MONTH_REVIEWS_SUBMITTED_BASELINE + countLiveReviewsInPeriod(state, period);
  return { ...stats, lowRatingCount, listingIds, reviewsThisMonth };
}

// ---------- 9. forecastLinearTrend + getForecast — Phase 8 ----------
/** Hồi quy tuyến tính đơn giản (least squares) trên index thời gian 0..n-1 — KHÔNG dùng random.
 * Không cho kết quả âm (Math.max(0, ...)), như yêu cầu. */
export function forecastLinearTrend(values, periods = 3) {
  const n = values.length;
  if (!n) return Array(periods).fill(0);
  if (n < 2) return Array(periods).fill(Math.max(0, values[0]));
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = values.reduce((s, y) => s + y, 0) / n;
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => { num += (x - meanX) * (values[i] - meanY); den += (x - meanX) ** 2; });
  const slope = den ? num / den : 0;
  const intercept = meanY - slope * meanX;
  const out = [];
  for (let p = 1; p <= periods; p += 1) {
    out.push(Math.max(0, slope * (n - 1 + p) + intercept));
  }
  return out;
}

const UNCERTAINTY_PCT_BY_HORIZON = [0.08, 0.12, 0.16]; // tháng +1/+2/+3

const METRIC_ROUNDING = {
  destinationViews: (v) => Math.round(v),
  customisationRequests: (v) => Math.round(v),
  activeBookings: (v) => Math.round(v),
  guests: (v) => Math.round(v),
  grossValue: (v) => Math.round(v / 10000) * 10000,
};

const METRIC_LABEL = {
  destinationViews: 'Lượt xem địa điểm',
  customisationRequests: 'Yêu cầu cá nhân hóa',
  activeBookings: 'Active booking',
  guests: 'Tổng khách',
  grossValue: 'Tổng giá trị booking',
};

/** Chuỗi 6 tháng ACTUAL cho 1 metric — tháng hiện tại thay bằng số tính lại từ booking records với
 * 3 metric booking-derived (activeBookings/guests/grossValue), 2 metric còn lại (destinationViews/
 * customisationRequests) không có nguồn live tương xứng quy mô mạng lưới nên giữ nguyên seed. */
function getMetricHistorySeries(state, period, metricKey) {
  const monthKey = periodKeyOf(period);
  const net = getNetworkMetrics(state, period, {});
  const liveMap = { activeBookings: net.totalActiveBookings, guests: net.totalGuests, grossValue: net.totalGrossValue };
  return networkMonthlyHistory.map((m) => (m.month === monthKey && metricKey in liveMap ? liveMap[metricKey] : m[metricKey]));
}

/** Dự báo 3 tháng tiếp theo cho 1 metric trong networkMonthlyHistory (destinationViews/
 * customisationRequests/activeBookings/guests/grossValue) — trả về actual (6 tháng) + forecast (3
 * tháng, kèm khoảng ước lượng ±8/±12/±16%). */
export function getForecast(state, period = getCurrentPeriod(), metricKey, periods = 3) {
  const actual = getMetricHistorySeries(state, period, metricKey);
  const round = METRIC_ROUNDING[metricKey] || Math.round;
  const raw = forecastLinearTrend(actual, periods);
  const forecast = raw.map((v, i) => {
    const value = round(v);
    const pct = UNCERTAINTY_PCT_BY_HORIZON[Math.min(i, UNCERTAINTY_PCT_BY_HORIZON.length - 1)];
    return { value, low: Math.max(0, round(value * (1 - pct))), high: round(value * (1 + pct)), uncertaintyPct: pct * 100 };
  });
  const lastMonth = networkMonthlyHistory[networkMonthlyHistory.length - 1].month;
  const futureMonths = [];
  let [y, m] = lastMonth.split('-').map(Number);
  for (let i = 0; i < periods; i += 1) {
    m += 1; if (m > 12) { m = 1; y += 1; }
    futureMonths.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return {
    metricKey,
    label: METRIC_LABEL[metricKey] || metricKey,
    actualMonths: networkMonthlyHistory.map((m2) => m2.month),
    actual,
    forecastMonths: futureMonths,
    forecast,
  };
}

// ---------- 10. getOpportunityRecommendations — Phase 9 + 10 (rule-based) ----------
function pct(v) { return `${v.toFixed(1)}%`; }

/** Đánh giá điều kiện rule-based (Phase 10) trên metrics ĐÃ TÍNH SẴN (không đọc random/giả định) —
 * mỗi rule bật/tắt ứng với 1 hoặc nhiều recommendation card, evidence lấy trực tiếp từ dashboard. */
export function getOpportunityRecommendations(state, period = getCurrentPeriod(), filters = {}) {
  const demand = getCustomerDemandMetrics(state, period, filters);
  const funnel = getDemandFunnel(state, period, filters);
  const net = getNetworkMetrics(state, period, filters);
  const capacity = getCapacityUtilisation(state, period, filters);
  const feedback = getFeedbackMetrics(state, period, filters);
  const actions = state.opportunityActions || {};

  const pendingRate = net.totalActiveBookings ? net.totalPending / net.totalActiveBookings : 0;
  const partialMatchRate = demand.partialMatchRate / 100;
  const weekendDemandRatio = 1 + customerPreferenceSeed.weekendUpliftPct / 100;
  const shortTrip = customerPreferenceSeed.tripDuration.find((d) => d.key === 'short');
  const craftFoodPct = interestTrend[interestTrend.length - 1].handsOnCraft + interestTrend[interestTrend.length - 1].localFood;

  const cards = [];

  const withStatus = (rec) => ({ ...rec, status: actions[rec.id]?.status || 'new', assignedTo: actions[rec.id]?.assignedTo || null });

  // 9.1
  cards.push(withStatus({
    id: 'opp-short-tour-bundle',
    title: 'Phát triển tour 2–4 giờ',
    evidence: [
      `${shortTrip.pct}% khách ưu tiên chuyến đi 2–4 giờ.`,
      `${craftFoodPct}% nhu cầu liên quan đến craft và local food.`,
      `Partial-match rate đạt ${pct(demand.partialMatchRate)}.`,
    ],
    opportunity: 'Nhu cầu dành cho hành trình ngắn và có hoạt động tương tác đang tăng.',
    recommendedAction: 'Tạo combo 2–4 giờ kết hợp một điểm văn hóa với một trải nghiệm cộng đồng như cốm dẹp hoặc làm mặt nạ Khmer.',
    priority: 'High',
    responsibleParty: 'Management + community providers',
    timeframe: '30 ngày',
    expectedImpact: 'Tăng tỷ lệ chuyển đổi từ hành trình được submit sang booking.',
  }));

  // 9.2
  cards.push(withStatus({
    id: 'opp-weekend-capacity',
    title: 'Tăng năng lực cuối tuần',
    evidence: [
      `Nhu cầu cuối tuần cao hơn ngày thường ${customerPreferenceSeed.weekendUpliftPct}%.`,
      'Một số activity có capacity nhỏ từ 10–12 khách/lượt (Cốm dẹp, Làm mặt nạ Khmer).',
    ],
    opportunity: 'Cuối tuần đang là điểm nghẽn năng lực rõ rệt so với ngày thường.',
    recommendedAction: ['Mở thêm time slots cuối tuần.', 'Tổ chức hai lượt song song khi đủ nhân lực.', 'Cảnh báo Host khi occupancy vượt 80%.'],
    priority: 'High',
    responsibleParty: 'Community providers',
    timeframe: '14–30 ngày',
    expectedImpact: 'Giảm tình trạng hết chỗ cuối tuần, tăng booking hoàn thành.',
  }));

  // 9.3 — rule pendingRate >= 0.20 (reduce_confirmation_time)
  if (pendingRate >= 0.20) {
    cards.push(withStatus({
      id: 'opp-reduce-pending',
      title: 'Giảm số booking chờ xác nhận',
      evidence: [
        `${net.totalPending} trong ${net.totalActiveBookings} active bookings đang Pending.`,
        `Pending rate khoảng ${pct(pendingRate * 100)}.`,
      ],
      opportunity: 'Tỷ lệ booking chưa được Host xác nhận đang ở mức cao, có rủi ro khách chờ lâu.',
      recommendedAction: ['Gửi notification cho Host.', 'Thiết lập thời gian phản hồi mục tiêu dưới 12 giờ.', 'Escalate booking chưa xử lý sau 24 giờ.', 'Cho phép đề xuất time slot thay thế.'],
      priority: 'High',
      responsibleParty: 'Management',
      timeframe: 'Ngay lập tức',
      expectedImpact: 'Giảm pending rate, tăng trải nghiệm đặt chỗ cho khách.',
    }));
  }

  // 9.4
  cards.push(withStatus({
    id: 'opp-free-to-community',
    title: 'Chuyển lượt tham quan thành lợi ích cộng đồng',
    evidence: [
      'Chùa Âng và các điểm văn hóa miễn phí có lượng khách cao.',
      `Food và craft chiếm ${craftFoodPct}% nhu cầu sở thích.`,
    ],
    opportunity: 'Lượng khách lớn ở điểm miễn phí chưa được kết nối sang trải nghiệm cộng đồng lân cận.',
    recommendedAction: 'Kết nối các điểm miễn phí có lượng khách cao với các trải nghiệm cộng đồng lân cận trong suggested routes.',
    priority: 'Medium–High',
    responsibleParty: 'Management',
    timeframe: '30–60 ngày',
    expectedImpact: 'Tăng lượt chuyển đổi từ tham quan miễn phí sang trải nghiệm có doanh thu cộng đồng.',
    internalNote: 'Recommendation nội bộ của Management Portal — không cần giải thích business rule này trên Customer Interface.',
  }));

  // 9.5 — rule partialMatchRate >= 0.25 (create_new_routes_or_bundles)
  if (partialMatchRate >= 0.25) {
    cards.push(withStatus({
      id: 'opp-ai-route-coverage',
      title: 'Cải thiện AI route coverage',
      evidence: [`Partial-match rate tăng từ 18% lên ${pct(demand.partialMatchRate)}.`],
      opportunity: 'Tỷ lệ khớp một phần (không khớp hoàn toàn) đang tăng dần theo tháng.',
      recommendedAction: ['Phân tích những tổ hợp nhu cầu thường không có exact match.', 'Thêm bundle mới.', 'Mở thêm time slots.', 'Điều chỉnh duration và capacity.', 'Đề xuất các partial-match routes phù hợp thay vì trả kết quả trống.'],
      priority: 'High',
      responsibleParty: 'Management + AI product',
      timeframe: '30 ngày',
      expectedImpact: 'Tăng tỷ lệ exact-match, giảm phụ thuộc vào fallback.',
    }));
  }

  // Rule bổ sung (Phase 10) — occupancy >= 80%, rating < 4.3, views cao nhưng conversion thấp:
  // sinh thêm card ĐỘNG khi điều kiện xảy ra, không cố định sẵn nội dung như 5 card trên.
  const hotActivities = capacity.filter((c) => c.occupancyRate !== null && c.occupancyRate >= 0.80);
  if (hotActivities.length) {
    cards.push(withStatus({
      id: 'opp-add-capacity-hot-activities',
      title: `Bổ sung sức chứa cho ${hotActivities.length} hoạt động đang gần đầy chỗ`,
      evidence: hotActivities.map((c) => `${c.name}: occupancy ${pct(c.occupancyRate * 100)}.`),
      opportunity: 'Một số hoạt động đang tiệm cận giới hạn sức chứa ước tính trong tháng.',
      recommendedAction: 'Mở thêm khung giờ hoặc tăng sức chứa mỗi lượt cho các hoạt động này.',
      priority: 'Medium',
      responsibleParty: 'Community providers',
      timeframe: '14–30 ngày',
      expectedImpact: 'Giảm nguy cơ mất khách do hết chỗ.',
    }));
  }

  if (feedback.averageRating !== null && feedback.averageRating < 4.3) {
    cards.push(withStatus({
      id: 'opp-quality-improvement',
      title: 'Kế hoạch cải thiện chất lượng',
      evidence: [`Điểm đánh giá trung bình trong phạm vi lọc: ⭐ ${feedback.averageRating.toFixed(1)} (${feedback.reviewCount} đánh giá).`, `${feedback.lowRatingCount} đánh giá từ 3 sao trở xuống.`],
      opportunity: 'Điểm đánh giá trung bình đang dưới ngưỡng kỳ vọng 4,3 sao.',
      recommendedAction: 'Rà soát phản hồi thấp sao gần nhất và làm việc với Host liên quan để cải thiện.',
      priority: 'Medium',
      responsibleParty: 'Management + community providers',
      timeframe: '30 ngày',
      expectedImpact: 'Cải thiện điểm đánh giá trung bình mạng lưới.',
    }));
  }

  if (funnel.conversions.bookingConversionRate !== null && funnel.conversions.bookingConversionRate < 0.15 && funnel.steps[0].value >= 3000) {
    cards.push(withStatus({
      id: 'opp-review-conversion',
      title: 'Xem lại nội dung/giá/availability',
      evidence: [`${funnel.steps[0].value.toLocaleString('vi-VN')} lượt xem nhưng booking conversion từ hành trình submit chỉ ${pct(funnel.conversions.bookingConversionRate * 100)}.`],
      opportunity: 'Lượt xem cao nhưng tỷ lệ chuyển đổi sang booking còn thấp.',
      recommendedAction: 'Rà soát mô tả, giá và tình trạng khung giờ của các hoạt động được xem nhiều.',
      priority: 'Medium',
      responsibleParty: 'Management + community providers',
      timeframe: '30 ngày',
      expectedImpact: 'Tăng tỷ lệ chuyển đổi lượt xem thành booking.',
    }));
  }

  return cards;
}

export const ManagementService = {
  periodKeyOf, resolveProviderIds, hasUnscopableFilters,
  getNetworkMetrics, getProviderPerformance, getCustomerDemandMetrics, getDemandFunnel,
  getInterestDistribution, getCapacityUtilisation, getRevenueMetrics, getDemandTrendSeries, getFeedbackMetrics,
  forecastLinearTrend, getForecast, getOpportunityRecommendations,
};
