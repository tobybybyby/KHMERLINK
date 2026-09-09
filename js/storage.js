import { createSeedState } from './data.js';
import { loadDestinations } from './services/destinationsService.js';

export const SCHEMA_VERSION = 2;
const STORAGE_KEY = 'vlt_user_state';

// Nội dung/catalog (destinations, hosts, experiences, events, reviews mẫu, metrics) được nạp
// lại mới mỗi lần khởi động — không lưu vào localStorage — để cập nhật data/destinations.json
// luôn có hiệu lực ngay, không cần người dùng "khôi phục dữ liệu mẫu". Chỉ dữ liệu do người
// dùng thao tác (yêu thích, hành trình nháp, booking...) mới được lưu.
const CONTENT_KEYS = ['destinations', 'hosts', 'experiences', 'slots', 'events', 'reviews', 'voucherCatalog', 'metrics'];

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

  // Trải nghiệm do hộ tạo/sửa trong Studio được lưu riêng ở hostExperiences (persist) và
  // hợp nhất đè lên bản "nội dung" (experiences, nạp mới mỗi phiên từ data.js) ở đây —
  // giống cách destinations.json hợp nhất với dữ liệu người dùng.
  (state.hostExperiences || []).forEach((hostExp) => {
    const idx = state.experiences.findIndex((e) => e.id === hostExp.id);
    if (idx >= 0) state.experiences[idx] = hostExp;
    else state.experiences.push(hostExp);
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

// ---------- Hành trình ----------
export function saveItinerary(itinerary) {
  const s = getState();
  const idx = s.itineraries.findIndex((it) => it.id === itinerary.id);
  if (idx >= 0) s.itineraries[idx] = itinerary;
  else s.itineraries.push(itinerary);
  persist();
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
export function addUserReview({ destinationId, bookingItemId, rating, comment, categories }) {
  const s = getState();
  if (s.userReviews.some((r) => r.bookingItemId === bookingItemId)) {
    return { ok: false, reason: 'Booking này đã được đánh giá.' };
  }
  const review = {
    id: uidLocal('urv'),
    destinationId,
    bookingItemId,
    author: 'Bạn',
    rating,
    categories: categories || {},
    comment,
    date: new Date().toISOString(),
  };
  s.userReviews.push(review);
  persist();
  return { ok: true, review };
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
}

// ---------- Studio: gợi ý cải thiện — trạng thái người dùng đã chọn cho từng gợi ý ----------
export function setSuggestionDecision(suggestionId, decision) {
  const s = getState();
  s.suggestionDecisions[suggestionId] = decision;
  persist();
}

// ---------- Studio: đề án hỗ trợ ----------
export function createProposal({ hostId, title, problem, desiredSupport, expectedBenefit, evidence, proposedBudget = null, status = 'sent' }) {
  const s = getState();
  const now = new Date().toISOString();
  const proposal = {
    id: uidLocal('proposal'),
    hostId,
    title,
    problem,
    desiredSupport,
    expectedBenefit,
    evidence,
    proposedBudget,
    status,
    createdAt: now,
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

export function setProposalStatus(id, status, note) {
  const s = getState();
  const p = s.proposals.find((x) => x.id === id);
  if (!p) return null;
  p.status = status;
  p.timeline.push({ status, at: new Date().toISOString(), note });
  persist();
  return p;
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

function uidLocal(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}
