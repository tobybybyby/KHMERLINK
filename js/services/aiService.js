// Gợi ý hành trình — thuật toán rule-based minh bạch, có thể kiểm tra được (KHÔNG gọi AI thật).
// Mọi kết quả gắn nhãn "Gợi ý tự động — bản demo".
import { getState } from '../storage.js';
import { haversineKm, deriveCategoryVisual } from '../utils.js';
import { getSlotRemaining } from './bookingService.js';

const AVG_SPEED_KMH = 28;
const DEFAULT_TRAVEL_MIN = 20; // dùng để LẬP LỊCH khi thiếu toạ độ một trong hai đầu — không phải
// số phút đã xác minh; luôn đi kèm known:false để UI hiển thị trung thực "chưa đủ dữ liệu để tối
// ưu tuyến đường", không trình bày như một ước tính chính xác (đúng yêu cầu pilot mục 8).
const BUFFER_MIN = 10;

/** Trả về { min, known } — known:true khi có toạ độ CẢ HAI đầu (ước tính theo đường chim bay,
 * tốc độ trung bình giả định); known:false khi thiếu toạ độ, min chỉ dùng nội bộ để lập lịch. */
export function estimateTravelMin(a, b) {
  if (a && b && a.lat !== null && a.lng !== null && b.lat !== null && b.lng !== null) {
    const km = haversineKm(a.lat, a.lng, b.lat, b.lng);
    return { min: Math.max(10, Math.round((km / AVG_SPEED_KMH) * 60)), known: true };
  }
  return { min: DEFAULT_TRAVEL_MIN, known: false };
}

function parseFirstRange(hoursText) {
  if (!hoursText) return null;
  const m = String(hoursText).match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { startH: Number(m[1]), startM: Number(m[2]), endH: Number(m[3]), endM: Number(m[4]) };
}

export function fitsOpeningHours(dest, arriveMin, departMin) {
  const range = parseFirstRange(dest.openingHours);
  if (!range) return true; // chưa xác minh được giờ mở — không chặn, không suy diễn "đóng cửa"
  const openMin = range.startH * 60 + range.startM;
  const closeMin = range.endH * 60 + range.endM;
  if (closeMin <= openMin) return true; // dạng ghi chú không parse được rõ ràng theo khung 1 ngày
  return arriveMin >= openMin && departMin <= closeMin;
}

function scoreDestination(dest, prefs) {
  let score = dest.rating || 0;
  if (prefs.seedIds.has(dest.id)) score += 3;
  const group = deriveCategoryVisual(dest.category).group;
  const lively = ['Khu vui chơi', 'Làng nghề & cộng đồng', 'Âm nhạc và biểu diễn', 'Ẩm thực'].includes(group);
  if (prefs.priority === 'nao-nhiet' && lively) score += 1.5;
  if (prefs.priority === 'yen-tinh' && !lively) score += 1.5;
  if (prefs.interests.size) {
    const matched = (dest.interests || []).filter((i) => prefs.interests.has(i)).length;
    score += matched * 2;
  }
  if (prefs.startPoint && dest.lat !== null && dest.lng !== null) {
    const km = haversineKm(prefs.startPoint.lat, prefs.startPoint.lng, dest.lat, dest.lng);
    score += Math.max(0, 2 - km / 30);
  }
  return score;
}

export function findBookableExperience(state, dest, arriveDate, partySize) {
  const exps = state.experiences.filter((e) => e.destinationId === dest.id);
  for (const exp of exps) {
    for (const slot of exp.slots) {
      const remaining = getSlotRemaining(slot);
      if (remaining < partySize) continue;
      const slotDate = new Date(slot.date);
      if (slotDate.toDateString() !== arriveDate.toDateString()) continue;
      return { exp, slot };
    }
  }
  return null;
}

/** True nếu chọn dest sẽ trùng lặp với một cụm/điểm-con đã có trong lịch (mục 8: SITE-04 là cụm
 * điều phối, tránh tính cụm và các điểm con của nó là các lượt tham quan riêng biệt). */
function isClusterDuplicate(dest, usedIds, usedDests) {
  if (dest.partOfCluster && usedIds.has(dest.partOfCluster)) return true;
  if (dest.listingType === 'cluster' && dest.clusterChildren) {
    return dest.clusterChildren.some((childId) => usedIds.has(childId));
  }
  return usedDests.some((u) => (u.partOfCluster && u.partOfCluster === dest.id) || (dest.partOfCluster && dest.partOfCluster === u.id));
}

function buildOption({ id, name, reason, candidates, prefs, maxStops, dwellBiasMin }) {
  const state = getState();
  const stops = [];
  let cursorMin = prefs.startHour * 60 + prefs.startMin;
  const budgetEndMin = cursorMin + prefs.availableHours * 60;
  let totalCost = 0;
  let prevDest = prefs.startPoint;
  const usedIds = new Set();
  const usedDests = [];

  for (const dest of candidates) {
    if (stops.length >= maxStops) break;
    if (usedIds.has(dest.id)) continue;
    if (isClusterDuplicate(dest, usedIds, usedDests)) continue;

    const travel = estimateTravelMin(prevDest, dest);
    const arriveMin = cursorMin + travel.min;
    const dwell = (dest.suggestedDurationMin || 45) + dwellBiasMin;
    const departMin = arriveMin + dwell;
    if (departMin > budgetEndMin) continue;

    const arriveDate = new Date(prefs.date);
    arriveDate.setHours(0, arriveMin, 0, 0);
    if (!fitsOpeningHours(dest, arriveMin, departMin)) continue;

    const booking = findBookableExperience(state, dest, arriveDate, prefs.partySize);
    const isUnconfirmedExperience = !booking && (dest.listingType === 'experience' || dest.listingType === 'multiStopExperience');
    const notes = [];
    if (dest.priceStatus === 'estimated') notes.push('Giá/giờ tại điểm này là ước lượng cho mockup.');
    if (!travel.known) notes.push('Chưa đủ dữ liệu (thiếu toạ độ) để tối ưu thời gian di chuyển đến điểm này — thời gian hiển thị chỉ là ước tính tạm.');
    if (isUnconfirmedExperience) notes.push('Đề xuất — cần xác nhận supplier trước khi có thể đặt/thanh toán.');

    stops.push({
      destinationId: dest.id,
      name: dest.name,
      category: dest.category,
      listingType: dest.listingType || null,
      arriveMin,
      departMin,
      dwellMin: dwell,
      travelMinFromPrev: travel.min,
      travelEstimated: true,
      travelUnknown: !travel.known,
      experienceId: booking ? booking.exp.id : null,
      slotId: booking ? booking.slot.id : null,
      experienceTitle: booking ? booking.exp.title : null,
      experiencePrice: booking ? booking.exp.price : 0,
      note: notes.join(' '),
    });
    if (booking) totalCost += booking.exp.price * prefs.partySize;

    usedIds.add(dest.id);
    usedDests.push(dest);
    cursorMin = departMin;
    prevDest = dest;
  }

  if (stops.length < 2) return null;

  const totalTravelMin = stops.reduce((s, x) => s + x.travelMinFromPrev, 0);
  const totalDurationMin = stops[stops.length - 1].departMin - (prefs.startHour * 60 + prefs.startMin);

  return {
    id,
    name,
    reason,
    stops,
    totalDurationMin,
    totalTravelMin,
    totalCost,
    demo: true,
  };
}

/**
 * prefs: { date(iso), startHour, startMin, availableHours, partySize, startPoint({lat,lng}|null),
 *          interests(Set<string>), pace, priority, seedIds(Set<string>) }
 * Trả về { demo:true, label, itineraries: [...], reason? } — không gọi AI thật.
 */
export function suggestItineraries(prefs) {
  const state = getState();
  if (!state.destinations.length) {
    return { demo: true, label: 'Gợi ý tự động — bản demo', itineraries: [], reason: 'Chưa có dữ liệu địa điểm để tạo hành trình.' };
  }

  let candidates = state.destinations.filter((d) => {
    if (!prefs.interests.size) return true;
    return (d.interests || []).some((i) => prefs.interests.has(i));
  });
  if (candidates.length < 2) candidates = state.destinations.slice();

  const scored = candidates
    .map((d) => ({ d, score: scoreDestination(d, prefs) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d);

  const paceConfig = {
    'gon-nhe': { maxStops: 3, dwellBias: -10 },
    'vua-phai': { maxStops: 4, dwellBias: 0 },
    'cham-va-tim-hieu-sau': { maxStops: 3, dwellBias: 25 },
  }[prefs.pace] || { maxStops: 4, dwellBias: 0 };

  const options = [];

  const opt1 = buildOption({
    id: 'opt-gon-nhe', name: 'Khám phá gọn nhẹ',
    reason: 'Ưu tiên điểm gần và phù hợp sở thích của bạn, thời gian di chuyển tối thiểu.',
    candidates: scored, prefs, maxStops: Math.max(2, paceConfig.maxStops - 1), dwellBiasMin: paceConfig.dwellBias - 10,
  });
  if (opt1) options.push(opt1);

  const cultureFirst = [...scored].sort((a, b) => {
    const ga = deriveCategoryVisual(a.category).group;
    const gb = deriveCategoryVisual(b.category).group;
    const rank = (g) => (
      ['Tôn giáo', 'Bảo tàng / Di tích', 'Chùa Khmer', 'Bảo tàng', 'Địa điểm văn hóa'].includes(g) ? 0
        : ['Làng nghề & cộng đồng', 'Thủ công', 'Ẩm thực', 'Âm nhạc và biểu diễn'].includes(g) ? 1
          : 2
    );
    return rank(ga) - rank(gb);
  });
  const opt2 = buildOption({
    id: 'opt-van-hoa', name: 'Văn hoá & Trải nghiệm',
    reason: 'Ghép theo mạch tìm hiểu văn hoá → thực hành nghề/ẩm thực địa phương.',
    candidates: cultureFirst, prefs, maxStops: paceConfig.maxStops, dwellBiasMin: paceConfig.dwellBias,
  });
  if (opt2 && (!opt1 || opt2.stops.map((s) => s.destinationId).join() !== opt1.stops.map((s) => s.destinationId).join())) options.push(opt2);

  const opt3 = buildOption({
    id: 'opt-chuyen-sau', name: 'Trải nghiệm chuyên sâu',
    reason: 'Ít điểm hơn nhưng ở lại lâu hơn mỗi nơi, ưu tiên điểm đánh giá cao.',
    candidates: scored, prefs, maxStops: Math.max(2, paceConfig.maxStops - 1), dwellBiasMin: paceConfig.dwellBias + 20,
  });
  if (opt3) {
    const key3 = opt3.stops.map((s) => s.destinationId).join();
    if (!options.some((o) => o.stops.map((s) => s.destinationId).join() === key3)) options.push(opt3);
  }

  if (!options.length) {
    return {
      demo: true,
      label: 'Gợi ý tự động — bản demo',
      itineraries: [],
      reason: 'Chưa đủ dữ liệu để tạo hành trình hợp lệ trong khung thời gian này. Thử tăng thời gian sẵn có, giảm bớt sở thích đã chọn, hoặc đổi ngày đi.',
    };
  }

  return { demo: true, label: 'Gợi ý tự động — bản demo', itineraries: options.slice(0, 3) };
}

/**
 * Tính lại giờ đến/đi, thời gian di chuyển và tổng chi phí sau khi thêm/xoá/sắp xếp lại điểm.
 * Giữ nguyên các mục đã đặt chỗ thật (bookingItemId) — chỉ gỡ liên kết trải nghiệm CHƯA đặt
 * nếu giờ mới không còn khớp slot hoặc slot đã hết chỗ.
 */
export function recalcTimeline(itinerary) {
  const state = getState();
  let cursorMin = itinerary.startHour * 60 + itinerary.startMin;
  let prevPoint = itinerary.startPoint;
  let totalTravelMin = 0;
  let totalCost = 0;

  itinerary.stops.forEach((stop) => {
    const dest = state.destinations.find((d) => d.id === stop.destinationId);
    const travel = estimateTravelMin(prevPoint, dest || null);
    const arriveMin = cursorMin + travel.min;
    const dwell = stop.dwellMin ?? (dest && dest.suggestedDurationMin) ?? 45;
    stop.dwellMin = dwell;
    const departMin = arriveMin + dwell;

    stop.travelMinFromPrev = travel.min;
    stop.travelEstimated = true;
    stop.travelUnknown = !travel.known;
    stop.arriveMin = arriveMin;
    stop.departMin = departMin;

    if (stop.experienceId && !stop.bookingItemId) {
      const arriveDate = new Date(itinerary.date);
      arriveDate.setHours(0, arriveMin, 0, 0);
      const exp = state.experiences.find((e) => e.id === stop.experienceId);
      const slot = exp ? exp.slots.find((sl) => sl.id === stop.slotId) : null;
      const stillValid = slot && new Date(slot.date).toDateString() === arriveDate.toDateString() && getSlotRemaining(slot) >= itinerary.partySize;
      if (!stillValid) {
        stop.experienceId = null;
        stop.slotId = null;
        stop.experienceTitle = null;
        stop.experiencePrice = 0;
        stop.note = 'Giờ đã đổi nên khung giờ trải nghiệm trả phí không còn khớp — hãy chọn lại nếu muốn đặt.';
      }
    }
    if (stop.experienceId) totalCost += (stop.experiencePrice || 0) * itinerary.partySize;

    totalTravelMin += travel.min;
    cursorMin = departMin;
    prevPoint = dest || prevPoint;
  });

  itinerary.totalTravelMin = totalTravelMin;
  itinerary.totalCost = totalCost;
  itinerary.totalDurationMin = itinerary.stops.length
    ? itinerary.stops[itinerary.stops.length - 1].departMin - (itinerary.startHour * 60 + itinerary.startMin)
    : 0;
  return itinerary;
}

export const AiService = { suggestItineraries, recalcTimeline, estimateTravelMin, findBookableExperience };
