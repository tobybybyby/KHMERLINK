// Adapter thanh toán mô phỏng — không thu thông tin thẻ thật, không chuyển tiền thật.
// Chưa dùng ở Phase 1 — Phase 3 (booking/thanh toán) sẽ hiện thực hoá đầy đủ.

export const PaymentService = {
  demo: true,

  createDemoCharge(_amount, _method) {
    return {
      demo: true,
      status: 'not_implemented',
      note: 'Sẽ hoàn thiện ở Phase 3 theo Prompt-Claude-Vinh-Long.md mục 7.',
    };
  },

  refundDemo(_paymentId) {
    return {
      demo: true,
      status: 'not_implemented',
      note: 'Sẽ hoàn thiện ở Phase 3.',
    };
  },
};
