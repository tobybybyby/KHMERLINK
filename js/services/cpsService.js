// CPS (điểm chất lượng nội bộ hộ) — công thức minh hoạ, có thể chỉnh trọng số bên dưới.
// Chỉ hộ đó và vai trò vận hành có thẩm quyền được xem (Studio hiện tại chỉ hiển thị cho
// hộ đang chọn — không có trang nào lộ CPS ra phía khách/Trail).
import { getState } from '../storage.js';
import { getSlotRemaining } from './bookingService.js';

export const CPS_WEIGHTS = { response: 0.3, completion: 0.4, rating: 0.3 };
export const NEW_SPOTLIGHT_MIN_BOOKINGS = 3;
export const RECOGNIZED_ELIGIBLE_THRESHOLD = 80;
export const NEEDS_IMPROVEMENT_THRESHOLD = 50;

function hostExperiences(state, hostId) {
  return state.experiences.filter((e) => e.hostId === hostId);
}

function hostDestinationIds(state, hostId) {
  return Array.from(new Set(hostExperiences(state, hostId).map((e) => e.destinationId)));
}

function hostBookingItems(state, hostId) {
  const expIds = new Set(hostExperiences(state, hostId).map((e) => e.id));
  return state.bookingItems.filter((bi) => expIds.has(bi.experienceId));
}

function activeExceptionRanges(state, hostId) {
  return state.cpsExceptions
    .filter((e) => e.hostId === hostId && e.status === 'approved')
    .map((e) => ({ start: new Date(e.startDate), end: new Date(e.endDate) }));
}

function isExcluded(dateIso, ranges) {
  const d = new Date(dateIso);
  return ranges.some((r) => d >= r.start && d <= r.end);
}

/**
 * Tính CPS cho một hộ. Trả về { status, score, components, weights, note }.
 * - status: 'new-spotlight' (chưa đủ booking, KHÔNG coi là chất lượng kém)
 *           | 'needs-improvement' | 'standard' | 'recognized-eligible' (đủ điều kiện đề xuất huy hiệu)
 * - Thiếu dữ liệu ở một thành phần: dùng giá trị trung tính 0.7 (ghi rõ, không suy diễn tốt/xấu).
 */
export function computeCps(hostId) {
  const state = getState();
  const ranges = activeExceptionRanges(state, hostId);
  let items = hostBookingItems(state, hostId);
  const excludedCount = items.filter((bi) => isExcluded(bi.statusHistory[0]?.at, ranges)).length;
  items = items.filter((bi) => !isExcluded(bi.statusHistory[0]?.at, ranges));

  const totalRequests = items.length;

  if (totalRequests < NEW_SPOTLIGHT_MIN_BOOKINGS) {
    return {
      status: 'new-spotlight',
      score: null,
      totalRequests,
      excludedCount,
      components: {},
      note: `Hộ mới trên mạng lưới — cần ít nhất ${NEW_SPOTLIGHT_MIN_BOOKINGS} booking để bắt đầu tính CPS. Chưa có đủ dữ liệu không đồng nghĩa chất lượng kém.`,
    };
  }

  const responded = items.filter((bi) => bi.status !== 'pending');
  const responseRate = responded.length / totalRequests;

  const acceptedOrLater = items.filter((bi) => ['accepted', 'completed'].includes(bi.status));
  const completed = items.filter((bi) => bi.status === 'completed');
  const completionRate = acceptedOrLater.length ? completed.length / acceptedOrLater.length : null;

  const destIds = hostDestinationIds(state, hostId);
  const allReviews = [...state.reviews, ...state.userReviews].filter((r) => destIds.includes(r.destinationId));
  const avgRating = allReviews.length ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : null;

  const NEUTRAL = 0.7;
  const normResponse = responseRate;
  const normCompletion = completionRate === null ? NEUTRAL : completionRate;
  const normRating = avgRating === null ? NEUTRAL : avgRating / 5;

  const score = Math.round(
    100 * (CPS_WEIGHTS.response * normResponse + CPS_WEIGHTS.completion * normCompletion + CPS_WEIGHTS.rating * normRating),
  );

  let status = 'standard';
  if (score >= RECOGNIZED_ELIGIBLE_THRESHOLD) status = 'recognized-eligible';
  else if (score < NEEDS_IMPROVEMENT_THRESHOLD) status = 'needs-improvement';

  return {
    status,
    score,
    totalRequests,
    excludedCount,
    components: {
      responseRate: Math.round(responseRate * 100),
      completionRate: completionRate === null ? null : Math.round(completionRate * 100),
      avgRating: avgRating === null ? null : Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    },
    weights: CPS_WEIGHTS,
    note: completionRate === null || avgRating === null
      ? 'Một số thành phần chưa đủ dữ liệu — tạm dùng giá trị trung tính (0.7) khi tính điểm, không suy diễn tốt/xấu.'
      : null,
  };
}

const STATUS_LABELS = {
  'new-spotlight': 'New Spotlight (hộ mới)',
  'needs-improvement': 'Cần cải thiện (nội bộ)',
  standard: 'Standard (nội bộ)',
  'recognized-eligible': 'Đủ điều kiện đề xuất "Được ghi nhận"',
};

export function cpsStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

/**
 * Gợi ý cải thiện dựa trên dữ liệu thật của hộ — rule-based, mỗi gợi ý có căn cứ cụ thể.
 * Không tự bịa số liệu — nếu không có dữ liệu thì không tạo gợi ý loại đó.
 */
export function generateSuggestions(hostId) {
  const state = getState();
  const exps = hostExperiences(state, hostId);
  const destIds = hostDestinationIds(state, hostId);
  const suggestions = [];

  exps.forEach((exp) => {
    if (!exp.description || exp.description.trim().length < 20) {
      suggestions.push({
        id: `missing-desc-${exp.id}`,
        title: `Bổ sung mô tả cho "${exp.title}"`,
        basis: 'Mô tả hiện tại dưới 20 ký tự — khách khó hình dung trải nghiệm.',
        action: 'Vào "Trải nghiệm" → chỉnh sửa mô tả chi tiết hơn.',
        actionHref: '#/studio/experiences',
      });
    }
    if (!exp.conditions || exp.conditions.trim().length < 5) {
      suggestions.push({
        id: `missing-cond-${exp.id}`,
        title: `Thêm điều kiện phù hợp cho "${exp.title}"`,
        basis: 'Chưa có ghi chú điều kiện tham gia (độ tuổi, thể lực...).',
        action: 'Bổ sung điều kiện để khách chọn đúng nhu cầu.',
        actionHref: '#/studio/experiences',
      });
    }
  });

  destIds.forEach((destId) => {
    const views = state.viewCounts[destId] || 0;
    const bookingCount = state.bookingItems.filter((bi) => bi.destinationId === destId && !['rejected', 'cancelled'].includes(bi.status)).length;
    if (views >= 3 && bookingCount === 0) {
      const dest = state.destinations.find((d) => d.id === destId);
      suggestions.push({
        id: `views-no-booking-${destId}`,
        title: `Nhiều lượt xem nhưng chưa có booking${dest ? ` — ${dest.name}` : ''}`,
        basis: `${views} lượt xem trang chi tiết trong phiên demo này, 0 booking hiệu lực.`,
        action: 'Xem lại giá, ảnh hoặc mô tả có đang rõ ràng, hấp dẫn không.',
        actionHref: `#/trail/place/${destId}`,
      });
    }
  });

  exps.forEach((exp) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcoming = exp.slots.filter((s) => new Date(s.date) >= today);
    if (upcoming.length && upcoming.every((s) => getSlotRemaining(s) <= 1)) {
      suggestions.push({
        id: `low-supply-${exp.id}`,
        title: `Các khung giờ sắp tới của "${exp.title}" gần hết chỗ`,
        basis: `${upcoming.length} khung giờ sắp tới đều còn ≤1 chỗ trống.`,
        action: 'Cân nhắc mở thêm khung giờ mới nếu còn khả năng đón khách.',
        actionHref: '#/studio/experiences',
      });
    }
  });

  return suggestions.map((s) => ({ ...s, decision: state.suggestionDecisions[s.id] || null }));
}

export const CpsService = { computeCps, cpsStatusLabel, generateSuggestions };
