// Chart.js dùng chung cho Studio (Host) và Cổng dữ liệu quản lý (Management) — PHASE "Bổ sung dữ
// liệu mô phỏng liên kết" mục 13: lưu reference từng chart instance theo id canvas, LUÔN destroy
// trước khi tạo lại trên cùng 1 id để không chồng canvas/rò rỉ instance khi chuyển tab/đổi bộ lọc.
// LƯU Ý: cdnjs định kỳ gỡ các bản cũ khỏi CDN — 4.4.4 (dùng ở phase trước) đã bị gỡ, phát hiện lúc
// kiểm thử phase này (404 thật, không phải mạng chặn). Pin đúng bản còn tồn tại thay vì "latest".
const CHART_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.1/chart.umd.min.js';
let chartJsPromise = null;

export function loadChartJs() {
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve, reject) => {
    if (window.Chart) { resolve(window.Chart); return; }
    const existing = document.querySelector(`script[src="${CHART_JS_URL}"]`);
    if (existing) { existing.addEventListener('load', () => resolve(window.Chart)); existing.addEventListener('error', reject); return; }
    const script = document.createElement('script');
    script.src = CHART_JS_URL;
    script.async = true;
    script.addEventListener('load', () => resolve(window.Chart));
    script.addEventListener('error', () => reject(new Error('Không tải được thư viện biểu đồ')));
    document.head.appendChild(script);
  });
  return chartJsPromise;
}

const chartRegistry = new Map();

/** Huỷ chart cũ (nếu có) gắn với 1 canvas id — gọi TRƯỚC khi tạo Chart mới trên cùng id. */
export function destroyChart(canvasId) {
  const existing = chartRegistry.get(canvasId);
  if (existing) {
    existing.destroy();
    chartRegistry.delete(canvasId);
  }
}

/** Tạo chart mới và lưu reference vào registry theo canvasId (tự huỷ bản cũ nếu còn). */
export function createChart(Chart, canvasEl, canvasId, config) {
  destroyChart(canvasId);
  if (!canvasEl) return null;
  const instance = new Chart(canvasEl, config);
  chartRegistry.set(canvasId, instance);
  return instance;
}

export function destroyAllCharts() {
  chartRegistry.forEach((c) => c.destroy());
  chartRegistry.clear();
}

// Bảng màu dùng chung — nhất quán giữa các chart, đủ tương phản, đọc được trên nền sáng.
export const CHART_COLORS = ['#6b4423', '#b8862e', '#2f6690', '#8a5a34', '#6b4b8a', '#2f7d4f', '#b3413a', '#c8862e'];

export function formatVndTick(v) {
  return new Intl.NumberFormat('vi-VN').format(v);
}

export function formatPercent1(v) {
  return `${(v * 100).toFixed(1)}%`;
}
