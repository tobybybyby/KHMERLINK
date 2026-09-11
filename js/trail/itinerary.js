import {
  getState, saveItinerary,
  getTripCart, setTripCartItemSelected, setTripCartAllSelected, removeTripCartSelected,
  removeFromTripCart, setTripCartPartySize,
} from '../storage.js';
import { escapeHtml, uid, categoryEmoji, formatCurrency, formatDurationMin, listingTypeBadge, destinationImageSrc, qs, qsa } from '../utils.js';
import { suggestItineraries, recalcTimeline, buildItineraryFromSelection, suggestCommunityAdditions } from '../services/aiService.js';
import { INTEREST_OPTIONS } from '../data.js';
import { NotificationService } from '../services/notificationService.js';
import { renderErrorState, openModal, confirmDialog } from '../ui.js';

const STATUS_LABELS = {
  selected: 'Đã chọn — chưa bắt đầu',
  active: 'Đang diễn ra',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã huỷ',
};

function cartItemHtml(item, dest) {
  if (!dest) return '';
  const typeBadge = listingTypeBadge(dest.listingType);
  const priceNote = dest.revenueType === 'free_visit' ? 'Miễn phí — không cần đặt trước' : 'Hoạt động có phí — cần đặt trước khi có supplier xác nhận';
  return `
    <div class="card flex items-center gap-2 wrap" style="padding:10px;" data-cart-item="${item.destinationId}">
      <input type="checkbox" class="cart-item-check" data-check="${item.destinationId}" ${item.selected ? 'checked' : ''} aria-label="Chọn ${escapeHtml(dest.name)}">
      <img src="${destinationImageSrc(dest)}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;">
      <div style="flex:1;min-width:160px;">
        <strong style="display:block;">${escapeHtml(dest.name)}</strong>
        <span class="text-sm text-muted">${escapeHtml(typeBadge.label)} · ${escapeHtml(priceNote)}</span>
      </div>
      <label class="text-sm text-muted flex items-center gap-1">Số người
        <input type="number" min="1" max="20" class="field-input" style="width:56px;padding:6px;" data-party="${item.destinationId}" value="${item.partySize}">
      </label>
      <a class="btn btn-ghost btn-sm" href="#/trail/place/${dest.id}">Xem</a>
      <button type="button" class="btn btn-ghost btn-sm" data-remove="${item.destinationId}" aria-label="Xoá khỏi giỏ hành trình">✕</button>
    </div>
  `;
}

function cartSectionHtml(state) {
  const cart = getTripCart();
  const selectedCount = cart.filter((it) => it.selected).length;
  if (!cart.length) {
    return `
      <section class="card" style="padding:20px;">
        <h2 style="margin-top:0;">Giỏ hành trình của tôi</h2>
        <p class="text-sm text-muted">Chưa có địa điểm nào trong giỏ — vào Khám phá và bấm "+ Thêm vào hành trình" ở các địa điểm bạn quan tâm.</p>
        <a class="btn btn-secondary" href="#/trail/explore">🧭 Về Khám phá</a>
      </section>
    `;
  }
  return `
    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h2 style="margin:0;">Giỏ hành trình của tôi</h2>
        <span class="text-sm text-muted">${cart.length} địa điểm · ${selectedCount} đang chọn</span>
      </div>
      <div class="cta-row" style="margin:10px 0;">
        <button type="button" class="btn btn-secondary btn-sm" id="cart-select-all">Chọn tất cả</button>
        <button type="button" class="btn btn-secondary btn-sm" id="cart-deselect-all">Bỏ chọn tất cả</button>
        <button type="button" class="btn btn-ghost btn-sm" id="cart-remove-selected" ${selectedCount ? '' : 'disabled'}>Xoá mục đã chọn</button>
      </div>
      <div class="flex-col gap-2" id="cart-list">
        ${cart.map((item) => cartItemHtml(item, state.destinations.find((d) => d.id === item.destinationId))).join('')}
      </div>
      <button type="button" class="btn btn-primary btn-block" id="cart-build-btn" style="margin-top:12px;" ${selectedCount ? '' : 'disabled'}>Tạo lộ trình từ các điểm đã chọn (${selectedCount})</button>
    </section>
  `;
}

function wireCartSection(container) {
  qsa('[data-check]', container).forEach((cb) => {
    cb.addEventListener('change', () => {
      setTripCartItemSelected(cb.dataset.check, cb.checked);
      renderItineraryHome(container);
    });
  });
  qsa('[data-party]', container).forEach((input) => {
    input.addEventListener('change', () => {
      setTripCartPartySize(input.dataset.party, input.value);
    });
  });
  qsa('[data-remove]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromTripCart(btn.dataset.remove);
      NotificationService.notify('Đã gỡ khỏi giỏ hành trình.', 'info');
      renderItineraryHome(container);
    });
  });
  qs('#cart-select-all', container)?.addEventListener('click', () => {
    setTripCartAllSelected(true);
    renderItineraryHome(container);
  });
  qs('#cart-deselect-all', container)?.addEventListener('click', () => {
    setTripCartAllSelected(false);
    renderItineraryHome(container);
  });
  qs('#cart-remove-selected', container)?.addEventListener('click', () => {
    confirmDialog({ title: 'Xoá các mục đã chọn?', message: 'Các địa điểm đang tick sẽ bị xoá khỏi giỏ hành trình.', confirmLabel: 'Xoá', danger: true }).then((ok) => {
      if (!ok) return;
      removeTripCartSelected();
      renderItineraryHome(container);
    });
  });
  qs('#cart-build-btn', container)?.addEventListener('click', () => {
    const selectedIds = getTripCart().filter((it) => it.selected).map((it) => it.destinationId);
    if (!selectedIds.length) return;
    openBuildFromSelectionModal(container, selectedIds);
  });
}

/** Bước 1: hỏi ngày/giờ/số người tối thiểu để xếp lịch. Bước 2 (chỉ khi chưa có hoạt động cộng
 * đồng trả phí hợp lệ): panel gợi ý thêm hoạt động cộng đồng, cho chọn thêm hoặc tạo lịch tham
 * quan tự do — KHÔNG tự ý thêm gì khi chưa được khách bấm đồng ý (PHASE mục 4). */
function openBuildFromSelectionModal(container, selectedIds) {
  const today = new Date().toISOString().slice(0, 10);
  const formHtml = `
    <div class="flex-col gap-3">
      <div><label class="field-label" for="bfs-date">Ngày đi</label><input type="date" class="field-input" id="bfs-date" value="${today}"></div>
      <div><label class="field-label" for="bfs-time">Giờ bắt đầu</label><input type="time" class="field-input" id="bfs-time" value="08:00"></div>
      <div><label class="field-label" for="bfs-party">Số người (mặc định cho các mục chưa chỉnh riêng)</label><input type="number" min="1" max="20" class="field-input" id="bfs-party" value="2"></div>
      <div class="modal__actions">
        <button type="button" class="btn btn-primary btn-block" id="bfs-next">Xếp lịch →</button>
      </div>
    </div>
  `;
  const close = openModal({
    title: 'Tạo lộ trình từ các điểm đã chọn',
    bodyHtml: formHtml,
    onMount: (modalEl, closeFn) => {
      const setBody = (html) => { qs('.modal__body', modalEl).innerHTML = html; };

      qs('#bfs-next', modalEl).addEventListener('click', () => {
        const date = qs('#bfs-date', modalEl).value || today;
        const [h, m] = (qs('#bfs-time', modalEl).value || '08:00').split(':').map(Number);
        const partySize = Number(qs('#bfs-party', modalEl).value) || 2;
        runBuild({ date, startHour: h, startMin: m, partySize, extraIds: [] });
      });

      function runBuild({ date, startHour, startMin, partySize, extraIds }) {
        const state = getState();
        const allIds = [...selectedIds, ...extraIds];
        const built = buildItineraryFromSelection(state, { selectedIds: allIds, date, startHour, startMin, partySize });
        if (!built) {
          setBody('<p class="text-sm text-faint">Không xếp được lịch từ các mục đã chọn.</p>');
          return;
        }
        if (built.isBookableTour || extraIds.length) {
          finalize(built, date, startHour, startMin, partySize);
          return;
        }
        renderSuggestionPanel(built, { date, startHour, startMin, partySize });
      }

      function renderSuggestionPanel(built, ctx) {
        const anchor = built.stops[0] ? state_destById(built.stops[0].destinationId) : null;
        const suggestions = suggestCommunityAdditions(getState(), {
          excludeIds: selectedIds,
          anchorPoint: anchor && anchor.lat !== null ? { lat: anchor.lat, lng: anchor.lng } : null,
          partySize: ctx.partySize,
          date: ctx.date,
          limit: 3,
        });
        setBody(`
          <div class="flex-col gap-3">
            <p class="demo-note">Hiện chưa có hoạt động cộng đồng phù hợp trong lựa chọn của bạn. Thêm một trải nghiệm cộng đồng vào hành trình?</p>
            ${suggestions.length ? `
              <div class="flex-col gap-2">
                ${suggestions.map((s) => `
                  <div class="activity-card">
                    <div class="activity-card__head">
                      <strong>${escapeHtml(s.name)}</strong>
                      ${s.bookable ? `<span class="activity-card__price">${formatCurrency(s.price)}</span>` : '<span class="badge badge-demo">Chưa bookable</span>'}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" data-add-suggestion="${s.destinationId}" style="margin-top:6px;">+ Thêm vào hành trình</button>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-sm text-faint">Không có hoạt động cộng đồng nào phù hợp với thời gian/lịch hiện tại.</p>'}
            <div class="modal__actions">
              <button type="button" class="btn btn-ghost" id="bfs-free-visit">Tạo lịch tham quan tự do</button>
            </div>
          </div>
        `);
        qsa('[data-add-suggestion]', modalEl).forEach((btn) => {
          btn.addEventListener('click', () => {
            runBuild({ ...ctx, extraIds: [btn.dataset.addSuggestion] });
          });
        });
        qs('#bfs-free-visit', modalEl).addEventListener('click', () => {
          finalize(built, ctx.date, ctx.startHour, ctx.startMin, ctx.partySize);
        });
      }

      function finalize(built, date, startHour, startMin, partySize) {
        const itinerary = {
          id: uid('itin'),
          name: built.isBookableTour ? 'Hành trình từ giỏ hành trình' : 'Lịch tham quan tự do',
          reason: 'Xếp từ các địa điểm bạn đã chọn trong giỏ hành trình.',
          createdAt: new Date().toISOString(),
          status: 'selected',
          date,
          startHour,
          startMin,
          availableHours: Math.max(1, Math.round(built.totalDurationMin / 60) || 1),
          partySize,
          startPoint: null,
          pace: 'vua-phai',
          priority: 'linh-hoat',
          transport: 'xe-may',
          hasChildren: false,
          accessibilityNeeds: false,
          stops: built.stops.map((s) => ({ ...s, selfVisitedAt: null, bookingItemId: null })),
          totalDurationMin: built.totalDurationMin,
          totalTravelMin: built.totalTravelMin,
          totalCost: built.totalCost,
          isBookableTour: built.isBookableTour,
          isFreeVisitPlan: !built.isBookableTour,
        };
        recalcTimeline(itinerary);
        saveItinerary(itinerary);
        closeFn();
        NotificationService.notify(
          built.isBookableTour ? 'Đã tạo hành trình từ các điểm đã chọn.' : 'Đã tạo lịch tham quan tự do từ các điểm đã chọn.',
          'success',
        );
        window.location.hash = `#/trail/itinerary/${itinerary.id}`;
      }

      function state_destById(id) {
        return getState().destinations.find((d) => d.id === id) || null;
      }
    },
  });
  return close;
}

export function renderItineraryHome(container) {
  const state = getState();
  container.innerHTML = `
    <div class="profile-page">
      ${cartSectionHtml(state)}
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
  wireCartSection(container);
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
      <div class="badge-row" style="margin:0;">
        <span class="badge badge-demo">Gợi ý tự động — bản demo</span>
        ${option.isBookableTour
          ? '<span class="badge badge-new" title="Chi tiêu trực tiếp hỗ trợ đơn vị cung cấp trải nghiệm">🏘️ Có hoạt động cộng đồng</span>'
          : '<span class="badge badge-type">📍 Lịch tham quan tự do</span>'}
      </div>
      <div class="flex-col gap-2" style="margin:12px 0;">
        ${option.stops.map((s) => `<div class="text-sm">${categoryEmoji(s.category)} ${escapeHtml(s.name)} <span class="text-faint">(${Math.floor(s.arriveMin / 60)}:${String(s.arriveMin % 60).padStart(2, '0')}–${Math.floor(s.departMin / 60)}:${String(s.departMin % 60).padStart(2, '0')})</span>${s.experienceId ? ` — ${escapeHtml(s.experienceTitle)}` : ''}${s.isCommunityActivity && s.bookable ? ' <span class="badge badge-new text-sm">Hoạt động cộng đồng</span>' : ''}</div>`).join('')}
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
    ...state.tripCart.filter((it) => it.selected).map((it) => it.destinationId),
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

  const anyBookable = result.itineraries.some((o) => o.isBookableTour);
  container.innerHTML = `
    <div class="profile-page">
      <a href="#/trail/itinerary" class="text-sm">← Về danh sách hành trình</a>
      <h2>Chọn một hành trình</h2>
      <p class="text-sm text-muted">${result.label} — dựa trên sở thích và thời gian bạn vừa nhập.</p>
      ${!anyBookable ? '<div class="demo-note">Hiện chưa có hoạt động cộng đồng phù hợp với thời gian và lịch bạn chọn. Các lựa chọn dưới đây là lịch tham quan tự do (miễn phí, không qua bước đặt/thanh toán) — bạn có thể thử đổi thời gian/ngày ở bước trước, hoặc xem trực tiếp các hoạt động cộng đồng đang chờ khảo sát ở Khám phá.</div>' : ''}
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
        isBookableTour: option.isBookableTour,
      };
      recalcTimeline(itinerary);
      saveItinerary(itinerary);
      NotificationService.notify('Đã lưu hành trình nháp — bạn có thể chỉnh sửa trước khi bắt đầu.', 'success');
      window.location.hash = `#/trail/itinerary/${itinerary.id}`;
    });
  });
}
