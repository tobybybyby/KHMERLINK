import { getState, assignSupportTicket, updateSupportTicketStatus } from '../storage.js';
import { escapeHtml, formatMoney, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal, confirmDialog } from '../ui.js';
import { cancelBooking, computeRefundAmount } from '../services/bookingService.js';
import { t, registerTranslations, getCurrentLanguage } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('management', {
  tickets: {
    status: { moi: 'Mới', 'dang-xu-ly': 'Đang xử lý', 'da-xu-ly': 'Đã xử lý' },
    category: {
      'ho-khong-don-khach': 'Hộ không đón khách',
      'gia-sai': 'Giá sai so với mô tả',
      'an-toan': 'Vấn đề an toàn',
      'khac-mo-ta': 'Hoạt động khác mô tả',
      khac: 'Khác',
    },
    resolution: { 'doi-gio': 'Đổi giờ', 'doi-trai-nghiem': 'Chuyển trải nghiệm tương tự', 'hoan-tien': 'Hoàn tiền' },
    title: 'Sự cố',
    subtitle: 'Tiếp nhận ticket từ Trail, gán người phụ trách, đổi lịch/chuyển hoạt động/hoàn tiền và cập nhật timeline cho khách. Mốc 1–2 ngày làm việc là mục tiêu xử lý, không phải bảo đảm.',
    allStatuses: 'Tất cả trạng thái',
    noMatch: 'Không có ticket nào khớp bộ lọc.',
    assignHandlerTitle: 'Gán người phụ trách',
    handlerLabel: 'Người phụ trách (demo)',
    handlerA: 'Vận hành A',
    handlerB: 'Vận hành B',
    communityAdvisor: 'Cố vấn cộng đồng',
    assign: 'Gán',
    startedProcessing: '{handler} bắt đầu xử lý.',
    assignedNotify: 'Đã gán người phụ trách.',
    refundTitle: 'Xử lý hoàn tiền',
    refundMessage: 'Huỷ booking và hoàn tiền theo chính sách: {policy} Số tiền hoàn dự kiến: {amount}. Tiếp tục?',
    confirmRefund: 'Xác nhận hoàn tiền',
    cannotProcess: 'Không thể xử lý.',
    refundedNote: 'Đã hoàn tiền {amount} theo chính sách: {policy}',
    refundProcessedNotify: 'Đã xử lý hoàn tiền và cập nhật ticket.',
    markResolvedTitle: 'Đánh dấu đã xử lý',
    resolutionResultLabel: 'Kết quả xử lý',
    confirm: 'Xác nhận',
    enterResolutionResult: 'Nhập kết quả xử lý.',
    ticketUpdatedNotify: 'Đã cập nhật ticket.',
    desiredResolution: ' · Mong muốn: {value}',
    bookingLabel: 'Booking: {code} · ',
    placeLabel: 'Địa điểm: {name} · ',
    assignedTo: 'Phụ trách: {name}',
    noHandlerAssigned: 'Chưa gán người phụ trách',
    assignHandlerBtn: 'Gán người phụ trách',
    processRefundBtn: '💸 Xử lý hoàn tiền',
    markResolvedBtn: '✓ Đánh dấu đã xử lý',
  },
}, {
  tickets: {
    status: { moi: 'New', 'dang-xu-ly': 'In Progress', 'da-xu-ly': 'Resolved' },
    category: {
      'ho-khong-don-khach': 'Provider did not host guests',
      'gia-sai': 'Price differs from description',
      'an-toan': 'Safety issue',
      'khac-mo-ta': 'Activity differs from description',
      khac: 'Other',
    },
    resolution: { 'doi-gio': 'Change time', 'doi-trai-nghiem': 'Switch to similar experience', 'hoan-tien': 'Refund' },
    title: 'Incidents',
    subtitle: "Receive tickets from Trail, assign a handler, reschedule/switch activity/refund and update the guest's timeline. 1–2 business days is a target, not a guarantee.",
    allStatuses: 'All statuses',
    noMatch: 'No tickets match the current filter.',
    assignHandlerTitle: 'Assign Handler',
    handlerLabel: 'Handler (demo)',
    handlerA: 'Operations A',
    handlerB: 'Operations B',
    communityAdvisor: 'Community Advisor',
    assign: 'Assign',
    startedProcessing: '{handler} started processing.',
    assignedNotify: 'Handler assigned.',
    refundTitle: 'Process Refund',
    refundMessage: 'Cancel the booking and refund per policy: {policy} Expected refund amount: {amount}. Continue?',
    confirmRefund: 'Confirm Refund',
    cannotProcess: 'Could not process.',
    refundedNote: 'Refunded {amount} per policy: {policy}',
    refundProcessedNotify: 'Refund processed and ticket updated.',
    markResolvedTitle: 'Mark Resolved',
    resolutionResultLabel: 'Resolution outcome',
    confirm: 'Confirm',
    enterResolutionResult: 'Enter the resolution outcome.',
    ticketUpdatedNotify: 'Ticket updated.',
    desiredResolution: ' · Desired: {value}',
    bookingLabel: 'Booking: {code} · ',
    placeLabel: 'Place: {name} · ',
    assignedTo: 'Handler: {name}',
    noHandlerAssigned: 'No handler assigned yet',
    assignHandlerBtn: 'Assign Handler',
    processRefundBtn: '💸 Process Refund',
    markResolvedBtn: '✓ Mark Resolved',
  },
});

let filterStatus = '';

export function renderOpsTickets(container) {
  const state = getState();
  const tickets = state.supportTickets
    .filter((t) => !filterStatus || t.status === filterStatus)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">${t('management.tickets.title')}</h1>
      <p class="text-sm text-muted">${t('management.tickets.subtitle')}</p>
    </div>

    <div class="explore-toolbar" style="background:transparent;border:none;padding:0;">
      <select class="field-select" id="ticket-status-filter" style="max-width:200px;">
        <option value="">${t('management.tickets.allStatuses')}</option>
        ${['moi', 'dang-xu-ly', 'da-xu-ly'].map((k) => `<option value="${k}" ${filterStatus === k ? 'selected' : ''}>${escapeHtml(t(`management.tickets.status.${k}`))}</option>`).join('')}
      </select>
    </div>

    <div class="flex-col gap-3">
      ${tickets.length ? tickets.map((tk) => ticketCardHtml(state, tk)).join('') : `<p class="text-sm text-faint">${t('management.tickets.noMatch')}</p>`}
    </div>
  `;

  qs('#ticket-status-filter', container).addEventListener('change', (e) => { filterStatus = e.target.value; renderOpsTickets(container); });

  qsa('[data-assign]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-ticket]').dataset.ticket;
      const close = openModal({
        title: t('management.tickets.assignHandlerTitle'),
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="handler-select">${t('management.tickets.handlerLabel')}</label>
            <select class="field-select" id="handler-select">
              <option>${t('management.tickets.handlerA')}</option>
              <option>${t('management.tickets.handlerB')}</option>
              <option>${t('management.tickets.communityAdvisor')}</option>
            </select>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="assign-confirm">${t('management.tickets.assign')}</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#assign-confirm', modalEl).addEventListener('click', () => {
            const handler = qs('#handler-select', modalEl).value;
            assignSupportTicket(id, handler);
            if (state.supportTickets.find((tk) => tk.id === id)?.status === 'moi') updateSupportTicketStatus(id, 'dang-xu-ly', t('management.tickets.startedProcessing', { handler }));
            closeFn();
            NotificationService.notify(t('management.tickets.assignedNotify'), 'success');
            renderOpsTickets(container);
          });
        },
      });
      if (!close) return;
    });
  });

  qsa('[data-refund]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const ticketId = btn.closest('[data-ticket]').dataset.ticket;
      const bookingId = btn.dataset.refund;
      const booking = state.bookings.find((b) => b.id === bookingId);
      const { refundAmount, policy } = computeRefundAmount(booking);
      confirmDialog({
        title: t('management.tickets.refundTitle'),
        message: t('management.tickets.refundMessage', { policy, amount: formatMoney(refundAmount) }),
        confirmLabel: t('management.tickets.confirmRefund'),
      }).then((ok) => {
        if (!ok) return;
        const r = cancelBooking(bookingId);
        if (!r.ok) { NotificationService.notify(r.reason || t('management.tickets.cannotProcess'), 'error'); return; }
        updateSupportTicketStatus(ticketId, 'da-xu-ly', t('management.tickets.refundedNote', { amount: formatMoney(r.refundAmount), policy: r.policy }));
        NotificationService.notify(t('management.tickets.refundProcessedNotify'), 'success');
        renderOpsTickets(container);
      });
    });
  });

  qsa('[data-resolve]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-ticket]').dataset.ticket;
      const close = openModal({
        title: t('management.tickets.markResolvedTitle'),
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="resolve-note">${t('management.tickets.resolutionResultLabel')}</label>
            <textarea class="field-input" id="resolve-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="resolve-confirm">${t('management.tickets.confirm')}</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#resolve-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#resolve-note', modalEl).value.trim();
            if (!note) { NotificationService.notify(t('management.tickets.enterResolutionResult'), 'error'); return; }
            updateSupportTicketStatus(id, 'da-xu-ly', note);
            closeFn();
            NotificationService.notify(t('management.tickets.ticketUpdatedNotify'), 'success');
            renderOpsTickets(container);
          });
        },
      });
      if (!close) return;
    });
  });
}

function ticketCardHtml(state, tk) {
  const label = t(`management.tickets.status.${tk.status}`) || tk.status;
  const cls = { moi: 'badge-demo', 'dang-xu-ly': 'badge-type', 'da-xu-ly': 'badge-free' }[tk.status] || 'badge-type';
  const booking = tk.bookingId ? state.bookings.find((b) => b.id === tk.bookingId) : null;
  const dest = tk.destinationId ? state.destinations.find((d) => d.id === tk.destinationId) : null;
  const canRefund = tk.desiredResolution === 'hoan-tien' && booking && booking.status !== 'cancelled' && tk.status !== 'da-xu-ly';
  return `
    <div class="activity-card" data-ticket="${tk.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(tk.code)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(t(`management.tickets.category.${tk.category}`) || tk.category)}${t('management.tickets.desiredResolution', { value: escapeHtml(t(`management.tickets.resolution.${tk.desiredResolution}`) || tk.desiredResolution) })}</p>
      <p class="text-sm" style="margin:4px 0;">${escapeHtml(tk.description)}</p>
      <p class="text-sm text-faint" style="margin:0;">${booking ? t('management.tickets.bookingLabel', { code: escapeHtml(booking.code) }) : ''}${dest ? t('management.tickets.placeLabel', { name: escapeHtml(localizedDestinationName(dest)) }) : ''}${tk.assignedTo ? t('management.tickets.assignedTo', { name: escapeHtml(tk.assignedTo) }) : t('management.tickets.noHandlerAssigned')}</p>
      <div class="text-sm text-faint" style="margin-top:6px;">
        ${tk.timeline.map((h) => `${new Date(h.at).toLocaleString(getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US')} — ${escapeHtml(h.note || h.status)}`).join('<br>')}
      </div>
      ${tk.status !== 'da-xu-ly' ? `
        <div class="cta-row" style="margin-top:8px;">
          <button type="button" class="btn btn-secondary btn-sm" data-assign>${t('management.tickets.assignHandlerBtn')}</button>
          ${canRefund ? `<button type="button" class="btn btn-primary btn-sm" data-refund="${booking.id}">${t('management.tickets.processRefundBtn')}</button>` : ''}
          <button type="button" class="btn btn-primary btn-sm" data-resolve>${t('management.tickets.markResolvedBtn')}</button>
        </div>
      ` : ''}
    </div>
  `;
}
