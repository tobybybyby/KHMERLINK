import { getState } from '../storage.js';
import { escapeHtml, formatMoney, formatDateShort } from '../utils.js';
import { adminFilters, filterBarHtml, wireFilterBar } from './filters.js';
import {
  getNetworkKpis, getNetworkMonthlyRevenue, getParticipantsAndVisitsSeries,
  getRevenueByProviderDonut, getRevenueByType, getRatingByListingBar, getTopFeedbackTable,
} from './networkMetrics.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import { qs } from '../utils.js';

function pendingProposalsHtml(state) {
  const pending = state.proposals.filter((p) => ['sent', 'reviewing', 'needs_info'].includes(p.status));
  if (!pending.length) return '<p class="text-sm text-faint">Không có đề án nào đang chờ xử lý.</p>';
  const STATUS_LABEL = { sent: 'Đã gửi', reviewing: 'Đang xem xét', needs_info: 'Cần bổ sung' };
  return `
    <table class="admin-table">
      <thead><tr><th>Tiêu đề</th><th>Hộ gửi</th><th>Trạng thái</th><th>Ngày gửi</th></tr></thead>
      <tbody>
        ${pending.map((p) => {
          const host = state.hosts.find((h) => h.id === p.hostId);
          return `<tr><td>${escapeHtml(p.title)}</td><td>${host ? escapeHtml(host.name) : '—'}</td><td>${escapeHtml(STATUS_LABEL[p.status] || p.status)}</td><td>${formatDateShort(p.createdAt)}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
    <a class="btn btn-secondary btn-sm" href="#/admin/proposals" style="margin-top:10px;">Xem đầy đủ Đề án hỗ trợ →</a>
  `;
}

function topFeedbackHtml(rows) {
  if (!rows.length) return '<p class="text-sm text-faint">Chưa có đánh giá nào trong phạm vi lọc.</p>';
  return `
    <table class="admin-table">
      <thead><tr><th>Listing</th><th>Sao</th><th>Nhận xét</th><th>Ngày</th></tr></thead>
      <tbody>
        ${rows.map((r) => `<tr><td>${escapeHtml(r.listingName)}</td><td>${'★'.repeat(Math.round(r.overallRating))}${'☆'.repeat(5 - Math.round(r.overallRating))}</td><td>${escapeHtml(r.comment || '')}</td><td>${formatDateShort(r.createdAt)}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}

export function renderAdminOverview(container) {
  const state = getState();
  const kpi = getNetworkKpis(state);
  const monthlyRevenue = getNetworkMonthlyRevenue(state);
  const series = getParticipantsAndVisitsSeries(state);
  const providerDonut = getRevenueByProviderDonut(state);
  const revenueByType = getRevenueByType(state);
  const ratingByListing = getRatingByListingBar(state);
  const topFeedback = getTopFeedbackTable(state, 8);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Tổng quan mạng lưới pilot</h1>
      <p class="text-sm text-muted">Doanh thu ghi nhận qua mạng lưới pilot — tổng hợp trực tiếp từ dữ liệu các host/listing, không phải số liệu du lịch chính thức của tỉnh.</p>
    </div>
    ${filterBarHtml(state)}

    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">Tổng lượt trải nghiệm</span><span class="quick-fact__value">${kpi.totalExperienceInstances.toLocaleString('vi-VN')}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Booking hoàn thành</span><span class="quick-fact__value">${kpi.totalCompletedBookings.toLocaleString('vi-VN')}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Doanh thu qua nền tảng</span><span class="quick-fact__value">${formatMoney(kpi.totalGrossRevenue)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Thu nhập chuyển cho hộ/nghệ nhân</span><span class="quick-fact__value">${formatMoney(kpi.totalProviderIncome)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Điểm đánh giá (trọng số)</span><span class="quick-fact__value">${kpi.weightedAverageRating === null ? '—' : `⭐ ${kpi.weightedAverageRating.toFixed(1)} (${kpi.totalReviewCount})`}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ muốn giới thiệu</span><span class="quick-fact__value">${kpi.recommendRate === null ? '—' : `${Math.round(kpi.recommendRate * 100)}%`}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Host đang hoạt động</span><span class="quick-fact__value">${kpi.activeHostCount}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Booking cần xử lý</span><span class="quick-fact__value">${kpi.pendingBookings}</span></div>
    </div>
    <p class="text-sm text-faint" style="margin-top:-6px;">"Tổng lượt trải nghiệm" gộp khách tham gia hoạt động trả phí + lượt ghé điểm miễn phí, không đếm trùng 1 lượt trải nghiệm ở 2 chỉ số. Điểm đánh giá trung bình có trọng số theo số lượt đánh giá thật của từng listing, không phải trung bình cộng của 7 con số.</p>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Doanh thu ghi nhận qua mạng lưới pilot theo tháng</h3>
      <canvas id="net-revenue-chart" height="220"></canvas>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Lượt tham gia và lượt ghé theo tháng</h3>
      <canvas id="net-participation-chart" height="220"></canvas>
    </section>

    <div class="flex gap-4 wrap">
      <section class="card" style="padding:20px;flex:1;min-width:280px;">
        <h3 style="margin-top:0;">Phân bổ doanh thu theo đơn vị cung cấp</h3>
        ${providerDonut.rows.length ? '<canvas id="net-provider-donut" height="240"></canvas>' : '<p class="text-sm text-faint">Chưa có doanh thu nào trong phạm vi lọc.</p>'}
      </section>
      <section class="card" style="padding:20px;flex:1;min-width:280px;">
        <h3 style="margin-top:0;">Doanh thu theo loại hình</h3>
        ${revenueByType.length ? '<canvas id="net-type-chart" height="240"></canvas>' : '<p class="text-sm text-faint">Chưa có doanh thu nào trong phạm vi lọc.</p>'}
      </section>
    </div>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Điểm đánh giá theo listing</h3>
      ${ratingByListing.length ? '<canvas id="net-rating-chart" height="220"></canvas>' : '<p class="text-sm text-faint">Chưa có đánh giá nào trong phạm vi lọc.</p>'}
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Top phản hồi và nhu cầu cải thiện</h3>
      ${topFeedbackHtml(topFeedback)}
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Đề án hỗ trợ đang chờ xử lý</h3>
      ${pendingProposalsHtml(state)}
    </section>
  `;

  wireFilterBar(container, () => renderAdminOverview(container));

  loadChartJs().then((Chart) => {
    createChart(Chart, qs('#net-revenue-chart', container), 'net-revenue-chart', {
      type: 'bar',
      data: { labels: monthlyRevenue.map((m) => m.label), datasets: [{ label: 'Doanh thu (đ)', data: monthlyRevenue.map((m) => m.revenue), backgroundColor: CHART_COLORS[0] }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) } } },
        scales: { y: { ticks: { callback: (v) => new Intl.NumberFormat('vi-VN').format(v) } } },
      },
    });

    createChart(Chart, qs('#net-participation-chart', container), 'net-participation-chart', {
      type: 'line',
      data: {
        labels: series.map((m) => m.label),
        datasets: [
          { label: 'Lượt tham gia (trả phí)', data: series.map((m) => m.participants), borderColor: CHART_COLORS[1], backgroundColor: `${CHART_COLORS[1]}33`, fill: true, tension: 0.3 },
          { label: 'Lượt ghé (miễn phí)', data: series.map((m) => m.visits), borderColor: CHART_COLORS[2], backgroundColor: `${CHART_COLORS[2]}33`, fill: true, tension: 0.3 },
        ],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });

    if (providerDonut.rows.length) {
      createChart(Chart, qs('#net-provider-donut', container), 'net-provider-donut', {
        type: 'doughnut',
        data: {
          labels: providerDonut.rows.map((r) => `${r.name} (${r.categoryLabel})`),
          datasets: [{ data: providerDonut.rows.map((r) => r.revenue), backgroundColor: CHART_COLORS.slice(0, providerDonut.rows.length) }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatMoney(ctx.parsed)} (${(ctx.parsed / providerDonut.total * 100).toFixed(1)}%)` } },
          },
        },
      });
    }

    if (revenueByType.length) {
      createChart(Chart, qs('#net-type-chart', container), 'net-type-chart', {
        type: 'bar',
        data: { labels: revenueByType.map((r) => r.label), datasets: [{ label: 'Doanh thu (đ)', data: revenueByType.map((r) => r.revenue), backgroundColor: CHART_COLORS[4] }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => new Intl.NumberFormat('vi-VN').format(v) } } } },
      });
    }

    if (ratingByListing.length) {
      createChart(Chart, qs('#net-rating-chart', container), 'net-rating-chart', {
        type: 'bar',
        data: { labels: ratingByListing.map((r) => r.name), datasets: [{ label: 'Điểm đánh giá', data: ratingByListing.map((r) => Number(r.averageRating.toFixed(2))), backgroundColor: CHART_COLORS[5] }] },
        options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 5 } } },
      });
    }
  }).catch(() => {
    qs('#net-revenue-chart', container)?.insertAdjacentHTML('afterend', '<p class="text-sm text-faint">Không tải được thư viện biểu đồ (mạng chặn CDN) — xem số liệu ở bảng bên dưới.</p>');
  });
}
