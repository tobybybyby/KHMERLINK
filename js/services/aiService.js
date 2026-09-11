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
      // Phân loại doanh thu (PHASE "Hoàn thiện hành trình") — bookable/price CHỈ true/>0 khi thật
      // sự khớp được 1 experience+slot còn chỗ (biến `booking` ở trên); revenueType/isCommunityActivity
      // luôn lấy từ phân loại listing (đúng bản chất listing dù chưa có supplier xác nhận).
      revenueType: dest.revenueType || 'free_visit',
      isCommunityActivity: !!dest.isCommunityActivity,
      providerType: dest.providerType || null,
      bookable: !!booking,
      price: booking ? booking.exp.price : 0,
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
  const isBookableTour = stops.some((s) => s.bookable && s.revenueType === 'paid_activity' && s.price > 0);

  return {
    id,
    name,
    reason,
    stops,
    totalDurationMin,
    totalTravelMin,
    totalCost,
    isBookableTour,
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

  // Tour ngắn (~2 giờ trở xuống): ưu tiên xếp hoạt động cộng đồng (hộ dân/nghệ nhân) lên đầu danh
  // sách ứng viên trước, để nếu có hoạt động phù hợp thì được chọn trước — tránh kết quả toàn
  // chùa/điểm miễn phí cho một tour ngắn (PHASE mục 2, quy tắc tour ngắn ~2 giờ).
  const shortTourCandidates = prefs.availableHours <= 2
    ? [...scored].sort((a, b) => (b.isCommunityActivity ? 1 : 0) - (a.isCommunityActivity ? 1 : 0))
    : scored;

  const opt1 = buildOption({
    id: 'opt-gon-nhe', name: 'Khám phá gọn nhẹ',
    reason: 'Ưu tiên điểm gần và phù hợp sở thích của bạn, thời gian di chuyển tối thiểu.',
    candidates: shortTourCandidates, prefs, maxStops: Math.max(2, paceConfig.maxStops - 1), dwellBiasMin: paceConfig.dwellBias - 10,
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
        stop.bookable = false;
        stop.price = 0;
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
  itinerary.isBookableTour = itinerary.stops.some((s) => s.bookable && s.revenueType === 'paid_activity' && s.price > 0);
  return itinerary;
}

/**
 * Xếp lịch từ ĐÚNG các listing khách đã tick trong giỏ hành trình — KHÔNG lọc/loại bớt như
 * buildOption (không skip theo ngân sách thời gian), chỉ tính giờ và gắn cảnh báo khi lệch giờ mở
 * cửa; không tự thêm/bớt điểm nào ngoài selectedIds (PHASE "Hoàn thiện hành trình" mục 5).
 * Thứ tự các điểm: nearest-neighbor tham lam từ điểm xuất phát (nếu có toạ độ), giữ nguyên thứ tự
 * gốc khi không đủ toạ độ để so khoảng cách.
 */
export function buildItineraryFromSelection(state, { selectedIds, date, startHour = 8, startMin = 0, startPoint = null, partySize = 1, dwellBiasMin = 0 }) {
  const destsById = new Map(state.destinations.map((d) => [d.id, d]));
  const selected = selectedIds.map((id) => destsById.get(id)).filter(Boolean);
  if (!selected.length) return null;

  const ordered = [];
  const remaining = [...selected];
  let anchor = startPoint;
  while (remaining.length) {
    let bestIdx = 0;
    if (anchor && anchor.lat !== null && anchor.lat !== undefined && anchor.lng !== null && anchor.lng !== undefined) {
      let bestDist = Infinity;
      remaining.forEach((d, i) => {
        if (d.lat === null || d.lng === null) return;
        const dist = haversineKm(anchor.lat, anchor.lng, d.lat, d.lng);
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      });
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    anchor = next;
  }

  let cursorMin = startHour * 60 + startMin;
  let prevDest = startPoint;
  let totalCost = 0;
  const stops = ordered.map((dest) => {
    const travel = estimateTravelMin(prevDest, dest);
    const arriveMin = cursorMin + travel.min;
    const dwell = (dest.suggestedDurationMin || 45) + dwellBiasMin;
    const departMin = arriveMin + dwell;
    const arriveDate = new Date(date);
    arriveDate.setHours(0, arriveMin, 0, 0);
    const booking = findBookableExperience(state, dest, arriveDate, partySize);
    const fits = fitsOpeningHours(dest, arriveMin, departMin);

    const notes = [];
    if (dest.durationStatus === 'estimated') notes.push('Thời lượng ở điểm này là ước lượng cho mockup, chưa phải đo thực địa.');
    if (!travel.known) notes.push('Chưa đủ dữ liệu (thiếu toạ độ) để tối ưu thời gian di chuyển đến điểm này.');
    if (!fits) notes.push('Giờ đến có thể nằm ngoài giờ mở cửa đã biết — nên xác nhận lại trước khi đến.');
    if (!booking && (dest.listingType === 'experience' || dest.listingType === 'multiStopExperience')) {
      notes.push('Đề xuất — cần xác nhận supplier trước khi có thể đặt/thanh toán.');
    }

    const stop = {
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
      revenueType: dest.revenueType || 'free_visit',
      isCommunityActivity: !!dest.isCommunityActivity,
      providerType: dest.providerType || null,
      bookable: !!booking,
      price: booking ? booking.exp.price : 0,
      note: notes.join(' '),
    };
    if (booking) totalCost += booking.exp.price * partySize;
    cursorMin = departMin;
    prevDest = dest;
    return stop;
  });

  const totalTravelMin = stops.reduce((s, x) => s + x.travelMinFromPrev, 0);
  const totalDurationMin = stops.length ? stops[stops.length - 1].departMin - (startHour * 60 + startMin) : 0;
  const isBookableTour = stops.some((s) => s.bookable && s.revenueType === 'paid_activity' && s.price > 0);

  return { stops, totalDurationMin, totalTravelMin, totalCost, isBookableTour, demo: true };
}

/**
 * Gợi ý tối đa `limit` hoạt động CỘNG ĐỒNG (isCommunityActivity) chưa có trong lựa chọn hiện tại,
 * ưu tiên: khoảng cách tới điểm gần nhất đã chọn → sở thích → còn slot thật (nếu có) → hộ
 * dân/nghệ nhân trước tổ chức văn hoá/vé tham quan. Dùng cho panel "Thêm một trải nghiệm cộng
 * đồng vào hành trình" (PHASE mục 4) khi giỏ chưa có hoạt động trả phí nào hợp lệ.
 */
export function suggestCommunityAdditions(state, { excludeIds = [], anchorPoint = null, interests = new Set(), partySize = 1, date = null, limit = 3 }) {
  const excludeSet = new Set(excludeIds);
  const candidates = state.destinations.filter((d) => !excludeSet.has(d.id) && d.isCommunityActivity);
  const arriveDate = date ? new Date(date) : new Date();

  const scored = candidates.map((d) => {
    let score = 0;
    if (anchorPoint && anchorPoint.lat !== null && anchorPoint.lat !== undefined && d.lat !== null && d.lng !== null) {
      const km = haversineKm(anchorPoint.lat, anchorPoint.lng, d.lat, d.lng);
      score += Math.max(0, 5 - km / 5);
    }
    const matched = (d.interests || []).filter((i) => interests.has(i)).length;
    score += matched * 2;
    const booking = findBookableExperience(state, d, arriveDate, partySize);
    if (booking) score += 3;
    if (d.providerType === 'community_household' || d.providerType === 'artisan') score += 2;
    return { d, score, booking };
  }).sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ d, booking }) => ({
    destinationId: d.id,
    name: d.name,
    category: d.category,
    providerType: d.providerType,
    isCommunityActivity: true,
    bookable: !!booking,
    price: booking ? booking.exp.price : null,
    experienceTitle: booking ? booking.exp.title : null,
  }));
}

export const AiService = {
  suggestItineraries, recalcTimeline, estimateTravelMin, findBookableExperience,
  buildItineraryFromSelection, suggestCommunityAdditions,
};
