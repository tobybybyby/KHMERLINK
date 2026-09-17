import { getState, createProposal, updateProposal, setProposalStatus, requestCpsException } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { t, localize, localizeList, registerTranslations } from '../services/i18nService.js';

registerTranslations('host', {
  support: {
    status: {
      draft: 'Nháp', sent: 'Đã gửi', pending_review: 'Chờ duyệt', reviewing: 'Đang xem xét', in_review: 'Đang xem xét',
      needs_info: 'Cần bổ sung', needs_revision: 'Cần bổ sung', approved: 'Chấp thuận', rejected: 'Chưa chấp thuận',
    },
    cpsCategory: { 'gia-dinh': 'Việc gia đình', 'mua-vu': 'Mùa vụ', 'nghi-le': 'Nghi lễ' },
    cpsExcStatus: { pending: 'Chờ xét duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' },
    requestedChangeLabel: 'Yêu cầu thay đổi: {value}',
    evidenceLabel: 'Bằng chứng: {list}',
    budgetLabel: 'Kinh phí đề xuất: {value}',
    awaitingReview: 'Đang chờ Cổng quản lý xem xét.',
    updateAndResend: '✏️ Cập nhật & gửi lại',
    updateAndResendPlain: 'Cập nhật & gửi lại',
    period: 'Khoảng thời gian: {from} – {to}',
    awaitingOpsReview: 'Đang chờ Cổng vận hành/cố vấn cộng đồng xét duyệt.',
    title: 'Hỗ trợ & Đề án',
    subtitle: 'Đề án được Cổng dữ liệu quản lý xem xét và ngoại lệ CPS được Cổng vận hành/cố vấn cộng đồng duyệt thật — trạng thái cập nhật ở đây ngay khi họ xử lý, dùng chung một dữ liệu.',
    proposalsTitle: 'Đề án hỗ trợ',
    newProposal: '➕ Gửi đề án mới',
    noProposals: 'Chưa gửi đề án nào.',
    cpsExcTitle: 'Yêu cầu xem xét ngoại lệ CPS',
    newRequest: '➕ Gửi yêu cầu',
    cpsExcDesc: 'Dùng khi có việc gia đình, mùa vụ hoặc nghi lễ ảnh hưởng khả năng đón khách — khi được duyệt, khoảng thời gian này sẽ được loại khỏi kỳ tính CPS.',
    noRequests: 'Chưa có yêu cầu nào.',
    updateProposalTitle: 'Cập nhật đề án',
    sendNewProposal: 'Gửi đề án mới',
    lastManagerFeedback: 'Phản hồi gần nhất từ quản lý: {note}',
    proposalTitleLabel: 'Tiêu đề',
    problemLabel: 'Vấn đề gặp phải',
    supportLabel: 'Hỗ trợ mong muốn',
    benefitLabel: 'Lợi ích dự kiến',
    evidenceFieldLabel: 'Minh chứng',
    evidencePlaceholder: 'Mô tả minh chứng (ảnh đính kèm chưa hỗ trợ trong demo)',
    budgetFieldLabel: 'Kinh phí đề xuất (tuỳ chọn)',
    saveDraft: 'Lưu nháp',
    sendProposal: 'Gửi đề án',
    enterTitleFirst: 'Nhập tiêu đề trước khi lưu.',
    draftSaved: 'Đã lưu nháp đề án.',
    needTitleProblemSupport: 'Cần nhập tiêu đề, vấn đề và hỗ trợ mong muốn.',
    updatedAndResentNote: 'Hộ đã cập nhật và gửi lại đề án.',
    updatedAndResentNotify: 'Đã cập nhật và gửi lại đề án.',
    sentNotify: 'Đã gửi đề án.',
    sendCpsExcTitle: 'Gửi yêu cầu ngoại lệ CPS',
    reasonLabel: 'Lý do',
    specificDescLabel: 'Mô tả cụ thể',
    fromDate: 'Từ ngày',
    toDate: 'Đến ngày',
    sendRequest: 'Gửi yêu cầu',
    fillReasonAndPeriod: 'Điền đầy đủ lý do và khoảng thời gian.',
    cpsRequestSentNotify: 'Đã gửi yêu cầu ngoại lệ CPS.',
  },
}, {
  support: {
    status: {
      draft: 'Draft', sent: 'Sent', pending_review: 'Pending Review', reviewing: 'Under Review', in_review: 'Under Review',
      needs_info: 'Needs More Info', needs_revision: 'Needs More Info', approved: 'Approved', rejected: 'Not Approved',
    },
    cpsCategory: { 'gia-dinh': 'Family matter', 'mua-vu': 'Seasonal', 'nghi-le': 'Ritual/ceremony' },
    cpsExcStatus: { pending: 'Awaiting review', approved: 'Approved', rejected: 'Rejected' },
    requestedChangeLabel: 'Requested change: {value}',
    evidenceLabel: 'Evidence: {list}',
    budgetLabel: 'Proposed budget: {value}',
    awaitingReview: 'Awaiting review by the Management Portal.',
    updateAndResend: '✏️ Update & resend',
    updateAndResendPlain: 'Update & resend',
    period: 'Period: {from} – {to}',
    awaitingOpsReview: 'Awaiting review by the Operations Portal/community advisor.',
    title: 'Support & Proposals',
    subtitle: 'Proposals are reviewed by the Management Data Portal and CPS exceptions are approved by the Operations Portal/community advisor — status updates here as soon as they are processed, using shared data.',
    proposalsTitle: 'Support proposals',
    newProposal: '➕ Submit new proposal',
    noProposals: 'No proposals submitted yet.',
    cpsExcTitle: 'CPS exception review requests',
    newRequest: '➕ Submit request',
    cpsExcDesc: 'Use this when a family matter, seasonal issue or ritual affects your ability to host guests — once approved, this period is excluded from the CPS calculation.',
    noRequests: 'No requests yet.',
    updateProposalTitle: 'Update proposal',
    sendNewProposal: 'Submit new proposal',
    lastManagerFeedback: 'Latest feedback from management: {note}',
    proposalTitleLabel: 'Title',
    problemLabel: 'Problem encountered',
    supportLabel: 'Support needed',
    benefitLabel: 'Expected benefit',
    evidenceFieldLabel: 'Evidence',
    evidencePlaceholder: 'Describe the evidence (image attachments not yet supported in the demo)',
    budgetFieldLabel: 'Proposed budget (optional)',
    saveDraft: 'Save draft',
    sendProposal: 'Submit proposal',
    enterTitleFirst: 'Enter a title before saving.',
    draftSaved: 'Proposal draft saved.',
    needTitleProblemSupport: 'A title, problem and desired support are required.',
    updatedAndResentNote: 'The provider updated and resubmitted the proposal.',
    updatedAndResentNotify: 'Proposal updated and resubmitted.',
    sentNotify: 'Proposal submitted.',
    sendCpsExcTitle: 'Submit a CPS exception request',
    reasonLabel: 'Reason',
    specificDescLabel: 'Specific description',
    fromDate: 'From date',
    toDate: 'To date',
    sendRequest: 'Submit request',
    fillReasonAndPeriod: 'Fill in the reason and the period.',
    cpsRequestSentNotify: 'CPS exception request submitted.',
  },
});

function getCpsExcCategories() {
  return [
    { value: 'gia-dinh', label: t('host.support.cpsCategory.gia-dinh') },
    { value: 'mua-vu', label: t('host.support.cpsCategory.mua-vu') },
    { value: 'nghi-le', label: t('host.support.cpsCategory.nghi-le') },
  ];
}

function proposalCardHtml(p) {
  const label = t(`host.support.status.${p.status}`) || p.status;
  const cls = { draft: 'badge-demo', sent: 'badge-type', pending_review: 'badge-type', reviewing: 'badge-type', in_review: 'badge-type', needs_info: 'badge-recognized', needs_revision: 'badge-recognized', approved: 'badge-free', rejected: 'badge-recognized' }[p.status] || 'badge-type';
  const evidenceRaw = p.evidence;
  const evidenceList = Array.isArray(evidenceRaw) ? evidenceRaw : localizeList(evidenceRaw, evidenceRaw ? [evidenceRaw] : []);
  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${escapeHtml(localize(p.title))}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(localize(p.summary) || localize(p.problem) || '')}</p>
      <p class="text-sm" style="margin:0;">${t('host.support.requestedChangeLabel', { value: escapeHtml(localize(p.requestedChange) || localize(p.desiredSupport) || '') })}</p>
      ${evidenceList.length ? `<p class="text-sm text-faint" style="margin:0;">${t('host.support.evidenceLabel', { list: evidenceList.map(escapeHtml).join(' · ') })}</p>` : ''}
      ${p.proposedBudget ? `<p class="text-sm text-faint" style="margin:0;">${t('host.support.budgetLabel', { value: escapeHtml(p.proposedBudget) })}</p>` : ''}
      <div class="text-sm text-faint" style="margin-top:6px;">
        ${(p.timeline || []).map((tl) => `${formatDateShort(tl.at)} — ${escapeHtml(tl.note || tl.status)}`).join('<br>')}
      </div>
      ${p.status === 'sent' || p.status === 'pending_review' || p.status === 'reviewing' || p.status === 'in_review' ? `
        <p class="text-sm text-faint" style="margin-top:8px;">${t('host.support.awaitingReview')}</p>
      ` : ''}
      ${p.status === 'needs_info' || p.status === 'needs_revision' ? `
        <div class="cta-row" style="margin-top:8px;">
          <button type="button" class="btn btn-primary btn-sm" data-update-proposal="${p.id}">${t('host.support.updateAndResend')}</button>
        </div>
      ` : ''}
    </div>
  `;
}

function cpsExcCardHtml(e) {
  const label = t(`host.support.cpsExcStatus.${e.status}`) || e.status;
  const cls = { pending: 'badge-demo', approved: 'badge-free', rejected: 'badge-recognized' }[e.status] || 'badge-type';
  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${getCpsExcCategories().find((c) => c.value === e.category)?.label || e.category}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(e.reason)}</p>
      <p class="text-sm" style="margin:0;">${t('host.support.period', { from: formatDateShort(e.startDate), to: formatDateShort(e.endDate) })}</p>
      ${e.status === 'pending' ? `<p class="text-sm text-faint" style="margin-top:8px;">${t('host.support.awaitingOpsReview')}</p>` : ''}
    </div>
  `;
}

export function renderSupport(container, hostId) {
  const state = getState();
  const proposals = state.proposals.filter((p) => p.hostId === hostId).slice().reverse();
  const exceptions = state.cpsExceptions.filter((e) => e.hostId === hostId).slice().reverse();

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">${t('host.support.title')}</h1>
      <p class="text-sm text-muted">${t('host.support.subtitle')}</p>
    </div>

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">${t('host.support.proposalsTitle')}</h3>
        <button type="button" class="btn btn-accent btn-sm" id="new-proposal-btn">${t('host.support.newProposal')}</button>
      </div>
      <div class="flex-col gap-3" id="proposal-list" style="margin-top:10px;">
        ${proposals.length ? proposals.map(proposalCardHtml).join('') : `<p class="text-sm text-faint">${t('host.support.noProposals')}</p>`}
      </div>
    </section>

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">${t('host.support.cpsExcTitle')}</h3>
        <button type="button" class="btn btn-secondary btn-sm" id="new-cps-exc-btn">${t('host.support.newRequest')}</button>
      </div>
      <p class="text-sm text-faint">${t('host.support.cpsExcDesc')}</p>
      <div class="flex-col gap-3" id="cps-exc-list" style="margin-top:10px;">
        ${exceptions.length ? exceptions.map(cpsExcCardHtml).join('') : `<p class="text-sm text-faint">${t('host.support.noRequests')}</p>`}
      </div>
    </section>
  `;

  qs('#new-proposal-btn', container).addEventListener('click', () => openProposalForm(container, hostId));
  qs('#new-cps-exc-btn', container).addEventListener('click', () => openCpsExceptionForm(container, hostId));

  qsa('[data-update-proposal]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const proposal = state.proposals.find((p) => p.id === btn.dataset.updateProposal);
      openProposalForm(container, hostId, proposal);
    });
  });
}

function openProposalForm(container, hostId, existing) {
  const isEdit = !!existing;
  const formHtml = `
    <section class="card" style="padding:20px;" id="proposal-form-section">
      <h3 style="margin-top:0;">${isEdit ? t('host.support.updateProposalTitle') : t('host.support.sendNewProposal')}</h3>
      ${isEdit && existing.timeline.length ? `<p class="text-sm text-muted">${t('host.support.lastManagerFeedback', { note: escapeHtml(localize(existing.timeline[existing.timeline.length - 1].note) || '') })}</p>` : ''}
      <div class="flex-col gap-3">
        <div><label class="field-label" for="pr-title">${t('host.support.proposalTitleLabel')}</label><input type="text" class="field-input" id="pr-title" value="${escapeHtml(localize(existing?.title) || '')}"></div>
        <div><label class="field-label" for="pr-problem">${t('host.support.problemLabel')}</label><textarea class="field-input" id="pr-problem" rows="2">${escapeHtml(localize(existing?.problem) || localize(existing?.summary) || '')}</textarea></div>
        <div><label class="field-label" for="pr-support">${t('host.support.supportLabel')}</label><textarea class="field-input" id="pr-support" rows="2">${escapeHtml(localize(existing?.desiredSupport) || localize(existing?.requestedChange) || '')}</textarea></div>
        <div><label class="field-label" for="pr-benefit">${t('host.support.benefitLabel')}</label><textarea class="field-input" id="pr-benefit" rows="2">${escapeHtml(localize(existing?.expectedBenefit) || localize(existing?.expectedImpact) || '')}</textarea></div>
        <div><label class="field-label" for="pr-evidence">${t('host.support.evidenceFieldLabel')}</label><textarea class="field-input" id="pr-evidence" rows="2" placeholder="${t('host.support.evidencePlaceholder')}">${escapeHtml((() => { const ev = existing?.evidence; if (!ev) return ''; const list = Array.isArray(ev) ? ev : localizeList(ev, [ev]); return list.join('; '); })())}</textarea></div>
        <div><label class="field-label" for="pr-budget">${t('host.support.budgetFieldLabel')}</label><input type="text" class="field-input" id="pr-budget" value="${escapeHtml(existing?.proposedBudget || '')}"></div>
        <div class="cta-row">
          ${isEdit ? '' : `<button type="button" class="btn btn-secondary" id="pr-save-draft">${t('host.support.saveDraft')}</button>`}
          <button type="button" class="btn btn-primary" id="pr-send">${isEdit ? t('host.support.updateAndResendPlain') : t('host.support.sendProposal')}</button>
        </div>
      </div>
    </section>
  `;
  const target = qs('#proposal-list', container).closest('section');
  target.insertAdjacentHTML('afterend', formHtml);
  const section = qs('#proposal-form-section', container);
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });

  function collect() {
    const problem = qs('#pr-problem', section).value.trim();
    const desiredSupport = qs('#pr-support', section).value.trim();
    const expectedBenefit = qs('#pr-benefit', section).value.trim();
    const evidence = qs('#pr-evidence', section).value.trim();
    return {
      hostId,
      providerId: hostId,
      title: qs('#pr-title', section).value.trim(),
      problem, desiredSupport, expectedBenefit, evidence,
      // Ghi cả tên field mới để thẻ (proposalCardHtml ở đây + admin/proposals.js) luôn hiện đúng
      // bản mới nhất — tránh 1 đề án cũ hiện lẫn nội dung cũ/mới sau khi chỉnh sửa.
      summary: problem,
      requestedChange: desiredSupport,
      expectedImpact: expectedBenefit,
      proposedBudget: qs('#pr-budget', section).value.trim() || null,
    };
  }

  qs('#pr-save-draft', section)?.addEventListener('click', () => {
    const data = collect();
    if (!data.title) { NotificationService.notify(t('host.support.enterTitleFirst'), 'error'); return; }
    createProposal({ ...data, status: 'draft' });
    NotificationService.notify(t('host.support.draftSaved'), 'success');
    renderSupport(container, hostId);
  });
  qs('#pr-send', section).addEventListener('click', () => {
    const data = collect();
    if (!data.title || !data.problem || !data.desiredSupport) { NotificationService.notify(t('host.support.needTitleProblemSupport'), 'error'); return; }
    if (isEdit) {
      updateProposal(existing.id, data);
      setProposalStatus(existing.id, 'sent', t('host.support.updatedAndResentNote'));
      NotificationService.notify(t('host.support.updatedAndResentNotify'), 'success');
    } else {
      createProposal({ ...data, status: 'sent' });
      NotificationService.notify(t('host.support.sentNotify'), 'success');
    }
    renderSupport(container, hostId);
  });
}

function openCpsExceptionForm(container, hostId) {
  const formHtml = `
    <section class="card" style="padding:20px;" id="cps-exc-form-section">
      <h3 style="margin-top:0;">${t('host.support.sendCpsExcTitle')}</h3>
      <div class="flex-col gap-3">
        <div>
          <label class="field-label" for="ce-category">${t('host.support.reasonLabel')}</label>
          <select class="field-select" id="ce-category">${getCpsExcCategories().map((c) => `<option value="${c.value}">${escapeHtml(c.label)}</option>`).join('')}</select>
        </div>
        <div><label class="field-label" for="ce-reason">${t('host.support.specificDescLabel')}</label><textarea class="field-input" id="ce-reason" rows="2"></textarea></div>
        <div class="quick-facts">
          <div><label class="field-label" for="ce-start">${t('host.support.fromDate')}</label><input type="date" class="field-input" id="ce-start"></div>
          <div><label class="field-label" for="ce-end">${t('host.support.toDate')}</label><input type="date" class="field-input" id="ce-end"></div>
        </div>
        <button type="button" class="btn btn-primary" id="ce-send" style="align-self:flex-start;">${t('host.support.sendRequest')}</button>
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
    if (!reason || !startDate || !endDate) { NotificationService.notify(t('host.support.fillReasonAndPeriod'), 'error'); return; }
    requestCpsException({ hostId, reason, category, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() });
    NotificationService.notify(t('host.support.cpsRequestSentNotify'), 'success');
    renderSupport(container, hostId);
  });
}
