import { getState } from '../storage.js';
import { escapeHtml, formatCurrency, formatDateShort, qs } from '../utils.js';
import { createBooking, findExperienceAndSlot } from '../services/bookingService.js';
import { payBooking } from '../services/paymentService.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';

function itemRowHtml(item) {
  const { exp, slot } = findExperienceAndSlot(item.experienceId, item.slotId);
  if (!exp || !slot) return '';
  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${escapeHtml(exp.title)}</strong>
        <span class="activity-card__price">${formatCurrency(exp.price * item.quantity)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${formatDateShort(slot.date)} · ${slot.startTime}–${slot.endTime} · ${item.quantity} khách</p>
    </div>
  `;
}

function cartStepHtml(items, partySize) {
  const state = getState();
  const total = items.reduce((sum, it) => {
    const { exp } = findExperienceAndSlot(it.experienceId, it.slotId);
    return sum + (exp ? exp.price * it.quantity : 0);
  }, 0);
  return `
    <div class="flex-col gap-3">
      ${items.map(itemRowHtml).join('')}
      <div class="quick-fact">
        <span class="quick-fact__label">Số khách</span>
        <span class="quick-fact__value">${partySize} người</span>
      </div>
      <div class="quick-fact">
        <span class="quick-fact__label">Tổng tiền tạm tính</span>
        <span class="quick-fact__value">${formatCurrency(total)}</span>
      </div>
      <p class="demo-note">Đây là bản demo: chỗ được giữ tạm trong 15 phút chờ hộ xác nhận. Chưa thu tiền thật, chưa lưu thông tin thẻ.</p>
      <div class="modal__actions">
        <button type="button" class="btn btn-primary btn-block" id="bk-confirm-cart">Giữ chỗ & tiếp tục</button>
      </div>
    </div>
  `;
}

function paymentStepHtml(booking) {
  return `
    <div class="flex-col gap-3">
      <p>Mã giữ chỗ: <strong>${escapeHtml(booking.code)}</strong> — giữ đến ${new Date(booking.holdExpiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.</p>
      <div class="quick-fact">
        <span class="quick-fact__label">Tổng tiền</span>
        <span class="quick-fact__value">${formatCurrency(booking.totalAmount)}</span>
      </div>
      <div class="quick-fact">
        <span class="quick-fact__label">Đặt cọc gợi ý (30%)</span>
        <span class="quick-fact__value">${formatCurrency(booking.depositAmount)}</span>
      </div>
      <p class="text-sm text-muted">Thanh toán demo — không thu thông tin thẻ thật.</p>
      <div class="cta-row">
        <button type="button" class="btn btn-secondary" id="bk-pay-deposit">Đặt cọc 30%</button>
        <button type="button" class="btn btn-primary" id="bk-pay-full">Thanh toán toàn bộ</button>
      </div>
    </div>
  `;
}

function pendingResultHtml(booking) {
  return `
    <div class="flex-col gap-3">
      <p class="badge badge-demo">Chờ hộ xác nhận</p>
      <p>Đã giữ chỗ và ghi nhận thanh toán. Hộ sẽ chấp nhận hoặc từ chối từng hoạt động trong Studio — bạn sẽ thấy cập nhật ở Hộ chiếu/Hành trình khi hộ phản hồi.</p>
      <div class="quick-fact">
        <span class="quick-fact__label">Mã booking</span>
        <span class="quick-fact__value">${escapeHtml(booking.code)}</span>
      </div>
      <div class="modal__actions">
        <button type="button" class="btn btn-primary" id="bk-close-result">Xong</button>
      </div>
    </div>
  `;
}

export function openBookingFlow({ items, itineraryId = null, partySize, onDone }) {
  let currentBooking = null;
  let currentItems = null;

  const close = openModal({
    title: 'Đặt trải nghiệm',
    bodyHtml: cartStepHtml(items, partySize),
    onMount: (modalEl, closeFn) => {
      const setBody = (html) => { qs('.modal__body', modalEl).innerHTML = html; };

      function wireCart() {
        qs('#bk-confirm-cart', modalEl).addEventListener('click', () => {
          const result = createBooking({ itineraryId, partySize, items });
          if (!result.ok) {
            NotificationService.notify(result.reason, 'error');
            return;
          }
          currentBooking = result.booking;
          currentItems = result.bookingItems;
          setBody(paymentStepHtml(currentBooking));
          wirePayment();
        });
      }

      function wirePayment() {
        const pay = (kind) => {
          const r = payBooking(currentBooking.id, kind);
          if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
          NotificationService.notify(`Đã thanh toán demo ${formatCurrency(r.amount)}.`, 'success');
          setBody(pendingResultHtml(currentBooking));
          qs('#bk-close-result', modalEl).addEventListener('click', () => {
            closeFn();
            if (onDone) onDone(currentBooking, currentItems);
          });
        };
        qs('#bk-pay-deposit', modalEl).addEventListener('click', () => pay('deposit'));
        qs('#bk-pay-full', modalEl).addEventListener('click', () => pay('full'));
      }

      wireCart();
    },
  });

  return close;
}
