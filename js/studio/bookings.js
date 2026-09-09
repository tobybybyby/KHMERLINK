import { getState } from '../storage.js';
import { escapeHtml, formatMoney, formatDateShort, qs, qsa } from '../utils.js';
import { respondToBooking, completeBookingItem, releasePayout, findExperienceAndSlot, reapExpiredHolds } from '../services/bookingService.js';
import { NotificationService } from '../services/notificationService.js';
import { confirmDialog, openModal } from '../ui.js';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'accepted', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

const STATUS_BADGE = {
  pending: ['Chờ xác nhận', 'badge-demo'],
  accepted: ['Đã xác nhận', 'badge-free'],
  completed: ['Đã hoàn thành', 'badge-free'],
  rejected: ['Bị từ chối', 'badge-recognized'],
  cancelled: ['Đã huỷ', 'badge-demo'],
};

const PAYMENT_LABEL = {
  unpaid: 'Chưa thanh toán',
  deposit_paid: 'Đã đặt cọc',
  paid: 'Đã thanh toán đủ',
  refunded: 'Đã hoàn tiền',
};

let filterStatus = '';

function hostExperienceIds(state, hostId) {
  return new Set(state.experiences.filter((e) => e.hostId === hostId).map((e) => e.id));
}

function itemCardHtml(state, bi) {
  const { slot } = findExperienceAndSlot(bi.experienceId, bi.slotId);
  const booking = state.bookings.find((b) => b.id === bi.bookingId);
  const dest = state.destinations.find((d) => d.id === bi.destinationId);
  const [label, cls] = STATUS_BADGE[bi.status] || [bi.status, 'badge-type'];
  const canReleasePayout = booking && booking.payoutStatus === 'holding' && bi.status === 'completed'
    && !state.bookingItems.some((x) => x.bookingId === booking.id && x.id !== bi.id && x.status !== 'completed' && x.status !== 'cancelled' && x.status !== 'rejected');

  return `
    <div class="activity-card" data-bi="${bi.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(bi.title)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${dest ? escapeHtml(dest.name) : ''} · ${slot ? `${formatDateShort(slot.date)} · ${slot.startTime}–${slot.endTime}` : ''}</p>
      <p class="text-sm" style="margin:0;">👥 ${bi.quantity} khách · ${formatMoney(bi.subtotal)} · ${escapeHtml(PAYMENT_LABEL[booking?.paymentStatus] || '—')}</p>
      <p class="text-sm text-muted" style="margin:0;">Mã booking: ${booking ? escapeHtml(booking.code) : '—'}</p>
      ${bi.hostNote ? `<p class="text-sm text-faint" style="margin:0;">Ghi chú: ${escapeHtml(bi.hostNote)}</p>` : ''}
      <div class="cta-row" style="margin-top:6px;">
        ${bi.status === 'pending' ? `
          <button type="button" class="btn btn-primary btn-sm" data-act="accept">✓ Chấp nhận</button>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-act="reject">✕ Từ chối</button>
        ` : ''}
        ${bi.status === 'accepted' ? '<button type="button" class="btn btn-accent btn-sm" data-act="complete">✓ Xác nhận hoàn thành</button>' : ''}
        ${canReleasePayout ? '<button type="button" class="btn btn-secondary btn-sm" data-act="payout">💰 Giải ngân (demo)</button>' : ''}
      </div>
    </div>
  `;
}

export function renderBookings(container, hostId) {
  reapExpiredHolds();
  const state = getState();
  const expIds = hostExperienceIds(state, hostId);
  const items = state.bookingItems
    .filter((bi) => expIds.has(bi.experienceId))
    .filter((bi) => !filterStatus || bi.status === filterStatus)
    .sort((a, b) => new Date(b.statusHistory[0]?.at || 0) - new Date(a.statusHistory[0]?.at || 0));

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Lịch & Booking</h1>
      <p class="text-sm text-muted">Booking khách đặt từ Trail xuất hiện tại đây ngay lập tức (dùng chung một dữ liệu, không cần đồng bộ).</p>
    </div>
    <div class="explore-toolbar" style="background:transparent;border:none;padding:0;">
      <select class="field-select" id="booking-status-filter" style="max-width:220px;">
        ${STATUS_OPTIONS.map((o) => `<option value="${o.value}" ${o.value === filterStatus ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
      </select>
    </div>
    <div class="flex-col gap-3" id="booking-list">
      ${items.length ? items.map((bi) => itemCardHtml(state, bi)).join('') : '<p class="text-sm text-faint">Không có booking nào khớp bộ lọc.</p>'}
    </div>
  `;

  qs('#booking-status-filter', container).addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderBookings(container, hostId);
  });

  qsa('[data-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const biId = btn.closest('[data-bi]').dataset.bi;
      const act = btn.dataset.act;
      if (act === 'accept') {
        const r = respondToBooking(state.bookingItems.find((x) => x.id === biId).bookingId, [{ bookingItemId: biId, decision: 'accept' }]);
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
        NotificationService.notify('Đã chấp nhận booking.', 'success');
        renderBookings(container, hostId);
      } else if (act === 'reject') {
        openModal({
          title: 'Từ chối booking',
          bodyHtml: `
            <div class="flex-col gap-3">
              <label class="field-label" for="reject-reason">Lý do từ chối</label>
              <select class="field-select" id="reject-reason">
                <option value="Hết chỗ vào phút chót">Hết chỗ vào phút chót</option>
                <option value="Có việc gia đình/mùa vụ đột xuất">Có việc gia đình/mùa vụ đột xuất</option>
                <option value="Không phù hợp điều kiện tham gia">Không phù hợp điều kiện tham gia</option>
                <option value="Khác">Khác</option>
              </select>
              <div class="modal__actions"><button type="button" class="btn btn-primary" id="confirm-reject">Xác nhận từ chối</button></div>
            </div>
          `,
          onMount: (modalEl, closeFn) => {
            qs('#confirm-reject', modalEl).addEventListener('click', () => {
              const reason = qs('#reject-reason', modalEl).value;
              const bookingId = state.bookingItems.find((x) => x.id === biId).bookingId;
              const r = respondToBooking(bookingId, [{ bookingItemId: biId, decision: 'reject', reason }]);
              closeFn();
              if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
              NotificationService.notify('Đã từ chối booking — khách sẽ thấy cập nhật.', 'info');
              renderBookings(container, hostId);
            });
          },
        });
      } else if (act === 'complete') {
        confirmDialog({ title: 'Xác nhận hoàn thành?', message: 'Xác nhận khách đã tham gia và hoàn thành trải nghiệm này?', confirmLabel: 'Xác nhận' }).then((ok) => {
          if (!ok) return;
          const r = completeBookingItem(biId);
          if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
          NotificationService.notify('Đã xác nhận hoàn thành — khoản tiền chuyển sang trạng thái đang giữ.', 'success');
          renderBookings(container, hostId);
        });
      } else if (act === 'payout') {
        const bookingId = state.bookingItems.find((x) => x.id === biId).bookingId;
        const r = releasePayout(bookingId);
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
        NotificationService.notify('Đã giải ngân (mô phỏng).', 'success');
        renderBookings(container, hostId);
      }
    });
  });
}
