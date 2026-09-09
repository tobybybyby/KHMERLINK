export function renderWelcome(container) {
  container.innerHTML = `
    <div class="welcome-page">
      <div>
        <div style="font-size:2.6rem;">🌾</div>
        <h1>Vĩnh Long — Chạm văn hóa, nối hành trình</h1>
        <p style="opacity:0.85;max-width:480px;margin:0 auto;">Khám phá, kết nối và trải nghiệm cùng cộng đồng du lịch địa phương. Bản demo trình diễn — dữ liệu lưu trên trình duyệt của bạn.</p>
      </div>
      <div class="welcome-choices">
        <a class="welcome-choice" href="#/trail/explore">
          <strong>🧭 Tôi là du khách</strong>
          <span class="text-sm" style="opacity:0.8;">Khám phá địa điểm, tạo hành trình, đặt trải nghiệm</span>
        </a>
        <a class="welcome-choice" href="#/studio">
          <strong>🏡 Tôi cung cấp trải nghiệm</strong>
          <span class="text-sm" style="opacity:0.8;">Dành cho hộ dân, nghệ nhân, đơn vị du lịch</span>
        </a>
      </div>
      <a class="welcome-gateway-link" href="#/gateway">Cổng quản lý →</a>
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
