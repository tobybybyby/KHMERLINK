import { getState, getItinerary, saveItinerary, addPassportStamp, setActiveItinerary, addPoints } from '../storage.js';
import {
  escapeHtml, formatCurrency, formatDurationMin, combineDateTime,
  categoryEmoji, deriveCategoryVisual, destinationImageSrc, getSimulatedCrowdLevel, ratingDisplay,
  qs, qsa,
} from '../utils.js';
import { recalcTimeline } from '../services/aiService.js';
import { NotificationService } from '../services/notificationService.js';
import { MapService } from '../services/mapService.js';
import { openModal, confirmDialog, renderEmptyState } from '../ui.js';
import { openBookingFlow } from './booking.js';
import { openSupportModal } from './support.js';
import { openReviewModal } from './passport.js';
import { openPlaceImpressionModal } from './placeImpression.js';

let mapInstance = null;

function minToClock(min) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function stopDateTime(itinerary, min) {
  return combineDateTime(itinerary.date, minToClock(min));
}

function getCurrentStopIndex(itinerary) {
  const now = Date.now();
  for (let i = 0; i < itinerary.stops.length; i += 1) {
    const s = itinerary.stops[i];
    const arrive = stopDateTime(itinerary, s.arriveMin).getTime();
    const depart = stopDateTime(itinerary, s.departMin).getTime();
    if (now < depart) return { index: i, isOngoing: now >= arrive };
  }
  return { index: -1, isOngoing: false };
}

function statusBadge(status) {
  const map = {
    selected: ['Đã chọn', 'badge-type'],
    active: ['Đang diễn ra', 'badge-new'],
    completed: ['Đã hoàn thành', 'badge-free'],
    cancelled: ['Đã huỷ', 'badge-demo'],
  };
  const [label, cls] = map[status] || [status, 'badge-type'];
  return `<span class="badge ${cls}">${escapeHtml(label)}</span>`;
}

function bookingBadgeForStop(state, stop) {
  if (!stop.experienceId) return '';
  if (stop.bookingItemId) {
    const bi = state.bookingItems.find((x) => x.id === stop.bookingItemId);
    if (!bi) return '';
    const map = {
      pending: ['Chờ hộ xác nhận', 'badge-demo'],
      accepted: ['Đã xác nhận', 'badge-free'],
      rejected: ['Bị từ chối', 'badge-recognized'],
      cancelled: ['Đã huỷ', 'badge-demo'],
      completed: ['Đã hoàn thành', 'badge-free'],
    };
    const [label, cls] = map[bi.status] || [bi.status, 'badge-type'];
    return `<span class="badge ${cls}">${escapeHtml(label)}</span>`;
  }
  return '<span class="badge badge-demo">Chưa đặt chỗ</span>';
}

function stopCardHtml(state, itinerary, stop, index, mode) {
  const dest = state.destinations.find((d) => d.id === stop.destinationId);
  const crowd = getSimulatedCrowdLevel(stop.destinationId);
  const isProposedExperience = !stop.experienceId && (stop.listingType === 'experience' || stop.listingType === 'multiStopExperience');
  const isFree = !stop.experienceId && !isProposedExperience;
  const current = mode.currentIndex === index;
  const travelText = stop.travelUnknown
    ? 'chưa đủ dữ liệu để tối ưu tuyến đường (ước tính tạm)'
    : `${stop.travelMinFromPrev} phút di chuyển từ điểm trước (ước tính)`;
  return `
    <div class="itin-stop ${current ? 'itin-stop--current' : ''}" data-index="${index}">
      <div class="itin-stop__order">${index + 1}</div>
      <img class="itin-stop__img" src="${dest ? destinationImageSrc(dest) : ''}" alt="" loading="lazy" />
      <div class="itin-stop__body">
        <div class="flex justify-between items-center gap-2 wrap">
          <strong>${escapeHtml(stop.name)}</strong>
        </div>
        <div class="text-sm text-muted">${categoryEmoji(stop.category)} ${escapeHtml(stop.category)} · ⏱️ ${minToClock(stop.arriveMin)}–${minToClock(stop.departMin)}</div>
        <div class="text-sm text-faint">🚗 ${travelText}</div>
        <div class="badge-row" style="margin-top:4px;">
          ${isProposedExperience ? '<span class="badge badge-new">Đề xuất — cần xác nhận</span>' : ''}
          ${isFree ? '<span class="badge badge-free">Miễn phí / tự do</span>' : ''}
          ${stop.experienceId ? `<span class="badge badge-type">${escapeHtml(stop.experienceTitle)} · ${formatCurrency(stop.experiencePrice)}</span>` : ''}
          ${bookingBadgeForStop(state, stop)}
          <span class="badge" style="background:${crowd.color}22;color:${crowd.color};">● ${escapeHtml(crowd.label)} <span class="text-faint">(mô phỏng)</span></span>
        </div>
        ${stop.note ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${escapeHtml(stop.note)}</p>` : ''}
        <div class="cta-row" style="margin-top:8px;">
          <a class="btn btn-secondary btn-sm" href="#/trail/place/${stop.destinationId}">Xem chi tiết</a>
          ${mode.editable ? `
            <button type="button" class="btn btn-ghost btn-sm" data-act="up" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn btn-ghost btn-sm" data-act="down" ${index === itinerary.stops.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="btn btn-secondary btn-sm" data-act="replace">🔁 Thay thế</button>
            <button type="button" class="btn btn-danger-ghost btn-sm" data-act="remove">🗑️ Xoá</button>
          ` : ''}
          ${mode.live ? `
            <button type="button" class="btn btn-primary btn-sm" data-act="visited" ${stop.selfVisitedAt ? 'disabled' : ''}>${stop.selfVisitedAt ? '✓ Đã ghé thăm' : 'Đã ghé thăm'}</button>
          ` : ''}
          ${mode.live && !stop.bookingItemId && (crowd.key === 'dong' || crowd.key === 'gan-het') ? `
            <button type="button" class="btn btn-accent btn-sm" data-act="crowd-suggest">🌡️ Xem gợi ý đổi điểm</button>
          ` : ''}
          ${mode.live && stop.bookingItemId ? liveBookingActionHtml(state, stop) : ''}
        </div>
      </div>
    </div>
  `;
}

function liveBookingActionHtml(state, stop) {
  const bi = state.bookingItems.find((x) => x.id === stop.bookingItemId);
  if (!bi) return '';
  if (bi.status === 'accepted') {
    return '<span class="text-sm text-faint">Hộ sẽ xác nhận hoàn thành trong Studio sau khi bạn tham gia.</span>';
  }
  if (bi.status === 'completed') {
    const reviewed = state.userReviews.some((r) => r.bookingItemId === bi.id);
    return reviewed ? '' : `<button type="button" class="btn btn-accent btn-sm" data-act="review" data-bi="${bi.id}" data-dest="${stop.destinationId}">⭐ Viết đánh giá</button>`;
  }
  return '';
}

function summaryHtml(itinerary) {
  const unbooked = itinerary.stops.filter((s) => s.experienceId && !s.bookingItemId).length;
  return `
    <div class="quick-facts">
      <div class="quick-fact"><span class="quick-fact__label">Tổng thời gian</span><span class="quick-fact__value">${formatDurationMin(itinerary.totalDurationMin)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Thời gian di chuyển</span><span class="quick-fact__value">${formatDurationMin(itinerary.totalTravelMin)} <span class="text-faint text-sm">(ước tính)</span></span></div>
      <div class="quick-fact"><span class="quick-fact__label">Tổng chi phí hoạt động đã chọn</span><span class="quick-fact__value">${formatCurrency(itinerary.totalCost)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Số điểm</span><span class="quick-fact__value">${itinerary.stops.length}${unbooked ? ` <span class="text-faint text-sm">(${unbooked} chưa đặt chỗ)</span>` : ''}</span></div>
    </div>
  `;
}

function initMiniMap(container, itinerary) {
  const mapEl = qs('#itin-map', container);
  if (!mapEl) return;
  MapService.loadLeaflet().then((L) => {
    const state = getState();
    const pts = itinerary.stops
      .map((s) => state.destinations.find((d) => d.id === s.destinationId))
      .filter((d) => d && d.lat !== null && d.lng !== null);
    if (!pts.length) {
      mapEl.parentElement.innerHTML = '<p class="text-sm text-faint" style="padding:12px;">Các điểm trong hành trình chưa có toạ độ xác thực để hiển thị trên bản đồ.</p>';
      return;
    }
    mapInstance = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false }).setView([pts[0].lat, pts[0].lng], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(mapInstance);
    const latlngs = pts.map((d) => [d.lat, d.lng]);
    L.polyline(latlngs, { color: '#6b4423', weight: 3, dashArray: '6 6' }).addTo(mapInstance);
    pts.forEach((d, i) => {
      L.marker([d.lat, d.lng], { icon: MapService.categoryDivIcon(L, d.category) })
        .addTo(mapInstance)
        .bindPopup(`${i + 1}. ${d.name}`);
    });
    mapInstance.fitBounds(L.latLngBounds(latlngs), { padding: [24, 24] });
    setTimeout(() => mapInstance && mapInstance.invalidateSize(), 150);
  }).catch(() => {
    mapEl.parentElement.innerHTML = '<p class="text-sm text-faint" style="padding:12px;">Không tải được bản đồ (mạng/thư viện lỗi) — vẫn xem được danh sách các điểm bên dưới.</p>';
  });
}

function openAddStopModal(container, itinerary, replaceIndex = null) {
  const state = getState();
  const usedIds = new Set(itinerary.stops.map((s) => s.destinationId));
  const options = state.destinations.filter((d) => !usedIds.has(d.id) || (replaceIndex !== null && d.id === itinerary.stops[replaceIndex].destinationId));

  const bodyHtml = `
    <input type="search" class="field-input" id="add-stop-search" placeholder="Tìm địa điểm (không cần dấu)..." style="margin-bottom:10px;">
    <div id="add-stop-list" style="max-height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;"></div>
  `;
  const close = openModal({
    title: replaceIndex !== null ? 'Thay thế địa điểm' : 'Thêm địa điểm vào hành trình',
    bodyHtml,
    onMount: (modalEl) => {
      const listEl = qs('#add-stop-list', modalEl);
      const renderList = (query) => {
        const filtered = options.filter((d) => !query || d.name.toLowerCase().includes(query.toLowerCase()) || true);
        const matched = query
          ? filtered.filter((d) => d.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()))
          : filtered;
        listEl.innerHTML = matched.slice(0, 30).map((d) => `
          <button type="button" class="place-card" data-pick="${d.id}" style="min-width:0;">
            <img class="place-card__img" src="${destinationImageSrc(d)}" alt="" style="width:56px;height:56px;" />
            <span class="place-card__body">
              <span class="place-card__title">${escapeHtml(d.name)}</span>
              <span class="text-sm text-muted">${categoryEmoji(d.category)} ${escapeHtml(d.category)} · ${ratingDisplay(d.rating)}</span>
            </span>
          </button>
        `).join('') || renderEmptyState({ icon: '🔍', title: 'Không tìm thấy', message: 'Thử từ khoá khác.' });
        qsa('[data-pick]', listEl).forEach((btn) => {
          btn.addEventListener('click', () => {
            const destId = btn.dataset.pick;
            applyAddOrReplace(container, itinerary, destId, replaceIndex);
            close();
          });
        });
      };
      renderList('');
      qs('#add-stop-search', modalEl).addEventListener('input', (e) => renderList(e.target.value));
    },
  });
}

function openCrowdSuggestionModal(container, itinerary, stopIndex) {
  const state = getState();
  const stop = itinerary.stops[stopIndex];
  const currentCrowd = getSimulatedCrowdLevel(stop.destinationId);
  const currentGroup = deriveCategoryVisual(state.destinations.find((d) => d.id === stop.destinationId)?.category || '').group;
  const usedIds = new Set(itinerary.stops.map((s) => s.destinationId));
  const order = { vang: 0, vua: 1, dong: 2, 'gan-het': 3 };
  const alternatives = state.destinations
    .filter((d) => !usedIds.has(d.id) && deriveCategoryVisual(d.category).group === currentGroup)
    .map((d) => ({ d, crowd: getSimulatedCrowdLevel(d.id) }))
    .filter((x) => order[x.crowd.key] < order[currentCrowd.key])
    .sort((a, b) => order[a.crowd.key] - order[b.crowd.key])
    .slice(0, 3);

  const bodyHtml = alternatives.length
    ? `
      <p class="text-sm text-muted">"${escapeHtml(stop.name)}" hiện đang <strong>${escapeHtml(currentCrowd.label)}</strong> (mô phỏng). Một vài lựa chọn cùng loại hình đang vắng hơn — chưa tự đổi, bạn xem trước ảnh hưởng lịch/chi phí rồi mới áp dụng:</p>
      <div class="flex-col gap-2">
        ${alternatives.map(({ d, crowd }) => `
          <div class="activity-card">
            <div class="activity-card__head">
              <strong>${escapeHtml(d.name)}</strong>
              <span class="badge" style="background:${crowd.color}22;color:${crowd.color};">● ${escapeHtml(crowd.label)}</span>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" data-apply-swap="${d.id}">Áp dụng đổi điểm này</button>
          </div>
        `).join('')}
      </div>
    `
    : renderEmptyState({ icon: '🌡️', title: 'Chưa có điểm thay thế phù hợp', message: 'Không tìm thấy địa điểm cùng loại hình đang vắng hơn trong dữ liệu demo.' });

  openModal({
    title: 'Gợi ý đổi điểm (do mật độ mô phỏng)',
    bodyHtml,
    onMount: (modalEl, closeFn) => {
      qsa('[data-apply-swap]', modalEl).forEach((btn) => {
        btn.addEventListener('click', () => {
          closeFn();
          applyAddOrReplace(container, itinerary, btn.dataset.applySwap, stopIndex);
        });
      });
    },
  });
}

function applyAddOrReplace(container, itinerary, destinationId, replaceIndex) {
  const state = getState();
  const dest = state.destinations.find((d) => d.id === destinationId);
  if (!dest) return;
  const newStop = {
    destinationId: dest.id,
    name: dest.name,
    category: dest.category,
    listingType: dest.listingType || null,
    arriveMin: 0,
    departMin: 0,
    travelMinFromPrev: 0,
    travelEstimated: true,
    travelUnknown: false,
    experienceId: null,
    slotId: null,
    experienceTitle: null,
    experiencePrice: 0,
    note: '',
    selfVisitedAt: null,
    bookingItemId: null,
  };
  if (replaceIndex !== null) itinerary.stops.splice(replaceIndex, 1, newStop);
  else itinerary.stops.push(newStop);
  recalcTimeline(itinerary);
  saveItinerary(itinerary);
  NotificationService.notify(replaceIndex !== null ? 'Đã thay thế địa điểm — giờ và chi phí đã cập nhật.' : 'Đã thêm địa điểm — giờ và chi phí đã cập nhật.', 'success');
  render(container, itinerary.id);
}

/** Gọi sau khi đóng modal cảm nhận (dù gửi hay bỏ qua) — nếu tất cả điểm đã tự đánh dấu ghé
 * thăm thì đánh dấu hành trình hoàn tất và điều hướng sang trang tổng kết; nếu chưa, vẽ lại
 * trang hành trình như bình thường. */
/** Điểm thưởng khi hoàn thành cả hành trình (khác điểm thưởng hoàn thành từng trải nghiệm trả
 * phí qua Studio) — tính theo số điểm đã ghé thăm, minh hoạ, có thể chỉnh ở đây. */
export const POINTS_PER_STOP_ON_ITINERARY_COMPLETE = 5;

function finishVisitStep(container, itineraryId) {
  const itinerary = getItinerary(itineraryId);
  if (!itinerary) return;
  const allVisited = itinerary.stops.length > 0 && itinerary.stops.every((s) => s.selfVisitedAt);
  if (allVisited && itinerary.status !== 'completed') {
    itinerary.status = 'completed';
    saveItinerary(itinerary);
    addPoints(itinerary.stops.length * POINTS_PER_STOP_ON_ITINERARY_COMPLETE, `itinerary-complete-${itineraryId}`, null);
    window.location.hash = `#/trail/itinerary/${itineraryId}/summary`;
    return;
  }
  render(container, itineraryId);
}

function wireStopActions(container, itinerary) {
  qsa('[data-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const stopEl = btn.closest('.itin-stop');
      const index = stopEl ? Number(stopEl.dataset.index) : null;
      const act = btn.dataset.act;
      if (act === 'up' && index > 0) {
        [itinerary.stops[index - 1], itinerary.stops[index]] = [itinerary.stops[index], itinerary.stops[index - 1]];
        recalcTimeline(itinerary); saveItinerary(itinerary); render(container, itinerary.id);
      } else if (act === 'down' && index < itinerary.stops.length - 1) {
        [itinerary.stops[index + 1], itinerary.stops[index]] = [itinerary.stops[index], itinerary.stops[index + 1]];
        recalcTimeline(itinerary); saveItinerary(itinerary); render(container, itinerary.id);
      } else if (act === 'remove') {
        confirmDialog({ title: 'Xoá địa điểm?', message: `Xoá "${itinerary.stops[index].name}" khỏi hành trình?`, confirmLabel: 'Xoá', danger: true }).then((ok) => {
          if (!ok) return;
          itinerary.stops.splice(index, 1);
          recalcTimeline(itinerary); saveItinerary(itinerary);
          NotificationService.notify('Đã xoá địa điểm — giờ và chi phí đã cập nhật.', 'info');
          render(container, itinerary.id);
        });
      } else if (act === 'replace') {
        openAddStopModal(container, itinerary, index);
      } else if (act === 'visited') {
        const stop = itinerary.stops[index];
        stop.selfVisitedAt = new Date().toISOString();
        saveItinerary(itinerary);
        addPassportStamp({ destinationId: stop.destinationId, type: 'visited-self' });
        NotificationService.notify('Đã đánh dấu ghé thăm (tự đánh dấu, khác với xác nhận booking).', 'success');
        render(container, itinerary.id);
        openPlaceImpressionModal(
          { destinationId: stop.destinationId, itineraryId: itinerary.id, stopKey: `${itinerary.id}:${stop.destinationId}` },
          () => finishVisitStep(container, itinerary.id),
        );
      } else if (act === 'review') {
        openReviewModal(btn.dataset.dest, btn.dataset.bi, () => render(container, itinerary.id));
      } else if (act === 'crowd-suggest') {
        openCrowdSuggestionModal(container, itinerary, index);
      }
    });
  });
}

function liveModeBanner(itinerary, currentInfo) {
  if (currentInfo.index === -1) {
    return `<div class="demo-note">Đã qua giờ của tất cả các điểm theo lịch. Bạn có thể đánh dấu hoàn thành hành trình.</div>`;
  }
  const stop = itinerary.stops[currentInfo.index];
  const label = currentInfo.isOngoing ? 'Điểm hiện tại' : 'Điểm tiếp theo';
  return `
    <div class="card" style="padding:16px;background:var(--color-primary-soft);">
      <div class="text-sm text-muted">${label}</div>
      <strong>${escapeHtml(stop.name)}</strong>
      <div class="text-sm">Giờ hẹn: ${minToClock(stop.arriveMin)}–${minToClock(stop.departMin)}</div>
    </div>
  `;
}

export function render(container, id) {
  const itinerary = getItinerary(id);
  if (!itinerary) {
    container.innerHTML = `
      <div class="place-detail">
        ${renderEmptyState({ icon: '🗺️', title: 'Không tìm thấy hành trình', message: 'Hành trình này có thể đã bị xoá.' })}
        <div style="text-align:center;"><a class="btn btn-secondary" href="#/trail/itinerary">← Về danh sách hành trình</a></div>
      </div>
    `;
    return;
  }
  const state = getState();
  const isLive = itinerary.status === 'active';
  const editable = itinerary.status === 'selected';
  const currentInfo = isLive ? getCurrentStopIndex(itinerary) : { index: -1, isOngoing: false };

  container.innerHTML = `
    <div class="place-detail">
      <div class="place-detail__body">
        <div>
          <a href="#/trail/itinerary" class="text-sm">← Về danh sách hành trình</a>
          <div class="flex justify-between items-center gap-2 wrap" style="margin-top:8px;">
            <h1 style="margin:0;">${escapeHtml(itinerary.name)}</h1>
            ${statusBadge(itinerary.status)}
          </div>
          <p class="text-sm text-muted">${escapeHtml(itinerary.reason || '')}</p>
          <p class="badge badge-demo">Gợi ý tự động — bản demo</p>
        </div>

        ${summaryHtml(itinerary)}

        ${isLive ? liveModeBanner(itinerary, currentInfo) : ''}

        <div class="cta-row">
          ${itinerary.status === 'selected' ? '<button type="button" class="btn btn-primary" id="start-itinerary-btn">▶️ Bắt đầu hành trình</button>' : ''}
          ${itinerary.stops.some((s) => s.experienceId && !s.bookingItemId) ? '<button type="button" class="btn btn-accent" id="book-all-btn">🎟️ Đặt các hoạt động trả phí</button>' : ''}
          ${editable ? '<button type="button" class="btn btn-secondary" id="add-stop-btn">➕ Thêm địa điểm</button>' : ''}
          <button type="button" class="btn btn-secondary" id="share-itinerary-btn">🔗 Chia sẻ / In</button>
          ${itinerary.status !== 'cancelled' ? '<button type="button" class="btn btn-danger-ghost" id="cancel-itinerary-btn">Huỷ hành trình</button>' : ''}
        </div>

        <section>
          <div class="section-title"><h2>Bản đồ hành trình</h2></div>
          <div style="height:260px;border-radius:14px;overflow:hidden;background:var(--color-primary-soft);">
            <div id="itin-map" style="width:100%;height:100%;"></div>
          </div>
        </section>

        <section>
          <div class="section-title"><h2>Timeline</h2></div>
          <div class="flex-col gap-3" id="itin-stops">
            ${itinerary.stops.map((s, i) => stopCardHtml(state, itinerary, s, i, { editable, live: isLive, currentIndex: currentInfo.index })).join('')}
          </div>
        </section>
      </div>
      ${isLive ? '<button type="button" class="btn btn-danger-ghost" id="need-help-btn" style="position:fixed;right:16px;bottom:calc(var(--bottom-nav-height) + 16px);z-index:200;background:#fff;box-shadow:var(--shadow-lg);border-radius:var(--radius-pill);">🆘 Cần hỗ trợ</button>' : ''}
    </div>
  `;

  initMiniMap(container, itinerary);
  wireStopActions(container, itinerary);

  qs('#add-stop-btn', container)?.addEventListener('click', () => openAddStopModal(container, itinerary));

  qs('#need-help-btn', container)?.addEventListener('click', () => {
    const current = itinerary.stops[Math.max(0, currentInfo.index)];
    openSupportModal({ destinationId: current ? current.destinationId : null, itineraryId: itinerary.id });
  });

  qs('#start-itinerary-btn', container)?.addEventListener('click', () => {
    itinerary.status = 'active';
    saveItinerary(itinerary);
    setActiveItinerary(itinerary.id);
    NotificationService.notify('Hành trình đang diễn ra — chúc bạn có chuyến đi vui vẻ!', 'success');
    render(container, itinerary.id);
  });

  qs('#book-all-btn', container)?.addEventListener('click', () => {
    const items = itinerary.stops
      .filter((s) => s.experienceId && !s.bookingItemId)
      .map((s) => ({ experienceId: s.experienceId, slotId: s.slotId, quantity: itinerary.partySize }));
    openBookingFlow({
      items,
      itineraryId: itinerary.id,
      partySize: itinerary.partySize,
      onDone: (booking, bookingItems) => {
        bookingItems.forEach((bi) => {
          const stop = itinerary.stops.find((s) => s.experienceId === bi.experienceId && s.slotId === bi.slotId);
          if (stop) stop.bookingItemId = bi.id;
        });
        saveItinerary(itinerary);
        render(container, itinerary.id);
      },
    });
  });

  qs('#cancel-itinerary-btn', container)?.addEventListener('click', () => {
    confirmDialog({ title: 'Huỷ hành trình?', message: 'Các booking đã xác nhận sẽ cần huỷ riêng ở từng mục (có thể phát sinh phí theo chính sách). Tiếp tục huỷ hành trình?', confirmLabel: 'Huỷ hành trình', danger: true }).then((ok) => {
      if (!ok) return;
      itinerary.status = 'cancelled';
      saveItinerary(itinerary);
      NotificationService.notify('Đã huỷ hành trình.', 'info');
      render(container, itinerary.id);
    });
  });

  qs('#share-itinerary-btn', container)?.addEventListener('click', () => {
    const lines = [
      `Hành trình: ${itinerary.name}`,
      ...itinerary.stops.map((s, i) => `${i + 1}. ${s.name} (${minToClock(s.arriveMin)}–${minToClock(s.departMin)})`),
      `Tổng chi phí hoạt động: ${formatCurrency(itinerary.totalCost)}`,
    ];
    openModal({
      title: 'Chia sẻ / In hành trình',
      bodyHtml: `<textarea readonly style="width:100%;min-height:200px;padding:10px;border-radius:8px;border:1px solid var(--color-border-strong);">${escapeHtml(lines.join('\n'))}</textarea><p class="text-sm text-faint" style="margin-top:8px;">Sao chép nội dung trên để chia sẻ hoặc in — không chứa dữ liệu riêng tư.</p>`,
    });
  });
}

export function renderItineraryDetail(container, id) {
  render(container, id);
}
