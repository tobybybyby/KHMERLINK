import { getState, saveItinerary } from '../storage.js';
import { escapeHtml, uid, categoryEmoji, formatCurrency, formatDurationMin, qs, qsa } from '../utils.js';
import { suggestItineraries, recalcTimeline } from '../services/aiService.js';
import { INTEREST_OPTIONS } from '../data.js';
import { NotificationService } from '../services/notificationService.js';
import { renderErrorState } from '../ui.js';

const STATUS_LABELS = {
  selected: 'Đã chọn — chưa bắt đầu',
  active: 'Đang diễn ra',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã huỷ',
};

export function renderItineraryHome(container) {
  const state = getState();
  container.innerHTML = `
    <div class="profile-page">
      <section class="card" style="padding:20px;text-align:center;">
        <h2 style="margin-top:0;">Hành trình của bạn</h2>
        <p class="text-sm text-muted">Tạo hành trình cá nhân hoá dựa trên sở thích, thời gian và số người trong đoàn.</p>
        <a class="btn btn-primary" href="#/trail/itinerary/new">➕ Tạo hành trình mới</a>
      </section>
      ${state.itineraries.length ? `
        <section>
          <div class="section-title"><h2>Đã lưu</h2></div>
          <div class="flex-col gap-3">
            ${state.itineraries.slice().reverse().map((it) => `
              <a class="gateway-item" href="#/trail/itinerary/${it.id}">
                <strong>${escapeHtml(it.name)}</strong>
                <span class="text-sm text-muted">${escapeHtml(STATUS_LABELS[it.status] || it.status)} · ${it.stops.length} điểm · ${formatCurrency(it.totalCost)}</span>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;
}

const wizardState = {
  step: 1,
  date: '',
  startTime: '08:00',
  availableHours: 4,
  partySize: 2,
  hasChildren: false,
  accessibilityNeeds: false,
  transport: 'xe-may',
  interests: new Set(),
  pace: 'vua-phai',
  priority: 'linh-hoat',
  ageGroup: '',
  destinationNote: '',
  startPoint: null,
};

function resetWizard() {
  wizardState.step = 1;
  const d = new Date();
  wizardState.date = d.toISOString().slice(0, 10);
  wizardState.startTime = '08:00';
  wizardState.availableHours = 4;
  wizardState.partySize = 2;
  wizardState.hasChildren = false;
  wizardState.accessibilityNeeds = false;
  wizardState.transport = 'xe-may';
  wizardState.interests = new Set();
  wizardState.pace = 'vua-phai';
  wizardState.priority = 'linh-hoat';
  wizardState.ageGroup = '';
  wizardState.destinationNote = '';
  wizardState.startPoint = null;
}

function progressHtml() {
  return `<p class="text-sm text-muted">Bước ${wizardState.step}/4</p>`;
}

function step1Html() {
  return `
    ${progressHtml()}
    <h2>Thời gian & điểm xuất phát</h2>
    <div class="flex-col gap-3">
      <div><label class="field-label" for="wz-date">Ngày đi</label><input type="date" class="field-input" id="wz-date" value="${wizardState.date}"></div>
      <div><label class="field-label" for="wz-time">Giờ bắt đầu</label><input type="time" class="field-input" id="wz-time" value="${wizardState.startTime}"></div>
      <div><label class="field-label" for="wz-hours">Thời gian sẵn có (giờ)</label><input type="number" min="1" max="10" class="field-input" id="wz-hours" value="${wizardState.availableHours}"></div>
      <div>
        <span class="field-label">Điểm xuất phát</span>
        <button type="button" class="btn btn-secondary btn-sm" id="wz-use-gps">📍 Dùng vị trí của tôi</button>
        <span class="text-sm text-muted" id="wz-gps-status">${wizardState.startPoint ? 'Đã có điểm xuất phát.' : 'Chưa chọn — vẫn tạo hành trình được, chỉ là không ưu tiên theo khoảng cách.'}</span>
      </div>
    </div>
  `;
}

function step2Html() {
  return `
    ${progressHtml()}
    <h2>Đoàn của bạn</h2>
    <div class="flex-col gap-3">
      <div><label class="field-label" for="wz-party">Số người</label><input type="number" min="1" max="20" class="field-input" id="wz-party" value="${wizardState.partySize}"></div>
      <label class="flex items-center gap-2"><input type="checkbox" id="wz-children" ${wizardState.hasChildren ? 'checked' : ''}> Có trẻ nhỏ đi cùng</label>
      <label class="flex items-center gap-2"><input type="checkbox" id="wz-access" ${wizardState.accessibilityNeeds ? 'checked' : ''}> Cần hỗ trợ tiếp cận (di chuyển, sức khoẻ...)</label>
      <div>
        <label class="field-label" for="wz-transport">Phương tiện đang dùng</label>
        <select class="field-select" id="wz-transport">
          <option value="xe-may" ${wizardState.transport === 'xe-may' ? 'selected' : ''}>Xe máy</option>
          <option value="o-to" ${wizardState.transport === 'o-to' ? 'selected' : ''}>Ô tô</option>
          <option value="xe-dap" ${wizardState.transport === 'xe-dap' ? 'selected' : ''}>Xe đạp</option>
          <option value="di-bo" ${wizardState.transport === 'di-bo' ? 'selected' : ''}>Đi bộ</option>
        </select>
        <p class="text-sm text-faint">Chỉ dùng để ước tính thời gian di chuyển, không phải đặt phương tiện.</p>
      </div>
    </div>
  `;
}

function step3Html() {
  return `
    ${progressHtml()}
    <h2>Sở thích & phong cách</h2>
    <div class="flex-col gap-3">
      <div>
        <span class="field-label">Sở thích (chọn một hoặc nhiều)</span>
        <div class="chip-row">
          ${INTEREST_OPTIONS.map((o) => `<button type="button" class="chip" data-interest="${o.value}" aria-pressed="${wizardState.interests.has(o.value)}">${escapeHtml(o.label)}</button>`).join('')}
        </div>
      </div>
      <div>
        <span class="field-label">Nhịp độ</span>
        <div class="chip-row">
          <button type="button" class="chip" data-pace="gon-nhe" aria-pressed="${wizardState.pace === 'gon-nhe'}">Gọn nhẹ</button>
          <button type="button" class="chip" data-pace="vua-phai" aria-pressed="${wizardState.pace === 'vua-phai'}">Vừa phải</button>
          <button type="button" class="chip" data-pace="cham-va-tim-hieu-sau" aria-pressed="${wizardState.pace === 'cham-va-tim-hieu-sau'}">Chậm và tìm hiểu sâu</button>
        </div>
      </div>
      <div>
        <span class="field-label">Ưu tiên không khí</span>
        <div class="chip-row">
          <button type="button" class="chip" data-priority="yen-tinh" aria-pressed="${wizardState.priority === 'yen-tinh'}">Yên tĩnh</button>
          <button type="button" class="chip" data-priority="nao-nhiet" aria-pressed="${wizardState.priority === 'nao-nhiet'}">Náo nhiệt</button>
          <button type="button" class="chip" data-priority="linh-hoat" aria-pressed="${wizardState.priority === 'linh-hoat'}">Linh hoạt</button>
        </div>
      </div>
    </div>
  `;
}

function step4Html() {
  return `
    ${progressHtml()}
    <h2>Tuỳ chọn thêm (không bắt buộc)</h2>
    <div class="flex-col gap-3">
      <div>
        <label class="field-label" for="wz-age">Nhóm tuổi trong đoàn</label>
        <input type="text" class="field-input" id="wz-age" placeholder="VD: 25-35, có người lớn tuổi..." value="${escapeHtml(wizardState.ageGroup)}">
        <p class="text-sm text-faint">Giúp gợi ý phù hợp hơn, không bắt buộc.</p>
      </div>
      <div>
        <label class="field-label" for="wz-note">Ghi chú khác</label>
        <textarea class="field-input" id="wz-note" rows="2" placeholder="VD: muốn tránh nắng gắt, thích chụp ảnh...">${escapeHtml(wizardState.destinationNote)}</textarea>
      </div>
    </div>
  `;
}

function readCurrentStepInputs(root) {
  if (wizardState.step === 1) {
    wizardState.date = qs('#wz-date', root).value || wizardState.date;
    wizardState.startTime = qs('#wz-time', root).value || wizardState.startTime;
    wizardState.availableHours = Number(qs('#wz-hours', root).value) || wizardState.availableHours;
  } else if (wizardState.step === 2) {
    wizardState.partySize = Number(qs('#wz-party', root).value) || wizardState.partySize;
    wizardState.hasChildren = qs('#wz-children', root).checked;
    wizardState.accessibilityNeeds = qs('#wz-access', root).checked;
    wizardState.transport = qs('#wz-transport', root).value;
  } else if (wizardState.step === 4) {
    wizardState.ageGroup = qs('#wz-age', root).value;
    wizardState.destinationNote = qs('#wz-note', root).value;
  }
}

function wireStepInteractions(root, container) {
  qs('#wz-use-gps', root)?.addEventListener('click', () => {
    if (!navigator.geolocation) { NotificationService.notify('Trình duyệt không hỗ trợ định vị.', 'error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        wizardState.startPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        qs('#wz-gps-status', root).textContent = 'Đã xác định vị trí của bạn.';
        NotificationService.notify('Đã dùng vị trí hiện tại làm điểm xuất phát.', 'success');
      },
      () => NotificationService.notify('Không lấy được vị trí — vẫn tạo hành trình được, chỉ bỏ qua ưu tiên khoảng cách.', 'error'),
    );
  });
  qsa('[data-interest]', root).forEach((chip) => chip.addEventListener('click', () => {
    const v = chip.dataset.interest;
    if (wizardState.interests.has(v)) wizardState.interests.delete(v); else wizardState.interests.add(v);
    chip.setAttribute('aria-pressed', String(wizardState.interests.has(v)));
  }));
  qsa('[data-pace]', root).forEach((chip) => chip.addEventListener('click', () => {
    wizardState.pace = chip.dataset.pace;
    qsa('[data-pace]', root).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
  }));
  qsa('[data-priority]', root).forEach((chip) => chip.addEventListener('click', () => {
    wizardState.priority = chip.dataset.priority;
    qsa('[data-priority]', root).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
  }));
}

function renderWizardStep(container) {
  const html = { 1: step1Html, 2: step2Html, 3: step3Html, 4: step4Html }[wizardState.step]();
  container.innerHTML = `
    <div class="profile-page">
      <a href="#/trail/itinerary" class="text-sm">← Huỷ tạo hành trình</a>
      <section class="card" style="padding:20px;">
        ${html}
        <div class="cta-row" style="margin-top:16px;">
          ${wizardState.step > 1 ? '<button type="button" class="btn btn-secondary" id="wz-back">← Quay lại</button>' : ''}
          <button type="button" class="btn btn-primary" id="wz-next">${wizardState.step < 4 ? 'Tiếp tục →' : 'Tạo hành trình'}</button>
        </div>
      </section>
    </div>
  `;
  wireStepInteractions(container, container);
  qs('#wz-back', container)?.addEventListener('click', () => {
    readCurrentStepInputs(container);
    wizardState.step -= 1;
    renderWizardStep(container);
  });
  qs('#wz-next', container).addEventListener('click', () => {
    readCurrentStepInputs(container);
    if (wizardState.step < 4) {
      wizardState.step += 1;
      renderWizardStep(container);
    } else {
      generateAndRenderResults(container);
    }
  });
}

export function renderItineraryWizard(container) {
  resetWizard();
  renderWizardStep(container);
}

function optionCardHtml(option, index) {
  return `
    <div class="card" style="padding:18px;">
      <h3 style="margin-top:0;">${escapeHtml(option.name)}</h3>
      <p class="text-sm text-muted">${escapeHtml(option.reason)}</p>
      <p class="badge badge-demo">Gợi ý tự động — bản demo</p>
      <div class="flex-col gap-2" style="margin:12px 0;">
        ${option.stops.map((s) => `<div class="text-sm">${categoryEmoji(s.category)} ${escapeHtml(s.name)} <span class="text-faint">(${Math.floor(s.arriveMin / 60)}:${String(s.arriveMin % 60).padStart(2, '0')}–${Math.floor(s.departMin / 60)}:${String(s.departMin % 60).padStart(2, '0')})</span>${s.experienceId ? ` — ${escapeHtml(s.experienceTitle)}` : ''}</div>`).join('')}
      </div>
      <div class="quick-facts">
        <div class="quick-fact"><span class="quick-fact__label">Tổng thời gian</span><span class="quick-fact__value">${formatDurationMin(option.totalDurationMin)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Di chuyển (ước tính)</span><span class="quick-fact__value">${formatDurationMin(option.totalTravelMin)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Chi phí hoạt động</span><span class="quick-fact__value">${formatCurrency(option.totalCost)}</span></div>
      </div>
      <button type="button" class="btn btn-primary btn-block" data-pick-option="${index}" style="margin-top:12px;">Chọn hành trình này</button>
    </div>
  `;
}

function generateAndRenderResults(container) {
  const state = getState();
  const seedIds = new Set([
    ...state.favorites,
    ...(state.ui.draftItinerary || []).map((d) => d.destinationId),
  ]);
  const [startH, startM] = wizardState.startTime.split(':').map(Number);
  const prefs = {
    date: wizardState.date,
    startHour: startH,
    startMin: startM,
    availableHours: wizardState.availableHours,
    partySize: wizardState.partySize,
    startPoint: wizardState.startPoint,
    interests: wizardState.interests,
    pace: wizardState.pace,
    priority: wizardState.priority,
    seedIds,
  };
  const result = suggestItineraries(prefs);

  if (!result.itineraries.length) {
    container.innerHTML = `
      <div class="profile-page">
        <a href="#/trail/itinerary" class="text-sm">← Về danh sách hành trình</a>
        ${renderErrorState({ title: 'Chưa tạo được hành trình phù hợp', message: result.reason || 'Thử điều chỉnh lại lựa chọn.' })}
        <button type="button" class="btn btn-secondary" id="wz-retry" style="align-self:center;">← Thử lại</button>
      </div>
    `;
    qs('#wz-retry', container).addEventListener('click', () => renderItineraryWizard(container));
    return;
  }

  container.innerHTML = `
    <div class="profile-page">
      <a href="#/trail/itinerary" class="text-sm">← Về danh sách hành trình</a>
      <h2>Chọn một hành trình</h2>
      <p class="text-sm text-muted">${result.label} — dựa trên sở thích và thời gian bạn vừa nhập.</p>
      <div class="flex-col gap-4">
        ${result.itineraries.map(optionCardHtml).join('')}
      </div>
    </div>
  `;
  qsa('[data-pick-option]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const option = result.itineraries[Number(btn.dataset.pickOption)];
      const itinerary = {
        id: uid('itin'),
        name: option.name,
        reason: option.reason,
        createdAt: new Date().toISOString(),
        status: 'selected',
        date: wizardState.date,
        startHour: prefs.startHour,
        startMin: prefs.startMin,
        availableHours: wizardState.availableHours,
        partySize: wizardState.partySize,
        startPoint: wizardState.startPoint,
        pace: wizardState.pace,
        priority: wizardState.priority,
        transport: wizardState.transport,
        hasChildren: wizardState.hasChildren,
        accessibilityNeeds: wizardState.accessibilityNeeds,
        stops: option.stops.map((s) => ({ ...s, selfVisitedAt: null, bookingItemId: null })),
        totalDurationMin: option.totalDurationMin,
        totalTravelMin: option.totalTravelMin,
        totalCost: option.totalCost,
      };
      recalcTimeline(itinerary);
      saveItinerary(itinerary);
      NotificationService.notify('Đã lưu hành trình nháp — bạn có thể chỉnh sửa trước khi bắt đầu.', 'success');
      window.location.hash = `#/trail/itinerary/${itinerary.id}`;
    });
  });
}
