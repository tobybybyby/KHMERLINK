import { getState } from '../storage.js';
import { escapeHtml, formatCurrency, formatMoney, formatDateShort, categoryEmoji } from '../utils.js';
import { reapExpiredHolds } from '../services/bookingService.js';
import { getRatingStatsForListingIds, getDisplayReviewsForListingIds, formatRatingStats } from '../services/reviewsService.js';
import { getProviderMetrics, getSummaryCards, getCurrentPeriod } from '../services/hostBookingService.js';
import { DEMO_DATA_NOTE } from '../../data/pilot-seed-data.js';

function hostExperiences(state, hostId) {
  return state.experiences.filter((e) => e.hostId === hostId);
}

const MONTH_LABEL = (period) => `T${period.month + 1}/${period.year}`;

/** KPI đúng theo financialMode (mục 10, PHASE 15/09/2026) — CÙNG một getProviderMetrics() dùng ở
 * Lịch & Booking, nên số liệu ở đây LUÔN khớp tuyệt đối với trang đó (không tính riêng 1 công thức
 * khác cho Tổng quan nữa — đây chính là nguyên nhân 2 trang từng lệch số nhau). */
function kpiCardsHtml(pm, fillRatePct) {
  const monthLabel = MONTH_LABEL(pm.period);
  if (pm.financialMode === 'community_paid') {
    return `
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">Tổng booking (${monthLabel})</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Booking hoàn thành</span><span class="quick-fact__value">${pm.completedCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Booking sắp tới</span><span class="quick-fact__value">${pm.upcomingCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Khách trong tháng</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Khách đã phục vụ</span><span class="quick-fact__value">${pm.completedGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Khách dự kiến sắp tới</span><span class="quick-fact__value">${pm.upcomingGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Tổng giá trị booking</span><span class="quick-fact__value">${formatMoney(pm.grossExpected)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Thu nhập dự kiến</span><span class="quick-fact__value">${formatMoney(pm.providerExpectedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Thu nhập đã ghi nhận</span><span class="quick-fact__value">${formatMoney(pm.providerEarnedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Thu nhập còn dự kiến</span><span class="quick-fact__value">${formatMoney(pm.remainingExpectedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Đang chờ xác nhận</span><span class="quick-fact__value">${pm.pendingCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ lấp đầy (7 ngày tới)</span><span class="quick-fact__value">${fillRatePct === null ? '—' : `${fillRatePct}%`}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:-6px;">Tổng giá trị booking không phải thu nhập ròng — đã trừ phí nền tảng (${Math.round(pm.platformFeeRate * 100)}%, minh hoạ) để ra thu nhập dự kiến. Số liệu tháng ${monthLabel} khớp chính xác với trang Lịch & Booking (cùng nguồn dữ liệu).</p>
      ${pm.revenueSplitNote ? `<p class="text-sm text-faint">${escapeHtml(pm.revenueSplitNote)}</p>` : ''}
    `;
  }
  if (pm.financialMode === 'public_ticket') {
    return `
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">Đoàn đăng ký (${monthLabel})</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Khách</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Doanh thu vé dự kiến</span><span class="quick-fact__value">${formatMoney(pm.grossExpected)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Doanh thu vé đã ghi nhận</span><span class="quick-fact__value">${formatMoney(pm.providerEarnedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Doanh thu vé còn dự kiến</span><span class="quick-fact__value">${formatMoney(pm.remainingExpectedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Đang chờ xác nhận</span><span class="quick-fact__value">${pm.pendingCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ lấp đầy (7 ngày tới)</span><span class="quick-fact__value">${fillRatePct === null ? '—' : `${fillRatePct}%`}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:-6px;">Đây là doanh thu vé tham quan — KHÔNG phải "thu nhập hộ kinh doanh". Số liệu tháng ${monthLabel} khớp chính xác với trang Lịch & Booking (cùng nguồn dữ liệu).</p>
    `;
  }
  // free_visit
  return `
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">Đoàn đăng ký (${monthLabel})</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Tổng khách</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đoàn đã tham quan</span><span class="quick-fact__value">${pm.completedCount}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Khách đã tham quan</span><span class="quick-fact__value">${pm.completedGuests}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đoàn sắp đến</span><span class="quick-fact__value">${pm.upcomingCount}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Khung giờ cao điểm</span><span class="quick-fact__value">${pm.peakTimeslot || '—'}</span></div>
    </div>
    <p class="text-sm text-faint" style="margin-top:-6px;">Địa điểm tham quan miễn phí — không tạo doanh thu. Số liệu tháng ${monthLabel} khớp chính xác với trang Lịch & Booking (cùng nguồn dữ liệu).</p>
  `;
}

export function renderOverview(container, hostId) {
  reapExpiredHolds();
  const state = getState();
  const host = state.hosts.find((h) => h.id === hostId);
  const exps = hostExperiences(state, hostId);

  const listingIds = host ? [host.destinationId] : [];
  const ratingStats = getRatingStatsForListingIds(state, listingIds);
  const recentReviews = getDisplayReviewsForListingIds(state, listingIds).slice(0, 5);

  const period = getCurrentPeriod();
  const pm = getProviderMetrics(state, hostId, period);
  const summary = getSummaryCards(state, hostId); // dùng chung fillRatePct với Lịch & Booking
  const pendingBookings = pm.bookings.filter((b) => b.status === 'pending');

  const holdingBookingIds = new Set(state.bookings.filter((b) => b.payoutStatus === 'holding').map((b) => b.id));
  const releasedBookingIds = new Set(state.bookings.filter((b) => b.payoutStatus === 'released').map((b) => b.id));
  const completedItems = state.bookingItems.filter((bi) => exps.some((e) => e.id === bi.experienceId) && bi.status === 'completed');
  const holdingAmount = completedItems.filter((bi) => holdingBookingIds.has(bi.bookingId)).reduce((s, bi) => s + bi.subtotal, 0);
  const releasedAmount = completedItems.filter((bi) => releasedBookingIds.has(bi.bookingId)).reduce((s, bi) => s + bi.subtotal, 0);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Tổng quan${host ? ` — ${escapeHtml(host.name)}` : ''}</h1>
      <p class="text-sm text-muted">Số liệu tính từ cùng nguồn booking với trang Lịch & Booking và Cổng quản lý.</p>
      <p class="text-sm text-faint" style="margin-top:2px;">${DEMO_DATA_NOTE}</p>
    </div>

    ${kpiCardsHtml(pm, summary.fillRatePct)}

    ${pm.financialMode !== 'free_visit' ? `
    <div class="quick-facts">
      <div class="quick-fact"><span class="quick-fact__label">Tiền chờ nhận (đang giữ)</span><span class="quick-fact__value">${formatMoney(holdingAmount)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đã nhận (đã giải ngân)</span><span class="quick-fact__value">${formatMoney(releasedAmount)}</span></div>
    </div>
    <p class="text-sm text-faint" style="margin-top:-6px;">Chỉ tính booking đặt trực tiếp qua Trail (luồng giữ tiền/giải ngân thật) — chưa gồm booking demo minh hoạ ở trên.</p>
    ` : ''}

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Việc cần làm hôm nay</h3>
        <a class="btn btn-primary btn-sm" href="#/studio/bookings">Xem tất cả →</a>
      </div>
      ${pendingBookings.length ? `
        <div class="flex-col gap-2" style="margin-top:10px;">
          ${pendingBookings.slice(0, 5).map((b) => `
            <div class="card" style="padding:12px;">
              <strong>${escapeHtml(b.customerName)} — ${escapeHtml(b.activityName)}</strong>
              <p class="text-sm text-muted" style="margin:2px 0 0;">${b.groupSize} khách · ${b.grossAmount ? formatMoney(b.grossAmount) : 'Miễn phí'} · ${formatDateShort(b.bookingDate)}</p>
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
        }).join('') || '<p class="text-sm text-faint">Chưa có trải nghiệm nào (do khách đặt trực tiếp qua Trail) — bấm "Thêm trải nghiệm" để bắt đầu.</p>'}
      </div>
    </section>
  `;
}
