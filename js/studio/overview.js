import { getState } from '../storage.js';
import { escapeHtml, formatCurrency, formatMoney, formatDateShort, categoryEmoji, destinationImageSrc, qs } from '../utils.js';
import { reapExpiredHolds } from '../services/bookingService.js';
import { computeLiveCurrentMonth } from './reports.js';

function hostExperiences(state, hostId) {
  return state.experiences.filter((e) => e.hostId === hostId);
}

export function renderOverview(container, hostId) {
  reapExpiredHolds();
  const state = getState();
  const host = state.hosts.find((h) => h.id === hostId);
  const exps = hostExperiences(state, hostId);
  const expIds = new Set(exps.map((e) => e.id));
  const items = state.bookingItems.filter((bi) => expIds.has(bi.experienceId));

  const completed = items.filter((bi) => bi.status === 'completed');
  const accepted = items.filter((bi) => bi.status === 'accepted');
  const pending = items.filter((bi) => bi.status === 'pending');

  // Số liệu 11 tháng trước lấy từ cùng nguồn minh hoạ với biểu đồ ở Báo cáo (state.metrics.monthlyByHost) —
  // không phát sinh dữ liệu mới, chỉ cộng thêm phần booking thật của phiên demo hiện tại lên trên nền đó
  // để "Tổng quan" không hiện 0đ/0 khách khi chưa có ai đặt trải nghiệm thật.
  const monthly = (state.metrics.monthlyByHost && state.metrics.monthlyByHost[hostId]) || [];
  const historicalMonths = monthly.slice(0, -1);
  const historicalRevenue = historicalMonths.reduce((sum, m) => sum + m.revenue, 0);
  const historicalVisitors = historicalMonths.reduce((sum, m) => sum + m.visitors, 0);

  const grossRevenue = historicalRevenue + [...completed, ...accepted].reduce((sum, bi) => sum + bi.subtotal, 0);
  const guestsServed = historicalVisitors + completed.reduce((sum, bi) => sum + bi.quantity, 0);

  const live = computeLiveCurrentMonth(state, hostId);
  const displayMonths = monthly.map((m, i) => (i === monthly.length - 1 && live.hasRealData ? { ...m, revenue: live.revenue, visitors: live.visitors } : m));
  const maxRevenue = Math.max(1, ...displayMonths.map((m) => m.revenue));

  const destIds = Array.from(new Set(exps.map((e) => e.destinationId)));
  const allReviews = [...state.reviews, ...state.userReviews].filter((r) => destIds.includes(r.destinationId));
  const avgRating = allReviews.length ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1) : '—';

  const holdingBookingIds = new Set(state.bookings.filter((b) => b.payoutStatus === 'holding').map((b) => b.id));
  const releasedBookingIds = new Set(state.bookings.filter((b) => b.payoutStatus === 'released').map((b) => b.id));
  const holdingAmount = completed.filter((bi) => holdingBookingIds.has(bi.bookingId)).reduce((s, bi) => s + bi.subtotal, 0);
  const releasedAmount = completed.filter((bi) => releasedBookingIds.has(bi.bookingId)).reduce((s, bi) => s + bi.subtotal, 0);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Tổng quan${host ? ` — ${escapeHtml(host.name)}` : ''}</h1>
      <p class="text-sm text-muted">Số liệu tính từ dữ liệu booking dùng chung với Trail trong phiên demo này.</p>
    </div>

    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">Tổng doanh thu</span><span class="quick-fact__value">${formatMoney(grossRevenue)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Khách đã phục vụ</span><span class="quick-fact__value">${guestsServed}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Trải nghiệm đã tổ chức</span><span class="quick-fact__value">${completed.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Điểm sao</span><span class="quick-fact__value">⭐ ${avgRating}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Booking cần phản hồi</span><span class="quick-fact__value">${pending.length}</span></div>
    </div>
    ${historicalMonths.length ? `<p class="text-sm text-faint" style="margin-top:-6px;">Doanh thu và khách đã phục vụ gồm 11 tháng số liệu minh hoạ (như biểu đồ ở Báo cáo) cộng dồn với booking thật phát sinh trong phiên demo này.</p>` : `<p class="text-sm text-faint" style="margin-top:-6px;">Chưa có dữ liệu minh hoạ cho host này — số liệu trên chỉ tính từ booking thật phát sinh trong phiên demo.</p>`}

    <div class="quick-facts">
      <div class="quick-fact"><span class="quick-fact__label">Tiền chờ nhận (đang giữ)</span><span class="quick-fact__value">${formatMoney(holdingAmount)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đã nhận (đã giải ngân)</span><span class="quick-fact__value">${formatMoney(releasedAmount)}</span></div>
    </div>

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Doanh thu 12 tháng gần nhất</h3>
        <a class="btn btn-secondary btn-sm" href="#/studio/reports">Xem báo cáo đầy đủ →</a>
      </div>
      <div class="flex items-end gap-1" style="margin-top:14px;height:120px;">
        ${displayMonths.map((m) => `
          <div class="flex-col items-center gap-1" style="flex:1;height:100%;justify-content:flex-end;" title="${escapeHtml(m.label)}: ${formatMoney(m.revenue)}">
            <div style="width:100%;max-width:22px;background:var(--color-primary,#6b4423);border-radius:3px 3px 0 0;height:${Math.max(4, Math.round((m.revenue / maxRevenue) * 100))}%;"></div>
            <span class="text-sm text-faint" style="font-size:11px;">${escapeHtml(m.label)}</span>
          </div>
        `).join('')}
      </div>
    </section>

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

    <section>
      <div class="section-title">
        <h2>Dịch vụ của bạn</h2>
        <a class="btn btn-accent btn-sm" href="#/studio/experiences">➕ Thêm trải nghiệm</a>
      </div>
      <div class="flex-col gap-3">
        ${exps.map((exp) => {
          const dest = state.destinations.find((d) => d.id === exp.destinationId);
          const expItems = items.filter((bi) => bi.experienceId === exp.id);
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
