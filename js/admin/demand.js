import { getState } from '../storage.js';
import { escapeHtml, formatMoney } from '../utils.js';
import { getSlotRemaining } from '../services/bookingService.js';
import { filterBarHtml, wireFilterBar, getScopedDestinations, getScopedBookingItems } from './filters.js';
import { getAggregatedMonthly } from './metrics.js';

function unmetDemandRows(state, scopedDestIds) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const rows = [];
  state.experiences.filter((e) => scopedDestIds.has(e.destinationId)).forEach((exp) => {
    const upcoming = (exp.slots || []).filter((s) => new Date(s.date) >= today);
    if (!upcoming.length) return;
    const allTight = upcoming.every((s) => getSlotRemaining(s) <= 1);
    if (allTight) {
      const dest = state.destinations.find((d) => d.id === exp.destinationId);
      rows.push({ title: exp.title, dest: dest?.name || '—', slotCount: upcoming.length });
    }
  });
  return rows;
}

function concentrationRows(state, scopedBookingItems) {
  const byHost = {};
  scopedBookingItems.filter((bi) => !['rejected', 'cancelled'].includes(bi.status)).forEach((bi) => {
    const exp = state.experiences.find((e) => e.id === bi.experienceId);
    if (!exp) return;
    byHost[exp.hostId] = (byHost[exp.hostId] || 0) + 1;
  });
  const total = Object.values(byHost).reduce((s, v) => s + v, 0);
  const rows = Object.entries(byHost).map(([hostId, count]) => ({
    hostId,
    count,
    pct: total ? Math.round((count / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);
  return { rows, total };
}

function opportunityRows(state, scopedDestIds) {
  const rows = [];
  scopedDestIds.forEach((destId) => {
    const views = state.viewCounts[destId] || 0;
    const bookingCount = state.bookingItems.filter((bi) => bi.destinationId === destId && !['rejected', 'cancelled'].includes(bi.status)).length;
    if (views >= 3 && bookingCount === 0) {
      const dest = state.destinations.find((d) => d.id === destId);
      rows.push({ name: dest?.name || destId, views, bookingCount });
    }
  });
  return rows;
}

function forecastBlock(monthly) {
  const last3 = monthly.slice(-3);
  if (last3.length < 3) {
    return '<p class="text-sm text-faint">Chưa đủ 3 tháng dữ liệu trong phạm vi lọc để ngoại suy.</p>';
  }
  const avgDelta = ((last3[2].revenue - last3[0].revenue) / 2);
  const forecastNext = Math.max(0, Math.round(last3[2].revenue + avgDelta));
  return `
    <p class="text-sm">Doanh thu tháng kế tiếp (ước lượng): <strong>${formatMoney(forecastNext)}</strong></p>
    <p class="text-sm text-faint">Phương pháp: ngoại suy tuyến tính từ chênh lệch 3 tháng gần nhất (${last3.map((m) => m.label).join(', ')}). Giới hạn: dựa trên dữ liệu minh hoạ + booking thật trong phiên demo, chưa tính mùa vụ/lễ hội thực tế — không phải dự báo đã kiểm chứng.</p>
  `;
}

export function renderAdminDemand(container) {
  const state = getState();
  const scopedDests = getScopedDestinations(state);
  const scopedDestIds = new Set(scopedDests.map((d) => d.id));
  const scopedBookingItems = getScopedBookingItems(state);

  const unmet = unmetDemandRows(state, scopedDestIds);
  const { rows: concRows, total: concTotal } = concentrationRows(state, scopedBookingItems);
  const opportunities = opportunityRows(state, scopedDestIds);
  const monthly = getAggregatedMonthly(state);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Nhu cầu & Cơ hội</h1>
      <p class="text-sm text-muted">Cầu chưa đáp ứng, mức tập trung booking giữa các hộ và cơ hội phát triển — tính từ dữ liệu booking/lượt xem thật trong phạm vi lọc.</p>
    </div>
    ${filterBarHtml(state)}

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Cầu chưa đáp ứng theo hoạt động/slot</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Trải nghiệm có toàn bộ khung giờ sắp tới còn ≤1 chỗ trống.</p>
      ${unmet.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>Trải nghiệm</th><th>Địa điểm</th><th>Số khung giờ gần hết</th></tr></thead>
          <tbody>${unmet.map((r) => `<tr><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.dest)}</td><td>${r.slotCount}</td></tr>`).join('')}</tbody>
        </table>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa phát hiện hoạt động nào cầu vượt cung trong phạm vi lọc.</p>'}
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Mức tập trung booking giữa các hộ</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Hiển thị theo mã hộ ẩn danh hoá thứ tự (không nêu tên) để tránh so sánh trực tiếp giữa các hộ — chỉ dùng nội bộ để nhận diện mất cân bằng.</p>
      ${concRows.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>Hộ (ẩn danh)</th><th>Số booking hiệu lực</th><th>Tỷ lệ</th></tr></thead>
          <tbody>${concRows.map((r, i) => `<tr><td>Hộ #${i + 1}</td><td>${r.count}</td><td>${r.pct}%</td></tr>`).join('')}</tbody>
        </table>
        ${concRows[0] && concRows[0].pct > 50 ? `<p class="text-sm" style="margin-top:8px;color:var(--color-accent-dark,#8a5a34);">⚠️ Hộ #1 chiếm ${concRows[0].pct}% booking hiệu lực trong phạm vi lọc — cơ hội mời thêm hộ tương đương để cân bằng cơ hội hiển thị.</p>` : ''}
      ` : `<p class="text-sm text-faint" style="margin-top:10px;">Chưa có booking hiệu lực nào (tổng ${concTotal}).</p>`}
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Cơ hội phát triển sản phẩm / mở rộng mạng lưới</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Địa điểm có ≥3 lượt xem trong phiên demo nhưng chưa có booking hiệu lực nào — dấu hiệu cần cải thiện giá/ảnh/mô tả hoặc bổ sung hoạt động trả phí.</p>
      ${opportunities.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>Địa điểm</th><th>Lượt xem</th><th>Booking hiệu lực</th></tr></thead>
          <tbody>${opportunities.map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${r.views}</td><td>${r.bookingCount}</td></tr>`).join('')}</tbody>
        </table>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa phát hiện cơ hội loại này trong phạm vi lọc.</p>'}
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Dự báo mô phỏng</h3>
      ${forecastBlock(monthly)}
    </section>
  `;

  wireFilterBar(container, () => renderAdminDemand(container));
}
