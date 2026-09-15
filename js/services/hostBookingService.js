// Lớp hợp nhất + tổng hợp dữ liệu Booking cho TOÀN BỘ 7 đơn vị cung cấp — NGUỒN DUY NHẤT dùng
// chung giữa "Tổng quan", "Lịch & Booking" (Studio) và Cổng quản lý (PHASE 15/09/2026). Trước phase
// này, Tổng quan đọc qua metricsService/historicalMetrics còn Lịch & Booking đọc qua module này
// riêng — 2 nguồn khác nhau nên số liệu lệch nhau. Từ giờ CẢ HAI đều gọi getProviderMetrics()/
// getProviderBookings() ở đây, đảm bảo luôn khớp tuyệt đối.
//
// Gộp booking THẬT (state.bookingItems, gắn 1 traveller demo của Trail) + booking DEMO cố định
// (state.hostDemoBookings, xem data/pilot-seed-data.js — nay đủ cho cả 7 đơn vị) thành 1 danh
// sách chuẩn hoá. Không tạo số liệu ngẫu nhiên khi render — mọi con số tính trực tiếp từ danh
// sách booking. "Kỳ" (period) mặc định là tháng của DEMO_REFERENCE_DATE — mốc "hiện tại" CỐ ĐỊNH
// dùng chung toàn project, không dùng `new Date()` thật (để số liệu không đổi theo ngày máy chạy).
import { findExperienceAndSlot } from './bookingService.js';
import { getOperations } from './operationsService.js';
import { weeklyDemandPattern, demandInsightsSeed, DEMO_REFERENCE_DATE, providerFinancialMeta } from '../../data/pilot-seed-data.js';

const REAL_STATUS_MAP = { pending: 'pending', accepted: 'confirmed', completed: 'completed', rejected: 'cancelled', cancelled: 'cancelled' };

export function getReferenceNow() {
  return new Date(DEMO_REFERENCE_DATE);
}

/** Kỳ mặc định = tháng của DEMO_REFERENCE_DATE — "tháng này" thống nhất cho mọi trang Host/Management. */
export function getCurrentPeriod() {
  const d = getReferenceNow();
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function getProviderFinancialMeta(providerId) {
  return providerFinancialMeta[providerId] || { financialMode: 'community_paid', platformFeeRate: 0.10 };
}

function normalizeRealBookingItem(state, bi, providerId) {
  const { slot } = findExperienceAndSlot(bi.experienceId, bi.slotId);
  const dest = state.destinations.find((d) => d.id === bi.destinationId);
  const meta = getProviderFinancialMeta(providerId);
  const grossAmount = bi.subtotal;
  const platformFee = Math.round(grossAmount * meta.platformFeeRate);
  return {
    id: bi.id,
    source: 'real',
    providerId,
    customerName: 'Bạn',
    activityId: bi.destinationId,
    activityName: dest ? dest.name : bi.title,
    bookingDate: slot ? new Date(slot.date).toISOString().slice(0, 10) : null,
    startTime: slot ? slot.startTime : null,
    groupSize: bi.quantity,
    unitPrice: bi.unitPrice,
    grossAmount,
    platformFee,
    providerIncome: grossAmount - platformFee,
    status: REAL_STATUS_MAP[bi.status] || bi.status,
    createdAt: bi.statusHistory?.[0]?.at || null,
    customerNote: bi.hostNote || '',
    contactStatus: 'not_contacted',
    proposedTime: null,
    groupType: null,
    preferredTime: slot ? slot.startTime : null,
    raw: bi,
  };
}

function normalizeDemoBooking(state, b) {
  const dest = state.destinations.find((d) => d.id === b.activityId);
  return {
    id: b.id,
    source: 'seed_demo',
    providerId: b.providerId,
    customerName: b.customerName,
    activityId: b.activityId,
    activityName: dest ? dest.name : b.activityId,
    bookingDate: b.bookingDate,
    startTime: b.startTime,
    groupSize: b.groupSize,
    unitPrice: b.unitPrice,
    grossAmount: b.grossAmount,
    platformFee: b.platformFee,
    providerIncome: b.providerIncome,
    status: b.status,
    createdAt: b.createdAt,
    customerNote: b.customerNote,
    contactStatus: b.contactStatus,
    proposedTime: b.proposedTime,
    groupType: b.groupType,
    preferredTime: b.preferredTime,
    raw: b,
  };
}

/** Toàn bộ booking (thật + demo) của 1 đơn vị cung cấp, chuẩn hoá — lọc theo `period` ({year,month},
 * 0-indexed) nếu có, ngược lại trả về TẤT CẢ (mọi thời điểm). */
export function getProviderBookings(state, providerId, period = null) {
  const expIds = new Set(state.experiences.filter((e) => e.hostId === providerId).map((e) => e.id));
  const real = state.bookingItems
    .filter((bi) => expIds.has(bi.experienceId))
    .map((bi) => normalizeRealBookingItem(state, bi, providerId))
    .filter((b) => b.bookingDate);
  const demo = (state.hostDemoBookings || []).filter((b) => b.providerId === providerId).map((b) => normalizeDemoBooking(state, b));
  const all = [...real, ...demo];
  if (!period) return all;
  return all.filter((b) => {
    const d = new Date(b.bookingDate);
    return d.getFullYear() === period.year && d.getMonth() === period.month;
  });
}

/** Booking mọi đơn vị trong `period` — dùng cho Cổng quản lý (tổng hợp mạng lưới). */
export function getAllProviderBookings(state, period = null, providerIds = null) {
  const ids = providerIds || state.hosts.map((h) => h.id);
  return ids.flatMap((pid) => getProviderBookings(state, pid, period));
}

// ---------- Công thức KPI chuẩn (mục 5 yêu cầu 15/09/2026) ----------
export function getActiveBookings(bookings) { return bookings.filter((b) => b.status !== 'cancelled'); }
export function getCompletedBookings(bookings) { return getActiveBookings(bookings).filter((b) => b.status === 'completed'); }
export function getConfirmedBookings(bookings) { return getActiveBookings(bookings).filter((b) => b.status === 'confirmed'); }
export function getPendingBookings(bookings) { return getActiveBookings(bookings).filter((b) => b.status === 'pending'); }
export function getUpcomingBookings(bookings) { return getActiveBookings(bookings).filter((b) => b.status === 'confirmed' || b.status === 'pending'); }

function sum(arr, fn) { return arr.reduce((s, x) => s + fn(x), 0); }

/** KPI chuẩn cho 1 đơn vị trong 1 kỳ — NGUỒN DUY NHẤT cho Tổng quan + Lịch & Booking (mục 6). */
export function getProviderMetrics(state, providerId, period = getCurrentPeriod()) {
  const bookings = getProviderBookings(state, providerId, period);
  const active = getActiveBookings(bookings);
  const completed = getCompletedBookings(bookings);
  const confirmed = getConfirmedBookings(bookings);
  const pending = getPendingBookings(bookings);
  const upcoming = getUpcomingBookings(bookings);

  const totalGuests = sum(active, (b) => b.groupSize);
  const completedGuests = sum(completed, (b) => b.groupSize);
  const upcomingGuests = sum(upcoming, (b) => b.groupSize);
  const grossExpected = sum(active, (b) => b.grossAmount);
  const providerExpectedIncome = sum(active, (b) => b.providerIncome);
  const providerEarnedIncome = sum(completed, (b) => b.providerIncome);
  const remainingExpectedIncome = providerExpectedIncome - providerEarnedIncome;
  const completionRate = active.length ? completed.length / active.length : null; // bảo vệ chia 0

  const cancelledCount = bookings.length - active.length;
  const meta = getProviderFinancialMeta(providerId);
  const timeslotCounts = {};
  active.forEach((b) => { if (b.startTime) timeslotCounts[b.startTime] = (timeslotCounts[b.startTime] || 0) + 1; });
  const peakTimeslot = Object.entries(timeslotCounts).sort((a, b) => b[1] - a[1])[0] || null;

  return {
    providerId,
    period,
    financialMode: meta.financialMode,
    platformFeeRate: meta.platformFeeRate,
    revenueSplitNote: meta.revenueSplitNote || null,
    bookings,
    totalBookings: active.length,
    completedCount: completed.length,
    confirmedCount: confirmed.length,
    pendingCount: pending.length,
    upcomingCount: upcoming.length,
    cancelledCount,
    totalGuests,
    completedGuests,
    upcomingGuests,
    grossExpected,
    providerExpectedIncome,
    providerEarnedIncome,
    remainingExpectedIncome,
    completionRate,
    peakTimeslot: peakTimeslot ? peakTimeslot[0] : null,
  };
}

/** KPI toàn mạng lưới trong 1 kỳ — tổng hợp trực tiếp từ getProviderMetrics() từng đơn vị, KHÔNG
 * tự cộng riêng để tránh lệch công thức (mục 9). EXP-02 (host-nhac-mua-khmer) chỉ xuất hiện 1 lần
 * trong danh sách provider (state.hosts), nên không có rủi ro đếm 2 lần dù có revenueSplitNote. */
export function getNetworkMetrics(state, period = getCurrentPeriod(), providerIds = null) {
  const ids = providerIds || state.hosts.map((h) => h.id);
  const perProvider = ids.map((pid) => getProviderMetrics(state, pid, period));

  const communityIncome = perProvider.filter((p) => p.financialMode === 'community_paid').reduce((s, p) => s + p.providerExpectedIncome, 0);
  const communityFee = perProvider.filter((p) => p.financialMode === 'community_paid').reduce((s, p) => s + (p.grossExpected - p.providerExpectedIncome), 0);
  const ticketGross = perProvider.filter((p) => p.financialMode === 'public_ticket').reduce((s, p) => s + p.grossExpected, 0);

  return {
    period,
    perProvider,
    totalActiveBookings: perProvider.reduce((s, p) => s + p.totalBookings, 0),
    totalCompleted: perProvider.reduce((s, p) => s + p.completedCount, 0),
    totalConfirmed: perProvider.reduce((s, p) => s + p.confirmedCount, 0),
    totalPending: perProvider.reduce((s, p) => s + p.pendingCount, 0),
    totalGuests: perProvider.reduce((s, p) => s + p.totalGuests, 0),
    totalGrossValue: perProvider.reduce((s, p) => s + p.grossExpected, 0),
    communityProviderIncome: communityIncome,
    communityPlatformFee: communityFee,
    ticketGrossRevenue: ticketGross,
  };
}

// ---------- Bộ lọc (Lịch & Booking) ----------
export const hostBookingFilters = { dateFrom: '', dateTo: '', status: '', activityId: '', timeslot: '', groupSizeMin: '', groupSizeMax: '', search: '' };

export function resetHostBookingFilters() {
  Object.assign(hostBookingFilters, { dateFrom: '', dateTo: '', status: '', activityId: '', timeslot: '', groupSizeMin: '', groupSizeMax: '', search: '' });
}

export function hasActiveHostBookingFilters() {
  return Object.values(hostBookingFilters).some((v) => v !== '' && v !== null && v !== undefined);
}

export function timeslotOf(startTime) {
  if (!startTime) return null;
  const h = Number(startTime.split(':')[0]);
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function applyHostBookingFilters(bookings, filters = hostBookingFilters) {
  return bookings.filter((b) => {
    if (filters.dateFrom && b.bookingDate < filters.dateFrom) return false;
    if (filters.dateTo && b.bookingDate > filters.dateTo) return false;
    if (filters.status && b.status !== filters.status) return false;
    if (filters.activityId && b.activityId !== filters.activityId) return false;
    if (filters.timeslot && timeslotOf(b.startTime) !== filters.timeslot) return false;
    if (filters.groupSizeMin && b.groupSize < Number(filters.groupSizeMin)) return false;
    if (filters.groupSizeMax && b.groupSize > Number(filters.groupSizeMax)) return false;
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      if (q && !b.customerName.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// ---------- Summary cards "Lịch & Booking" (hôm nay / 7 ngày tới — mốc DEMO_REFERENCE_DATE) ----------
function todayIso() { return getReferenceNow().toISOString().slice(0, 10); }
function daysBetween(aIso, bIso) { return Math.round((new Date(bIso) - new Date(aIso)) / 86400000); }

function computeFillRate(bookingsInWindow) {
  const byActivityDate = {};
  bookingsInWindow.forEach((b) => {
    const key = `${b.activityId}|${b.bookingDate}`;
    if (!byActivityDate[key]) byActivityDate[key] = { guests: 0, activityId: b.activityId };
    byActivityDate[key].guests += b.groupSize;
  });
  let guestSum = 0; let capSum = 0;
  Object.values(byActivityDate).forEach(({ guests, activityId }) => {
    const ops = getOperations(activityId);
    const cap = ops && ops.capacityPerSlot ? ops.capacityPerSlot : guests;
    guestSum += guests;
    capSum += cap;
  });
  return capSum ? Math.round((guestSum / capSum) * 100) : null;
}

/** Tỷ lệ hoàn thành TRONG THÁNG (khác tỷ lệ hoàn thành 12 tháng ở Báo cáo — ghi rõ nhãn để không
 * nhầm 2 khoảng thời gian, đúng yêu cầu mục 6). */
function computeCompletionRateInWindow(bookings) {
  const active = getActiveBookings(bookings);
  if (!active.length) return null;
  const completed = active.filter((b) => b.status === 'completed').length;
  return Math.round((completed / active.length) * 100);
}

export function getSummaryCards(state, providerId, filters = hostBookingFilters) {
  const all = applyHostBookingFilters(getProviderBookings(state, providerId), { ...filters, dateFrom: '', dateTo: '' });
  const today = todayIso();
  const todayActive = all.filter((b) => b.bookingDate === today && b.status !== 'cancelled');
  const next7 = all.filter((b) => {
    const d = daysBetween(today, b.bookingDate);
    return d >= 0 && d <= 6 && (b.status === 'pending' || b.status === 'confirmed');
  });
  const pending = all.filter((b) => b.status === 'pending');
  const revenue7 = next7.reduce((s, b) => s + b.grossAmount, 0);

  return {
    bookingsToday: todayActive.length,
    guestsToday: todayActive.reduce((s, b) => s + b.groupSize, 0),
    bookingsNext7: next7.length,
    guestsNext7: next7.reduce((s, b) => s + b.groupSize, 0),
    pendingCount: pending.length,
    fillRatePct: computeFillRate(next7),
    revenueNext7: revenue7,
    completionRatePctMonth: computeCompletionRateInWindow(all),
  };
}

// ---------- Weekly demand chart ----------
const WEEKDAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const WEEKDAY_LABEL = { monday: 'Thứ 2', tuesday: 'Thứ 3', wednesday: 'Thứ 4', thursday: 'Thứ 5', friday: 'Thứ 6', saturday: 'Thứ 7', sunday: 'Chủ nhật' };
const WEEKLY_AVG_PARTY_SIZE = 4;
const WEEKLY_AVG_PRICE = 220000;

export function getWeeklyDemandChartData() {
  return WEEKDAY_ORDER.map((key) => {
    const guests = weeklyDemandPattern[key];
    const bookings = Math.max(1, Math.round(guests / WEEKLY_AVG_PARTY_SIZE));
    const revenue = guests * WEEKLY_AVG_PRICE;
    return { key, label: WEEKDAY_LABEL[key], guests, bookings, revenue, isWeekend: key === 'saturday' || key === 'sunday' };
  });
}

// ---------- Calendar tháng ----------
function dominantStatusColorKey(dayBookings) {
  if (dayBookings.some((b) => b.status === 'pending')) return 'pending';
  if (dayBookings.some((b) => b.status === 'confirmed')) return 'confirmed';
  if (dayBookings.every((b) => b.status === 'completed')) return 'completed';
  return 'cancelled';
}

export function getCalendarMonthData(state, providerId, year, month) {
  const bookings = applyHostBookingFilters(getProviderBookings(state, providerId));
  const byDate = {};
  bookings.forEach((b) => {
    const d = new Date(b.bookingDate);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    if (!byDate[b.bookingDate]) byDate[b.bookingDate] = { date: b.bookingDate, bookings: [], totalBookings: 0, totalGuests: 0, timeSlotSet: new Set() };
    const day = byDate[b.bookingDate];
    day.bookings.push(b);
    day.totalBookings += 1;
    day.totalGuests += b.groupSize;
    if (b.startTime) day.timeSlotSet.add(b.startTime);
  });
  Object.values(byDate).forEach((day) => {
    day.timeSlots = Array.from(day.timeSlotSet).sort();
    delete day.timeSlotSet;
    day.statusColor = dominantStatusColorKey(day.bookings);
    day.highDemand = day.totalGuests >= 15;
  });
  return byDate;
}

// ---------- Demand insights ----------
export function getDemandInsights(state, providerId) {
  const bookings = getActiveBookings(getProviderBookings(state, providerId));
  const byActivity = {};
  const byTimeslot = {};
  bookings.forEach((b) => {
    byActivity[b.activityId] = (byActivity[b.activityId] || 0) + b.groupSize;
    if (b.startTime) byTimeslot[b.startTime] = (byTimeslot[b.startTime] || 0) + 1;
  });
  const topActivity = Object.entries(byActivity).sort((a, b) => b[1] - a[1])[0] || null;
  const topTimeslot = Object.entries(byTimeslot).sort((a, b) => b[1] - a[1])[0] || null;
  return {
    timeOfDay: demandInsightsSeed.timeOfDay,
    groupType: demandInsightsSeed.groupType,
    weekendUpliftPct: demandInsightsSeed.weekendUpliftPct,
    topActivityId: topActivity ? topActivity[0] : null,
    topActivityGuests: topActivity ? topActivity[1] : 0,
    topTimeslot: topTimeslot ? topTimeslot[0] : null,
  };
}

// ---------- Tương thích ngược (đã dùng ở bookings.js — trỏ sang hàm mới) ----------
export function getUnifiedBookings(state, providerId) { return getProviderBookings(state, providerId); }

export const HostBookingService = {
  getReferenceNow, getCurrentPeriod, getProviderFinancialMeta,
  getProviderBookings, getAllProviderBookings, getUnifiedBookings,
  getActiveBookings, getCompletedBookings, getConfirmedBookings, getPendingBookings, getUpcomingBookings,
  getProviderMetrics, getNetworkMetrics,
  hostBookingFilters, resetHostBookingFilters, hasActiveHostBookingFilters,
  timeslotOf, applyHostBookingFilters, getSummaryCards, getWeeklyDemandChartData,
  getCalendarMonthData, getDemandInsights,
};
