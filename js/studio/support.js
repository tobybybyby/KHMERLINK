import { getState, createProposal, setProposalStatus, requestCpsException, decideCpsException } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';

const PROPOSAL_STATUS_LABELS = {
  draft: ['Nháp', 'badge-demo'],
  sent: ['Đã gửi', 'badge-type'],
  reviewing: ['Đang xem xét', 'badge-type'],
  needs_info: ['Cần bổ sung', 'badge-recognized'],
  approved: ['Chấp thuận', 'badge-free'],
  rejected: ['Chưa chấp thuận', 'badge-recognized'],
};

const CPS_EXC_CATEGORY = [
  { value: 'gia-dinh', label: 'Việc gia đình' },
  { value: 'mua-vu', label: 'Mùa vụ' },
  { value: 'nghi-le', label: 'Nghi lễ' },
];

function proposalCardHtml(p) {
  const [label, cls] = PROPOSAL_STATUS_LABELS[p.status] || [p.status, 'badge-type'];
  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${escapeHtml(p.title)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(p.problem)}</p>
      <p class="text-sm" style="margin:0;">Mong muốn: ${escapeHtml(p.desiredSupport)}</p>
      ${p.proposedBudget ? `<p class="text-sm text-faint" style="margin:0;">Kinh phí đề xuất: ${escapeHtml(p.proposedBudget)}</p>` : ''}
      <div class="text-sm text-faint" style="margin-top:6px;">
        ${p.timeline.map((t) => `${formatDateShort(t.at)} — ${escapeHtml(t.note || t.status)}`).join('<br>')}
      </div>
      ${p.status === 'sent' || p.status === 'reviewing' ? `
        <div class="cta-row" style="margin-top:8px;">
          <button type="button" class="btn btn-accent btn-sm" data-sim-proposal="${p.id}" data-decision="approved">🎭 Mô phỏng: quản lý chấp thuận</button>
          <button type="button" class="btn btn-secondary btn-sm" data-sim-proposal="${p.id}" data-decision="needs_info">🎭 Mô phỏng: yêu cầu bổ sung</button>
        </div>
      ` : ''}
    </div>
  `;
}

function cpsExcCardHtml(e) {
  const map = { pending: ['Chờ xét duyệt', 'badge-demo'], approved: ['Đã duyệt', 'badge-free'], rejected: ['Từ chối', 'badge-recognized'] };
  const [label, cls] = map[e.status] || [e.status, 'badge-type'];
  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${CPS_EXC_CATEGORY.find((c) => c.value === e.category)?.label || e.category}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(e.reason)}</p>
      <p class="text-sm" style="margin:0;">Khoảng thời gian: ${formatDateShort(e.startDate)} – ${formatDateShort(e.endDate)}</p>
      ${e.status === 'pending' ? `
        <div class="cta-row" style="margin-top:8px;">
          <button type="button" class="btn btn-accent btn-sm" data-sim-cps="${e.id}" data-decision="approved">🎭 Mô phỏng: cố vấn/vận hành duyệt</button>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-sim-cps="${e.id}" data-decision="rejected">🎭 Mô phỏng: từ chối</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderSupport(container, hostId) {
  const state = getState();
  const proposals = state.proposals.filter((p) => p.hostId === hostId).slice().reverse();
  const exceptions = state.cpsExceptions.filter((e) => e.hostId === hostId).slice().reverse();

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Hỗ trợ & Đề án</h1>
      <p class="text-sm text-muted">Cổng dữ liệu quản lý (nơi thẩm định đề án thật) và Cổng vận hành (nơi duyệt ngoại lệ CPS thật) sẽ xây ở phase sau — nút "mô phỏng" bên dưới giúp trình diễn đủ luồng ngay bây giờ.</p>
    </div>

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Đề án hỗ trợ</h3>
        <button type="button" class="btn btn-accent btn-sm" id="new-proposal-btn">➕ Gửi đề án mới</button>
      </div>
      <div class="flex-col gap-3" id="proposal-list" style="margin-top:10px;">
        ${proposals.length ? proposals.map(proposalCardHtml).join('') : '<p class="text-sm text-faint">Chưa gửi đề án nào.</p>'}
      </div>
    </section>

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Yêu cầu xem xét ngoại lệ CPS</h3>
        <button type="button" class="btn btn-secondary btn-sm" id="new-cps-exc-btn">➕ Gửi yêu cầu</button>
      </div>
      <p class="text-sm text-faint">Dùng khi có việc gia đình, mùa vụ hoặc nghi lễ ảnh hưởng khả năng đón khách — khi được duyệt, khoảng thời gian này sẽ được loại khỏi kỳ tính CPS.</p>
      <div class="flex-col gap-3" id="cps-exc-list" style="margin-top:10px;">
        ${exceptions.length ? exceptions.map(cpsExcCardHtml).join('') : '<p class="text-sm text-faint">Chưa có yêu cầu nào.</p>'}
      </div>
    </section>
  `;

  qs('#new-proposal-btn', container).addEventListener('click', () => openProposalForm(container, hostId));
  qs('#new-cps-exc-btn', container).addEventListener('click', () => openCpsExceptionForm(container, hostId));

  qsa('[data-sim-proposal]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      setProposalStatus(btn.dataset.simProposal, btn.dataset.decision, btn.dataset.decision === 'approved' ? 'Mô phỏng: quản lý chấp thuận đề án.' : 'Mô phỏng: quản lý yêu cầu bổ sung thông tin.');
      NotificationService.notify('Đã cập nhật trạng thái đề án.', 'success');
      renderSupport(container, hostId);
    });
  });
  qsa('[data-sim-cps]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      decideCpsException(btn.dataset.simCps, btn.dataset.decision, btn.dataset.decision === 'approved' ? 'Mô phỏng: đã duyệt ngoại lệ.' : 'Mô phỏng: từ chối ngoại lệ.');
      NotificationService.notify('Đã cập nhật yêu cầu ngoại lệ CPS.', 'success');
      renderSupport(container, hostId);
    });
  });
}

function openProposalForm(container, hostId) {
  container.insertAdjacentHTML('beforeend', '');
  const formHtml = `
    <section class="card" style="padding:20px;" id="proposal-form-section">
      <h3 style="margin-top:0;">Gửi đề án mới</h3>
      <div class="flex-col gap-3">
        <div><label class="field-label" for="pr-title">Tiêu đề</label><input type="text" class="field-input" id="pr-title"></div>
        <div><label class="field-label" for="pr-problem">Vấn đề gặp phải</label><textarea class="field-input" id="pr-problem" rows="2"></textarea></div>
        <div><label class="field-label" for="pr-support">Hỗ trợ mong muốn</label><textarea class="field-input" id="pr-support" rows="2"></textarea></div>
        <div><label class="field-label" for="pr-benefit">Lợi ích dự kiến</label><textarea class="field-input" id="pr-benefit" rows="2"></textarea></div>
        <div><label class="field-label" for="pr-evidence">Minh chứng</label><textarea class="field-input" id="pr-evidence" rows="2" placeholder="Mô tả minh chứng (ảnh đính kèm chưa hỗ trợ trong demo)"></textarea></div>
        <div><label class="field-label" for="pr-budget">Kinh phí đề xuất (tuỳ chọn)</label><input type="text" class="field-input" id="pr-budget"></div>
        <div class="cta-row">
          <button type="button" class="btn btn-secondary" id="pr-save-draft">Lưu nháp</button>
          <button type="button" class="btn btn-primary" id="pr-send">Gửi đề án</button>
        </div>
      </div>
    </section>
  `;
  const target = qs('#proposal-list', container).closest('section');
  target.insertAdjacentHTML('afterend', formHtml);
  const section = qs('#proposal-form-section', container);
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });

  function collect() {
    return {
      hostId,
      title: qs('#pr-title', section).value.trim(),
      problem: qs('#pr-problem', section).value.trim(),
      desiredSupport: qs('#pr-support', section).value.trim(),
      expectedBenefit: qs('#pr-benefit', section).value.trim(),
      evidence: qs('#pr-evidence', section).value.trim(),
      proposedBudget: qs('#pr-budget', section).value.trim() || null,
    };
  }

  qs('#pr-save-draft', section).addEventListener('click', () => {
    const data = collect();
    if (!data.title) { NotificationService.notify('Nhập tiêu đề trước khi lưu.', 'error'); return; }
    createProposal({ ...data, status: 'draft' });
    NotificationService.notify('Đã lưu nháp đề án.', 'success');
    renderSupport(container, hostId);
  });
  qs('#pr-send', section).addEventListener('click', () => {
    const data = collect();
    if (!data.title || !data.problem || !data.desiredSupport) { NotificationService.notify('Cần nhập tiêu đề, vấn đề và hỗ trợ mong muốn.', 'error'); return; }
    createProposal({ ...data, status: 'sent' });
    NotificationService.notify('Đã gửi đề án.', 'success');
    renderSupport(container, hostId);
  });
}

function openCpsExceptionForm(container, hostId) {
  const formHtml = `
    <section class="card" style="padding:20px;" id="cps-exc-form-section">
      <h3 style="margin-top:0;">Gửi yêu cầu ngoại lệ CPS</h3>
      <div class="flex-col gap-3">
        <div>
          <label class="field-label" for="ce-category">Lý do</label>
          <select class="field-select" id="ce-category">${CPS_EXC_CATEGORY.map((c) => `<option value="${c.value}">${escapeHtml(c.label)}</option>`).join('')}</select>
        </div>
        <div><label class="field-label" for="ce-reason">Mô tả cụ thể</label><textarea class="field-input" id="ce-reason" rows="2"></textarea></div>
        <div class="quick-facts">
          <div><label class="field-label" for="ce-start">Từ ngày</label><input type="date" class="field-input" id="ce-start"></div>
          <div><label class="field-label" for="ce-end">Đến ngày</label><input type="date" class="field-input" id="ce-end"></div>
        </div>
        <button type="button" class="btn btn-primary" id="ce-send" style="align-self:flex-start;">Gửi yêu cầu</button>
      </div>
    </section>
  `;
  const target = qs('#cps-exc-list', container).closest('section');
  target.insertAdjacentHTML('afterend', formHtml);
  const section = qs('#cps-exc-form-section', container);
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });

  qs('#ce-send', section).addEventListener('click', () => {
    const category = qs('#ce-category', section).value;
    const reason = qs('#ce-reason', section).value.trim();
    const startDate = qs('#ce-start', section).value;
    const endDate = qs('#ce-end', section).value;
    if (!reason || !startDate || !endDate) { NotificationService.notify('Điền đầy đủ lý do và khoảng thời gian.', 'error'); return; }
    requestCpsException({ hostId, reason, category, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() });
    NotificationService.notify('Đã gửi yêu cầu ngoại lệ CPS.', 'success');
    renderSupport(container, hostId);
  });
}
