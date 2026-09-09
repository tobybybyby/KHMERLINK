const TABS = [
  { key: 'explore', label: 'Khám phá', icon: '🧭', href: '#/trail/explore' },
  { key: 'itinerary', label: 'Hành trình', icon: '🗓️', href: '#/trail/itinerary' },
  { key: 'passport', label: 'Hộ chiếu', icon: '📔', href: '#/trail/passport' },
  { key: 'profile', label: 'Cá nhân', icon: '👤', href: '#/trail/profile' },
];

export function renderTrailShell(root, activeKey) {
  root.innerHTML = `
    <div class="trail-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🪷 Khmer Linh Trail</a>
        <nav class="top-tabs" aria-label="Điều hướng Trail">
          ${TABS.map((t) => `<a class="top-tabs__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>${t.icon} ${t.label}</a>`).join('')}
        </nav>
        <div class="trail-topbar__spacer"></div>
      </header>
      <main id="main-content" class="trail-content" tabindex="-1"></main>
      <nav class="bottom-nav" aria-label="Điều hướng Trail">
        ${TABS.map((t) => `
          <a class="bottom-nav__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>
            <span class="bottom-nav__icon" aria-hidden="true">${t.icon}</span>
            <span>${t.label}</span>
          </a>`).join('')}
      </nav>
    </div>
  `;
  return root.querySelector('.trail-content');
}
