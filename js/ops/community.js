// Cố vấn cộng đồng: vai trò có QUYỀN HẠN CHẾ hơn Cổng vận hành đầy đủ — chỉ hàng chờ duyệt
// văn hoá và ngoại lệ CPS liên quan đến nghi lễ. Không dùng chung OpsShell (4 tab đầy đủ) để
// tránh ngộ nhận vai trò này có quyền xem booking/giao dịch/dữ liệu khách như Cổng vận hành.
import { getState, reviewExperience, decideCpsException } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';

export function renderCommunityAdvisor(root) {
  const state = getState();
  const pending = state.experiences.filter((e) => e.status === 'pending_review');
  const culturalExceptions = state.cpsExceptions.filter((e) => e.category === 'nghi-le').slice().reverse();

  root.innerHTML = `
    <div class="page-generic">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🤝 Cố vấn cộng đồng</a>
        <div class="trail-topbar__spacer"></div>
        <a class="trail-topbar__back" href="#/gateway">← Cổng quản lý</a>
      </header>
      <div class="coming-soon" style="max-width:720px;margin:0 auto;padding:20px;">
        <div class="card" style="padding:16px;background:var(--color-primary-soft);">
          <strong>Quyền hạn chế:</strong>
          <p class="text-sm" style="margin:4px 0 0;">Vai trò này chỉ xem hàng chờ duyệt nội dung văn hoá và ngoại lệ CPS liên quan đến nghi lễ — <strong>không</strong> có quyền xem booking, giao dịch, ticket hay dữ liệu khách của hộ (khác với Cổng vận hành đầy đủ).</p>
        </div>

        <section class="card" style="padding:20px;margin-top:16px;">
          <h3 style="margin-top:0;">Hàng chờ duyệt nội dung văn hoá</h3>
          ${pending.length ? `
            <div class="flex-col gap-3" style="margin-top:10px;">
              ${pending.map((exp) => {
                const dest = state.destinations.find((d) => d.id === exp.destinationId);
                return `
                  <div class="activity-card" data-exp="${exp.id}">
                    <div class="activity-card__head"><strong>${escapeHtml(exp.title)}</strong><span class="badge badge-type">Chờ duyệt</span></div>
                    <p class="text-sm text-muted" style="margin:0;">Địa điểm: ${escapeHtml(dest?.name || '—')}</p>
                    <p class="text-sm" style="margin:4px 0;">${escapeHtml(exp.description || '(chưa có mô tả)')}</p>
                    <div class="cta-row" style="margin-top:8px;">
                      <button type="button" class="btn btn-primary btn-sm" data-act="approved">✓ Duyệt</button>
                      <button type="button" class="btn btn-secondary btn-sm" data-act="needs_changes">Yêu cầu chỉnh sửa</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : '<p class="text-sm text-faint" style="margin-top:10px;">Không có nội dung nào đang chờ duyệt.</p>'}
        </section>

        <section class="card" style="padding:20px;margin-top:16px;">
          <h3 style="margin-top:0;">Ngoại lệ CPS liên quan nghi lễ</h3>
          ${culturalExceptions.length ? `
            <div class="flex-col gap-3" style="margin-top:10px;">
              ${culturalExceptions.map((e) => {
                const host = state.hosts.find((h) => h.id === e.hostId);
                const map = { pending: ['Chờ xét duyệt', 'badge-demo'], approved: ['Đã duyệt', 'badge-free'], rejected: ['Từ chối', 'badge-recognized'] };
                const [label, cls] = map[e.status] || [e.status, 'badge-type'];
                return `
                  <div class="activity-card" data-cps-exc="${e.id}">
                    <div class="activity-card__head"><strong>${escapeHtml(host?.name || e.hostId)}</strong><span class="badge ${cls}">${escapeHtml(label)}</span></div>
                    <p class="text-sm text-muted" style="margin:0;">${escapeHtml(e.reason)}</p>
                    <p class="text-sm" style="margin:0;">Khoảng thời gian: ${formatDateShort(e.startDate)} – ${formatDateShort(e.endDate)}</p>
                    ${e.status === 'pending' ? `
                      <div class="cta-row" style="margin-top:8px;">
                        <button type="button" class="btn btn-primary btn-sm" data-cps-act="approved">Duyệt</button>
                        <button type="button" class="btn btn-danger-ghost btn-sm" data-cps-act="rejected">Từ chối</button>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa có yêu cầu ngoại lệ nào thuộc phạm vi nghi lễ.</p>'}
        </section>
      </div>
    </div>
  `;

  qsa('[data-act]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const expId = btn.closest('[data-exp]').dataset.exp;
      const decision = btn.dataset.act;
      if (decision === 'approved') {
        reviewExperience(expId, 'approved', 'Cố vấn cộng đồng đã duyệt nội dung văn hoá.');
        NotificationService.notify('Đã duyệt.', 'success');
        renderCommunityAdvisor(root);
        return;
      }
      const close = openModal({
        title: 'Yêu cầu chỉnh sửa',
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="ca-note">Cần chỉnh sửa gì?</label>
            <textarea class="field-input" id="ca-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="ca-confirm">Gửi yêu cầu</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#ca-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#ca-note', modalEl).value.trim();
            if (!note) { NotificationService.notify('Nhập nội dung cần chỉnh sửa.', 'error'); return; }
            reviewExperience(expId, 'needs_changes', note);
            closeFn();
            NotificationService.notify('Đã chuyển về nháp cho hộ chỉnh sửa lại.', 'info');
            renderCommunityAdvisor(root);
          });
        },
      });
      if (!close) return;
    });
  });

  qsa('[data-cps-act]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-cps-exc]').dataset.cpsExc;
      const decision = btn.dataset.cpsAct;
      decideCpsException(id, decision, decision === 'approved' ? 'Cố vấn cộng đồng đã duyệt ngoại lệ.' : 'Cố vấn cộng đồng từ chối ngoại lệ.');
      NotificationService.notify('Đã cập nhật.', 'success');
      renderCommunityAdvisor(root);
    });
  });
}
