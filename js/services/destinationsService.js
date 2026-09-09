import { deriveInterests, formatCurrency } from '../utils.js';

const DATA_URL = './data/destinations.json';

function resolvePrice(priceField) {
  if (!priceField || priceField.value === null || priceField.value === undefined) {
    return { display: null, isFree: false, status: 'missing' };
  }
  const { value, status } = priceField;
  if (typeof value === 'number') {
    return { display: formatCurrency(value), isFree: value === 0, status };
  }
  const text = String(value).trim();
  return { display: text, isFree: /^miễn phí/i.test(text), status };
}

function transformDestination(d) {
  const price = resolvePrice(d.price);
  return {
    id: d.id,
    name: d.name,
    altName: d.altName || null,
    category: d.category,
    region: d.region || null,
    isDemoHost: !!d.isDemoHost,
    interests: deriveInterests(d.category),
    lat: d.coordinates && typeof d.coordinates.lat === 'number' ? d.coordinates.lat : null,
    lng: d.coordinates && typeof d.coordinates.lng === 'number' ? d.coordinates.lng : null,
    coordinatesStatus: (d.coordinates && d.coordinates.status) || 'missing',
    address: (d.address && d.address.value) || null,
    addressStatus: (d.address && d.address.status) || 'missing',
    mapSearchUrl: d.mapSearchUrl || null,
    openingHours: (d.openingHours && d.openingHours.value) || null,
    openingHoursStatus: (d.openingHours && d.openingHours.status) || 'missing',
    priceDisplay: price.display,
    isFreeEntry: price.isFree,
    priceStatus: price.status,
    suggestedDurationMin: (d.suggestedDurationMin && d.suggestedDurationMin.value) ?? null,
    durationStatus: (d.suggestedDurationMin && d.suggestedDurationMin.status) || 'missing',
    rating: (d.rating && d.rating.value) ?? null,
    ratingCount: (d.rating && d.rating.count) ?? null,
    ratingStatus: (d.rating && d.rating.status) || 'missing',
    summary: d.summary || '',
    activities: d.activities || '',
    tips: d.tips || '',
    contact: (d.contact && d.contact.value) || null,
    contactStatus: (d.contact && d.contact.status) || 'missing',
    imageRef: d.imageRef || null,
    sources: d.sources || [],
    notes: d.notes || [],
    recognized: !!(d.badge && d.badge.recognized),
    recognizedReason: (d.badge && d.badge.note) || '',
    isNew: !!d.isDemoHost,
    dataQuality: d.dataQuality || 'unknown',
  };
}

export async function loadDestinations() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    if (!Array.isArray(raw.destinations)) throw new Error('Cấu trúc destinations.json không hợp lệ');
    return raw.destinations.map(transformDestination);
  } catch (err) {
    if (window.console && console.error) console.error('Không tải được data/destinations.json:', err);
    return [];
  }
}

export const DestinationsService = { loadDestinations };
