// Nạp 7 listing pilot Khmer từ data/pilot-listings.json và chuyển sang cấu trúc dùng chung cho
// UI (Khám phá/hồ sơ chi tiết/bản đồ/hành trình) — tên hàm/biến giữ "destination"/"Destination"
// để không phải sửa storage.js và các nơi khác đang import, dù bản chất giờ là "listing" đa dạng
// hơn (experience/site/cluster/multiStopExperience, xem listingType). Trước phase pilot, hàm này
// nạp từ data/destinations.json (37 địa danh) — bản đó đã lưu ở data/archive/destinations-vinhlong-37.json.
import { deriveInterests, formatCurrency } from '../utils.js';

const DATA_URL = './data/pilot-listings.json';

function resolvePrice(priceField) {
  if (!priceField || priceField.value === null || priceField.value === undefined) {
    return { display: null, isFree: false, status: (priceField && priceField.status) || 'unavailable' };
  }
  const { value, status } = priceField;
  if (typeof value === 'number') {
    return { display: formatCurrency(value), isFree: value === 0, status };
  }
  const text = String(value).trim();
  return { display: text, isFree: /^miễn phí/i.test(text), status };
}

function transformListing(l) {
  const price = resolvePrice(l.price);
  const mapLinks = Array.isArray(l.mapLinks) ? l.mapLinks : (l.mapLinks ? [l.mapLinks] : []);
  return {
    id: l.id,
    name: l.name,
    altName: l.alternativeName || null,
    listingType: l.listingType || 'site',
    category: l.category,
    region: null,
    isDemoHost: false,
    interests: deriveInterests(l.category),

    lat: l.coordinates && typeof l.coordinates.lat === 'number' ? l.coordinates.lat : null,
    lng: l.coordinates && typeof l.coordinates.lng === 'number' ? l.coordinates.lng : null,
    coordinatesStatus: l.coordinateStatus || 'unavailable',

    address: l.currentAddress || null,
    addressStatus: l.currentAddress ? 'verified' : 'missing',
    addressConflictNote: l.addressConflictNote || null,
    formerAddress: l.formerAddress || null,
    coordinateNote: l.coordinateNote || null,
    mapLinks,
    mapSearchUrl: mapLinks[0] || null,

    openingHours: (l.openingHours && l.openingHours.value) || null,
    openingHoursStatus: (l.openingHours && l.openingHours.status) || 'unavailable',

    priceDisplay: price.display,
    isFreeEntry: price.isFree,
    priceStatus: price.status,
    priceNote: (l.price && l.price.note) || null,

    // Chưa có dữ liệu thời lượng/đánh giá cho 7 listing pilot trong nguồn Excel — để trống thay
    // vì bịa số, UI phải tự xử lý trường hợp null (không gọi .toFixed trực tiếp).
    suggestedDurationMin: null,
    durationStatus: 'unavailable',
    rating: null,
    ratingCount: null,
    ratingStatus: 'unavailable',

    summary: l.shortIntroduction || '',
    activities: l.activities || '',
    culturalStory: l.culturalStory || '',
    keyFacts: Array.isArray(l.keyFacts) ? l.keyFacts : [],
    tips: l.visitorNotes || '',
    contact: null,
    contactStatus: 'unavailable',

    // Ảnh: đã tải + nén 7 ảnh đại diện về assets/images/pilot/ (localImage) — card/list VÀ trang
    // chi tiết đều dùng ảnh thật này; representativeImageUrl (URL gốc) vẫn giữ để tham khảo/nguồn.
    imagePath: l.localImage || null,
    representativeImageUrl: l.representativeImage || null,
    imageRef: l.representativeImage
      ? { url: l.representativeImage, localPath: l.localImage || null, status: l.localImage ? 'downloaded-demo-use' : 'external-not-downloaded' }
      : null,
    galleryImages: [],

    sources: (l.informationSources || []).map((s) => ({
      url: s.url,
      label: [s.sourceType, s.dateOfSource].filter(Boolean).join(' · ') || s.url,
    })),
    notes: [],

    recognized: false,
    recognizedReason: '',
    isNew: false,
    dataQuality: 'pilot-2026',

    // Trường nội bộ (Studio/Cổng vận hành) — KHÔNG hiển thị trên giao diện công khai.
    status: l.status || '',
    readiness: l.readiness || '',
    bookingStatus: l.bookingStatus || 'notBookable',
    ctaKind: l.ctaKind || null,
    supplierRefs: l.supplierRefs || [],
    verificationChecklist: l.verificationChecklist || [],
    informationSourcesFull: l.informationSources || [],
    conclusionNote: l.conclusionNote || null,

    // Quan hệ giữa các listing (cụm/đa điểm dừng) — xem PHASE spec mục 4.
    clusterChildren: l.clusterChildren || null,
    partOfCluster: l.partOfCluster || null,
    relatedListingIds: l.relatedListingIds || [],
    stops: l.stops || null,
  };
}

export async function loadDestinations() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    if (!Array.isArray(raw.listings)) throw new Error('Cấu trúc pilot-listings.json không hợp lệ');
    return raw.listings.map(transformListing);
  } catch (err) {
    if (window.console && console.error) console.error('Không tải được data/pilot-listings.json:', err);
    return [];
  }
}

export const DestinationsService = { loadDestinations };
