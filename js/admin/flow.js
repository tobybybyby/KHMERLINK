import { getState } from '../storage.js';
import { escapeHtml, getSimulatedCrowdLevel, formatDateShort } from '../utils.js';
import { filterBarHtml, wireFilterBar, getScopedDestinations } from './filters.js';

const HOUR_BUCKETS = [
  [0, 3], [3, 6], [6, 9], [9, 12], [12, 15], [15, 18], [18, 21], [21, 24],
];

function heatmapSummary(destinations) {
  const now = new Date();
  const counts = {};
  destinations.forEach((d) => {
    const level = getSimulatedCrowdLevel(d.id, now);
    counts[level.label] = (counts[level.label] || 0) + 1;
  });
  return { counts, updatedAt: now };
}

function peakHoursTable(destinations) {
  const today = new Date();
  return HOUR_BUCKETS.map(([startH]) => {
    const atDate = new Date(today);
    atDate.setHours(startH, 0, 0, 0);
    const tally = {};
    destinations.forEach((d) => {
      const level = getSimulatedCrowdLevel(d.id, atDate);
      tally[level.label] = (tally[level.label] || 0) + 1;
    });
    const dominant = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    return { startH, dominant: dominant ? dominant[0] : '—', tally };
  });
}

function segmentBlock(state) {
  const itineraries = state.itineraries || [];
  if (!itineraries.length) {
    return '<p class="text-sm text-faint">Chưa có hành trình nào được tạo trong phiên demo này để phân tích phân khúc.</p>';
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
      <div class="quick-fact"><span class="quick-fact__label">Đi một mình</span><span class="quick-fact__value">${solo}/${itineraries.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Đi theo nhóm</span><span class="quick-fact__value">${group}/${itineraries.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Thời lượng TB mong muốn</span><span class="quick-fact__value">${avgHours} giờ</span></div>
    </div>
    <p class="text-sm text-muted" style="margin-top:10px;">Nhịp độ: ${Object.entries(paceCounts).map(([k, v]) => `${escapeHtml(k)} (${v})`).join(', ') || '—'}</p>
    <p class="text-sm text-muted">Ưu tiên: ${Object.entries(priorityCounts).map(([k, v]) => `${escapeHtml(k)} (${v})`).join(', ') || '—'}</p>
    <p class="text-sm text-muted">Nơi đến hay chọn (theo loại hình điểm dừng): ${topDestGroups.map(([k, v]) => `${escapeHtml(k)} (${v})`).join(', ') || '—'}</p>
    <p class="text-sm text-faint" style="margin-top:6px;">Đây là mẫu người dùng nền tảng trong phiên demo, không phải đại diện cho mọi du khách của tỉnh. "Nhóm tuổi" chưa được lưu vào dữ liệu hành trình nên không hiển thị ở đây.</p>
  `;
}

export function renderAdminFlow(container) {
  const state = getState();
  const scopedDests = getScopedDestinations(state);
  const { counts, updatedAt } = heatmapSummary(scopedDests);
  const peaks = peakHoursTable(scopedDests);
  const upcomingEvents = (state.events || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Luồng khách</h1>
      <p class="text-sm text-muted">Heatmap và phân khúc du khách tổng hợp — mô phỏng, không phải vị trí cá nhân theo thời gian thực.</p>
    </div>
    ${filterBarHtml(state)}

    <section class="card" style="padding:20px;">
      <div class="flex justify-between items-center gap-2 wrap">
        <h3 style="margin:0;">Mật độ hiện tại (mô phỏng)</h3>
        <span class="text-sm text-faint">Cập nhật lúc ${updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p class="text-sm text-faint" style="margin-top:-4px;">Dùng chung cơ chế mô phỏng mật độ với Trail (không tạo bộ số riêng) — ${scopedDests.length} địa điểm trong phạm vi lọc.</p>
      <div class="quick-facts" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
        ${Object.entries(counts).map(([label, n]) => `<div class="quick-fact"><span class="quick-fact__label">${escapeHtml(label)}</span><span class="quick-fact__value">${n}</span></div>`).join('') || '<p class="text-sm text-faint">Không có địa điểm nào trong phạm vi lọc.</p>'}
      </div>
    </section>

    <section class="card" style="padding:20px;overflow-x:auto;">
      <h3 style="margin-top:0;">Khung giờ cao điểm dự kiến hôm nay (mô phỏng)</h3>
      <table class="admin-table" style="margin-top:10px;">
        <thead><tr><th>Khung giờ</th><th>Mức phổ biến nhất</th></tr></thead>
        <tbody>
          ${peaks.map((p) => `<tr><td>${String(p.startH).padStart(2, '0')}:00–${String((p.startH + 3) % 24).padStart(2, '0')}:00</td><td>${escapeHtml(p.dominant)}</td></tr>`).join('')}
        </tbody>
      </table>
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Mùa/sự kiện cao điểm sắp tới</h3>
      ${upcomingEvents.length ? `
        <div class="flex-col gap-2" style="margin-top:10px;">
          ${upcomingEvents.map((e) => `<div class="card" style="padding:12px;"><strong>${escapeHtml(e.title)}</strong><p class="text-sm text-muted" style="margin:2px 0 0;">${formatDateShort(e.date)} · ${escapeHtml(e.description || '')}</p></div>`).join('')}
        </div>
      ` : '<p class="text-sm text-faint" style="margin-top:10px;">Chưa có sự kiện sắp tới trong dữ liệu.</p>'}
    </section>

    <section class="card" style="padding:20px;">
      <h3 style="margin-top:0;">Phân khúc du khách</h3>
      ${segmentBlock(state)}
    </section>
  `;

  wireFilterBar(container, () => renderAdminFlow(container));
}
