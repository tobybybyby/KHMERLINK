export function escapeHtml(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stripDiacritics(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, (m) => (m === 'đ' ? 'd' : 'D'))
    .toLowerCase();
}

export function matchesQuery(text, query) {
  if (!query) return true;
  return stripDiacritics(text).includes(stripDiacritics(query));
}

export function formatCurrency(vnd) {
  if (vnd === 0) return 'Miễn phí';
  if (vnd === null || vnd === undefined) return '—';
  return new Intl.NumberFormat('vi-VN').format(vnd) + ' đ';
}

export function formatDateShort(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTimeRange(startHHmm, endHHmm) {
  if (!endHHmm) return startHHmm;
  return `${startHHmm} – ${endHHmm}`;
}

let idCounter = 0;
export function uid(prefix = 'id') {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function debounce(fn, wait = 250) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CATEGORY_LABELS = {
  'thu-cong': 'Thủ công',
  'am-thuc': 'Ẩm thực',
  'ton-giao': 'Tôn giáo',
  'le-hoi': 'Lễ hội',
  'bao-tang': 'Bảo tàng / Di tích',
  'thien-nhien': 'Thiên nhiên',
  'homestay': 'Trải nghiệm tại hộ dân',
};

export function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

const CATEGORY_EMOJI = {
  'thu-cong': '🧵',
  'am-thuc': '🍲',
  'ton-giao': '🛕',
  'le-hoi': '🎉',
  'bao-tang': '🏛️',
  'thien-nhien': '🌿',
  'homestay': '🏡',
};

export function categoryEmoji(cat) {
  return CATEGORY_EMOJI[cat] || '📍';
}

const CATEGORY_COLORS = {
  'thu-cong': '#c8862e',
  'am-thuc': '#b3413a',
  'ton-giao': '#1e5b3a',
  'le-hoi': '#e7b865',
  'bao-tang': '#2f6690',
  'thien-nhien': '#2f7d4f',
  'homestay': '#8a5a34',
};

export function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#5b5c54';
}

export function placeholderImageDataUri(category, label) {
  const color = categoryColor(category);
  const emoji = categoryEmoji(category);
  const safeLabel = escapeHtml(label || '').slice(0, 28);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="480" height="270" fill="url(#g)"/>
  <text x="240" y="120" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <text x="240" y="170" font-size="16" fill="#ffffff" text-anchor="middle" font-family="Segoe UI, sans-serif" opacity="0.9">${safeLabel}</text>
  <text x="240" y="196" font-size="12" fill="#ffffff" text-anchor="middle" font-family="Segoe UI, sans-serif" opacity="0.7">Ảnh minh hoạ</text>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function renderStars(rating) {
  const r = Math.round(clamp(rating || 0, 0, 5));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}
