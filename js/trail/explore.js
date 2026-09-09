import { getState } from '../storage.js';
import {
  escapeHtml, matchesQuery, haversineKm,
  categoryEmoji, deriveCategoryVisual, debounce, qs, qsa,
  destinationImageSrc,
} from '../utils.js';
import { INTEREST_OPTIONS, PAIR_SUGGESTIONS } from '../data.js';
import { MapService } from '../services/mapService.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal, renderEmptyState, renderErrorState } from '../ui.js';

const filterState = {
  query: '',
  categories: new Set(),
  interests: new Set(),
  onlyAvailable: false,
  onlyNew: false,
  minRating: 0,
  maxDurationMin: null,
  maxDistanceKm: null,
};

let mapInstance = null;
let markerLayer = null;
let userMarker = null;
let userPoint = null;
let manualPickMode = false;
let selectedId = null;
let panelExpanded = false;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildSkeleton() {
  return `
    <div class="explore-page">
      <div class="explore-toolbar">
        <label class="explore-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" id="explore-search-input" placeholder="Tìm địa điểm, trải nghiệm... (không cần dấu)" aria-label="Tìm kiếm địa điểm">
        </label>
        <button type="button" class="btn btn-secondary btn-sm filter-toggle-btn" id="explore-filter-btn">
          ⚙️ Bộ lọc <span class="filter-count-dot" id="filter-count-dot" hidden>0</span>
        </button>
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
    if (!matchesQuery(d.name, filterState.query)) return false;
    if (filterState.categories.size && !filterState.categories.has(deriveCategoryVisual(d.category).group)) return false;
    if (filterState.interests.size) {
      const has = (d.interests || []).some((i) => filterState.interests.has(i));
      if (!has) return false;
    }
    if (filterState.onlyNew && !d.isNew) return false;
    if (filterState.minRating && d.rating < filterState.minRating) return false;
    if (filterState.maxDurationMin && d.suggestedDurationMin > filterState.maxDurationMin) return false;
    if (filterState.onlyAvailable) {
      const exps = state.experiences.filter((e) => e.destinationId === d.id);
      if (exps.length) {
        const today = startOfToday();
        const hasSlot = exps.some((e) => e.slots.some((s) => s.booked < s.capacity && new Date(s.date) >= today));
        if (!hasSlot) return false;
      }
    }
    if (filterState.maxDistanceKm) {
      if (!userPoint || d.lat === null || d.lng === null) return false;
      const dist = haversineKm(userPoint.lat, userPoint.lng, d.lat, d.lng);
      if (dist > filterState.maxDistanceKm) return false;
    }
    return true;
  });
}

function activeFilterCount() {
  let n = filterState.categories.size + filterState.interests.size;
  if (filterState.onlyAvailable) n += 1;
  if (filterState.onlyNew) n += 1;
  if (filterState.minRating) n += 1;
  if (filterState.maxDurationMin) n += 1;
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
  const noCoords = visible.filter((d) => d.lat === null || d.lng === null).length;
  const extra = noCoords ? ` (${noCoords} địa điểm chưa có toạ độ xác thực, chỉ xem được trong danh sách)` : '';
  el.textContent = `${visible.length} địa điểm/trải nghiệm đang hiển thị trong dữ liệu demo${extra} — không phải thống kê chính thức của tỉnh.`;
}

function estimatedTag(status) {
  if (status === 'estimated') return ' <span class="text-faint text-sm">· ước lượng</span>';
  return '';
}

function priceBadge(d) {
  if (d.priceStatus === 'missing' || !d.priceDisplay) {
    return '<span class="badge badge-demo">Chưa cập nhật giá</span>';
  }
  const cls = d.isFreeEntry ? 'badge-free' : 'badge-type';
  return `<span class="badge ${cls}">${escapeHtml(d.priceDisplay)}</span>${estimatedTag(d.priceStatus)}`;
}

function cardHtml(d) {
  const img = destinationImageSrc(d);
  const noCoords = d.lat === null || d.lng === null;
  return `
    <button type="button" class="place-card" data-id="${d.id}" data-selected="${d.id === selectedId}">
      <img class="place-card__img" src="${img}" alt="" loading="lazy" />
      <span class="place-card__body">
        <span class="place-card__title">${escapeHtml(d.name)}</span>
        <span class="place-card__meta">
          <span class="badge badge-type">${categoryEmoji(d.category)} ${escapeHtml(d.category)}</span>
          ${d.recognized ? '<span class="badge badge-recognized">✓ Được ghi nhận</span>' : ''}
          ${d.isNew ? '<span class="badge badge-new">Mới</span>' : ''}
          ${noCoords ? '<span class="badge badge-demo">📍 Chưa có toạ độ</span>' : ''}
        </span>
        <span class="place-card__meta">
          <span class="rating-inline">⭐ ${d.rating.toFixed(1)}</span>${estimatedTag(d.ratingStatus)}
          ${priceBadge(d)}
        </span>
        <span class="place-card__desc">${escapeHtml(d.summary)}</span>
      </span>
    </button>
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
  qsa('.place-card', body).forEach((card) => {
    card.addEventListener('click', () => { window.location.hash = `#/trail/place/${card.dataset.id}`; });
  });
}

function resetFilters() {
  filterState.query = '';
  filterState.categories = new Set();
  filterState.interests = new Set();
  filterState.onlyAvailable = false;
  filterState.onlyNew = false;
  filterState.minRating = 0;
  filterState.maxDurationMin = null;
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
      <span class="text-sm text-muted">⭐ ${d.rating.toFixed(1)}</span>
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
  const tmp = {
    interests: new Set(filterState.interests),
    onlyAvailable: filterState.onlyAvailable,
    onlyNew: filterState.onlyNew,
    minRating: filterState.minRating,
    maxDurationMin: filterState.maxDurationMin,
    maxDistanceKm: filterState.maxDistanceKm,
  };

  const bodyHtml = `
    <div class="filter-panel">
      <div class="filter-group">
        <h3>Sở thích</h3>
        <div class="chip-row">
          ${INTEREST_OPTIONS.map((o) => `<button type="button" class="chip" data-interest="${o.value}" aria-pressed="${tmp.interests.has(o.value)}">${escapeHtml(o.label)}</button>`).join('')}
        </div>
      </div>
      <div class="filter-group">
        <h3>Thời gian tham quan</h3>
        <select class="field-select" id="filter-duration">
          <option value="">Không giới hạn</option>
          <option value="60" ${tmp.maxDurationMin === 60 ? 'selected' : ''}>Dưới 1 giờ</option>
          <option value="120" ${tmp.maxDurationMin === 120 ? 'selected' : ''}>Dưới 2 giờ</option>
        </select>
      </div>
      <div class="filter-group">
        <h3>Khoảng cách từ điểm xuất phát</h3>
        <select class="field-select" id="filter-distance" ${userPoint ? '' : 'disabled'}>
          <option value="">Không giới hạn</option>
          <option value="3" ${tmp.maxDistanceKm === 3 ? 'selected' : ''}>Trong 3km</option>
          <option value="5" ${tmp.maxDistanceKm === 5 ? 'selected' : ''}>Trong 5km</option>
          <option value="15" ${tmp.maxDistanceKm === 15 ? 'selected' : ''}>Trong 15km</option>
          <option value="30" ${tmp.maxDistanceKm === 30 ? 'selected' : ''}>Trong 30km</option>
        </select>
        ${!userPoint ? '<p class="text-sm text-faint">Bấm nút 📍 trên bản đồ (hoặc chọn điểm trên bản đồ) để bật lọc theo khoảng cách. Địa điểm chưa có toạ độ sẽ tự ẩn khi bật bộ lọc này.</p>' : ''}
      </div>
      <div class="filter-group">
        <h3>Đánh giá</h3>
        <select class="field-select" id="filter-rating">
          <option value="0">Bất kỳ</option>
          <option value="4" ${tmp.minRating === 4 ? 'selected' : ''}>Từ 4 sao</option>
          <option value="4.5" ${tmp.minRating === 4.5 ? 'selected' : ''}>Từ 4.5 sao</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="flex items-center gap-2"><input type="checkbox" id="filter-available" ${tmp.onlyAvailable ? 'checked' : ''}> Còn chỗ trải nghiệm trả phí</label>
      </div>
      <div class="filter-group">
        <label class="flex items-center gap-2"><input type="checkbox" id="filter-new" ${tmp.onlyNew ? 'checked' : ''}> Chỉ trải nghiệm mới</label>
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
      qsa('.chip[data-interest]', modalEl).forEach((chip) => {
        chip.addEventListener('click', () => {
          const v = chip.dataset.interest;
          if (tmp.interests.has(v)) tmp.interests.delete(v);
          else tmp.interests.add(v);
          chip.setAttribute('aria-pressed', String(tmp.interests.has(v)));
        });
      });
      modalEl.querySelector('[data-role="reset"]').addEventListener('click', () => {
        filterState.interests = new Set();
        filterState.onlyAvailable = false;
        filterState.onlyNew = false;
        filterState.minRating = 0;
        filterState.maxDurationMin = null;
        filterState.maxDistanceKm = null;
        close();
        renderAll(container);
      });
      modalEl.querySelector('[data-role="apply"]').addEventListener('click', () => {
        filterState.interests = tmp.interests;
        filterState.onlyAvailable = qs('#filter-available', modalEl).checked;
        filterState.onlyNew = qs('#filter-new', modalEl).checked;
        filterState.minRating = parseFloat(qs('#filter-rating', modalEl).value) || 0;
        filterState.maxDurationMin = parseInt(qs('#filter-duration', modalEl).value, 10) || null;
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

function buildPopupHtml(d) {
  return `
    <div class="popup-title">${escapeHtml(d.name)}</div>
    <div class="text-sm text-muted">${categoryEmoji(d.category)} ${escapeHtml(d.category)} · ⭐ ${d.rating.toFixed(1)}</div>
    <div class="popup-actions">
      <button type="button" class="btn btn-primary btn-sm" data-action="view-detail">Xem chi tiết</button>
    </div>
  `;
}

function renderMarkers(container, visible) {
  if (!mapInstance || !markerLayer || !window.L) return;
  const L = window.L;
  markerLayer.clearLayers();
  visible
    .filter((dest) => dest.lat !== null && dest.lng !== null)
    .forEach((dest) => {
      const marker = L.marker([dest.lat, dest.lng], { icon: MapService.categoryDivIcon(L, dest.category) });
      marker.bindPopup(buildPopupHtml(dest));
      marker.on('popupopen', (e) => {
        const el = e.popup.getElement();
        const btn = el && el.querySelector('[data-action="view-detail"]');
        if (btn) btn.addEventListener('click', () => { window.location.hash = `#/trail/place/${dest.id}`; });
      });
      marker.on('click', () => { selectedId = dest.id; highlightCard(container, dest.id); });
      markerLayer.addLayer(marker);
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

    markerLayer = L.layerGroup();
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
    const withCoords = state.destinations.filter((d) => d.lat !== null && d.lng !== null);
    if (withCoords.length) {
      const bounds = L.latLngBounds(withCoords.map((d) => [d.lat, d.lng]));
      mapInstance.fitBounds(bounds, { padding: [32, 32] });
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
  userMarker = null;
  manualPickMode = false;
  panelExpanded = false;

  const state = getState();
  if (!state.destinations.length) {
    container.innerHTML = `
      <div class="page-generic">
        ${renderErrorState({
          title: 'Chưa tải được dữ liệu địa điểm',
          message: 'Không đọc được data/destinations.json. Kiểm tra bạn đang chạy qua static server (không mở trực tiếp file), sau đó tải lại trang.',
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
