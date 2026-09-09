// Bộ tiêu chí đánh giá nhanh theo nhóm loại hình (mô hình kết hợp sao + tag như Grab) — mỗi
// địa điểm chỉ hiện tối đa 6 tiêu chí phù hợp, khách chọn nhiều tiêu chí không cần chấm điểm
// từng câu. Nhóm lấy từ categoryGroup() (utils.js) — nhóm nào chưa có bộ riêng dùng GENERAL.
import { categoryGroup } from '../utils.js';

const MAX_TAGS = 6;

const GENERAL_TAGS = [
  'Đáng để ghé thăm', 'Không gian sạch sẽ', 'Dễ tìm đường', 'Nhân viên/người dân thân thiện',
  'Thông tin rõ ràng', 'Giá cả hợp lý', 'Phù hợp với gia đình', 'Có nhiều góc chụp đẹp',
];

const GROUP_TAGS = {
  'Thiên nhiên': [
    'Cảnh quan đẹp', 'Không gian yên bình', 'Sạch sẽ', 'Nhiều góc chụp ảnh',
    'Có chỗ nghỉ chân', 'Phù hợp đi cùng gia đình', 'Cảnh quan được bảo tồn tốt',
  ],
  'Tôn giáo': [
    'Kiến trúc ấn tượng', 'Không gian trang nghiêm', 'Hiểu thêm về văn hoá', 'Câu chuyện được giải thích rõ',
    'Có hướng dẫn tham quan', 'Biển chỉ dẫn rõ ràng', 'Sạch sẽ, được bảo tồn tốt',
  ],
  'Làng nghề & cộng đồng': [
    'Nghệ nhân hướng dẫn tận tình', 'Dễ làm theo', 'Được trực tiếp thực hành', 'Hiểu thêm về nghề truyền thống',
    'Hoạt động thú vị', 'Thời lượng phù hợp', 'Có sản phẩm mang về',
  ],
  'Trải nghiệm tại hộ dân': [
    'Nghệ nhân hướng dẫn tận tình', 'Dễ làm theo', 'Được trực tiếp thực hành', 'Hoạt động thú vị',
    'Thời lượng phù hợp', 'Có sản phẩm mang về',
  ],
  'Bảo tàng / Di tích': [
    'Nội dung dễ hiểu', 'Câu chuyện hấp dẫn', 'Hiện vật phong phú', 'Trưng bày trực quan',
    'Có thuyết minh/audio guide', 'Biển thông tin rõ ràng', 'Được bảo tồn tốt',
  ],
  'Khu tưởng niệm': [
    'Nội dung dễ hiểu', 'Câu chuyện hấp dẫn', 'Trưng bày trực quan', 'Biển thông tin rõ ràng', 'Được bảo tồn tốt',
  ],
  'Nhà cổ': [
    'Kiến trúc ấn tượng', 'Nội dung dễ hiểu', 'Câu chuyện hấp dẫn', 'Biển thông tin rõ ràng', 'Được bảo tồn tốt',
  ],
  'Ẩm thực': [
    'Món ăn ngon', 'Đặc trưng địa phương', 'Nguyên liệu tươi', 'Giá cả hợp lý',
    'Phục vụ thân thiện', 'Không gian sạch sẽ', 'Đáng để thử lại',
  ],
};

const LOW_RATING_TAGS = [
  'Vệ sinh', 'Biển chỉ dẫn', 'Chất lượng dịch vụ', 'Thái độ phục vụ',
  'Giá cả', 'Nội dung trải nghiệm', 'Cơ sở vật chất', 'Thông tin chưa rõ ràng', 'Khó tìm đường hoặc di chuyển',
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
