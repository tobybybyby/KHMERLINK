import { getState, reviewExperience } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';

const STATUS_LABELS = {
  draft: ['Nháp', 'badge-demo'],
  pending_review: ['Chờ duyệt', 'badge-type'],
  published: ['Đã công bố', 'badge-free'],
};

export function renderOpsContent(container) {
  const state = getState();
  const pending = state.experiences.filter((e) => e.status === 'pending_review');
  const counts = state.experiences.reduce((acc, e) => { const s = e.status || 'published'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const log = state.moderationRecords.slice().reverse().slice(0, 20);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Kiểm duyệt nội dung</h1>
      <p class="text-sm text-muted">Hàng chờ duyệt listing/trải nghiệm: bản nháp → chờ hộ/cộng đồng duyệt → được duyệt → công bố. Mỗi hành động được ghi lại ai làm gì, khi nào.</p>
    </div>

    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">Nháp</span><span class="quick-fact__value">${counts.draft || 0}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Chờ duyệt</span><span class="quick-fact__value">${counts.pending_review || 0}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đã công bố</span><span class="quick-fact__value">${counts.published || 0}</span></div>
    </div>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Đang chờ duyệt</h3>
      ${pending.length ? `
        <div class="flex-col gap-3" style="margin-top:10px;">
          ${pending.map((exp) => {
            const dest = state.destinations.find((d) => d.id === exp.destinationId);
            const host = state.hosts.find((h) => h.id === exp.hostId);
            return `
              <div class="activity-card" data-exp="${exp.id}">
                <div class="activity-card__head">
                  <strong>${escapeHtml(exp.title)}</strong>
                  <span class="badge badge-type">Chờ duyệt</span>
                </div>
                <p class="text-sm text-muted" style="margin:0;">Hộ: ${escapeHtml(host?.name || exp.hostId)} · Địa điểm: ${escapeHtml(dest?.name || '—')}</p>
                <p class="text-sm" style="margin:4px 0;">${escapeHtml(exp.description || '(chưa có mô tả)')}</p>
                <div class="cta-row" style="margin-top:8px;">
                  <button type="button" class="btn btn-primary btn-sm" data-act="approved">✓ Duyệt & công bố</button>
                  <button type="button" class="btn btn-secondary btn-sm" data-act="needs_changes">Yêu cầu chỉnh sửa</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Không có nội dung nào đang chờ duyệt.</p>'}
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Nhật ký kiểm duyệt</h3>
      ${log.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>Thời gian</th><th>Nội dung</th><th>Hành động</th><th>Ghi chú</th></tr></thead>
          <tbody>${log.map((r) => {
            const exp = state.experiences.find((e) => e.id === r.targetId);
            return `<tr><td>${formatDateShort(r.at)}</td><td>${escapeHtml(exp?.title || r.targetId)}</td><td>${r.action === 'approved' ? 'Đã duyệt' : 'Yêu cầu chỉnh sửa'}</td><td>${escapeHtml(r.note || '—')}</td></tr>`;
          }).join('')}</tbody>
        </table>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa có hành động kiểm duyệt nào.</p>'}
    </section>
  `;

  qsa('[data-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const expId = btn.closest('[data-exp]').dataset.exp;
      const decision = btn.dataset.act;
      if (decision === 'approved') {
        reviewExperience(expId, 'approved', 'Nội dung phù hợp, đã duyệt công bố.');
        NotificationService.notify('Đã duyệt — nội dung hiện công bố cho khách.', 'success');
        renderOpsContent(container);
        return;
      }
      const close = openModal({
        title: 'Yêu cầu chỉnh sửa',
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="content-note">Cần chỉnh sửa gì?</label>
            <textarea class="field-input" id="content-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="content-confirm">Gửi yêu cầu</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#content-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#content-note', modalEl).value.trim();
            if (!note) { NotificationService.notify('Nhập nội dung cần chỉnh sửa.', 'error'); return; }
            reviewExperience(expId, 'needs_changes', note);
            closeFn();
            NotificationService.notify('Đã chuyển về nháp cho hộ chỉnh sửa lại.', 'info');
            renderOpsContent(container);
          });
        },
      });
      if (!close) return;
    });
  });
}
