// Cảm nhận nhanh sau khi khách tự đánh dấu "Đã ghé thăm" một điểm miễn phí trong hành trình —
// mô hình kết hợp sao + tag theo từng nhóm loại hình (không phải một bộ câu hỏi chung cho mọi
// địa điểm). Tách khỏi luồng đánh giá booking (passport.js openReviewModal, yêu cầu bookingItemId).
import { getState, addPlaceImpression } from '../storage.js';
import { escapeHtml, qs, qsa } from '../utils.js';
import { openModal } from '../ui.js';
import { NotificationService } from '../services/notificationService.js';
import { getQuickTags, isLowRating } from './reviewTags.js';

const RATING_LABELS = { 1: 'Không hài lòng', 2: 'Cần cải thiện', 3: 'Bình thường', 4: 'Tốt', 5: 'Hoàn hảo' };

function tagsGridHtml(category, rating) {
  const tags = getQuickTags(category, rating);
  const heading = isLowRating(rating) ? 'Điều gì cần được cải thiện?' : 'Bạn thích điều gì ở đây?';
  return `
    <div>
      <span class="field-label">${escapeHtml(heading)}</span>
      <div class="chip-row" id="impression-tags" style="margin-top:6px;">
        ${tags.map((t) => `<button type="button" class="chip" data-tag="${escapeHtml(t)}" aria-pressed="false">${escapeHtml(t)}</button>`).join('')}
      </div>
    </div>
  `;
}

export function openPlaceImpressionModal({ destinationId, itineraryId, stopKey }, onDone) {
  const state = getState();
  const dest = state.destinations.find((d) => d.id === destinationId);
  const destName = dest ? dest.name : '';
  const selectedTags = new Set();
  let rating = 0;

  const bodyHtml = `
    <div class="flex-col gap-3">
      <p class="text-sm text-muted">Bạn đánh giá trải nghiệm tại <strong>${escapeHtml(destName)}</strong> như thế nào?</p>
      <div class="stars" data-picker="impression-rating" style="cursor:pointer;font-size:2rem;letter-spacing:4px;">
        ${[1, 2, 3, 4, 5].map((n) => `<span data-star="${n}">☆</span>`).join('')}
      </div>
      <p class="text-sm" id="impression-rating-label" style="min-height:1.2em;font-weight:600;"></p>
      <div id="impression-extra" hidden>
        <div id="impression-tags-wrap">${tagsGridHtml(dest ? dest.category : null, 0)}</div>
        <div style="margin-top:10px;">
          <label class="field-label" for="impression-comment">Chia sẻ thêm (không bắt buộc)</label>
          <textarea class="field-input" id="impression-comment" rows="2" placeholder="Cảm nhận của bạn về điểm này..."></textarea>
        </div>
        <div style="margin-top:10px;">
          <span class="field-label">Bạn có muốn giới thiệu địa điểm này cho người khác không?</span>
          <div class="chip-row" style="margin-top:6px;">
            <button type="button" class="chip" data-recommend="yes" aria-pressed="false">👍 Có</button>
            <button type="button" class="chip" data-recommend="no" aria-pressed="false">👎 Không</button>
          </div>
        </div>
      </div>
      <div class="modal__actions" style="justify-content:space-between;">
        <button type="button" class="btn btn-ghost" id="impression-skip">Bỏ qua</button>
        <button type="button" class="btn btn-primary" id="impression-submit" disabled>Gửi</button>
      </div>
    </div>
  `;

  openModal({
    title: 'Cảm nhận chuyến ghé thăm',
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
          label.textContent = RATING_LABELS[rating] || '';
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
        NotificationService.notify('Cảm ơn bạn đã chia sẻ cảm nhận!', 'success');
        if (onDone) onDone(r.impression);
      });
    },
  });
}
