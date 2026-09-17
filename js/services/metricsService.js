// Số liệu tổng hợp dùng CHUNG cho Studio (Host) và Cổng dữ liệu quản lý (Management) — đọc từ
// historicalMetrics/visitMetrics (data/pilot-seed-data.js, 12 tháng 09/2025–08/2026, cố định) +
// booking/review THẬT phát sinh trong phiên demo (không nằm trong 12 tháng lịch sử nên không thể
// đếm trùng — tháng hiện tại của app luôn là 09/2026, sau khi dữ liệu lịch sử kết thúc).
import { historicalMetrics, visitMetrics, MONTHS_12, TIMEZONE, DEMO_REFERENCE_DATE } from '../../data/pilot-seed-data.js';
import { getRatingStatsForListingIds, getTagShareForListings, getRecommendRate, getDisplayReviewsForListingIds } from './reviewsService.js';
import { getProviderMetrics, getCurrentPeriod } from './hostBookingService.js';
import { t, localize, registerTranslations, getCurrentLanguage } from './i18nService.js';
import { localizeTag } from './tagCatalog.js';

registerTranslations('host', {
  recommendations: {
    strengthTitle: 'Điểm mạnh: "{tag}"',
    strengthBasis: '{count}/{total} lượt chọn tag gần đây nhắc đến "{tag}".',
    strengthAction: 'Có thể nhấn mạnh điểm này trong mô tả trải nghiệm hoặc ảnh đại diện.',
    opportunityTitle: 'Cơ hội cải thiện: "{tag}"',
    opportunityBasis: 'Chỉ {count}/{total} lượt chọn tag nhắc đến "{tag}" — thấp nhất trong các tag được chọn.',
    opportunityAction: 'Cân nhắc xem đây có phải điểm cần đầu tư thêm không.',
    lowRatedTitle: '{count} phản hồi từ 3 sao trở xuống cần xem lại',
    lowRatedAction: 'Xem chi tiết trong danh sách phản hồi gần đây bên dưới.',
    keywordTitle: 'Gợi ý liên quan: {label}',
    keywordBasis: '{count}/{total} phản hồi gần đây nhắc đến "{keyword}".',
    keywordAction: 'Cân nhắc bổ sung {label}.',
    keyword: {
      shadeWater: 'nhu cầu bóng mát/nước uống',
      coldWater: 'nhu cầu nước uống lạnh',
      directions: 'chỉ dẫn đường đi',
      audioGuide: 'thuyết minh/audio guide',
    },
  },
}, {
  recommendations: {
    strengthTitle: 'Strength: "{tag}"',
    strengthBasis: '{count}/{total} recent tag selections mention "{tag}".',
    strengthAction: 'Consider highlighting this in the experience description or cover photo.',
    opportunityTitle: 'Opportunity to improve: "{tag}"',
    opportunityBasis: 'Only {count}/{total} tag selections mention "{tag}" — the lowest among selected tags.',
    opportunityAction: 'Consider whether this is worth investing more in.',
    lowRatedTitle: '{count} reviews rated 3 stars or below need a look',
    lowRatedAction: 'See details in the recent feedback list below.',
    keywordTitle: 'Related suggestion: {label}',
    keywordBasis: '{count}/{total} recent reviews mention "{keyword}".',
    keywordAction: 'Consider adding {label}.',
    keyword: {
      shadeWater: 'shade/drinking water availability',
      coldWater: 'cold drinking water availability',
      directions: 'wayfinding/directions',
      audioGuide: 'narration/audio guide',
    },
  },
});

export function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-');
  return getCurrentLanguage() === 'vi' ? `T${Number(m)}/${y}` : `${Number(m)}/${y}`;
}

// Mốc "hiện tại" dùng DEMO_REFERENCE_DATE cố định (không phải `new Date()` thật) — khớp với
// hostBookingService.getCurrentPeriod(), để "tháng này" luôn là CÙNG một tháng trên mọi trang
// (PHASE 15/09/2026: trước đó currentMonthKey() dùng ngày máy thật, có thể lệch khỏi tháng có
// dữ liệu booking demo nếu mở app sau 09/2026).
export function currentMonthKey(now = new Date(DEMO_REFERENCE_DATE)) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit' }).formatToParts(now);
  const map = {};
  parts.forEach((p) => { map[p.type] = p.value; });
  return `${map.year}-${map.month}`;
}

/** Tháng "hiện tại" cho 1 host — nay lấy TRỰC TIẾP từ getProviderMetrics() (hostBookingService,
 * nguồn duy nhất dùng chung với Tổng quan/Lịch & Booking) thay vì tự tính riêng từ bookingItems,
 * để chart 12 tháng ở Báo cáo không lệch số với 2 trang kia (PHASE 15/09/2026). */
function computeLiveMonth(state, hostId, monthKey) {
  const pm = getProviderMetrics(state, hostId, getCurrentPeriod());
  return {
    month: monthKey,
    listingId: null,
    providerId: hostId,
    participants: pm.totalGuests,
    completedBookings: pm.completedCount,
    cancelledBookings: pm.cancelledCount,
    grossRevenue: pm.grossExpected,
    refunds: 0,
    platformFee: pm.grossExpected - pm.providerExpectedIncome,
    providerIncome: pm.providerExpectedIncome,
    dataStatus: pm.totalBookings ? 'live_demo' : 'no_data',
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
  // tag: '__other__' — sentinel KHÔNG phải canonical tag ID, nơi hiển thị (studio/reports.js) tự
  // dịch nhãn "Khác/Other" qua t(), không tra tagCatalog cho sentinel này.
  if (restCount > 0) items.push({ tag: '__other__', count: restCount, share: totalSelections ? restCount / totalSelections : 0 });
  return { items, totalSelections };
}

// Bảng từ khoá dò trong BÌNH LUẬN THẬT của khách (luôn tiếng Việt, không tự dịch nội dung người
// dùng nhập — xem PHẦN 9 yêu cầu i18n) — nên khớp theo từ khoá tiếng Việt bất kể ngôn ngữ giao
// diện đang chọn là gì. Chỉ NHÃN hiển thị (labelKey) mới đổi theo ngôn ngữ hiện tại.
const KEYWORD_MAP = {
  'nóng': 'shadeWater',
  'thiếu nước': 'coldWater',
  'khó tìm': 'directions',
  'thiếu audio': 'audioGuide',
  'audio guide': 'audioGuide',
};

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
    const topLabel = top.tag === '__other__' ? t('host.reports.otherTag') : localizeTag(top.tag);
    recs.push({
      id: `rec-strength-${hostId}`,
      kind: 'strength',
      title: t('host.recommendations.strengthTitle', { tag: topLabel }),
      basis: t('host.recommendations.strengthBasis', { count: top.count, total: tagItems.reduce((s, tg) => s + tg.count, 0), tag: topLabel }),
      action: t('host.recommendations.strengthAction'),
    });
    const weakest = [...tagItems].filter((tg) => tg.tag !== '__other__').sort((a, b) => a.count - b.count)[0];
    if (weakest && weakest.tag !== top.tag) {
      const weakestLabel = localizeTag(weakest.tag);
      recs.push({
        id: `rec-opportunity-${hostId}`,
        kind: 'opportunity',
        title: t('host.recommendations.opportunityTitle', { tag: weakestLabel }),
        basis: t('host.recommendations.opportunityBasis', { count: weakest.count, total: tagItems.reduce((s, tg) => s + tg.count, 0), tag: weakestLabel }),
        action: t('host.recommendations.opportunityAction'),
      });
    }
  }

  const lowRated = reviews.filter((r) => r.overallRating <= 3);
  if (lowRated.length) {
    recs.push({
      id: `rec-lowrated-${hostId}`,
      kind: 'issue',
      title: t('host.recommendations.lowRatedTitle', { count: lowRated.length }),
      basis: lowRated.slice(0, 2).map((r) => `"${localize(r.comment)}"`).join(' · '),
      action: t('host.recommendations.lowRatedAction'),
    });
  }

  const keywordHits = {};
  reviews.forEach((r) => {
    // Dò từ khoá TIẾNG VIỆT trong nội dung gốc — luôn dùng bản .vi (kể cả khi UI đang English) vì
    // đây là bảng từ khoá cố định tiếng Việt, không phải nội dung hiển thị (xem KEYWORD_MAP ở trên).
    const raw = r.comment && typeof r.comment === 'object' ? (r.comment.vi ?? r.comment.en ?? '') : (r.comment || '');
    const text = raw.toLowerCase();
    Object.keys(KEYWORD_MAP).forEach((kw) => { if (text.includes(kw)) { keywordHits[kw] = (keywordHits[kw] || 0) + 1; } });
  });
  Object.entries(keywordHits).forEach(([kw, count]) => {
    const label = t(`host.recommendations.keyword.${KEYWORD_MAP[kw]}`);
    recs.push({
      id: `rec-keyword-${hostId}-${kw}`,
      kind: 'opportunity',
      title: t('host.recommendations.keywordTitle', { label }),
      basis: t('host.recommendations.keywordBasis', { count, total: reviews.length, keyword: kw }),
      action: t('host.recommendations.keywordAction', { label }),
    });
  });

  return recs;
}

export const MetricsService = {
  monthLabel, currentMonthKey, getHostMonths, getHostKpis, getListingVisitMonths, getTopTagShares, generateHostRecommendations,
};
