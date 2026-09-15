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

### Booking demo cho "Tổng quan" + "Lịch & Booking" — CẢ 7 đơn vị cung cấp (cập nhật 15/09/2026)
- `buildInitialDemoBookings()` trong `data/pilot-seed-data.js` sinh **59 booking cố định** cho ĐỦ CẢ 7 đơn vị (trước đó, phase 14/09/2026, chỉ có 18 booking cho 3/7 đơn vị — Tổng quan và Lịch & Booking từng đọc 2 nguồn khác nhau nên số liệu lệch nhau; nay CẢ HAI trang cùng gọi `getProviderMetrics()`/`getProviderBookings()` ở `js/services/hostBookingService.js`, đảm bảo khớp tuyệt đối). Số đoàn/khách/tiền của từng đơn vị (`PROVIDER_BOOKING_SPECS`) do người dùng cung cấp trực tiếp trong yêu cầu — đã kiểm tra khớp chính xác từng số mục tiêu (xem bảng đối chiếu ở PROGRESS.md).
- **`DEMO_REFERENCE_DATE = "2026-09-14T09:00:00+07:00"`** — mốc "hiện tại" CỐ ĐỊNH dùng xuyên suốt project (không phải `new Date()` thật) cho mọi tính toán "tháng này"/"hôm nay"/"7 ngày tới" ở Host/Management, để số liệu không đổi theo ngày máy thật chạy app. Booking `completed` có ngày TRƯỚC mốc này, `confirmed`/`pending` có ngày SAU — không có booking demo nào ở trạng thái `cancelled` trong bộ seed (huỷ chỉ phát sinh khi Host thao tác thật trong phiên demo).
- **Khác với booking thật của Trail**: lưu ở `state.hostDemoBookings`, một mảng TÁCH RIÊNG khỏi `state.bookings`/`bookingItems` — cố ý, để không lẫn vào Hộ chiếu/thông báo/nút "Viết đánh giá" của khách demo đang dùng app. Vẫn tương tác được (xác nhận/từ chối/đề xuất giờ khác/đánh dấu hoàn thành/liên hệ khách) và đồng bộ 2 chiều với Tổng quan + Cổng quản lý.
- `providerFinancialMeta` phân loại ĐÚNG bản chất từng đơn vị — `financialMode`: `community_paid` (3 trải nghiệm hộ dân/nghệ nhân, phí nền tảng 10%), `public_ticket` (bảo tàng, vé tham quan, không gọi là "thu nhập hộ", phí 0%), `free_visit` (3 điểm miễn phí, không tạo doanh thu, phí 0%).
- `hostDemoBookingsVersion` + `CURRENT_DEMO_BOOKINGS_VERSION`: vì đây là dữ liệu SEED (không phải người dùng tạo), khi đổi công thức sinh dữ liệu (như lần 15/09/2026 này), `storage.js` seed LẠI toàn bộ 1 lần (không giữ 18 bản ghi cũ lẫn với 59 bản ghi mới) — khác hẳn cách xử lý booking/review THẬT của người dùng (không bao giờ bị ghi đè).
- `weeklyDemandPattern` (nhu cầu theo thứ trong tuần) và `demandInsightsSeed` (% khung giờ, % loại nhóm khách, % tăng cuối tuần) vẫn là **mẫu hình cấp nền tảng cố định**, tách biệt khỏi 59 bản ghi cụ thể — chỉ "hoạt động được quan tâm nhất"/"khung giờ đặt nhiều nhất" tính động thật từ booking.

### Activity Catalog trung tâm — 1 nguồn cho Customer/Host/AI/Booking (cập nhật 15/09/2026 — "Data Linkage")
- `activityCatalog` (`data/pilot-seed-data.js`) thay thế hẳn `listingOperations` cũ (vẫn export alias `listingOperations = activityCatalog` để không phải sửa lại chỗ nào lỡ còn import tên cũ) — mỗi entry khoá theo đúng listing id (EXP-01..SITE-07, không tạo id song song) gồm giá/thời lượng/sức chứa/giờ mở cửa/khung giờ đặt (`availableTimeSlots`)/`financialMode`/`platformFeeRate`/`offeringType`/`bookable`/`publicationStatus`. `providerFinancialMeta` (dùng bởi `hostBookingService.js`) và khung giờ sinh 59 booking demo giờ **đọc trực tiếp từ catalog này**, không còn khai báo tay riêng ở nơi khác.
- **Điểm đọc DUY NHẤT**: `operationsService.getOperations(listingId)` — hợp nhất LIVE `activityCatalog` gốc + `state.activityCatalogOverrides[listingId]` (phần Host tự chỉnh qua Studio → "Trải nghiệm" → "Chỉnh sửa"). Mọi nơi hiển thị giá/thời lượng/sức chứa/khung giờ (card Khám phá, trang chi tiết, gợi ý AI, thẻ Host) đều gọi hàm này mỗi lần render — không đọc `activityCatalog` trực tiếp, không bake số liệu tĩnh vào `state.destinations`.
- **Host được sửa**: mô tả ngắn, giá (khoá ở 0đ nếu `financialMode==='free_visit'`), thời lượng, sức chứa, khung giờ, ghi chú giờ mở cửa, trạng thái công bố (`published`/`paused`). **Không được sửa**: đơn vị sở hữu, `financialMode`/`platformFeeRate`/`revenueSplitNote`, mã hoạt động, loại hình tôn giáo/công cộng — `storage.updateActivityCatalogOverride()` tự lọc bỏ các trường này nếu lỡ có trong patch gửi lên.
- Tạm dừng công bố (`publicationStatus:'paused'`) loại hoạt động khỏi TẤT CẢ đường gợi ý AI (route đầy đủ/nới lỏng, xếp hạng từng địa điểm, dự phòng phổ biến, gợi ý bổ sung cộng đồng) — không xoá khỏi hành trình khách đã lỡ chọn từ trước.
- Booking đã tạo (thật hoặc demo) KHÔNG đọc lại giá catalog khi giá sau đó đổi — cả `bookingItems` thật (`unitPrice`/`subtotal` chốt lúc `createBooking()`) lẫn `hostDemoBookings` (đóng băng `unitPrice`/`grossAmount` lúc sinh) đều đã snapshot sẵn theo đúng thiết kế từ trước, không cần đổi gì thêm cho yêu cầu "giá cũ giữ nguyên khi Host đổi giá sau".

### Nhu cầu mạng lưới 6 tháng + sở thích khách — Management "Nhu cầu & Cơ hội" (cập nhật 15/09/2026)
- `networkMonthlyHistory` (`data/pilot-seed-data.js`, 6 tháng T4–T9/2026) và `interestTrend` (6 tháng) là số liệu **quy mô toàn mạng lưới** (nhiều du khách qua thời gian) do người dùng cung cấp trực tiếp — cùng bản chất "historical demo data" như `monthlyParticipants`/`historicalMetrics`, KHÔNG suy ra được từ hành vi 1 traveller demo duy nhất đang chạy trong trình duyệt (bản demo chỉ có 1 tài khoản khách). `customerPreferenceSeed` (thời lượng/ngân sách/loại nhóm/khung giờ/cuối tuần) cùng bản chất.
- **Tháng hiện tại (2026-09) LUÔN được tính lại**: `js/services/managementService.js` thay 3 trường booking-derived (`activeBookings`/`guests`/`grossValue`) của điểm dữ liệu tháng 9 bằng số **live** từ `getNetworkMetrics()` (booking records thật) mỗi khi hiển thị — 5 tháng lịch sử còn lại giữ nguyên số liệu seed. Không bao giờ cộng 2 nguồn (seed + live) cho cùng 1 tháng.
- `CURRENT_MONTH_REVIEWS_SUBMITTED_BASELINE = 17` — số duy nhất trong funnel không suy ra được từ booking record (review là hành động riêng) và không có trong `networkMonthlyHistory` — cộng thêm review THẬT phát sinh trong phiên demo (không đếm trùng, vì đại diện khách MẠNG LƯỚI khác, tách biệt traveller demo hiện tại).
- **Nhật ký hành vi khách thật** (`state.customerBehaviourEvents`, `js/storage.js#logCustomerBehaviourEvent`, migration schema v7→v8) ghi lại xem địa điểm/thêm giỏ/gửi cá nhân hoá/chọn hành trình (kèm `matchMode`)/tạo·huỷ booking/gửi review — dùng để kiểm thử đồng bộ thật và làm nền triển khai thật sau này, KHÔNG phải nguồn của các con số funnel hiển thị trên dashboard (nguồn là `networkMonthlyHistory`, xem trên).
- `state.opportunityActions` (+ `setOpportunityActionStatus()`) lưu trạng thái Host/Management đã xử lý gợi ý "Cơ hội" nào (draft/planned/assigned/in_progress/done) — persist localStorage, đồng bộ `storage` event như mọi field khác.
- Muốn gỡ bỏ trước khi vận hành thật: xoá `networkMonthlyHistory`/`interestTrend`/`customerPreferenceSeed` hoặc đặt về mảng rỗng — `js/admin/demand.js`/`managementService.js` sẽ tự hiện "—"/rỗng, không cần sửa code UI.

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
3. Xoá `state.hostDemoBookings` (chạy `localStorage` xoá key `vlt_user_state` hoặc dùng nút "Khôi phục dữ liệu mẫu" ở trang Cá nhân — sau đó sửa `buildInitialDemoBookings()` để trả về `[]` trước khi người dùng mở lại app, tránh seed lại 18 booking demo mới).
4. Không cần đổi code UI/service nào khác — toàn bộ Customer/Host/Management đều đọc qua `reviewsService.js`/`operationsService.js`/`metricsService.js`/`networkMetrics.js`/`hostBookingService.js`, tự động phản ánh đúng khi nguồn dữ liệu ở bước 1–3 thay đổi.

## Ghi chú công khai cho người dùng cuối

Trang **Cá nhân** (`#/trail/profile`, mục "Về bản demo") hiển thị: *"Dữ liệu hoạt động trong bản mẫu được mô phỏng cho mục đích trình diễn."* kèm link tới tài liệu này — không gắn nhãn "dữ liệu giả lập" trên từng card theo đúng yêu cầu (tránh rối giao diện).
