// Adapter giữ chỗ/booking — mô phỏng trên state cục bộ (không có backend thật).
// Triển khai thật cần backend khoá chỗ nguyên tử để tránh overbooking giữa nhiều thiết bị/tab.
import { getState, persist } from '../storage.js';
import { uid, generateBookingCode } from '../utils.js';

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
      b.statusHistory.push({ status: 'expired', at: new Date().toISOString(), note: 'Hết hạn giữ chỗ — chỗ đã được trả lại.' });
      s.bookingItems
        .filter((bi) => bi.bookingId === b.id && bi.status === 'pending')
        .forEach((bi) => {
          bi.status = 'cancelled';
          bi.statusHistory.push({ status: 'cancelled', at: new Date().toISOString(), note: 'Hết hạn giữ chỗ.' });
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
    if (!exp || !slot) return { ok: false, reason: 'Không tìm thấy hoạt động hoặc khung giờ đã chọn.' };
    const remaining = getSlotRemaining(slot);
    if (item.quantity > remaining) {
      return { ok: false, reason: `"${exp.title}" (${slot.startTime}–${slot.endTime}) chỉ còn ${remaining} chỗ, không đủ cho ${item.quantity} khách.` };
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
  return { ok: true, booking, bookingItems };
}

/**
 * Mô phỏng phản hồi của hộ — vì Studio (Phase sau) chưa xây, người dùng demo tạm đóng vai
 * hộ để xác nhận/từ chối từng mục và xem hệ quả (đây LÀ hành vi mô phỏng, ghi nhãn rõ trong UI).
 * decisions: [{ bookingItemId, decision: 'accept'|'reject', reason? }]
 */
export function respondToBooking(bookingId, decisions) {
  const s = getState();
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!booking || booking.status !== 'pending_host') return { ok: false, reason: 'Booking không ở trạng thái chờ xác nhận.' };
  const now = new Date().toISOString();
  const items = s.bookingItems.filter((bi) => bi.bookingId === bookingId);

  decisions.forEach(({ bookingItemId, decision, reason }) => {
    const bi = items.find((x) => x.id === bookingItemId);
    if (!bi || bi.status !== 'pending') return;
    if (decision === 'accept') {
      bi.status = 'accepted';
      bi.statusHistory.push({ status: 'accepted', at: now });
    } else {
      bi.status = 'rejected';
      bi.hostNote = reason || 'Hộ từ chối (demo).';
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
  return { ok: true, booking, items };
}

export function computeRefundAmount(booking) {
  const s = getState();
  const items = s.bookingItems.filter((bi) => bi.bookingId === booking.id && bi.status === 'accepted');
  if (!items.length) return { refundAmount: booking.paymentStatus === 'unpaid' ? 0 : booking.totalAmount, policy: 'Chưa có hoạt động nào được xác nhận.' };
  let earliest = null;
  items.forEach((bi) => {
    const { slot } = findExperienceAndSlot(bi.experienceId, bi.slotId);
    if (slot) {
      const dt = new Date(`${slot.date.slice(0, 10)}T${slot.startTime}:00`);
      if (!earliest || dt < earliest) earliest = dt;
    }
  });
  const paid = booking.paymentStatus === 'paid' ? booking.totalAmount : booking.paymentStatus === 'deposit_paid' ? booking.depositAmount : 0;
  if (!earliest || paid === 0) return { refundAmount: 0, policy: 'Chưa thanh toán, không phát sinh hoàn tiền.' };
  const hoursUntil = (earliest.getTime() - Date.now()) / 3600000;
  let pct = 0;
  let policy = '';
  if (hoursUntil >= 24) { pct = 1; policy = 'Huỷ trước 24 giờ: hoàn 100% (minh hoạ).'; } else if (hoursUntil >= 6) { pct = 0.5; policy = 'Huỷ trong 6–24 giờ: hoàn 50% (minh hoạ).'; } else { pct = 0; policy = 'Huỷ dưới 6 giờ trước giờ hẹn: không hoàn tiền (minh hoạ).'; }
  return { refundAmount: Math.round((paid * pct) / 1000) * 1000, policy };
}

export function cancelBooking(bookingId) {
  const s = getState();
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false };
  if (booking.status === 'cancelled' || booking.status === 'completed') return { ok: false, reason: 'Booking đã ở trạng thái cuối, không thể huỷ.' };
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
  return { ok: true, refundAmount, policy };
}

export const BookingService = {
  createBooking,
  respondToBooking,
  cancelBooking,
  computeRefundAmount,
  getSlotRemaining,
  findExperienceAndSlot,
  reapExpiredHolds,
  isHoldExpired,
};
