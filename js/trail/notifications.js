// Trung tâm thông báo cho du khách (PHASE "Hoàn thiện hành trình, booking, thông báo và liên kết
// dữ liệu" mục 7) — đọc/ghi qua storage.js (nguồn dữ liệu chung), không tự lưu riêng ở đây.
import {
  getState, getNotifications, markNotificationRead, markAllNotificationsRead,
  getNotificationsOptIn, setNotificationsOptIn,
} from '../storage.js';
import { escapeHtml, formatDateTimeShort, qs, qsa } from '../utils.js';
import { NotificationService } from '../services/notificationService.js';
import { renderEmptyState } from '../ui.js';
import { t, registerTranslations } from '../services/i18nService.js';

registerTranslations('customer', {
  notifications: {
    newBadge: 'Mới',
    browserNotifTitle: 'Thông báo trình duyệt (tuỳ chọn)',
    browserNotifDesc: 'Chỉ hoạt động khi tab/trình duyệt đang mở — website tĩnh này KHÔNG thể gửi thông báo khi bạn đã đóng trình duyệt.',
    enabled: 'Đã bật',
    enableNotif: 'Bật thông báo',
    title: 'Thông báo',
    markAllRead: 'Đánh dấu tất cả đã đọc',
    unreadCount: '{count} thông báo chưa đọc.',
    allRead: 'Bạn đã đọc hết thông báo.',
    noNotifTitle: 'Chưa có thông báo nào',
    noNotifMsg: 'Thông báo về booking và nhắc lịch sẽ xuất hiện ở đây.',
    enabledNotify: 'Đã bật thông báo trình duyệt — chỉ hoạt động khi tab này đang mở.',
    notGrantedNotify: 'Bạn chưa cấp quyền thông báo trình duyệt — vẫn xem được thông báo trong app.',
  },
}, {
  notifications: {
    newBadge: 'New',
    browserNotifTitle: 'Browser Notifications (optional)',
    browserNotifDesc: 'Only works while the tab/browser is open — this static website CANNOT send notifications once you close the browser.',
    enabled: 'Enabled',
    enableNotif: 'Enable Notifications',
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    unreadCount: '{count} unread notifications.',
    allRead: "You've read all notifications.",
    noNotifTitle: 'No notifications yet',
    noNotifMsg: 'Booking and reminder notifications will appear here.',
    enabledNotify: 'Browser notifications enabled — only works while this tab is open.',
    notGrantedNotify: "You haven't granted browser notification permission — you can still view notifications in the app.",
  },
});

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
        ${!n.read ? `<span class="nav-badge" style="position:static;">${t('customer.notifications.newBadge')}</span>` : ''}
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
        <strong>${t('customer.notifications.browserNotifTitle')}</strong>
        <p class="text-sm text-muted" style="margin:4px 0 0;">${t('customer.notifications.browserNotifDesc')}</p>
      </div>
      <button type="button" class="btn ${optIn ? 'btn-secondary' : 'btn-primary'} btn-sm" id="notif-optin-btn">${optIn ? t('customer.notifications.enabled') : t('customer.notifications.enableNotif')}</button>
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
          <h2 style="margin:0;">${t('customer.notifications.title')}</h2>
          ${unread ? `<button type="button" class="btn btn-secondary btn-sm" id="notif-mark-all">${t('customer.notifications.markAllRead')}</button>` : ''}
        </div>
        <p class="text-sm text-muted" style="margin-top:6px;">${unread ? t('customer.notifications.unreadCount', { count: unread }) : t('customer.notifications.allRead')}</p>
      </section>

      ${optInSectionHtml()}

      <section class="flex-col gap-2">
        ${notifs.length ? notifs.map(notifItemHtml).join('') : renderEmptyState({ icon: '🔔', title: t('customer.notifications.noNotifTitle'), message: t('customer.notifications.noNotifMsg') })}
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
      NotificationService.notify(t('customer.notifications.enabledNotify'), 'success');
    } else {
      NotificationService.notify(t('customer.notifications.notGrantedNotify'), 'info');
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
