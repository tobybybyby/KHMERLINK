import { escapeHtml } from './utils.js';

let toastRoot = null;
function getToastRoot() {
  if (!toastRoot) toastRoot = document.getElementById('toast-root');
  return toastRoot;
}

export function showToast(message, type = 'info', duration = 3200) {
  const root = getToastRoot();
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.25s ease';
    setTimeout(() => el.remove(), 260);
  }, duration);
}

let lastFocusedEl = null;

export function openModal({ title, bodyHtml, actionsHtml = '', onMount, closeLabel = 'Đóng' } = {}) {
  const root = document.getElementById('modal-root');
  if (!root) return null;
  lastFocusedEl = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal__header">
        <h2 id="modal-title">${escapeHtml(title || '')}</h2>
        <button type="button" class="modal__close" aria-label="${escapeHtml(closeLabel)}">✕</button>
      </div>
      <div class="modal__body">${bodyHtml || ''}</div>
      ${actionsHtml ? `<div class="modal__actions">${actionsHtml}</div>` : ''}
    </div>
  `;
  root.appendChild(overlay);

  const modalEl = overlay.querySelector('.modal');
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
  };

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      const focusables = modalEl.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.modal__close').addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);

  if (typeof onMount === 'function') onMount(modalEl, close);

  const firstFocusable = modalEl.querySelector('button, a[href], input, select, textarea');
  (firstFocusable || modalEl.querySelector('.modal__close')).focus();

  return close;
}

export function confirmDialog({ title, message, confirmLabel = 'Xác nhận', cancelLabel = 'Huỷ', danger = false }) {
  return new Promise((resolve) => {
    const actionsHtml = `
      <button type="button" class="btn btn-ghost" data-role="cancel">${escapeHtml(cancelLabel)}</button>
      <button type="button" class="btn ${danger ? 'btn-danger-ghost' : 'btn-primary'}" data-role="confirm">${escapeHtml(confirmLabel)}</button>
    `;
    const close = openModal({
      title,
      bodyHtml: `<p>${escapeHtml(message)}</p>`,
      actionsHtml,
      onMount: (modalEl, closeFn) => {
        modalEl.querySelector('[data-role="cancel"]').addEventListener('click', () => { closeFn(); resolve(false); });
        modalEl.querySelector('[data-role="confirm"]').addEventListener('click', () => { closeFn(); resolve(true); });
      },
    });
    if (!close) resolve(false);
  });
}

export function initAccordion(root) {
  root.querySelectorAll('.accordion-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.dataset.open = String(!expanded);
    });
  });
}

export function renderEmptyState({ icon = '🗺️', title, message }) {
  return `
    <div class="state-block">
      <div class="state-block__icon" aria-hidden="true">${icon}</div>
      <h3>${escapeHtml(title || '')}</h3>
      <p>${escapeHtml(message || '')}</p>
    </div>
  `;
}

export function renderErrorState({ title = 'Đã có lỗi xảy ra', message = 'Vui lòng thử lại.', retryHtml = '' }) {
  return `
    <div class="state-block">
      <div class="state-block__icon" aria-hidden="true">⚠️</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      ${retryHtml}
    </div>
  `;
}

export function renderSkeletonCards(count = 3) {
  return Array.from({ length: count }).map(() => `
    <div class="place-card" aria-hidden="true">
      <div class="skeleton" style="width:92px;height:92px;border-radius:14px;"></div>
      <div class="place-card__body">
        <div class="skeleton" style="width:70%;height:14px;margin-bottom:8px;"></div>
        <div class="skeleton" style="width:40%;height:12px;margin-bottom:8px;"></div>
        <div class="skeleton" style="width:90%;height:12px;"></div>
      </div>
    </div>
  `).join('');
}
