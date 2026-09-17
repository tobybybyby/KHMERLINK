import { getState, getItinerary } from '../storage.js';
import { escapeHtml, formatCurrency, formatDateShort, qs } from '../utils.js';
import { createBooking, findExperienceAndSlot } from '../services/bookingService.js';
import { payBooking } from '../services/paymentService.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';
import { t, registerTranslations, getCurrentLanguage } from '../services/i18nService.js';

registerTranslations('customer', {
  booking: {
    guests: '{count} khách',
    guestCount: 'Số khách',
    guestUnit: 'người',
    estimatedTotal: 'Tổng tiền tạm tính',
    demoNote: 'Đây là bản demo: chỗ được giữ tạm trong 15 phút chờ hộ xác nhận. Chưa thu tiền thật, chưa lưu thông tin thẻ.',
    holdAndContinue: 'Giữ chỗ & tiếp tục',
    holdCode: 'Mã giữ chỗ: {code} — giữ đến {time}.',
    total: 'Tổng tiền',
    suggestedDeposit: 'Đặt cọc gợi ý (30%)',
    demoPaymentNote: 'Thanh toán demo — không thu thông tin thẻ thật.',
    payDeposit: 'Đặt cọc 30%',
    payFull: 'Thanh toán toàn bộ',
    successTitle: 'Đặt hành trình thành công',
    pendingMsg: 'Đang chờ hộ xác nhận từng hoạt động — chưa phải "đã xác nhận toàn bộ".',
    recordedMsg: 'Đã ghi nhận, xem trạng thái từng hoạt động bên dưới.',
    bookingCode: 'Mã booking',
    tripName: 'Tên hành trình',
    date: 'Ngày',
    startTime: 'Giờ bắt đầu',
    partySize: 'Số người',
    activities: 'Các hoạt động',
    paidDemo: 'Đã thanh toán (demo)',
    viewItinerary: 'Xem hành trình',
    backToExplore: 'Quay lại khám phá',
    bookExperience: 'Đặt trải nghiệm',
    paidNotify: 'Đã thanh toán demo {amount}.',
    itemStatus: {
      pending: 'Chờ hộ xác nhận',
      accepted: 'Đã xác nhận',
      rejected: 'Bị từ chối',
      cancelled: 'Đã huỷ',
      completed: 'Đã hoàn thành',
    },
  },
}, {
  booking: {
    guests: '{count} guests',
    guestCount: 'Number of guests',
    guestUnit: 'people',
    estimatedTotal: 'Estimated total',
    demoNote: 'This is a demo: the spot is held for 15 minutes while awaiting provider confirmation. No real payment is taken, no card details are stored.',
    holdAndContinue: 'Hold spot & continue',
    holdCode: 'Hold code: {code} — held until {time}.',
    total: 'Total',
    suggestedDeposit: 'Suggested deposit (30%)',
    demoPaymentNote: 'Demo payment — no real card details collected.',
    payDeposit: 'Pay 30% deposit',
    payFull: 'Pay in full',
    successTitle: 'Trip booked successfully',
    pendingMsg: 'Awaiting provider confirmation for each activity — not yet "fully confirmed".',
    recordedMsg: 'Recorded — see the status of each activity below.',
    bookingCode: 'Booking ID',
    tripName: 'Trip name',
    date: 'Date',
    startTime: 'Start time',
    partySize: 'Group size',
    activities: 'Activities',
    paidDemo: 'Paid (demo)',
    viewItinerary: 'View trip',
    backToExplore: 'Back to Explore',
    bookExperience: 'Book Experience',
    paidNotify: 'Paid {amount} (demo).',
    itemStatus: {
      pending: 'Awaiting confirmation',
      accepted: 'Confirmed',
      rejected: 'Declined',
      cancelled: 'Cancelled',
      completed: 'Completed',
    },
  },
});

function itemRowHtml(item) {
  const { exp, slot } = findExperienceAndSlot(item.experienceId, item.slotId);
  if (!exp || !slot) return '';
  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${escapeHtml(exp.title)}</strong>
        <span class="activity-card__price">${formatCurrency(exp.price * item.quantity)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${formatDateShort(slot.date)} · ${slot.startTime}–${slot.endTime} · ${t('customer.booking.guests', { count: item.quantity })}</p>
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
        <span class="quick-fact__label">${t('customer.booking.guestCount')}</span>
        <span class="quick-fact__value">${partySize} ${t('customer.booking.guestUnit')}</span>
      </div>
      <div class="quick-fact">
        <span class="quick-fact__label">${t('customer.booking.estimatedTotal')}</span>
        <span class="quick-fact__value">${formatCurrency(total)}</span>
      </div>
      <p class="demo-note">${t('customer.booking.demoNote')}</p>
      <div class="modal__actions">
        <button type="button" class="btn btn-primary btn-block" id="bk-confirm-cart">${t('customer.booking.holdAndContinue')}</button>
      </div>
    </div>
  `;
}

function paymentStepHtml(booking) {
  const time = new Date(booking.holdExpiresAt).toLocaleTimeString(getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="flex-col gap-3">
      <p>${t('customer.booking.holdCode', { code: `<strong>${escapeHtml(booking.code)}</strong>`, time })}</p>
      <div class="quick-fact">
        <span class="quick-fact__label">${t('customer.booking.total')}</span>
        <span class="quick-fact__value">${formatCurrency(booking.totalAmount)}</span>
      </div>
      <div class="quick-fact">
        <span class="quick-fact__label">${t('customer.booking.suggestedDeposit')}</span>
        <span class="quick-fact__value">${formatCurrency(booking.depositAmount)}</span>
      </div>
      <p class="text-sm text-muted">${t('customer.booking.demoPaymentNote')}</p>
      <div class="cta-row">
        <button type="button" class="btn btn-secondary" id="bk-pay-deposit">${t('customer.booking.payDeposit')}</button>
        <button type="button" class="btn btn-primary" id="bk-pay-full">${t('customer.booking.payFull')}</button>
      </div>
    </div>
  `;
}

function itemStatusLabel(status) {
  return t(`customer.booking.itemStatus.${status}`) || status;
}

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
        <h3 style="margin:6px 0 0;">${t('customer.booking.successTitle')}</h3>
        <p class="text-sm text-muted">${anyPending ? t('customer.booking.pendingMsg') : t('customer.booking.recordedMsg')}</p>
      </div>
      <div class="quick-facts" style="margin:0;">
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.booking.bookingCode')}</span><span class="quick-fact__value">${escapeHtml(booking.code)}</span></div>
        ${itinerary ? `<div class="quick-fact"><span class="quick-fact__label">${t('customer.booking.tripName')}</span><span class="quick-fact__value">${escapeHtml(itinerary.name)}</span></div>` : ''}
        ${startDate ? `<div class="quick-fact"><span class="quick-fact__label">${t('customer.booking.date')}</span><span class="quick-fact__value">${formatDateShort(startDate)}</span></div>` : ''}
        ${startTime ? `<div class="quick-fact"><span class="quick-fact__label">${t('customer.booking.startTime')}</span><span class="quick-fact__value">${startTime}</span></div>` : ''}
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.booking.partySize')}</span><span class="quick-fact__value">${booking.partySize}</span></div>
      </div>
      <div>
        <p class="field-label" style="margin-bottom:6px;">${t('customer.booking.activities')}</p>
        <div class="flex-col gap-2">
          ${bookingItems.map((bi) => `
            <div class="card flex justify-between items-center gap-2 wrap" style="padding:10px;">
              <span>${escapeHtml(bi.title)}</span>
              <span class="badge ${bi.status === 'accepted' || bi.status === 'completed' ? 'badge-free' : bi.status === 'rejected' ? 'badge-recognized' : 'badge-demo'}">${itemStatusLabel(bi.status)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="quick-facts" style="margin:0;">
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.booking.total')}</span><span class="quick-fact__value">${formatCurrency(booking.totalAmount)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.booking.paidDemo')}</span><span class="quick-fact__value">${formatCurrency(paidAmount)}</span></div>
      </div>
      <div class="modal__actions">
        ${itinerary ? `<a class="btn btn-primary" href="#/trail/itinerary/${itinerary.id}" id="bk-view-itinerary">${t('customer.booking.viewItinerary')}</a>` : ''}
        <a class="btn btn-secondary" href="#/trail/explore" id="bk-back-explore">${t('customer.booking.backToExplore')}</a>
      </div>
    </div>
  `;
}

export function openBookingFlow({ items, itineraryId = null, partySize, onDone }) {
  let currentBooking = null;
  let currentItems = null;

  const close = openModal({
    title: t('customer.booking.bookExperience'),
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
          NotificationService.notify(t('customer.booking.paidNotify', { amount: formatCurrency(r.amount) }), 'success');
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
