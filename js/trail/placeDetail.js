import { getState, toggleFavorite, isFavorite, addDraftItineraryItem, saveItinerary } from '../storage.js';
import {
  escapeHtml, formatCurrency, formatDateShort, categoryEmoji, deriveCategoryVisual,
  destinationImageSrc, renderStars, qs, qsa,
} from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { getSlotRemaining } from '../services/bookingService.js';
import { recalcTimeline } from '../services/aiService.js';
import { initAccordion, renderEmptyState, openModal, confirmDialog } from '../ui.js';
import { openBookingFlow } from './booking.js';

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

function directionsInfo(dest) {
  if (dest.lat !== null && dest.lng !== null) {
    return { url: `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`, label: '🧭 Chỉ đường' };
  }
  if (dest.mapSearchUrl) {
    return { url: dest.mapSearchUrl, label: '🔍 Tìm trên bản đồ (chưa có toạ độ xác thực)' };
  }
  return null;
}

function activityCardHtml(exp) {
  const upcoming = exp.slots
    .filter((s) => new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const withRemaining = upcoming.map((s) => ({ s, remaining: getSlotRemaining(s) }));
  const totalRemaining = withRemaining.reduce((sum, x) => sum + x.remaining, 0);
  const slotsHtml = upcoming.length
    ? withRemaining.map(({ s, remaining }) => {
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

function openSingleExperienceBooking(container, exp) {
  const upcoming = exp.slots
    .filter((s) => new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .map((s) => ({ s, remaining: getSlotRemaining(s) }))
    .filter((x) => x.remaining > 0);
  if (!upcoming.length) {
    NotificationService.notify('Hoạt động này hiện không còn khung giờ trống.', 'error');
    return;
  }
  const bodyHtml = `
    <div class="flex-col gap-3">
      <div>
        <span class="field-label">Chọn khung giờ</span>
        <div class="flex-col gap-2">
          ${upcoming.map(({ s, remaining }, i) => `
            <label class="flex items-center gap-2">
              <input type="radio" name="pd-slot-pick" value="${s.id}" ${i === 0 ? 'checked' : ''}>
              ${formatDateShort(s.date)} · ${s.startTime}–${s.endTime} (còn ${remaining} chỗ)
            </label>
          `).join('')}
        </div>
      </div>
      <div><label class="field-label" for="pd-qty">Số khách</label><input type="number" min="1" value="1" class="field-input" id="pd-qty"></div>
      <div class="modal__actions"><button type="button" class="btn btn-primary" id="pd-continue">Tiếp tục</button></div>
    </div>
  `;
  openModal({
    title: exp.title,
    bodyHtml,
    onMount: (modalEl, closeFn) => {
      qs('#pd-continue', modalEl).addEventListener('click', () => {
        const picked = modalEl.querySelector('input[name="pd-slot-pick"]:checked');
        const slotId = picked ? picked.value : upcoming[0].s.id;
        const qty = Math.max(1, Number(qs('#pd-qty', modalEl).value) || 1);
        const match = upcoming.find((x) => x.s.id === slotId);
        if (match && qty > match.remaining) {
          NotificationService.notify(`Chỉ còn ${match.remaining} chỗ cho khung giờ này.`, 'error');
          return;
        }
        closeFn();
        openBookingFlow({
          items: [{ experienceId: exp.id, slotId, quantity: qty }],
          partySize: qty,
          onDone: () => {
            NotificationService.notify('Đặt trải nghiệm hoàn tất — xem trạng thái trong Hộ chiếu.', 'success');
            renderPlaceDetail(container, exp.destinationId);
          },
        });
      });
    },
  });
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

function sourcesSectionHtml(dest) {
  const hasSources = dest.sources && dest.sources.length;
  const hasNotes = dest.notes && dest.notes.length;
  if (!hasSources && !hasNotes) return '';
  return `
    <section>
      <div class="section-title"><h2>Nguồn dữ liệu</h2></div>
      ${hasNotes ? `<div class="demo-note" style="margin-bottom:10px;">${dest.notes.map((n) => `⚠️ ${escapeHtml(n)}`).join('<br><br>')}</div>` : ''}
      ${hasSources ? `<ul style="padding-left:18px;font-size:0.85rem;color:var(--color-text-muted);">
        ${dest.sources.map((s) => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`).join('')}
      </ul>` : ''}
      ${dest.imageRef && dest.imageRef.url && dest.imageRef.status === 'downloaded-demo-use' ? `
        <p class="text-sm text-faint">Ảnh dùng cho bản demo phi thương mại, tải từ nguồn công khai (<a href="${escapeHtml(dest.imageRef.url)}" target="_blank" rel="noopener noreferrer">xem nguồn gốc</a>) — cần xin phép đơn vị giữ bản quyền trước khi dùng cho production/thương mại.</p>
      ` : ''}
      ${dest.imageRef && dest.imageRef.url && dest.imageRef.status === 'external-not-downloaded' ? `
        <p class="text-sm text-faint">Ảnh minh hoạ hiện dùng placeholder — có link ảnh/trang nguồn tham khảo (<a href="${escapeHtml(dest.imageRef.url)}" target="_blank" rel="noopener noreferrer">xem</a>), chưa tải về/chưa xác nhận quyền dùng lại.</p>
      ` : ''}
    </section>
  `;
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
  const reviews = [
    ...state.reviews.filter((r) => r.destinationId === dest.id),
    ...state.userReviews.filter((r) => r.destinationId === dest.id),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  const destGroup = deriveCategoryVisual(dest.category).group;
  const nearby = state.destinations
    .filter((d) => d.id !== dest.id && deriveCategoryVisual(d.category).group === destGroup)
    .slice(0, 3);

  const fav = isFavorite(dest.id);
  const dir = directionsInfo(dest);

  container.innerHTML = `
    <div class="place-detail">
      <img class="place-hero" src="${destinationImageSrc(dest)}" alt="Ảnh ${dest.imagePath ? '' : 'minh hoạ '}${escapeHtml(dest.name)}" />
      <div class="place-detail__body">
        <div>
          <a href="#/trail/explore" class="text-sm">← Về Khám phá</a>
          <h1 style="margin-top:8px;">${escapeHtml(dest.name)}${dest.altName ? ` <span class="text-faint text-lg">(${escapeHtml(dest.altName)})</span>` : ''}</h1>
          <div class="badge-row">
            <span class="badge badge-type">${categoryEmoji(dest.category)} ${escapeHtml(dest.category)}</span>
            ${dest.isNew ? '<span class="badge badge-new">Mới trên mạng lưới</span>' : ''}
            ${dest.isDemoHost ? '<span class="badge badge-demo">Hộ demo minh hoạ</span>' : ''}
            ${dest.recognized ? `
              <span class="recognized-badge badge badge-recognized" tabindex="0">
                ✓ Được ghi nhận
                <span class="recognized-badge__tip">${escapeHtml(dest.recognizedReason || 'Đạt tiêu chí chất lượng của mạng lưới demo.')}</span>
              </span>` : ''}
          </div>
          <p style="margin-top:12px;">${escapeHtml(dest.summary)}</p>
        </div>

        <div class="quick-facts">
          ${quickFact('Địa chỉ', factDisplay(dest.address, dest.addressStatus, 'Chưa xác minh địa chỉ'))}
          ${quickFact('Giờ mở cửa', factDisplay(dest.openingHours, dest.openingHoursStatus, 'Chưa xác minh giờ mở cửa'))}
          ${quickFact('Giá tham quan', factDisplay(dest.priceDisplay, dest.priceStatus, 'Chưa xác minh giá'))}
          ${quickFact('Thời gian gợi ý', dest.suggestedDurationMin ? `${dest.suggestedDurationMin} phút${statusSuffix(dest.durationStatus)}` : '<span class="text-faint">Chưa xác minh</span>')}
          ${quickFact('Đánh giá', `⭐ ${dest.rating.toFixed(1)} (${dest.ratingCount} lượt)${statusSuffix(dest.ratingStatus)}`)}
        </div>

        <div class="cta-row">
          ${dir ? `<a class="btn btn-secondary" href="${escapeHtml(dir.url)}" target="_blank" rel="noopener noreferrer">${dir.label}</a>` : ''}
          <button type="button" class="btn btn-primary" id="add-itinerary-btn">➕ Thêm vào hành trình</button>
          <button type="button" class="btn btn-fav" id="save-place-btn" data-active="${fav}">${fav ? '♥ Đã lưu' : '♡ Lưu địa điểm'}</button>
        </div>

        ${experiences.length ? `
          <section>
            <div class="section-title"><h2>Hoạt động trả phí</h2></div>
            <div class="flex-col gap-3">${experiences.map(activityCardHtml).join('')}</div>
          </section>
        ` : `
          <p class="demo-note">Địa điểm này hiện chưa có hoạt động trả phí trong dữ liệu demo (chỉ có thông tin tham quan chung).</p>
        `}

        <section class="accordion" id="place-accordion">
          ${accordionItem('acc-do', 'Bạn có thể làm gì?', `
            <p>${escapeHtml(dest.activities || dest.summary)}</p>
            ${experiences.length ? `<ul style="padding-left:18px;">${experiences.map((e) => `<li>${escapeHtml(e.title)}</li>`).join('')}</ul>` : ''}
          `, true)}
          ${accordionItem('acc-before', 'Cần biết trước khi đến', `<p>${escapeHtml(dest.tips || 'Chưa có lưu ý cụ thể.')}</p>`)}
          ${accordionItem('acc-contact', 'Liên hệ', `<p>${factDisplay(dest.contact, dest.contactStatus, 'Chưa xác minh được từ nguồn công khai đủ tin cậy.')}</p>`)}
          ${accordionItem('acc-reviews', `Đánh giá tiêu biểu (${reviews.length})`, reviews.length
            ? reviews.map(reviewItemHtml).join('')
            : renderEmptyState({ icon: '📝', title: 'Chưa có đánh giá tiêu biểu', message: 'Hoàn thành một trải nghiệm đã đặt để có thể viết đánh giá đầu tiên.' }))}
        </section>

        ${sourcesSectionHtml(dest)}

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
          arriveMin: 0, departMin: 0, travelMinFromPrev: 0, travelEstimated: true,
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

  qsa('[data-book-exp]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const exp = experiences.find((e) => e.id === btn.dataset.bookExp);
      if (exp) openSingleExperienceBooking(container, { ...exp, destinationId: dest.id });
    });
  });
}
