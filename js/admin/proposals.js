import { getState, setProposalStatus } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';
import { adminFilters, filterBarHtml, wireFilterBar, destinationInScope } from './filters.js';
import { t, localize, localizeList, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';
import { dashCardHtml, kpiCardHtml, toneColors } from './dashboardShell.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';

registerTranslations('management', {
  proposals: {
    status: {
      draft: 'Nháp (chưa gửi)', sent: 'Đã gửi', pending_review: 'Chờ duyệt', reviewing: 'Đang xem xét', in_review: 'Đang xem xét',
      needs_info: 'Cần bổ sung', needs_revision: 'Cần bổ sung', approved: 'Chấp thuận', rejected: 'Chưa chấp thuận',
    },
    title: 'Đề án',
    subtitle: 'Xem hồ sơ, yêu cầu bổ sung và cập nhật kết quả xử lý.',
    allStatuses: 'Tất cả trạng thái',
    noMatch: 'Không có đề án nào khớp bộ lọc.',
    submittedBy: 'Hộ: {name}',
    activity: ' · Hoạt động: {name}',
    requestedChange: 'Yêu cầu thay đổi:',
    expectedImpact: 'Tác động dự kiến:',
    evidence: 'Bằng chứng:',
    proposedBudget: 'Kinh phí đề xuất: {value}',
    managementNote: 'Ghi chú của Cổng quản lý:',
    viewDetails: 'Xem chi tiết',
    requestRevision: 'Yêu cầu bổ sung',
    approve: 'Duyệt',
    reject: 'Từ chối',
    processingHistory: 'Lịch sử xử lý:',
    requestRevisionTitle: 'Yêu cầu bổ sung thông tin',
    approveTitle: 'Duyệt đề án',
    rejectTitle: 'Từ chối đề án',
    optionalNote: 'Ghi chú (tuỳ chọn)',
    responseForHost: 'Nội dung phản hồi cho hộ',
    confirm: 'Xác nhận',
    needResponseContent: 'Cần nhập nội dung phản hồi cho hộ.',
    approvedDefaultNote: 'Đã duyệt đề án.',
    updatedNotify: 'Đã cập nhật đề án — hộ sẽ thấy trạng thái mới trong Studio.',
    kpiTotal: 'Tổng đề án',
    kpiPending: 'Chờ duyệt',
    kpiInReview: 'Đang xem xét',
    kpiNeedsRevision: 'Cần bổ sung',
    kpiApproved: 'Đã duyệt',
    statusChartTitle: 'Trạng thái đề án',
    statusChartSubtitle: 'Bấm 1 trạng thái để lọc danh sách.',
    listTitle: 'Danh sách đề án',
  },
}, {
  proposals: {
    status: {
      draft: 'Draft (not sent)', sent: 'Sent', pending_review: 'Pending Review', reviewing: 'Under Review', in_review: 'Under Review',
      needs_info: 'Needs More Info', needs_revision: 'Needs More Info', approved: 'Approved', rejected: 'Not Approved',
    },
    title: 'Proposals',
    subtitle: 'Review submissions, request revisions and update processing outcomes.',
    allStatuses: 'All statuses',
    noMatch: 'No proposals match the current filter.',
    submittedBy: 'Provider: {name}',
    activity: ' · Activity: {name}',
    requestedChange: 'Requested change:',
    expectedImpact: 'Expected impact:',
    evidence: 'Evidence:',
    proposedBudget: 'Proposed budget: {value}',
    managementNote: 'Note from Management Portal:',
    viewDetails: 'View Details',
    requestRevision: 'Request Revision',
    approve: 'Approve',
    reject: 'Reject',
    processingHistory: 'Processing history:',
    requestRevisionTitle: 'Request more information',
    approveTitle: 'Approve proposal',
    rejectTitle: 'Reject proposal',
    optionalNote: 'Note (optional)',
    responseForHost: 'Response content for the provider',
    confirm: 'Confirm',
    needResponseContent: 'Response content for the provider is required.',
    approvedDefaultNote: 'Proposal approved.',
    updatedNotify: 'Proposal updated — the provider will see the new status in Studio.',
    kpiTotal: 'Total proposals',
    kpiPending: 'Pending review',
    kpiInReview: 'Under review',
    kpiNeedsRevision: 'Needs revision',
    kpiApproved: 'Approved',
    statusChartTitle: 'Proposal status',
    statusChartSubtitle: 'Click a status to filter the list.',
    listTitle: 'Proposal list',
  },
});

const ACTIONABLE_STATUSES = new Set(['sent', 'pending_review', 'reviewing', 'in_review', 'needs_info', 'needs_revision']);

let filterStatus = '';

function proposalsInScope(state) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - adminFilters.months);
  return state.proposals.filter((p) => {
    if (p.status === 'draft') return false; // hộ chưa gửi thì quản lý chưa thấy
    if (new Date(p.submittedAt || p.createdAt) < cutoff) return false;
    const host = state.hosts.find((h) => h.id === (p.hostId || p.providerId));
    const dest = host && state.destinations.find((d) => d.id === host.destinationId);
    return destinationInScope(dest);
  });
}

function proposalCardHtml(state, p) {
  const label = t(`management.proposals.status.${p.status}`) || p.status;
  const cls = { draft: 'badge-demo', sent: 'badge-type', pending_review: 'badge-type', reviewing: 'badge-type', in_review: 'badge-type', needs_info: 'badge-recognized', needs_revision: 'badge-recognized', approved: 'badge-free', rejected: 'badge-recognized' }[p.status] || 'badge-type';
  const host = state.hosts.find((h) => h.id === (p.hostId || p.providerId));
  const activity = p.activityId ? state.destinations.find((d) => d.id === p.activityId) : null;
  const evidenceRaw = p.evidence;
  const evidenceList = Array.isArray(evidenceRaw) ? evidenceRaw : localizeList(evidenceRaw, evidenceRaw ? [evidenceRaw] : []);
  const isActionable = ACTIONABLE_STATUSES.has(p.status);
  return `
    <div class="activity-card" data-proposal="${p.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(localize(p.title))}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${t('management.proposals.submittedBy', { name: escapeHtml(host?.name || p.hostId || p.providerId) })}${activity ? t('management.proposals.activity', { name: escapeHtml(localizedDestinationName(activity)) }) : ''}</p>
      <p class="text-sm" style="margin:4px 0;">${escapeHtml(localize(p.summary) || localize(p.problem) || '')}</p>
      <p class="text-sm" style="margin:0;"><strong>${t('management.proposals.requestedChange')}</strong> ${escapeHtml(localize(p.requestedChange) || localize(p.desiredSupport) || '—')}</p>
      <p class="text-sm" style="margin:0;"><strong>${t('management.proposals.expectedImpact')}</strong> ${escapeHtml(localize(p.expectedImpact) || localize(p.expectedBenefit) || '—')}</p>
      ${evidenceList.length ? `<p class="text-sm" style="margin:0;"><strong>${t('management.proposals.evidence')}</strong> ${evidenceList.map(escapeHtml).join(' · ')}</p>` : ''}
      ${p.proposedBudget ? `<p class="text-sm text-faint" style="margin:0;">${t('management.proposals.proposedBudget', { value: escapeHtml(p.proposedBudget) })}</p>` : ''}
      ${p.managementNote ? `<p class="text-sm text-faint" style="margin-top:4px;"><strong>${t('management.proposals.managementNote')}</strong> ${escapeHtml(localize(p.managementNote))}</p>` : ''}
      <div class="cta-row" style="margin-top:8px;">
        <button type="button" class="btn btn-secondary btn-sm" data-view-proposal="${p.id}">${t('management.proposals.viewDetails')}</button>
        ${isActionable ? `
          <button type="button" class="btn btn-secondary btn-sm" data-act="needs_revision">${t('management.proposals.requestRevision')}</button>
          <button type="button" class="btn btn-primary btn-sm" data-act="approved">${t('management.proposals.approve')}</button>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-act="rejected">${t('management.proposals.reject')}</button>
        ` : ''}
      </div>
    </div>
  `;
}

const STATUS_CHART_KEYS = ['pending_review', 'in_review', 'needs_revision', 'approved', 'rejected'];

export function renderAdminProposals(container) {
  const state = getState();
  const allInScope = proposalsInScope(state);
  const inScope = allInScope.filter((p) => !filterStatus || p.status === filterStatus).slice().reverse();
  const countByStatus = (statuses) => allInScope.filter((p) => statuses.includes(p.status)).length;
  const statusCounts = STATUS_CHART_KEYS.map((k) => (k === 'in_review' ? countByStatus(['reviewing', 'in_review']) : k === 'needs_revision' ? countByStatus(['needs_info', 'needs_revision']) : countByStatus([k])));

  container.innerHTML = `
    <div class="mdash">
      <div class="mdash-header">
        <div>
          <h1>${t('management.proposals.title')}</h1>
          <p class="text-sm text-muted" style="margin:0;">${t('management.proposals.subtitle')}</p>
        </div>
      </div>

      ${filterBarHtml(state)}

      <div class="mdash-grid">
        ${kpiCardHtml({ id: 'prop-kpi-total', label: t('management.proposals.kpiTotal'), value: allInScope.length, span: 2 })}
        ${kpiCardHtml({ id: 'prop-kpi-pending', label: t('management.proposals.kpiPending'), value: countByStatus(['sent', 'pending_review']), span: 2 })}
        ${kpiCardHtml({ id: 'prop-kpi-review', label: t('management.proposals.kpiInReview'), value: countByStatus(['reviewing', 'in_review']), span: 2 })}
        ${kpiCardHtml({ id: 'prop-kpi-revision', label: t('management.proposals.kpiNeedsRevision'), value: countByStatus(['needs_info', 'needs_revision']), span: 2 })}
        ${kpiCardHtml({ id: 'prop-kpi-approved', label: t('management.proposals.kpiApproved'), value: countByStatus(['approved']), span: 2 })}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'prop-status-chart', title: t('management.proposals.statusChartTitle'), subtitle: t('management.proposals.statusChartSubtitle'),
          span: 4, tabletFull: true, chartWrap: true, chartHeight: 260, bodyHtml: '<canvas id="proposal-status-chart"></canvas>',
        })}
        ${dashCardHtml({
          id: 'prop-list', title: t('management.proposals.listTitle'), span: 8, tabletFull: true,
          bodyHtml: `
            <select class="field-select" id="proposal-status-filter" style="max-width:220px;margin-bottom:10px;">
              <option value="">${t('management.proposals.allStatuses')}</option>
              ${['sent', 'pending_review', 'in_review', 'needs_revision', 'approved', 'rejected'].map((k) => `<option value="${k}" ${filterStatus === k ? 'selected' : ''}>${escapeHtml(t(`management.proposals.status.${k}`))}</option>`).join('')}
            </select>
            <div class="flex-col gap-3">
              ${inScope.length ? inScope.map((p) => proposalCardHtml(state, p)).join('') : `<p class="text-sm text-faint">${t('management.proposals.noMatch')}</p>`}
            </div>
          `,
        })}
      </div>
    </div>
  `;

  wireFilterBar(container, () => renderAdminProposals(container));
  qs('#proposal-status-filter', container).addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderAdminProposals(container);
  });

  loadChartJs().then((Chart) => {
    const selectedIdx = filterStatus ? STATUS_CHART_KEYS.findIndex((k) => k === filterStatus || (k === 'in_review' && filterStatus === 'reviewing') || (k === 'needs_revision' && filterStatus === 'needs_info')) : null;
    createChart(Chart, qs('#proposal-status-chart', container), 'proposal-status-chart', {
      type: 'doughnut',
      data: {
        labels: STATUS_CHART_KEYS.map((k) => t(`management.proposals.status.${k}`)),
        datasets: [{ data: statusCounts, backgroundColor: toneColors(CHART_COLORS.slice(0, STATUS_CHART_KEYS.length), selectedIdx === -1 ? null : selectedIdx) }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        onClick: (evt, elements) => {
          if (!elements.length) return;
          const key = STATUS_CHART_KEYS[elements[0].index];
          filterStatus = filterStatus === key ? '' : key;
          renderAdminProposals(container);
        },
      },
    });
  }).catch(() => {});

  qsa('[data-view-proposal]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = state.proposals.find((x) => x.id === btn.dataset.viewProposal);
      if (!p) return;
      const evidenceRaw = p.evidence;
      const evidenceList = Array.isArray(evidenceRaw) ? evidenceRaw : localizeList(evidenceRaw, evidenceRaw ? [evidenceRaw] : []);
      openModal({
        title: localize(p.title),
        bodyHtml: `
          <div class="flex-col gap-2">
            <p class="text-sm text-muted">${escapeHtml(localize(p.summary) || localize(p.problem) || '')}</p>
            <p class="text-sm"><strong>${t('management.proposals.requestedChange')}</strong> ${escapeHtml(localize(p.requestedChange) || localize(p.desiredSupport) || '—')}</p>
            <p class="text-sm"><strong>${t('management.proposals.expectedImpact')}</strong> ${escapeHtml(localize(p.expectedImpact) || localize(p.expectedBenefit) || '—')}</p>
            ${evidenceList.length ? `<p class="text-sm"><strong>${t('management.proposals.evidence')}</strong></p><ul style="padding-left:18px;margin:0;">${evidenceList.map((e) => `<li class="text-sm">${escapeHtml(e)}</li>`).join('')}</ul>` : ''}
            <p class="text-sm text-faint" style="margin-top:6px;">${t('management.proposals.processingHistory')}</p>
            <div class="text-sm text-faint">${(p.timeline || []).map((tl) => `${formatDateShort(tl.at)} — ${escapeHtml(tl.note || tl.status)}`).join('<br>')}</div>
          </div>
        `,
      });
    });
  });

  qsa('[data-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-proposal]').dataset.proposal;
      const decision = btn.dataset.act;
      const titleMap = { needs_revision: t('management.proposals.requestRevisionTitle'), approved: t('management.proposals.approveTitle'), rejected: t('management.proposals.rejectTitle') };
      const requireNote = decision !== 'approved';
      const close = openModal({
        title: titleMap[decision],
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="proposal-note">${decision === 'approved' ? t('management.proposals.optionalNote') : t('management.proposals.responseForHost')}</label>
            <textarea class="field-input" id="proposal-note" rows="3" ${requireNote ? 'required' : ''}></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="proposal-confirm">${t('management.proposals.confirm')}</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#proposal-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#proposal-note', modalEl).value.trim();
            if (requireNote && !note) { NotificationService.notify(t('management.proposals.needResponseContent'), 'error'); return; }
            setProposalStatus(id, decision, note || t('management.proposals.approvedDefaultNote'));
            closeFn();
            NotificationService.notify(t('management.proposals.updatedNotify'), 'success');
            renderAdminProposals(container);
          });
        },
      });
      if (!close) return;
    });
  });
}
