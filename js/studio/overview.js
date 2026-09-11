import { getState } from '../storage.js';
import { escapeHtml, formatCurrency, formatMoney, formatDateShort, categoryEmoji, destinationImageSrc, qs } from '../utils.js';
import { reapExpiredHolds } from '../services/bookingService.js';
import { getRatingStatsForListingIds, getDisplayReviewsForListingIds, formatRatingStats } from '../services/reviewsService.js';
import { getHostMonths, getHostKpis, getListingVisitMonths } from '../services/metricsService.js';
import { historicalMetrics } from '../../data/pilot-seed-data.js';

function hostExperiences(state, hostId) {
  return state.experiences.filter((e) => e.hostId === hostId);
}

function pctBadge(pct) {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return '<span class="text-sm text-faint">so với tháng trước: —</span>';
  const sign = pct > 0 ? '+' : '';
  const cls = pct > 0 ? 'badge-free' : pct < 0 ? 'badge-recognized' : 'badge-type';
  return `<span class="badge ${cls}" style="margin-left:6px;">${sign}${pct.toFixed(1)}% so với tháng trước</span>`;
}

export function renderOverview(container, hostId) {
  reapExpiredHolds();
  const state = getState();
  const host = state.hosts.find((h) => h.id === hostId);
  const exps = hostExperiences(state, hostId);
  const pending = state.bookingItems.filter((bi) => exps.some((e) => e.id === bi.experienceId) && bi.status === 'pending');

  const listingIds = host ? [host.destinationId] : [];
  const ratingStats = getRatingStatsForListingIds(state, listingIds);
  const recentReviews = getDisplayReviewsForListingIds(state, listingIds).slice(0, 5);
  const hasRevenueHistory = historicalMetrics.some((r) => r.providerId === hostId);

  const holdingBookingIds = new Set(state.bookings.filter((b) => b.payoutStatus === 'holding').map((b) => b.id));
  const releasedBookingIds = new Set(state.bookings.filter((b) => b.payoutStatus === 'released').map((b) => b.id));
  const completedItems = state.bookingItems.filter((bi) => exps.some((e) => e.id === bi.experienceId) && bi.status === 'completed');
  const holdingAmount = completedItems.filter((bi) => holdingBookingIds.has(bi.bookingId)).reduce((s, bi) => s + bi.subtotal, 0);
  const releasedAmount = completedItems.filter((bi) => releasedBookingIds.has(bi.bookingId)).reduce((s, bi) => s + bi.subtotal, 0);

  let kpiHtml;
  let chartSectionHtml;
  if (hasRevenueHistory) {
    const kpi = getHostKpis(state, hostId);
    const months = getHostMonths(state, hostId);
    const maxRevenue = Math.max(1, ...months.map((m) => m.grossRevenue));
    const isMuseumTicket = host && state.destinations.find((d) => d.id === host.destinationId)?.providerType === 'cultural_organisation';
    kpiHtml = `
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">Khách tham gia tháng này</span><span class="quick-fact__value">${kpi.participants}${pctBadge(kpi.participantsChangePct)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Booking hoàn thành</span><span class="quick-fact__value">${kpi.completedBookings}${pctBadge(kpi.completedBookingsChangePct)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Doanh thu gộp</span><span class="quick-fact__value">${formatMoney(kpi.grossRevenue)}${pctBadge(kpi.grossRevenueChangePct)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${isMuseumTicket ? 'Thu nhập vé (sau phí nền tảng)' : 'Thu nhập dự kiến của hộ'}</span><span class="quick-fact__value">${formatMoney(kpi.providerIncome)}${pctBadge(kpi.providerIncomeChangePct)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Điểm đánh giá</span><span class="quick-fact__value">${formatRatingStats(ratingStats)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ muốn giới thiệu</span><span class="quick-fact__value">${kpi.recommendRate === null ? '—' : `${Math.round(kpi.recommendRate * 100)}% (${kpi.recommendSample} lượt trả lời)`}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ huỷ</span><span class="quick-fact__value">${kpi.cancellationRate === null ? '—' : `${kpi.cancellationRate.toFixed(1)}%`}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Booking cần phản hồi</span><span class="quick-fact__value">${kpi.pendingBookings}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:-6px;">Doanh thu gộp không phải thu nhập ròng của hộ — đã trừ phí nền tảng (10%, minh hoạ) và hoàn tiền (nếu có) để ra thu nhập dự kiến. Dữ liệu 12 tháng là mô phỏng cho mục đích trình diễn (xem DEMO_DATA.md); tháng ${kpi.currentMonthLabel} lấy từ booking thật trong phiên demo.</p>
      <section class="card" style="padding:20px;">
        <div class="flex justify-between items-center gap-2 wrap">
          <h3 style="margin:0;">Doanh thu theo tháng</h3>
          <a class="btn btn-secondary btn-sm" href="#/studio/reports">Xem báo cáo đầy đủ →</a>
        </div>
        <div class="flex items-end gap-1" style="margin-top:14px;height:120px;">
          ${months.map((m) => `
            <div class="flex-col items-center gap-1" style="flex:1;height:100%;justify-content:flex-end;" title="${escapeHtml(m.label)}: ${formatMoney(m.grossRevenue)}">
              <div style="width:100%;max-width:22px;background:var(--color-primary,#6b4423);border-radius:3px 3px 0 0;height:${Math.max(4, Math.round((m.grossRevenue / maxRevenue) * 100))}%;"></div>
              <span class="text-sm text-faint" style="font-size:11px;">${escapeHtml(m.label)}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  } else {
    // Host quản lý điểm miễn phí (chùa/cụm) — không có doanh thu vé, hiển thị lượt ghé thay vì KPI tài chính.
    const visitMonths = host ? getListingVisitMonths(host.destinationId) : [];
    const maxVisits = Math.max(1, ...visitMonths.map((m) => m.visitInstances));
    const latestVisits = visitMonths[visitMonths.length - 1];
    kpiHtml = `
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">Lượt ghé tháng gần nhất</span><span class="quick-fact__value">${latestVisits ? latestVisits.visitInstances.toLocaleString('vi-VN') : '—'}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Điểm đánh giá</span><span class="quick-fact__value">${formatRatingStats(ratingStats)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Booking cần phản hồi</span><span class="quick-fact__value">${pending.length}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:-6px;">Địa điểm miễn phí — không có doanh thu vé, chỉ theo dõi lượt ghé và đánh giá. Dữ liệu lượt ghé 12 tháng là mô phỏng cho mục đích trình diễn (xem DEMO_DATA.md).</p>
      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Lượt ghé theo tháng</h3>
        <div class="flex items-end gap-1" style="margin-top:14px;height:120px;">
          ${visitMonths.map((m) => `
            <div class="flex-col items-center gap-1" style="flex:1;height:100%;justify-content:flex-end;" title="${escapeHtml(m.label)}: ${m.visitInstances} lượt">
              <div style="width:100%;max-width:22px;background:var(--color-primary,#6b4423);border-radius:3px 3px 0 0;height:${Math.max(4, Math.round((m.visitInstances / maxVisits) * 100))}%;"></div>
              <span class="text-sm text-faint" style="font-size:11px;">${escapeHtml(m.label)}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Tổng quan${host ? ` — ${escapeHtml(host.name)}` : ''}</h1>
      <p class="text-sm text-muted">Số liệu tính từ dữ liệu booking/đánh giá dùng chung với Trail và Cổng quản lý.</p>
    </div>

    ${kpiHtml}

    ${hasRevenueHistory ? `
    <div class="quick-facts">
      <div class="quick-fact"><span class="quick-fact__label">Tiền chờ nhận (đang giữ)</span><span class="quick-fact__value">${formatMoney(holdingAmount)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đã nhận (đã giải ngân)</span><span class="quick-fact__value">${formatMoney(releasedAmount)}</span></div>
    </div>
    ` : ''}

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Việc cần làm hôm nay</h3>
        <a class="btn btn-primary btn-sm" href="#/studio/bookings">Xem tất cả →</a>
      </div>
      ${pending.length ? `
        <div class="flex-col gap-2" style="margin-top:10px;">
          ${pending.slice(0, 5).map((bi) => `
            <div class="card" style="padding:12px;">
              <strong>${escapeHtml(bi.title)}</strong>
              <p class="text-sm text-muted" style="margin:2px 0 0;">${bi.quantity} khách · ${formatMoney(bi.subtotal)} · chờ từ ${formatDateShort(bi.statusHistory[0]?.at)}</p>
            </div>
          `).join('')}
        </div>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Không có booking nào đang chờ phản hồi.</p>'}
    </section>

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Đánh giá gần đây</h3>
        <span class="text-sm text-muted">${formatRatingStats(ratingStats)}</span>
      </div>
      ${recentReviews.length ? `
        <div class="flex-col gap-2" style="margin-top:10px;">
          ${recentReviews.map((r) => {
            const dest = state.destinations.find((d) => d.id === r.listingId);
            const booking = state.bookings.find((b) => b.id === r.bookingId);
            return `
              <div class="card" style="padding:12px;">
                <div class="flex justify-between items-center gap-2 wrap">
                  <strong>⭐ ${escapeHtml(String(r.overallRating))}${dest ? ` · ${escapeHtml(dest.name)}` : ''}</strong>
                  <span class="text-sm text-faint">${formatDateShort(r.createdAt)}</span>
                </div>
                ${r.comment ? `<p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(r.comment)}</p>` : ''}
                ${booking ? `<p class="text-sm text-faint" style="margin:4px 0 0;">Booking liên quan: ${escapeHtml(booking.code)}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa có đánh giá nào cho listing của bạn.</p>'}
    </section>

    <section>
      <div class="section-title">
        <h2>Dịch vụ của bạn</h2>
        <a class="btn btn-accent btn-sm" href="#/studio/experiences">➕ Thêm trải nghiệm</a>
      </div>
      <div class="flex-col gap-3">
        ${exps.map((exp) => {
          const dest = state.destinations.find((d) => d.id === exp.destinationId);
          const expItems = state.bookingItems.filter((bi) => bi.experienceId === exp.id);
          return `
            <div class="activity-card">
              <div class="activity-card__head">
                <strong>${dest ? `${categoryEmoji(dest.category)} ` : ''}${escapeHtml(exp.title)}</strong>
                <span class="activity-card__price">${formatCurrency(exp.price)}</span>
              </div>
              <p class="text-sm text-muted" style="margin:0;">${dest ? escapeHtml(dest.name) : ''} · ${expItems.length} booking trong phiên demo</p>
            </div>
          `;
        }).join('') || '<p class="text-sm text-faint">Chưa có trải nghiệm nào — bấm "Thêm trải nghiệm" để bắt đầu.</p>'}
      </div>
    </section>
  `;
}
