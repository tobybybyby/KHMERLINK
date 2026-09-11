import { categoryColor, categoryEmoji } from '../utils.js';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const CLUSTER_CSS = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
const CLUSTER_DEFAULT_CSS = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
const CLUSTER_JS = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';

const LOAD_TIMEOUT_MS = 7000;

let leafletPromise = null;
let clusterPromise = null;

function injectCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Không tải được ${src}`)));
    document.head.appendChild(script);
  });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Hết thời gian tải thư viện bản đồ')), ms)),
  ]);
}

export function loadLeaflet() {
  if (leafletPromise) return leafletPromise;
  injectCss(LEAFLET_CSS);
  leafletPromise = withTimeout(injectScript(LEAFLET_JS), LOAD_TIMEOUT_MS).then(() => {
    if (!window.L) throw new Error('Thư viện bản đồ không khởi tạo được');
    return window.L;
  });
  return leafletPromise;
}

// Tải riêng plugin gom cụm marker (Leaflet.markercluster) — chỉ cần cho bản đồ Khám phá, nơi
// SITE-04/05/06 (cụm Nguyệt Hóa) nằm sát nhau và có thể trùng pin ở mức zoom thấp. Tách khỏi
// loadLeaflet() vì phụ thuộc window.L đã có sẵn; nếu tải lỗi/timeout, nơi gọi tự rơi về
// L.layerGroup() thường (xem initMap() trong explore.js) — không chặn bản đồ hoạt động.
export function loadMarkerCluster() {
  if (clusterPromise) return clusterPromise;
  injectCss(CLUSTER_CSS);
  injectCss(CLUSTER_DEFAULT_CSS);
  clusterPromise = withTimeout(injectScript(CLUSTER_JS), LOAD_TIMEOUT_MS).then(() => {
    if (!window.L || !window.L.markerClusterGroup) throw new Error('Plugin gom cụm marker không khởi tạo được');
    return window.L;
  });
  return clusterPromise;
}

export function categoryDivIcon(L, category, { isUser = false } = {}) {
  const color = isUser ? '#2f6690' : categoryColor(category);
  const emoji = isUser ? '📍' : categoryEmoji(category);
  return L.divIcon({
    className: '',
    html: `<div class="leaflet-div-icon-marker${isUser ? ' is-user' : ''}" style="width:32px;height:32px;background:${color};">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Icon riêng cho 2 markerRole đặc biệt (điểm gặp của trải nghiệm nhiều điểm dừng, điểm neo của
// cụm điểm đến) — viền/nhãn khác biệt để phân biệt trực quan trên bản đồ với pin địa điểm/trải
// nghiệm thường (vẫn theo màu category qua categoryDivIcon). Các markerRole khác (experienceLocation,
// siteLocation) hoặc không có markerRole dùng icon category mặc định.
export function destinationDivIcon(L, dest) {
  if (dest.markerRole === 'meetingPoint') {
    return L.divIcon({
      className: '',
      html: '<div class="leaflet-div-icon-marker leaflet-div-icon-marker--meeting" style="width:34px;height:34px;background:#6b4b8a;">🤝</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17],
    });
  }
  if (dest.markerRole === 'clusterAnchor') {
    return L.divIcon({
      className: '',
      html: '<div class="leaflet-div-icon-marker leaflet-div-icon-marker--cluster-anchor" style="width:34px;height:34px;background:#8a5a34;">🗺️</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17],
    });
  }
  return categoryDivIcon(L, dest.category);
}

export const MARKER_ROLE_LABEL = {
  meetingPoint: 'Điểm gặp',
  clusterAnchor: 'Điểm neo của cụm',
};

export const MapService = {
  loadLeaflet,
  loadMarkerCluster,
  categoryDivIcon,
  destinationDivIcon,
  MARKER_ROLE_LABEL,
};
