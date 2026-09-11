// Nguồn dữ liệu mô phỏng TRUNG TÂM cho PHASE "Bổ sung dữ liệu mô phỏng liên kết cho Customer,
// Host và Management" — mọi giao diện (Trail/Studio/Admin/Ops) đọc CÙNG một nguồn ở đây, không
// hard-code số liệu riêng trong từng component/card/chart.
//
// TOÀN BỘ số liệu trong file này là GIẢ ĐỊNH cho mục đích trình diễn prototype (không phải số
// liệu vận hành thật của 7 listing/host) — đánh dấu `dataStatus: 'demo_assumption'`. Cố định,
// không dùng Math.random(), không đổi giữa các lần render/tải trang. Múi giờ dùng cho mọi tính
// toán giờ/ngày trong app: Asia/Ho_Chi_Minh. Xem ghi chú công khai ở DEMO_DATA.md và footer app.
//
// QUYẾT ĐỊNH ĐÃ XÁC NHẬN VỚI NGƯỜI DÙNG (11/09/2026): dữ liệu mô phỏng này gắn trực tiếp vào 7
// listing/host THẬT (không dùng danh tính hư cấu song song) — người dùng đã được hỏi rõ và chọn
// phương án này, chấp nhận đây là số liệu trình diễn chứ không phải số liệu vận hành đã xác nhận.

export const TIMEZONE = 'Asia/Ho_Chi_Minh';
export const DEMO_DATA_NOTE = 'Dữ liệu hoạt động trong bản mẫu được mô phỏng cho mục đích trình diễn.';
export const SEED_DATA_STATUS = 'demo_assumption';

// ---------- 1. Giờ mở cửa / giá / thời lượng / sức chứa cho 7 listing ----------
export const listingOperations = {
  'EXP-01': {
    openingHours: {
      monday: 'closed',
      tuesday: ['08:00-11:00', '14:00-17:00'],
      wednesday: ['08:00-11:00', '14:00-17:00'],
      thursday: ['08:00-11:00', '14:00-17:00'],
      friday: ['08:00-11:00', '14:00-17:00'],
      saturday: ['08:00-11:00', '14:00-17:00'],
      sunday: ['08:00-11:00', '14:00-17:00'],
    },
    openingNote: 'Cần đặt trước, phụ thuộc mùa nguyên liệu',
    durationMinutes: 90,
    pricePerPerson: 180000,
    capacityPerSlot: 12,
  },
  'EXP-02': {
    openingHours: {
      monday: 'by_appointment',
      tuesday: 'by_appointment',
      wednesday: 'by_appointment',
      thursday: 'by_appointment',
      friday: ['09:00-11:00', '15:00-17:00'],
      saturday: ['09:00-11:00', '15:00-17:00'],
      sunday: ['09:00-11:00', '15:00-17:00'],
    },
    openingNote: 'Trải nghiệm hai điểm dừng, cần xác nhận lịch nghệ sĩ',
    durationMinutes: 120,
    pricePerPerson: 280000,
    capacityPerSlot: 20,
  },
  'EXP-03': {
    openingHours: {
      monday: 'closed',
      tuesday: ['08:00-11:00', '13:30-17:00'],
      wednesday: ['08:00-11:00', '13:30-17:00'],
      thursday: ['08:00-11:00', '13:30-17:00'],
      friday: ['08:00-11:00', '13:30-17:00'],
      saturday: ['08:00-11:00', '13:30-17:00'],
      sunday: ['08:00-11:00', '13:30-17:00'],
    },
    openingNote: 'Chỉ nhận khách theo lịch hẹn',
    durationMinutes: 90,
    pricePerPerson: 220000,
    capacityPerSlot: 10,
  },
  'SITE-04': {
    openingHours: { everyday: ['05:00-21:00'] },
    openingNote: 'Giờ của từng điểm nằm trong cụm có thể khác nhau',
    durationMinutes: 90,
    pricePerPerson: 0,
    capacityPerSlot: null,
  },
  'SITE-05': {
    openingHours: { everyday: ['06:00-18:00'] },
    openingNote: 'Có thể hạn chế tham quan trong ngày lễ hoặc nghi lễ',
    durationMinutes: 60,
    pricePerPerson: 0,
    capacityPerSlot: null,
  },
  'SITE-06': {
    openingHours: {
      monday: 'closed',
      tuesday: ['07:00-17:00'],
      wednesday: ['07:00-17:00'],
      thursday: ['07:00-17:00'],
      friday: ['07:00-17:00'],
      saturday: ['07:00-17:00'],
      sunday: ['07:00-17:00'],
    },
    openingNote: 'Giá và lịch trong bản mẫu cần được xác nhận trước khi vận hành thật',
    durationMinutes: 75,
    pricePerPerson: 20000,
    capacityPerSlot: 40,
  },
  'SITE-07': {
    openingHours: { everyday: ['06:00-18:00'] },
    openingNote: 'Không tự ý đi vào khu vực khảo cổ được bảo vệ',
    durationMinutes: 60,
    pricePerPerson: 0,
    capacityPerSlot: null,
  },
};

// ---------- 2. Baseline đánh giá (dữ liệu lịch sử tổng hợp, KHÔNG liệt kê từng review) ----------
// average = ratingSum / reviewCount — luôn tính lại, không cộng dồn trực tiếp (xem reviewsService.js)
export const initialReviewStats = {
  'EXP-01': { ratingSum: 421, reviewCount: 86 },
  'EXP-02': { ratingSum: 301, reviewCount: 64 },
  'EXP-03': { ratingSum: 279, reviewCount: 57 },
  'SITE-04': { ratingSum: 555, reviewCount: 129 },
  'SITE-05': { ratingSum: 8056, reviewCount: 1751 },
  'SITE-06': { ratingSum: 1796, reviewCount: 399 },
  'SITE-07': { ratingSum: 178, reviewCount: 37 },
};

// ---------- 3. Bộ tag cảm nhận theo loại listing ----------
export const reviewTagsByCategory = {
  amThuc: ['Món ăn ngon', 'Đặc trưng địa phương', 'Nguyên liệu tươi', 'Giá cả hợp lý', 'Phục vụ thân thiện', 'Không gian sạch sẽ'],
  amNhacBieuDien: ['Biểu diễn cuốn hút', 'Đậm nét văn hóa', 'Nghệ sĩ thân thiện', 'Câu chuyện dễ hiểu', 'Âm thanh tốt', 'Hoạt động tương tác thú vị'],
  thuCong: ['Hướng dẫn dễ hiểu', 'Nghệ nhân thân thiện', 'Hoạt động sáng tạo', 'Vật liệu phù hợp', 'Sản phẩm mang về đẹp', 'Hiểu thêm về văn hóa Khmer'],
  chuaVaVanHoa: ['Không gian yên bình', 'Kiến trúc đẹp', 'Giá trị văn hóa', 'Cảnh quan sạch sẽ', 'Thông tin dễ hiểu', 'Dễ tìm đường'],
  baoTang: ['Hiện vật phong phú', 'Nội dung dễ hiểu', 'Không gian trưng bày tốt', 'Nhân viên hỗ trợ', 'Hiểu thêm về văn hóa Khmer', 'Đáng để giới thiệu'],
};

// listingId -> nhóm tag áp dụng (dựa theo category thật của từng listing)
export const listingTagGroup = {
  'EXP-01': 'amThuc',
  'EXP-02': 'amNhacBieuDien',
  'EXP-03': 'thuCong',
  'SITE-04': 'chuaVaVanHoa',
  'SITE-05': 'chuaVaVanHoa',
  'SITE-06': 'baoTang',
  'SITE-07': 'chuaVaVanHoa',
};

export function tagsForListing(listingId) {
  return reviewTagsByCategory[listingTagGroup[listingId]] || [];
}

// ---------- 4. Review chi tiết mẫu (~10/listing) — nội dung viết tay, không lặp câu ----------
// Đây là các review HIỂN THỊ MINH HOẠ, đã được TÍNH GỘP trong initialReviewStats ở trên (không
// cộng thêm lần nữa vào ratingSum/reviewCount khi tính average — xem reviewsService.js).
let seedReviewSeq = 0;
function sr({ listingId, hostId, travellerName, overallRating, tags, comment, wouldRecommend, visitDate }) {
  seedReviewSeq += 1;
  return {
    id: `seed-review-${listingId}-${String(seedReviewSeq).padStart(3, '0')}`,
    listingId,
    hostId,
    travellerName,
    overallRating,
    selectedTags: tags,
    comment,
    wouldRecommend,
    visitDate,
    createdAt: `${visitDate}T10:00:00+07:00`,
    status: 'published',
    source: 'seed_demo',
    dataStatus: SEED_DATA_STATUS,
  };
}

export const seedReviews = [
  // EXP-01 — Trải nghiệm giã cốm dẹp (hostId: host-com-dep-tuan-viet)
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Nguyễn Thị Hoa', overallRating: 5, tags: ['Món ăn ngon', 'Đặc trưng địa phương', 'Phục vụ thân thiện'], comment: 'Phần giã cốm rất vui, cô chú hướng dẫn chậm và dễ hiểu. Cả nhà mình ai cũng thử được.', wouldRecommend: true, visitDate: '2026-06-14' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Trần Văn Nam', overallRating: 5, tags: ['Nguyên liệu tươi', 'Đặc trưng địa phương'], comment: 'Lúa nếp non thơm, giã xong ăn liền tại chỗ luôn, khác hẳn cốm mua ngoài chợ.', wouldRecommend: true, visitDate: '2026-06-22' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Lê Thị Mai', overallRating: 4, tags: ['Món ăn ngon', 'Giá cả hợp lý'], comment: 'Trải nghiệm hay, chỉ hơi nắng lúc trưa nên mong có thêm chỗ ngồi có mái che.', wouldRecommend: true, visitDate: '2026-07-02' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Sarah K.', overallRating: 5, tags: ['Đặc trưng địa phương', 'Phục vụ thân thiện', 'Không gian sạch sẽ'], comment: 'A very authentic experience, the family who hosted us was so warm and patient with our kids.', wouldRecommend: true, visitDate: '2026-07-10' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Phạm Minh Tuấn', overallRating: 5, tags: ['Món ăn ngon', 'Phục vụ thân thiện'], comment: 'Được nghe kể chuyện Ok Om Bok trong lúc giã cốm, vừa ăn vừa học thêm văn hoá, rất đáng nhớ.', wouldRecommend: true, visitDate: '2026-07-18' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Đỗ Thị Lan', overallRating: 4, tags: ['Món ăn ngon', 'Không gian sạch sẽ'], comment: 'Ngon và vui, nhưng nên báo trước là cần đặt lịch sớm vì phụ thuộc mùa lúa.', wouldRecommend: true, visitDate: '2026-08-01' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Vũ Đức Anh', overallRating: 5, tags: ['Giá cả hợp lý', 'Đặc trưng địa phương'], comment: 'Giá hợp lý cho trải nghiệm tay chân đúng chất miền Tây, nhóm bạn mình 6 người ai cũng thích.', wouldRecommend: true, visitDate: '2026-08-09' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Hoàng Thị Thu', overallRating: 5, tags: ['Phục vụ thân thiện', 'Món ăn ngon'], comment: 'Cô chủ nhà vui tính, chỉ từng bước một, cốm dẹp trộn dừa ăn xong muốn mua thêm về làm quà.', wouldRecommend: true, visitDate: '2026-08-20' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Bùi Văn Long', overallRating: 4, tags: ['Đặc trưng địa phương', 'Giá cả hợp lý'], comment: 'Trải nghiệm chân thực, chỉ mong đường vào xưởng dễ đi hơn cho xe lớn.', wouldRecommend: true, visitDate: '2026-08-28' }),
  sr({ listingId: 'EXP-01', hostId: 'host-com-dep-tuan-viet', travellerName: 'Ngô Thị Hương', overallRating: 5, tags: ['Không gian sạch sẽ', 'Phục vụ thân thiện'], comment: 'Sạch sẽ, gọn gàng, các bé nhà mình được tự tay giã cốm nên thích lắm.', wouldRecommend: true, visitDate: '2026-09-05' }),

  // EXP-02 — Trải nghiệm âm nhạc và múa truyền thống Khmer (hostId: host-nhac-mua-khmer)
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Đặng Minh Khôi', overallRating: 5, tags: ['Biểu diễn cuốn hút', 'Đậm nét văn hóa'], comment: 'Xem nghệ nhân Lâm Phên chế tác nhạc cụ rồi qua xem Rô-băm, hai trải nghiệm bổ trợ nhau rất khéo.', wouldRecommend: true, visitDate: '2026-06-20' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Trịnh Thị Nga', overallRating: 5, tags: ['Nghệ sĩ thân thiện', 'Câu chuyện dễ hiểu'], comment: 'Chú Lâm Phên giải thích cấu tạo dàn ngũ âm rất dễ hiểu, cả nhóm hỏi gì cũng trả lời nhiệt tình.', wouldRecommend: true, visitDate: '2026-06-30' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Marco R.', overallRating: 4, tags: ['Đậm nét văn hóa', 'Âm thanh tốt'], comment: 'The Robam excerpt was mesmerizing, though we had to wait a bit between the two stops.', wouldRecommend: true, visitDate: '2026-07-08' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Nguyễn Thành Đạt', overallRating: 5, tags: ['Biểu diễn cuốn hút', 'Hoạt động tương tác thú vị'], comment: 'Được thử đánh vài nhịp trên nhạc cụ, cảm giác rất đặc biệt, không chỉ đứng xem.', wouldRecommend: true, visitDate: '2026-07-16' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Phan Thị Bích', overallRating: 4, tags: ['Đậm nét văn hóa', 'Câu chuyện dễ hiểu'], comment: 'Nội dung hay, chỉ hơi ngắn thời gian ở điểm dừng thứ hai so với kỳ vọng.', wouldRecommend: true, visitDate: '2026-07-24' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Lâm Văn Phúc', overallRating: 5, tags: ['Nghệ sĩ thân thiện', 'Đậm nét văn hóa'], comment: 'Ấn tượng nhất là được nghe câu chuyện về mặt nạ Rô-băm trước khi xem biểu diễn.', wouldRecommend: true, visitDate: '2026-08-02' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Trương Thị Diễm', overallRating: 5, tags: ['Biểu diễn cuốn hút', 'Âm thanh tốt'], comment: 'Âm thanh sống động, không gian biểu diễn tuy nhỏ nhưng gần gũi, xem rất đã.', wouldRecommend: true, visitDate: '2026-08-11' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Hồ Minh Quân', overallRating: 4, tags: ['Câu chuyện dễ hiểu', 'Đậm nét văn hóa'], comment: 'Rất đáng xem, mong sau này có thêm phụ đề tiếng Anh cho khách nước ngoài.', wouldRecommend: true, visitDate: '2026-08-19' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Châu Thị Kim', overallRating: 5, tags: ['Nghệ sĩ thân thiện', 'Hoạt động tương tác thú vị'], comment: 'Đoàn Ánh Bình Minh biểu diễn nhiệt huyết, cuối buổi còn cho chụp ảnh cùng trang phục.', wouldRecommend: true, visitDate: '2026-08-30' }),
  sr({ listingId: 'EXP-02', hostId: 'host-nhac-mua-khmer', travellerName: 'Lý Gia Bảo', overallRating: 5, tags: ['Đậm nét văn hóa', 'Biểu diễn cuốn hút'], comment: 'Một buổi trải nghiệm văn hoá trọn vẹn, đúng thứ mình tìm khi đến Vĩnh Long.', wouldRecommend: true, visitDate: '2026-09-06' }),

  // EXP-03 — Trải nghiệm làm mặt nạ Khmer thu nhỏ (hostId: host-mat-na-khmer)
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Trần Thị Ngọc', overallRating: 5, tags: ['Nghệ nhân thân thiện', 'Hiểu thêm về văn hóa Khmer'], comment: 'Chú Lâm Phên kiên nhẫn chỉ từng bước tô mặt nạ, mình mang về một món quà lưu niệm rất ý nghĩa.', wouldRecommend: true, visitDate: '2026-06-17' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Nguyễn Hữu Phát', overallRating: 5, tags: ['Hoạt động sáng tạo', 'Sản phẩm mang về đẹp'], comment: 'Workshop nhỏ gọn nhưng chất lượng, mặt nạ tự tô xong đẹp hơn mình tưởng nhiều.', wouldRecommend: true, visitDate: '2026-06-27' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Lê Thị Kiều', overallRating: 5, tags: ['Hướng dẫn dễ hiểu', 'Nghệ nhân thân thiện'], comment: 'Được nghe giải thích ý nghĩa từng vai khỉ, chằn trước khi vẽ nên hiểu sâu hơn nhiều.', wouldRecommend: true, visitDate: '2026-07-05' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Emily T.', overallRating: 5, tags: ['Hiểu thêm về văn hóa Khmer', 'Hoạt động sáng tạo'], comment: 'Such a thoughtful, hands-on way to learn about Khmer mask-making traditions. Loved it.', wouldRecommend: true, visitDate: '2026-07-13' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Phạm Văn Hùng', overallRating: 4, tags: ['Vật liệu phù hợp', 'Nghệ nhân thân thiện'], comment: 'Rất thú vị, chỉ hơi ít thời gian cho phần sơn màu vì cả nhóm 8 người phải chia lượt.', wouldRecommend: true, visitDate: '2026-07-21' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Đinh Thị Yến', overallRating: 5, tags: ['Sản phẩm mang về đẹp', 'Hoạt động sáng tạo'], comment: 'Con mình mê mẩn cả buổi, về nhà còn khoe mặt nạ tự làm với cả lớp.', wouldRecommend: true, visitDate: '2026-08-04' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Trịnh Văn Sơn', overallRating: 5, tags: ['Hướng dẫn dễ hiểu', 'Hiểu thêm về văn hóa Khmer'], comment: 'Nghệ nhân giải thích rõ ràng, dễ hiểu, không hề khô khan như mình tưởng ban đầu.', wouldRecommend: true, visitDate: '2026-08-14' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Mai Thị Thảo', overallRating: 5, tags: ['Nghệ nhân thân thiện', 'Sản phẩm mang về đẹp'], comment: 'Trải nghiệm ấm cúng, đúng kiểu gặp gỡ nghệ nhân thật chứ không phải trình diễn cho có.', wouldRecommend: true, visitDate: '2026-08-23' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Vương Đức Thịnh', overallRating: 5, tags: ['Hoạt động sáng tạo', 'Hiểu thêm về văn hóa Khmer'], comment: 'Một trong những hoạt động đáng nhớ nhất chuyến đi Vĩnh Long của mình.', wouldRecommend: true, visitDate: '2026-09-01' }),
  sr({ listingId: 'EXP-03', hostId: 'host-mat-na-khmer', travellerName: 'Chu Thị Hằng', overallRating: 5, tags: ['Nghệ nhân thân thiện', 'Hướng dẫn dễ hiểu'], comment: 'Chỉ tiếc là chưa đặt được lịch sớm hơn, may mà chú Lâm Phên sắp xếp linh động.', wouldRecommend: true, visitDate: '2026-09-08' }),

  // SITE-04 — Làng Văn hóa – Du lịch dân tộc Khmer và Ao Bà Om (hostId: host-lang-van-hoa-nguyet-hoa)
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Nguyễn Văn Bình', overallRating: 5, tags: ['Cảnh quan sạch sẽ', 'Không gian yên bình'], comment: 'Đi dạo quanh Ao Bà Om lúc chiều mát rất dễ chịu, cây cổ thụ tán rộng che bóng cả lối đi.', wouldRecommend: true, visitDate: '2026-06-16' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Lê Thị Kim Anh', overallRating: 4, tags: ['Giá trị văn hóa', 'Dễ tìm đường'], comment: 'Cụm điểm khá rộng, có bảng chỉ dẫn nhưng mong có thêm bản đồ tổng thể ở lối vào.', wouldRecommend: true, visitDate: '2026-06-25' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'James L.', overallRating: 4, tags: ['Không gian yên bình', 'Cảnh quan sạch sẽ'], comment: 'Peaceful spot to combine with the pagoda and museum nearby, worth a half-day visit.', wouldRecommend: true, visitDate: '2026-07-03' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Phạm Thị Tuyết', overallRating: 5, tags: ['Cảnh quan sạch sẽ', 'Giá trị văn hóa'], comment: 'Không gian rộng rãi, sạch sẽ, đi cả gia đình 3 thế hệ đều thoải mái dạo bộ.', wouldRecommend: true, visitDate: '2026-07-14' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Trần Công Danh', overallRating: 3, tags: ['Dễ tìm đường'], comment: 'Cảnh đẹp nhưng cuối tuần khá đông, bãi đậu xe hơi hạn chế nên phải chờ lâu.', wouldRecommend: true, visitDate: '2026-07-27' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Đoàn Thị Ngân', overallRating: 4, tags: ['Không gian yên bình', 'Giá trị văn hóa'], comment: 'Kết hợp tham quan Ao Bà Om, Chùa Âng và bảo tàng trong một buổi rất hợp lý.', wouldRecommend: true, visitDate: '2026-08-06' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Huỳnh Văn Tài', overallRating: 5, tags: ['Cảnh quan sạch sẽ', 'Không gian yên bình'], comment: 'Sáng sớm ở đây rất yên tĩnh, nghe chim hót, đi bộ quanh ao rất thư giãn.', wouldRecommend: true, visitDate: '2026-08-15' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Nguyễn Thị Kim Phượng', overallRating: 4, tags: ['Giá trị văn hóa', 'Dễ tìm đường'], comment: 'Nơi tốt để tìm hiểu văn hoá Khmer trong vùng, bảng thông tin viết khá đầy đủ.', wouldRecommend: true, visitDate: '2026-08-24' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Võ Minh Trí', overallRating: 5, tags: ['Cảnh quan sạch sẽ', 'Giá trị văn hóa'], comment: 'Địa điểm rất đáng ghé nếu thích chụp ảnh, cây cổ thụ và mặt ao tạo khung hình đẹp.', wouldRecommend: true, visitDate: '2026-09-02' }),
  sr({ listingId: 'SITE-04', hostId: 'host-lang-van-hoa-nguyet-hoa', travellerName: 'Lâm Thị Bích Trâm', overallRating: 4, tags: ['Không gian yên bình', 'Dễ tìm đường'], comment: 'Miễn phí tham quan mà không gian đẹp và sạch, gia đình mình sẽ quay lại lần nữa.', wouldRecommend: true, visitDate: '2026-09-09' }),

  // SITE-05 — Chùa Âng (hostId: host-chua-ang)
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Trương Thị Hồng', overallRating: 5, tags: ['Kiến trúc đẹp', 'Không gian yên bình'], comment: 'Kiến trúc chùa cổ rất đẹp, các cột gỗ chạm rồng sơn son thếp vàng nhìn công phu.', wouldRecommend: true, visitDate: '2026-06-12' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Ngô Văn Khải', overallRating: 5, tags: ['Giá trị văn hóa', 'Cảnh quan sạch sẽ'], comment: 'Không gian trang nghiêm, khuôn viên nhiều cây xanh, đi chậm rãi ngắm kiến trúc rất thích.', wouldRecommend: true, visitDate: '2026-06-24' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Anna P.', overallRating: 4, tags: ['Kiến trúc đẹp', 'Thông tin dễ hiểu'], comment: 'Beautiful old pagoda, would love a bit more signage in English to understand the history.', wouldRecommend: true, visitDate: '2026-07-01' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Đặng Thị Thanh', overallRating: 5, tags: ['Không gian yên bình', 'Kiến trúc đẹp'], comment: 'Ghé vào buổi sáng sớm, gần như không có ai, cảm giác thanh tịnh khó tả.', wouldRecommend: true, visitDate: '2026-07-12' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Phan Đình Khang', overallRating: 5, tags: ['Giá trị văn hóa', 'Dễ tìm đường'], comment: 'Chùa nằm ngay trong cụm Ao Bà Om nên dễ đi, đáng để dành thời gian tham quan kỹ.', wouldRecommend: true, visitDate: '2026-07-23' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Lê Thị Ngọc Diễm', overallRating: 4, tags: ['Kiến trúc đẹp', 'Cảnh quan sạch sẽ'], comment: 'Rất đẹp, chỉ tiếc hôm mình đi có đoàn quay phim nên hơi đông người ở chánh điện.', wouldRecommend: true, visitDate: '2026-08-03' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Trần Quốc Việt', overallRating: 5, tags: ['Không gian yên bình', 'Giá trị văn hóa'], comment: 'Một trong những ngôi chùa Khmer đẹp nhất mình từng ghé, rất nên đi khi đến Vĩnh Long.', wouldRecommend: true, visitDate: '2026-08-13' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Huỳnh Thị Mỹ Duyên', overallRating: 4, tags: ['Thông tin dễ hiểu', 'Kiến trúc đẹp'], comment: 'Có bảng giới thiệu ở cổng vào khá dễ hiểu, giúp mình biết thêm về lịch sử chùa.', wouldRecommend: true, visitDate: '2026-08-22' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Dương Minh Nhật', overallRating: 5, tags: ['Kiến trúc đẹp', 'Cảnh quan sạch sẽ'], comment: 'Chụp ảnh cực đẹp, ánh sáng buổi chiều chiếu vào mái chùa rất nổi bật.', wouldRecommend: true, visitDate: '2026-08-31' }),
  sr({ listingId: 'SITE-05', hostId: 'host-chua-ang', travellerName: 'Nguyễn Thị Xuân Mai', overallRating: 5, tags: ['Giá trị văn hóa', 'Không gian yên bình'], comment: 'Đi lễ Phật kết hợp tìm hiểu văn hoá Khmer Nam Bộ, mình thấy rất ý nghĩa.', wouldRecommend: true, visitDate: '2026-09-07' }),

  // SITE-06 — Bảo tàng Văn hóa dân tộc Khmer (hostId: host-bao-tang-khmer)
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Lý Thị Thu Trang', overallRating: 5, tags: ['Hiện vật phong phú', 'Hiểu thêm về văn hóa Khmer'], comment: 'Nhiều hiện vật đặc sắc về nhạc cụ và trang phục, đi một vòng mất gần 1 tiếng mà vẫn muốn xem thêm.', wouldRecommend: true, visitDate: '2026-06-18' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Phạm Nhật Anh', overallRating: 4, tags: ['Hiện vật phong phú', 'Hiểu thêm về văn hóa Khmer'], comment: 'Nhiều hiện vật thú vị, nếu có thêm audio guide sẽ dễ theo dõi hơn.', wouldRecommend: true, visitDate: '2026-06-29' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Đỗ Văn Kiên', overallRating: 4, tags: ['Nội dung dễ hiểu', 'Không gian trưng bày tốt'], comment: 'Bố cục trưng bày theo 4 nhóm chủ đề khá rõ ràng, dễ theo mạch tham quan.', wouldRecommend: true, visitDate: '2026-07-06' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Sophie M.', overallRating: 5, tags: ['Hiện vật phong phú', 'Nhân viên hỗ trợ'], comment: 'The staff were very helpful explaining the ritual objects, a great stop to understand Khmer heritage.', wouldRecommend: true, visitDate: '2026-07-17' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Trịnh Thị Kim Ngân', overallRating: 4, tags: ['Không gian trưng bày tốt', 'Đáng để giới thiệu'], comment: 'Không gian mát mẻ, sạch sẽ, phù hợp ghé vào buổi trưa nắng gắt.', wouldRecommend: true, visitDate: '2026-07-28' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Nguyễn Đình Phong', overallRating: 3, tags: ['Hiện vật phong phú'], comment: 'Hiện vật phong phú nhưng một số bảng chú thích đã cũ, khó đọc hết nội dung.', wouldRecommend: true, visitDate: '2026-08-05' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Lâm Thị Yến Nhi', overallRating: 5, tags: ['Hiểu thêm về văn hóa Khmer', 'Đáng để giới thiệu'], comment: 'Ghé qua trước khi đi Chùa Âng, giúp mình hiểu bối cảnh văn hoá trước khi tham quan chùa.', wouldRecommend: true, visitDate: '2026-08-16' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Vũ Thị Hải Yến', overallRating: 5, tags: ['Nhân viên hỗ trợ', 'Nội dung dễ hiểu'], comment: 'Nhân viên nhiệt tình giải thích thêm khi mình hỏi về mặt nạ Rô-băm trưng bày.', wouldRecommend: true, visitDate: '2026-08-25' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Hoàng Văn Đức', overallRating: 4, tags: ['Hiện vật phong phú', 'Không gian trưng bày tốt'], comment: 'Bảo tàng nhỏ gọn nhưng sắp xếp khoa học, đáng ghé nếu thích tìm hiểu lịch sử.', wouldRecommend: true, visitDate: '2026-09-03' }),
  sr({ listingId: 'SITE-06', hostId: 'host-bao-tang-khmer', travellerName: 'Đinh Thị Thu Hà', overallRating: 5, tags: ['Hiểu thêm về văn hóa Khmer', 'Hiện vật phong phú'], comment: 'Kết hợp với chuyến workshop mặt nạ, mình hiểu thêm nhiều về ý nghĩa hiện vật đang trưng bày.', wouldRecommend: true, visitDate: '2026-09-10' }),

  // SITE-07 — Chùa Lò Gạch (hostId: host-chua-lo-gach)
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'Bùi Thị Kim Loan', overallRating: 5, tags: ['Không gian yên bình', 'Giá trị văn hóa'], comment: 'Chùa nhỏ nhưng yên tĩnh, cạnh khu khảo cổ Bờ Lũy nên vừa lễ Phật vừa tìm hiểu lịch sử.', wouldRecommend: true, visitDate: '2026-06-19' }),
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'Trần Minh Hiếu', overallRating: 5, tags: ['Giá trị văn hóa', 'Dễ tìm đường'], comment: 'Ít khách nên rất yên tĩnh, sư thầy sẵn lòng kể chuyện lịch sử chùa và khu khai quật.', wouldRecommend: true, visitDate: '2026-07-04' }),
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'David N.', overallRating: 4, tags: ['Không gian yên bình', 'Kiến trúc đẹp'], comment: 'A quiet, lesser-known pagoda, interesting to learn it sits next to a national archaeological site.', wouldRecommend: true, visitDate: '2026-07-15' }),
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'Nguyễn Thị Cẩm Tú', overallRating: 5, tags: ['Không gian yên bình', 'Cảnh quan sạch sẽ'], comment: 'Không gian trong lành, thoáng đãng, thích hợp cho ai muốn tránh chỗ đông khách.', wouldRecommend: true, visitDate: '2026-07-26' }),
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'Lê Văn Quang', overallRating: 5, tags: ['Giá trị văn hóa', 'Không gian yên bình'], comment: 'Đi cùng người thân lớn tuổi, đường vào dễ, không gian rất tĩnh lặng để nghỉ ngơi.', wouldRecommend: true, visitDate: '2026-08-07' }),
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'Phạm Thị Bảo Trân', overallRating: 4, tags: ['Dễ tìm đường', 'Giá trị văn hóa'], comment: 'Đường vào hơi nhỏ nhưng dễ tìm nhờ chỉ dẫn trên bản đồ, đáng để kết hợp với xưởng Lâm Phên gần đó.', wouldRecommend: true, visitDate: '2026-08-17' }),
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'Nguyễn Hoàng Long', overallRating: 5, tags: ['Không gian yên bình', 'Kiến trúc đẹp'], comment: 'Ít người biết đến nên rất riêng tư, kiến trúc chùa giản dị nhưng có nét đẹp riêng.', wouldRecommend: true, visitDate: '2026-08-26' }),
  sr({ listingId: 'SITE-07', hostId: 'host-chua-lo-gach', travellerName: 'Tô Thị Diễm My', overallRating: 5, tags: ['Cảnh quan sạch sẽ', 'Giá trị văn hóa'], comment: 'Cảnh quan gọn gàng, sạch sẽ, mình ấn tượng với câu chuyện khu khảo cổ Bờ Lũy bên cạnh.', wouldRecommend: true, visitDate: '2026-09-04' }),
];

// ---------- 5. Dữ liệu tham gia/lượt ghé 12 tháng (09/2025 – 08/2026) ----------
export const MONTHS_12 = ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];

export const monthlyParticipants = {
  'EXP-01': [62, 68, 74, 70, 82, 88, 93, 97, 101, 116, 142, 130],
  'EXP-02': [35, 38, 42, 46, 49, 54, 58, 61, 66, 78, 94, 88],
  'EXP-03': [28, 32, 36, 40, 44, 48, 52, 56, 62, 72, 85, 80],
};

export const monthlyVisits = {
  'SITE-04': [880, 940, 1020, 970, 1050, 1120, 1180, 1240, 1320, 1450, 1680, 1540],
  'SITE-05': [720, 780, 860, 810, 890, 950, 1010, 1080, 1160, 1280, 1490, 1370],
  'SITE-06': [390, 420, 470, 450, 510, 560, 600, 640, 690, 770, 890, 820],
  'SITE-07': [210, 225, 248, 235, 260, 290, 315, 340, 360, 410, 475, 440],
};

const PROVIDER_BY_EXPERIENCE = {
  'EXP-01': 'host-com-dep-tuan-viet',
  'EXP-02': 'host-nhac-mua-khmer',
  'EXP-03': 'host-mat-na-khmer',
};

// Số người/booking trung bình — GIẢ ĐỊNH cố định dùng để suy ra completedBookings từ participants
// (spec chỉ cho ví dụ 1 tháng của EXP-01: 62 khách / 18 booking ≈ 3,44 người/booking — áp dụng
// đúng tỷ lệ này cho EXP-01; EXP-02/EXP-03 dùng tỷ lệ giả định riêng, ghi rõ ở đây để minh bạch).
const AVG_PARTY_SIZE = { 'EXP-01': 3.4, 'EXP-02': 3.6, 'EXP-03': 2.8 };
const PLATFORM_FEE_RATE = 0.1;

function buildExperienceHistoricalMetrics() {
  const records = [];
  Object.entries(monthlyParticipants).forEach(([listingId, values]) => {
    const providerId = PROVIDER_BY_EXPERIENCE[listingId];
    const price = listingOperations[listingId].pricePerPerson;
    const avgParty = AVG_PARTY_SIZE[listingId];
    values.forEach((participants, i) => {
      const completedBookings = Math.round(participants / avgParty);
      const cancelledBookings = Math.max(1, Math.round(completedBookings * 0.1));
      const grossRevenue = participants * price;
      const refunds = 0; // hoàn tiền lịch sử để 0 — minh hoạ "có hoàn tiền" dùng luồng booking/huỷ thật đang chạy, không bịa thêm ở đây
      const platformFee = Math.round(grossRevenue * PLATFORM_FEE_RATE);
      const providerIncome = grossRevenue - platformFee - refunds;
      records.push({
        id: `hm-${listingId}-${MONTHS_12[i]}`,
        month: MONTHS_12[i],
        listingId,
        providerId,
        participants,
        completedBookings,
        cancelledBookings,
        grossRevenue,
        refunds,
        platformFee,
        providerIncome,
        dataStatus: SEED_DATA_STATUS,
        source: 'seed_demo',
      });
    });
  });
  return records;
}

// SITE-06: doanh thu vé bảo tàng (20.000đ/lượt) — TÁCH khỏi nhóm hộ dân/nghệ nhân (providerType
// 'cultural_organisation', xem destinationsService.js), không có "booking" rời rạc (vé lẻ theo lượt).
function buildMuseumHistoricalMetrics() {
  const listingId = 'SITE-06';
  const providerId = 'host-bao-tang-khmer';
  const price = listingOperations[listingId].pricePerPerson;
  return monthlyVisits[listingId].map((visits, i) => {
    const grossRevenue = visits * price;
    const platformFee = Math.round(grossRevenue * PLATFORM_FEE_RATE);
    return {
      id: `hm-${listingId}-${MONTHS_12[i]}`,
      month: MONTHS_12[i],
      listingId,
      providerId,
      participants: visits,
      completedBookings: null, // vé lẻ theo lượt, không phải booking theo slot
      cancelledBookings: 0,
      grossRevenue,
      refunds: 0,
      platformFee,
      providerIncome: grossRevenue - platformFee,
      dataStatus: SEED_DATA_STATUS,
      source: 'seed_demo',
    };
  });
}

// historicalMetrics: CHỈ các listing thực sự có doanh thu (3 trải nghiệm cộng đồng + bảo tàng).
// SITE-04/05/07 KHÔNG có bản ghi ở đây (đúng yêu cầu "không xuất hiện trong biểu đồ chia sẻ doanh
// thu nếu doanh thu bằng 0") — lượt ghé của chúng nằm ở visitMetrics bên dưới.
export const historicalMetrics = [...buildExperienceHistoricalMetrics(), ...buildMuseumHistoricalMetrics()];

// visitMetrics: lượt ghé (visitInstances) cho 4 điểm miễn phí/tham quan tự do — bao gồm CẢ SITE-06
// (để tính "tổng lượt trải nghiệm" mạng lưới thống nhất qua 1 trường duy nhất, tránh đếm trùng với
// participants trong historicalMetrics của SITE-06 — xem ghi chú ở adminMetricsService.js).
export const monthlyVisitsAll = { ...monthlyVisits };
export function buildVisitMetrics() {
  const records = [];
  Object.entries(monthlyVisitsAll).forEach(([listingId, values]) => {
    values.forEach((visitInstances, i) => {
      records.push({
        id: `vm-${listingId}-${MONTHS_12[i]}`,
        month: MONTHS_12[i],
        listingId,
        visitInstances,
        dataStatus: SEED_DATA_STATUS,
        source: 'seed_demo',
      });
    });
  });
  return records;
}
export const visitMetrics = buildVisitMetrics();
