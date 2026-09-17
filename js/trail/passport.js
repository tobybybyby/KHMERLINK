import { getState, getPointsBalance, redeemVoucher, useVoucher, addReview } from '../storage.js';
import { escapeHtml, formatDateShort, categoryEmoji, destinationImageSrc, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { MapService } from '../services/mapService.js';
import { tagsForListing } from '../services/reviewsService.js';
import { localizeTag } from '../services/tagCatalog.js';
import { openModal, confirmDialog, renderEmptyState } from '../ui.js';
import { renderTicketListHtml } from './support.js';
import { t, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('customer', {
  passport: {
    rating: { 1: 'Rất thất vọng', 2: 'Chưa hài lòng', 3: 'Ổn', 4: 'Hài lòng', 5: 'Hoàn hảo' },
    overallRating: 'Đánh giá chung',
    whatDidYouLike: 'Bạn thích điều gì ở đây?',
    shareMore: 'Chia sẻ thêm',
    shareMorePlaceholder: 'Điều gì khiến chuyến ghé thăm của bạn đáng nhớ?',
    wouldRecommend: 'Bạn có muốn giới thiệu địa điểm này cho người khác không?',
    yes: 'Có',
    no: 'Không',
    submitReview: 'Gửi đánh giá',
    reviewModalTitle: 'Cảm nhận chuyến ghé thăm',
    thankYouNotify: 'Cảm ơn bạn đã chia sẻ trải nghiệm',
    noPendingReviews: 'Không có trải nghiệm nào đang chờ đánh giá.',
    writeReview: '⭐ Viết đánh giá',
    noStampsTitle: 'Chưa có dấu khám phá nào',
    noStampsMsg: 'Ghé thăm địa điểm và hoàn thành trải nghiệm để nhận dấu vào Hộ chiếu.',
    confirmed: '✓ Đã xác nhận',
    selfMarked: '📍 Tự đánh dấu',
    pointsUnit: '{count} điểm',
    redeemVoucher: 'Đổi voucher',
    noVouchers: 'Bạn chưa có voucher nào.',
    expiresOn: '(hết hạn {date})',
    markAsUsed: 'Đánh dấu đã dùng',
    title: 'Hộ chiếu du khách',
    loyalBadge: '✓ Khách thân thiết',
    loyalBadgeTip: 'Đạt từ 3 trải nghiệm được xác nhận hoàn thành trở lên (tiêu chí minh hoạ, có thể cấu hình).',
    stamps: 'dấu khám phá',
    confirmedExperiences: 'trải nghiệm đã xác nhận',
    rewardPoints: 'điểm thưởng',
    collectionTitle: 'Bộ sưu tập khám phá',
    unwrittenReviewsTitle: 'Đánh giá chưa viết',
    redeemPointsTitle: 'Đổi điểm lấy voucher',
    myVouchers: 'Voucher của tôi',
    tripHistoryTitle: 'Lịch sử hành trình',
    noTrips: 'Chưa có hành trình nào.',
    stopsCount: '{count} điểm',
    mySupportRequestsTitle: 'Yêu cầu hỗ trợ của tôi',
    noStampsForMap: 'Chưa có dấu khám phá nào để hiển thị trên bản đồ.',
    noVerifiedCoords: 'Các địa điểm đã ghé chưa có toạ độ xác thực.',
    mapLoadError: 'Không tải được bản đồ.',
    voucherRedeemedNotify: 'Đã đổi voucher — mã {code}.',
    confirmUseVoucherTitle: 'Đánh dấu voucher đã dùng?',
    confirmUseVoucherMsg: 'Thao tác này không thể hoàn tác.',
    used: 'Đã dùng',
  },
}, {
  passport: {
    rating: { 1: 'Very Disappointed', 2: 'Unsatisfied', 3: 'OK', 4: 'Satisfied', 5: 'Perfect' },
    overallRating: 'Overall Rating',
    whatDidYouLike: 'What did you like here?',
    shareMore: 'Share more',
    shareMorePlaceholder: 'What made your visit memorable?',
    wouldRecommend: 'Would you recommend this place to others?',
    yes: 'Yes',
    no: 'No',
    submitReview: 'Submit Review',
    reviewModalTitle: 'Share Your Visit',
    thankYouNotify: 'Thank you for sharing your experience',
    noPendingReviews: 'No experiences awaiting review.',
    writeReview: '⭐ Write a Review',
    noStampsTitle: 'No stamps yet',
    noStampsMsg: 'Visit places and complete experiences to collect stamps in your Passport.',
    confirmed: '✓ Confirmed',
    selfMarked: '📍 Self-marked',
    pointsUnit: '{count} points',
    redeemVoucher: 'Redeem Voucher',
    noVouchers: "You don't have any vouchers yet.",
    expiresOn: '(expires {date})',
    markAsUsed: 'Mark as Used',
    title: 'Traveller Passport',
    loyalBadge: '✓ Loyal Traveller',
    loyalBadgeTip: 'Reached 3 or more confirmed completed experiences (illustrative, configurable criteria).',
    stamps: 'stamps',
    confirmedExperiences: 'confirmed experiences',
    rewardPoints: 'reward points',
    collectionTitle: 'Exploration Collection',
    unwrittenReviewsTitle: 'Reviews to Write',
    redeemPointsTitle: 'Redeem Points for Vouchers',
    myVouchers: 'My Vouchers',
    tripHistoryTitle: 'Trip History',
    noTrips: 'No trips yet.',
    stopsCount: '{count} stops',
    mySupportRequestsTitle: 'My Support Requests',
    noStampsForMap: 'No stamps yet to show on the map.',
    noVerifiedCoords: 'Visited places do not have verified coordinates yet.',
    mapLoadError: 'Could not load the map.',
    voucherRedeemedNotify: 'Voucher redeemed — code {code}.',
    confirmUseVoucherTitle: 'Mark voucher as used?',
    confirmUseVoucherMsg: 'This action cannot be undone.',
    used: 'Used',
  },
});

function starPickerHtml(name, label) {
  return `
    <div>
      <span class="field-label">${escapeHtml(label)}</span>
      <div class="stars" data-picker="${name}" data-value="5" style="cursor:pointer;font-size:1.4rem;">
        ${[1, 2, 3, 4, 5].map((n) => `<span data-star="${n}">★</span>`).join('')}
      </div>
      <p class="text-sm text-muted" data-rating-label="${name}" style="margin:2px 0 0;">${t('customer.passport.rating.5')}</p>
    </div>
  `;
}

function wireStarPicker(root, name) {
  const picker = qs(`[data-picker="${name}"]`, root);
  const stars = qsa('[data-star]', picker);
  const labelEl = qs(`[data-rating-label="${name}"]`, root);
  const paint = (val) => {
    stars.forEach((s) => { s.textContent = Number(s.dataset.star) <= val ? '★' : '☆'; });
    if (labelEl) labelEl.textContent = t(`customer.passport.rating.${val}`) || '';
  };
  paint(5);
  stars.forEach((s) => s.addEventListener('click', () => { picker.dataset.value = s.dataset.star; paint(Number(s.dataset.star)); }));
}

export function openReviewModal(destinationId, bookingItemId, onSaved) {
  const state = getState();
  const dest = state.destinations.find((d) => d.id === destinationId);
  const tags = tagsForListing(destinationId);
  const bodyHtml = `
    <form id="review-form" class="flex-col gap-3">
      <p>${dest ? escapeHtml(localizedDestinationName(dest)) : ''}</p>
      ${starPickerHtml('overall', t('customer.passport.overallRating'))}
      <div>
        <span class="field-label">${t('customer.passport.whatDidYouLike')}</span>
        <div class="chip-row" id="rv-tags">
          ${tags.map((tagId) => `<button type="button" class="chip" data-tag="${escapeHtml(tagId)}" aria-pressed="false">${escapeHtml(localizeTag(tagId))}</button>`).join('')}
        </div>
      </div>
      <div>
        <label class="field-label" for="rv-comment">${t('customer.passport.shareMore')}</label>
        <textarea class="field-input" id="rv-comment" rows="3" placeholder="${t('customer.passport.shareMorePlaceholder')}"></textarea>
      </div>
      <div>
        <span class="field-label">${t('customer.passport.wouldRecommend')}</span>
        <div class="chip-row" id="rv-recommend">
          <button type="button" class="chip" data-recommend="true" aria-pressed="true">${t('customer.passport.yes')}</button>
          <button type="button" class="chip" data-recommend="false" aria-pressed="false">${t('customer.passport.no')}</button>
        </div>
      </div>
      <div class="modal__actions">
        <button type="submit" class="btn btn-primary btn-block">${t('customer.passport.submitReview')}</button>
      </div>
    </form>
  `;
  openModal({
    title: t('customer.passport.reviewModalTitle'),
    bodyHtml,
    onMount: (modalEl, closeFn) => {
      wireStarPicker(modalEl, 'overall');
      const selectedTags = new Set();
      qsa('[data-tag]', modalEl).forEach((chip) => {
        chip.addEventListener('click', () => {
          const tag = chip.dataset.tag;
          if (selectedTags.has(tag)) selectedTags.delete(tag); else selectedTags.add(tag);
          chip.setAttribute('aria-pressed', String(selectedTags.has(tag)));
        });
      });
      let wouldRecommend = true;
      qsa('[data-recommend]', modalEl).forEach((chip) => {
        chip.addEventListener('click', () => {
          wouldRecommend = chip.dataset.recommend === 'true';
          qsa('[data-recommend]', modalEl).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        });
      });
      qs('#review-form', modalEl).addEventListener('submit', (e) => {
        e.preventDefault();
        const overallRating = Number(qs('[data-picker="overall"]', modalEl).dataset.value);
        const comment = qs('#rv-comment', modalEl).value.trim();
        const r = addReview({ destinationId, bookingItemId, overallRating, comment, selectedTags: Array.from(selectedTags), wouldRecommend });
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
        closeFn();
        NotificationService.notify(t('customer.passport.thankYouNotify'), 'success');
        if (onSaved) onSaved();
      });
    },
  });
}

function pendingReviewsHtml(state) {
  const completed = state.bookingItems.filter((bi) => bi.status === 'completed');
  const pending = completed.filter((bi) => !state.reviews.some((r) => r.bookingItemId === bi.id));
  if (!pending.length) return `<p class="text-sm text-faint">${t('customer.passport.noPendingReviews')}</p>`;
  return pending.map((bi) => {
    const dest = state.destinations.find((d) => d.id === bi.destinationId);
    return `
      <div class="card flex justify-between items-center gap-2 wrap" style="padding:12px;">
        <span>${escapeHtml(bi.title)}${dest ? ` · ${escapeHtml(localizedDestinationName(dest))}` : ''}</span>
        <button type="button" class="btn btn-accent btn-sm" data-review-bi="${bi.id}" data-review-dest="${bi.destinationId}">${t('customer.passport.writeReview')}</button>
      </div>
    `;
  }).join('');
}

function stampListHtml(state) {
  if (!state.passportStamps.length) {
    return renderEmptyState({ icon: '📔', title: t('customer.passport.noStampsTitle'), message: t('customer.passport.noStampsMsg') });
  }
  return `<div class="place-grid">${state.passportStamps.slice().reverse().map((st) => {
    const dest = state.destinations.find((d) => d.id === st.destinationId);
    return `
      <div class="place-card" style="min-width:0;cursor:default;">
        <img class="place-card__img" src="${dest ? destinationImageSrc(dest) : ''}" alt="" />
        <span class="place-card__body">
          <span class="place-card__title">${dest ? escapeHtml(localizedDestinationName(dest)) : escapeHtml(st.destinationId)}</span>
          <span class="place-card__meta">
            <span class="badge ${st.type === 'visited-confirmed' ? 'badge-free' : 'badge-type'}">${st.type === 'visited-confirmed' ? t('customer.passport.confirmed') : t('customer.passport.selfMarked')}</span>
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
        <span class="activity-card__price">${t('customer.passport.pointsUnit', { count: v.pointsCost })}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(v.condition)}</p>
      <button type="button" class="btn btn-secondary btn-sm" data-redeem="${v.id}" ${balance < v.pointsCost ? 'disabled' : ''}>${t('customer.passport.redeemVoucher')}</button>
    </div>
  `).join('');
}

function myVouchersHtml(state) {
  const active = state.vouchers.filter((v) => v.status === 'active' && new Date(v.expiresAt) >= new Date());
  if (!active.length) return `<p class="text-sm text-faint">${t('customer.passport.noVouchers')}</p>`;
  return active.map((v) => `
    <div class="card flex justify-between items-center gap-2 wrap" style="padding:12px;">
      <span><strong>${escapeHtml(v.code)}</strong> — ${escapeHtml(v.discountLabel)} <span class="text-faint text-sm">${t('customer.passport.expiresOn', { date: formatDateShort(v.expiresAt) })}</span></span>
      <button type="button" class="btn btn-ghost btn-sm" data-use-voucher="${v.id}">${t('customer.passport.markAsUsed')}</button>
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
          <h2 style="margin:0;">${t('customer.passport.title')}</h2>
          ${trusted ? `<span class="recognized-badge badge badge-recognized" tabindex="0">${t('customer.passport.loyalBadge')}<span class="recognized-badge__tip">${t('customer.passport.loyalBadgeTip')}</span></span>` : ''}
        </div>
        <div class="flex gap-4 wrap" style="margin-top:8px;">
          <div><strong>${state.passportStamps.length}</strong> <span class="text-sm text-muted">${t('customer.passport.stamps')}</span></div>
          <div><strong>${confirmedCount}</strong> <span class="text-sm text-muted">${t('customer.passport.confirmedExperiences')}</span></div>
          <div><strong>${balance}</strong> <span class="text-sm text-muted">${t('customer.passport.rewardPoints')}</span></div>
        </div>
      </section>

      <section>
        <div class="section-title"><h2>${t('customer.passport.collectionTitle')}</h2></div>
        <div id="passport-map" style="height:220px;border-radius:14px;overflow:hidden;background:var(--color-primary-soft);margin-bottom:12px;"></div>
        ${stampListHtml(state)}
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('customer.passport.unwrittenReviewsTitle')}</h3>
        <div class="flex-col gap-2" id="pending-reviews">${pendingReviewsHtml(state)}</div>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('customer.passport.redeemPointsTitle')}</h3>
        <div class="flex-col gap-3">${voucherCatalogHtml(state, balance)}</div>
        <h4>${t('customer.passport.myVouchers')}</h4>
        <div class="flex-col gap-2" id="my-vouchers">${myVouchersHtml(state)}</div>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('customer.passport.tripHistoryTitle')}</h3>
        ${state.itineraries.length ? `<div class="flex-col gap-2">${state.itineraries.map((it) => `
          <a class="gateway-item" href="#/trail/itinerary/${it.id}">
            <strong>${escapeHtml(it.name)}</strong>
            <span class="text-sm text-muted">${escapeHtml(it.status)} · ${t('customer.passport.stopsCount', { count: it.stops.length })}</span>
          </a>
        `).join('')}</div>` : `<p class="text-sm text-faint">${t('customer.passport.noTrips')}</p>`}
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('customer.passport.mySupportRequestsTitle')}</h3>
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
      NotificationService.notify(t('customer.passport.voucherRedeemedNotify', { code: r.voucher.code }), 'success');
      renderPassport(container);
    });
  });
  qsa('[data-use-voucher]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      confirmDialog({ title: t('customer.passport.confirmUseVoucherTitle'), message: t('customer.passport.confirmUseVoucherMsg'), confirmLabel: t('customer.passport.used') }).then((ok) => {
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
    if (mapEl) mapEl.innerHTML = `<p class="text-sm text-faint" style="padding:12px;">${t('customer.passport.noStampsForMap')}</p>`;
    return;
  }
  MapService.loadLeaflet().then((L) => {
    const pts = state.passportStamps
      .map((st) => ({ st, dest: state.destinations.find((d) => d.id === st.destinationId) }))
      .filter((x) => x.dest && x.dest.lat !== null && x.dest.lng !== null);
    if (!pts.length) {
      mapEl.innerHTML = `<p class="text-sm text-faint" style="padding:12px;">${t('customer.passport.noVerifiedCoords')}</p>`;
      return;
    }
    const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false }).setView([pts[0].dest.lat, pts[0].dest.lng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    pts.forEach(({ st, dest }) => {
      L.marker([dest.lat, dest.lng], { icon: MapService.categoryDivIcon(L, dest.category) }).addTo(map).bindPopup(`${localizedDestinationName(dest)} — ${st.type === 'visited-confirmed' ? t('customer.passport.confirmed').replace('✓ ', '') : t('customer.passport.selfMarked').replace('📍 ', '')}`);
    });
    map.fitBounds(L.latLngBounds(pts.map((x) => [x.dest.lat, x.dest.lng])), { padding: [24, 24] });
    setTimeout(() => map.invalidateSize(), 150);
  }).catch(() => {
    mapEl.innerHTML = `<p class="text-sm text-faint" style="padding:12px;">${t('customer.passport.mapLoadError')}</p>`;
  });
}
