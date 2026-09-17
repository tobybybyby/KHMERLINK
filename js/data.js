// Seed dữ liệu người dùng/vận hành (KHÔNG bao gồm listings — 7 listing pilot được nạp riêng từ
// data/pilot-listings.json qua js/services/destinationsService.js, xem js/storage.js).
//
// EXPERIENCES/SLOTS thật (có giá/lịch xác nhận) vẫn để rỗng ở đây — chỉ được tạo khi một host
// thật sự dùng Studio (`upsertHostExperience`), không seed booking/bookable giả cho 7 listing.
// HOSTS (bên dưới) mỗi host tương ứng 1 trong 7 listing pilot, dùng đúng tên/vai trò/địa chỉ đã có
// trong data/pilot-suppliers.json.
//
// Dữ liệu HOẠT ĐỘNG mô phỏng (đánh giá/doanh thu/lượt ghé 12 tháng) cho PHASE "Bổ sung dữ liệu mô
// phỏng liên kết" (11/09/2026) nằm ở data/pilot-seed-data.js — KHÔNG đặt ở đây (metrics.monthlyByHost
// bên dưới đã hết dùng, chỉ giữ để không phá vỡ shape state cũ; xem js/services/metricsService.js
// và js/admin/networkMetrics.js là nguồn dữ liệu hoạt động thật sự đang dùng). Người dùng đã được
// hỏi rõ và xác nhận việc gắn số liệu mô phỏng vào 7 listing/host thật cho mục đích trình diễn —
// xem DEMO_DATA.md.
// Bản gốc bộ 37 địa danh cũ (5 hộ demo, 5 trải nghiệm trả phí mẫu, 9 đánh giá mẫu, 1 sự kiện, 3
// gợi ý ghép cặp) được lưu nguyên vẹn tại data/archive/legacy-seed-vinhlong.js.txt.
const HOSTS = [
  {
    id: 'host-com-dep-tuan-viet',
    name: 'Hộ kinh doanh Trần Tuấn Việt – Cốm Dẹp Tuấn Việt',
    destinationId: 'EXP-01',
    isDemoHost: false,
    bio: 'Đầu mối khảo sát cho trải nghiệm giã cốm dẹp tại Ấp Giồng Thành, xã Nhị Trường — có hồ sơ trên Sàn giao dịch Nông sản Vĩnh Long; chưa xác minh đơn vị có tiếp khách tại xưởng.',
  },
  {
    id: 'host-nhac-mua-khmer',
    name: 'Xưởng NNƯT Lâm Phên & Đoàn Nghệ thuật Khmer Ánh Bình Minh',
    destinationId: 'EXP-02',
    isDemoHost: false,
    bio: 'Đầu mối đề xuất cho gói trải nghiệm 2 điểm dừng: xưởng nhạc cụ/mặt nạ Lâm Phên (Ấp Ba Se A, xã Song Lộc) và đoàn biểu diễn Rô-băm Ánh Bình Minh (507 Nguyễn Đáng, phường Trà Vinh) — thiết kế khả thi, chưa phải tour đang bán.',
  },
  {
    id: 'host-mat-na-khmer',
    name: 'Xưởng NNƯT Lâm Phên',
    destinationId: 'EXP-03',
    isDemoHost: false,
    bio: 'Nghệ nhân ưu tú chế tác mão, mặt nạ Khmer và nhạc cụ — làm nghề từ 1990, đã truyền nghề cho hơn 200 người; xưởng tại nhà riêng, Ấp Ba Se A, xã Song Lộc. Chưa xác nhận nhận khách workshop.',
  },
  {
    id: 'host-lang-van-hoa-nguyet-hoa',
    name: 'Ban quản lý cụm Nguyệt Hóa',
    destinationId: 'SITE-04',
    isDemoHost: false,
    bio: 'Điều phối cụm Làng Văn hóa – Du lịch dân tộc Khmer, lấy Ao Bà Om – Chùa Âng – Bảo tàng làm hạt nhân, Phường Nguyệt Hóa.',
  },
  {
    id: 'host-chua-ang',
    name: 'Ban quản trị Chùa Âng',
    destinationId: 'SITE-05',
    isDemoHost: false,
    bio: 'Chùa Khmer cổ trong quần thể Ao Bà Om, di tích kiến trúc nghệ thuật cấp quốc gia (1994) — thuộc cụm Nguyệt Hóa.',
  },
  {
    id: 'host-bao-tang-khmer',
    name: 'Bảo tàng Văn hóa dân tộc Khmer',
    destinationId: 'SITE-06',
    isDemoHost: false,
    bio: 'Bảo tàng chuyên đề gần Ao Bà Om và Chùa Âng — giờ/giá hiện hành cần gọi xác nhận.',
  },
  {
    id: 'host-chua-lo-gach',
    name: 'Ban quản trị Chùa Lò Gạch',
    destinationId: 'SITE-07',
    isDemoHost: false,
    bio: 'Chùa Padumavansa Kompong Thmo tại Ấp Ba Se A, cạnh khu khảo cổ Bờ Lũy — hai di tích tách biệt, cần giới thiệu rõ.',
  },
];

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
    // reviews: thống nhất 1 tập dùng chung Trail/Studio/Cổng vận hành từ schema v3 (không còn tách
    // userReviews riêng) — xem js/services/reviewsService.js. placeImpressions vẫn tách biệt
    // (cảm nhận tự đánh dấu, không cần booking, không tính vào CPS/average đánh giá chính thức).
    reviews: buildReviews(),
    placeImpressions: [],
    passportStamps: [],
    pointsLedger: [],
    vouchers: [],
    events: buildEvents(),
    supportTickets: [],
    proposals: [],
    contentSubmissions: [],
    providerNotifications: [],
    customDestinations: [],
    customActivityCatalog: [],
    cpsExceptions: [],
    moderationRecords: [],
    hostRecognitionOverrides: {},
    metrics: { monthlyByHost: {} },
    favorites: [],
    viewCounts: {},
    suggestionDecisions: {},
    // Giỏ hành trình ("+ Thêm vào hành trình" hoạt động như giỏ hàng), trung tâm thông báo và
    // nhắc lịch — mới từ schema v3, xem PHASE "Hoàn thiện hành trình, booking, thông báo".
    tripCart: [],
    notifications: [],
    reminders: [],
    notificationsOptIn: false,
    // Booking demo cho "Tổng quan"/"Lịch & Booking" của Host (7/7 đơn vị) — sinh lúc init() theo
    // CURRENT_DEMO_BOOKINGS_VERSION (data/pilot-seed-data.js buildInitialDemoBookings), rồi đóng
    // băng trong localStorage — xem PHASE 15/09/2026.
    hostDemoBookings: [],
    hostDemoBookingsVersion: 0,
    // Phần Host tự chỉnh trên Activity Catalog trung tâm (mô tả/giá/thời lượng/sức chứa/khung giờ/
    // trạng thái công bố) — keyed theo activityId (EXP-01..SITE-07), hợp nhất LIVE lên trên
    // data/pilot-seed-data.js#activityCatalog mỗi lần đọc qua operationsService.getOperations(),
    // KHÔNG đóng băng vào destinations — xem PHASE "Data Linkage" 15/09/2026.
    activityCatalogOverrides: {},
    // Nhật ký hành vi khách thật trong phiên demo + trạng thái xử lý gợi ý "Nhu cầu & Cơ hội" của
    // Management — xem js/storage.js#logCustomerBehaviourEvent/setOpportunityActionStatus.
    customerBehaviourEvents: [],
    opportunityActions: {},
    ui: {
      activeItineraryId: null,
      currentHostId: null,
    },
  };
}
