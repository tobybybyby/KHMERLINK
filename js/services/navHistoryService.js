// Ngăn xếp "đã ghé qua đâu" cho điều hướng trong app (hash router hiện có, KHÔNG phải hệ thống
// navigation mới) — dùng để trang chi tiết địa điểm (và bất kỳ trang nào khác cần) có thể "Quay
// lại" đúng nơi khách vừa rời đi (Khám phá, Trip Cart, AI suggestion, Hành trình, Passport...)
// thay vì hard-code về 1 trang cố định. Lưu trong sessionStorage nên sống sót qua reload cùng tab
// (đúng yêu cầu "refresh vẫn giữ context"), tự mất khi đóng tab (đúng yêu cầu deep-link không có
// context thì rơi về fallback).
const STACK_KEY = 'vlt_return_stack';
const MAX_DEPTH = 30;

function readStack() {
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return []; // sessionStorage có thể bị chặn (chế độ riêng tư) — coi như không có lịch sử
  }
}

function writeStack(stack) {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_DEPTH)));
  } catch {
    /* bỏ qua nếu sessionStorage bị chặn — back sẽ luôn rơi về fallback, không lỗi */
  }
}

// Trang Khám phá cuộn ở CẢ 2 cấp: window (toolbar/bản đồ trôi lên) VÀ panel danh sách bên trong
// (.explore-panel__body, overflow-y:auto riêng) — ghi/khôi phục cả hai để không mất vị trí đang
// xem trong danh sách khi quay lại. Các trang khác chỉ cuộn ở window nên phần panel luôn là 0,
// vô hại.
function captureScroll() {
  const panel = document.querySelector('.explore-panel__body');
  return { windowY: window.scrollY, panelY: panel ? panel.scrollTop : 0 };
}

function applyScroll(scroll) {
  if (!scroll) return;
  window.scrollTo(0, scroll.windowY || 0);
  const panel = document.querySelector('.explore-panel__body');
  if (panel && scroll.panelY) panel.scrollTop = scroll.panelY;
}

/** Gọi mỗi lần route đổi và KHÔNG phải là một lượt "quay lại" (xem app.js) — ghi nhớ hash/scroll
 * của trang sắp rời đi, kèm gợi ý phần tử để trả focus về khi quay lại đúng trang đó. */
export function recordDeparture(hash, focusHint) {
  if (!hash) return;
  const stack = readStack();
  stack.push({ hash, scroll: captureScroll(), focusHint: focusHint || null });
  writeStack(stack);
}

/** Đỉnh ngăn xếp hiện tại (không xoá) — app.js dùng để nhận biết 1 lượt hashchange có khớp đúng
 * mục tiêu "quay lại" hay không (đúng cho cả nút bấm trong app LẪN nút Back/vuốt back của trình
 * duyệt, vì cả hai đều chỉ đổi location.hash — không cần phân biệt ai gây ra thay đổi). */
export function peekTop() {
  const stack = readStack();
  return stack.length ? stack[stack.length - 1] : null;
}

/** Xác nhận đã dùng xong mục ở đỉnh ngăn xếp (pop thật). */
export function popTop() {
  const stack = readStack();
  const entry = stack.pop();
  writeStack(stack);
  return entry || null;
}

/** Điều hướng "Quay lại" — dùng ở nút đóng/quay lại của trang chi tiết địa điểm (và tương tự).
 * Không tự pop ở đây: app.js sẽ nhận ra hash mới khớp đỉnh ngăn xếp và tự pop/khôi phục scroll +
 * focus sau khi route mới render xong (xem consumeRestoreIfMatch trong app.js). */
export function goBack(fallbackHash) {
  const top = peekTop();
  window.location.hash = (top && top.hash) || fallbackHash;
}

export function hasReturnTarget() {
  return peekTop() !== null;
}

/** Áp lại vị trí cuộn đã lưu (window + panel Khám phá nếu có) — gọi sau khi trang đích render xong. */
export function restoreScroll(scroll) {
  applyScroll(scroll);
}

// Cờ đồng bộ (đặt/đọc trong cùng 1 lượt render, xem app.js) để trang đích biết lượt render này là
// "quay lại" hay "tới mới" — dùng khi trang đó có state tạm cần giữ nguyên thay vì reset (vd màn
// kết quả gợi ý AI ở js/trail/itinerary.js) thay vì luôn tính toán lại khi được mount.
let restoring = false;
export function setRestoring(value) { restoring = value; }
export function isRestoring() { return restoring; }
