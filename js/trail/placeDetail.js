import { getState, toggleFavorite, isFavorite, addDraftItineraryItem, saveItinerary, recordDestinationView } from '../storage.js';
import {
  escapeHtml, formatDateShort, categoryEmoji,
  destinationImageSrc, placeholderImageDataUri, renderStars, ratingDisplay, listingTypeBadge, ctaLabel,
  qs, qsa,
} from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { recalcTimeline } from '../services/aiService.js';
import { initAccordion, renderEmptyState, confirmDialog } from '../ui.js';

function quickFact(label, value) {
  return `
    <div class="quick-fact">
      <span class="quick-fact__label">${escapeHtml(label)}</span>
      <span class="quick-fact__value">${value}</span>
    </div>
  `;
}

function statusSuffix(status) {
  if (status === 'estimated') return ' <span class="text-faint text-sm">(ước lượng)</span>';
  return '';
}

function factDisplay(value, status, missingText = 'Chưa xác minh') {
  if (value === null || value === undefined || value === '') {
    return `<span class="text-faint">${escapeHtml(missingText)}</span>`;
  }
  return `${escapeHtml(String(value))}${statusSuffix(status)}`;
}

/** Trả về mảng {url,label} nút "Mở trên Google Maps" — dùng directions thật nếu có toạ độ công
 * khai, ngược lại dùng link tìm kiếm có sẵn trong dữ liệu (có thể nhiều hơn 1, vd EXP-02 có 2
 * điểm dừng riêng biệt — không được gộp thành một pin). */
function directionsLinks(dest) {
  if (dest.lat !== null && dest.lng !== null) {
    return [{ url: `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`, label: '🧭 Chỉ đường' }];
  }
  const links = dest.mapLinks && dest.mapLinks.length ? dest.mapLinks : (dest.mapSearchUrl ? [dest.mapSearchUrl] : []);
  if (!links.length) return [];
  if (links.length === 1) return [{ url: links[0], label: '🔍 Mở trên Google Maps (chưa có toạ độ xác thực)' }];
  // Nhiều link chỉ thật sự là "điểm dừng" riêng biệt khi listing có mảng stops (multiStopExperience,
  // vd EXP-02) — các trường hợp khác (vd cụm SITE-04 có link khu vực + link điểm neo Ao Bà Om) chỉ
  // là lựa chọn xem bản đồ khác nhau, không phải các điểm dừng của một hành trình.
  if (dest.stops && dest.stops.length === links.length) {
    return links.map((url, i) => ({ url, label: `🔍 Mở trên Google Maps — điểm dừng ${i + 1}` }));
  }
  return links.map((url, i) => ({ url, label: `🔍 Mở trên Google Maps (lựa chọn ${i + 1})` }));
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
      <img class="mini-card__img" src="${destinationImageSrc(d)}" alt="" loading="lazy" />
      <span class="mini-card__title">${escapeHtml(d.name)}</span>
      <span class="text-sm text-muted">${escapeHtml(listingTypeBadge(d.listingType).label)}</span>
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

function sourcesSectionHtml(dest) {
  const hasSources = dest.sources && dest.sources.length;
  if (!hasSources) return '';
  return `
    <section>
      <div class="section-title"><h2>Nguồn tham khảo</h2></div>
      <ul style="padding-left:18px;font-size:0.85rem;color:var(--color-text-muted);">
        ${dest.sources.map((s) => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`).join('')}
      </ul>
      ${dest.imageRef && dest.imageRef.url ? `
        <p class="text-sm text-faint">Ảnh minh hoạ hiện dùng placeholder theo loại hình — có link ảnh nguồn tham khảo (<a href="${escapeHtml(dest.imageRef.url)}" target="_blank" rel="noopener noreferrer">xem</a>), chưa tải về/chưa xác nhận quyền dùng lại cho production.</p>
      ` : ''}
    </section>
  `;
}

/** Nút hành động chính — chỉ hiện "Đặt trải nghiệm" khi thật sự bookable; các trải nghiệm đề
 * xuất (EXP-01/02/03, hiện chưa listing nào bookable) dùng 1 trong 3 CTA trung tính theo
 * ctaKind. Điểm/cụm tham quan tự do (site/cluster) không có CTA loại này — chỉ có chỉ đường. */
function ctaSectionHtml(dest) {
  if (dest.bookingStatus === 'bookable') {
    return '<button type="button" class="btn btn-primary" id="pd-book-btn">🎟️ Đặt trải nghiệm</button>';
  }
  if (dest.listingType === 'experience' || dest.listingType === 'multiStopExperience') {
    return `<button type="button" class="btn btn-accent" id="pd-interest-btn">${escapeHtml(ctaLabel(dest.ctaKind))}</button>`;
  }
  return '';
}

function readinessNoteHtml(dest) {
  return `
    <div class="demo-note" style="margin-top:10px;">
      <strong>Trạng thái sẵn sàng:</strong> ${escapeHtml(dest.status || 'Đang cập nhật')}
      ${dest.conclusionNote ? `<br>${escapeHtml(dest.conclusionNote)}` : ''}
    </div>
  `;
}

function clusterChildrenHtml(state, dest) {
  if (!dest.clusterChildren || !dest.clusterChildren.length) return '';
  const children = dest.clusterChildren.map((id) => state.destinations.find((d) => d.id === id)).filter(Boolean);
  if (!children.length) return '';
  return `
    <section>
      <div class="section-title"><h2>Điểm trong cụm</h2></div>
      <p class="text-sm text-muted">"${escapeHtml(dest.name)}" là khu/cụm điều phối — chưa phải một công trình duy nhất đã hoàn thiện. Dưới đây là các điểm cụ thể đã xác minh trong cụm:</p>
      <div class="flex-col gap-3" style="margin-top:8px;">
        ${children.map((c) => `
          <a class="gateway-item" href="#/trail/place/${c.id}">
            <strong>${categoryEmoji(c.category)} ${escapeHtml(c.name)}</strong>
            <span class="text-sm text-muted">${escapeHtml(listingTypeBadge(c.listingType).label)} · ${escapeHtml(c.status || '')}</span>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

function multiStopHtml(dest) {
  if (!dest.stops || !dest.stops.length) return '';
  return `
    <section>
      <div class="section-title"><h2>${dest.stops.length} điểm dừng đề xuất</h2></div>
      <p class="text-sm text-muted">Đây là gói trải nghiệm nhiều điểm dừng — hai địa điểm chưa có toạ độ cơ sở riêng được công bố, không gộp thành một pin. Chưa phải tour đang bán.</p>
      <div class="flex-col gap-3" style="margin-top:8px;">
        ${dest.stops.map((s) => `
          <div class="activity-card">
            <div class="activity-card__head"><strong>${escapeHtml(s.label)} — ${escapeHtml(s.place)}</strong></div>
            <p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(s.description || '')}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

export function renderPlaceDetail(container, id) {
  const state = getState();
  const dest = state.destinations.find((d) => d.id === id);

  if (!dest) {
    container.innerHTML = `
      <div class="place-detail">
        ${renderEmptyState({ icon: '🗺️', title: 'Không tìm thấy địa điểm', message: 'Địa điểm này có thể không thuộc phạm vi 7 listing pilot hiện tại.' })}
        <div style="text-align:center;"><a class="btn btn-secondary" href="#/trail/explore">← Về Khám phá</a></div>
      </div>
    `;
    return;
  }

  recordDestinationView(dest.id);

  const reviews = [
    ...state.reviews.filter((r) => r.destinationId === dest.id),
    ...state.userReviews.filter((r) => r.destinationId === dest.id),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const related = (dest.relatedListingIds || [])
    .map((rid) => state.destinations.find((d) => d.id === rid))
    .filter(Boolean);

  const fav = isFavorite(dest.id);
  const dirs = directionsLinks(dest);
  const typeBadge = listingTypeBadge(dest.listingType);
  const heroSrc = dest.representativeImageUrl || destinationImageSrc(dest);
  const heroFallback = placeholderImageDataUri(dest.category, dest.name);

  container.innerHTML = `
    <div class="place-detail">
      <img class="place-hero" id="pd-hero-img" src="${escapeHtml(heroSrc)}" alt="Ảnh minh hoạ ${escapeHtml(dest.name)}" />
      <div class="place-detail__body">
        <div>
          <a href="#/trail/explore" class="text-sm">← Về Khám phá</a>
          <h1 style="margin-top:8px;">${escapeHtml(dest.name)}${dest.altName ? ` <span class="text-faint text-lg">(${escapeHtml(dest.altName)})</span>` : ''}</h1>
          <div class="badge-row">
            <span class="badge ${typeBadge.cls}">${categoryEmoji(dest.category)} ${escapeHtml(typeBadge.label)}</span>
            <span class="badge badge-type">${escapeHtml(dest.category)}</span>
          </div>
          ${readinessNoteHtml(dest)}
          <p style="margin-top:12px;">${escapeHtml(dest.summary)}</p>
        </div>

        <div class="cta-row">
          ${dirs.map((d) => `<a class="btn btn-secondary" href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer">${d.label}</a>`).join('')}
          ${ctaSectionHtml(dest)}
          <button type="button" class="btn btn-primary" id="add-itinerary-btn">➕ Thêm vào hành trình</button>
          <button type="button" class="btn btn-fav" id="save-place-btn" data-active="${fav}">${fav ? '♥ Đã lưu' : '♡ Lưu địa điểm'}</button>
        </div>

        ${dest.activities ? `
          <section>
            <div class="section-title"><h2>Hoạt động có thể tham gia</h2></div>
            <p>${escapeHtml(dest.activities)}</p>
          </section>
        ` : ''}

        ${multiStopHtml(dest)}
        ${clusterChildrenHtml(state, dest)}

        ${dest.culturalStory || (dest.keyFacts && dest.keyFacts.length) ? `
          <section>
            <div class="section-title"><h2>Câu chuyện & số liệu nổi bật</h2></div>
            ${dest.culturalStory ? `<p>${escapeHtml(dest.culturalStory)}</p>` : ''}
            ${dest.keyFacts && dest.keyFacts.length ? `<ul style="padding-left:18px;">${dest.keyFacts.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
          </section>
        ` : ''}

        <section class="accordion" id="place-accordion">
          ${accordionItem('acc-before', 'Lưu ý trước khi đến', `<p>${escapeHtml(dest.tips || 'Chưa có lưu ý cụ thể.')}</p>`, true)}
          ${accordionItem('acc-hours', 'Giờ và phí', `
            <div class="quick-facts" style="margin:0;">
              ${quickFact('Giờ mở cửa', factDisplay(dest.openingHours, dest.openingHoursStatus, 'Vui lòng kiểm tra trước khi đến'))}
              ${quickFact('Giá tham quan', factDisplay(dest.priceDisplay, dest.priceStatus, 'Đang xác minh'))}
            </div>
            ${dest.priceNote ? `<p class="text-sm text-faint" style="margin-top:6px;">${escapeHtml(dest.priceNote)}</p>` : ''}
          `)}
          ${accordionItem('acc-address', 'Địa chỉ', `
            <p>${factDisplay(dest.address, dest.addressStatus)}</p>
            ${dest.formerAddress ? `<p class="text-sm text-faint">Địa chỉ trước sắp xếp 2025 (để đối chiếu nguồn): ${escapeHtml(dest.formerAddress)}</p>` : ''}
          `)}
          ${accordionItem('acc-reviews', `Đánh giá tiêu biểu (${reviews.length})`, reviews.length
            ? reviews.map(reviewItemHtml).join('')
            : renderEmptyState({ icon: '📝', title: 'Chưa có đánh giá', message: '7 listing pilot chưa có đánh giá thật — sẽ mở khi có khách tham gia thật.' }))}
        </section>

        ${sourcesSectionHtml(dest)}

        ${related.length ? `
          <section>
            <div class="section-title"><h2>Trải nghiệm/địa điểm liên quan</h2></div>
            <div class="h-scroll">${related.map(miniCardHtml).join('')}</div>
          </section>
        ` : ''}
      </div>
    </div>
  `;

  initAccordion(container);

  qs('#pd-hero-img', container)?.addEventListener('error', (e) => {
    e.currentTarget.src = heroFallback;
  }, { once: true });

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

  qs('#pd-interest-btn', container)?.addEventListener('click', () => {
    NotificationService.notify('Đã ghi nhận quan tâm — trải nghiệm này đang chờ khảo sát/xác nhận supplier trước khi mở bán.', 'info');
  });

  qs('#add-itinerary-btn', container).addEventListener('click', () => {
    const editableItinerary = state.itineraries.find((it) => it.status === 'selected');
    if (editableItinerary) {
      confirmDialog({
        title: 'Thêm vào hành trình?',
        message: `Thêm "${dest.name}" vào hành trình "${editableItinerary.name}" đang chỉnh sửa?`,
        confirmLabel: 'Thêm vào',
      }).then((ok) => {
        if (!ok) return;
        editableItinerary.stops.push({
          destinationId: dest.id, name: dest.name, category: dest.category,
          arriveMin: 0, departMin: 0, travelMinFromPrev: 0, travelEstimated: true, travelUnknown: false,
          experienceId: null, slotId: null, experienceTitle: null, experiencePrice: 0,
          note: '', selfVisitedAt: null, bookingItemId: null,
        });
        recalcTimeline(editableItinerary);
        saveItinerary(editableItinerary);
        NotificationService.notify('Đã thêm vào hành trình — giờ và chi phí đã cập nhật.', 'success');
        window.location.hash = `#/trail/itinerary/${editableItinerary.id}`;
      });
      return;
    }
    const added = addDraftItineraryItem(dest.id);
    NotificationService.notify(
      added
        ? 'Đã lưu vào danh sách gợi ý — vào "Hành trình" để tạo hành trình đầy đủ, danh sách này sẽ được dùng làm gợi ý ban đầu.'
        : 'Địa điểm này đã có trong danh sách gợi ý ban đầu.',
      'info',
    );
  });
}
