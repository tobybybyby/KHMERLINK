// Danh mục tag cảm nhận/đánh giá TRUNG TÂM — mọi nơi lưu tag (review gắn booking, "cảm nhận nhanh"
// tự đánh dấu ghé thăm) đều lưu CANONICAL ID ở đây, KHÔNG lưu label theo ngôn ngữ trực tiếp. Đổi
// ngôn ngữ không cần dịch lại dữ liệu đã lưu — chỉ tra label mới tại thời điểm render.
// Gộp CẢ 2 bộ tag đang tồn tại trong app: reviewTagsByCategory (data/pilot-seed-data.js, dùng cho
// review gắn booking) và GENERAL_TAGS/GROUP_TAGS/LOW_RATING_TAGS (js/trail/reviewTags.js, dùng cho
// "cảm nhận nhanh" ở địa điểm miễn phí) — tag trùng nghĩa/trùng chữ giữa 2 bộ dùng chung 1 ID.
import { getCurrentLanguage } from './i18nService.js';

export const REVIEW_TAG_LABELS = {
  // ---- Ẩm thực ----
  delicious_food: { vi: 'Món ăn ngon', en: 'Delicious food' },
  local_character: { vi: 'Đặc trưng địa phương', en: 'Authentic local character' },
  fresh_ingredients: { vi: 'Nguyên liệu tươi', en: 'Fresh ingredients' },
  reasonable_price: { vi: 'Giá cả hợp lý', en: 'Reasonable price' },
  friendly_service: { vi: 'Phục vụ thân thiện', en: 'Friendly service' },
  clean_space: { vi: 'Không gian sạch sẽ', en: 'Clean environment' },
  worth_trying_again: { vi: 'Đáng để thử lại', en: 'Worth trying again' },

  // ---- Âm nhạc và biểu diễn ----
  engaging_performance: { vi: 'Biểu diễn cuốn hút', en: 'Engaging performance' },
  cultural_identity: { vi: 'Đậm nét văn hóa', en: 'Strong cultural identity' },
  friendly_artists: { vi: 'Nghệ sĩ thân thiện', en: 'Friendly artists' },
  easy_story: { vi: 'Câu chuyện dễ hiểu', en: 'Easy to understand story' },
  good_sound: { vi: 'Âm thanh tốt', en: 'Good sound quality' },
  interactive_activity: { vi: 'Hoạt động tương tác thú vị', en: 'Enjoyable interaction' },

  // ---- Thủ công ----
  clear_guidance: { vi: 'Hướng dẫn dễ hiểu', en: 'Clear guidance' },
  friendly_artisan: { vi: 'Nghệ nhân thân thiện', en: 'Friendly artisan' },
  creative_activity: { vi: 'Hoạt động sáng tạo', en: 'Creative activity' },
  suitable_materials: { vi: 'Vật liệu phù hợp', en: 'Suitable materials' },
  beautiful_takeaway: { vi: 'Sản phẩm mang về đẹp', en: 'Beautiful takeaway' },
  learn_khmer_culture: { vi: 'Hiểu thêm về văn hóa Khmer', en: 'Learn more about Khmer culture' },

  // ---- Chùa và văn hóa ----
  peaceful_space: { vi: 'Không gian yên bình', en: 'Peaceful atmosphere' },
  beautiful_architecture: { vi: 'Kiến trúc đẹp', en: 'Beautiful architecture' },
  cultural_value: { vi: 'Giá trị văn hóa', en: 'Cultural value' },
  clean_scenery: { vi: 'Cảnh quan sạch sẽ', en: 'Clean scenery' },
  clear_information: { vi: 'Thông tin dễ hiểu', en: 'Clear information' },
  easy_wayfinding: { vi: 'Dễ tìm đường', en: 'Easy to find' },

  // ---- Bảo tàng ----
  rich_collection: { vi: 'Hiện vật phong phú', en: 'Rich collection' },
  clear_content: { vi: 'Nội dung dễ hiểu', en: 'Easy to follow content' },
  good_display_space: { vi: 'Không gian trưng bày tốt', en: 'Well-organised display' },
  helpful_staff: { vi: 'Nhân viên hỗ trợ', en: 'Helpful staff' },
  worth_recommending: { vi: 'Đáng để giới thiệu', en: 'Worth recommending' },

  // ---- "Cảm nhận nhanh" (địa điểm miễn phí, khách tự đánh dấu đã ghé) ----
  worth_visiting: { vi: 'Đáng để ghé thăm', en: 'Worth visiting' },
  friendly_locals: { vi: 'Nhân viên/người dân thân thiện', en: 'Friendly staff/locals' },
  clear_info_general: { vi: 'Thông tin rõ ràng', en: 'Clear information' },
  family_friendly: { vi: 'Phù hợp với gia đình', en: 'Family friendly' },
  good_photo_spots: { vi: 'Có nhiều góc chụp đẹp', en: 'Great photo spots' },
  beautiful_scenery: { vi: 'Cảnh quan đẹp', en: 'Beautiful scenery' },
  tidy_clean: { vi: 'Sạch sẽ', en: 'Clean' },
  many_photo_spots: { vi: 'Nhiều góc chụp ảnh', en: 'Many photo spots' },
  rest_spots: { vi: 'Có chỗ nghỉ chân', en: 'Rest areas available' },
  well_preserved_scenery: { vi: 'Cảnh quan được bảo tồn tốt', en: 'Well-preserved scenery' },
  impressive_architecture: { vi: 'Kiến trúc ấn tượng', en: 'Impressive architecture' },
  solemn_atmosphere: { vi: 'Không gian trang nghiêm', en: 'Solemn atmosphere' },
  learn_culture: { vi: 'Hiểu thêm về văn hoá', en: 'Learn more about the culture' },
  story_well_explained: { vi: 'Câu chuyện được giải thích rõ', en: 'Story well explained' },
  guided_tour_available: { vi: 'Có hướng dẫn tham quan', en: 'Guided tour available' },
  clear_signage: { vi: 'Biển chỉ dẫn rõ ràng', en: 'Clear signage' },
  clean_well_preserved: { vi: 'Sạch sẽ, được bảo tồn tốt', en: 'Clean, well preserved' },
  attentive_artisan_guidance: { vi: 'Nghệ nhân hướng dẫn tận tình', en: 'Attentive artisan guidance' },
  easy_to_follow: { vi: 'Dễ làm theo', en: 'Easy to follow' },
  hands_on_practice: { vi: 'Được trực tiếp thực hành', en: 'Hands-on practice' },
  learn_traditional_craft: { vi: 'Hiểu thêm về nghề truyền thống', en: 'Learn about a traditional craft' },
  fun_activity: { vi: 'Hoạt động thú vị', en: 'Fun activity' },
  suitable_duration: { vi: 'Thời lượng phù hợp', en: 'Suitable duration' },
  has_takeaway_product: { vi: 'Có sản phẩm mang về', en: 'Takeaway product included' },
  engaging_story: { vi: 'Câu chuyện hấp dẫn', en: 'Engaging story' },
  visual_display: { vi: 'Trưng bày trực quan', en: 'Visual, easy-to-follow display' },
  has_audio_guide: { vi: 'Có thuyết minh/audio guide', en: 'Narration/audio guide available' },
  clear_info_signage: { vi: 'Biển thông tin rõ ràng', en: 'Clear information signage' },
  well_preserved: { vi: 'Được bảo tồn tốt', en: 'Well preserved' },

  // ---- Cần cải thiện (rating thấp) ----
  hygiene_issue: { vi: 'Vệ sinh', en: 'Hygiene' },
  signage_issue: { vi: 'Biển chỉ dẫn', en: 'Signage' },
  service_quality_issue: { vi: 'Chất lượng dịch vụ', en: 'Service quality' },
  staff_attitude_issue: { vi: 'Thái độ phục vụ', en: 'Staff attitude' },
  price_issue: { vi: 'Giá cả', en: 'Price' },
  experience_content_issue: { vi: 'Nội dung trải nghiệm', en: 'Experience content' },
  facilities_issue: { vi: 'Cơ sở vật chất', en: 'Facilities' },
  unclear_info_issue: { vi: 'Thông tin chưa rõ ràng', en: 'Unclear information' },
  hard_to_find_issue: { vi: 'Khó tìm đường hoặc di chuyển', en: 'Hard to find or get to' },
};

/** Tra label hiển thị theo ngôn ngữ hiện tại. ID lạ (không có trong catalog — vd tag do người dùng
 * cũ lưu trước khi có canonical ID mà migration bỏ sót) → hiển thị nguyên chuỗi ID, không throw. */
export function localizeTag(tagId) {
  const entry = REVIEW_TAG_LABELS[tagId];
  if (!entry) return tagId;
  return entry[getCurrentLanguage()] ?? entry.vi ?? tagId;
}

/** Map ngược NHÃN TIẾNG VIỆT CŨ -> canonical ID — dùng riêng cho migration dữ liệu đã lưu trong
 * localStorage từ trước khi có hệ canonical ID (xem storage.js migrateV8ToV9). KHÔNG dùng ở luồng
 * render bình thường. */
export const LEGACY_VI_LABEL_TO_TAG_ID = Object.fromEntries(
  Object.entries(REVIEW_TAG_LABELS).map(([id, { vi }]) => [vi, id]),
);
