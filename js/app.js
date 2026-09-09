import * as Storage from './storage.js';
import { renderErrorState } from './ui.js';
import { renderWelcome, renderGateway } from './welcome.js';
import { renderComingSoon } from './comingSoon.js';
import { renderTrailShell } from './trail/shell.js';
import { renderExplore } from './trail/explore.js';
import { renderPlaceDetail } from './trail/placeDetail.js';
import { renderProfile } from './trail/profile.js';
import { renderItineraryHome, renderItineraryWizard } from './trail/itinerary.js';
import { renderItineraryDetail } from './trail/itineraryDetail.js';
import { renderPassport } from './trail/passport.js';
import { renderStudioShell } from './studio/shell.js';
import { renderOverview } from './studio/overview.js';
import { renderExperiences } from './studio/experiences.js';
import { renderBookings } from './studio/bookings.js';
import { renderReports } from './studio/reports.js';
import { renderSupport } from './studio/support.js';

const appRoot = document.getElementById('app');

function mountTrailPage(tabKey, pageRenderFn) {
  const content = renderTrailShell(appRoot, tabKey);
  pageRenderFn(content);
  content.focus({ preventScroll: true });
}

function mountStudioPage(tabKey, pageRenderFn, params) {
  const { content, hostId } = renderStudioShell(appRoot, tabKey);
  pageRenderFn(content, hostId, params);
  content.focus({ preventScroll: true });
}

const ROUTES = [
  { pattern: /^#\/?$/, handler: () => renderWelcome(appRoot) },
  { pattern: /^#\/gateway$/, handler: () => renderGateway(appRoot) },

  { pattern: /^#\/trail\/explore$/, handler: () => mountTrailPage('explore', renderExplore) },
  { pattern: /^#\/trail\/place\/([\w-]+)$/, handler: (m) => mountTrailPage('explore', (el) => renderPlaceDetail(el, m[1])) },
  { pattern: /^#\/trail\/itinerary\/new$/, handler: () => mountTrailPage('itinerary', renderItineraryWizard) },
  { pattern: /^#\/trail\/itinerary\/([\w-]+)$/, handler: (m) => mountTrailPage('itinerary', (el) => renderItineraryDetail(el, m[1])) },
  { pattern: /^#\/trail\/itinerary$/, handler: () => mountTrailPage('itinerary', renderItineraryHome) },
  { pattern: /^#\/trail\/passport$/, handler: () => mountTrailPage('passport', renderPassport) },
  { pattern: /^#\/trail\/profile$/, handler: () => mountTrailPage('profile', renderProfile) },
  { pattern: /^#\/trail\/?$/, handler: () => { window.location.hash = '#/trail/explore'; } },

  { pattern: /^#\/studio\/experiences\/new$/, handler: () => mountStudioPage('experiences', renderExperiences, { newExp: true }) },
  { pattern: /^#\/studio\/experiences\/([\w-]+)$/, handler: (m) => mountStudioPage('experiences', renderExperiences, { editId: m[1] }) },
  { pattern: /^#\/studio\/experiences$/, handler: () => mountStudioPage('experiences', renderExperiences) },
  { pattern: /^#\/studio\/bookings$/, handler: () => mountStudioPage('bookings', renderBookings) },
  { pattern: /^#\/studio\/reports$/, handler: () => mountStudioPage('reports', renderReports) },
  { pattern: /^#\/studio\/support$/, handler: () => mountStudioPage('support', renderSupport) },
  { pattern: /^#\/studio\/overview$/, handler: () => mountStudioPage('overview', renderOverview) },
  { pattern: /^#\/studio\/?$/, handler: () => { window.location.hash = '#/studio/overview'; } },
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
