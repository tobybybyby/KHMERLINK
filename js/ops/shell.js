const TABS = [
  { key: 'bookings', label: 'Booking & Giao dịch', icon: '🗓️', href: '#/ops/bookings' },
  { key: 'content', label: 'Nội dung', icon: '📝', href: '#/ops/content' },
  { key: 'pilot', label: 'Pilot Khmer', icon: '📋', href: '#/ops/pilot' },
  { key: 'tickets', label: 'Sự cố', icon: '🆘', href: '#/ops/tickets' },
  { key: 'quality', label: 'Chất lượng & Hỗ trợ hộ', icon: '🏅', href: '#/ops/quality' },
];

export function renderOpsShell(root, activeKey) {
  root.innerHTML = `
    <div class="studio-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">🛠️ Cổng vận hành</a>
        <div class="trail-topbar__spacer"></div>
        <a class="trail-topbar__back" href="#/gateway">← Cổng quản lý</a>
      </header>
      <p class="demo-note" style="margin:0;border-radius:0;text-align:center;">Demo vai trò: đội vận hành — có quyền xem CPS/giao dịch/khách để xử lý, khác với vai trò cơ quan quản lý (chỉ xem tổng hợp/ẩn danh).</p>
      <div class="studio-body">
        <nav class="studio-sidebar" aria-label="Điều hướng Cổng vận hành">
          ${TABS.map((t) => `<a class="studio-sidebar__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>${t.icon} ${t.label}</a>`).join('')}
        </nav>
        <main id="main-content" class="studio-content" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="Điều hướng Cổng vận hành">
        ${TABS.map((t) => `
          <a class="bottom-nav__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>
            <span class="bottom-nav__icon" aria-hidden="true">${t.icon}</span>
            <span>${t.label}</span>
          </a>`).join('')}
      </nav>
    </div>
  `;
  return root.querySelector('.studio-content');
}
