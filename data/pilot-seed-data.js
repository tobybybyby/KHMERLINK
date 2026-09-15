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

// ---------- 1. Activity Catalog trung tâm — giờ mở cửa / giá / thời lượng / sức chứa / khung giờ /
// cơ chế tài chính / trạng thái công bố cho 7 listing (PHASE "Data Linkage" 15/09/2026) ----------
// NGUYÊN TẮC: đây là NGUỒN DUY NHẤT cho các trường hoạt động (giá/thời lượng/sức chứa/khung giờ/
// financialMode) — Customer (destinationsService/operationsService), Host (Studio Trải nghiệm),
// AI gợi ý hành trình (aiService), booking demo (buildInitialDemoBookings bên dưới) và Cổng quản lý
// ĐỀU đọc qua getOperations()/getActivityCatalogEntry() (operationsService.js), không hard-code
// riêng ở component nào. Host có thể ghi đè một số trường qua state.activityCatalogOverrides (xem
// storage.updateActivityCatalogOverride) — override hợp nhất LIVE mỗi lần đọc, không đóng băng vào
// state.destinations, để đổi 1 nơi thấy khắp nơi (kể cả sau khi đồng bộ localStorage giữa các tab).
// id ở đây CHÍNH LÀ destinationId/listing id (EXP-01..SITE-07) — không tạo hệ id song song.
export const activityCatalog = {
  'EXP-01': {
    activityId: 'EXP-01',
    providerAccountId: 'host-com-dep-tuan-viet',
    partnerProviderIds: null,
    offeringType: 'paid_experience',
    financialMode: 'community_paid',
    platformFeeRate: 0.10,
    revenueSplitNote: null,
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
    capacity: 12,
    availableTimeSlots: ['08:00', '09:30', '14:00', '15:30'],
    culturalNotes: null,
    visitRegistrationEnabled: false,
    bookable: true,
    publicationStatus: 'published',
    updatedAt: null,
  },
  'EXP-02': {
    activityId: 'EXP-02',
    providerAccountId: 'host-nhac-mua-khmer',
    partnerProviderIds: ['LAM-PHEN', 'ANH-BINH-MINH'],
    offeringType: 'paid_experience',
    financialMode: 'community_paid',
    platformFeeRate: 0.10,
    revenueSplitNote: 'Nếu chia theo đơn vị hợp tác: Xưởng NNƯT Lâm Phên 45% · Đoàn Nghệ thuật Khmer Ánh Bình Minh 55% (minh hoạ tỷ lệ chia, booking vẫn tính 1 lần duy nhất trong tổng mạng lưới, không nhân đôi).',
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
    capacity: 20,
    availableTimeSlots: ['09:00', '15:00'],
    culturalNotes: null,
    visitRegistrationEnabled: false,
    bookable: true,
    publicationStatus: 'published',
    updatedAt: null,
  },
  'EXP-03': {
    activityId: 'EXP-03',
    providerAccountId: 'host-mat-na-khmer',
    partnerProviderIds: null,
    offeringType: 'paid_experience',
    financialMode: 'community_paid',
    platformFeeRate: 0.10,
    revenueSplitNote: null,
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
    capacity: 10,
    availableTimeSlots: ['08:00', '09:30', '13:30', '15:00'],
    culturalNotes: null,
    visitRegistrationEnabled: false,
    bookable: true,
    publicationStatus: 'published',
    updatedAt: null,
  },
  'SITE-04': {
    activityId: 'SITE-04',
    providerAccountId: 'host-lang-van-hoa-nguyet-hoa',
    partnerProviderIds: null,
    offeringType: 'free_cultural_visit',
    financialMode: 'free_visit',
    platformFeeRate: 0,
    revenueSplitNote: null,
    openingHours: { everyday: ['05:00-21:00'] },
    openingNote: 'Giờ của từng điểm nằm trong cụm có thể khác nhau',
    durationMinutes: 90,
    pricePerPerson: 0,
    capacityPerSlot: null,
    capacity: null,
    availableTimeSlots: ['08:00', '15:00'],
    culturalNotes: null,
    visitRegistrationEnabled: true,
    bookable: false,
    publicationStatus: 'published',
    updatedAt: null,
  },
  'SITE-05': {
    activityId: 'SITE-05',
    providerAccountId: 'host-chua-ang',
    partnerProviderIds: null,
    offeringType: 'free_cultural_visit',
    financialMode: 'free_visit',
    platformFeeRate: 0,
    revenueSplitNote: null,
    openingHours: { everyday: ['06:00-18:00'] },
    openingNote: 'Có thể hạn chế tham quan trong ngày lễ hoặc nghi lễ',
    durationMinutes: 60,
    pricePerPerson: 0,
    capacityPerSlot: null,
    capacity: null,
    availableTimeSlots: ['08:00', '15:00'],
    culturalNotes: ['Ăn mặc lịch sự', 'Giữ yên lặng tại không gian thờ tự', 'Không thương mại hóa nghi lễ tôn giáo'],
    visitRegistrationEnabled: true,
    bookable: false,
    publicationStatus: 'published',
    updatedAt: null,
  },
  'SITE-06': {
    activityId: 'SITE-06',
    providerAccountId: 'host-bao-tang-khmer',
    partnerProviderIds: null,
    offeringType: 'public_ticket_visit',
    financialMode: 'public_ticket',
    platformFeeRate: 0,
    revenueSplitNote: null,
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
    capacity: 40,
    availableTimeSlots: ['07:30', '09:00', '10:30', '13:30', '15:00'],
    culturalNotes: null,
    visitRegistrationEnabled: false,
    bookable: true,
    publicationStatus: 'published',
    updatedAt: null,
  },
  'SITE-07': {
    activityId: 'SITE-07',
    providerAccountId: 'host-chua-lo-gach',
    partnerProviderIds: null,
    offeringType: 'free_cultural_visit',
    financialMode: 'free_visit',
    platformFeeRate: 0,
    revenueSplitNote: null,
    openingHours: { everyday: ['06:00-18:00'] },
    openingNote: 'Không tự ý đi vào khu vực khảo cổ được bảo vệ',
    durationMinutes: 60,
    pricePerPerson: 0,
    capacityPerSlot: null,
    capacity: null,
    availableTimeSlots: ['08:00', '15:00'],
    culturalNotes: ['Ăn mặc lịch sự', 'Tôn trọng không gian tôn giáo', 'Không gây ảnh hưởng đến hoạt động của chùa'],
    visitRegistrationEnabled: true,
    bookable: false,
    publicationStatus: 'published',
    updatedAt: null,
  },
};

// Alias cũ — giữ để không phải sửa lại các chỗ chưa migrate (không còn chỗ nào dùng sau phase này,
// nhưng giữ export cho an toàn/tương thích ngược).
export const listingOperations = activityCatalog;

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
    const price = activityCatalog[listingId].pricePerPerson;
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
  const price = activityCatalog[listingId].pricePerPerson;
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

// ---------- 6. Booking demo cho Host — "Lịch & Booking" + "Tổng quan" (PHASE 15/09/2026) ----------
// TÁCH BIỆT khỏi state.bookings/bookingItems thật (vốn gắn với 1 traveller demo duy nhất của Trail
// — xem storage.js) để không làm lẫn "booking của người khác" vào Hành trình/Hộ chiếu/đánh giá của
// chính khách đang dùng app. Đây là NGUỒN DUY NHẤT cho Tổng quan/Lịch & Booking/Cổng quản lý của
// TẤT CẢ 7 đơn vị cung cấp (trước đó chỉ có 3/7, gây lệch số giữa Tổng quan và Lịch & Booking).
//
// Mốc thời gian "hiện tại" DUY NHẤT cho toàn bộ dữ liệu demo — KHÔNG dùng `new Date()` thật, để
// booking/trạng thái/dashboard không đổi theo ngày thật máy chạy (xem hostBookingService.js,
// metricsService.js dùng hằng số này thay vì `new Date()` khi tính "tháng này"/"hôm nay").
export const DEMO_REFERENCE_DATE = '2026-09-14T09:00:00+07:00';
export const CURRENT_DEMO_BOOKINGS_VERSION = 2; // tăng số này nếu đổi lại công thức sinh dữ liệu — seed lại 1 lần, không đụng booking/review thật của người dùng

// Phân loại cơ chế tài chính theo ĐÚNG bản chất từng đơn vị (mục 2 yêu cầu 15/09/2026) — không
// hiển thị "thu nhập hộ" giống nhau cho cả chùa/bảo tàng/hộ kinh doanh. TỪ PHASE "Data Linkage"
// (15/09/2026), đây KHÔNG còn là số liệu hand-code riêng — derive trực tiếp từ activityCatalog
// (mỗi host ở HOSTS trong js/data.js có đúng 1 destinationId/activityId) để không có 2 nguồn
// financialMode/platformFeeRate lệch nhau.
export const providerFinancialMeta = Object.fromEntries(
  Object.values(activityCatalog).map((entry) => [
    entry.providerAccountId,
    { financialMode: entry.financialMode, platformFeeRate: entry.platformFeeRate, revenueSplitNote: entry.revenueSplitNote || undefined },
  ]),
);

function addDaysIso(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Nhóm khách cỡ (group size) cho từng đoàn/booking theo ĐÚNG bảng người dùng cung cấp 15/09/2026 —
// tổng số đoàn/khách/tiền của mỗi đơn vị đã được kiểm tra khớp chính xác từng con số mục tiêu.
const PROVIDER_BOOKING_SPECS = [
  { providerId: 'host-com-dep-tuan-viet', activityId: 'EXP-01', groups: { completed: [4], confirmed: [5, 3, 6, 4], pending: [5, 4] } },
  { providerId: 'host-nhac-mua-khmer', activityId: 'EXP-02', groups: { completed: [8, 6], confirmed: [10, 7, 9], pending: [6] } },
  { providerId: 'host-mat-na-khmer', activityId: 'EXP-03', groups: { completed: [4, 5], confirmed: [6, 4, 7, 5], pending: [3, 6] } },
  { providerId: 'host-lang-van-hoa-nguyet-hoa', activityId: 'SITE-04', groups: { completed: [18, 16, 14], confirmed: [20, 15, 12, 13], pending: [10, 8] } },
  { providerId: 'host-chua-ang', activityId: 'SITE-05', groups: { completed: [22, 18, 20, 24, 16], confirmed: [25, 21, 19, 23, 20], pending: [15, 15] } },
  { providerId: 'host-bao-tang-khmer', activityId: 'SITE-06', groups: { completed: [12, 14, 16, 12], confirmed: [18, 16, 20, 14], pending: [14, 18] } },
  { providerId: 'host-chua-lo-gach', activityId: 'SITE-07', groups: { completed: [12, 10], confirmed: [15, 14, 13, 12], pending: [15] } },
];

// Tên khách/đoàn demo tự nhiên — trộn cá nhân và nhóm/đoàn để phù hợp cả trải nghiệm nhỏ lẫn điểm
// tham quan đón đoàn đông. Không dùng thông tin cá nhân thật.
const CUSTOMER_NAME_POOL = [
  'Nhóm Minh Anh', 'Gia đình Quốc Bảo', 'Nhóm bạn Thu Hà', 'Đoàn Trường Đại học Trà Vinh', 'Nhóm Văn hóa Mekong',
  'James Wilson', 'Emily Chen', 'Gia đình Hoàng Nam', 'Nhóm Gia Hân', 'Nhóm bạn Thanh Trúc',
  'Đoàn Công ty Lữ hành Mekong Xanh', 'Nhóm nhiếp ảnh Bảo Ngọc', 'Gia đình Anh Tuấn', 'Nhóm Diệu Linh',
  'Đoàn hưu trí phường Nguyệt Hóa', 'Sarah Johnson', 'Nhóm Khánh Vy', 'Gia đình Minh Quân',
  'Đoàn sinh viên Ngọc Ánh', 'Nhóm bạn Tuấn Kiệt', 'Gia đình Hà My', 'Nhóm Đức Thịnh',
];
const CUSTOMER_NOTE_POOL = ['Có người lớn tuổi đi cùng, mong hỗ trợ đi lại.', 'Xin hướng dẫn thêm cho trẻ nhỏ trong đoàn.', 'Đoàn đi từ xa đến, mong linh động giờ giấc.', 'Cần chỗ đậu xe cho đoàn đông người.', ''];

function classifyGroupType(name) {
  if (/Gia đình/i.test(name)) return 'family';
  if (/Đoàn|Công ty|Trường|sinh viên|hưu trí/i.test(name)) return 'school_or_corporate';
  if (/Nhóm/i.test(name)) return 'friends';
  return 'solo';
}

function pickFromPool(pool, seedKey) {
  return pool[hashString(seedKey) % pool.length];
}

/** Sinh booking demo cho CẢ 7 đơn vị cung cấp — nguồn DUY NHẤT cho Tổng quan/Lịch & Booking/Cổng
 * quản lý (mục 5, 6 của yêu cầu 15/09/2026). Ngày tháng tính tương đối theo DEMO_REFERENCE_DATE
 * (không phải `new Date()` thật) — completed nằm TRƯỚC mốc này, confirmed/pending nằm SAU, đúng
 * yêu cầu "không để completed có ngày tương lai / không để confirmed-pending có ngày quá khứ". */
export function buildInitialDemoBookings() {
  const refDate = new Date(DEMO_REFERENCE_DATE);
  const records = [];

  PROVIDER_BOOKING_SPECS.forEach((spec, providerIdx) => {
    const catalogEntry = activityCatalog[spec.activityId];
    const unitPrice = (catalogEntry && catalogEntry.pricePerPerson) || 0;
    const meta = providerFinancialMeta[spec.providerId];
    const times = (catalogEntry && catalogEntry.availableTimeSlots) || ['09:00'];

    ['completed', 'confirmed', 'pending'].forEach((status) => {
      const sizes = spec.groups[status] || [];
      sizes.forEach((groupSize, i) => {
        const dayOffset = status === 'completed'
          ? -(1 + ((providerIdx * 3 + i * 2) % 13))
          : (1 + ((providerIdx * 2 + i * 3) % 16));
        const bookingDate = addDaysIso(refDate, dayOffset);
        const createdOffset = dayOffset - (1 + (i % 3));
        const startTime = times[(providerIdx + i) % times.length];
        const grossAmount = groupSize * unitPrice;
        const platformFee = Math.round(grossAmount * meta.platformFeeRate);
        const providerIncome = grossAmount - platformFee;
        const nameKey = `${spec.providerId}|${status}|${i}`;
        const customerName = pickFromPool(CUSTOMER_NAME_POOL, nameKey);

        records.push({
          id: `pb-${spec.activityId}-${status}-${i + 1}`,
          providerId: spec.providerId,
          activityId: spec.activityId,
          customerName,
          bookingDate,
          startTime,
          groupSize,
          unitPrice,
          grossAmount,
          platformFee,
          providerIncome,
          status, // 'completed' | 'confirmed' | 'pending' — không có booking demo nào ở trạng thái 'cancelled' (đúng bảng mục tiêu)
          createdAt: `${addDaysIso(refDate, createdOffset)}T09:00:00+07:00`,
          customerNote: pickFromPool(CUSTOMER_NOTE_POOL, `${nameKey}|note`),
          groupType: classifyGroupType(customerName),
          preferredTime: startTime,
          contactStatus: 'not_contacted', // 'not_contacted' | 'contacted' — chỉ có ý nghĩa với status 'confirmed'
          proposedTime: null,
          source: 'seed_demo',
          dataStatus: SEED_DATA_STATUS,
        });
      });
    });
  });

  return records;
}

// Nhu cầu khách theo NGÀY TRONG TUẦN (mẫu hình chung cấp nền tảng, không gắn với booking demo cụ
// thể) — dùng cho biểu đồ "Nhu cầu của khách trong 7 ngày tới" (mục 2.2, phase 14/09/2026).
export const weeklyDemandPattern = {
  monday: 6, tuesday: 8, wednesday: 7, thursday: 11, friday: 14, saturday: 22, sunday: 19,
};

// Insight hành vi khách toàn nền tảng (mục 2.5) — mẫu hình minh hoạ cấp nền tảng, không suy ra
// được từ số booking demo hiện có (chưa đủ lớn để có ý nghĩa thống kê thời điểm trong ngày).
export const demandInsightsSeed = {
  timeOfDay: { morning: 0.42, afternoon: 0.46, evening: 0.12 },
  groupType: { friends: 0.38, family: 0.34, solo: 0.16, schoolOrCorporate: 0.12 },
  weekendUpliftPct: 58,
};

// ---------- 7. "Nhu cầu & Cơ hội" (Management Portal) — xu hướng mạng lưới 6 tháng + sở thích
// khách (PHASE cập nhật gần nhất) ----------
// Mảng dưới đây do người dùng cung cấp trực tiếp trong yêu cầu — quy mô TOÀN MẠNG LƯỚI (gộp nhiều
// du khách qua thời gian), cùng bản chất "historical demo data" như monthlyParticipants/
// historicalMetrics ở mục 5 phía trên — KHÔNG thể tái tạo từ hành vi của 1 traveller demo duy nhất
// đang chạy trong trình duyệt hiện tại (bản demo chỉ có 1 tài khoản khách). Tháng hiện tại
// (2026-09) đã được đối chiếu khớp booking records: activeBookings=59, guests=726,
// grossValue=30.340.000đ (xem getDemandFunnel()/getCustomerDemandMetrics() ở managementService.js —
// 3 trường booking-derived này LUÔN được TÍNH LẠI từ getNetworkMetrics() khi hiển thị, không đọc
// trực tiếp 3 field tĩnh cùng tên trong mảng này, để không bị "đơ" nếu booking records đổi).
export const networkMonthlyHistory = [
  { month: '2026-04', destinationViews: 1680, tripCartAdds: 510, customisationRequests: 240, itinerariesSubmitted: 172, activeBookings: 32, guests: 392, grossValue: 15600000, partialMatchRate: 18 },
  { month: '2026-05', destinationViews: 1920, tripCartAdds: 590, customisationRequests: 288, itinerariesSubmitted: 206, activeBookings: 37, guests: 438, grossValue: 18100000, partialMatchRate: 19 },
  { month: '2026-06', destinationViews: 2180, tripCartAdds: 680, customisationRequests: 346, itinerariesSubmitted: 248, activeBookings: 41, guests: 486, grossValue: 20400000, partialMatchRate: 21 },
  { month: '2026-07', destinationViews: 2460, tripCartAdds: 770, customisationRequests: 418, itinerariesSubmitted: 302, activeBookings: 46, guests: 552, grossValue: 23700000, partialMatchRate: 23 },
  { month: '2026-08', destinationViews: 2910, tripCartAdds: 930, customisationRequests: 520, itinerariesSubmitted: 381, activeBookings: 52, guests: 638, grossValue: 27200000, partialMatchRate: 25 },
  { month: '2026-09', destinationViews: 3480, tripCartAdds: 1120, customisationRequests: 668, itinerariesSubmitted: 480, activeBookings: 59, guests: 726, grossValue: 30340000, partialMatchRate: 28.1 },
];

// "Reviews submitted trong tháng" — số duy nhất trong funnel KHÔNG suy ra được từ booking records
// (review là hành động riêng, không phải trường trên booking) và cũng không có trong
// networkMonthlyHistory ở trên — do người dùng cung cấp trực tiếp cho tháng hiện tại. Cộng thêm
// review THẬT phát sinh trong phiên demo (nếu có, xem getDemandFunnel()) — không đếm trùng vì số
// này đại diện hoạt động MẠNG LƯỚI (khách khác), tách biệt khỏi review của traveller demo hiện tại.
export const CURRENT_MONTH_REVIEWS_SUBMITTED_BASELINE = 17;

export const interestTrend = [
  { month: '2026-04', heritage: 34, handsOnCraft: 18, localFood: 18, performance: 14, spiritualLandscape: 16 },
  { month: '2026-05', heritage: 33, handsOnCraft: 19, localFood: 18, performance: 14, spiritualLandscape: 16 },
  { month: '2026-06', heritage: 33, handsOnCraft: 20, localFood: 19, performance: 14, spiritualLandscape: 14 },
  { month: '2026-07', heritage: 32, handsOnCraft: 21, localFood: 20, performance: 15, spiritualLandscape: 12 },
  { month: '2026-08', heritage: 31, handsOnCraft: 23, localFood: 20, performance: 15, spiritualLandscape: 11 },
  { month: '2026-09', heritage: 31, handsOnCraft: 24, localFood: 21, performance: 15, spiritualLandscape: 9 },
];
export const INTEREST_TREND_LABELS = {
  heritage: 'Di sản & lịch sử',
  handsOnCraft: 'Thủ công trải nghiệm tay chân',
  localFood: 'Ẩm thực địa phương',
  performance: 'Âm nhạc & biểu diễn',
  spiritualLandscape: 'Tâm linh & cảnh quan',
};

// Sở thích khách hiện tại — cards/thanh ngang, KHÔNG phải chart tròn (tránh quá nhiều pie chart
// trên 1 màn hình, đúng yêu cầu). Mỗi nhóm cộng lại đúng 100%.
export const customerPreferenceSeed = {
  tripDuration: [
    { key: 'short', label: '2–4 giờ', pct: 46 },
    { key: 'half', label: 'Nửa ngày', pct: 34 },
    { key: 'full', label: 'Cả ngày', pct: 20 },
  ],
  budget: [
    { key: 'under300', label: 'Dưới 300.000₫', pct: 43 },
    { key: '300to600', label: '300.000–600.000₫', pct: 39 },
    { key: 'over600', label: 'Trên 600.000₫', pct: 18 },
  ],
  groupType: [
    { key: 'friends', label: 'Nhóm bạn', pct: 38 },
    { key: 'family', label: 'Gia đình', pct: 34 },
    { key: 'solo', label: 'Đi một mình', pct: 16 },
    { key: 'school_or_corporate', label: 'Trường học hoặc doanh nghiệp', pct: 12 },
  ],
  preferredTime: [
    { key: 'morning', label: 'Buổi sáng', pct: 42 },
    { key: 'afternoon', label: 'Buổi chiều', pct: 46 },
    { key: 'evening', label: 'Buổi tối', pct: 12 },
  ],
  weekendUpliftPct: 58,
};

// Nhãn cơ hội cố định theo từng activity (mục 7 yêu cầu) — đây là NỘI DUNG gợi ý biên tập sẵn theo
// đặc thù từng đơn vị (không phải KPI tính toán), cột "Demand/Capacity/Occupancy/Pending" bên cạnh
// vẫn tính động 100% từ booking records — xem getCapacityUtilisation() ở managementService.js.
export const OPPORTUNITY_COPY_BY_ACTIVITY = {
  'EXP-01': 'Tăng slot cuối tuần',
  'EXP-02': 'Mở thêm suất biểu diễn',
  'EXP-03': 'Tăng capacity hoặc suất song song',
  'SITE-04': 'Kết nối sang paid experiences',
  'SITE-05': 'Phân luồng giờ cao điểm',
  'SITE-06': 'Tạo bundle giáo dục',
  'SITE-07': 'Tăng nhận diện',
};

export const FORECAST_DISCLAIMER = 'Dự báo được tạo từ xu hướng của dữ liệu mô phỏng 6 tháng gần nhất và chỉ phục vụ mục đích trình diễn prototype — không phải dự báo chính thức của tỉnh Vĩnh Long hay Sở Văn hóa, Thể thao và Du lịch.';
export const MANAGEMENT_SIMULATED_NOTE = 'Dữ liệu hoạt động và dự báo trong bản mẫu được mô phỏng cho mục đích trình diễn.';
export const LOW_SAMPLE_NOTE = 'Dữ liệu trong nhóm được chọn còn hạn chế; forecast có thể kém ổn định.';
