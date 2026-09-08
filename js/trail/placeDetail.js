import { getState, toggleFavorite, isFavorite, addDraftItineraryItem } from '../storage.js';
import {
  escapeHtml, formatCurrency, formatDateShort, categoryLabel, categoryEmoji,
  placeholderImageDataUri, renderStars, qs, qsa,
} from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { initAccordion, renderEmptyState } from '../ui.js';

function quickFact(label, value) {
  return `
    <div class="quick-fact">
      <span class="quick-fact__label">${escapeHtml(label)}</span>
      <span class="quick-fact__value">${value}</span>
    </div>
  `;
}

function activityCardHtml(exp) {
  const upcoming = exp.slots
    .filter((s) => new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const totalRemaining = upcoming.reduce((sum, s) => sum + Math.max(0, s.capacity - s.booked), 0);
  const slotsHtml = upcoming.length
    ? upcoming.map((s) => {
        const remaining = s.capacity - s.booked;
        const full = remaining <= 0;
        return `<div class="text-sm">${formatDateShort(s.date)} · ${s.startTime}–${s.endTime} — ${full ? '<strong style="color:var(--color-danger)">Hết chỗ</strong>' : `còn ${remaining}/${s.capacity} chỗ`}</div>`;
      }).join('')
    : '<div class="text-sm text-faint">Chưa có khung giờ sắp tới trong dữ liệu demo.</div>';

  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${escapeHtml(exp.title)}</strong>
        <span class="activity-card__price">${formatCurrency(exp.price)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(exp.description)}</p>
      <p class="text-sm" style="margin:0;">⏱️ ${exp.durationMin} phút · ${escapeHtml(exp.conditions || '')}</p>
      <div class="activity-card__slots">${slotsHtml}</div>
      <button type="button" class="btn btn-primary btn-sm" data-book-exp="${exp.id}" ${totalRemaining <= 0 ? 'disabled' : ''}>
        Đặt trải nghiệm
      </button>
    </div>
  `;
}

function reviewItemHtml(rv) {
  return `
    <div class="review-item">
      <div class="review-item__head">
        <span>${escapeHtml(rv.author)}</span>
        <span class="stars" aria-label="${rv.rating} trên 5 sao">${renderStars(rv.rating)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:6px 0 0;">${escapeHtml(rv.comment)}</p>
      <p class="text-faint text-sm" style="margin:2px 0 0;">${formatDateShort(rv.date)}</p>
    </div>
  `;
}

function miniCardHtml(d) {
  return `
    <button type="button" class="mini-card" data-id="${d.id}">
      <img class="mini-card__img" src="${placeholderImageDataUri(d.category, d.name)}" alt="" />
      <span class="mini-card__title">${escapeHtml(d.name)}</span>
      <span class="text-sm text-muted">⭐ ${d.rating.toFixed(1)}</span>
    </button>
  `;
}

function accordionItem(id, title, bodyHtml, openByDefault = false) {
  return `
    <div class="accordion-item">
      <button type="button" class="accordion-trigger" aria-expanded="${openByDefault}" aria-controls="${id}">
        <span>${escapeHtml(title)}</span>
        <span class="accordion-trigger__icon" aria-hidden="true">⌄</span>
      </button>
      <div id="${id}" class="accordion-panel" data-open="${openByDefault}">
        ${bodyHtml}
      </div>
    </div>
  `;
}

function directionsUrl(d) {
  return `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`;
}

export function renderPlaceDetail(container, id) {
  const state = getState();
  const dest = state.destinations.find((d) => d.id === id);

  if (!dest) {
    container.innerHTML = `
      <div class="place-detail">
        ${renderEmptyState({ icon: '🗺️', title: 'Không tìm thấy địa điểm', message: 'Địa điểm này có thể đã bị gỡ khỏi dữ liệu demo.' })}
        <div style="text-align:center;"><a class="btn btn-secondary" href="#/trail/explore">← Về Khám phá</a></div>
      </div>
    `;
    return;
  }

  const experiences = state.experiences.filter((e) => e.destinationId === dest.id);
  const reviews = state.reviews.filter((r) => r.destinationId === dest.id);
  const nearby = state.destinations
    .filter((d) => d.id !== dest.id && d.category === dest.category)
    .slice(0, 3);

  const fav = isFavorite(dest.id);

  container.innerHTML = `
    <div class="place-detail">
      <img class="place-hero" src="${placeholderImageDataUri(dest.category, dest.name)}" alt="Ảnh minh hoạ ${escapeHtml(dest.name)}" />
      <div class="place-detail__body">
        <div>
          <a href="#/trail/explore" class="text-sm">← Về Khám phá</a>
          <h1 style="margin-top:8px;">${escapeHtml(dest.name)}</h1>
          <div class="badge-row">
            <span class="badge badge-type">${categoryEmoji(dest.category)} ${escapeHtml(categoryLabel(dest.category))}</span>
            ${dest.isNew ? '<span class="badge badge-new">Mới trên mạng lưới</span>' : ''}
            ${dest.isDemoHost ? '<span class="badge badge-demo">Hộ demo minh hoạ</span>' : ''}
            ${dest.recognized ? `
              <span class="recognized-badge badge badge-recognized" tabindex="0">
                ✓ Được ghi nhận
                <span class="recognized-badge__tip">${escapeHtml(dest.recognizedReason || 'Đạt tiêu chí chất lượng của mạng lưới demo.')}</span>
              </span>` : ''}
          </div>
          <p style="margin-top:12px;">${escapeHtml(dest.description)}</p>
        </div>

        <div class="quick-facts">
          ${quickFact('Địa chỉ', `${escapeHtml(dest.address)}${dest.verifiedLocation ? '' : ' <span class="text-faint">(vị trí minh hoạ)</span>'}`)}
          ${quickFact('Giờ mở cửa', escapeHtml(dest.openingHours))}
          ${quickFact('Giá tham quan', dest.priceFrom === 0 ? 'Miễn phí' : formatCurrency(dest.priceFrom))}
          ${quickFact('Thời gian gợi ý', `${dest.suggestedDurationMin} phút`)}
          ${quickFact('Đánh giá', `⭐ ${dest.rating.toFixed(1)} (${dest.ratingCount})`)}
        </div>

        <div class="cta-row">
          <a class="btn btn-secondary" href="${directionsUrl(dest)}" target="_blank" rel="noopener noreferrer">🧭 Chỉ đường</a>
          <button type="button" class="btn btn-primary" id="add-itinerary-btn">➕ Thêm vào hành trình</button>
          <button type="button" class="btn btn-fav" id="save-place-btn" data-active="${fav}">${fav ? '♥ Đã lưu' : '♡ Lưu địa điểm'}</button>
        </div>

        ${experiences.length ? `
          <section>
            <div class="section-title"><h2>Hoạt động trả phí</h2></div>
            <div class="flex-col gap-3">${experiences.map(activityCardHtml).join('')}</div>
          </section>
        ` : `
          <p class="demo-note">Địa điểm này hiện chỉ có tham quan miễn phí, chưa có hoạt động trả phí trong dữ liệu demo.</p>
        `}

        <section class="accordion" id="place-accordion">
          ${accordionItem('acc-do', 'Bạn có thể làm gì?', `
            <p>${escapeHtml(dest.description)}</p>
            ${experiences.length ? `<ul style="padding-left:18px;">${experiences.map((e) => `<li>${escapeHtml(e.title)}</li>`).join('')}</ul>` : ''}
          `, true)}
          ${accordionItem('acc-story', 'Câu chuyện nơi đây', `<p>${escapeHtml(dest.story || 'Chưa có thông tin.')}</p>`)}
          ${accordionItem('acc-before', 'Cần biết trước khi đến', `
            <p>${escapeHtml(dest.beforeYouGo || 'Chưa có lưu ý cụ thể.')}</p>
            <p class="text-sm text-muted">Khả năng tiếp cận: ${escapeHtml(dest.accessibilityNote || 'Chưa có thông tin.')}</p>
          `)}
          ${accordionItem('acc-reviews', `Đánh giá tiêu biểu (${reviews.length})`, reviews.length
            ? reviews.map(reviewItemHtml).join('')
            : renderEmptyState({ icon: '📝', title: 'Chưa có đánh giá tiêu biểu', message: 'Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận (tính năng đánh giá hoàn thiện ở Phase 5).' }))}
        </section>

        ${nearby.length ? `
          <section>
            <div class="section-title"><h2>Gần đây / cùng loại hình</h2></div>
            <div class="h-scroll">${nearby.map(miniCardHtml).join('')}</div>
          </section>
        ` : ''}
      </div>
    </div>
  `;

  initAccordion(container);

  qsa('.mini-card', container).forEach((el) => {
    el.addEventListener('click', () => { window.location.hash = `#/trail/place/${el.dataset.id}`; });
  });

  qs('#save-place-btn', container).addEventListener('click', (e) => {
    const active = toggleFavorite(dest.id);
    const btn = e.currentTarget;
    btn.dataset.active = String(active);
    btn.textContent = active ? '♥ Đã lưu' : '♡ Lưu địa điểm';
    NotificationService.notify(active ? 'Đã lưu địa điểm vào danh sách yêu thích.' : 'Đã bỏ lưu địa điểm.', 'success');
  });

  qs('#add-itinerary-btn', container).addEventListener('click', () => {
    const added = addDraftItineraryItem(dest.id);
    NotificationService.notify(
      added
        ? 'Đã thêm vào hành trình nháp — phần sắp xếp lịch trình đầy đủ sẽ hoàn thiện ở Phase 2.'
        : 'Địa điểm này đã có trong hành trình nháp của bạn.',
      'info',
    );
  });

  qsa('[data-book-exp]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      NotificationService.notify('Đặt trải nghiệm (giữ chỗ, thanh toán demo) sẽ hoàn thiện ở Phase 3.', 'info');
    });
  });
}
