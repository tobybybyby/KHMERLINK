# DEMO_DATA.md — Dữ liệu mô phỏng dùng cho trình diễn prototype

> **Tóm tắt cho người đọc nhanh**: Dữ liệu hoạt động trong bản mẫu này (đánh giá, doanh thu, lượt ghé, giờ mở cửa, giá) là **mô phỏng cho mục đích trình diễn**, không phải số liệu vận hành thật đã được 7 listing/host xác nhận. Được tạo trong PHASE "Bổ sung dữ liệu mô phỏng liên kết cho Customer, Host và Management" (11/09/2026), sau khi đã hỏi và được người dùng dự án xác nhận rõ ràng cho phép gắn số liệu này vào 7 listing/host **thật** (không dùng danh tính hư cấu song song) để website trông như một nền tảng đã có người sử dụng.

## Vì sao có tài liệu này

Từ các phase trước, dự án theo nguyên tắc "không bịa số liệu cho tổ chức/cá nhân thật khi chưa có sự đồng thuận". Phase này đổi hướng có chủ đích (theo yêu cầu người dùng, sau khi đã xác nhận lại rủi ro) để tạo cảm giác nền tảng đã vận hành. Tài liệu này tồn tại để **bất kỳ ai đọc mã nguồn/dữ liệu đều biết rõ đâu là số liệu thật, đâu là số liệu mô phỏng**, và biết cách gỡ bỏ nếu cần trước khi vận hành thật.

## Nguồn dữ liệu trung tâm

Toàn bộ số liệu mô phỏng nằm trong **`data/pilot-seed-data.js`** (một nguồn duy nhất, không rải rác trong component/card/chart):

- `listingOperations` — giờ mở cửa theo từng thứ trong tuần, giá/người, thời lượng, sức chứa mỗi lượt cho 7 listing.
- `initialReviewStats` — baseline lịch sử tổng hợp (ratingSum/reviewCount) cho từng listing — **không liệt kê từng review lịch sử**, chỉ là 2 con số tổng.
- `seedReviews` — ~8–12 review chi tiết/listing (68 review) viết tay, đa dạng, có tên khách/tag/bình luận/ngày — đại diện hiển thị, **đã được tính gộp trong `initialReviewStats`**, không cộng thêm lần nữa khi tính average.
- `reviewTagsByCategory` / `listingTagGroup` — bộ tag cảm nhận theo loại hình (ẩm thực/âm nhạc/thủ công/chùa-văn hoá/bảo tàng).
- `monthlyParticipants` (EXP-01/02/03), `monthlyVisits` (SITE-04/05/06/07) — số liệu 12 tháng, từ 09/2025 đến 08/2026, cố định (không `Math.random()`).
- `historicalMetrics` — **tính bằng công thức** từ `monthlyParticipants`/giá (`grossRevenue = participants × pricePerPerson`, `platformFee = grossRevenue × 10%`, `providerIncome = grossRevenue − platformFee − refunds`), không hard-code từng con số doanh thu.
- `visitMetrics` — lượt ghé (`visitInstances`) cho SITE-04/05/06/07.

Mọi bản ghi mô phỏng đều có `dataStatus: 'demo_assumption'` và `source: 'seed_demo'` (phân biệt với dữ liệu thật phát sinh trong phiên demo, `source: 'live_demo'`).

## Các giả định cụ thể

### Giờ mở cửa, giá, thời lượng, sức chứa
Lấy đúng bảng giả định do người dùng cung cấp trong yêu cầu phase này (xem `listingOperations` trong `data/pilot-seed-data.js`). Trạng thái "Đang mở/Sắp đóng cửa/Đóng cửa/Cần đặt trước" được **tính real-time** theo giờ Việt Nam (`Asia/Ho_Chi_Minh`, xem `js/services/operationsService.js`), không phải chuỗi cố định.

### Baseline đánh giá (ratingSum/reviewCount)
Do người dùng cung cấp trực tiếp trong yêu cầu phase này. Average hiển thị = `ratingSum / reviewCount`, luôn tính lại (không cộng dồn), cộng thêm review thật phát sinh trong phiên demo (xem `js/services/reviewsService.js`).

### Review chi tiết mẫu (68 review)
Nội dung bình luận/tên khách do trợ lý AI (Claude, thực hiện theo yêu cầu người dùng) viết mới, không sao chép từ nguồn thật nào, không nhắm vào cá nhân có thật ngoài đời ngoài việc gắn vào listing/host thật của dự án. Phân bố sao được chọn để phù hợp với baseline average của từng listing (đa số 4–5 sao, có xen review 3 sao góp ý xây dựng).

### Doanh thu/lượt tham gia 12 tháng (09/2025–08/2026)
- `monthlyParticipants`/`monthlyVisits`: do người dùng cung cấp trực tiếp trong yêu cầu phase này.
- `completedBookings`/`cancelledBookings` (EXP-01/02/03): suy ra bằng tỷ lệ người/booking giả định cố định — EXP-01 dùng đúng tỷ lệ suy được từ ví dụ mẫu người dùng cho (62 khách/18 booking ≈ 3,4 người/booking); EXP-02 (3,6) và EXP-03 (2,8) là giả định riêng của việc triển khai, ghi rõ trong code (`AVG_PARTY_SIZE`).
- `refunds` lịch sử để **0** trong toàn bộ 12 tháng seed — tình huống "có hoàn tiền ảnh hưởng thu nhập hộ" được minh hoạ qua luồng huỷ booking THẬT đã có sẵn trong app (`bookingService.cancelBooking`), không bịa thêm số liệu hoàn tiền lịch sử.
- SITE-06 (Bảo tàng): có doanh thu vé giả định 20.000đ/lượt — **tách riêng** khỏi nhóm doanh thu hộ dân/nghệ nhân trong biểu đồ Management (nhãn "Đơn vị văn hóa công").
- SITE-04/05/07 (chùa/cụm miễn phí): **không có bản ghi doanh thu nào** — chỉ có lượt ghé, không xuất hiện trong biểu đồ chia sẻ doanh thu.

## Cách phân biệt dữ liệu mô phỏng và dữ liệu thật trong code

| Trường | Ý nghĩa |
|---|---|
| `dataStatus: 'demo_assumption'` | Số liệu giả định cho trình diễn (giờ/giá/baseline đánh giá/lịch sử 12 tháng). |
| `source: 'seed_demo'` | Bản ghi thuộc seed data tĩnh (review mẫu, historicalMetrics, visitMetrics) — nạp lại mới mỗi lần tải trang, không lưu localStorage. |
| `source: 'live_demo'` | Bản ghi phát sinh THẬT trong phiên demo (booking/review/notification do người dùng thao tác qua UI) — lưu localStorage, không bao giờ bị seed data ghi đè. |

Tháng "hiện tại" của app (theo ngày hệ thống) luôn **sau** mốc 08/2026 mà dữ liệu lịch sử kết thúc — nhờ vậy booking/review thật phát sinh trong lúc demo không bao giờ trùng tháng với `historicalMetrics`/`visitMetrics`, tránh đếm trùng khi cộng dồn (`total = historicalAggregate + eligibleLiveDemoRecords`).

## Muốn gỡ bỏ dữ liệu mô phỏng trước khi vận hành thật?

1. Xoá hoặc để rỗng `seedReviews`, `historicalMetrics`, `visitMetrics` trong `data/pilot-seed-data.js` (hoặc đặt `initialReviewStats`/`monthlyParticipants`/`monthlyVisits` về `{}`/mảng rỗng).
2. Giữ nguyên `listingOperations` nếu giờ/giá đã được host xác nhận thật — nếu chưa, xoá `pricePerPerson`/`durationMinutes`/`capacityPerSlot` và để `null`, giao diện sẽ tự hiện "Đang cập nhật".
3. Không cần đổi code UI/service nào khác — toàn bộ Customer/Host/Management đều đọc qua `reviewsService.js`/`operationsService.js`/`metricsService.js`/`networkMetrics.js`, tự động phản ánh đúng khi nguồn dữ liệu ở bước 1–2 thay đổi.

## Ghi chú công khai cho người dùng cuối

Trang **Cá nhân** (`#/trail/profile`, mục "Về bản demo") hiển thị: *"Dữ liệu hoạt động trong bản mẫu được mô phỏng cho mục đích trình diễn."* kèm link tới tài liệu này — không gắn nhãn "dữ liệu giả lập" trên từng card theo đúng yêu cầu (tránh rối giao diện).
