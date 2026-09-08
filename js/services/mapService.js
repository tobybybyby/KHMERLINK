import { categoryColor, categoryEmoji } from '../utils.js';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

const LOAD_TIMEOUT_MS = 7000;

let leafletPromise = null;

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

export const MapService = {
  loadLeaflet,
  categoryDivIcon,
};
