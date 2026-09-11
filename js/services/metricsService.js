// Số liệu tổng hợp dùng CHUNG cho Studio (Host) và Cổng dữ liệu quản lý (Management) — đọc từ
// historicalMetrics/visitMetrics (data/pilot-seed-data.js, 12 tháng 09/2025–08/2026, cố định) +
// booking/review THẬT phát sinh trong phiên demo (không nằm trong 12 tháng lịch sử nên không thể
// đếm trùng — tháng hiện tại của app luôn là 09/2026, sau khi dữ liệu lịch sử kết thúc).
import { historicalMetrics, visitMetrics, MONTHS_12, TIMEZONE } from '../../data/pilot-seed-data.js';
import { getRatingStatsForListingIds, getTagShareForListings, getRecommendRate, getDisplayReviewsForListingIds } from './reviewsService.js';

export function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-');
  return `T${Number(m)}/${y}`;
}

export function currentMonthKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit' }).formatToParts(now);
  const map = {};
  parts.forEach((p) => { map[p.type] = p.value; });
  return `${map.year}-${map.month}`;
}

/** bookingItem "thuộc" tháng nào — dùng mốc chấp nhận/hoàn thành đầu tiên (statusHistory[0].at). */
function bookingItemMonthKey(bi) {
  const at = new Date(bi.statusHistory?.[0]?.at || bi.createdAt || Date.now());
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit' }).formatToParts(at);
  const map = {};
  parts.forEach((p) => { map[p.type] = p.value; });
  return `${map.year}-${map.month}`;
}

/** Tháng "live" (booking thật trong phiên demo, KHÔNG có trong 12 tháng lịch sử — vì lịch sử kết
 * thúc 08/2026 và "hiện tại" của app luôn sau mốc đó) cho 1 host, theo đúng experience của host. */
function computeLiveMonth(state, hostId, monthKey) {
  const expIds = new Set(state.experiences.filter((e) => e.hostId === hostId).map((e) => e.id));
  const items = state.bookingItems.filter((bi) => expIds.has(bi.experienceId) && bookingItemMonthKey(bi) === monthKey);
  const completed = items.filter((bi) => bi.status === 'completed');
  const accepted = items.filter((bi) => ['accepted', 'completed'].includes(bi.status));
  const cancelled = items.filter((bi) => bi.status === 'cancelled');
  const grossRevenue = accepted.reduce((s, bi) => s + bi.subtotal, 0);
  const platformFee = Math.round(grossRevenue * 0.1);
  return {
    month: monthKey,
    listingId: null,
    providerId: hostId,
    participants: completed.reduce((s, bi) => s + bi.quantity, 0),
    completedBookings: new Set(completed.map((bi) => bi.bookingId)).size,
    cancelledBookings: cancelled.length,
    grossRevenue,
    refunds: 0,
    platformFee,
    providerIncome: grossRevenue - platformFee,
    dataStatus: items.length ? 'live_demo' : 'no_data',
    source: 'live_demo',
  };
}

/** 12 tháng lịch sử (seed) + 1 tháng hiện tại (live, tính từ booking thật) cho 1 host — nguồn DUY
 * NHẤT cho mọi biểu đồ/KPI theo tháng của Host, dùng chung giữa Tổng quan và Báo cáo. */
export function getHostMonths(state, hostId) {
  const historical = historicalMetrics.filter((r) => r.providerId === hostId);
  const nowKey = currentMonthKey();
  const live = computeLiveMonth(state, hostId, nowKey);
  return [...historical, live].map((r) => ({ ...r, label: monthLabel(r.month) }));
}

function pctChange(curr, prev) {
  if (!prev) return null;
  return ((curr - prev) / prev) * 100;
}

/** KPI tháng hiện tại của Host + % thay đổi so với tháng trước — tính trực tiếp từ getHostMonths(). */
export function getHostKpis(state, hostId) {
  const months = getHostMonths(state, hostId);
  const curr = months[months.length - 1];
  const prev = months[months.length - 2];
  const host = state.hosts.find((h) => h.id === hostId);
  const listingIds = host ? [host.destinationId] : [];
  const ratingStats = getRatingStatsForListingIds(state, listingIds);
  const recommend = getRecommendRate(state, listingIds);
  const expIds = new Set(state.experiences.filter((e) => e.hostId === hostId).map((e) => e.id));
  const pendingBookings = state.bookingItems.filter((bi) => expIds.has(bi.experienceId) && bi.status === 'pending').length;
  const cancelDenominator = curr.completedBookings + curr.cancelledBookings;
  const cancellationRate = cancelDenominator ? (curr.cancelledBookings / cancelDenominator) * 100 : null;
  return {
    participants: curr.participants,
    participantsChangePct: pctChange(curr.participants, prev?.participants),
    completedBookings: curr.completedBookings,
    completedBookingsChangePct: pctChange(curr.completedBookings, prev?.completedBookings),
    grossRevenue: curr.grossRevenue,
    grossRevenueChangePct: pctChange(curr.grossRevenue, prev?.grossRevenue),
    providerIncome: curr.providerIncome,
    providerIncomeChangePct: pctChange(curr.providerIncome, prev?.providerIncome),
    avgRating: ratingStats.averageRating,
    reviewCount: ratingStats.reviewCount,
    recommendRate: recommend.rate,
    recommendSample: recommend.total,
    cancellationRate,
    pendingBookings,
    currentMonthLabel: curr.label,
  };
}

/** Lượt ghé 12 tháng (+ tháng hiện tại luôn 0 vì chưa có cơ chế tự động ghi "lượt ghé" thật cho
 * site miễn phí trong bản demo) cho 1 listing site/cluster miễn phí. */
export function getListingVisitMonths(listingId) {
  return visitMetrics.filter((r) => r.listingId === listingId).map((r) => ({ ...r, label: monthLabel(r.month) }));
}

/** Donut "Những điều khách yêu thích" — top 5 tag + phần "Khác". */
export function getTopTagShares(state, listingIds, topN = 5) {
  const { counts, totalSelections } = getTagShareForListings(state, listingIds);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN);
  const restCount = sorted.slice(topN).reduce((s, [, c]) => s + c, 0);
  const items = top.map(([tag, count]) => ({ tag, count, share: totalSelections ? count / totalSelections : 0 }));
  if (restCount > 0) items.push({ tag: 'Khác', count: restCount, share: totalSelections ? restCount / totalSelections : 0 });
  return { items, totalSelections };
}

/** Gợi ý cải thiện cho Host, có căn cứ số liệu cụ thể — không tự bịa tỷ lệ không có trong dữ liệu. */
export function generateHostRecommendations(state, hostId) {
  const host = state.hosts.find((h) => h.id === hostId);
  if (!host) return [];
  const listingIds = [host.destinationId];
  const reviews = getDisplayReviewsForListingIds(state, listingIds);
  const { items: tagItems } = getTopTagShares(state, listingIds, 5);
  const recs = [];

  if (tagItems.length) {
    const top = tagItems[0];
    recs.push({
      id: `rec-strength-${hostId}`,
      kind: 'strength',
      title: `Điểm mạnh: "${top.tag}"`,
      basis: `${top.count}/${tagItems.reduce((s, t) => s + t.count, 0)} lượt chọn tag gần đây nhắc đến "${top.tag}".`,
      action: 'Có thể nhấn mạnh điểm này trong mô tả trải nghiệm hoặc ảnh đại diện.',
    });
    const weakest = [...tagItems].filter((t) => t.tag !== 'Khác').sort((a, b) => a.count - b.count)[0];
    if (weakest && weakest.tag !== top.tag) {
      recs.push({
        id: `rec-opportunity-${hostId}`,
        kind: 'opportunity',
        title: `Cơ hội cải thiện: "${weakest.tag}"`,
        basis: `Chỉ ${weakest.count}/${tagItems.reduce((s, t) => s + t.count, 0)} lượt chọn tag nhắc đến "${weakest.tag}" — thấp nhất trong các tag được chọn.`,
        action: 'Cân nhắc xem đây có phải điểm cần đầu tư thêm không.',
      });
    }
  }

  const lowRated = reviews.filter((r) => r.overallRating <= 3);
  if (lowRated.length) {
    recs.push({
      id: `rec-lowrated-${hostId}`,
      kind: 'issue',
      title: `${lowRated.length} phản hồi từ 3 sao trở xuống cần xem lại`,
      basis: lowRated.slice(0, 2).map((r) => `"${r.comment}"`).join(' · '),
      action: 'Xem chi tiết trong danh sách phản hồi gần đây bên dưới.',
    });
  }

  const keywordMap = { 'nóng': 'nhu cầu bóng mát/nước uống', 'thiếu nước': 'nhu cầu nước uống lạnh', 'khó tìm': 'chỉ dẫn đường đi', 'thiếu audio': 'thuyết minh/audio guide', 'audio guide': 'thuyết minh/audio guide' };
  const keywordHits = {};
  reviews.forEach((r) => {
    const text = (r.comment || '').toLowerCase();
    Object.keys(keywordMap).forEach((kw) => { if (text.includes(kw)) { keywordHits[kw] = (keywordHits[kw] || 0) + 1; } });
  });
  Object.entries(keywordHits).forEach(([kw, count]) => {
    recs.push({
      id: `rec-keyword-${hostId}-${kw}`,
      kind: 'opportunity',
      title: `Gợi ý liên quan: ${keywordMap[kw]}`,
      basis: `${count}/${reviews.length} phản hồi gần đây nhắc đến "${kw}".`,
      action: `Cân nhắc bổ sung ${keywordMap[kw]}.`,
    });
  });

  return recs;
}

export const MetricsService = {
  monthLabel, currentMonthKey, getHostMonths, getHostKpis, getListingVisitMonths, getTopTagShares, generateHostRecommendations,
};
