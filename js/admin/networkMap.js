// Bản đồ mạng lưới cho Row 3 "Tổng quan" (Cổng dữ liệu quản lý) — hiển thị 7 listing pilot, kích
// thước/độ đậm marker theo số khách demand trong kỳ hiện tại (dùng lại đúng số liệu đã tính ở
// js/services/managementService.js#getCapacityUtilisation, không tạo công thức đếm khách riêng).
// Click marker gọi `onSelectListing(id)` — nơi gọi tự cập nhật adminFilters.listingId và render
// lại trang (cùng cơ chế với filter dropdown), bản đồ KHÔNG tự giữ state lọc riêng.
import { escapeHtml, categoryColor, categoryEmoji } from '../utils.js';
import { MapService } from '../services/mapService.js';
import { t, registerTranslations } from '../services/i18nService.js';
import { localizedDestinationName } from '../services/destinationsService.js';

registerTranslations('management', {
  networkMap: {
    guestsUnit: '{count} khách trong kỳ',
    mapLoadError: 'Không tải được bản đồ (mạng chặn CDN) — xem danh sách listing ở các bảng khác.',
  },
}, {
  networkMap: {
    guestsUnit: '{count} guests this period',
    mapLoadError: 'Could not load the map (network blocked the CDN) — see the listing tables elsewhere on this page.',
  },
});

let mapInstance = null;
let markerLayer = null;
let lastView = null; // { center: {lat,lng}, zoom } — giữ qua các lần render để filter change không giật zoom về mặc định.

export function destroyNetworkMap() {
  if (mapInstance) {
    try { mapInstance.remove(); } catch { /* container đã bị gỡ khỏi DOM — bỏ qua an toàn */ }
  }
  mapInstance = null;
  markerLayer = null;
}

/** `elId`: id của div rỗng đã có sẵn trong DOM (kích thước cố định qua CSS .mdash-map-wrap).
 * `destinations`: danh sách listing trong phạm vi lọc hiện tại (đã destinationInScope). */
export async function renderNetworkMap({ elId, destinations, guestsByListingId = {}, selectedListingId = null, onSelectListing }) {
  const el = document.getElementById(elId);
  if (!el) return;
  try {
    const L = await MapService.loadLeaflet();
    destroyNetworkMap();
    mapInstance = L.map(elId, { zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(mapInstance);
    markerLayer = L.layerGroup().addTo(mapInstance);

    const pins = destinations.filter((d) => d.lat !== null && d.lng !== null);
    pins.forEach((d) => {
      const guests = guestsByListingId[d.id] || 0;
      const radius = 7 + Math.min(16, Math.sqrt(guests) * 2.2);
      const color = categoryColor(d.category);
      const isSelected = selectedListingId === d.id;
      const dimmed = selectedListingId && !isSelected;
      const marker = L.circleMarker([d.lat, d.lng], {
        radius,
        color: isSelected ? '#2b2016' : '#fff',
        weight: isSelected ? 2.5 : 1.5,
        fillColor: color,
        fillOpacity: dimmed ? 0.28 : 0.85,
        opacity: dimmed ? 0.5 : 1,
      });
      marker.bindTooltip(
        `${escapeHtml(categoryEmoji(d.category))} <strong>${escapeHtml(localizedDestinationName(d))}</strong><br>${escapeHtml(t('management.networkMap.guestsUnit', { count: guests }))}`,
        { direction: 'top', offset: [0, -radius] },
      );
      marker.on('click', () => { if (onSelectListing) onSelectListing(d.id); });
      markerLayer.addLayer(marker);
    });

    if (lastView) {
      mapInstance.setView([lastView.center.lat, lastView.center.lng], lastView.zoom, { animate: false });
    } else if (pins.length) {
      mapInstance.fitBounds(L.latLngBounds(pins.map((d) => [d.lat, d.lng])), { padding: [22, 22], maxZoom: 13 });
    } else {
      mapInstance.setView([9.99, 106.1], 9);
    }
    mapInstance.on('moveend', () => {
      if (!mapInstance) return;
      lastView = { center: mapInstance.getCenter(), zoom: mapInstance.getZoom() };
    });
    setTimeout(() => mapInstance && mapInstance.invalidateSize(), 150);
  } catch {
    el.innerHTML = `<p class="text-sm text-faint" style="padding:12px;">${escapeHtml(t('management.networkMap.mapLoadError'))}</p>`;
  }
}

export const NetworkMap = { renderNetworkMap, destroyNetworkMap };
