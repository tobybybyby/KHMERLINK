// Adapter mô phỏng gợi ý dùng thuật toán rule-based, có thể thay bằng gọi API AI thật ở giai đoạn sau.
// Chưa dùng ở Phase 1 — Phase 2 (tạo hành trình) sẽ hiện thực hoá suggestItineraries().

export const AiService = {
  demo: true,

  suggestItineraries(_preferences, _destinations) {
    return {
      demo: true,
      label: 'Gợi ý tự động — bản demo',
      itineraries: [],
      note: 'Sẽ hoàn thiện ở Phase 2 theo Prompt-Claude-Vinh-Long.md mục 6.',
    };
  },
};
