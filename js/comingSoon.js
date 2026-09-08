import { escapeHtml } from './utils.js';

export function renderComingSoon(container, { title, description, phase, backHref = '#/' } = {}) {
  container.innerHTML = `
    <div class="page-generic">
      <div class="coming-soon">
        <div style="font-size:2.2rem;margin-bottom:8px;">🚧</div>
        <h2>${escapeHtml(title || 'Sắp có')}</h2>
        <p class="text-muted">${escapeHtml(description || '')}</p>
        <p class="badge badge-demo" style="margin-top:8px;">Kế hoạch: Phase ${escapeHtml(phase ?? '?')}</p>
        <div style="margin-top:20px;">
          <a class="btn btn-secondary" href="${backHref}">← Quay lại</a>
        </div>
      </div>
    </div>
  `;
}
