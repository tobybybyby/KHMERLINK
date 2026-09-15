import {
  getState, saveItinerary, toggleTripCartItem, isInTripCart,
  getTripCart, setTripCartItemSelected, setTripCartAllSelected, removeTripCartSelected,
  removeFromTripCart, setTripCartPartySize, logCustomerBehaviourEvent,
} from '../storage.js';
import { escapeHtml, uid, categoryEmoji, formatCurrency, formatDurationMin, listingTypeBadge, destinationImageSrc, placeholderImageDataUri, qs, qsa } from '../utils.js';
import { recalcTimeline, buildItineraryFromSelection, suggestCommunityAdditions, getItineraryRecommendations } from '../services/aiService.js';
import { INTEREST_OPTIONS } from '../data.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal, confirmDialog } from '../ui.js';

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
  budget: '', // rỗng = "Ngân sách linh hoạt" (mục 1.2), chuẩn hoá ở normalizeItineraryPrefs()
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
  wizardState.budget = '';
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
      <div>
        <label class="field-label" for="wz-budget">Ngân sách dự kiến cho cả nhóm (đ, không bắt buộc)</label>
        <input type="number" min="0" step="10000" class="field-input" id="wz-budget" placeholder="Bỏ trống = ngân sách linh hoạt" value="${escapeHtml(wizardState.budget)}">
      </div>
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
    wizardState.budget = qs('#wz-budget', root).value;
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

function suggestionCardHtml(s, index, { isPopularFallback = false } = {}) {
  const img = s.image || placeholderImageDataUri(s.category, s.name);
  const matchBadge = s.matchScore !== null
    ? `<span class="badge badge-new">Phù hợp ${s.matchedCriteria.length}/5 tiêu chí · ${s.matchScore}%</span>`
    : (s.ratingLabel ? `<span class="badge badge-type">${escapeHtml(s.ratingLabel)}</span>` : '');
  return `
    <div class="card" style="padding:16px;overflow:hidden;" data-suggestion-card="${index}">
      <img src="${escapeHtml(img)}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;margin-bottom:10px;" loading="lazy">
      <h3 style="margin:0 0 4px;">${escapeHtml(s.name)}</h3>
      <div class="badge-row" style="margin:0 0 6px;">
        ${matchBadge}
        <span class="badge badge-type">${s.stopCount} điểm dừng</span>
      </div>
      ${s.matchedCriteria && s.matchedCriteria.length ? `<p class="text-sm text-faint" style="margin:0 0 6px;">Đã khớp: ${s.matchedCriteria.map((m) => escapeHtml(m)).join(', ')}</p>` : ''}
      <div class="quick-facts" style="margin:0 0 8px;">
        <div class="quick-fact"><span class="quick-fact__label">Thời lượng dự kiến</span><span class="quick-fact__value">${formatDurationMin(s.durationMin)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Chi phí cho cả nhóm</span><span class="quick-fact__value">${s.totalCost ? formatCurrency(s.totalCost) : 'Miễn phí'}</span></div>
      </div>
      ${s.unmetNote ? `<p class="text-sm" style="margin:0 0 6px;color:var(--color-danger,#b3413a);">⚠️ ${escapeHtml(s.unmetNote)}</p>` : ''}
      <div class="cta-row" style="margin-top:8px;">
        <a class="btn btn-secondary btn-sm" href="#/trail/place/${s.destinationId}">Xem hành trình</a>
        ${isPopularFallback
          ? `<button type="button" class="btn btn-primary btn-sm" data-cart-suggestion="${s.destinationId}">${isInTripCart(s.destinationId) ? '✓ Đã thêm vào giỏ' : '+ Thêm vào giỏ hành trình'}</button>`
          : `<button type="button" class="btn btn-primary btn-sm" data-pick-suggestion="${index}">Chọn hành trình này</button>
             <button type="button" class="btn btn-ghost btn-sm" data-open-quick-adjust="1">Điều chỉnh nhanh</button>`}
      </div>
    </div>
  `;
}

function quickAdjustBarHtml(prefs) {
  return `
    <div class="card" style="padding:14px;" id="quick-adjust-bar">
      <p class="text-sm text-muted" style="margin:0 0 8px;">Điều chỉnh nhanh — hệ thống tính lại ngay, không cần nhập lại form:</p>
      <div class="chip-row">
        <button type="button" class="chip" data-adjust="more-time">⏱️ Tăng thời gian thêm 1 giờ</button>
        ${prefs.budget !== null ? '<button type="button" class="chip" data-adjust="more-budget">💰 Tăng ngân sách 20%</button>' : ''}
        <button type="button" class="chip" data-adjust="fewer-stops">➖ Giảm một điểm dừng</button>
        <button type="button" class="chip" data-adjust="best-match">★ Ưu tiên trải nghiệm phù hợp nhất</button>
      </div>
    </div>
  `;
}

/** Lưu 1 lựa chọn (route hoặc 1 địa điểm đơn) thành hành trình đã lưu — dùng chung cho cả 3 chế độ
 * kết quả (full/partial-route/partial-places) để không lặp lại logic tạo object itinerary. */
function saveResultAsItinerary(container, { name, reason, built, prefs, matchMode = null }) {
  const itinerary = {
    id: uid('itin'),
    name,
    reason,
    createdAt: new Date().toISOString(),
    status: 'selected',
    // matchMode: 'full' | 'partial-route' | 'partial-places' | 'popular-fallback' — ghi lại kết quả
    // AI nào dẫn tới hành trình này (trước đây không lưu, không tính được tỷ lệ exact/partial-match
    // từ dữ liệu đã lưu — xem js/services/managementService.js#getDemandFunnel).
    matchMode,
    date: prefs.date,
    startHour: prefs.startHour,
    startMin: prefs.startMin,
    availableHours: Math.max(1, Math.round(built.totalDurationMin / 60) || prefs.availableHours || 1),
    partySize: prefs.partySize,
    startPoint: prefs.startPoint,
    pace: wizardState.pace,
    priority: wizardState.priority,
    transport: wizardState.transport,
    hasChildren: wizardState.hasChildren,
    accessibilityNeeds: wizardState.accessibilityNeeds,
    stops: built.stops.map((s) => ({ ...s, selfVisitedAt: null, bookingItemId: null })),
    totalDurationMin: built.totalDurationMin,
    totalTravelMin: built.totalTravelMin,
    totalCost: built.totalCost,
    isBookableTour: built.isBookableTour,
    isFreeVisitPlan: !built.isBookableTour,
  };
  recalcTimeline(itinerary);
  saveItinerary(itinerary);
  logCustomerBehaviourEvent('itinerary_submitted', { itineraryId: itinerary.id, matchMode });
  NotificationService.notify('Đã lưu hành trình nháp — bạn có thể chỉnh sửa trước khi bắt đầu.', 'success');
  window.location.hash = `#/trail/itinerary/${itinerary.id}`;
}

function buildRawPrefs() {
  const state = getState();
  const seedIds = new Set([
    ...state.favorites,
    ...state.tripCart.filter((it) => it.selected).map((it) => it.destinationId),
  ]);
  const [startH, startM] = wizardState.startTime.split(':').map(Number);
  return {
    date: wizardState.date,
    startHour: startH,
    startMin: startM,
    availableHours: wizardState.availableHours,
    partySize: wizardState.partySize,
    budget: wizardState.budget,
    startPoint: wizardState.startPoint,
    interests: wizardState.interests,
    pace: wizardState.pace,
    priority: wizardState.priority,
    seedIds,
  };
}

/** Điều chỉnh nhanh (mục 1.5) — cập nhật rawPrefs đang dùng rồi vẽ lại CHỈ phần kết quả, không
 * bắt khách quay lại wizard hay nhập lại toàn bộ form. */
function applyQuickAdjust(container, rawPrefs, kind) {
  const next = { ...rawPrefs };
  if (kind === 'more-time') {
    next.availableHours = (Number(rawPrefs.availableHours) || 4) + 1;
  } else if (kind === 'more-budget') {
    const current = Number(rawPrefs.budget) || 0;
    next.budget = current ? Math.round((current * 1.2) / 10000) * 10000 : current;
  } else if (kind === 'fewer-stops') {
    const currentCap = Number.isFinite(rawPrefs.maxStopsOverride) ? rawPrefs.maxStopsOverride : 4;
    next.maxStopsOverride = Math.max(1, currentCap - 1);
  } else if (kind === 'best-match') {
    next.__bestMatchOnly = true;
  }
  renderResults(container, next);
}

function wireSuggestionActions(container, rawPrefs, suggestions, { isPopularFallback = false, matchMode = null } = {}) {
  qsa('[data-pick-suggestion]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = suggestions[Number(btn.dataset.pickSuggestion)];
      const state = getState();
      const prefs = getItineraryRecommendations(rawPrefs).prefs;
      const built = buildItineraryFromSelection(state, {
        selectedIds: [s.destinationId], date: prefs.date, startHour: prefs.startHour, startMin: prefs.startMin,
        startPoint: prefs.startPoint, partySize: prefs.partySize,
      });
      if (!built) { NotificationService.notify('Không xếp được lịch cho địa điểm này.', 'error'); return; }
      saveResultAsItinerary(container, { name: s.name, reason: 'Gợi ý phù hợp nhất dựa trên lựa chọn của bạn.', built, prefs, matchMode });
    });
  });
  qsa('[data-cart-suggestion]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const active = toggleTripCartItem(btn.dataset.cartSuggestion);
      btn.textContent = active ? '✓ Đã thêm vào giỏ' : '+ Thêm vào giỏ hành trình';
      NotificationService.notify(active ? 'Đã thêm vào giỏ hành trình.' : 'Đã gỡ khỏi giỏ hành trình.', 'success');
    });
  });
  qsa('[data-open-quick-adjust]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      qs('#quick-adjust-bar', container)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

/** Vẽ lại phần kết quả từ rawPrefs hiện tại — gọi ở lần tạo đầu tiên VÀ mỗi lần điều chỉnh nhanh.
 * Luôn trả về ≥1 gợi ý hữu ích (mục 1.1), không bao giờ dừng ở màn hình trống. */
function renderResults(container, rawPrefs) {
  const wantsBestOnly = !!rawPrefs.__bestMatchOnly;
  const cleanPrefs = { ...rawPrefs };
  delete cleanPrefs.__bestMatchOnly;
  const result = getItineraryRecommendations(cleanPrefs);

  const header = `
    <div class="profile-page">
      <a href="#/trail/itinerary" class="text-sm">← Về danh sách hành trình</a>
      <h2>Chọn một hành trình</h2>
  `;
  const footer = `</div>`;

  if (result.mode === 'full') {
    const itineraries = wantsBestOnly ? result.itineraries.slice(0, 1) : result.itineraries;
    const anyBookable = itineraries.some((o) => o.isBookableTour);
    container.innerHTML = `${header}
      <p class="text-sm text-muted">${result.label} — dựa trên sở thích và thời gian bạn vừa nhập.</p>
      ${!anyBookable ? '<div class="demo-note">Hiện chưa có hoạt động cộng đồng phù hợp với thời gian và lịch bạn chọn. Các lựa chọn dưới đây là lịch tham quan tự do (miễn phí, không qua bước đặt/thanh toán).</div>' : ''}
      <div class="flex-col gap-4">${itineraries.map(optionCardHtml).join('')}</div>
    ${footer}`;
    qsa('[data-pick-option]', container).forEach((btn) => {
      btn.addEventListener('click', () => {
        const option = itineraries[Number(btn.dataset.pickOption)];
        saveResultAsItinerary(container, { name: option.name, reason: option.reason, built: option, prefs: result.prefs, matchMode: 'full' });
      });
    });
    return;
  }

  if (result.mode === 'partial-route') {
    const itineraries = wantsBestOnly ? result.itineraries.slice(0, 1) : result.itineraries;
    container.innerHTML = `${header}
      <div class="demo-note"><strong>Chưa có hành trình khớp hoàn toàn</strong><p style="margin:6px 0 0;">Chúng tôi chưa tìm thấy hành trình đáp ứng toàn bộ lựa chọn của bạn. Tuy nhiên, những gợi ý dưới đây vẫn phù hợp với phần lớn nhu cầu và có thể được điều chỉnh thêm trước khi xác nhận.</p></div>
      <div class="flex-col gap-4">${itineraries.map(optionCardHtml).join('')}</div>
      ${quickAdjustBarHtml(result.prefs)}
    ${footer}`;
    qsa('[data-pick-option]', container).forEach((btn) => {
      btn.addEventListener('click', () => {
        const option = itineraries[Number(btn.dataset.pickOption)];
        saveResultAsItinerary(container, { name: option.name, reason: option.reason, built: option, prefs: result.prefs, matchMode: 'partial-route' });
      });
    });
    qsa('[data-adjust]', container).forEach((btn) => btn.addEventListener('click', () => applyQuickAdjust(container, rawPrefs, btn.dataset.adjust)));
    return;
  }

  if (result.mode === 'partial-places') {
    const suggestions = wantsBestOnly ? result.suggestions.slice(0, 1) : result.suggestions;
    container.innerHTML = `${header}
      <div class="demo-note"><strong>Chưa có hành trình khớp hoàn toàn</strong><p style="margin:6px 0 0;">Chúng tôi chưa tìm thấy hành trình đáp ứng toàn bộ lựa chọn của bạn. Tuy nhiên, những gợi ý dưới đây vẫn phù hợp với phần lớn nhu cầu và có thể được điều chỉnh thêm trước khi xác nhận.</p></div>
      <div class="place-grid">${suggestions.map((s, i) => suggestionCardHtml(s, i)).join('')}</div>
      ${quickAdjustBarHtml(result.prefs)}
    ${footer}`;
    wireSuggestionActions(container, rawPrefs, suggestions, { matchMode: 'partial-places' });
    qsa('[data-adjust]', container).forEach((btn) => btn.addEventListener('click', () => applyQuickAdjust(container, rawPrefs, btn.dataset.adjust)));
    return;
  }

  // popular-fallback (mục 1.7) — lỗi kỹ thuật/chưa đủ dữ liệu: gợi ý phổ biến, không trang trắng.
  container.innerHTML = `${header}
    <p class="text-sm text-faint">${escapeHtml(result.fallbackReason || '')}</p>
    ${result.suggestions.length ? `<div class="place-grid">${result.suggestions.map((s, i) => suggestionCardHtml(s, i, { isPopularFallback: true })).join('')}</div>` : '<p class="text-sm text-faint">Chưa có địa điểm nào trong dữ liệu — vui lòng thử lại sau.</p>'}
  ${footer}`;
  wireSuggestionActions(container, rawPrefs, result.suggestions, { isPopularFallback: true, matchMode: 'popular-fallback' });
}

function generateAndRenderResults(container) {
  const rawPrefs = buildRawPrefs();
  logCustomerBehaviourEvent('customisation_request', {
    interests: Array.from(rawPrefs.interests || []),
    budget: rawPrefs.budget,
    partySize: rawPrefs.partySize,
    availableHours: rawPrefs.availableHours,
    priority: rawPrefs.priority,
  });
  renderResults(container, rawPrefs);
}
