import { createSupportTicket, getState } from '../storage.js';
import { escapeHtml, qs } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';

const CATEGORY_OPTIONS = [
  { value: 'ho-khong-don-khach', label: 'Hộ không đón khách' },
  { value: 'gia-sai', label: 'Giá sai so với mô tả' },
  { value: 'an-toan', label: 'Vấn đề an toàn' },
  { value: 'khac-mo-ta', label: 'Hoạt động khác mô tả' },
  { value: 'khac', label: 'Khác' },
];

const RESOLUTION_OPTIONS = [
  { value: 'doi-gio', label: 'Đổi giờ' },
  { value: 'doi-trai-nghiem', label: 'Chuyển trải nghiệm tương tự gần đó' },
  { value: 'hoan-tien', label: 'Hoàn tiền' },
];

export function openSupportModal({ destinationId = null, itineraryId = null, bookingId = null } = {}) {
  const bodyHtml = `
    <form id="support-form" class="flex-col gap-3">
      <div>
        <label class="field-label" for="sp-category">Loại sự cố</label>
        <select class="field-select" id="sp-category">
          ${CATEGORY_OPTIONS.map((o) => `<option value="${o.value}">${escapeHtml(o.label)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="field-label" for="sp-desc">Mô tả</label>
        <textarea class="field-input" id="sp-desc" rows="4" placeholder="Mô tả sự việc..." required></textarea>
      </div>
      <div>
        <label class="field-label" for="sp-resolution">Bạn mong muốn</label>
        <select class="field-select" id="sp-resolution">
          ${RESOLUTION_OPTIONS.map((o) => `<option value="${o.value}">${escapeHtml(o.label)}</option>`).join('')}
        </select>
      </div>
      <p class="text-sm text-faint">Ảnh minh hoạ đính kèm chưa hỗ trợ trong bản demo — bạn có thể mô tả chi tiết trong phần mô tả.</p>
      <div class="modal__actions">
        <button type="submit" class="btn btn-primary btn-block">Gửi yêu cầu hỗ trợ</button>
      </div>
    </form>
  `;
  const close = openModal({
    title: 'Cần hỗ trợ / Báo cáo sự cố',
    bodyHtml,
    onMount: (modalEl, closeFn) => {
      qs('#support-form', modalEl).addEventListener('submit', (e) => {
        e.preventDefault();
        const category = qs('#sp-category', modalEl).value;
        const description = qs('#sp-desc', modalEl).value.trim();
        const desiredResolution = qs('#sp-resolution', modalEl).value;
        if (!description) return;
        const ticket = createSupportTicket({ category, description, bookingId, destinationId, desiredResolution });
        closeFn();
        NotificationService.notify(`Đã gửi yêu cầu hỗ trợ — mã ${ticket.code}. Mục tiêu xử lý 1–2 ngày làm việc (không phải bảo đảm).`, 'success');
      });
    },
  });
  return close;
}

const STATUS_LABELS = {
  moi: 'Mới',
  'dang-xu-ly': 'Đang xử lý',
  'da-xu-ly': 'Đã xử lý',
};

export function renderTicketListHtml() {
  const state = getState();
  if (!state.supportTickets.length) {
    return '<p class="text-sm text-faint">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>';
  }
  return state.supportTickets
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((t) => `
      <div class="card" style="padding:14px;">
        <div class="flex justify-between items-center gap-2 wrap">
          <strong>${escapeHtml(t.code)}</strong>
          <span class="badge ${t.status === 'da-xu-ly' ? 'badge-free' : 'badge-demo'}">${escapeHtml(STATUS_LABELS[t.status] || t.status)}</span>
        </div>
        <p class="text-sm text-muted" style="margin:4px 0;">${escapeHtml(t.description)}</p>
        <div class="text-sm text-faint">
          ${t.timeline.map((h) => `${new Date(h.at).toLocaleString('vi-VN')} — ${escapeHtml(h.note || h.status)}`).join('<br>')}
        </div>
      </div>
    `).join('');
}
