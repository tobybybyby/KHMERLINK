import { getState, resetSample, getPointsBalance } from '../storage.js';
import { qs } from '../utils.js';
import { confirmDialog } from '../ui.js';
import { NotificationService } from '../services/notificationService.js';
import { DEMO_DATA_NOTE } from '../../data/pilot-seed-data.js';

export function renderProfile(container) {
  const state = getState();
  const favCount = state.favorites.length;
  const draftCount = state.tripCart.length;
  const itineraryCount = state.itineraries.length;
  const points = getPointsBalance();

  container.innerHTML = `
    <div class="profile-page">
      <section class="card" style="padding:20px;">
        <h2 style="margin-top:0;">Cá nhân</h2>
        <p class="text-muted">Bản demo chưa có tài khoản thật — đây là hồ sơ dùng chung trên trình duyệt này.</p>
        <div class="flex gap-4 wrap" style="margin-top:12px;">
          <div><strong>${favCount}</strong> <span class="text-muted text-sm">địa điểm đã lưu</span></div>
          <div><strong>${draftCount}</strong> <span class="text-muted text-sm">trong giỏ hành trình</span></div>
          <div><strong>${itineraryCount}</strong> <span class="text-muted text-sm">hành trình</span></div>
          <div><strong>${points}</strong> <span class="text-muted text-sm">điểm thưởng</span></div>
        </div>
        <a class="btn btn-secondary btn-sm" href="#/trail/passport" style="margin-top:12px;">Xem Hộ chiếu du khách →</a>
        <a class="btn btn-secondary btn-sm" href="#/trail/notifications" style="margin-top:12px;">🔔 Thông báo & nhắc lịch →</a>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Ngôn ngữ</h3>
        <p class="text-sm text-muted">Hiện chỉ hỗ trợ Tiếng Việt. Tiếng Anh/Khmer sẽ bổ sung khi đủ nội dung được cộng đồng duyệt — chưa bật ở bản demo này để tránh hiển thị bản dịch chưa qua kiểm duyệt.</p>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Về bản demo</h3>
        <ul style="padding-left:18px;color:var(--color-text-muted);font-size:0.9rem;">
          <li>Dữ liệu lưu trong trình duyệt này (localStorage), không đồng bộ nhiều người dùng hay nhiều thiết bị.</li>
          <li>Gợi ý hành trình dùng thuật toán rule-based minh bạch (không gọi AI thật); thanh toán, mật độ khách, phản hồi của hộ đều là mô phỏng, gắn nhãn rõ khi xuất hiện.</li>
          <li>Ngoài Trail (bạn đang xem) còn có Studio (kênh dành cho hộ), Cổng dữ liệu quản lý và Cổng vận hành — mở qua liên kết "Cổng quản lý" ở trang chào, xem chi tiết ở PROGRESS.md.</li>
        </ul>
        <p class="text-sm text-faint" style="margin-top:10px;">${DEMO_DATA_NOTE} Chi tiết các giả định dữ liệu (giờ mở cửa, giá, đánh giá, doanh thu, lượt ghé) xem ở <code>DEMO_DATA.md</code> trong mã nguồn dự án.</p>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">Dữ liệu demo</h3>
        <p class="text-sm text-muted">Khôi phục lại toàn bộ dữ liệu người dùng (yêu thích, hành trình, booking, điểm thưởng, voucher, ticket hỗ trợ...) về trạng thái ban đầu. Thao tác này không thể hoàn tác.</p>
        <button type="button" class="btn btn-danger-ghost" id="reset-sample-btn">↺ Khôi phục dữ liệu mẫu</button>
      </section>
    </div>
  `;

  qs('#reset-sample-btn', container).addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Khôi phục dữ liệu mẫu?',
      message: 'Toàn bộ dữ liệu hiện tại trên trình duyệt này (yêu thích, hành trình nháp...) sẽ được thay bằng dữ liệu mẫu ban đầu. Không thể hoàn tác.',
      confirmLabel: 'Khôi phục',
      danger: true,
    });
    if (!ok) return;
    await resetSample();
    NotificationService.notify('Đã khôi phục dữ liệu mẫu.', 'success');
    renderProfile(container);
  });
}
