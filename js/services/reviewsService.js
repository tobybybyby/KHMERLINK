// Lớp tính toán đánh giá dùng chung cho Trail/Studio/Cổng vận hành — Trail, Studio và Ops đọc
// CÙNG một công thức ở đây, không được mỗi nơi tự cộng dồn một kiểu để tránh lệch số giữa các
// giao diện.
//
// PHASE "Bổ sung dữ liệu mô phỏng liên kết": mỗi listing có thêm 1 baseline lịch sử tổng hợp
// (initialReviewStats — ratingSum/reviewCount, KHÔNG liệt kê từng review) từ data/pilot-seed-data.js,
// cộng với review THẬT phát sinh trong phiên demo (state.reviews, persist qua storage.addReview).
// average LUÔN tính lại từ (baseline + live), không bao giờ cộng dồn vào 1 con số average đã lưu.
import { initialReviewStats, seedReviews, tagsForListing } from '../../data/pilot-seed-data.js';

function emptyBaseline() {
  return { ratingSum: 0, reviewCount: 0 };
}

function sumBaselines(listingIds) {
  return listingIds.reduce((acc, id) => {
    const b = initialReviewStats[id];
    if (b) { acc.ratingSum += b.ratingSum; acc.reviewCount += b.reviewCount; }
    return acc;
  }, emptyBaseline());
}

/** Không bao giờ cộng dồn vào average cũ — luôn lấy baseline (lịch sử) + review live đang publish
 * rồi tính lại từ đầu, để huỷ/ẩn 1 review live tự động phản ánh đúng mà không cần bước "tính lại"
 * riêng. `liveReviews` chỉ gồm review THẬT (state.reviews) — KHÔNG cộng thêm seedReviews (8-12
 * review mẫu/listing) vì các review mẫu đó đã được TÍNH GỘP sẵn trong baseline, cộng lần nữa sẽ
 * đếm trùng. */
export function computeRatingStats(baseline, liveReviews) {
  const published = (liveReviews || []).filter((r) => r.status === 'published');
  const ratingSum = (baseline?.ratingSum || 0) + published.reduce((sum, r) => sum + Number(r.overallRating), 0);
  const reviewCount = (baseline?.reviewCount || 0) + published.length;
  const averageRating = reviewCount === 0 ? null : ratingSum / reviewCount;
  return { reviewCount, averageRating, ratingSum, livePublished: published };
}

export function getLiveReviewsForListing(state, listingId) {
  return state.reviews.filter((r) => r.listingId === listingId);
}

export function getRatingStatsForListing(state, listingId) {
  return computeRatingStats(initialReviewStats[listingId] || emptyBaseline(), getLiveReviewsForListing(state, listingId));
}

/** Gộp review của TẤT CẢ listing thuộc 1 host/nhóm listing — dùng cho Studio Tổng quan/Cổng quản
 * lý (điểm trung bình có TRỌNG SỐ theo số lượt đánh giá thật của từng listing, không lấy trung
 * bình cộng đơn giản của các average riêng lẻ). */
export function getRatingStatsForListingIds(state, listingIds) {
  const baseline = sumBaselines(listingIds);
  const idSet = new Set(listingIds);
  return computeRatingStats(baseline, state.reviews.filter((r) => idSet.has(r.listingId)));
}

/** average toàn mạng lưới — weightedAverageRating = tổng ratingSum / tổng reviewCount của TẤT CẢ
 * listing, không lấy trung bình cộng trực tiếp của 7 con số average. */
export function getNetworkRatingStats(state, listingIds) {
  return getRatingStatsForListingIds(state, listingIds);
}

/** Danh sách review để HIỂN THỊ nội dung (không dùng để tính average — xem computeRatingStats):
 * review mẫu (seedReviews, source:'seed_demo') + review thật (state.reviews, source:'live_demo'),
 * mới nhất lên đầu. */
export function getDisplayReviewsForListing(state, listingId) {
  return getDisplayReviewsForListingIds(state, [listingId]);
}

export function getDisplayReviewsForListingIds(state, listingIds) {
  const idSet = new Set(listingIds);
  const seed = seedReviews.filter((r) => idSet.has(r.listingId));
  const live = state.reviews.filter((r) => idSet.has(r.listingId)).map((r) => ({ ...r, source: r.source || 'live_demo' }));
  return [...seed, ...live].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** "⭐ 1,0 · 1 đánh giá" kiểu hiển thị — làm tròn 1 chữ số thập phân CHỈ để hiển thị, giá trị đầy
 * đủ vẫn giữ trong dữ liệu (averageRating trả về từ computeRatingStats không bị làm tròn). */
export function formatRatingStats({ averageRating, reviewCount }) {
  if (!reviewCount || averageRating === null) return 'Chưa có đánh giá';
  return `⭐ ${averageRating.toFixed(1)} · ${reviewCount} đánh giá`;
}

/** Phân bố 1–5 sao — gồm CẢ baseline lẫn review live có nội dung cụ thể (seedReviews + live) vì
 * baseline dạng ratingSum/reviewCount không có phân bố sao chi tiết; dùng seedReviews (mẫu đại
 * diện) làm ước lượng phân bố hiển thị, ghi rõ đây là ước lượng từ mẫu, không phải toàn bộ dữ
 * liệu lịch sử (86/64/57/129/1751/399/37 review không được lưu chi tiết từng cái). */
export function getRatingDistribution(state, listingIds) {
  const idSet = new Set(listingIds);
  const sample = [
    ...seedReviews.filter((r) => idSet.has(r.listingId)),
    ...state.reviews.filter((r) => idSet.has(r.listingId) && r.status === 'published'),
  ];
  const dist = [0, 0, 0, 0, 0]; // index 0 = 1 sao ... index 4 = 5 sao
  sample.forEach((r) => {
    const n = Math.round(Number(r.overallRating));
    if (n >= 1 && n <= 5) dist[n - 1] += 1;
  });
  return dist;
}

/** Tổng hợp tag đã chọn (donut "Những điều khách yêu thích") — mẫu số là TỔNG LƯỢT chọn tag
 * (1 review có thể chọn nhiều tag), không phải % số khách. */
export function getTagShareForListings(state, listingIds) {
  const idSet = new Set(listingIds);
  const sample = [
    ...seedReviews.filter((r) => idSet.has(r.listingId)),
    ...state.reviews.filter((r) => idSet.has(r.listingId) && r.status === 'published'),
  ];
  const counts = {};
  let totalSelections = 0;
  sample.forEach((r) => {
    (r.selectedTags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      totalSelections += 1;
    });
  });
  return { counts, totalSelections };
}

/** Tỷ lệ khách muốn giới thiệu — mẫu số là số review có trả lời Có/Không (wouldRecommend !== null/undefined). */
export function getRecommendRate(state, listingIds) {
  const idSet = new Set(listingIds);
  const sample = [
    ...seedReviews.filter((r) => idSet.has(r.listingId)),
    ...state.reviews.filter((r) => idSet.has(r.listingId) && r.status === 'published'),
  ];
  const answered = sample.filter((r) => typeof r.wouldRecommend === 'boolean');
  const yes = answered.filter((r) => r.wouldRecommend === true).length;
  return { yes, total: answered.length, rate: answered.length ? yes / answered.length : null };
}

export { tagsForListing };

export const ReviewsService = {
  computeRatingStats,
  getLiveReviewsForListing,
  getRatingStatsForListing,
  getRatingStatsForListingIds,
  getNetworkRatingStats,
  getDisplayReviewsForListing,
  getDisplayReviewsForListingIds,
  formatRatingStats,
  getRatingDistribution,
  getTagShareForListings,
  getRecommendRate,
  tagsForListing,
};
