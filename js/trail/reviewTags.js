// Bộ tiêu chí đánh giá nhanh theo nhóm loại hình (mô hình kết hợp sao + tag như Grab) — mỗi
// địa điểm chỉ hiện tối đa 6 tiêu chí phù hợp, khách chọn nhiều tiêu chí không cần chấm điểm
// từng câu. Nhóm lấy từ categoryGroup() (utils.js) — nhóm nào chưa có bộ riêng dùng GENERAL.
// Giá trị là CANONICAL TAG ID (xem js/services/tagCatalog.js#REVIEW_TAG_LABELS) — không lưu label
// theo ngôn ngữ trực tiếp, để đổi ngôn ngữ không cần dịch lại dữ liệu cảm nhận đã lưu.
import { categoryGroup } from '../utils.js';

const MAX_TAGS = 6;

const GENERAL_TAGS = [
  'worth_visiting', 'clean_space', 'easy_wayfinding', 'friendly_locals',
  'clear_info_general', 'reasonable_price', 'family_friendly', 'good_photo_spots',
];

const GROUP_TAGS = {
  'Thiên nhiên': [
    'beautiful_scenery', 'peaceful_space', 'tidy_clean', 'many_photo_spots',
    'rest_spots', 'family_friendly', 'well_preserved_scenery',
  ],
  'Tôn giáo': [
    'impressive_architecture', 'solemn_atmosphere', 'learn_culture', 'story_well_explained',
    'guided_tour_available', 'clear_signage', 'clean_well_preserved',
  ],
  'Làng nghề & cộng đồng': [
    'attentive_artisan_guidance', 'easy_to_follow', 'hands_on_practice', 'learn_traditional_craft',
    'fun_activity', 'suitable_duration', 'has_takeaway_product',
  ],
  'Trải nghiệm tại hộ dân': [
    'attentive_artisan_guidance', 'easy_to_follow', 'hands_on_practice', 'fun_activity',
    'suitable_duration', 'has_takeaway_product',
  ],
  'Bảo tàng / Di tích': [
    'clear_content', 'engaging_story', 'rich_collection', 'visual_display',
    'has_audio_guide', 'clear_info_signage', 'well_preserved',
  ],
  'Khu tưởng niệm': [
    'clear_content', 'engaging_story', 'visual_display', 'clear_info_signage', 'well_preserved',
  ],
  'Nhà cổ': [
    'impressive_architecture', 'clear_content', 'engaging_story', 'clear_info_signage', 'well_preserved',
  ],
  'Ẩm thực': [
    'delicious_food', 'local_character', 'fresh_ingredients', 'reasonable_price',
    'friendly_service', 'clean_space', 'worth_trying_again',
  ],
};

const LOW_RATING_TAGS = [
  'hygiene_issue', 'signage_issue', 'service_quality_issue', 'staff_attitude_issue',
  'price_issue', 'experience_content_issue', 'facilities_issue', 'unclear_info_issue', 'hard_to_find_issue',
];

/** rating <= 3: đổi sang hỏi "cần cải thiện điều gì" thay vì khen — dùng chung một bộ cho mọi loại hình. */
export function getQuickTags(category, rating) {
  if (rating && rating <= 3) return LOW_RATING_TAGS.slice(0, MAX_TAGS + 2);
  const group = categoryGroup(category);
  const list = GROUP_TAGS[group] || GENERAL_TAGS;
  return list.slice(0, MAX_TAGS);
}

export function isLowRating(rating) {
  return !!rating && rating <= 3;
}
