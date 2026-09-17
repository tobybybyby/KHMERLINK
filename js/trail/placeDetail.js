import { getState, toggleFavorite, isFavorite, toggleTripCartItem, isInTripCart, recordDestinationView } from '../storage.js';
import {
  escapeHtml, formatDateShort, categoryEmoji, formatDurationMin, categoryGroupLabel,
  destinationImageSrc, placeholderImageDataUri, renderStars, listingTypeBadge, ctaLabel,
  qs, qsa,
} from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { getRatingStatsForListing, getDisplayReviewsForListing, formatRatingStats } from '../services/reviewsService.js';
import { computeOpenStatus, formatPricePerPerson, getNearestSlotAvailability, getOperations, formatWeeklyHoursRows } from '../services/operationsService.js';
import { openReviewModal } from './passport.js';
import { initAccordion, renderEmptyState, confirmDialog } from '../ui.js';
import * as NavHistory from '../services/navHistoryService.js';
import { t, localize, registerTranslations } from '../services/i18nService.js';
import {
  localizedDestinationName, localizedDestinationSummary, localizedDestinationActivities,
  localizedDestinationCulturalStory, localizedDestinationTips, localizedDestinationKeyFacts,
} from '../services/destinationsService.js';
import { localizeTag } from '../services/tagCatalog.js';

registerTranslations('customer', {
  placeDetail: {
    notFoundTitle: 'Không tìm thấy địa điểm',
    notFoundMsg: 'Địa điểm này có thể không thuộc phạm vi 7 listing pilot hiện tại.',
    backToExplore: '← Về Khám phá',
    openingHours: 'Giờ mở cửa',
    entryPrice: 'Giá tham quan',
    pleaseCheck: 'Vui lòng kiểm tra trước khi đến',
    verifying: 'Đang xác minh',
    currentStatus: 'Trạng thái hiện tại',
    price: 'Giá',
    duration: 'Thời lượng',
    capacityPerSlot: 'Sức chứa mỗi lượt',
    peoplePerSlot: '{count} người',
    seeWeekHours: 'Xem giờ cả tuần',
    pilotNote: 'Thông tin vận hành trong giai đoạn pilot, vui lòng kiểm tra khi đặt lịch.',
    estimated: '(ước lượng)',
    notVerified: 'Chưa xác minh',
    stopN: 'Dừng {n}',
    approx: ' (gần đúng)',
    directionsTo: '🧭 Chỉ đường — {stop}',
    googleMapsStop: '🔍 Google Maps — {stop}',
    directions: '🧭 Chỉ đường',
    openInMaps: '🔍 Mở trên Google Maps',
    openInMapsOption: '🔍 Mở trên Google Maps (lựa chọn {n})',
    guest: 'Khách',
    outOf5: '{rating} trên 5 sao',
    referenceSources: 'Nguồn tham khảo',
    imageNote: 'Ảnh dùng cho bản demo phi thương mại, tải từ nguồn công khai ({link}) — cần xin phép đơn vị giữ bản quyền trước khi dùng cho production/thương mại.',
    imageNoteSource: 'xem nguồn gốc',
    imageNotePlaceholder: 'Ảnh minh hoạ hiện dùng placeholder theo loại hình — có link ảnh nguồn tham khảo ({link}), chưa tải về/chưa xác nhận quyền dùng lại cho production.',
    imageNoteSee: 'xem',
    bookTour: '🎟️ Đặt trải nghiệm',
    clusterPointsTitle: 'Điểm trong cụm',
    clusterPointsDesc: '"{name}" là khu/cụm điều phối — chưa phải một công trình duy nhất đã hoàn thiện. Dưới đây là các điểm cụ thể đã xác minh trong cụm:',
    stopsTitle: '{count} điểm dừng đề xuất',
    stopsDesc: 'Đây là gói trải nghiệm nhiều điểm dừng — mỗi điểm giữ toạ độ/địa chỉ riêng, không gộp thành một pin.',
    closeDetailA11y: 'Đóng chi tiết địa điểm',
    back: '← Quay lại',
    pausedBadge: 'Tạm dừng nhận khách',
    added: '✓ Đã thêm',
    addToTrip: '➕ Thêm vào hành trình',
    saved: '♥ Đã lưu',
    savePlace: '♡ Lưu địa điểm',
    writeReview: '⭐ Viết đánh giá',
    activitiesTitle: 'Hoạt động có thể tham gia',
    storyTitle: 'Câu chuyện & số liệu nổi bật',
    beforeVisitTitle: 'Lưu ý trước khi đến',
    noSpecificNotes: 'Chưa có lưu ý cụ thể.',
    hoursFeesTitle: 'Giờ và phí',
    addressTitle: 'Địa chỉ',
    formerAddressNote: 'Địa chỉ trước sắp xếp 2025 (để đối chiếu nguồn): {address}',
    reviewsTitle: 'Đánh giá tiêu biểu ({count})',
    noReviewsTitle: 'Chưa có đánh giá',
    noReviewsMsg: '7 listing pilot chưa có đánh giá thật — sẽ mở khi có khách tham gia thật.',
    relatedTitle: 'Trải nghiệm/địa điểm liên quan',
    imageAlt: 'Ảnh minh hoạ {name}',
    savedNotify: 'Đã lưu địa điểm vào danh sách yêu thích.',
    unsavedNotify: 'Đã bỏ lưu địa điểm.',
    interestNotify: 'Đã ghi nhận quan tâm — trải nghiệm này đang chờ khảo sát/xác nhận supplier trước khi mở bán.',
    inCartTitle: 'Địa điểm đã có trong giỏ hành trình',
    inCartMsg: '"{name}" đang ở trong giỏ hành trình của bạn. Mở giỏ hành trình hay gỡ địa điểm này ra?',
    openCart: 'Mở giỏ hành trình',
    removeFromCart: 'Gỡ khỏi giỏ',
    removedFromCartNotify: 'Đã gỡ "{name}" khỏi giỏ hành trình.',
    addedToCartNotify: 'Đã thêm {name} vào hành trình của bạn.',
  },
}, {
  placeDetail: {
    notFoundTitle: 'Place not found',
    notFoundMsg: 'This place may not be part of the current 7 pilot listings.',
    backToExplore: '← Back to Explore',
    openingHours: 'Opening hours',
    entryPrice: 'Entry price',
    pleaseCheck: 'Please check before visiting',
    verifying: 'Verifying',
    currentStatus: 'Current status',
    price: 'Price',
    duration: 'Duration',
    capacityPerSlot: 'Capacity per slot',
    peoplePerSlot: '{count} people',
    seeWeekHours: 'See full week hours',
    pilotNote: 'Operational information during the pilot phase — please check when booking.',
    estimated: '(estimated)',
    notVerified: 'Not verified',
    stopN: 'Stop {n}',
    approx: ' (approx.)',
    directionsTo: '🧭 Directions — {stop}',
    googleMapsStop: '🔍 Google Maps — {stop}',
    directions: '🧭 Directions',
    openInMaps: '🔍 Open in Google Maps',
    openInMapsOption: '🔍 Open in Google Maps (option {n})',
    guest: 'Guest',
    outOf5: '{rating} out of 5 stars',
    referenceSources: 'Reference sources',
    imageNote: 'Image used for non-commercial demo purposes, downloaded from a public source ({link}) — permission from the copyright holder is required before production/commercial use.',
    imageNoteSource: 'view source',
    imageNotePlaceholder: 'Illustrative image currently uses a type-based placeholder — a reference source link is available ({link}), not yet downloaded/rights not confirmed for production use.',
    imageNoteSee: 'view',
    bookTour: '🎟️ Book Tour',
    clusterPointsTitle: 'Points in this cluster',
    clusterPointsDesc: '"{name}" is a coordination area/cluster — not yet a single completed site. Below are the specific verified points within it:',
    stopsTitle: '{count} suggested stops',
    stopsDesc: 'This is a multi-stop experience package — each stop keeps its own coordinates/address, not merged into one pin.',
    closeDetailA11y: 'Close place details',
    back: '← Back',
    pausedBadge: 'Not currently accepting guests',
    added: '✓ Added',
    addToTrip: '➕ Add to Trip',
    saved: '♥ Saved',
    savePlace: '♡ Save place',
    writeReview: '⭐ Write a review',
    activitiesTitle: 'Activities you can join',
    storyTitle: 'Story & highlights',
    beforeVisitTitle: 'Before you visit',
    noSpecificNotes: 'No specific notes yet.',
    hoursFeesTitle: 'Hours & fees',
    addressTitle: 'Address',
    formerAddressNote: 'Address before the 2025 administrative reorganisation (for source cross-checking): {address}',
    reviewsTitle: 'Featured reviews ({count})',
    noReviewsTitle: 'No reviews yet',
    noReviewsMsg: 'The 7 pilot listings do not have real reviews yet — this will open once real guests take part.',
    relatedTitle: 'Related experiences/places',
    imageAlt: 'Illustrative image of {name}',
    savedNotify: 'Place saved to your favourites.',
    unsavedNotify: 'Place removed from favourites.',
    interestNotify: 'Your interest has been recorded — this experience is awaiting supplier survey/confirmation before launch.',
    inCartTitle: 'This place is already in your trip cart',
    inCartMsg: '"{name}" is currently in your trip cart. Open the trip cart or remove this place?',
    openCart: 'Open trip cart',
    removeFromCart: 'Remove from cart',
    removedFromCartNotify: 'Removed "{name}" from your trip cart.',
    addedToCartNotify: 'Added {name} to your trip.',
  },
});

function quickFact(label, value) {
  return `
    <div class="quick-fact">
      <span class="quick-fact__label">${escapeHtml(label)}</span>
      <span class="quick-fact__value">${value}</span>
    </div>
  `;
}

const OPEN_STATUS_LABEL_CLS = { open: 'badge-free', closing_soon: 'badge-recognized', closed: 'badge-demo', by_appointment: 'badge-type', unknown: 'badge-demo' };

function operationsAccordionHtml(state, dest) {
  const ops = getOperations(dest.id);
  if (!ops) {
    return `
      <div class="quick-facts" style="margin:0;">
        ${quickFact(t('customer.placeDetail.openingHours'), factDisplay(dest.openingHours, dest.openingHoursStatus, t('customer.placeDetail.pleaseCheck')))}
        ${quickFact(t('customer.placeDetail.entryPrice'), factDisplay(dest.priceDisplay, dest.priceStatus, t('customer.placeDetail.verifying')))}
      </div>
    `;
  }
  const status = computeOpenStatus(dest.id);
  const priceText = formatPricePerPerson(ops.pricePerPerson);
  const avail = (dest.listingType === 'experience' || dest.listingType === 'multiStopExperience') ? getNearestSlotAvailability(state, dest.id) : null;
  const weekRows = formatWeeklyHoursRows(dest.id);
  return `
    <div class="quick-facts" style="margin:0;">
      <div class="quick-fact"><span class="quick-fact__label">${t('customer.placeDetail.currentStatus')}</span><span class="quick-fact__value"><span class="badge ${OPEN_STATUS_LABEL_CLS[status.status] || 'badge-demo'}">${escapeHtml(status.label)}</span></span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('customer.placeDetail.price')}</span><span class="quick-fact__value">${escapeHtml(priceText)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('customer.placeDetail.duration')}</span><span class="quick-fact__value">${ops.durationMinutes ? formatDurationMin(ops.durationMinutes) : '—'}</span></div>
      ${ops.capacityPerSlot ? `<div class="quick-fact"><span class="quick-fact__label">${t('customer.placeDetail.capacityPerSlot')}</span><span class="quick-fact__value">${t('customer.placeDetail.peoplePerSlot', { count: ops.capacityPerSlot })}</span></div>` : ''}
    </div>
    ${avail ? `<p class="text-sm" style="margin-top:8px;">🎟️ ${escapeHtml(avail.label)} (${escapeHtml(avail.dateLabel)})</p>` : ''}
    ${ops.openingNote ? `<p class="text-sm text-faint" style="margin-top:6px;">${escapeHtml(ops.openingNote)}</p>` : ''}
    <details style="margin-top:8px;">
      <summary class="text-sm" style="cursor:pointer;">${t('customer.placeDetail.seeWeekHours')}</summary>
      <div class="flex-col gap-1" style="margin-top:6px;">
        ${weekRows.map((r) => `<p class="text-sm text-muted" style="margin:0;display:flex;justify-content:space-between;gap:8px;"><span>${escapeHtml(r.label)}</span><span>${escapeHtml(r.value)}</span></p>`).join('')}
      </div>
    </details>
    <p class="text-sm text-faint" style="margin-top:10px;">${t('customer.placeDetail.pilotNote')}</p>
  `;
}

function statusSuffix(status) {
  if (status === 'estimated') return ` <span class="text-faint text-sm">${t('customer.placeDetail.estimated')}</span>`;
  return '';
}

function factDisplay(value, status, missingText = t('customer.placeDetail.notVerified')) {
  if (value === null || value === undefined || value === '') {
    return `<span class="text-faint">${escapeHtml(missingText)}</span>`;
  }
  return `${escapeHtml(String(value))}${statusSuffix(status)}`;
}

/** Trả về mảng {url,label} nút chỉ đường/mở bản đồ — ưu tiên directions thật khi có toạ độ công
 * khai (kể cả toạ độ riêng của TỪNG điểm dừng với multiStopExperience, vd EXP-02 dừng 2 đã tra
 * được toạ độ gần đúng theo địa chỉ đường — xem coordinateNote), phần còn lại dùng link tìm kiếm
 * có sẵn trong dữ liệu. Không gộp nhiều điểm dừng thành một pin. */
function directionsLinks(dest) {
  if (dest.stops && dest.stops.length) {
    return dest.stops.map((s, i) => {
      // Nhãn nút cố tình ngắn gọn (chỉ "Dừng N") — chi tiết "(đề xuất)"/"chưa có toạ độ xác
      // thực" đã có sẵn trong nội dung mô tả từng điểm dừng bên dưới, nhắc lại đầy đủ trong nhãn
      // nút sẽ quá dài và tràn ngang trên màn hẹp.
      const short = t('customer.placeDetail.stopN', { n: s.order || i + 1 });
      if (s.coordinates && typeof s.coordinates.lat === 'number' && typeof s.coordinates.lng === 'number') {
        const approxTag = s.coordinateStatus === 'geocodedApprox' ? t('customer.placeDetail.approx') : '';
        return { url: `https://www.google.com/maps/dir/?api=1&destination=${s.coordinates.lat},${s.coordinates.lng}`, label: t('customer.placeDetail.directionsTo', { stop: short }) + approxTag };
      }
      const link = (dest.mapLinks && dest.mapLinks[i]) || dest.mapSearchUrl;
      return link ? { url: link, label: t('customer.placeDetail.googleMapsStop', { stop: short }) } : null;
    }).filter(Boolean);
  }
  if (dest.lat !== null && dest.lng !== null) {
    return [{ url: `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`, label: t('customer.placeDetail.directions') }];
  }
  const links = dest.mapLinks && dest.mapLinks.length ? dest.mapLinks : (dest.mapSearchUrl ? [dest.mapSearchUrl] : []);
  if (!links.length) return [];
  if (links.length === 1) return [{ url: links[0], label: t('customer.placeDetail.openInMaps') }];
  return links.map((url, i) => ({ url, label: t('customer.placeDetail.openInMapsOption', { n: i + 1 }) }));
}

function reviewItemHtml(rv) {
  const tagsHtml = (rv.selectedTags || []).length
    ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${rv.selectedTags.map((tagId) => `<span class="badge badge-type" style="margin-right:4px;">${escapeHtml(localizeTag(tagId))}</span>`).join('')}</p>`
    : '';
  return `
    <div class="review-item">
      <div class="review-item__head">
        <span>${escapeHtml(rv.travellerName || t('customer.placeDetail.guest'))}</span>
        <span class="stars" aria-label="${t('customer.placeDetail.outOf5', { rating: rv.overallRating })}">${renderStars(rv.overallRating)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:6px 0 0;">${escapeHtml(localize(rv.comment))}</p>
      ${tagsHtml}
      <p class="text-faint text-sm" style="margin:2px 0 0;">${formatDateShort(rv.createdAt)}</p>
    </div>
  `;
}

function miniCardHtml(d) {
  return `
    <button type="button" class="mini-card" data-id="${d.id}">
      <img class="mini-card__img" src="${destinationImageSrc(d)}" alt="" loading="lazy" />
      <span class="mini-card__title">${escapeHtml(localizedDestinationName(d))}</span>
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
  const sourceLink = `<a href="${escapeHtml(dest.imageRef?.url || '')}" target="_blank" rel="noopener noreferrer">${t('customer.placeDetail.imageNoteSource')}</a>`;
  const seeLink = `<a href="${escapeHtml(dest.imageRef?.url || '')}" target="_blank" rel="noopener noreferrer">${t('customer.placeDetail.imageNoteSee')}</a>`;
  return `
    <section>
      <div class="section-title"><h2>${t('customer.placeDetail.referenceSources')}</h2></div>
      <ul style="padding-left:18px;font-size:0.85rem;color:var(--color-text-muted);">
        ${dest.sources.map((s) => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`).join('')}
      </ul>
      ${dest.imageRef && dest.imageRef.url && dest.imageRef.status === 'downloaded-demo-use' ? `
        <p class="text-sm text-faint">${t('customer.placeDetail.imageNote', { link: sourceLink })}</p>
      ` : ''}
      ${dest.imageRef && dest.imageRef.url && dest.imageRef.status !== 'downloaded-demo-use' ? `
        <p class="text-sm text-faint">${t('customer.placeDetail.imageNotePlaceholder', { link: seeLink })}</p>
      ` : ''}
    </section>
  `;
}

/** Nút hành động chính — chỉ hiện "Đặt trải nghiệm" khi thật sự bookable; các trải nghiệm đề
 * xuất (EXP-01/02/03, hiện chưa listing nào bookable) dùng 1 trong 3 CTA trung tính theo
 * ctaKind. Điểm/cụm tham quan tự do (site/cluster) không có CTA loại này — chỉ có chỉ đường. */
function ctaSectionHtml(dest) {
  if (dest.bookingStatus === 'bookable') {
    return `<button type="button" class="btn btn-primary" id="pd-book-btn">${t('customer.placeDetail.bookTour')}</button>`;
  }
  if (dest.listingType === 'experience' || dest.listingType === 'multiStopExperience') {
    return `<button type="button" class="btn btn-accent" id="pd-interest-btn">${escapeHtml(ctaLabel(dest.ctaKind))}</button>`;
  }
  return '';
}

function clusterChildrenHtml(state, dest) {
  if (!dest.clusterChildren || !dest.clusterChildren.length) return '';
  const children = dest.clusterChildren.map((id) => state.destinations.find((d) => d.id === id)).filter(Boolean);
  if (!children.length) return '';
  const name = localizedDestinationName(dest);
  return `
    <section>
      <div class="section-title"><h2>${t('customer.placeDetail.clusterPointsTitle')}</h2></div>
      <p class="text-sm text-muted">${t('customer.placeDetail.clusterPointsDesc', { name: escapeHtml(name) })}</p>
      <div class="flex-col gap-3" style="margin-top:8px;">
        ${children.map((c) => `
          <a class="gateway-item" href="#/trail/place/${c.id}">
            <strong>${categoryEmoji(c.category)} ${escapeHtml(localizedDestinationName(c))}</strong>
            <span class="text-sm text-muted">${escapeHtml(listingTypeBadge(c.listingType).label)}</span>
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
      <div class="section-title"><h2>${t('customer.placeDetail.stopsTitle', { count: dest.stops.length })}</h2></div>
      <p class="text-sm text-muted">${t('customer.placeDetail.stopsDesc')}</p>
      <div class="flex-col gap-3" style="margin-top:8px;">
        ${dest.stops.map((s) => `
          <div class="activity-card">
            <div class="activity-card__head"><strong>${escapeHtml(s.label)} — ${escapeHtml(s.place)}</strong></div>
            <p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(s.description || '')}</p>
            ${s.address ? `<p class="text-sm" style="margin:4px 0 0;">📍 ${escapeHtml(s.address)}</p>` : ''}
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
        ${renderEmptyState({ icon: '🗺️', title: t('customer.placeDetail.notFoundTitle'), message: t('customer.placeDetail.notFoundMsg') })}
        <div style="text-align:center;"><a class="btn btn-secondary" href="#/trail/explore">${t('customer.placeDetail.backToExplore')}</a></div>
      </div>
    `;
    return;
  }

  recordDestinationView(dest.id);

  const ratingStats = getRatingStatsForListing(state, dest.id);
  const reviews = getDisplayReviewsForListing(state, dest.id);
  // Mô tả ngắn: ưu tiên bản Host đã chỉnh trong Studio (activityCatalogOverrides.shortDescription,
  // hợp nhất live qua getOperations) — Customer luôn thấy ĐÚNG bản mới nhất, không phải bản tĩnh
  // trong pilot-listings.json (PHASE "Data Linkage" 15/09/2026, mục 5 "Sau khi Host lưu thay đổi").
  const activityOps = getOperations(dest.id);
  const summaryText = (activityOps && activityOps.shortDescription) || localizedDestinationSummary(dest);
  const isPaused = activityOps && activityOps.publicationStatus && activityOps.publicationStatus !== 'published';

  const related = (dest.relatedListingIds || [])
    .map((rid) => state.destinations.find((d) => d.id === rid))
    .filter(Boolean);

  const fav = isFavorite(dest.id);
  const inCart = isInTripCart(dest.id);
  const reviewableBookingItem = state.bookingItems.find((bi) => bi.destinationId === dest.id && bi.status === 'completed' && !state.reviews.some((r) => r.bookingItemId === bi.id));
  const dirs = directionsLinks(dest);
  const typeBadge = listingTypeBadge(dest.listingType);
  const name = localizedDestinationName(dest);
  const activities = localizedDestinationActivities(dest);
  const culturalStory = localizedDestinationCulturalStory(dest);
  const tips = localizedDestinationTips(dest);
  const keyFacts = localizedDestinationKeyFacts(dest);
  // Ưu tiên ảnh đã tải về (nhanh, ổn định, không phụ thuộc server ngoài); URL gốc chỉ dùng khi
  // chưa tải được ảnh nào cho listing này; placeholder theo loại hình là lưới an toàn cuối cùng.
  const heroSrc = dest.imagePath || dest.representativeImageUrl || destinationImageSrc(dest);
  const heroFallback = placeholderImageDataUri(dest.category, name);

  container.innerHTML = `
    <div class="place-detail">
      <img class="place-hero" id="pd-hero-img" src="${escapeHtml(heroSrc)}" alt="${t('customer.placeDetail.imageAlt', { name: escapeHtml(name) })}" />
      <div class="place-detail__body">
        <div>
          <button type="button" class="btn-back-link text-sm" id="pd-back-btn" aria-label="${t('customer.placeDetail.closeDetailA11y')}">${t('customer.placeDetail.back')}</button>
          <h1 style="margin-top:8px;">${escapeHtml(name)}${dest.altName ? ` <span class="text-faint text-lg">(${escapeHtml(dest.altName)})</span>` : ''}</h1>
          <div class="badge-row">
            <span class="badge ${typeBadge.cls}">${categoryEmoji(dest.category)} ${escapeHtml(typeBadge.label)}</span>
            <span class="badge badge-type">${escapeHtml(categoryGroupLabel(dest.category))}</span>
            ${isPaused ? `<span class="badge badge-demo">${t('customer.placeDetail.pausedBadge')}</span>` : ''}
          </div>
          <p class="text-sm text-muted" style="margin:4px 0 0;">${formatRatingStats(ratingStats)}</p>
          <p style="margin-top:12px;">${escapeHtml(summaryText)}</p>
        </div>

        <div class="cta-row">
          ${dirs.map((d) => `<a class="btn btn-secondary" href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer">${d.label}</a>`).join('')}
          ${ctaSectionHtml(dest)}
          <button type="button" class="btn ${inCart ? 'btn-secondary' : 'btn-primary'}" id="add-itinerary-btn" data-active="${inCart}">${inCart ? t('customer.placeDetail.added') : t('customer.placeDetail.addToTrip')}</button>
          <button type="button" class="btn btn-fav" id="save-place-btn" data-active="${fav}">${fav ? t('customer.placeDetail.saved') : t('customer.placeDetail.savePlace')}</button>
          ${reviewableBookingItem ? `<button type="button" class="btn btn-accent" id="pd-review-btn">${t('customer.placeDetail.writeReview')}</button>` : ''}
        </div>

        ${activities ? `
          <section>
            <div class="section-title"><h2>${t('customer.placeDetail.activitiesTitle')}</h2></div>
            <p>${escapeHtml(activities)}</p>
          </section>
        ` : ''}

        ${multiStopHtml(dest)}
        ${clusterChildrenHtml(state, dest)}

        ${culturalStory || keyFacts.length ? `
          <section>
            <div class="section-title"><h2>${t('customer.placeDetail.storyTitle')}</h2></div>
            ${culturalStory ? `<p>${escapeHtml(culturalStory)}</p>` : ''}
            ${keyFacts.length ? `<ul style="padding-left:18px;">${keyFacts.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
          </section>
        ` : ''}

        <section class="accordion" id="place-accordion">
          ${accordionItem('acc-before', t('customer.placeDetail.beforeVisitTitle'), `<p>${escapeHtml(tips || t('customer.placeDetail.noSpecificNotes'))}</p>`, true)}
          ${accordionItem('acc-hours', t('customer.placeDetail.hoursFeesTitle'), operationsAccordionHtml(state, dest))}
          ${accordionItem('acc-address', t('customer.placeDetail.addressTitle'), `
            <p>${factDisplay(dest.address, dest.addressStatus)}</p>
            ${dest.formerAddress ? `<p class="text-sm text-faint">${t('customer.placeDetail.formerAddressNote', { address: escapeHtml(dest.formerAddress) })}</p>` : ''}
          `)}
          ${accordionItem('acc-reviews', t('customer.placeDetail.reviewsTitle', { count: reviews.length }), reviews.length
            ? reviews.map(reviewItemHtml).join('')
            : renderEmptyState({ icon: '📝', title: t('customer.placeDetail.noReviewsTitle'), message: t('customer.placeDetail.noReviewsMsg') }))}
        </section>

        ${sourcesSectionHtml(dest)}

        ${related.length ? `
          <section>
            <div class="section-title"><h2>${t('customer.placeDetail.relatedTitle')}</h2></div>
            <div class="h-scroll">${related.map(miniCardHtml).join('')}</div>
          </section>
        ` : ''}
      </div>
    </div>
  `;

  initAccordion(container);

  qs('#pd-back-btn', container).addEventListener('click', () => {
    NavHistory.goBack('#/trail/explore');
  });

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
    btn.textContent = active ? t('customer.placeDetail.saved') : t('customer.placeDetail.savePlace');
    NotificationService.notify(active ? t('customer.placeDetail.savedNotify') : t('customer.placeDetail.unsavedNotify'), 'success');
  });

  qs('#pd-review-btn', container)?.addEventListener('click', () => {
    openReviewModal(dest.id, reviewableBookingItem.id, () => renderPlaceDetail(container, id));
  });

  qs('#pd-interest-btn', container)?.addEventListener('click', () => {
    NotificationService.notify(t('customer.placeDetail.interestNotify'), 'info');
  });

  qs('#add-itinerary-btn', container).addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const wasActive = btn.dataset.active === 'true';
    const destName = localizedDestinationName(dest);
    if (wasActive) {
      // Bấm lại khi đã thêm: cho chọn mở giỏ hành trình hoặc gỡ khỏi giỏ (PHASE mục 3.6).
      confirmDialog({
        title: t('customer.placeDetail.inCartTitle'),
        message: t('customer.placeDetail.inCartMsg', { name: destName }),
        confirmLabel: t('customer.placeDetail.openCart'),
        cancelLabel: t('customer.placeDetail.removeFromCart'),
      }).then((openCart) => {
        if (openCart) {
          window.location.hash = '#/trail/itinerary';
          return;
        }
        toggleTripCartItem(dest.id);
        btn.dataset.active = 'false';
        btn.textContent = t('customer.placeDetail.addToTrip');
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        NotificationService.notify(t('customer.placeDetail.removedFromCartNotify', { name: destName }), 'info');
      });
      return;
    }
    toggleTripCartItem(dest.id);
    btn.dataset.active = 'true';
    btn.textContent = t('customer.placeDetail.added');
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    NotificationService.notify(t('customer.placeDetail.addedToCartNotify', { name: destName }), 'success');
  });
}
