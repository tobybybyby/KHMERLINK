import { getState } from '../storage.js';
import { escapeHtml, getSimulatedCrowdLevel, formatDateShort, qs, categoryGroupLabel } from '../utils.js';
import { filterBarHtml, wireFilterBar, getScopedDestinations } from './filters.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import { t, registerTranslations, getCurrentLanguage } from '../services/i18nService.js';
import { dashCardHtml, kpiCardHtml } from './dashboardShell.js';

registerTranslations('management', {
  flow: {
    title: 'Luồng khách',
    subtitle: 'Mật độ khách và phân khúc du khách theo phạm vi lọc hiện tại.',
    currentDensityTitle: 'Mật độ hiện tại',
    updatedAt: 'Cập nhật lúc {time}',
    placesInScope: '{count} địa điểm trong phạm vi lọc.',
    noPlacesInScope: 'Không có địa điểm nào trong phạm vi lọc.',
    peakHourTitle: 'Khung giờ cao điểm dự kiến hôm nay',
    upcomingEventsTitle: 'Mùa/sự kiện cao điểm sắp tới',
    noUpcomingEvents: 'Chưa có sự kiện sắp tới trong dữ liệu.',
    segmentsTitle: 'Phân khúc du khách',
    noItinerariesYet: 'Chưa có hành trình nào để phân tích phân khúc.',
    solo: 'Đi một mình',
    group: 'Đi theo nhóm',
    avgDuration: 'Thời lượng TB mong muốn',
    hours: '{n} giờ',
    pace: 'Nhịp độ: {value}',
    priority: 'Ưu tiên: {value}',
    topDestinations: 'Nơi đến hay chọn (theo loại hình điểm dừng): {value}',
    ageGroupNote: '"Nhóm tuổi" chưa được lưu vào dữ liệu hành trình nên không hiển thị ở đây.',
    popularityLabel: 'Mức độ phổ biến',
    bookingRequestsTooltip: 'Số yêu cầu booking: {count}',
    expectedGuestsTooltip: 'Số khách dự kiến: {count}',
    timeSlotAxis: 'Khung giờ',
    chartLoadError: 'Không tải được thư viện biểu đồ (mạng chặn CDN) — vui lòng thử lại sau.',
  },
}, {
  flow: {
    title: 'Visitor Flow',
    subtitle: 'Visitor density and traveller segments within the current filter scope.',
    currentDensityTitle: 'Current Density',
    updatedAt: 'Updated at {time}',
    placesInScope: '{count} places within the current filter scope.',
    noPlacesInScope: 'No places within the current filter scope.',
    peakHourTitle: "Today's Expected Peak Hours",
    upcomingEventsTitle: 'Upcoming Peak Seasons/Events',
    noUpcomingEvents: 'No upcoming events in the data yet.',
    segmentsTitle: 'Traveller Segments',
    noItinerariesYet: 'No trips yet to analyze segments.',
    solo: 'Solo',
    group: 'Group',
    avgDuration: 'Avg. desired duration',
    hours: '{n}h',
    pace: 'Pace: {value}',
    priority: 'Priority: {value}',
    topDestinations: 'Popular destinations (by stop type): {value}',
    ageGroupNote: '"Age group" is not yet stored in trip data, so it is not shown here.',
    popularityLabel: 'Popularity',
    bookingRequestsTooltip: 'Booking requests: {count}',
    expectedGuestsTooltip: 'Expected visitors: {count}',
    timeSlotAxis: 'Time Slot',
    chartLoadError: 'Could not load the chart library (network blocked the CDN) — please try again later.',
  },
});

// Nhu cầu theo khung giờ trong ngày — dữ liệu nền tảng cố định (không gắn với 1 booking cụ thể),
// dùng cho biểu đồ cột "Khung giờ cao điểm dự kiến hôm nay" (mục 2.6). Nếu sau này có đủ booking
// thật trong ngày, popularity có thể tính lại bằng
// Math.round(bookingRequests / maximumBookingRequests * 100) thay vì con số cố định ở đây.
const hourlyDemandToday = [
  { timeRange: '07:00–09:00', shortLabel: '07–09', popularity: 58, bookingRequests: 6, expectedGuests: 54 },
  { timeRange: '09:00–11:00', shortLabel: '09–11', popularity: 86, bookingRequests: 11, expectedGuests: 103 },
  { timeRange: '11:00–13:00', shortLabel: '11–13', popularity: 42, bookingRequests: 4, expectedGuests: 35 },
  { timeRange: '13:00–15:00', shortLabel: '13–15', popularity: 67, bookingRequests: 8, expectedGuests: 72 },
  { timeRange: '15:00–17:00', shortLabel: '15–17', popularity: 92, bookingRequests: 13, expectedGuests: 118 },
  { timeRange: '17:00–19:00', shortLabel: '17–19', popularity: 35, bookingRequests: 3, expectedGuests: 24 },
];
const PEAK_TIME_RANGE = '15:00–17:00';

function heatmapSummary(destinations) {
  const now = new Date();
  const counts = {};
  destinations.forEach((d) => {
    const level = getSimulatedCrowdLevel(d.id, now);
    counts[level.label] = (counts[level.label] || 0) + 1;
  });
  return { counts, updatedAt: now };
}

function segmentBlock(state) {
  const itineraries = state.itineraries || [];
  if (!itineraries.length) {
    return `<p class="text-sm text-faint">${t('management.flow.noItinerariesYet')}</p>`;
  }
  const solo = itineraries.filter((i) => i.partySize === 1).length;
  const group = itineraries.length - solo;
  const paceCounts = {};
  const priorityCounts = {};
  let totalHours = 0;
  const groupCounts = {};
  itineraries.forEach((i) => {
    paceCounts[i.pace] = (paceCounts[i.pace] || 0) + 1;
    priorityCounts[i.priority] = (priorityCounts[i.priority] || 0) + 1;
    totalHours += i.availableHours || 0;
    (i.stops || []).forEach((s) => {
      const dest = state.destinations.find((d) => d.id === s.destinationId);
      if (!dest) return;
      const key = dest.category || 'Khác';
      groupCounts[key] = (groupCounts[key] || 0) + 1;
    });
  });
  const avgHours = (totalHours / itineraries.length).toFixed(1);
  const topDestGroups = Object.entries(groupCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return `
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">${t('management.flow.solo')}</span><span class="quick-fact__value">${solo}/${itineraries.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.flow.group')}</span><span class="quick-fact__value">${group}/${itineraries.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">${t('management.flow.avgDuration')}</span><span class="quick-fact__value">${t('management.flow.hours', { n: avgHours })}</span></div>
    </div>
    <p class="text-sm text-muted" style="margin-top:10px;">${t('management.flow.pace', { value: Object.entries(paceCounts).map(([k, v]) => `${escapeHtml(k)} (${v})`).join(', ') || '—' })}</p>
    <p class="text-sm text-muted">${t('management.flow.priority', { value: Object.entries(priorityCounts).map(([k, v]) => `${escapeHtml(k)} (${v})`).join(', ') || '—' })}</p>
    <p class="text-sm text-muted">${t('management.flow.topDestinations', { value: topDestGroups.map(([k, v]) => `${escapeHtml(categoryGroupLabel(k))} (${v})`).join(', ') || '—' })}</p>
    <p class="text-sm text-faint" style="margin-top:6px;">${t('management.flow.ageGroupNote')}</p>
  `;
}

export function renderAdminFlow(container) {
  const state = getState();
  const scopedDests = getScopedDestinations(state);
  const { counts, updatedAt } = heatmapSummary(scopedDests);
  const upcomingEvents = (state.events || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  container.innerHTML = `
    <div class="mdash">
      <div class="mdash-header">
        <div>
          <h1>${t('management.flow.title')}</h1>
          <p class="text-sm text-muted" style="margin:0;">${t('management.flow.subtitle')}</p>
        </div>
        <span class="mdash-header__meta">${t('management.flow.updatedAt', { time: updatedAt.toLocaleTimeString(getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) })}</span>
      </div>

      ${filterBarHtml(state)}

      <div class="mdash-grid">
        ${Object.entries(counts).length
    ? Object.entries(counts).map(([label, n], i) => kpiCardHtml({ id: `flow-kpi-${i}`, label, value: n, span: 2 })).join('')
    : `<p class="text-sm text-faint mdash-col-12">${t('management.flow.noPlacesInScope')}</p>`}
        <p class="text-sm text-faint mdash-col-12" style="margin:0;">${t('management.flow.placesInScope', { count: scopedDests.length })}</p>
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'flow-peak-hour', title: t('management.flow.peakHourTitle'), span: 7, tabletFull: true, chartWrap: true, chartHeight: 280,
          bodyHtml: '<canvas id="peak-hour-chart"></canvas>',
        })}
        ${dashCardHtml({
          id: 'flow-segments', title: t('management.flow.segmentsTitle'), span: 5, tabletFull: true,
          bodyHtml: segmentBlock(state),
        })}
      </div>

      <div class="mdash-grid">
        ${dashCardHtml({
          id: 'flow-events', title: t('management.flow.upcomingEventsTitle'), span: 12,
          bodyHtml: upcomingEvents.length ? `
            <div class="flex-col gap-2">
              ${upcomingEvents.map((e) => `<div class="card" style="padding:12px;"><strong>${escapeHtml(e.title)}</strong><p class="text-sm text-muted" style="margin:2px 0 0;">${formatDateShort(e.date)} · ${escapeHtml(e.description || '')}</p></div>`).join('')}
            </div>
          ` : `<p class="text-sm text-faint">${t('management.flow.noUpcomingEvents')}</p>`,
        })}
      </div>
    </div>
  `;

  wireFilterBar(container, () => renderAdminFlow(container));

  loadChartJs().then((Chart) => {
    const peakIndex = hourlyDemandToday.findIndex((h) => h.timeRange === PEAK_TIME_RANGE);
    createChart(Chart, qs('#peak-hour-chart', container), 'peak-hour-chart', {
      type: 'bar',
      data: {
        labels: hourlyDemandToday.map((h) => h.shortLabel),
        datasets: [{
          label: t('management.flow.popularityLabel'),
          data: hourlyDemandToday.map((h) => h.popularity),
          backgroundColor: hourlyDemandToday.map((h, i) => (i === peakIndex ? CHART_COLORS[4] : CHART_COLORS[0])),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: t('management.flow.peakHourTitle') },
          tooltip: {
            callbacks: {
              title: (items) => hourlyDemandToday[items[0].dataIndex].timeRange,
              label: (ctx) => {
                const h = hourlyDemandToday[ctx.dataIndex];
                return [
                  `${t('management.flow.popularityLabel')}: ${h.popularity}`,
                  t('management.flow.bookingRequestsTooltip', { count: h.bookingRequests }),
                  t('management.flow.expectedGuestsTooltip', { count: h.expectedGuests }),
                ];
              },
            },
          },
        },
        scales: {
          x: { title: { display: true, text: t('management.flow.timeSlotAxis') } },
          y: { title: { display: true, text: t('management.flow.popularityLabel') }, min: 0, max: 100 },
        },
      },
    });
  }).catch(() => {
    qs('#peak-hour-chart', container)?.insertAdjacentHTML('afterend', `<p class="text-sm text-faint">${t('management.flow.chartLoadError')}</p>`);
  });
}
