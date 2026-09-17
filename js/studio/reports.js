import { getState, setSuggestionDecision } from '../storage.js';
import { escapeHtml, formatMoney, qs, qsa } from '../utils.js';
import { computeCps, cpsStatusLabel, generateSuggestions, CPS_WEIGHTS } from '../services/cpsService.js';
import { NotificationService } from '../services/notificationService.js';
import { getRatingStatsForListingIds, getRatingDistribution, getDisplayReviewsForListingIds, formatRatingStats } from '../services/reviewsService.js';
import { getHostMonths, getHostKpis, getListingVisitMonths, getTopTagShares, generateHostRecommendations } from '../services/metricsService.js';
import { historicalMetrics } from '../../data/pilot-seed-data.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import { t, localize, registerTranslations, getCurrentLanguage } from '../services/i18nService.js';
import { localizeTag } from '../services/tagCatalog.js';

registerTranslations('host', {
  reports: {
    title: 'Báo cáo',
    subtitleRevenue: 'Doanh thu và khách tham gia trong 12 tháng gần nhất.',
    subtitleFree: 'Địa điểm miễn phí — không có doanh thu vé, biểu đồ dưới đây là lượt ghé trong 12 tháng gần nhất.',
    revenueByMonth: 'Doanh thu theo tháng',
    guestsByMonth: 'Khách tham gia theo tháng',
    visitsByMonth: 'Lượt ghé theo tháng',
    whatGuestsLove: 'Những điều khách yêu thích',
    tagShareNote: 'Tỷ trọng trên tổng lượt lựa chọn lời khen',
    noTagsChosen: 'Chưa có tag nào được khách chọn.',
    otherTag: 'Khác',
    ratingDistTitle: 'Phân bố đánh giá 1–5 sao',
    ratingDistNote: '{stats} — phân bố ước lượng từ mẫu review hiển thị (không phải toàn bộ {count} lượt đánh giá lịch sử).',
    opsSuggestionsTitle: 'Gợi ý cải thiện từ dữ liệu vận hành',
    noSuggestions: 'Chưa có gợi ý nào — dữ liệu hiện tại chưa cho thấy vấn đề cụ thể.',
    basis: 'Căn cứ: {value}',
    dismissed: 'Đã bỏ qua',
    markedDone: 'Đã đánh dấu đã làm',
    handle: 'Xử lý',
    dismiss: 'Bỏ qua',
    markDone: 'Đánh dấu đã làm',
    reviewSuggestionsTitle: 'Gợi ý cải thiện từ đánh giá khách',
    noReviewSuggestions: 'Chưa đủ dữ liệu đánh giá để đưa ra gợi ý cụ thể.',
    strength: 'Điểm mạnh',
    issue: 'Cần xem lại',
    opportunity: 'Cơ hội',
    recentFeedbackTitle: 'Phản hồi gần đây',
    noFeedback: 'Chưa có phản hồi nào.',
    guest: 'Khách',
    cpsInternal: 'CPS nội bộ: {score}/100',
    responseRate: 'Tỷ lệ phản hồi',
    completionRate: 'Tỷ lệ hoàn thành',
    notEnoughData: 'Chưa đủ dữ liệu',
    avgRating: 'Đánh giá trung bình',
    noneYet: 'Chưa có',
    scoreFormula: 'Công thức tính điểm: {response}% phản hồi + {completion}% hoàn thành + {rating}% đánh giá.',
    excludedBookings: ' Đã loại trừ {count} booking khỏi kỳ đánh giá theo ngoại lệ đã duyệt.',
    updatedNotify: 'Đã cập nhật.',
    revenueLabel: 'Doanh thu (đ)',
    guestsLabel: 'Khách tham gia',
    visitsLabel: 'Lượt ghé',
    selectionsTooltip: '{pct}% ({count} lượt chọn)',
    starLabel: '{n} sao',
    sampleCountLabel: 'Số lượt (mẫu)',
    chartLoadError: 'Không tải được thư viện biểu đồ (mạng chặn CDN) — xem số liệu dạng bảng ở các mục trên.',
  },
}, {
  reports: {
    title: 'Reports',
    subtitleRevenue: 'Revenue and guests over the last 12 months.',
    subtitleFree: 'Free-entry site — no ticket revenue; the chart below shows visits over the last 12 months.',
    revenueByMonth: 'Revenue by month',
    guestsByMonth: 'Guests by month',
    visitsByMonth: 'Visits by month',
    whatGuestsLove: 'What guests love',
    tagShareNote: 'Share of total praise-tag selections',
    noTagsChosen: 'No tags selected by guests yet.',
    otherTag: 'Other',
    ratingDistTitle: '1–5 star rating distribution',
    ratingDistNote: '{stats} — distribution estimated from the displayed review sample (not all {count} historical reviews).',
    opsSuggestionsTitle: 'Suggestions from operational data',
    noSuggestions: 'No suggestions yet — current data shows no specific issues.',
    basis: 'Basis: {value}',
    dismissed: 'Dismissed',
    markedDone: 'Marked done',
    handle: 'Handle',
    dismiss: 'Dismiss',
    markDone: 'Mark done',
    reviewSuggestionsTitle: 'Suggestions from guest reviews',
    noReviewSuggestions: 'Not enough review data yet for specific suggestions.',
    strength: 'Strength',
    issue: 'Needs review',
    opportunity: 'Opportunity',
    recentFeedbackTitle: 'Recent feedback',
    noFeedback: 'No feedback yet.',
    guest: 'Guest',
    cpsInternal: 'Internal CPS: {score}/100',
    responseRate: 'Response rate',
    completionRate: 'Completion rate',
    notEnoughData: 'Not enough data',
    avgRating: 'Average rating',
    noneYet: 'None yet',
    scoreFormula: 'Score formula: {response}% response + {completion}% completion + {rating}% rating.',
    excludedBookings: ' {count} bookings excluded from the review period under approved exceptions.',
    updatedNotify: 'Updated.',
    revenueLabel: 'Revenue (VND)',
    guestsLabel: 'Guests',
    visitsLabel: 'Visits',
    selectionsTooltip: '{pct}% ({count} selections)',
    starLabel: '{n} star',
    sampleCountLabel: 'Count (sample)',
    chartLoadError: 'Could not load the chart library (network blocked the CDN) — see the tabular figures in the sections above.',
  },
});

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
        <h3 style="margin:0;">${t('host.reports.cpsInternal', { score: cps.score })}</h3>
        <span class="badge ${statusCls}">${escapeHtml(cpsStatusLabel(cps.status))}</span>
      </div>
      <div class="quick-facts" style="margin-top:10px;">
        <div class="quick-fact"><span class="quick-fact__label">${t('host.reports.responseRate')}</span><span class="quick-fact__value">${cps.components.responseRate}%</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.reports.completionRate')}</span><span class="quick-fact__value">${cps.components.completionRate === null ? t('host.reports.notEnoughData') : `${cps.components.completionRate}%`}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.reports.avgRating')}</span><span class="quick-fact__value">${cps.components.avgRating === null ? t('host.reports.noneYet') : `⭐ ${cps.components.avgRating} (${cps.components.reviewCount})`}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:8px;">${t('host.reports.scoreFormula', { response: Math.round(CPS_WEIGHTS.response * 100), completion: Math.round(CPS_WEIGHTS.completion * 100), rating: Math.round(CPS_WEIGHTS.rating * 100) })}${cps.note ? ` ${escapeHtml(cps.note)}` : ''}${cps.excludedCount ? t('host.reports.excludedBookings', { count: cps.excludedCount }) : ''}</p>
    </div>
  `;
}

function suggestionsHtml(suggestions) {
  if (!suggestions.length) return `<p class="text-sm text-faint">${t('host.reports.noSuggestions')}</p>`;
  return suggestions.map((s) => `
    <div class="activity-card" data-suggestion="${s.id}">
      <strong>${escapeHtml(s.title)}</strong>
      <p class="text-sm text-muted" style="margin:4px 0;">${t('host.reports.basis', { value: escapeHtml(s.basis) })}</p>
      <p class="text-sm" style="margin:0;">${escapeHtml(s.action)}</p>
      ${s.decision ? `<span class="badge badge-demo" style="margin-top:6px;">${s.decision === 'dismissed' ? t('host.reports.dismissed') : t('host.reports.markedDone')}</span>` : `
        <div class="cta-row" style="margin-top:6px;">
          <a class="btn btn-secondary btn-sm" href="${s.actionHref}">${t('host.reports.handle')}</a>
          <button type="button" class="btn btn-ghost btn-sm" data-decide="dismissed">${t('host.reports.dismiss')}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-decide="done">${t('host.reports.markDone')}</button>
        </div>
      `}
    </div>
  `).join('');
}

function contentRecommendationsHtml(recs) {
  if (!recs.length) return `<p class="text-sm text-faint">${t('host.reports.noReviewSuggestions')}</p>`;
  const kindCls = { strength: 'badge-free', opportunity: 'badge-type', issue: 'badge-recognized' };
  const kindLabel = { strength: t('host.reports.strength'), issue: t('host.reports.issue'), opportunity: t('host.reports.opportunity') };
  return recs.map((r) => `
    <div class="activity-card">
      <strong>${escapeHtml(r.title)}</strong>
      <p class="text-sm text-muted" style="margin:4px 0;">${t('host.reports.basis', { value: escapeHtml(r.basis) })}</p>
      <p class="text-sm" style="margin:0;"><span class="badge ${kindCls[r.kind] || 'badge-type'}" style="margin-right:6px;">${kindLabel[r.kind] || kindLabel.opportunity}</span>${escapeHtml(r.action)}</p>
    </div>
  `).join('');
}

function feedbackListHtml(reviews) {
  if (!reviews.length) return `<p class="text-sm text-faint">${t('host.reports.noFeedback')}</p>`;
  return reviews.map((r) => `
    <div class="card" style="padding:12px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <strong>${'★'.repeat(Math.round(r.overallRating))}${'☆'.repeat(5 - Math.round(r.overallRating))}</strong>
        <span class="text-sm text-faint">${escapeHtml(r.travellerName || t('host.reports.guest'))}</span>
      </div>
      ${r.comment ? `<p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(localize(r.comment))}</p>` : ''}
      ${(r.selectedTags || []).length ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${r.selectedTags.map((tagId) => escapeHtml(localizeTag(tagId))).join(' · ')}</p>` : ''}
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
      <h1 style="margin-bottom:4px;">${t('host.reports.title')}</h1>
      <p class="text-sm text-muted">${hasRevenueHistory ? t('host.reports.subtitleRevenue') : t('host.reports.subtitleFree')}</p>
    </div>
    ${hasRevenueHistory ? `
      <div class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('host.reports.revenueByMonth')}</h3>
        <canvas id="revenue-chart" height="220"></canvas>
      </div>
      <div class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('host.reports.guestsByMonth')}</h3>
        <canvas id="visitors-chart" height="220"></canvas>
      </div>
    ` : `
      <div class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('host.reports.visitsByMonth')}</h3>
        <canvas id="visits-chart" height="220"></canvas>
      </div>
    `}

    <div class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">${t('host.reports.whatGuestsLove')}</h3>
        <span class="text-sm text-faint">${t('host.reports.tagShareNote')}</span>
      </div>
      ${tagItems.length ? '<canvas id="tags-donut-chart" height="220"></canvas>' : `<p class="text-sm text-faint" style="margin-top:10px;">${t('host.reports.noTagsChosen')}</p>`}
    </div>

    <div class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('host.reports.ratingDistTitle')}</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">${t('host.reports.ratingDistNote', { stats: formatRatingStats(ratingStats), count: ratingStats.reviewCount })}</p>
      <canvas id="rating-dist-chart" height="180"></canvas>
    </div>

    ${cpsBlockHtml(cps)}

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('host.reports.opsSuggestionsTitle')}</h3>
      <div class="flex-col gap-3" id="suggestions-list">${suggestionsHtml(suggestions)}</div>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('host.reports.reviewSuggestionsTitle')}</h3>
      <div class="flex-col gap-3">${contentRecommendationsHtml(contentRecs)}</div>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('host.reports.recentFeedbackTitle')}</h3>
      <div class="flex-col gap-2">${feedbackListHtml(recentReviews)}</div>
    </section>
  `;

  qsa('[data-decide]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-suggestion]').dataset.suggestion;
      setSuggestionDecision(id, btn.dataset.decide);
      NotificationService.notify(t('host.reports.updatedNotify'), 'success');
      renderReports(container, hostId);
    });
  });

  loadChartJs().then((Chart) => {
    if (hasRevenueHistory) {
      const labels = months.map((m) => m.label);
      createChart(Chart, qs('#revenue-chart', container), 'revenue-chart', {
        type: 'bar',
        data: { labels, datasets: [{ label: t('host.reports.revenueLabel'), data: months.map((m) => m.grossRevenue), backgroundColor: CHART_COLORS[0] }] },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${formatMoney(ctx.parsed.y)}` } } },
          scales: { y: { ticks: { callback: (v) => new Intl.NumberFormat(getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US').format(v) } } },
        },
      });
      createChart(Chart, qs('#visitors-chart', container), 'visitors-chart', {
        type: 'bar',
        data: { labels, datasets: [{ label: t('host.reports.guestsLabel'), data: months.map((m) => m.participants), backgroundColor: CHART_COLORS[1] }] },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    } else if (visitMonths.length) {
      const labels = visitMonths.map((m) => m.label);
      createChart(Chart, qs('#visits-chart', container), 'visits-chart', {
        type: 'line',
        data: { labels, datasets: [{ label: t('host.reports.visitsLabel'), data: visitMonths.map((m) => m.visitInstances), borderColor: CHART_COLORS[2], backgroundColor: `${CHART_COLORS[2]}33`, fill: true, tension: 0.3 }] },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    }

    if (tagItems.length) {
      createChart(Chart, qs('#tags-donut-chart', container), 'tags-donut-chart', {
        type: 'doughnut',
        data: {
          labels: tagItems.map((it) => (it.tag === '__other__' ? t('host.reports.otherTag') : localizeTag(it.tag))),
          datasets: [{ data: tagItems.map((it) => it.count), backgroundColor: CHART_COLORS.slice(0, tagItems.length) }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${t('host.reports.selectionsTooltip', { pct: (ctx.parsed / tagItems.reduce((s, it) => s + it.count, 0) * 100).toFixed(1), count: ctx.parsed })}` } },
          },
        },
      });
    }

    createChart(Chart, qs('#rating-dist-chart', container), 'rating-dist-chart', {
      type: 'bar',
      data: { labels: [1, 2, 3, 4, 5].map((n) => t('host.reports.starLabel', { n })), datasets: [{ label: t('host.reports.sampleCountLabel'), data: distribution, backgroundColor: CHART_COLORS[3] }] },
      options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } },
    });
  }).catch(() => {
    const fallback = `<p class="text-sm text-faint">${t('host.reports.chartLoadError')}</p>`;
    qs('.card', container)?.insertAdjacentHTML('afterend', fallback);
  });
}
