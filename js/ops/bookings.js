import { getState, addOpsDispatchNote } from '../storage.js';
import { escapeHtml, formatMoney, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';
import { reapExpiredHolds } from '../services/bookingService.js';

const STATUS_LABELS = {
  pending: ['Chờ hộ xác nhận', 'badge-demo'],
  accepted: ['Đã xác nhận', 'badge-free'],
  completed: ['Đã hoàn thành', 'badge-free'],
  rejected: ['Bị từ chối', 'badge-recognized'],
  cancelled: ['Đã huỷ', 'badge-demo'],
};

const PAYMENT_LABEL = { unpaid: 'Chưa thanh toán', deposit_paid: 'Đã đặt cọc', paid: 'Đã thanh toán đủ', refunded: 'Đã hoàn tiền' };
const PAYOUT_LABEL = { not_applicable: '—', pending: 'Chưa đủ điều kiện', holding: 'Đang giữ', released: 'Đã giải ngân' };

let filterStatus = '';
let filterHost = '';
let searchCode = '';

function bookingItemRow(state, bi) {
  const booking = state.bookings.find((b) => b.id === bi.bookingId);
  const dest = state.destinations.find((d) => d.id === bi.destinationId);
  const exp = state.experiences.find((e) => e.id === bi.experienceId);
  const host = exp && state.hosts.find((h) => h.id === exp.hostId);
  const [label, cls] = STATUS_LABELS[bi.status] || [bi.status, 'badge-type'];
  return `
    <tr data-bi="${bi.id}" data-booking="${bi.bookingId}">
      <td>${booking ? escapeHtml(booking.code) : '—'}</td>
      <td>${escapeHtml(dest?.name || '—')}</td>
      <td>${escapeHtml(host?.name || '—')}</td>
      <td>${escapeHtml(bi.title)}</td>
      <td>${bi.quantity}</td>
      <td>${formatMoney(bi.subtotal)}</td>
      <td><span class="badge ${cls}">${escapeHtml(label)}</span></td>
      <td>${escapeHtml(PAYMENT_LABEL[booking?.paymentStatus] || '—')}</td>
      <td>${escapeHtml(PAYOUT_LABEL[booking?.payoutStatus] || '—')}</td>
      <td>${formatDateShort(bi.statusHistory[0]?.at)}</td>
      <td>${(bi.status === 'rejected' || bi.status === 'cancelled') ? '<button type="button" class="btn btn-secondary btn-sm" data-dispatch>Ghi chú điều phối</button>' : ''}</td>
    </tr>
  `;
}

function transactionRow(state, p) {
  const booking = state.bookings.find((b) => b.id === p.bookingId);
  const kindLabel = { deposit: 'Đặt cọc', full: 'Thanh toán đủ', refund: 'Hoàn tiền' }[p.kind] || p.kind;
  return `
    <tr>
      <td>${formatDateShort(p.createdAt)}</td>
      <td>${booking ? escapeHtml(booking.code) : '—'}</td>
      <td>${escapeHtml(kindLabel)}</td>
      <td>${formatMoney(p.amount)}</td>
      <td>${escapeHtml(p.method)}</td>
    </tr>
  `;
}

export function renderOpsBookings(container) {
  reapExpiredHolds();
  const state = getState();
  let items = state.bookingItems.slice();
  if (filterStatus) items = items.filter((bi) => bi.status === filterStatus);
  if (filterHost) {
    const hostExpIds = new Set(state.experiences.filter((e) => e.hostId === filterHost).map((e) => e.id));
    items = items.filter((bi) => hostExpIds.has(bi.experienceId));
  }
  if (searchCode.trim()) {
    const q = searchCode.trim().toLowerCase();
    items = items.filter((bi) => {
      const booking = state.bookings.find((b) => b.id === bi.bookingId);
      return booking && booking.code.toLowerCase().includes(q);
    });
  }
  items.sort((a, b) => new Date(b.statusHistory[0]?.at || 0) - new Date(a.statusHistory[0]?.at || 0));

  const payments = state.payments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 30);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Booking & Giao dịch</h1>
      <p class="text-sm text-muted">Toàn bộ booking và giao dịch trên mạng lưới (mọi hộ) — dùng chung dữ liệu với Trail/Studio. Điều phối thủ công ở đây chỉ ghi chú nội bộ; đổi giờ/điểm thực tế vẫn cần khách xác nhận qua Trail theo đúng quy tắc booking.</p>
    </div>

    <div class="explore-toolbar" style="background:transparent;border:none;padding:0;">
      <select class="field-select" id="ops-status-filter" style="max-width:200px;">
        <option value="">Tất cả trạng thái</option>
        ${Object.entries(STATUS_LABELS).map(([k, [l]]) => `<option value="${k}" ${filterStatus === k ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}
      </select>
      <select class="field-select" id="ops-host-filter" style="max-width:220px;">
        <option value="">Tất cả hộ</option>
        ${state.hosts.map((h) => `<option value="${h.id}" ${filterHost === h.id ? 'selected' : ''}>${escapeHtml(h.name)}</option>`).join('')}
      </select>
      <input type="text" class="field-input" id="ops-search-code" placeholder="Tìm theo mã booking..." value="${escapeHtml(searchCode)}" style="max-width:220px;">
    </div>

    <section class="card" style="padding:16px;overflow-x:auto;">
      <table class="admin-table">
        <thead><tr><th>Mã booking</th><th>Địa điểm</th><th>Hộ</th><th>Hoạt động</th><th>SL</th><th>Tiền</th><th>Trạng thái</th><th>Thanh toán</th><th>Giải ngân</th><th>Ngày</th><th></th></tr></thead>
        <tbody>${items.length ? items.map((bi) => bookingItemRow(state, bi)).join('') : '<tr><td colspan="11" class="text-sm text-faint">Không có booking nào khớp bộ lọc.</td></tr>'}</tbody>
      </table>
    </section>

    <section class="card" style="padding:16px;overflow-x:auto;">
      <h3 style="margin-top:0;">Giao dịch gần đây</h3>
      <table class="admin-table">
        <thead><tr><th>Ngày</th><th>Mã booking</th><th>Loại</th><th>Số tiền</th><th>Phương thức</th></tr></thead>
        <tbody>${payments.length ? payments.map((p) => transactionRow(state, p)).join('') : '<tr><td colspan="5" class="text-sm text-faint">Chưa có giao dịch nào.</td></tr>'}</tbody>
      </table>
    </section>
  `;

  qs('#ops-status-filter', container).addEventListener('change', (e) => { filterStatus = e.target.value; renderOpsBookings(container); });
  qs('#ops-host-filter', container).addEventListener('change', (e) => { filterHost = e.target.value; renderOpsBookings(container); });
  qs('#ops-search-code', container).addEventListener('input', (e) => { searchCode = e.target.value; renderOpsBookings(container); });

  qsa('[data-dispatch]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const bookingId = btn.closest('tr').dataset.booking;
      const close = openModal({
        title: 'Ghi chú điều phối',
        bodyHtml: `
          <div class="flex-col gap-3">
            <p class="text-sm text-faint">Vd: đã liên hệ khách qua kênh demo, thống nhất đổi giờ/chuyển trải nghiệm — khách xác nhận thay đổi thật qua Trail.</p>
            <textarea class="field-input" id="dispatch-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="dispatch-confirm">Lưu ghi chú</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#dispatch-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#dispatch-note', modalEl).value.trim();
            if (!note) { NotificationService.notify('Nhập nội dung ghi chú.', 'error'); return; }
            addOpsDispatchNote(bookingId, note);
            closeFn();
            NotificationService.notify('Đã lưu ghi chú điều phối vào lịch sử booking.', 'success');
          });
        },
      });
      if (!close) return;
    });
  });
}
