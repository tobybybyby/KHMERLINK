import { getState, toggleTripCartItem, isInTripCart } from '../storage.js';
import {
  escapeHtml, matchesQuery, haversineKm,
  categoryEmoji, deriveCategoryVisual, categoryGroupLabel, debounce, qs, qsa,
  destinationImageSrc, getSimulatedCrowdLevel, listingTypeBadge, formatDurationMin,
} from '../utils.js';
import { PAIR_SUGGESTIONS } from '../data.js';
import { MapService } from '../services/mapService.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal, renderEmptyState, renderErrorState } from '../ui.js';
import { getRatingStatsForListing, formatRatingStats } from '../services/reviewsService.js';
import { computeOpenStatus, formatPricePerPerson, getNearestSlotAvailability, getOperations } from '../services/operationsService.js';
import { t, registerTranslations, getCurrentLanguage, formatDate } from '../services/i18nService.js';
import { localizedDestinationName, localizedDestinationSummary } from '../services/destinationsService.js';

registerTranslations('customer', {
  explore: {
    title: 'Mạng lưới trải nghiệm văn hóa Khmer (pilot)',
    subtitle: '7 điểm và trải nghiệm pilot tại Vĩnh Long — một số đã xác minh có thể tham quan, một số vẫn là đề xuất đang chờ khảo sát/xác nhận supplier trước khi mở bán.',
    searchPlaceholder: 'Tìm địa điểm, trải nghiệm... (không cần dấu)',
    searchA11y: 'Tìm kiếm địa điểm',
    filterBtn: 'Bộ lọc',
    heatmapBtn: 'Mật độ (mô phỏng)',
    mapA11y: 'Bản đồ địa điểm và trải nghiệm',
    myLocation: 'Vị trí của tôi',
    togglePanel: 'Mở/thu gọn danh sách',
    viewList: 'Xem danh sách',
    resultsLabel: '{count} kết quả — chạm để xem danh sách',
    noResultsTitle: 'Không tìm thấy địa điểm phù hợp',
    noResultsMsg: 'Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm.',
    verifyingPrice: 'Đang xác minh giá',
    noCoords: 'Chưa có toạ độ',
    estimated: '· ước lượng',
    addedToTripA11y: 'Đã thêm vào hành trình — bấm để gỡ',
    addToTripA11y: 'Thêm vào hành trình',
    addedShort: '✓ Đã thêm',
    addAction: '+ Thêm vào hành trình',
    viewOnMap: 'Xem {name} trên bản đồ',
    viewDetailOf: 'Xem chi tiết {name}',
    addedNotify: 'Đã thêm {name} vào hành trình của bạn.',
    removedNotify: 'Đã gỡ {name} khỏi giỏ hành trình.',
    noPublicPin: 'Địa điểm này chưa có toạ độ công khai để hiện trên bản đồ.',
    newOnNetwork: 'Mới trên mạng lưới',
    upcomingEvents: 'Sự kiện sắp tới',
    illustrativeDate: 'Ngày minh hoạ',
    viewPlace: 'Xem địa điểm',
    personalizeCta: 'Cho chúng tôi biết sở thích để gợi ý hành trình phù hợp với bạn',
    buildTripCta: 'Tạo hành trình →',
    filterModalTitle: 'Bộ lọc',
    distanceLabel: 'Khoảng cách từ điểm xuất phát',
    noLimit: 'Không giới hạn',
    within: 'Trong {km}km',
    distanceHint: 'Bấm nút 📍 trên bản đồ (hoặc chọn điểm trên bản đồ) để bật lọc theo khoảng cách. Địa điểm chưa có toạ độ sẽ tự ẩn khi bật bộ lọc này — hiện phần lớn 7 listing pilot chưa có toạ độ công khai.',
    reset: 'Đặt lại',
    apply: 'Áp dụng',
    yourLocation: 'Vị trí của bạn',
    noGeoSupport: 'Trình duyệt không hỗ trợ định vị.',
    requestingLocation: 'Đang xin quyền truy cập vị trí…',
    locationFailed: 'Không lấy được vị trí (có thể do bạn đã từ chối cấp quyền).',
    pickOnMap: 'Chọn điểm trên bản đồ',
    tapToPick: 'Chạm vào bản đồ để đặt điểm xuất phát của bạn.',
    locationSetManual: 'Đã đặt điểm xuất phát trên bản đồ.',
    locationSet: 'Đã xác định vị trí của bạn.',
    mapLoadError: 'Không tải được bản đồ',
    mapLoadErrorMsg: 'Có thể do kết nối mạng hoặc thư viện bản đồ tạm thời không khả dụng. Bạn vẫn có thể xem danh sách địa điểm bên dưới.',
    dataLoadError: 'Chưa tải được dữ liệu địa điểm',
    dataLoadErrorMsg: 'Không đọc được data/pilot-listings.json. Kiểm tra bạn đang chạy qua static server (không mở trực tiếp file), sau đó tải lại trang.',
    noCoordsHint: '({count} chưa có toạ độ xác thực, chỉ xem được trong danh sách/mở Google Maps)',
    heatmapNote: '· Mật độ mô phỏng, cập nhật lúc {time} (không phải số liệu thời gian thực).',
    countAll: '{total} điểm và trải nghiệm pilot',
    countFiltered: '{visible}/{total} điểm và trải nghiệm pilot đang hiển thị theo bộ lọc',
    statsFooter: '— không phải thống kê chính thức của tỉnh.',
    directions: 'Chỉ đường',
    priceUnverified: 'Chưa xác minh giá',
    hoursUnverified: 'Chưa xác minh giờ mở cửa',
    pairSuggestion: {
      'pair-lam-phen': 'Cùng đầu mối NNƯT Lâm Phên',
      'pair-nguyet-hoa': 'Cụm Nguyệt Hóa — Ao Bà Om',
    },
  },
}, {
  explore: {
    title: 'Khmer Cultural Experience Network (pilot)',
    subtitle: '7 pilot sites and experiences in Vĩnh Long — some verified as visitable, some are proposals still awaiting supplier survey/confirmation before launch.',
    searchPlaceholder: 'Search places, experiences... (no diacritics needed)',
    searchA11y: 'Search places',
    filterBtn: 'Filters',
    heatmapBtn: 'Density (simulated)',
    mapA11y: 'Map of places and experiences',
    myLocation: 'My location',
    togglePanel: 'Expand/collapse list',
    viewList: 'View list',
    resultsLabel: '{count} results — tap to view list',
    noResultsTitle: 'No matching places found',
    noResultsMsg: 'Try removing some filters or changing your search term.',
    verifyingPrice: 'Verifying price',
    noCoords: 'No coordinates yet',
    estimated: '· estimated',
    addedToTripA11y: 'Added to trip — tap to remove',
    addToTripA11y: 'Add to trip',
    addedShort: '✓ Added',
    addAction: '+ Add to trip',
    viewOnMap: 'View {name} on the map',
    viewDetailOf: 'View details of {name}',
    addedNotify: 'Added {name} to your trip.',
    removedNotify: 'Removed {name} from your trip cart.',
    noPublicPin: 'This place does not have a public pin to show on the map yet.',
    newOnNetwork: 'New on the network',
    upcomingEvents: 'Upcoming events',
    illustrativeDate: 'Illustrative date',
    viewPlace: 'View place',
    personalizeCta: 'Tell us your preferences for trip suggestions that fit you',
    buildTripCta: 'Build My Trip →',
    filterModalTitle: 'Filters',
    distanceLabel: 'Distance from your starting point',
    noLimit: 'No limit',
    within: 'Within {km}km',
    distanceHint: 'Tap the 📍 button on the map (or pick a point on the map) to enable distance filtering. Places without coordinates are auto-hidden when this filter is on — most of the 7 pilot listings do not have public coordinates yet.',
    reset: 'Reset',
    apply: 'Apply',
    yourLocation: 'Your location',
    noGeoSupport: 'Your browser does not support geolocation.',
    requestingLocation: 'Requesting location access…',
    locationFailed: 'Could not get your location (you may have denied permission).',
    pickOnMap: 'Pick a point on the map',
    tapToPick: 'Tap the map to set your starting point.',
    locationSetManual: 'Starting point set on the map.',
    locationSet: 'Your location has been set.',
    mapLoadError: 'Could not load the map',
    mapLoadErrorMsg: 'This may be due to a network issue or the map library being temporarily unavailable. You can still browse the list of places below.',
    dataLoadError: 'Could not load place data',
    dataLoadErrorMsg: 'Could not read data/pilot-listings.json. Make sure you are running via a static server (not opening the file directly), then reload the page.',
    noCoordsHint: '({count} without verified coordinates — viewable only in the list/Google Maps)',
    heatmapNote: '· Simulated density, updated at {time} (not real-time data).',
    countAll: '{total} pilot places and experiences',
    countFiltered: '{visible}/{total} pilot places and experiences shown by filter',
    statsFooter: "— not an official statistic from the province.",
    directions: 'Directions',
    priceUnverified: 'Price not verified yet',
    hoursUnverified: 'Opening hours not verified yet',
    pairSuggestion: {
      'pair-lam-phen': 'With Artisan Lâm Phên',
      'pair-nguyet-hoa': 'Nguyệt Hóa Cluster — Ao Bà Om',
    },
  },
});

// Bộ lọc thu gọn cho phạm vi pilot 7 listing — chỉ còn loại hình (chip danh mục, tự sinh từ dữ
// liệu nên không hiện danh mục rỗng) và khoảng cách (khi có vị trí). Các bộ lọc cũ (đánh giá,
// thời lượng, còn chỗ trải nghiệm trả phí, "chỉ mới") đã bỏ vì 7 listing pilot chưa có dữ liệu
// đánh giá/thời lượng/trải nghiệm bookable thật — hiện các lựa chọn đó sẽ luôn rỗng/gây hiểu nhầm.
const filterState = {
  query: '',
  categories: new Set(),
  maxDistanceKm: null,
};

let mapInstance = null;
let markerLayer = null;
let markersById = new Map();
let userMarker = null;
let userPoint = null;
let manualPickMode = false;
let selectedId = null;
let panelExpanded = false;
let heatmapOn = false;

function buildSkeleton() {
  return `
    <div class="explore-page">
      <div>
        <h1 style="margin-bottom:4px;">${t('customer.explore.title')}</h1>
        <p class="text-sm text-muted" style="margin-bottom:0;">${t('customer.explore.subtitle')}</p>
      </div>
      <div class="explore-toolbar">
        <label class="explore-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" id="explore-search-input" placeholder="${t('customer.explore.searchPlaceholder')}" aria-label="${t('customer.explore.searchA11y')}">
        </label>
        <button type="button" class="btn btn-secondary btn-sm filter-toggle-btn" id="explore-filter-btn">
          ⚙️ ${t('customer.explore.filterBtn')} <span class="filter-count-dot" id="filter-count-dot" hidden>0</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="heatmap-toggle-btn" aria-pressed="false">🌡️ ${t('customer.explore.heatmapBtn')}</button>
      </div>
      <div class="explore-category-row" id="category-chip-row"></div>
      <p class="explore-stats" id="explore-stats"></p>
      <div class="explore-body">
        <div class="explore-map-wrap">
          <div id="trail-map" role="region" aria-label="${t('customer.explore.mapA11y')}"></div>
          <button type="button" class="btn btn-icon btn-secondary map-locate-btn" id="locate-btn" aria-label="${t('customer.explore.myLocation')}" title="${t('customer.explore.myLocation')}">📍</button>
          <div class="map-legend" id="map-legend"></div>
          <div class="map-fallback" id="map-fallback" hidden></div>
        </div>
        <div class="explore-panel" id="explore-panel" data-expanded="false">
          <button type="button" class="explore-panel__handle" id="panel-handle" aria-label="${t('customer.explore.togglePanel')}">
            <span class="explore-panel__grip"></span>
            <span class="text-sm text-muted" id="panel-handle-label">${t('customer.explore.viewList')}</span>
          </button>
          <div class="explore-panel__body" id="explore-panel-body"></div>
        </div>
      </div>
      <div class="explore-sections" id="explore-sections"></div>
    </div>
  `;
}

function computeCategoryGroups() {
  const state = getState();
  const map = new Map();
  state.destinations.forEach((d) => {
    const v = deriveCategoryVisual(d.category);
    const cur = map.get(v.group) || { group: v.group, count: 0, emoji: v.emoji, color: v.color };
    cur.count += 1;
    map.set(v.group, cur);
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function computeVisible() {
  const state = getState();
  return state.destinations.filter((d) => {
    if (!matchesQuery(localizedDestinationName(d), filterState.query) && !matchesQuery(d.altName, filterState.query)) return false;
    if (filterState.categories.size && !filterState.categories.has(deriveCategoryVisual(d.category).group)) return false;
    if (filterState.maxDistanceKm) {
      if (!userPoint || d.lat === null || d.lng === null) return false;
      const dist = haversineKm(userPoint.lat, userPoint.lng, d.lat, d.lng);
      if (dist > filterState.maxDistanceKm) return false;
    }
    return true;
  });
}

function activeFilterCount() {
  let n = filterState.categories.size;
  if (filterState.maxDistanceKm) n += 1;
  return n;
}

function updateFilterDot(container) {
  const dot = qs('#filter-count-dot', container);
  if (!dot) return;
  const n = activeFilterCount();
  dot.hidden = n === 0;
  dot.textContent = String(n);
}

function renderStats(container, visible) {
  const el = qs('#explore-stats', container);
  if (!el) return;
  const total = getState().destinations.length;
  const noCoords = visible.filter((d) => d.lat === null || d.lng === null).length;
  const extra = noCoords ? ` ${t('customer.explore.noCoordsHint', { count: noCoords })}` : '';
  const heatmapNote = heatmapOn ? ` ${t('customer.explore.heatmapNote', { time: new Date().toLocaleTimeString(getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) })}` : '';
  const countText = visible.length === total
    ? t('customer.explore.countAll', { total })
    : t('customer.explore.countFiltered', { visible: visible.length, total });
  el.textContent = `${countText}${extra} ${t('customer.explore.statsFooter')}${heatmapNote}`;
}

function estimatedTag(status) {
  if (status === 'estimated') return ` <span class="text-faint text-sm">${t('customer.explore.estimated')}</span>`;
  return '';
}

function priceBadge(d) {
  const ops = getOperations(d.id);
  if (ops) {
    const priceText = formatPricePerPerson(ops.pricePerPerson);
    const cls = ops.pricePerPerson === 0 ? 'badge-free' : ops.pricePerPerson ? 'badge-type' : 'badge-demo';
    return `<span class="badge ${cls}">${escapeHtml(priceText)}</span>`;
  }
  if (d.priceStatus === 'missing' || d.priceStatus === 'unavailable' || !d.priceDisplay) {
    return `<span class="badge badge-demo">${t('customer.explore.verifyingPrice')}</span>`;
  }
  const cls = d.isFreeEntry ? 'badge-free' : 'badge-type';
  return `<span class="badge ${cls}">${escapeHtml(d.priceDisplay)}</span>${estimatedTag(d.priceStatus)}`;
}

function openStatusBadge(d) {
  const status = computeOpenStatus(d.id);
  const cls = { open: 'badge-free', closing_soon: 'badge-recognized', closed: 'badge-demo', by_appointment: 'badge-type', unknown: 'badge-demo' }[status.status] || 'badge-demo';
  return `<span class="badge ${cls}">🕒 ${escapeHtml(status.label)}</span>`;
}

function operationsMetaHtml(state, d) {
  const ops = getOperations(d.id);
  const parts = [];
  if (ops?.durationMinutes) parts.push(`<span class="text-sm text-muted">${escapeHtml(formatDurationMin(ops.durationMinutes))}</span>`);
  if (d.listingType === 'experience' || d.listingType === 'multiStopExperience') {
    const avail = getNearestSlotAvailability(state, d.id);
    if (avail) parts.push(`<span class="text-sm text-muted">${escapeHtml(avail.label)}</span>`);
  }
  return parts.length ? `<span class="place-card__meta">${parts.join(' · ')}</span>` : '';
}

function crowdBadgeHtml(destinationId) {
  const crowd = getSimulatedCrowdLevel(destinationId);
  return `<span class="badge" style="background:${crowd.color}22;color:${crowd.color};">● ${escapeHtml(crowd.label)}</span>`;
}

function cardHtml(d) {
  const state = getState();
  const img = destinationImageSrc(d);
  const noCoords = d.lat === null || d.lng === null;
  const typeBadge = listingTypeBadge(d.listingType);
  const name = localizedDestinationName(d);
  return `
    <div class="place-card" data-id="${d.id}" data-selected="${d.id === selectedId}">
      <button type="button" class="place-card__main" data-id="${d.id}" aria-label="${t('customer.explore.viewOnMap', { name: escapeHtml(name) })}">
        <img class="place-card__img" src="${img}" alt="" loading="lazy" />
        <span class="place-card__body">
          <span class="place-card__title">${escapeHtml(name)}${d.altName ? ` <span class="text-faint text-sm">(${escapeHtml(d.altName)})</span>` : ''}</span>
          <span class="place-card__meta">
            <span class="badge ${typeBadge.cls}">${categoryEmoji(d.category)} ${escapeHtml(typeBadge.label)}</span>
            <span class="badge badge-type">${escapeHtml(categoryGroupLabel(d.category))}</span>
            ${openStatusBadge(d)}
            ${noCoords ? `<span class="badge badge-demo">📍 ${t('customer.explore.noCoords')}</span>` : ''}
            ${heatmapOn ? crowdBadgeHtml(d.id) : ''}
          </span>
          <span class="place-card__meta">
            <span class="rating-inline">${formatRatingStats(getRatingStatsForListing(state, d.id))}</span>
            ${priceBadge(d)}
          </span>
          ${operationsMetaHtml(state, d)}
          <span class="place-card__desc">${escapeHtml(localizedDestinationSummary(d))}</span>
        </span>
      </button>
      <span class="place-card__actions">
        <button type="button" class="place-card__cart-btn" data-cart-toggle="${d.id}" data-active="${isInTripCart(d.id)}" aria-label="${isInTripCart(d.id) ? t('customer.explore.addedToTripA11y') : t('customer.explore.addToTripA11y')}" title="${isInTripCart(d.id) ? t('customer.explore.addedShort') : t('customer.explore.addAction')}">${isInTripCart(d.id) ? '✓' : '+'}</button>
        <button type="button" class="place-card__detail-btn" data-detail="${d.id}" aria-label="${t('customer.explore.viewDetailOf', { name: escapeHtml(name) })}" title="${t('common.actions.viewDetails')}">→</button>
      </span>
    </div>
  `;
}

function renderList(container, visible) {
  const body = qs('#explore-panel-body', container);
  const label = qs('#panel-handle-label', container);
  if (label) label.textContent = t('customer.explore.resultsLabel', { count: visible.length });
  if (!body) return;
  if (!visible.length) {
    body.innerHTML = `
      ${renderEmptyState({ icon: '🔍', title: t('customer.explore.noResultsTitle'), message: t('customer.explore.noResultsMsg') })}
      <div style="text-align:center;"><button type="button" class="btn btn-secondary btn-sm" id="clear-filters-btn">${t('common.actions.clearAllFilters')}</button></div>
    `;
    qs('#clear-filters-btn', body)?.addEventListener('click', () => {
      resetFilters();
      renderAll(container);
    });
    return;
  }
  body.innerHTML = `<div class="place-grid">${visible.map((d) => cardHtml(d)).join('')}</div>`;
  qsa('.place-card__main', body).forEach((btn) => {
    btn.addEventListener('click', () => selectAndFocus(container, btn.dataset.id));
  });
  qsa('.place-card__detail-btn', body).forEach((btn) => {
    btn.addEventListener('click', () => { window.location.hash = `#/trail/place/${btn.dataset.detail}`; });
  });
  qsa('.place-card__cart-btn', body).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.cartToggle;
      const dest = getState().destinations.find((d) => d.id === id);
      const { added } = toggleTripCartItem(id);
      btn.dataset.active = String(added);
      btn.textContent = added ? '✓' : '+';
      btn.title = added ? t('customer.explore.addedShort') : t('customer.explore.addAction');
      btn.setAttribute('aria-label', added ? t('customer.explore.addedToTripA11y') : t('customer.explore.addToTripA11y'));
      const destName = dest ? localizedDestinationName(dest) : '';
      NotificationService.notify(
        added ? t('customer.explore.addedNotify', { name: destName }) : t('customer.explore.removedNotify', { name: destName }),
        added ? 'success' : 'info',
      );
    });
  });
}

/** Chọn 1 card: highlight card + (nếu có marker công khai) pan/zoom bản đồ tới marker và mở
 * popup — đồng bộ card→marker theo yêu cầu PHASE "Cập nhật đầy đủ 7 pin". Điều hướng sang trang
 * chi tiết vẫn có riêng qua nút mũi tên (place-card__detail-btn), không gộp vào đây để người
 * dùng xem trên bản đồ mà không rời khỏi trang Khám phá. */
function selectAndFocus(container, id) {
  selectedId = id;
  highlightCard(container, id);
  const marker = markersById.get(id);
  if (!marker || !mapInstance) {
    NotificationService.notify(t('customer.explore.noPublicPin'), 'info');
    return;
  }
  const openAndPan = () => {
    mapInstance.panTo(marker.getLatLng());
    marker.openPopup();
  };
  if (markerLayer && typeof markerLayer.zoomToShowLayer === 'function') {
    markerLayer.zoomToShowLayer(marker, openAndPan);
  } else {
    mapInstance.setView(marker.getLatLng(), Math.max(mapInstance.getZoom(), 15), { animate: true });
    openAndPan();
  }
}

function resetFilters() {
  filterState.query = '';
  filterState.categories = new Set();
  filterState.maxDistanceKm = null;
}

function renderCategoryChips(container) {
  const row = qs('#category-chip-row', container);
  if (!row) return;
  const groups = computeCategoryGroups();
  row.innerHTML = groups.map((g) => `
    <button type="button" class="chip" data-cat="${escapeHtml(g.group)}" aria-pressed="${filterState.categories.has(g.group)}">${g.emoji} ${escapeHtml(categoryGroupLabel(g.group))} <span class="text-faint">(${g.count})</span></button>
  `).join('');
  qsa('.chip', row).forEach((chip) => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat;
      if (filterState.categories.has(cat)) filterState.categories.delete(cat);
      else filterState.categories.add(cat);
      chip.setAttribute('aria-pressed', String(filterState.categories.has(cat)));
      renderAll(container);
    });
  });
}

function miniCardHtml(d) {
  return `
    <button type="button" class="mini-card" data-id="${d.id}">
      <img class="mini-card__img" src="${destinationImageSrc(d)}" alt="" loading="lazy" />
      <span class="mini-card__title">${escapeHtml(localizedDestinationName(d))}</span>
      <span class="text-sm text-muted">${formatRatingStats(getRatingStatsForListing(getState(), d.id))}</span>
    </button>
  `;
}

function sectionWrapHtml(title, innerHtml) {
  return `
    <section>
      <div class="section-title"><h2>${escapeHtml(title)}</h2></div>
      <div class="h-scroll">${innerHtml}</div>
    </section>
  `;
}

function renderStaticSections(container) {
  const state = getState();
  const wrap = qs('#explore-sections', container);
  if (!wrap) return;

  const newItems = state.destinations.filter((d) => d.isNew);
  const newSection = newItems.length
    ? sectionWrapHtml(`🆕 ${t('customer.explore.newOnNetwork')}`, newItems.map(miniCardHtml).join(''))
    : '';

  const pairSections = PAIR_SUGGESTIONS.map((pair) => {
    const items = pair.destinationIds
      .map((id) => state.destinations.find((d) => d.id === id))
      .filter(Boolean);
    if (items.length < 2) return '';
    return sectionWrapHtml(`🔗 ${t(`customer.explore.pairSuggestion.${pair.id}`)}`, items.map(miniCardHtml).join(''));
  }).join('');

  const upcomingEvents = state.events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const eventsSection = upcomingEvents.length
    ? `<section>
        <div class="section-title"><h2>📅 ${t('customer.explore.upcomingEvents')}</h2></div>
        <div class="flex-col gap-3">
          ${upcomingEvents.map((ev) => {
            const dest = state.destinations.find((d) => d.id === ev.destinationId);
            return `
              <div class="card" style="padding:16px;">
                <div class="flex justify-between items-center gap-2 wrap">
                  <strong>${escapeHtml(ev.title)}</strong>
                  <span class="badge badge-demo">${t('customer.explore.illustrativeDate')}</span>
                </div>
                <p class="text-sm text-muted" style="margin:6px 0;">${escapeHtml(ev.description)}</p>
                <p class="text-sm">${formatDate(ev.date)} ${dest ? `· ${escapeHtml(localizedDestinationName(dest))}` : ''}</p>
                ${dest ? `<button type="button" class="btn btn-secondary btn-sm" data-goto="${dest.id}" style="margin-top:8px;">${t('customer.explore.viewPlace')}</button>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </section>`
    : '';

  wrap.innerHTML = `
    ${newSection}
    ${pairSections}
    ${eventsSection}
    <div class="card" style="padding:24px;text-align:center;background:var(--color-primary-soft);">
      <p style="margin-bottom:12px;font-weight:700;">${t('customer.explore.personalizeCta')}</p>
      <a class="btn btn-primary" href="#/trail/itinerary">${t('customer.explore.buildTripCta')}</a>
    </div>
  `;

  qsa('.mini-card', wrap).forEach((el) => {
    el.addEventListener('click', () => { window.location.hash = `#/trail/place/${el.dataset.id}`; });
  });
  qsa('[data-goto]', wrap).forEach((el) => {
    el.addEventListener('click', () => { window.location.hash = `#/trail/place/${el.dataset.goto}`; });
  });
}

function openFilterModal(container) {
  const tmp = { maxDistanceKm: filterState.maxDistanceKm };

  const bodyHtml = `
    <div class="filter-panel">
      <div class="filter-group">
        <h3>${t('customer.explore.distanceLabel')}</h3>
        <select class="field-select" id="filter-distance" ${userPoint ? '' : 'disabled'}>
          <option value="">${t('customer.explore.noLimit')}</option>
          <option value="3" ${tmp.maxDistanceKm === 3 ? 'selected' : ''}>${t('customer.explore.within', { km: 3 })}</option>
          <option value="5" ${tmp.maxDistanceKm === 5 ? 'selected' : ''}>${t('customer.explore.within', { km: 5 })}</option>
          <option value="15" ${tmp.maxDistanceKm === 15 ? 'selected' : ''}>${t('customer.explore.within', { km: 15 })}</option>
          <option value="30" ${tmp.maxDistanceKm === 30 ? 'selected' : ''}>${t('customer.explore.within', { km: 30 })}</option>
        </select>
        ${!userPoint ? `<p class="text-sm text-faint">${t('customer.explore.distanceHint')}</p>` : ''}
      </div>
    </div>
  `;
  const actionsHtml = `
    <button type="button" class="btn btn-ghost" data-role="reset">${t('customer.explore.reset')}</button>
    <button type="button" class="btn btn-primary" data-role="apply">${t('customer.explore.apply')}</button>
  `;

  openModal({
    title: t('customer.explore.filterModalTitle'),
    bodyHtml,
    actionsHtml,
    onMount: (modalEl, close) => {
      modalEl.querySelector('[data-role="reset"]').addEventListener('click', () => {
        filterState.maxDistanceKm = null;
        close();
        renderAll(container);
      });
      modalEl.querySelector('[data-role="apply"]').addEventListener('click', () => {
        filterState.maxDistanceKm = parseInt(qs('#filter-distance', modalEl).value, 10) || null;
        close();
        renderAll(container);
      });
    },
  });
}

function wireToolbar(container) {
  const input = qs('#explore-search-input', container);
  input.addEventListener('input', debounce(() => {
    filterState.query = input.value;
    renderAll(container);
  }, 200));

  qs('#explore-filter-btn', container).addEventListener('click', () => openFilterModal(container));

  qs('#heatmap-toggle-btn', container).addEventListener('click', (e) => {
    heatmapOn = !heatmapOn;
    e.currentTarget.setAttribute('aria-pressed', String(heatmapOn));
    renderAll(container);
  });
}

function wirePanelHandle(container) {
  const handle = qs('#panel-handle', container);
  const panel = qs('#explore-panel', container);
  handle.addEventListener('click', () => {
    panelExpanded = !panelExpanded;
    panel.dataset.expanded = String(panelExpanded);
  });
}

function highlightCard(container, id) {
  qsa('.place-card', container).forEach((el) => {
    el.dataset.selected = String(el.dataset.id === id);
  });
}

function popupSummary(text) {
  if (!text) return '';
  const trimmed = text.trim();
  return trimmed.length > 90 ? `${trimmed.slice(0, 90)}…` : trimmed;
}

function buildPopupHtml(d) {
  const ops = getOperations(d.id);
  const priceText = ops
    ? escapeHtml(formatPricePerPerson(ops.pricePerPerson))
    : (d.priceDisplay ? `${escapeHtml(d.priceDisplay)}${d.priceStatus === 'estimated' ? ` (${t('customer.explore.estimated').replace('· ', '')})` : ''}` : `<span class="text-faint">${t('customer.explore.priceUnverified')}</span>`);
  const hoursText = d.openingHours ? `${escapeHtml(d.openingHours)}${d.openingHoursStatus === 'estimated' ? ` (${t('customer.explore.estimated').replace('· ', '')})` : ''}` : `<span class="text-faint">${t('customer.explore.hoursUnverified')}</span>`;
  const roleLabel = d.markerRole && MapService.MARKER_ROLE_LABEL[d.markerRole];
  const dirUrl = (d.lat !== null && d.lng !== null) ? `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}` : null;
  const summary = localizedDestinationSummary(d);
  return `
    <div class="popup-title">${escapeHtml(localizedDestinationName(d))}</div>
    <div class="text-sm text-muted">${categoryEmoji(d.category)} ${escapeHtml(categoryGroupLabel(d.category))} · ${formatRatingStats(getRatingStatsForListing(getState(), d.id))}</div>
    <div class="text-sm text-muted" style="margin:2px 0;">${escapeHtml(listingTypeBadge(d.listingType).label)}${roleLabel ? ` · <strong>${escapeHtml(roleLabel)}</strong>` : ''}</div>
    ${d.address ? `<div class="text-sm" style="margin:2px 0;">📍 ${escapeHtml(d.address)}</div>` : ''}
    ${summary ? `<p class="text-sm" style="margin:4px 0;">${escapeHtml(popupSummary(summary))}</p>` : ''}
    <div class="text-sm" style="margin:2px 0;">💰 ${priceText}</div>
    <div class="text-sm" style="margin:2px 0 6px;">🕒 ${hoursText}</div>
    <div class="popup-actions">
      <button type="button" class="btn btn-primary btn-sm" data-action="view-detail">${t('common.actions.viewDetails')}</button>
      ${dirUrl ? `<a class="btn btn-secondary btn-sm" href="${dirUrl}" target="_blank" rel="noopener noreferrer">🧭 ${t('customer.explore.directions')}</a>` : ''}
    </div>
  `;
}

function renderMarkers(container, visible) {
  if (!mapInstance || !markerLayer || !window.L) return;
  const L = window.L;
  markerLayer.clearLayers();
  markersById.clear();
  visible
    .filter((dest) => dest.publicPin === true && dest.lat !== null && dest.lng !== null)
    .forEach((dest) => {
      const marker = L.marker([dest.lat, dest.lng], { icon: MapService.destinationDivIcon(L, dest) });
      marker.bindPopup(buildPopupHtml(dest));
      marker.on('popupopen', (e) => {
        const el = e.popup.getElement();
        const btn = el && el.querySelector('[data-action="view-detail"]');
        if (btn) btn.addEventListener('click', () => { window.location.hash = `#/trail/place/${dest.id}`; });
      });
      marker.on('click', () => {
        selectedId = dest.id;
        highlightCard(container, dest.id);
        const panel = qs('#explore-panel', container);
        if (panel) panel.dataset.expanded = 'true';
        panelExpanded = true;
        const cardEl = container.querySelector(`.place-card[data-id="${dest.id}"]`);
        if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      markerLayer.addLayer(marker);
      markersById.set(dest.id, marker);
    });
}

function renderLegend(container) {
  const legend = qs('#map-legend', container);
  if (!legend) return;
  const groups = computeCategoryGroups();
  legend.innerHTML = groups.map((g) => `
    <span class="map-legend__item"><span class="map-legend__dot" style="background:${escapeHtml(g.color)}"></span>${escapeHtml(categoryGroupLabel(g.group))}</span>
  `).join('');
}

function setUserPoint(container, lat, lng, opts = {}) {
  userPoint = { lat, lng };
  if (userMarker) { userMarker.remove(); userMarker = null; }
  if (mapInstance && window.L) {
    userMarker = window.L.marker([lat, lng], { icon: MapService.categoryDivIcon(window.L, null, { isUser: true }) }).addTo(mapInstance);
    userMarker.bindPopup(t('customer.explore.yourLocation'));
    mapInstance.panTo([lat, lng]);
  }
  const banner = qs('#location-banner', container);
  if (banner) banner.remove();
  if (!opts.silent) {
    NotificationService.notify(opts.manual ? t('customer.explore.locationSetManual') : t('customer.explore.locationSet'), 'success');
  }
  renderAll(container);
}

function showLocationDeniedBanner(container, message) {
  const mapWrap = qs('.explore-map-wrap', container);
  let banner = qs('#location-banner', container);
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'location-banner';
    banner.className = 'user-location-banner';
    mapWrap.appendChild(banner);
  }
  banner.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button type="button" class="btn btn-sm btn-secondary" id="pick-on-map-btn">${t('customer.explore.pickOnMap')}</button>
  `;
  qs('#pick-on-map-btn', banner).addEventListener('click', () => {
    manualPickMode = true;
    qs('#locate-btn', container)?.classList.add('is-picking');
    NotificationService.notify(t('customer.explore.tapToPick'), 'info');
  });
}

function wireLocateButton(container) {
  const btn = qs('#locate-btn', container);
  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showLocationDeniedBanner(container, t('customer.explore.noGeoSupport'));
      return;
    }
    NotificationService.notify(t('customer.explore.requestingLocation'), 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPoint(container, pos.coords.latitude, pos.coords.longitude),
      () => showLocationDeniedBanner(container, t('customer.explore.locationFailed')),
      { timeout: 8000 },
    );
  });
}

async function initMap(container) {
  const fallbackEl = qs('#map-fallback', container);
  try {
    const L = await MapService.loadLeaflet();
    mapInstance = L.map('trail-map', { zoomControl: true }).setView([9.99, 106.1], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance);

    // SITE-04/05/06 (cụm Nguyệt Hóa) nằm rất sát nhau — dùng Leaflet.markercluster để gom/spiderfy
    // khi trùng ở mức zoom thấp (mục "Điều chỉnh Leaflet" #9). Nếu plugin tải lỗi (mạng chậm), rơi
    // về layerGroup thường như trước — bản đồ vẫn hoạt động, chỉ không gom cụm.
    try {
      await MapService.loadMarkerCluster();
      markerLayer = L.markerClusterGroup({ maxClusterRadius: 60, spiderfyOnMaxZoom: true, showCoverageOnHover: false });
    } catch (clusterErr) {
      markerLayer = L.layerGroup();
    }
    markerLayer.addTo(mapInstance);

    mapInstance.on('click', (e) => {
      if (manualPickMode) {
        manualPickMode = false;
        qs('#locate-btn', container)?.classList.remove('is-picking');
        setUserPoint(container, e.latlng.lat, e.latlng.lng, { manual: true });
      }
    });

    renderLegend(container);
    renderMarkers(container, computeVisible());

    const state = getState();
    const pinned = state.destinations.filter((d) => d.publicPin === true && d.lat !== null && d.lng !== null);
    if (pinned.length) {
      const bounds = L.latLngBounds(pinned.map((d) => [d.lat, d.lng]));
      const isMobile = window.innerWidth < 768;
      // Padding phải/dưới lớn hơn trên mobile để bottom-sheet danh sách không che marker.
      mapInstance.fitBounds(bounds, {
        padding: [50, 50],
        paddingBottomRight: isMobile ? [50, 220] : [50, 50],
        maxZoom: 15,
      });
    }

    setTimeout(() => mapInstance && mapInstance.invalidateSize(), 200);
    window.addEventListener('resize', debounce(() => mapInstance && mapInstance.invalidateSize(), 200));
  } catch (err) {
    fallbackEl.hidden = false;
    fallbackEl.innerHTML = renderErrorState({
      title: t('customer.explore.mapLoadError'),
      message: t('customer.explore.mapLoadErrorMsg'),
    });
  }
}

function renderAll(container) {
  const visible = computeVisible();
  renderStats(container, visible);
  renderList(container, visible);
  renderMarkers(container, visible);
  updateFilterDot(container);
}

export function renderExplore(container) {
  mapInstance = null;
  markerLayer = null;
  markersById = new Map();
  userMarker = null;
  manualPickMode = false;
  panelExpanded = false;

  const state = getState();
  if (!state.destinations.length) {
    container.innerHTML = `
      <div class="page-generic">
        ${renderErrorState({
          title: t('customer.explore.dataLoadError'),
          message: t('customer.explore.dataLoadErrorMsg'),
        })}
      </div>
    `;
    return;
  }

  container.innerHTML = buildSkeleton();
  wireToolbar(container);
  wireLocateButton(container);
  wirePanelHandle(container);
  renderCategoryChips(container);
  renderStaticSections(container);
  renderAll(container);
  initMap(container);
}
