import {
  getState, saveItinerary, toggleTripCartItem, isInTripCart,
  getTripCart, setTripCartItemSelected, setTripCartAllSelected, removeTripCartSelected,
  removeFromTripCart, setTripCartPartySize, logCustomerBehaviourEvent,
} from '../storage.js';
import { escapeHtml, uid, categoryEmoji, formatCurrency, formatActivityPrice, formatDurationMin, listingTypeBadge, destinationImageSrc, placeholderImageDataUri, qs, qsa } from '../utils.js';
import { recalcTimeline, buildItineraryFromSelection, suggestCommunityAdditions, getItineraryRecommendations } from '../services/aiService.js';
import { INTEREST_OPTIONS } from '../data.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal, confirmDialog } from '../ui.js';
import * as NavHistory from '../services/navHistoryService.js';
import { t, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('customer', {
  itinerary: {
    status: { selected: 'Đã chọn — chưa bắt đầu', active: 'Đang diễn ra', completed: 'Đã hoàn thành', cancelled: 'Đã huỷ' },
    freeNoBookingNeeded: 'Miễn phí — không cần đặt trước',
    paidNeedsBooking: 'Hoạt động có phí — cần đặt trước khi có supplier xác nhận',
    selectPlace: 'Chọn {name}',
    guestCount: 'Số người',
    view: 'Xem',
    removeFromCart: 'Xoá khỏi giỏ hành trình',
    cartTitle: 'Giỏ hành trình của tôi',
    emptyCartMsg: 'Chưa có địa điểm nào trong giỏ — vào Khám phá và bấm "+ Thêm vào hành trình" ở các địa điểm bạn quan tâm.',
    backToExplore: '🧭 Về Khám phá',
    placesCount: '{count} địa điểm · {selected} đang chọn',
    selectAll: 'Chọn tất cả',
    deselectAll: 'Bỏ chọn tất cả',
    removeSelected: 'Xoá mục đã chọn',
    buildFromSelected: 'Tạo lộ trình từ các điểm đã chọn ({count})',
    removedFromCartNotify: 'Đã gỡ khỏi giỏ hành trình.',
    confirmRemoveSelectedTitle: 'Xoá các mục đã chọn?',
    confirmRemoveSelectedMsg: 'Các địa điểm đang tick sẽ bị xoá khỏi giỏ hành trình.',
    remove: 'Xoá',
    departureDate: 'Ngày đi',
    startTime: 'Giờ bắt đầu',
    defaultPartySize: 'Số người (mặc định cho các mục chưa chỉnh riêng)',
    scheduleArrow: 'Xếp lịch →',
    buildFromSelectionTitle: 'Tạo lộ trình từ các điểm đã chọn',
    couldNotSchedule: 'Không xếp được lịch từ các mục đã chọn.',
    noCommunityMatch: 'Hiện chưa có hoạt động cộng đồng phù hợp trong lựa chọn của bạn. Thêm một trải nghiệm cộng đồng vào hành trình?',
    notBookableYet: 'Chưa bookable',
    addToTrip: '+ Thêm vào hành trình',
    noCommunityForSchedule: 'Không có hoạt động cộng đồng nào phù hợp với thời gian/lịch hiện tại.',
    createFreeVisitSchedule: 'Tạo lịch tham quan tự do',
    tripFromCartName: 'Hành trình từ giỏ hành trình',
    freeVisitScheduleName: 'Lịch tham quan tự do',
    fromCartReason: 'Xếp từ các địa điểm bạn đã chọn trong giỏ hành trình.',
    createdFromCartNotify: 'Đã tạo hành trình từ các điểm đã chọn.',
    createdFreeVisitNotify: 'Đã tạo lịch tham quan tự do từ các điểm đã chọn.',
    yourTripsTitle: 'Hành trình của bạn',
    yourTripsDesc: 'Tạo hành trình cá nhân hoá dựa trên sở thích, thời gian và số người trong đoàn.',
    createNewTrip: '➕ Tạo hành trình mới',
    savedTitle: 'Đã lưu',
    stopsCount: '{count} điểm',
    cancelCreateTrip: '← Huỷ tạo hành trình',
    stepCounter: 'Bước {step}/4',
    step1Title: 'Thời gian & điểm xuất phát',
    departurePoint: 'Điểm xuất phát',
    useMyLocation: '📍 Dùng vị trí của tôi',
    hasStartPoint: 'Đã có điểm xuất phát.',
    noStartPointYet: 'Chưa chọn — vẫn tạo hành trình được, chỉ là không ưu tiên theo khoảng cách.',
    availableHours: 'Thời gian sẵn có (giờ)',
    step2Title: 'Đoàn của bạn',
    estimatedBudget: 'Ngân sách dự kiến cho cả nhóm (đ, không bắt buộc)',
    budgetPlaceholder: 'Bỏ trống = ngân sách linh hoạt',
    hasChildren: 'Có trẻ nhỏ đi cùng',
    accessibilityNeeds: 'Cần hỗ trợ tiếp cận (di chuyển, sức khoẻ...)',
    transportUsing: 'Phương tiện đang dùng',
    motorbike: 'Xe máy',
    car: 'Ô tô',
    bicycle: 'Xe đạp',
    walking: 'Đi bộ',
    transportNote: 'Chỉ dùng để ước tính thời gian di chuyển, không phải đặt phương tiện.',
    step3Title: 'Sở thích & phong cách',
    interestsLabel: 'Sở thích (chọn một hoặc nhiều)',
    paceLabel: 'Nhịp độ',
    paceLight: 'Gọn nhẹ',
    paceModerate: 'Vừa phải',
    paceSlow: 'Chậm và tìm hiểu sâu',
    atmosphereLabel: 'Ưu tiên không khí',
    quiet: 'Yên tĩnh',
    lively: 'Náo nhiệt',
    flexible: 'Linh hoạt',
    step4Title: 'Tuỳ chọn thêm (không bắt buộc)',
    ageGroupLabel: 'Nhóm tuổi trong đoàn',
    ageGroupPlaceholder: 'VD: 25-35, có người lớn tuổi...',
    ageGroupNote: 'Giúp gợi ý phù hợp hơn, không bắt buộc.',
    otherNoteLabel: 'Ghi chú khác',
    otherNotePlaceholder: 'VD: muốn tránh nắng gắt, thích chụp ảnh...',
    back: '← Quay lại',
    continue: 'Tiếp tục →',
    createTrip: 'Tạo hành trình',
    noGeoSupport: 'Trình duyệt không hỗ trợ định vị.',
    locationDetermined: 'Đã xác định vị trí của bạn.',
    usedCurrentLocationNotify: 'Đã dùng vị trí hiện tại làm điểm xuất phát.',
    locationFailedNotify: 'Không lấy được vị trí — vẫn tạo hành trình được, chỉ bỏ qua ưu tiên khoảng cách.',
    demoSuggestionBadge: 'Gợi ý tự động — bản demo',
    hasCommunityActivity: '🏘️ Có hoạt động cộng đồng',
    hasCommunityActivityTip: 'Chi tiêu trực tiếp hỗ trợ đơn vị cung cấp trải nghiệm',
    freeVisitSchedule: '📍 Lịch tham quan tự do',
    communityActivityBadge: 'Hoạt động cộng đồng',
    totalTime: 'Tổng thời gian',
    travelEstimate: 'Di chuyển (ước tính)',
    costPerGuest: 'Chi phí mỗi khách',
    totalForGroup: 'Tổng dự kiến cho nhóm {count} khách',
    chooseThisTrip: 'Chọn hành trình này',
    matchCriteria: 'Phù hợp {count}/5 tiêu chí · {pct}%',
    stopsUnit: '{count} điểm dừng',
    matchedNote: 'Đã khớp: {value}',
    expectedDuration: 'Thời lượng dự kiến',
    costForGroup: 'Chi phí cho cả nhóm',
    viewTrip: 'Xem hành trình',
    addedToCartShort: '✓ Đã thêm vào giỏ',
    addToTripCartShort: '+ Thêm vào giỏ hành trình',
    adjustQuickly: 'Điều chỉnh nhanh',
    quickAdjustDesc: 'Điều chỉnh nhanh — hệ thống tính lại ngay, không cần nhập lại form:',
    moreTimeAdjust: '⏱️ Tăng thời gian thêm 1 giờ',
    moreBudgetAdjust: '💰 Tăng ngân sách 20%',
    fewerStopsAdjust: '➖ Giảm một điểm dừng',
    bestMatchAdjust: '★ Ưu tiên trải nghiệm phù hợp nhất',
    savedDraftNotify: 'Đã lưu hành trình nháp — bạn có thể chỉnh sửa trước khi bắt đầu.',
    couldNotScheduleForPlace: 'Không xếp được lịch cho địa điểm này.',
    bestMatchReason: 'Gợi ý phù hợp nhất dựa trên lựa chọn của bạn.',
    addedToCartNotify: 'Đã thêm vào giỏ hành trình.',
    removedFromCartNotify2: 'Đã gỡ khỏi giỏ hành trình.',
    backToTripList: '← Về danh sách hành trình',
    chooseATrip: 'Chọn một hành trình',
    basedOnPrefs: '{label} — dựa trên sở thích và thời gian bạn vừa nhập.',
    noBookableYet: 'Hiện chưa có hoạt động nào mở đặt chỗ/thanh toán trực tuyến qua hệ thống cho lịch này.',
    pricesForReference: ' Chi phí hiển thị bên dưới là giá niêm yết tham khảo — liên hệ trực tiếp để xác nhận và thanh toán.',
    freeVisitOnly: ' Các lựa chọn dưới đây là lịch tham quan tự do (miễn phí, không qua bước đặt/thanh toán).',
    noFullMatchTitle: 'Chưa có hành trình khớp hoàn toàn',
    noFullMatchDesc: 'Chúng tôi chưa tìm thấy hành trình đáp ứng toàn bộ lựa chọn của bạn. Tuy nhiên, những gợi ý dưới đây vẫn phù hợp với phần lớn nhu cầu và có thể được điều chỉnh thêm trước khi xác nhận.',
    noPlacesYet: 'Chưa có địa điểm nào trong dữ liệu — vui lòng thử lại sau.',
    priceUpdating: 'Đang cập nhật giá',
  },
}, {
  itinerary: {
    status: { selected: 'Selected — not started', active: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' },
    freeNoBookingNeeded: 'Free — no booking needed',
    paidNeedsBooking: 'Paid activity — booking required once confirmed by supplier',
    selectPlace: 'Select {name}',
    guestCount: 'Guests',
    view: 'View',
    removeFromCart: 'Remove from trip cart',
    cartTitle: 'My Trip Cart',
    emptyCartMsg: 'No places in your cart yet — go to Explore and tap "+ Add to Trip" on places you like.',
    backToExplore: '🧭 Back to Explore',
    placesCount: '{count} places · {selected} selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    removeSelected: 'Remove Selected',
    buildFromSelected: 'Build My Trip from Selected ({count})',
    removedFromCartNotify: 'Removed from trip cart.',
    confirmRemoveSelectedTitle: 'Remove selected items?',
    confirmRemoveSelectedMsg: 'Checked places will be removed from your trip cart.',
    remove: 'Remove',
    departureDate: 'Departure date',
    startTime: 'Start time',
    defaultPartySize: 'Group size (default for items not customised)',
    scheduleArrow: 'Build schedule →',
    buildFromSelectionTitle: 'Build My Trip from Selected Places',
    couldNotSchedule: 'Could not build a schedule from the selected places.',
    noCommunityMatch: "There's no matching community activity in your selection yet. Add a community experience to the trip?",
    notBookableYet: 'Not bookable yet',
    addToTrip: '+ Add to Trip',
    noCommunityForSchedule: 'No community activity fits the current time/schedule.',
    createFreeVisitSchedule: 'Create Free-Visit Schedule',
    tripFromCartName: 'Trip from Trip Cart',
    freeVisitScheduleName: 'Free-Visit Schedule',
    fromCartReason: 'Built from the places you selected in your trip cart.',
    createdFromCartNotify: 'Trip created from selected places.',
    createdFreeVisitNotify: 'Free-visit schedule created from selected places.',
    yourTripsTitle: 'Your Trips',
    yourTripsDesc: 'Build a personalised trip based on your preferences, time and group size.',
    createNewTrip: '➕ Build My Trip',
    savedTitle: 'Saved',
    stopsCount: '{count} stops',
    cancelCreateTrip: '← Cancel Trip Creation',
    stepCounter: 'Step {step}/4',
    step1Title: 'Time & Starting Point',
    departurePoint: 'Starting point',
    useMyLocation: '📍 Use My Location',
    hasStartPoint: 'Starting point set.',
    noStartPointYet: 'Not selected — you can still build a trip, it just won\'t prioritise by distance.',
    availableHours: 'Available time (hours)',
    step2Title: 'Your Group',
    estimatedBudget: 'Estimated budget for the whole group (VND, optional)',
    budgetPlaceholder: 'Leave blank = flexible budget',
    hasChildren: 'Travelling with children',
    accessibilityNeeds: 'Needs accessibility support (mobility, health...)',
    transportUsing: 'Transport in use',
    motorbike: 'Motorbike',
    car: 'Car',
    bicycle: 'Bicycle',
    walking: 'Walking',
    transportNote: 'Used only to estimate travel time, not to book transport.',
    step3Title: 'Preferences & Style',
    interestsLabel: 'Interests (choose one or more)',
    paceLabel: 'Pace',
    paceLight: 'Light',
    paceModerate: 'Moderate',
    paceSlow: 'Slow & in-depth',
    atmosphereLabel: 'Atmosphere preference',
    quiet: 'Quiet',
    lively: 'Lively',
    flexible: 'Flexible',
    step4Title: 'Additional Options (optional)',
    ageGroupLabel: 'Age range in your group',
    ageGroupPlaceholder: 'e.g. 25-35, includes elderly members...',
    ageGroupNote: 'Helps make better suggestions, optional.',
    otherNoteLabel: 'Other notes',
    otherNotePlaceholder: 'e.g. want to avoid strong sun, enjoy photography...',
    back: '← Back',
    continue: 'Continue →',
    createTrip: 'Build My Trip',
    noGeoSupport: 'Your browser does not support geolocation.',
    locationDetermined: 'Your location has been determined.',
    usedCurrentLocationNotify: 'Used your current location as the starting point.',
    locationFailedNotify: "Could not get your location — you can still build a trip, distance priority is just skipped.",
    demoSuggestionBadge: 'Automated suggestion — demo',
    hasCommunityActivity: '🏘️ Includes Community Activity',
    hasCommunityActivityTip: 'Spending directly supports the experience provider',
    freeVisitSchedule: '📍 Free-Visit Schedule',
    communityActivityBadge: 'Community Activity',
    totalTime: 'Total time',
    travelEstimate: 'Travel (estimated)',
    costPerGuest: 'Cost per guest',
    totalForGroup: 'Estimated total for {count} guests',
    chooseThisTrip: 'Choose This Trip',
    matchCriteria: 'Matches {count}/5 criteria · {pct}%',
    stopsUnit: '{count} stops',
    matchedNote: 'Matched: {value}',
    expectedDuration: 'Expected duration',
    costForGroup: 'Cost for the whole group',
    viewTrip: 'View Trip',
    addedToCartShort: '✓ Added to Cart',
    addToTripCartShort: '+ Add to Trip Cart',
    adjustQuickly: 'Quick Adjust',
    quickAdjustDesc: 'Quick adjust — recalculated instantly, no need to redo the form:',
    moreTimeAdjust: '⏱️ Add 1 More Hour',
    moreBudgetAdjust: '💰 Increase Budget 20%',
    fewerStopsAdjust: '➖ Remove One Stop',
    bestMatchAdjust: '★ Prioritise Best Match',
    savedDraftNotify: 'Trip draft saved — you can edit it before starting.',
    couldNotScheduleForPlace: 'Could not build a schedule for this place.',
    bestMatchReason: 'Best match based on your selections.',
    addedToCartNotify: 'Added to trip cart.',
    removedFromCartNotify2: 'Removed from trip cart.',
    backToTripList: '← Back to Trip List',
    chooseATrip: 'Choose a Trip',
    basedOnPrefs: '{label} — based on the preferences and time you just entered.',
    noBookableYet: 'No activity in this schedule currently supports online booking/payment through the system.',
    pricesForReference: ' Prices shown below are reference list prices — contact directly to confirm and pay.',
    freeVisitOnly: ' The options below are free-visit schedules (no booking/payment step).',
    noFullMatchTitle: 'No Fully Matching Trip Found',
    noFullMatchDesc: "We couldn't find a trip meeting all your selections. However, the suggestions below still fit most of your needs and can be adjusted further before confirming.",
    noPlacesYet: 'No places in the data yet — please try again later.',
    priceUpdating: 'Price Updating',
  },
});

function cartItemHtml(item, dest) {
  if (!dest) return '';
  const typeBadge = listingTypeBadge(dest.listingType);
  const priceNote = dest.revenueType === 'free_visit' ? t('customer.itinerary.freeNoBookingNeeded') : t('customer.itinerary.paidNeedsBooking');
  const name = localizedDestinationName(dest);
  return `
    <div class="card flex items-center gap-2 wrap" style="padding:10px;" data-cart-item="${item.destinationId}">
      <input type="checkbox" class="cart-item-check" data-check="${item.destinationId}" ${item.selected ? 'checked' : ''} aria-label="${t('customer.itinerary.selectPlace', { name: escapeHtml(name) })}">
      <img src="${destinationImageSrc(dest)}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;">
      <div style="flex:1;min-width:160px;">
        <strong style="display:block;">${escapeHtml(name)}</strong>
        <span class="text-sm text-muted">${escapeHtml(typeBadge.label)} · ${escapeHtml(priceNote)}</span>
      </div>
      <label class="text-sm text-muted flex items-center gap-1">${t('customer.itinerary.guestCount')}
        <input type="number" min="1" max="20" class="field-input" style="width:56px;padding:6px;" data-party="${item.destinationId}" value="${item.partySize}">
      </label>
      <a class="btn btn-ghost btn-sm" href="#/trail/place/${dest.id}">${t('customer.itinerary.view')}</a>
      <button type="button" class="btn btn-ghost btn-sm" data-remove="${item.destinationId}" aria-label="${t('customer.itinerary.removeFromCart')}">✕</button>
    </div>
  `;
}

function cartSectionHtml(state) {
  const cart = getTripCart();
  const selectedCount = cart.filter((it) => it.selected).length;
  if (!cart.length) {
    return `
      <section class="card" style="padding:20px;">
        <h2 style="margin-top:0;">${t('customer.itinerary.cartTitle')}</h2>
        <p class="text-sm text-muted">${t('customer.itinerary.emptyCartMsg')}</p>
        <a class="btn btn-secondary" href="#/trail/explore">${t('customer.itinerary.backToExplore')}</a>
      </section>
    `;
  }
  return `
    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h2 style="margin:0;">${t('customer.itinerary.cartTitle')}</h2>
        <span class="text-sm text-muted">${t('customer.itinerary.placesCount', { count: cart.length, selected: selectedCount })}</span>
      </div>
      <div class="cta-row" style="margin:10px 0;">
        <button type="button" class="btn btn-secondary btn-sm" id="cart-select-all">${t('customer.itinerary.selectAll')}</button>
        <button type="button" class="btn btn-secondary btn-sm" id="cart-deselect-all">${t('customer.itinerary.deselectAll')}</button>
        <button type="button" class="btn btn-ghost btn-sm" id="cart-remove-selected" ${selectedCount ? '' : 'disabled'}>${t('customer.itinerary.removeSelected')}</button>
      </div>
      <div class="flex-col gap-2" id="cart-list">
        ${cart.map((item) => cartItemHtml(item, state.destinations.find((d) => d.id === item.destinationId))).join('')}
      </div>
      <button type="button" class="btn btn-primary btn-block" id="cart-build-btn" style="margin-top:12px;" ${selectedCount ? '' : 'disabled'}>${t('customer.itinerary.buildFromSelected', { count: selectedCount })}</button>
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
      NotificationService.notify(t('customer.itinerary.removedFromCartNotify'), 'info');
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
    confirmDialog({ title: t('customer.itinerary.confirmRemoveSelectedTitle'), message: t('customer.itinerary.confirmRemoveSelectedMsg'), confirmLabel: t('customer.itinerary.remove'), danger: true }).then((ok) => {
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
      <div><label class="field-label" for="bfs-date">${t('customer.itinerary.departureDate')}</label><input type="date" class="field-input" id="bfs-date" value="${today}"></div>
      <div><label class="field-label" for="bfs-time">${t('customer.itinerary.startTime')}</label><input type="time" class="field-input" id="bfs-time" value="08:00"></div>
      <div><label class="field-label" for="bfs-party">${t('customer.itinerary.defaultPartySize')}</label><input type="number" min="1" max="20" class="field-input" id="bfs-party" value="2"></div>
      <div class="modal__actions">
        <button type="button" class="btn btn-primary btn-block" id="bfs-next">${t('customer.itinerary.scheduleArrow')}</button>
      </div>
    </div>
  `;
  const close = openModal({
    title: t('customer.itinerary.buildFromSelectionTitle'),
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
          setBody(`<p class="text-sm text-faint">${t('customer.itinerary.couldNotSchedule')}</p>`);
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
            <p class="demo-note">${t('customer.itinerary.noCommunityMatch')}</p>
            ${suggestions.length ? `
              <div class="flex-col gap-2">
                ${suggestions.map((s) => `
                  <div class="activity-card">
                    <div class="activity-card__head">
                      <strong>${escapeHtml(s.name)}</strong>
                      ${s.bookable ? `<span class="activity-card__price">${formatCurrency(s.price)}</span>` : `<span class="badge badge-demo">${t('customer.itinerary.notBookableYet')}</span>`}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" data-add-suggestion="${s.destinationId}" style="margin-top:6px;">${t('customer.itinerary.addToTrip')}</button>
                  </div>
                `).join('')}
              </div>
            ` : `<p class="text-sm text-faint">${t('customer.itinerary.noCommunityForSchedule')}</p>`}
            <div class="modal__actions">
              <button type="button" class="btn btn-ghost" id="bfs-free-visit">${t('customer.itinerary.createFreeVisitSchedule')}</button>
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
          name: built.isBookableTour ? t('customer.itinerary.tripFromCartName') : t('customer.itinerary.freeVisitScheduleName'),
          reason: t('customer.itinerary.fromCartReason'),
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
          built.isBookableTour ? t('customer.itinerary.createdFromCartNotify') : t('customer.itinerary.createdFreeVisitNotify'),
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
    <div class="profile-page profile-page--wide">
      <div class="trip-builder-grid">
        ${cartSectionHtml(state)}
        <section class="card" style="padding:20px;text-align:center;">
          <h2 style="margin-top:0;">${t('customer.itinerary.yourTripsTitle')}</h2>
          <p class="text-sm text-muted">${t('customer.itinerary.yourTripsDesc')}</p>
          <a class="btn btn-primary" href="#/trail/itinerary/new">${t('customer.itinerary.createNewTrip')}</a>
        </section>
      </div>
      ${state.itineraries.length ? `
        <section>
          <div class="section-title"><h2>${t('customer.itinerary.savedTitle')}</h2></div>
          <div class="flex-col gap-3">
            ${state.itineraries.slice().reverse().map((it) => {
              // Làm mới totalCost từ Activity Catalog trước khi hiển thị — tự "vá" hành trình đã
              // lưu trước bản sửa lỗi giá (không cần migration/tăng schema version riêng, xem
              // recalcTimeline() trong aiService.js). Chỉ tính lại trong bộ nhớ, không tự persist.
              recalcTimeline(it);
              return `
              <a class="gateway-item" href="#/trail/itinerary/${it.id}">
                <strong>${escapeHtml(it.name)}</strong>
                <span class="text-sm text-muted">${escapeHtml(t(`customer.itinerary.status.${it.status}`) || it.status)} · ${t('customer.itinerary.stopsCount', { count: it.stops.length })} · ${formatCurrency(it.totalCost)}</span>
              </a>
            `;
            }).join('')}
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
  // Ghi nhớ MÀN KẾT QUẢ (không phải 1 "bước" trong step 1-4) để có thể vẽ lại y nguyên khi khách
  // quay lại từ trang chi tiết địa điểm (xem renderItineraryWizard) — không tính lại gợi ý AI
  // hay reset về bước 1 chỉ vì đã mở rồi đóng 1 địa điểm.
  viewingResults: false,
  lastRawPrefs: null,
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
  wizardState.viewingResults = false;
  wizardState.lastRawPrefs = null;
}

function progressHtml() {
  return `<p class="text-sm text-muted">${t('customer.itinerary.stepCounter', { step: wizardState.step })}</p>`;
}

function step1Html() {
  return `
    ${progressHtml()}
    <h2>${t('customer.itinerary.step1Title')}</h2>
    <div class="flex-col gap-3">
      <div><label class="field-label" for="wz-date">${t('customer.itinerary.departureDate')}</label><input type="date" class="field-input" id="wz-date" value="${wizardState.date}"></div>
      <div><label class="field-label" for="wz-time">${t('customer.itinerary.startTime')}</label><input type="time" class="field-input" id="wz-time" value="${wizardState.startTime}"></div>
      <div><label class="field-label" for="wz-hours">${t('customer.itinerary.availableHours')}</label><input type="number" min="1" max="10" class="field-input" id="wz-hours" value="${wizardState.availableHours}"></div>
      <div>
        <span class="field-label">${t('customer.itinerary.departurePoint')}</span>
        <button type="button" class="btn btn-secondary btn-sm" id="wz-use-gps">${t('customer.itinerary.useMyLocation')}</button>
        <span class="text-sm text-muted" id="wz-gps-status">${wizardState.startPoint ? t('customer.itinerary.hasStartPoint') : t('customer.itinerary.noStartPointYet')}</span>
      </div>
    </div>
  `;
}

function step2Html() {
  return `
    ${progressHtml()}
    <h2>${t('customer.itinerary.step2Title')}</h2>
    <div class="flex-col gap-3">
      <div><label class="field-label" for="wz-party">${t('customer.itinerary.guestCount')}</label><input type="number" min="1" max="20" class="field-input" id="wz-party" value="${wizardState.partySize}"></div>
      <div>
        <label class="field-label" for="wz-budget">${t('customer.itinerary.estimatedBudget')}</label>
        <input type="number" min="0" step="10000" class="field-input" id="wz-budget" placeholder="${t('customer.itinerary.budgetPlaceholder')}" value="${escapeHtml(wizardState.budget)}">
      </div>
      <label class="flex items-center gap-2"><input type="checkbox" id="wz-children" ${wizardState.hasChildren ? 'checked' : ''}> ${t('customer.itinerary.hasChildren')}</label>
      <label class="flex items-center gap-2"><input type="checkbox" id="wz-access" ${wizardState.accessibilityNeeds ? 'checked' : ''}> ${t('customer.itinerary.accessibilityNeeds')}</label>
      <div>
        <label class="field-label" for="wz-transport">${t('customer.itinerary.transportUsing')}</label>
        <select class="field-select" id="wz-transport">
          <option value="xe-may" ${wizardState.transport === 'xe-may' ? 'selected' : ''}>${t('customer.itinerary.motorbike')}</option>
          <option value="o-to" ${wizardState.transport === 'o-to' ? 'selected' : ''}>${t('customer.itinerary.car')}</option>
          <option value="xe-dap" ${wizardState.transport === 'xe-dap' ? 'selected' : ''}>${t('customer.itinerary.bicycle')}</option>
          <option value="di-bo" ${wizardState.transport === 'di-bo' ? 'selected' : ''}>${t('customer.itinerary.walking')}</option>
        </select>
        <p class="text-sm text-faint">${t('customer.itinerary.transportNote')}</p>
      </div>
    </div>
  `;
}

function step3Html() {
  return `
    ${progressHtml()}
    <h2>${t('customer.itinerary.step3Title')}</h2>
    <div class="flex-col gap-3">
      <div>
        <span class="field-label">${t('customer.itinerary.interestsLabel')}</span>
        <div class="chip-row">
          ${INTEREST_OPTIONS.map((o) => `<button type="button" class="chip" data-interest="${o.value}" aria-pressed="${wizardState.interests.has(o.value)}">${escapeHtml(t(`common.interest.${o.value}`))}</button>`).join('')}
        </div>
      </div>
      <div>
        <span class="field-label">${t('customer.itinerary.paceLabel')}</span>
        <div class="chip-row">
          <button type="button" class="chip" data-pace="gon-nhe" aria-pressed="${wizardState.pace === 'gon-nhe'}">${t('customer.itinerary.paceLight')}</button>
          <button type="button" class="chip" data-pace="vua-phai" aria-pressed="${wizardState.pace === 'vua-phai'}">${t('customer.itinerary.paceModerate')}</button>
          <button type="button" class="chip" data-pace="cham-va-tim-hieu-sau" aria-pressed="${wizardState.pace === 'cham-va-tim-hieu-sau'}">${t('customer.itinerary.paceSlow')}</button>
        </div>
      </div>
      <div>
        <span class="field-label">${t('customer.itinerary.atmosphereLabel')}</span>
        <div class="chip-row">
          <button type="button" class="chip" data-priority="yen-tinh" aria-pressed="${wizardState.priority === 'yen-tinh'}">${t('customer.itinerary.quiet')}</button>
          <button type="button" class="chip" data-priority="nao-nhiet" aria-pressed="${wizardState.priority === 'nao-nhiet'}">${t('customer.itinerary.lively')}</button>
          <button type="button" class="chip" data-priority="linh-hoat" aria-pressed="${wizardState.priority === 'linh-hoat'}">${t('customer.itinerary.flexible')}</button>
        </div>
      </div>
    </div>
  `;
}

function step4Html() {
  return `
    ${progressHtml()}
    <h2>${t('customer.itinerary.step4Title')}</h2>
    <div class="flex-col gap-3">
      <div>
        <label class="field-label" for="wz-age">${t('customer.itinerary.ageGroupLabel')}</label>
        <input type="text" class="field-input" id="wz-age" placeholder="${t('customer.itinerary.ageGroupPlaceholder')}" value="${escapeHtml(wizardState.ageGroup)}">
        <p class="text-sm text-faint">${t('customer.itinerary.ageGroupNote')}</p>
      </div>
      <div>
        <label class="field-label" for="wz-note">${t('customer.itinerary.otherNoteLabel')}</label>
        <textarea class="field-input" id="wz-note" rows="2" placeholder="${t('customer.itinerary.otherNotePlaceholder')}">${escapeHtml(wizardState.destinationNote)}</textarea>
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
    if (!navigator.geolocation) { NotificationService.notify(t('customer.itinerary.noGeoSupport'), 'error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        wizardState.startPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        qs('#wz-gps-status', root).textContent = t('customer.itinerary.locationDetermined');
        NotificationService.notify(t('customer.itinerary.usedCurrentLocationNotify'), 'success');
      },
      () => NotificationService.notify(t('customer.itinerary.locationFailedNotify'), 'error'),
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
      <a href="#/trail/itinerary" class="text-sm">${t('customer.itinerary.cancelCreateTrip')}</a>
      <section class="card" style="padding:20px;">
        ${html}
        <div class="cta-row" style="margin-top:16px;">
          ${wizardState.step > 1 ? `<button type="button" class="btn btn-secondary" id="wz-back">${t('customer.itinerary.back')}</button>` : ''}
          <button type="button" class="btn btn-primary" id="wz-next">${wizardState.step < 4 ? t('customer.itinerary.continue') : t('customer.itinerary.createTrip')}</button>
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
  // Quay lại từ trang chi tiết địa điểm (khách mở "Xem hành trình" trên 1 gợi ý rồi bấm Quay lại)
  // — vẽ lại ĐÚNG màn kết quả đang xem, không reset wizard về bước 1 và không tính lại gợi ý AI.
  if (NavHistory.isRestoring() && wizardState.viewingResults && wizardState.lastRawPrefs) {
    renderResults(container, wizardState.lastRawPrefs);
    return;
  }
  resetWizard();
  renderWizardStep(container);
}

function optionCardHtml(option, index, partySize = 1) {
  // Mỗi điểm dừng vẫn hiển thị giá riêng (per-stop) bên cạnh tên, cộng với dòng tổng "mỗi khách" +
  // "cả nhóm" ở cuối — không gọi cả tour là "Miễn phí" chỉ vì một phần điểm dừng miễn phí (trước
  // đây `formatCurrency(option.totalCost)` luôn ra "Miễn phí" do totalCost bị tính sai bằng 0).
  return `
    <div class="card" style="padding:18px;">
      <h3 style="margin-top:0;">${escapeHtml(option.name)}</h3>
      <p class="text-sm text-muted">${escapeHtml(option.reason)}</p>
      <div class="badge-row" style="margin:0;">
        <span class="badge badge-demo">${t('customer.itinerary.demoSuggestionBadge')}</span>
        ${option.isBookableTour
          ? `<span class="badge badge-new" title="${t('customer.itinerary.hasCommunityActivityTip')}">${t('customer.itinerary.hasCommunityActivity')}</span>`
          : `<span class="badge badge-type">${t('customer.itinerary.freeVisitSchedule')}</span>`}
      </div>
      <div class="flex-col gap-2" style="margin:12px 0;">
        ${option.stops.map((s) => `<div class="text-sm">${categoryEmoji(s.category)} ${escapeHtml(s.name)} <span class="text-faint">(${Math.floor(s.arriveMin / 60)}:${String(s.arriveMin % 60).padStart(2, '0')}–${Math.floor(s.departMin / 60)}:${String(s.departMin % 60).padStart(2, '0')})</span>${s.experienceId ? ` — ${escapeHtml(s.experienceTitle)}` : ''} <span class="text-faint">· ${escapeHtml(formatActivityPrice(s.pricePerPerson))}</span>${s.isCommunityActivity && s.bookable ? ` <span class="badge badge-new text-sm">${t('customer.itinerary.communityActivityBadge')}</span>` : ''}</div>`).join('')}
      </div>
      <div class="quick-facts">
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.itinerary.totalTime')}</span><span class="quick-fact__value">${formatDurationMin(option.totalDurationMin)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.itinerary.travelEstimate')}</span><span class="quick-fact__value">${formatDurationMin(option.totalTravelMin)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.itinerary.costPerGuest')}</span><span class="quick-fact__value">${escapeHtml(formatActivityPrice(option.pricePerPersonTotal))}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.itinerary.totalForGroup', { count: partySize })}</span><span class="quick-fact__value">${formatCurrency(option.totalCost)}</span></div>
      </div>
      <button type="button" class="btn btn-primary btn-block" data-pick-option="${index}" style="margin-top:12px;">${t('customer.itinerary.chooseThisTrip')}</button>
    </div>
  `;
}

function suggestionCardHtml(s, index, { isPopularFallback = false } = {}) {
  const img = s.image || placeholderImageDataUri(s.category, s.name);
  const matchBadge = s.matchScore !== null
    ? `<span class="badge badge-new">${t('customer.itinerary.matchCriteria', { count: s.matchedCriteria.length, pct: s.matchScore })}</span>`
    : (s.ratingLabel ? `<span class="badge badge-type">${escapeHtml(s.ratingLabel)}</span>` : '');
  return `
    <div class="card" style="padding:16px;overflow:hidden;" data-suggestion-card="${index}">
      <img src="${escapeHtml(img)}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;margin-bottom:10px;" loading="lazy">
      <h3 style="margin:0 0 4px;">${escapeHtml(s.name)}</h3>
      <div class="badge-row" style="margin:0 0 6px;">
        ${matchBadge}
        <span class="badge badge-type">${t('customer.itinerary.stopsUnit', { count: s.stopCount })}</span>
      </div>
      ${s.matchedCriteria && s.matchedCriteria.length ? `<p class="text-sm text-faint" style="margin:0 0 6px;">${t('customer.itinerary.matchedNote', { value: s.matchedCriteria.map((m) => escapeHtml(m)).join(', ') })}</p>` : ''}
      <div class="quick-facts" style="margin:0 0 8px;">
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.itinerary.expectedDuration')}</span><span class="quick-fact__value">${formatDurationMin(s.durationMin)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.itinerary.costPerGuest')}</span><span class="quick-fact__value">${escapeHtml(formatActivityPrice(s.pricePerPerson))}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('customer.itinerary.costForGroup')}</span><span class="quick-fact__value">${s.totalCost === null || s.totalCost === undefined ? t('customer.itinerary.priceUpdating') : formatCurrency(s.totalCost)}</span></div>
      </div>
      ${s.unmetNote ? `<p class="text-sm" style="margin:0 0 6px;color:var(--color-danger,#b3413a);">⚠️ ${escapeHtml(s.unmetNote)}</p>` : ''}
      <div class="cta-row" style="margin-top:8px;">
        <a class="btn btn-secondary btn-sm" href="#/trail/place/${s.destinationId}">${t('customer.itinerary.viewTrip')}</a>
        ${isPopularFallback
          ? `<button type="button" class="btn btn-primary btn-sm" data-cart-suggestion="${s.destinationId}">${isInTripCart(s.destinationId) ? t('customer.itinerary.addedToCartShort') : t('customer.itinerary.addToTripCartShort')}</button>`
          : `<button type="button" class="btn btn-primary btn-sm" data-pick-suggestion="${index}">${t('customer.itinerary.chooseThisTrip')}</button>
             <button type="button" class="btn btn-ghost btn-sm" data-open-quick-adjust="1">${t('customer.itinerary.adjustQuickly')}</button>`}
      </div>
    </div>
  `;
}

function quickAdjustBarHtml(prefs) {
  return `
    <div class="card" style="padding:14px;" id="quick-adjust-bar">
      <p class="text-sm text-muted" style="margin:0 0 8px;">${t('customer.itinerary.quickAdjustDesc')}</p>
      <div class="chip-row">
        <button type="button" class="chip" data-adjust="more-time">${t('customer.itinerary.moreTimeAdjust')}</button>
        ${prefs.budget !== null ? `<button type="button" class="chip" data-adjust="more-budget">${t('customer.itinerary.moreBudgetAdjust')}</button>` : ''}
        <button type="button" class="chip" data-adjust="fewer-stops">${t('customer.itinerary.fewerStopsAdjust')}</button>
        <button type="button" class="chip" data-adjust="best-match">${t('customer.itinerary.bestMatchAdjust')}</button>
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
  NotificationService.notify(t('customer.itinerary.savedDraftNotify'), 'success');
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
      if (!built) { NotificationService.notify(t('customer.itinerary.couldNotScheduleForPlace'), 'error'); return; }
      saveResultAsItinerary(container, { name: s.name, reason: t('customer.itinerary.bestMatchReason'), built, prefs, matchMode });
    });
  });
  qsa('[data-cart-suggestion]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const active = toggleTripCartItem(btn.dataset.cartSuggestion);
      btn.textContent = active ? t('customer.itinerary.addedToCartShort') : t('customer.itinerary.addToTripCartShort');
      NotificationService.notify(active ? t('customer.itinerary.addedToCartNotify') : t('customer.itinerary.removedFromCartNotify2'), 'success');
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
  // Ghi nhớ để renderItineraryWizard() có thể vẽ lại đúng màn này khi khách quay lại từ trang chi
  // tiết địa điểm (mở "Xem hành trình" trên 1 thẻ gợi ý rồi bấm Quay lại) — không phải state mới,
  // chỉ là bản sao tham số đã dùng để tính kết quả đang hiển thị.
  wizardState.viewingResults = true;
  wizardState.lastRawPrefs = rawPrefs;
  const wantsBestOnly = !!rawPrefs.__bestMatchOnly;
  const cleanPrefs = { ...rawPrefs };
  delete cleanPrefs.__bestMatchOnly;
  const result = getItineraryRecommendations(cleanPrefs);

  const header = `
    <div class="profile-page">
      <a href="#/trail/itinerary" class="text-sm">${t('customer.itinerary.backToTripList')}</a>
      <h2>${t('customer.itinerary.chooseATrip')}</h2>
  `;
  const footer = `</div>`;

  if (result.mode === 'full') {
    const itineraries = wantsBestOnly ? result.itineraries.slice(0, 1) : result.itineraries;
    const anyBookable = itineraries.some((o) => o.isBookableTour);
    const anyPriced = itineraries.some((o) => o.totalCost > 0);
    container.innerHTML = `${header}
      <p class="text-sm text-muted">${t('customer.itinerary.basedOnPrefs', { label: result.label })}</p>
      ${!anyBookable ? `<div class="demo-note">${t('customer.itinerary.noBookableYet')}${anyPriced ? t('customer.itinerary.pricesForReference') : t('customer.itinerary.freeVisitOnly')}</div>` : ''}
      <div class="flex-col gap-4">${itineraries.map((o, i) => optionCardHtml(o, i, result.prefs.partySize)).join('')}</div>
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
      <div class="demo-note"><strong>${t('customer.itinerary.noFullMatchTitle')}</strong><p style="margin:6px 0 0;">${t('customer.itinerary.noFullMatchDesc')}</p></div>
      <div class="flex-col gap-4">${itineraries.map((o, i) => optionCardHtml(o, i, result.prefs.partySize)).join('')}</div>
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
      <div class="demo-note"><strong>${t('customer.itinerary.noFullMatchTitle')}</strong><p style="margin:6px 0 0;">${t('customer.itinerary.noFullMatchDesc')}</p></div>
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
    ${result.suggestions.length ? `<div class="place-grid">${result.suggestions.map((s, i) => suggestionCardHtml(s, i, { isPopularFallback: true })).join('')}</div>` : `<p class="text-sm text-faint">${t('customer.itinerary.noPlacesYet')}</p>`}
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
