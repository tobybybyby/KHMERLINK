import { getState, setCurrentHostId, getCurrentHostId } from '../storage.js';
import { escapeHtml, qs, qsa } from '../utils.js';

const TABS = [
  { key: 'overview', label: 'Tổng quan', icon: '📊', href: '#/studio/overview' },
  { key: 'experiences', label: 'Trải nghiệm', icon: '🧭', href: '#/studio/experiences' },
  { key: 'bookings', label: 'Lịch & Booking', icon: '🗓️', href: '#/studio/bookings' },
  { key: 'reports', label: 'Báo cáo', icon: '📈', href: '#/studio/reports' },
  { key: 'support', label: 'Hỗ trợ & Đề án', icon: '🤝', href: '#/studio/support' },
];

function hostOptionsHtml(state, currentId) {
  return state.hosts.map((h) => `<option value="${h.id}" ${h.id === currentId ? 'selected' : ''}>${escapeHtml(h.name)}${h.isDemoHost ? ' (demo)' : ''}</option>`).join('');
}

/**
 * Trả về { content, hostId } — content là node để trang con render vào; hostId là hộ đang
 * được chọn (chuyển vai trò demo, giống cách Trail/Cổng quản lý/Cổng vận hành đã làm).
 */
export function renderStudioShell(root, activeKey) {
  const state = getState();
  let currentHostId = getCurrentHostId();
  if (!currentHostId || !state.hosts.some((h) => h.id === currentHostId)) {
    currentHostId = state.hosts[0]?.id || null;
    setCurrentHostId(currentHostId);
  }

  root.innerHTML = `
    <div class="studio-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🏡 KhmerLink Studio</a>
        <div class="trail-topbar__spacer"></div>
        <select class="host-switcher" id="studio-host-switcher" aria-label="Chọn hộ để xem demo">
          ${hostOptionsHtml(state, currentHostId)}
        </select>
      </header>
      <p class="demo-note" style="margin:0;border-radius:0;text-align:center;">Demo chuyển vai trò: bạn đang xem Studio như thể đang đăng nhập bằng hộ đã chọn ở trên — không phải xác thực thật.</p>
      <div class="studio-body">
        <nav class="studio-sidebar" aria-label="Điều hướng Studio">
          ${TABS.map((t) => `<a class="studio-sidebar__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>${t.icon} ${t.label}</a>`).join('')}
        </nav>
        <main id="main-content" class="studio-content" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="Điều hướng Studio">
        ${TABS.map((t) => `
          <a class="bottom-nav__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>
            <span class="bottom-nav__icon" aria-hidden="true">${t.icon}</span>
            <span>${t.label}</span>
          </a>`).join('')}
      </nav>
    </div>
  `;

  qs('#studio-host-switcher', root).addEventListener('change', (e) => {
    setCurrentHostId(e.target.value);
    window.dispatchEvent(new Event('hashchange'));
  });

  return { content: root.querySelector('.studio-content'), hostId: currentHostId };
}
