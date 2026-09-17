import * as Storage from './storage.js';
import { renderErrorState } from './ui.js';
import { renderWelcome, renderGateway } from './welcome.js';
import { renderTrailShell } from './trail/shell.js';
import { renderExplore } from './trail/explore.js';
import { renderPlaceDetail } from './trail/placeDetail.js';
import { renderProfile } from './trail/profile.js';
import { renderItineraryHome, renderItineraryWizard } from './trail/itinerary.js';
import { renderItineraryDetail } from './trail/itineraryDetail.js';
import { renderItinerarySummary } from './trail/itinerarySummary.js';
import { renderPassport } from './trail/passport.js';
import { renderNotifications } from './trail/notifications.js';
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
import { renderOpsPilot } from './ops/pilot.js';
import { renderCommunityAdvisor } from './ops/community.js';
import * as NavHistory from './services/navHistoryService.js';
import { t } from './services/i18nService.js';

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
  { pattern: /^#\/trail\/itinerary\/([\w-]+)\/summary$/, handler: (m) => mountTrailPage('itinerary', (el) => renderItinerarySummary(el, m[1])) },
  { pattern: /^#\/trail\/itinerary\/([\w-]+)$/, handler: (m) => mountTrailPage('itinerary', (el) => renderItineraryDetail(el, m[1])) },
  { pattern: /^#\/trail\/itinerary$/, handler: () => mountTrailPage('itinerary', renderItineraryHome) },
  { pattern: /^#\/trail\/passport$/, handler: () => mountTrailPage('passport', renderPassport) },
  { pattern: /^#\/trail\/notifications$/, handler: () => mountTrailPage('notifications', renderNotifications) },
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
  { pattern: /^#\/ops\/pilot$/, handler: () => mountOpsPage('pilot', renderOpsPilot) },
  { pattern: /^#\/ops\/?$/, handler: () => { window.location.hash = '#/ops/bookings'; } },
];

function matchRoute(hash) {
  for (const route of ROUTES) {
    const match = hash.match(route.pattern);
    if (match) return { route, match };
  }
  return null;
}

function renderCurrent({ scrollTop = false, restore = null } = {}) {
  const hash = window.location.hash || '#/';
  try {
    const found = matchRoute(hash);
    if (found) {
      // Trang đích có thể tự hỏi NavHistory.isRestoring() trong lúc render (đồng bộ) để biết đây
      // là lượt "quay lại" hay "tới mới" — vd itinerary.js dùng để không reset wizard/tính lại gợi
      // ý AI chỉ vì khách vừa xem rồi đóng 1 trang chi tiết địa điểm.
      NavHistory.setRestoring(!!restore);
      found.route.handler(found.match);
      NavHistory.setRestoring(false);
      if (restore) {
        // Quay lại đúng vị trí cuộn + focus của trang trước đó (nút Quay lại/× của trang chi tiết
        // địa điểm, hoặc Back/vuốt back của trình duyệt — cả hai đều xử lý giống nhau, xem render()
        // bên dưới). Dùng setTimeout thay vì requestAnimationFrame — rAF có thể bị trình duyệt trì
        // hoãn/không chạy khi tab không ở trạng thái đang vẽ (nền/không active), khiến khôi phục
        // cuộn/focus im lặng không xảy ra; setTimeout(0) là macrotask, luôn chạy ngay sau khi DOM
        // của route mới đã gắn xong.
        setTimeout(() => {
          NavHistory.restoreScroll(restore.scroll);
          const target = restore.focusHint ? appRoot.querySelector(restore.focusHint) : null;
          target?.focus?.({ preventScroll: true });
        }, 0);
      } else if (scrollTop) {
        window.scrollTo(0, 0);
      }
      return;
    }
    window.location.hash = '#/';
  } catch (err) {
    appRoot.innerHTML = `
      <div class="page-generic">
        <div class="coming-soon">
          ${renderErrorState({
            title: t('common.error.title'),
            message: t('common.error.backToHomeMessage'),
          })}
          <a class="btn btn-primary" href="#/">${t('common.nav.homeLink')}</a>
        </div>
      </div>
    `;
    if (window.console && console.error) console.error(err);
  }
}

// Nếu route đích là trang chi tiết địa điểm, ghi nhớ cách tìm lại nút "Xem chi tiết"/"Xem" đã dẫn
// tới đó — dùng để trả focus đúng chỗ khi khách quay lại trang đang rời đi (mục 8, accessibility).
function deriveFocusHint(hash) {
  const m = hash.match(/^#\/trail\/place\/([\w-]+)$/);
  if (!m) return null;
  const id = m[1];
  // Chỉ nhắm phần tử THẬT SỰ nhận được focus (button/a) — bỏ qua thẻ bọc ngoài như .place-card
  // (div data-id="…" dùng để bắt click cả card, không tự focus() được đáng tin cậy dù có
  // tabindex="-1").
  return `a[href="#/trail/place/${id}"], button[data-detail="${id}"], button[data-id="${id}"], button[data-goto="${id}"]`;
}

let lastHash = window.location.hash || '#/';

function render() {
  const newHash = window.location.hash || '#/';
  const top = NavHistory.peekTop();
  if (top && top.hash === newHash) {
    // Hash mới khớp đúng đỉnh ngăn xếp "đã ghé qua" — đây là một lượt QUAY LẠI, dù do nút Quay
    // lại/× trong trang, nút Back của trình duyệt, hay vuốt back trên di động (cả 3 chỉ khác nhau
    // ở NƠI location.hash bị đổi, không phải ở kết quả) — pop và khôi phục đúng scroll/focus thay
    // vì cuộn lên đầu như điều hướng thường.
    NavHistory.popTop();
    renderCurrent({ restore: top });
  } else {
    // Điều hướng "tiến" bình thường — ghi nhớ trang sắp rời đi (hash + scroll hiện tại, còn nguyên
    // vì DOM chưa bị thay) để có thể quay lại đúng chỗ sau này. Bỏ qua ở lần render đầu tiên khi
    // boot app (lastHash === newHash, chưa có điều hướng thật nào xảy ra).
    if (lastHash !== newHash) {
      NavHistory.recordDeparture(lastHash, deriveFocusHint(newHash));
    }
    renderCurrent({ scrollTop: true });
  }
  lastHash = newHash;
}

// Render lại route hiện tại (KHÔNG cuộn lên đầu, KHÔNG reload toàn bộ app) khi dữ liệu vừa đổi —
// dùng chung cho sự kiện cùng-tab (khmerlink:data-changed, phát ra từ storage.js/bookingService.js
// sau mỗi thay đổi) lẫn khác-tab (storage, phát tự động khi tab khác ghi localStorage). Debounce
// ngắn vì 1 thao tác (vd tạo booking) có thể bắn nhiều sự kiện liên tiếp (bookings + notifications).
let rerenderTimer = null;
function scheduleRerender() {
  clearTimeout(rerenderTimer);
  rerenderTimer = setTimeout(() => renderCurrent({ scrollTop: false }), 80);
}

window.addEventListener('hashchange', render);
window.addEventListener('khmerlink:data-changed', scheduleRerender);
// Đổi ngôn ngữ (cùng tab qua i18nService.setLanguage, hoặc tab khác qua sự kiện storage đã được
// i18nService tự redispatch thành sự kiện này) chỉ render lại route hiện tại — KHÔNG cuộn lên đầu,
// KHÔNG điều hướng về Home/Explore, giữ nguyên Trip Cart/hành trình/filter/modal đang mở vì tất cả
// đều sống trong `state`/singleton filter object, không phải biến cục bộ trong DOM bị mất khi re-render.
window.addEventListener('khmerlink:language-changed', scheduleRerender);
window.addEventListener('storage', (e) => {
  // e.key null nghĩa là localStorage.clear() (vd tab khác bấm "Khôi phục dữ liệu mẫu") — vẫn cần
  // đồng bộ lại. Phải đọc lại localStorage vào state trong bộ nhớ TRƯỚC khi render lại — ghi
  // localStorage ở tab khác không tự cập nhật biến state của tab này (xem syncFromLocalStorage()).
  if (e.key === Storage.STORAGE_KEY || e.key === null) {
    Storage.syncFromLocalStorage();
    scheduleRerender();
  }
});
window.addEventListener('focus', () => {
  Storage.checkDueReminders();
});

window.addEventListener('DOMContentLoaded', async () => {
  appRoot.innerHTML = `
    <div class="page-generic">
      <div class="state-block">
        <div class="state-block__icon" aria-hidden="true">⏳</div>
        <h3>${t('common.loading')}</h3>
      </div>
    </div>
  `;
  try {
    await Storage.init();
    Storage.checkDueReminders();
  } catch (err) {
    if (window.console && console.error) console.error(err);
  }
  render();
});
