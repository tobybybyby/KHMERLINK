// Adapter giữ chỗ/booking — mô phỏng trên state cục bộ (không có backend thật).
// Triển khai thật cần backend khoá chỗ nguyên tử để tránh overbooking giữa nhiều thiết bị/tab.
import { getState, persist, addPassportStamp, addPoints, addNotification, scheduleBookingReminders, notifyDataChanged, logCustomerBehaviourEvent } from '../storage.js';
import { uid, generateBookingCode } from '../utils.js';
import { t, formatDate, formatTime } from './i18nService.js';

/** Giờ khởi hành thật = giờ điểm dừng sớm nhất có slot trong booking (không phải giờ tạo booking).
 * Dùng cho cả nhắc lịch (24h/2h trước) lẫn chính sách hoàn tiền (computeRefundAmount) — cùng một
 * cách tính để không lệch giữa 2 chỗ dùng. Trả về null nếu không có item nào có slot hợp lệ. */
function computeEarliestItemDateTime(items) {
  let earliest = null;
  items.forEach((bi) => {
    const { slot } = findExperienceAndSlot(bi.experienceId, bi.slotId);
    if (!slot) return;
    const slotDay = new Date(slot.date);
    const [h, m] = slot.startTime.split(':').map(Number);
    const dt = new Date(slotDay.getFullYear(), slotDay.getMonth(), slotDay.getDate(), h, m);
    if (!earliest || dt < earliest) earliest = dt;
  });
  return earliest;
}

export const HOLD_TTL_MINUTES = 15;

function isActiveStatus(status) {
  return status === 'pending' || status === 'accepted' || status === 'completed';
}

export function findExperienceAndSlot(experienceId, slotId) {
  const s = getState();
  const exp = s.experiences.find((e) => e.id === experienceId);
  if (!exp) return { exp: null, slot: null };
  const slot = exp.slots.find((sl) => sl.id === slotId);
  return { exp, slot: slot || null };
}

export function getSlotRemaining(slot, excludeBookingItemId = null) {
  if (!slot) return 0;
  if (slot.isOpen === false) return 0;
  const s = getState();
  const reserved = s.bookingItems
    .filter((bi) => bi.slotId === slot.id && bi.id !== excludeBookingItemId && isActiveStatus(bi.status))
    .reduce((sum, bi) => sum + bi.quantity, 0);
  return Math.max(0, slot.capacity - slot.booked - reserved);
}

export function isHoldExpired(booking) {
  return booking.status === 'pending_host' && new Date(booking.holdExpiresAt).getTime() < Date.now();
}

/** Trả chỗ cho các giữ-chỗ đã hết hạn (gọi mỗi khi đọc dữ liệu booking để "lười" giải phóng). */
export function reapExpiredHolds() {
  const s = getState();
  let changed = false;
  s.bookings.forEach((b) => {
    if (isHoldExpired(b)) {
      b.status = 'expired';
      b.statusHistory.push({ status: 'expired', at: new Date().toISOString(), note: t('common.bookingFlow.holdExpiredReleased') });
      s.bookingItems
        .filter((bi) => bi.bookingId === b.id && bi.status === 'pending')
        .forEach((bi) => {
          bi.status = 'cancelled';
          bi.statusHistory.push({ status: 'cancelled', at: new Date().toISOString(), note: t('common.bookingFlow.holdExpired') });
        });
      changed = true;
    }
  });
  if (changed) persist();
}

/**
 * items: [{ experienceId, slotId, quantity }]
 * Kiểm tra sức chứa cho toàn bộ item trước khi tạo — chặn vượt sức chứa.
 */
export function createBooking({ itineraryId = null, partySize, items }) {
  reapExpiredHolds();
  const s = getState();

  for (const item of items) {
    const { exp, slot } = findExperienceAndSlot(item.experienceId, item.slotId);
    if (!exp || !slot) return { ok: false, reason: t('common.bookingFlow.slotNotFound') };
    const remaining = getSlotRemaining(slot);
    if (item.quantity > remaining) {
      return { ok: false, reason: t('common.bookingFlow.notEnoughSlots', { title: exp.title, start: slot.startTime, end: slot.endTime, remaining, requested: item.quantity }) };
    }
  }

  const now = new Date();
  const holdExpiresAt = new Date(now.getTime() + HOLD_TTL_MINUTES * 60000).toISOString();
  const bookingId = uid('booking');
  let totalAmount = 0;

  const bookingItems = items.map((item) => {
    const { exp } = findExperienceAndSlot(item.experienceId, item.slotId);
    const subtotal = exp.price * item.quantity;
    totalAmount += subtotal;
    return {
      id: uid('bi'),
      bookingId,
      experienceId: item.experienceId,
      destinationId: exp.destinationId,
      slotId: item.slotId,
      title: exp.title,
      quantity: item.quantity,
      unitPrice: exp.price,
      subtotal,
      status: 'pending',
      hostNote: '',
      statusHistory: [{ status: 'pending', at: now.toISOString() }],
    };
  });

  const booking = {
    id: bookingId,
    code: generateBookingCode(),
    itineraryId,
    partySize,
    createdAt: now.toISOString(),
    status: 'pending_host',
    paymentStatus: 'unpaid',
    payoutStatus: 'not_applicable',
    holdExpiresAt,
    totalAmount,
    depositAmount: Math.round((totalAmount * 0.3) / 1000) * 1000,
    statusHistory: [{ status: 'pending_host', at: now.toISOString() }],
  };

  s.bookings.push(booking);
  s.bookingItems.push(...bookingItems);
  persist();

  // Thông báo + nhắc lịch (PHASE "Hoàn thiện hành trình" mục 6-7) — đặt ở lớp dữ liệu (đúng yêu
  // cầu "triển khai event tại lớp dữ liệu thay vì gọi rải rác trong từng component") thay vì gọi
  // từ booking.js (UI). startAt tính từ điểm dừng sớm nhất có slot thật — không bịa giờ khi thiếu.
  const startAt = computeEarliestItemDateTime(bookingItems);
  addNotification({
    type: 'booking_created',
    title: t('common.bookingFlow.createdTitle'),
    message: startAt
      ? t('common.bookingFlow.createdWithTime', { time: formatTime(startAt), date: formatDate(startAt), code: booking.code })
      : t('common.bookingFlow.createdPending', { code: booking.code }),
    bookingId: booking.id,
    itineraryId,
  });
  scheduleBookingReminders(booking, itineraryId, startAt);
  notifyDataChanged('bookings', 'created');
  logCustomerBehaviourEvent('booking_created', { bookingId: booking.id, destinationIds: bookingItems.map((bi) => bi.destinationId), partySize });

  return { ok: true, booking, bookingItems };
}

/**
 * Hộ chấp nhận/từ chối từng mục trong booking (gọi từ Studio → Lịch & Booking).
 * decisions: [{ bookingItemId, decision: 'accept'|'reject', reason? }]
 */
export function respondToBooking(bookingId, decisions) {
  const s = getState();
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false, reason: t('common.bookingFlow.bookingNotFound') };
  const now = new Date().toISOString();
  const items = s.bookingItems.filter((bi) => bi.bookingId === bookingId);
  // Chặn theo từng mục còn "pending" thay vì trạng thái tổng của booking — combo nhiều hộ
  // thường phản hồi lệch thời điểm nhau; sau lần phản hồi đầu tiên booking chuyển
  // "partially_confirmed" nhưng các mục còn lại vẫn phải xử lý được tiếp.
  if (!items.some((bi) => bi.status === 'pending')) {
    return { ok: false, reason: t('common.bookingFlow.noPendingItems') };
  }

  decisions.forEach(({ bookingItemId, decision, reason }) => {
    const bi = items.find((x) => x.id === bookingItemId);
    if (!bi || bi.status !== 'pending') return;
    if (decision === 'accept') {
      bi.status = 'accepted';
      bi.statusHistory.push({ status: 'accepted', at: now });
    } else {
      bi.status = 'rejected';
      bi.hostNote = reason || t('common.bookingFlow.hostRejectedNote');
      bi.statusHistory.push({ status: 'rejected', at: now, note: bi.hostNote });
    }
  });

  const allAccepted = items.every((bi) => bi.status === 'accepted');
  const allRejected = items.every((bi) => bi.status === 'rejected');
  booking.status = allRejected ? 'rejected' : allAccepted ? 'confirmed' : 'partially_confirmed';
  booking.statusHistory.push({ status: booking.status, at: now });

  // Điều chỉnh tổng tiền theo các mục còn hiệu lực (mục bị từ chối không tính tiền).
  const activeItems = items.filter((bi) => bi.status === 'accepted');
  booking.totalAmount = activeItems.reduce((sum, bi) => sum + bi.subtotal, 0);
  booking.depositAmount = Math.round((booking.totalAmount * 0.3) / 1000) * 1000;

  persist();

  // Thông báo cho khách theo đúng trạng thái tổng vừa tính — KHÔNG nói "đã xác nhận toàn bộ" khi
  // vẫn còn item pending hoặc chỉ partially_confirmed (PHASE mục 6).
  const statusMessage = {
    confirmed: t('common.bookingFlow.confirmedAllMsg', { code: booking.code }),
    partially_confirmed: t('common.bookingFlow.confirmedPartialMsg', { code: booking.code }),
    rejected: t('common.bookingFlow.rejectedMsg', { code: booking.code }),
  }[booking.status];
  if (statusMessage) {
    addNotification({
      type: booking.status === 'rejected' ? 'booking_rejected' : 'booking_confirmed',
      title: booking.status === 'rejected' ? t('common.bookingFlow.rejectedTitle') : (booking.status === 'confirmed' ? t('common.bookingFlow.confirmedAllTitle') : t('common.bookingFlow.confirmedPartialTitle')),
      message: statusMessage,
      bookingId: booking.id,
      itineraryId: booking.itineraryId,
    });
  }
  notifyDataChanged('bookings', 'updated');

  return { ok: true, booking, items };
}

/**
 * Hộ xác nhận một mục đã hoàn thành (check-in) — gọi từ Studio → Lịch & Booking.
 * Tách biệt với "Đã ghé thăm" (khách tự đánh dấu bên Trail): chỉ hành động này mới cộng
 * điểm thưởng, tạo dấu Passport "đã xác nhận" và chuyển khoản hộ nhận sang trạng thái "đang giữ".
 */
export function completeBookingItem(bookingItemId) {
  const s = getState();
  const bi = s.bookingItems.find((x) => x.id === bookingItemId);
  if (!bi) return { ok: false, reason: t('common.bookingFlow.bookingItemNotFound') };
  if (bi.status !== 'accepted') return { ok: false, reason: t('common.bookingFlow.onlyAcceptedCanComplete') };
  const now = new Date().toISOString();
  bi.status = 'completed';
  bi.statusHistory.push({ status: 'completed', at: now, note: t('common.bookingFlow.hostCompletedNote') });

  const booking = s.bookings.find((b) => b.id === bi.bookingId);
  const otherActive = s.bookingItems.some((x) => x.bookingId === bi.bookingId && x.id !== bi.id && x.status !== 'completed' && x.status !== 'cancelled' && x.status !== 'rejected');
  if (booking && !otherActive) {
    booking.status = 'completed';
    if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'deposit_paid') booking.payoutStatus = 'holding';
  }

  addPassportStamp({ destinationId: bi.destinationId, type: 'visited-confirmed', bookingItemId: bi.id });
  const firstTimeWithHost = !s.pointsLedger.some((p) => p.reason.startsWith(`host-${bi.destinationId}`));
  addPoints(10, `complete-${bi.id}`, bi.bookingId);
  if (firstTimeWithHost) addPoints(5, `host-${bi.destinationId}-${bi.id}`, bi.bookingId);

  persist();
  notifyDataChanged('bookingItems', 'updated');
  return { ok: true, bookingItem: bi, booking };
}

/** Giải ngân khoản đang giữ của một booking (mô phỏng — thật cần chờ mốc thời gian + không có sự cố mở). */
export function releasePayout(bookingId) {
  const s = getState();
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false };
  if (booking.payoutStatus !== 'holding') return { ok: false, reason: t('common.bookingFlow.payoutNotHolding') };
  const hasOpenTicket = s.supportTickets.some((tk) => tk.bookingId === bookingId && tk.status !== 'da-xu-ly');
  if (hasOpenTicket) return { ok: false, reason: t('common.bookingFlow.openTicketBlocksPayout') };
  booking.payoutStatus = 'released';
  booking.statusHistory.push({ status: 'payout_released', at: new Date().toISOString(), note: t('common.bookingFlow.payoutReleasedNote') });
  persist();
  return { ok: true };
}

export function computeRefundAmount(booking) {
  const s = getState();
  const items = s.bookingItems.filter((bi) => bi.bookingId === booking.id && bi.status === 'accepted');
  if (!items.length) return { refundAmount: booking.paymentStatus === 'unpaid' ? 0 : booking.totalAmount, policy: t('common.bookingFlow.refundNoAcceptedItems') };
  let earliest = null;
  items.forEach((bi) => {
    const { slot } = findExperienceAndSlot(bi.experienceId, bi.slotId);
    if (slot) {
      // Dùng getter theo giờ địa phương (không cắt chuỗi ISO — slot.date lưu dạng UTC nên
      // cắt chuỗi có thể lệch ngày ở múi giờ Việt Nam) để ghép đúng ngày + giờ hẹn địa phương.
      const slotDay = new Date(slot.date);
      const [h, m] = slot.startTime.split(':').map(Number);
      const dt = new Date(slotDay.getFullYear(), slotDay.getMonth(), slotDay.getDate(), h, m);
      if (!earliest || dt < earliest) earliest = dt;
    }
  });
  const paid = booking.paymentStatus === 'paid' ? booking.totalAmount : booking.paymentStatus === 'deposit_paid' ? booking.depositAmount : 0;
  if (!earliest || paid === 0) return { refundAmount: 0, policy: t('common.bookingFlow.refundNotPaid') };
  const hoursUntil = (earliest.getTime() - Date.now()) / 3600000;
  let pct = 0;
  let policy = '';
  if (hoursUntil >= 24) { pct = 1; policy = t('common.bookingFlow.refundFull'); } else if (hoursUntil >= 6) { pct = 0.5; policy = t('common.bookingFlow.refundHalf'); } else { pct = 0; policy = t('common.bookingFlow.refundNone'); }
  return { refundAmount: Math.round((paid * pct) / 1000) * 1000, policy };
}

export function cancelBooking(bookingId) {
  const s = getState();
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false };
  if (booking.status === 'cancelled' || booking.status === 'completed') return { ok: false, reason: t('common.bookingFlow.cannotCancelFinal') };
  const { refundAmount, policy } = computeRefundAmount(booking);
  const now = new Date().toISOString();
  booking.status = 'cancelled';
  booking.statusHistory.push({ status: 'cancelled', at: now, note: policy });
  s.bookingItems.filter((bi) => bi.bookingId === bookingId && bi.status !== 'rejected').forEach((bi) => {
    bi.status = 'cancelled';
    bi.statusHistory.push({ status: 'cancelled', at: now });
  });
  if (refundAmount > 0) {
    s.payments.push({ id: uid('pay'), bookingId, amount: refundAmount, method: 'demo_refund', kind: 'refund', status: 'success', createdAt: now });
    booking.paymentStatus = 'refunded';
  }
  persist();
  notifyDataChanged('bookings', 'cancelled');
  logCustomerBehaviourEvent('booking_cancelled', { bookingId });
  return { ok: true, refundAmount, policy };
}

export const BookingService = {
  createBooking,
  respondToBooking,
  completeBookingItem,
  releasePayout,
  cancelBooking,
  computeRefundAmount,
  getSlotRemaining,
  findExperienceAndSlot,
  reapExpiredHolds,
  isHoldExpired,
};
