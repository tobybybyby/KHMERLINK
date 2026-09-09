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

// Nhóm danh mục suy ra tự động từ chuỗi loại hình gốc trong dữ liệu (destinations.json),
// không phải danh sách cố định thủ công — khớp rule "tự động tạo danh mục từ dữ liệu".
const CATEGORY_GROUPS = [
  { test: /chùa|tín ngưỡng|linh( |$)|cung/i, group: 'Tôn giáo', emoji: '🛕', color: '#1e5b3a' },
  { test: /bảo tàng|di tích văn hóa/i, group: 'Bảo tàng / Di tích', emoji: '🏛️', color: '#2f6690' },
  { test: /tưởng niệm|lưu niệm|di tích lịch sử/i, group: 'Khu tưởng niệm', emoji: '🕯️', color: '#6b4b8a' },
  { test: /nhà cổ/i, group: 'Nhà cổ', emoji: '🏚️', color: '#8a5a34' },
  { test: /thắng cảnh|bãi biển|thiên nhiên/i, group: 'Thiên nhiên', emoji: '🌿', color: '#2f7d4f' },
  { test: /cộng đồng|nông nghiệp|miệt vườn|gốm|thủ công|làng nghề/i, group: 'Làng nghề & cộng đồng', emoji: '🧵', color: '#c8862e' },
  { test: /vui chơi/i, group: 'Khu vui chơi', emoji: '🎡', color: '#b3413a' },
  { test: /hộ dân/i, group: 'Trải nghiệm tại hộ dân', emoji: '🏡', color: '#8a5a34' },
  { test: /lễ hội/i, group: 'Lễ hội', emoji: '🎉', color: '#e7b865' },
  { test: /ẩm thực/i, group: 'Ẩm thực', emoji: '🍲', color: '#b3413a' },
];

const FALLBACK_PALETTE = ['#1e5b3a', '#2f6690', '#c8862e', '#6b4b8a', '#2f7d4f', '#b3413a', '#8a5a34'];
function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
}

export function deriveCategoryVisual(rawCategory) {
  const text = String(rawCategory || '');
  const match = CATEGORY_GROUPS.find((g) => g.test.test(text));
  if (match) return { group: match.group, emoji: match.emoji, color: match.color };
  return { group: text || 'Khác', emoji: '📍', color: hashColor(text) };
}

export function categoryLabel(cat) {
  return cat || 'Khác';
}

export function categoryEmoji(cat) {
  return deriveCategoryVisual(cat).emoji;
}

export function categoryColor(cat) {
  return deriveCategoryVisual(cat).color;
}

export function categoryGroup(cat) {
  return deriveCategoryVisual(cat).group;
}

// Suy luận sở thích (interest tags) tự động từ loại hình gốc, dùng cho bộ lọc "sở thích".
const INTEREST_RULES = [
  { test: /chùa|tín ngưỡng|linh( |$)|cung|tâm linh/i, tags: ['tam-linh'] },
  { test: /khmer/i, tags: ['van-hoa-khmer'] },
  { test: /bảo tàng|tưởng niệm|lưu niệm|di tích|nhà cổ|văn hóa/i, tags: ['lich-su'] },
  { test: /thắng cảnh|bãi biển|thiên nhiên|cồn|miệt vườn/i, tags: ['thien-nhien'] },
  { test: /cộng đồng|nông nghiệp|gốm|thủ công|làng nghề|hộ dân/i, tags: ['thu-cong', 'trai-nghiem-tay-chan'] },
  { test: /vui chơi|miệt vườn/i, tags: ['gia-dinh'] },
];

export function deriveInterests(rawCategory) {
  const text = String(rawCategory || '');
  const tags = new Set();
  INTEREST_RULES.forEach((r) => {
    if (r.test.test(text)) r.tags.forEach((t) => tags.add(t));
  });
  return Array.from(tags);
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

export function destinationImageSrc(dest) {
  if (dest && dest.imagePath) return dest.imagePath;
  return placeholderImageDataUri(dest ? dest.category : null, dest ? dest.name : '');
}

export function renderStars(rating) {
  const r = Math.round(clamp(rating || 0, 0, 5));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}
