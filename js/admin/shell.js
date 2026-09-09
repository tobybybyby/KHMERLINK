const TABS = [
  { key: 'overview', label: 'Tổng quan', icon: '📊', href: '#/admin/overview' },
  { key: 'flow', label: 'Luồng khách', icon: '🌡️', href: '#/admin/flow' },
  { key: 'demand', label: 'Nhu cầu & Cơ hội', icon: '🧭', href: '#/admin/demand' },
  { key: 'proposals', label: 'Đề án', icon: '📥', href: '#/admin/proposals' },
  { key: 'reports', label: 'Báo cáo', icon: '📈', href: '#/admin/reports' },
];

/** Trả về node content để trang con render vào. Không có "chuyển vai trò" như Studio vì đây
 * là một vai trò cơ quan quản lý duy nhất, không phải nhiều hộ. */
export function renderAdminShell(root, activeKey) {
  root.innerHTML = `
    <div class="studio-shell">
      <header class="trail-topbar">
        <a class="trail-topbar__brand" href="#/">📊 Cổng dữ liệu quản lý</a>
        <div class="trail-topbar__spacer"></div>
        <a class="trail-topbar__back" href="#/gateway">← Cổng quản lý</a>
      </header>
      <p class="demo-note" style="margin:0;border-radius:0;text-align:center;">Demo vai trò: cơ quan quản lý — chỉ xem dữ liệu tổng hợp/ẩn danh, không thấy doanh thu hoặc CPS của từng hộ riêng lẻ.</p>
      <div class="studio-body">
        <nav class="studio-sidebar" aria-label="Điều hướng Cổng dữ liệu quản lý">
          ${TABS.map((t) => `<a class="studio-sidebar__item" href="${t.href}" ${t.key === activeKey ? 'aria-current="page"' : ''}>${t.icon} ${t.label}</a>`).join('')}
        </nav>
        <main id="main-content" class="studio-content" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="Điều hướng Cổng dữ liệu quản lý">
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
