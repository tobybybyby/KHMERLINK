// "Nhu cầu & Cơ hội" — Cổng dữ liệu quản lý (PHASE cập nhật gần nhất). Toàn bộ số liệu đọc qua
// js/services/managementService.js (selector trung tâm, không tự tính KPI ở đây) — trước phase này
// trang dùng state.bookingItems/state.experiences/state.viewCounts trực tiếp, một bộ dữ liệu KHÁC
// với Tổng quan/Lịch & Booking (chỉ phản ánh 3 listing có "trải nghiệm thật", bỏ sót 7/7 booking
// demo) — đã thay hoàn toàn bằng nguồn chung.
import { getState, setOpportunityActionStatus } from '../storage.js';
import { escapeHtml, formatMoney, qs, qsa } from '../utils.js';
import { adminFilters, filterBarHtml, wireFilterBar } from './filters.js';
import { getCurrentPeriod } from '../services/hostBookingService.js';
import { loadChartJs, createChart, CHART_COLORS } from '../services/chartService.js';
import {
  getCustomerDemandMetrics, getDemandFunnel, getInterestDistribution, getCapacityUtilisation,
  getRevenueMetrics, getDemandTrendSeries, getForecast, getOpportunityRecommendations, hasUnscopableFilters,
} from '../services/managementService.js';
import { MANAGEMENT_SIMULATED_NOTE, LOW_SAMPLE_NOTE, FORECAST_DISCLAIMER } from '../../data/pilot-seed-data.js';

// ---------- Bộ lọc bổ sung riêng cho trang này (không có trường tương đương trong adminFilters
// dùng chung — theo đúng tiền lệ filter riêng của proposals.js) — module-level, không lưu localStorage. ----------
const demandLocalFilters = { paidOrFree: '', groupType: '', tripDuration: '', budgetRange: '', bookingStatus: '' };
let forecastMetric = 'grossValue';

function buildFilters() {
  return {
    providerId: adminFilters.providerId,
    activityId: adminFilters.listingId,
    category: adminFilters.group,
    paidOrFree: demandLocalFilters.paidOrFree,
    groupType: demandLocalFilters.groupType,
    tripDuration: demandLocalFilters.tripDuration,
    budgetRange: demandLocalFilters.budgetRange,
    bookingStatus: demandLocalFilters.bookingStatus,
  };
}

function pctLabel(v, { signed = false } = {}) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const sign = signed && v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

function growthCls(v) {
  if (v === null || v === undefined) return 'text-faint';
  return v >= 0 ? 'text-success' : 'text-danger';
}

function monthLabelOf(monthKey) {
  const [y, m] = monthKey.split('-');
  return `T${Number(m)}/${y}`;
}

// ---------- Bộ lọc bổ sung (paidOrFree/groupType/tripDuration/budgetRange/bookingStatus) ----------
function localFilterBarHtml() {
  return `
    <div class="card admin-filterbar" style="padding:14px 16px;">
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
        <div>
          <label class="field-label" for="df-paid">Paid / Free</label>
          <select class="field-select" id="df-paid">
            <option value="">Tất cả</option>
            <option value="paid" ${demandLocalFilters.paidOrFree === 'paid' ? 'selected' : ''}>Paid experience</option>
            <option value="free" ${demandLocalFilters.paidOrFree === 'free' ? 'selected' : ''}>Free visit</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="df-group">Group type (booking)</label>
          <select class="field-select" id="df-group">
            <option value="">Tất cả</option>
            <option value="family" ${demandLocalFilters.groupType === 'family' ? 'selected' : ''}>Gia đình</option>
            <option value="friends" ${demandLocalFilters.groupType === 'friends' ? 'selected' : ''}>Nhóm bạn</option>
            <option value="solo" ${demandLocalFilters.groupType === 'solo' ? 'selected' : ''}>Đi một mình</option>
            <option value="school_or_corporate" ${demandLocalFilters.groupType === 'school_or_corporate' ? 'selected' : ''}>Trường học / doanh nghiệp</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="df-status">Booking status</label>
          <select class="field-select" id="df-status">
            <option value="">Tất cả</option>
            <option value="pending" ${demandLocalFilters.bookingStatus === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${demandLocalFilters.bookingStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="completed" ${demandLocalFilters.bookingStatus === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="df-duration">Trip duration</label>
          <select class="field-select" id="df-duration">
            <option value="">Tất cả</option>
            <option value="short" ${demandLocalFilters.tripDuration === 'short' ? 'selected' : ''}>2–4 giờ</option>
            <option value="half" ${demandLocalFilters.tripDuration === 'half' ? 'selected' : ''}>Nửa ngày</option>
            <option value="full" ${demandLocalFilters.tripDuration === 'full' ? 'selected' : ''}>Cả ngày</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="df-budget">Budget range</label>
          <select class="field-select" id="df-budget">
            <option value="">Tất cả</option>
            <option value="under300" ${demandLocalFilters.budgetRange === 'under300' ? 'selected' : ''}>Dưới 300.000₫</option>
            <option value="300to600" ${demandLocalFilters.budgetRange === '300to600' ? 'selected' : ''}>300.000–600.000₫</option>
            <option value="over600" ${demandLocalFilters.budgetRange === 'over600' ? 'selected' : ''}>Trên 600.000₫</option>
          </select>
        </div>
      </div>
      <p class="text-sm text-faint" style="margin:8px 0 0;">"Trip duration"/"Budget range" chưa có trường tương ứng trên booking record (chỉ tồn tại dưới dạng % cố định toàn mạng lưới) — chọn 2 bộ lọc này sẽ hiện ghi chú mẫu nhỏ thay vì số liệu bị cắt sai.</p>
    </div>
  `;
}

function wireLocalFilterBar(container, onChange) {
  const bind = (id, key) => {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('change', () => { demandLocalFilters[key] = el.value; onChange(); });
  };
  bind('df-paid', 'paidOrFree');
  bind('df-group', 'groupType');
  bind('df-status', 'bookingStatus');
  bind('df-duration', 'tripDuration');
  bind('df-budget', 'budgetRange');
}

// ---------- 6.1 KPI cards ----------
function kpiCardsHtml(demand) {
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Nhu cầu tháng ${monthLabelOf(demand.monthKey)}</h3>
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
        <div class="quick-fact">
          <span class="quick-fact__label">Lượt xem địa điểm</span>
          <span class="quick-fact__value">${demand.destinationViews.toLocaleString('vi-VN')}</span>
          <span class="text-sm ${growthCls(demand.destinationViewsGrowthPct)}">${pctLabel(demand.destinationViewsGrowthPct, { signed: true })} so với tháng trước</span>
        </div>
        <div class="quick-fact">
          <span class="quick-fact__label">Active bookings</span>
          <span class="quick-fact__value">${demand.activeBookings.toLocaleString('vi-VN')}</span>
          <span class="text-sm ${growthCls(demand.activeBookingsGrowthPct)}">${pctLabel(demand.activeBookingsGrowthPct, { signed: true })} so với tháng trước</span>
        </div>
        <div class="quick-fact">
          <span class="quick-fact__label">Tổng khách</span>
          <span class="quick-fact__value">${demand.guests.toLocaleString('vi-VN')}</span>
          <span class="text-sm ${growthCls(demand.guestsGrowthPct)}">${pctLabel(demand.guestsGrowthPct, { signed: true })} so với tháng trước</span>
        </div>
        <div class="quick-fact">
          <span class="quick-fact__label">Tổng giá trị booking</span>
          <span class="quick-fact__value">${formatMoney(demand.grossValue)}</span>
          <span class="text-sm ${growthCls(demand.grossValueGrowthPct)}">${pctLabel(demand.grossValueGrowthPct, { signed: true })} so với tháng trước</span>
        </div>
        <div class="quick-fact">
          <span class="quick-fact__label">Partial-match rate</span>
          <span class="quick-fact__value">${pctLabel(demand.partialMatchRate)}</span>
        </div>
        <div class="quick-fact">
          <span class="quick-fact__label">Booking conversion (từ hành trình submit)</span>
          <span class="quick-fact__value">${pctLabel(demand.bookingConversionFromItineraryPct)}</span>
        </div>
      </div>
      ${demand.scopedToProviderOrActivity ? '<p class="text-sm text-faint" style="margin-top:8px;">Đang lọc theo đơn vị/hoạt động: active booking/khách/giá trị đã áp dụng đúng bộ lọc, nhưng % tăng trưởng bị ẩn (tháng trước không có dữ liệu tách theo từng đơn vị để so sánh công bằng) — lượt xem vẫn hiển thị theo quy mô toàn mạng lưới.</p>' : ''}
    </section>
  `;
}

// ---------- Phase 5: demand funnel ----------
function funnelHtml(funnel) {
  const max = funnel.steps[0].value || 1;
  const rows = funnel.steps.map((s, i) => {
    const widthPct = Math.max(4, Math.round((s.value / max) * 100));
    return `
      <div style="margin-bottom:8px;">
        <div class="flex justify-between items-center" style="font-size:0.85rem;">
          <span>${escapeHtml(s.label)}</span>
          <span><strong>${s.value.toLocaleString('vi-VN')}</strong> ${escapeHtml(s.unit)}</span>
        </div>
        <div style="background:var(--color-border);border-radius:6px;height:14px;overflow:hidden;margin-top:3px;">
          <div style="width:${widthPct}%;background:${CHART_COLORS[i % CHART_COLORS.length]};height:100%;"></div>
        </div>
      </div>
    `;
  }).join('');
  const c = funnel.conversions;
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Customer Demand Funnel</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Đơn vị mỗi bước khác nhau (lượt xem/yêu cầu/hành trình/đoàn booking/review) — không cộng gộp trực tiếp giữa các bước.</p>
      ${rows}
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-top:10px;">
        <div class="quick-fact"><span class="quick-fact__label">Lượt xem → Thêm giỏ</span><span class="quick-fact__value">${pctLabel(c.cartAddRate * 100)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Cá nhân hóa → Hành trình submit</span><span class="quick-fact__value">${pctLabel(c.customisationCompletionRate * 100)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Hành trình submit → Booking</span><span class="quick-fact__value">${pctLabel(c.bookingConversionRate * 100)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Booking → Hoàn thành</span><span class="quick-fact__value">${pctLabel(c.completedRate * 100)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Hoàn thành → Review</span><span class="quick-fact__value">${pctLabel(c.reviewRate * 100)}</span></div>
      </div>
    </section>
  `;
}

// ---------- Phase 6.5: current preferences (bar ngang, không dùng pie) ----------
function preferenceGroupHtml(title, items) {
  return `
    <div>
      <p class="text-sm" style="font-weight:600;margin:0 0 6px;">${escapeHtml(title)}</p>
      ${items.map((it, i) => `
        <div style="margin-bottom:6px;">
          <div class="flex justify-between" style="font-size:0.82rem;"><span>${escapeHtml(it.label)}</span><span>${it.pct}%</span></div>
          <div style="background:var(--color-border);border-radius:6px;height:10px;overflow:hidden;margin-top:2px;">
            <div style="width:${it.pct}%;background:${CHART_COLORS[i % CHART_COLORS.length]};height:100%;"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function preferencesHtml(pref) {
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Sở thích khách hiện tại</h3>
      <div class="flex gap-4 wrap">
        ${preferenceGroupHtml('Thời lượng chuyến đi', pref.tripDuration)}
        ${preferenceGroupHtml('Ngân sách', pref.budget)}
        ${preferenceGroupHtml('Loại nhóm', pref.groupType)}
        ${preferenceGroupHtml('Khung giờ ưa thích', pref.preferredTime)}
      </div>
      <p class="text-sm text-muted" style="margin-top:10px;">Nhu cầu cuối tuần cao hơn ngày thường khoảng <strong>${pref.weekendUpliftPct}%</strong>.</p>
    </section>
  `;
}

// ---------- Phase 6.4: interest insight ----------
function interestInsightHtml(interest) {
  const cur = interest.currentMonth;
  return `
    <p class="text-sm" style="margin-top:8px;">
      Hands-on craft tăng từ 18% lên ${cur.handsOnCraft}%. Local food tăng từ 18% lên ${cur.localFood}%.
      Tổng nhu cầu dành cho craft và food đạt ${cur.handsOnCraft + cur.localFood}%. Heritage vẫn là nhóm quan tâm lớn nhất với ${cur.heritage}%.
    </p>
    <p class="text-sm text-faint" style="margin:4px 0 0;">🔎 Insight từ dữ liệu mô phỏng: du khách đang chuyển dần từ chỉ tham quan sang trải nghiệm có tương tác — không phải kết luận nghiên cứu chính thức.</p>
  `;
}

// ---------- Phase 7: demand–capacity gap (dạng card, tự chuyển responsive trên mọi kích thước) ----------
function occupancyTone(rate) {
  if (rate === null) return { label: 'Không giới hạn (miễn phí)', cls: 'badge-type' };
  if (rate >= 0.80) return { label: `${(rate * 100).toFixed(1)}% — gần đầy`, cls: 'badge-recognized' };
  if (rate >= 0.50) return { label: `${(rate * 100).toFixed(1)}% — trung bình`, cls: 'badge-demo' };
  return { label: `${(rate * 100).toFixed(1)}% — còn nhiều chỗ`, cls: 'badge-free' };
}

function capacityCardsHtml(rows) {
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Demand–Capacity Gap</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">occupancyRate = bookedSeats / availableSeatCapacity (ước lượng: sức chứa mỗi lượt × số khung giờ/ngày × số ngày mở cửa trong tháng). Điểm miễn phí không có khái niệm sức chứa cố định.</p>
      <div class="flex-col gap-3" style="margin-top:10px;">
        ${rows.map((r) => {
          const tone = occupancyTone(r.occupancyRate);
          return `
            <div class="activity-card">
              <div class="activity-card__head">
                <strong>${escapeHtml(r.name)}</strong>
                <span class="badge ${tone.cls}">${escapeHtml(tone.label)}</span>
              </div>
              <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin-top:6px;">
                <div class="quick-fact"><span class="quick-fact__label">Demand (khách)</span><span class="quick-fact__value">${r.demandGuests}</span></div>
                <div class="quick-fact"><span class="quick-fact__label">Capacity ước lượng</span><span class="quick-fact__value">${r.availableSeatCapacity ? r.availableSeatCapacity.toLocaleString('vi-VN') : 'Không giới hạn'}</span></div>
                <div class="quick-fact"><span class="quick-fact__label">Pending</span><span class="quick-fact__value">${r.pendingCount}</span></div>
                <div class="quick-fact"><span class="quick-fact__label">Cơ hội</span><span class="quick-fact__value">${escapeHtml(r.opportunity)}</span></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

// ---------- Phase 8: forecast ----------
const FORECAST_METRIC_OPTIONS = [
  { key: 'destinationViews', label: 'Lượt xem địa điểm' },
  { key: 'customisationRequests', label: 'Yêu cầu cá nhân hóa' },
  { key: 'activeBookings', label: 'Active bookings' },
  { key: 'guests', label: 'Tổng khách' },
  { key: 'grossValue', label: 'Tổng giá trị booking' },
];

function forecastSectionHtml() {
  return `
    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Dự báo 3 tháng tiếp theo</h3>
        <select class="field-select" id="df-forecast-metric" style="max-width:220px;">
          ${FORECAST_METRIC_OPTIONS.map((m) => `<option value="${m.key}" ${forecastMetric === m.key ? 'selected' : ''}>${escapeHtml(m.label)}</option>`).join('')}
        </select>
      </div>
      <canvas id="df-forecast-chart" height="220" style="margin-top:10px;"></canvas>
      <p class="text-sm text-faint" style="margin-top:8px;">${escapeHtml(FORECAST_DISCLAIMER)}</p>
    </section>
  `;
}

// ---------- Phase 9/10: opportunity recommendations ----------
const STATUS_LABEL = { new: 'Chưa xử lý', planned: 'Đã lên kế hoạch', assigned: 'Đã giao', in_progress: 'Đang xử lý', done: 'Hoàn thành' };
const STATUS_CLS = { new: 'badge-demo', planned: 'badge-type', assigned: 'badge-type', in_progress: 'badge-recognized', done: 'badge-free' };
const PRIORITY_CLS = { High: 'badge-recognized', 'Medium–High': 'badge-type', Medium: 'badge-demo' };

function opportunityCardHtml(rec) {
  const actionList = Array.isArray(rec.recommendedAction) ? rec.recommendedAction : [rec.recommendedAction];
  return `
    <div class="activity-card" data-opp-card="${rec.id}">
      <div class="activity-card__head">
        <strong>${escapeHtml(rec.title)}</strong>
        <span class="badge ${PRIORITY_CLS[rec.priority] || 'badge-type'}">${escapeHtml(rec.priority)}</span>
      </div>
      <p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(rec.opportunity)}</p>
      <p class="text-sm" style="margin:6px 0 0;"><strong>Trạng thái:</strong> <span class="badge ${STATUS_CLS[rec.status] || 'badge-demo'}">${STATUS_LABEL[rec.status] || rec.status}</span>${rec.assignedTo ? ` · Giao cho: ${escapeHtml(rec.assignedTo)}` : ''}</p>
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin:6px 0 0;">
        <div class="quick-fact"><span class="quick-fact__label">Phụ trách</span><span class="quick-fact__value" style="font-size:0.82rem;">${escapeHtml(rec.responsibleParty)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Thời hạn</span><span class="quick-fact__value" style="font-size:0.82rem;">${escapeHtml(rec.timeframe)}</span></div>
        <div class="quick-fact"><span class="quick-fact__label">Kỳ vọng</span><span class="quick-fact__value" style="font-size:0.82rem;">${escapeHtml(rec.expectedImpact)}</span></div>
      </div>
      <details style="margin-top:8px;">
        <summary class="text-sm" style="cursor:pointer;">Xem bằng chứng</summary>
        <ul style="padding-left:18px;margin:6px 0 0;">${rec.evidence.map((e) => `<li class="text-sm">${escapeHtml(e)}</li>`).join('')}</ul>
        <p class="text-sm text-muted" style="margin-top:6px;"><strong>Hành động đề xuất:</strong></p>
        <ul style="padding-left:18px;margin:2px 0 0;">${actionList.map((a) => `<li class="text-sm">${escapeHtml(a)}</li>`).join('')}</ul>
        ${rec.internalNote ? `<p class="text-sm text-faint" style="margin-top:6px;">${escapeHtml(rec.internalNote)}</p>` : ''}
      </details>
      <div class="cta-row" style="margin-top:10px;">
        <button type="button" class="btn btn-secondary btn-sm" data-opp-action="planned" data-opp-id="${rec.id}">Tạo kế hoạch hành động</button>
        <button type="button" class="btn btn-secondary btn-sm" data-opp-assign="${rec.id}">Giao cho đơn vị</button>
        <button type="button" class="btn btn-secondary btn-sm" data-opp-action="in_progress" data-opp-id="${rec.id}">Đánh dấu đang xử lý</button>
        <button type="button" class="btn btn-primary btn-sm" data-opp-action="done" data-opp-id="${rec.id}">Đánh dấu hoàn thành</button>
      </div>
    </div>
  `;
}

function opportunitiesHtml(recs) {
  return `
    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Cơ hội (${recs.length})</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Tự động bật/tắt theo dữ liệu hiện tại (pending rate, partial-match rate, occupancy, điểm đánh giá...) — không phải danh sách cố định.</p>
      <div class="flex-col gap-3" style="margin-top:10px;">${recs.map(opportunityCardHtml).join('')}</div>
    </section>
  `;
}

export function renderAdminDemand(container) {
  const state = getState();
  const period = getCurrentPeriod();
  const filters = buildFilters();

  const demand = getCustomerDemandMetrics(state, period, filters);
  const funnel = getDemandFunnel(state, period, filters);
  const interest = getInterestDistribution(state, period, filters);
  const capacityRows = getCapacityUtilisation(state, period, filters);
  const revenue = getRevenueMetrics(state, period, filters);
  const recs = getOpportunityRecommendations(state, period, filters);
  const monthsWindow = Math.min(adminFilters.months || 6, 6);
  const trendSlice = (arr) => arr.slice(-monthsWindow);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Nhu cầu & Cơ hội</h1>
      <p class="text-sm text-muted">Du khách đang quan tâm điều gì, nhu cầu tăng/giảm ra sao, năng lực hiện tại có đáp ứng được không, và Cổng quản lý nên hành động thế nào — tổng hợp trực tiếp từ Activity Catalog + booking records + review, không dùng bộ dữ liệu riêng.</p>
      <p class="text-sm text-faint">🏷️ <strong>Historical demo data</strong> (6 tháng mô phỏng) · 🏷️ <strong>Current operational data</strong> (tính lại từ booking records tháng hiện tại) · 🏷️ <strong>Forecast</strong> (ngoại suy tuyến tính). ${escapeHtml(MANAGEMENT_SIMULATED_NOTE)}</p>
    </div>
    ${filterBarHtml(state)}
    ${localFilterBarHtml()}
    ${hasUnscopableFilters(filters) ? `<div class="demo-note">${escapeHtml(LOW_SAMPLE_NOTE)}</div>` : ''}

    ${kpiCardsHtml(demand)}
    ${funnelHtml(funnel)}

    <div class="flex gap-4 wrap">
      <section class="card" style="padding:20px;flex:1;min-width:280px;">
        <h3 style="margin-top:0;">Digital demand theo tháng</h3>
        <p class="text-sm text-faint" style="margin-top:-4px;">Bấm vào tên trong chú thích để bật/tắt từng đường.</p>
        <canvas id="df-digital-chart" height="220"></canvas>
      </section>
      <section class="card" style="padding:20px;flex:1;min-width:280px;">
        <h3 style="margin-top:0;">Converted demand theo tháng</h3>
        <canvas id="df-converted-chart" height="220"></canvas>
      </section>
    </div>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Doanh thu ghi nhận theo tháng</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Điểm miễn phí (Cụm Nguyệt Hóa, Chùa Âng, Chùa Lò Gạch) không đưa vào biểu đồ này.</p>
      <canvas id="df-revenue-chart" height="220"></canvas>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Xu hướng sở thích (Interest trend)</h3>
      <canvas id="df-interest-chart" height="220"></canvas>
      ${interestInsightHtml(interest)}
    </section>

    ${preferencesHtml(interest.preferences)}
    ${capacityCardsHtml(capacityRows)}
    ${forecastSectionHtml()}
    ${opportunitiesHtml(recs)}
  `;

  wireFilterBar(container, () => renderAdminDemand(container));
  wireLocalFilterBar(container, () => renderAdminDemand(container));

  qs('#df-forecast-metric', container).addEventListener('change', (e) => {
    forecastMetric = e.target.value;
    renderAdminDemand(container);
  });

  qsa('[data-opp-action]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      setOpportunityActionStatus(btn.dataset.oppId, btn.dataset.oppAction);
      renderAdminDemand(container);
    });
  });
  qsa('[data-opp-assign]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = window.prompt('Giao gợi ý này cho đơn vị/người phụ trách nào?', '');
      if (name === null) return;
      setOpportunityActionStatus(btn.dataset.oppAssign, 'assigned', { assignedTo: name.trim() || 'Chưa nêu tên' });
      renderAdminDemand(container);
    });
  });

  const trendRows = trendSlice(getDemandTrendSeries(state, period, filters));

  loadChartJs().then((Chart) => {
    const monthLabel = monthLabelOf;

    createChart(Chart, qs('#df-digital-chart', container), 'df-digital-chart', {
      type: 'line',
      data: {
        labels: trendRows.map((r) => monthLabel(r.month)),
        datasets: buildDigitalDatasets(trendRows),
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, interaction: { mode: 'index', intersect: false } },
    });

    createChart(Chart, qs('#df-converted-chart', container), 'df-converted-chart', {
      type: 'line',
      data: {
        labels: trendRows.map((r) => monthLabel(r.month)),
        datasets: buildConvertedDatasets(trendRows),
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, interaction: { mode: 'index', intersect: false } },
    });

    createChart(Chart, qs('#df-revenue-chart', container), 'df-revenue-chart', {
      type: 'bar',
      data: {
        labels: trendSlice(revenue.monthlySeries).map((m) => monthLabel(m.month)),
        datasets: [{ label: 'Tổng giá trị booking (đ)', data: trendSlice(revenue.monthlySeries).map((m) => m.grossValue), backgroundColor: CHART_COLORS[0] }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const isCurrent = ctx.label === monthLabel(revenue.monthKey);
                const lines = [`Tổng giá trị: ${formatMoney(ctx.parsed.y)}`];
                if (isCurrent) {
                  lines.push(`Thu nhập community providers: ${formatMoney(revenue.currentMonth.communityIncome)}`);
                  lines.push(`Platform fee: ${formatMoney(revenue.currentMonth.communityFee)}`);
                  lines.push(`Museum ticket revenue: ${formatMoney(revenue.currentMonth.ticketGross)}`);
                } else {
                  lines.push('(Chi tiết theo nguồn chỉ có cho tháng hiện tại)');
                }
                return lines;
              },
            },
          },
        },
        scales: { y: { ticks: { callback: (v) => new Intl.NumberFormat('vi-VN').format(v) } } },
      },
    });

    createChart(Chart, qs('#df-interest-chart', container), 'df-interest-chart', {
      type: 'line',
      data: {
        labels: trendSlice(interest.trend).map((m) => monthLabel(m.month)),
        datasets: Object.keys(interest.labels).map((key, i) => ({
          label: interest.labels[key],
          data: trendSlice(interest.trend).map((m) => m[key]),
          borderColor: CHART_COLORS[i % CHART_COLORS.length],
          backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}22`,
          tension: 0.3,
        })),
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { ticks: { callback: (v) => `${v}%` } } } },
    });

    const forecast = getForecast(state, period, forecastMetric, 3);
    const allMonths = [...forecast.actualMonths, ...forecast.forecastMonths];
    const actualData = [...forecast.actual, ...Array(forecast.forecastMonths.length).fill(null)];
    // Nối điểm cuối actual với điểm đầu forecast để đường liền/đứt nối liên tục, không đứt gãy.
    const forecastData = [...Array(forecast.actual.length - 1).fill(null), forecast.actual[forecast.actual.length - 1], ...forecast.forecast.map((f) => f.value)];
    const forecastHigh = [...Array(forecast.actual.length - 1).fill(null), forecast.actual[forecast.actual.length - 1], ...forecast.forecast.map((f) => f.high)];
    const forecastLow = [...Array(forecast.actual.length - 1).fill(null), forecast.actual[forecast.actual.length - 1], ...forecast.forecast.map((f) => f.low)];

    createChart(Chart, qs('#df-forecast-chart', container), 'df-forecast-chart', {
      type: 'line',
      data: {
        labels: allMonths.map(monthLabel),
        datasets: [
          { label: 'Actual', data: actualData, borderColor: CHART_COLORS[0], backgroundColor: `${CHART_COLORS[0]}22`, pointStyle: 'circle', tension: 0.25, spanGaps: false },
          { label: 'Forecast (khoảng ước lượng)', data: forecastHigh, borderColor: 'transparent', backgroundColor: `${CHART_COLORS[1]}22`, pointRadius: 0, fill: '+1', tension: 0.25 },
          { label: 'Forecast (dưới)', data: forecastLow, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false, tension: 0.25, hidden: false },
          { label: 'Forecast', data: forecastData, borderColor: CHART_COLORS[1], borderDash: [8, 5], pointStyle: 'triangle', tension: 0.25, spanGaps: false },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { filter: (item) => item.text !== 'Forecast (dưới)' } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString('vi-VN')}` } },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }).catch(() => {
    qs('#df-digital-chart', container)?.insertAdjacentHTML('afterend', '<p class="text-sm text-faint">Không tải được thư viện biểu đồ (mạng chặn CDN) — xem số liệu ở các thẻ/bảng bên trên.</p>');
  });
}

function buildDigitalDatasets(rows) {
  return [
    { label: 'Lượt xem', data: rows.map((r) => r.destinationViews), borderColor: CHART_COLORS[0], backgroundColor: `${CHART_COLORS[0]}22`, tension: 0.3 },
    { label: 'Lượt thêm giỏ', data: rows.map((r) => r.tripCartAdds), borderColor: CHART_COLORS[2], backgroundColor: `${CHART_COLORS[2]}22`, tension: 0.3 },
    { label: 'Yêu cầu cá nhân hóa', data: rows.map((r) => r.customisationRequests), borderColor: CHART_COLORS[3], backgroundColor: `${CHART_COLORS[3]}22`, tension: 0.3 },
  ];
}

function buildConvertedDatasets(rows) {
  return [
    { label: 'Active bookings', data: rows.map((r) => r.activeBookings), borderColor: CHART_COLORS[1], backgroundColor: `${CHART_COLORS[1]}22`, tension: 0.3 },
    { label: 'Khách', data: rows.map((r) => r.guests), borderColor: CHART_COLORS[4], backgroundColor: `${CHART_COLORS[4]}22`, tension: 0.3 },
  ];
}
