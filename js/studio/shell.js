import { getState, setCurrentHostId, getCurrentHostId } from '../storage.js';
import { escapeHtml, qs, qsa } from '../utils.js';
import { t, languageSwitcherHtml, wireLanguageSwitchers } from '../services/i18nService.js';

function getTabs() {
  return [
    { key: 'overview', label: t('common.nav.overview'), icon: '📊', href: '#/studio/overview' },
    { key: 'experiences', label: t('common.nav.experiences'), icon: '🧭', href: '#/studio/experiences' },
    { key: 'bookings', label: t('common.nav.calendarBookings'), icon: '🗓️', href: '#/studio/bookings' },
    { key: 'reports', label: t('common.nav.reports'), icon: '📈', href: '#/studio/reports' },
    { key: 'support', label: t('common.nav.supportProposals'), icon: '🤝', href: '#/studio/support' },
  ];
}

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

  const TABS = getTabs();
  root.innerHTML = `
    <div class="studio-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🏡 ${t('common.brand.studio')}</a>
        <div class="trail-topbar__spacer"></div>
        <label class="text-sm host-switcher-label" for="studio-host-switcher">${t('common.providerLabel')}</label>
        <select class="host-switcher" id="studio-host-switcher" aria-label="${t('common.hostSwitcherA11y')}">
          ${hostOptionsHtml(state, currentHostId)}
        </select>
        ${languageSwitcherHtml()}
      </header>
      <div class="studio-data-label-row"><span class="demo-data-label demo-data-label--neutral">${t('common.demoDataLabel')}</span></div>
      <div class="studio-body">
        <nav class="studio-sidebar" aria-label="${t('common.a11y.studioNav')}">
          ${TABS.map((tab) => `<a class="studio-sidebar__item" href="${tab.href}" ${tab.key === activeKey ? 'aria-current="page"' : ''}>${tab.icon} ${tab.label}</a>`).join('')}
        </nav>
        <main id="main-content" class="studio-content" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="${t('common.a11y.studioNav')}">
        ${TABS.map((tab) => `
          <a class="bottom-nav__item" href="${tab.href}" ${tab.key === activeKey ? 'aria-current="page"' : ''}>
            <span class="bottom-nav__icon" aria-hidden="true">${tab.icon}</span>
            <span>${tab.label}</span>
          </a>`).join('')}
      </nav>
    </div>
  `;

  qs('#studio-host-switcher', root).addEventListener('change', (e) => {
    setCurrentHostId(e.target.value);
    window.dispatchEvent(new Event('hashchange'));
  });
  wireLanguageSwitchers(root);

  return { content: root.querySelector('.studio-content'), hostId: currentHostId };
}
