// Adapter thanh toán mô phỏng — không thu thông tin thẻ thật, không chuyển tiền thật.
import { getState, persist } from '../storage.js';
import { uid } from '../utils.js';

/** kind: 'deposit' | 'full' */
export function payBooking(bookingId, kind) {
  const s = getState();
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false, reason: 'Không tìm thấy booking.' };
  if (booking.paymentStatus === 'paid') return { ok: false, reason: 'Booking đã thanh toán đủ.' };

  const amount = kind === 'deposit' ? booking.depositAmount : booking.totalAmount;
  const now = new Date().toISOString();
  s.payments.push({ id: uid('pay'), bookingId, amount, method: 'demo_card', kind, status: 'success', createdAt: now });
  booking.paymentStatus = kind === 'deposit' ? 'deposit_paid' : 'paid';
  booking.statusHistory.push({ status: `payment_${booking.paymentStatus}`, at: now });
  persist();
  return { ok: true, amount };
}

export const PaymentService = { payBooking };
