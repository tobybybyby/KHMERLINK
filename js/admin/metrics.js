// Số liệu tổng hợp dùng chung cho các trang Cổng dữ liệu quản lý — cùng nguồn với Studio
// (state.metrics.monthlyByHost, đã gắn nhãn minh hoạ) cộng dồn với booking thật trong phạm vi
// đang lọc, không tạo bộ số ngẫu nhiên riêng cho dashboard này.
import { getScopedBookingItems, getScopedHostIds, adminFilters } from './filters.js';

export function getAggregatedMonthly(state) {
  const hostIds = getScopedHostIds(state);
  const perHost = hostIds.map((id) => state.metrics.monthlyByHost[id] || []).filter((a) => a.length);
  const len = perHost[0] ? perHost[0].length : 12;
  const combined = [];
  for (let i = 0; i < len; i += 1) {
    let revenue = 0;
    let visitors = 0;
    let label = '';
    perHost.forEach((arr) => {
      if (arr[i]) { revenue += arr[i].revenue; visitors += arr[i].visitors; label = arr[i].label; }
    });
    combined.push({ label, revenue, visitors });
  }
  return combined;
}

export function computeLiveCurrentMonth(state) {
  const now = new Date();
  const items = getScopedBookingItems(state).filter((bi) => {
    if (!['accepted', 'completed'].includes(bi.status)) return false;
    const at = new Date(bi.statusHistory[0]?.at || bi.statusHistory[bi.statusHistory.length - 1]?.at);
    return at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth();
  });
  const revenue = items.reduce((s, bi) => s + bi.subtotal, 0);
  const visitors = items.reduce((s, bi) => s + bi.quantity, 0);
  return { revenue, visitors, hasRealData: items.length > 0 };
}

/** Dãy tháng để hiển thị biểu đồ — tháng cuối cùng luôn được ghi đè bằng số liệu thật đã tính
 * (khớp với bảng booking), số tháng trả về theo bộ lọc "months" đang chọn. */
export function getDisplayMonths(state) {
  const combined = getAggregatedMonthly(state);
  const live = computeLiveCurrentMonth(state);
  const withLive = combined.map((m, i) => (i === combined.length - 1 && live.hasRealData ? { ...m, revenue: live.revenue, visitors: live.visitors } : m));
  return withLive.slice(-adminFilters.months);
}
