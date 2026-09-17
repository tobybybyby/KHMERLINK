import { getState, upsertHostExperience, updateActivityCatalogOverride } from '../storage.js';
import { escapeHtml, formatCurrency, formatDateShort, formatDurationMin, uid, qs, qsa } from '../utils.js';
import { getSlotRemaining } from '../services/bookingService.js';
import { getOperations, formatPricePerPerson } from '../services/operationsService.js';
import { getProviderMetrics, getCurrentPeriod } from '../services/hostBookingService.js';
import { getRatingStatsForListing, formatRatingStats } from '../services/reviewsService.js';
import { NotificationService } from '../services/notificationService.js';
import { t, localize, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName, localizedDestinationSummary } from '../services/destinationsService.js';

registerTranslations('host', {
  experiences: {
    status: { draft: 'Nháp', pending_review: 'Chờ duyệt', published: 'Đã công bố' },
    submissionStatus: {
      pending_review: 'Chờ duyệt', in_review: 'Đang xem xét', needs_revision: 'Cần chỉnh sửa',
      approved: 'Đã duyệt', rejected: 'Đã từ chối',
    },
    offeringHeading: { paid_experience: 'Trải nghiệm', public_ticket_visit: 'Hoạt động tham quan', free_cultural_visit: 'Địa điểm đang quản lý' },
    bookingCountLabel: { free_visit: 'Lượt đăng ký trong tháng', public_ticket: 'Booking trong tháng', community_paid: 'Booking trong tháng' },
    capacityUnit: 'sức chứa {cap} (còn {remaining})',
    closeSlot: 'Đóng slot',
    reopen: 'Mở lại',
    remove: 'Xoá',
    alreadyBookedNoRemove: 'Đã có khách đặt, không thể xoá',
    backToExperiences: '← Về danh sách trải nghiệm',
    editExperience: 'Chỉnh sửa trải nghiệm',
    addExperience: 'Thêm trải nghiệm mới',
    place: 'Địa điểm: {name} — hồ sơ địa điểm quản lý riêng, đây chỉ là hoạt động trải nghiệm tổ chức tại đó.',
    noPlaceLinked: 'Chưa gắn địa điểm',
    experienceName: 'Tên trải nghiệm',
    introStory: 'Giới thiệu / câu chuyện',
    price: 'Giá (đ, 0 = miễn phí)',
    durationMinutes: 'Thời lượng (phút)',
    conditions: 'Điều kiện nhận khách',
    conditionsPlaceholder: 'VD: phù hợp mọi lứa tuổi, tối thiểu 2 khách...',
    slotsTitle: 'Khung giờ (slot)',
    noSlots: 'Chưa có khung giờ nào.',
    addNewSlot: 'Thêm khung giờ mới',
    date: 'Ngày',
    startTime: 'Giờ bắt đầu',
    endTime: 'Giờ kết thúc',
    capacity: 'Sức chứa',
    addSlotBtn: '➕ Thêm khung giờ',
    saveDraft: 'Lưu nháp',
    submitForReview: 'Gửi duyệt',
    pendingReviewNote: 'Đang chờ cộng đồng/vận hành duyệt trong Cổng vận hành — nội dung công bố cũ (nếu có) vẫn hiển thị cho khách cho tới khi bản mới được duyệt.',
    selectDateFirst: 'Chọn ngày cho khung giờ mới.',
    enterNameFirst: 'Nhập tên trải nghiệm trước khi lưu.',
    draftSaved: 'Đã lưu nháp.',
    needNameDescription: 'Cần có tên và mô tả trước khi gửi duyệt.',
    submittedNotify: 'Đã gửi duyệt — nội dung công bố cũ (nếu có) vẫn hiển thị cho khách cho tới khi bản mới được duyệt.',
    noDescription: 'Chưa có mô tả.',
    priceLabel: 'Giá',
    duration: 'Thời lượng',
    capacityPerSlot: 'Sức chứa mỗi lượt',
    unlimited: 'Không giới hạn',
    timeSlots: 'Khung giờ',
    guestsThisMonth: 'Khách tháng này',
    editBtn: 'Chỉnh sửa',
    viewOnCustomerSide: 'Xem trên giao diện khách',
    published: 'Đã công bố',
    paused: 'Tạm dừng nhận khách',
    editing: 'Chỉnh sửa: {name}',
    cannotChangeFields: 'Không thể đổi đơn vị sở hữu, cơ chế tài chính hoặc mã hoạt động ở đây — các trường này do quản trị hệ thống thiết lập.',
    shortDescription: 'Mô tả ngắn',
    pricePerGuest: 'Giá (đ/người)',
    capacityPlaceholderLabel: 'Sức chứa mỗi lượt (bỏ trống = không giới hạn)',
    timeSlotsCsv: 'Khung giờ (phân tách bằng dấu phẩy, dạng HH:MM)',
    openingNote: 'Ghi chú giờ mở cửa',
    publicationStatus: 'Trạng thái công bố',
    freeSiteNote: 'Điểm miễn phí — trường giá bị khoá ở 0đ, không tạo doanh thu giả.',
    saveChanges: 'Lưu thay đổi',
    afterSaveNote: 'Lưu xong: trang chi tiết địa điểm, gợi ý AI và Cổng quản lý sẽ dùng số liệu mới ngay lập tức.',
    savedNotify: 'Đã lưu thay đổi — Customer Interface và AI gợi ý dùng số liệu mới ngay.',
    noPlaceForProvider: 'Chưa gắn địa điểm nào cho đơn vị này.',
    extraExperiencesTitle: 'Trải nghiệm bổ sung tự thêm',
    extraExperiencesDesc: 'Dùng khi đơn vị muốn khai báo thêm hoạt động khác ngoài mục ở trên (có khung giờ/sức chứa riêng theo slot, tách biệt khỏi Activity Catalog).',
    noExtraExperiences: 'Chưa có trải nghiệm bổ sung nào.',
    slotsCount: '{count} khung giờ',
    newSubmissionsTitle: 'Đề xuất hoạt động mới đã gửi',
    newSubmissionsDesc: 'Trạng thái kiểm duyệt cập nhật ngay khi Cổng vận hành xử lý — hoạt động chỉ hiển thị cho khách sau khi được duyệt.',
    reviewerFeedback: 'Phản hồi từ Cổng vận hành:',
    noSubmissions: 'Chưa gửi đề xuất hoạt động mới nào.',
  },
}, {
  experiences: {
    status: { draft: 'Draft', pending_review: 'Pending Review', published: 'Published' },
    submissionStatus: {
      pending_review: 'Pending Review', in_review: 'Under Review', needs_revision: 'Needs Revision',
      approved: 'Approved', rejected: 'Rejected',
    },
    offeringHeading: { paid_experience: 'Experiences', public_ticket_visit: 'Visitor Activities', free_cultural_visit: 'Managed Site' },
    bookingCountLabel: { free_visit: 'Registrations this month', public_ticket: 'Bookings this month', community_paid: 'Bookings this month' },
    capacityUnit: 'capacity {cap} ({remaining} left)',
    closeSlot: 'Close slot',
    reopen: 'Reopen',
    remove: 'Remove',
    alreadyBookedNoRemove: 'Already booked by a guest, cannot remove',
    backToExperiences: '← Back to experience list',
    editExperience: 'Edit Experience',
    addExperience: 'Add New Experience',
    place: 'Place: {name} — the place profile is managed separately; this is just an experience activity hosted there.',
    noPlaceLinked: 'No place linked',
    experienceName: 'Experience name',
    introStory: 'Introduction / story',
    price: 'Price (VND, 0 = free)',
    durationMinutes: 'Duration (minutes)',
    conditions: 'Participation conditions',
    conditionsPlaceholder: 'e.g. suitable for all ages, minimum 2 guests...',
    slotsTitle: 'Time slots',
    noSlots: 'No time slots yet.',
    addNewSlot: 'Add a new time slot',
    date: 'Date',
    startTime: 'Start time',
    endTime: 'End time',
    capacity: 'Capacity',
    addSlotBtn: '➕ Add time slot',
    saveDraft: 'Save draft',
    submitForReview: 'Submit for review',
    pendingReviewNote: 'Awaiting review by the community/operations team in the Operations Portal — previously published content (if any) stays visible to guests until the new version is approved.',
    selectDateFirst: 'Choose a date for the new time slot.',
    enterNameFirst: 'Enter an experience name before saving.',
    draftSaved: 'Draft saved.',
    needNameDescription: 'A name and description are required before submitting for review.',
    submittedNotify: 'Submitted for review — previously published content (if any) stays visible to guests until the new version is approved.',
    noDescription: 'No description yet.',
    priceLabel: 'Price',
    duration: 'Duration',
    capacityPerSlot: 'Capacity per slot',
    unlimited: 'Unlimited',
    timeSlots: 'Time slots',
    guestsThisMonth: 'Guests this month',
    editBtn: 'Edit',
    viewOnCustomerSide: 'View on Customer Interface',
    published: 'Published',
    paused: 'Not currently accepting guests',
    editing: 'Editing: {name}',
    cannotChangeFields: 'The owning provider, financial mode and activity ID cannot be changed here — these fields are set by system administrators.',
    shortDescription: 'Short description',
    pricePerGuest: 'Price (VND/guest)',
    capacityPlaceholderLabel: 'Capacity per slot (leave blank = unlimited)',
    timeSlotsCsv: 'Time slots (comma-separated, HH:MM format)',
    openingNote: 'Opening hours note',
    publicationStatus: 'Publication status',
    freeSiteNote: 'Free-entry site — the price field is locked at 0, no fake revenue is generated.',
    saveChanges: 'Save changes',
    afterSaveNote: 'Once saved: the place detail page, AI suggestions and Management Portal will use the new figures immediately.',
    savedNotify: 'Changes saved — the Customer Interface and AI suggestions use the new figures immediately.',
    noPlaceForProvider: 'No place linked to this provider yet.',
    extraExperiencesTitle: 'Additional self-added experiences',
    extraExperiencesDesc: 'Use this when the provider wants to declare other activities beyond the one above (with its own slot-based time/capacity, separate from the Activity Catalog).',
    noExtraExperiences: 'No additional experiences yet.',
    slotsCount: '{count} time slots',
    newSubmissionsTitle: 'Submitted new activity proposals',
    newSubmissionsDesc: 'The review status updates as soon as the Operations Portal processes it — the activity only shows to guests after approval.',
    reviewerFeedback: 'Feedback from Operations Portal:',
    noSubmissions: 'No new activity proposals submitted yet.',
  },
});

function slotRowHtml(exp, slot) {
  const remaining = getSlotRemaining(slot);
  const isOpen = slot.isOpen !== false;
  return `
    <div class="flex justify-between items-center gap-2 wrap" data-slot="${slot.id}" style="padding:8px 0;border-bottom:1px solid var(--color-border);">
      <span class="text-sm">${formatDateShort(slot.date)} · ${slot.startTime}–${slot.endTime} · ${t('host.experiences.capacityUnit', { cap: slot.capacity, remaining })}</span>
      <div class="cta-row">
        <button type="button" class="btn btn-secondary btn-sm" data-slot-act="toggle">${isOpen ? t('host.experiences.closeSlot') : t('host.experiences.reopen')}</button>
        <button type="button" class="btn btn-danger-ghost btn-sm" data-slot-act="remove" ${slot.booked > 0 ? `disabled title="${t('host.experiences.alreadyBookedNoRemove')}"` : ''}>${t('host.experiences.remove')}</button>
      </div>
    </div>
  `;
}

function formHtml(exp, destName) {
  const statusLabel = t(`host.experiences.status.${exp.status}`) || t('host.experiences.status.draft');
  const statusCls = { draft: 'badge-demo', pending_review: 'badge-type', published: 'badge-free' }[exp.status] || 'badge-demo';
  return `
    <a href="#/studio/experiences" class="text-sm" id="exp-back-link">${t('host.experiences.backToExperiences')}</a>
    <div class="flex justify-between items-center gap-2 wrap" style="margin-top:8px;">
      <h1 style="margin:0;">${exp.id ? t('host.experiences.editExperience') : t('host.experiences.addExperience')}</h1>
      <span class="badge ${statusCls}">${escapeHtml(statusLabel)}</span>
    </div>
    <p class="text-sm text-muted">${t('host.experiences.place', { name: escapeHtml(destName || t('host.experiences.noPlaceLinked')) })}</p>

    <div class="card" style="padding:20px;">
      <div class="flex-col gap-3">
        <div><label class="field-label" for="exp-title">${t('host.experiences.experienceName')}</label><input type="text" class="field-input" id="exp-title" value="${escapeHtml(exp.title || '')}"></div>
        <div><label class="field-label" for="exp-desc">${t('host.experiences.introStory')}</label><textarea class="field-input" id="exp-desc" rows="3">${escapeHtml(exp.description || '')}</textarea></div>
        <div class="quick-facts">
          <div><label class="field-label" for="exp-price">${t('host.experiences.price')}</label><input type="number" min="0" step="1000" class="field-input" id="exp-price" value="${exp.price ?? 0}"></div>
          <div><label class="field-label" for="exp-duration">${t('host.experiences.durationMinutes')}</label><input type="number" min="5" class="field-input" id="exp-duration" value="${exp.durationMin ?? 60}"></div>
        </div>
        <div><label class="field-label" for="exp-conditions">${t('host.experiences.conditions')}</label><input type="text" class="field-input" id="exp-conditions" value="${escapeHtml(exp.conditions || '')}" placeholder="${t('host.experiences.conditionsPlaceholder')}"></div>
      </div>
    </div>

    <div class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('host.experiences.slotsTitle')}</h3>
      <div id="slot-list">${(exp.slots || []).map((s) => slotRowHtml(exp, s)).join('') || `<p class="text-sm text-faint">${t('host.experiences.noSlots')}</p>`}</div>
      <div class="flex-col gap-2" style="margin-top:12px;">
        <span class="field-label">${t('host.experiences.addNewSlot')}</span>
        <div class="quick-facts">
          <div><label class="field-label" for="new-slot-date">${t('host.experiences.date')}</label><input type="date" class="field-input" id="new-slot-date"></div>
          <div><label class="field-label" for="new-slot-start">${t('host.experiences.startTime')}</label><input type="time" class="field-input" id="new-slot-start" value="09:00"></div>
          <div><label class="field-label" for="new-slot-end">${t('host.experiences.endTime')}</label><input type="time" class="field-input" id="new-slot-end" value="10:00"></div>
          <div><label class="field-label" for="new-slot-capacity">${t('host.experiences.capacity')}</label><input type="number" min="1" class="field-input" id="new-slot-capacity" value="10"></div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="add-slot-btn" style="align-self:flex-start;">${t('host.experiences.addSlotBtn')}</button>
      </div>
    </div>

    <div class="cta-row">
      <button type="button" class="btn btn-secondary" id="save-draft-btn">${t('host.experiences.saveDraft')}</button>
      ${exp.status !== 'published' ? `<button type="button" class="btn btn-primary" id="submit-review-btn">${t('host.experiences.submitForReview')}</button>` : ''}
    </div>
    ${exp.status === 'pending_review' ? `<p class="text-sm text-faint">${t('host.experiences.pendingReviewNote')}</p>` : ''}
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
      if (!date) { NotificationService.notify(t('host.experiences.selectDateFirst'), 'error'); return; }
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
      if (!exp.title) { NotificationService.notify(t('host.experiences.enterNameFirst'), 'error'); return; }
      upsertHostExperience(exp);
      NotificationService.notify(t('host.experiences.draftSaved'), 'success');
      window.location.hash = '#/studio/experiences';
    });

    qs('#submit-review-btn', container)?.addEventListener('click', () => {
      readFormFields(container, exp);
      if (!exp.id) exp.id = uid('exp');
      if (!exp.title || !exp.description) { NotificationService.notify(t('host.experiences.needNameDescription'), 'error'); return; }
      exp.status = 'pending_review';
      upsertHostExperience(exp);
      NotificationService.notify(t('host.experiences.submittedNotify'), 'success');
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
  const priceText = isFree ? t('common.price.free') : formatPricePerPerson(ops.pricePerPerson);
  const bookingLabel = t(`host.experiences.bookingCountLabel.${ops.financialMode}`) || t('host.experiences.bookingCountLabel.public_ticket');
  const statusBadge = ops.publicationStatus === 'published'
    ? `<span class="badge badge-free">${t('host.experiences.published')}</span>`
    : `<span class="badge badge-demo">${t('host.experiences.paused')}</span>`;
  const heroSrc = dest.imagePath || dest.representativeImageUrl || '';
  const name = localizedDestinationName(dest);

  return `
    <div class="activity-card" data-catalog-card="${dest.id}" style="padding:16px;">
      ${heroSrc ? `<img src="${escapeHtml(heroSrc)}" alt="" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:10px;" />` : ''}
      <div class="activity-card__head">
        <strong>${escapeHtml(name)}</strong>
        ${statusBadge}
      </div>
      <p class="text-sm text-muted" style="margin:2px 0 0;">${escapeHtml(dest.category)}</p>
      <p class="text-sm" style="margin:8px 0;">${escapeHtml(ops.shortDescription || localizedDestinationSummary(dest) || t('host.experiences.noDescription'))}</p>
      <div class="quick-facts" style="margin:0;">
        <div class="quick-fact"><span class="quick-fact__label">${t('host.experiences.priceLabel')}</span><span class="quick-fact__value">${escapeHtml(priceText)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.experiences.duration')}</span><span class="quick-fact__value">${formatDurationMin(ops.durationMinutes)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.experiences.capacityPerSlot')}</span><span class="quick-fact__value">${ops.capacity ? t('customer.booking.guests', { count: ops.capacity }) : t('host.experiences.unlimited')}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.experiences.timeSlots')}</span><span class="quick-fact__value">${(ops.availableTimeSlots || []).join(', ') || '—'}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${bookingLabel}</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.experiences.guestsThisMonth')}</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
      </div>
      <p class="text-sm text-muted" style="margin:8px 0 0;">${formatRatingStats(ratingStats)}</p>
      ${ops.openingNote ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${escapeHtml(ops.openingNote)}</p>` : ''}
      <div class="cta-row" style="margin-top:12px;">
        <button type="button" class="btn btn-secondary btn-sm" id="catalog-edit-btn">${t('host.experiences.editBtn')}</button>
        <a class="btn btn-secondary btn-sm" href="#/trail/place/${dest.id}" target="_blank" rel="noopener noreferrer">${t('host.experiences.viewOnCustomerSide')}</a>
      </div>
    </div>
  `;
}

const TIME_SLOT_RE = /^\d{1,2}:\d{2}$/;

function catalogFormHtml(dest, ops) {
  const isFree = ops.financialMode === 'free_visit';
  return `
    <a href="#/studio/experiences" class="text-sm">${t('host.experiences.backToExperiences')}</a>
    <h1 style="margin-top:8px;">${t('host.experiences.editing', { name: escapeHtml(localizedDestinationName(dest)) })}</h1>
    <p class="text-sm text-muted">${t('host.experiences.cannotChangeFields')}</p>
    <div class="card" style="padding:20px;">
      <div class="flex-col gap-3">
        <div><label class="field-label" for="cat-desc">${t('host.experiences.shortDescription')}</label><textarea class="field-input" id="cat-desc" rows="3">${escapeHtml(ops.shortDescription || localizedDestinationSummary(dest) || '')}</textarea></div>
        <div class="quick-facts">
          <div><label class="field-label" for="cat-price">${t('host.experiences.pricePerGuest')}</label><input type="number" min="0" step="1000" class="field-input" id="cat-price" value="${ops.pricePerPerson || 0}" ${isFree ? 'disabled' : ''}></div>
          <div><label class="field-label" for="cat-duration">${t('host.experiences.durationMinutes')}</label><input type="number" min="5" class="field-input" id="cat-duration" value="${ops.durationMinutes || 60}"></div>
          <div><label class="field-label" for="cat-capacity">${t('host.experiences.capacityPlaceholderLabel')}</label><input type="number" min="1" class="field-input" id="cat-capacity" value="${ops.capacity ?? ''}"></div>
        </div>
        <div><label class="field-label" for="cat-slots">${t('host.experiences.timeSlotsCsv')}</label><input type="text" class="field-input" id="cat-slots" value="${escapeHtml((ops.availableTimeSlots || []).join(', '))}"></div>
        <div><label class="field-label" for="cat-note">${t('host.experiences.openingNote')}</label><input type="text" class="field-input" id="cat-note" value="${escapeHtml(ops.openingNote || '')}"></div>
        <div>
          <label class="field-label" for="cat-status">${t('host.experiences.publicationStatus')}</label>
          <select class="field-input" id="cat-status">
            <option value="published" ${ops.publicationStatus === 'published' ? 'selected' : ''}>${t('host.experiences.published')}</option>
            <option value="paused" ${ops.publicationStatus === 'paused' ? 'selected' : ''}>${t('host.experiences.paused')}</option>
          </select>
        </div>
        ${isFree ? `<p class="text-sm text-faint">${t('host.experiences.freeSiteNote')}</p>` : ''}
      </div>
    </div>
    <div class="cta-row">
      <button type="button" class="btn btn-primary" id="cat-save-btn">${t('host.experiences.saveChanges')}</button>
    </div>
    <p class="text-sm text-faint">${t('host.experiences.afterSaveNote')}</p>
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
    NotificationService.notify(t('host.experiences.savedNotify'), 'success');
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

  const heading = ops ? (t(`host.experiences.offeringHeading.${ops.offeringType}`) || t('host.experiences.offeringHeading.paid_experience')) : t('host.experiences.offeringHeading.paid_experience');
  const exps = state.experiences.filter((e) => e.hostId === hostId);
  const submissionCls = { pending_review: 'badge-type', in_review: 'badge-type', needs_revision: 'badge-recognized', approved: 'badge-free', rejected: 'badge-recognized' };

  container.innerHTML = `
    <h1 style="margin:0 0 12px;">${escapeHtml(heading)}</h1>
    ${dest && ops ? catalogCardHtml(state, host, dest, ops) : `<p class="text-sm text-faint">${t('host.experiences.noPlaceForProvider')}</p>`}

    <div class="flex justify-between items-center gap-2 wrap" style="margin-top:28px;">
      <h2 style="margin:0;">${t('host.experiences.extraExperiencesTitle')}</h2>
      <button type="button" class="btn btn-accent" id="new-exp-btn">${t('host.overview.addExperience')}</button>
    </div>
    <p class="text-sm text-faint" style="margin:2px 0 10px;">${t('host.experiences.extraExperiencesDesc')}</p>
    <div class="flex-col gap-3">
      ${exps.length ? exps.map((exp) => {
        const label = t(`host.experiences.status.${exp.status}`) || t('host.experiences.published');
        const cls = { draft: 'badge-demo', pending_review: 'badge-type', published: 'badge-free' }[exp.status] || 'badge-free';
        const expDest = state.destinations.find((d) => d.id === exp.destinationId);
        return `
          <div class="activity-card">
            <div class="activity-card__head">
              <strong>${escapeHtml(exp.title)}</strong>
              <span class="badge ${cls}">${escapeHtml(label)}</span>
            </div>
            <p class="text-sm text-muted" style="margin:0;">${expDest ? escapeHtml(localizedDestinationName(expDest)) : ''} · ${formatCurrency(exp.price)} · ${formatDurationMin(exp.durationMin)} · ${t('host.experiences.slotsCount', { count: (exp.slots || []).length })}</p>
            <button type="button" class="btn btn-secondary btn-sm" data-edit="${exp.id}" style="margin-top:6px;align-self:flex-start;">${t('host.experiences.editBtn')}</button>
          </div>
        `;
      }).join('') : `<p class="text-sm text-faint">${t('host.experiences.noExtraExperiences')}</p>`}
    </div>

    <h2 style="margin:28px 0 2px;">${t('host.experiences.newSubmissionsTitle')}</h2>
    <p class="text-sm text-faint" style="margin:2px 0 10px;">${t('host.experiences.newSubmissionsDesc')}</p>
    <div class="flex-col gap-3">
      ${(state.contentSubmissions || []).filter((s) => s.providerId === hostId).slice().reverse().map((sub) => {
        const label = t(`host.experiences.submissionStatus.${sub.status}`) || sub.status;
        const cls = submissionCls[sub.status] || 'badge-type';
        return `
          <div class="activity-card">
            <div class="activity-card__head">
              <strong>${escapeHtml(localize(sub.name))}</strong>
              <span class="badge ${cls}">${escapeHtml(label)}</span>
            </div>
            <p class="text-sm text-muted" style="margin:0;">${escapeHtml(localize(sub.category) || '')} · ${formatCurrency(sub.pricePerPerson)}</p>
            ${sub.reviewerNote ? `<p class="text-sm" style="margin:4px 0 0;"><strong>${t('host.experiences.reviewerFeedback')}</strong> ${escapeHtml(sub.reviewerNote)}</p>` : ''}
          </div>
        `;
      }).join('') || `<p class="text-sm text-faint">${t('host.experiences.noSubmissions')}</p>`}
    </div>
  `;

  qs('#catalog-edit-btn', container)?.addEventListener('click', () => { window.location.hash = '#/studio/experiences/catalog'; });
  qs('#new-exp-btn', container).addEventListener('click', () => { window.location.hash = '#/studio/experiences/new'; });
  qsa('[data-edit]', container).forEach((btn) => {
    btn.addEventListener('click', () => { window.location.hash = `#/studio/experiences/${btn.dataset.edit}`; });
  });
}
