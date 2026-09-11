import { getState, setSuggestionDecision } from '../storage.js';
import { escapeHtml, formatMoney, qs, qsa } from '../utils.js';
import { computeCps, cpsStatusLabel, generateSuggestions, CPS_WEIGHTS } from '../services/cpsService.js';
import { NotificationService } from '../services/notificationService.js';
import { getRatingStatsForListingIds, getRatingDistribution, getDisplayReviewsForListingIds, formatRatingStats } from '../services/reviewsService.js';
import { getHostMonths, getHostKpis, getListingVisitMonths, getTopTagShares, generateHostRecommendations } from '../services/metricsService.js';
import { historicalMetrics } from '../../data/pilot-seed-data.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';

// Giữ export này để studio/overview.js dùng chung logic "tháng hiện tại tính từ booking thật" —
// nay uỷ quyền cho metricsService.getHostKpis() (đã gộp lịch sử + live) thay vì tự tính lại.
export function computeLiveCurrentMonth(state, hostId) {
  const kpi = getHostKpis(state, hostId);
  return { revenue: kpi.grossRevenue, visitors: kpi.participants, hasRealData: true };
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

function contentRecommendationsHtml(recs) {
  if (!recs.length) return '<p class="text-sm text-faint">Chưa đủ dữ liệu đánh giá để đưa ra gợi ý cụ thể.</p>';
  const kindCls = { strength: 'badge-free', opportunity: 'badge-type', issue: 'badge-recognized' };
  return recs.map((r) => `
    <div class="activity-card">
      <strong>${escapeHtml(r.title)}</strong>
      <p class="text-sm text-muted" style="margin:4px 0;">Căn cứ: ${escapeHtml(r.basis)}</p>
      <p class="text-sm" style="margin:0;"><span class="badge ${kindCls[r.kind] || 'badge-type'}" style="margin-right:6px;">${r.kind === 'strength' ? 'Điểm mạnh' : r.kind === 'issue' ? 'Cần xem lại' : 'Cơ hội'}</span>${escapeHtml(r.action)}</p>
    </div>
  `).join('');
}

function feedbackListHtml(reviews) {
  if (!reviews.length) return '<p class="text-sm text-faint">Chưa có phản hồi nào.</p>';
  return reviews.map((r) => `
    <div class="card" style="padding:12px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <strong>${'★'.repeat(Math.round(r.overallRating))}${'☆'.repeat(5 - Math.round(r.overallRating))}</strong>
        <span class="text-sm text-faint">${escapeHtml(r.travellerName || 'Khách')}</span>
      </div>
      ${r.comment ? `<p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(r.comment)}</p>` : ''}
      ${(r.selectedTags || []).length ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${r.selectedTags.map((t) => escapeHtml(t)).join(' · ')}</p>` : ''}
    </div>
  `).join('');
}

export function renderReports(container, hostId) {
  const state = getState();
  const host = state.hosts.find((h) => h.id === hostId);
  const listingIds = host ? [host.destinationId] : [];
  const hasRevenueHistory = historicalMetrics.some((r) => r.providerId === hostId);

  const cps = computeCps(hostId);
  const suggestions = generateSuggestions(hostId);
  const ratingStats = getRatingStatsForListingIds(state, listingIds);
  const distribution = getRatingDistribution(state, listingIds);
  const { items: tagItems } = getTopTagShares(state, listingIds, 5);
  const recentReviews = getDisplayReviewsForListingIds(state, listingIds).slice(0, 8);
  const contentRecs = generateHostRecommendations(state, hostId);

  const months = hasRevenueHistory ? getHostMonths(state, hostId) : [];
  const visitMonths = !hasRevenueHistory && host ? getListingVisitMonths(host.destinationId) : [];

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Báo cáo</h1>
      <p class="text-sm text-muted">${hasRevenueHistory ? 'Doanh thu/khách 12 tháng là dữ liệu mô phỏng cho mục đích trình diễn (xem DEMO_DATA.md); tháng hiện tại lấy từ booking thật để khớp với Lịch & Booking.' : 'Địa điểm miễn phí — không có doanh thu vé, biểu đồ dưới đây là lượt ghé mô phỏng cho mục đích trình diễn.'}</p>
    </div>
    ${hasRevenueHistory ? `
      <div class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Doanh thu theo tháng</h3>
        <canvas id="revenue-chart" height="220"></canvas>
      </div>
      <div class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Khách tham gia theo tháng</h3>
        <canvas id="visitors-chart" height="220"></canvas>
      </div>
    ` : `
      <div class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Lượt ghé theo tháng</h3>
        <canvas id="visits-chart" height="220"></canvas>
      </div>
    `}

    <div class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Những điều khách yêu thích</h3>
        <span class="text-sm text-faint">Tỷ trọng trên tổng lượt lựa chọn lời khen</span>
      </div>
      ${tagItems.length ? '<canvas id="tags-donut-chart" height="220"></canvas>' : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa có tag nào được khách chọn.</p>'}
    </div>

    <div class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Phân bố đánh giá 1–5 sao</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">${formatRatingStats(ratingStats)} — phân bố ước lượng từ mẫu review hiển thị (không phải toàn bộ ${ratingStats.reviewCount} lượt đánh giá lịch sử).</p>
      <canvas id="rating-dist-chart" height="180"></canvas>
    </div>

    ${cpsBlockHtml(cps)}

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Gợi ý cải thiện từ dữ liệu vận hành</h3>
      <div class="flex-col gap-3" id="suggestions-list">${suggestionsHtml(suggestions)}</div>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Gợi ý cải thiện từ đánh giá khách</h3>
      <div class="flex-col gap-3">${contentRecommendationsHtml(contentRecs)}</div>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Phản hồi gần đây</h3>
      <div class="flex-col gap-2">${feedbackListHtml(recentReviews)}</div>
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
    if (hasRevenueHistory) {
      const labels = months.map((m) => m.label);
      createChart(Chart, qs('#revenue-chart', container), 'revenue-chart', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Doanh thu (đ)', data: months.map((m) => m.grossRevenue), backgroundColor: CHART_COLORS[0] }] },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${formatMoney(ctx.parsed.y)}` } } },
          scales: { y: { ticks: { callback: (v) => new Intl.NumberFormat('vi-VN').format(v) } } },
        },
      });
      createChart(Chart, qs('#visitors-chart', container), 'visitors-chart', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Khách tham gia', data: months.map((m) => m.participants), backgroundColor: CHART_COLORS[1] }] },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    } else if (visitMonths.length) {
      const labels = visitMonths.map((m) => m.label);
      createChart(Chart, qs('#visits-chart', container), 'visits-chart', {
        type: 'line',
        data: { labels, datasets: [{ label: 'Lượt ghé', data: visitMonths.map((m) => m.visitInstances), borderColor: CHART_COLORS[2], backgroundColor: `${CHART_COLORS[2]}33`, fill: true, tension: 0.3 }] },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    }

    if (tagItems.length) {
      createChart(Chart, qs('#tags-donut-chart', container), 'tags-donut-chart', {
        type: 'doughnut',
        data: {
          labels: tagItems.map((t) => t.tag),
          datasets: [{ data: tagItems.map((t) => t.count), backgroundColor: CHART_COLORS.slice(0, tagItems.length) }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${(ctx.parsed / tagItems.reduce((s, t) => s + t.count, 0) * 100).toFixed(1)}% (${ctx.parsed} lượt chọn)` } },
          },
        },
      });
    }

    createChart(Chart, qs('#rating-dist-chart', container), 'rating-dist-chart', {
      type: 'bar',
      data: { labels: ['1 sao', '2 sao', '3 sao', '4 sao', '5 sao'], datasets: [{ label: 'Số lượt (mẫu)', data: distribution, backgroundColor: CHART_COLORS[3] }] },
      options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } },
    });
  }).catch(() => {
    const fallback = '<p class="text-sm text-faint">Không tải được thư viện biểu đồ (mạng chặn CDN) — xem số liệu dạng bảng ở các mục trên.</p>';
    qs('.card', container)?.insertAdjacentHTML('afterend', fallback);
  });
}
