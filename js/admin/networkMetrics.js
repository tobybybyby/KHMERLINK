// Số liệu TOÀN MẠNG LƯỚI cho Cổng dữ liệu quản lý — tổng hợp trực tiếp từ chính dữ liệu của các
// host/listing (historicalMetrics + visitMetrics từ data/pilot-seed-data.js, cộng booking/review
// THẬT phát sinh trong phiên demo), tôn trọng bộ lọc adminFilters (tháng/listing/loại hình/đơn vị
// cung cấp/khu vực). Không lấy trung bình cộng trực tiếp — mọi average đều có trọng số theo số
// lượt tương ứng (xem reviewsService.getRatingStatsForListingIds).
import { historicalMetrics, visitMetrics, TIMEZONE } from '../../data/pilot-seed-data.js';
import { adminFilters, getScopedDestinations, providerInScope } from './filters.js';
import { getRatingStatsForListingIds, getRecommendRate, getDisplayReviewsForListingIds } from '../services/reviewsService.js';
import { monthLabel, currentMonthKey } from '../services/metricsService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

function scopedListingIds(state) {
  return getScopedDestinations(state).map((d) => d.id);
}

/** Booking thật (live) trong phạm vi lọc, gộp theo tháng — cùng logic "tháng hiện tại luôn sau
 * lịch sử" như metricsService.js (không đếm trùng với historicalMetrics). */
function computeLiveMonthNetwork(state, listingIds) {
  const nowKey = currentMonthKey();
  const expByListing = new Map();
  state.experiences.forEach((e) => { if (listingIds.includes(e.destinationId)) expByListing.set(e.id, e.destinationId); });
  const items = state.bookingItems.filter((bi) => {
    if (!expByListing.has(bi.experienceId)) return false;
    if (!providerInScope(state, hostIdForListing(state, expByListing.get(bi.experienceId)))) return false;
    const at = new Date(bi.statusHistory?.[0]?.at || bi.createdAt || Date.now());
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit' }).formatToParts(at);
    const map = {}; parts.forEach((p) => { map[p.type] = p.value; });
    return `${map.year}-${map.month}` === nowKey;
  });
  const completed = items.filter((bi) => bi.status === 'completed');
  const accepted = items.filter((bi) => ['accepted', 'completed'].includes(bi.status));
  const grossRevenue = accepted.reduce((s, bi) => s + bi.subtotal, 0);
  const platformFee = Math.round(grossRevenue * 0.1);
  return {
    month: nowKey, label: monthLabel(nowKey),
    participants: completed.reduce((s, bi) => s + bi.quantity, 0),
    completedBookings: new Set(completed.map((bi) => bi.bookingId)).size,
    grossRevenue, platformFee, providerIncome: grossRevenue - platformFee,
  };
}

function hostIdForListing(state, listingId) {
  const host = state.hosts.find((h) => h.destinationId === listingId);
  return host ? host.id : null;
}

/** historicalMetrics đã lọc theo listing trong phạm vi + provider trong phạm vi. */
function scopedHistorical(state, listingIds) {
  const idSet = new Set(listingIds);
  return historicalMetrics.filter((r) => idSet.has(r.listingId) && providerInScope(state, r.providerId));
}

function monthsWindow() {
  return adminFilters.months;
}

/** Doanh thu mạng lưới theo tháng — sum(historicalMetrics.grossRevenue) + booking thật hoàn thành
 * trong tháng đó (chỉ tháng hiện tại có dữ liệu live, các tháng lịch sử chỉ có seed). */
export function getNetworkMonthlyRevenue(state) {
  const listingIds = scopedListingIds(state);
  const hist = scopedHistorical(state, listingIds);
  const byMonth = {};
  hist.forEach((r) => { byMonth[r.month] = (byMonth[r.month] || 0) + r.grossRevenue; });
  const live = computeLiveMonthNetwork(state, listingIds);
  byMonth[live.month] = (byMonth[live.month] || 0) + live.grossRevenue;
  const months = Object.keys(byMonth).sort();
  return months.slice(-monthsWindow()).map((m) => ({ month: m, label: monthLabel(m), revenue: byMonth[m] }));
}

/** Lượt tham gia (EXP) + lượt ghé (SITE, dùng visitMetrics — SITE-06 CHỈ tính 1 lần qua đây, KHÔNG
 * cộng thêm participants trong historicalMetrics của SITE-06 để tránh đếm trùng 1 lượt trải
 * nghiệm 2 lần — xem PHASE mục 7). */
export function getParticipantsAndVisitsSeries(state) {
  const listingIds = new Set(scopedListingIds(state));
  const expListingIds = new Set(['EXP-01', 'EXP-02', 'EXP-03'].filter((id) => listingIds.has(id)));
  const siteListingIds = new Set(['SITE-04', 'SITE-05', 'SITE-06', 'SITE-07'].filter((id) => listingIds.has(id)));

  const byMonth = {};
  historicalMetrics.filter((r) => expListingIds.has(r.listingId) && providerInScope(state, r.providerId)).forEach((r) => {
    byMonth[r.month] = byMonth[r.month] || { participants: 0, visits: 0 };
    byMonth[r.month].participants += r.participants;
  });
  visitMetrics.filter((r) => siteListingIds.has(r.listingId)).forEach((r) => {
    byMonth[r.month] = byMonth[r.month] || { participants: 0, visits: 0 };
    byMonth[r.month].visits += r.visitInstances;
  });
  const months = Object.keys(byMonth).sort();
  return months.slice(-monthsWindow()).map((m) => ({ month: m, label: monthLabel(m), participants: byMonth[m].participants, visits: byMonth[m].visits }));
}

/** KPI toàn mạng lưới pilot trong phạm vi lọc + khoảng tháng đang chọn. */
export function getNetworkKpis(state) {
  const listingIds = scopedListingIds(state);
  const hist = scopedHistorical(state, listingIds).filter((r) => isWithinWindow(r.month));
  const live = computeLiveMonthNetwork(state, listingIds);

  const totalGrossRevenue = hist.reduce((s, r) => s + r.grossRevenue, 0) + live.grossRevenue;
  const totalProviderIncome = hist.reduce((s, r) => s + r.providerIncome, 0) + live.providerIncome;
  const totalCompletedBookings = hist.reduce((s, r) => s + (r.completedBookings || 0), 0) + live.completedBookings;

  const expListingIds = new Set(['EXP-01', 'EXP-02', 'EXP-03'].filter((id) => listingIds.includes(id)));
  const siteListingIds = new Set(['SITE-04', 'SITE-05', 'SITE-06', 'SITE-07'].filter((id) => listingIds.includes(id)));
  const totalParticipants = hist.filter((r) => expListingIds.has(r.listingId)).reduce((s, r) => s + r.participants, 0) + live.participants;
  const totalVisits = visitMetrics.filter((r) => siteListingIds.has(r.listingId) && isWithinWindow(r.month)).reduce((s, r) => s + r.visitInstances, 0);
  const totalExperienceInstances = totalParticipants + totalVisits;

  const ratingStats = getRatingStatsForListingIds(state, listingIds);
  const recommend = getRecommendRate(state, listingIds);

  const activeHostIds = new Set(state.hosts.filter((h) => listingIds.includes(h.destinationId) && providerInScope(state, h.id)).map((h) => h.id));
  const expIdsInScope = new Set(state.experiences.filter((e) => listingIds.includes(e.destinationId)).map((e) => e.id));
  const hostIdsInScope = new Set(state.hosts.filter((h) => providerInScope(state, h.id)).map((h) => h.id));
  // Gộp booking THẬT (bookingItems) + booking demo cho Lịch & Booking của Host (PHẦN 2, mục 2.7:
  // "Management Portal nhận dữ liệu booking tương ứng") — cùng nguồn hostDemoBookings dùng ở
  // js/services/hostBookingService.js, tránh 2 nơi tính khác nhau.
  const pendingBookings = state.bookingItems.filter((bi) => expIdsInScope.has(bi.experienceId) && bi.status === 'pending').length
    + (state.hostDemoBookings || []).filter((b) => hostIdsInScope.has(b.providerId) && b.status === 'pending').length;

  return {
    totalExperienceInstances,
    totalCompletedBookings,
    totalGrossRevenue,
    totalProviderIncome,
    weightedAverageRating: ratingStats.averageRating,
    totalReviewCount: ratingStats.reviewCount,
    recommendRate: recommend.rate,
    activeHostCount: activeHostIds.size,
    pendingBookings,
  };
}

function isWithinWindow(monthKey) {
  // Cửa sổ tháng đang lọc, tính NGƯỢC từ tháng hiện tại (bao gồm cả live) — dùng chung danh sách
  // tháng đã sort để cắt đúng N tháng gần nhất.
  const allMonths = Array.from(new Set([...historicalMetrics.map((r) => r.month), currentMonthKey()])).sort();
  const windowMonths = new Set(allMonths.slice(-monthsWindow()));
  return windowMonths.has(monthKey);
}

/** Donut "Phân bổ doanh thu theo đơn vị cung cấp" — CHỈ tính đơn vị có doanh thu > 0 (chùa miễn
 * phí không xuất hiện), tách rõ "Đơn vị văn hóa công" (bảo tàng) khỏi hộ dân/nghệ nhân qua
 * providerType của listing. */
export function getRevenueByProviderDonut(state) {
  const listingIds = scopedListingIds(state);
  const hist = scopedHistorical(state, listingIds).filter((r) => isWithinWindow(r.month));

  const byProvider = {};
  hist.forEach((r) => { byProvider[r.providerId] = (byProvider[r.providerId] || 0) + r.grossRevenue; });

  // Doanh thu live (booking thật tháng hiện tại) phân bổ đúng theo provider thật của từng booking
  // item — không dùng số tổng hợp của computeLiveMonthNetwork() vì hàm đó gộp mọi provider lại.
  const nowKey = currentMonthKey();
  const expMap = new Map(state.experiences.map((e) => [e.id, e]));
  state.bookingItems.forEach((bi) => {
    if (bi.status !== 'accepted' && bi.status !== 'completed') return;
    const exp = expMap.get(bi.experienceId);
    if (!exp || !listingIds.includes(exp.destinationId)) return;
    if (!providerInScope(state, exp.hostId)) return;
    const at = new Date(bi.statusHistory?.[0]?.at || bi.createdAt || Date.now());
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit' }).formatToParts(at);
    const map = {}; parts.forEach((p) => { map[p.type] = p.value; });
    if (`${map.year}-${map.month}` !== nowKey) return;
    byProvider[exp.hostId] = (byProvider[exp.hostId] || 0) + bi.subtotal;
  });

  const rows = Object.entries(byProvider)
    .filter(([, revenue]) => revenue > 0)
    .map(([providerId, revenue]) => {
      const host = state.hosts.find((h) => h.id === providerId);
      const dest = host ? state.destinations.find((d) => d.id === host.destinationId) : null;
      const isCulturalOrg = dest?.providerType === 'cultural_organisation';
      return {
        providerId,
        name: host ? host.name : providerId,
        revenue,
        categoryLabel: isCulturalOrg ? 'Đơn vị văn hóa công' : 'Hộ dân/nghệ nhân',
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  return { rows, total };
}

/** Bar chart "Doanh thu theo loại hình" — nhóm theo providerType của listing. */
export function getRevenueByType(state) {
  const { rows } = getRevenueByProviderDonut(state);
  const byType = {};
  rows.forEach((r) => { byType[r.categoryLabel] = (byType[r.categoryLabel] || 0) + r.revenue; });
  return Object.entries(byType).map(([label, revenue]) => ({ label, revenue }));
}

/** Điểm đánh giá theo từng listing (trong phạm vi lọc) — cho bar chart. */
export function getRatingByListingBar(state) {
  const listingIds = scopedListingIds(state);
  return listingIds.map((id) => {
    const dest = state.destinations.find((d) => d.id === id);
    const stats = getRatingStatsForListingIds(state, [id]);
    return { listingId: id, name: dest ? localizedDestinationName(dest) : id, averageRating: stats.averageRating, reviewCount: stats.reviewCount };
  }).filter((r) => r.reviewCount > 0);
}

/** Bảng "Top phản hồi và nhu cầu cải thiện" — ưu tiên phản hồi thấp điểm nhất, mới nhất trước. */
export function getTopFeedbackTable(state, limit = 8) {
  const listingIds = scopedListingIds(state);
  const reviews = getDisplayReviewsForListingIds(state, listingIds);
  return reviews
    .slice()
    .sort((a, b) => a.overallRating - b.overallRating || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map((r) => {
      const dest = state.destinations.find((d) => d.id === r.listingId);
      return { ...r, listingName: dest ? localizedDestinationName(dest) : r.listingId };
    });
}

export const NetworkMetricsService = {
  getNetworkMonthlyRevenue, getParticipantsAndVisitsSeries, getNetworkKpis,
  getRevenueByProviderDonut, getRevenueByType, getRatingByListingBar, getTopFeedbackTable,
};
