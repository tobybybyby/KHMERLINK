import { getState, assignSupportTicket, updateSupportTicketStatus } from '../storage.js';
import { escapeHtml, formatMoney, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal, confirmDialog } from '../ui.js';
import { cancelBooking, computeRefundAmount } from '../services/bookingService.js';

const STATUS_LABELS = { moi: ['Mới', 'badge-demo'], 'dang-xu-ly': ['Đang xử lý', 'badge-type'], 'da-xu-ly': ['Đã xử lý', 'badge-free'] };
const CATEGORY_LABELS = {
  'ho-khong-don-khach': 'Hộ không đón khách',
  'gia-sai': 'Giá sai so với mô tả',
  'an-toan': 'Vấn đề an toàn',
  'khac-mo-ta': 'Hoạt động khác mô tả',
  khac: 'Khác',
};
const RESOLUTION_LABELS = { 'doi-gio': 'Đổi giờ', 'doi-trai-nghiem': 'Chuyển trải nghiệm tương tự', 'hoan-tien': 'Hoàn tiền' };

let filterStatus = '';

export function renderOpsTickets(container) {
  const state = getState();
  const tickets = state.supportTickets
    .filter((t) => !filterStatus || t.status === filterStatus)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Sự cố</h1>
      <p class="text-sm text-muted">Tiếp nhận ticket từ Trail, gán người phụ trách, đổi lịch/chuyển hoạt động/hoàn tiền và cập nhật timeline cho khách. Mốc 1–2 ngày làm việc là mục tiêu xử lý, không phải bảo đảm.</p>
    </div>

    <div class="explore-toolbar" style="background:transparent;border:none;padding:0;">
      <select class="field-select" id="ticket-status-filter" style="max-width:200px;">
        <option value="">Tất cả trạng thái</option>
        ${Object.entries(STATUS_LABELS).map(([k, [l]]) => `<option value="${k}" ${filterStatus === k ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}
      </select>
    </div>

    <div class="flex-col gap-3">
      ${tickets.length ? tickets.map((t) => ticketCardHtml(state, t)).join('') : '<p class="text-sm text-faint">Không có ticket nào khớp bộ lọc.</p>'}
    </div>
  `;

  qs('#ticket-status-filter', container).addEventListener('change', (e) => { filterStatus = e.target.value; renderOpsTickets(container); });

  qsa('[data-assign]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-ticket]').dataset.ticket;
      const close = openModal({
        title: 'Gán người phụ trách',
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="handler-select">Người phụ trách (demo)</label>
            <select class="field-select" id="handler-select">
              <option>Vận hành A</option>
              <option>Vận hành B</option>
              <option>Cố vấn cộng đồng</option>
            </select>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="assign-confirm">Gán</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#assign-confirm', modalEl).addEventListener('click', () => {
            const handler = qs('#handler-select', modalEl).value;
            assignSupportTicket(id, handler);
            if (state.supportTickets.find((t) => t.id === id)?.status === 'moi') updateSupportTicketStatus(id, 'dang-xu-ly', `${handler} bắt đầu xử lý.`);
            closeFn();
            NotificationService.notify('Đã gán người phụ trách.', 'success');
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
        title: 'Xử lý hoàn tiền',
        message: `Huỷ booking và hoàn tiền theo chính sách: ${policy} Số tiền hoàn dự kiến: ${formatMoney(refundAmount)}. Tiếp tục?`,
        confirmLabel: 'Xác nhận hoàn tiền',
      }).then((ok) => {
        if (!ok) return;
        const r = cancelBooking(bookingId);
        if (!r.ok) { NotificationService.notify(r.reason || 'Không thể xử lý.', 'error'); return; }
        updateSupportTicketStatus(ticketId, 'da-xu-ly', `Đã hoàn tiền ${formatMoney(r.refundAmount)} theo chính sách: ${r.policy}`);
        NotificationService.notify('Đã xử lý hoàn tiền và cập nhật ticket.', 'success');
        renderOpsTickets(container);
      });
    });
  });

  qsa('[data-resolve]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-ticket]').dataset.ticket;
      const close = openModal({
        title: 'Đánh dấu đã xử lý',
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="resolve-note">Kết quả xử lý</label>
            <textarea class="field-input" id="resolve-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="resolve-confirm">Xác nhận</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#resolve-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#resolve-note', modalEl).value.trim();
            if (!note) { NotificationService.notify('Nhập kết quả xử lý.', 'error'); return; }
            updateSupportTicketStatus(id, 'da-xu-ly', note);
            closeFn();
            NotificationService.notify('Đã cập nhật ticket.', 'success');
            renderOpsTickets(container);
          });
        },
      });
      if (!close) return;
    });
  });
}

function ticketCardHtml(state, t) {
  const [label, cls] = STATUS_LABELS[t.status] || [t.status, 'badge-type'];
  const booking = t.bookingId ? state.bookings.find((b) => b.id === t.bookingId) : null;
  const dest = t.destinationId ? state.destinations.find((d) => d.id === t.destinationId) : null;
  const canRefund = t.desiredResolution === 'hoan-tien' && booking && booking.status !== 'cancelled' && t.status !== 'da-xu-ly';
  return `
    <div class="activity-card" data-ticket="${t.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(t.code)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(CATEGORY_LABELS[t.category] || t.category)} · Mong muốn: ${escapeHtml(RESOLUTION_LABELS[t.desiredResolution] || t.desiredResolution)}</p>
      <p class="text-sm" style="margin:4px 0;">${escapeHtml(t.description)}</p>
      <p class="text-sm text-faint" style="margin:0;">${booking ? `Booking: ${escapeHtml(booking.code)} · ` : ''}${dest ? `Địa điểm: ${escapeHtml(dest.name)} · ` : ''}${t.assignedTo ? `Phụ trách: ${escapeHtml(t.assignedTo)}` : 'Chưa gán người phụ trách'}</p>
      <div class="text-sm text-faint" style="margin-top:6px;">
        ${t.timeline.map((h) => `${new Date(h.at).toLocaleString('vi-VN')} — ${escapeHtml(h.note || h.status)}`).join('<br>')}
      </div>
      ${t.status !== 'da-xu-ly' ? `
        <div class="cta-row" style="margin-top:8px;">
          <button type="button" class="btn btn-secondary btn-sm" data-assign>Gán người phụ trách</button>
          ${canRefund ? `<button type="button" class="btn btn-primary btn-sm" data-refund="${booking.id}">💸 Xử lý hoàn tiền</button>` : ''}
          <button type="button" class="btn btn-primary btn-sm" data-resolve>✓ Đánh dấu đã xử lý</button>
        </div>
      ` : ''}
    </div>
  `;
}
