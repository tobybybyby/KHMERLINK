import { t, getCurrentLanguage, formatCurrency as i18nFormatCurrency, formatMoney as i18nFormatMoney, formatDate as i18nFormatDate } from './services/i18nService.js';

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

/** Vẫn dùng VND cho cả 2 ngôn ngữ, chỉ đổi CÁCH hiển thị (xem i18nService.js) — 0 hiện "Miễn
 * phí"/"Free". Giữ tên hàm cũ vì rất nhiều nơi đang import formatCurrency từ utils.js. */
export function formatCurrency(vnd) {
  return i18nFormatCurrency(vnd);
}

/** Dùng cho số tiền tài chính (doanh thu, giải ngân, thanh toán) — 0 hiện đúng số 0, không phải "Miễn phí". */
export function formatMoney(vnd) {
  return i18nFormatMoney(vnd);
}

/** Giá/khách của 1 hoạt động trong tour/hành trình (Activity Catalog) — phân biệt RÕ "Miễn phí"
 * (pricePerPerson === 0, giá thật) với "Đang cập nhật giá" (null/undefined/NaN, chưa tra được giá
 * — ví dụ listing không có trong catalog). Sửa lỗi tour hiển thị "Miễn phí" sai cho hoạt động có
 * phí: nơi gọi PHẢI dùng `activity?.pricePerPerson ?? null`, KHÔNG dùng `... || 0` (biến giá chưa
 * biết thành 0, bị hàm này hiểu nhầm thành miễn phí thật). */
export function formatActivityPrice(pricePerPerson) {
  if (pricePerPerson === 0) return t('common.price.free');
  const n = Number(pricePerPerson);
  if (pricePerPerson === null || pricePerPerson === undefined || !Number.isFinite(n)) return t('common.price.updating');
  const amount = getCurrentLanguage() === 'vi' ? `${n.toLocaleString('vi-VN')}₫` : `VND ${n.toLocaleString('en-US')}`;
  return t('common.price.perGuest', { amount });
}

export function formatDateShort(isoOrDate) {
  return i18nFormatDate(isoOrDate);
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

export function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return `VLT-${code}`;
}

export function combineDateTime(dateIso, hhmm) {
  const base = new Date(dateIso);
  const [h, m] = String(hhmm || '00:00').split(':').map(Number);
  base.setHours(h || 0, m || 0, 0, 0);
  return base;
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export function minutesBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

export function formatTimeHHmm(date) {
  const locale = getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US';
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateTimeShort(date) {
  return `${formatDateShort(date)} ${formatTimeHHmm(date)}`;
}

export function formatDurationMin(min) {
  if (min < 60) return t('common.duration.minutes', { count: min });
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem ? t('common.duration.hoursMinutes', { hours: h, minutes: rem }) : t('common.duration.hours', { count: h });
}

const CROWD_LEVELS = [
  { key: 'vang', labelKey: 'common.crowd.vang', color: '#2f7d4f' },
  { key: 'vua', labelKey: 'common.crowd.vua', color: '#c8862e' },
  { key: 'dong', labelKey: 'common.crowd.dong', color: '#b3413a' },
  { key: 'gan-het', labelKey: 'common.crowd.ganHet', color: '#7a1f1f' },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Mô phỏng mật độ khách theo giờ trong ngày (không phải dữ liệu thời gian thực).
// Xác định (deterministic) theo id + khung giờ hiện tại để nhất quán trong cùng một phiên,
// nhưng đổi theo giờ/ngày để trông "sống động" — luôn gắn nhãn rõ là mô phỏng ở nơi hiển thị.
export function getSimulatedCrowdLevel(destinationId, atDate = new Date()) {
  const hourBucket = Math.floor(atDate.getHours() / 3);
  const dayKey = atDate.toISOString().slice(0, 10);
  const h = hashString(`${destinationId}|${dayKey}|${hourBucket}`);
  const level = CROWD_LEVELS[h % CROWD_LEVELS.length];
  return { ...level, label: t(level.labelKey), updatedAt: atDate };
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

// Nhóm danh mục suy ra tự động từ chuỗi loại hình gốc trong dữ liệu. 6 rule đầu khớp CHÍNH XÁC
// (anchor ^...$) 6 category của bộ pilot 7 listing Khmer (data/pilot-listings.json) — đặt trước
// và anchor chặt để không bị các rule cũ bên dưới (dò theo từ khoá rộng hơn, vd "chùa") bắt nhầm
// thành nhóm khác (vd "Chùa Khmer" lẽ ra phải hiển thị đúng tên, không bị gộp vào "Tôn giáo").
const CATEGORY_GROUPS = [
  { test: /^Chùa Khmer$/i, group: 'Chùa Khmer', emoji: '🛕', color: '#1e5b3a' },
  { test: /^Bảo tàng$/i, group: 'Bảo tàng', emoji: '🏛️', color: '#2f6690' },
  { test: /^Thủ công$/i, group: 'Thủ công', emoji: '🧵', color: '#c8862e' },
  { test: /^Ẩm thực$/i, group: 'Ẩm thực', emoji: '🍲', color: '#b3413a' },
  { test: /^Âm nhạc và biểu diễn$/i, group: 'Âm nhạc và biểu diễn', emoji: '🎭', color: '#6b4b8a' },
  { test: /^Địa điểm văn hóa$/i, group: 'Địa điểm văn hóa', emoji: '🏯', color: '#8a5a34' },
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

// group (tiếng Việt, trả về bởi deriveCategoryVisual/categoryGroup) được dùng làm KHOÁ nội bộ ở
// nhiều nơi (giá trị <option>, so sánh filter đang chọn...) — đổi ngôn ngữ KHÔNG được làm khoá này
// đổi theo (sẽ làm filter Management đang chọn bị vô hiệu khi chuyển VI/EN, phá acceptance test
// "đổi ngôn ngữ không đổi filter"). Vì vậy tách riêng: group vẫn luôn là tiếng Việt (ổn định), còn
// hàm dưới đây CHỈ dùng để hiển thị — dịch nhãn group sang ngôn ngữ hiện tại mà không đổi khoá.
const CATEGORY_GROUP_I18N_KEY = {
  'Chùa Khmer': 'common.category.chuaKhmer',
  'Bảo tàng': 'common.category.baoTang',
  'Thủ công': 'common.category.thuCong',
  'Ẩm thực': 'common.category.amThuc',
  'Âm nhạc và biểu diễn': 'common.category.amNhacBieuDien',
  'Địa điểm văn hóa': 'common.category.diaDiemVanHoa',
  'Tôn giáo': 'common.category.tonGiao',
  'Bảo tàng / Di tích': 'common.category.baoTangDiTich',
  'Khu tưởng niệm': 'common.category.khuTuongNiem',
  'Nhà cổ': 'common.category.nhaCo',
  'Thiên nhiên': 'common.category.thienNhien',
  'Làng nghề & cộng đồng': 'common.category.langNgheCongDong',
  'Khu vui chơi': 'common.category.khuVuiChoi',
  'Trải nghiệm tại hộ dân': 'common.category.traiNghiemHoDan',
  'Lễ hội': 'common.category.leHoi',
  'Khác': 'common.category.khac',
};

/** Nhãn HIỂN THỊ (dịch theo ngôn ngữ hiện tại) cho 1 group — dùng ở label/option text/chart,
 * KHÔNG dùng làm value/khoá so sánh (dùng categoryGroup()/deriveCategoryVisual().group cho việc đó). */
export function categoryGroupLabel(groupVi) {
  const key = CATEGORY_GROUP_I18N_KEY[groupVi];
  return key ? t(key) : (groupVi || t('common.category.khac'));
}

export function categoryLabel(cat) {
  return cat || t('common.category.khac');
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
  <text x="240" y="196" font-size="12" fill="#ffffff" text-anchor="middle" font-family="Segoe UI, sans-serif" opacity="0.7">${escapeHtml(t('common.illustrativeImage'))}</text>
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

/** An toàn khi rating chưa có dữ liệu (vd 7 listing pilot chưa có đánh giá thật) — không được
 * gọi .toFixed() trực tiếp trên rating có thể null ở bất kỳ đâu khác ngoài hàm này. */
export function ratingDisplay(rating) {
  return typeof rating === 'number' ? `⭐ ${rating.toFixed(1)}` : t('common.rating.none');
}

// Nhãn/CTA theo listingType + trạng thái booking — dùng chung cho card Khám phá và trang chi tiết
// (xem PHASE "Thu gọn dữ liệu thành pilot 7 listing Khmer" mục 5).
const LISTING_TYPE_BADGE = {
  site: { labelKey: 'common.listingType.site', cls: 'badge-type' },
  cluster: { labelKey: 'common.listingType.cluster', cls: 'badge-demo' },
  experience: { labelKey: 'common.listingType.experience', cls: 'badge-new' },
  multiStopExperience: { labelKey: 'common.listingType.multiStopExperience', cls: 'badge-new' },
};

export function listingTypeBadge(listingType) {
  const entry = LISTING_TYPE_BADGE[listingType] || LISTING_TYPE_BADGE.site;
  return { label: t(entry.labelKey), cls: entry.cls };
}

const CTA_LABELS = {
  interested: 'common.cta.interested',
  notify: 'common.cta.notify',
  preparing: 'common.cta.preparing',
};

export function ctaLabel(ctaKind) {
  return t(CTA_LABELS[ctaKind] || CTA_LABELS.interested);
}
