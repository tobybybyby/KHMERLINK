import { t, languageSwitcherHtml, wireLanguageSwitchers } from '../services/i18nService.js';

function getTabs() {
  return [
    { key: 'overview', label: t('common.nav.overview'), icon: '📊', href: '#/admin/overview' },
    { key: 'flow', label: t('common.nav.visitorFlow'), icon: '🌡️', href: '#/admin/flow' },
    { key: 'demand', label: t('common.nav.demandOpportunities'), icon: '🧭', href: '#/admin/demand' },
    { key: 'proposals', label: t('common.nav.proposals'), icon: '📥', href: '#/admin/proposals' },
    { key: 'reports', label: t('common.nav.reports'), icon: '📈', href: '#/admin/reports' },
  ];
}

/** Trả về node content để trang con render vào. Không có "chuyển vai trò" như Studio vì đây
 * là một vai trò cơ quan quản lý duy nhất, không phải nhiều hộ. */
export function renderAdminShell(root, activeKey) {
  const TABS = getTabs();
  root.innerHTML = `
    <div class="studio-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">📊 ${t('common.brand.managementData')}</a>
        <div class="trail-topbar__spacer"></div>
        <a class="trail-topbar__back" href="#/gateway">${t('common.nav.backToGateway')}</a>
        ${languageSwitcherHtml()}
      </header>
      <div class="studio-body">
        <nav class="studio-sidebar" aria-label="${t('common.a11y.adminNav')}">
          ${TABS.map((tab) => `<a class="studio-sidebar__item" href="${tab.href}" ${tab.key === activeKey ? 'aria-current="page"' : ''}>${tab.icon} ${tab.label}</a>`).join('')}
        </nav>
        <main id="main-content" class="studio-content" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="${t('common.a11y.adminNav')}">
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
