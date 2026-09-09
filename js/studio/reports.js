import { getState, setSuggestionDecision } from '../storage.js';
import { escapeHtml, formatMoney, qs, qsa } from '../utils.js';
import { computeCps, cpsStatusLabel, generateSuggestions, CPS_WEIGHTS } from '../services/cpsService.js';
import { NotificationService } from '../services/notificationService.js';

const CHART_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js';
let chartJsPromise = null;

function loadChartJs() {
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve, reject) => {
    if (window.Chart) { resolve(window.Chart); return; }
    const existing = document.querySelector(`script[src="${CHART_JS_URL}"]`);
    if (existing) { existing.addEventListener('load', () => resolve(window.Chart)); existing.addEventListener('error', reject); return; }
    const script = document.createElement('script');
    script.src = CHART_JS_URL;
    script.async = true;
    script.addEventListener('load', () => resolve(window.Chart));
    script.addEventListener('error', () => reject(new Error('Không tải được thư viện biểu đồ')));
    document.head.appendChild(script);
  });
  return chartJsPromise;
}

export function computeLiveCurrentMonth(state, hostId) {
  const expIds = new Set(state.experiences.filter((e) => e.hostId === hostId).map((e) => e.id));
  const now = new Date();
  const items = state.bookingItems.filter((bi) => {
    if (!expIds.has(bi.experienceId)) return false;
    if (!['accepted', 'completed'].includes(bi.status)) return false;
    const at = new Date(bi.statusHistory[0]?.at || bi.statusHistory[bi.statusHistory.length - 1]?.at);
    return at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth();
  });
  const revenue = items.reduce((s, bi) => s + bi.subtotal, 0);
  const visitors = items.reduce((s, bi) => s + bi.quantity, 0);
  return { revenue, visitors, hasRealData: items.length > 0 };
}

function cpsBlockHtml(cps) {
  if (cps.status === 'new-spotlight') {
    return `
      <div class="card" style="padding:20px;">
        <span class="badge badge-new">New Spotlight</span>
        <p class="text-sm text-muted" style="margin-top:8px;">${escapeHtml(cps.note)}</p>
      </div>
    `;
  }
  const statusCls = cps.status === 'recognized-eligible' ? 'badge-free' : cps.status === 'needs-improvement' ? 'badge-recognized' : 'badge-type';
  return `
    <div class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">CPS nội bộ: ${cps.score}/100</h3>
        <span class="badge ${statusCls}">${escapeHtml(cpsStatusLabel(cps.status))}</span>
      </div>
      <div class="quick-facts" style="margin-top:10px;">
        <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ phản hồi</span><span class="quick-fact__value">${cps.components.responseRate}%</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ hoàn thành</span><span class="quick-fact__value">${cps.components.completionRate === null ? 'Chưa đủ dữ liệu' : `${cps.components.completionRate}%`}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Đánh giá trung bình</span><span class="quick-fact__value">${cps.components.avgRating === null ? 'Chưa có' : `⭐ ${cps.components.avgRating} (${cps.components.reviewCount})`}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:8px;">Công thức minh hoạ: ${Math.round(CPS_WEIGHTS.response * 100)}% phản hồi + ${Math.round(CPS_WEIGHTS.completion * 100)}% hoàn thành + ${Math.round(CPS_WEIGHTS.rating * 100)}% đánh giá (chuẩn hoá 0–1, thiếu dữ liệu dùng 0.7 trung tính). Có thể chỉnh trong <code>services/cpsService.js</code>.${cps.note ? ` ${escapeHtml(cps.note)}` : ''}${cps.excludedCount ? ` Đã loại trừ ${cps.excludedCount} booking khỏi kỳ đánh giá theo ngoại lệ đã duyệt.` : ''}</p>
    </div>
  `;
}

function suggestionsHtml(suggestions) {
  if (!suggestions.length) return '<p class="text-sm text-faint">Chưa có gợi ý nào — dữ liệu hiện tại chưa cho thấy vấn đề cụ thể.</p>';
  return suggestions.map((s) => `
    <div class="activity-card" data-suggestion="${s.id}">
      <strong>${escapeHtml(s.title)}</strong>
      <p class="text-sm text-muted" style="margin:4px 0;">Căn cứ: ${escapeHtml(s.basis)}</p>
      <p class="text-sm" style="margin:0;">${escapeHtml(s.action)}</p>
      ${s.decision ? `<span class="badge badge-demo" style="margin-top:6px;">${s.decision === 'dismissed' ? 'Đã bỏ qua' : 'Đã đánh dấu đã làm'}</span>` : `
        <div class="cta-row" style="margin-top:6px;">
          <a class="btn btn-secondary btn-sm" href="${s.actionHref}">Xử lý</a>
          <button type="button" class="btn btn-ghost btn-sm" data-decide="dismissed">Bỏ qua</button>
          <button type="button" class="btn btn-ghost btn-sm" data-decide="done">Đánh dấu đã làm</button>
        </div>
      `}
    </div>
  `).join('');
}

export function renderReports(container, hostId) {
  const state = getState();
  const monthly = (state.metrics.monthlyByHost && state.metrics.monthlyByHost[hostId]) || [];
  const live = computeLiveCurrentMonth(state, hostId);
  const displayMonths = monthly.map((m, i) => (i === monthly.length - 1 && live.hasRealData ? { ...m, revenue: live.revenue, visitors: live.visitors } : m));

  const cps = computeCps(hostId);
  const suggestions = generateSuggestions(hostId);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Báo cáo</h1>
      <p class="text-sm text-muted">Doanh thu/khách 12 tháng là dữ liệu minh hoạ; riêng tháng hiện tại lấy từ booking thật để khớp với bảng Lịch & Booking.</p>
    </div>
    <div class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Doanh thu 12 tháng</h3>
      <canvas id="revenue-chart" height="220"></canvas>
    </div>
    <div class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Khách theo tháng</h3>
      <canvas id="visitors-chart" height="220"></canvas>
    </div>
    ${cpsBlockHtml(cps)}
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Gợi ý cải thiện</h3>
      <div class="flex-col gap-3" id="suggestions-list">${suggestionsHtml(suggestions)}</div>
    </section>
  `;

  qsa('[data-decide]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-suggestion]').dataset.suggestion;
      setSuggestionDecision(id, btn.dataset.decide);
      NotificationService.notify('Đã cập nhật.', 'success');
      renderReports(container, hostId);
    });
  });

  loadChartJs().then((Chart) => {
    const labels = displayMonths.map((m) => m.label);
    new Chart(qs('#revenue-chart', container), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Doanh thu (đ)', data: displayMonths.map((m) => m.revenue), backgroundColor: '#6b4423' }] },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
    new Chart(qs('#visitors-chart', container), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Khách', data: displayMonths.map((m) => m.visitors), borderColor: '#b8862e', backgroundColor: '#b8862e33', fill: true, tension: 0.3 }] },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }).catch(() => {
    const fallback = `<p class="text-sm text-faint">Không tải được thư viện biểu đồ (mạng chặn CDN) — dữ liệu bảng: ${displayMonths.map((m) => `${m.label}: ${formatMoney(m.revenue)}`).join(', ')}.</p>`;
    qs('#revenue-chart', container)?.insertAdjacentHTML('afterend', fallback);
  });
}
