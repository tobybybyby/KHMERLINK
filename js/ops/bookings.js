// Booking & Giao dịch (Cổng vận hành) — đọc TRỰC TIẾP từ getAllProviderBookings() (PHẦN 3, mục
// 3.1), cùng nguồn hợp nhất bookingItems thật + hostDemoBookings đang dùng ở Studio "Lịch &
// Booking"/"Tổng quan" (hostBookingService.js) — KHÔNG tự lọc state.bookingItems riêng, để trạng
// thái luôn khớp tuyệt đối giữa Customer/Host/Cổng vận hành mà không cần đồng bộ thủ công.
import { getState, addOpsDispatchNote } from '../storage.js';
import { escapeHtml, formatMoney, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';
import { reapExpiredHolds } from '../services/bookingService.js';
import { getAllProviderBookings, getProviderFinancialMeta } from '../services/hostBookingService.js';
import { t, registerTranslations } from '../services/i18nService.js';

registerTranslations('management', {
  opsBookings: {
    status: { pending: 'Chờ hộ xác nhận', confirmed: 'Đã xác nhận', completed: 'Đã hoàn thành', cancelled: 'Đã huỷ/từ chối' },
    payment: { unpaid: 'Chưa thanh toán', deposit_paid: 'Đã đặt cọc', paid: 'Đã thanh toán đủ', refunded: 'Đã hoàn tiền' },
    financialMode: { community_paid: 'Cộng đồng có phí', public_ticket: 'Vé tham quan', free_visit: 'Miễn phí' },
    title: 'Booking & Giao dịch',
    subtitle: 'Toàn bộ booking trên mạng lưới, cùng số liệu với Lịch & Booking của từng đơn vị.',
    matchingBookings: 'Booking khớp bộ lọc',
    completed: 'Đã hoàn thành',
    totalGuests: 'Tổng khách',
    totalGrossValue: 'Tổng giá trị booking',
    platformFee: 'Phí nền tảng',
    providerIncome: 'Thu nhập đơn vị',
    dateFrom: 'Từ ngày',
    dateTo: 'Đến ngày',
    provider: 'Đơn vị',
    allProviders: 'Tất cả đơn vị',
    activity: 'Hoạt động',
    allActivities: 'Tất cả hoạt động',
    bookingStatus: 'Trạng thái booking',
    all: 'Tất cả',
    transactionStatus: 'Trạng thái giao dịch',
    financialModeLabel: 'Financial mode',
    searchLabel: 'Tìm Booking ID / tên khách',
    searchPlaceholder: 'VD: VLT-... hoặc tên đoàn',
    matchCount: '{count} booking khớp bộ lọc',
    clearAllFilters: 'Xoá tất cả bộ lọc',
    thBookingId: 'Booking ID',
    thCustomer: 'Khách/Đoàn',
    thActivity: 'Hoạt động',
    thProvider: 'Đơn vị',
    thDate: 'Ngày',
    thTime: 'Giờ',
    thGroupSize: 'SL',
    thStatus: 'Trạng thái',
    thGross: 'Gross',
    thFee: 'Phí nền tảng',
    thIncome: 'Thu nhập đơn vị',
    thTransaction: 'Giao dịch',
    noBookingsMatch: 'Không có booking nào khớp bộ lọc.',
    dispatchNoteBtn: 'Ghi chú điều phối',
    recentTransactionsTitle: 'Giao dịch gần đây',
    thTxDate: 'Ngày',
    thTxBookingCode: 'Mã booking',
    thTxType: 'Loại',
    thTxAmount: 'Số tiền',
    thTxMethod: 'Phương thức',
    noTransactions: 'Chưa có giao dịch nào.',
    txKind: { deposit: 'Đặt cọc', full: 'Thanh toán đủ', refund: 'Hoàn tiền' },
    dispatchNoteTitle: 'Ghi chú điều phối',
    dispatchNoteDesc: 'Ghi lại bước xử lý thủ công (liên hệ khách, thống nhất đổi giờ...) — khách vẫn cần xác nhận thay đổi qua Trail theo đúng quy tắc booking.',
    saveNote: 'Lưu ghi chú',
    enterNoteContent: 'Nhập nội dung ghi chú.',
    dispatchSavedNotify: 'Đã lưu ghi chú điều phối vào lịch sử booking.',
  },
}, {
  opsBookings: {
    status: { pending: 'Awaiting provider confirmation', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled/Declined' },
    payment: { unpaid: 'Unpaid', deposit_paid: 'Deposit paid', paid: 'Fully paid', refunded: 'Refunded' },
    financialMode: { community_paid: 'Paid Community', public_ticket: 'Visitor Ticket', free_visit: 'Free' },
    title: 'Bookings & Transactions',
    subtitle: 'All bookings across the network, matching the figures in each provider\'s Calendar & Bookings.',
    matchingBookings: 'Bookings matching filters',
    completed: 'Completed',
    totalGuests: 'Total guests',
    totalGrossValue: 'Total booking value',
    platformFee: 'Platform fee',
    providerIncome: 'Provider income',
    dateFrom: 'From date',
    dateTo: 'To date',
    provider: 'Provider',
    allProviders: 'All providers',
    activity: 'Activity',
    allActivities: 'All activities',
    bookingStatus: 'Booking status',
    all: 'All',
    transactionStatus: 'Transaction status',
    financialModeLabel: 'Financial mode',
    searchLabel: 'Search Booking ID / guest name',
    searchPlaceholder: 'e.g. VLT-... or group name',
    matchCount: '{count} bookings match the filters',
    clearAllFilters: 'Clear all filters',
    thBookingId: 'Booking ID',
    thCustomer: 'Customer/Group',
    thActivity: 'Activity',
    thProvider: 'Provider',
    thDate: 'Date',
    thTime: 'Time',
    thGroupSize: 'Qty',
    thStatus: 'Status',
    thGross: 'Gross',
    thFee: 'Platform Fee',
    thIncome: 'Provider Income',
    thTransaction: 'Transaction',
    noBookingsMatch: 'No bookings match the current filters.',
    dispatchNoteBtn: 'Dispatch Note',
    recentTransactionsTitle: 'Recent Transactions',
    thTxDate: 'Date',
    thTxBookingCode: 'Booking Code',
    thTxType: 'Type',
    thTxAmount: 'Amount',
    thTxMethod: 'Method',
    noTransactions: 'No transactions yet.',
    txKind: { deposit: 'Deposit', full: 'Full payment', refund: 'Refund' },
    dispatchNoteTitle: 'Dispatch Note',
    dispatchNoteDesc: 'Record a manual processing step (contacted guest, agreed time change...) — the guest still needs to confirm changes via Trail per the standard booking rules.',
    saveNote: 'Save note',
    enterNoteContent: 'Enter the note content.',
    dispatchSavedNotify: 'Dispatch note saved to the booking history.',
  },
});

const opsBookingFilters = { dateFrom: '', dateTo: '', providerId: '', activityId: '', status: '', paymentStatus: '', financialMode: '', search: '' };

function transactionStatusOf(state, b) {
  // Chỉ booking thật (đặt qua Trail) mới có trạng thái giao dịch thật (paymentStatus trên
  // state.bookings) — booking demo cố định (hostDemoBookings) không có giao dịch thanh toán thật
  // đi kèm, hiển thị "—" thay vì suy đoán.
  if (b.source !== 'real') return null;
  const booking = state.bookings.find((x) => x.id === b.raw?.bookingId);
  return booking ? booking.paymentStatus : null;
}

function applyOpsFilters(state, bookings) {
  return bookings.filter((b) => {
    if (opsBookingFilters.dateFrom && (!b.bookingDate || b.bookingDate < opsBookingFilters.dateFrom)) return false;
    if (opsBookingFilters.dateTo && (!b.bookingDate || b.bookingDate > opsBookingFilters.dateTo)) return false;
    if (opsBookingFilters.providerId && b.providerId !== opsBookingFilters.providerId) return false;
    if (opsBookingFilters.activityId && b.activityId !== opsBookingFilters.activityId) return false;
    if (opsBookingFilters.status && b.status !== opsBookingFilters.status) return false;
    if (opsBookingFilters.financialMode && getProviderFinancialMeta(b.providerId).financialMode !== opsBookingFilters.financialMode) return false;
    if (opsBookingFilters.paymentStatus && transactionStatusOf(state, b) !== opsBookingFilters.paymentStatus) return false;
    if (opsBookingFilters.search.trim()) {
      const q = opsBookingFilters.search.trim().toLowerCase();
      const code = b.raw?.bookingId ? (state.bookings.find((x) => x.id === b.raw.bookingId)?.code || '') : '';
      if (!b.id.toLowerCase().includes(q) && !code.toLowerCase().includes(q) && !(b.customerName || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function bookingRow(state, b) {
  const label = t(`management.opsBookings.status.${b.status}`) || b.status;
  const cls = { pending: 'badge-demo', confirmed: 'badge-free', completed: 'badge-free', cancelled: 'badge-demo' }[b.status] || 'badge-type';
  const host = state.hosts.find((h) => h.id === b.providerId);
  const meta = getProviderFinancialMeta(b.providerId);
  const isFree = meta.financialMode === 'free_visit';
  const payStatus = transactionStatusOf(state, b);
  const code = b.raw?.bookingId ? (state.bookings.find((x) => x.id === b.raw.bookingId)?.code || b.id) : b.id;
  return `
    <tr data-booking-row="${b.id}" data-real-booking="${b.raw?.bookingId || ''}">
      <td>${escapeHtml(code)}</td>
      <td>${escapeHtml(b.customerName || '—')}</td>
      <td>${escapeHtml(b.activityName)}</td>
      <td>${escapeHtml(host?.name || b.providerId)}</td>
      <td>${b.bookingDate ? formatDateShort(b.bookingDate) : '—'}</td>
      <td>${escapeHtml(b.startTime || '—')}</td>
      <td>${b.groupSize}</td>
      <td><span class="badge ${cls}">${escapeHtml(label)}</span></td>
      <td>${isFree ? t('common.price.free') : formatMoney(b.grossAmount)}</td>
      <td>${isFree ? '—' : formatMoney(b.platformFee)}</td>
      <td>${isFree ? '—' : formatMoney(b.providerIncome)}</td>
      <td>${payStatus ? escapeHtml(t(`management.opsBookings.payment.${payStatus}`) || payStatus) : '—'}</td>
      <td>${(b.status === 'cancelled' && b.raw?.bookingId) ? `<button type="button" class="btn btn-secondary btn-sm" data-dispatch>${t('management.opsBookings.dispatchNoteBtn')}</button>` : ''}</td>
    </tr>
  `;
}

function kpiCardsHtml(bookings) {
  const active = bookings.filter((b) => b.status !== 'cancelled');
  const completed = active.filter((b) => b.status === 'completed');
  const paidBookings = active.filter((b) => getProviderFinancialMeta(b.providerId).financialMode !== 'free_visit');
  const grossTotal = paidBookings.reduce((s, b) => s + b.grossAmount, 0);
  const feeTotal = paidBookings.reduce((s, b) => s + b.platformFee, 0);
  const incomeTotal = paidBookings.reduce((s, b) => s + b.providerIncome, 0);
  const guestTotal = active.reduce((s, b) => s + b.groupSize, 0);
  return `
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">${t('management.opsBookings.matchingBookings')}</span><span class="quick-fact__value">${active.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.opsBookings.completed')}</span><span class="quick-fact__value">${completed.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.opsBookings.totalGuests')}</span><span class="quick-fact__value">${guestTotal}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.opsBookings.totalGrossValue')}</span><span class="quick-fact__value">${formatMoney(grossTotal)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.opsBookings.platformFee')}</span><span class="quick-fact__value">${formatMoney(feeTotal)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.opsBookings.providerIncome')}</span><span class="quick-fact__value">${formatMoney(incomeTotal)}</span></div>
    </div>
  `;
}

export function renderOpsBookings(container) {
  reapExpiredHolds();
  const state = getState();
  const allBookings = getAllProviderBookings(state, null);
  const filtered = applyOpsFilters(state, allBookings).sort((a, b) => new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0));
  const activityOptions = Array.from(new Map(allBookings.map((b) => [b.activityId, b.activityName])).entries());
  const payments = state.payments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 30);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">${t('management.opsBookings.title')}</h1>
      <p class="text-sm text-muted">${t('management.opsBookings.subtitle')}</p>
    </div>

    ${kpiCardsHtml(filtered)}

    <div class="card admin-filterbar" style="padding:14px 16px;">
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
        <div><label class="field-label" for="ob-from">${t('management.opsBookings.dateFrom')}</label><input type="date" class="field-input" id="ob-from" value="${opsBookingFilters.dateFrom}"></div>
        <div><label class="field-label" for="ob-to">${t('management.opsBookings.dateTo')}</label><input type="date" class="field-input" id="ob-to" value="${opsBookingFilters.dateTo}"></div>
        <div>
          <label class="field-label" for="ob-provider">${t('management.opsBookings.provider')}</label>
          <select class="field-select" id="ob-provider">
            <option value="">${t('management.opsBookings.allProviders')}</option>
            ${state.hosts.map((h) => `<option value="${h.id}" ${opsBookingFilters.providerId === h.id ? 'selected' : ''}>${escapeHtml(h.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="ob-activity">${t('management.opsBookings.activity')}</label>
          <select class="field-select" id="ob-activity">
            <option value="">${t('management.opsBookings.allActivities')}</option>
            ${activityOptions.map(([id, name]) => `<option value="${id}" ${opsBookingFilters.activityId === id ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="ob-status">${t('management.opsBookings.bookingStatus')}</label>
          <select class="field-select" id="ob-status">
            <option value="">${t('management.opsBookings.all')}</option>
            ${['pending', 'confirmed', 'completed', 'cancelled'].map((k) => `<option value="${k}" ${opsBookingFilters.status === k ? 'selected' : ''}>${escapeHtml(t(`management.opsBookings.status.${k}`))}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="ob-payment">${t('management.opsBookings.transactionStatus')}</label>
          <select class="field-select" id="ob-payment">
            <option value="">${t('management.opsBookings.all')}</option>
            ${['unpaid', 'deposit_paid', 'paid', 'refunded'].map((k) => `<option value="${k}" ${opsBookingFilters.paymentStatus === k ? 'selected' : ''}>${escapeHtml(t(`management.opsBookings.payment.${k}`))}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="ob-financial">${t('management.opsBookings.financialModeLabel')}</label>
          <select class="field-select" id="ob-financial">
            <option value="">${t('management.opsBookings.all')}</option>
            ${['community_paid', 'public_ticket', 'free_visit'].map((k) => `<option value="${k}" ${opsBookingFilters.financialMode === k ? 'selected' : ''}>${escapeHtml(t(`management.opsBookings.financialMode.${k}`))}</option>`).join('')}
          </select>
        </div>
        <div><label class="field-label" for="ob-search">${t('management.opsBookings.searchLabel')}</label><input type="text" class="field-input" id="ob-search" placeholder="${t('management.opsBookings.searchPlaceholder')}" value="${escapeHtml(opsBookingFilters.search)}"></div>
      </div>
      <div class="flex justify-between items-center gap-2 wrap" style="margin-top:8px;">
        <span class="text-sm text-muted">${t('management.opsBookings.matchCount', { count: filtered.length })}</span>
        <button type="button" class="chip" id="ob-clear">${t('management.opsBookings.clearAllFilters')}</button>
      </div>
    </div>

    <section class="card" style="padding:16px;overflow-x:auto;">
      <table class="admin-table">
        <thead><tr><th>${t('management.opsBookings.thBookingId')}</th><th>${t('management.opsBookings.thCustomer')}</th><th>${t('management.opsBookings.thActivity')}</th><th>${t('management.opsBookings.thProvider')}</th><th>${t('management.opsBookings.thDate')}</th><th>${t('management.opsBookings.thTime')}</th><th>${t('management.opsBookings.thGroupSize')}</th><th>${t('management.opsBookings.thStatus')}</th><th>${t('management.opsBookings.thGross')}</th><th>${t('management.opsBookings.thFee')}</th><th>${t('management.opsBookings.thIncome')}</th><th>${t('management.opsBookings.thTransaction')}</th><th></th></tr></thead>
        <tbody>${filtered.length ? filtered.map((b) => bookingRow(state, b)).join('') : `<tr><td colspan="13" class="text-sm text-faint">${t('management.opsBookings.noBookingsMatch')}</td></tr>`}</tbody>
      </table>
    </section>

    <section class="card" style="padding:16px;overflow-x:auto;">
      <h3 style="margin-top:0;">${t('management.opsBookings.recentTransactionsTitle')}</h3>
      <table class="admin-table">
        <thead><tr><th>${t('management.opsBookings.thTxDate')}</th><th>${t('management.opsBookings.thTxBookingCode')}</th><th>${t('management.opsBookings.thTxType')}</th><th>${t('management.opsBookings.thTxAmount')}</th><th>${t('management.opsBookings.thTxMethod')}</th></tr></thead>
        <tbody>${payments.length ? payments.map((p) => {
          const booking = state.bookings.find((x) => x.id === p.bookingId);
          const kindLabel = t(`management.opsBookings.txKind.${p.kind}`) || p.kind;
          return `<tr><td>${formatDateShort(p.createdAt)}</td><td>${booking ? escapeHtml(booking.code) : '—'}</td><td>${escapeHtml(kindLabel)}</td><td>${formatMoney(p.amount)}</td><td>${escapeHtml(p.method)}</td></tr>`;
        }).join('') : `<tr><td colspan="5" class="text-sm text-faint">${t('management.opsBookings.noTransactions')}</td></tr>`}</tbody>
      </table>
    </section>
  `;

  const bind = (id, key) => {
    qs(`#${id}`, container).addEventListener('change', (e) => { opsBookingFilters[key] = e.target.value; renderOpsBookings(container); });
  };
  bind('ob-from', 'dateFrom');
  bind('ob-to', 'dateTo');
  bind('ob-provider', 'providerId');
  bind('ob-activity', 'activityId');
  bind('ob-status', 'status');
  bind('ob-payment', 'paymentStatus');
  bind('ob-financial', 'financialMode');
  qs('#ob-search', container).addEventListener('input', (e) => { opsBookingFilters.search = e.target.value; renderOpsBookings(container); });
  qs('#ob-clear', container).addEventListener('click', () => {
    Object.keys(opsBookingFilters).forEach((k) => { opsBookingFilters[k] = ''; });
    renderOpsBookings(container);
  });

  qsa('[data-dispatch]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const bookingId = btn.closest('tr').dataset.realBooking;
      if (!bookingId) return;
      const close = openModal({
        title: t('management.opsBookings.dispatchNoteTitle'),
        bodyHtml: `
          <div class="flex-col gap-3">
            <p class="text-sm text-faint">${t('management.opsBookings.dispatchNoteDesc')}</p>
            <textarea class="field-input" id="dispatch-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="dispatch-confirm">${t('management.opsBookings.saveNote')}</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#dispatch-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#dispatch-note', modalEl).value.trim();
            if (!note) { NotificationService.notify(t('management.opsBookings.enterNoteContent'), 'error'); return; }
            addOpsDispatchNote(bookingId, note);
            closeFn();
            NotificationService.notify(t('management.opsBookings.dispatchSavedNotify'), 'success');
          });
        },
      });
      if (!close) return;
    });
  });
}
