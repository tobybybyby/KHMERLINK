import { getState, getPointsBalance, redeemVoucher, useVoucher, addUserReview } from '../storage.js';
import { escapeHtml, formatDateShort, categoryEmoji, destinationImageSrc, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { MapService } from '../services/mapService.js';
import { openModal, confirmDialog, renderEmptyState } from '../ui.js';
import { renderTicketListHtml } from './support.js';

function starPickerHtml(name, label) {
  return `
    <div>
      <span class="field-label">${escapeHtml(label)}</span>
      <div class="stars" data-picker="${name}" data-value="5" style="cursor:pointer;font-size:1.3rem;">
        ${[1, 2, 3, 4, 5].map((n) => `<span data-star="${n}">★</span>`).join('')}
      </div>
    </div>
  `;
}

function wireStarPicker(root, name) {
  const picker = qs(`[data-picker="${name}"]`, root);
  const stars = qsa('[data-star]', picker);
  const paint = (val) => stars.forEach((s) => { s.textContent = Number(s.dataset.star) <= val ? '★' : '☆'; });
  paint(5);
  stars.forEach((s) => s.addEventListener('click', () => { picker.dataset.value = s.dataset.star; paint(Number(s.dataset.star)); }));
}

export function openReviewModal(destinationId, bookingItemId, onSaved) {
  const state = getState();
  const dest = state.destinations.find((d) => d.id === destinationId);
  const bodyHtml = `
    <form id="review-form" class="flex-col gap-3">
      <p>${dest ? escapeHtml(dest.name) : ''}</p>
      ${starPickerHtml('overall', 'Đánh giá chung')}
      ${starPickerHtml('quality', 'Chất lượng trải nghiệm')}
      ${starPickerHtml('welcome', 'Đón tiếp')}
      ${starPickerHtml('accuracy', 'Đúng mô tả')}
      <div>
        <label class="field-label" for="rv-comment">Góp ý</label>
        <textarea class="field-input" id="rv-comment" rows="3" placeholder="Chia sẻ trải nghiệm của bạn..."></textarea>
      </div>
      <div class="modal__actions">
        <button type="submit" class="btn btn-primary btn-block">Gửi đánh giá</button>
      </div>
    </form>
  `;
  openModal({
    title: 'Viết đánh giá',
    bodyHtml,
    onMount: (modalEl, closeFn) => {
      ['overall', 'quality', 'welcome', 'accuracy'].forEach((n) => wireStarPicker(modalEl, n));
      qs('#review-form', modalEl).addEventListener('submit', (e) => {
        e.preventDefault();
        const rating = Number(qs('[data-picker="overall"]', modalEl).dataset.value);
        const categories = {
          quality: Number(qs('[data-picker="quality"]', modalEl).dataset.value),
          welcome: Number(qs('[data-picker="welcome"]', modalEl).dataset.value),
          accuracy: Number(qs('[data-picker="accuracy"]', modalEl).dataset.value),
        };
        const comment = qs('#rv-comment', modalEl).value.trim();
        const r = addUserReview({ destinationId, bookingItemId, rating, comment, categories });
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
        closeFn();
        NotificationService.notify('Cảm ơn bạn đã đánh giá!', 'success');
        if (onSaved) onSaved();
      });
    },
  });
}

function pendingReviewsHtml(state) {
  const completed = state.bookingItems.filter((bi) => bi.status === 'completed');
  const pending = completed.filter((bi) => !state.userReviews.some((r) => r.bookingItemId === bi.id));
  if (!pending.length) return '<p class="text-sm text-faint">Không có trải nghiệm nào đang chờ đánh giá.</p>';
  return pending.map((bi) => {
    const dest = state.destinations.find((d) => d.id === bi.destinationId);
    return `
      <div class="card flex justify-between items-center gap-2 wrap" style="padding:12px;">
        <span>${escapeHtml(bi.title)}${dest ? ` · ${escapeHtml(dest.name)}` : ''}</span>
        <button type="button" class="btn btn-accent btn-sm" data-review-bi="${bi.id}" data-review-dest="${bi.destinationId}">⭐ Viết đánh giá</button>
      </div>
    `;
  }).join('');
}

function stampListHtml(state) {
  if (!state.passportStamps.length) {
    return renderEmptyState({ icon: '📔', title: 'Chưa có dấu khám phá nào', message: 'Ghé thăm địa điểm và hoàn thành trải nghiệm để nhận dấu vào Hộ chiếu.' });
  }
  return `<div class="place-grid">${state.passportStamps.slice().reverse().map((st) => {
    const dest = state.destinations.find((d) => d.id === st.destinationId);
    return `
      <div class="place-card" style="min-width:0;cursor:default;">
        <img class="place-card__img" src="${dest ? destinationImageSrc(dest) : ''}" alt="" />
        <span class="place-card__body">
          <span class="place-card__title">${dest ? escapeHtml(dest.name) : escapeHtml(st.destinationId)}</span>
          <span class="place-card__meta">
            <span class="badge ${st.type === 'visited-confirmed' ? 'badge-free' : 'badge-type'}">${st.type === 'visited-confirmed' ? '✓ Đã xác nhận' : '📍 Tự đánh dấu'}</span>
          </span>
          <span class="text-sm text-faint">${formatDateShort(st.earnedAt)}</span>
        </span>
      </div>
    `;
  }).join('')}</div>`;
}

export function voucherCatalogHtml(state, balance) {
  return state.voucherCatalog.map((v) => `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${escapeHtml(v.title)}</strong>
        <span class="activity-card__price">${v.pointsCost} điểm</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(v.condition)}</p>
      <button type="button" class="btn btn-secondary btn-sm" data-redeem="${v.id}" ${balance < v.pointsCost ? 'disabled' : ''}>Đổi voucher</button>
    </div>
  `).join('');
}

function myVouchersHtml(state) {
  const active = state.vouchers.filter((v) => v.status === 'active' && new Date(v.expiresAt) >= new Date());
  if (!active.length) return '<p class="text-sm text-faint">Bạn chưa có voucher nào.</p>';
  return active.map((v) => `
    <div class="card flex justify-between items-center gap-2 wrap" style="padding:12px;">
      <span><strong>${escapeHtml(v.code)}</strong> — ${escapeHtml(v.discountLabel)} <span class="text-faint text-sm">(hết hạn ${formatDateShort(v.expiresAt)})</span></span>
      <button type="button" class="btn btn-ghost btn-sm" data-use-voucher="${v.id}">Đánh dấu đã dùng</button>
    </div>
  `).join('');
}

export function renderPassport(container) {
  const state = getState();
  const balance = getPointsBalance();
  const confirmedCount = state.passportStamps.filter((s) => s.type === 'visited-confirmed').length;
  const trusted = confirmedCount >= 3;

  container.innerHTML = `
    <div class="profile-page">
      <section class="card" style="padding:20px;">
        <div class="flex justify-between items-center gap-2 wrap">
          <h2 style="margin:0;">Hộ chiếu du khách</h2>
          ${trusted ? '<span class="recognized-badge badge badge-recognized" tabindex="0">✓ Khách thân thiết<span class="recognized-badge__tip">Đạt từ 3 trải nghiệm được xác nhận hoàn thành trở lên (tiêu chí minh hoạ, có thể cấu hình).</span></span>' : ''}
        </div>
        <div class="flex gap-4 wrap" style="margin-top:8px;">
          <div><strong>${state.passportStamps.length}</strong> <span class="text-sm text-muted">dấu khám phá</span></div>
          <div><strong>${confirmedCount}</strong> <span class="text-sm text-muted">trải nghiệm đã xác nhận</span></div>
          <div><strong>${balance}</strong> <span class="text-sm text-muted">điểm thưởng</span></div>
        </div>
      </section>

      <section>
        <div class="section-title"><h2>Bộ sưu tập khám phá</h2></div>
        <div id="passport-map" style="height:220px;border-radius:14px;overflow:hidden;background:var(--color-primary-soft);margin-bottom:12px;"></div>
        ${stampListHtml(state)}
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Đánh giá chưa viết</h3>
        <div class="flex-col gap-2" id="pending-reviews">${pendingReviewsHtml(state)}</div>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Đổi điểm lấy voucher</h3>
        <div class="flex-col gap-3">${voucherCatalogHtml(state, balance)}</div>
        <h4>Voucher của tôi</h4>
        <div class="flex-col gap-2" id="my-vouchers">${myVouchersHtml(state)}</div>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Lịch sử hành trình</h3>
        ${state.itineraries.length ? `<div class="flex-col gap-2">${state.itineraries.map((it) => `
          <a class="gateway-item" href="#/trail/itinerary/${it.id}">
            <strong>${escapeHtml(it.name)}</strong>
            <span class="text-sm text-muted">${escapeHtml(it.status)} · ${it.stops.length} điểm</span>
          </a>
        `).join('')}</div>` : '<p class="text-sm text-faint">Chưa có hành trình nào.</p>'}
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Yêu cầu hỗ trợ của tôi</h3>
        <div class="flex-col gap-2">${renderTicketListHtml()}</div>
      </section>
    </div>
  `;

  initPassportMap(container, state);

  qsa('[data-review-bi]', container).forEach((btn) => {
    btn.addEventListener('click', () => openReviewModal(btn.dataset.reviewDest, btn.dataset.reviewBi, () => renderPassport(container)));
  });
  qsa('[data-redeem]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = redeemVoucher(btn.dataset.redeem);
      if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
      NotificationService.notify(`Đã đổi voucher — mã ${r.voucher.code}.`, 'success');
      renderPassport(container);
    });
  });
  qsa('[data-use-voucher]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      confirmDialog({ title: 'Đánh dấu voucher đã dùng?', message: 'Thao tác này không thể hoàn tác.', confirmLabel: 'Đã dùng' }).then((ok) => {
        if (!ok) return;
        useVoucher(btn.dataset.useVoucher);
        renderPassport(container);
      });
    });
  });
}

function initPassportMap(container, state) {
  const mapEl = qs('#passport-map', container);
  if (!mapEl || !state.passportStamps.length) {
    if (mapEl) mapEl.innerHTML = '<p class="text-sm text-faint" style="padding:12px;">Chưa có dấu khám phá nào để hiển thị trên bản đồ.</p>';
    return;
  }
  MapService.loadLeaflet().then((L) => {
    const pts = state.passportStamps
      .map((st) => ({ st, dest: state.destinations.find((d) => d.id === st.destinationId) }))
      .filter((x) => x.dest && x.dest.lat !== null && x.dest.lng !== null);
    if (!pts.length) {
      mapEl.innerHTML = '<p class="text-sm text-faint" style="padding:12px;">Các địa điểm đã ghé chưa có toạ độ xác thực.</p>';
      return;
    }
    const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false }).setView([pts[0].dest.lat, pts[0].dest.lng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    pts.forEach(({ st, dest }) => {
      L.marker([dest.lat, dest.lng], { icon: MapService.categoryDivIcon(L, dest.category) }).addTo(map).bindPopup(`${dest.name} — ${st.type === 'visited-confirmed' ? 'Đã xác nhận' : 'Tự đánh dấu'}`);
    });
    map.fitBounds(L.latLngBounds(pts.map((x) => [x.dest.lat, x.dest.lng])), { padding: [24, 24] });
    setTimeout(() => map.invalidateSize(), 150);
  }).catch(() => {
    mapEl.innerHTML = '<p class="text-sm text-faint" style="padding:12px;">Không tải được bản đồ.</p>';
  });
}
