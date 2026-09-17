import { getState, reviewExperience, approveContentSubmission, requestContentSubmissionRevision, rejectContentSubmission } from '../storage.js';
import { escapeHtml, formatDateShort, formatCurrency, formatDurationMin, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';
import { t, localize, localizeList, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('management', {
  content: {
    expStatus: { draft: 'Nháp', pending_review: 'Chờ duyệt', published: 'Đã công bố' },
    subStatus: { pending_review: 'Chờ duyệt', in_review: 'Đang xem xét', needs_revision: 'Cần chỉnh sửa', approved: 'Đã duyệt', rejected: 'Đã từ chối' },
    submittedBy: 'Hộ: {name}',
    pricePerGuest: 'Giá/khách',
    duration: 'Thời lượng',
    capacity: 'Sức chứa',
    guestsUnit: '{count} khách',
    submittedAt: 'Gửi lúc {date}',
    noteInline: ' · Ghi chú: {note}',
    viewDetails: 'Xem chi tiết',
    approve: 'Duyệt',
    requestRevision: 'Yêu cầu chỉnh sửa',
    reject: 'Từ chối',
    newSubmissionsTitle: 'Đề xuất hoạt động mới ({count})',
    newSubmissionsDesc: 'Hoạt động chưa xuất hiện trên giao diện khách cho tới khi được duyệt.',
    noSubmissions: 'Chưa có đề xuất nào.',
    title: 'Kiểm duyệt nội dung',
    subtitle: 'Hàng chờ duyệt listing/trải nghiệm: bản nháp → chờ hộ/cộng đồng duyệt → được duyệt → công bố. Mỗi hành động được ghi lại ai làm gì, khi nào.',
    draft: 'Nháp',
    pendingReview: 'Chờ duyệt',
    published: 'Đã công bố',
    pendingApprovalTitle: 'Đang chờ duyệt',
    place: ' · Địa điểm: {name}',
    noDescriptionYet: '(chưa có mô tả)',
    approveAndPublish: '✓ Duyệt & công bố',
    noPendingContent: 'Không có nội dung nào đang chờ duyệt.',
    logTitle: 'Nhật ký kiểm duyệt',
    thTime: 'Thời gian',
    thContent: 'Nội dung',
    thAction: 'Hành động',
    thNote: 'Ghi chú',
    actionApproved: 'Đã duyệt',
    actionNeedsChanges: 'Yêu cầu chỉnh sửa',
    noLogEntries: 'Chưa có hành động kiểm duyệt nào.',
    approvedNote: 'Nội dung phù hợp, đã duyệt công bố.',
    approvedNotify: 'Đã duyệt — nội dung hiện công bố cho khách.',
    requestChangesTitle: 'Yêu cầu chỉnh sửa',
    whatToChange: 'Cần chỉnh sửa gì?',
    sendRequest: 'Gửi yêu cầu',
    enterChangeContent: 'Nhập nội dung cần chỉnh sửa.',
    revertedToDraftNotify: 'Đã chuyển về nháp cho hộ chỉnh sửa lại.',
    type: 'Loại hình:',
    priceGuestLabel: 'Giá/khách:',
    durationLabel: 'Thời lượng:',
    capacityLabel: 'Sức chứa:',
    proposedSchedule: 'Lịch đề xuất:',
    tags: 'Tag:',
    reviewNote: 'Ghi chú kiểm duyệt:',
    submissionApprovedNote: 'Nội dung phù hợp, đã duyệt và thêm vào Activity Catalog.',
    submissionApprovedNotify: 'Đã duyệt — hoạt động hiện hiển thị cho khách.',
    reviseTitle: 'Yêu cầu chỉnh sửa',
    rejectTitle: 'Từ chối đề xuất',
    reasonLabel: 'Lý do',
    reasonReviseSuffix: ' / nội dung cần chỉnh sửa',
    confirm: 'Xác nhận',
    needReason: 'Cần nhập lý do.',
    submissionUpdatedNotify: 'Đã cập nhật đề xuất — hộ sẽ thấy trạng thái mới.',
  },
}, {
  content: {
    expStatus: { draft: 'Draft', pending_review: 'Pending Review', published: 'Published' },
    subStatus: { pending_review: 'Pending Review', in_review: 'Under Review', needs_revision: 'Needs Revision', approved: 'Approved', rejected: 'Rejected' },
    submittedBy: 'Provider: {name}',
    pricePerGuest: 'Price/guest',
    duration: 'Duration',
    capacity: 'Capacity',
    guestsUnit: '{count} guests',
    submittedAt: 'Submitted {date}',
    noteInline: ' · Note: {note}',
    viewDetails: 'View Details',
    approve: 'Approve',
    requestRevision: 'Request Revision',
    reject: 'Reject',
    newSubmissionsTitle: 'New activity proposals ({count})',
    newSubmissionsDesc: 'The activity does not appear on the customer interface until approved.',
    noSubmissions: 'No proposals yet.',
    title: 'Content Moderation',
    subtitle: 'Listing/experience review queue: draft → awaiting provider/community review → approved → published. Every action is logged with who did what and when.',
    draft: 'Draft',
    pendingReview: 'Pending Review',
    published: 'Published',
    pendingApprovalTitle: 'Pending Approval',
    place: ' · Place: {name}',
    noDescriptionYet: '(no description yet)',
    approveAndPublish: '✓ Approve & Publish',
    noPendingContent: 'No content pending review.',
    logTitle: 'Moderation Log',
    thTime: 'Time',
    thContent: 'Content',
    thAction: 'Action',
    thNote: 'Note',
    actionApproved: 'Approved',
    actionNeedsChanges: 'Revision requested',
    noLogEntries: 'No moderation actions yet.',
    approvedNote: 'Content is appropriate, approved for publishing.',
    approvedNotify: 'Approved — content is now published for guests.',
    requestChangesTitle: 'Request Revision',
    whatToChange: 'What needs to change?',
    sendRequest: 'Send Request',
    enterChangeContent: 'Enter what needs to be changed.',
    revertedToDraftNotify: 'Reverted to draft for the provider to revise.',
    type: 'Type:',
    priceGuestLabel: 'Price/guest:',
    durationLabel: 'Duration:',
    capacityLabel: 'Capacity:',
    proposedSchedule: 'Proposed schedule:',
    tags: 'Tags:',
    reviewNote: 'Review note:',
    submissionApprovedNote: 'Content is appropriate, approved and added to the Activity Catalog.',
    submissionApprovedNotify: 'Approved — the activity is now visible to guests.',
    reviseTitle: 'Request Revision',
    rejectTitle: 'Reject Proposal',
    reasonLabel: 'Reason',
    reasonReviseSuffix: ' / what needs revising',
    confirm: 'Confirm',
    needReason: 'A reason is required.',
    submissionUpdatedNotify: 'Proposal updated — the provider will see the new status.',
  },
});

function submissionCardHtml(state, sub) {
  const host = state.hosts.find((h) => h.id === sub.providerId);
  const label = t(`management.content.subStatus.${sub.status}`) || sub.status;
  const cls = { pending_review: 'badge-type', in_review: 'badge-type', needs_revision: 'badge-recognized', approved: 'badge-free', rejected: 'badge-recognized' }[sub.status] || 'badge-type';
  const isActionable = sub.status === 'pending_review' || sub.status === 'in_review';
  const tagsList = Array.isArray(sub.tags) ? sub.tags : localizeList(sub.tags, []);
  return `
    <div class="activity-card" data-submission="${sub.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(localize(sub.name))}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:0;">${t('management.content.submittedBy', { name: escapeHtml(host?.name || sub.providerId) })} · ${escapeHtml(localize(sub.category) || '')}</p>
      <p class="text-sm" style="margin:4px 0;">${escapeHtml(localize(sub.description) || '')}</p>
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin:4px 0 0;">
        <div class="quick-fact"><span class="quick-fact__label">${t('management.content.pricePerGuest')}</span><span class="quick-fact__value" style="font-size:0.85rem;">${formatCurrency(sub.pricePerPerson)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('management.content.duration')}</span><span class="quick-fact__value" style="font-size:0.85rem;">${formatDurationMin(sub.durationMinutes)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('management.content.capacity')}</span><span class="quick-fact__value" style="font-size:0.85rem;">${t('management.content.guestsUnit', { count: sub.capacity })}</span></div>
      </div>
      ${tagsList.length ? `<div class="feedback-card__tags" style="margin-top:6px;">${tagsList.map((tag) => `<span class="chip" style="padding:2px 8px;font-size:0.72rem;">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
      <p class="text-sm text-faint" style="margin-top:6px;">${t('management.content.submittedAt', { date: formatDateShort(sub.submittedAt) })}${sub.reviewerNote ? t('management.content.noteInline', { note: escapeHtml(sub.reviewerNote) }) : ''}</p>
      <div class="cta-row" style="margin-top:8px;">
        <button type="button" class="btn btn-secondary btn-sm" data-sub-detail="${sub.id}">${t('management.content.viewDetails')}</button>
        ${isActionable ? `
          <button type="button" class="btn btn-primary btn-sm" data-sub-act="approve">${t('management.content.approve')}</button>
          <button type="button" class="btn btn-secondary btn-sm" data-sub-act="revise">${t('management.content.requestRevision')}</button>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-sub-act="reject">${t('management.content.reject')}</button>
        ` : ''}
      </div>
    </div>
  `;
}

function submissionsSectionHtml(state) {
  const subs = (state.contentSubmissions || []).slice().reverse();
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('management.content.newSubmissionsTitle', { count: subs.length })}</h3>
      <p class="text-sm text-muted" style="margin-top:-4px;">${t('management.content.newSubmissionsDesc')}</p>
      <div class="flex-col gap-3" style="margin-top:10px;">
        ${subs.length ? subs.map((sub) => submissionCardHtml(state, sub)).join('') : `<p class="text-sm text-faint">${t('management.content.noSubmissions')}</p>`}
      </div>
    </section>
  `;
}

export function renderOpsContent(container) {
  const state = getState();
  const pending = state.experiences.filter((e) => e.status === 'pending_review');
  const counts = state.experiences.reduce((acc, e) => { const s = e.status || 'published'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const log = state.moderationRecords.slice().reverse().slice(0, 20);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">${t('management.content.title')}</h1>
      <p class="text-sm text-muted">${t('management.content.subtitle')}</p>
    </div>

    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">${t('management.content.draft')}</span><span class="quick-fact__value">${counts.draft || 0}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.content.pendingReview')}</span><span class="quick-fact__value">${counts.pending_review || 0}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.content.published')}</span><span class="quick-fact__value">${counts.published || 0}</span></div>
    </div>

    ${submissionsSectionHtml(state)}

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('management.content.pendingApprovalTitle')}</h3>
      ${pending.length ? `
        <div class="flex-col gap-3" style="margin-top:10px;">
          ${pending.map((exp) => {
            const dest = state.destinations.find((d) => d.id === exp.destinationId);
            const host = state.hosts.find((h) => h.id === exp.hostId);
            return `
              <div class="activity-card" data-exp="${exp.id}">
                <div class="activity-card__head">
                  <strong>${escapeHtml(exp.title)}</strong>
                  <span class="badge badge-type">${t('management.content.pendingReview')}</span>
                </div>
                <p class="text-sm text-muted" style="margin:0;">${t('management.content.submittedBy', { name: escapeHtml(host?.name || exp.hostId) })}${dest ? t('management.content.place', { name: escapeHtml(localizedDestinationName(dest)) }) : t('management.content.place', { name: '—' })}</p>
                <p class="text-sm" style="margin:4px 0;">${escapeHtml(exp.description || t('management.content.noDescriptionYet'))}</p>
                <div class="cta-row" style="margin-top:8px;">
                  <button type="button" class="btn btn-primary btn-sm" data-act="approved">${t('management.content.approveAndPublish')}</button>
                  <button type="button" class="btn btn-secondary btn-sm" data-act="needs_changes">${t('management.content.requestRevision')}</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `<p class="text-sm text-faint" style="margin-top:10px;">${t('management.content.noPendingContent')}</p>`}
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">${t('management.content.logTitle')}</h3>
      ${log.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>${t('management.content.thTime')}</th><th>${t('management.content.thContent')}</th><th>${t('management.content.thAction')}</th><th>${t('management.content.thNote')}</th></tr></thead>
          <tbody>${log.map((r) => {
            const exp = state.experiences.find((e) => e.id === r.targetId);
            return `<tr><td>${formatDateShort(r.at)}</td><td>${escapeHtml(exp?.title || r.targetId)}</td><td>${r.action === 'approved' ? t('management.content.actionApproved') : t('management.content.actionNeedsChanges')}</td><td>${escapeHtml(r.note || '—')}</td></tr>`;
          }).join('')}</tbody>
        </table>
      ` : `<p class="text-sm text-faint" style="margin-top:10px;">${t('management.content.noLogEntries')}</p>`}
    </section>
  `;

  qsa('[data-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const expId = btn.closest('[data-exp]').dataset.exp;
      const decision = btn.dataset.act;
      if (decision === 'approved') {
        reviewExperience(expId, 'approved', t('management.content.approvedNote'));
        NotificationService.notify(t('management.content.approvedNotify'), 'success');
        renderOpsContent(container);
        return;
      }
      const close = openModal({
        title: t('management.content.requestChangesTitle'),
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="content-note">${t('management.content.whatToChange')}</label>
            <textarea class="field-input" id="content-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="content-confirm">${t('management.content.sendRequest')}</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#content-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#content-note', modalEl).value.trim();
            if (!note) { NotificationService.notify(t('management.content.enterChangeContent'), 'error'); return; }
            reviewExperience(expId, 'needs_changes', note);
            closeFn();
            NotificationService.notify(t('management.content.revertedToDraftNotify'), 'info');
            renderOpsContent(container);
          });
        },
      });
      if (!close) return;
    });
  });

  qsa('[data-sub-detail]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = (state.contentSubmissions || []).find((x) => x.id === btn.dataset.subDetail);
      if (!sub) return;
      const days = sub.proposedSchedule?.days;
      const daysList = Array.isArray(days) ? days : localizeList(days, []);
      const tagsList = Array.isArray(sub.tags) ? sub.tags : localizeList(sub.tags, []);
      openModal({
        title: localize(sub.name),
        bodyHtml: `
          <div class="flex-col gap-2">
            <p class="text-sm text-muted">${escapeHtml(localize(sub.description) || '')}</p>
            <p class="text-sm"><strong>${t('management.content.type')}</strong> ${escapeHtml(localize(sub.category) || '—')}</p>
            <p class="text-sm"><strong>${t('management.content.priceGuestLabel')}</strong> ${formatCurrency(sub.pricePerPerson)} · <strong>${t('management.content.durationLabel')}</strong> ${formatDurationMin(sub.durationMinutes)} · <strong>${t('management.content.capacityLabel')}</strong> ${t('management.content.guestsUnit', { count: sub.capacity })}</p>
            <p class="text-sm"><strong>${t('management.content.proposedSchedule')}</strong> ${daysList.join(', ')} — ${(sub.proposedSchedule?.timeSlots || []).join(', ')}</p>
            ${tagsList.length ? `<p class="text-sm"><strong>${t('management.content.tags')}</strong> ${tagsList.map(escapeHtml).join(', ')}</p>` : ''}
            ${sub.reviewerNote ? `<p class="text-sm text-faint"><strong>${t('management.content.reviewNote')}</strong> ${escapeHtml(sub.reviewerNote)}</p>` : ''}
          </div>
        `,
      });
    });
  });

  qsa('[data-sub-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const subId = btn.closest('[data-submission]').dataset.submission;
      const action = btn.dataset.subAct;
      if (action === 'approve') {
        approveContentSubmission(subId, t('management.content.submissionApprovedNote'));
        NotificationService.notify(t('management.content.submissionApprovedNotify'), 'success');
        renderOpsContent(container);
        return;
      }
      const titleMap = { revise: t('management.content.reviseTitle'), reject: t('management.content.rejectTitle') };
      const close = openModal({
        title: titleMap[action],
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="sub-note">${t('management.content.reasonLabel')}${action === 'revise' ? t('management.content.reasonReviseSuffix') : ''}</label>
            <textarea class="field-input" id="sub-note" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="sub-confirm">${t('management.content.confirm')}</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#sub-confirm', modalEl).addEventListener('click', () => {
            const note = qs('#sub-note', modalEl).value.trim();
            if (!note) { NotificationService.notify(t('management.content.needReason'), 'error'); return; }
            if (action === 'revise') requestContentSubmissionRevision(subId, note);
            else rejectContentSubmission(subId, note);
            closeFn();
            NotificationService.notify(t('management.content.submissionUpdatedNotify'), 'success');
            renderOpsContent(container);
          });
        },
      });
      if (!close) return;
    });
  });
}
