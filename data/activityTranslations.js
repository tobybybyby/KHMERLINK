// Nội dung song ngữ (VI/EN) cho 7 listing pilot Khmer — bổ sung THÊM cho data/pilot-listings.json,
// KHÔNG sửa/regenerate file đó. Khoá theo đúng activity/listing id (EXP-01..EXP-03, SITE-04..SITE-07).
// Bản tiếng Anh là DỊCH THUẬT nội dung tiếng Việt gốc (giữ nguyên số liệu/năm/tên riêng), không phải
// nội dung mới — mọi mốc thời gian/số đo/tên di tích giữ đúng như hồ sơ gốc.
//
// Field không có ở đây (vd tên riêng, địa chỉ, toạ độ, Plus Code, mã hoạt động) KHÔNG được dịch —
// xem js/services/destinationsService.js (localizeDestinationField) cho cơ chế fallback khi thiếu.
export const activityTranslations = {
  'EXP-01': {
    name: { vi: 'Trải nghiệm tự tay giã cốm dẹp', en: 'Pound Your Own Cốm Dẹp' },
    shortDescription: {
      vi: 'Trải nghiệm ẩm thực cộng đồng gắn với nghề quết cốm dẹp truyền thống của người Khmer tại làng Ba So.',
      en: 'A community food experience centred on the traditional Khmer craft of pounding cốm dẹp (flattened young rice) in Ba So village.',
    },
    fullDescription: {
      vi: 'Khách thử các công đoạn có rủi ro thấp: rang/nổ lúa nếp đã sơ chế, giã theo nhịp, sàng và trộn cốm; nghe câu chuyện cốm dẹp trong lễ Ok Om Bok.',
      en: 'Guests try low-risk steps of the process: roasting/popping pre-treated young sticky rice, pounding to a rhythm, sieving and mixing the flakes; and hear the story of cốm dẹp in the Ok Om Bok festival.',
    },
    culturalStory: {
      vi: 'Cốm dẹp là sản phẩm gắn mạnh với mùa lúa nếp non và lễ hội Ok Om Bok của đồng bào Khmer.',
      en: 'Cốm dẹp is closely tied to the young sticky-rice season and the Khmer Ok Om Bok festival.',
    },
    visitorNotes: {
      vi: 'Theo mùa; cần hỏi trước về nguyên liệu.',
      en: 'Seasonal availability; ask in advance about ingredients.',
    },
    categoryLabel: { vi: 'Ẩm thực', en: 'Cuisine' },
    tags: { vi: ['Ẩm thực', 'Cộng đồng', 'Khmer'], en: ['Cuisine', 'Community', 'Khmer'] },
  },
  'EXP-02': {
    name: { vi: 'Trải nghiệm âm nhạc và múa truyền thống Khmer', en: 'Khmer Traditional Music and Dance Experience' },
    shortDescription: {
      vi: 'Gói trải nghiệm biểu diễn 2 điểm dừng — kết hợp xưởng nhạc cụ/mặt nạ Khmer và một trích đoạn múa Rô-băm.',
      en: 'A 2-stop performance experience combining a Khmer instrument/mask workshop with a Rô-băm dance excerpt.',
    },
    fullDescription: {
      vi: 'Nhận diện và thử nhạc cụ dưới hướng dẫn; nghe cấu tạo dàn ngũ âm; di chuyển sang điểm diễn; xem trích đoạn Rô-băm và giải thích nhân vật, mặt nạ, động tác.',
      en: 'Identify and try instruments under guidance; learn about the pin peat (five-tone) ensemble; move to the performance stop; watch a Rô-băm excerpt with explanations of characters, masks and movements.',
    },
    culturalStory: {
      vi: 'Rô-băm là di sản văn hóa phi vật thể quốc gia (công nhận năm 2018), kết hợp múa, hát, sân khấu, phục trang và mặt nạ; kịch bản thường dựa trên truyện dân gian và Ramayana/Riêm Kê.',
      en: 'Rô-băm is a national intangible cultural heritage (recognised in 2018), combining dance, singing, theatre, costume and masks; its scripts are usually based on folk tales and the Ramayana/Reamker.',
    },
    visitorNotes: {
      vi: 'Tôn trọng thời gian tập luyện của nghệ nhân; không tự ý chụp cận cảnh khi chưa được đồng ý.',
      en: "Respect the artisans' rehearsal time; do not take close-up photos without consent.",
    },
    categoryLabel: { vi: 'Âm nhạc và biểu diễn', en: 'Music & Performance' },
    tags: { vi: ['Âm nhạc', 'Múa', 'Di sản'], en: ['Music', 'Dance', 'Heritage'] },
    keyFacts: {
      vi: ['Rô-băm được công nhận di sản văn hóa phi vật thể quốc gia năm 2018.'],
      en: ['Rô-băm was recognised as a national intangible cultural heritage in 2018.'],
    },
  },
  'EXP-03': {
    name: { vi: 'Trải nghiệm làm mặt nạ Khmer thu nhỏ', en: 'Mini Khmer Mask-Making Experience' },
    shortDescription: {
      vi: 'Workshop thủ công làm mặt nạ Khmer mini cùng Nghệ nhân ưu tú Lâm Phên.',
      en: 'A mini Khmer mask-making craft workshop with Meritorious Artisan Lâm Phên.',
    },
    fullDescription: {
      vi: 'Quan sát mẫu mặt nạ; nghe giải thích vai khỉ/chằn và sân khấu; trang trí một phôi mini do nghệ nhân chuẩn bị; mang sản phẩm về.',
      en: 'Observe mask samples; hear explanations of monkey/giant roles and the stage; decorate a mini blank prepared by the artisan; take the piece home.',
    },
    culturalStory: {
      vi: 'Ông Lâm Phên sinh năm 1951, chính thức làm nhạc cụ từ 1990, tham gia chế tác/phục chế hiện vật bảo tàng từ 1997 và đã truyền nghề cho hơn 200 người. Nghề làm mão, mặt nạ Khmer tại các địa bàn liên quan được đưa vào Danh mục di sản văn hóa phi vật thể quốc gia ngày 27/6/2025.',
      en: 'Mr. Lâm Phên was born in 1951, has officially made instruments since 1990, has contributed to crafting/restoring museum artifacts since 1997, and has passed the craft on to more than 200 people. The craft of making Khmer crowns and masks in the related localities was added to the National Intangible Cultural Heritage list on 27 June 2025.',
    },
    visitorNotes: {
      vi: 'Không sao chép đồ thiêng/đạo cụ nghi lễ thiếu ngữ cảnh. Dùng phôi, sơn và keo an toàn trong suốt buổi làm mặt nạ.',
      en: 'Do not replicate sacred objects/ritual props without proper context. Safe blanks, paint and glue are used throughout the mask-making session.',
    },
    categoryLabel: { vi: 'Thủ công', en: 'Handicraft' },
    tags: { vi: ['Thủ công', 'Nghệ nhân', 'Mặt nạ'], en: ['Handicraft', 'Artisan', 'Mask'] },
    keyFacts: {
      vi: ['NNƯT Lâm Phên: sinh năm 1951, làm nhạc cụ từ 1990, truyền nghề cho hơn 200 người.', 'Nghề làm mão, mặt nạ Khmer được công nhận di sản văn hóa phi vật thể quốc gia ngày 27/6/2025 (QĐ 2209/QĐ-BVHTTDL).'],
      en: ['Meritorious Artisan Lâm Phên: born 1951, making instruments since 1990, has trained more than 200 people.', 'The craft of making Khmer crowns and masks was recognised as a national intangible cultural heritage on 27 June 2025 (Decision 2209/QĐ-BVHTTDL).'],
    },
  },
  'SITE-04': {
    name: { vi: 'Làng Văn hóa – Du lịch dân tộc Khmer và Ao Bà Om', en: 'Khmer Cultural Tourism Village' },
    shortDescription: {
      vi: 'Một không gian phát triển du lịch văn hóa Khmer ở phường Nguyệt Hóa, lấy cụm Ao Bà Om – Chùa Âng – Bảo tàng làm hạt nhân.',
      en: 'A Khmer cultural tourism development area in Nguyệt Hóa ward, centred on the Ao Bà Om – Ang Pagoda – Museum cluster.',
    },
    fullDescription: {
      vi: 'Đi bộ cảnh quan Ao Bà Om; tham quan Chùa Âng và bảo tàng; kết nối hoạt động cộng đồng theo lịch sự kiện.',
      en: 'Walk the Ao Bà Om landscape; visit Ang Pagoda and the museum; connect with community activities on the event calendar.',
    },
    culturalStory: {
      vi: 'Ao Bà Om — điểm neo dễ nhận diện nhất trên bản đồ của cụm — rộng hơn 300 ha; ao trung tâm 15 ha, sâu khoảng 2 m; có khoảng 500 cây sao/dầu cổ thụ. Ao được xếp hạng di tích quốc gia năm 1994.',
      en: 'Ao Bà Om — the most recognisable landmark of the cluster — covers more than 300 ha, with a 15 ha central pond about 2 m deep, surrounded by roughly 500 old sao/dầu trees. The pond was ranked a national monument in 1994.',
    },
    visitorNotes: {
      vi: 'Giờ và lộ trình tham quan của từng điểm trong cụm (Ao Bà Om, Chùa Âng, Bảo tàng) có thể khác nhau — nên ghé Chùa Âng và Bảo tàng để trọn vẹn trải nghiệm.',
      en: 'Opening hours and visit routes for each site in the cluster (Ao Bà Om, Ang Pagoda, Museum) may differ — visiting Ang Pagoda and the Museum as well is recommended for the full experience.',
    },
    categoryLabel: { vi: 'Địa điểm văn hóa', en: 'Cultural Site' },
    tags: { vi: ['Văn hoá', 'Thiên nhiên', 'Khmer'], en: ['Culture', 'Nature', 'Khmer'] },
    keyFacts: {
      vi: ['Ao Bà Om: hơn 300 ha, ao trung tâm 15 ha sâu khoảng 2 m, khoảng 500 cây sao/dầu cổ thụ.', 'Ao Bà Om được xếp hạng di tích quốc gia năm 1994; cải tạo hơn 7 tỷ đồng sau đợt hạn 2016.'],
      en: ['Ao Bà Om: more than 300 ha, with a 15 ha central pond about 2 m deep and roughly 500 old sao/dầu trees.', 'Ao Bà Om was ranked a national monument in 1994; renovated with over VND 7 billion after the 2016 drought.'],
    },
  },
  'SITE-05': {
    name: { vi: 'Chùa Âng', en: 'Ang Pagoda' },
    shortDescription: {
      vi: 'Chùa Khmer cổ trong quần thể Ao Bà Om, di tích kiến trúc nghệ thuật cấp quốc gia.',
      en: 'An ancient Khmer pagoda within the Ao Bà Om complex, a national architectural and artistic monument.',
    },
    fullDescription: {
      vi: 'Tham quan kiến trúc, bích họa và cảnh quan; tìm hiểu Phật giáo Nam tông Khmer và nghi thức ứng xử trong chùa.',
      en: 'Visit the architecture, murals and grounds; learn about Khmer Theravada Buddhism and pagoda etiquette.',
    },
    culturalStory: {
      vi: 'Tư liệu báo chí ghi chùa có lịch sử từ năm 990; được xếp hạng di tích cấp quốc gia năm 1994. Đây là niên đại theo hồ sơ/giới thiệu phổ biến, không nên diễn giải là toàn bộ kiến trúc hiện còn nguyên từ thế kỷ X.',
      en: 'Press sources record the pagoda\'s history from the year 990; it was ranked a national monument in 1994. This date reflects commonly cited records/introductions and should not be read as meaning the entire current structure survives unchanged from the 10th century.',
    },
    visitorNotes: {
      vi: 'Trang phục kín đáo; giữ yên lặng; không thương mại hóa nghi lễ; xin phép trước khi chụp sư và không chạm hiện vật/thờ tự.',
      en: 'Dress modestly; keep quiet; do not commercialise rituals; ask permission before photographing monks and do not touch artifacts/altar items.',
    },
    categoryLabel: { vi: 'Chùa Khmer', en: 'Khmer Pagoda' },
    tags: { vi: ['Tôn giáo', 'Kiến trúc', 'Khmer'], en: ['Religious', 'Architecture', 'Khmer'] },
    keyFacts: {
      vi: ['Khuôn viên khoảng 4 ha.', 'Chánh điện có hệ thống 18 cột gỗ, trong đó 12 cột bên trong được trang trí hình rồng và sơn son thếp vàng.', 'Niên đại giới thiệu phổ biến: năm 990 (theo tư liệu báo chí — không phải toàn bộ kiến trúc còn nguyên từ thời điểm này).', 'Xếp hạng di tích cấp quốc gia năm 1994.'],
      en: ['Grounds cover about 4 ha.', 'The main hall has a system of 18 wooden columns, 12 of which (the inner ones) are decorated with dragon motifs in red lacquer and gilding.', 'Commonly cited date: the year 990 (per press sources — not implying the entire structure survives unchanged from that time).', 'Ranked a national monument in 1994.'],
    },
  },
  'SITE-06': {
    name: { vi: 'Bảo tàng Văn hóa dân tộc Khmer', en: 'Khmer Ethnic Culture Museum' },
    shortDescription: {
      vi: 'Bảo tàng chuyên đề về văn hóa dân tộc Khmer, gần Ao Bà Om và Chùa Âng.',
      en: 'A themed museum on Khmer ethnic culture, near Ao Bà Om and Ang Pagoda.',
    },
    fullDescription: {
      vi: 'Xem nhạc cụ, mặt nạ, mô hình sân khấu, nông cụ, kiến trúc và đồ dùng; phù hợp làm điểm nền trước workshop hoặc biểu diễn.',
      en: 'View instruments, masks, stage models, farm tools, architecture and everyday items; a good grounding stop before a workshop or performance.',
    },
    culturalStory: {
      vi: 'Có hiện vật hơn 100 năm tuổi và tư liệu khảo cổ thế kỷ VII–VIII. Các nguồn lịch sử khác nhau ghi mốc xây dựng/khánh thành/vận hành khác nhau; cần dùng đúng ngữ cảnh từng mốc.',
      en: 'Holds artifacts over 100 years old and archaeological material from the 7th–8th centuries. Different historical sources record different construction/inauguration/operation dates; each date should be used in its own context.',
    },
    visitorNotes: {
      vi: 'Không sờ hiện vật; kiểm tra quy định chụp ảnh; bố trí phiên dịch/ngôn ngữ thuyết minh nếu có đoàn quốc tế.',
      en: 'Do not touch artifacts; check photography rules; arrange interpretation/narration language for international groups.',
    },
    categoryLabel: { vi: 'Bảo tàng', en: 'Museum' },
    tags: { vi: ['Bảo tàng', 'Văn hoá', 'Khmer'], en: ['Museum', 'Culture', 'Khmer'] },
    keyFacts: {
      vi: ['Bảo tàng 2 tầng, diện tích sử dụng hơn 1.700 m².', 'Hơn 800 hiện vật, hình ảnh và tư liệu trưng bày chủ yếu trong 4 phòng lớn ở tầng 2.', '4 nhóm trưng bày: tâm linh, vật chất/làng nghề, tinh thần và nghệ thuật trình diễn.'],
      en: ['A 2-storey museum with over 1,700 m² of usable floor space.', 'More than 800 artifacts, images and documents displayed mainly across 4 large rooms on the 2nd floor.', '4 exhibition groups: spiritual life, material culture/craft villages, intellectual life and performing arts.'],
    },
  },
  'SITE-07': {
    name: { vi: 'Chùa Lò Gạch', en: 'Lo Gach Pagoda' },
    shortDescription: {
      vi: 'Chùa Khmer tại Ba Se A, cạnh cụm di tích khảo cổ Bờ Lũy — hai lớp di tích cần được giới thiệu tách bạch.',
      en: 'A Khmer pagoda in Ba Se A, next to the Bờ Lũy archaeological site cluster — two distinct heritage sites that should be introduced separately.',
    },
    fullDescription: {
      vi: 'Tham quan chùa, tìm hiểu đời sống cộng đồng và câu chuyện khảo cổ Óc Eo; có thể nối với xưởng Lâm Phên trong cùng khu vực.',
      en: 'Visit the pagoda, learn about community life and the Óc Eo archaeological story; can be combined with the Lâm Phên workshop in the same area.',
    },
    culturalStory: {
      vi: 'Khai quật công bố năm 2017 thực hiện 3 hố thám sát và 7 hố khai quật, tổng 778 m²; phát hiện dấu tích 6 kiến trúc gạch lớn trong phạm vi khoảng 4.500–5.000 m², niên đại thế kỷ VIII–IX. Di tích khảo cổ Bờ Lũy được công nhận cấp quốc gia năm 2018. Chùa Lò Gạch được xếp hạng di tích lịch sử cấp tỉnh ngày 21/11/2022 — đây là hai danh hiệu/đối tượng khác nhau, không được gộp thành một.',
      en: 'An excavation published in 2017 dug 3 survey pits and 7 excavation pits, totalling 778 m², uncovering traces of 6 large brick structures across roughly 4,500–5,000 m², dated to the 8th–9th centuries. The Bờ Lũy archaeological site was recognised at national level in 2018. Lo Gach Pagoda was ranked a provincial historical monument on 21 November 2022 — these are two separate designations/subjects and must not be conflated.',
    },
    visitorNotes: {
      vi: 'Không đi vào khu khai quật/bảo vệ nếu chưa được phép; không nhặt gạch/hiện vật; tuân thủ quy tắc chùa và xin phép cộng đồng khi tổ chức hoạt động.',
      en: 'Do not enter the excavation/protected area without permission; do not pick up bricks or artifacts; follow pagoda rules and ask the community for permission before organising activities.',
    },
    categoryLabel: { vi: 'Chùa Khmer', en: 'Khmer Pagoda' },
    tags: { vi: ['Tôn giáo', 'Khảo cổ', 'Khmer'], en: ['Religious', 'Archaeology', 'Khmer'] },
    keyFacts: {
      vi: ['Khai quật 2017: 3 hố thám sát + 7 hố khai quật, tổng 778 m².', 'Dấu tích 6 kiến trúc gạch lớn trong phạm vi khoảng 4.500–5.000 m², niên đại thế kỷ VIII–IX.', 'Di tích khảo cổ Bờ Lũy: công nhận cấp quốc gia năm 2018.', 'Chùa Lò Gạch: xếp hạng di tích lịch sử cấp tỉnh ngày 21/11/2022 (danh hiệu riêng, khác với Bờ Lũy).'],
      en: ['2017 excavation: 3 survey pits + 7 excavation pits, totalling 778 m².', 'Traces of 6 large brick structures across roughly 4,500–5,000 m², dated to the 8th–9th centuries.', 'Bờ Lũy archaeological site: recognised at national level in 2018.', 'Lo Gach Pagoda: ranked a provincial historical monument on 21 November 2022 (a separate designation from Bờ Lũy).'],
    },
  },
};

export function getActivityTranslation(listingId) {
  return activityTranslations[listingId] || null;
}
