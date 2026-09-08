import { showToast } from '../ui.js';

// Adapter thông báo mô phỏng trong trình duyệt — chưa có gửi push/SMS/email thật.

export const NotificationService = {
  demo: true,

  notify(message, type = 'info') {
    showToast(message, type);
  },

  sendPushDemo(_message) {
    return { demo: true, status: 'not_implemented', note: 'Sẽ hoàn thiện khi có backend thật.' };
  },
};
