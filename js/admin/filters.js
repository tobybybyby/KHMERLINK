// Bộ lọc dùng chung cho Cổng dữ liệu quản lý — áp dụng đồng bộ cho KPI, biểu đồ, bảng và
// CSV xuất trên các trang admin/*.js (state module-level, không lưu localStorage vì chỉ là
// tuỳ chọn hiển thị trong phiên xem dashboard, không phải dữ liệu nghiệp vụ).
import { escapeHtml, categoryGroup } from '../utils.js';

export const adminFilters = {
  months: 12, region: '', group: '', partyType: '',
  listingId: '', providerId: '',
};

export function getAllRegions(state) {
  return Array.from(new Set(state.destinations.map((d) => d.region).filter(Boolean))).sort();
}

export function getAllGroups(state) {
  return Array.from(new Set(state.destinations.map((d) => categoryGroup(d.category)))).sort();
}

export function destinationInScope(dest) {
  if (!dest) return false;
  if (adminFilters.region && dest.region !== adminFilters.region) return false;
  if (adminFilters.group && categoryGroup(dest.category) !== adminFilters.group) return false;
  if (adminFilters.listingId && dest.id !== adminFilters.listingId) return false;
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

/** Danh sách destination đang trong phạm vi lọc (khu vực + loại hình). */
export function getScopedDestinations(state) {
  return state.destinations.filter(destinationInScope);
}

/** Danh sách hostId có destination trong phạm vi lọc. */
export function getScopedHostIds(state) {
  const scopedDestIds = new Set(getScopedDestinations(state).map((d) => d.id));
  return state.hosts.filter((h) => scopedDestIds.has(h.destinationId)).map((h) => h.id);
}

/** bookingItems trong phạm vi lọc (khu vực + loại hình + nhóm khách). Không lọc theo thời gian
 * — "months" áp dụng cho các dãy 12 tháng mô phỏng (data/pilot-seed-data.js, qua networkMetrics.js),
 * vì bookingItems thật trong bản demo hầu như luôn phát sinh "ngay bây giờ" nên lọc theo tháng
 * không có ý nghĩa ở đây. */
export function getScopedBookingItems(state) {
  const destById = new Map(state.destinations.map((d) => [d.id, d]));
  return state.bookingItems.filter((bi) => {
    if (!destinationInScope(destById.get(bi.destinationId))) return false;
    if (adminFilters.partyType) {
      if (bookingItemPartyType(state, bi) !== adminFilters.partyType) return false;
    }
    return true;
  });
}

export function filterBarHtml(state) {
  const regions = getAllRegions(state);
  const groups = getAllGroups(state);
  return `
    <div class="card admin-filterbar" style="padding:14px 16px;">
      <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
        <div>
          <label class="field-label" for="af-months">Thời gian (xu hướng tháng)</label>
          <select class="field-select" id="af-months">
            <option value="3" ${adminFilters.months === 3 ? 'selected' : ''}>3 tháng qua</option>
            <option value="6" ${adminFilters.months === 6 ? 'selected' : ''}>6 tháng qua</option>
            <option value="12" ${adminFilters.months === 12 ? 'selected' : ''}>12 tháng qua</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="af-listing">Listing</label>
          <select class="field-select" id="af-listing">
            <option value="">Tất cả listing</option>
            ${state.destinations.map((d) => `<option value="${escapeHtml(d.id)}" ${adminFilters.listingId === d.id ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="af-group">Loại hình</label>
          <select class="field-select" id="af-group">
            <option value="">Tất cả loại hình</option>
            ${groups.map((g) => `<option value="${escapeHtml(g)}" ${adminFilters.group === g ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="af-provider">Đơn vị cung cấp</label>
          <select class="field-select" id="af-provider">
            <option value="">Tất cả đơn vị</option>
            ${state.hosts.map((h) => `<option value="${escapeHtml(h.id)}" ${adminFilters.providerId === h.id ? 'selected' : ''}>${escapeHtml(h.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="af-region">Địa bàn</label>
          <select class="field-select" id="af-region">
            <option value="">Tất cả khu vực</option>
            ${regions.map((r) => `<option value="${escapeHtml(r)}" ${adminFilters.region === r ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="af-party">Nhóm khách</label>
          <select class="field-select" id="af-party">
            <option value="">Tất cả</option>
            <option value="mot-minh" ${adminFilters.partyType === 'mot-minh' ? 'selected' : ''}>Đi một mình</option>
            <option value="nhom" ${adminFilters.partyType === 'nhom' ? 'selected' : ''}>Đi theo nhóm</option>
          </select>
        </div>
      </div>
      <p class="text-sm text-faint" style="margin:8px 0 0;">Bộ lọc áp dụng đồng bộ cho KPI, biểu đồ, bảng và CSV xuất ở trang này. "Nhóm khách" chỉ xác định được với booking có gắn hành trình tạo qua form cá nhân hoá ở Trail — booking đặt trực tiếp không có nhãn nhóm khách.</p>
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
}
