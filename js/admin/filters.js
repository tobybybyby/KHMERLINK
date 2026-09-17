// Bộ lọc dùng chung cho Cổng dữ liệu quản lý — áp dụng đồng bộ cho KPI, biểu đồ, bảng và
// CSV xuất trên các trang admin/*.js (state module-level, không lưu localStorage vì chỉ là
// tuỳ chọn hiển thị trong phiên xem dashboard, không phải dữ liệu nghiệp vụ).
//
// Các lựa chọn Đơn vị cung cấp/Listing/Loại hình/Financial mode/Trạng thái hoạt động/Khu vực là
// CASCADING (faceted): options của mỗi filter tính từ các filter CÒN LẠI (không tính chính nó) —
// chọn 1 listing sẽ tự thu hẹp provider/loại hình/financial mode tương ứng, và ngược lại. "Khoảng
// thời gian"/"Nhóm khách"/"Trạng thái booking" không tham gia cascading vì không phải thuộc tính
// của listing (thời gian là trục biểu đồ, nhóm khách/trạng thái booking là thuộc tính của từng
// booking cụ thể, không phải của listing).
import { escapeHtml, categoryGroup, categoryGroupLabel } from '../utils.js';
import { getOperations } from '../services/operationsService.js';
import { t, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('management', {
  filters: {
    financialMode: { community_paid: 'Cộng đồng có phí', public_ticket: 'Vé tham quan', free_visit: 'Miễn phí' },
    activityStatus: { published: 'Đã công bố', pending_review: 'Chờ duyệt', draft: 'Nháp', paused: 'Tạm dừng' },
    bookingStatus: { pending: 'Chờ xác nhận', accepted: 'Đã xác nhận', completed: 'Đã hoàn thành', rejected: 'Bị từ chối', cancelled: 'Đã huỷ' },
    dateRange: 'Khoảng thời gian',
    last3: '3 tháng qua',
    last6: '6 tháng qua',
    last12: '12 tháng qua',
    listing: 'Listing',
    allListings: 'Tất cả listing',
    type: 'Loại hình',
    allTypes: 'Tất cả loại hình',
    provider: 'Đơn vị cung cấp',
    allProviders: 'Tất cả đơn vị',
    financialModeLabel: 'Financial mode',
    all: 'Tất cả',
    activityStatusLabel: 'Trạng thái hoạt động',
    region: 'Khu vực',
    allRegions: 'Tất cả khu vực',
    partyType: 'Nhóm khách',
    solo: 'Đi một mình',
    group: 'Đi theo nhóm',
    bookingStatusLabel: 'Trạng thái booking',
    matchCount: '{count} listing phù hợp với bộ lọc hiện tại',
    noMatch: 'Không có listing nào khớp bộ lọc hiện tại — thử bỏ bớt điều kiện lọc.',
    chipListing: 'Listing: {name}',
    chipProvider: 'Đơn vị: {name}',
    chipType: 'Loại hình: {value}',
    chipFinancial: 'Tài chính: {value}',
    chipStatus: 'Trạng thái: {value}',
    chipRegion: 'Khu vực: {value}',
    chipParty: 'Nhóm khách: {value}',
    chipBooking: 'Booking: {value}',
    clearAll: 'Xoá tất cả bộ lọc',
  },
}, {
  filters: {
    financialMode: { community_paid: 'Paid Community', public_ticket: 'Visitor Ticket', free_visit: 'Free' },
    activityStatus: { published: 'Published', pending_review: 'Pending Review', draft: 'Draft', paused: 'Paused' },
    bookingStatus: { pending: 'Pending', accepted: 'Confirmed', completed: 'Completed', rejected: 'Rejected', cancelled: 'Cancelled' },
    dateRange: 'Date range',
    last3: 'Last 3 months',
    last6: 'Last 6 months',
    last12: 'Last 12 months',
    listing: 'Listing',
    allListings: 'All listings',
    type: 'Type',
    allTypes: 'All types',
    provider: 'Provider',
    allProviders: 'All providers',
    financialModeLabel: 'Financial mode',
    all: 'All',
    activityStatusLabel: 'Activity status',
    region: 'Region',
    allRegions: 'All regions',
    partyType: 'Guest group',
    solo: 'Solo',
    group: 'Group',
    bookingStatusLabel: 'Booking status',
    matchCount: '{count} listings match the current filters',
    noMatch: 'No listings match the current filters — try removing some conditions.',
    chipListing: 'Listing: {name}',
    chipProvider: 'Provider: {name}',
    chipType: 'Type: {value}',
    chipFinancial: 'Financial: {value}',
    chipStatus: 'Status: {value}',
    chipRegion: 'Region: {value}',
    chipParty: 'Guest group: {value}',
    chipBooking: 'Booking: {value}',
    clearAll: 'Clear all filters',
  },
});

export const adminFilters = {
  months: 12, region: '', group: '', partyType: '',
  listingId: '', providerId: '', financialMode: '', activityStatus: '', bookingStatus: '',
};

const CASCADE_KEYS = ['region', 'group', 'listingId', 'providerId', 'financialMode', 'activityStatus'];

function financialModeLabel(v) { return t(`management.filters.financialMode.${v}`) || v; }
function activityStatusLabel(v) { return t(`management.filters.activityStatus.${v}`) || v; }
function bookingStatusLabel(v) { return t(`management.filters.bookingStatus.${v}`) || v; }

export function getAllRegions(state) {
  return Array.from(new Set(state.destinations.map((d) => d.region).filter(Boolean))).sort();
}

export function getAllGroups(state) {
  return Array.from(new Set(state.destinations.map((d) => categoryGroup(d.category)))).sort();
}

/** 1 bản ghi/listing gộp đủ thuộc tính cascading cần — nguồn DUY NHẤT cho cả việc tính options
 * khả dụng LẪN việc lọc scope thật (destinationInScope) để 2 việc không bao giờ lệch nhau. */
function buildListingRecords(state) {
  return state.destinations.map((d) => {
    const ops = getOperations(d.id) || {};
    const providerIds = [ops.providerAccountId, ...(ops.partnerProviderIds || [])].filter(Boolean);
    return {
      destId: d.id,
      name: localizedDestinationName(d),
      region: d.region || null,
      group: categoryGroup(d.category),
      financialMode: ops.financialMode || null,
      activityStatus: ops.publicationStatus || null,
      providerIds,
    };
  });
}

function recordMatchesFilters(rec, filters) {
  if (filters.region && rec.region !== filters.region) return false;
  if (filters.group && rec.group !== filters.group) return false;
  if (filters.listingId && rec.destId !== filters.listingId) return false;
  if (filters.providerId && !rec.providerIds.includes(filters.providerId)) return false;
  if (filters.financialMode && rec.financialMode !== filters.financialMode) return false;
  if (filters.activityStatus && rec.activityStatus !== filters.activityStatus) return false;
  return true;
}

/** Đúng nguyên tắc "mỗi filter tính options dựa trên tất cả filter còn lại, ngoại trừ chính nó". */
function getCompatibleRecords(records, filters, targetKey) {
  const filtersExceptTarget = { ...filters, [targetKey]: '' };
  return records.filter((r) => recordMatchesFilters(r, filtersExceptTarget));
}

function getAvailableOptions(state, filters, targetKey) {
  const records = buildListingRecords(state);
  const compatible = getCompatibleRecords(records, filters, targetKey);
  if (targetKey === 'providerId') {
    const ids = new Set();
    compatible.forEach((r) => r.providerIds.forEach((id) => ids.add(id)));
    return state.hosts.filter((h) => ids.has(h.id)).map((h) => ({ value: h.id, label: h.name }));
  }
  if (targetKey === 'listingId') {
    return compatible.map((r) => ({ value: r.destId, label: r.name }));
  }
  if (targetKey === 'financialMode') {
    return Array.from(new Set(compatible.map((r) => r.financialMode).filter(Boolean)))
      .map((v) => ({ value: v, label: financialModeLabel(v) }));
  }
  if (targetKey === 'activityStatus') {
    return Array.from(new Set(compatible.map((r) => r.activityStatus).filter(Boolean)))
      .map((v) => ({ value: v, label: activityStatusLabel(v) }));
  }
  if (targetKey === 'group') {
    return Array.from(new Set(compatible.map((r) => r.group).filter(Boolean))).sort().map((v) => ({ value: v, label: categoryGroupLabel(v) }));
  }
  if (targetKey === 'region') {
    return Array.from(new Set(compatible.map((r) => r.region).filter(Boolean))).sort().map((v) => ({ value: v, label: v }));
  }
  return [];
}

/** Tự xoá lựa chọn không còn hợp lệ sau khi 1 filter khác đổi — chạy vài lượt tới khi ổn định (bộ
 * dữ liệu rất nhỏ — 7 listing — nên luôn hội tụ sau 1-2 lượt, chặn ở 5 lượt để tránh vòng lặp lỗi
 * logic tương lai). Không bao giờ để lựa chọn đang chọn dẫn tới 0 kết quả mà người dùng không rõ
 * vì sao — thay vào đó tự làm sạch rồi mới render. */
function reconcileFilters(state) {
  for (let pass = 0; pass < 5; pass += 1) {
    let changed = false;
    CASCADE_KEYS.forEach((key) => {
      const current = adminFilters[key];
      if (!current) return;
      const options = getAvailableOptions(state, adminFilters, key);
      if (!options.some((o) => o.value === current)) {
        adminFilters[key] = '';
        changed = true;
      }
    });
    if (!changed) break;
  }
}

export function destinationInScope(dest) {
  if (!dest) return false;
  if (adminFilters.region && dest.region !== adminFilters.region) return false;
  if (adminFilters.group && categoryGroup(dest.category) !== adminFilters.group) return false;
  if (adminFilters.listingId && dest.id !== adminFilters.listingId) return false;
  if (adminFilters.financialMode || adminFilters.activityStatus) {
    const ops = getOperations(dest.id) || {};
    if (adminFilters.financialMode && ops.financialMode !== adminFilters.financialMode) return false;
    if (adminFilters.activityStatus && ops.publicationStatus !== adminFilters.activityStatus) return false;
  }
  return true;
}

export function providerInScope(state, providerId) {
  if (!adminFilters.providerId) return true;
  return providerId === adminFilters.providerId;
}

function itineraryPartyType(itinerary) {
  if (!itinerary) return null;
  return itinerary.partySize > 1 ? 'nhom' : 'mot-minh';
}

export function bookingItemPartyType(state, bi) {
  const booking = state.bookings.find((b) => b.id === bi.bookingId);
  const itin = booking && booking.itineraryId ? state.itineraries.find((i) => i.id === booking.itineraryId) : null;
  return itineraryPartyType(itin);
}

/** Danh sách destination đang trong phạm vi lọc (khu vực + loại hình + listing + financial mode +
 * trạng thái hoạt động). */
export function getScopedDestinations(state) {
  return state.destinations.filter(destinationInScope);
}

/** Danh sách hostId có destination trong phạm vi lọc VÀ khớp filter Đơn vị cung cấp (nếu có). */
export function getScopedHostIds(state) {
  const scopedDestIds = new Set(getScopedDestinations(state).map((d) => d.id));
  return state.hosts.filter((h) => scopedDestIds.has(h.destinationId) && providerInScope(state, h.id)).map((h) => h.id);
}

/** bookingItems trong phạm vi lọc (khu vực + loại hình + nhóm khách + trạng thái booking). Không
 * lọc theo thời gian — "months" áp dụng cho các dãy 12 tháng mô phỏng (data/pilot-seed-data.js,
 * qua networkMetrics.js), vì bookingItems thật hầu như luôn phát sinh "ngay bây giờ" nên lọc theo
 * tháng không có ý nghĩa ở đây. */
export function getScopedBookingItems(state) {
  const destById = new Map(state.destinations.map((d) => [d.id, d]));
  return state.bookingItems.filter((bi) => {
    if (!destinationInScope(destById.get(bi.destinationId))) return false;
    if (adminFilters.partyType && bookingItemPartyType(state, bi) !== adminFilters.partyType) return false;
    if (adminFilters.bookingStatus && bi.status !== adminFilters.bookingStatus) return false;
    return true;
  });
}

function selectFieldHtml(id, label, currentValue, options, allLabel) {
  return `
    <div class="mdash-filterbar__field">
      <label for="${id}">${escapeHtml(label)}</label>
      <select id="${id}">
        <option value="">${escapeHtml(allLabel)}</option>
        ${options.map((o) => `<option value="${escapeHtml(o.value)}" ${currentValue === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
      </select>
    </div>
  `;
}

function activeChipsHtml(state) {
  const chips = [];
  const listingOpt = adminFilters.listingId ? state.destinations.find((d) => d.id === adminFilters.listingId) : null;
  if (listingOpt) chips.push({ key: 'listingId', label: t('management.filters.chipListing', { name: localizedDestinationName(listingOpt) }) });
  const providerOpt = adminFilters.providerId ? state.hosts.find((h) => h.id === adminFilters.providerId) : null;
  if (providerOpt) chips.push({ key: 'providerId', label: t('management.filters.chipProvider', { name: providerOpt.name }) });
  if (adminFilters.group) chips.push({ key: 'group', label: t('management.filters.chipType', { value: categoryGroupLabel(adminFilters.group) }) });
  if (adminFilters.financialMode) chips.push({ key: 'financialMode', label: t('management.filters.chipFinancial', { value: financialModeLabel(adminFilters.financialMode) }) });
  if (adminFilters.activityStatus) chips.push({ key: 'activityStatus', label: t('management.filters.chipStatus', { value: activityStatusLabel(adminFilters.activityStatus) }) });
  if (adminFilters.region) chips.push({ key: 'region', label: t('management.filters.chipRegion', { value: adminFilters.region }) });
  if (adminFilters.partyType) chips.push({ key: 'partyType', label: t('management.filters.chipParty', { value: adminFilters.partyType === 'nhom' ? t('management.filters.group') : t('management.filters.solo') }) });
  if (adminFilters.bookingStatus) chips.push({ key: 'bookingStatus', label: t('management.filters.chipBooking', { value: bookingStatusLabel(adminFilters.bookingStatus) }) });
  if (!chips.length) return '';
  return `
    <div class="mdash-chip-row">
      ${chips.map((c) => `<button type="button" class="mdash-chip" data-remove-filter="${c.key}">${escapeHtml(c.label)} ✕</button>`).join('')}
    </div>
  `;
}

export function filterBarHtml(state) {
  reconcileFilters(state);
  const regionOptions = getAvailableOptions(state, adminFilters, 'region');
  const groupOptions = getAvailableOptions(state, adminFilters, 'group');
  const listingOptions = getAvailableOptions(state, adminFilters, 'listingId');
  const providerOptions = getAvailableOptions(state, adminFilters, 'providerId');
  const financialModeOptions = getAvailableOptions(state, adminFilters, 'financialMode');
  const activityStatusOptions = getAvailableOptions(state, adminFilters, 'activityStatus');
  const matchCount = getScopedDestinations(state).length;

  return `
    <div class="mdash-filterbar">
      <div class="mdash-filterbar__row">
        <div class="mdash-filterbar__field">
          <label for="af-months">${t('management.filters.dateRange')}</label>
          <select id="af-months">
            <option value="3" ${adminFilters.months === 3 ? 'selected' : ''}>${t('management.filters.last3')}</option>
            <option value="6" ${adminFilters.months === 6 ? 'selected' : ''}>${t('management.filters.last6')}</option>
            <option value="12" ${adminFilters.months === 12 ? 'selected' : ''}>${t('management.filters.last12')}</option>
          </select>
        </div>
        ${selectFieldHtml('af-listing', t('management.filters.listing'), adminFilters.listingId, listingOptions, t('management.filters.allListings'))}
        ${selectFieldHtml('af-group', t('management.filters.type'), adminFilters.group, groupOptions, t('management.filters.allTypes'))}
        ${selectFieldHtml('af-provider', t('management.filters.provider'), adminFilters.providerId, providerOptions, t('management.filters.allProviders'))}
        ${selectFieldHtml('af-financial', t('management.filters.financialModeLabel'), adminFilters.financialMode, financialModeOptions, t('management.filters.all'))}
        ${selectFieldHtml('af-activity-status', t('management.filters.activityStatusLabel'), adminFilters.activityStatus, activityStatusOptions, t('management.filters.all'))}
        ${selectFieldHtml('af-region', t('management.filters.region'), adminFilters.region, regionOptions, t('management.filters.allRegions'))}
        <div class="mdash-filterbar__field">
          <label for="af-party">${t('management.filters.partyType')}</label>
          <select id="af-party">
            <option value="">${t('management.filters.all')}</option>
            <option value="mot-minh" ${adminFilters.partyType === 'mot-minh' ? 'selected' : ''}>${t('management.filters.solo')}</option>
            <option value="nhom" ${adminFilters.partyType === 'nhom' ? 'selected' : ''}>${t('management.filters.group')}</option>
          </select>
        </div>
        <div class="mdash-filterbar__field">
          <label for="af-booking-status">${t('management.filters.bookingStatusLabel')}</label>
          <select id="af-booking-status">
            <option value="">${t('management.filters.all')}</option>
            ${['pending', 'accepted', 'completed', 'rejected', 'cancelled'].map((v) => `<option value="${v}" ${adminFilters.bookingStatus === v ? 'selected' : ''}>${escapeHtml(bookingStatusLabel(v))}</option>`).join('')}
          </select>
        </div>
      </div>
      ${activeChipsHtml(state)}
      <div class="mdash-filterbar__meta">
        <span>${t('management.filters.matchCount', { count: matchCount })}</span>
        <button type="button" class="mdash-filterbar__clear" id="af-clear-all">${t('management.filters.clearAll')}</button>
      </div>
      ${matchCount === 0 ? `<p class="text-sm" style="margin:0;color:var(--color-danger);">${t('management.filters.noMatch')}</p>` : ''}
    </div>
  `;
}

export function wireFilterBar(container, onChange) {
  const bind = (id, key, parse) => {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('change', () => {
      adminFilters[key] = parse(el.value);
      onChange();
    });
  };
  bind('af-months', 'months', (v) => Number(v));
  bind('af-region', 'region', (v) => v);
  bind('af-group', 'group', (v) => v);
  bind('af-party', 'partyType', (v) => v);
  bind('af-listing', 'listingId', (v) => v);
  bind('af-provider', 'providerId', (v) => v);
  bind('af-financial', 'financialMode', (v) => v);
  bind('af-activity-status', 'activityStatus', (v) => v);
  bind('af-booking-status', 'bookingStatus', (v) => v);

  container.querySelectorAll('[data-remove-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      adminFilters[btn.dataset.removeFilter] = btn.dataset.removeFilter === 'months' ? 12 : '';
      onChange();
    });
  });
  const clearAllBtn = container.querySelector('#af-clear-all');
  clearAllBtn?.addEventListener('click', () => {
    adminFilters.months = 12;
    adminFilters.region = ''; adminFilters.group = ''; adminFilters.partyType = '';
    adminFilters.listingId = ''; adminFilters.providerId = ''; adminFilters.financialMode = '';
    adminFilters.activityStatus = ''; adminFilters.bookingStatus = '';
    onChange();
  });
}
