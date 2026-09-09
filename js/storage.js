import { createSeedState } from './data.js';
import { loadDestinations } from './services/destinationsService.js';

export const SCHEMA_VERSION = 2;
const STORAGE_KEY = 'vlt_user_state';

// Nội dung/catalog (destinations, hosts, experiences, events, reviews mẫu, metrics) được nạp
// lại mới mỗi lần khởi động — không lưu vào localStorage — để cập nhật data/destinations.json
// luôn có hiệu lực ngay, không cần người dùng "khôi phục dữ liệu mẫu". Chỉ dữ liệu do người
// dùng thao tác (yêu thích, hành trình nháp, booking...) mới được lưu.
const CONTENT_KEYS = ['destinations', 'hosts', 'experiences', 'slots', 'events', 'reviews', 'metrics'];

let state = null;

function defaultUserData() {
  const seed = createSeedState();
  const userData = { schemaVersion: SCHEMA_VERSION };
  Object.keys(seed).forEach((key) => {
    if (!CONTENT_KEYS.includes(key)) userData[key] = seed[key];
  });
  return userData;
}

function loadUserData() {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) return null;
    return parsed;
  } catch (err) {
    return null;
  }
}

export async function init() {
  const content = createSeedState();
  content.destinations = await loadDestinations();

  const userData = loadUserData() || defaultUserData();

  state = {
    ...content,
    ...userData,
    ui: { ...content.ui, ...(userData.ui || {}) },
  };
  persist();
  return state;
}

export function getState() {
  if (!state) {
    throw new Error('Storage chưa được khởi tạo — cần gọi await Storage.init() trước khi render.');
  }
  return state;
}

export function persist() {
  const snapshot = { schemaVersion: SCHEMA_VERSION };
  Object.keys(state).forEach((key) => {
    if (!CONTENT_KEYS.includes(key)) snapshot[key] = state[key];
  });
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch (err) {
    return false;
  }
}

export async function resetSample() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // bỏ qua — localStorage có thể bị chặn (chế độ ẩn danh nghiêm ngặt)
  }
  return init();
}

export function toggleFavorite(destinationId) {
  const s = getState();
  const idx = s.favorites.indexOf(destinationId);
  if (idx >= 0) s.favorites.splice(idx, 1);
  else s.favorites.push(destinationId);
  persist();
  return s.favorites.includes(destinationId);
}

export function isFavorite(destinationId) {
  return getState().favorites.includes(destinationId);
}

export function addDraftItineraryItem(destinationId) {
  const s = getState();
  if (!Array.isArray(s.ui.draftItinerary)) s.ui.draftItinerary = [];
  const already = s.ui.draftItinerary.some((it) => it.destinationId === destinationId);
  if (!already) {
    s.ui.draftItinerary.push({ destinationId, addedAt: new Date().toISOString() });
    persist();
  }
  return !already;
}
