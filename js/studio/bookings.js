import { getState, confirmHostDemoBooking, rejectHostDemoBooking, proposeHostDemoBookingTime, completeHostDemoBooking, markHostDemoBookingContacted } from '../storage.js';
import { escapeHtml, formatMoney, formatDateShort, qs, qsa } from '../utils.js';
import { respondToBooking, completeBookingItem, reapExpiredHolds } from '../services/bookingService.js';
import {
  getUnifiedBookings, hostBookingFilters, resetHostBookingFilters, hasActiveHostBookingFilters,
  applyHostBookingFilters, getSummaryCards, getWeeklyDemandChartData, getCalendarMonthData, getDemandInsights,
  getReferenceNow,
} from '../services/hostBookingService.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import { NotificationService } from '../services/notificationService.js';
import { confirmDialog, openModal } from '../ui.js';
import { t, registerTranslations, getCurrentLanguage } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('host', {
  bookings: {
    title: 'Lịch & Booking',
    subtitle: 'Booking mới sẽ xuất hiện tại đây ngay khi khách đặt.',
    today: 'Booking hôm nay',
    guestsToday: 'Khách hôm nay',
    next7Bookings: 'Booking trong 7 ngày tới',
    next7Guests: 'Khách dự kiến 7 ngày tới',
    pendingConfirmation: 'Đang chờ xác nhận',
    fillRate: 'Tỷ lệ lấp đầy',
    revenueNext7: 'Doanh thu dự kiến 7 ngày',
    completionRateMonth: 'Tỷ lệ hoàn thành trong tháng',
    dateFrom: 'Từ ngày',
    dateTo: 'Đến ngày',
    status: 'Trạng thái',
    all: 'Tất cả',
    activity: 'Hoạt động',
    timeslot: 'Khung giờ',
    morning: 'Buổi sáng',
    afternoon: 'Buổi chiều',
    evening: 'Buổi tối',
    groupSizeMin: 'Số người (tối thiểu)',
    groupSizeMax: 'Số người (tối đa)',
    searchLabel: 'Tìm theo tên khách hoặc mã booking',
    searchPlaceholder: 'VD: Minh Anh, demo-booking-001...',
    clearFilters: 'Xoá bộ lọc',
    calendarTitle: 'Lịch booking — {month}',
    prevMonth: '← Tháng trước',
    nextMonth: 'Tháng sau →',
    highDemand: 'Nhu cầu cao',
    bookingsUnit: '{count} booking',
    guestsUnit: '{count} khách',
    bookingsOnDate: 'Booking ngày {date}',
    noBookings: 'Không có booking.',
    suggestedTime: '→ đề xuất {time}',
    code: 'Mã: {id}',
    contacted: '✅ Đã liên hệ khách',
    customerNote: 'Ghi chú của khách: {note}',
    confirm: '✓ Xác nhận',
    proposeOtherTime: '🕒 Đề xuất giờ khác',
    reject: '✕ Từ chối',
    contactCustomer: '📞 Liên hệ khách',
    markComplete: '✓ Đánh dấu hoàn thành',
    noBookingsForFilters: 'Không có booking phù hợp với bộ lọc hiện tại.',
    viewAllBookings: 'Xem toàn bộ booking',
    listTitle: 'Danh sách booking',
    confirmedNotify: 'Đã xác nhận booking.',
    rejectTitle: 'Từ chối booking',
    rejectReasonLabel: 'Lý do từ chối',
    reasonLastMinute: 'Hết chỗ vào phút chót',
    reasonFamily: 'Có việc gia đình/mùa vụ đột xuất',
    reasonNotEligible: 'Không phù hợp điều kiện tham gia',
    reasonOther: 'Khác',
    confirmReject: 'Xác nhận từ chối',
    rejectedNotify: 'Đã từ chối booking.',
    proposeTimeTitle: 'Đề xuất giờ khác',
    proposedTimeLabel: 'Giờ đề xuất',
    sendProposal: 'Gửi đề xuất',
    proposalSentNotify: 'Đã gửi đề xuất giờ khác cho khách.',
    contactedNotify: 'Đã đánh dấu đã liên hệ khách.',
    confirmCompleteTitle: 'Xác nhận hoàn thành?',
    confirmCompleteMsg: 'Xác nhận khách đã tham gia và hoàn thành hoạt động này?',
    completedNotify: 'Đã đánh dấu hoàn thành.',
    demandTitle: 'Nhu cầu của khách',
    weekendUplift: 'Cuối tuần có nhu cầu cao hơn ngày thường khoảng {pct}%.',
    topActivity: ' Hoạt động được quan tâm nhiều nhất: {name}.',
    topTimeslot: ' Khung giờ được đặt nhiều nhất: {slot}.',
    friends: 'Nhóm bạn',
    family: 'Gia đình',
    solo: 'Một mình',
    schoolCorp: 'Trường học/DN',
    weeklyDemandTitle: 'Nhu cầu của khách trong 7 ngày tới',
    expectedGuests: 'Khách dự kiến',
    guestsTooltip: 'Khách: {count}',
    bookingsTooltip: 'Booking: {count}',
    revenueTooltip: 'Doanh thu dự kiến: {amount}',
    chartLoadError: 'Không tải được thư viện biểu đồ.',
  },
}, {
  bookings: {
    title: 'Calendar & Bookings',
    subtitle: 'New bookings will appear here as soon as a guest books.',
    today: "Today's bookings",
    guestsToday: "Today's guests",
    next7Bookings: 'Bookings in next 7 days',
    next7Guests: 'Expected guests next 7 days',
    pendingConfirmation: 'Awaiting confirmation',
    fillRate: 'Fill rate',
    revenueNext7: 'Expected revenue (7 days)',
    completionRateMonth: 'Completion rate this month',
    dateFrom: 'From date',
    dateTo: 'To date',
    status: 'Status',
    all: 'All',
    activity: 'Activity',
    timeslot: 'Time slot',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    groupSizeMin: 'Group size (min)',
    groupSizeMax: 'Group size (max)',
    searchLabel: 'Search by guest name or booking ID',
    searchPlaceholder: 'e.g. Minh Anh, demo-booking-001...',
    clearFilters: 'Clear filters',
    calendarTitle: 'Booking calendar — {month}',
    prevMonth: '← Previous month',
    nextMonth: 'Next month →',
    highDemand: 'High demand',
    bookingsUnit: '{count} bookings',
    guestsUnit: '{count} guests',
    bookingsOnDate: 'Bookings on {date}',
    noBookings: 'No bookings.',
    suggestedTime: '→ suggested {time}',
    code: 'ID: {id}',
    contacted: '✅ Guest contacted',
    customerNote: "Guest's note: {note}",
    confirm: '✓ Confirm',
    proposeOtherTime: '🕒 Suggest another time',
    reject: '✕ Decline',
    contactCustomer: '📞 Contact guest',
    markComplete: '✓ Mark completed',
    noBookingsForFilters: 'No bookings match the current filters.',
    viewAllBookings: 'View all bookings',
    listTitle: 'Booking list',
    confirmedNotify: 'Booking confirmed.',
    rejectTitle: 'Decline booking',
    rejectReasonLabel: 'Reason for declining',
    reasonLastMinute: 'No spots left at the last minute',
    reasonFamily: 'Unexpected family/seasonal matter',
    reasonNotEligible: 'Does not meet participation requirements',
    reasonOther: 'Other',
    confirmReject: 'Confirm decline',
    rejectedNotify: 'Booking declined.',
    proposeTimeTitle: 'Suggest another time',
    proposedTimeLabel: 'Suggested time',
    sendProposal: 'Send suggestion',
    proposalSentNotify: 'Sent the guest a suggested new time.',
    contactedNotify: 'Marked guest as contacted.',
    confirmCompleteTitle: 'Confirm completion?',
    confirmCompleteMsg: 'Confirm the guest attended and completed this activity?',
    completedNotify: 'Marked as completed.',
    demandTitle: 'Guest demand',
    weekendUplift: 'Weekends see about {pct}% higher demand than weekdays.',
    topActivity: ' Most popular activity: {name}.',
    topTimeslot: ' Most booked time slot: {slot}.',
    friends: 'Friends',
    family: 'Family',
    solo: 'Solo',
    schoolCorp: 'School/Corporate',
    weeklyDemandTitle: 'Guest demand for the next 7 days',
    expectedGuests: 'Expected guests',
    guestsTooltip: 'Guests: {count}',
    bookingsTooltip: 'Bookings: {count}',
    revenueTooltip: 'Expected revenue: {amount}',
    chartLoadError: 'Could not load the chart library.',
  },
});

function statusLabel(status) {
  return [t(`common.status.${status}`), { pending: 'badge-demo', confirmed: 'badge-free', completed: 'badge-new', cancelled: 'badge-danger' }[status] || 'badge-type'];
}

let calendarViewDate = getReferenceNow(); // tháng đang xem trên calendar — mặc định tháng của DEMO_REFERENCE_DATE (nơi có dữ liệu demo)

// ---------- 2.1 Summary cards ----------
function summaryCardsHtml(summary) {
  return `
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.today')}</span><span class="quick-fact__value">${summary.bookingsToday}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.guestsToday')}</span><span class="quick-fact__value">${summary.guestsToday}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.next7Bookings')}</span><span class="quick-fact__value">${summary.bookingsNext7}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.next7Guests')}</span><span class="quick-fact__value">${summary.guestsNext7}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.pendingConfirmation')}</span><span class="quick-fact__value">${summary.pendingCount}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.fillRate')}</span><span class="quick-fact__value">${summary.fillRatePct === null ? '—' : `${summary.fillRatePct}%`}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.revenueNext7')}</span><span class="quick-fact__value">${formatMoney(summary.revenueNext7)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('host.bookings.completionRateMonth')}</span><span class="quick-fact__value">${summary.completionRatePctMonth === null ? '—' : `${summary.completionRatePctMonth}%`}</span></div>
    </div>
  `;
}

// ---------- 2.6 Bộ lọc ----------
function filterBarHtml(state, hostId) {
  const bookings = getUnifiedBookings(state, hostId);
  const activityIds = Array.from(new Set(bookings.map((b) => b.activityId)));
  const activityNameById = {};
  bookings.forEach((b) => { activityNameById[b.activityId] = b.activityName; });
  return `
    <div class="card admin-filterbar" style="padding:14px 16px;">
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">
        <div><label class="field-label" for="hb-date-from">${t('host.bookings.dateFrom')}</label><input type="date" class="field-input" id="hb-date-from" value="${hostBookingFilters.dateFrom}"></div>
        <div><label class="field-label" for="hb-date-to">${t('host.bookings.dateTo')}</label><input type="date" class="field-input" id="hb-date-to" value="${hostBookingFilters.dateTo}"></div>
        <div>
          <label class="field-label" for="hb-status">${t('host.bookings.status')}</label>
          <select class="field-select" id="hb-status">
            <option value="">${t('host.bookings.all')}</option>
            <option value="pending" ${hostBookingFilters.status === 'pending' ? 'selected' : ''}>${t('common.status.pending')}</option>
            <option value="confirmed" ${hostBookingFilters.status === 'confirmed' ? 'selected' : ''}>${t('common.status.confirmed')}</option>
            <option value="completed" ${hostBookingFilters.status === 'completed' ? 'selected' : ''}>${t('common.status.completed')}</option>
            <option value="cancelled" ${hostBookingFilters.status === 'cancelled' ? 'selected' : ''}>${t('common.status.cancelled')}</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="hb-activity">${t('host.bookings.activity')}</label>
          <select class="field-select" id="hb-activity">
            <option value="">${t('host.bookings.all')}</option>
            ${activityIds.map((id) => `<option value="${escapeHtml(id)}" ${hostBookingFilters.activityId === id ? 'selected' : ''}>${escapeHtml(activityNameById[id])}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="hb-timeslot">${t('host.bookings.timeslot')}</label>
          <select class="field-select" id="hb-timeslot">
            <option value="">${t('host.bookings.all')}</option>
            <option value="morning" ${hostBookingFilters.timeslot === 'morning' ? 'selected' : ''}>${t('host.bookings.morning')}</option>
            <option value="afternoon" ${hostBookingFilters.timeslot === 'afternoon' ? 'selected' : ''}>${t('host.bookings.afternoon')}</option>
            <option value="evening" ${hostBookingFilters.timeslot === 'evening' ? 'selected' : ''}>${t('host.bookings.evening')}</option>
          </select>
        </div>
        <div><label class="field-label" for="hb-size-min">${t('host.bookings.groupSizeMin')}</label><input type="number" min="1" class="field-input" id="hb-size-min" value="${hostBookingFilters.groupSizeMin}"></div>
        <div><label class="field-label" for="hb-size-max">${t('host.bookings.groupSizeMax')}</label><input type="number" min="1" class="field-input" id="hb-size-max" value="${hostBookingFilters.groupSizeMax}"></div>
        <div style="grid-column:1/-1;"><label class="field-label" for="hb-search">${t('host.bookings.searchLabel')}</label><input type="text" class="field-input" id="hb-search" placeholder="${t('host.bookings.searchPlaceholder')}" value="${escapeHtml(hostBookingFilters.search)}"></div>
      </div>
      <div class="cta-row" style="margin-top:8px;">
        <button type="button" class="btn btn-ghost btn-sm" id="hb-clear-filters">${t('host.bookings.clearFilters')}</button>
      </div>
    </div>
  `;
}

function wireFilterBar(container, onChange) {
  const bind = (id, key, parse = (v) => v) => {
    const el = qs(`#${id}`, container);
    if (!el) return;
    el.addEventListener('change', () => { hostBookingFilters[key] = parse(el.value); onChange(); });
  };
  bind('hb-date-from', 'dateFrom');
  bind('hb-date-to', 'dateTo');
  bind('hb-status', 'status');
  bind('hb-activity', 'activityId');
  bind('hb-timeslot', 'timeslot');
  bind('hb-size-min', 'groupSizeMin');
  bind('hb-size-max', 'groupSizeMax');
  qs('#hb-search', container)?.addEventListener('input', (e) => { hostBookingFilters.search = e.target.value; onChange(); });
  qs('#hb-clear-filters', container)?.addEventListener('click', () => { resetHostBookingFilters(); onChange(); });
}

// ---------- 2.3 Booking calendar ----------
function weekdayHeaders() {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((k) => t(`common.weekdayShort.${k}`));
}

function calendarSectionHtml(state, hostId) {
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  const dayData = getCalendarMonthData(state, hostId, year, month);
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const monthLabel = calendarViewDate.toLocaleDateString(getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

  return `
    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">${t('host.bookings.calendarTitle', { month: escapeHtml(monthLabel) })}</h3>
        <div class="cta-row">
          <button type="button" class="btn btn-secondary btn-sm" id="hb-cal-prev">${t('host.bookings.prevMonth')}</button>
          <button type="button" class="btn btn-secondary btn-sm" id="hb-cal-next">${t('host.bookings.nextMonth')}</button>
        </div>
      </div>
      <div class="badge-row" style="margin:8px 0;">
        <span class="badge badge-demo">🟡 ${t('common.status.pending')}</span>
        <span class="badge badge-free">🟢 ${t('common.status.confirmed')}</span>
        <span class="badge badge-new">🔵 ${t('common.status.completed')}</span>
        <span class="badge badge-danger">🔴 ${t('common.status.cancelled')}</span>
      </div>
      <div class="booking-calendar__weekdays">${weekdayHeaders().map((w) => `<div class="booking-calendar__weekday">${escapeHtml(w)}</div>`).join('')}</div>
      <div class="booking-calendar__grid">
        ${cells.map((d) => {
          if (d === null) return '<div class="booking-calendar__day booking-calendar__day--empty"></div>';
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const day = dayData[iso];
          const cls = day ? ` booking-calendar__day--has-bookings booking-calendar__day--${day.statusColor}` : '';
          return `
            <div class="booking-calendar__day${cls}" ${day ? `data-calendar-day="${iso}"` : ''}>
              ${day && day.highDemand ? `<span class="booking-calendar__day-high" title="${t('host.bookings.highDemand')}">🔥</span>` : ''}
              <span class="booking-calendar__day-num">${d}</span>
              ${day ? `<span class="booking-calendar__day-meta">${t('host.bookings.bookingsUnit', { count: day.totalBookings })}<br>${t('host.bookings.guestsUnit', { count: day.totalGuests })}</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function wireCalendarSection(container, state, hostId, onChangeMonth) {
  qs('#hb-cal-prev', container)?.addEventListener('click', () => {
    calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1);
    onChangeMonth();
  });
  qs('#hb-cal-next', container)?.addEventListener('click', () => {
    calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1);
    onChangeMonth();
  });
  qsa('[data-calendar-day]', container).forEach((el) => {
    el.addEventListener('click', () => {
      const iso = el.dataset.calendarDay;
      const dayBookings = applyHostBookingFilters(getUnifiedBookings(state, hostId)).filter((b) => b.bookingDate === iso);
      openModal({
        title: t('host.bookings.bookingsOnDate', { date: formatDateShort(iso) }),
        bodyHtml: `<div class="flex-col gap-2">${dayBookings.map(bookingCardHtml).join('') || `<p class="text-sm text-faint">${t('host.bookings.noBookings')}</p>`}</div>`,
        onMount: (modalEl, closeFn) => wireBookingActions(modalEl, () => { closeFn(); onChangeMonth(); }),
      });
    });
  });
}

// ---------- 2.4 Upcoming booking list ----------
function bookingCardHtml(b) {
  const [label, cls] = statusLabel(b.status);
  const isDemo = b.source === 'seed_demo';
  const timeText = b.proposedTime ? `${escapeHtml(b.startTime || '')} ${t('host.bookings.suggestedTime', { time: escapeHtml(b.proposedTime) })}` : escapeHtml(b.startTime || '—');
  return `
    <div class="activity-card" data-booking-id="${escapeHtml(b.id)}" data-booking-source="${b.source}">
      <div class="activity-card__head">
        <strong>${escapeHtml(b.customerName)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:2px 0;">${escapeHtml(b.activityName)} · ${formatDateShort(b.bookingDate)} · ${timeText}</p>
      <p class="text-sm" style="margin:0;">👥 ${t('customer.booking.guests', { count: b.groupSize })} · ${b.grossAmount ? formatMoney(b.grossAmount) : t('common.price.free')}</p>
      <p class="text-sm text-faint" style="margin:0;">${t('host.bookings.code', { id: escapeHtml(b.id) })}${b.contactStatus === 'contacted' ? ` · ${t('host.bookings.contacted')}` : ''}</p>
      ${b.customerNote ? `<p class="text-sm text-faint" style="margin:0;">${t('host.bookings.customerNote', { note: escapeHtml(b.customerNote) })}</p>` : ''}
      <div class="cta-row" style="margin-top:6px;">
        ${b.status === 'pending' ? `
          <button type="button" class="btn btn-primary btn-sm" data-act="accept">${t('host.bookings.confirm')}</button>
          ${isDemo ? `<button type="button" class="btn btn-secondary btn-sm" data-act="propose-time">${t('host.bookings.proposeOtherTime')}</button>` : ''}
          <button type="button" class="btn btn-danger-ghost btn-sm" data-act="reject">${t('host.bookings.reject')}</button>
        ` : ''}
        ${b.status === 'confirmed' ? `
          ${isDemo ? `<button type="button" class="btn btn-secondary btn-sm" data-act="contact">${t('host.bookings.contactCustomer')}</button>` : ''}
          <button type="button" class="btn btn-accent btn-sm" data-act="complete">${t('host.bookings.markComplete')}</button>
        ` : ''}
      </div>
    </div>
  `;
}

function bookingListSectionHtml(bookings) {
  const sorted = bookings.slice().sort((a, b) => (a.bookingDate + (a.startTime || '')).localeCompare(b.bookingDate + (b.startTime || '')));
  if (!sorted.length) {
    return `
      <section class="card" style="padding:20px;text-align:center;">
        <p class="text-sm text-muted">${t('host.bookings.noBookingsForFilters')}</p>
        <div class="cta-row" style="justify-content:center;margin-top:8px;">
          <button type="button" class="btn btn-secondary btn-sm" id="hb-clear-filters-2">${t('host.bookings.clearFilters')}</button>
          <button type="button" class="btn btn-ghost btn-sm" id="hb-show-all">${t('host.bookings.viewAllBookings')}</button>
        </div>
      </section>
    `;
  }
  return `
    <section class="flex-col gap-3" id="hb-booking-list">
      ${sorted.map(bookingCardHtml).join('')}
    </section>
  `;
}

function wireBookingActions(container, onChanged) {
  qsa('[data-act]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-booking-id]');
      const id = card.dataset.bookingId;
      const source = card.dataset.bookingSource;
      const act = btn.dataset.act;

      if (act === 'accept') {
        const r = source === 'seed_demo' ? confirmHostDemoBooking(id) : respondToBooking(getState().bookingItems.find((x) => x.id === id).bookingId, [{ bookingItemId: id, decision: 'accept' }]);
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
        NotificationService.notify(t('host.bookings.confirmedNotify'), 'success');
        onChanged();
      } else if (act === 'reject') {
        openModal({
          title: t('host.bookings.rejectTitle'),
          bodyHtml: `
            <div class="flex-col gap-3">
              <label class="field-label" for="hb-reject-reason">${t('host.bookings.rejectReasonLabel')}</label>
              <select class="field-select" id="hb-reject-reason">
                <option value="${t('host.bookings.reasonLastMinute')}">${t('host.bookings.reasonLastMinute')}</option>
                <option value="${t('host.bookings.reasonFamily')}">${t('host.bookings.reasonFamily')}</option>
                <option value="${t('host.bookings.reasonNotEligible')}">${t('host.bookings.reasonNotEligible')}</option>
                <option value="${t('host.bookings.reasonOther')}">${t('host.bookings.reasonOther')}</option>
              </select>
              <div class="modal__actions"><button type="button" class="btn btn-primary" id="hb-confirm-reject">${t('host.bookings.confirmReject')}</button></div>
            </div>
          `,
          onMount: (modalEl, closeFn) => {
            qs('#hb-confirm-reject', modalEl).addEventListener('click', () => {
              const reason = qs('#hb-reject-reason', modalEl).value;
              const r = source === 'seed_demo' ? rejectHostDemoBooking(id, reason) : respondToBooking(getState().bookingItems.find((x) => x.id === id).bookingId, [{ bookingItemId: id, decision: 'reject', reason }]);
              closeFn();
              if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
              NotificationService.notify(t('host.bookings.rejectedNotify'), 'info');
              onChanged();
            });
          },
        });
      } else if (act === 'propose-time') {
        openModal({
          title: t('host.bookings.proposeTimeTitle'),
          bodyHtml: `
            <div class="flex-col gap-3">
              <label class="field-label" for="hb-propose-time-input">${t('host.bookings.proposedTimeLabel')}</label>
              <input type="time" class="field-input" id="hb-propose-time-input" value="09:00">
              <div class="modal__actions"><button type="button" class="btn btn-primary" id="hb-confirm-propose">${t('host.bookings.sendProposal')}</button></div>
            </div>
          `,
          onMount: (modalEl, closeFn) => {
            qs('#hb-confirm-propose', modalEl).addEventListener('click', () => {
              const newTime = qs('#hb-propose-time-input', modalEl).value;
              const r = proposeHostDemoBookingTime(id, newTime);
              closeFn();
              if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
              NotificationService.notify(t('host.bookings.proposalSentNotify'), 'success');
              onChanged();
            });
          },
        });
      } else if (act === 'contact') {
        const r = markHostDemoBookingContacted(id);
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
        NotificationService.notify(t('host.bookings.contactedNotify'), 'success');
        onChanged();
      } else if (act === 'complete') {
        confirmDialog({ title: t('host.bookings.confirmCompleteTitle'), message: t('host.bookings.confirmCompleteMsg'), confirmLabel: t('common.actions.confirm') }).then((ok) => {
          if (!ok) return;
          const r = source === 'seed_demo' ? completeHostDemoBooking(id) : completeBookingItem(id);
          if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
          NotificationService.notify(t('host.bookings.completedNotify'), 'success');
          onChanged();
        });
      }
    });
  });
}

// ---------- 2.5 Demand insights ----------
function demandInsightsSectionHtml(state, insights) {
  const activityDest = insights.topActivityId ? state.destinations.find((d) => d.id === insights.topActivityId) : null;
  const activityName = insights.topActivityId ? (activityDest ? localizedDestinationName(activityDest) : insights.topActivityId) : null;
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('host.bookings.demandTitle')}</h3>
      <div class="flex gap-4 wrap">
        <div style="flex:1;min-width:220px;"><canvas id="hb-timeofday-chart" height="200"></canvas></div>
        <div style="flex:1;min-width:220px;"><canvas id="hb-grouptype-chart" height="200"></canvas></div>
      </div>
      <div class="demo-note" style="margin-top:12px;">
        ${t('host.bookings.weekendUplift', { pct: `<strong>${insights.weekendUpliftPct}</strong>` })}
        ${activityName ? t('host.bookings.topActivity', { name: `<strong>${escapeHtml(activityName)}</strong>` }) : ''}
        ${insights.topTimeslot ? t('host.bookings.topTimeslot', { slot: `<strong>${escapeHtml(insights.topTimeslot)}</strong>` }) : ''}
      </div>
    </section>
  `;
}

function renderInsightCharts(container, insights) {
  loadChartJs().then((Chart) => {
    createChart(Chart, qs('#hb-timeofday-chart', container), 'hb-timeofday-chart', {
      type: 'doughnut',
      data: {
        labels: [t('host.bookings.morning'), t('host.bookings.afternoon'), t('host.bookings.evening')],
        datasets: [{ data: [insights.timeOfDay.morning, insights.timeOfDay.afternoon, insights.timeOfDay.evening].map((v) => Math.round(v * 100)), backgroundColor: CHART_COLORS.slice(0, 3) }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } } } },
    });
    createChart(Chart, qs('#hb-grouptype-chart', container), 'hb-grouptype-chart', {
      type: 'bar',
      data: {
        labels: [t('host.bookings.friends'), t('host.bookings.family'), t('host.bookings.solo'), t('host.bookings.schoolCorp')],
        datasets: [{ label: '%', data: [insights.groupType.friends, insights.groupType.family, insights.groupType.solo, insights.groupType.schoolOrCorporate].map((v) => Math.round(v * 100)), backgroundColor: CHART_COLORS[3] }],
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: (v) => `${v}%` } } } },
    });
  }).catch(() => { /* CDN chặn — bỏ qua biểu đồ, phần còn lại của trang vẫn hoạt động */ });
}

// ---------- 2.2 Weekly demand chart ----------
function weeklyDemandSectionHtml() {
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">${t('host.bookings.weeklyDemandTitle')}</h3>
      <canvas id="hb-weekly-demand-chart" height="220"></canvas>
    </section>
  `;
}

function renderWeeklyDemandChart(container) {
  const data = getWeeklyDemandChartData();
  loadChartJs().then((Chart) => {
    createChart(Chart, qs('#hb-weekly-demand-chart', container), 'hb-weekly-demand-chart', {
      type: 'bar',
      data: {
        labels: data.map((d) => d.label),
        datasets: [{
          label: t('host.bookings.expectedGuests'),
          data: data.map((d) => d.guests),
          backgroundColor: data.map((d) => (d.isWeekend ? CHART_COLORS[0] : `${CHART_COLORS[0]}66`)),
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const d = data[ctx.dataIndex];
                return [
                  t('host.bookings.guestsTooltip', { count: d.guests }),
                  t('host.bookings.bookingsTooltip', { count: d.bookings }),
                  t('host.bookings.revenueTooltip', { amount: formatMoney(d.revenue) }),
                ];
              },
            },
          },
        },
      },
    });
  }).catch(() => {
    qs('#hb-weekly-demand-chart', container)?.insertAdjacentHTML('afterend', `<p class="text-sm text-faint">${t('host.bookings.chartLoadError')}</p>`);
  });
}

// ---------- Main ----------
export function renderBookings(container, hostId) {
  reapExpiredHolds();
  const state = getState();
  const summary = getSummaryCards(state, hostId);
  const allBookings = getUnifiedBookings(state, hostId);
  const filtered = applyHostBookingFilters(allBookings);
  const insights = getDemandInsights(state, hostId);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">${t('host.bookings.title')}</h1>
      <p class="text-sm text-muted">${t('host.bookings.subtitle')}</p>
    </div>
    ${summaryCardsHtml(summary)}
    ${weeklyDemandSectionHtml()}
    ${calendarSectionHtml(state, hostId)}
    ${filterBarHtml(state, hostId)}
    <div>
      <h3>${t('host.bookings.listTitle')}${hasActiveHostBookingFilters() ? ` (${filtered.length}/${allBookings.length})` : ''}</h3>
      ${bookingListSectionHtml(filtered)}
    </div>
    ${demandInsightsSectionHtml(state, insights)}
  `;

  const rerender = () => renderBookings(container, hostId);

  wireFilterBar(container, rerender);
  wireCalendarSection(container, state, hostId, rerender);
  wireBookingActions(container, rerender);
  qs('#hb-clear-filters-2', container)?.addEventListener('click', () => { resetHostBookingFilters(); rerender(); });
  qs('#hb-show-all', container)?.addEventListener('click', () => { resetHostBookingFilters(); rerender(); });

  renderWeeklyDemandChart(container);
  renderInsightCharts(container, insights);
}
