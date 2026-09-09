import { getState, setHostRecognition, decideCpsException } from '../storage.js';
import { escapeHtml, formatDateShort, qs, qsa } from '../utils.js';
import { computeCps, cpsStatusLabel } from '../services/cpsService.js';
import { NotificationService } from '../services/notificationService.js';
import { openModal } from '../ui.js';

const CPS_EXC_CATEGORY_LABELS = { 'gia-dinh': 'Việc gia đình', 'mua-vu': 'Mùa vụ', 'nghi-le': 'Nghi lễ' };

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
      <p class="text-sm text-muted" style="margin:0;">${cps.score === null ? 'Chưa đủ dữ liệu tính điểm' : `Điểm CPS: ${cps.score}/100 (${cps.totalRequests} yêu cầu)`}</p>
      <p class="text-sm" style="margin:4px 0;">Huy hiệu "Được ghi nhận": ${recognized ? '<span class="badge badge-recognized">✓ Đang có</span>' : '<span class="text-faint">Chưa có</span>'}${dest?.recognizedReason ? ` — ${escapeHtml(dest.recognizedReason)}` : ''}</p>
      <div class="cta-row" style="margin-top:8px;">
        ${recognized
          ? '<button type="button" class="btn btn-danger-ghost btn-sm" data-badge-act="revoke">Thu hồi huy hiệu</button>'
          : '<button type="button" class="btn btn-primary btn-sm" data-badge-act="grant">Cấp huy hiệu "Được ghi nhận"</button>'}
      </div>
    </div>
  `;
}

function cpsExcCardHtml(state, e) {
  const host = state.hosts.find((h) => h.id === e.hostId);
  const map = { pending: ['Chờ xét duyệt', 'badge-demo'], approved: ['Đã duyệt', 'badge-free'], rejected: ['Từ chối', 'badge-recognized'] };
  const [label, cls] = map[e.status] || [e.status, 'badge-type'];
  return `
    <div class="activity-card" data-cps-exc="${e.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(host?.name || e.hostId)} — ${escapeHtml(CPS_EXC_CATEGORY_LABELS[e.category] || e.category)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
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
}

export function renderOpsQuality(container) {
  const state = getState();
  const exceptions = state.cpsExceptions.slice().reverse();

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Chất lượng & Hỗ trợ hộ</h1>
      <p class="text-sm text-muted">CPS chỉ hiển thị cho chính hộ và vai trò vận hành có thẩm quyền (trang này) — không hiển thị cho khách hoặc Cổng dữ liệu quản lý. Cấp/thu hồi huy hiệu luôn kèm lý do.</p>
    </div>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Huy hiệu chất lượng theo hộ</h3>
      <div class="flex-col gap-3" style="margin-top:10px;">
        ${state.hosts.map((h) => hostQualityCardHtml(state, h)).join('')}
      </div>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Yêu cầu xem xét ngoại lệ CPS</h3>
      <div class="flex-col gap-3" style="margin-top:10px;">
        ${exceptions.length ? exceptions.map((e) => cpsExcCardHtml(state, e)).join('') : '<p class="text-sm text-faint">Chưa có yêu cầu nào.</p>'}
      </div>
    </section>
  `;

  qsa('[data-badge-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const hostId = btn.closest('[data-host]').dataset.host;
      const action = btn.dataset.badgeAct;
      const close = openModal({
        title: action === 'grant' ? 'Cấp huy hiệu "Được ghi nhận"' : 'Thu hồi huy hiệu',
        bodyHtml: `
          <div class="flex-col gap-3">
            <label class="field-label" for="badge-reason">Lý do</label>
            <textarea class="field-input" id="badge-reason" rows="3" required></textarea>
            <div class="modal__actions"><button type="button" class="btn btn-primary" id="badge-confirm">Xác nhận</button></div>
          </div>
        `,
        onMount: (modalEl, closeFn) => {
          qs('#badge-confirm', modalEl).addEventListener('click', () => {
            const reason = qs('#badge-reason', modalEl).value.trim();
            if (!reason) { NotificationService.notify('Nhập lý do trước khi xác nhận.', 'error'); return; }
            setHostRecognition(hostId, action === 'grant', reason);
            closeFn();
            NotificationService.notify(action === 'grant' ? 'Đã cấp huy hiệu.' : 'Đã thu hồi huy hiệu.', 'success');
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
      decideCpsException(id, decision, decision === 'approved' ? 'Vận hành đã duyệt ngoại lệ.' : 'Vận hành từ chối ngoại lệ.');
      NotificationService.notify('Đã cập nhật yêu cầu ngoại lệ CPS.', 'success');
      renderOpsQuality(container);
    });
  });
}
