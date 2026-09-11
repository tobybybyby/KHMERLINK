import { getTripCartCount, getUnreadNotificationCount } from '../storage.js';

const TABS = [
  { key: 'explore', label: 'Khám phá', icon: '🧭', href: '#/trail/explore' },
  { key: 'itinerary', label: 'Hành trình', icon: '🗓️', href: '#/trail/itinerary', countFn: getTripCartCount },
  { key: 'passport', label: 'Hộ chiếu', icon: '📔', href: '#/trail/passport' },
  { key: 'profile', label: 'Cá nhân', icon: '👤', href: '#/trail/profile' },
];

function navItemHtml(t, activeKey, cls) {
  const count = t.countFn ? t.countFn() : 0;
  return `
    <a class="${cls}" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>
      <span class="${cls}__icon" aria-hidden="true">${t.icon}</span>
      <span>${t.label}</span>
      ${count ? `<span class="nav-badge">${count > 9 ? '9+' : count}</span>` : ''}
    </a>
  `;
}

export function renderTrailShell(root, activeKey) {
  const unread = getUnreadNotificationCount();
  root.innerHTML = `
    <div class="trail-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🪷 KhmerLink Trail</a>
        <nav class="top-tabs" aria-label="Điều hướng Trail">
          ${TABS.map((t) => {
            const count = t.countFn ? t.countFn() : 0;
            return `<a class="top-tabs__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>${t.icon} ${t.label}${count ? ` <span class="nav-badge">${count > 9 ? '9+' : count}</span>` : ''}</a>`;
          }).join('')}
        </nav>
        <div class="trail-topbar__spacer"></div>
        <a class="trail-topbar__bell" href="#/trail/notifications" aria-label="Thông báo${unread ? ` — ${unread} chưa đọc` : ''}" title="Thông báo">
          🔔${unread ? `<span class="nav-badge">${unread > 9 ? '9+' : unread}</span>` : ''}
        </a>
      </header>
      <main id="main-content" class="trail-content" tabindex="-1"></main>
      <nav class="bottom-nav" aria-label="Điều hướng Trail">
        ${TABS.map((t) => navItemHtml(t, activeKey, 'bottom-nav__item')).join('')}
      </nav>
    </div>
  `;
  return root.querySelector('.trail-content');
}
