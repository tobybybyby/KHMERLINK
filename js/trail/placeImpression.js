// Cảm nhận nhanh sau khi khách tự đánh dấu "Đã ghé thăm" một điểm miễn phí trong hành trình —
// mô hình kết hợp sao + tag theo từng nhóm loại hình (không phải một bộ câu hỏi chung cho mọi
// địa điểm). Tách khỏi luồng đánh giá booking (passport.js openReviewModal, yêu cầu bookingItemId).
import { getState, addPlaceImpression } from '../storage.js';
import { escapeHtml, qs, qsa } from '../utils.js';
import { openModal } from '../ui.js';
import { NotificationService } from '../services/notificationService.js';
import { getQuickTags, isLowRating } from './reviewTags.js';
import { t, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';
import { localizeTag } from '../services/tagCatalog.js';

registerTranslations('customer', {
  impression: {
    ratingLabel: { 1: 'Không hài lòng', 2: 'Cần cải thiện', 3: 'Bình thường', 4: 'Tốt', 5: 'Hoàn hảo' },
    improveHeading: 'Điều gì cần được cải thiện?',
    likeHeading: 'Bạn thích điều gì ở đây?',
    ratingQuestion: 'Bạn đánh giá trải nghiệm tại {place} như thế nào?',
    shareMore: 'Chia sẻ thêm (không bắt buộc)',
    commentPlaceholder: 'Cảm nhận của bạn về điểm này...',
    recommendQuestion: 'Bạn có muốn giới thiệu địa điểm này cho người khác không?',
    recommendYes: '👍 Có',
    recommendNo: '👎 Không',
    skip: 'Bỏ qua',
    submit: 'Gửi',
    modalTitle: 'Cảm nhận chuyến ghé thăm',
    thankYouNotify: 'Cảm ơn bạn đã chia sẻ cảm nhận!',
  },
}, {
  impression: {
    ratingLabel: { 1: 'Not satisfied', 2: 'Needs improvement', 3: 'Okay', 4: 'Good', 5: 'Excellent' },
    improveHeading: 'What could be improved?',
    likeHeading: 'What did you like here?',
    ratingQuestion: 'How would you rate your experience at {place}?',
    shareMore: 'Share more (optional)',
    commentPlaceholder: 'Your thoughts about this place...',
    recommendQuestion: 'Would you recommend this place to others?',
    recommendYes: '👍 Yes',
    recommendNo: '👎 No',
    skip: 'Skip',
    submit: 'Submit',
    modalTitle: 'Share your visit',
    thankYouNotify: 'Thanks for sharing your impression!',
  },
});

function tagsGridHtml(category, rating) {
  const tags = getQuickTags(category, rating);
  const heading = isLowRating(rating) ? t('customer.impression.improveHeading') : t('customer.impression.likeHeading');
  return `
    <div>
      <span class="field-label">${escapeHtml(heading)}</span>
      <div class="chip-row" id="impression-tags" style="margin-top:6px;">
        ${tags.map((tagId) => `<button type="button" class="chip" data-tag="${escapeHtml(tagId)}" aria-pressed="false">${escapeHtml(localizeTag(tagId))}</button>`).join('')}
      </div>
    </div>
  `;
}

export function openPlaceImpressionModal({ destinationId, itineraryId, stopKey }, onDone) {
  const state = getState();
  const dest = state.destinations.find((d) => d.id === destinationId);
  const destName = dest ? localizedDestinationName(dest) : '';
  const selectedTags = new Set();
  let rating = 0;

  const bodyHtml = `
    <div class="flex-col gap-3">
      <p class="text-sm text-muted">${t('customer.impression.ratingQuestion', { place: `<strong>${escapeHtml(destName)}</strong>` })}</p>
      <div class="stars" data-picker="impression-rating" style="cursor:pointer;font-size:2rem;letter-spacing:4px;">
        ${[1, 2, 3, 4, 5].map((n) => `<span data-star="${n}">☆</span>`).join('')}
      </div>
      <p class="text-sm" id="impression-rating-label" style="min-height:1.2em;font-weight:600;"></p>
      <div id="impression-extra" hidden>
        <div id="impression-tags-wrap">${tagsGridHtml(dest ? dest.category : null, 0)}</div>
        <div style="margin-top:10px;">
          <label class="field-label" for="impression-comment">${t('customer.impression.shareMore')}</label>
          <textarea class="field-input" id="impression-comment" rows="2" placeholder="${t('customer.impression.commentPlaceholder')}"></textarea>
        </div>
        <div style="margin-top:10px;">
          <span class="field-label">${t('customer.impression.recommendQuestion')}</span>
          <div class="chip-row" style="margin-top:6px;">
            <button type="button" class="chip" data-recommend="yes" aria-pressed="false">${t('customer.impression.recommendYes')}</button>
            <button type="button" class="chip" data-recommend="no" aria-pressed="false">${t('customer.impression.recommendNo')}</button>
          </div>
        </div>
      </div>
      <div class="modal__actions" style="justify-content:space-between;">
        <button type="button" class="btn btn-ghost" id="impression-skip">${t('customer.impression.skip')}</button>
        <button type="button" class="btn btn-primary" id="impression-submit" disabled>${t('customer.impression.submit')}</button>
      </div>
    </div>
  `;

  openModal({
    title: t('customer.impression.modalTitle'),
    bodyHtml,
    onMount: (modalEl, closeFn) => {
      const picker = qs('[data-picker="impression-rating"]', modalEl);
      const stars = qsa('[data-star]', picker);
      const extra = qs('#impression-extra', modalEl);
      const label = qs('#impression-rating-label', modalEl);
      const submitBtn = qs('#impression-submit', modalEl);
      let recommend = null;

      function paintStars(val) {
        stars.forEach((s) => { s.textContent = Number(s.dataset.star) <= val ? '★' : '☆'; });
      }

      function rerenderTags() {
        const wrap = qs('#impression-tags-wrap', modalEl);
        wrap.innerHTML = tagsGridHtml(dest ? dest.category : null, rating);
        selectedTags.clear();
        wireTagButtons();
      }

      function wireTagButtons() {
        qsa('#impression-tags [data-tag]', modalEl).forEach((btn) => {
          btn.addEventListener('click', () => {
            const tag = btn.dataset.tag;
            if (selectedTags.has(tag)) { selectedTags.delete(tag); btn.setAttribute('aria-pressed', 'false'); }
            else { selectedTags.add(tag); btn.setAttribute('aria-pressed', 'true'); }
          });
        });
      }

      stars.forEach((s) => {
        s.addEventListener('click', () => {
          const wasLow = isLowRating(rating);
          rating = Number(s.dataset.star);
          paintStars(rating);
          label.textContent = t(`customer.impression.ratingLabel.${rating}`) || '';
          extra.hidden = false;
          submitBtn.disabled = false;
          if (isLowRating(rating) !== wasLow) rerenderTags();
        });
      });

      wireTagButtons();

      qsa('[data-recommend]', modalEl).forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.recommend === 'yes';
          recommend = recommend === val ? null : val;
          qsa('[data-recommend]', modalEl).forEach((b) => b.setAttribute('aria-pressed', String(b === btn && recommend !== null)));
        });
      });

      qs('#impression-skip', modalEl).addEventListener('click', () => {
        closeFn();
        if (onDone) onDone(null);
      });

      submitBtn.addEventListener('click', () => {
        const comment = qs('#impression-comment', modalEl).value.trim();
        const r = addPlaceImpression({
          destinationId, itineraryId, stopKey, rating,
          tags: Array.from(selectedTags), comment, recommend,
        });
        closeFn();
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); if (onDone) onDone(null); return; }
        NotificationService.notify(t('customer.impression.thankYouNotify'), 'success');
        if (onDone) onDone(r.impression);
      });
    },
  });
}
