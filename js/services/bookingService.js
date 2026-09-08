// Adapter giữ chỗ/booking mô phỏng — chưa dùng ở Phase 1.
// Phase 3 sẽ hiện thực hoá giữ chỗ có TTL, xác nhận, huỷ, chống double-action (Prompt-Claude-Vinh-Long.md mục 7).
// Triển khai thật cần backend khoá chỗ nguyên tử để tránh overbooking giữa nhiều thiết bị.

export const BookingService = {
  demo: true,

  holdSlot(_slotId, _partySize) {
    return { demo: true, status: 'not_implemented', note: 'Sẽ hoàn thiện ở Phase 3.' };
  },

  confirmBooking(_holdId) {
    return { demo: true, status: 'not_implemented', note: 'Sẽ hoàn thiện ở Phase 3.' };
  },

  releaseHold(_holdId) {
    return { demo: true, status: 'not_implemented', note: 'Sẽ hoàn thiện ở Phase 3.' };
  },
};
