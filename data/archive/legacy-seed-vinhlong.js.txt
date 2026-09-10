import { uid } from './utils.js';

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// id cố định (không dùng uid() ngẫu nhiên) để bookingItems tham chiếu đúng slot
// qua nhiều phiên, dù ngày giờ của slot được tính lại mỗi lần tải trang.
function slot(expId, index, dayOffset, startTime, endTime, capacity, booked) {
  return {
    id: `${expId}-s${index}`,
    date: addDays(dayOffset),
    startTime,
    endTime,
    capacity,
    booked,
  };
}

const HOSTS = [
  { id: 'host-lo-gom-ba-thanh', name: 'Lò gốm Ba Thạnh', destinationId: 'vuong-quoc-gach-gom-mang-thit', isDemoHost: true, bio: 'Hộ demo minh hoạ mô hình nghệ nhân gốm truyền thống tại làng nghề Mang Thít.' },
  { id: 'host-vuon-ut-hong', name: 'Vườn trái cây Út Hồng', destinationId: 'cu-lao-an-binh', isDemoHost: true, bio: 'Hộ demo minh hoạ mô hình nhà vườn đón khách tham quan tại Cù lao An Bình.' },
  { id: 'host-co-ba', name: 'Nhà vườn Cô Ba', destinationId: 'nha-vuon-co-ba', isDemoHost: true, bio: 'Hộ demo minh hoạ, mới tham gia mạng lưới.' },
  { id: 'host-chu-sau', name: 'Xưởng đan lát Chú Sáu', destinationId: 'xuong-dan-lat-chu-sau', isDemoHost: true, bio: 'Hộ demo minh hoạ, mới tham gia mạng lưới.' },
  { id: 'host-bao-tang-khmer', name: 'Ban hướng dẫn Bảo tàng Khmer Trà Vinh', destinationId: 'bao-tang-khmer-tra-vinh', isDemoHost: false, bio: 'Đơn vị thuyết minh trực thuộc bảo tàng.' },
];

function buildExperiences() {
  return [
    {
      id: 'exp-gom-mang-thit',
      destinationId: 'vuong-quoc-gach-gom-mang-thit',
      hostId: 'host-lo-gom-ba-thanh',
      title: 'Tô màu gốm cùng nghệ nhân',
      description: 'Tự tay tô màu một sản phẩm gốm nhỏ dưới hướng dẫn của nghệ nhân làng nghề.',
      durationMin: 60,
      price: 90000,
      conditions: 'Phù hợp mọi lứa tuổi; trẻ em cần người lớn đi kèm.',
      slots: [
        slot('exp-gom-mang-thit', 1, 1, '09:00', '10:00', 12, 4),
        slot('exp-gom-mang-thit', 2, 2, '14:00', '15:00', 12, 0),
        slot('exp-gom-mang-thit', 3, 4, '09:00', '10:00', 12, 12),
      ],
    },
    {
      id: 'exp-mietvuon-anbinh',
      destinationId: 'cu-lao-an-binh',
      hostId: 'host-vuon-ut-hong',
      title: 'Chèo xuồng miệt vườn + hái trái cây',
      description: 'Chèo xuồng qua các kênh rạch nhỏ, tham quan vườn và hái trái cây theo mùa.',
      durationMin: 120,
      price: 150000,
      conditions: 'Nên mặc đồ thoải mái, có thể lội nước nhẹ. Không phù hợp người không biết bơi đi một mình.',
      slots: [
        slot('exp-mietvuon-anbinh', 1, 1, '08:00', '10:00', 10, 2),
        slot('exp-mietvuon-anbinh', 2, 1, '14:00', '16:00', 10, 6),
        slot('exp-mietvuon-anbinh', 3, 3, '08:00', '10:00', 10, 0),
      ],
    },
    {
      id: 'exp-banhtet-coba',
      destinationId: 'nha-vuon-co-ba',
      hostId: 'host-co-ba',
      title: 'Học gói bánh tét cùng Nhà vườn Cô Ba',
      description: 'Học cách gói và nấu bánh tét truyền thống cùng người dân địa phương.',
      durationMin: 90,
      price: 120000,
      conditions: 'Dữ liệu hộ minh hoạ — giá và lịch mang tính trình diễn.',
      slots: [
        slot('exp-banhtet-coba', 1, 2, '09:00', '10:30', 6, 1),
        slot('exp-banhtet-coba', 2, 5, '09:00', '10:30', 6, 0),
      ],
    },
    {
      id: 'exp-danlat-chusau',
      destinationId: 'xuong-dan-lat-chu-sau',
      hostId: 'host-chu-sau',
      title: 'Đan lát thủ công cùng Chú Sáu',
      description: 'Thử sức với kỹ thuật đan lát từ lá dừa/tre truyền thống.',
      durationMin: 75,
      price: 80000,
      conditions: 'Dữ liệu hộ minh hoạ — giá và lịch mang tính trình diễn.',
      slots: [
        slot('exp-danlat-chusau', 1, 2, '15:00', '16:15', 8, 3),
        slot('exp-danlat-chusau', 2, 4, '09:00', '10:15', 8, 0),
      ],
    },
    {
      id: 'exp-thuyetminh-khmer',
      destinationId: 'bao-tang-khmer-tra-vinh',
      hostId: 'host-bao-tang-khmer',
      title: 'Thuyết minh chuyên sâu văn hoá Khmer',
      description: 'Buổi thuyết minh mở rộng về lịch sử và văn hoá Khmer Nam Bộ cùng hướng dẫn viên bảo tàng.',
      durationMin: 45,
      price: 50000,
      conditions: 'Đăng ký trước tối thiểu 1 ngày.',
      slots: [
        slot('exp-thuyetminh-khmer', 1, 1, '09:30', '10:15', 20, 5),
        slot('exp-thuyetminh-khmer', 2, 3, '09:30', '10:15', 20, 0),
      ],
    },
  ];
}

function buildEvents() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return [
    {
      id: 'ev-ok-om-bok',
      title: 'Lễ hội Ok Om Bok',
      destinationId: 'ao-ba-om',
      date: d.toISOString(),
      description: 'Lễ hội cúng trăng truyền thống của đồng bào Khmer, có đua ghe ngo và thả đèn nước.',
      conditions: 'Miễn phí tham gia khu vực lễ hội chính.',
      note: 'Ngày tổ chức thật theo âm lịch Khmer; ngày hiển thị ở đây do hệ thống demo tự tính để luôn hiển thị "sắp tới".',
    },
  ];
}

function buildReviews() {
  return [
    { id: 'rv-seed-1', destinationId: 'van-thanh-mieu', author: 'Khách demo — Minh', rating: 5, comment: 'Không gian yên tĩnh, hướng dẫn viên nhiệt tình giải thích lịch sử.', date: addDays(-30) },
    { id: 'rv-seed-2', destinationId: 'van-thanh-mieu', author: 'Khách demo — Thảo', rating: 4, comment: 'Đẹp và cổ kính, chỉ hơi khó tìm chỗ gửi xe.', date: addDays(-12) },
    { id: 'rv-seed-3', destinationId: 'chua-ang', author: 'Khách demo — Huy', rating: 5, comment: 'Kiến trúc chạm khắc rất tinh xảo, nên đi kèm hướng dẫn viên để hiểu thêm văn hoá Khmer.', date: addDays(-20) },
    { id: 'rv-seed-4', destinationId: 'chua-ang', author: 'Khách demo — Lan', rating: 5, comment: 'Không gian trang nghiêm, mọi người rất thân thiện.', date: addDays(-6) },
    { id: 'rv-seed-5', destinationId: 'ao-ba-om', author: 'Khách demo — Phúc', rating: 4, comment: 'Cây cổ thụ rất đẹp để chụp ảnh, nên đi vào sáng sớm.', date: addDays(-15) },
    { id: 'rv-seed-6', destinationId: 'cu-lao-an-binh', author: 'Khách demo — Ngọc', rating: 5, comment: 'Trải nghiệm chèo xuồng rất thú vị, trái cây tươi ngon.', date: addDays(-9) },
    { id: 'rv-seed-7', destinationId: 'cu-lao-an-binh', author: 'Khách demo — Hải', rating: 4, comment: 'Phù hợp đi cùng gia đình có trẻ nhỏ.', date: addDays(-3) },
    { id: 'rv-seed-8', destinationId: 'vuong-quoc-gach-gom-mang-thit', author: 'Khách demo — Yến', rating: 5, comment: 'Rất ấn tượng với quy mô các lò gạch cổ, nên có thêm chỗ nghỉ chân.', date: addDays(-18) },
    { id: 'rv-seed-9', destinationId: 'nha-vuon-co-ba', author: 'Khách demo — Trang', rating: 5, comment: 'Hộ demo minh hoạ — nội dung đánh giá mang tính trình diễn.', date: addDays(-2) },
  ];
}

function buildVoucherCatalog() {
  return [
    { id: 'voucher-giam-20k', title: 'Giảm 20.000đ cho trải nghiệm tiếp theo', pointsCost: 100, discountLabel: 'Giảm 20.000đ', condition: 'Áp dụng cho 1 trải nghiệm trả phí bất kỳ, không cộng dồn.', validDays: 30 },
    { id: 'voucher-giam-10pct', title: 'Giảm 10% hoạt động trải nghiệm', pointsCost: 150, discountLabel: 'Giảm 10%', condition: 'Áp dụng tối đa 1 lần/hoạt động, không áp dụng vé tham quan miễn phí.', validDays: 30 },
    { id: 'voucher-uu-tien-dat-cho', title: 'Ưu tiên đặt chỗ dịp lễ hội', pointsCost: 250, discountLabel: 'Ưu tiên xác nhận trong 24h', condition: 'Áp dụng khi đặt trải nghiệm trong 7 ngày quanh sự kiện/lễ hội trên mạng lưới.', validDays: 60 },
  ];
}

export const PAIR_SUGGESTIONS = [
  { id: 'pair-khmer', title: 'Nửa ngày văn hoá Khmer', destinationIds: ['chua-ang', 'ao-ba-om', 'bao-tang-khmer-tra-vinh'] },
  { id: 'pair-lang-nghe', title: 'Trải nghiệm làng nghề thủ công', destinationIds: ['vuong-quoc-gach-gom-mang-thit', 'xuong-dan-lat-chu-sau'] },
  { id: 'pair-mietvuon', title: 'Miệt vườn & ẩm thực dân dã', destinationIds: ['cu-lao-an-binh', 'nha-vuon-co-ba'] },
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

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

// Dữ liệu báo cáo 12 tháng minh hoạ cho Studio — xác định theo hostId nên ổn định trong
// phiên (không đổi ngẫu nhiên mỗi lần vẽ lại biểu đồ); tháng hiện tại được ghi đè bằng số
// liệu thật tính từ booking thật khi hiển thị (xem js/studio/reports.js) để biểu đồ và
// bảng luôn khớp nhau (không tạo biểu đồ khác hẳn dữ liệu thật).
function seededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i += 1) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };
}

function buildMonthlyMetrics(hostIds) {
  const now = new Date();
  const monthlyByHost = {};
  hostIds.forEach((hostId, hostIdx) => {
    const rand = seededRandom(hostId);
    const months = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const base = 800000 + hostIdx * 300000;
      const revenue = Math.round((base + rand() * base * 1.5) / 10000) * 10000;
      const visitors = Math.round(6 + rand() * 20);
      months.push({ label: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), revenue, visitors });
    }
    monthlyByHost[hostId] = months;
  });
  return monthlyByHost;
}

export function createSeedState() {
  return {
    // Không đặt schemaVersion ở đây — đó là version của lưu trữ (xem SCHEMA_VERSION trong
    // storage.js), không phải một phần nội dung/dữ liệu mẫu.
    // destinations được nạp riêng từ data/destinations.json qua destinationsService — xem js/storage.js.
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
    metrics: { monthlyByHost: buildMonthlyMetrics(HOSTS.map((h) => h.id)) },
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
