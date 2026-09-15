import { getState, toggleTripCartItem, isInTripCart } from '../storage.js';
import {
  escapeHtml, matchesQuery, haversineKm,
  categoryEmoji, deriveCategoryVisual, debounce, qs, qsa,
  destinationImageSrc, getSimulatedCrowdLevel, listingTypeBadge, formatDurationMin,
} from '../utils.js';
import { PAIR_SUGGESTIONS } from '../data.js';
import { MapService } from '../services/mapService.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal, renderEmptyState, renderErrorState } from '../ui.js';
import { getRatingStatsForListing, formatRatingStats } from '../services/reviewsService.js';
import { computeOpenStatus, formatPricePerPerson, getNearestSlotAvailability, getOperations } from '../services/operationsService.js';

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
        <h1 style="margin-bottom:4px;">Mạng lưới trải nghiệm văn hóa Khmer (pilot)</h1>
        <p class="text-sm text-muted" style="margin-bottom:0;">7 điểm và trải nghiệm pilot tại Vĩnh Long — một số đã xác minh có thể tham quan, một số vẫn là đề xuất đang chờ khảo sát/xác nhận supplier trước khi mở bán.</p>
      </div>
      <div class="explore-toolbar">
        <label class="explore-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" id="explore-search-input" placeholder="Tìm địa điểm, trải nghiệm... (không cần dấu)" aria-label="Tìm kiếm địa điểm">
        </label>
        <button type="button" class="btn btn-secondary btn-sm filter-toggle-btn" id="explore-filter-btn">
          ⚙️ Bộ lọc <span class="filter-count-dot" id="filter-count-dot" hidden>0</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="heatmap-toggle-btn" aria-pressed="false">🌡️ Mật độ (mô phỏng)</button>
      </div>
      <div class="explore-category-row" id="category-chip-row"></div>
      <p class="explore-stats" id="explore-stats"></p>
      <div class="explore-body">
        <div class="explore-map-wrap">
          <div id="trail-map" role="region" aria-label="Bản đồ địa điểm và trải nghiệm"></div>
          <button type="button" class="btn btn-icon btn-secondary map-locate-btn" id="locate-btn" aria-label="Vị trí của tôi" title="Vị trí của tôi">📍</button>
          <div class="map-legend" id="map-legend"></div>
          <div class="map-fallback" id="map-fallback" hidden></div>
        </div>
        <div class="explore-panel" id="explore-panel" data-expanded="false">
          <button type="button" class="explore-panel__handle" id="panel-handle" aria-label="Mở/thu gọn danh sách">
            <span class="explore-panel__grip"></span>
            <span class="text-sm text-muted" id="panel-handle-label">Xem danh sách</span>
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
    if (!matchesQuery(d.name, filterState.query) && !matchesQuery(d.altName, filterState.query)) return false;
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
  const extra = noCoords ? ` (${noCoords} chưa có toạ độ xác thực, chỉ xem được trong danh sách/mở Google Maps)` : '';
  const heatmapNote = heatmapOn ? ` · Mật độ mô phỏng, cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} (không phải số liệu thời gian thực).` : '';
  const countText = visible.length === total
    ? `${total} điểm và trải nghiệm pilot`
    : `${visible.length}/${total} điểm và trải nghiệm pilot đang hiển thị theo bộ lọc`;
  el.textContent = `${countText}${extra} — không phải thống kê chính thức của tỉnh.${heatmapNote}`;
}

function estimatedTag(status) {
  if (status === 'estimated') return ' <span class="text-faint text-sm">· ước lượng</span>';
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
    return '<span class="badge badge-demo">Đang xác minh giá</span>';
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
  return `
    <div class="place-card" data-id="${d.id}" data-selected="${d.id === selectedId}">
      <button type="button" class="place-card__main" data-id="${d.id}" aria-label="Xem ${escapeHtml(d.name)} trên bản đồ">
        <img class="place-card__img" src="${img}" alt="" loading="lazy" />
        <span class="place-card__body">
          <span class="place-card__title">${escapeHtml(d.name)}${d.altName ? ` <span class="text-faint text-sm">(${escapeHtml(d.altName)})</span>` : ''}</span>
          <span class="place-card__meta">
            <span class="badge ${typeBadge.cls}">${categoryEmoji(d.category)} ${escapeHtml(typeBadge.label)}</span>
            <span class="badge badge-type">${escapeHtml(d.category)}</span>
            ${openStatusBadge(d)}
            ${noCoords ? '<span class="badge badge-demo">📍 Chưa có toạ độ</span>' : ''}
            ${heatmapOn ? crowdBadgeHtml(d.id) : ''}
          </span>
          <span class="place-card__meta">
            <span class="rating-inline">${formatRatingStats(getRatingStatsForListing(state, d.id))}</span>
            ${priceBadge(d)}
          </span>
          ${operationsMetaHtml(state, d)}
          <span class="place-card__desc">${escapeHtml(d.summary)}</span>
        </span>
      </button>
      <span class="place-card__actions">
        <button type="button" class="place-card__cart-btn" data-cart-toggle="${d.id}" data-active="${isInTripCart(d.id)}" aria-label="${isInTripCart(d.id) ? 'Đã thêm vào hành trình — bấm để gỡ' : 'Thêm vào hành trình'}" title="${isInTripCart(d.id) ? '✓ Đã thêm' : '+ Thêm vào hành trình'}">${isInTripCart(d.id) ? '✓' : '+'}</button>
        <button type="button" class="place-card__detail-btn" data-detail="${d.id}" aria-label="Xem chi tiết ${escapeHtml(d.name)}" title="Xem chi tiết">→</button>
      </span>
    </div>
  `;
}

function renderList(container, visible) {
  const body = qs('#explore-panel-body', container);
  const label = qs('#panel-handle-label', container);
  if (label) label.textContent = `${visible.length} kết quả — chạm để xem danh sách`;
  if (!body) return;
  if (!visible.length) {
    body.innerHTML = `
      ${renderEmptyState({ icon: '🔍', title: 'Không tìm thấy địa điểm phù hợp', message: 'Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm.' })}
      <div style="text-align:center;"><button type="button" class="btn btn-secondary btn-sm" id="clear-filters-btn">Xoá bộ lọc</button></div>
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
      btn.title = added ? '✓ Đã thêm' : '+ Thêm vào hành trình';
      btn.setAttribute('aria-label', added ? 'Đã thêm vào hành trình — bấm để gỡ' : 'Thêm vào hành trình');
      NotificationService.notify(
        added ? `Đã thêm ${dest ? dest.name : ''} vào hành trình của bạn.` : `Đã gỡ ${dest ? dest.name : ''} khỏi giỏ hành trình.`,
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
    NotificationService.notify('Địa điểm này chưa có toạ độ công khai để hiện trên bản đồ.', 'info');
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
    <button type="button" class="chip" data-cat="${escapeHtml(g.group)}" aria-pressed="${filterState.categories.has(g.group)}">${g.emoji} ${escapeHtml(g.group)} <span class="text-faint">(${g.count})</span></button>
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
      <span class="mini-card__title">${escapeHtml(d.name)}</span>
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
    ? sectionWrapHtml('🆕 Mới trên mạng lưới', newItems.map(miniCardHtml).join(''))
    : '';

  const pairSections = PAIR_SUGGESTIONS.map((pair) => {
    const items = pair.destinationIds
      .map((id) => state.destinations.find((d) => d.id === id))
      .filter(Boolean);
    if (items.length < 2) return '';
    return sectionWrapHtml(`🔗 ${pair.title}`, items.map(miniCardHtml).join(''));
  }).join('');

  const upcomingEvents = state.events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const eventsSection = upcomingEvents.length
    ? `<section>
        <div class="section-title"><h2>📅 Sự kiện sắp tới</h2></div>
        <div class="flex-col gap-3">
          ${upcomingEvents.map((ev) => {
            const dest = state.destinations.find((d) => d.id === ev.destinationId);
            return `
              <div class="card" style="padding:16px;">
                <div class="flex justify-between items-center gap-2 wrap">
                  <strong>${escapeHtml(ev.title)}</strong>
                  <span class="badge badge-demo">Ngày minh hoạ</span>
                </div>
                <p class="text-sm text-muted" style="margin:6px 0;">${escapeHtml(ev.description)}</p>
                <p class="text-sm">${new Date(ev.date).toLocaleDateString('vi-VN')} ${dest ? `· ${escapeHtml(dest.name)}` : ''}</p>
                ${dest ? `<button type="button" class="btn btn-secondary btn-sm" data-goto="${dest.id}" style="margin-top:8px;">Xem địa điểm</button>` : ''}
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
      <p style="margin-bottom:12px;font-weight:700;">Cho chúng tôi biết sở thích để gợi ý hành trình phù hợp với bạn</p>
      <a class="btn btn-primary" href="#/trail/itinerary">Tạo hành trình →</a>
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
        <h3>Khoảng cách từ điểm xuất phát</h3>
        <select class="field-select" id="filter-distance" ${userPoint ? '' : 'disabled'}>
          <option value="">Không giới hạn</option>
          <option value="3" ${tmp.maxDistanceKm === 3 ? 'selected' : ''}>Trong 3km</option>
          <option value="5" ${tmp.maxDistanceKm === 5 ? 'selected' : ''}>Trong 5km</option>
          <option value="15" ${tmp.maxDistanceKm === 15 ? 'selected' : ''}>Trong 15km</option>
          <option value="30" ${tmp.maxDistanceKm === 30 ? 'selected' : ''}>Trong 30km</option>
        </select>
        ${!userPoint ? '<p class="text-sm text-faint">Bấm nút 📍 trên bản đồ (hoặc chọn điểm trên bản đồ) để bật lọc theo khoảng cách. Địa điểm chưa có toạ độ sẽ tự ẩn khi bật bộ lọc này — hiện phần lớn 7 listing pilot chưa có toạ độ công khai.</p>' : ''}
      </div>
    </div>
  `;
  const actionsHtml = `
    <button type="button" class="btn btn-ghost" data-role="reset">Đặt lại</button>
    <button type="button" class="btn btn-primary" data-role="apply">Áp dụng</button>
  `;

  openModal({
    title: 'Bộ lọc',
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
    : (d.priceDisplay ? `${escapeHtml(d.priceDisplay)}${d.priceStatus === 'estimated' ? ' (ước lượng)' : ''}` : '<span class="text-faint">Chưa xác minh giá</span>');
  const hoursText = d.openingHours ? `${escapeHtml(d.openingHours)}${d.openingHoursStatus === 'estimated' ? ' (ước lượng)' : ''}` : '<span class="text-faint">Chưa xác minh giờ mở cửa</span>';
  const roleLabel = d.markerRole && MapService.MARKER_ROLE_LABEL[d.markerRole];
  const dirUrl = (d.lat !== null && d.lng !== null) ? `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}` : null;
  return `
    <div class="popup-title">${escapeHtml(d.name)}</div>
    <div class="text-sm text-muted">${categoryEmoji(d.category)} ${escapeHtml(d.category)} · ${formatRatingStats(getRatingStatsForListing(getState(), d.id))}</div>
    <div class="text-sm text-muted" style="margin:2px 0;">${escapeHtml(listingTypeBadge(d.listingType).label)}${roleLabel ? ` · <strong>${escapeHtml(roleLabel)}</strong>` : ''}</div>
    ${d.address ? `<div class="text-sm" style="margin:2px 0;">📍 ${escapeHtml(d.address)}</div>` : ''}
    ${d.summary ? `<p class="text-sm" style="margin:4px 0;">${escapeHtml(popupSummary(d.summary))}</p>` : ''}
    <div class="text-sm" style="margin:2px 0;">💰 ${priceText}</div>
    <div class="text-sm" style="margin:2px 0 6px;">🕒 ${hoursText}</div>
    <div class="popup-actions">
      <button type="button" class="btn btn-primary btn-sm" data-action="view-detail">Xem chi tiết</button>
      ${dirUrl ? `<a class="btn btn-secondary btn-sm" href="${dirUrl}" target="_blank" rel="noopener noreferrer">🧭 Chỉ đường</a>` : ''}
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
    <span class="map-legend__item"><span class="map-legend__dot" style="background:${escapeHtml(g.color)}"></span>${escapeHtml(g.group)}</span>
  `).join('');
}

function setUserPoint(container, lat, lng, opts = {}) {
  userPoint = { lat, lng };
  if (userMarker) { userMarker.remove(); userMarker = null; }
  if (mapInstance && window.L) {
    userMarker = window.L.marker([lat, lng], { icon: MapService.categoryDivIcon(window.L, null, { isUser: true }) }).addTo(mapInstance);
    userMarker.bindPopup('Vị trí của bạn');
    mapInstance.panTo([lat, lng]);
  }
  const banner = qs('#location-banner', container);
  if (banner) banner.remove();
  if (!opts.silent) {
    NotificationService.notify(opts.manual ? 'Đã đặt điểm xuất phát trên bản đồ.' : 'Đã xác định vị trí của bạn.', 'success');
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
    <button type="button" class="btn btn-sm btn-secondary" id="pick-on-map-btn">Chọn điểm trên bản đồ</button>
  `;
  qs('#pick-on-map-btn', banner).addEventListener('click', () => {
    manualPickMode = true;
    qs('#locate-btn', container)?.classList.add('is-picking');
    NotificationService.notify('Chạm vào bản đồ để đặt điểm xuất phát của bạn.', 'info');
  });
}

function wireLocateButton(container) {
  const btn = qs('#locate-btn', container);
  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showLocationDeniedBanner(container, 'Trình duyệt không hỗ trợ định vị.');
      return;
    }
    NotificationService.notify('Đang xin quyền truy cập vị trí…', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPoint(container, pos.coords.latitude, pos.coords.longitude),
      () => showLocationDeniedBanner(container, 'Không lấy được vị trí (có thể do bạn đã từ chối cấp quyền).'),
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
      title: 'Không tải được bản đồ',
      message: 'Có thể do kết nối mạng hoặc thư viện bản đồ tạm thời không khả dụng. Bạn vẫn có thể xem danh sách địa điểm bên dưới.',
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
          title: 'Chưa tải được dữ liệu địa điểm',
          message: 'Không đọc được data/pilot-listings.json. Kiểm tra bạn đang chạy qua static server (không mở trực tiếp file), sau đó tải lại trang.',
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
