import { getState, confirmHostDemoBooking, rejectHostDemoBooking, proposeHostDemoBookingTime, completeHostDemoBooking, markHostDemoBookingContacted } from '../storage.js';
import { escapeHtml, formatMoney, formatDateShort, qs, qsa } from '../utils.js';
import { respondToBooking, completeBookingItem, reapExpiredHolds } from '../services/bookingService.js';
import {
  getUnifiedBookings, hostBookingFilters, resetHostBookingFilters, hasActiveHostBookingFilters,
  applyHostBookingFilters, getSummaryCards, getWeeklyDemandChartData, getCalendarMonthData, getDemandInsights,
  getReferenceNow,
} from '../services/hostBookingService.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import { DEMO_DATA_NOTE } from '../../data/pilot-seed-data.js';
import { NotificationService } from '../services/notificationService.js';
import { confirmDialog, openModal } from '../ui.js';

const STATUS_LABEL = {
  pending: ['Chờ xác nhận', 'badge-demo'],
  confirmed: ['Đã xác nhận', 'badge-free'],
  completed: ['Đã hoàn thành', 'badge-new'],
  cancelled: ['Đã huỷ', 'badge-danger'],
};

let calendarViewDate = getReferenceNow(); // tháng đang xem trên calendar — mặc định tháng của DEMO_REFERENCE_DATE (nơi có dữ liệu demo)

// ---------- 2.1 Summary cards ----------
function summaryCardsHtml(summary) {
  return `
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">Booking hôm nay</span><span class="quick-fact__value">${summary.bookingsToday}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Khách hôm nay</span><span class="quick-fact__value">${summary.guestsToday}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Booking trong 7 ngày tới</span><span class="quick-fact__value">${summary.bookingsNext7}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Khách dự kiến 7 ngày tới</span><span class="quick-fact__value">${summary.guestsNext7}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đang chờ xác nhận</span><span class="quick-fact__value">${summary.pendingCount}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ lấp đầy</span><span class="quick-fact__value">${summary.fillRatePct === null ? '—' : `${summary.fillRatePct}%`}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Doanh thu dự kiến 7 ngày</span><span class="quick-fact__value">${formatMoney(summary.revenueNext7)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ hoàn thành trong tháng</span><span class="quick-fact__value">${summary.completionRatePctMonth === null ? '—' : `${summary.completionRatePctMonth}%`}</span></div>
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
        <div><label class="field-label" for="hb-date-from">Từ ngày</label><input type="date" class="field-input" id="hb-date-from" value="${hostBookingFilters.dateFrom}"></div>
        <div><label class="field-label" for="hb-date-to">Đến ngày</label><input type="date" class="field-input" id="hb-date-to" value="${hostBookingFilters.dateTo}"></div>
        <div>
          <label class="field-label" for="hb-status">Trạng thái</label>
          <select class="field-select" id="hb-status">
            <option value="">Tất cả</option>
            <option value="pending" ${hostBookingFilters.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
            <option value="confirmed" ${hostBookingFilters.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
            <option value="completed" ${hostBookingFilters.status === 'completed' ? 'selected' : ''}>Đã hoàn thành</option>
            <option value="cancelled" ${hostBookingFilters.status === 'cancelled' ? 'selected' : ''}>Đã huỷ</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="hb-activity">Hoạt động</label>
          <select class="field-select" id="hb-activity">
            <option value="">Tất cả</option>
            ${activityIds.map((id) => `<option value="${escapeHtml(id)}" ${hostBookingFilters.activityId === id ? 'selected' : ''}>${escapeHtml(activityNameById[id])}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="hb-timeslot">Khung giờ</label>
          <select class="field-select" id="hb-timeslot">
            <option value="">Tất cả</option>
            <option value="morning" ${hostBookingFilters.timeslot === 'morning' ? 'selected' : ''}>Buổi sáng</option>
            <option value="afternoon" ${hostBookingFilters.timeslot === 'afternoon' ? 'selected' : ''}>Buổi chiều</option>
            <option value="evening" ${hostBookingFilters.timeslot === 'evening' ? 'selected' : ''}>Buổi tối</option>
          </select>
        </div>
        <div><label class="field-label" for="hb-size-min">Số người (tối thiểu)</label><input type="number" min="1" class="field-input" id="hb-size-min" value="${hostBookingFilters.groupSizeMin}"></div>
        <div><label class="field-label" for="hb-size-max">Số người (tối đa)</label><input type="number" min="1" class="field-input" id="hb-size-max" value="${hostBookingFilters.groupSizeMax}"></div>
        <div style="grid-column:1/-1;"><label class="field-label" for="hb-search">Tìm theo tên khách hoặc mã booking</label><input type="text" class="field-input" id="hb-search" placeholder="VD: Minh Anh, demo-booking-001..." value="${escapeHtml(hostBookingFilters.search)}"></div>
      </div>
      <div class="cta-row" style="margin-top:8px;">
        <button type="button" class="btn btn-ghost btn-sm" id="hb-clear-filters">Xoá bộ lọc</button>
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
const WEEKDAY_HEADERS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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

  const monthLabel = calendarViewDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return `
    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Lịch booking — ${escapeHtml(monthLabel)}</h3>
        <div class="cta-row">
          <button type="button" class="btn btn-secondary btn-sm" id="hb-cal-prev">← Tháng trước</button>
          <button type="button" class="btn btn-secondary btn-sm" id="hb-cal-next">Tháng sau →</button>
        </div>
      </div>
      <div class="badge-row" style="margin:8px 0;">
        <span class="badge badge-demo">🟡 Chờ xác nhận</span>
        <span class="badge badge-free">🟢 Đã xác nhận</span>
        <span class="badge badge-new">🔵 Đã hoàn thành</span>
        <span class="badge badge-danger">🔴 Đã huỷ</span>
      </div>
      <div class="booking-calendar__weekdays">${WEEKDAY_HEADERS.map((w) => `<div class="booking-calendar__weekday">${w}</div>`).join('')}</div>
      <div class="booking-calendar__grid">
        ${cells.map((d) => {
          if (d === null) return '<div class="booking-calendar__day booking-calendar__day--empty"></div>';
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const day = dayData[iso];
          const cls = day ? ` booking-calendar__day--has-bookings booking-calendar__day--${day.statusColor}` : '';
          return `
            <div class="booking-calendar__day${cls}" ${day ? `data-calendar-day="${iso}"` : ''}>
              ${day && day.highDemand ? '<span class="booking-calendar__day-high" title="Nhu cầu cao">🔥</span>' : ''}
              <span class="booking-calendar__day-num">${d}</span>
              ${day ? `<span class="booking-calendar__day-meta">${day.totalBookings} booking<br>${day.totalGuests} khách</span>` : ''}
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
        title: `Booking ngày ${formatDateShort(iso)}`,
        bodyHtml: `<div class="flex-col gap-2">${dayBookings.map(bookingCardHtml).join('') || '<p class="text-sm text-faint">Không có booking.</p>'}</div>`,
        onMount: (modalEl, closeFn) => wireBookingActions(modalEl, () => { closeFn(); onChangeMonth(); }),
      });
    });
  });
}

// ---------- 2.4 Upcoming booking list ----------
function bookingCardHtml(b) {
  const [label, cls] = STATUS_LABEL[b.status] || [b.status, 'badge-type'];
  const isDemo = b.source === 'seed_demo';
  const timeText = b.proposedTime ? `${escapeHtml(b.startTime || '')} → đề xuất ${escapeHtml(b.proposedTime)}` : escapeHtml(b.startTime || '—');
  return `
    <div class="activity-card" data-booking-id="${escapeHtml(b.id)}" data-booking-source="${b.source}">
      <div class="activity-card__head">
        <strong>${escapeHtml(b.customerName)}</strong>
        <span class="badge ${cls}">${escapeHtml(label)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:2px 0;">${escapeHtml(b.activityName)} · ${formatDateShort(b.bookingDate)} · ${timeText}</p>
      <p class="text-sm" style="margin:0;">👥 ${b.groupSize} khách · ${b.grossAmount ? formatMoney(b.grossAmount) : 'Miễn phí'}</p>
      <p class="text-sm text-faint" style="margin:0;">Mã: ${escapeHtml(b.id)}${b.contactStatus === 'contacted' ? ' · ✅ Đã liên hệ khách' : ''}</p>
      ${b.customerNote ? `<p class="text-sm text-faint" style="margin:0;">Ghi chú của khách: ${escapeHtml(b.customerNote)}</p>` : ''}
      <div class="cta-row" style="margin-top:6px;">
        ${b.status === 'pending' ? `
          <button type="button" class="btn btn-primary btn-sm" data-act="accept">✓ Xác nhận</button>
          ${isDemo ? '<button type="button" class="btn btn-secondary btn-sm" data-act="propose-time">🕒 Đề xuất giờ khác</button>' : ''}
          <button type="button" class="btn btn-danger-ghost btn-sm" data-act="reject">✕ Từ chối</button>
        ` : ''}
        ${b.status === 'confirmed' ? `
          ${isDemo ? '<button type="button" class="btn btn-secondary btn-sm" data-act="contact">📞 Liên hệ khách</button>' : ''}
          <button type="button" class="btn btn-accent btn-sm" data-act="complete">✓ Đánh dấu hoàn thành</button>
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
        <p class="text-sm text-muted">Không có booking phù hợp với bộ lọc hiện tại.</p>
        <div class="cta-row" style="justify-content:center;margin-top:8px;">
          <button type="button" class="btn btn-secondary btn-sm" id="hb-clear-filters-2">Xoá bộ lọc</button>
          <button type="button" class="btn btn-ghost btn-sm" id="hb-show-all">Xem toàn bộ booking</button>
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
        NotificationService.notify('Đã xác nhận booking.', 'success');
        onChanged();
      } else if (act === 'reject') {
        openModal({
          title: 'Từ chối booking',
          bodyHtml: `
            <div class="flex-col gap-3">
              <label class="field-label" for="hb-reject-reason">Lý do từ chối</label>
              <select class="field-select" id="hb-reject-reason">
                <option value="Hết chỗ vào phút chót">Hết chỗ vào phút chót</option>
                <option value="Có việc gia đình/mùa vụ đột xuất">Có việc gia đình/mùa vụ đột xuất</option>
                <option value="Không phù hợp điều kiện tham gia">Không phù hợp điều kiện tham gia</option>
                <option value="Khác">Khác</option>
              </select>
              <div class="modal__actions"><button type="button" class="btn btn-primary" id="hb-confirm-reject">Xác nhận từ chối</button></div>
            </div>
          `,
          onMount: (modalEl, closeFn) => {
            qs('#hb-confirm-reject', modalEl).addEventListener('click', () => {
              const reason = qs('#hb-reject-reason', modalEl).value;
              const r = source === 'seed_demo' ? rejectHostDemoBooking(id, reason) : respondToBooking(getState().bookingItems.find((x) => x.id === id).bookingId, [{ bookingItemId: id, decision: 'reject', reason }]);
              closeFn();
              if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
              NotificationService.notify('Đã từ chối booking.', 'info');
              onChanged();
            });
          },
        });
      } else if (act === 'propose-time') {
        openModal({
          title: 'Đề xuất giờ khác',
          bodyHtml: `
            <div class="flex-col gap-3">
              <label class="field-label" for="hb-propose-time-input">Giờ đề xuất</label>
              <input type="time" class="field-input" id="hb-propose-time-input" value="09:00">
              <div class="modal__actions"><button type="button" class="btn btn-primary" id="hb-confirm-propose">Gửi đề xuất</button></div>
            </div>
          `,
          onMount: (modalEl, closeFn) => {
            qs('#hb-confirm-propose', modalEl).addEventListener('click', () => {
              const newTime = qs('#hb-propose-time-input', modalEl).value;
              const r = proposeHostDemoBookingTime(id, newTime);
              closeFn();
              if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
              NotificationService.notify('Đã gửi đề xuất giờ khác cho khách.', 'success');
              onChanged();
            });
          },
        });
      } else if (act === 'contact') {
        const r = markHostDemoBookingContacted(id);
        if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
        NotificationService.notify('Đã đánh dấu đã liên hệ khách.', 'success');
        onChanged();
      } else if (act === 'complete') {
        confirmDialog({ title: 'Xác nhận hoàn thành?', message: 'Xác nhận khách đã tham gia và hoàn thành hoạt động này?', confirmLabel: 'Xác nhận' }).then((ok) => {
          if (!ok) return;
          const r = source === 'seed_demo' ? completeHostDemoBooking(id) : completeBookingItem(id);
          if (!r.ok) { NotificationService.notify(r.reason, 'error'); return; }
          NotificationService.notify('Đã đánh dấu hoàn thành.', 'success');
          onChanged();
        });
      }
    });
  });
}

// ---------- 2.5 Demand insights ----------
function demandInsightsSectionHtml(state, insights) {
  const activityName = insights.topActivityId ? (state.destinations.find((d) => d.id === insights.topActivityId)?.name || insights.topActivityId) : null;
  const TIMESLOT_LABEL = { morning: 'Buổi sáng', afternoon: 'Buổi chiều', evening: 'Buổi tối' };
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Nhu cầu của khách</h3>
      <div class="flex gap-4 wrap">
        <div style="flex:1;min-width:220px;"><canvas id="hb-timeofday-chart" height="200"></canvas></div>
        <div style="flex:1;min-width:220px;"><canvas id="hb-grouptype-chart" height="200"></canvas></div>
      </div>
      <div class="demo-note" style="margin-top:12px;">
        Cuối tuần có nhu cầu cao hơn ngày thường khoảng <strong>${insights.weekendUpliftPct}%</strong>.
        ${activityName ? ` Hoạt động được quan tâm nhiều nhất: <strong>${escapeHtml(activityName)}</strong>.` : ''}
        ${insights.topTimeslot ? ` Khung giờ được đặt nhiều nhất: <strong>${escapeHtml(insights.topTimeslot)}</strong>.` : ''}
      </div>
      <p class="text-sm text-faint" style="margin:8px 0 0;">${DEMO_DATA_NOTE}</p>
    </section>
  `;
}

function renderInsightCharts(container, insights) {
  loadChartJs().then((Chart) => {
    createChart(Chart, qs('#hb-timeofday-chart', container), 'hb-timeofday-chart', {
      type: 'doughnut',
      data: {
        labels: ['Buổi sáng', 'Buổi chiều', 'Buổi tối'],
        datasets: [{ data: [insights.timeOfDay.morning, insights.timeOfDay.afternoon, insights.timeOfDay.evening].map((v) => Math.round(v * 100)), backgroundColor: CHART_COLORS.slice(0, 3) }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } } } },
    });
    createChart(Chart, qs('#hb-grouptype-chart', container), 'hb-grouptype-chart', {
      type: 'bar',
      data: {
        labels: ['Nhóm bạn', 'Gia đình', 'Một mình', 'Trường học/DN'],
        datasets: [{ label: '% khách', data: [insights.groupType.friends, insights.groupType.family, insights.groupType.solo, insights.groupType.schoolOrCorporate].map((v) => Math.round(v * 100)), backgroundColor: CHART_COLORS[3] }],
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: (v) => `${v}%` } } } },
    });
  }).catch(() => { /* CDN chặn — bỏ qua biểu đồ, phần còn lại của trang vẫn hoạt động */ });
}

// ---------- 2.2 Weekly demand chart ----------
function weeklyDemandSectionHtml() {
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Nhu cầu của khách trong 7 ngày tới</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">${DEMO_DATA_NOTE}</p>
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
          label: 'Khách dự kiến',
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
                return [`Khách: ${d.guests}`, `Booking: ${d.bookings}`, `Doanh thu dự kiến: ${formatMoney(d.revenue)}`];
              },
            },
          },
        },
      },
    });
  }).catch(() => {
    qs('#hb-weekly-demand-chart', container)?.insertAdjacentHTML('afterend', '<p class="text-sm text-faint">Không tải được thư viện biểu đồ.</p>');
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
      <h1 style="margin-bottom:4px;">Lịch & Booking</h1>
      <p class="text-sm text-muted">Booking khách đặt từ Trail xuất hiện tại đây ngay lập tức, cộng thêm dữ liệu mô phỏng cho mục đích trình diễn.</p>
      <p class="text-sm text-faint" style="margin-top:2px;">${DEMO_DATA_NOTE}</p>
    </div>
    ${summaryCardsHtml(summary)}
    ${weeklyDemandSectionHtml()}
    ${calendarSectionHtml(state, hostId)}
    ${filterBarHtml(state, hostId)}
    <div>
      <h3>Danh sách booking${hasActiveHostBookingFilters() ? ` (${filtered.length}/${allBookings.length})` : ''}</h3>
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
