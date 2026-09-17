import { createSeedState } from './data.js';
import { loadDestinations } from './services/destinationsService.js';
import { buildInitialDemoBookings, CURRENT_DEMO_BOOKINGS_VERSION, proposalSeedRecords, contentSubmissionSeedRecords } from '../data/pilot-seed-data.js';
import { LEGACY_VI_LABEL_TO_TAG_ID } from './services/tagCatalog.js';

export const SCHEMA_VERSION = 9;
export const STORAGE_KEY = 'vlt_user_state';

// Nội dung/catalog (destinations, hosts, experiences, events, metrics) được nạp lại mới mỗi lần
// khởi động — không lưu vào localStorage — để cập nhật data/pilot-listings.json luôn có hiệu lực
// ngay. Chỉ dữ liệu do người dùng thao tác (yêu thích, hành trình, booking, review, giỏ hành
// trình...) mới được lưu. LƯU Ý: 'reviews' đã bỏ khỏi danh sách này từ schema v3 — trước đó
// review thật của khách bị nạp đè/mất vì buildReviews() luôn trả về [] mỗi lần tải trang; review
// thật giờ nằm hoàn toàn trong dữ liệu người dùng (persist qua addReview), xem migrateV2ToV3().
const CONTENT_KEYS = ['destinations', 'hosts', 'experiences', 'slots', 'events', 'voucherCatalog', 'metrics'];

/** Bắn sự kiện dùng chung để các trang/dashboard đang mở tự render lại phần dữ liệu liên quan
 * (PHASE "Hoàn thiện hành trình" mục 10) — KHÔNG reload toàn bộ app, chỉ là tín hiệu "có gì đó
 * vừa đổi". app.js lắng nghe sự kiện này (cùng tab) và sự kiện `storage` (khác tab) để re-render
 * route hiện tại từ state mới nhất. */
export function notifyDataChanged(entity, action) {
  try {
    window.dispatchEvent(new CustomEvent('khmerlink:data-changed', { detail: { entity, action } }));
  } catch (err) {
    // môi trường không hỗ trợ CustomEvent (không nên xảy ra trên trình duyệt hiện đại) — bỏ qua an toàn
  }
}

const MAX_BEHAVIOUR_EVENTS = 500; // giới hạn tăng trưởng localStorage cho phiên demo dài

/** Ghi 1 sự kiện hành vi khách THẬT (xem view/thêm giỏ/gửi cá nhân hoá/chọn hành trình/tạo booking/
 * huỷ booking/gửi review) — dùng để Management Portal đọc "current operational data" phát sinh
 * thật trong phiên demo (khác với networkMonthlyHistory, vốn là số liệu MẠNG LƯỚI mô phỏng, xem
 * data/pilot-seed-data.js). Tự gọi persist() — nơi gọi không cần persist() thêm lần nữa cho riêng
 * việc ghi log này (nhưng gọi lại persist() ở nơi khác vẫn an toàn, không có tác dụng phụ). */
export function logCustomerBehaviourEvent(type, payload = {}) {
  const s = getState();
  if (!Array.isArray(s.customerBehaviourEvents)) s.customerBehaviourEvents = [];
  s.customerBehaviourEvents.push({ id: uidLocal('evt'), type, at: new Date().toISOString(), ...payload });
  if (s.customerBehaviourEvents.length > MAX_BEHAVIOUR_EVENTS) {
    s.customerBehaviourEvents = s.customerBehaviourEvents.slice(-MAX_BEHAVIOUR_EVENTS);
  }
  persist();
}

export function getCustomerBehaviourEvents() {
  return getState().customerBehaviourEvents || [];
}

// ---------- Management Portal: trạng thái xử lý gợi ý "Nhu cầu & Cơ hội" ----------
export function getOpportunityActions() {
  return getState().opportunityActions || {};
}

/** Cập nhật trạng thái 1 recommendation (draft→planned→assigned→in_progress→done) — lưu
 * localStorage, đồng bộ qua notifyDataChanged + storage event (khác tab) như mọi mutator khác. */
export function setOpportunityActionStatus(recommendationId, status, extra = {}) {
  const s = getState();
  if (!s.opportunityActions || typeof s.opportunityActions !== 'object') s.opportunityActions = {};
  s.opportunityActions[recommendationId] = {
    ...(s.opportunityActions[recommendationId] || {}),
    status,
    ...extra,
    updatedAt: new Date().toISOString(),
  };
  persist();
  notifyDataChanged('opportunityActions', 'updated');
  return s.opportunityActions[recommendationId];
}

let state = null;

function defaultUserData() {
  const seed = createSeedState();
  const userData = {};
  Object.keys(seed).forEach((key) => {
    if (!CONTENT_KEYS.includes(key)) userData[key] = seed[key];
  });
  // Đặt sau vòng lặp — seed.schemaVersion là giá trị nội bộ cũ của data.js (không phải version
  // schema lưu trữ thật), nếu gán trước sẽ bị vòng lặp ở trên ghi đè nhầm và làm hỏng lưu trữ
  // (mỗi lần tải lại trang, kiểm tra version ở loadUserData() sẽ luôn thấy lệch và xoá sạch
  // dữ liệu người dùng — lỗi thật đã phát hiện khi kiểm thử Phase 6).
  userData.schemaVersion = SCHEMA_VERSION;
  return userData;
}

/** v2 -> v3: thêm tripCart/notifications/reminders, gộp userReviews (đánh giá gắn booking, kiểu
 * cũ) vào reviews (kiểu thống nhất mới dùng chung Trail/Studio/Ops) — KHÔNG xoá/nhân đôi dữ liệu
 * cũ, KHÔNG cộng lại điểm thưởng/passport (những cái đó đã persist nguyên trạng, không đụng tới).
 * placeImpressions KHÔNG gộp vào đây — vẫn là tính năng "cảm nhận tự đánh dấu" tách biệt như cũ. */
function migrateV2ToV3(parsed) {
  const migrated = { ...parsed };

  const oldDraft = (parsed.ui && parsed.ui.draftItinerary) || [];
  if (!Array.isArray(migrated.tripCart)) {
    migrated.tripCart = oldDraft.map((d) => ({
      destinationId: d.destinationId,
      addedAt: d.addedAt || new Date().toISOString(),
      selected: true,
      partySize: 1,
    }));
  }

  if (!Array.isArray(migrated.notifications)) migrated.notifications = [];
  if (!Array.isArray(migrated.reminders)) migrated.reminders = [];

  if (!Array.isArray(migrated.reviews)) {
    const oldReviews = Array.isArray(parsed.userReviews) ? parsed.userReviews : [];
    migrated.reviews = oldReviews.map((r) => ({
      id: `review-${r.id}`,
      bookingId: null, // bản cũ không lưu bookingId trực tiếp trên review — chỉ có bookingItemId
      bookingItemId: r.bookingItemId,
      listingId: r.destinationId,
      hostId: null, // suy ra lại ở init() bằng destinationId, không suy đoán số liệu mới ở đây
      travellerId: 'traveller-demo-self',
      overallRating: r.rating,
      categoryRatings: {
        experience: (r.categories && r.categories.quality) ?? r.rating,
        hospitality: (r.categories && r.categories.welcome) ?? r.rating,
        accuracy: (r.categories && r.categories.accuracy) ?? r.rating,
      },
      comment: r.comment || '',
      createdAt: r.date || new Date().toISOString(),
      status: 'published',
    }));
  }

  migrated.schemaVersion = 3;
  return migrated;
}

/** v3 -> v4: PHASE "Bổ sung dữ liệu mô phỏng liên kết" — historicalMetrics/reviewAggregates/
 * reviewTags/visitMetrics/providerMetrics (baseline đánh giá, giờ/giá, doanh thu & lượt ghé 12
 * tháng) đều là dữ liệu NỘI DUNG tĩnh đọc trực tiếp từ data/pilot-seed-data.js mỗi lần tải trang
 * (không lưu vào localStorage, giống destinations/hosts) — vì vậy KHÔNG có gì trong state đã lưu
 * cần biến đổi hình dạng ở đây. Chỉ tăng version để đánh dấu đã áp dụng quy ước mới; booking/review/
 * hành trình/toạ độ/yêu thích của người dùng giữ nguyên hoàn toàn, không cộng lại gì cả. */
function migrateV3ToV4(parsed) {
  return { ...parsed, schemaVersion: 4 };
}

/** v4 -> v5: PHẦN 2 "Bổ sung dữ liệu cho Lịch & Booking của Host" — thêm hostDemoBookings (rỗng ở
 * đây; init() sẽ seed booking demo cố định NẾU còn rỗng, đúng cho cả người dùng mới lẫn đã
 * migrate). Không đụng tới bookings/bookingItems/review/hành trình/toạ độ đã có. */
function migrateV4ToV5(parsed) {
  const migrated = { ...parsed, schemaVersion: 5 };
  if (!Array.isArray(migrated.hostDemoBookings)) migrated.hostDemoBookings = [];
  return migrated;
}

/** v5 -> v6: PHASE 15/09/2026 "Dữ liệu Host đầy đủ 7 đơn vị + Tổng quan khớp Lịch & Booking" —
 * đổi HẲN cấu trúc bản ghi hostDemoBookings (providerId thay hostId, thêm unitPrice/grossAmount/
 * platformFee/providerIncome/groupType/preferredTime, bỏ activityName/totalAmount cũ) và mở rộng
 * từ 3/7 lên đủ 7/7 đơn vị. Vì đây là dữ liệu SEED (không phải do người dùng tạo), migration không
 * cố "chuyển đổi hình dạng" bản ghi cũ — chỉ đặt hostDemoBookingsVersion=0 để init() tự seed lại
 * đúng 1 lần theo công thức mới (so khớp CURRENT_DEMO_BOOKINGS_VERSION). Booking/review/hành
 * trình/toạ độ/yêu thích DO NGƯỜI DÙNG TẠO không hề bị đụng tới. */
function migrateV5ToV6(parsed) {
  return { ...parsed, schemaVersion: 6, hostDemoBookingsVersion: 0 };
}

/** v6 -> v7: PHASE "Data Linkage" (15/09/2026) — thêm activityCatalogOverrides (rỗng nếu chưa có,
 * Host chưa từng chỉnh gì thì hành vi giữ nguyên 100% — chỉ trả về đúng bản catalog gốc). Không
 * đụng booking/review/hành trình/toạ độ/yêu thích đã có. */
function migrateV6ToV7(parsed) {
  const migrated = { ...parsed, schemaVersion: 7 };
  if (!migrated.activityCatalogOverrides || typeof migrated.activityCatalogOverrides !== 'object') migrated.activityCatalogOverrides = {};
  return migrated;
}

/** v7 -> v8: Management Portal "Nhu cầu & Cơ hội" — thêm customerBehaviourEvents (nhật ký nhẹ các
 * hành vi khách thật trong phiên demo: xem địa điểm/thêm giỏ/gửi cá nhân hoá/chọn hành trình/tạo
 * booking/huỷ booking/gửi review — KHÔNG phải nguồn của các con số funnel quy mô mạng lưới hiển
 * thị trên dashboard, xem ghi chú ở data/pilot-seed-data.js#networkMonthlyHistory) và
 * opportunityActions (trạng thái Host/Management đã xử lý gợi ý nào, keyed theo recommendation id).
 * Không đụng booking/review/hành trình/toạ độ/yêu thích đã có. */
function migrateV7ToV8(parsed) {
  const migrated = { ...parsed, schemaVersion: 8 };
  if (!Array.isArray(migrated.customerBehaviourEvents)) migrated.customerBehaviourEvents = [];
  if (!migrated.opportunityActions || typeof migrated.opportunityActions !== 'object') migrated.opportunityActions = {};
  return migrated;
}

/** v8 -> v9: PHASE "Hoàn thiện i18n dữ liệu động" (18/09/2026) — 2 việc:
 * (1) Tag cảm nhận/đánh giá đổi từ lưu LABEL tiếng Việt trực tiếp sang CANONICAL TAG ID (xem
 * js/services/tagCatalog.js) để đổi ngôn ngữ không cần dịch lại dữ liệu đã lưu — review/cảm nhận
 * THẬT đã lưu trước đây (selectedTags/tags dạng label VI) được map ngược sang ID tương ứng qua
 * LEGACY_VI_LABEL_TO_TAG_ID; tag lạ không khớp được giữ nguyên (không xoá, không throw).
 * (2) Đề án/đề xuất nội dung MẪU (proposalSeedRecords/contentSubmissionSeedRecords) đổi từ string
 * sang object song ngữ { vi, en } — bản ghi mẫu đã persist từ trước (theo đúng id mẫu) được cập
 * nhật lại title/summary/evidence/... theo bản mới; CHỈ áp dụng cho field còn giữ NGUYÊN giá trị
 * mẫu gốc (so khớp bản tiếng Việt cũ) — nếu Host/Cổng quản lý đã thao tác đổi trạng thái/ghi chú
 * thật thì managementNote/reviewerNote/status không bị đụng tới (đó là dữ liệu nghiệp vụ thật). */
function migrateSelectedTags(tags) {
  if (!Array.isArray(tags)) return tags;
  return tags.map((tag) => LEGACY_VI_LABEL_TO_TAG_ID[tag] || tag);
}

function migrateV8ToV9(parsed) {
  const migrated = { ...parsed, schemaVersion: SCHEMA_VERSION };

  (migrated.reviews || []).forEach((r) => { r.selectedTags = migrateSelectedTags(r.selectedTags); });
  (migrated.placeImpressions || []).forEach((imp) => { imp.tags = migrateSelectedTags(imp.tags); });

  if (Array.isArray(migrated.proposals)) {
    migrated.proposals.forEach((p) => {
      const seed = proposalSeedRecords.find((s) => s.id === p.id);
      if (!seed) return;
      ['title', 'summary', 'requestedChange', 'expectedImpact'].forEach((field) => {
        if (typeof p[field] === 'string') p[field] = seed[field];
      });
      // evidence: đề án mẫu lưu dạng mảng string thuần trước migration này (đề án host thật luôn
      // là 1 string đơn, không phải mảng — xem js/studio/support.js#collect) — an toàn để thay
      // bằng bản mẫu song ngữ bất cứ khi nào field này vẫn là mảng.
      if (Array.isArray(p.evidence)) p.evidence = seed.evidence;
      // managementNote: chỉ thay bằng bản mẫu song ngữ nếu vẫn còn đúng ghi chú mẫu gốc (chưa bị
      // Cổng quản lý ghi đè bằng nội dung thật) — so khớp bằng bản tiếng Việt gốc cũ.
      const seedNoteVi = seed.managementNote && typeof seed.managementNote === 'object' ? seed.managementNote.vi : seed.managementNote;
      if (typeof p.managementNote === 'string' && seedNoteVi && p.managementNote === seedNoteVi) {
        p.managementNote = seed.managementNote;
      }
    });
  }

  if (Array.isArray(migrated.contentSubmissions)) {
    migrated.contentSubmissions.forEach((sub) => {
      const seed = contentSubmissionSeedRecords.find((s) => s.id === sub.id);
      if (!seed) return;
      ['name', 'category', 'description', 'tags'].forEach((field) => {
        if (typeof sub[field] === 'string' || (Array.isArray(sub[field]) && field === 'tags')) sub[field] = seed[field];
      });
      if (sub.proposedSchedule && Array.isArray(sub.proposedSchedule.days)) {
        sub.proposedSchedule = { ...sub.proposedSchedule, days: seed.proposedSchedule.days };
      }
    });
  }

  return migrated;
}

function loadUserData() {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    let parsed = JSON.parse(text);
    if (!parsed) return null;
    if (parsed.schemaVersion === SCHEMA_VERSION) return parsed;
    if (parsed.schemaVersion === 2) parsed = migrateV2ToV3(parsed);
    if (parsed.schemaVersion === 3) parsed = migrateV3ToV4(parsed);
    if (parsed.schemaVersion === 4) parsed = migrateV4ToV5(parsed);
    if (parsed.schemaVersion === 5) parsed = migrateV5ToV6(parsed);
    if (parsed.schemaVersion === 6) parsed = migrateV6ToV7(parsed);
    if (parsed.schemaVersion === 7) parsed = migrateV7ToV8(parsed);
    if (parsed.schemaVersion === 8) return migrateV8ToV9(parsed);
    return parsed.schemaVersion === SCHEMA_VERSION ? parsed : null; // version không xác định/quá cũ — không có đường migration đã định nghĩa
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

  // Trải nghiệm do hộ tạo/sửa trong Studio được lưu riêng ở hostExperiences (persist) và
  // hợp nhất đè lên bản "nội dung" (experiences, nạp mới mỗi phiên từ data.js) ở đây —
  // giống cách destinations.json hợp nhất với dữ liệu người dùng.
  (state.hostExperiences || []).forEach((hostExp) => {
    const idx = state.experiences.findIndex((e) => e.id === hostExp.id);
    if (idx >= 0) state.experiences[idx] = hostExp;
    else state.experiences.push(hostExp);
  });

  // Activity được duyệt qua Cổng vận hành (approveContentSubmission, PHẦN 3 mục 3.5) — hợp nhất
  // vào state.destinations mỗi lần tải, giống hệt cơ chế hostExperiences ở trên. Phần Activity
  // Catalog tương ứng (customActivityCatalog) được operationsService.getOperations() đọc trực
  // tiếp làm base dự phòng, không cần hợp nhất ở đây.
  (state.customDestinations || []).forEach((customDest) => {
    if (!state.destinations.some((d) => d.id === customDest.id)) state.destinations.push(customDest);
  });

  // Huy hiệu "Được ghi nhận" do Cổng vận hành cấp/thu hồi (có lý do) được lưu riêng ở
  // hostRecognitionOverrides (persist) và đè lên cờ tĩnh trong destinations.json — giống
  // cơ chế hostExperiences ở trên. Chỉ áp dụng cho địa điểm có hộ gắn với (destinationId).
  Object.entries(state.hostRecognitionOverrides || {}).forEach(([hostId, override]) => {
    const host = state.hosts.find((h) => h.id === hostId);
    const dest = host && state.destinations.find((d) => d.id === host.destinationId);
    if (dest) {
      dest.recognized = override.recognized;
      dest.recognizedReason = override.reason || '';
    }
  });

  // Backfill hostId cho review migrate từ schema v2 (lúc migrate chưa có danh sách hosts —
  // hosts là CONTENT_KEY, chỉ có sẵn ở đây) — không suy đoán gì thêm ngoài tra cứu 1-1 theo
  // destinationId, và không ghi đè hostId đã có (review tạo mới sau migration đã có hostId đúng).
  (state.reviews || []).forEach((r) => {
    if (r.hostId === null || r.hostId === undefined) {
      const host = state.hosts.find((h) => h.destinationId === r.listingId);
      r.hostId = host ? host.id : null;
    }
  });

  // Seed booking demo cho toàn bộ 7 đơn vị cung cấp ("Tổng quan" + "Lịch & Booking", PHASE
  // 15/09/2026) — ngày tháng tính tương đối theo DEMO_REFERENCE_DATE CỐ ĐỊNH (không phải ngày thật
  // máy chạy), rồi đóng băng trong localStorage. Seed lại (đè hoàn toàn — đây là dữ liệu mô phỏng,
  // không phải do người dùng tạo) khi phiên bản công thức đổi (`CURRENT_DEMO_BOOKINGS_VERSION`),
  // để sửa lỗi/mở rộng công thức không đòi người dùng tự xoá cache; không seed lại khi version khớp.
  if (!Array.isArray(state.hostDemoBookings) || state.hostDemoBookingsVersion !== CURRENT_DEMO_BOOKINGS_VERSION) {
    state.hostDemoBookings = buildInitialDemoBookings();
    state.hostDemoBookingsVersion = CURRENT_DEMO_BOOKINGS_VERSION;
  }

  // Backfill đề án + nội dung đề xuất mẫu (PHẦN 2 mục 2.7, PHẦN 3 mục 3.4) — chèn theo id nếu
  // chưa có, KHÔNG đè lên bản ghi người dùng đã thao tác (đổi trạng thái...) ở lần tải sau. Không
  // dùng cơ chế version-reseed như hostDemoBookings vì đây là dữ liệu Host có thể đã xử lý
  // (duyệt/từ chối) — chỉ thêm 1 lần cho đủ, không bao giờ ghi đè lại.
  if (!Array.isArray(state.proposals)) state.proposals = [];
  proposalSeedRecords.forEach((seed) => {
    if (!state.proposals.some((p) => p.id === seed.id)) {
      // hostId alias cho providerId — proposalCardHtml ở Studio/admin/proposals.js lọc theo
      // hostId từ trước khi có mục 2.7; giữ cả hai tên field để không phải sửa lại chỗ lọc đó.
      state.proposals.push({ ...seed, hostId: seed.providerId, timeline: [{ status: seed.status, at: seed.submittedAt, note: 'Đã gửi đề án.' }] });
    }
  });
  if (!Array.isArray(state.contentSubmissions)) state.contentSubmissions = [];
  contentSubmissionSeedRecords.forEach((seed) => {
    if (!state.contentSubmissions.some((s) => s.id === seed.id)) {
      state.contentSubmissions.push({ ...seed });
    }
  });

  persist();
  return state;
}

/** Lưu (tạo mới hoặc ghi đè) một trải nghiệm do hộ quản lý trong Studio — xem ghi chú ở init(). */
export function upsertHostExperience(experience) {
  const s = getState();
  const idxLive = s.experiences.findIndex((e) => e.id === experience.id);
  if (idxLive >= 0) s.experiences[idxLive] = experience;
  else s.experiences.push(experience);

  const idxSaved = s.hostExperiences.findIndex((e) => e.id === experience.id);
  if (idxSaved >= 0) s.hostExperiences[idxSaved] = experience;
  else s.hostExperiences.push(experience);

  persist();
  return experience;
}

/** Đồng bộ state trong bộ nhớ từ localStorage — dùng khi TAB KHÁC vừa ghi dữ liệu (sự kiện
 * `storage`, xem app.js). Viết localStorage không tự cập nhật biến `state` đang giữ trong bộ nhớ
 * của tab hiện tại (mỗi tab có bản sao module JS riêng) — phải đọc lại và merge thủ công. Chỉ ghi
 * đè các key KHÔNG phải CONTENT_KEYS (nội dung tĩnh không đổi giữa các tab). Trả về false nếu
 * chưa init/không đọc được — nơi gọi tự bỏ qua an toàn. */
export function syncFromLocalStorage() {
  if (!state) return false;
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (!text) return false;
    const parsed = JSON.parse(text);
    if (!parsed) return false;
    let userData = parsed;
    if (parsed.schemaVersion === 2) userData = migrateV2ToV3(parsed);
    else if (parsed.schemaVersion !== SCHEMA_VERSION) return false;
    Object.keys(userData).forEach((key) => {
      if (!CONTENT_KEYS.includes(key)) state[key] = userData[key];
    });
    return true;
  } catch (err) {
    return false;
  }
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

// ---------- Hành trình ----------
export function saveItinerary(itinerary) {
  const s = getState();
  const idx = s.itineraries.findIndex((it) => it.id === itinerary.id);
  if (idx >= 0) s.itineraries[idx] = itinerary;
  else s.itineraries.push(itinerary);
  persist();
  notifyDataChanged('itinerary', idx >= 0 ? 'updated' : 'created');
  return itinerary;
}

export function getItinerary(id) {
  return getState().itineraries.find((it) => it.id === id) || null;
}

export function deleteItinerary(id) {
  const s = getState();
  s.itineraries = s.itineraries.filter((it) => it.id !== id);
  if (s.ui.activeItineraryId === id) s.ui.activeItineraryId = null;
  persist();
}

export function setActiveItinerary(id) {
  const s = getState();
  s.ui.activeItineraryId = id;
  persist();
}

// ---------- Giỏ hành trình (tripCart) — "Thêm vào hành trình" hoạt động như giỏ hàng ----------
// item: { destinationId, addedAt, selected: boolean, partySize: number }. `selected` là trạng
// thái tick trong trang "Hành trình của tôi" — KHÔNG đồng nghĩa với có trong giỏ hay không (bỏ
// tick vẫn giữ trong giỏ, chỉ ảnh hưởng việc có được đưa vào lộ trình khi bấm "Tạo lộ trình từ
// các điểm đã chọn" hay không — đúng PHASE mục 3/12).
export function getTripCart() {
  return getState().tripCart;
}

export function isInTripCart(destinationId) {
  return getState().tripCart.some((it) => it.destinationId === destinationId);
}

export function getTripCartCount() {
  return getState().tripCart.length;
}

export function addToTripCart(destinationId) {
  const s = getState();
  if (s.tripCart.some((it) => it.destinationId === destinationId)) return { ok: true, added: false };
  s.tripCart.push({ destinationId, addedAt: new Date().toISOString(), selected: true, partySize: 1 });
  persist();
  notifyDataChanged('tripCart', 'created');
  logCustomerBehaviourEvent('trip_cart_add', { destinationId });
  return { ok: true, added: true };
}

export function removeFromTripCart(destinationId) {
  const s = getState();
  const before = s.tripCart.length;
  s.tripCart = s.tripCart.filter((it) => it.destinationId !== destinationId);
  if (s.tripCart.length !== before) {
    persist();
    notifyDataChanged('tripCart', 'deleted');
  }
  return { ok: true };
}

/** Bấm nút "+ Thêm vào hành trình" khi listing đã có trong giỏ → gỡ khỏi giỏ (toggle add/remove,
 * đúng hành vi nút đổi thành "✓ Đã thêm" rồi bấm lại để xoá — PHASE mục 3.5-3.6). */
export function toggleTripCartItem(destinationId) {
  if (isInTripCart(destinationId)) {
    removeFromTripCart(destinationId);
    return { added: false };
  }
  addToTripCart(destinationId);
  return { added: true };
}

export function setTripCartItemSelected(destinationId, selected) {
  const s = getState();
  const item = s.tripCart.find((it) => it.destinationId === destinationId);
  if (!item) return null;
  item.selected = !!selected;
  persist();
  notifyDataChanged('tripCart', 'updated');
  return item;
}

export function setTripCartAllSelected(selected) {
  const s = getState();
  s.tripCart.forEach((it) => { it.selected = !!selected; });
  persist();
  notifyDataChanged('tripCart', 'updated');
}

export function removeTripCartSelected() {
  const s = getState();
  s.tripCart = s.tripCart.filter((it) => !it.selected);
  persist();
  notifyDataChanged('tripCart', 'deleted');
}

export function setTripCartPartySize(destinationId, partySize) {
  const s = getState();
  const item = s.tripCart.find((it) => it.destinationId === destinationId);
  if (!item) return null;
  item.partySize = Math.max(1, Number(partySize) || 1);
  persist();
  notifyDataChanged('tripCart', 'updated');
  return item;
}

// ---------- Trung tâm thông báo (notification center) ----------
// notification: { id, type, title, message, bookingId, itineraryId, createdAt, read }
export function addNotification({ type, title, message, bookingId = null, itineraryId = null }) {
  const s = getState();
  const notif = {
    id: uidLocal('notif'),
    type,
    title,
    message,
    bookingId,
    itineraryId,
    createdAt: new Date().toISOString(),
    read: false,
  };
  s.notifications.unshift(notif); // mới nhất lên đầu
  persist();
  notifyDataChanged('notifications', 'created');
  return notif;
}

export function getNotifications() {
  return getState().notifications;
}

// ---------- Thông báo cho Host/đơn vị cung cấp (tách khỏi state.notifications — đó là kênh của
// Customer/Trail; dùng chung sẽ lẫn thông báo giữa 2 vai trò trong 1 phiên demo). Bắn khi Cổng
// quản lý xử lý đề án hoặc Cổng vận hành xử lý nội dung đề xuất (PHẦN 2 mục 2.7, PHẦN 3 mục 3.3). ----------
export function addProviderNotification({ providerId, type, title, message, relatedId = null }) {
  if (!providerId) return null;
  const s = getState();
  if (!Array.isArray(s.providerNotifications)) s.providerNotifications = [];
  const notif = { id: uidLocal('pnotif'), providerId, type, title, message, relatedId, createdAt: new Date().toISOString(), read: false };
  s.providerNotifications.unshift(notif);
  persist();
  notifyDataChanged('providerNotifications', 'created');
  return notif;
}

export function getProviderNotifications(providerId) {
  return (getState().providerNotifications || []).filter((n) => n.providerId === providerId);
}

export function markProviderNotificationsRead(providerId) {
  const s = getState();
  (s.providerNotifications || []).forEach((n) => { if (n.providerId === providerId) n.read = true; });
  persist();
}

export function getUnreadNotificationCount() {
  return getState().notifications.filter((n) => !n.read).length;
}

export function markNotificationRead(id) {
  const s = getState();
  const n = s.notifications.find((x) => x.id === id);
  if (!n || n.read) return null;
  n.read = true;
  persist();
  notifyDataChanged('notifications', 'updated');
  return n;
}

export function markAllNotificationsRead() {
  const s = getState();
  let changed = false;
  s.notifications.forEach((n) => { if (!n.read) { n.read = true; changed = true; } });
  if (changed) {
    persist();
    notifyDataChanged('notifications', 'updated');
  }
}

// ---------- Nhắc lịch (reminders) — website tĩnh nên KHÔNG có gì chạy khi tab đã đóng; chỉ kiểm
// tra reminder đến hạn mỗi khi app được mở/focus lại (xem checkDueReminders(), gọi từ app.js) ----------
// reminder: { id, bookingId, itineraryId, kind: '24h'|'2h', triggerAt (ISO), message, sentAt }
const TIMEZONE = 'Asia/Ho_Chi_Minh';

/** Tạo 2 reminder (24 giờ và 2 giờ trước giờ khởi hành) cho 1 booking — gọi ngay sau khi booking
 * được tạo. `startAt` là Date giờ khởi hành thật (điểm dừng sớm nhất có slot), do nơi gọi
 * (bookingService) tính sẵn — storage.js không tự suy luận slot để tránh phụ thuộc vòng. Nếu
 * `startAt` null (chưa xác định được giờ) thì không tạo reminder nào — không bịa giờ. */
export function scheduleBookingReminders(booking, itineraryId, startAt) {
  if (!startAt) return [];
  const s = getState();
  const created = [];
  [
    { kind: '24h', hoursBefore: 24 },
    { kind: '2h', hoursBefore: 2 },
  ].forEach(({ kind, hoursBefore }) => {
    const triggerAt = new Date(startAt.getTime() - hoursBefore * 3600000);
    if (triggerAt.getTime() <= Date.now()) return; // mốc đã qua ngay lúc tạo booking — bỏ qua, không gửi trễ
    const reminder = {
      id: uidLocal('reminder'),
      bookingId: booking.id,
      itineraryId: itineraryId || booking.itineraryId || null,
      kind,
      triggerAt: triggerAt.toISOString(),
      message: kind === '24h'
        ? `Ngày mai bạn có hành trình KhmerLink lúc ${startAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE })}. Hãy kiểm tra lại điểm gặp và những điều cần chuẩn bị.`
        : `Còn 2 giờ nữa hành trình của bạn bắt đầu. Kiểm tra lại địa điểm và giờ hẹn nhé.`,
      sentAt: null,
    };
    s.reminders.push(reminder);
    created.push(reminder);
  });
  if (created.length) persist();
  return created;
}

/** Gọi mỗi khi app mở/được focus lại (app.js) — biến mọi reminder đã tới hạn và CHƯA gửi
 * (`sentAt` null) thành 1 notification, rồi đánh dấu sentAt để không gửi lặp lại. Idempotent: gọi
 * nhiều lần liên tiếp không tạo thêm notification nào ngoài các reminder thật sự mới tới hạn. */
export function checkDueReminders() {
  const s = getState();
  const now = Date.now();
  const due = s.reminders.filter((r) => !r.sentAt && new Date(r.triggerAt).getTime() <= now);
  if (!due.length) return [];
  due.forEach((r) => {
    r.sentAt = new Date().toISOString();
    addNotification({
      type: 'booking_reminder',
      title: r.kind === '24h' ? 'Nhắc lịch — còn 1 ngày' : 'Nhắc lịch — sắp bắt đầu',
      message: r.message,
      bookingId: r.bookingId,
      itineraryId: r.itineraryId,
    });
    if (s.notificationsOptIn && typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        // eslint-disable-next-line no-new
        new window.Notification('KhmerLink', { body: r.message });
      } catch (err) {
        // trình duyệt chặn/không hỗ trợ — bỏ qua, notification trong app vẫn đã lưu ở trên
      }
    }
  });
  persist();
  return due;
}

export function setNotificationsOptIn(optIn) {
  const s = getState();
  s.notificationsOptIn = !!optIn;
  persist();
}

export function getNotificationsOptIn() {
  return !!getState().notificationsOptIn;
}

// ---------- Passport / điểm thưởng ----------
export function addPassportStamp({ destinationId, type, bookingItemId = null }) {
  const s = getState();
  const already = s.passportStamps.some((st) => st.destinationId === destinationId && st.bookingItemId === bookingItemId && st.type === type);
  if (already) return null;
  const stamp = { id: `stamp-${destinationId}-${type}-${bookingItemId || 'self'}`, destinationId, type, bookingItemId, earnedAt: new Date().toISOString() };
  s.passportStamps.push(stamp);
  persist();
  return stamp;
}

export function hasVisitedSelf(destinationId) {
  return getState().passportStamps.some((st) => st.destinationId === destinationId);
}

export function addPoints(amount, reason, relatedBookingId = null) {
  const s = getState();
  const idempotencyKey = `${reason}-${relatedBookingId || 'none'}`;
  if (s.pointsLedger.some((p) => p.idempotencyKey === idempotencyKey)) return null;
  const balanceBefore = s.pointsLedger.reduce((sum, p) => sum + p.amount, 0);
  const entry = {
    id: uidLocal('pt'),
    amount,
    reason,
    relatedBookingId,
    idempotencyKey,
    createdAt: new Date().toISOString(),
    balanceAfter: balanceBefore + amount,
  };
  s.pointsLedger.push(entry);
  persist();
  return entry;
}

export function getPointsBalance() {
  return getState().pointsLedger.reduce((sum, p) => sum + p.amount, 0);
}

export function redeemVoucher(templateId) {
  const s = getState();
  const template = s.voucherCatalog.find((v) => v.id === templateId);
  if (!template) return { ok: false, reason: 'Không tìm thấy voucher.' };
  const balance = getPointsBalance();
  if (balance < template.pointsCost) return { ok: false, reason: 'Không đủ điểm để đổi voucher này.' };
  const now = new Date();
  const expiresAt = new Date(now.getTime() + template.validDays * 86400000);
  const voucher = {
    id: uidLocal('vc'),
    templateId,
    title: template.title,
    discountLabel: template.discountLabel,
    condition: template.condition,
    code: `${template.id.slice(0, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    redeemedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
  };
  s.vouchers.push(voucher);
  addPoints(-template.pointsCost, `redeem-voucher-${voucher.id}`);
  persist();
  return { ok: true, voucher };
}

export function useVoucher(voucherId) {
  const s = getState();
  const v = s.vouchers.find((x) => x.id === voucherId);
  if (!v || v.status !== 'active') return { ok: false };
  if (new Date(v.expiresAt) < new Date()) {
    v.status = 'expired';
    persist();
    return { ok: false, reason: 'Voucher đã hết hạn.' };
  }
  v.status = 'used';
  v.usedAt = new Date().toISOString();
  persist();
  return { ok: true };
}

// ---------- Đánh giá của khách (viết sau khi hoàn thành booking) ----------
// Nguồn dữ liệu THỐNG NHẤT cho cả Trail/Studio/Cổng vận hành (PHASE "Hoàn thiện hành trình" mục
// 8-9) — chỉ một tập state.reviews, không tách riêng bản Trail và bản Studio. Chỉ booking item đã
// `completed` mới được đánh giá; 1 booking item chỉ có tối đa 1 review (demo 1 traveller duy nhất
// nên dedup theo bookingItemId là đủ tương đương "1 review/traveller/booking item").
export function addReview({ destinationId, bookingId = null, bookingItemId, overallRating, categoryRatings, comment, selectedTags = [], wouldRecommend = null }) {
  const s = getState();
  if (s.reviews.some((r) => r.bookingItemId === bookingItemId)) {
    return { ok: false, reason: 'Booking này đã được đánh giá.' };
  }
  const bi = s.bookingItems.find((x) => x.id === bookingItemId);
  if (!bi || bi.status !== 'completed') {
    return { ok: false, reason: 'Chỉ có thể đánh giá hoạt động đã hoàn thành.' };
  }
  const host = s.hosts.find((h) => h.destinationId === destinationId);
  const review = {
    id: uidLocal('review'),
    bookingId: bookingId || bi.bookingId || null,
    bookingItemId,
    listingId: destinationId,
    hostId: host ? host.id : null,
    travellerId: 'traveller-demo-self', // bản demo 1 traveller, chưa có tài khoản đa người dùng thật
    travellerName: 'Bạn',
    overallRating,
    categoryRatings: categoryRatings || {},
    selectedTags,
    wouldRecommend,
    comment: comment || '',
    createdAt: new Date().toISOString(),
    status: 'published',
    source: 'live_demo',
  };
  s.reviews.push(review);
  persist();
  notifyDataChanged('reviews', 'created');
  logCustomerBehaviourEvent('review_submitted', { listingId: destinationId, overallRating });
  return { ok: true, review };
}

// ---------- Cảm nhận nhanh sau khi tự đánh dấu "Đã ghé thăm" (không cần booking) ----------
// Tách khỏi reviews (vốn yêu cầu bookingItemId, dùng cho CPS/host) vì đây là tín hiệu tự
// khai báo cho các điểm miễn phí — không tính vào CPS, không thay thế đánh giá booking chính
// thức. Chống trùng theo stopKey (một lượt "đã ghé thăm" chỉ tạo được một cảm nhận).
export function addPlaceImpression({ destinationId, itineraryId = null, stopKey = null, rating, tags = [], comment = '', recommend = null }) {
  const s = getState();
  if (stopKey && s.placeImpressions.some((i) => i.stopKey === stopKey)) {
    return { ok: false, reason: 'Điểm dừng này đã có cảm nhận.' };
  }
  const impression = {
    id: uidLocal('imp'),
    destinationId,
    itineraryId,
    stopKey,
    author: 'Bạn',
    rating,
    tags,
    comment: comment || '',
    recommend,
    createdAt: new Date().toISOString(),
  };
  s.placeImpressions.push(impression);
  persist();
  return { ok: true, impression };
}

// ---------- Ticket hỗ trợ / sự cố ----------
export function createSupportTicket({ category, description, bookingId = null, destinationId = null, desiredResolution = null }) {
  const s = getState();
  const now = new Date().toISOString();
  const ticket = {
    id: uidLocal('ticket'),
    code: `HT-${Math.floor(100000 + Math.random() * 900000)}`,
    category,
    description,
    bookingId,
    destinationId,
    desiredResolution,
    status: 'moi',
    createdAt: now,
    timeline: [{ status: 'moi', note: 'Đã gửi yêu cầu, đội hỗ trợ sẽ xử lý trong 1–2 ngày làm việc (mục tiêu xử lý, không phải bảo đảm).', at: now }],
  };
  s.supportTickets.push(ticket);
  persist();
  return ticket;
}

// ---------- Studio: hộ đang xem (chuyển vai trò demo) ----------
export function setCurrentHostId(hostId) {
  const s = getState();
  s.ui.currentHostId = hostId;
  persist();
}

export function getCurrentHostId() {
  return getState().ui.currentHostId;
}

// ---------- Studio: lượt xem (để tính gợi ý "nhiều lượt xem nhưng ít booking") ----------
export function recordDestinationView(destinationId) {
  const s = getState();
  s.viewCounts[destinationId] = (s.viewCounts[destinationId] || 0) + 1;
  persist();
  logCustomerBehaviourEvent('destination_view', { destinationId });
}

// ---------- Studio: gợi ý cải thiện — trạng thái người dùng đã chọn cho từng gợi ý ----------
export function setSuggestionDecision(suggestionId, decision) {
  const s = getState();
  s.suggestionDecisions[suggestionId] = decision;
  persist();
}

// ---------- Studio: đề án hỗ trợ ----------
export function createProposal({
  hostId, providerId = null, activityId = null, title, proposalType = null,
  problem, desiredSupport, expectedBenefit, evidence, summary, requestedChange, expectedImpact,
  proposedBudget = null, status = 'sent',
}) {
  const s = getState();
  const now = new Date().toISOString();
  const proposal = {
    id: uidLocal('proposal'),
    hostId,
    providerId: providerId || hostId,
    activityId,
    title,
    proposalType,
    problem, desiredSupport, expectedBenefit, evidence,
    summary: summary ?? problem,
    requestedChange: requestedChange ?? desiredSupport,
    expectedImpact: expectedImpact ?? expectedBenefit,
    proposedBudget,
    status,
    managementNote: null,
    createdAt: now,
    submittedAt: now,
    updatedAt: now,
    timeline: [{ status, at: now, note: status === 'sent' ? 'Đã gửi đề án.' : 'Đã lưu nháp.' }],
  };
  s.proposals.push(proposal);
  persist();
  return proposal;
}

export function updateProposal(id, patch) {
  const s = getState();
  const p = s.proposals.find((x) => x.id === id);
  if (!p) return null;
  Object.assign(p, patch);
  persist();
  return p;
}

const PROPOSAL_STATUS_LABEL_VI = {
  sent: 'Đã gửi', pending_review: 'Chờ duyệt', reviewing: 'Đang xem xét', in_review: 'Đang xem xét',
  needs_info: 'Cần bổ sung', needs_revision: 'Cần bổ sung', approved: 'Chấp thuận', rejected: 'Từ chối',
};
// Trạng thái do CHÍNH Host gây ra (gửi/gửi lại) — không cần tự thông báo cho Host về hành động
// của họ. Mọi trạng thái khác coi là quyết định của Cổng quản lý — bắn thông báo cho Host.
const PROPOSAL_HOST_INITIATED_STATUSES = new Set(['draft', 'sent', 'pending_review']);

export function setProposalStatus(id, status, note) {
  const s = getState();
  const p = s.proposals.find((x) => x.id === id);
  if (!p) return null;
  p.status = status;
  p.updatedAt = new Date().toISOString();
  if (!PROPOSAL_HOST_INITIATED_STATUSES.has(status)) p.managementNote = note || null;
  p.timeline.push({ status, at: p.updatedAt, note });
  persist();
  if (!PROPOSAL_HOST_INITIATED_STATUSES.has(status)) {
    addProviderNotification({
      providerId: p.hostId || p.providerId,
      type: 'proposal_status',
      title: `Đề án "${toPlainVi(p.title)}" đã cập nhật trạng thái`,
      message: `${PROPOSAL_STATUS_LABEL_VI[status] || status}${note ? ` — ${note}` : ''}`,
      relatedId: p.id,
    });
  }
  return p;
}

// sub.name/category/description/tags/proposedSchedule.days có thể là object song ngữ { vi, en }
// khi đến từ NỘI DUNG MẪU (contentSubmissionSeedRecords) — khi một đề xuất được duyệt/từ chối/yêu
// cầu chỉnh sửa, các trường này phải "đóng băng" thành PLAIN STRING tiếng Việt (giống mọi destination
// khác không thuộc 7 listing pilot, vốn không có cơ chế song ngữ động) trước khi ghi vào dữ liệu
// nghiệp vụ thật (destinations/Activity Catalog/notification) — không lưu nguyên object song ngữ
// vào business data. Đề xuất do host thật nhập vẫn là string thường, hàm này trả nguyên văn.
function toPlainVi(field, fallback = '') {
  if (field && typeof field === 'object' && !Array.isArray(field)) return field.vi ?? field.en ?? fallback;
  return field ?? fallback;
}
function toPlainViList(field, fallback = []) {
  if (field && typeof field === 'object' && !Array.isArray(field)) return field.vi ?? field.en ?? fallback;
  return Array.isArray(field) ? field : fallback;
}

// ---------- Studio "Thêm trải nghiệm" → Cổng vận hành kiểm duyệt (PHẦN 3, mục 3.3-3.5) ----------
// contentSubmissions: 1 nguồn DUY NHẤT — dùng chung ở lịch sử "Thêm trải nghiệm" của Host VÀ tab
// Kiểm duyệt nội dung (Cổng vận hành). Activity đề xuất CHƯA vào Activity Catalog/Customer
// Interface cho tới khi được duyệt (approveContentSubmission) — trước đó chỉ tồn tại trong mảng
// này, không đọc được từ getOperations()/state.destinations ở đâu khác.
export function createContentSubmission(data) {
  const s = getState();
  if (!Array.isArray(s.contentSubmissions)) s.contentSubmissions = [];
  const now = new Date().toISOString();
  const submission = {
    id: uidLocal('sub'),
    proposedActivityId: null,
    submittedAt: now,
    status: 'pending_review',
    reviewerNote: null,
    reviewedAt: null,
    images: [],
    tags: [],
    ...data,
  };
  s.contentSubmissions.push(submission);
  persist();
  notifyDataChanged('contentSubmissions', 'created');
  return submission;
}

/** Duyệt 1 đề xuất nội dung — tạo activity CHÍNH THỨC (destination + Activity Catalog entry) từ
 * dữ liệu submission, mượn toạ độ/địa chỉ/ảnh từ địa điểm gốc của cùng đơn vị (submission không tự
 * có các trường này) để không hiện trống/lỗi trên bản đồ. Lưu vào state.customDestinations/
 * state.customActivityCatalog (persist) — init() merge vào state.destinations mỗi lần tải, giống
 * cơ chế hostExperiences; operationsService.getOperations() đọc customActivityCatalog làm base dự
 * phòng khi activityCatalog tĩnh không có id đó. KHÔNG đụng tới activityCatalog/destinations tĩnh
 * hiện có (Part 5 — không đổi 7 listing đã duyệt). */
export function approveContentSubmission(id, reviewerNote = null) {
  const s = getState();
  const sub = (s.contentSubmissions || []).find((x) => x.id === id);
  if (!sub) return null;
  const host = s.hosts.find((h) => h.id === sub.providerId);
  const parentDest = host ? s.destinations.find((d) => d.id === host.destinationId) : null;
  const newId = sub.proposedActivityId || sub.id;
  const now = new Date().toISOString();

  const subName = toPlainVi(sub.name);
  const subCategory = toPlainVi(sub.category);
  const subDescription = toPlainVi(sub.description);
  const subDays = toPlainViList(sub.proposedSchedule && sub.proposedSchedule.days);

  if (!Array.isArray(s.customDestinations)) s.customDestinations = [];
  if (!s.customDestinations.some((d) => d.id === newId)) {
    const newDest = {
      id: newId,
      name: subName,
      altName: null,
      listingType: 'experience',
      category: subCategory || (parentDest && parentDest.category) || 'Trải nghiệm cộng đồng',
      region: parentDest ? parentDest.region : null,
      isDemoHost: false,
      interests: (parentDest && parentDest.interests) || [],
      lat: parentDest ? parentDest.lat : null,
      lng: parentDest ? parentDest.lng : null,
      coordinatesStatus: parentDest ? parentDest.coordinatesStatus : 'unavailable',
      address: parentDest ? parentDest.address : null,
      addressStatus: parentDest ? parentDest.addressStatus : 'missing',
      formerAddress: null,
      mapLinks: (parentDest && parentDest.mapLinks) || [],
      mapSearchUrl: (parentDest && parentDest.mapSearchUrl) || null,
      openingHoursStatus: 'unavailable',
      priceDisplay: null,
      isFreeEntry: false,
      priceStatus: 'unavailable',
      rating: null, ratingCount: null, ratingStatus: 'unavailable',
      suggestedDurationMin: sub.durationMinutes || null,
      durationStatus: sub.durationMinutes ? 'estimated' : 'unavailable',
      revenueType: 'community_paid',
      providerType: 'household',
      isCommunityActivity: true,
      bookable: false,
      revenuePriceValue: sub.pricePerPerson || null,
      summary: subDescription || '',
      activities: subDescription || '',
      culturalStory: '', keyFacts: [], tips: '',
      contact: null, contactStatus: 'unavailable',
      imagePath: (parentDest && parentDest.imagePath) || null,
      representativeImageUrl: (parentDest && parentDest.representativeImageUrl) || null,
      imageRef: (parentDest && parentDest.imageRef) || null,
      galleryImages: [],
      sources: [], notes: [],
      recognized: false, recognizedReason: '', isNew: true, dataQuality: 'host-submitted',
      status: 'Đã duyệt qua Cổng vận hành', readiness: '', bookingStatus: 'notBookable', ctaKind: 'interested',
      supplierRefs: [], verificationChecklist: [], informationSourcesFull: [], conclusionNote: null,
      clusterChildren: null, partOfCluster: null, relatedListingIds: parentDest ? [parentDest.id] : [], stops: null,
    };
    s.customDestinations.push(newDest);
    // Thêm ngay vào state.destinations ĐANG DÙNG (không chỉ bản persist) — giống cách
    // upsertHostExperience cập nhật cả state.experiences lẫn state.hostExperiences, để activity
    // hiện ngay trên Khám phá mà không cần tải lại trang (init() vẫn merge lại mỗi lần tải sau).
    if (!s.destinations.some((d) => d.id === newId)) s.destinations.push(newDest);
  }

  if (!Array.isArray(s.customActivityCatalog)) s.customActivityCatalog = [];
  const catalogIdx = s.customActivityCatalog.findIndex((c) => c.activityId === newId);
  const catalogEntry = {
    activityId: newId,
    providerAccountId: sub.providerId,
    partnerProviderIds: null,
    offeringType: 'paid_experience',
    financialMode: 'community_paid',
    platformFeeRate: 0.10,
    revenueSplitNote: null,
    openingHours: Object.fromEntries(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => [d, 'closed'])),
    openingNote: 'Theo lịch hẹn với hộ — xem khung giờ đề xuất bên dưới.',
    durationMinutes: sub.durationMinutes || 60,
    pricePerPerson: sub.pricePerPerson || 0,
    capacityPerSlot: sub.capacity || 1,
    capacity: sub.capacity || 1,
    availableTimeSlots: (sub.proposedSchedule && sub.proposedSchedule.timeSlots) || [],
    culturalNotes: null,
    visitRegistrationEnabled: false,
    bookable: true,
    publicationStatus: 'published',
    updatedAt: now,
  };
  const dayKeyMap = { 'Thứ Hai': 'monday', 'Thứ Ba': 'tuesday', 'Thứ Tư': 'wednesday', 'Thứ Năm': 'thursday', 'Thứ Sáu': 'friday', 'Thứ Bảy': 'saturday', 'Chủ Nhật': 'sunday' };
  subDays.forEach((d) => {
    const key = dayKeyMap[d];
    if (key) catalogEntry.openingHours[key] = (sub.proposedSchedule.timeSlots || []).map((t) => `${t}-${t}`);
  });
  if (catalogIdx >= 0) s.customActivityCatalog[catalogIdx] = catalogEntry; else s.customActivityCatalog.push(catalogEntry);

  sub.status = 'approved';
  sub.proposedActivityId = newId;
  sub.reviewerNote = reviewerNote;
  sub.reviewedAt = now;
  persist();
  notifyDataChanged('contentSubmissions', 'approved');
  addProviderNotification({
    providerId: sub.providerId,
    type: 'submission_status',
    title: `Đề xuất "${subName}" đã được duyệt`,
    message: 'Hoạt động đã được thêm vào Activity Catalog và hiển thị trên giao diện khách.',
    relatedId: sub.id,
  });
  return sub;
}

export function requestContentSubmissionRevision(id, reviewerNote) {
  const s = getState();
  const sub = (s.contentSubmissions || []).find((x) => x.id === id);
  if (!sub) return null;
  sub.status = 'needs_revision';
  sub.reviewerNote = reviewerNote;
  sub.reviewedAt = new Date().toISOString();
  persist();
  addProviderNotification({
    providerId: sub.providerId,
    type: 'submission_status',
    title: `Đề xuất "${toPlainVi(sub.name)}" cần chỉnh sửa`,
    message: reviewerNote,
    relatedId: sub.id,
  });
  return sub;
}

export function rejectContentSubmission(id, reviewerNote) {
  const s = getState();
  const sub = (s.contentSubmissions || []).find((x) => x.id === id);
  if (!sub) return null;
  sub.status = 'rejected';
  sub.reviewerNote = reviewerNote;
  sub.reviewedAt = new Date().toISOString();
  persist();
  addProviderNotification({
    providerId: sub.providerId,
    type: 'submission_status',
    title: `Đề xuất "${toPlainVi(sub.name)}" đã bị từ chối`,
    message: reviewerNote,
    relatedId: sub.id,
  });
  return sub;
}

export function getContentSubmissions() {
  return getState().contentSubmissions || [];
}

// ---------- Studio: yêu cầu xem xét ngoại lệ CPS ----------
export function requestCpsException({ hostId, reason, category, startDate, endDate }) {
  const s = getState();
  const now = new Date().toISOString();
  const exception = {
    id: uidLocal('cpsexc'),
    hostId,
    reason,
    category,
    startDate,
    endDate,
    status: 'pending',
    createdAt: now,
    history: [{ status: 'pending', at: now }],
  };
  s.cpsExceptions.push(exception);
  persist();
  return exception;
}

export function decideCpsException(id, status, note) {
  const s = getState();
  const exc = s.cpsExceptions.find((x) => x.id === id);
  if (!exc) return null;
  exc.status = status;
  exc.history.push({ status, at: new Date().toISOString(), note });
  persist();
  return exc;
}

// ---------- Cổng vận hành: kiểm duyệt nội dung ----------
/** Duyệt hoặc yêu cầu chỉnh sửa một trải nghiệm đang chờ duyệt (decision: 'approved'|'needs_changes'). */
export function reviewExperience(experienceId, decision, note) {
  const s = getState();
  const exp = s.experiences.find((e) => e.id === experienceId);
  if (!exp) return null;
  exp.status = decision === 'approved' ? 'published' : 'draft';
  const record = {
    id: uidLocal('mod'),
    targetType: 'experience',
    targetId: experienceId,
    action: decision,
    note: note || '',
    by: 'ops',
    at: new Date().toISOString(),
  };
  s.moderationRecords.push(record);
  persist();
  return { exp, record };
}

// ---------- Cổng vận hành: điều phối booking thủ công ----------
/** Ghi một ghi chú điều phối nội bộ vào lịch sử booking (không tự đổi giờ/điểm — cần khách đồng ý qua Trail). */
export function addOpsDispatchNote(bookingId, note) {
  const s = getState();
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!booking) return null;
  booking.statusHistory.push({ status: booking.status, at: new Date().toISOString(), note: `[Vận hành] ${note}` });
  persist();
  return booking;
}

// ---------- Cổng vận hành: xử lý ticket sự cố ----------
export function assignSupportTicket(ticketId, handlerName) {
  const s = getState();
  const t = s.supportTickets.find((x) => x.id === ticketId);
  if (!t) return null;
  t.assignedTo = handlerName;
  t.timeline.push({ status: t.status, at: new Date().toISOString(), note: `Đã gán cho ${handlerName} xử lý.` });
  persist();
  return t;
}

export function updateSupportTicketStatus(ticketId, status, note) {
  const s = getState();
  const t = s.supportTickets.find((x) => x.id === ticketId);
  if (!t) return null;
  t.status = status;
  t.timeline.push({ status, at: new Date().toISOString(), note: note || '' });
  persist();
  return t;
}

// ---------- Cổng vận hành: huy hiệu chất lượng "Được ghi nhận" ----------
/** Cấp/thu hồi huy hiệu cho địa điểm gắn với một hộ, có lý do — ghi đè cờ tĩnh trong destinations.json. */
export function setHostRecognition(hostId, recognized, reason) {
  const s = getState();
  const host = s.hosts.find((h) => h.id === hostId);
  if (!host) return null;
  s.hostRecognitionOverrides[hostId] = { recognized, reason: reason || '', at: new Date().toISOString() };
  const dest = s.destinations.find((d) => d.id === host.destinationId);
  if (dest) {
    dest.recognized = recognized;
    dest.recognizedReason = reason || '';
  }
  persist();
  return s.hostRecognitionOverrides[hostId];
}

export function getHostRecognitionOverride(hostId) {
  return getState().hostRecognitionOverrides[hostId] || null;
}

// ---------- PHASE "Data Linkage" (15/09/2026): Host tự chỉnh Activity Catalog ----------
/** Ghi đè các trường Host được phép sửa (mục 5 yêu cầu 15/09/2026: mô tả/giá/thời lượng/sức chứa/
 * khung giờ/trạng thái công bố, xem js/studio/experiences.js) lên
 * trên activityCatalog gốc — KHÔNG cho sửa providerAccountId/financialMode/platformFeeRate/
 * activityId/offeringType/revenueSplitNote (lọc bỏ nếu lỡ có trong patch, phòng gọi sai chỗ).
 * getOperations() đọc hợp nhất LIVE ngay sau lần persist() này — Customer/AI/Cổng quản lý thấy
 * đúng ngay trong cùng tab; tab khác thấy sau khi đồng bộ `storage` event (activityCatalogOverrides
 * không phải CONTENT_KEY nên CÓ đồng bộ qua syncFromLocalStorage, khác destinations tĩnh). */
const LOCKED_ACTIVITY_FIELDS = ['activityId', 'providerAccountId', 'partnerProviderIds', 'financialMode', 'platformFeeRate', 'revenueSplitNote', 'offeringType'];
export function updateActivityCatalogOverride(activityId, patch) {
  const s = getState();
  const safePatch = { ...patch };
  LOCKED_ACTIVITY_FIELDS.forEach((f) => { delete safePatch[f]; });
  if (!s.activityCatalogOverrides) s.activityCatalogOverrides = {};
  s.activityCatalogOverrides[activityId] = {
    ...(s.activityCatalogOverrides[activityId] || {}),
    ...safePatch,
    updatedAt: new Date().toISOString(),
  };
  persist();
  notifyDataChanged('activityCatalog', 'updated');
  return s.activityCatalogOverrides[activityId];
}

// ---------- PHẦN 2: Booking demo cho "Lịch & Booking" của Host ----------
// Tách biệt khỏi bookings/bookingItems thật (xem ghi chú ở buildInitialDemoBookings, data/pilot-
// seed-data.js) nhưng vẫn mutable/persist/đồng bộ qua storage/custom event như dữ liệu thật.

export function getHostDemoBookings(providerId) {
  const list = getState().hostDemoBookings || [];
  return providerId ? list.filter((b) => b.providerId === providerId) : list.slice();
}

function findHostDemoBooking(id) {
  return (getState().hostDemoBookings || []).find((b) => b.id === id) || null;
}

export function confirmHostDemoBooking(id) {
  const b = findHostDemoBooking(id);
  if (!b || b.status !== 'pending') return { ok: false, reason: 'Booking không còn ở trạng thái chờ xác nhận.' };
  b.status = 'confirmed';
  persist();
  notifyDataChanged('hostDemoBookings', 'updated');
  return { ok: true, booking: b };
}

export function rejectHostDemoBooking(id, reason = '') {
  const b = findHostDemoBooking(id);
  if (!b || b.status !== 'pending') return { ok: false, reason: 'Booking không còn ở trạng thái chờ xác nhận.' };
  b.status = 'cancelled';
  b.customerNote = reason ? `${b.customerNote ? `${b.customerNote} — ` : ''}Hộ từ chối: ${reason}` : b.customerNote;
  persist();
  notifyDataChanged('hostDemoBookings', 'updated');
  return { ok: true, booking: b };
}

export function proposeHostDemoBookingTime(id, newTime) {
  const b = findHostDemoBooking(id);
  if (!b || b.status !== 'pending') return { ok: false, reason: 'Booking không còn ở trạng thái chờ xác nhận.' };
  b.proposedTime = newTime;
  persist();
  notifyDataChanged('hostDemoBookings', 'updated');
  return { ok: true, booking: b };
}

export function completeHostDemoBooking(id) {
  const b = findHostDemoBooking(id);
  if (!b || b.status !== 'confirmed') return { ok: false, reason: 'Chỉ có thể đánh dấu hoàn thành cho booking đã xác nhận.' };
  b.status = 'completed';
  persist();
  notifyDataChanged('hostDemoBookings', 'updated');
  return { ok: true, booking: b };
}

export function markHostDemoBookingContacted(id) {
  const b = findHostDemoBooking(id);
  if (!b) return { ok: false, reason: 'Không tìm thấy booking.' };
  b.contactStatus = 'contacted';
  persist();
  notifyDataChanged('hostDemoBookings', 'updated');
  return { ok: true, booking: b };
}

function uidLocal(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}
