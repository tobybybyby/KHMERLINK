// Hạ tầng dùng chung cho redesign "Cổng dữ liệu quản lý" kiểu dashboard Power BI (canvas thống
// nhất, grid 12 cột, cross-filter) — CHỈ xử lý layout/tương tác hiển thị, KHÔNG tự tính KPI/số
// liệu (mọi số liệu vẫn đọc qua js/services/managementService.js, js/admin/networkMetrics.js...,
// đúng yêu cầu không đổi data model/công thức/data linkage đã hoàn thiện).
import { escapeHtml, qs, qsa } from '../utils.js';
import { t, registerTranslations } from '../services/i18nService.js';

registerTranslations('management', {
  dashboardShell: {
    focusMode: 'Xem lớn',
    resetSelection: 'Bỏ chọn',
    close: 'Đóng',
  },
}, {
  dashboardShell: {
    focusMode: 'Focus mode',
    resetSelection: 'Reset selection',
    close: 'Close',
  },
});

/** Card dashboard chuẩn — title/subtitle nhất quán, action "Xem lớn" tuỳ chọn (focus mode).
 * `span` là số cột (2-12) trên grid 12 cột desktop; `tabletFull` ép full-row ở breakpoint tablet
 * cho các visual cần nhiều chỗ hơn khi co lại 6 cột. `bodyHtml` là nội dung card (đã dựng sẵn). */
export function dashCardHtml({ id, title, subtitle = '', span = 4, tabletFull = false, bodyHtml, chartWrap = false, chartHeight = 220, focusable = false, extraClass = '' }) {
  return `
    <section class="mdash-card mdash-col-${span} ${extraClass}" id="${escapeHtml(id)}" ${tabletFull ? 'data-tablet-full="true"' : ''}>
      <div class="mdash-card__header">
        <div class="mdash-card__heading">
          <h3 class="mdash-card__title">${escapeHtml(title)}</h3>
          ${subtitle ? `<p class="mdash-card__subtitle">${escapeHtml(subtitle)}</p>` : ''}
        </div>
        ${focusable ? `
          <div class="mdash-card__actions">
            <button type="button" class="mdash-card__action-btn" data-focus-card="${escapeHtml(id)}" title="${escapeHtml(t('management.dashboardShell.focusMode'))}" aria-label="${escapeHtml(t('management.dashboardShell.focusMode'))}">⤢</button>
          </div>
        ` : ''}
      </div>
      <div class="mdash-card__body">
        ${chartWrap ? `<div class="mdash-card__chart-wrap" style="height:${chartHeight}px;">${bodyHtml}</div>` : bodyHtml}
      </div>
    </section>
  `;
}

/** KPI card — value lớn, delta so kỳ trước (mũi tên + màu), đơn vị. `deltaPct` null/undefined =>
 * không hiện delta (không có dữ liệu kỳ trước để so sánh — không bịa số 0%). */
export function kpiCardHtml({ id, label, value, unit = '', deltaPct = undefined, span = 2, tooltip = '' }) {
  let deltaHtml = '';
  if (deltaPct !== undefined && deltaPct !== null && !Number.isNaN(deltaPct)) {
    const dir = deltaPct > 0.05 ? 'up' : deltaPct < -0.05 ? 'down' : 'flat';
    const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·';
    const sign = deltaPct > 0 ? '+' : '';
    deltaHtml = `<span class="mdash-kpi__delta mdash-kpi__delta--${dir}">${arrow} ${sign}${deltaPct.toFixed(1)}%</span>`;
  }
  return `
    <section class="mdash-card mdash-kpi mdash-col-${span}" id="${escapeHtml(id)}" ${tooltip ? `title="${escapeHtml(tooltip)}"` : ''}>
      <span class="mdash-kpi__label">${escapeHtml(label)}</span>
      <div class="mdash-kpi__row">
        <span class="mdash-kpi__value">${value}</span>
        ${unit ? `<span class="mdash-kpi__unit">${escapeHtml(unit)}</span>` : ''}
      </div>
      ${deltaHtml}
    </section>
  `;
}

export function rowLabelHtml(label) {
  return `<div class="mdash-row-label">${escapeHtml(label)}</div>`;
}

// ---------- Focus mode: mở lại đúng nội dung 1 card trong modal lớn hơn, giữ nguyên filter context
// (không dùng state riêng — chart/nội dung được vẽ lại bằng cùng dữ liệu/hàm render của trang). ----------
let focusOverlay = null;

function closeFocusMode() {
  if (!focusOverlay) return;
  focusOverlay.remove();
  focusOverlay = null;
  document.removeEventListener('keydown', onFocusKeydown);
}

function onFocusKeydown(e) {
  if (e.key === 'Escape') closeFocusMode();
}

/** `renderInto(bodyEl)` dựng lại đúng nội dung (thường là 1 canvas mới + chart mới cùng config)
 * vào modal lớn hơn — gọi lại đúng hàm vẽ chart của card gốc với canvas id khác, không nhân đôi
 * logic. Đóng modal quay lại dashboard nguyên trạng (không set lại filter, không mất selection). */
export function openFocusMode({ title, renderInto }) {
  closeFocusMode();
  focusOverlay = document.createElement('div');
  focusOverlay.className = 'mdash-focus-overlay';
  focusOverlay.innerHTML = `
    <div class="mdash-focus-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="mdash-focus-modal__header">
        <h3 style="margin:0;">${escapeHtml(title)}</h3>
        <button type="button" class="mdash-card__action-btn" id="mdash-focus-close" aria-label="${escapeHtml(t('management.dashboardShell.close'))}">✕</button>
      </div>
      <div class="mdash-focus-modal__body" id="mdash-focus-body"></div>
    </div>
  `;
  document.body.appendChild(focusOverlay);
  focusOverlay.addEventListener('click', (e) => { if (e.target === focusOverlay) closeFocusMode(); });
  qs('#mdash-focus-close', focusOverlay).addEventListener('click', closeFocusMode);
  document.addEventListener('keydown', onFocusKeydown);
  renderInto(qs('#mdash-focus-body', focusOverlay));
}

/** Gắn sẵn tất cả nút "Xem lớn" trong container — `registry` là { [cardId]: { title, renderInto } }. */
export function wireFocusButtons(container, registry) {
  qsa('[data-focus-card]', container).forEach((btn) => {
    const id = btn.dataset.focusCard;
    const entry = registry[id];
    if (!entry) return;
    btn.addEventListener('click', () => openFocusMode(entry));
  });
}

// ---------- Cross-highlight cho Chart.js (pie/donut/bar) — làm mờ phần không được chọn thay vì
// xoá hẳn dữ liệu, giữ context (mục 10 yêu cầu). `selectedIndex` null = chưa chọn gì (không mờ). ----------
export function toneColors(baseColors, selectedIndex) {
  if (selectedIndex === null || selectedIndex === undefined) return baseColors;
  return baseColors.map((c, i) => (i === selectedIndex ? c : dimHex(c)));
}

function dimHex(hex) {
  // hex dạng '#rrggbb' — thêm alpha thấp bằng cách nối 2 ký tự alpha (đủ cho CHART_COLORS đang dùng).
  if (typeof hex === 'string' && hex.startsWith('#') && hex.length === 7) return `${hex}33`;
  return hex;
}

export const DashboardShell = { dashCardHtml, kpiCardHtml, rowLabelHtml, openFocusMode, wireFocusButtons, toneColors };
