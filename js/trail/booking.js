import { getState } from '../storage.js';
import { escapeHtml, formatCurrency, formatDateShort, qs, qsa } from '../utils.js';
import { createBooking, respondToBooking, findExperienceAndSlot } from '../services/bookingService.js';
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
      <p class="demo-note">Đây là bản demo: chỗ được giữ tạm trong 15 phút chờ hộ xác nhận (mô phỏng). Chưa thu tiền thật, chưa lưu thông tin thẻ.</p>
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

function hostSimStepHtml(bookingItems) {
  return `
    <p class="demo-note">Studio (kênh dành cho hộ) sẽ xây ở phase sau. Để trình diễn đầy đủ luồng, bạn tạm đóng vai hộ để xác nhận/từ chối từng mục bên dưới.</p>
    <div class="flex-col gap-3" id="bk-host-items">
      ${bookingItems.map((bi) => `
        <div class="activity-card" data-bi="${bi.id}">
          <strong>${escapeHtml(bi.title)}</strong>
          <p class="text-sm text-muted" style="margin:4px 0;">${bi.quantity} khách · ${formatCurrency(bi.subtotal)}</p>
          <div class="chip-row">
            <button type="button" class="chip" data-decision="accept" aria-pressed="true">✓ Chấp nhận</button>
            <button type="button" class="chip" data-decision="reject" aria-pressed="false">✕ Từ chối</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="modal__actions">
      <button type="button" class="btn btn-primary" id="bk-submit-host-sim">🎭 Xác nhận phản hồi (demo)</button>
    </div>
  `;
}

function resultStepHtml(booking, items) {
  const accepted = items.filter((i) => i.status === 'accepted');
  const rejected = items.filter((i) => i.status === 'rejected');
  return `
    <div class="flex-col gap-3">
      <p class="badge ${booking.status === 'confirmed' ? 'badge-free' : booking.status === 'rejected' ? 'badge-recognized' : 'badge-type'}">
        ${booking.status === 'confirmed' ? 'Đã xác nhận toàn bộ' : booking.status === 'rejected' ? 'Bị từ chối toàn bộ' : 'Xác nhận một phần'}
      </p>
      ${accepted.length ? `<p>✓ Đã xác nhận: ${accepted.map((i) => escapeHtml(i.title)).join(', ')}</p>` : ''}
      ${rejected.length ? `<p>✕ Bị từ chối: ${rejected.map((i) => escapeHtml(i.title)).join(', ')} — hoạt động tương ứng sẽ không tính phí, có thể chọn lại khung giờ khác trong hành trình.</p>` : ''}
      <p>Tổng tiền sau điều chỉnh: <strong>${formatCurrency(booking.totalAmount)}</strong></p>
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
          setBody(hostSimStepHtml(currentItems));
          wireHostSim();
        };
        qs('#bk-pay-deposit', modalEl).addEventListener('click', () => pay('deposit'));
        qs('#bk-pay-full', modalEl).addEventListener('click', () => pay('full'));
      }

      function wireHostSim() {
        qsa('[data-bi]', modalEl).forEach((row) => {
          qsa('.chip', row).forEach((chip) => {
            chip.addEventListener('click', () => {
              qsa('.chip', row).forEach((c) => c.setAttribute('aria-pressed', 'false'));
              chip.setAttribute('aria-pressed', 'true');
            });
          });
        });
        qs('#bk-submit-host-sim', modalEl).addEventListener('click', () => {
          const decisions = qsa('[data-bi]', modalEl).map((row) => ({
            bookingItemId: row.dataset.bi,
            decision: qs('[data-decision="reject"]', row).getAttribute('aria-pressed') === 'true' ? 'reject' : 'accept',
            reason: 'Hộ từ chối trong bản mô phỏng (demo).',
          }));
          const r = respondToBooking(currentBooking.id, decisions);
          if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
          setBody(resultStepHtml(r.booking, r.items));
          qs('#bk-close-result', modalEl).addEventListener('click', () => {
            closeFn();
            if (onDone) onDone(r.booking, r.items);
          });
        });
      }

      wireCart();
    },
  });

  return close;
}
