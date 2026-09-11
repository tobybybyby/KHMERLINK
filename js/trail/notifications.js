// Trung tâm thông báo cho du khách (PHASE "Hoàn thiện hành trình, booking, thông báo và liên kết
// dữ liệu" mục 7) — đọc/ghi qua storage.js (nguồn dữ liệu chung), không tự lưu riêng ở đây.
import {
  getState, getNotifications, markNotificationRead, markAllNotificationsRead,
  getNotificationsOptIn, setNotificationsOptIn,
} from '../storage.js';
import { escapeHtml, formatDateTimeShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { renderEmptyState } from '../ui.js';

const TYPE_ICON = {
  booking_created: '🎟️',
  booking_confirmed: '✅',
  booking_rejected: '⚠️',
  booking_reminder: '⏰',
};

function notifItemHtml(n) {
  const linkHref = n.itineraryId ? `#/trail/itinerary/${n.itineraryId}` : null;
  return `
    <button type="button" class="card notif-item" data-notif="${n.id}" data-link="${linkHref || ''}" data-read="${n.read}" style="padding:12px;text-align:left;width:100%;">
      <div class="flex justify-between items-center gap-2 wrap">
        <strong>${TYPE_ICON[n.type] || '🔔'} ${escapeHtml(n.title)}</strong>
        ${!n.read ? '<span class="nav-badge" style="position:static;">Mới</span>' : ''}
      </div>
      <p class="text-sm text-muted" style="margin:4px 0 0;">${escapeHtml(n.message)}</p>
      <p class="text-faint text-sm" style="margin:2px 0 0;">${formatDateTimeShort(new Date(n.createdAt))}</p>
    </button>
  `;
}

function optInSectionHtml() {
  const optIn = getNotificationsOptIn();
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  if (!supported) return '';
  return `
    <div class="card flex justify-between items-center gap-2 wrap" style="padding:14px;">
      <div>
        <strong>Thông báo trình duyệt (tuỳ chọn)</strong>
        <p class="text-sm text-muted" style="margin:4px 0 0;">Chỉ hoạt động khi tab/trình duyệt đang mở — website tĩnh này KHÔNG thể gửi thông báo khi bạn đã đóng trình duyệt.</p>
      </div>
      <button type="button" class="btn ${optIn ? 'btn-secondary' : 'btn-primary'} btn-sm" id="notif-optin-btn">${optIn ? 'Đã bật' : 'Bật thông báo'}</button>
    </div>
  `;
}

export function renderNotifications(container) {
  const notifs = getNotifications();
  const unread = notifs.filter((n) => !n.read).length;

  container.innerHTML = `
    <div class="profile-page">
      <section class="card" style="padding:20px;">
        <div class="flex justify-between items-center gap-2 wrap">
          <h2 style="margin:0;">Thông báo</h2>
          ${unread ? `<button type="button" class="btn btn-secondary btn-sm" id="notif-mark-all">Đánh dấu tất cả đã đọc</button>` : ''}
        </div>
        <p class="text-sm text-muted" style="margin-top:6px;">${unread ? `${unread} thông báo chưa đọc.` : 'Bạn đã đọc hết thông báo.'}</p>
      </section>

      ${optInSectionHtml()}

      <section class="flex-col gap-2">
        ${notifs.length ? notifs.map(notifItemHtml).join('') : renderEmptyState({ icon: '🔔', title: 'Chưa có thông báo nào', message: 'Thông báo về booking và nhắc lịch sẽ xuất hiện ở đây.' })}
      </section>
    </div>
  `;

  qs('#notif-mark-all', container)?.addEventListener('click', () => {
    markAllNotificationsRead();
    renderNotifications(container);
  });

  qs('#notif-optin-btn', container)?.addEventListener('click', async () => {
    if (getNotificationsOptIn()) {
      setNotificationsOptIn(false);
      renderNotifications(container);
      return;
    }
    const permission = await window.Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsOptIn(true);
      NotificationService.notify('Đã bật thông báo trình duyệt — chỉ hoạt động khi tab này đang mở.', 'success');
    } else {
      NotificationService.notify('Bạn chưa cấp quyền thông báo trình duyệt — vẫn xem được thông báo trong app.', 'info');
    }
    renderNotifications(container);
  });

  qsa('.notif-item', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.read !== 'true') markNotificationRead(btn.dataset.notif);
      const link = btn.dataset.link;
      if (link) window.location.hash = link;
      else renderNotifications(container);
    });
  });
}
