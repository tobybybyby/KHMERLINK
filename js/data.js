// Seed dữ liệu người dùng/vận hành (KHÔNG bao gồm listings — 7 listing pilot được nạp riêng từ
// data/pilot-listings.json qua js/services/destinationsService.js, xem js/storage.js).
//
// Ở phase "Thu gọn dữ liệu thành pilot 7 listing Khmer", toàn bộ hộ (HOSTS)/trải nghiệm có thể
// đặt (EXPERIENCES)/đánh giá mẫu (REVIEWS)/sự kiện (EVENTS)/gợi ý ghép cặp (PAIR_SUGGESTIONS) của
// bộ 37 địa danh cũ đã được ĐƯA VỀ RỖNG tại đây vì:
//   - Không listing pilot nào có supplier/host đã xác nhận nhận khách (đúng yêu cầu: không hiển
//     thị EXP-01/02/03 là "đang mở bán"/"đã xác nhận").
//   - Không có đánh giá/khách thật cho 7 listing pilot — không được tự thêm số liệu ngoài file.
// Bản gốc (5 hộ demo, 5 trải nghiệm trả phí mẫu, 9 đánh giá mẫu, 1 sự kiện, 3 gợi ý ghép cặp,
// gắn với 37 địa danh cũ) được lưu nguyên vẹn tại data/archive/legacy-seed-vinhlong.js.txt để
// tái sử dụng khi mở rộng lại phạm vi dữ liệu.
const HOSTS = [];

function buildExperiences() {
  return [];
}

function buildEvents() {
  return [];
}

function buildReviews() {
  return [];
}

function buildVoucherCatalog() {
  return [
    { id: 'voucher-giam-20k', title: 'Giảm 20.000đ cho trải nghiệm tiếp theo', pointsCost: 100, discountLabel: 'Giảm 20.000đ', condition: 'Áp dụng cho 1 trải nghiệm trả phí bất kỳ, không cộng dồn.', validDays: 30 },
    { id: 'voucher-giam-10pct', title: 'Giảm 10% hoạt động trải nghiệm', pointsCost: 150, discountLabel: 'Giảm 10%', condition: 'Áp dụng tối đa 1 lần/hoạt động, không áp dụng vé tham quan miễn phí.', validDays: 30 },
    { id: 'voucher-uu-tien-dat-cho', title: 'Ưu tiên đặt chỗ dịp lễ hội', pointsCost: 250, discountLabel: 'Ưu tiên xác nhận trong 24h', condition: 'Áp dụng khi đặt trải nghiệm trong 7 ngày quanh sự kiện/lễ hội trên mạng lưới.', validDays: 60 },
  ];
}

// Gợi ý "thường trải nghiệm cùng nhau" dựa trên quan hệ THẬT giữa các listing pilot (chung
// supplier, cùng cụm điều phối) — không phải số liệu hành vi khách thật.
export const PAIR_SUGGESTIONS = [
  { id: 'pair-lam-phen', title: 'Cùng đầu mối NNƯT Lâm Phên', destinationIds: ['EXP-02', 'EXP-03'] },
  { id: 'pair-nguyet-hoa', title: 'Cụm Nguyệt Hóa — Ao Bà Om', destinationIds: ['SITE-04', 'SITE-05', 'SITE-06'] },
];

export const INTEREST_OPTIONS = [
  { value: 'tam-linh', label: 'Tâm linh' },
  { value: 'anh-dep', label: 'Ảnh đẹp' },
  { value: 'lich-su', label: 'Lịch sử' },
  { value: 'thu-cong', label: 'Thủ công' },
  { value: 'thien-nhien', label: 'Thiên nhiên' },
  { value: 'gia-dinh', label: 'Phù hợp gia đình' },
  { value: 'am-thuc-dia-phuong', label: 'Ẩm thực địa phương' },
  { value: 'trai-nghiem-tay-chan', label: 'Trải nghiệm tay chân' },
  { value: 'yen-tinh', label: 'Yên tĩnh' },
  { value: 'van-hoa-khmer', label: 'Văn hoá Khmer' },
];

export function createSeedState() {
  return {
    // Không đặt schemaVersion ở đây — đó là version của lưu trữ (xem SCHEMA_VERSION trong
    // storage.js), không phải một phần nội dung/dữ liệu mẫu.
    // destinations được nạp riêng từ data/pilot-listings.json qua destinationsService — xem js/storage.js.
    destinations: [],
    hosts: JSON.parse(JSON.stringify(HOSTS)),
    experiences: buildExperiences(),
    hostExperiences: [],
    slots: [],
    voucherCatalog: buildVoucherCatalog(),
    itineraries: [],
    bookings: [],
    bookingItems: [],
    payments: [],
    reviews: buildReviews(),
    userReviews: [],
    placeImpressions: [],
    travellerReviews: [],
    passportStamps: [],
    pointsLedger: [],
    vouchers: [],
    events: buildEvents(),
    supportTickets: [],
    proposals: [],
    cpsExceptions: [],
    moderationRecords: [],
    hostRecognitionOverrides: {},
    metrics: { monthlyByHost: {} },
    favorites: [],
    viewCounts: {},
    suggestionDecisions: {},
    ui: {
      draftItinerary: [],
      notifications: [],
      activeItineraryId: null,
      currentHostId: null,
    },
  };
}
