import { getState, setHostRecognition, decideCpsException } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { computeCps, cpsStatusLabel } from '../services/cpsService.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';
import { t, registerTranslations } from '../services/i18nService.js';

registerTranslations('management', {
  quality: {
    cpsCategory: { 'gia-dinh': 'Việc gia đình', 'mua-vu': 'Mùa vụ', 'nghi-le': 'Nghi lễ' },
    cpsExcStatus: { pending: 'Chờ xét duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' },
    notEnoughData: 'Chưa đủ dữ liệu tính điểm',
    cpsScore: 'Điểm CPS: {score}/100 ({count} yêu cầu)',
    recognizedBadge: 'Huy hiệu "Được ghi nhận": {status}',
    hasIt: '✓ Đang có',
    doesNotHaveIt: 'Chưa có',
    revokeBadge: 'Thu hồi huy hiệu',
    grantBadge: 'Cấp huy hiệu "Được ghi nhận"',
    title: 'Chất lượng & Hỗ trợ hộ',
    subtitle: 'CPS chỉ hiển thị cho chính hộ và vai trò vận hành có thẩm quyền (trang này) — không hiển thị cho khách hoặc Cổng dữ liệu quản lý. Cấp/thu hồi huy hiệu luôn kèm lý do.',
    badgesTitle: 'Huy hiệu chất lượng theo hộ',
    cpsExcTitle: 'Yêu cầu xem xét ngoại lệ CPS',
    noRequests: 'Chưa có yêu cầu nào.',
    period: 'Khoảng thời gian: {from} – {to}',
    approve: 'Duyệt',
    reject: 'Từ chối',
    grantTitle: 'Cấp huy hiệu "Được ghi nhận"',
    revokeTitle: 'Thu hồi huy hiệu',
    reasonLabel: 'Lý do',
    confirm: 'Xác nhận',
    needReasonFirst: 'Nhập lý do trước khi xác nhận.',
    grantedNotify: 'Đã cấp huy hiệu.',
    revokedNotify: 'Đã thu hồi huy hiệu.',
    opsApprovedNote: 'Vận hành đã duyệt ngoại lệ.',
    opsRejectedNote: 'Vận hành từ chối ngoại lệ.',
    updatedNotify: 'Đã cập nhật yêu cầu ngoại lệ CPS.',
  },
}, {
  quality: {
    cpsCategory: { 'gia-dinh': 'Family matter', 'mua-vu': 'Seasonal', 'nghi-le': 'Ritual/ceremony' },
    cpsExcStatus: { pending: 'Awaiting review', approved: 'Approved', rejected: 'Rejected' },
    notEnoughData: 'Not enough data to compute a score',
    cpsScore: 'CPS score: {score}/100 ({count} requests)',
    recognizedBadge: '"Recognized" badge: {status}',
    hasIt: '✓ Has it',
    doesNotHaveIt: 'Does not have it',
    revokeBadge: 'Revoke Badge',
    grantBadge: 'Grant "Recognized" Badge',
    title: 'Quality & Provider Support',
    subtitle: 'CPS is only visible to the provider itself and authorized operations roles (this page) — not visible to guests or the Management Data Portal. Granting/revoking a badge always requires a reason.',
    badgesTitle: 'Quality Badges by Provider',
    cpsExcTitle: 'CPS Exception Review Requests',
    noRequests: 'No requests yet.',
    period: 'Period: {from} – {to}',
    approve: 'Approve',
    reject: 'Reject',
    grantTitle: 'Grant "Recognized" Badge',
    revokeTitle: 'Revoke Badge',
    reasonLabel: 'Reason',
    confirm: 'Confirm',
    needReasonFirst: 'Enter a reason before confirming.',
    grantedNotify: 'Badge granted.',
    revokedNotify: 'Badge revoked.',
    opsApprovedNote: 'Operations approved the exception.',
    opsRejectedNote: 'Operations rejected the exception.',
    updatedNotify: 'CPS exception request updated.',
  },
});

function hostQualityCardHtml(state, host) {
  const dest = state.destinations.find((d) => d.id === host.destinationId);
  const cps = computeCps(host.id);
  const recognized = !!dest?.recognized;
  const statusCls = cps.status === 'recognized-eligible' ? 'badge-free' : cps.status === 'needs-improvement' ? 'badge-recognized' : cps.status === 'new-spotlight' ? 'badge-new' : 'badge-type';
  return `
    <div class="activity-card" data-host="${host.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(host.name)}</strong>
        <span class="badge ${statusCls}">${escapeHtml(cpsStatusLabel(cps.status))}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${cps.score === null ? t('management.quality.notEnoughData') : t('management.quality.cpsScore', { score: cps.score, count: cps.totalRequests })}</p>
      <p class="text-sm" style="margin:4px 0;">${t('management.quality.recognizedBadge', { status: recognized ? `<span class="badge badge-recognized">${t('management.quality.hasIt')}</span>` : `<span class="text-faint">${t('management.quality.doesNotHaveIt')}</span>` })}${dest?.recognizedReason ? ` — ${escapeHtml(dest.recognizedReason)}` : ''}</p>
      <div class="cta-row" style="margin-top:8px;">
        ${recognized
          ? `<button type="button" class="btn btn-danger-ghost btn-sm" data-badge-act="revoke">${t('management.quality.revokeBadge')}</button>`
          : `<button type="button" class="btn btn-primary btn-sm" data-badge-act="grant">${t('management.quality.grantBadge')}</button>`}
      </div>
    </div>
  `;
}

function cpsExcCardHtml(state, e) {
  const host = state.hosts.find((h) => h.id === e.hostId);
  const label = t(`management.quality.cpsExcStatus.${e.status}`) || e.status;
  const cls = { pending: 'badge-demo', approved: 'badge-free', rejected: 'badge-recognized' }[e.status] || 'badge-type';
  return `
    <div class="activity-card" data-cps-exc="${e.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(host?.name || e.hostId)} — ${escapeHtml(t(`management.quality.cpsCategory.${e.category}`) || e.category)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${escapeHtml(e.reason)}</p>
      <p class="text-sm" style="margin:0;">${t('management.quality.period', { from: formatDateShort(e.startDate), to: formatDateShort(e.endDate) })}</p>
      ${e.status === 'pending' ? `
        <div class="cta-row" style="margin-top:8px;">
          <button type="button" class="btn btn-primary btn-sm" data-cps-act="approved">${t('management.quality.approve')}</button>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-cps-act="rejected">${t('management.quality.reject')}</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderOpsQuality(container) {
  const state = getState();
  const exceptions = state.cpsExceptions.slice().reverse();

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">${t('management.quality.title')}</h1>
      <p class="text-sm text-muted">${t('management.quality.subtitle')}</p>
    </div>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('management.quality.badgesTitle')}</h3>
      <div class="flex-col gap-3" style="margin-top:10px;">
        ${state.hosts.map((h) => hostQualityCardHtml(state, h)).join('')}
      </div>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('management.quality.cpsExcTitle')}</h3>
      <div class="flex-col gap-3" style="margin-top:10px;">
        ${exceptions.length ? exceptions.map((e) => cpsExcCardHtml(state, e)).join('') : `<p class="text-sm text-faint">${t('management.quality.noRequests')}</p>`}
      </div>
    </section>
  `;

  qsa('[data-badge-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const hostId = btn.closest('[data-host]').dataset.host;
      const action = btn.dataset.badgeAct;
      const close = openModal({
        title: action === 'grant' ? t('management.quality.grantTitle') : t('management.quality.revokeTitle'),
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="badge-reason">${t('management.quality.reasonLabel')}</label>
            <textarea class="field-input" id="badge-reason" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="badge-confirm">${t('management.quality.confirm')}</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#badge-confirm', modalEl).addEventListener('click', () => {
            const reason = qs('#badge-reason', modalEl).value.trim();
            if (!reason) { NotificationService.notify(t('management.quality.needReasonFirst'), 'error'); return; }
            setHostRecognition(hostId, action === 'grant', reason);
            closeFn();
            NotificationService.notify(action === 'grant' ? t('management.quality.grantedNotify') : t('management.quality.revokedNotify'), 'success');
            renderOpsQuality(container);
          });
        },
      });
      if (!close) return;
    });
  });

  qsa('[data-cps-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-cps-exc]').dataset.cpsExc;
      const decision = btn.dataset.cpsAct;
      decideCpsException(id, decision, decision === 'approved' ? t('management.quality.opsApprovedNote') : t('management.quality.opsRejectedNote'));
      NotificationService.notify(t('management.quality.updatedNotify'), 'success');
      renderOpsQuality(container);
    });
  });
}
