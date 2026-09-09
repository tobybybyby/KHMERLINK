import * as Storage from './storage.js';
import { renderErrorState } from './ui.js';
import { renderWelcome, renderGateway } from './welcome.js';
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
import { renderAdminShell } from './admin/shell.js';
import { renderAdminOverview } from './admin/overview.js';
import { renderAdminFlow } from './admin/flow.js';
import { renderAdminDemand } from './admin/demand.js';
import { renderAdminProposals } from './admin/proposals.js';
import { renderAdminReports } from './admin/reports.js';
import { renderOpsShell } from './ops/shell.js';
import { renderOpsBookings } from './ops/bookings.js';
import { renderOpsContent } from './ops/content.js';
import { renderOpsTickets } from './ops/tickets.js';
import { renderOpsQuality } from './ops/quality.js';
import { renderCommunityAdvisor } from './ops/community.js';

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

function mountAdminPage(tabKey, pageRenderFn) {
  const content = renderAdminShell(appRoot, tabKey);
  pageRenderFn(content);
  content.focus({ preventScroll: true });
}

function mountOpsPage(tabKey, pageRenderFn) {
  const content = renderOpsShell(appRoot, tabKey);
  pageRenderFn(content);
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
  { pattern: /^#\/admin\/overview$/, handler: () => mountAdminPage('overview', renderAdminOverview) },
  { pattern: /^#\/admin\/flow$/, handler: () => mountAdminPage('flow', renderAdminFlow) },
  { pattern: /^#\/admin\/demand$/, handler: () => mountAdminPage('demand', renderAdminDemand) },
  { pattern: /^#\/admin\/proposals$/, handler: () => mountAdminPage('proposals', renderAdminProposals) },
  { pattern: /^#\/admin\/reports$/, handler: () => mountAdminPage('reports', renderAdminReports) },
  { pattern: /^#\/admin\/?$/, handler: () => { window.location.hash = '#/admin/overview'; } },

  { pattern: /^#\/ops\/community$/, handler: () => renderCommunityAdvisor(appRoot) },
  { pattern: /^#\/ops\/bookings$/, handler: () => mountOpsPage('bookings', renderOpsBookings) },
  { pattern: /^#\/ops\/content$/, handler: () => mountOpsPage('content', renderOpsContent) },
  { pattern: /^#\/ops\/tickets$/, handler: () => mountOpsPage('tickets', renderOpsTickets) },
  { pattern: /^#\/ops\/quality$/, handler: () => mountOpsPage('quality', renderOpsQuality) },
  { pattern: /^#\/ops\/?$/, handler: () => { window.location.hash = '#/ops/bookings'; } },
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
