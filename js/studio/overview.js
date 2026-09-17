import { getState } from '../storage.js';
import { escapeHtml, formatCurrency, formatMoney, formatDateShort, categoryEmoji } from '../utils.js';
import { reapExpiredHolds } from '../services/bookingService.js';
import { getRatingStatsForListingIds, getDisplayReviewsForListingIds, formatRatingStats } from '../services/reviewsService.js';
import { getProviderMetrics, getSummaryCards, getCurrentPeriod } from '../services/hostBookingService.js';
import { t, localize, registerTranslations, getCurrentLanguage } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('host', {
  overview: {
    title: 'Tổng quan',
    updatedToday: 'Cập nhật gần nhất: hôm nay.',
    totalBookings: 'Tổng booking ({month})',
    completedBookings: 'Booking hoàn thành',
    upcomingBookings: 'Booking sắp tới',
    guestsThisMonth: 'Khách trong tháng',
    guestsServed: 'Khách đã phục vụ',
    upcomingGuests: 'Khách dự kiến sắp tới',
    grossBookingValue: 'Tổng giá trị booking',
    expectedIncome: 'Thu nhập dự kiến',
    recordedIncome: 'Thu nhập đã ghi nhận',
    remainingExpectedIncome: 'Thu nhập còn dự kiến',
    pendingConfirmation: 'Đang chờ xác nhận',
    fillRate: 'Tỷ lệ lấp đầy (7 ngày tới)',
    grossNotNet: 'Tổng giá trị booking không phải thu nhập ròng — đã trừ phí nền tảng ({rate}%) để ra thu nhập dự kiến.',
    groupsRegistered: 'Đoàn đăng ký ({month})',
    guests: 'Khách',
    ticketRevenueExpected: 'Doanh thu vé dự kiến',
    ticketRevenueRecorded: 'Doanh thu vé đã ghi nhận',
    ticketRevenueRemaining: 'Doanh thu vé còn dự kiến',
    ticketNotHouseholdIncome: 'Đây là doanh thu vé tham quan — KHÔNG phải "thu nhập hộ kinh doanh".',
    totalGuests: 'Tổng khách',
    groupsVisited: 'Đoàn đã tham quan',
    guestsVisited: 'Khách đã tham quan',
    groupsUpcoming: 'Đoàn sắp đến',
    peakTimeslot: 'Khung giờ cao điểm',
    freeVisitNote: 'Địa điểm tham quan miễn phí — không tạo doanh thu.',
    pendingPayout: 'Tiền chờ nhận (đang giữ)',
    receivedPayout: 'Đã nhận (đã giải ngân)',
    payoutNote: 'Chỉ tính booking đã hoàn thành và đang trong quy trình giữ tiền/giải ngân.',
    todoTitle: 'Việc cần làm hôm nay',
    viewAll: 'Xem tất cả →',
    noPendingBookings: 'Không có booking nào đang chờ phản hồi.',
    recentReviewsTitle: 'Đánh giá gần đây',
    noReviews: 'Chưa có đánh giá nào cho listing của bạn.',
    relatedBooking: 'Booking liên quan: {code}',
    servicesTitle: 'Dịch vụ của bạn',
    addExperience: '➕ Thêm trải nghiệm',
    bookingsCount: '{count} booking',
    noExperiences: 'Chưa có trải nghiệm nào (do khách đặt trực tiếp qua Trail) — bấm "Thêm trải nghiệm" để bắt đầu.',
  },
}, {
  overview: {
    title: 'Overview',
    updatedToday: 'Last updated: today.',
    totalBookings: 'Total bookings ({month})',
    completedBookings: 'Completed bookings',
    upcomingBookings: 'Upcoming bookings',
    guestsThisMonth: 'Guests this month',
    guestsServed: 'Guests served',
    upcomingGuests: 'Expected upcoming guests',
    grossBookingValue: 'Gross booking value',
    expectedIncome: 'Expected income',
    recordedIncome: 'Recorded income',
    remainingExpectedIncome: 'Remaining expected income',
    pendingConfirmation: 'Awaiting confirmation',
    fillRate: 'Fill rate (next 7 days)',
    grossNotNet: 'Gross booking value is not net income — the platform fee ({rate}%) has been deducted to produce expected income.',
    groupsRegistered: 'Groups registered ({month})',
    guests: 'Guests',
    ticketRevenueExpected: 'Expected ticket revenue',
    ticketRevenueRecorded: 'Recorded ticket revenue',
    ticketRevenueRemaining: 'Remaining expected ticket revenue',
    ticketNotHouseholdIncome: 'This is visitor ticket revenue — NOT "household income".',
    totalGuests: 'Total guests',
    groupsVisited: 'Groups that visited',
    guestsVisited: 'Guests that visited',
    groupsUpcoming: 'Upcoming groups',
    peakTimeslot: 'Peak time slot',
    freeVisitNote: 'Free-entry site — does not generate revenue.',
    pendingPayout: 'Pending payout (held)',
    receivedPayout: 'Received (paid out)',
    payoutNote: 'Only counts completed bookings that are in the hold/payout process.',
    todoTitle: "Today's to-dos",
    viewAll: 'View all →',
    noPendingBookings: 'No bookings awaiting response.',
    recentReviewsTitle: 'Recent reviews',
    noReviews: 'No reviews yet for your listing.',
    relatedBooking: 'Related booking: {code}',
    servicesTitle: 'Your services',
    addExperience: '➕ Add Experience',
    bookingsCount: '{count} bookings',
    noExperiences: 'No experiences yet (guests book directly via Trail) — click "Add Experience" to get started.',
  },
});

function hostExperiences(state, hostId) {
  return state.experiences.filter((e) => e.hostId === hostId);
}

const MONTH_LABEL = (period) => (getCurrentLanguage() === 'vi' ? `T${period.month + 1}/${period.year}` : `${period.month + 1}/${period.year}`);

/** KPI đúng theo financialMode (mục 10, PHASE 15/09/2026) — CÙNG một getProviderMetrics() dùng ở
 * Lịch & Booking, nên số liệu ở đây LUÔN khớp tuyệt đối với trang đó (không tính riêng 1 công thức
 * khác cho Tổng quan nữa — đây chính là nguyên nhân 2 trang từng lệch số nhau). */
function kpiCardsHtml(pm, fillRatePct) {
  const monthLabel = MONTH_LABEL(pm.period);
  if (pm.financialMode === 'community_paid') {
    return `
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.totalBookings', { month: monthLabel })}</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.completedBookings')}</span><span class="quick-fact__value">${pm.completedCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.upcomingBookings')}</span><span class="quick-fact__value">${pm.upcomingCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.guestsThisMonth')}</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.guestsServed')}</span><span class="quick-fact__value">${pm.completedGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.upcomingGuests')}</span><span class="quick-fact__value">${pm.upcomingGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.grossBookingValue')}</span><span class="quick-fact__value">${formatMoney(pm.grossExpected)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.expectedIncome')}</span><span class="quick-fact__value">${formatMoney(pm.providerExpectedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.recordedIncome')}</span><span class="quick-fact__value">${formatMoney(pm.providerEarnedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.remainingExpectedIncome')}</span><span class="quick-fact__value">${formatMoney(pm.remainingExpectedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.pendingConfirmation')}</span><span class="quick-fact__value">${pm.pendingCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.fillRate')}</span><span class="quick-fact__value">${fillRatePct === null ? '—' : `${fillRatePct}%`}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:-6px;">${t('host.overview.grossNotNet', { rate: Math.round(pm.platformFeeRate * 100) })}</p>
      ${pm.revenueSplitNote ? `<p class="text-sm text-faint">${escapeHtml(pm.revenueSplitNote)}</p>` : ''}
    `;
  }
  if (pm.financialMode === 'public_ticket') {
    return `
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.groupsRegistered', { month: monthLabel })}</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.guests')}</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.ticketRevenueExpected')}</span><span class="quick-fact__value">${formatMoney(pm.grossExpected)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.ticketRevenueRecorded')}</span><span class="quick-fact__value">${formatMoney(pm.providerEarnedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.ticketRevenueRemaining')}</span><span class="quick-fact__value">${formatMoney(pm.remainingExpectedIncome)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.pendingConfirmation')}</span><span class="quick-fact__value">${pm.pendingCount}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.fillRate')}</span><span class="quick-fact__value">${fillRatePct === null ? '—' : `${fillRatePct}%`}</span></div>
      </div>
      <p class="text-sm text-faint" style="margin-top:-6px;">${t('host.overview.ticketNotHouseholdIncome')}</p>
    `;
  }
  // free_visit
  return `
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.groupsRegistered', { month: monthLabel })}</span><span class="quick-fact__value">${pm.totalBookings}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.totalGuests')}</span><span class="quick-fact__value">${pm.totalGuests}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.groupsVisited')}</span><span class="quick-fact__value">${pm.completedCount}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.guestsVisited')}</span><span class="quick-fact__value">${pm.completedGuests}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.groupsUpcoming')}</span><span class="quick-fact__value">${pm.upcomingCount}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.peakTimeslot')}</span><span class="quick-fact__value">${pm.peakTimeslot || '—'}</span></div>
    </div>
    <p class="text-sm text-faint" style="margin-top:-6px;">${t('host.overview.freeVisitNote')}</p>
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
      <h1 style="margin-bottom:4px;">${t('host.overview.title')}${host ? ` — ${escapeHtml(host.name)}` : ''}</h1>
      <p class="text-sm text-muted">${t('host.overview.updatedToday')}</p>
    </div>

    ${kpiCardsHtml(pm, summary.fillRatePct)}

    ${pm.financialMode !== 'free_visit' ? `
    <div class="quick-facts">
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.pendingPayout')}</span><span class="quick-fact__value">${formatMoney(holdingAmount)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.overview.receivedPayout')}</span><span class="quick-fact__value">${formatMoney(releasedAmount)}</span></div>
    </div>
    <p class="text-sm text-faint" style="margin-top:-6px;">${t('host.overview.payoutNote')}</p>
    ` : ''}

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">${t('host.overview.todoTitle')}</h3>
        <a class="btn btn-primary btn-sm" href="#/studio/bookings">${t('host.overview.viewAll')}</a>
      </div>
      ${pendingBookings.length ? `
        <div class="flex-col gap-2" style="margin-top:10px;">
          ${pendingBookings.slice(0, 5).map((b) => `
            <div class="card" style="padding:12px;">
              <strong>${escapeHtml(b.customerName)} — ${escapeHtml(b.activityName)}</strong>
              <p class="text-sm text-muted" style="margin:2px 0 0;">${t('customer.booking.guests', { count: b.groupSize })} · ${b.grossAmount ? formatMoney(b.grossAmount) : t('common.price.free')} · ${formatDateShort(b.bookingDate)}</p>
            </div>
          `).join('')}
        </div>
      ` : `<p class="text-sm text-faint" style="margin-top:10px;">${t('host.overview.noPendingBookings')}</p>`}
    </section>

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">${t('host.overview.recentReviewsTitle')}</h3>
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
                  <strong>⭐ ${escapeHtml(String(r.overallRating))}${dest ? ` · ${escapeHtml(localizedDestinationName(dest))}` : ''}</strong>
                  <span class="text-sm text-faint">${formatDateShort(r.createdAt)}</span>
                </div>
                ${r.comment ? `<p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(localize(r.comment))}</p>` : ''}
                ${booking ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${t('host.overview.relatedBooking', { code: escapeHtml(booking.code) })}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : `<p class="text-sm text-faint" style="margin-top:10px;">${t('host.overview.noReviews')}</p>`}
    </section>

    <section>
      <div class="section-title">
        <h2>${t('host.overview.servicesTitle')}</h2>
        <a class="btn btn-accent btn-sm" href="#/studio/experiences">${t('host.overview.addExperience')}</a>
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
              <p class="text-sm text-muted" style="margin:0;">${dest ? escapeHtml(localizedDestinationName(dest)) : ''} · ${t('host.overview.bookingsCount', { count: expItems.length })}</p>
            </div>
          `;
        }).join('') || `<p class="text-sm text-faint">${t('host.overview.noExperiences')}</p>`}
      </div>
    </section>
  `;
}
