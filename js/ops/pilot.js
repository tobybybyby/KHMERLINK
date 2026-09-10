// Hồ sơ nội bộ 7 listing pilot Khmer — CHỈ hiển thị trong Cổng vận hành (không công khai cho
// khách ở Trail): readiness, supplier phù hợp, thông tin còn thiếu, cách tiếp cận đề xuất, rủi
// ro đạo đức/vận hành, checklist xác minh thực địa, nguồn thông tin, tình trạng quyền ảnh.
import { getState } from '../storage.js';
import { escapeHtml, listingTypeBadge } from '../utils.js';
import { PilotSuppliersService } from '../services/pilotSuppliersService.js';

function readinessBadgeClass(readiness) {
  const map = {
    'Ý tưởng sản phẩm': 'badge-demo',
    'Chờ liên hệ supplier': 'badge-demo',
    'Chờ khảo sát': 'badge-type',
    'Chờ duyệt nội dung': 'badge-type',
    'Sẵn sàng pilot': 'badge-new',
    'Đang tạm dừng': 'badge-recognized',
    'Được công khai': 'badge-free',
  };
  return map[readiness] || 'badge-type';
}

function supplierCardHtml(sup) {
  const loc = sup.preciseLocationInternal;
  return `
    <div class="activity-card">
      <div class="activity-card__head">
        <strong>${escapeHtml(sup.name)}</strong>
        <span class="badge badge-type">${escapeHtml(sup.bookableReady || 'Chưa xác minh')}</span>
      </div>
      <p class="text-sm text-muted" style="margin:2px 0;">${escapeHtml(sup.role)} · ${escapeHtml(sup.location || '')}</p>
      <p class="text-sm" style="margin:4px 0;"><strong>Bằng chứng:</strong> ${escapeHtml(sup.evidence || '—')}</p>
      <p class="text-sm" style="margin:2px 0;"><strong>Thông tin còn thiếu:</strong> ${escapeHtml(sup.missingInfo || '—')}</p>
      <p class="text-sm" style="margin:2px 0;"><strong>Cách tiếp cận đề xuất:</strong> ${escapeHtml(sup.approach || '—')}</p>
      <p class="text-sm" style="margin:2px 0;color:var(--color-danger);"><strong>Rủi ro:</strong> ${escapeHtml(sup.risks || '—')}</p>
      ${sup.source ? `<p class="text-sm text-faint" style="margin:4px 0 0;"><a href="${escapeHtml(sup.source)}" target="_blank" rel="noopener noreferrer">Nguồn</a></p>` : ''}
      ${loc ? `
        <div class="demo-note" style="margin-top:6px;border:1px solid var(--color-danger);">
          🔒 <strong>Toạ độ chính xác — KHÔNG CÔNG KHAI:</strong> ${loc.lat}, ${loc.lng}<br>
          <span class="text-sm">${escapeHtml(loc.note || '')}</span><br>
          <span class="text-sm" style="color:var(--color-danger);">${escapeHtml(loc.reason || '')}</span>
        </div>
      ` : ''}
    </div>
  `;
}

function listingCardHtml(listing, suppliersById) {
  const typeBadge = listingTypeBadge(listing.listingType);
  const suppliers = (listing.supplierRefs || []).map((id) => suppliersById[id]).filter(Boolean);
  const imageRightsNote = listing.imageRef
    ? 'Ảnh đại diện là URL tham khảo từ Excel, CHƯA tải về/CHƯA xác nhận quyền sử dụng thương mại (xem trường representativeImage).'
    : 'Chưa có ảnh đại diện.';

  return `
    <details class="card" style="padding:16px;">
      <summary style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <span><strong>${escapeHtml(listing.id)}</strong> — ${escapeHtml(listing.name)}</span>
        <span class="badge-row" style="margin:0;">
          <span class="badge ${typeBadge.cls}">${escapeHtml(typeBadge.label)}</span>
          <span class="badge ${readinessBadgeClass(listing.readiness)}">${escapeHtml(listing.readiness || '—')}</span>
        </span>
      </summary>
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:10px;">
        <p class="text-sm text-muted" style="margin:0;">${escapeHtml(listing.status || '')}</p>

        <div>
          <h4 style="margin:0 0 4px;">Địa chỉ & toạ độ</h4>
          <p class="text-sm" style="margin:0;">📍 ${escapeHtml(listing.address || 'Chưa có')}</p>
          ${listing.addressConflictNote ? `<p class="text-sm" style="margin:4px 0 0;color:var(--color-danger);">⚠️ ${escapeHtml(listing.addressConflictNote)}</p>` : ''}
          ${listing.coordinateNote ? `<p class="text-sm text-faint" style="margin:4px 0 0;">${escapeHtml(listing.coordinateNote)}</p>` : ''}
          ${(listing.stops || []).some((s) => s.coordinateNote) ? `
            <div style="margin-top:4px;">
              ${(listing.stops || []).filter((s) => s.coordinateNote).map((s) => `<p class="text-sm text-faint" style="margin:2px 0;"><strong>${escapeHtml(s.label || '')}:</strong> ${escapeHtml(s.coordinateNote)}</p>`).join('')}
            </div>
          ` : ''}
        </div>

        <div>
          <h4 style="margin:0 0 4px;">Supplier phù hợp</h4>
          ${suppliers.length
            ? `<div class="flex-col gap-2">${suppliers.map(supplierCardHtml).join('')}</div>`
            : '<p class="text-sm text-faint" style="margin:0;">Chưa gắn supplier nào.</p>'}
        </div>

        <div>
          <h4 style="margin:0 0 4px;">Checklist xác minh thực địa</h4>
          ${listing.verificationChecklist && listing.verificationChecklist.length
            ? `<ul style="padding-left:18px;margin:0;">${listing.verificationChecklist.map((c) => `<li class="text-sm">${escapeHtml(c)}</li>`).join('')}</ul>`
            : '<p class="text-sm text-faint" style="margin:0;">Không có mục checklist.</p>'}
        </div>

        <div>
          <h4 style="margin:0 0 4px;">Nguồn thông tin</h4>
          ${listing.informationSourcesFull && listing.informationSourcesFull.length
            ? `<table class="admin-table"><thead><tr><th>Nguồn</th><th>Thông tin dùng</th><th>Ngày</th><th>Độ tin cậy</th><th>Ghi chú sử dụng</th></tr></thead><tbody>
                ${listing.informationSourcesFull.map((s) => `
                  <tr>
                    <td><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.sourceType || s.url)}</a></td>
                    <td>${escapeHtml(s.infoUsed || '—')}</td>
                    <td>${escapeHtml(s.dateOfSource || '—')}</td>
                    <td>${escapeHtml(s.reliability || '—')}</td>
                    <td>${escapeHtml(s.usageNote || '—')}</td>
                  </tr>
                `).join('')}
              </tbody></table>`
            : '<p class="text-sm text-faint" style="margin:0;">Không có nguồn.</p>'}
        </div>

        <p class="text-sm text-faint" style="margin:0;">🖼️ ${escapeHtml(imageRightsNote)}</p>
        ${listing.conclusionNote ? `<p class="demo-note" style="margin:0;">${escapeHtml(listing.conclusionNote)}</p>` : ''}
      </div>
    </details>
  `;
}

export function renderOpsPilot(container) {
  const state = getState();
  const listings = state.destinations;

  container.innerHTML = `
    <div>
      <h1 style="margin-bottom:4px;">Pilot Khmer — hồ sơ nội bộ</h1>
      <p class="text-sm text-muted">Readiness, supplier, checklist xác minh và nguồn thông tin cho 7 listing pilot — CHỈ hiển thị ở đây, không công khai cho khách ở Trail. Không công khai địa chỉ chính xác của nhà riêng hoặc thông tin liên hệ cá nhân khi chưa có đồng thuận.</p>
    </div>
    <div class="quick-facts" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">
      <div class="quick-fact"><span class="quick-fact__label">Tổng listing</span><span class="quick-fact__value">${listings.length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Trải nghiệm cần pilot</span><span class="quick-fact__value">${listings.filter((l) => l.listingType === 'experience' || l.listingType === 'multiStopExperience').length}</span></div>
      <div class="quick-fact"><span class="quick-fact__label">Điểm/cụm có thật</span><span class="quick-fact__value">${listings.filter((l) => l.listingType === 'site' || l.listingType === 'cluster').length}</span></div>
    </div>
    <div class="flex-col gap-3" id="pilot-listing-list">
      <p class="text-sm text-faint">Đang tải hồ sơ supplier…</p>
    </div>
  `;

  PilotSuppliersService.loadPilotSuppliers().then((suppliers) => {
    const suppliersById = {};
    suppliers.forEach((s) => { suppliersById[s.id] = s; });
    const wrap = container.querySelector('#pilot-listing-list');
    if (!wrap) return;
    wrap.innerHTML = listings.map((l) => listingCardHtml(l, suppliersById)).join('')
      || '<p class="text-sm text-faint">Chưa có listing nào.</p>';
  });
}
