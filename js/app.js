import * as Storage from './storage.js';
import { renderErrorState } from './ui.js';
import { renderWelcome, renderGateway } from './welcome.js';
import { renderComingSoon } from './comingSoon.js';
import { renderTrailShell } from './trail/shell.js';
import { renderExplore } from './trail/explore.js';
import { renderPlaceDetail } from './trail/placeDetail.js';
import { renderProfile } from './trail/profile.js';

const appRoot = document.getElementById('app');

function mountTrailPage(tabKey, pageRenderFn) {
  const content = renderTrailShell(appRoot, tabKey);
  pageRenderFn(content);
  content.focus({ preventScroll: true });
}

const ROUTES = [
  { pattern: /^#\/?$/, handler: () => renderWelcome(appRoot) },
  { pattern: /^#\/gateway$/, handler: () => renderGateway(appRoot) },

  { pattern: /^#\/trail\/explore$/, handler: () => mountTrailPage('explore', renderExplore) },
  { pattern: /^#\/trail\/place\/([\w-]+)$/, handler: (m) => mountTrailPage('explore', (el) => renderPlaceDetail(el, m[1])) },
  { pattern: /^#\/trail\/itinerary$/, handler: () => mountTrailPage('itinerary', (el) => renderComingSoon(el, {
    title: 'Tạo hành trình cá nhân hoá',
    description: 'Form từng bước, kết quả 2-3 phương án gợi ý tự động (rule-based) sẽ có ở Phase 2.',
    phase: 2,
    backHref: '#/trail/explore',
  })) },
  { pattern: /^#\/trail\/passport$/, handler: () => mountTrailPage('passport', (el) => renderComingSoon(el, {
    title: 'Hộ chiếu du khách (Traveller Passport)',
    description: 'Bản đồ điểm đã ghé, dấu trải nghiệm, điểm thưởng và voucher sẽ có ở Phase 5.',
    phase: 5,
    backHref: '#/trail/explore',
  })) },
  { pattern: /^#\/trail\/profile$/, handler: () => mountTrailPage('profile', renderProfile) },
  { pattern: /^#\/trail\/?$/, handler: () => { window.location.hash = '#/trail/explore'; } },

  { pattern: /^#\/studio.*$/, handler: () => renderComingSoon(appRoot, {
    title: 'Studio — dành cho hộ dân & nghệ nhân',
    description: 'Tổng quan, đăng trải nghiệm, booking & thu nhập, báo cáo & CPS, đề án hỗ trợ sẽ có ở Phase 6.',
    phase: 6,
  }) },
  { pattern: /^#\/admin.*$/, handler: () => renderComingSoon(appRoot, {
    title: 'Cổng dữ liệu quản lý',
    description: 'Dashboard tổng hợp booking, luồng khách, nhu cầu & cơ hội, đề án, báo cáo sẽ có ở Phase 7.',
    phase: 7,
    backHref: '#/gateway',
  }) },
  { pattern: /^#\/ops\/community$/, handler: () => renderComingSoon(appRoot, {
    title: 'Cố vấn cộng đồng',
    description: 'Hàng chờ duyệt văn hoá và xem xét ngoại lệ sẽ có ở Phase 8.',
    phase: 8,
    backHref: '#/gateway',
  }) },
  { pattern: /^#\/ops.*$/, handler: () => renderComingSoon(appRoot, {
    title: 'Cổng vận hành',
    description: 'Booking & giao dịch, nội dung, sự cố, chất lượng & hỗ trợ hộ sẽ có ở Phase 8.',
    phase: 8,
    backHref: '#/gateway',
  }) },
];

function render() {
  const hash = window.location.hash || '#/';
  try {
    for (const route of ROUTES) {
      const match = hash.match(route.pattern);
      if (match) {
        route.handler(match);
        window.scrollTo(0, 0);
        return;
      }
    }
    window.location.hash = '#/';
  } catch (err) {
    appRoot.innerHTML = `
      <div class="page-generic">
        <div class="coming-soon">
          ${renderErrorState({
            title: 'Đã có lỗi xảy ra',
            message: 'Vui lòng quay lại trang chào và thử lại.',
          })}
          <a class="btn btn-primary" href="#/">Về trang chào</a>
        </div>
      </div>
    `;
    if (window.console && console.error) console.error(err);
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', async () => {
  appRoot.innerHTML = `
    <div class="page-generic">
      <div class="state-block">
        <div class="state-block__icon" aria-hidden="true">⏳</div>
        <h3>Đang tải dữ liệu…</h3>
      </div>
    </div>
  `;
  try {
    await Storage.init();
  } catch (err) {
    if (window.console && console.error) console.error(err);
  }
  render();
});
