import { getState } from '../storage.js';
import { escapeHtml, formatMoney, categoryGroup } from '../utils.js';
import { adminFilters, filterBarHtml, wireFilterBar, getScopedBookingItems, getScopedDestinations } from './filters.js';
import { getDisplayMonths } from './metrics.js';

export function renderAdminOverview(container) {
  const state = getState();
  const scoped = getScopedBookingItems(state);
  const scopedDests = getScopedDestinations(state);

  const bookingIds = new Set(scoped.map((bi) => bi.bookingId));
  const completed = scoped.filter((bi) => bi.status === 'completed');
  const decided = scoped.filter((bi) => bi.status !== 'pending');
  const completionRate = decided.length ? Math.round((completed.length / decided.length) * 100) : null;
  const revenue = scoped.filter((bi) => ['accepted', 'completed'].includes(bi.status)).reduce((s, bi) => s + bi.subtotal, 0);
  const participants = completed.reduce((s, bi) => s + bi.quantity, 0);

  const displayMonths = getDisplayMonths(state);
  const maxRevenue = Math.max(1, ...displayMonths.map((m) => m.revenue));

  // Doanh thu theo NHÓM hoạt động (không theo từng hộ) — đúng yêu cầu "không công khai doanh
  // thu... từng hộ", ranking mặc định theo cụm/nhóm.
  const revenueByGroup = {};
  scoped.filter((bi) => ['accepted', 'completed'].includes(bi.status)).forEach((bi) => {
    const dest = state.destinations.find((d) => d.id === bi.destinationId);
    const group = categoryGroup(dest?.category);
    revenueByGroup[group] = (revenueByGroup[group] || 0) + bi.subtotal;
  });
  const groupRows = Object.entries(revenueByGroup).sort((a, b) => b[1] - a[1]);

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Tổng quan</h1>
      <p class="text-sm text-muted">Booking, lượt tham gia, tỷ lệ hoàn thành, doanh thu trải nghiệm và xu hướng theo tháng — tính trực tiếp từ dữ liệu booking dùng chung, không phải số liệu chính thức của tỉnh.</p>
    </div>
    ${filterBarHtml(state)}

    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">Tổng booking</span><span class="quick-fact__value">${bookingIds.size}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Lượt tham gia hoàn thành</span><span class="quick-fact__value">${participants}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Tỷ lệ hoàn thành</span><span class="quick-fact__value">${completionRate === null ? '—' : `${completionRate}%`}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Doanh thu trải nghiệm</span><span class="quick-fact__value">${formatMoney(revenue)}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Địa điểm trong phạm vi lọc</span><span class="quick-fact__value">${scopedDests.length}</span></div>
    </div>
    <p class="text-sm text-faint" style="margin-top:-6px;">Tỷ lệ hoàn thành = hoàn thành / (hoàn thành + đã xác nhận + bị từ chối + đã huỷ) trong phạm vi lọc — không tính booking bị từ chối/huỷ là lượt hoàn thành.</p>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Doanh thu ${adminFilters.months} tháng gần nhất</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Nền minh hoạ giống biểu đồ hộ ở Studio (đã gắn nhãn), cộng dồn booking thật trong phạm vi lọc — tháng hiện tại lấy từ dữ liệu thật.</p>
      <div class="flex items-end gap-1" style="margin-top:14px;height:130px;">
        ${displayMonths.map((m) => `
          <div class="flex-col items-center gap-1" style="flex:1;height:100%;justify-content:flex-end;" title="${escapeHtml(m.label)}: ${formatMoney(m.revenue)}">
            <div style="width:100%;max-width:26px;background:var(--color-primary,#6b4423);border-radius:3px 3px 0 0;height:${Math.max(4, Math.round((m.revenue / maxRevenue) * 100))}%;"></div>
            <span class="text-sm text-faint" style="font-size:11px;">${escapeHtml(m.label)}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Doanh thu theo nhóm hoạt động</h3>
      <p class="text-sm text-faint" style="margin-top:-4px;">Xếp hạng theo cụm/nhóm loại hình — không hiển thị doanh thu hoặc CPS của từng hộ riêng lẻ.</p>
      ${groupRows.length ? `
        <table class="admin-table" style="margin-top:10px;">
          <thead><tr><th>Nhóm hoạt động</th><th>Doanh thu</th></tr></thead>
          <tbody>
            ${groupRows.map(([g, v]) => `<tr><td>${escapeHtml(g)}</td><td>${formatMoney(v)}</td></tr>`).join('')}
          </tbody>
        </table>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa có booking hiệu lực nào trong phạm vi lọc.</p>'}
    </section>
  `;

  wireFilterBar(container, () => renderAdminOverview(container));
}
