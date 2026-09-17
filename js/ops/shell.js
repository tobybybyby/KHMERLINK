import { t, languageSwitcherHtml, wireLanguageSwitchers } from '../services/i18nService.js';

function getTabs() {
  return [
    { key: 'bookings', label: t('common.nav.bookingsTransactions'), icon: '🗓️', href: '#/ops/bookings' },
    { key: 'content', label: t('common.nav.content'), icon: '📝', href: '#/ops/content' },
    { key: 'pilot', label: t('common.nav.pilot'), icon: '📋', href: '#/ops/pilot' },
    { key: 'tickets', label: t('common.nav.tickets'), icon: '🆘', href: '#/ops/tickets' },
    { key: 'quality', label: t('common.nav.quality'), icon: '🏅', href: '#/ops/quality' },
  ];
}

export function renderOpsShell(root, activeKey) {
  const TABS = getTabs();
  root.innerHTML = `
    <div class="studio-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🛠️ ${t('common.brand.ops')}</a>
        <div class="trail-topbar__spacer"></div>
        <a class="trail-topbar__back" href="#/gateway">${t('common.nav.backToGateway')}</a>
        ${languageSwitcherHtml()}
      </header>
      <div class="studio-body">
        <nav class="studio-sidebar" aria-label="${t('common.a11y.opsNav')}">
          ${TABS.map((tab) => `<a class="studio-sidebar__item" href="${tab.href}" ${tab.key === activeKey ? 'aria-current="page"' : ''}>${tab.icon} ${tab.label}</a>`).join('')}
        </nav>
        <main id="main-content" class="studio-content" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="${t('common.a11y.opsNav')}">
        ${TABS.map((tab) => `
          <a class="bottom-nav__item" href="${tab.href}" ${tab.key === activeKey ? 'aria-current="page"' : ''}>
            <span class="bottom-nav__icon" aria-hidden="true">${tab.icon}</span>
            <span>${tab.label}</span>
          </a>`).join('')}
      </nav>
    </div>
  `;
  wireLanguageSwitchers(root);
  return root.querySelector('.studio-content');
}
