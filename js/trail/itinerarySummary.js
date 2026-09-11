// Trang tổng kết hiện ra ngay khi khách tự đánh dấu "Đã ghé thăm" đủ mọi điểm trong hành
// trình — liệt kê từng điểm cùng cảm nhận đã gửi (nếu có), cho gửi bù cảm nhận còn thiếu và
// đánh giá các hoạt động trả phí đã hoàn thành chưa được viết đánh giá.
import { getState, getItinerary, getPointsBalance, redeemVoucher } from '../storage.js';
import { escapeHtml, formatDurationMin, categoryEmoji, destinationImageSrc, renderStars, qs, qsa } from '../utils.js';
import { renderErrorState } from '../ui.js';
import { NotificationService } from '../services/notificationService.js';
import { openPlaceImpressionModal } from './placeImpression.js';
import { openReviewModal, voucherCatalogHtml } from './passport.js';

function impressionForStop(state, itineraryId, destinationId) {
  const stopKey = `${itineraryId}:${destinationId}`;
  return state.placeImpressions.find((i) => i.stopKey === stopKey) || null;
}

function stopSummaryCardHtml(state, itinerary, stop) {
  const dest = state.destinations.find((d) => d.id === stop.destinationId);
  const impression = impressionForStop(state, itinerary.id, stop.destinationId);
  const bi = stop.bookingItemId ? state.bookingItems.find((x) => x.id === stop.bookingItemId) : null;
  const needsBookingReview = bi && bi.status === 'completed' && !state.reviews.some((r) => r.bookingItemId === bi.id);

  return `
    <div class="itin-stop" data-dest="${stop.destinationId}">
      <img class="itin-stop__img" src="${dest ? destinationImageSrc(dest) : ''}" alt="" loading="lazy" />
      <div class="itin-stop__body">
        <strong>${categoryEmoji(stop.category)} ${escapeHtml(stop.name)}</strong>
        ${impression ? `
          <div class="stars" style="font-size:1rem;">${renderStars(impression.rating)}</div>
          ${impression.tags.length ? `<p class="text-sm text-muted" style="margin:2px 0;">${impression.tags.map(escapeHtml).join(' · ')}</p>` : ''}
          ${impression.comment ? `<p class="text-sm text-faint" style="margin:2px 0;">“${escapeHtml(impression.comment)}”</p>` : ''}
        ` : '<p class="text-sm text-faint" style="margin:2px 0;">Chưa có cảm nhận cho điểm này.</p>'}
        <div class="cta-row" style="margin-top:4px;">
          ${!impression ? `<button type="button" class="btn btn-secondary btn-sm" data-act="impression">⭐ Gửi cảm nhận</button>` : ''}
          ${needsBookingReview ? `<button type="button" class="btn btn-accent btn-sm" data-act="booking-review" data-bi="${bi.id}">⭐ Đánh giá hoạt động trả phí</button>` : ''}
          <a class="btn btn-ghost btn-sm" href="#/trail/place/${stop.destinationId}">Xem lại địa điểm</a>
        </div>
      </div>
    </div>
  `;
}

export function renderItinerarySummary(container, id) {
  const itinerary = getItinerary(id);
  if (!itinerary) {
    container.innerHTML = renderErrorState({ title: 'Không tìm thấy hành trình', message: 'Hành trình có thể đã bị xoá.' });
    return;
  }
  const state = getState();
  const impressionCount = itinerary.stops.filter((s) => impressionForStop(state, itinerary.id, s.destinationId)).length;
  const earnedEntry = state.pointsLedger.find((p) => p.reason === `itinerary-complete-${itinerary.id}`);
  const balance = getPointsBalance();

  container.innerHTML = `
    <div class="profile-page">
      <div class="card" style="padding:20px;text-align:center;">
        <div style="font-size:2.2rem;">🎉</div>
        <h1 style="margin:8px 0 4px;">Chúc mừng bạn đã hoàn thành chuyến đi!</h1>
        <p class="text-muted">${escapeHtml(itinerary.name)}</p>
        ${earnedEntry ? `
          <div style="margin-top:14px;padding:14px;border-radius:var(--radius-md);background:var(--color-primary-soft);">
            <p class="text-sm text-muted" style="margin:0;">Số điểm bạn nhận được</p>
            <p style="margin:2px 0 0;font-size:1.8rem;font-weight:700;color:var(--color-primary-dark);">+${earnedEntry.amount} điểm</p>
            <p class="text-sm text-faint" style="margin:4px 0 0;">Tổng điểm hiện có: ${balance} điểm</p>
          </div>
        ` : ''}
      </div>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Đổi điểm lấy voucher</h3>
        <div class="flex-col gap-3" id="summary-voucher-list">${voucherCatalogHtml(state, balance)}</div>
        <a class="text-sm" href="#/trail/passport" style="display:inline-block;margin-top:8px;">Xem tất cả voucher của tôi →</a>
      </section>

      <div class="quick-facts">
        <div class="quick-fact"><span class="quick-fact__label">Điểm đã ghé thăm</span><span class="quick-fact__value">${itinerary.stops.length}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Tổng thời gian</span><span class="quick-fact__value">${formatDurationMin(itinerary.totalDurationMin)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Đã gửi cảm nhận</span><span class="quick-fact__value">${impressionCount}/${itinerary.stops.length}</span></div>
      </div>

      <section>
        <div class="section-title"><h2>Từng điểm trong hành trình</h2></div>
        <div class="flex-col gap-3">
          ${itinerary.stops.map((s) => stopSummaryCardHtml(state, itinerary, s)).join('')}
        </div>
      </section>

      <div class="cta-row" style="margin-top:8px;">
        <a class="btn btn-primary" href="#/trail/passport">📔 Xem Hộ chiếu du khách</a>
        <a class="btn btn-secondary" href="#/trail/explore">🧭 Về Khám phá</a>
      </div>
    </div>
  `;

  qsa('[data-act="impression"]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const destinationId = btn.closest('[data-dest]').dataset.dest;
      openPlaceImpressionModal(
        { destinationId, itineraryId: itinerary.id, stopKey: `${itinerary.id}:${destinationId}` },
        () => renderItinerarySummary(container, id),
      );
    });
  });

  qsa('[data-act="booking-review"]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const destinationId = btn.closest('[data-dest]').dataset.dest;
      openReviewModal(destinationId, btn.dataset.bi, () => renderItinerarySummary(container, id));
    });
  });

  qsa('[data-redeem]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = redeemVoucher(btn.dataset.redeem);
      if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
      NotificationService.notify(`Đã đổi voucher — mã ${r.voucher.code}.`, 'success');
      renderItinerarySummary(container, id);
    });
  });
}
