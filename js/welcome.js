const FLOURISH_SVG = `
  <svg class="welcome-flourish" viewBox="0 0 400 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0 16 Q 25 4, 50 16 T 100 16 T 150 16 T 200 16 T 250 16 T 300 16 T 350 16 T 400 16" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="200" cy="16" r="3.5" fill="currentColor"/>
    <circle cx="150" cy="16" r="1.6" fill="currentColor" opacity="0.7"/>
    <circle cx="250" cy="16" r="1.6" fill="currentColor" opacity="0.7"/>
  </svg>
`;

// Hoạ tiết đường kẻ mảnh + mũi tên nhỏ hướng ra ngoài, đặt hai bên biểu tượng hoa sen — tự vẽ
// (không dùng emoji/ảnh ngoài) để tránh rủi ro bản quyền, nhất quán với favicon hoa sen sẵn có.
const SIDE_MARK_LEFT = `
  <svg width="72" height="14" viewBox="0 0 72 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="72" y1="7" x2="14" y2="7" stroke="currentColor" stroke-width="1"/>
    <path d="M14 7l7-5M14 7l7 5" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/>
  </svg>
`;
const SIDE_MARK_RIGHT = `
  <svg width="72" height="14" viewBox="0 0 72 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="7" x2="58" y2="7" stroke="currentColor" stroke-width="1"/>
    <path d="M58 7l-7-5M58 7l-7 5" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/>
  </svg>
`;
const LOTUS_ICON = `
  <svg class="welcome-lotus-icon" width="34" height="34" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M32 46c-9-4-14-10-14-17 3 3 8 5 14 5s11-2 14-5c0 7-5 13-14 17z"/>
    <path d="M32 34c-5-6-8-12-8-18 4 2 6 6 8 11 2-5 4-9 8-11 0 6-3 12-8 18z"/>
    <path d="M18 32c-4-3-7-7-8-12 3 1 6 3 8 6 1-3 1-5 0-8 3 2 5 5 5 9-1 2-3 4-5 5z"/>
    <path d="M46 32c4-3 7-7 8-12-3 1-6 3-8 6-1-3-1-5 0-8-3 2-5 5-5 9 1 2 3 4 5 5z"/>
  </svg>
`;
// Đường kẻ + hình thoi nhỏ — hoạ tiết chia đoạn dưới tagline và dưới link Cổng quản lý.
const DIAMOND_DIVIDER = `
  <svg class="welcome-divider" width="56" height="10" viewBox="0 0 56 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="1"/>
    <rect x="24" y="1.5" width="7" height="7" transform="rotate(45 27.5 5)" fill="currentColor"/>
    <line x1="35" y1="5" x2="56" y2="5" stroke="currentColor" stroke-width="1"/>
  </svg>
`;
const COMPASS_ICON = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M15.2 8.8l-2.4 5.6-5.6 2.4 2.4-5.6z" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
`;
const HOUSE_ICON = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 11.5L12 4l8 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.5 10v9.5h11V10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.5 19v-5.5h5V19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
const CHEVRON_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

export function renderWelcome(container) {
  container.innerHTML = `
    <div class="welcome-page welcome-page--hero">
      <div>
        <div class="welcome-top-mark">${SIDE_MARK_LEFT}${LOTUS_ICON}${SIDE_MARK_RIGHT}</div>
        <h1 class="welcome-title">KhmerLink</h1>
        <p class="welcome-subtitle">Chạm văn hóa, nối hành trình</p>
        ${DIAMOND_DIVIDER}
        <p class="welcome-tagline" style="margin:var(--space-3) auto 0;">Khám phá, kết nối và trải nghiệm cùng cộng đồng du lịch địa phương</p>
      </div>
      <nav class="welcome-choices" style="margin:0 auto;" aria-label="Chọn vai trò">
        <a class="welcome-choice" href="#/trail/explore">
          <span class="welcome-choice__icon">${COMPASS_ICON}</span>
          <span class="welcome-choice__body">
            <strong>Tôi là du khách</strong>
            <span class="text-sm">Khám phá địa điểm, tạo hành trình, đặt trải nghiệm</span>
          </span>
          <span class="welcome-choice__arrow">${CHEVRON_ICON}</span>
        </a>
        <a class="welcome-choice" href="#/studio">
          <span class="welcome-choice__icon">${HOUSE_ICON}</span>
          <span class="welcome-choice__body">
            <strong>Tôi cung cấp trải nghiệm</strong>
            <span class="text-sm">Dành cho hộ dân, nghệ nhân, đơn vị du lịch</span>
          </span>
          <span class="welcome-choice__arrow">${CHEVRON_ICON}</span>
        </a>
      </nav>
      <div>
        <a class="welcome-gateway-link" href="#/gateway">Cổng quản lý →</a>
        ${DIAMOND_DIVIDER}
      </div>
    </div>
  `;
}

export function renderGateway(container) {
  container.innerHTML = `
    <div class="welcome-page">
      <div>
        <h1 style="font-size:1.5rem;">Cổng quản lý (demo)</h1>
        <p style="opacity:0.85;">Dành cho cơ quan quản lý, đội vận hành và cố vấn cộng đồng — mỗi vai trò xem dữ liệu khác nhau theo đúng quyền hạn (vd: CPS chỉ vận hành xem được, không lộ cho cơ quan quản lý hay khách).</p>
      </div>
      <div class="gateway-list">
        <a class="gateway-item" href="#/admin">
          <strong>📊 Cổng dữ liệu quản lý</strong>
          <span class="text-sm text-muted">Tổng quan booking, luồng khách, nhu cầu, đề án, báo cáo</span>
        </a>
        <a class="gateway-item" href="#/ops">
          <strong>🛠️ Cổng vận hành</strong>
          <span class="text-sm text-muted">Booking & giao dịch, nội dung, sự cố, chất lượng & hỗ trợ hộ</span>
        </a>
        <a class="gateway-item" href="#/ops/community">
          <strong>🤝 Cố vấn cộng đồng</strong>
          <span class="text-sm text-muted">Hàng chờ duyệt văn hoá, xem xét ngoại lệ</span>
        </a>
      </div>
      <a class="welcome-gateway-link" href="#/">← Quay lại trang chào</a>
    </div>
  `;
}
