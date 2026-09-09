import { getState, upsertHostExperience } from '../storage.js';
import { escapeHtml, formatCurrency, formatDateShort, uid, qs, qsa } from '../utils.js';
import { getSlotRemaining } from '../services/bookingService.js';
import { NotificationService } from '../services/notificationService.js';
import { confirmDialog } from '../ui.js';

const STATUS_LABELS = {
  draft: ['Nháp', 'badge-demo'],
  pending_review: ['Chờ duyệt', 'badge-type'],
  published: ['Đã công bố', 'badge-free'],
};

function slotRowHtml(exp, slot) {
  const remaining = getSlotRemaining(slot);
  const isOpen = slot.isOpen !== false;
  return `
    <div class="flex justify-between items-center gap-2 wrap" data-slot="${slot.id}" style="padding:8px 0;border-bottom:1px solid var(--color-border);">
      <span class="text-sm">${formatDateShort(slot.date)} · ${slot.startTime}–${slot.endTime} · sức chứa ${slot.capacity} (còn ${remaining})</span>
      <div class="cta-row">
        <button type="button" class="btn btn-secondary btn-sm" data-slot-act="toggle">${isOpen ? 'Đóng slot' : 'Mở lại'}</button>
        <button type="button" class="btn btn-danger-ghost btn-sm" data-slot-act="remove" ${slot.booked > 0 ? 'disabled title="Đã có khách đặt, không thể xoá"' : ''}>Xoá</button>
      </div>
    </div>
  `;
}

function formHtml(exp, destName) {
  const [statusLabel, statusCls] = STATUS_LABELS[exp.status] || ['Nháp', 'badge-demo'];
  return `
    <a href="#/studio/experiences" class="text-sm" id="exp-back-link">← Về danh sách trải nghiệm</a>
    <div class="flex justify-between items-center gap-2 wrap" style="margin-top:8px;">
      <h1 style="margin:0;">${exp.id ? 'Chỉnh sửa trải nghiệm' : 'Thêm trải nghiệm mới'}</h1>
      <span class="badge ${statusCls}">${escapeHtml(statusLabel)}</span>
    </div>
    <p class="text-sm text-muted">Địa điểm: ${escapeHtml(destName || 'Chưa gắn địa điểm')} — hồ sơ địa điểm quản lý riêng, đây chỉ là hoạt động trải nghiệm tổ chức tại đó.</p>

    <div class="card" style="padding:20px;">
      <div class="flex-col gap-3">
        <div><label class="field-label" for="exp-title">Tên trải nghiệm</label><input type="text" class="field-input" id="exp-title" value="${escapeHtml(exp.title || '')}"></div>
        <div><label class="field-label" for="exp-desc">Giới thiệu / câu chuyện</label><textarea class="field-input" id="exp-desc" rows="3">${escapeHtml(exp.description || '')}</textarea></div>
        <div class="quick-facts">
          <div><label class="field-label" for="exp-price">Giá (đ, 0 = miễn phí)</label><input type="number" min="0" step="1000" class="field-input" id="exp-price" value="${exp.price ?? 0}"></div>
          <div><label class="field-label" for="exp-duration">Thời lượng (phút)</label><input type="number" min="5" class="field-input" id="exp-duration" value="${exp.durationMin ?? 60}"></div>
        </div>
        <div><label class="field-label" for="exp-conditions">Điều kiện nhận khách</label><input type="text" class="field-input" id="exp-conditions" value="${escapeHtml(exp.conditions || '')}" placeholder="VD: phù hợp mọi lứa tuổi, tối thiểu 2 khách..."></div>
      </div>
    </div>

    <div class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Khung giờ (slot)</h3>
      <div id="slot-list">${(exp.slots || []).map((s) => slotRowHtml(exp, s)).join('') || '<p class="text-sm text-faint">Chưa có khung giờ nào.</p>'}</div>
      <div class="flex-col gap-2" style="margin-top:12px;">
        <span class="field-label">Thêm khung giờ mới</span>
        <div class="quick-facts">
          <div><label class="field-label" for="new-slot-date">Ngày</label><input type="date" class="field-input" id="new-slot-date"></div>
          <div><label class="field-label" for="new-slot-start">Giờ bắt đầu</label><input type="time" class="field-input" id="new-slot-start" value="09:00"></div>
          <div><label class="field-label" for="new-slot-end">Giờ kết thúc</label><input type="time" class="field-input" id="new-slot-end" value="10:00"></div>
          <div><label class="field-label" for="new-slot-capacity">Sức chứa</label><input type="number" min="1" class="field-input" id="new-slot-capacity" value="10"></div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="add-slot-btn" style="align-self:flex-start;">➕ Thêm khung giờ</button>
      </div>
    </div>

    <div class="cta-row">
      <button type="button" class="btn btn-secondary" id="save-draft-btn">Lưu nháp</button>
      ${exp.status !== 'published' ? '<button type="button" class="btn btn-primary" id="submit-review-btn">Gửi duyệt</button>' : ''}
      ${exp.status === 'pending_review' ? '<button type="button" class="btn btn-accent" id="simulate-approve-btn">🎭 Mô phỏng: cộng đồng/vận hành duyệt</button>' : ''}
    </div>
  `;
}

function readFormFields(root, exp) {
  exp.title = qs('#exp-title', root).value.trim();
  exp.description = qs('#exp-desc', root).value.trim();
  exp.price = Math.max(0, Number(qs('#exp-price', root).value) || 0);
  exp.durationMin = Math.max(5, Number(qs('#exp-duration', root).value) || 60);
  exp.conditions = qs('#exp-conditions', root).value.trim();
}

function renderForm(container, hostId, existingExp) {
  const state = getState();
  const host = state.hosts.find((h) => h.id === hostId);
  const dest = state.destinations.find((d) => d.id === host?.destinationId);

  const exp = existingExp ? JSON.parse(JSON.stringify(existingExp)) : {
    id: null, hostId, destinationId: host?.destinationId || null,
    title: '', description: '', durationMin: 60, price: 0, conditions: '',
    slots: [], status: 'draft',
  };

  container.innerHTML = formHtml(exp, dest?.name);

  function refresh() {
    container.innerHTML = formHtml(exp, dest?.name);
    wire();
  }

  function wire() {
    qs('#add-slot-btn', container).addEventListener('click', () => {
      const date = qs('#new-slot-date', container).value;
      const start = qs('#new-slot-start', container).value;
      const end = qs('#new-slot-end', container).value;
      const capacity = Math.max(1, Number(qs('#new-slot-capacity', container).value) || 1);
      if (!date) { NotificationService.notify('Chọn ngày cho khung giờ mới.', 'error'); return; }
      readFormFields(container, exp);
      exp.slots.push({ id: uid('slot'), date: new Date(date).toISOString(), startTime: start, endTime: end, capacity, booked: 0, isOpen: true });
      refresh();
    });

    qsa('[data-slot-act]', container).forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotId = btn.closest('[data-slot]').dataset.slot;
        const slot = exp.slots.find((s) => s.id === slotId);
        readFormFields(container, exp);
        if (btn.dataset.slotAct === 'toggle') {
          slot.isOpen = slot.isOpen === false;
        } else if (btn.dataset.slotAct === 'remove') {
          exp.slots = exp.slots.filter((s) => s.id !== slotId);
        }
        refresh();
      });
    });

    qs('#save-draft-btn', container).addEventListener('click', () => {
      readFormFields(container, exp);
      if (!exp.id) exp.id = uid('exp');
      if (!exp.title) { NotificationService.notify('Nhập tên trải nghiệm trước khi lưu.', 'error'); return; }
      upsertHostExperience(exp);
      NotificationService.notify('Đã lưu nháp.', 'success');
      window.location.hash = '#/studio/experiences';
    });

    qs('#submit-review-btn', container)?.addEventListener('click', () => {
      readFormFields(container, exp);
      if (!exp.id) exp.id = uid('exp');
      if (!exp.title || !exp.description) { NotificationService.notify('Cần có tên và mô tả trước khi gửi duyệt.', 'error'); return; }
      exp.status = 'pending_review';
      upsertHostExperience(exp);
      NotificationService.notify('Đã gửi duyệt — nội dung công bố cũ (nếu có) vẫn hiển thị cho khách cho tới khi bản mới được duyệt.', 'success');
      window.location.hash = '#/studio/experiences';
    });

    qs('#simulate-approve-btn', container)?.addEventListener('click', () => {
      exp.status = 'published';
      upsertHostExperience(exp);
      NotificationService.notify('Đã duyệt (mô phỏng) — nội dung hiện công bố cho khách.', 'success');
      window.location.hash = '#/studio/experiences';
    });
  }

  wire();
}

export function renderExperiences(container, hostId, params = {}) {
  const state = getState();
  if (params.editId || params.newExp) {
    const existing = params.editId ? state.experiences.find((e) => e.id === params.editId) : null;
    renderForm(container, hostId, existing);
    return;
  }

  const exps = state.experiences.filter((e) => e.hostId === hostId);

  container.innerHTML = `
    <div class="flex justify-between items-center gap-2 wrap">
      <h1 style="margin:0;">Trải nghiệm</h1>
      <button type="button" class="btn btn-accent" id="new-exp-btn">➕ Thêm trải nghiệm</button>
    </div>
    <div class="flex-col gap-3">
      ${exps.length ? exps.map((exp) => {
        const [label, cls] = STATUS_LABELS[exp.status] || ['Đã công bố', 'badge-free'];
        const dest = state.destinations.find((d) => d.id === exp.destinationId);
        return `
          <div class="activity-card">
            <div class="activity-card__head">
              <strong>${escapeHtml(exp.title)}</strong>
              <span class="badge ${cls}">${escapeHtml(label)}</span>
            </div>
            <p class="text-sm text-muted" style="margin:0;">${dest ? escapeHtml(dest.name) : ''} · ${formatCurrency(exp.price)} · ${exp.durationMin} phút · ${(exp.slots || []).length} khung giờ</p>
            <button type="button" class="btn btn-secondary btn-sm" data-edit="${exp.id}" style="margin-top:6px;align-self:flex-start;">Chỉnh sửa</button>
          </div>
        `;
      }).join('') : '<p class="text-sm text-faint">Chưa có trải nghiệm nào — bấm "Thêm trải nghiệm" để bắt đầu.</p>'}
    </div>
  `;

  qs('#new-exp-btn', container).addEventListener('click', () => { window.location.hash = '#/studio/experiences/new'; });
  qsa('[data-edit]', container).forEach((btn) => {
    btn.addEventListener('click', () => { window.location.hash = `#/studio/experiences/${btn.dataset.edit}`; });
  });
}
