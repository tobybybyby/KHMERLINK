import { getState, resetSample, getPointsBalance } from '../storage.js';
import { qs } from '../utils.js';
import { confirmDialog } from '../ui.js';
import { NotificationService } from '../services/notificationService.js';
import { t, registerTranslations, languageSwitcherHtml, wireLanguageSwitchers } from '../services/i18nService.js';

registerTranslations('customer', {
  profile: {
    title: 'Cá nhân',
    demoNote: 'Bản demo chưa có tài khoản thật — đây là hồ sơ dùng chung trên trình duyệt này.',
    savedPlaces: 'địa điểm đã lưu',
    inTripCart: 'trong giỏ hành trình',
    trips: 'hành trình',
    rewardPoints: 'điểm thưởng',
    viewPassport: 'Xem Hộ chiếu du khách →',
    notificationsLink: '🔔 Thông báo & nhắc lịch →',
    languageTitle: 'Ngôn ngữ',
    languageDesc: 'Chọn Tiếng Việt hoặc English — áp dụng ngay cho toàn bộ nền tảng và được ghi nhớ cho lần truy cập sau.',
    aboutDemoTitle: 'Về bản demo',
    aboutDemoItem1: 'Dữ liệu lưu trong trình duyệt này (localStorage), không đồng bộ nhiều người dùng hay nhiều thiết bị.',
    aboutDemoItem2: 'Gợi ý hành trình dùng thuật toán rule-based minh bạch (không gọi AI thật); thanh toán, mật độ khách, phản hồi của hộ đều là mô phỏng, gắn nhãn rõ khi xuất hiện.',
    aboutDemoItem3: 'Ngoài Trail (bạn đang xem) còn có Studio (kênh dành cho hộ), Cổng dữ liệu quản lý và Cổng vận hành — mở qua liên kết "Cổng quản lý" ở trang chào.',
    demoDataTitle: 'Dữ liệu demo',
    demoDataDesc: 'Khôi phục lại toàn bộ dữ liệu người dùng (yêu thích, hành trình, booking, điểm thưởng, voucher, ticket hỗ trợ...) về trạng thái ban đầu. Thao tác này không thể hoàn tác.',
    resetBtn: '↺ Khôi phục dữ liệu mẫu',
    resetTitle: 'Khôi phục dữ liệu mẫu?',
    resetMsg: 'Toàn bộ dữ liệu hiện tại trên trình duyệt này (yêu thích, hành trình nháp...) sẽ được thay bằng dữ liệu mẫu ban đầu. Không thể hoàn tác.',
    resetConfirm: 'Khôi phục',
    resetDoneNotify: 'Đã khôi phục dữ liệu mẫu.',
  },
}, {
  profile: {
    title: 'Profile',
    demoNote: 'This demo does not have real accounts yet — this is a shared profile for this browser.',
    savedPlaces: 'saved places',
    inTripCart: 'in trip cart',
    trips: 'trips',
    rewardPoints: 'reward points',
    viewPassport: 'View Traveller Passport →',
    notificationsLink: '🔔 Notifications & Reminders →',
    languageTitle: 'Language',
    languageDesc: 'Choose Vietnamese or English — applies immediately across the whole platform and is remembered for next time.',
    aboutDemoTitle: 'About This Demo',
    aboutDemoItem1: 'Data is stored in this browser (localStorage), not synced across users or devices.',
    aboutDemoItem2: 'Trip suggestions use a transparent rule-based algorithm (no real AI call); payments, crowd density and provider feedback are all simulated and clearly labeled where shown.',
    aboutDemoItem3: 'Besides Trail (which you are viewing), there is also Studio (for providers), the Management Data Portal and the Operations Portal — opened via the "Management Portal" link on the home page.',
    demoDataTitle: 'Demo Data',
    demoDataDesc: 'Restores all user data (favourites, trips, bookings, reward points, vouchers, support tickets...) to its initial state. This action cannot be undone.',
    resetBtn: '↺ Restore Sample Data',
    resetTitle: 'Restore sample data?',
    resetMsg: 'All current data in this browser (favourites, draft trips...) will be replaced with the initial sample data. This cannot be undone.',
    resetConfirm: 'Restore',
    resetDoneNotify: 'Sample data restored.',
  },
});

export function renderProfile(container) {
  const state = getState();
  const favCount = state.favorites.length;
  const draftCount = state.tripCart.length;
  const itineraryCount = state.itineraries.length;
  const points = getPointsBalance();

  container.innerHTML = `
    <div class="profile-page">
      <section class="card" style="padding:20px;">
        <h2 style="margin-top:0;">${t('customer.profile.title')}</h2>
        <p class="text-muted">${t('customer.profile.demoNote')}</p>
        <div class="flex gap-4 wrap" style="margin-top:12px;">
          <div><strong>${favCount}</strong> <span class="text-muted text-sm">${t('customer.profile.savedPlaces')}</span></div>
          <div><strong>${draftCount}</strong> <span class="text-muted text-sm">${t('customer.profile.inTripCart')}</span></div>
          <div><strong>${itineraryCount}</strong> <span class="text-muted text-sm">${t('customer.profile.trips')}</span></div>
          <div><strong>${points}</strong> <span class="text-muted text-sm">${t('customer.profile.rewardPoints')}</span></div>
        </div>
        <a class="btn btn-secondary btn-sm" href="#/trail/passport" style="margin-top:12px;">${t('customer.profile.viewPassport')}</a>
        <a class="btn btn-secondary btn-sm" href="#/trail/notifications" style="margin-top:12px;">${t('customer.profile.notificationsLink')}</a>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('customer.profile.languageTitle')}</h3>
        <p class="text-sm text-muted" style="margin-bottom:10px;">${t('customer.profile.languageDesc')}</p>
        ${languageSwitcherHtml()}
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('customer.profile.aboutDemoTitle')}</h3>
        <ul style="padding-left:18px;color:var(--color-text-muted);font-size:0.9rem;">
          <li>${t('customer.profile.aboutDemoItem1')}</li>
          <li>${t('customer.profile.aboutDemoItem2')}</li>
          <li>${t('customer.profile.aboutDemoItem3')}</li>
        </ul>
      </section>

      <section class="card" style="padding:20px;">
        <h3 style="margin-top:0;">${t('customer.profile.demoDataTitle')}</h3>
        <p class="text-sm text-muted">${t('customer.profile.demoDataDesc')}</p>
        <button type="button" class="btn btn-danger-ghost" id="reset-sample-btn">${t('customer.profile.resetBtn')}</button>
      </section>
    </div>
  `;

  wireLanguageSwitchers(container);

  qs('#reset-sample-btn', container).addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: t('customer.profile.resetTitle'),
      message: t('customer.profile.resetMsg'),
      confirmLabel: t('customer.profile.resetConfirm'),
      danger: true,
    });
    if (!ok) return;
    await resetSample();
    NotificationService.notify(t('customer.profile.resetDoneNotify'), 'success');
    renderProfile(container);
  });
}
