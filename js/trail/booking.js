import { getState, getItinerary } from '../storage.js';
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

const ITEM_STATUS_LABEL = {
  pending: 'Chờ hộ xác nhận',
  accepted: 'Đã xác nhận',
  rejected: 'Bị từ chối',
  cancelled: 'Đã huỷ',
  completed: 'Đã hoàn thành',
};

/** Màn xác nhận đầy đủ sau khi đặt tour (PHASE "Hoàn thiện hành trình" mục 6) — không được nói
 * "toàn bộ đã xác nhận" ngay sau khi tạo (mọi item lúc này đều 'pending', chưa có host nào phản
 * hồi) — luôn hiển thị đúng trạng thái từng hoạt động. */
function pendingResultHtml(booking, bookingItems, itinerary, paidAmount) {
  const state = getState();
  const startDate = itinerary ? new Date(itinerary.date) : null;
  const startTime = itinerary ? `${String(itinerary.startHour).padStart(2, '0')}:${String(itinerary.startMin).padStart(2, '0')}` : null;
  const anyPending = bookingItems.some((bi) => bi.status === 'pending');
  return `
    <div class="flex-col gap-3">
      <div style="text-align:center;">
        <div style="font-size:1.8rem;">✅</div>
        <h3 style="margin:6px 0 0;">Đặt hành trình thành công</h3>
        <p class="text-sm text-muted">${anyPending ? 'Đang chờ hộ xác nhận từng hoạt động — chưa phải "đã xác nhận toàn bộ".' : 'Đã ghi nhận, xem trạng thái từng hoạt động bên dưới.'}</p>
      </div>
      <div class="quick-facts" style="margin:0;">
        <div class="quick-fact"><span class="quick-fact__label">Mã booking</span><span class="quick-fact__value">${escapeHtml(booking.code)}</span></div>
        ${itinerary ? `<div class="quick-fact"><span class="quick-fact__label">Tên hành trình</span><span class="quick-fact__value">${escapeHtml(itinerary.name)}</span></div>` : ''}
        ${startDate ? `<div class="quick-fact"><span class="quick-fact__label">Ngày</span><span class="quick-fact__value">${formatDateShort(startDate)}</span></div>` : ''}
        ${startTime ? `<div class="quick-fact"><span class="quick-fact__label">Giờ bắt đầu</span><span class="quick-fact__value">${startTime}</span></div>` : ''}
        <div class="quick-fact"><span class="quick-fact__label">Số người</span><span class="quick-fact__value">${booking.partySize}</span></div>
      </div>
      <div>
        <p class="field-label" style="margin-bottom:6px;">Các hoạt động</p>
        <div class="flex-col gap-2">
          ${bookingItems.map((bi) => `
            <div class="card flex justify-between items-center gap-2 wrap" style="padding:10px;">
              <span>${escapeHtml(bi.title)}</span>
              <span class="badge ${bi.status === 'accepted' || bi.status === 'completed' ? 'badge-free' : bi.status === 'rejected' ? 'badge-recognized' : 'badge-demo'}">${ITEM_STATUS_LABEL[bi.status] || bi.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="quick-facts" style="margin:0;">
        <div class="quick-fact"><span class="quick-fact__label">Tổng tiền</span><span class="quick-fact__value">${formatCurrency(booking.totalAmount)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Đã thanh toán (demo)</span><span class="quick-fact__value">${formatCurrency(paidAmount)}</span></div>
      </div>
      <div class="modal__actions">
        ${itinerary ? `<a class="btn btn-primary" href="#/trail/itinerary/${itinerary.id}" id="bk-view-itinerary">Xem hành trình</a>` : ''}
        <a class="btn btn-secondary" href="#/trail/explore" id="bk-back-explore">Quay lại khám phá</a>
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
          showResult(r.amount);
        };
        qs('#bk-pay-deposit', modalEl).addEventListener('click', () => pay('deposit'));
        qs('#bk-pay-full', modalEl).addEventListener('click', () => pay('full'));
      }

      function showResult(paidAmount) {
        const itinerary = itineraryId ? getItinerary(itineraryId) : null;
        setBody(pendingResultHtml(currentBooking, currentItems, itinerary, paidAmount));
        const finish = () => { if (onDone) onDone(currentBooking, currentItems); };
        qs('#bk-view-itinerary', modalEl)?.addEventListener('click', () => { finish(); closeFn(); });
        qs('#bk-back-explore', modalEl)?.addEventListener('click', () => { finish(); closeFn(); });
      }

      wireCart();
    },
  });

  return close;
}
