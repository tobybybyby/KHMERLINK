import { getState, setProposalStatus } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';
import { adminFilters, filterBarHtml, wireFilterBar, destinationInScope } from './filters.js';

const STATUS_LABELS = {
  draft: ['Nháp (chưa gửi)', 'badge-demo'],
  sent: ['Đã gửi', 'badge-type'],
  reviewing: ['Đang xem xét', 'badge-type'],
  needs_info: ['Cần bổ sung', 'badge-recognized'],
  approved: ['Chấp thuận', 'badge-free'],
  rejected: ['Chưa chấp thuận', 'badge-recognized'],
};

let filterStatus = '';

function proposalsInScope(state) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - adminFilters.months);
  return state.proposals.filter((p) => {
    if (p.status === 'draft') return false; // hộ chưa gửi thì quản lý chưa thấy
    if (new Date(p.createdAt) < cutoff) return false;
    const host = state.hosts.find((h) => h.id === p.hostId);
    const dest = host && state.destinations.find((d) => d.id === host.destinationId);
    return destinationInScope(dest);
  });
}

function proposalCardHtml(state, p) {
  const [label, cls] = STATUS_LABELS[p.status] || [p.status, 'badge-type'];
  const host = state.hosts.find((h) => h.id === p.hostId);
  return `
    <div class="activity-card" data-proposal="${p.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(p.title)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">Hộ: ${escapeHtml(host?.name || p.hostId)}</p>
      <p class="text-sm" style="margin:4px 0;"><strong>Vấn đề:</strong> ${escapeHtml(p.problem)}</p>
      <p class="text-sm" style="margin:0;"><strong>Hỗ trợ mong muốn:</strong> ${escapeHtml(p.desiredSupport)}</p>
      <p class="text-sm" style="margin:0;"><strong>Lợi ích dự kiến:</strong> ${escapeHtml(p.expectedBenefit || '—')}</p>
      <p class="text-sm" style="margin:0;"><strong>Minh chứng:</strong> ${escapeHtml(p.evidence || '—')}</p>
      ${p.proposedBudget ? `<p class="text-sm text-faint" style="margin:0;">Kinh phí đề xuất: ${escapeHtml(p.proposedBudget)}</p>` : ''}
      <div class="text-sm text-faint" style="margin-top:6px;">
        ${p.timeline.map((t) => `${formatDateShort(t.at)} — ${escapeHtml(t.note || t.status)}`).join('<br>')}
      </div>
      ${p.status === 'sent' || p.status === 'reviewing' || p.status === 'needs_info' ? `
        <div class="cta-row" style="margin-top:8px;">
          ${p.status === 'sent' ? `<button type="button" class="btn btn-secondary btn-sm" data-act="reviewing">Đánh dấu đang xem xét</button>` : ''}
          <button type="button" class="btn btn-secondary btn-sm" data-act="needs_info">Yêu cầu bổ sung</button>
          <button type="button" class="btn btn-primary btn-sm" data-act="approved">Chấp thuận</button>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-act="rejected">Từ chối</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderAdminProposals(container) {
  const state = getState();
  const inScope = proposalsInScope(state).filter((p) => !filterStatus || p.status === filterStatus).slice().reverse();

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Hộp thư đề án</h1>
      <p class="text-sm text-muted">Lọc, xem hồ sơ, yêu cầu bổ sung và cập nhật kết quả — phản hồi đồng bộ ngay về Studio của hộ (dùng chung một dữ liệu, không cần đồng bộ thủ công).</p>
    </div>
    ${filterBarHtml(state)}

    <div class="explore-toolbar" style="background:transparent;border:none;padding:0;">
      <select class="field-select" id="proposal-status-filter" style="max-width:220px;">
        <option value="">Tất cả trạng thái</option>
        ${Object.entries(STATUS_LABELS).filter(([k]) => k !== 'draft').map(([k, [l]]) => `<option value="${k}" ${filterStatus === k ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}
      </select>
    </div>

    <div class="flex-col gap-3">
      ${inScope.length ? inScope.map((p) => proposalCardHtml(state, p)).join('') : '<p class="text-sm text-faint">Không có đề án nào khớp bộ lọc.</p>'}
    </div>
  `;

  wireFilterBar(container, () => renderAdminProposals(container));
  qs('#proposal-status-filter', container).addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderAdminProposals(container);
  });

  qsa('[data-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-proposal]').dataset.proposal;
      const decision = btn.dataset.act;
      if (decision === 'reviewing') {
        setProposalStatus(id, 'reviewing', 'Quản lý đã bắt đầu xem xét đề án.');
        NotificationService.notify('Đã cập nhật trạng thái.', 'success');
        renderAdminProposals(container);
        return;
      }
      const titleMap = { needs_info: 'Yêu cầu bổ sung thông tin', approved: 'Chấp thuận đề án', rejected: 'Từ chối đề án' };
      const requireNote = decision !== 'approved';
      const close = openModal({
        title: titleMap[decision],
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="proposal-note">${decision === 'approved' ? 'Ghi chú (tuỳ chọn)' : 'Nội dung phản hồi cho hộ'}</label>
            <textarea class="field-input" id="proposal-note" rows="3" ${requireNote ? 'required' : ''}></textarea>
            ${decision === 'approved' ? '<p class="text-sm text-faint">Chấp thuận hồ sơ không đồng nghĩa đã cấp vốn — cần các bước giải ngân riêng ngoài phạm vi demo này.</p>' : ''}
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="proposal-confirm">Xác nhận</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#proposal-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#proposal-note', modalEl).value.trim();
            if (requireNote && !note) { NotificationService.notify('Cần nhập nội dung phản hồi cho hộ.', 'error'); return; }
            setProposalStatus(id, decision, note || 'Quản lý đã chấp thuận đề án.');
            closeFn();
            NotificationService.notify('Đã cập nhật đề án — hộ sẽ thấy trạng thái mới trong Studio.', 'success');
            renderAdminProposals(container);
          });
        },
      });
      if (!close) return;
    });
  });
}
