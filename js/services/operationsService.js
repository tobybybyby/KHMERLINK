// Activity Catalog trung tâm cho 7 listing pilot — đọc từ nguồn trung tâm data/pilot-seed-data.js
// (PHASE "Data Linkage" 15/09/2026, trước đó "Bổ sung dữ liệu mô phỏng liên kết"). Đây là GIẢ ĐỊNH
// cho mục đích trình diễn, không phải giờ/giá vận hành đã xác nhận — trang chi tiết luôn kèm chú
// thích "Thông tin vận hành trong giai đoạn pilot, vui lòng kiểm tra khi đặt lịch."
//
// getOperations() là ĐIỂM ĐỌC DUY NHẤT cho giá/thời lượng/sức chứa/khung giờ/financialMode/
// publicationStatus — Customer (explore/placeDetail), Host (Studio Trải nghiệm), AI gợi ý hành
// trình (aiService) và Cổng quản lý đều gọi qua đây, LUÔN hợp nhất LIVE với phần Host đã chỉnh sửa
// (state.activityCatalogOverrides, xem storage.updateActivityCatalogOverride) — không bao giờ đọc
// activityCatalog "gốc" trực tiếp ở nơi khác, để 1 lần sửa phản ánh đúng khắp Customer/Host/AI.
import { activityCatalog, TIMEZONE } from '../../data/pilot-seed-data.js';
import { getSlotRemaining } from './bookingService.js';
import { formatDateShort } from '../utils.js';
import { getState } from '../storage.js';

const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Hợp nhất catalog gốc + phần Host đã ghi đè — gọi LIVE mỗi lần render (không đóng băng vào
 * state.destinations) để đổi 1 nơi (Studio) thấy ngay ở Customer/AI/Cổng quản lý, kể cả sau khi
 * đồng bộ localStorage giữa các tab (activityCatalogOverrides không phải CONTENT_KEY — xem
 * storage.js). Không throw khi storage chưa init (một số ngữ cảnh gọi sớm) — coi như chưa có override. */
export function getOperations(listingId) {
  const base = activityCatalog[listingId];
  if (!base) return null;
  let override = {};
  try {
    // getState() throw nếu Storage.init() chưa chạy (một vài kịch bản gọi sớm/test) — coi như
    // chưa có override, vẫn trả về bản catalog gốc thay vì lỗi cả trang.
    override = (getState().activityCatalogOverrides || {})[listingId] || {};
  } catch (err) {
    override = {};
  }
  return { ...base, ...override };
}

/** Giờ/phút hiện tại theo múi giờ Asia/Ho_Chi_Minh — không phụ thuộc múi giờ máy chạy trình
 * duyệt/server, dùng Intl để đọc đúng "giờ tường" Việt Nam. */
function getVnNowParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const map = {};
  parts.forEach((p) => { map[p.type] = p.value; });
  const weekdayShort = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
  const hour = Number(map.hour) % 24; // Intl có thể trả "24" cho nửa đêm ở một số runtime
  const minute = Number(map.minute);
  return { dayIndex: weekdayShort, minutesOfDay: hour * 60 + minute };
}

function parseRange(rangeStr) {
  const [start, end] = rangeStr.split('-');
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return { startMin: sh * 60 + sm, endMin: eh * 60 + em };
}

/** Trạng thái mở cửa NGAY LÚC NÀY theo giờ Việt Nam — không viết cố định "Đang mở".
 * status: 'open' | 'closing_soon' | 'closed' | 'by_appointment' | 'unknown'. */
export function computeOpenStatus(listingId, now = new Date()) {
  const ops = getOperations(listingId);
  if (!ops) return { status: 'unknown', label: 'Chưa có thông tin giờ mở cửa' };

  const { dayIndex, minutesOfDay } = getVnNowParts(now);
  const daySpec = ops.openingHours.everyday || ops.openingHours[WEEKDAY_KEYS[dayIndex]];

  if (daySpec === 'closed') return { status: 'closed', label: 'Đóng cửa hôm nay' };
  if (daySpec === 'by_appointment') return { status: 'by_appointment', label: 'Cần đặt trước' };
  if (!Array.isArray(daySpec) || !daySpec.length) return { status: 'unknown', label: 'Chưa có thông tin giờ mở cửa' };

  for (const rangeStr of daySpec) {
    const { startMin, endMin } = parseRange(rangeStr);
    if (minutesOfDay >= startMin && minutesOfDay < endMin) {
      const closingSoon = endMin - minutesOfDay <= 30;
      return closingSoon
        ? { status: 'closing_soon', label: `Sắp đóng cửa (${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')})` }
        : { status: 'open', label: 'Đang mở' };
    }
  }
  return { status: 'closed', label: 'Đóng cửa' };
}

/** "0" -> Miễn phí, số -> "180.000đ/người", null/undefined -> Đang cập nhật. Không dùng khi hoạt
 * động cần đặt trước và chưa có giá xác nhận — nơi gọi tự quyết định hiển thị "Cần đặt trước". */
export function formatPricePerPerson(price) {
  if (price === null || price === undefined) return 'Đang cập nhật';
  if (price === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ/người`;
}

/** Slot còn chỗ gần nhất (từ experience THẬT do host tạo qua Studio, có slot ngày giờ cụ thể) —
 * chỉ áp dụng cho trải nghiệm; site/cluster miễn phí không có khái niệm "slot". Trả về null nếu
 * chưa có slot thật nào sắp tới (đúng với hầu hết listing pilot hiện tại — chưa supplier nào xác
 * nhận nhận khách thật, xem PHASE trước). */
export function getNearestSlotAvailability(state, listingId, now = new Date()) {
  const exps = state.experiences.filter((e) => e.destinationId === listingId);
  const candidates = [];
  exps.forEach((exp) => {
    exp.slots.forEach((slot) => {
      if (!slot.isOpen) return;
      const [h, m] = slot.startTime.split(':').map(Number);
      const dt = new Date(slot.date);
      dt.setHours(h, m, 0, 0);
      if (dt.getTime() < now.getTime()) return;
      const remaining = getSlotRemaining(slot);
      if (remaining <= 0) return;
      candidates.push({ dt, slot, exp, remaining });
    });
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.dt - b.dt);
  const nearest = candidates[0];
  return {
    remaining: nearest.remaining,
    label: `Còn ${nearest.remaining} chỗ lúc ${nearest.slot.startTime}`,
    dateLabel: formatDateShort(nearest.dt),
    slot: nearest.slot,
    exp: nearest.exp,
  };
}

const WEEKDAY_LABEL = { monday: 'Thứ Hai', tuesday: 'Thứ Ba', wednesday: 'Thứ Tư', thursday: 'Thứ Năm', friday: 'Thứ Sáu', saturday: 'Thứ Bảy', sunday: 'Chủ Nhật' };

/** Bảng giờ cả tuần dạng text ngắn gọn — dùng trong accordion "Giờ và phí" (đã thu gọn sẵn nên
 * không gây rối giao diện). */
export function formatWeeklyHoursRows(listingId) {
  const ops = getOperations(listingId);
  if (!ops) return [];
  if (ops.openingHours.everyday) {
    return [{ label: 'Mỗi ngày', value: ops.openingHours.everyday.join(', ') }];
  }
  return Object.keys(WEEKDAY_LABEL).map((key) => {
    const val = ops.openingHours[key];
    let value;
    if (val === 'closed') value = 'Đóng cửa';
    else if (val === 'by_appointment') value = 'Theo lịch hẹn';
    else if (Array.isArray(val)) value = val.join(', ');
    else value = 'Chưa có thông tin';
    return { label: WEEKDAY_LABEL[key], value };
  });
}

export const OperationsService = { getOperations, computeOpenStatus, formatPricePerPerson, getNearestSlotAvailability, formatWeeklyHoursRows };
