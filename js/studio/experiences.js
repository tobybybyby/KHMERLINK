import { getState, upsertHostExperience, updateActivityCatalogOverride } from '../storage.js';
import { escapeHtml, formatCurrency, formatDateShort, uid, qs, qsa } from '../utils.js';
import { getSlotRemaining } from '../services/bookingService.js';
import { getOperations, formatPricePerPerson } from '../services/operationsService.js';
import { getProviderMetrics, getCurrentPeriod } from '../services/hostBookingService.js';
import { getRatingStatsForListing, formatRatingStats } from '../services/reviewsService.js';
import { NotificationService } from '../services/notificationService.js';

const STATUS_LABELS = {
  draft: ['Nháp', 'badge-demo'],
  pending_review: ['Chờ duyệt', 'badge-type'],
  published: ['Đã công bố', 'badge-free'],
};

// Tiêu đề mục theo offeringType (mục 4 yêu cầu 15/09/2026) — không phải mọi đơn vị đều có "trải
// nghiệm" trả phí, chùa/cụm/bảo tàng cần heading phù hợp bản chất, không để tab trống hoặc gọi sai.
const OFFERING_HEADING = {
  paid_experience: 'Trải nghiệm',
  public_ticket_visit: 'Hoạt động tham quan',
  free_cultural_visit: 'Địa điểm đang quản lý',
};

const BOOKING_COUNT_LABEL = { free_visit: 'Lượt đăng ký trong tháng', public_ticket: 'Booking trong tháng', community_paid: 'Booking trong tháng' };

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
    </div>
    ${exp.status === 'pending_review' ? '<p class="text-sm text-faint">Đang chờ cộng đồng/vận hành duyệt trong Cổng vận hành — nội dung công bố cũ (nếu có) vẫn hiển thị cho khách cho tới khi bản mới được duyệt.</p>' : ''}
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
  }

  wire();
}

// ---------- Activity Catalog: thẻ + form chỉnh sửa cho listing pilot gắn với host (PHASE "Data
// Linkage" 15/09/2026) — nguồn DUY NHẤT với Customer/AI/Cổng quản lý, xem operationsService.js. ----------

function catalogCardHtml(state, host, dest, ops) {
  const pm = getProviderMetrics(state, host.id, getCurrentPeriod());
  const ratingStats = getRatingStatsForListing(state, dest.id);
  const isFree = ops.financialMode === 'free_visit';
  const priceText = isFree ? 'Miễn phí' : formatPricePerPerson(ops.pricePerPerson);
  const bookingLabel = BOOKING_COUNT_LABEL[ops.financialMode] || 'Booking trong tháng';
  const statusBadge = ops.publicationStatus === 'published'
    ? '<span class="badge badge-free">Đã công bố</span>'
    : '<span class="badge badge-demo">Tạm dừng nhận khách</span>';
  const heroSrc = dest.imagePath || dest.representativeImageUrl || '';

  return `
    <div class="activity-card" data-catalog-card="${dest.id}" style="padding:16px;">
      ${heroSrc ? `<img src="${escapeHtml(heroSrc)}" alt="" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:10px;" />` : ''}
      <div class="activity-card__head">
        <strong>${escapeHtml(dest.name)}</strong>
        ${statusBadge}
      </div>
      <p class="text-sm text-muted" style="margin:2px 0 0;">${escapeHtml(dest.category)}</p>
      <p class="text-sm" style="margin:8px 0;">${escapeHtml(ops.shortDescription || dest.summary || 'Chưa có mô tả.')}</p>
      <div class="quick-facts" style="margin:0;">
        <div class="quick-fact"><span class="quick-fact__label">Giá</span><span class="quick-fact__value">${escapeHtml(priceText)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Thời lượng</span><span class="quick-fact__value">${ops.durationMinutes} phút</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Sức chứa mỗi lượt</span><span class="quick-fact__value">${ops.capacity ? `${ops.capacity} người` : 'Không giới hạn'}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Khung giờ</span><span class="quick-fact__value">${(ops.availableTimeSlots || []).join(', ') || '—'}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${bookingLabel}</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Khách tháng này</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
      </div>
      <p class="text-sm text-muted" style="margin:8px 0 0;">${formatRatingStats(ratingStats)}</p>
      ${ops.openingNote ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${escapeHtml(ops.openingNote)}</p>` : ''}
      <div class="cta-row" style="margin-top:12px;">
        <button type="button" class="btn btn-secondary btn-sm" id="catalog-edit-btn">Chỉnh sửa</button>
        <a class="btn btn-secondary btn-sm" href="#/trail/place/${dest.id}" target="_blank" rel="noopener noreferrer">Xem trên giao diện khách</a>
      </div>
    </div>
  `;
}

const TIME_SLOT_RE = /^\d{1,2}:\d{2}$/;

function catalogFormHtml(dest, ops) {
  const isFree = ops.financialMode === 'free_visit';
  return `
    <a href="#/studio/experiences" class="text-sm">← Về danh sách</a>
    <h1 style="margin-top:8px;">Chỉnh sửa: ${escapeHtml(dest.name)}</h1>
    <p class="text-sm text-muted">Không thể đổi đơn vị sở hữu, cơ chế tài chính hoặc mã hoạt động ở đây — các trường này do quản trị hệ thống thiết lập.</p>
    <div class="card" style="padding:20px;">
      <div class="flex-col gap-3">
        <div><label class="field-label" for="cat-desc">Mô tả ngắn</label><textarea class="field-input" id="cat-desc" rows="3">${escapeHtml(ops.shortDescription || dest.summary || '')}</textarea></div>
        <div class="quick-facts">
          <div><label class="field-label" for="cat-price">Giá (đ/người)</label><input type="number" min="0" step="1000" class="field-input" id="cat-price" value="${ops.pricePerPerson || 0}" ${isFree ? 'disabled' : ''}></div>
          <div><label class="field-label" for="cat-duration">Thời lượng (phút)</label><input type="number" min="5" class="field-input" id="cat-duration" value="${ops.durationMinutes || 60}"></div>
          <div><label class="field-label" for="cat-capacity">Sức chứa mỗi lượt (bỏ trống = không giới hạn)</label><input type="number" min="1" class="field-input" id="cat-capacity" value="${ops.capacity ?? ''}"></div>
        </div>
        <div><label class="field-label" for="cat-slots">Khung giờ (phân tách bằng dấu phẩy, dạng HH:MM)</label><input type="text" class="field-input" id="cat-slots" value="${escapeHtml((ops.availableTimeSlots || []).join(', '))}"></div>
        <div><label class="field-label" for="cat-note">Ghi chú giờ mở cửa</label><input type="text" class="field-input" id="cat-note" value="${escapeHtml(ops.openingNote || '')}"></div>
        <div>
          <label class="field-label" for="cat-status">Trạng thái công bố</label>
          <select class="field-input" id="cat-status">
            <option value="published" ${ops.publicationStatus === 'published' ? 'selected' : ''}>Đã công bố</option>
            <option value="paused" ${ops.publicationStatus === 'paused' ? 'selected' : ''}>Tạm dừng nhận khách</option>
          </select>
        </div>
        ${isFree ? '<p class="text-sm text-faint">Điểm miễn phí — trường giá bị khoá ở 0đ, không tạo doanh thu giả.</p>' : ''}
      </div>
    </div>
    <div class="cta-row">
      <button type="button" class="btn btn-primary" id="cat-save-btn">Lưu thay đổi</button>
    </div>
    <p class="text-sm text-faint">Lưu xong: trang chi tiết địa điểm, gợi ý AI và Cổng quản lý sẽ dùng số liệu mới ngay lập tức.</p>
  `;
}

function renderCatalogForm(container, dest) {
  const ops = getOperations(dest.id);
  container.innerHTML = catalogFormHtml(dest, ops);

  qs('#cat-save-btn', container).addEventListener('click', () => {
    const isFree = ops.financialMode === 'free_visit';
    const priceRaw = Number(qs('#cat-price', container).value);
    const capRaw = qs('#cat-capacity', container).value.trim();
    const slotsRaw = qs('#cat-slots', container).value;
    const parsedSlots = slotsRaw.split(',').map((s) => s.trim()).filter((s) => TIME_SLOT_RE.test(s));

    const patch = {
      shortDescription: qs('#cat-desc', container).value.trim(),
      pricePerPerson: isFree ? 0 : Math.max(0, Number.isFinite(priceRaw) ? priceRaw : ops.pricePerPerson),
      durationMinutes: Math.max(5, Number(qs('#cat-duration', container).value) || ops.durationMinutes),
      capacity: capRaw === '' ? null : Math.max(1, Number(capRaw) || 1),
      availableTimeSlots: parsedSlots.length ? parsedSlots : ops.availableTimeSlots,
      openingNote: qs('#cat-note', container).value.trim(),
      publicationStatus: qs('#cat-status', container).value === 'paused' ? 'paused' : 'published',
    };

    updateActivityCatalogOverride(dest.id, patch);
    NotificationService.notify('Đã lưu thay đổi — Customer Interface và AI gợi ý dùng số liệu mới ngay.', 'success');
    window.location.hash = '#/studio/experiences';
  });
}

export function renderExperiences(container, hostId, params = {}) {
  const state = getState();
  const host = state.hosts.find((h) => h.id === hostId);
  const dest = host ? state.destinations.find((d) => d.id === host.destinationId) : null;
  const ops = dest ? getOperations(dest.id) : null;

  if (params.editId === 'catalog') {
    if (!dest || !ops) { window.location.hash = '#/studio/experiences'; return; }
    renderCatalogForm(container, dest);
    return;
  }

  if (params.editId || params.newExp) {
    const existing = params.editId ? state.experiences.find((e) => e.id === params.editId) : null;
    renderForm(container, hostId, existing);
    return;
  }

  const heading = ops ? (OFFERING_HEADING[ops.offeringType] || 'Trải nghiệm') : 'Trải nghiệm';
  const exps = state.experiences.filter((e) => e.hostId === hostId);

  container.innerHTML = `
    <h1 style="margin:0 0 12px;">${escapeHtml(heading)}</h1>
    ${dest && ops ? catalogCardHtml(state, host, dest, ops) : '<p class="text-sm text-faint">Chưa gắn địa điểm nào cho đơn vị này.</p>'}

    <div class="flex justify-between items-center gap-2 wrap" style="margin-top:28px;">
      <h2 style="margin:0;">Trải nghiệm bổ sung tự thêm</h2>
      <button type="button" class="btn btn-accent" id="new-exp-btn">➕ Thêm trải nghiệm</button>
    </div>
    <p class="text-sm text-faint" style="margin:2px 0 10px;">Dùng khi đơn vị muốn khai báo thêm hoạt động khác ngoài mục ở trên (có khung giờ/sức chứa riêng theo slot, tách biệt khỏi Activity Catalog).</p>
    <div class="flex-col gap-3">
      ${exps.length ? exps.map((exp) => {
        const [label, cls] = STATUS_LABELS[exp.status] || ['Đã công bố', 'badge-free'];
        const expDest = state.destinations.find((d) => d.id === exp.destinationId);
        return `
          <div class="activity-card">
            <div class="activity-card__head">
              <strong>${escapeHtml(exp.title)}</strong>
              <span class="badge ${cls}">${escapeHtml(label)}</span>
            </div>
            <p class="text-sm text-muted" style="margin:0;">${expDest ? escapeHtml(expDest.name) : ''} · ${formatCurrency(exp.price)} · ${exp.durationMin} phút · ${(exp.slots || []).length} khung giờ</p>
            <button type="button" class="btn btn-secondary btn-sm" data-edit="${exp.id}" style="margin-top:6px;align-self:flex-start;">Chỉnh sửa</button>
          </div>
        `;
      }).join('') : '<p class="text-sm text-faint">Chưa có trải nghiệm bổ sung nào.</p>'}
    </div>
  `;

  qs('#catalog-edit-btn', container)?.addEventListener('click', () => { window.location.hash = '#/studio/experiences/catalog'; });
  qs('#new-exp-btn', container).addEventListener('click', () => { window.location.hash = '#/studio/experiences/new'; });
  qsa('[data-edit]', container).forEach((btn) => {
    btn.addEventListener('click', () => { window.location.hash = `#/studio/experiences/${btn.dataset.edit}`; });
  });
}
