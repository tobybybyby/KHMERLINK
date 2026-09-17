import { getTripCartCount, getUnreadNotificationCount } from '../storage.js';
import { t, languageSwitcherHtml, wireLanguageSwitchers } from '../services/i18nService.js';

function getTabs() {
  return [
    { key: 'explore', label: t('common.nav.explore'), icon: '🧭', href: '#/trail/explore' },
    { key: 'itinerary', label: t('common.nav.myTrips'), icon: '🗓️', href: '#/trail/itinerary', countFn: getTripCartCount },
    { key: 'passport', label: t('common.nav.passport'), icon: '📔', href: '#/trail/passport' },
    { key: 'profile', label: t('common.nav.profile'), icon: '👤', href: '#/trail/profile' },
  ];
}

function navItemHtml(tab, activeKey, cls) {
  const count = tab.countFn ? tab.countFn() : 0;
  return `
    <a class="${cls}" href="${tab.href}" ${tab.key === activeKey ? 'aria-current="page"' : ''}>
      <span class="${cls}__icon" aria-hidden="true">${tab.icon}</span>
      <span>${tab.label}</span>
      ${count ? `<span class="nav-badge">${count > 9 ? '9+' : count}</span>` : ''}
    </a>
  `;
}

export function renderTrailShell(root, activeKey) {
  const unread = getUnreadNotificationCount();
  const TABS = getTabs();
  const bellLabel = unread ? t('common.a11y.notificationsUnread', { count: unread }) : t('common.a11y.notifications');
  root.innerHTML = `
    <div class="trail-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🪷 ${t('common.brand.trail')}</a>
        <nav class="top-tabs" aria-label="${t('common.a11y.trailNav')}">
          ${TABS.map((tab) => {
            const count = tab.countFn ? tab.countFn() : 0;
            return `<a class="top-tabs__item" href="${tab.href}" ${tab.key === activeKey ? 'aria-current="page"' : ''}>${tab.icon} ${tab.label}${count ? ` <span class="nav-badge">${count > 9 ? '9+' : count}</span>` : ''}</a>`;
          }).join('')}
        </nav>
        <div class="trail-topbar__spacer"></div>
        <a class="trail-topbar__bell" href="#/trail/notifications" aria-label="${bellLabel}" title="${t('common.a11y.notifications')}">
          🔔${unread ? `<span class="nav-badge">${unread > 9 ? '9+' : unread}</span>` : ''}
        </a>
        ${languageSwitcherHtml()}
      </header>
      <main id="main-content" class="trail-content" tabindex="-1"></main>
      <nav class="bottom-nav" aria-label="${t('common.a11y.trailNav')}">
        ${TABS.map((tab) => navItemHtml(tab, activeKey, 'bottom-nav__item')).join('')}
      </nav>
    </div>
  `;
  wireLanguageSwitchers(root);
  return root.querySelector('.trail-content');
}
