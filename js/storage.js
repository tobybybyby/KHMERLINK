import { createSeedState } from './data.js';

export const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'vlt_state';

let state = null;

function withDefaults(raw) {
  const seed = createSeedState();
  return {
    ...seed,
    ...raw,
    ui: { ...seed.ui, ...(raw.ui || {}) },
  };
}

export function init() {
  let raw = null;
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (text) raw = JSON.parse(text);
  } catch (err) {
    raw = null;
  }

  if (!raw || raw.schemaVersion !== SCHEMA_VERSION || !Array.isArray(raw.destinations)) {
    state = createSeedState();
    persist();
  } else {
    state = withDefaults(raw);
  }
  return state;
}

export function getState() {
  if (!state) init();
  return state;
}

export function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    return false;
  }
}

export function resetSample() {
  state = createSeedState();
  persist();
  return state;
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
