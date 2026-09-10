// Seed dữ liệu người dùng/vận hành (KHÔNG bao gồm listings — 7 listing pilot được nạp riêng từ
// data/pilot-listings.json qua js/services/destinationsService.js, xem js/storage.js).
//
// Ở phase "Thu gọn dữ liệu thành pilot 7 listing Khmer", toàn bộ trải nghiệm có thể đặt
// (EXPERIENCES)/đánh giá mẫu (REVIEWS)/sự kiện (EVENTS)/gợi ý ghép cặp (PAIR_SUGGESTIONS) của bộ
// 37 địa danh cũ đã được ĐƯA VỀ RỖNG vì:
//   - Không listing pilot nào có supplier đã xác nhận nhận khách/bookable (đúng yêu cầu: không
//     hiển thị EXP-01/02/03 là "đang mở bán"/"đã xác nhận") — nên KHÔNG seed trải nghiệm trả phí
//     hay booking giả cho các host bên dưới, dù đã có hồ sơ.
//   - Không có đánh giá/khách thật cho 7 listing pilot — không được tự thêm số liệu ngoài file.
// HOSTS (bên dưới) đã được khôi phục lại — mỗi host tương ứng 1 trong 7 listing pilot, dùng đúng
// tên/vai trò/địa chỉ đã có trong data/pilot-suppliers.json (nguồn: 2 file Excel do người dùng
// cung cấp) để hồ sơ "người cung cấp dịch vụ" trong Studio không còn trống — nhưng KHÔNG kèm
// doanh thu/lịch sử 12 tháng giả (metrics.monthlyByHost để {} — xem createSeedState) vì đây là
// tên/tổ chức THẬT, chưa xác nhận đồng ý, gắn số liệu tài chính bịa cho họ là không phù hợp.
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
