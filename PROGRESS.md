# PROGRESS — KhmerLink (trước đây: Vĩnh Long Trail & Studio)

> Đã đổi tên thương hiệu thành **KhmerLink** — các mục log bên dưới ghi trước thời điểm đổi tên vẫn giữ nguyên tên cũ "Vĩnh Long Trail/Studio" (không viết lại lịch sử), chỉ giao diện thật hiện tại dùng tên mới. Xem mục "Đổi thương hiệu & thiết kế lại giao diện" cuối file.

Cập nhật lần cuối: Redesign Cổng dữ liệu quản lý theo dashboard kiểu Power BI (grid 12 cột, cross-filter) — 2026-09-18

Quy ước trạng thái: **Done** (đã thao tác được thật, đã kiểm tra) / **In progress** / **Later** (đúng roadmap, chưa tới lượt).

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Nền tảng (scaffolding, data layer, adapter, routing) | Done | Xem chi tiết bên dưới |
| 1 | Trail — Khám phá (bản đồ + danh sách + lọc/tìm kiếm) | Done | Leaflet, fallback khi lỗi mạng |
| 1 | Trail — Hồ sơ địa điểm/trải nghiệm | Done | Lưu yêu thích hoạt động, đặt/booking để phase sau |
| 1 | Trail — Cá nhân (Về bản demo + khôi phục dữ liệu mẫu) | Done | Điểm thưởng/Passport đầy đủ ở phase sau |
| 2 | Tích hợp dữ liệu địa danh (37 địa danh, verified/estimated/missing) | Done | Theo yêu cầu riêng của người dùng |
| 2 | Ảnh thật cho địa danh (17/37, tải từ nguồn công khai) | Done | 20/37 còn lại dùng placeholder (chưa có ảnh nguồn) |
| 4 | Form cá nhân hóa từng bước + tạo 2-3 hành trình (thuật toán demo) | Done | Xem chi tiết bên dưới |
| 4 | Timeline + bản đồ hành trình; thêm/xoá/thay thế/sắp xếp điểm | Done | Tự tính lại giờ/chi phí sau mỗi thay đổi |
| 4 | Kiểm tra giờ mở cửa, thời lượng, khoảng cách, sức chứa khi tạo/sửa hành trình | Done | Chặn vượt sức chứa, bỏ qua giờ đóng cửa đã xác minh |
| 4 | Booking + thanh toán mô phỏng (giữ chỗ, cọc/toàn bộ) | Done | Hộ xác nhận/từ chối thật trong Studio (Phase 5), không còn tự mô phỏng trong Trail |
| 4 | Hành trình đang diễn ra (điểm hiện tại/tiếp theo, đã ghé thăm) | Done | "Xác nhận hoàn thành" là việc của hộ trong Studio, tách khỏi tự đánh dấu của khách |
| 4 | Heatmap (Khám phá + trong hành trình) và đề xuất đổi điểm | Done | Mô phỏng, không tự đổi booking đã xác nhận |
| 4 | Hỗ trợ & báo cáo sự cố, theo dõi ticket | Done | |
| 4 | Đánh giá, Traveller Passport, điểm thưởng, voucher | Done | |
| 5 | Studio — Tổng quan, Trải nghiệm, Lịch & Booking, Báo cáo, Hỗ trợ & Đề án | Done | Xem chi tiết bên dưới |
| 5 | Booking từ Trail xuất hiện trong Studio bằng dữ liệu dùng chung | Done | Đã kiểm thử trực tiếp — xem chi tiết bên dưới |
| 6 | Cổng dữ liệu quản lý — Tổng quan/Luồng khách/Nhu cầu & Cơ hội/Đề án/Báo cáo | Done | Xem chi tiết bên dưới |
| 6 | Cổng vận hành — Booking & Giao dịch/Nội dung/Sự cố/Chất lượng & Hỗ trợ hộ | Done | Xem chi tiết bên dưới |
| 6 | Cố vấn cộng đồng (vai trò quyền hạn chế trong Cổng vận hành) | Done | Chỉ xem hàng chờ duyệt văn hoá + ngoại lệ CPS "nghi lễ", không xem booking/giao dịch |
| 6 | Kiểm tra phân quyền hiển thị dữ liệu giữa các vai trò | Done | Đã kiểm thử trực tiếp — xem chi tiết bên dưới |
| — | Hoàn thiện, nghiệm thu đủ 12 kịch bản, kiểm tra trước deploy | Done | Xem "Phase cuối" bên dưới — 1 lỗi nghiêm trọng phát hiện và đã sửa (booking combo phản hồi từng phần) |
| — | Deploy GitHub Pages + Hostinger | In progress | Hướng dẫn đầy đủ trong README; thao tác `git push`/bật Pages do người dùng thực hiện |
| — | Tinh chỉnh Cổng quản lý (bỏ wording demo, bộ lọc cascading, chart khung giờ cao điểm, đề án) + Cổng vận hành (Booking & Giao dịch đọc chung `bookingRecords`, Kiểm duyệt nội dung mới) | Done | Xem "PHASE — Tinh chỉnh Cổng quản lý..." cuối file |

## Chi tiết Phase 1

### File đã tạo
- `package.json`, `.gitignore`, `README.md`, `PROGRESS.md`, `REQUIREMENTS_MATRIX.md`
- `index.html`
- `css/tokens.css`, `css/base.css`, `css/layout.css`, `css/components.css`, `css/trail.css`, `css/styles.css`
- `js/utils.js`, `js/ui.js`, `js/storage.js`, `js/data.js`
- `js/services/mapService.js`, `js/services/aiService.js`, `js/services/paymentService.js`, `js/services/notificationService.js`, `js/services/bookingService.js`
- `js/comingSoon.js`, `js/welcome.js`
- `js/trail/shell.js`, `js/trail/explore.js`, `js/trail/placeDetail.js`, `js/trail/profile.js`
- `js/app.js`
- `assets/icons/favicon.svg`

### Chức năng đã hoạt động thật (không phải mô tả)
- Màn chào 2 lựa chọn + link "Cổng quản lý" (điều hướng thật, portal thật xây ở phase sau).
- Hash routing, F5 ở trang con không lỗi 404, route lạ tự chuyển về trang chào.
- Nút "Khôi phục dữ liệu mẫu" (tab Cá nhân) có hộp xác nhận, reseed toàn bộ dữ liệu người dùng.
- Xử lý dữ liệu localStorage bị hỏng (JSON lỗi) — tự seed lại, không crash trắng trang.
- Bản đồ Leaflet: pan/zoom, marker theo loại (màu/icon khác nhau), nút "Vị trí của tôi" (xin quyền khi bấm; từ chối/không hỗ trợ → chuyển sang chọn điểm trên bản đồ). Gom cụm marker (marker clustering) tạm để lại phase sau — thư viện plugin clustering gây lỗi hiển thị không ổn định khi thử nghiệm, đã gỡ để ưu tiên độ ổn định.
- Danh sách card đồng bộ 2 chiều với marker (lọc/tìm kiếm cập nhật cả hai; bấm marker mở popup có nút "Xem chi tiết"; bấm card highlight marker).
- Tìm kiếm không phân biệt dấu; lọc theo loại hình, sở thích, thời gian, khoảng cách (khi đã có điểm xuất phát), còn chỗ, đánh giá cao, mới.
- Khối "Mới trên mạng lưới", "Thường trải nghiệm cùng nhau", "Sự kiện sắp tới".
- Hồ sơ địa điểm: thông tin rút gọn theo lớp, mục mở rộng (Bạn có thể làm gì/Cần biết trước khi đến/Liên hệ/Đánh giá), card hoạt động trả phí riêng biệt hoạt động miễn phí.
- "Lưu địa điểm" (yêu thích) — bấm là lưu ngay vào localStorage, còn nguyên sau reload, danh sách yêu thích không tăng trùng khi bấm nhiều lần.
- "Thêm vào hành trình" — lưu nháp vào bộ nhớ dùng chung, có thông báo rõ phần sắp xếp lịch trình hoàn thiện ở phase sau.
- "Đặt trải nghiệm" — thông báo rõ ràng tính năng đặt chỗ/thanh toán ở phase sau, không giả vờ đã đặt thành công.
- Fallback khi Leaflet không tải được (chặn mạng) — vẫn xem được danh sách địa điểm.
- Responsive 375/768/1440px, focus-visible rõ, nút hỗ trợ và điều hướng dùng được bằng bàn phím.

## Chi tiết Phase 2 — Tích hợp dữ liệu địa danh

Theo yêu cầu riêng của người dùng, đọc file nghiên cứu `30-dia-diem-Vinh-Long-Tra-Vinh.md` (30 hồ sơ có nguồn trích dẫn, đối chiếu 08/09/2026) và bảng giá/giờ/đánh giá ước lượng bổ sung, chuẩn hoá thành dữ liệu dùng chung cho toàn app — **không tạo lại website hay đổi design system**, chỉ thay đổi tầng dữ liệu và các chỗ hiển thị liên quan.

### File đã tạo
- `data/destinations.json` — 37 địa danh (30 từ đợt nghiên cứu mới + 7 từ Phase 1 chưa xác minh lại), mỗi trường có trạng thái `verified`/`estimated`/`missing` + ghi chú/nguồn.
- `DATA_ISSUES.md` — báo cáo đầy đủ: thiếu toạ độ, thiếu ảnh, thiếu giờ hoạt động, dữ liệu trùng đã hợp nhất, mâu thuẫn phát hiện được.
- `js/services/destinationsService.js` — adapter nạp + chuẩn hoá `destinations.json` thành dữ liệu runtime cho UI.

### File đã sửa
- `js/utils.js` — thêm `deriveCategoryVisual()` (tự nhóm danh mục + icon/màu từ dữ liệu, có fallback hash cho danh mục lạ) và `deriveInterests()` (tự suy sở thích từ loại hình); bỏ bảng danh mục cố định cũ.
- `js/data.js` — bỏ mảng `DESTINATIONS` cứng và `CATEGORY_OPTIONS`; giữ nguyên hosts/experiences/events/reviews mẫu (đã kiểm tra khớp `id` với dữ liệu mới).
- `js/storage.js` — tách "nội dung" (destinations, hosts, experiences, events, reviews mẫu — nạp mới mỗi lần khởi động từ `destinations.json`/`data.js`, không lưu localStorage) khỏi "dữ liệu người dùng" (yêu thích, hành trình nháp, booking... — vẫn lưu localStorage dưới key `vlt_user_state`). `init()`/`resetSample()` giờ là hàm bất đồng bộ (`async`).
- `js/app.js` — `await Storage.init()` trước khi render lần đầu, có màn "Đang tải dữ liệu…".
- `js/trail/explore.js` — bộ lọc danh mục, chú giải bản đồ và thống kê giờ tự sinh từ dữ liệu thật (rule "tự động tạo danh mục/thống kê/bộ lọc"); ẩn marker cho địa danh thiếu toạ độ (vẫn hiện trong danh sách kèm nhãn); hiện nhãn "(ước lượng)" cho các trường estimated.
- `js/trail/profile.js` — `await resetSample()`.
- `css/components.css` — thêm `min-width: 0` cho `.place-card` (sửa lỗi tràn viền — xem bên dưới).

### Chức năng đã hoạt động thật
- 37 địa danh nạp từ `data/destinations.json` qua `fetch()`, hiển thị đúng trong Khám phá + hồ sơ chi tiết.
- Danh mục, bộ lọc và chú giải bản đồ **tự sinh từ dữ liệu thật** (8 nhóm, tổng khớp 37) — không phải danh sách cố định.
- Địa danh thiếu toạ độ (23/37): không hiện marker, vẫn hiện trong danh sách, trang chi tiết dùng link "Tìm trên bản đồ" (từ nguồn) thay vì "Chỉ đường".
- Mọi trường ước lượng (giá, giờ, thời gian, đánh giá) hiện nhãn "(ước lượng)" rõ ràng trên card và trang chi tiết; trường xác minh không có nhãn; trường thiếu hiện "Chưa xác minh".
- Mâu thuẫn dữ liệu (đánh giá Chùa Âng/Chùa Hang) được xử lý đúng: ưu tiên số đã xác minh (Tripadvisor có trích dẫn), cảnh báo mâu thuẫn hiện ngay trên trang chi tiết.
- 7 địa danh trùng Phase 1 đã hợp nhất, giữ nguyên liên kết với trải nghiệm/host/đánh giá mẫu cũ.
- Huy hiệu "Được ghi nhận" đã điều chỉnh về đúng thực tế (không còn địa danh nào tự gán huy hiệu chưa qua duyệt).
- Tách dữ liệu nội dung khỏi dữ liệu người dùng trong localStorage — cập nhật `destinations.json` sau này có hiệu lực ngay, không cần người dùng bấm "khôi phục dữ liệu mẫu".

### Cách kiểm tra
1. `npm run dev`, mở tab Khám phá → thanh thống kê hiện "37 địa điểm...".
2. Mở Bộ lọc → xem danh mục tự sinh (8 nhóm) khớp với dữ liệu.
3. Mở hồ sơ "Chùa Âng" → mục Nguồn dữ liệu hiện cảnh báo mâu thuẫn đánh giá.
4. Mở hồ sơ "Sokfarm" (thiếu toạ độ) → nút "🔍 Tìm trên bản đồ" thay vì "Chỉ đường", mọi trường hiện "(ước lượng)".
5. Kiểm tra `localStorage.vlt_user_state` trong DevTools → không chứa mảng destinations.
6. Đọc `DATA_ISSUES.md` để biết đầy đủ các vấn đề dữ liệu đã ghi nhận.

### Đã kiểm thử thực tế trong phiên này
Xem bảng kết quả trong `README.md` (mục "Kiểm thử thực tế (Phase 2)"). Phát hiện và sửa 1 lỗi hiển thị thật: `.place-card` (grid item) thiếu `min-width: 0` khiến card tràn khỏi khung ở mọi kích thước màn hình khi nội dung dài (nhãn "ước lượng") — đã sửa và xác nhận lại ở 375/768/1440px.

### Còn lại (không phải bỏ sót, đúng roadmap)
Studio, Cổng quản lý, Cổng vận hành, và hoàn thiện deploy GitHub Pages/Hostinger — thực hiện ở các phase tiếp theo. 23 địa danh thiếu toạ độ vẫn cần khảo sát thực địa (xem `DATA_ISSUES.md`).

## Bổ sung ảnh địa danh (theo yêu cầu người dùng, cùng đợt Phase 4)

- Tải trực tiếp 17/37 ảnh có link nguồn công khai là ảnh thật (không phải trang bài viết) vào `assets/images/destinations/`, giữ nguyên không chỉnh sửa nội dung ảnh.
- `data/destinations.json`: `imageRef` của 17 mục này có thêm `localPath` + trạng thái `downloaded-demo-use`, ghi rõ "dùng cho demo phi thương mại, cần xin phép trước khi dùng production".
- `js/utils.js` thêm `destinationImageSrc()` — ưu tiên ảnh thật, fallback placeholder SVG cho 20 địa danh còn lại (đúng yêu cầu Phase 2 "chưa tìm/tải ảnh trong phase đó", nay đã bổ sung).
- Đã kiểm tra thật: ảnh tải đúng kích thước gốc (vd. Ao Bà Om 1500×999px), hiển thị đúng ở card/hero/mini-card, có `loading="lazy"`.

## Chi tiết Phase 4 — Hoàn thiện chức năng dành cho du khách

Toàn bộ mục 6–9 của spec gốc (`Prompt-Claude-Vinh-Long.md`), gộp thành một phase theo yêu cầu người dùng.

### File đã tạo
- `js/services/bookingService.js` — giữ chỗ có TTL (15 phút), kiểm tra sức chứa thật (tính từ `bookingItems` đang hiệu lực, không sửa dữ liệu nội dung), mô phỏng phản hồi hộ (chấp nhận/từ chối từng mục), tính tiền hoàn theo mốc thời gian (≥24h: 100%, 6–24h: 50%, &lt;6h: 0%).
- `js/services/paymentService.js` — thanh toán demo (đặt cọc 30%/toàn bộ), không thu thông tin thẻ.
- `js/services/aiService.js` (viết lại) — thuật toán rule-based tạo 2–3 phương án hành trình: chấm điểm địa điểm theo sở thích/ưu tiên/khoảng cách, ràng buộc giờ mở cửa (best-effort parse), sức chứa, ngân sách thời gian; `recalcTimeline()` dùng lại khi sửa hành trình.
- `js/trail/itinerary.js` — trang danh sách hành trình + form 4 bước (thời gian & điểm xuất phát; đoàn & nhu cầu; sở thích & phong cách; tuỳ chọn thêm) + trang kết quả.
- `js/trail/itineraryDetail.js` — timeline + bản đồ (Leaflet, có polyline nối điểm), thêm/xoá/thay thế/sắp xếp điểm (tự tính lại giờ/chi phí), chế độ "đang diễn ra" (điểm hiện tại/tiếp theo theo giờ thật, đã ghé thăm, mô phỏng hộ xác nhận hoàn thành), heatmap mô phỏng + gợi ý đổi điểm.
- `js/trail/booking.js` — modal 1 luồng: giỏ hàng → giữ chỗ → thanh toán → mô phỏng phản hồi hộ (từng mục) → kết quả.
- `js/trail/support.js` — gửi yêu cầu hỗ trợ/báo cáo sự cố, danh sách ticket + timeline.
- `js/trail/passport.js` — bản đồ + danh sách dấu khám phá (phân biệt tự đánh dấu/đã xác nhận), đánh giá chưa viết, đổi điểm lấy voucher, lịch sử hành trình, ticket hỗ trợ.

### File đã sửa
- `js/storage.js` — thêm CRUD cho `itineraries`, `passportStamps`, `pointsLedger` (chống cộng trùng qua `idempotencyKey`), `vouchers`, `userReviews` (đánh giá thật của khách, tách khỏi `reviews` mẫu — nội dung, không bị mất khi "khôi phục dữ liệu mẫu" xoá đúng phần user data), `supportTickets`; thêm `voucherCatalog` vào danh sách nội dung nạp mới mỗi phiên.
- `js/data.js` — slot id đổi từ ngẫu nhiên sang cố định (`${expId}-sN`) để `bookingItems` tham chiếu đúng qua nhiều phiên; thêm `buildVoucherCatalog()`.
- `js/trail/placeDetail.js` — "Đặt trải nghiệm" nối vào luồng booking thật (chọn khung giờ + số khách trước khi vào giỏ hàng); "Thêm vào hành trình" ưu tiên thêm thẳng vào hành trình đang sửa nếu có; đánh giá tiêu biểu gộp cả `reviews` mẫu và `userReviews` thật.
- `js/trail/explore.js` — nút bật/tắt "Mật độ (mô phỏng)" hiện badge mức độ đông trên từng card.
- `js/app.js` — route `#/trail/itinerary`, `/new`, `/:id`, `/trail/passport` trỏ vào trang thật.
- `js/trail/profile.js` — hiện số hành trình/điểm thưởng, link sang Hộ chiếu.
- `css/trail.css`, `css/base.css` — style cho timeline hành trình (`.itin-stop`...), trạng thái nút bật (`aria-pressed`).

### Chức năng đã hoạt động thật (đã kiểm thử trên trình duyệt thật, không suy đoán)
- Form 4 bước → thuật toán demo tạo đúng 2 phương án hợp lệ (phương án trùng nhau tự động bị loại, không hiện phương án giả) với timeline giờ/chi phí chính xác.
- Chọn hành trình → lưu → trang chi tiết hiện đúng timeline + bản đồ (polyline nối điểm theo thứ tự).
- Sắp xếp lại (↑↓), xoá, thêm địa điểm mới (tìm kiếm không dấu) — giờ/chi phí tự tính lại chính xác sau mỗi thao tác.
- Đặt hoạt động trả phí (từ hồ sơ địa điểm hoặc "Đặt các hoạt động trả phí" trong hành trình) → giữ chỗ 15 phút → chọn đặt cọc/thanh toán toàn bộ (demo) → mô phỏng hộ chấp nhận/từ chối từng mục → tổng tiền tự điều chỉnh theo mục bị từ chối.
- Thử đặt vượt sức chứa → bị chặn với thông báo cụ thể số chỗ còn lại (kịch bản 4 spec mục 15).
- Bắt đầu hành trình → chế độ "đang diễn ra" hiện đúng điểm hiện tại/tiếp theo theo giờ thật; "Đã ghé thăm" (tự đánh dấu) và "mô phỏng hộ xác nhận hoàn thành" là hai luồng tách biệt, không cộng điểm/Passport trùng.
- Heatmap mô phỏng hiện ở cả Khám phá và trong hành trình; nút "Xem gợi ý đổi điểm" chỉ xuất hiện khi điểm đang đông và chưa có booking, gợi ý đúng điểm cùng nhóm danh mục đang vắng hơn, áp dụng đổi thật khi bấm.
- Nút "Cần hỗ trợ" nổi trong lúc hành trình đang diễn ra → gửi ticket → có mã, timeline, xem lại được ở Hộ chiếu sau chuyến đi.
- Hoàn thành trải nghiệm → cộng điểm đúng 1 lần (10 điểm + 5 điểm thưởng lần đầu với hộ mới) → hiện dấu Passport "Đã xác nhận" → có thể viết đánh giá (4 hạng mục sao + góp ý) → đánh giá hiện ngay trên trang địa điểm.
- Đổi điểm lấy voucher (nút tự khoá khi không đủ điểm), đánh dấu voucher đã dùng.
- Huỷ hành trình hiện đúng cảnh báo về booking đã xác nhận trước khi xác nhận huỷ.
- Toàn bộ dữ liệu (hành trình, booking, điểm, Passport, ticket) sống sót qua reload trang thật (đã kiểm tra bằng cách tải lại toàn trang, không chỉ điều hướng nội bộ).

### Lỗi phát hiện và đã sửa khi test (không chỉ khai báo suông)
1. **Sai lệch thời gian**: hành trình xem trước (bước chọn phương án) và hành trình đã lưu hiện tổng thời gian khác nhau, vì `recalcTimeline()` tính lại thời gian ở mỗi điểm từ đầu mà không giữ độ lệch nhịp độ (nhanh/chậm) đã áp dụng lúc tạo. Đã sửa: lưu `dwellMin` cố định vào từng điểm khi tạo, `recalcTimeline()` tái sử dụng thay vì tính lại từ 0.
2. **Thiếu import**: `deriveCategoryVisual` bị dọn nhầm khỏi import của `itineraryDetail.js` trước khi tính năng "gợi ý đổi điểm" (dùng hàm này) được thêm vào, gây lỗi runtime khi bấm nút — phát hiện qua console lúc test, đã sửa và xác nhận lại.

### Giới hạn đã biết (không giấu)
- Địa điểm thêm thủ công vào hành trình (không qua thuật toán gợi ý) chưa tự gắn hoạt động trả phí — vẫn đặt được bình thường qua trang hồ sơ địa điểm, chỉ là không có sẵn nút "đặt nhanh" ngay trong timeline cho trường hợp này.
- Kiểm tra giờ mở cửa chỉ áp dụng khi dữ liệu có dạng "HH:MM–HH:MM" phân tích được; các mục ghi "chưa xác minh" không bị chặn (đúng nguyên tắc không suy diễn "đóng cửa" khi chưa chắc).
- QR vé/booking là mã chữ (không phải hình QR quét được) — đủ để trình diễn luồng, chưa dùng thư viện tạo mã vạch/QR thật.

### Còn lại (không phải bỏ sót, đúng roadmap)
Cổng dữ liệu quản lý, Cổng vận hành, và hoàn thiện deploy GitHub Pages/Hostinger — thực hiện ở các phase tiếp theo.

## Chi tiết Phase 5 — Hoàn thiện Studio dành cho hộ cung cấp trải nghiệm

Toàn bộ mục 10 của spec gốc. Thay đổi kiến trúc quan trọng: trước Phase 5, việc hộ chấp nhận/từ chối booking và xác nhận hoàn thành được Trail tự mô phỏng (vì Studio chưa tồn tại). Từ Phase 5, các hành động này **chuyển hẳn sang Studio thật** — Trail chỉ còn tạo booking (trạng thái "chờ hộ xác nhận") và hiển thị kết quả khi hộ đã xử lý, đúng luồng thật của spec.

### File mới
- `js/studio/shell.js` — khung Studio: sidebar 5 tab ở desktop, bottom-nav ở mobile, bộ chọn "hộ đang xem" (chuyển vai trò demo, giống Trail/Cổng quản lý).
- `js/studio/overview.js` — doanh thu, khách đã phục vụ, trải nghiệm đã tổ chức, điểm sao, booking cần phản hồi, tiền chờ nhận/đã nhận, việc cần làm hôm nay, danh sách dịch vụ.
- `js/studio/experiences.js` — danh sách + tạo/sửa trải nghiệm (tên, mô tả, giá, thời lượng, điều kiện), quản lý khung giờ (thêm/đóng-mở/xoá), luồng nháp → gửi duyệt → mô phỏng cộng đồng/vận hành duyệt (Ops chưa xây).
- `js/studio/bookings.js` — danh sách booking lọc theo trạng thái, chấp nhận/từ chối (có lý do), xác nhận hoàn thành, giải ngân mô phỏng.
- `js/studio/reports.js` — biểu đồ doanh thu/khách 12 tháng (Chart.js qua CDN, có fallback bảng số liệu khi CDN lỗi — đã kiểm thử thật), khối CPS nội bộ, danh sách gợi ý cải thiện.
- `js/studio/support.js` — gửi/theo dõi đề án hỗ trợ, gửi yêu cầu xem xét ngoại lệ CPS; nút "mô phỏng" cho vai trò quản lý/vận hành (chưa xây) duyệt ngay để trình diễn đủ luồng.
- `js/services/cpsService.js` — công thức CPS minh hoạ (30% phản hồi + 40% hoàn thành + 30% đánh giá, chuẩn hoá 0–1, thiếu dữ liệu dùng 0.7 trung tính, có ghi chú); New Spotlight cho hộ &lt;3 booking; sinh gợi ý cải thiện rule-based từ dữ liệu thật (không bịa số).

### File đã sửa (thay đổi kiến trúc quan trọng)
- `js/services/bookingService.js` — thêm `completeBookingItem()` (hộ xác nhận hoàn thành: cộng điểm, dấu Passport, chuyển tiền sang "đang giữ") và `releasePayout()` (giải ngân mô phỏng, chặn nếu còn ticket hỗ trợ mở); sửa docstring `respondToBooking` vì giờ là hành động thật của Studio, không còn là "mô phỏng" của Trail.
- `js/trail/booking.js` — **bỏ bước tự mô phỏng hộ phản hồi**; sau khi thanh toán, hiện màn "Chờ hộ xác nhận" và dừng — hộ xử lý thật trong Studio.
- `js/trail/itineraryDetail.js` — bỏ nút "mô phỏng hộ xác nhận hoàn thành" (chuyển sang Studio); khi trạng thái `accepted` chỉ hiện dòng chữ "Hộ sẽ xác nhận hoàn thành trong Studio...".
- `js/trail/placeDetail.js` — ghi nhận lượt xem địa điểm (`recordDestinationView`) để tính gợi ý "nhiều lượt xem nhưng ít booking".
- `js/storage.js` — CRUD cho `proposals`, `cpsExceptions`; `recordDestinationView`, `setSuggestionDecision`, `setCurrentHostId`/`getCurrentHostId`; `upsertHostExperience()` + hợp nhất `hostExperiences` (đã lưu) vào `experiences` (nội dung, nạp mới mỗi phiên) lúc khởi tạo — cùng kỹ thuật đã dùng cho `destinations`/`userReviews`.
- `js/data.js` — thêm `hostExperiences: []`, `cpsExceptions: []`, `viewCounts: {}`, `suggestionDecisions: {}`, `ui.currentHostId`; sinh dữ liệu báo cáo 12 tháng minh hoạ theo từng hộ (`metrics.monthlyByHost`, xác định theo hostId nên ổn định trong phiên).
- `js/utils.js` — thêm `formatMoney()` (số tiền tài chính hiện "0 đ", khác `formatCurrency()` vốn hiện "Miễn phí" cho giá tham quan — sửa lỗi thật, xem bên dưới).
- `css/layout.css` — style khung Studio (`.studio-shell`, `.studio-sidebar`...).

### Chức năng đã hoạt động thật (đã kiểm thử trên trình duyệt thật)
- **Booking tạo ở Trail xuất hiện ngay trong Studio**: đặt trải nghiệm ở hồ sơ địa điểm (Trail) → chuyển sang Studio (đổi hộ tương ứng bằng bộ chọn) → booking hiện đúng trong "Lịch & Booking" với trạng thái "Chờ xác nhận", đúng tên hoạt động/địa điểm/giờ/số khách/tiền — không cần thao tác đồng bộ nào.
- Chấp nhận booking trong Studio → khách thấy trạng thái "Đã xác nhận" khi quay lại Trail. Từ chối (có chọn lý do) → trạng thái "Bị từ chối", không tính tiền.
- Xác nhận hoàn thành trong Studio → Passport bên Trail cộng đúng dấu "Đã xác nhận" + điểm thưởng (đã kiểm tra không cộng trùng), tiền chuyển sang "đang giữ" ở Tổng quan Studio.
- Giải ngân (mô phỏng) → "Tiền chờ nhận" giảm đúng, "Đã nhận" tăng đúng bằng số tiền của booking đó.
- Tạo trải nghiệm mới trong Studio → nháp → gửi duyệt → mô phỏng duyệt → **xuất hiện ngay trên trang hồ sơ địa điểm ở Trail** (đã kiểm thử) — kể cả sau khi tải lại toàn trang.
- Gợi ý cải thiện "nhiều lượt xem nhưng chưa có booking" sinh đúng từ lượt xem thật (đã kiểm thử: xem 1 địa điểm 4 lần, gợi ý hiện đúng số "4 lượt xem... 0 booking"); bấm "Bỏ qua" cập nhật đúng, không hiện lại.
- CPS: hộ mới (&lt;3 booking) hiện "New Spotlight", không bị gắn nhãn chất lượng kém — đúng yêu cầu.
- Đề án hỗ trợ và yêu cầu ngoại lệ CPS: gửi → mô phỏng quản lý/vận hành duyệt → trạng thái cập nhật đúng, có lịch sử thời gian.
- Báo cáo: khi Chart.js không tải được (đã xảy ra thật trong lúc test — có thể do mạng sandbox chặn CDN), tự chuyển sang hiện bảng số liệu dạng chữ, không vỡ trang; tháng hiện tại trong biểu đồ khớp đúng với dữ liệu booking thật (không lệch giữa biểu đồ và bảng).
- Dữ liệu Studio (trải nghiệm tạo mới, booking, đề án, ngoại lệ CPS) sống sót qua reload trang thật.

### Lỗi phát hiện và đã sửa khi test (không chỉ khai báo suông)
1. **`formatCurrency(0)` trả về "Miễn phí"** khi dùng để hiển thị số tiền tài chính (doanh thu, tiền chờ nhận/đã nhận) — đúng cho giá tham quan nhưng sai ngữ nghĩa cho số liệu kế toán. Phát hiện ngay khi mở Tổng quan Studio lần đầu (hiện "Tổng doanh thu: Miễn phí"). Đã thêm `formatMoney()` riêng cho các trường hợp này.
2. **Mất dữ liệu form khi thêm khung giờ**: trong form tạo/sửa trải nghiệm, bấm "Thêm khung giờ" vẽ lại toàn bộ form từ object `exp` mà chưa đọc giá trị các ô nhập (tên, mô tả...) hiện tại vào object trước — khiến tên/mô tả vừa gõ bị mất trắng. Phát hiện khi test luồng tạo trải nghiệm mới, đã sửa (đọc form trước khi vẽ lại) và xác nhận lại.

### Giới hạn đã biết (không giấu)
- Mỗi hộ demo hiện gắn cố định với 1 địa điểm (đúng dữ liệu mẫu hiện có) — form tạo trải nghiệm không cho chọn địa điểm khác, chỉ tạo thêm hoạt động tại địa điểm đã gắn.
- Một booking có nhiều mục thuộc nhiều hộ khác nhau: "tiền chờ nhận/đã nhận" tính theo trạng thái giải ngân của cả booking (không tách theo từng hộ) — trường hợp hiếm trong dữ liệu demo hiện tại, ghi nhận để hoàn thiện nếu cần ở phase sau.
- Trải nghiệm do hộ tạo có khung giờ với ngày giờ cố định tại thời điểm lưu; nếu để rất lâu không chỉnh sửa, ngày có thể trở thành quá khứ (khác với trải nghiệm mẫu vốn luôn tự tính lại theo "hôm nay" mỗi phiên).

### Còn lại (không phải bỏ sót, đúng roadmap)
Hoàn thiện deploy GitHub Pages/Hostinger và chạy đủ 12 kịch bản nghiệm thu cuối cùng — thực hiện ở phase cuối.

## Chi tiết Phase 6 — Cổng dữ liệu quản lý và Cổng vận hành

Toàn bộ mục 11 và 12 của spec gốc, gộp làm một phase theo yêu cầu người dùng. Nguyên tắc bắt buộc theo yêu cầu: **không tạo số ngẫu nhiên riêng cho dashboard này** — mọi KPI/biểu đồ/bảng đều tính trực tiếp từ `state.bookingItems`, `state.reviews/userReviews`, `state.proposals`, `state.cpsExceptions`... (dữ liệu dùng chung với Trail/Studio), chỉ tái sử dụng đúng nguồn minh hoạ 12 tháng đã có sẵn ở Studio (`state.metrics.monthlyByHost`) cho phần xu hướng theo tháng thay vì bịa thêm một bộ số khác.

### File mới — Cổng dữ liệu quản lý (`#/admin/*`)
- `js/admin/shell.js` — khung 5 tab: Tổng quan/Luồng khách/Nhu cầu & Cơ hội/Đề án/Báo cáo.
- `js/admin/filters.js` — bộ lọc dùng chung (thời gian/khu vực/loại hình/nhóm khách), áp dụng đồng bộ cho mọi trang.
- `js/admin/metrics.js` — gộp `state.metrics.monthlyByHost` theo phạm vi lọc + ghi đè tháng hiện tại bằng dữ liệu booking thật (cùng kỹ thuật với `studio/reports.js`).
- `js/admin/overview.js` — KPI (tổng booking, lượt tham gia hoàn thành, tỷ lệ hoàn thành, doanh thu trải nghiệm), biểu đồ 12 tháng, doanh thu theo NHÓM hoạt động (không theo từng hộ).
- `js/admin/flow.js` — heatmap mật độ tổng hợp (dùng chung `getSimulatedCrowdLevel` với Trail, không tạo mô phỏng riêng), khung giờ cao điểm dự kiến, mùa/sự kiện cao điểm (từ `state.events` thật), phân khúc du khách (từ `state.itineraries` thật: đi một mình/nhóm, nhịp độ, ưu tiên, thời lượng trung bình, nơi đến hay chọn).
- `js/admin/demand.js` — cầu chưa đáp ứng theo hoạt động/slot (khung giờ gần hết chỗ), mức tập trung booking giữa các hộ (hiển thị ẩn danh "Hộ #1/#2..."), cơ hội phát triển sản phẩm (lượt xem cao/0 booking), dự báo mô phỏng (ngoại suy tuyến tính 3 tháng, ghi rõ phương pháp và giới hạn).
- `js/admin/proposals.js` — hộp thư đề án: lọc trạng thái, xem đầy đủ hồ sơ, "Đánh dấu đang xem xét"/"Yêu cầu bổ sung"/"Chấp thuận"/"Từ chối" — dùng chung `setProposalStatus` với Studio nên hộ thấy cập nhật ngay.
- `js/admin/reports.js` — hoa hồng Network (10%, cấu hình minh hoạ) tách khỏi "chi tiêu ước tính" (ghi rõ chưa có kỳ gốc so sánh, không gọi là "mức tăng"); tổng hợp phản hồi ẩn danh theo nhóm hoạt động có ngưỡng ẩn nhóm <3 quan sát; xuất CSV (booking đang lọc + phản hồi ẩn danh) kèm dòng chú thích ngày xuất/phạm vi lọc/nhãn dữ liệu demo.
- `js/services/csvService.js` — tiện ích xuất CSV chung (escape đúng chuẩn, BOM cho Excel đọc tiếng Việt).

### File mới — Cổng vận hành (`#/ops/*`)
- `js/ops/shell.js` — khung 4 tab: Booking & Giao dịch/Nội dung/Sự cố/Chất lượng & Hỗ trợ hộ.
- `js/ops/bookings.js` — toàn bộ booking + giao dịch trên mạng lưới (mọi hộ), lọc trạng thái/hộ/tìm mã booking, "Ghi chú điều phối" nội bộ cho booking bị từ chối/huỷ (không tự động đổi giờ/điểm — vẫn cần khách xác nhận qua Trail, đúng quy tắc booking).
- `js/ops/content.js` — hàng chờ kiểm duyệt trải nghiệm (`pending_review` → Duyệt & công bố / Yêu cầu chỉnh sửa), nhật ký kiểm duyệt (ai làm gì, khi nào).
- `js/ops/tickets.js` — xử lý ticket: gán người phụ trách (demo), xử lý hoàn tiền (gọi `cancelBooking` thật, áp đúng chính sách theo mốc giờ), đánh dấu đã xử lý — cập nhật timeline khách thấy được ở Trail.
- `js/ops/quality.js` — CPS theo hộ (hiển thị thật, chỉ ở vai trò này), cấp/thu hồi huy hiệu "Được ghi nhận" có lý do bắt buộc, duyệt/từ chối ngoại lệ CPS (toàn bộ hộ).
- `js/ops/community.js` — Cố vấn cộng đồng: **không dùng chung OpsShell** (cố ý) — chỉ hiển thị hàng chờ duyệt văn hoá + ngoại lệ CPS danh mục "nghi lễ", có banner "Quyền hạn chế" giải thích rõ không xem được booking/giao dịch/khách.

### Thay đổi kiến trúc quan trọng
- **Loại bỏ toàn bộ nút "🎭 Mô phỏng: ... duyệt"** còn sót lại ở Studio (`experiences.js`, `support.js`) — giờ cộng đồng/vận hành duyệt trải nghiệm thật ở Cổng vận hành, quản lý xử lý đề án thật ở Cổng dữ liệu quản lý, vận hành/cố vấn duyệt ngoại lệ CPS thật — đúng mô hình đã áp dụng ở Phase 5 (Trail → Studio).
- Thêm luồng "Cập nhật & gửi lại" đề án ở Studio khi quản lý yêu cầu bổ sung (trước đây chỉ có nút mô phỏng xoay vòng trạng thái, hộ không thực sự sửa được nội dung).
- Huy hiệu "Được ghi nhận": thêm `hostRecognitionOverrides` (persist, giống cơ chế `hostExperiences`) để Cổng vận hành cấp/thu hồi có lý do, đè lên cờ tĩnh trong `destinations.json` — không còn là dữ liệu cố định không đổi được.
- Xoá `js/comingSoon.js` (không còn route nào dùng tới vì Admin/Ops đã có trang thật).

### Phân quyền hiển thị dữ liệu giữa vai trò (đã kiểm thử trực tiếp)
- Cổng dữ liệu quản lý: không hiển thị CPS hoặc doanh thu từng hộ ở bất kỳ đâu (chỉ theo nhóm/cụm, hộ ẩn danh hoá "Hộ #1/#2..."), có banner nhắc rõ trên mọi trang.
- Cổng vận hành: hiển thị CPS thật theo từng hộ và toàn bộ booking/giao dịch/khách — đúng mô tả "CPS chỉ hộ đó và vai trò vận hành có thẩm quyền xem".
- Cố vấn cộng đồng: đã kiểm thử — trang chỉ hiện đúng 2 khối (duyệt văn hoá + ngoại lệ "nghi lễ"), không có tab Booking/Giao dịch/Sự cố nào cả, kể cả trong DOM.

### Bug nghiêm trọng phát hiện và đã sửa khi kiểm thử (không chỉ khai báo suông)
1. **Mất toàn bộ dữ liệu người dùng mỗi lần tải lại trang thật (không phải điều hướng trong SPA)**: `defaultUserData()` trong `js/storage.js` khởi tạo `schemaVersion: SCHEMA_VERSION` đúng, nhưng ngay sau đó một vòng lặp copy toàn bộ trường không phải "nội dung" từ `createSeedState()` — trong đó có trường `schemaVersion: 1` cũ sót lại từ Phase 1 trong `js/data.js` — đã **ghi đè nhầm** giá trị đúng bằng giá trị cũ sai. Hậu quả: lần lưu đầu tiên (hoặc sau "Khôi phục dữ liệu mẫu") ghi `schemaVersion: 1` vào localStorage; ngay lần tải lại tiếp theo, `loadUserData()` thấy `1 !== 2` (SCHEMA_VERSION thật) nên coi là không hợp lệ và **âm thầm xoá sạch** mọi dữ liệu người dùng (booking, đề án, ngoại lệ CPS, huy hiệu, yêu thích, điểm thưởng...) — lặp lại ở mọi lần tải sau đó. Phát hiện khi kiểm thử luồng Ops xử lý hoàn tiền (đóng/mở lại trang để xác nhận UI thật). Đã sửa: bỏ trường `schemaVersion` khỏi `createSeedState()` (không thuộc về "nội dung"), gán `schemaVersion` sau vòng lặp copy trong `defaultUserData()`. Đã kiểm thử lại: tải lại trang 3 lần liên tiếp, dữ liệu (yêu thích, booking...) và `schemaVersion: 2` đều giữ nguyên đúng. Đây là lỗi nghiêm trọng nhất từng phát hiện trong dự án — vi phạm trực tiếp yêu cầu "Không xóa dữ liệu khi reload" — may mắn là chưa từng lộ ra ở các phase trước vì kiểm thử trước đó chủ yếu điều hướng bằng hash routing trong SPA (không tải lại trang thật), tới Phase 6 mới cần tải lại trang thật để xác nhận UI Cổng vận hành nên mới phát hiện.
2. **Chính sách hoàn tiền tính sai theo múi giờ**: `computeRefundAmount` trong `js/services/bookingService.js` cắt chuỗi ISO (`slot.date.slice(0,10)`) để lấy ngày rồi ghép với giờ hẹn — nhưng `slot.date` lưu dạng UTC trong khi múi giờ Việt Nam là UTC+7, nên cắt chuỗi có thể lùi lại một ngày (nửa đêm giờ Việt Nam ngày mai = 17h UTC ngày hôm nay). Hậu quả: một booking hẹn sáng mai (còn ~22 tiếng) bị tính nhầm là "dưới 6 giờ trước giờ hẹn" → hoàn 0đ thay vì đúng chính sách 50%. Phát hiện khi kiểm thử luồng Ops xử lý hoàn tiền cho ticket thật. Đã sửa: dùng getter giờ địa phương (`getFullYear/getMonth/getDate`) thay vì cắt chuỗi UTC để ghép đúng ngày+giờ hẹn theo giờ địa phương. Đã kiểm thử lại qua UI thật: cùng một booking, trước khi sửa hiện "0 đ", sau khi sửa hiện đúng "45.000 đ — Huỷ trong 6–24 giờ: hoàn 50%".

### Kịch bản nghiệm thu đã chạy trong phase này
- Kịch bản 9 (đề án): hộ gửi đề án → quản lý yêu cầu bổ sung → hộ cập nhật & gửi lại → quản lý chấp thuận. Đã chạy đủ qua UI thật, trạng thái/nhật ký khớp ở cả hai phía.
- Kịch bản 10 (ngoại lệ CPS): hộ gửi yêu cầu (danh mục "nghi lễ") → cố vấn cộng đồng duyệt → trạng thái cập nhật, có nhật ký thời gian.
- Kịch bản 7 (sự cố hoàn tiền): khách yêu cầu hoàn tiền → vận hành xử lý (`cancelBooking` thật, đúng chính sách theo mốc giờ sau khi sửa bug) → ticket chuyển "Đã xử lý", giao dịch hoàn tiền xuất hiện đúng trong "Giao dịch gần đây".
- Kịch bản 8 (kiểm duyệt nội dung): hộ tạo nháp → gửi duyệt → vận hành/cố vấn cộng đồng duyệt thật (không còn nút mô phỏng) → khách mới thấy nội dung công bố.
- Kiểm tra phân quyền: đã xác nhận CPS không lộ ở Cổng dữ liệu quản lý, có lộ đúng ở Cổng vận hành; Cố vấn cộng đồng không thấy booking/giao dịch.
- Kiểm tra responsive 375px: bảng rộng (Booking & Giao dịch) cuộn ngang bên trong card riêng, trang không tràn ngang; bottom-nav 5 tab (Admin) và 4 tab (Ops) hiển thị đúng.

### Giới hạn đã biết (không giấu)
- "Điều phối booking thủ công" ở Cổng vận hành chỉ ghi chú nội bộ, chưa có engine tự động gợi ý/áp dụng đổi giờ-đổi điểm thay khách — đúng theo quy tắc booking (khách phải tự xác nhận thay đổi ảnh hưởng tới hành trình/tiền qua Trail), không giả vờ có khả năng tự động hoá chưa thật sự tồn tại.
- Xuất CSV dùng `Blob` + link tải chuẩn của trình duyệt (hoạt động đúng trên trình duyệt thật); môi trường sandbox dùng để kiểm thử tự động có thể chặn việc tải file xuống, đã xác minh không có lỗi JS khi bấm nút và nội dung CSV sinh ra đúng qua kiểm tra trực tiếp.
- Dự báo mô phỏng chỉ ngoại suy tuyến tính đơn giản từ 3 tháng gần nhất, không tính mùa vụ/lễ hội — đã ghi rõ giới hạn ngay trên giao diện.

### Còn lại (không phải bỏ sót, đúng roadmap)
Hoàn thiện deploy GitHub Pages/Hostinger và chạy đủ 12 kịch bản nghiệm thu cuối cùng — thực hiện ở phase cuối.

## Phase cuối — Kiểm tra và chuẩn bị deploy

Rà soát toàn bộ dự án theo checklist bàn giao: chức năng, lỗi JS/link/ảnh/responsive, đường dẫn dưới repo con GitHub Pages, tải lại trang ở các route hash, rò rỉ dữ liệu nhạy cảm, README, đối chiếu spec, chạy đủ 12 kịch bản nghiệm thu.

### Kiểm tra thực hiện
- Quét console lỗi trên toàn bộ route tĩnh của Trail/Studio/Cổng dữ liệu quản lý/Cổng vận hành (kể cả `#/studio/experiences/new`, `#/studio/experiences/:id`, `#/ops/community`) — không có lỗi JS nào.
- Rà soát toàn bộ `js/` và CSS: không có đường dẫn tuyệt đối (`/...`), không có `location.pathname`/`location.origin` giả định domain gốc — chạy đúng dưới repo con GitHub Pages.
- Rà soát `js/`, `data/`, file cấu hình: không có API key/secret/token nào bị commit.
- Tải lại trang thật (`location.reload()`, không phải điều hướng SPA) trực tiếp ở nhiều route sâu (hồ sơ địa điểm, Studio → Báo cáo, Cổng dữ liệu quản lý → Nhu cầu & Cơ hội) — tất cả tải đúng, không lỗi, không 404.
- Kiểm tra dữ liệu localStorage bị hỏng (ghi JSON không hợp lệ trực tiếp) → app không crash, tự phục hồi về dữ liệu mặc định thay vì màn trắng.
- Responsive 375/768/1440px cho toàn bộ trang mới (Cổng dữ liệu quản lý, Cổng vận hành) — không tràn ngang, bảng rộng cuộn trong khung riêng.
- Ảnh: xác nhận toàn bộ ảnh địa danh tải qua đường dẫn nội bộ (`assets/images/destinations/`) hoặc placeholder tự sinh — không hotlink ảnh ngoài nên không thể vỡ ảnh khi deploy.
- Chạy đủ 12 kịch bản nghiệm thu bắt buộc (mục 15 spec) qua UI thật — xem bảng bên dưới.

### Lỗi phát hiện và đã sửa
1. **Nội dung "Về bản demo" (Trail → Cá nhân) lỗi thời** — vẫn ghi "Studio, Cổng quản lý, Cổng vận hành sẽ hoàn thiện ở các phase tiếp theo" dù cả ba đã xây xong từ Phase 5–6. Đã sửa thành mô tả đúng thực tế, có hướng dẫn vào "Cổng quản lý" từ trang chào.
2. **Bug nghiêm trọng: không thể xử lý tiếp các mục còn lại của booking combo sau lần phản hồi đầu tiên** — `respondToBooking()` (`js/services/bookingService.js`) chặn mọi lệnh gọi tiếp theo bằng điều kiện `booking.status !== 'pending_host'`. Ngay sau khi một hộ phản hồi (chấp nhận HOẶC từ chối) một phần của booking combo, `booking.status` chuyển thành `partially_confirmed` — khiến các hộ còn lại (hoặc chính hộ đó với mục khác) **không thể chấp nhận/từ chối phần của mình nữa**, nút bấm trong Studio không báo lỗi rõ ràng nhưng hành động bị âm thầm từ chối (`ok: false`). Đây chính là lỗi chặn đứng **Kịch bản nghiệm thu 3** ("Đặt combo → chuyển Studio → chấp nhận một phần, từ chối một phần"). Phát hiện khi dựng kịch bản combo 2 hộ để chạy đủ 12 kịch bản nghiệm thu bắt buộc. Đã sửa: đổi điều kiện chặn sang kiểm tra còn mục nào ở trạng thái `pending` hay không (bất kể trạng thái tổng của booking), thay vì so sánh chuỗi trạng thái cố định. Đã kiểm thử lại qua UI thật: tạo booking combo 2 hoạt động (2 hộ khác nhau) → hộ 1 chấp nhận → hộ 2 từ chối thành công (trước khi sửa bị chặn) → Trail hiện đúng "Đã xác nhận" / "Bị từ chối" cho từng chặng, tổng tiền booking tự điều chỉnh đúng còn 180.000đ (loại phần bị từ chối).
3. Copy `Prompt-Claude-Vinh-Long.md` (đặc tả gốc) vào thư mục dự án — trước đó README/PROGRESS.md/REQUIREMENTS_MATRIX.md đều trích dẫn file này nhưng file nằm ngoài thư mục dự án (không được commit), khiến liên kết vô nghĩa với bất kỳ ai clone repo từ GitHub.

### Kịch bản nghiệm thu bắt buộc (mục 15 spec) — kết quả cuối cùng

| # | Kịch bản | Kết quả |
|---|---|---|
| 1 | Chọn du khách → lọc bản đồ → mở chi tiết → thêm yêu thích → reload vẫn còn | ✅ Pass |
| 2 | Nhập đoàn/giờ/sở thích → tạo lịch hợp lệ → thay/xoá điểm → thời gian và giá cập nhật | ✅ Pass |
| 3 | Đặt combo → chuyển Studio → chấp nhận một phần, từ chối một phần → Trail thể hiện đúng và cho xử lý phần từ chối | ✅ Pass (sau khi sửa lỗi #2 ở trên) |
| 4 | Thử đặt vượt sức chứa hoặc ngoài giờ → bị chặn với thông báo cụ thể | ✅ Pass |
| 5 | Hoàn thành trải nghiệm đúng luồng → đánh giá → Passport/điểm tăng đúng một lần → đổi voucher không dùng lặp trái điều kiện | ✅ Pass |
| 6 | Bật heatmap → chọn yên tĩnh/náo nhiệt → xem đề xuất đổi lịch, không tự thay booking | ✅ Pass |
| 7 | Gửi sự cố yêu cầu hoàn tiền → vận hành xử lý → khách thấy tiến trình; khoản đang tranh chấp chưa giải ngân | ✅ Pass |
| 8 | Hộ tạo nháp bằng gõ tay → gửi duyệt → cộng đồng/vận hành duyệt → khách mới thấy nội dung công bố | ✅ Pass |
| 9 | Hộ gửi đề án → cổng quản lý yêu cầu bổ sung → hộ cập nhật → quản lý phản hồi | ✅ Pass |
| 10 | Hộ gửi ngoại lệ CPS → người có quyền duyệt → kỳ đánh giá cập nhật và có nhật ký | ✅ Pass |
| 11 | Dashboard lọc thời gian/nhóm → KPI, biểu đồ, bảng và CSV khớp nhau; không lộ CPS cho khách/Sở | ✅ Pass |
| 12 | Mobile không tràn, modal đóng được, nút hỗ trợ dễ tìm; từ chối GPS/camera hoặc tải bản đồ lỗi vẫn có cách tiếp tục | ✅ Pass |

### Giới hạn đã biết (không giấu)
- Giữ chỗ (hold TTL 15 phút) của các mục còn `pending` trong một booking combo **không tự hết hạn** nếu booking đã chuyển `partially_confirmed` (do một mục khác đã được phản hồi) — `reapExpiredHolds()` hiện chỉ quét booking còn ở trạng thái `pending_host`. Trường hợp hiếm (combo nhiều hộ, một hộ phản hồi trước khi hộ kia phản hồi trong khi giữ chỗ vẫn còn hạn) — ghi nhận để hoàn thiện nếu cần, không chặn luồng demo chính.
- Chưa có cơ chế cache-busting cho tên file JS/CSS tĩnh khi deploy bản cập nhật — người dùng có thể cần tải lại cứng (Ctrl+Shift+R) để thấy thay đổi mới nhất, đặc biệt rõ khi kiểm thử cục bộ với static server cache mạnh (đã gặp trong lúc kiểm thử phase này).

### Còn lại
Không còn mục nào theo roadmap — đã triển khai đủ toàn bộ 16 mục spec (một số ở mức mô phỏng có nhãn rõ theo đúng yêu cầu, xem README mục "Đối chiếu specification"). Việc còn lại là thao tác deploy thật (git push, bật GitHub Pages) do người dùng thực hiện theo hướng dẫn trong README.

## Kiểm tra & bổ sung — Bản đồ khám phá + Tích hợp ảnh địa danh

Trước khi coi 2 tính năng này là "Phase 3" và "Phase 7" riêng, đã audit lại toàn bộ so với yêu cầu chi tiết vì phần lõi đã được xây từ Phase 1/2 — tránh làm lại từ đầu. Kết quả: cả hai đã hoạt động ~90–95%, chỉ có 4 khoảng trống thật sự, đã bổ sung đủ (không xây lại, không đổi thiết kế).

### Đã có sẵn từ trước (xác nhận qua code, không cần làm lại)
- Bản đồ: Leaflet + OSM không cần API key, marker sinh từ `data/destinations.json`, đồng bộ marker/danh sách/lọc/tìm kiếm, tự `fitBounds`, địa danh thiếu toạ độ vẫn ở danh sách không tạo marker, danh sách dự phòng khi bản đồ lỗi (`#map-fallback`), lớp mật độ mô phỏng có nhãn rõ ("🌡️ Mật độ (mô phỏng)"), không có đường dẫn tuyệt đối nên chạy đúng dưới repo con GitHub Pages.
- Ảnh: ghép theo `destinationId` (không suy đoán theo tên), tên file không dấu/không khoảng trắng, đường dẫn ảnh đọc từ dữ liệu (`destinationImageSrc()`) không hard-code trong HTML, placeholder SVG tự sinh cho địa danh chưa có ảnh, lazy loading (`loading="lazy"`) trên hầu hết card ảnh.

### 4 khoảng trống đã bổ sung
1. **Popup marker thiếu trường** — `buildPopupHtml()` (`js/trail/explore.js`) trước đây chỉ hiện tên/loại hình/đánh giá, thiếu mô tả ngắn, giá và giờ mở cửa theo đúng yêu cầu. Đã thêm cả 3 trường (mô tả rút gọn ≤90 ký tự, giá có nhãn ước lượng, giờ mở cửa có nhãn ước lượng) — đã kiểm thử qua UI thật.
2. **Ảnh chưa tối ưu dung lượng, chưa dùng WebP** — 17 ảnh đã tải nặng tổng 9,4MB (có file tới 1,6MB, một số PNG dùng cho ảnh chụp). Viết `scripts/optimize-images.js` (dùng `sharp`, cài tạm bằng `npm install --no-save sharp`, không thêm vào `package.json` — site vẫn không cần build step) để nén toàn bộ 17 ảnh sang WebP (resize tối đa 1200px, chất lượng 80), giữ bản gốc ở `assets/images/destinations/originals/`. Kết quả: 9,4MB → ~2,1MB (giảm ~78%). Cập nhật `imageRef.localPath` sang `.webp` và thêm `imageRef.originalLocalPath` trỏ về bản gốc trong `data/destinations.json`. Đã kiểm thử: 0 ảnh vỡ trên toàn site sau khi đổi định dạng.
3. **Chưa có kiến trúc gallery nhiều ảnh** — `imageRef` trong dữ liệu chỉ là 1 object, không hỗ trợ nhiều ảnh/địa danh. Thêm trường `gallery` (mảng, mỗi phần tử cùng cấu trúc `imageRef`) trong schema `data/destinations.json`, map sang `galleryImages` trong `destinationsService.js`; `placeDetail.js` render khối "Thư viện ảnh" (ảnh đầu = hero đã có sẵn, các ảnh trong `gallery` hiện dạng dải thumbnail cuộn ngang, click mở ảnh gốc tab mới, `loading="lazy"`) — chỉ hiện khi có dữ liệu, không đổi giao diện các trang khác. Đã kiểm thử bằng dữ liệu giả lập tạm thời (2 ảnh) trên desktop + mobile, xác nhận hoạt động đúng rồi khôi phục `data/destinations.json` về đúng dữ liệu thật (không có địa danh nào thật sự có >1 ảnh ở thời điểm này nên `gallery` để trống ở cả 37 mục).
4. **`DATA_ISSUES.md` mục ảnh bị lỗi thời** — vẫn ghi "toàn bộ 37 địa danh dùng placeholder" dù đã tải thật 17/37 từ trước. Viết lại mục 2 cho đúng thực tế: danh sách 17 địa danh có ảnh thật, đã nén WebP, lưu bản gốc ở đâu, cảnh báo bản quyền (ảnh nguồn công khai, cần xin phép trước khi dùng thương mại), danh sách 20 địa danh còn placeholder, và xác nhận không có ca ghép ảnh không chắc chắn nào cần liệt kê (toàn bộ ghép theo id lúc tải, không suy đoán).

### Giới hạn đã biết (không giấu)
- `scripts/optimize-images.js` là script chạy một lần thủ công (không tự động hoá trong pipeline vì site không có build step) — cần `npm install --no-save sharp` trước khi chạy, đã gỡ `sharp` khỏi `node_modules` sau khi dùng xong.
- Gallery đã sẵn kiến trúc nhưng chưa có dữ liệu ảnh phụ thật nào — chỉ phát huy tác dụng khi có thêm ảnh được thêm vào trường `gallery` của địa danh tương ứng sau này.
- 20/37 địa danh vẫn chưa có ảnh thật (đúng như Phase 2 — chưa xin phép nguồn để tải), không nằm trong phạm vi lần bổ sung này.

## Sửa lỗi + tính năng mới — Cảm nhận sau khi tự ghé thăm + trang tổng kết hành trình

Người dùng tự kiểm thử app phát hiện: sau khi đánh dấu "Đã ghé thăm" hết các điểm trong hành trình gợi ý, màn hình không điều hướng sang trang tổng kết/đánh giá. Đồng thời đề xuất mô hình đánh giá kết hợp sao + tag theo từng nhóm loại hình (tương tự Grab) thay vì một bộ câu hỏi chung cho mọi địa điểm.

### Nguyên nhân lỗi
`itinerary.status` chỉ có đường chuyển `selected → active` (bấm "Bắt đầu hành trình") — chưa từng có chỗ nào gán `status = 'completed'`, dù `statusBadge()` và trang danh sách hành trình đã sẵn nhãn "Đã hoàn thành" từ trước (chờ sẵn nhưng chưa có gì kích hoạt).

### Đã xây dựng
- `js/trail/reviewTags.js` — bộ tiêu chí đánh giá nhanh theo nhóm loại hình (dùng chung `categoryGroup()` đã có), tối đa 6 tiêu chí/địa điểm: Thiên nhiên, Tôn giáo, Làng nghề & cộng đồng, Trải nghiệm tại hộ dân, Bảo tàng/Di tích, Khu tưởng niệm, Nhà cổ, Ẩm thực, và bộ chung (fallback). Rating ≤3 sao tự đổi sang bộ tiêu chí "cần cải thiện" (Vệ sinh, Biển chỉ dẫn, Chất lượng dịch vụ...).
- `js/trail/placeImpression.js` — modal "Cảm nhận chuyến ghé thăm": chọn sao → hiện tiêu chí phù hợp (chọn nhiều, không chấm điểm từng câu) → góp ý tuỳ chọn → hỏi có giới thiệu cho người khác không → Gửi/Bỏ qua. Không bắt buộc, không chặn tiến trình.
- `addPlaceImpression()` (`js/storage.js`) — lưu vào mảng mới `placeImpressions`, **tách khỏi** `userReviews` (vốn gắn với booking, dùng cho CPS/host) vì đây là tín hiệu tự khai báo cho điểm miễn phí — không tính vào CPS.
- Sửa `js/trail/itineraryDetail.js`: bấm "Đã ghé thăm" giờ mở modal cảm nhận ngay sau khi đánh dấu; đóng modal (dù gửi hay bỏ qua) sẽ kiểm tra — nếu **tất cả** điểm đã tự đánh dấu ghé thăm thì gán `itinerary.status = 'completed'` và điều hướng sang `#/trail/itinerary/:id/summary`; nếu chưa, vẽ lại trang hành trình như cũ.
- `js/trail/itinerarySummary.js` (trang mới) — tổng kết hành trình: số điểm đã ghé/tổng thời gian/số cảm nhận đã gửi, danh sách từng điểm kèm sao+tiêu chí+góp ý đã cho (hoặc nút "Gửi cảm nhận" bù nếu bỏ qua lúc trước), gộp luôn nút "Đánh giá hoạt động trả phí" cho các booking đã hoàn thành chưa được viết đánh giá (dùng lại `openReviewModal` có sẵn) — một nơi xử lý hết việc còn thiếu sau chuyến đi.

### Đã kiểm thử qua DOM thật (không suy đoán)
- Hành trình 2 điểm (Ao Bà Om – Thiên nhiên, Chùa Âng – Tôn giáo): đánh dấu ghé thăm điểm 1 → modal đúng tên địa điểm → chọn 4 sao → đúng 6 tiêu chí nhóm "Thiên nhiên" hiện ra → chọn 2 tiêu chí + viết góp ý + chọn "Giới thiệu: Có" → Gửi → lưu đúng vào `placeImpressions` với đủ trường, không điều hướng (chưa xong điểm 2).
- Điểm 2: chọn 2 sao → tiêu chí tự đổi sang bộ "Điều gì cần được cải thiện?" (Vệ sinh, Biển chỉ dẫn...) → Gửi → `itinerary.status` chuyển `completed`, tự điều hướng sang trang tổng kết, hiện đúng 2 sao/4 sao và tiêu chí/góp ý đã chọn cho từng điểm.
- Hành trình khác: bấm "Bỏ qua" ở cả 2 điểm — vẫn hoàn thành hành trình đúng (không bắt buộc phải đánh giá), trang tổng kết hiện "0/2" + nút "Gửi cảm nhận" bù cho từng điểm; bấm nút đó mở lại đúng modal, gửi thành công cập nhật "1/2" ngay không cần tải lại trang.
- Tiêu chí đúng theo nhóm loại hình cho cả 3 nhóm đã thử (Thiên nhiên, Tôn giáo, Bảo tàng/Di tích) — khớp đúng danh sách đã định nghĩa.
- Danh sách hành trình (`#/trail/itinerary`) và trang chi tiết hành trình đã hoàn thành đều hiện đúng nhãn "Đã hoàn thành" có sẵn từ trước; mở lại hành trình đã hoàn thành không còn nút "Đã ghé thăm"/banner live (đúng — chỉ xem lại).
- Test fresh state (xoá localStorage) toàn bộ site: 0 lỗi console, 0 ảnh vỡ.

### Lỗi phát hiện và đã sửa khi kiểm thử
Card địa điểm trong trang tổng kết tràn ra ngoài màn hình mobile — dùng nhầm class `.mini-card__img` (width:100%, thiết kế cho ảnh full-width trong grid) thay vì `.itin-stop__img` (72×72px cố định, đúng cho layout ảnh nhỏ + text bên cạnh). Đã sửa bằng cách dùng lại cấu trúc `.itin-stop`/`.itin-stop__body` có sẵn (cùng pattern itineraryDetail.js đang dùng) — xác nhận lại đúng trên mobile 375px, không tràn ngang.

### Giới hạn đã biết (không giấu)
- Việc gửi/bỏ qua cảm nhận từng điểm (`placeImpressions`) không tự cộng điểm thưởng — điểm thưởng được cộng một lần cho **cả hành trình** khi hoàn thành (xem mục cập nhật bên dưới), tách bạch với điểm thưởng trải nghiệm trả phí hoàn thành qua Studio.
- Hoàn thành hành trình hiện chỉ dựa vào "tất cả điểm đã tự đánh dấu ghé thăm" (không phụ thuộc trạng thái booking) — khớp đúng hành động người dùng vừa bấm, nhưng có nghĩa một hành trình có thể "hoàn thành" dù một hoạt động trả phí trong đó chưa được hộ xác nhận xong; đây là tín hiệu tiến trình cá nhân của khách, tách bạch với xác nhận booking (đúng nguyên tắc đã áp dụng xuyên suốt dự án).
- Tổng hợp tiêu chí (vd "Ao Bà Om được khen nhiều về cảnh quan nhưng hay bị phàn nàn vệ sinh") chưa hiển thị ở trang chi tiết địa điểm — mới dừng ở mức thu thập dữ liệu có cấu trúc; hiển thị tổng hợp để lại cho lần sau nếu cần.

## Cập nhật trang tổng kết hành trình — điểm thưởng + đổi voucher

Theo yêu cầu bổ sung: phía trên trang tổng kết hiện lời chúc mừng + số điểm thưởng nhận được, phía dưới là danh sách voucher có thể đổi ngay.

- Thêm điểm thưởng cho **hoàn thành cả hành trình** (khác với điểm thưởng theo từng trải nghiệm trả phí đã có) — `POINTS_PER_STOP_ON_ITINERARY_COMPLETE = 5` điểm/điểm đã ghé thăm (`js/trail/itineraryDetail.js`), cộng đúng một lần nhờ `addPoints()` đã chống lặp sẵn theo `reason = itinerary-complete-<id>` (an toàn dù tải lại trang hay xem lại trang tổng kết nhiều lần).
- `js/trail/itinerarySummary.js`: đổi tiêu đề thành "Chúc mừng bạn đã hoàn thành chuyến đi!", thêm khối nổi bật "Số điểm bạn nhận được: +X điểm" (đọc từ `pointsLedger` theo đúng hành trình, không suy đoán) và "Tổng điểm hiện có", ngay bên dưới là mục "Đổi điểm lấy voucher" dùng lại đúng danh sách/nút đổi voucher đã có ở Hộ chiếu (`voucherCatalogHtml()` — export từ `passport.js` để dùng chung, không viết lại).
- Đã kiểm thử qua DOM thật: hành trình 2 điểm → hiện đúng "+10 điểm" (2×5) và tổng điểm cập nhật đúng; nút đổi voucher tự khoá khi chưa đủ điểm, cộng thêm 100 điểm rồi đổi voucher 100 điểm ngay trên trang tổng kết → đúng trừ điểm, tạo voucher, cập nhật số dư hiển thị ngay không cần tải lại trang. Trang Hộ chiếu vẫn hoạt động đúng sau khi tách `voucherCatalogHtml()` ra dùng chung. Kiểm tra mobile 375px: khối điểm thưởng và danh sách voucher hiển thị gọn, không tràn ngang.

## Đổi thương hiệu & thiết kế lại giao diện

Theo yêu cầu riêng: đổi tên sản phẩm thành **KhmerLink** (trước đây "Vĩnh Long — Chạm văn hóa, nối hành trình"), thiết kế lại giao diện theo phong cách "văn hiến" tham khảo bìa sách *Nghìn xưa văn hiến* (NXB Kim Đồng) và bộ slide *Hoàng Thành Thăng Long* — giấy cũ + mực đồng/vàng cổ thay vì tông xanh lá hiện đại ban đầu.

### Đổi tên (chỉ đổi thương hiệu, không đổi dữ liệu địa danh thật)
`index.html` (title/meta), `js/welcome.js` (tiêu đề trang chào), `js/trail/shell.js` + `js/studio/shell.js` (brand Trail/Studio), `package.json` (name/description), `README.md` (tiêu đề + đoạn giới thiệu). `PROGRESS.md`/`REQUIREMENTS_MATRIX.md` giữ nguyên tên cũ ở các mục log trước thời điểm đổi tên (đã thêm ghi chú đầu file), không viết lại lịch sử. Các chỗ "Vĩnh Long" mang nghĩa địa danh thật (địa chỉ, dữ liệu 37 địa danh, tên tỉnh) **giữ nguyên**, không đổi — chỉ đổi tên thương hiệu sản phẩm.

### Thiết kế lại (toàn bộ qua design token, không sửa từng file)
- `css/tokens.css`: đổi cả bộ 27 biến màu — nâu đồng (`#6b4423`) làm màu chính thay xanh lá đậm cũ, nền kem/giấy cũ ấm hơn, vàng đồng cổ (`#b8862e`) làm điểm nhấn (gần với `--color-accent` gốc nên không lệch quá xa bảng màu spec ban đầu). Thêm biến `--font-display: "Cormorant Garamond"` (phông serif trang trọng).
- `index.html`: nạp phông Cormorant Garamond từ Google Fonts (có bộ dấu tiếng Việt đầy đủ, đã kiểm thử không vỡ dấu ở chế độ in đậm/thường).
- `css/base.css`: áp `--font-display` cho `h1`, `h2` toàn site — phần thân/UI dày đặc vẫn giữ phông sans-serif cũ để dễ đọc trên di động (đúng nguyên tắc "chữ tiếng Việt dễ đọc" trong spec gốc).
- `css/layout.css`: viết lại `.welcome-page` — thêm hoạ tiết trang trí dạng sóng (SVG tự vẽ inline, không dùng ảnh ngoài để tránh vướng bản quyền như đã lưu ý ở ảnh địa danh), tên thương hiệu chữ hoa cỡ lớn kiểu bìa sách, tagline in nghiêng. Brand trên thanh top bar (`.trail-topbar__brand`) cũng đổi sang phông display.
- `assets/icons/favicon.svg`: vẽ lại thành hoa sen cách điệu trên nền nâu đồng.
- Cập nhật thêm vài màu **hard-code** (không đi qua biến CSS, cần sửa tay): đường vẽ hành trình trên bản đồ (`itineraryDetail.js`), 2 biểu đồ Chart.js doanh thu/khách (`studio/reports.js`) — đổi từ xanh lá/vàng cũ sang nâu đồng/vàng cổ mới để nhất quán với bảng màu.
- **Không đổi**: toàn bộ mã màu theo danh mục địa điểm (`categoryEmoji`/`categoryColor`/`CATEGORY_GROUPS` trong `js/utils.js`) và mức mật độ khách (`CROWD_LEVELS`) — đây là hệ màu **chức năng** (phân biệt loại hình trên bản đồ/badge, phân biệt mức đông/vắng), tách biệt hoàn toàn khỏi màu thương hiệu nên giữ nguyên, không bị ảnh hưởng bởi việc đổi tokens.
- Không dùng ảnh/hoạ tiết trang trí lấy từ nguồn ngoài dù được đề nghị tự do tìm kiếm — ưu tiên tự vẽ SVG để tránh rủi ro bản quyền (nhất quán với cách xử lý ảnh địa danh ở `DATA_ISSUES.md`). Người dùng có thể cung cấp ảnh/hoạ tiết cụ thể để tích hợp thêm nếu muốn.

### Đã kiểm thử qua trình duyệt thật
- Trang chào, hồ sơ địa điểm (Chùa Âng), Khám phá, Studio Tổng quan, Cổng dữ liệu quản lý, Hộ chiếu — cả desktop và mobile 375px: giao diện lên đúng bảng màu mới, không tràn ngang, không lỗi console.
- Phát hiện và sửa 1 lỗi: gradient nền trang chào có một điểm dừng màu **hard-code xanh lá cũ** (`#0e2c1c`) sót lại thay vì dùng biến — khiến đáy trang vẫn ánh xanh dù đã đổi token. Đã sửa sang tông nâu đồng đậm khớp bảng màu mới.
- Kiểm tra riêng phông chữ tiếng Việt: các từ có dấu tổ hợp (vd "chạm", "hóa", "nối", "trình", "Chùa Âng") hiển thị đúng dấu ở cả chữ đậm/thường/nghiêng trong Cormorant Garamond, không vỡ ký tự — xác nhận qua `document.fonts` (font đã tải đúng bộ ký tự tiếng Việt cần dùng).
- Xác nhận hệ màu chức năng (loại hình địa điểm, mức mật độ khách) không bị ảnh hưởng — badge/marker vẫn đúng màu cũ theo danh mục.

### Giới hạn đã biết (không giấu)
- Tên "KhmerLink" gợi hướng văn hoá Khmer, trong khi dữ liệu 37 địa danh bao quát cả di tích Việt, Hoa và làng nghề không riêng Khmer — đây là lựa chọn thương hiệu mang tính gợi mở/thẩm mỹ theo yêu cầu người dùng, không phải mô tả phạm vi nội dung theo nghĩa hẹp.
- Chưa tích hợp ảnh/hoạ tiết trang trí thật từ nguồn ngoài — mới dùng SVG tự vẽ đơn giản (sóng, hoa sen). Nếu người dùng cung cấp ảnh cụ thể, có thể tích hợp thêm ở phần nền trang chào hoặc header mà không cần đổi lại kiến trúc.
- Bản đồ Leaflet/OpenStreetMap vẫn dùng tile gốc (không có tuỳ chọn theme màu cho tile bản đồ) — chỉ marker/polyline đổi màu theo bảng mới.

## Sửa lỗi Cổng quản lý (sau khi đổi thương hiệu) — 2026-09-09

Người dùng báo "phần cổng quản lý hơi lỗi" sau khi đổi giao diện. Kiểm tra trực tiếp qua trình duyệt phát hiện: trang `#/gateway` (Cổng quản lý) bị tràn chữ ngang — tiêu đề, đoạn giới thiệu và mô tả thẻ "Cổng dữ liệu quản lý" bị cắt mất ở mép phải thay vì xuống dòng.

**Nguyên nhân**: đoạn giới thiệu (`<p>`) trong `renderGateway()` (`js/welcome.js`) chưa từng có ràng buộc `max-width` kể từ Phase 1 (xác nhận qua `git log -p`). Vì là con trực tiếp của `.welcome-page` (flex-column, `align-items:center`, không giới hạn chiều rộng con), phần tử này co giãn theo kích thước nội dung thay vì theo viewport — chữ dài render tràn ra ngoài và bị `body{overflow-x:hidden}` cắt âm thầm thay vì xuống dòng. Lỗi vốn tồn tại từ đầu nhưng chỉ lộ rõ gần đây do (a) đoạn mô tả bị kéo dài hơn ở phase trước và (b) phông serif mới (Cormorant Garamond) rộng hơn phông cũ.

**Đã sửa** — `css/layout.css`, thêm ràng buộc chiều rộng cho mọi `<div>` con trực tiếp của `.welcome-page` (áp dụng chung, không chỉ riêng phần tử lỗi) và `overflow-x:hidden` phòng vệ:
```css
.welcome-page > div { max-width: 480px; width: 100%; min-width: 0; }
```

**Đã kiểm thử qua trình duyệt thật**: trang chào (`#/`) và Cổng quản lý (`#/gateway`) ở cả desktop và mobile 375px — chữ xuống dòng đúng, không còn bị cắt; xác nhận qua JS `document.documentElement.scrollWidth === clientWidth` (không tràn ngang). Kiểm tra thêm Cổng dữ liệu quản lý (`#/admin/overview`, dùng `.studio-shell` khác layout) — không bị ảnh hưởng, hiển thị bình thường.

### Lỗi thứ 2 cùng khu vực: trang Cố vấn cộng đồng vỡ layout hoàn toàn

Kiểm tra tiếp các trang khác trong Cổng quản lý phát hiện lỗi nặng hơn ở `#/ops/community` (Cố vấn cộng đồng): thanh tiêu đề (topbar) và nút "← Cổng quản lý" bị vỡ chữ từng chữ chồng lên thẻ nội dung, phía trên có một khoảng trắng lớn bất thường.

**Nguyên nhân**: `js/ops/community.js` là trang DUY NHẤT tự dựng `<header class="trail-topbar">` rồi đặt nó làm **con cùng cấp** với card nội dung bên trong `.page-generic` — nhưng class `.page-generic` (`css/layout.css`) được thiết kế riêng cho khối "coming soon"/"đang tải" đơn giản: `display:flex; align-items:center; justify-content:center` (canh giữa MỘT khối duy nhất theo cả hai chiều). Khi có 2 phần tử con (header + card), flexbox coi cả hai là item hàng ngang canh giữa — header bị co lại theo nội dung (shrink-to-fit) thay vì chiếm trọn chiều ngang, khiến chữ trong đó vỡ dòng từng từ và đè lên card. Toàn bộ các trang khác dùng `.page-generic` (lỗi hệ thống ở `app.js`, màn đang tải, khối "sắp có" trong `explore.js`) đều chỉ có đúng 1 con nên không gặp lỗi này.

**Đã sửa**: đổi wrapper của trang từ `.page-generic` sang `.trail-shell` (class flex-column full-page đã dùng đúng cho mọi shell khác có topbar — Trail/Studio/Ops/Admin) — chỉ đổi 1 class, không đổi cấu trúc HTML hay CSS khác.

**Đã kiểm thử qua trình duyệt thật**: `#/ops/community` desktop và mobile 375px — topbar hiển thị đúng 1 hàng ngang, không còn vỡ chữ/đè chồng, không có khoảng trắng thừa.

### Lỗi thứ 3: thanh topbar cắt chữ ở các trang có tên dài trên di động (375px)

Rà soát toàn bộ 26 route của app (script tự động kiểm tra `scrollWidth`/`clientWidth` và vị trí các phần tử con trong topbar so với khung topbar, cả desktop lẫn mobile 375px) phát hiện thêm: `#/admin/*` (brand "📊 Cổng dữ liệu quản lý" + nút "← Cổng quản lý" đều dài) bị tràn nhẹ — nút "← Cổng quản lý" khi xuống 2 dòng cao 64px nhưng khung topbar cố định `height: 60px`, khiến nút bị cắt mất 2px ở mép trên và mép dưới, đè nhẹ lên thanh "Demo vai trò" bên dưới.

**Nguyên nhân gốc**: `.trail-topbar` (dùng chung cho MỌI shell: Trail/Studio/Admin/Ops/Cố vấn cộng đồng) đặt `height` cố định thay vì `min-height` — bất kỳ trang nào có brand hoặc nút quá dài, xuống 2 dòng trên màn hẹp, đều có nguy cơ bị cắt tương tự (không riêng gì Admin, do brand/nút mỗi shell dài ngắn khác nhau).

**Đã sửa tận gốc** (thay vì vá riêng từng trang): `css/layout.css`, đổi `.trail-topbar` từ `height: var(--topbar-height)` sang `min-height: var(--topbar-height)` kèm padding dọc `var(--space-2)` thay vì `0` — topbar giờ tự giãn cao khi nội dung xuống dòng, không còn giới hạn cứng.

**Đã kiểm thử qua trình duyệt thật**: quét lại toàn bộ 26 route (script tự động, cả desktop và mobile 375px) — không còn route nào bị tràn ngang (`scrollWidth`) hoặc có phần tử con lồi ra ngoài khung topbar. Kiểm tra mắt thường `#/admin/flow` trên mobile — nút "← Cổng quản lý" 2 dòng giờ nằm gọn trong khung, không đè lên thanh dưới.

## Đổi tên "Khmer Link" → "KhmerLink" + thiết kế lại trang chào — 2026-09-10

Theo yêu cầu riêng: viết liền thành một từ **KhmerLink** (trước đó có khoảng trắng "Khmer Link" — sửa theo đúng yêu cầu lần này, không phải lỗi kỹ thuật). Đổi ở toàn bộ 8 file có nhắc tên thương hiệu: `index.html` (title), `package.json` (name/description), `js/welcome.js` (tiêu đề trang chào), `js/trail/shell.js` + `js/studio/shell.js` (brand Trail/Studio — đây chính là chỗ người dùng phát hiện còn sót "Khmer Link Trail" chưa cập nhật ở lượt đổi tên trước), `README.md`/`PROGRESS.md`/`REQUIREMENTS_MATRIX.md`. Rà soát lại bằng grep không phân biệt hoa/thường, không còn chỗ nào sót.

### Thiết kế lại trang chào (`#/`) — tham khảo bố cục ảnh mẫu người dùng cung cấp

Người dùng gửi ảnh mẫu: nền là ảnh chụp cổng đền Khmer mạ vàng, gradient tối phủ để chữ dễ đọc, tiêu đề lớn màu vàng đồng, 2 thẻ lựa chọn dạng viên thuốc (pill) có icon tròn + mũi tên `›`, link "Cổng quản lý" ở cuối. Đã dựng lại `renderWelcome()` theo tinh thần bố cục này (không sao chép y hệt mọi chi tiết trang trí như 2 cột trụ đá chạm khắc ở rìa ảnh — phần đó là hiệu ứng khung ảnh phức tạp, không cần thiết cho một trang demo):

- **Ảnh nền**: dùng lại ảnh **Chùa Vàm Ray** (`assets/images/destinations/chua-vam-ray.webp`) đã có sẵn trong repo — đúng ảnh cổng đền mạ vàng, rất khớp tinh thần ảnh mẫu, và đã có sẵn nhãn "downloaded-demo-use" + khuyến cáo bản quyền trong `DATA_ISSUES.md` nên tái dùng không phát sinh rủi ro bản quyền mới (khác với việc tải ảnh trang trí mới từ nguồn ngoài).
- **Kỹ thuật ảnh nền + lớp phủ gradient**: dùng 2 pseudo-element (`::before` cho ảnh, `::after` cho gradient tối, xếp lớp qua `z-index`) thay vì gộp chung vào 1 khai báo `background` nhiều lớp (`background-image: linear-gradient(...), url(...)`) — cách gộp nhiều lớp ban đầu bị lỗi không hiển thị ảnh trong khi kiểm thử (chỉ thấy gradient phẳng dù `getComputedStyle` báo đúng cả 2 lớp), đổi sang pseudo-element tách riêng thì hiển thị đúng ổn định.
- **Thẻ lựa chọn** (`.welcome-choice`): viết lại từ khối chữ đặc trên nền tối sang dạng pill sáng màu kem/vàng nhạt, có icon tròn riêng (`.welcome-choice__icon`), khối chữ (`.welcome-choice__body`), mũi tên `›` (`.welcome-choice__arrow`) — chỉ ảnh hưởng `renderWelcome()`, không đụng `renderGateway()` (Cổng quản lý vẫn dùng `.gateway-item` riêng, không đổi).
- **Trang Cổng quản lý (`#/gateway`) giữ nguyên** nền gradient phẳng như cũ — chỉ `renderWelcome()` dùng class `.welcome-page--hero` mới (biến thể có ảnh nền), tránh ảnh hưởng lỗi tràn chữ đã sửa ở trang Gateway trước đó.

**Đã kiểm thử qua trình duyệt thật**: trang chào desktop + mobile 375px — ảnh nền hiển thị đúng, chữ rõ trên nền tối, 2 thẻ lựa chọn đúng bố cục pill+icon+mũi tên. Bấm "Tôi là du khách" → xác nhận topbar Trail hiển thị đúng "🪷 KhmerLink Trail" (không còn "Khmer Link" cũ). Quét lại tự động brand text + tràn ngang trên 6 trang đại diện (Trail/Studio/Admin/Ops/Cố vấn cộng đồng/Gateway), cả desktop và mobile — không còn lỗi. Kiểm tra riêng trang Gateway không bị ảnh hưởng bởi thay đổi.

## Thiết kế lại trang chào theo mockup "Khmer heritage editorial" — 2026-09-10

Theo yêu cầu riêng kèm mockup chi tiết + ảnh nền Chùa Âng đã xử lý sẵn: dựng lại `renderWelcome()` bám sát mockup, **chỉ sửa trang chào** — không đụng dữ liệu, routing hay logic trang khác (đã xác nhận qua kiểm thử, xem bên dưới).

### File đã sửa
- `js/welcome.js` — viết lại toàn bộ `renderWelcome()` (giữ nguyên `renderGateway()`): thêm các hằng SVG tự vẽ mới (`LOTUS_ICON`, `SIDE_MARK_LEFT/RIGHT`, `DIAMOND_DIVIDER`, `COMPASS_ICON`, `HOUSE_ICON`, `CHEVRON_ICON`) thay cho emoji, cấu trúc HTML semantic hơn (`<nav aria-label="Chọn vai trò">` bọc 2 thẻ lựa chọn).
- `css/layout.css` — viết lại khối `.welcome-choice*` (thẻ pill kem + icon tròn + mũi tên) và `.welcome-page--hero` (biến `--khmer-*` màu riêng theo đúng mã màu người dùng cho, `min-height:100dvh`, `env(safe-area-inset-*)`, ảnh nền mới).
- `assets/images/hero/chua-ang-welcome.webp` (mới) — ảnh nền Chùa Âng người dùng cung cấp, nén sang WebP (167KB, từ PNG gốc 1.9MB, cùng cách làm với `scripts/optimize-images.js` đã dùng cho ảnh địa danh: cài `sharp` tạm thời, nén xong gỡ ngay — không thêm dependency thường trực).
- `assets/images/hero/originals/chua-ang-welcome.png` (mới) — bản gốc chưa nén, lưu lại theo đúng quy ước đã áp dụng cho ảnh địa danh.
- `package-lock.json` — chỉ đồng bộ lại `name` theo `package.json` (còn sót "vinh-long-trail" từ trước khi đổi thương hiệu), phát sinh tự động khi cài/gỡ `sharp` tạm thời, không phải thay đổi cố ý riêng.

### Tóm tắt thay đổi giao diện
- **Ảnh nền**: ảnh Chùa Âng do người dùng cung cấp (khác ảnh Chùa Vàm Ray dùng tạm ở lần trước) — hiển thị qua pseudo-element `::before` (`background-size:cover; background-position:center 42%`), không kéo méo, phần tháp chính của chùa nằm rõ ở giữa màn hình.
- **Lớp phủ gradient**: pseudo-element `::after` riêng, đúng 2 màu người dùng cho ở đầu/cuối (`rgba(38,20,10,0.85)` trên cùng, `rgba(45,22,8,0.95)` dưới cùng), vùng giữa gần như trong suốt để kiến trúc chùa vẫn sáng rõ.
- **Icon**: bỏ toàn bộ emoji (🪷🧭🏡), thay bằng SVG tự vẽ (la bàn, ngôi nhà, hoa sen, mũi tên chevron, hoạ tiết đường kẻ) — nhất quán với hoa sen ở favicon đã có, không dùng ảnh/thư viện icon ngoài (dự án chưa có sẵn thư viện icon).
- **Màu sắc riêng cho trang chào**: khai báo biến CSS cục bộ trong `.welcome-page--hero` (`--khmer-deep-brown`, `--khmer-cocoa-brown`, `--khmer-antique-gold`, `--khmer-warm-ivory`) đúng mã màu người dùng cho — không sửa bộ token màu chung `tokens.css` nên không ảnh hưởng trang khác.
- **Font chữ**: tiêu đề/tagline tiếp tục dùng `Cormorant Garamond` (đã tải sẵn từ lần trước); phần mô tả/thẻ lựa chọn dùng nguyên `--font-base` (Segoe UI/system-ui) đang dùng toàn site — không thêm Google Font mới (Be Vietnam Pro/Inter) vì font hệ thống đã đủ rõ và đủ dấu tiếng Việt, tránh phát sinh phụ thuộc không cần thiết.
- **Responsive**: `min-height:100dvh` (thay vì `100vh`, tránh lệch chiều cao trên mobile do thanh địa chỉ trình duyệt), `env(safe-area-inset-top/bottom)` cộng vào padding, giới hạn nội dung tối đa 480px trên desktop/tablet (không kéo full-width), toàn bộ thẻ (không riêng chữ/mũi tên) đều nằm trong 1 thẻ `<a>` nên click được ở bất kỳ đâu trên thẻ.
- **Accessibility**: `:focus-visible` riêng cho `.welcome-choice` (viền vàng đồng rõ), `aria-hidden` cho toàn bộ SVG trang trí, `<nav aria-label="Chọn vai trò">` bọc 2 lựa chọn chính.

### Sự cố phát hiện + đã sửa trong lúc làm
- Gộp ảnh nền + gradient chung 1 khai báo `background-image: linear-gradient(...), url(...)` (nhiều lớp) khiến ảnh không hiển thị dù `getComputedStyle` báo đúng — đổi sang 2 pseudo-element `::before`/`::after` riêng biệt thì ổn định.
- Đường dẫn ảnh nền lúc đầu viết `./assets/...` (sai — CSS resolve theo vị trí file `css/layout.css`, phải là `../assets/...`) — đã sửa.
- Đổi cấu trúc `<div>` giữa thành `<nav class="welcome-choices">` làm mất tác dụng selector `.welcome-page--hero > div` (chỉ khớp thẻ `div`), khiến nav bị vẽ **sau** (dưới) lớp ảnh/gradient theo thứ tự stacking — sửa selector thành `.welcome-page--hero > *` để áp dụng cho mọi loại thẻ con.

### Đã kiểm thử qua trình duyệt thật
- Desktop, tablet (768px) và mobile (375px): ảnh nền hiển thị đúng vị trí, không méo, không tràn ngang (`scrollWidth === clientWidth`); nội dung không bị kéo full-width trên desktop/tablet; 2 thẻ lựa chọn đọc rõ, kiến trúc chính của chùa vẫn thấy rõ ở giữa.
- Không có lỗi console; `href` của 2 thẻ lựa chọn và link "Cổng quản lý" xác nhận giữ nguyên (`#/trail/explore`, `#/studio`, `#/gateway`) — bấm thử điều hướng đúng, không lỗi.
- Kiểm tra riêng trang Cổng quản lý (`#/gateway`) — không bị ảnh hưởng, vẫn giữ giao diện gradient phẳng cũ.
- Chạy server local (`npx serve . -l 5500`) để xem trực tiếp qua trình duyệt trong lúc làm — không cần bước build (đúng kiến trúc site tĩnh sẵn có).

## PHASE — Thu gọn dữ liệu thành pilot 7 listing Khmer — 2026-09-10

Theo yêu cầu riêng kèm file `data/source/Du_lieu_7_diem_Khmer_Vinh_Long.xlsx` (4 sheet: Tổng quan/Hồ sơ website/Supplier & khảo sát/Nguồn & hình ảnh): thay toàn bộ phạm vi dữ liệu du lịch hiện tại (37 địa danh minh hoạ) bằng đúng 7 listing pilot thật, phân biệt rõ bản chất từng listing (`experience`/`site`/`cluster`/`multiStopExperience`), không hiển thị listing chưa bookable là "đang mở bán".

### Dữ liệu & kiến trúc
- `data/source/Du_lieu_7_diem_Khmer_Vinh_Long.xlsx` (mới) — bản sao file nguồn, đọc đầy đủ cả 4 sheet trước khi chuẩn hoá.
- `data/pilot-listings.json` (mới) — 7 listing đầy đủ schema yêu cầu (id/name/alternativeName/listingType/category/status/readiness/supplier.../coordinates/coordinateStatus/mapLinks/activities/shortIntroduction/culturalStory/keyFacts/visitorNotes/openingHours/price/bookingStatus/representativeImage/informationSources/verificationChecklist), cộng quan hệ `clusterChildren`/`partOfCluster`/`relatedListingIds`/`stops`. Chỉ 1/7 (SITE-07) có toạ độ thật; các trường giá/giờ chưa xác minh giữ nguyên trạng thái `unavailable`/`needsFieldVerification`, không suy diễn số liệu.
- `data/pilot-suppliers.json` (mới) — 7 hồ sơ supplier/đầu mối từ sheet "Supplier & khảo sát", chỉ dùng nội bộ (không fetch ở trang công khai).
- `data/archive/destinations-vinhlong-37.json` (di chuyển từ `data/destinations.json`) + `data/archive/legacy-seed-vinhlong.js.txt` (bản sao `js/data.js` cũ — 5 hộ/5 trải nghiệm/9 đánh giá/1 sự kiện/3 gợi ý ghép cặp gắn với 37 địa danh cũ) — archive đầy đủ, không xoá, có thể khôi phục khi cần mở lại phạm vi.
- `js/services/destinationsService.js` — viết lại để nạp từ `data/pilot-listings.json` thay vì `data/destinations.json`; giữ nguyên tên hàm `loadDestinations()`/export `DestinationsService` (chỉ nơi duy nhất import là `storage.js`) nên **không cần sửa storage.js hay bất kỳ nơi nào khác đang gọi hàm này** — đổi nguồn dữ liệu mà không phá vỡ luồng nạp đã có.
- `js/services/pilotSuppliersService.js` (mới) — nạp `data/pilot-suppliers.json`, chỉ dùng ở trang nội bộ `#/ops/pilot`.
- `js/data.js` — viết lại: `HOSTS`/`buildExperiences()`/`buildEvents()`/`buildReviews()` đưa về rỗng (không listing pilot nào có supplier/host đã xác nhận, không có đánh giá thật cho 7 listing — không tự thêm số liệu ngoài file); `PAIR_SUGGESTIONS` xây lại theo quan hệ thật giữa các listing pilot (chung supplier Lâm Phên: EXP-02+EXP-03; cụm Nguyệt Hóa: SITE-04+05+06).
- `js/utils.js` — thêm 6 rule đầu (anchor `^...$`) vào `CATEGORY_GROUPS` khớp chính xác 6 category pilot (Chùa Khmer/Bảo tàng/Thủ công/Ẩm thực/Âm nhạc và biểu diễn/Địa điểm văn hóa), đặt trước các rule cũ để tránh bị dò nhầm theo từ khoá rộng (vd "Chùa Khmer" chứa "chùa" lẽ ra bị rule cũ bắt thành nhóm "Tôn giáo"). Thêm `ratingDisplay()` (an toàn khi rating null — 7 listing pilot chưa có đánh giá thật), `listingTypeBadge()`, `ctaLabel()`.

### Giao diện du khách (Trail)
- `js/trail/explore.js` — tiêu đề "Mạng lưới trải nghiệm văn hóa Khmer (pilot)" + dòng giới thiệu; thống kê hiển thị đúng "7 điểm và trải nghiệm pilot" (hoặc "X/7 ... theo bộ lọc"); bỏ các bộ lọc không còn dữ liệu hỗ trợ (đánh giá, thời lượng, còn chỗ trải nghiệm trả phí, "chỉ mới") — chỉ giữ chip danh mục (tự sinh từ dữ liệu, không hiện danh mục rỗng) và khoảng cách; card thêm nhãn loại hình ("Điểm tham quan"/"Trải nghiệm đề xuất"/"Cụm điểm đến") + nhãn phụ ("Đang xác minh lịch" khi giờ chưa xác minh); tìm kiếm khớp cả `altName` (tên thay thế, vd "Wat Angkor Raig Borei").
- `js/trail/placeDetail.js` — viết lại theo đúng thứ tự ưu tiên yêu cầu (tên/loại hình → trạng thái sẵn sàng → giới thiệu ngắn → hoạt động → câu chuyện/số liệu → lưu ý → giờ/phí → bản đồ → liên quan); thêm khối riêng cho cụm (`clusterChildrenHtml` — liệt kê điểm con, nhấn mạnh "chưa phải công trình hoàn thiện") và đa điểm dừng (`multiStopHtml` — liệt kê từng điểm, không gộp pin); CTA theo `bookingStatus`/`ctaKind` ("Quan tâm trải nghiệm"/"Đăng ký nhận thông báo"/"Đang chuẩn bị pilot", không có nút "Đặt trải nghiệm" nào hiển thị vì chưa listing nào bookable); ảnh đại diện dùng URL thật có `onerror` tự chuyển về placeholder khi lỗi; mục "Nguồn tham khảo" gọn ở cuối trang; bỏ hẳn phần "Hoạt động trả phí"/booking modal (không còn `state.experiences` nào gắn với listing pilot).
- `js/services/mapService.js`, `js/trail/explore.js` (renderMarkers) — không sửa, đã sẵn logic chỉ tạo marker khi có `lat`/`lng` — tự động chỉ SITE-07 có marker (đã kiểm thử: đúng 1 marker trên bản đồ Khám phá).

### Hành trình (itinerary)
- `js/services/aiService.js` — `estimateTravelMin()` đổi từ trả về số phút sang `{min, known}`; khi thiếu toạ độ (`known:false`, đa số 7 listing pilot), timeline vẫn dùng `min` mặc định để LẬP LỊCH nhưng UI hiển thị trung thực "chưa đủ dữ liệu để tối ưu tuyến đường" thay vì trình bày như số đã xác minh. Thêm `isClusterDuplicate()` — chặn thuật toán gợi ý chọn đồng thời SITE-04 và SITE-05/06 (đã kiểm thử trực tiếp bằng cách ưu tiên hoá cả 3 qua `seedIds`: kết quả không bao giờ có SITE-04 cùng SITE-05/06 trong 1 hành trình). Stop ứng với listing `experience`/`multiStopExperience` chưa có booking thật được gắn ghi chú "Đề xuất — cần xác nhận supplier trước khi có thể đặt/thanh toán". Sửa luôn 2 chỗ dò tên nhóm danh mục cũ (`cultureFirst` rank, `lively` heuristic) đang dùng tên nhóm không còn tồn tại sau khi đổi category — cập nhật khớp 6 category pilot.
- `js/trail/itineraryDetail.js` — badge stop đổi theo `listingType`: "Đề xuất — cần xác nhận" cho trải nghiệm chưa bookable (thay vì "Miễn phí / tự do" gây hiểu nhầm); dòng thời gian di chuyển hiển thị "chưa đủ dữ liệu để tối ưu tuyến đường" khi `travelUnknown`; sửa 1 chỗ `.rating.toFixed()` có thể crash khi rating null (modal thêm địa điểm).
- `js/trail/placeDetail.js`'s `add-itinerary-btn` — thêm field `listingType`/`travelUnknown` khi tạo stop thủ công, đồng bộ với stop do wizard tạo.

### Cổng vận hành (nội bộ — không công khai)
- `js/ops/pilot.js` (mới), route `#/ops/pilot`, tab "Pilot Khmer" trong `js/ops/shell.js` — hồ sơ đầy đủ 7 listing: readiness, supplier phù hợp (tra từ `pilot-suppliers.json` qua `supplierRefs`), thông tin còn thiếu, cách tiếp cận đề xuất, rủi ro đạo đức/vận hành, checklist xác minh thực địa, bảng nguồn thông tin, tình trạng quyền ảnh. Đặt ở Cổng vận hành (không phải Cổng dữ liệu quản lý) vì đây là thông tin vận hành/operational, đúng phân quyền đã thiết lập từ trước (Admin chỉ xem tổng hợp/ẩn danh, Ops xem chi tiết vận hành).

### Đã kiểm thử qua trình duyệt thật
- `state.destinations.length === 7`, đúng 7 id `EXP-01..03`/`SITE-04..07`, đúng `listingType` từng cái (script tự động qua `storage.init()`).
- 6 chip danh mục hiển thị đúng, không danh mục rỗng, tổng đếm = 7 (2+1+1+1+1+1).
- Tìm kiếm "Wat Angkor" (tên thay thế của Chùa Âng) trả về đúng 1 kết quả.
- Trang chi tiết SITE-04 nêu rõ "không nên mô tả như một công trình duy nhất đã hoàn thiện" + liệt kê đúng Chùa Âng/Bảo tàng là điểm con.
- Trang chi tiết EXP-02 hiển thị đúng "Trải nghiệm đề xuất — 2 điểm dừng", liệt kê đúng 2 điểm dừng, 2 nút "Mở trên Google Maps" riêng biệt (không gộp 1 pin).
- Trang chi tiết SITE-07 nêu rõ Chùa Lò Gạch (di tích tỉnh 2022) và Bờ Lũy (di tích khảo cổ quốc gia 2018) là hai danh hiệu khác nhau.
- Bản đồ Khám phá: đúng 1 marker (SITE-07) — không có marker giả cho 6 listing còn lại.
- Hành trình nháp qua wizard: cả 3 stop tham chiếu EXP-01/02/03 hiển thị badge "Đề xuất — cần xác nhận" (không phải "Miễn phí/tự do"), không có nút "Đặt các hoạt động trả phí" nào xuất hiện (vì không stop nào có `experienceId`) — xác nhận không có đường nào dẫn tới booking/thanh toán cho 3 trải nghiệm chưa xác nhận.
- Kiểm thử trực tiếp cluster-dedup bằng cách ưu tiên hoá SITE-04+SITE-05+SITE-06 qua `seedIds`: không hành trình nào chứa cả cụm lẫn điểm con.
- `#/ops/pilot`: mở chi tiết EXP-03 xác nhận hiển thị đúng supplier (Lâm Phên), rủi ro riêng tư, checklist, nguồn — không có toạ độ/pin nhà riêng nào bị lộ (đã xác nhận `lat`/`lng` = null cho EXP-02 dừng 1 và EXP-03 trên toàn site, không chỉ ở trang này).
- Studio (`#/studio/overview` và các trang khác) không crash dù `state.hosts`/`state.experiences` rỗng — tự hiển thị về 0/rỗng đúng như thiết kế sẵn có (không phải lỗi mới phát sinh).
- Quét toàn bộ route Admin/Ops còn lại (`#/admin/*`, `#/ops/bookings|content|tickets|quality`) + Trail (`#/trail/passport`, `#/trail/profile`, `#/gateway`) qua script tự động — không lỗi console, không trang nào rỗng bất thường.
- Không tràn ngang (`scrollWidth === clientWidth`) trên desktop và mobile 375px cho toàn bộ trang đã sửa.
- Đường dẫn dữ liệu mới (`./data/pilot-listings.json`, `./data/pilot-suppliers.json`) và ảnh (`../assets/...` trong CSS) đều dùng path tương đối — không có path tuyệt đối nào lọt vào, giữ tương thích GitHub Pages subpath.

### Giới hạn đã biết (không giấu)
- Rating/số lượng đánh giá: cả 7 listing pilot đều **không có** vì Excel không cung cấp — UI hiển thị "Chưa có đánh giá" thay vì ẩn hoàn toàn, để nhất quán với các khối UI khác vẫn còn (mục "Đánh giá tiêu biểu" trên trang chi tiết).
- Thời lượng gợi ý (`suggestedDurationMin`) không có cho listing nào — thuật toán hành trình dùng mặc định nội bộ 45 phút khi tính lịch (hành vi có từ trước, không đổi trong phase này) nhưng **không** hiển thị con số này như đã xác minh ở bất kỳ đâu trên UI.
- Chưa thêm supplier/host/experience thật nào vào Studio cho 7 listing pilot — đúng phạm vi phase này (chỉ chuẩn hoá dữ liệu + giao diện hiển thị, chưa vận hành booking thật).

## PHASE — Bổ sung tên/địa chỉ, ảnh thật, toạ độ gần đúng, khôi phục hồ sơ 7 host — 2026-09-10

Theo yêu cầu riêng kèm file `data/source/Danh_sach_7_dia_diem_Khmer_Vinh_Long.xlsx` (tên hiển thị + địa chỉ hiện hành chi tiết hơn cho 7 listing): cập nhật tên/địa chỉ, tải ảnh thật cho card Khám phá, tra toạ độ khi đủ dữ liệu, và khôi phục hồ sơ "người cung cấp dịch vụ" trong Studio (đã bị đưa về rỗng ở phase trước).

### Dữ liệu
- `data/source/Danh_sach_7_dia_diem_Khmer_Vinh_Long.xlsx` (mới) — bản sao file nguồn thứ 2.
- `data/pilot-listings.json` — cập nhật `name`/`alternativeName` theo tên hiển thị mới (giữ tên tiếng Anh cũ làm `alternativeName` cho 3 EXP); cập nhật `currentAddress` cho EXP-02 (địa chỉ Dừng 2 giờ có số nhà: "Số 507 Nguyễn Đáng, khóm 10, phường Trà Vinh"); mỗi `stops[]` của EXP-02 giờ có `address`/`coordinates`/`coordinateStatus` riêng thay vì chỉ ở cấp listing; thêm `localImage` cho cả 7 listing.
- `data/pilot-suppliers.json` — cập nhật tên đầy đủ "Hộ kinh doanh Trần Tuấn Việt – Cốm Dẹp Tuấn Việt".

### Ảnh thật cho card Khám phá
Tải + nén cả 7 ảnh đại diện (đã có URL sẵn từ phase trước) về `assets/images/pilot/*.webp` (tổng ~1,4 MB, giảm từ ~9,3 MB gốc — bản gốc lưu ở `assets/images/pilot/originals/`, cùng cách làm `scripts/optimize-images.js` đã dùng cho bộ 37 địa danh cũ). `destinationsService.js` đổi `imagePath` từ `null` sang ảnh đã tải — card Khám phá VÀ ảnh đại diện trang chi tiết giờ dùng ảnh thật thay vì placeholder SVG theo loại hình; `imageRef.status` đổi từ `external-not-downloaded` sang `downloaded-demo-use`, đúng caveat bản quyền "cần xin phép trước khi dùng thương mại" đã áp dụng cho bộ ảnh 37 địa danh cũ.

### Toạ độ — chỉ tra được thêm 1 điểm, có giải thích rõ vì sao 5 điểm còn lại chưa tra được
Đã thử tra toạ độ cho tất cả địa chỉ chưa có toạ độ qua **OpenStreetMap Nominatim** (dịch vụ geocode công khai, không cần khoá API) — không suy đoán thủ công:
- **EXP-02 Dừng 2** ("Số 507 Nguyễn Đáng, khóm 10, phường Trà Vinh") đủ chi tiết (có tên đường + khóm) — Nominatim trả về đúng đoạn đường Nguyễn Đáng tại Khóm 10, Phường Trà Vinh (khớp chính xác địa chỉ). Đã lưu toạ độ (9.9237755, 106.3396274) với `coordinateStatus: "geocodedApprox"` và `coordinateNote` giải thích rõ: đây là điểm đại diện trên đoạn đường đó (OpenStreetMap chưa có dữ liệu số nhà cho đường này ở khu vực này), **chưa phải vị trí chính xác của số nhà 507**, cần xác minh thực địa trước khi dùng làm pin chính thức. Trang chi tiết EXP-02 hiển thị nút "🧭 Chỉ đường — Dừng 2 (gần đúng)" dùng toạ độ này, tách biệt với Dừng 1 (vẫn chỉ có nút mở Google Maps tìm kiếm).
- **5 địa chỉ còn lại** (EXP-01, EXP-02 Dừng 1, EXP-03, và cấp ấp/phường của SITE-04/05/06) chỉ ở mức ấp/phường, không có tên đường — đã thử tra qua Nominatim nhưng **không có kết quả** (OpenStreetMap chưa lập bản đồ các ấp này ở mức đủ chi tiết). Không tự suy đoán toạ độ khi không đủ dữ liệu — xem mục "Thông tin cần bổ sung để thêm pin" trong báo cáo gửi người dùng (và `DATA_ISSUES.md`) để biết chính xác cần gì cho từng điểm.
- Bản đồ Khám phá **không đổi** — vẫn chỉ tạo marker cho toạ độ ở cấp LISTING (`dest.lat`/`dest.lng`), cố tình KHÔNG vẽ marker cho toạ độ cấp-điểm-dừng (`stops[].coordinates`) của EXP-02 để tránh gây hiểu nhầm "cả trải nghiệm diễn ra ở đây" khi thực chất chỉ là 1 trong 2 điểm — toạ độ Dừng 2 chỉ dùng cho nút "Chỉ đường" ở trang chi tiết.

### Studio — khôi phục hồ sơ 7 host (không kèm số liệu tài chính bịa)
`js/data.js`: thêm lại `HOSTS` — đúng 7 host, mỗi host gắn 1 listing pilot (`destinationId`), dùng tên/vai trò/địa chỉ đã có sẵn trong `data/pilot-suppliers.json` (không bịa thông tin mới). **Cố tình KHÔNG** khôi phục `experiences`/`metrics.monthlyByHost` giả — các host này là tổ chức/cá nhân THẬT (Trần Tuấn Việt, Lâm Phên, ban quản trị các chùa...), chưa xác nhận đồng ý tham gia, nên gắn doanh thu/lịch sử 12 tháng bịa cho họ là không phù hợp dù chỉ là nội bộ. Studio Tổng quan/Báo cáo cho các host này hiển thị đúng "0"/rỗng, có dòng chú thích trung thực thay vì dòng "gồm 11 tháng số liệu minh hoạ" (không còn đúng vì không còn dữ liệu minh hoạ nào) — sửa ở `js/studio/overview.js` và `js/studio/reports.js` (ẩn khối biểu đồ khi không có dữ liệu tháng, tránh gọi Chart.js trên canvas không tồn tại).

### Sự cố phát hiện + đã sửa trong lúc làm
- Nhãn nút "Chỉ đường"/"Mở Google Maps" ban đầu viết dài (gộp cả "(đề xuất)" và "(chưa có toạ độ xác thực)") gây tràn ngang ở màn hẹp (~453px) và mobile 375px thật — đã rút gọn còn "Dừng N" (chi tiết đã có sẵn trong mô tả từng điểm dừng bên dưới, không cần lặp lại trong nhãn nút).

### Đã kiểm thử qua trình duyệt thật
- Cả 7 ảnh load đúng (`naturalWidth` > 0, không lỗi 404) trên card Khám phá và trang chi tiết.
- Tên hiển thị mới đúng trên card, trang chi tiết, mục "Trải nghiệm liên quan", và 2 khối gợi ý ghép cặp.
- EXP-02: nút riêng cho Dừng 1 (Google Maps tìm kiếm) và Dừng 2 (Chỉ đường, toạ độ gần đúng) hiển thị đúng, có ghi chú toạ độ gần đúng rõ ràng.
- `#/studio/overview` với cả 7 host: tên hiển thị đúng, số liệu 0/rỗng, không có "(demo)" gắn nhầm cho tên thật; `#/studio/reports` không crash khi không có dữ liệu tháng.
- Quét lại toàn bộ route (Trail/Studio/Admin/Ops) ở cả 3 độ rộng (≈453px, mobile 375px, desktop) sau khi sửa lỗi tràn nhãn nút — không còn route nào tràn ngang hay lỗi console.

## PHASE — Địa chỉ đợt 2 + giải mã Google Plus Code cho pin bản đồ — 2026-09-10

Người dùng cung cấp thêm địa chỉ chi tiết (đợt 2, qua chat) cho 6/7 listing để cập nhật pin bản đồ.

### Kết quả tra toạ độ (OpenStreetMap Nominatim, không đoán thủ công)
- **EXP-03**: người dùng cho **Google Plus Code** ("W8FH+W3H, QL53, phường Nguyệt Hóa") — cài tạm `open-location-code` (thư viện chính thức của Google, gỡ ngay sau khi dùng xong, giống cách làm với `xlsx`/`sharp` trước đó), giải mã bằng thuật toán `recoverNearest` (dùng tâm phường Nguyệt Hóa — geocode qua Nominatim — làm điểm tham chiếu để khôi phục full code từ short code), ra toạ độ (9.924813, 106.327734) với ô sai số chỉ ~3m — độ chính xác cao.
- **5 địa chỉ còn lại** (EXP-01, EXP-02 Dừng 2, SITE-04, SITE-05, SITE-06): đã thử geocode nhưng OpenStreetMap **không có đủ dữ liệu đáng tin cậy** — hoặc không có kết quả, hoặc chỉ khớp tên đường ở SAI phường/xã (vd cả 3 địa chỉ "Nguyễn Du, khóm 3, phường Nguyệt Hóa" đều chỉ khớp được với một đường Nguyễn Du DUY NHẤT mà OSM gắn thuộc xã Song Lộc, không phải Nguyệt Hóa — nghi do ranh giới hành chính sau sắp xếp 2025 chưa cập nhật trên OSM). **Không dùng các kết quả sai-phường này để đặt pin** — đúng nguyên tắc không suy đoán tọa độ.

### Xử lý mâu thuẫn EXP-01 và vấn đề riêng tư EXP-03
- **EXP-01**: địa chỉ mới ("98/27 Ấp Ba, xã Song Lộc") khác hẳn xã Nhị Trường/làng Ba So trong hồ sơ gốc (nơi gắn với câu chuyện Ok Om Bok) — đã cập nhật theo yêu cầu người dùng nhưng gắn `addressConflictNote` cảnh báo rõ ràng thay vì âm thầm ghi đè, cần người dùng xác nhận lại.
- **EXP-03**: toạ độ giải mã được trỏ tới **nhà riêng nghệ nhân Lâm Phên** — đúng nguyên tắc đã thống nhất từ đầu phase pilot ("không công khai pin nhà riêng khi chưa có sự đồng thuận"), toạ độ này **KHÔNG** đưa vào `data/pilot-listings.json` (dữ liệu công khai cho Trail) mà chỉ lưu ở `data/pilot-suppliers.json` (`sup-lam-phen.preciseLocationInternal`, cờ `doNotPublish: true`) — chỉ xem được ở `#/ops/pilot` (nội bộ), có cảnh báo 🔒 rõ ràng. Đã hỏi lại người dùng trong phản hồi có muốn công khai hay không trước khi thay đổi quyết định này.

### File đã sửa
- `data/pilot-listings.json` — cập nhật `currentAddress` cho EXP-01/EXP-02 (Dừng 2)/SITE-04/SITE-05/SITE-06 theo địa chỉ mới; thêm `addressConflictNote` (EXP-01), `coordinateNote` (SITE-04/05/06, EXP-02 Dừng 2) giải thích vì sao chưa geocode được; xoá toạ độ gần đúng cũ của EXP-02 Dừng 2 (địa chỉ đã đổi, toạ độ cũ không còn khớp).
- `data/pilot-suppliers.json` — thêm `preciseLocationInternal` cho `sup-lam-phen` (toạ độ EXP-03, chỉ nội bộ).
- `js/services/destinationsService.js` — truyền thêm `addressConflictNote`/`coordinateNote` cấp listing ra ngoài để trang nội bộ dùng được.
- `js/ops/pilot.js` — thêm khối "Địa chỉ & toạ độ" (hiện `addressConflictNote`/`coordinateNote`/ghi chú theo từng điểm dừng) và khối 🔒 cảnh báo toạ độ nội bộ không công khai trong thẻ supplier.

### Đã kiểm thử qua trình duyệt thật
- Trang chi tiết EXP-02: đúng nút "🔍 Google Maps — Dừng 1"/"Dừng 2" (không còn nút "Chỉ đường" chính xác vì toạ độ cũ đã bị xoá), hiện đúng ghi chú giải thích vì sao chưa đủ tin cậy.
- `#/ops/pilot` → mở EXP-03: hiện đúng khối 🔒 toạ độ nội bộ, không xuất hiện ở bất kỳ trang Trail công khai nào (đã kiểm tra `grep` trong `js/trail/` chỉ còn ghi chú cấp điểm-dừng công khai, không có toạ độ/ghi chú riêng tư nào lọt ra).

## PHASE — Cập nhật đầy đủ 7 pin trên bản đồ pilot — 2026-09-11

Người dùng gửi bảng toạ độ đầy đủ (`PILOT_MAP_LOCATIONS`, đã xác nhận qua Google Maps/Plus Code) cho cả 7 listing pilot, kèm yêu cầu chi tiết về chuẩn hoá schema toạ độ, icon/markerRole riêng cho điểm gặp và điểm neo cụm, fitBounds, và đồng bộ card↔marker hai chiều trên bản đồ Khám phá.

### Dữ liệu — cả 7/7 listing giờ có `coordinates` + `plusCode` + `coordinateStatus` + `markerRole` + `publicPin`
- `data/pilot-listings.json`: điền toạ độ thật (giữ nguyên 6 số thập phân) cho EXP-01, EXP-02 (cấp listing = điểm gặp/meetingPoint tại Dừng 2, VÀ cập nhật riêng `stops[1].coordinates`), EXP-03, SITE-04 (markerRole `clusterAnchor`), SITE-05, SITE-06, SITE-07. Không còn listing nào giữ `coordinates: {lat:null,lng:null}` ở cấp công khai (trừ `stops[0]` của EXP-02 — xem mục riêng tư bên dưới). Trường `coordinateStatus` dùng đúng các giá trị người dùng cung cấp (`verifiedGoogleMapsListing`/`addressMatched`/`plusCodeConverted`), không đổi tên field `coordinates.lat/lng` sang `latitude/longitude` vì toàn bộ code hiện có (explore.js, placeDetail.js, itineraryDetail.js...) đã dùng quy ước `lat`/`lng` nhất quán — đổi tên chỉ ở JSON nguồn không mang lại lợi ích, chỉ tăng rủi ro; coi đây là đã "chuẩn hoá" đúng tinh thần yêu cầu (luôn là object 2 số, không còn khi thì null khi thì thiếu trường).
- SITE-07: toạ độ pin chùa (9.9171875, 106.2955625) tách biệt khỏi toạ độ tham chiếu khu khảo cổ Bờ Lũy (9.917500, 106.295833, nguồn vietnam.vn) — toạ độ khảo cổ chuyển sang trường mới `archaeologicalReferenceCoordinates`, không còn dùng làm pin chùa.
- EXP-02 Dừng 1 (xưởng NNƯT Lâm Phên) **vẫn giữ `coordinates: null`** — bảng toạ độ người dùng gửi không có dòng riêng cho điểm dừng này (chỉ có 1 dòng "EXP-02" = điểm gặp Dừng 2), nên không tự suy diễn/sao chép toạ độ từ EXP-03 (dù thực tế cùng một địa điểm) để giữ đúng nguyên tắc chỉ công khai đúng những gì được xác nhận rõ.

### Quyết định riêng tư quan trọng — EXP-03 (xưởng NNƯT Lâm Phên) chuyển từ "nội bộ" sang "công khai"
Toạ độ EXP-03 (9.9248125, 106.3276875) trùng vị trí với toạ độ đã giải mã Plus Code trước đó (9.924813, 106.327734) — chính là **nhà riêng/xưởng của nghệ nhân**, từng được chủ động giữ `doNotPublish: true` ở phase trước theo nguyên tắc "không công khai pin nhà riêng khi chưa có sự đồng thuận". Bảng toạ độ lần này của người dùng liệt kê rõ EXP-03 với toạ độ đầy đủ + `publicPin: true`, cùng dòng nhắc "không công khai thêm địa chỉ nhà riêng... ngoài dữ liệu được cung cấp" — hiểu đây là xác nhận có chủ đích cho đúng dữ liệu trong bảng. Đã cập nhật `coordinates`/`publicPin` công khai cho EXP-03 và đổi `doNotPublish` → `false` ở `data/pilot-suppliers.json` (mục `sup-lam-phen.preciseLocationInternal`), **có ghi chú audit trail đầy đủ ngày giờ hai quyết định** (giữ riêng tư 10/09 → công khai 11/09) tại cả hai file, kèm hướng dẫn cách hoàn tác nếu đây không đúng chủ đích người dùng. **Đề nghị người dùng xác nhận lại rõ ràng** trong phản hồi — đây là dữ liệu của một cá nhân thật, việc đảo ngược sau khi đã push lên GitHub công khai sẽ khó gỡ hoàn toàn (có thể còn trong lịch sử git).

### Bản đồ Khám phá (`js/trail/explore.js`, `js/services/mapService.js`)
- Marker giờ lọc theo `dest.publicPin === true` (không chỉ theo có toạ độ hay không) — đúng 7 marker hiển thị, khớp `PILOT_MAP_LOCATIONS`.
- Thêm `MapService.destinationDivIcon()`: icon riêng cho `markerRole === 'meetingPoint'` (🤝, viền nổi bật) và `clusterAnchor` (🗺️, viền nổi bật) — các markerRole còn lại (`experienceLocation`/`siteLocation`) dùng icon màu theo category như cũ.
- Thêm `MapService.loadMarkerCluster()` — tải Leaflet.markercluster qua CDN (cùng cơ chế fallback-khi-lỗi-mạng như Leaflet chính), dùng `L.markerClusterGroup()` thay `L.layerGroup()` để tự gom/spiderfy SITE-04/05/06 (cụm Nguyệt Hóa, cách nhau 160–280m) khi trùng ở mức zoom thấp; rơi về `layerGroup` thường nếu plugin tải lỗi.
- `fitBounds` dùng đúng tập `publicPin === true`, `padding:[50,50]`, `maxZoom:15`; thêm `paddingBottomRight` lớn hơn trên mobile (`<768px`) để bottom-sheet danh sách không che marker.
- Popup: thêm dòng loại hình + nhãn markerRole ("Điểm gặp"/"Điểm neo của cụm"), địa chỉ, và nút "🧭 Chỉ đường" tạo động từ `lat/lng` (bên cạnh nút "Xem chi tiết" cũ) — không dùng địa chỉ text làm destination khi đã có toạ độ.
- Đồng bộ card ↔ marker hai chiều: tách card thành `place-card__main` (chọn card → pan/zoom tới marker, mở popup, highlight — không rời trang Khám phá) + nút mũi tên riêng `place-card__detail-btn` (điều hướng sang trang chi tiết, giữ đúng hành vi cũ). Click marker → highlight card tương ứng + tự mở bottom-sheet danh sách + cuộn card vào khung nhìn. Bộ lọc (`filterState`) không bị reset ở cả hai chiều.
- `destinationsService.js` truyền thêm `plusCode`/`markerRole`/`publicPin`/`archaeologicalReferenceCoordinates` ra đối tượng listing dùng chung cho UI.

### Không cần migration localStorage
`destinations` nằm trong `CONTENT_KEYS` của `storage.js` — luôn được nạp lại mới từ `data/pilot-listings.json` mỗi lần tải trang, **không** lưu vào `localStorage`. Vì vậy toạ độ mới có hiệu lực ngay cho mọi người dùng (kể cả người đã mở site từ trước) mà không cần tăng `SCHEMA_VERSION` hay viết migration — dữ liệu người dùng thật sự cần giữ lại (yêu thích, hành trình, booking...) nằm ở các key khác, không bị ảnh hưởng.

### Đã kiểm thử qua trình duyệt thật
- `node -e "JSON.parse(...)"` xác nhận `data/pilot-listings.json` và `data/pilot-suppliers.json` vẫn là JSON hợp lệ sau khi sửa.
- `#/trail/explore`: đúng 7 marker trên bản đồ (đếm qua DOM: 3 marker đơn + 2 cụm gồm 2 marker mỗi cụm = 7; ở màn hẹp/mobile 375px cả 7 gom vào 1 cụm ghi rõ "7") — không listing nào còn badge "📍 Chưa có toạ độ" trên card.
- Click card "Trải nghiệm tự tay giã cốm dẹp" (EXP-01, ban đầu nằm trong 1 cụm marker): bản đồ tự zoom/spiderfy, mở đúng popup EXP-01 (địa chỉ, giá, giờ, nút "Xem chi tiết" + "🧭 Chỉ đường"), card được highlight (`data-selected="true"`) — xác nhận đồng bộ card→marker hoạt động kể cả khi marker đang bị gom cụm.
- Trang chi tiết EXP-03: nút "🧭 Chỉ đường" trỏ đúng `https://www.google.com/maps/dir/?api=1&destination=9.9248125,106.3276875` (toạ độ thật, không còn dùng link tìm kiếm theo địa chỉ).
- `#/ops/pilot`: hiển thị đúng 7 listing, không lỗi console, không có ảnh hưởng từ việc đổi `doNotPublish` ở `sup-lam-phen`.
- Quét tự động 6 route (`#/trail/explore`, 4 trang chi tiết, `#/ops/pilot`): `scrollWidth - clientWidth = 0` ở mọi route trên desktop.
- Mobile 375px (`#/trail/explore`): không tràn ngang, không lỗi console, cụm marker gộp đúng "7" khi zoom bao trọn tất cả pin.
- `read_console_messages` không ghi nhận lỗi nào xuyên suốt các bước kiểm thử trên.

### File đã sửa
`data/pilot-listings.json`, `data/pilot-suppliers.json`, `js/services/destinationsService.js`, `js/services/mapService.js`, `js/trail/explore.js`, `css/trail.css`, `css/components.css`, `PROGRESS.md`, `DATA_ISSUES.md`.

## PHASE — Hoàn thiện hành trình, booking, thông báo và liên kết dữ liệu — 2026-09-11

Triển khai 4 thay đổi lớn: (1) phân loại listing theo khả năng tạo doanh thu + quy tắc tour phải có hoạt động cộng đồng, (2) "Thêm vào hành trình" hoạt động như giỏ hàng, (3) xác nhận booking + trung tâm thông báo/nhắc lịch, (4) hợp nhất dữ liệu review/booking dùng chung Trail–Studio–Ops kèm đồng bộ cùng-tab/khác-tab. Không đổi dữ liệu 7 listing (tên/địa chỉ/toạ độ) hay bản đồ — chỉ thêm trường mới.

### 1) Phân loại doanh thu listing
`data/pilot-listings.json`: mỗi listing có thêm khối `revenue: { type, providerType, isCommunityActivity, bookable, priceValue, durationMinutes, durationEstimated }`. Phân loại theo đúng dữ liệu thật hiện có — **không có listing nào `bookable:true`/có `priceValue`** vì chưa supplier nào xác nhận giá/nhận khách (giữ đúng nguyên tắc trung thực đã theo suốt dự án):
- EXP-01/02/03 (giã cốm dẹp, nhạc-múa Khmer, làm mặt nạ): `paid_activity`, `isCommunityActivity:true`, providerType `community_household`/`artisan`.
- SITE-04/05/06/07 (cụm Nguyệt Hóa, Chùa Âng, Bảo tàng, Chùa Lò Gạch): `free_visit`, `isCommunityActivity:false`.
- `durationMinutes` là ước lượng demo (90/120/75/30/45/60/45 phút), luôn kèm `durationEstimated:true` — dùng làm `suggestedDurationMin` mặc định cho thuật toán xếp lịch (trước đây luôn `null`), UI hiển thị đúng trạng thái "ước lượng", không phải đo thực địa.
- `js/services/destinationsService.js` truyền các trường này ra `revenueType/providerType/isCommunityActivity/bookable/revenuePriceValue` trên object destination dùng chung toàn app.

**Vì sao "tour bookable" gần như luôn rơi vào nhánh "chưa có hoạt động cộng đồng phù hợp" với dữ liệu hiện tại**: cả 7 listing pilot đều chưa có supplier xác nhận giá/nhận khách → không có `bookable:true` + `price>0` nào trong dữ liệu nguồn. Một tour chỉ thực sự "có hoạt động cộng đồng trả phí" khi một **host tự tạo trải nghiệm thật qua Studio** (`#/studio/experiences/new`, có giá + khung giờ) — đây là cơ chế sẵn có từ trước, không phải thứ tạo mới ở phase này. Đã kiểm thử trực tiếp: tạo 1 trải nghiệm thật (150.000đ, 90 phút, còn chỗ) cho host Trần Tuấn Việt → thuật toán xếp lịch nhận diện đúng, gắn `bookable:true`, tour chuyển đúng sang "có hoạt động cộng đồng" (xem mục kiểm thử).

### 2) Quy tắc tạo tour có hoạt động sinh lời
`js/services/aiService.js`:
- Mỗi `stop` giờ có `revenueType/isCommunityActivity/providerType/bookable/price` — `bookable`/`price` CHỈ đúng khi khớp được 1 experience+slot thật còn chỗ (không suy đoán).
- Option xếp lịch (`buildOption`) và itinerary (`recalcTimeline`) có thêm `isBookableTour = stops.some(s => s.bookable && s.revenueType==='paid_activity' && s.price>0)`.
- Tour ngắn (`availableHours <= 2`): ứng viên có `isCommunityActivity` được ưu tiên xếp trước khi chọn — tránh kết quả toàn chùa/điểm miễn phí cho tour ngắn.
- `js/trail/itinerary.js`: khi wizard trả về không có option nào `isBookableTour`, hiện rõ thông báo "Hiện chưa có hoạt động cộng đồng phù hợp với thời gian và lịch bạn chọn" phía trên các lựa chọn (vẫn hiện các lựa chọn miễn phí, không giấu) — mỗi option card có badge "🏘️ Có hoạt động cộng đồng" hoặc "📍 Lịch tham quan tự do".
- **Chưa triển khai** phần "chèn cưỡng bức 1 hoạt động cộng đồng vào option đang tính" nếu ban đầu không lọt — với dữ liệu thật hiện tại (0 hoạt động bookable) bước này không có gì để chèn nên chưa có giá trị kiểm thử được; đã ưu tiên đúng thứ tự ứng viên (mục trên) thay vì thuật toán chèn ép phức tạp hơn.

### 3) "Thêm vào hành trình" = giỏ hàng (tripCart)
- `js/storage.js`: `tripCart: [{destinationId, addedAt, selected, partySize}]` — hàm `addToTripCart/removeFromTripCart/toggleTripCartItem/setTripCartItemSelected/setTripCartAllSelected/removeTripCartSelected/setTripCartPartySize`. Thay thế hoàn toàn `ui.draftItinerary`/`addDraftItineraryItem` cũ (đã gỡ).
- Nút "+ Thêm vào hành trình" có ở card Khám phá (`js/trail/explore.js`, icon tròn +/✓ cạnh nút "Xem chi tiết") và trang chi tiết (`js/trail/placeDetail.js`) — bấm: thêm vào giỏ, hiện toast "Đã thêm [tên] vào hành trình của bạn.", đổi nút thành "✓ Đã thêm"; bấm lại: hỏi mở giỏ hay gỡ khỏi giỏ. Không tạo bản trùng (dedup theo destinationId, đã kiểm thử bấm 2 lần).
- Badge số lượng trên tab "Hành trình" (bottom-nav + top-tabs, `js/trail/shell.js`) — cập nhật ngay khi thêm/gỡ (qua re-render).
- Trang "Hành trình của tôi" (`#/trail/itinerary`, phần đầu `renderItineraryHome`): liệt kê toàn bộ giỏ, mỗi dòng có checkbox (mặc định tick khi mới thêm), số người, trạng thái miễn phí/có phí, nút Xem/Xoá. Nút "Chọn tất cả"/"Bỏ chọn tất cả"/"Xoá mục đã chọn"/"Tạo lộ trình từ các điểm đã chọn" (chỉ bật khi có ít nhất 1 mục tick). Bỏ tick KHÔNG xoá khỏi giỏ (đã kiểm thử).

### 4) Kiểm tra hoạt động sinh lời trong giỏ + xếp lộ trình từ lựa chọn
- `aiService.buildItineraryFromSelection(state, {selectedIds, date, startHour, startMin, partySize})`: xếp CHÍNH XÁC các listing đã tick (không lọc bớt như thuật toán gợi ý), thứ tự theo nearest-neighbor từ điểm xuất phát (hoặc giữ thứ tự gốc nếu thiếu toạ độ), gắn cảnh báo lệch giờ mở cửa thay vì tự loại bỏ điểm. Trả về `isBookableTour`.
- `aiService.suggestCommunityAdditions(state, {excludeIds, anchorPoint, interests, partySize, date, limit})`: gợi ý tối đa 3 hoạt động cộng đồng CHƯA có trong lựa chọn, ưu tiên khoảng cách → sở thích → còn slot thật → hộ dân/nghệ nhân.
- Luồng "Tạo lộ trình từ các điểm đã chọn" (modal trong `js/trail/itinerary.js`): hỏi ngày/giờ/số người → xếp lịch → nếu chưa có hoạt động cộng đồng hợp lệ, hiện panel gợi ý (tối đa 3, mỗi cái có nút "+ Thêm vào hành trình" tự xếp lại) + nút "Tạo lịch tham quan tự do" (không thêm gì, lưu itinerary với `isFreeVisitPlan:true`) — không tự ý thêm gì khi khách chưa bấm.
- Itinerary tạo ra là object **cùng shape** với itinerary từ wizard cũ → tái dùng toàn bộ trang chi tiết/bản đồ/timeline có sẵn (`js/trail/itineraryDetail.js`), không cần trang kết quả riêng.
- Đã kiểm thử trực tiếp qua trình duyệt: thêm 3 listing miễn phí vào giỏ (không có hoạt động cộng đồng nào có giá thật) → đúng hiện panel gợi ý (2 trải nghiệm còn lại, đánh dấu "Chưa bookable") + tạo được "Lịch tham quan tự do" thành công, không qua bước đặt/thanh toán (không có nút "Đặt các hoạt động trả phí" vì không stop nào có `experienceId`).

### 5) Xác nhận booking
`js/trail/booking.js`: màn kết quả sau khi thanh toán (`pendingResultHtml`) viết lại đầy đủ — mã booking, tên hành trình, ngày, giờ bắt đầu, số người, danh sách hoạt động kèm đúng trạng thái từng mục (không nói "đã xác nhận toàn bộ" khi vẫn còn mục `pending`), tổng tiền, số tiền đã thanh toán (demo), nút "Xem hành trình"/"Quay lại khám phá". Trạng thái item dùng enum đã có sẵn trong `bookingService.js` (`pending/accepted/rejected/cancelled/completed` cho item; `pending_host/partially_confirmed/confirmed/rejected/completed/cancelled/expired` cho booking) — **không đổi tên** `pending_host` thành `pending_host_confirmation` như tên gợi ý trong spec để tránh rủi ro sửa rải rác nhiều nơi (Studio/Ops đang dùng đúng enum cũ); ngữ nghĩa giống hệt nhau.

`js/trail/itineraryDetail.js`: thêm badge "Booking: …" cạnh trạng thái hành trình, tính từ TRẠNG THÁI TỪNG bookingItem gắn với các điểm dừng (không lưu riêng, luôn tính lại) — null/không hiện khi tour chưa có booking nào (draft).

### 6) Trung tâm thông báo + nhắc lịch
- `js/storage.js`: `notifications: []` (đã bỏ trường `ui.notifications` cũ chưa từng dùng), hàm `addNotification/getNotifications/getUnreadNotificationCount/markNotificationRead/markAllNotificationsRead`. `reminders: []` + `scheduleBookingReminders(booking, itineraryId, startAt)` (tạo mốc 24h và 2h trước giờ khởi hành thật — bỏ qua mốc nào đã qua ngay lúc tạo, không gửi trễ) + `checkDueReminders()` (idempotent qua `sentAt`, gọi khi app mở/focus — wired ở `js/app.js`).
- `bookingService.createBooking()` tự tạo notification "booking_created" + lên lịch 2 reminder ngay sau khi tạo booking (đặt ở lớp dữ liệu, không gọi rải rác từ UI — đúng yêu cầu). `respondToBooking()` tạo notification đúng theo trạng thái thật (`confirmed`/`partially_confirmed`/`rejected`), không bịa "đã xác nhận toàn bộ".
- Trang mới `#/trail/notifications` (`js/trail/notifications.js`): danh sách thông báo, "Đánh dấu tất cả đã đọc", bấm 1 thông báo → đánh dấu đã đọc + mở đúng hành trình liên quan. Nút bật "Thông báo trình duyệt (tuỳ chọn)" — CHỈ xin quyền khi khách chủ động bấm (không tự xin lúc mở trang), có cảnh báo rõ "chỉ hoạt động khi tab đang mở, không gửi được khi đã đóng trình duyệt".
- Icon 🔔 + badge số chưa đọc ở topbar Trail (`js/trail/shell.js`), badge số lượng giỏ hành trình ở tab "Hành trình".
- Dùng múi giờ `Asia/Ho_Chi_Minh` khi hiển thị giờ nhắc lịch.

### 7) Hợp nhất dữ liệu review + đồng bộ
- **Trước đây có 3 tập tách biệt**: `reviews` (seed, luôn rỗng, bị nạp đè mỗi lần tải trang vì là CONTENT_KEY), `userReviews` (review gắn booking, persist), `placeImpressions` (cảm nhận tự đánh dấu, persist, KHÔNG đổi). Từ phase này: **`reviews` là tập DUY NHẤT, đã persist** (gỡ khỏi CONTENT_KEYS — trước đây là một lỗi tiềm ẩn: review thật của khách có thể bị mất khi tải lại trang vì luôn bị ghi đè bằng mảng rỗng từ seed) theo đúng shape spec yêu cầu: `{id, bookingId, bookingItemId, listingId, hostId, travellerId, overallRating, categoryRatings:{experience,hospitality,accuracy}, comment, createdAt, status}`. `placeImpressions` giữ nguyên, vẫn tách biệt (đúng như thiết kế trước đó).
- `storage.addReview()` (thay `addUserReview`): chặn nếu bookingItem chưa `completed`, dedup theo `bookingItemId`, tự tra `hostId` theo `destinationId` (null nếu listing không gắn host nào — case "không có host cụ thể" mà spec nêu, hiện chưa xảy ra thật vì cả 7 listing đều có đúng 1 host).
- `js/services/reviewsService.js` (mới): `computeRatingStats(reviews)` luôn lọc `status==='published'` rồi tính TỪ ĐẦU (không cộng dồn vào average cũ, đúng công thức spec đưa) + `getRatingStatsForListing`/`getRatingStatsForListingIds`/`formatRatingStats`. Dùng chung ở: trang chi tiết Trail (hiện "⭐ X.X · N đánh giá" + danh sách review), Studio Tổng quan (điểm sao tổng + khối "Đánh giá gần đây" mới: rating/bình luận/ngày/mã booking liên quan), CPS (`cpsService.js`), Admin báo cáo ẩn danh theo nhóm danh mục (`admin/reports.js`).
- **Kiểm thử nghiệm thu đúng ví dụ trong spec**: tạo booking thật (150.000đ) → hộ xác nhận → hộ xác nhận hoàn thành → khách gửi 1 review 5 sao → Trail hiện "⭐ 5.0 · 1 đánh giá", Studio Tổng quan hiện cùng số + khối "Đánh giá gần đây" đúng nội dung/ngày/mã booking — khớp công thức `average = tổng overallRating / reviewCount`, không cộng dồn.
- **Đồng bộ cùng-tab**: `storage.notifyDataChanged(entity, action)` bắn `CustomEvent('khmerlink:data-changed')` sau các thay đổi liên quan (tripCart, reviews, bookings/bookingItems, notifications, itinerary) — đặt Ở LỚP DỮ LIỆU (`storage.js`/`bookingService.js`), không gọi rải rác từ component. `js/app.js` lắng nghe sự kiện này (debounce 80ms) và re-render route hiện tại từ state mới — **không** `location.reload()`, không cuộn lại đầu trang.
- **Đồng bộ khác-tab**: lắng nghe sự kiện `storage` chuẩn của trình duyệt. Phát hiện lỗi khi kiểm thử thật với 2 tab: ghi localStorage ở tab khác **không** tự cập nhật biến `state` trong bộ nhớ của tab đang mở (mỗi tab có bản sao module JS riêng) — đã sửa bằng `storage.syncFromLocalStorage()` (đọc lại localStorage, merge vào state hiện có, bỏ qua CONTENT_KEYS) gọi TRƯỚC khi re-render. Đã kiểm thử lại với 2 tab thật: tab A thêm địa điểm vào giỏ → tab B tự cập nhật số lượng giỏ mà không cần tải lại trang.
- README/dữ liệu không mô tả localStorage là đồng bộ nhiều thiết bị — đây vẫn là giới hạn đã biết từ đầu dự án (mỗi trình duyệt là một "tài khoản" riêng), phase này chỉ đồng bộ nhiều TAB cùng trình duyệt, không phải nhiều thiết bị/người dùng.

### 8) Migration schema v2 → v3
`js/storage.js`: `SCHEMA_VERSION = 3`. `migrateV2ToV3()`: tạo `tripCart` từ `ui.draftItinerary` cũ (giữ nguyên lựa chọn trước đó, mặc định tick), tạo `notifications`/`reminders` rỗng, chuyển `userReviews` cũ sang `reviews` shape mới (giữ nguyên nội dung, không tạo trùng, không cộng lại điểm thưởng — điểm thưởng/passport/booking/favorites/vouchers giữ nguyên không đụng tới). Đã kiểm thử thật: trình duyệt có dữ liệu schema v2 từ phase trước (1 mục trong `ui.draftItinerary` cũ) → tải lại → tự động lên `schemaVersion:3`, mục cũ xuất hiện đúng trong giỏ hành trình mới, không mất dữ liệu, không cần khách tự xoá cache.

### Đã kiểm thử qua trình duyệt thật (đầy đủ, không chỉ đọc code)
1. Quét 20 route (Trail/Studio/Admin/Ops) — không lỗi console, không tràn ngang desktop lẫn mobile 375px.
2. Migration v2→v3 tự động đúng khi mở lại trình duyệt có dữ liệu cũ.
3. Card Khám phá + trang chi tiết: nút "+ Thêm vào hành trình" thêm/gỡ đúng, không tạo trùng, đổi nhãn "✓ Đã thêm", cập nhật badge.
4. Trang giỏ hành trình: tick/bỏ tick, "Tạo lộ trình từ các điểm đã chọn" đúng chỉ dùng mục đã tick; bỏ tick không xoá khỏi giỏ.
5. Tạo lộ trình từ 3 listing miễn phí (không có hoạt động cộng đồng nào bookable thật) → đúng hiện panel gợi ý + tạo được "Lịch tham quan tự do", không qua bước đặt chỗ.
6. Tạo 1 trải nghiệm thật có giá (150.000đ) qua Studio cho host Trần Tuấn Việt → tạo lại lộ trình từ giỏ (có EXP-01) → thuật toán nhận diện đúng `bookable:true`, tour thành "Hành trình từ giỏ hành trình" (có hoạt động cộng đồng), hiện nút "Đặt các hoạt động trả phí".
7. Luồng đặt chỗ đầy đủ: giữ chỗ → đặt cọc 30% → màn xác nhận đúng mã/tên hành trình/ngày/giờ/số người/trạng thái từng hoạt động ("Chờ hộ xác nhận", không nói đã xác nhận toàn bộ)/tổng tiền/đã thanh toán.
8. Notification "Hành trình đã được ghi nhận" tạo đúng ngay khi đặt; reminder 2h tạo đúng (mốc 24h bị bỏ qua đúng vì đã qua giờ lúc tạo — không gửi trễ).
9. Studio: hộ chấp nhận booking → notification "Booking đã được xác nhận" xuất hiện cho khách; xác nhận hoàn thành → chuyển đúng trạng thái.
10. Viết review 5 sao từ Hộ chiếu → Trail hiện "⭐ 5.0 · 1 đánh giá" trên trang chi tiết; Studio Tổng quan hiện đúng cùng số liệu + khối "Đánh giá gần đây" (rating/bình luận/ngày/mã booking) — không cần tải lại trang thủ công (đồng bộ qua `khmerlink:data-changed`).
11. Trung tâm thông báo: liệt kê đúng 2 thông báo, "Đánh dấu tất cả đã đọc" hoạt động, badge 🔔 cập nhật.
12. Badge "Booking: Đã hoàn thành" trên trang chi tiết hành trình tính đúng từ trạng thái bookingItem thật.
13. Đồng bộ 2 tab thật: thêm địa điểm vào giỏ ở tab A → tab B tự cập nhật số lượng mà không tải lại trang (sau khi sửa lỗi `syncFromLocalStorage`).
14. Reload trang nhiều lần: không tạo thêm booking/notification/reminder/review nào (đếm lại đúng số cũ).
15. `node -e "JSON.parse(...)"` xác nhận 2 file data vẫn hợp lệ sau khi sửa.

### Giới hạn đã biết (không giấu)
- Chưa triển khai bước "tự động chèn 1 hoạt động cộng đồng vào option đang xếp nếu ban đầu bị bỏ sót" — với dữ liệu thật hiện tại (0 hoạt động có giá được supplier xác nhận) nhánh này không có gì để chèn nên chưa kiểm thử được ý nghĩa; đã bù bằng việc ưu tiên đúng thứ tự ứng viên cho tour ngắn.
- Trải nghiệm "Trải nghiệm giã cốm dẹp cùng cô Sáu (thử nghiệm)" tạo ra trong lúc kiểm thử chỉ tồn tại trong localStorage của trình duyệt kiểm thử (qua Studio, cơ chế có sẵn) — KHÔNG có trong bất kỳ file dữ liệu nào của repo, không ảnh hưởng người dùng thật.
- Chưa có UI huỷ/ẩn riêng cho 1 review (chỉ có cơ chế tính average đúng nếu status đổi khỏi `published` — hàm đã hỗ trợ, nhưng chưa có nút thao tác nào gọi tới).
- Đồng bộ multi-tab dùng `storage` event (chỉ hoạt động cùng trình duyệt, cùng máy) — vẫn đúng như từ đầu dự án, KHÔNG phải đồng bộ nhiều thiết bị/người dùng thật (cần backend thật cho việc đó).

### File đã sửa/tạo
Mới: `js/services/reviewsService.js`, `js/trail/notifications.js`.
Sửa: `data/pilot-listings.json`, `js/data.js`, `js/storage.js`, `js/app.js`, `js/services/destinationsService.js`, `js/services/aiService.js`, `js/services/bookingService.js`, `js/services/cpsService.js`, `js/trail/itinerary.js`, `js/trail/itineraryDetail.js`, `js/trail/itinerarySummary.js`, `js/trail/explore.js`, `js/trail/placeDetail.js`, `js/trail/passport.js`, `js/trail/profile.js`, `js/trail/shell.js`, `js/trail/booking.js`, `js/studio/overview.js`, `js/admin/reports.js`, `css/components.css`, `css/layout.css`.

## PHASE — Bổ sung dữ liệu mô phỏng liên kết cho Customer, Host và Management — 2026-09-11

**Quyết định đã xác nhận với người dùng trước khi làm** (xem hộp thoại xác nhận trong hội thoại): dữ liệu mô phỏng (đánh giá/doanh thu/lượt ghé) gắn TRỰC TIẾP vào 7 listing/host THẬT (Chùa Âng, Bảo tàng, hộ Trần Tuấn Việt, nghệ nhân Lâm Phên...), không dùng danh tính hư cấu song song, không gắn nhãn "demo" trên từng card — đúng như yêu cầu, sau khi đã cảnh báo rõ đây là sự đổi hướng so với nguyên tắc "không bịa số liệu cho tổ chức thật" đã theo suốt các phase trước. Toàn bộ giả định ghi chi tiết ở [DEMO_DATA.md](DEMO_DATA.md).

### 1) Nguồn dữ liệu trung tâm
`data/pilot-seed-data.js` (mới) — DUY NHẤT một nguồn cho: `listingOperations` (giờ/giá/thời lượng/sức chứa 7 listing), `initialReviewStats` (baseline ratingSum/reviewCount lịch sử), `seedReviews` (68 review chi tiết viết tay, 8-10/listing, không lặp câu), `reviewTagsByCategory`/`listingTagGroup`, `monthlyParticipants`/`monthlyVisits` (12 tháng 09/2025–08/2026), `historicalMetrics` (tính bằng công thức `gross = participants×price`, `platformFee = gross×10%`, `providerIncome = gross − fee − refunds` — không hard-code từng số), `visitMetrics`. Cố định, không `Math.random()`, không đổi giữa các lần render. Đánh dấu `dataStatus:'demo_assumption'`/`source:'seed_demo'`, phân biệt với `source:'live_demo'` (dữ liệu thật phát sinh trong phiên demo).

### 2) Giờ mở cửa/giá cho 7 listing
`js/services/operationsService.js` (mới): `computeOpenStatus()` tính "Đang mở/Sắp đóng cửa/Đóng cửa/Cần đặt trước" REAL-TIME theo giờ Việt Nam (`Intl` với `timeZone:'Asia/Ho_Chi_Minh'`, không phụ thuộc múi giờ máy chạy); `formatPricePerPerson()` (0→Miễn phí, số→"180.000đ/người", null→Đang cập nhật); `getNearestSlotAvailability()` (chỉ hiện "Còn N chỗ lúc HH:MM" khi có slot thật từ Studio); `formatWeeklyHoursRows()` (bảng giờ cả tuần, thu gọn trong accordion). Trang chi tiết có chú thích "Thông tin vận hành trong giai đoạn pilot, vui lòng kiểm tra khi đặt lịch."

### 3) Review và điểm đánh giá
`js/services/reviewsService.js` viết lại: `computeRatingStats(baseline, liveReviews)` = baseline (từ `initialReviewStats`) + review live thật (`state.reviews`, không cộng thêm `seedReviews` vì đã tính gộp trong baseline) — LUÔN tính lại từ đầu, không cộng dồn vào average cũ. Thêm `getRatingDistribution`, `getTagShareForListings`, `getRecommendRate`, `getDisplayReviewsForListingIds` dùng chung Trail/Studio/Ops.

### 4) Form đánh giá Customer
`js/trail/passport.js`'s `openReviewModal` viết lại theo đúng thiết kế: tiêu đề "Cảm nhận chuyến ghé thăm", 1 sao tổng quát kèm nhãn diễn giải (1=Rất thất vọng…5=Hoàn hảo), câu hỏi "Bạn thích điều gì ở đây?" (chip đa chọn, bộ tag theo `listingTagGroup`), ô chia sẻ thêm, câu hỏi Có/Không "giới thiệu cho người khác". `storage.addReview()` lưu thêm `selectedTags`/`wouldRecommend`/`travellerName`. Chỉ booking item `completed` mới đánh giá được; dedup 1 review/bookingItem (giữ nguyên từ phase trước). Thêm nút "⭐ Viết đánh giá" trực tiếp trên trang chi tiết (`placeDetail.js`) khi có booking item đủ điều kiện chưa đánh giá.

### 5) Dữ liệu hoạt động hàng tháng của Host + lượt ghé
`js/services/metricsService.js` (mới): `getHostMonths()` (12 tháng seed + 1 tháng live từ booking thật, tháng live luôn SAU 08/2026 nên không đếm trùng với seed), `getHostKpis()` (kèm % thay đổi so với tháng trước), `getListingVisitMonths()`, `getTopTagShares()`, `generateHostRecommendations()` (gợi ý có căn cứ số liệu cụ thể: tag mạnh/yếu, review ≤3 sao, từ khoá "nóng/thiếu nước/khó tìm/audio" trong bình luận — không tự bịa tỷ lệ không có trong dữ liệu).

### 6) Dashboard Host (`js/studio/overview.js`, `js/studio/reports.js`)
Viết lại hoàn toàn: KPI đầy đủ (khách/booking hoàn thành/doanh thu gộp/thu nhập dự kiến kèm %so-với-tháng-trước, điểm đánh giá, tỷ lệ giới thiệu, tỷ lệ huỷ, booking cần phản hồi) — rẽ nhánh đúng theo loại host: host có doanh thu (3 trải nghiệm + bảo tàng) hiện đủ KPI tài chính; host quản lý chùa/cụm miễn phí (SITE-04/05/07) hiện lượt ghé thay vì doanh thu (đúng "không có doanh thu vé"). 5 chart Chart.js: doanh thu/khách theo tháng (bar), donut "Những điều khách yêu thích" (đúng chú thích "tỷ trọng trên tổng lượt lựa chọn lời khen", KHÔNG gọi là % khách), phân bố 1–5 sao (bar), danh sách phản hồi gần đây, 2 khối gợi ý cải thiện (vận hành cũ từ CPS + nội dung mới từ review).

### 7) Cổng quản lý (`js/admin/overview.js`, `js/admin/networkMetrics.js` mới, `js/admin/filters.js`, `js/admin/demand.js`)
KPI toàn mạng lưới: tổng lượt trải nghiệm (participants EXP + visitInstances SITE, SITE-06 CHỈ tính 1 lần qua visitMetrics — không đếm trùng với historicalMetrics.participants dùng cho doanh thu), booking hoàn thành, doanh thu qua nền tảng (đặt tên đúng "Doanh thu ghi nhận qua mạng lưới pilot", không gọi "doanh thu du lịch toàn tỉnh"), thu nhập chuyển hộ/nghệ nhân, điểm đánh giá **có trọng số** (`weightedAverageRating = ΣratingSum/Σreviewcount`, không lấy trung bình cộng 7 con số), tỷ lệ giới thiệu, số host hoạt động, booking cần xử lý. 5 chart: doanh thu theo tháng, lượt tham gia+lượt ghé (line 2 series), donut theo provider (chỉ tính đơn vị có doanh thu >0, bảo tàng gắn nhãn "Đơn vị văn hóa công" tách khỏi hộ dân/nghệ nhân), doanh thu theo loại hình, điểm đánh giá theo listing. 2 bảng: top phản hồi, đề án hỗ trợ đang chờ (link sang `#/admin/proposals`). Bộ lọc mở rộng thêm "Listing" và "Đơn vị cung cấp" (ngoài tháng/loại hình/khu vực/nhóm khách có sẵn) — đổi bất kỳ filter nào cập nhật đồng thời KPI+5 chart+2 bảng (đã kiểm thử: lọc riêng Chùa Âng → đúng 0đ doanh thu, đúng tổng lượt ghé khớp `monthlyVisits['SITE-05']`). `admin/demand.js` (dự báo doanh thu) chuyển từ nguồn cũ đã rỗng (`state.metrics.monthlyByHost`) sang `networkMetrics.getNetworkMonthlyRevenue()`.

### 8) Chart.js — sự cố phát hiện + đã sửa
`js/services/chartService.js` (mới): `loadChartJs()` dùng chung, `createChart()`/`destroyChart()` có registry theo canvas id (huỷ chart cũ trước khi tạo lại, không chồng canvas khi chuyển tab/đổi filter). **Phát hiện lúc kiểm thử**: URL CDN cũ (`Chart.js/4.4.4`, dùng từ phase trước) trả về **404 thật** — cdnjs đã gỡ bản 4.4.4 khỏi CDN, không phải do mạng chặn. Đã sửa sang bản còn tồn tại (`4.5.1`, xác nhận qua `cdnjs` API), kiểm thử lại: `window.Chart.version === '4.5.1'`, canvas có kích thước render thật (652×478, không còn 300×150 mặc định), chuyển route qua lại nhiều lần không phát sinh lỗi console.

### 9) Migration schema v3 → v4
`SCHEMA_VERSION = 4`. `migrateV3ToV4()` là passthrough (không có gì trong state đã lưu cần đổi hình dạng — historicalMetrics/reviewTags/visitMetrics đều là nội dung tĩnh đọc trực tiếp từ `pilot-seed-data.js` mỗi lần tải, không lưu localStorage). Xoá `js/admin/metrics.js` (dead code, dùng `state.metrics.monthlyByHost` luôn rỗng — đã thay bằng `networkMetrics.js`).

### Đã kiểm thử qua trình duyệt thật
1. Card Khám phá + trang chi tiết cả 7 listing: đúng sao/lượt đánh giá (4.9/4.7/4.9/4.3/4.6/4.5/4.8 khớp chính xác spec), đúng giá (180k/280k/220k/Miễn phí/Miễn phí/20k/Miễn phí), đúng thời lượng, trạng thái "Đang mở" tính real-time.
2. Trang chi tiết EXP-01: accordion "Giờ và phí" đủ trạng thái/giá/thời lượng/sức chứa/giờ cả tuần/chú thích pilot; 11 review hiển thị đúng thứ tự mới nhất trước (10 seed + 1 live từ phase trước).
3. Viết review mới qua form "Cảm nhận chuyến ghé thăm" (tag + Có/Không) → `reviewCount` tăng đúng 1 (86→87), average tính lại đúng từ ratingSum/reviewCount, card/trang chi tiết/Studio Tổng quan cùng cập nhật ngay (qua sự kiện `khmerlink:data-changed`, không cần tải lại trang thủ công).
4. Tạo 1 trải nghiệm thật + booking thật qua Studio → Studio Tổng quan hiện đúng KPI (%so-với-tháng-trước), Báo cáo hiện đúng 4 chart Chart.js thật (participants/revenue/tags-donut/rating-distribution).
5. Cổng quản lý: KPI + 5 chart + 2 bảng hiện đúng; lọc theo listing "Chùa Âng" → đúng 0đ doanh thu (chùa miễn phí không tính doanh thu), đúng tổng lượt ghé.
6. Reload trang nhiều lần: `schemaVersion` lên đúng 4, không nhân đôi review/booking/notification/reminder (đếm lại đúng số cũ).
7. Reminder "2h trước giờ khởi hành" tới hạn tự động tạo đúng 1 notification khi mở lại app (idempotent qua `sentAt`, đã quan sát thực tế trong lúc kiểm thử kéo dài phiên).
8. Quét 30 route (Trail/Studio/Admin/Ops) ở cả desktop và mobile 375px: không tràn ngang, không lỗi console.

### Giới hạn đã biết (không giấu)
- `%so với tháng trước` ở Studio có thể hiện chênh lệch rất lớn (vd −98%) khi so tháng lịch sử (seed, nhiều dữ liệu) với tháng hiện tại (chỉ có vài booking thật phát sinh trong phiên demo) — đây là kết quả tính đúng công thức, không phải lỗi, nhưng cần lưu ý khi trình diễn.
- Chưa có UI ẩn/huỷ riêng cho 1 review cụ thể (hàm tính average đã hỗ trợ đúng nếu status đổi khỏi `published`, nhưng chưa có nút thao tác nào gọi tới — giống giới hạn đã ghi nhận ở phase trước).
- Phân bố 1–5 sao ở Host/Management là ước lượng từ 68 review mẫu hiển thị, không phải toàn bộ review lịch sử (vd Chùa Âng có 1751 review theo baseline nhưng chỉ 10 review chi tiết được viết ra) — đã ghi chú rõ trong UI.

### File đã sửa/tạo
Mới: `data/pilot-seed-data.js`, `DEMO_DATA.md`, `js/services/operationsService.js`, `js/services/metricsService.js`, `js/services/chartService.js`, `js/admin/networkMetrics.js`.
Sửa: `js/services/reviewsService.js`, `js/storage.js`, `js/trail/passport.js`, `js/trail/placeDetail.js`, `js/trail/explore.js`, `js/trail/profile.js`, `js/studio/overview.js`, `js/studio/reports.js`, `js/admin/overview.js`, `js/admin/filters.js`, `js/admin/demand.js`, `js/data.js`.
Xoá: `js/admin/metrics.js` (dead code, thay bằng `networkMetrics.js`).

## PHASE — Cá nhân hoá luôn có kết quả + Dữ liệu Lịch & Booking của Host — 2026-09-14

Hai phần độc lập: (1) sửa cơ chế cá nhân hoá hành trình để không bao giờ trả về màn hình trống; (2) bổ sung dữ liệu demo cho trang "Lịch & Booking" của Host (trước đó gần như trống — chỉ có 1 bộ lọc trạng thái và danh sách rỗng).

### Nguyên nhân cá nhân hoá trả về trống (chẩn đoán trước khi sửa)
`aiService.suggestItineraries()` (cũ) dựng tối đa 3 phương án qua `buildOption()`; nếu CẢ 3 đều có `stops.length < 2` (thường do khung giờ quá ngắn hoặc giờ mở cửa không khớp) thì trả `itineraries: []` kèm `reason`, và `itinerary.js` hiển thị thẳng `renderErrorState` + nút "Thử lại" quay lại từ đầu form — đúng như người dùng mô tả. Không có tầng nới lỏng/dự phòng nào ở giữa.

### PHẦN 1 — `js/services/aiService.js`, `js/trail/itinerary.js`
- `normalizeItineraryPrefs()`: chuẩn hoá toàn bộ input (ngân sách rỗng → `null`="linh hoạt", sở thích rỗng → cân bằng, số người/thời gian không hợp lệ → mặc định 1 người/4 giờ, trim khoảng trắng) — thêm field **ngân sách** mới vào wizard bước 2 (trước đây form không có trường này, cần thiết để chấm điểm mục 1.3).
- `buildOption()` nhận thêm `budgetMultiplier`/`timeToleranceMin`: vòng khớp chính xác dùng `{1, 0}`, vòng nới lỏng dùng `{1.3, 60}` (đúng "ngân sách +30%, thời gian +60 phút" của spec) — tách lõi dựng 3 phương án ra `buildItineraryOptions()` dùng chung cho cả 2 vòng.
- `scorePlaceForPartialMatch()`: chấm điểm 1 địa điểm/100 (sở thích 35 · ngân sách 25 · thời gian 20 · quy mô nhóm 10 · ưu tiên 10) — dùng khi không ghép được route hoàn chỉnh dù đã nới lỏng.
- `getItineraryRecommendations()` — điểm vào DUY NHẤT, cascade 4 tầng: (1) route khớp chính xác → (2) route đã nới lỏng → (3) xếp hạng từng địa điểm riêng lẻ → (4) địa điểm phổ biến nhất (điểm cao × log(lượt đánh giá), tái dùng `reviewsService`) nếu lỗi kỹ thuật/dữ liệu rỗng. Luôn trả ≥1 kết quả nếu còn destination nào trong dữ liệu.
- `itinerary.js`: `renderResults()` vẽ theo đúng `result.mode` (full/partial-route/partial-places/popular-fallback); mode partial hiện banner "Chưa có hành trình khớp hoàn toàn" (đúng wording spec, không nói khách nhập sai) + card gợi ý (ảnh, thời lượng, chi phí cả nhóm, số điểm dừng, % phù hợp, tiêu chí đã khớp, ghi chú chưa khớp, 3 nút Xem/Chọn/Điều chỉnh nhanh); mode popular-fallback đổi nút "Chọn hành trình" thành "+ Thêm vào giỏ hành trình" (không mời đặt ngay khi hệ thống đang ở trạng thái dự phòng). Thanh "Điều chỉnh nhanh" (+1 giờ / +20% ngân sách / −1 điểm dừng / ưu tiên phù hợp nhất) gọi lại `getItineraryRecommendations()` với prefs đã chỉnh, chỉ vẽ lại phần kết quả — không bắt nhập lại form.

### PHẦN 2 — Dữ liệu Lịch & Booking của Host
- `data/pilot-seed-data.js`: `buildInitialDemoBookings(today)` sinh 18 booking cố định (5 pending·8 confirmed·3 completed·2 cancelled) theo offset-ngày tương đối "hôm nay" — khớp đúng mục tiêu spec (hôm nay 4 booking/18 khách, 7 ngày tới 13 booking/57 khách, đang chờ 5); `weeklyDemandPattern` (mẫu hình theo thứ trong tuần, tách biệt khỏi 18 booking cụ thể) và `demandInsightsSeed` (khung giờ/loại nhóm khách/mức tăng cuối tuần — mẫu hình cấp nền tảng, không suy ra được từ 18 bản ghi).
- **Quyết định kiến trúc quan trọng**: booking demo lưu ở `state.hostDemoBookings` — mảng TÁCH BIỆT khỏi `state.bookings`/`bookingItems` thật. Lý do: `bookingItems` thật gắn chặt với 1 traveller demo duy nhất của Trail (đã xác lập từ các phase trước); nếu seed 18 booking "của khách khác" thẳng vào đó, ít nhất 2 chỗ trong code (`passport.js` danh sách chờ đánh giá, `placeDetail.js` nút "Viết đánh giá") lọc `bookingItems` KHÔNG theo traveller (vì trước giờ chỉ có 1 traveller) — sẽ khiến khách demo thấy nhắc đánh giá/nút viết đánh giá cho booking không phải của họ. Tách riêng mảng giải quyết triệt để, đã kiểm thử xác nhận Hộ chiếu/Passport không bị ảnh hưởng.
- `js/storage.js`: `SCHEMA_VERSION` 4→5, `migrateV4ToV5()` (thêm field rỗng, không đổi dữ liệu cũ); seed 18 booking demo đúng 1 LẦN lúc `init()` nếu `hostDemoBookings` còn rỗng, sau đó đóng băng trong localStorage; 5 hàm CRUD (`confirmHostDemoBooking`, `rejectHostDemoBooking`, `proposeHostDemoBookingTime`, `completeHostDemoBooking`, `markHostDemoBookingContacted`), đều gọi `notifyDataChanged('hostDemoBookings', ...)`.
- `js/services/hostBookingService.js` (mới): hợp nhất booking thật + demo thành 1 danh sách chuẩn hoá; `getSummaryCards()` (8 số liệu mục 2.1, tỷ lệ lấp đầy = khách/sức chứa các lượt hoạt động×ngày thực có booking trong 7 ngày tới, tỷ lệ hoàn thành = gộp `historicalMetrics` 12 tháng (phase trước) + booking mới để có mẫu đủ lớn — ra ~91%, gần khớp minh hoạ "93%" của spec); `getWeeklyDemandChartData()`, `getCalendarMonthData()` (màu trạng thái theo mức ưu tiên pending>confirmed>completed>cancelled, cờ `highDemand`), `getDemandInsights()`, bộ lọc (ngày/trạng thái/hoạt động/khung giờ/số người/tìm kiếm) — summary cards áp bộ lọc KHÔNG-phải-khoảng-ngày (để "hôm nay"/"7 ngày tới" giữ đúng nghĩa mốc thời gian), Calendar/Danh sách áp đủ mọi bộ lọc kể cả khoảng ngày.
- `js/studio/bookings.js` viết lại hoàn toàn: summary cards, biểu đồ nhu cầu tuần (Chart.js bar, cột cuối tuần tô đậm hơn, tooltip đủ ngày/booking/khách/doanh thu), calendar tháng (lưới CSS grid, click 1 ngày mở modal danh sách booking ngày đó), danh sách booking dạng card (tự responsive, không cần bảng riêng cho mobile), nút hành động theo đúng trạng thái + nguồn dữ liệu (booking thật dùng `respondToBooking`/`completeBookingItem` có sẵn; booking demo dùng 5 hàm CRUD mới, có thêm "Đề xuất giờ khác"/"Liên hệ khách"), khối "Nhu cầu của khách" (2 chart Chart.js: donut khung giờ, bar loại nhóm khách + insight card), empty state đúng wording spec khi lọc không ra kết quả.
- `js/admin/networkMetrics.js`: `pendingBookings` gộp thêm booking demo đang `pending` (đúng phạm vi lọc theo provider) — Management Portal nhận đúng số liệu khi Host xác nhận/từ chối booking demo.
- CSS: thêm `.badge-danger` (đỏ nhạt, cho trạng thái "Đã huỷ") và `.booking-calendar__*` (lưới lịch tháng, responsive, ẩn phần mô tả phụ ở màn ≤480px).

### Đã kiểm thử qua trình duyệt thật
1. Form cá nhân hoá với ngân sách rất thấp (5.000đ) + 1 giờ → không có route trả phí khớp (đúng), tự động rơi xuống "partial-route" với 1 route MIỄN PHÍ (Làng Văn hoá + Chùa Lò Gạch), hiện đúng banner "Chưa có hành trình khớp hoàn toàn" + thanh Điều chỉnh nhanh (ẩn đúng nút tăng ngân sách... không, hiện đủ vì ngân sách khác null) — bấm "Ưu tiên trải nghiệm phù hợp nhất" tính lại không lỗi, không mất lựa chọn trước đó; bấm "Chọn hành trình này" lưu đúng hành trình, điều hướng sang trang chi tiết với timeline/bản đồ đầy đủ.
2. Không còn màn hình nào chỉ ghi "vui lòng chọn lại" — đã xoá hẳn nhánh cũ trong `itinerary.js`.
3. `/studio/bookings` (host Trần Tuấn Việt): 8 summary card đúng số cho riêng host này (khác tổng 18 vì mỗi host chỉ thấy booking của mình — đúng thiết kế phân quyền); calendar tô màu đúng theo trạng thái, click 1 ngày mở đúng modal danh sách; đổi bộ lọc trạng thái → summary cards VÀ danh sách VÀ calendar cùng cập nhật (đã sửa 1 lần sau khi phát hiện summary cards ban đầu chưa áp bộ lọc).
4. Bấm "Xác nhận" 1 booking pending → "Đang chờ xác nhận" giảm đúng 1 tại chỗ (3→2); reload trang vẫn giữ 2 (không sinh lại 18 bản ghi mới); `#/admin/overview` hiện đúng "Booking cần xử lý: 4" (= 5 pending gốc − 1 vừa xác nhận, gộp đúng cả 3 host).
5. `#/trail/passport` sau khi có 18 booking demo: vẫn hiện "0 trải nghiệm đã xác nhận" — xác nhận booking demo KHÔNG rò rỉ vào trải nghiệm của khách demo thật.
6. Chart.js: cả 3 canvas mới (weekly-demand, timeofday-donut, grouptype-bar) render đúng kích thước thật, không lỗi console khi đổi tháng calendar/đổi bộ lọc nhiều lần liên tiếp (registry `createChart`/`destroyChart` từ phase trước hoạt động đúng).
7. Quét 8 route liên quan ở mobile 375px: `scrollWidth - clientWidth = 0` toàn bộ, không lỗi console.

### Giới hạn đã biết (không giấu)
- "Doanh thu dự kiến 7 ngày" của bộ dữ liệu demo tổng (~11,28 triệu) chưa khớp tuyệt đối con số minh hoạ trong spec (9.840.000đ) — đã chỉnh cơ cấu hoạt động/số khách để gần hơn nhưng không ép khớp tuyệt đối vì việc đó đòi hỏi đoán ngược giả định giá không có trong spec; số liệu vẫn hoàn toàn tính động từ 18 bản ghi, không hard-code.
- "Nhu cầu theo khung giờ trong ngày"/"loại nhóm khách" (mục 2.5) là mẫu hình cấp nền tảng cố định (`demandInsightsSeed`), không suy ra được từ 18 booking demo (quá ít để có ý nghĩa thống kê) — chỉ "hoạt động được quan tâm nhất"/"khung giờ đặt nhiều nhất" là tính động thật từ dữ liệu.
- "Đề xuất giờ khác"/"Liên hệ khách" chỉ áp dụng cho booking DEMO — booking thật (từ traveller demo của Trail) chưa có 2 hành động này vì luồng `bookingService.js` hiện có không hỗ trợ (ngoài phạm vi 2 phần yêu cầu lần này).
- Quét lại toàn bộ route liên quan (7 trang chi tiết, `#/ops/pilot`, `#/studio/overview`, `#/trail/explore`) ở 375px và desktop — không lỗi console, không tràn ngang.

## PHASE — Dữ liệu Host đủ 7/7 đơn vị + Tổng quan khớp tuyệt đối Lịch & Booking — 2026-09-15

### Nguyên nhân đã chẩn đoán trước khi sửa
Hai lỗi có CHUNG 1 gốc: **Tổng quan và Lịch & Booking đọc 2 nguồn dữ liệu khác nhau.** Tổng quan (`studio/overview.js`) dùng `metricsService.getHostKpis()` (dựa trên `historicalMetrics` 12 tháng + 1 "tháng live" tự tính riêng từ `state.bookingItems` THẬT — không đụng tới booking demo). Lịch & Booking (`studio/bookings.js`) dùng `hostBookingService` đọc `state.hostDemoBookings` (booking demo). `historicalMetrics` chỉ có 4/7 đơn vị (EXP-01/02/03 + bảo tàng) — 3 đơn vị còn lại (2 chùa + cụm Nguyệt Hóa) không có trong `historicalMetrics` NÊN Tổng quan rơi vào nhánh "lượt ghé" cũ (`visitMetrics`, dữ liệu lịch sử 12 tháng, không phải booking), trong khi `hostDemoBookings` (phase 14/09/2026) cũng chỉ seed cho 3/7 đơn vị (EXP-01/02/03) — 4 đơn vị còn lại (2 chùa, cụm, bảo tàng) hoàn toàn không có booking demo nào ở Lịch & Booking. Kết quả: dữ liệu thiếu ở cả 2 trang theo 2 cách khác nhau, và ngay cả 3 đơn vị có dữ liệu cũng lệch số vì 2 công thức tính độc lập.

### File đã sửa/tạo
Mới: không có file mới (chỉ mở rộng file đã có).
Sửa: `data/pilot-seed-data.js` (viết lại hoàn toàn phần booking demo), `js/storage.js` (schema v5→v6), `js/data.js`, `js/services/hostBookingService.js` (viết lại hoàn toàn — nguồn KPI trung tâm mới), `js/services/metricsService.js` (uỷ quyền "tháng hiện tại" sang hostBookingService), `js/studio/overview.js` (viết lại hoàn toàn), `js/studio/bookings.js` (sửa field name + nhãn), `js/studio/shell.js` (đổi nhãn dropdown), `js/admin/overview.js`, `js/admin/networkMetrics.js`, `css/layout.css` (sửa tràn ngang bottom-nav + host-switcher, không liên quan trực tiếp nhưng phát hiện lúc kiểm thử mobile).

### Schema dữ liệu mới
`data/pilot-seed-data.js`:
- `DEMO_REFERENCE_DATE = "2026-09-14T09:00:00+07:00"` — mốc "hiện tại" cố định dùng THỐNG NHẤT toàn project (thay `new Date()` thật) cho mọi tính toán "tháng này"/"hôm nay"/"7 ngày tới".
- `providerFinancialMeta[providerId] = { financialMode, platformFeeRate, revenueSplitNote? }` — 3 giá trị `financialMode`: `community_paid` (10% phí), `public_ticket` (0% phí, không gọi "thu nhập hộ"), `free_visit` (0% phí, không tạo doanh thu).
- `buildInitialDemoBookings()` sinh **59 booking** (thay 18 booking/3 đơn vị trước đó) cho ĐỦ 7 đơn vị, mỗi bản ghi: `{id, providerId, activityId, customerName, bookingDate, startTime, groupSize, unitPrice, grossAmount, platformFee, providerIncome, status, createdAt, customerNote, groupType, preferredTime, contactStatus, proposedTime, source, dataStatus}`. Group size từng đoàn lấy ĐÚNG bảng người dùng cung cấp — đã kiểm tra bằng script Node độc lập, khớp chính xác 100% mọi con số mục tiêu (59 active · 19 hoàn thành · 28 xác nhận · 12 chờ · 726 khách · 30.340.000đ tổng giá trị · 24.534.000đ thu nhập 3 trải nghiệm cộng đồng · 3.080.000đ doanh thu vé bảo tàng · 2.726.000đ phí nền tảng).
- `CURRENT_DEMO_BOOKINGS_VERSION` + `state.hostDemoBookingsVersion`: seed lại TOÀN BỘ 1 lần khi công thức đổi (không giữ 18 bản ghi cũ lẫn 59 bản ghi mới) — chấp nhận được vì đây là dữ liệu SEED, không phải do người dùng tạo; booking/review THẬT của người dùng không hề bị đụng tới.
- `js/storage.js`: `SCHEMA_VERSION` 5→6, `migrateV5ToV6()` chỉ đặt `hostDemoBookingsVersion=0` để `init()` tự seed lại đúng công thức mới.

### Cách tính KPI (nguồn DUY NHẤT — `js/services/hostBookingService.js`)
```js
getProviderBookings(state, providerId, period)   // period mặc định = tháng của DEMO_REFERENCE_DATE
getActiveBookings(bookings)      // status !== 'cancelled'
getCompletedBookings / getConfirmedBookings / getPendingBookings / getUpcomingBookings(bookings)
getProviderMetrics(state, providerId, period)    // toàn bộ KPI 1 đơn vị — CẢ Tổng quan lẫn Lịch & Booking đều gọi hàm NÀY
getNetworkMetrics(state, period, providerIds)    // tổng hợp mạng lưới — Cổng quản lý gọi hàm NÀY
```
`getProviderMetrics()` trả về `totalBookings/completedCount/confirmedCount/pendingCount/upcomingCount/cancelledCount/totalGuests/completedGuests/upcomingGuests/grossExpected/providerExpectedIncome/providerEarnedIncome/remainingExpectedIncome/completionRate/peakTimeslot` — đúng công thức yêu cầu (`activeBookings = status !== 'cancelled'`, chia 0 được bảo vệ bằng `active.length ? ... : null`). `js/studio/overview.js` và `js/studio/bookings.js` (qua `getSummaryCards`, cũng gọi `getProviderBookings`) giờ CÙNG đọc chung nguồn này nên không thể lệch số nữa — khác gốc rễ so với lỗi cũ.

`metricsService.js`'s `computeLiveMonth()` (dùng cho chart 12 tháng ở Báo cáo) cũng đổi sang gọi `getProviderMetrics()` thay vì tự tính riêng từ `bookingItems`, để cột "tháng này" ở biểu đồ Báo cáo không lệch khỏi Tổng quan/Lịch & Booking.

### Kết quả từng acceptance test (25 mục)
1–2. Dropdown đủ 7 đơn vị, nhãn đổi "Hộ kinh doanh" → "Đơn vị cung cấp" (label hiển thị + aria-label + demo-note) — Pass.
3. Cả 7 đơn vị đều có booking demo riêng (kiểm qua Node: mỗi `providerId` xuất hiện đúng số bản ghi theo bảng) — Pass.
4. Đổi đơn vị trong dropdown → Overview/Calendar/Booking list/chart cập nhật ngay (đã test qua cả 7 đơn vị, không đơn vị nào còn hiện dữ liệu cũ) — Pass.
5–7. EXP-01: 7 booking, 1 completed, thu nhập dự kiến 5.022.000đ, thu nhập đã ghi nhận 648.000đ — khớp chính xác từng số qua browser thật — Pass.
8. EXP-02 không double-count: `state.hosts` chỉ có 1 bản ghi `host-nhac-mua-khmer`, `getNetworkMetrics()` duyệt theo hosts nên không lặp; đã xác nhận tổng mạng lưới = 59 (không phải 65 nếu double-count) — Pass.
9. EXP-03: đúng 8 booking, 40 khách — Pass.
10–13. Cụm Nguyệt Hóa/Chùa Âng/Chùa Lò Gạch không hiển thị doanh thu (financialMode `free_visit`, phần tài chính ẩn hoàn toàn); Bảo tàng hiển thị "Doanh thu vé dự kiến/đã ghi nhận", có dòng chú thích rõ "KHÔNG phải thu nhập hộ kinh doanh" — Pass.
14. Tổng quan và Lịch & Booking khớp nhau — đã kiểm tra trực tiếp qua browser cho cả 7 đơn vị (Tỷ lệ lấp đầy, Đang chờ xác nhận... giống hệt giữa 2 trang) — Pass.
15–17. Management Portal: 59 active/726 khách/30.340.000đ — khớp chính xác qua browser thật (không chỉ tính bằng Node) — Pass.
18. Xác nhận 1 pending (Chùa Âng) → Lịch & Booking (2→1), Tổng quan (danh sách "việc cần làm" giảm đúng 1 mục), Management Portal (Đang chờ 12→11, Đã xác nhận 28→29, Tổng active/khách/tiền KHÔNG đổi) — kiểm thử trực tiếp qua 3 trang, đúng như yêu cầu — Pass.
19–20. Hoàn thành/huỷ booking: logic đã có sẵn từ phase 14/09/2026 (`completeHostDemoBooking`/`rejectHostDemoBooking`), nay tính KPI qua `getProviderMetrics()` nên tự động đúng theo công thức mới — Pass (kiểm tra logic, không test riêng huỷ lần này vì đã test xác nhận/hoàn thành ở phase trước với cùng cơ chế).
21. Reload trang: 59/19/29/11 giữ nguyên, không sinh thêm bản ghi (`hostDemoBookingsVersion` khớp nên `init()` không seed lại) — Pass.
22. Đồng bộ tab: dùng lại `notifyDataChanged`/`storage` event có sẵn từ phase trước, không đổi cơ chế — chưa test riêng 2 tab lần này (đã test kỹ ở phase 14/09/2026 với cùng cơ chế event).
23. Không NaN/undefined: quét tự động cả 7 đơn vị × 2 trang (Overview + Bookings) qua browser — 0 kết quả NaN/undefined — Pass.
24. Không lỗi console: quét 25 route (Trail/Studio/Admin/Ops) — 0 lỗi — Pass.
25. Tính năng cũ vẫn hoạt động: Trail/Ops không đổi; phát hiện thêm 1 lỗi tràn ngang PRE-EXISTING (bottom-nav Studio 5 tab tràn 18px trên mobile — không do phase này gây ra, nhưng tiện sửa luôn vì cùng khu vực đang kiểm thử) — đã sửa (`min-width:0` cho `.bottom-nav__item`, ẩn label "Đơn vị cung cấp" + giảm `max-width` select dưới 480px) — Pass sau khi sửa.

### Đã kiểm thử qua trình duyệt thật (ngoài các mục trong acceptance test ở trên)
- Script Node độc lập xác nhận TRƯỚC KHI đụng UI: 59 bản ghi, đúng breakdown theo từng đơn vị, đúng tổng mạng lưới, ngày tháng đúng quy tắc completed-trước/upcoming-sau `DEMO_REFERENCE_DATE`.
- EXP-02 hiển thị đúng ghi chú chia doanh thu minh hoạ "Lâm Phên 45% · Ánh Bình Minh 55%" (thông tin, không tách bản ghi thật).
- Tỷ lệ hoàn thành ở Lịch & Booking đổi nhãn thành "Tỷ lệ hoàn thành TRONG THÁNG" (phân biệt rõ với số liệu 12 tháng ở Báo cáo, đúng yêu cầu mục 6).

### Giới hạn đã biết (không giấu)
- "Đồng bộ 2 tab" (acceptance #22) không test lại trực tiếp lần này — dùng nguyên cơ chế `notifyDataChanged`/window `storage` event đã kiểm thử kỹ ở phase 14/09/2026, không có thay đổi gì ở tầng đó trong phase này.
- Đã mở trực tiếp `#/studio/reports` sau khi sửa — trang render đúng, không lỗi console, 4 chart Chart.js (doanh thu/khách theo tháng, donut tag, phân bố sao) vẫn hoạt động bình thường sau khi đổi nguồn "tháng hiện tại" trong `metricsService.js`.
- Lỗi tràn ngang bottom-nav Studio được sửa "tiện thể" khi phát hiện lúc kiểm thử mobile cho phase này — không phải yêu cầu của phase, nhưng để lại sẽ phá vỡ "các tính năng cũ vẫn hoạt động" (acceptance #25) nên đã sửa luôn thay vì bỏ qua.

## PHASE — Data Linkage: Activity Catalog trung tâm cho Customer/Host/Booking/AI/Review — 2026-09-15

### Nguyên nhân (khảo sát trước khi code)
Trước phase này, giá/thời lượng/sức chứa/khung giờ của 7 listing pilot nằm rải rác ở **3 nguồn độc lập**, không phải 1:
1. `data/pilot-listings.json` (`revenue.priceValue`/`revenue.durationMinutes`/`revenue.bookable`) — dùng cho `destinationsService.js` khi dựng `dest.priceDisplay`/`dest.suggestedDurationMin` (giá luôn `null`, thời lượng lệch với #2 ở 4/7 listing, ví dụ EXP-03 ghi 75 phút trong khi #2 ghi 90 phút).
2. `listingOperations` (`data/pilot-seed-data.js`) — dùng cho `operationsService.getOperations()` (accordion "Giờ và phí", card Khám phá, `aiService` một phần).
3. `TIME_SLOTS_BY_ACTIVITY` + `providerFinancialMeta` (2 hằng số tĩnh riêng, cũng ở `pilot-seed-data.js`) — chỉ dùng để sinh booking demo, Host/Customer không thấy được khung giờ này ở đâu cả.

Hệ quả: `aiService.js` có 3 chỗ tính thời lượng lịch trình thẳng từ `dest.suggestedDurationMin` (nguồn #1) thay vì `getOperations()` (nguồn #2) — có thể lệch với số hiển thị ở trang chi tiết. Mục "Trải nghiệm" của Studio chỉ hiển thị trải nghiệm do Host tự tạo qua form riêng (`state.experiences`, mặc định rỗng) — **không có nội dung nào cho cả 7/7 listing pilot**, đúng như người dùng phản ánh. Không có cơ chế nào để Host chỉnh mô tả/giá/giờ và cho lan toả sang Customer.

### Việc đã làm
1. **Hợp nhất thành 1 Activity Catalog** — `data/pilot-seed-data.js` xuất `activityCatalog` (khoá theo đúng listing id EXP-01..SITE-07, không tạo hệ id song song), gộp giờ/giá/thời lượng/sức chứa (giữ đúng số cũ, đã đúng theo `listingOperations`) với `financialMode`/`platformFeeRate`/`offeringType`/`availableTimeSlots`/`bookable`/`publicationStatus`/`culturalNotes`/`visitRegistrationEnabled`/`partnerProviderIds`/`revenueSplitNote`. `providerFinancialMeta` (dùng bởi `hostBookingService.js`) và khung giờ sinh booking demo giờ **derive trực tiếp từ catalog** thay vì khai báo tay riêng — xoá `TIME_SLOTS_BY_ACTIVITY` và bản `providerFinancialMeta` tĩnh cũ.
2. **`js/services/operationsService.js`: `getOperations()` trở thành điểm đọc DUY NHẤT**, hợp nhất LIVE `activityCatalog` gốc + `state.activityCatalogOverrides` (phần Host tự chỉnh) — gọi lại mỗi lần render, không đóng băng vào `state.destinations`. Nhờ `explore.js`/`placeDetail.js`/`aiService.js` **đã sẵn quy ước gọi `getOperations()` mỗi lần render** (không bake tĩnh) từ các phase trước, phần lớn nơi hiển thị tự động nhận số liệu mới mà không cần sửa thêm.
3. **`js/storage.js`**: `SCHEMA_VERSION` 6→7, `migrateV6ToV7()` thêm `activityCatalogOverrides: {}` (không đụng booking/review/hành trình cũ). Thêm `updateActivityCatalogOverride(activityId, patch)` — lọc bỏ các trường Host KHÔNG được sửa (`activityId/providerAccountId/partnerProviderIds/financialMode/platformFeeRate/revenueSplitNote/offeringType`), `persist()` + `notifyDataChanged('activityCatalog','updated')`.
4. **`js/services/aiService.js`**: 3 chỗ dùng thẳng `dest.suggestedDurationMin` (bỏ qua `getOperations()`) đổi sang hàm `getDurationMin()` dùng chung — thời lượng lập lịch AI nay LUÔN khớp trang chi tiết. Thêm `isPublishedForAi()` — loại các catalog entry có `publicationStatus !== 'published'` khỏi CẢ 4 đường gợi ý (route đầy đủ/nới lỏng, xếp hạng từng địa điểm, dự phòng phổ biến, gợi ý bổ sung cộng đồng). Không lọc trong `buildItineraryFromSelection` (khách đã tự chọn vào giỏ hành trình, tạm dừng sau đó không nên âm thầm rút khỏi hành trình đã lên).
5. **`js/studio/experiences.js` viết lại**: mỗi Host giờ LUÔN có nội dung trong mục này — heading đổi theo `offeringType` ("Trải nghiệm" / "Hoạt động tham quan" / "Địa điểm đang quản lý"), thẻ catalog hiển thị ảnh/tên/category/trạng thái công bố/mô tả/giá/thời lượng/sức chứa/khung giờ/booking hoặc lượt đăng ký trong tháng/khách tháng này (từ `getProviderMetrics()`, CÙNG nguồn Tổng quan/Lịch & Booking)/rating+số review (từ `reviewsService`), nút "Chỉnh sửa" và "Xem trên giao diện khách". Form chỉnh sửa khoá cứng giá ở 0đ khi `financialMode==='free_visit'`, khoá hẳn provider/financialMode/activityId. Tính năng "Trải nghiệm bổ sung tự thêm" (form/slot cũ) giữ nguyên 100%, chỉ đổi tiêu đề để phân biệt.
6. **`js/trail/placeDetail.js`**: mô tả ngắn ưu tiên `ops.shortDescription` (Host đã chỉnh) trước khi rơi về `dest.summary` tĩnh; thêm badge "Tạm dừng nhận khách" khi `publicationStatus !== 'published'`.
7. **`js/trail/explore.js`**: popup bản đồ (`buildPopupHtml`) đổi sang gọi `getOperations()` thay vì đọc `dest.priceDisplay` tĩnh — đồng bộ với card danh sách (vốn đã gọi `getOperations()` từ trước).
8. **Booking snapshot (mục 6–7 yêu cầu)**: xác minh KHÔNG cần sửa — 2 luồng booking hiện có đã snapshot đúng theo thiết kế sẵn: (a) `bookingItems` thật (`bookingService.createBooking`) lưu `unitPrice`/`subtotal`/`title` tại thời điểm đặt, không tính lại khi giá sau đó đổi; (b) `hostDemoBookings` là bản ghi mô phỏng đã đóng băng số liệu lúc sinh (`unitPrice`/`grossAmount`/`platformFee`/`providerIncome`), không đọc giá catalog động. Không mở rộng luồng đặt-chỗ-thanh-toán-thật cho 7 listing pilot ở phase này (giữ nguyên quyết định "chưa supplier nào xác nhận nhận khách thật" từ phase trước — `dest.bookingStatus` vẫn `notBookable`/`visitFreely` như cũ, không đổi).

### Phạm vi CHỦ ĐỘNG không làm (để tránh phá vỡ tính năng đang chạy)
- Không xây luồng capacity-check thời gian thực cho 7 listing pilot (chưa có hệ "slot thật" cho chúng) — `capacity` trong catalog dùng làm số hiển thị + giá trị khởi tạo hợp lý khi Host tạo slot mới trong "Trải nghiệm bổ sung tự thêm"; validation sức chứa THẬT vẫn áp dụng đầy đủ cho luồng slot đã có (`getSlotRemaining`), không đổi.
- Không thêm trường `tags`/`accessibility`/gallery ảnh có thể chỉnh — không nằm trong 24 acceptance test, giữ phạm vi gọn.
- Không đổi `dest.category` theo catalog (giữ nguyên từ `pilot-listings.json`) vì trường này đang được nhiều nơi khác dùng để suy interest/icon/nhóm lọc (`deriveInterests`, `categoryEmoji`, `deriveCategoryVisual`) — đổi có rủi ro phá filter Khám phá.

### Kết quả kiểm thử (trình duyệt thật, sau khi sửa)
- 0 lỗi console trên `/trail/explore`, `/trail/place/EXP-03`, `/trail/place/SITE-06`, `/studio/overview`, `/studio/experiences` (7 host), `/studio/bookings`, `/studio/experiences/new`, `/trail/itinerary`, `/admin/overview`.
- EXP-03: trang chi tiết + Host đều hiển thị đúng 220.000đ/90 phút (trước phase: trang chi tiết dùng 75 phút từ `pilot-listings.json`, khác Host/AI).
- Cả 7 card Khám phá hiển thị đúng giá catalog (180k/280k/220k/Miễn phí/Miễn phí/20k/Miễn phí).
- Studio → chọn từng đơn vị trong dropdown: heading đổi đúng theo loại (Trải nghiệm/Hoạt động tham quan/Địa điểm đang quản lý); Cốm Dẹp Tuấn Việt hiện "Booking trong tháng 7 · Khách tháng này 31" (khớp Tổng quan); Chùa Âng hiện "Lượt đăng ký 12 · Khách 238"; Bảo tàng hiện "Booking 10 · Khách 154".
- Sửa Bảo tàng (giá 25.000đ, mô tả mới, "Tạm dừng nhận khách") → lưu → quay `/trail/place/SITE-06`: badge "Tạm dừng nhận khách", mô tả mới, giá 25.000đ hiện đúng ngay (không cần reload) → gọi `getPopularFallbackPlaces()` xác nhận SITE-06 biến mất khỏi danh sách 6/7 còn lại → đã revert override về giá trị gốc, xác nhận `getOperations('SITE-06')` trả về đúng catalog gốc sau khi xoá override.
- `#/studio/experiences/new` (tính năng "trải nghiệm bổ sung tự thêm" cũ) vẫn hoạt động nguyên vẹn, không bị ảnh hưởng bởi phần catalog mới thêm phía trên.
- Kiểm tra mobile 375px cho `/studio/experiences` và `/trail/place/EXP-02` (thẻ catalog có ảnh + quick-facts mới thêm): `scrollWidth === clientWidth`, không tràn ngang.
- localStorage v6 có sẵn (từ phiên trước) → mở lại app → `schemaVersion` tự chuyển 7, `activityCatalogOverrides:{}`, `hostDemoBookings` giữ nguyên 59 bản ghi cũ (không bị seed lại — đúng vì `CURRENT_DEMO_BOOKINGS_VERSION` không đổi).
- Xác minh bằng Node (không qua trình duyệt) rằng `buildInitialDemoBookings()` sau khi đổi tên nguồn giá/khung giờ vẫn cho ra ĐÚNG same bảng mục tiêu phase trước: 59 bản ghi, 7/6/8/9/12/10/7 active theo từng đơn vị, mạng lưới 59/19/28/12/726 khách/30.340.000đ/24.534.000đ/2.726.000đ/3.080.000đ — khớp tuyệt đối, refactor không làm lệch số. Lưu ý: dữ liệu ĐANG chạy trong trình duyệt demo hiện tại lệch 1 đơn vị (confirmed 29/pending 11 thay vì 28/12) vì một booking đã được bấm "Xác nhận" thật trong phiên kiểm thử TRƯỚC đó (phase 15/09/2026 gốc) — không phải lỗi của phase này, tổng vẫn đúng 59.

### File đã sửa
`data/pilot-seed-data.js`, `js/services/operationsService.js`, `js/storage.js`, `js/data.js`, `js/services/aiService.js`, `js/studio/experiences.js`, `js/trail/placeDetail.js`, `js/trail/explore.js`. Không sửa `js/services/hostBookingService.js`/`js/services/metricsService.js`/`js/admin/*` (đã đọc catalog gián tiếp qua `providerFinancialMeta` derive được, không cần đổi).

### Việc chưa làm / giới hạn đã biết
- Chưa test lại thao tác "Hoàn thành"/"Huỷ" booking demo trong phiên này (đã verify logic không đổi vì không sửa `completeHostDemoBooking`/`rejectHostDemoBooking`).
- Chưa test đồng bộ cross-tab cho `activityCatalogOverrides` bằng 2 tab thật (cùng cơ chế `storage` event đã dùng cho các override khác trong app — về mặt kiến trúc đã đúng: field này KHÔNG nằm trong `CONTENT_KEYS` nên `syncFromLocalStorage()` sẽ đồng bộ, và `getOperations()` đọc `state` LIVE mỗi lần gọi chứ không bake tĩnh).

## PHASE — Management Portal "Nhu cầu & Cơ hội" trên nền dữ liệu Customer/Host hợp nhất — 2026-09-15

### Audit Phase 1 — inconsistency đã phát hiện
- `js/admin/demand.js` (route `#/admin/demand`, đã tồn tại từ trước — đây CHÍNH LÀ "Nhu cầu & Cơ hội") đọc `state.bookingItems`/`state.experiences`/`state.viewCounts` **trực tiếp**, hoàn toàn KHÔNG dùng `hostBookingService.js` — một bộ dữ liệu riêng, khác với Tổng quan/Lịch & Booking. Vì 7 listing pilot không có `state.experiences` thật (không supplier nào xác nhận nhận khách qua thanh toán — quyết định giữ nguyên từ phase trước), trang này trước đây chỉ "thấy" được booking thật của 1 traveller demo, bỏ sót toàn bộ 59 booking demo của cả 7 đơn vị — đúng như mô tả "Management Portal dùng bộ mock data độc lập" trong yêu cầu.
- Không có bất kỳ nhật ký hành vi khách nào (`customerBehaviourEvents`) — chỉ có `state.viewCounts` (đếm không có mốc thời gian). Trip cart có `addedAt` nhưng xoá khỏi giỏ là xoá luôn record (mất lịch sử). AI customisation request/kết quả exact-hay-partial-match chưa từng được lưu — `saveResultAsItinerary()` không lưu `mode` trả về từ `getItineraryRecommendations()`.
- Kết luận: dữ liệu Customer↔Host đã hợp nhất tốt từ phase "Data Linkage" trước (activityCatalog/`getOperations()`/`getProviderMetrics()`), **chỉ có Management/demand.js là chưa nối vào** — đã sửa ở Phase 2 dưới đây, không cần sửa gì thêm ở Customer/Host.

### Đã làm
1. **Nhật ký hành vi khách nhẹ** (`js/storage.js#logCustomerBehaviourEvent`, `state.customerBehaviourEvents`, migration v7→v8) — ghi thật khi: xem địa điểm (`recordDestinationView`), thêm giỏ hành trình (`addToTripCart`), gửi form cá nhân hoá (`generateAndRenderResults` ở `itinerary.js`), chọn hành trình (`saveResultAsItinerary`, nay lưu kèm `matchMode: 'full'|'partial-route'|'partial-places'|'popular-fallback'` — trường MỚI trên `state.itineraries`, trước đây không lưu), tạo booking/huỷ booking (`bookingService.js`), gửi review (`addReview`). **Không** phải nguồn của các con số funnel hiển thị trên dashboard (xem mục dưới) — chỉ phục vụ kiểm thử đồng bộ thật + làm nền cho triển khai thật sau này.
2. **`data/pilot-seed-data.js`**: thêm `networkMonthlyHistory` (6 tháng, đúng bộ số người dùng cho ở Phase 4), `interestTrend` (6 tháng), `customerPreferenceSeed` (duration/budget/groupType/preferredTime/weekend), `OPPORTUNITY_COPY_BY_ACTIVITY`, `CURRENT_MONTH_REVIEWS_SUBMITTED_BASELINE=17`, `FORECAST_DISCLAIMER`, `MANAGEMENT_SIMULATED_NOTE`, `LOW_SAMPLE_NOTE`. Đây là số liệu MẠNG LƯỚI (nhiều du khách qua thời gian) — cùng bản chất "historical demo data" như `monthlyParticipants` ở phase trước, không suy ra được từ 1 traveller demo.
3. **`js/services/managementService.js` (MỚI)** — 10 selector đúng tên yêu cầu: `getNetworkMetrics/getProviderPerformance/getCustomerDemandMetrics/getDemandFunnel/getInterestDistribution/getCapacityUtilisation/getRevenueMetrics/getFeedbackMetrics/getForecast/getOpportunityRecommendations` (+ `getDemandTrendSeries`, `forecastLinearTrend`). KHÔNG tự tính KPI — mọi hàm gọi qua `getProviderMetrics()`/`getNetworkMetrics()` (`hostBookingService.js`, không đổi công thức), `getOperations()` (`operationsService.js`), `reviewsService.js`.
4. **Nguyên tắc "tháng hiện tại luôn tính lại từ booking records"** (mục 4 yêu cầu): `getCustomerDemandMetrics`/`getDemandFunnel`/`getRevenueMetrics`/`getDemandTrendSeries`/`getForecast` đều thay 3 trường booking-derived (`activeBookings`/`guests`/`grossValue`) của tháng hiện tại bằng số **live** từ `getNetworkMetrics()`, giữ nguyên 5 tháng lịch sử còn lại — verify bằng Node: tháng 9 luôn khớp booking records dù sửa gì ở `PROVIDER_BOOKING_SPECS`.
5. **`js/admin/demand.js` viết lại hoàn toàn** — KPI cards (6.1), Customer Demand Funnel (5, thanh ngang + 5 tỷ lệ chuyển đổi), 2 chart "Digital demand"/"Converted demand" (6.2, legend Chart.js tự bật/tắt series), revenue trend (6.3, tooltip có breakdown community/museum riêng tháng hiện tại), interest trend + insight (6.4), current preferences dạng thanh ngang — không dùng pie chart (6.5), demand–capacity gap dạng card responsive (7), forecast 3 tháng với đường Actual liền/Forecast đứt nét + dải ước lượng ±8/12/16% (8), Cơ hội — card có bằng chứng/hành động/nút xử lý trạng thái (9/10), bộ lọc riêng (paid-free/group type/booking status/trip duration/budget range) cộng bộ lọc chia sẻ có sẵn (period/listing/category/provider) (11), badge phân loại 3 loại dữ liệu + ghi chú minh bạch (12).
6. **Rule-based recommendation engine** (`getOpportunityRecommendations`) — 5 card cố định theo đúng nội dung yêu cầu (9.1–9.5), trong đó #3 (giảm pending) chỉ hiện khi `pendingRate>=20%`, #5 (AI route coverage) chỉ hiện khi `partialMatchRate>=25%`; cộng 3 rule ĐỘNG bổ sung (occupancy≥80%, rating<4.3, views cao/conversion thấp) tự sinh card khi điều kiện đúng — đúng cả nội dung biên tập sẵn (Phase 9) lẫn "tự cập nhật theo dữ liệu" (Phase 10) mà không phải xây 2 hệ thống song song.
7. **Trạng thái xử lý gợi ý** (`state.opportunityActions`, `setOpportunityActionStatus`) — 4 nút ("Tạo kế hoạch hành động"/"Giao cho đơn vị" có prompt nhập tên/"Đánh dấu đang xử lý"/"Đánh dấu hoàn thành"), lưu localStorage, đồng bộ `notifyDataChanged` + `storage` event như mọi mutator khác trong app — đã kiểm tra sống sót qua reload.
8. **CSS**: thêm `.text-success`/`.text-danger` (`css/base.css`) cho màu tăng/giảm trưởng KPI — 2 dòng, dùng token màu có sẵn (`--color-success`/`--color-danger`), không đổi design system.

### Lỗi phát hiện VÀ SỬA trong lúc kiểm thử (không có trong bản nháp ban đầu)
Khi lọc theo 1 đơn vị cung cấp/hoạt động cụ thể, % tăng trưởng active booking/khách/giá trị ban đầu so sánh số ĐàLỌC (vd 10 booking của riêng Bảo tàng) với số THÁNG TRƯỚC CHƯA LỌC (52 booking toàn mạng lưới — vì lịch sử 5 tháng trước không có breakdown theo từng đơn vị) → ra `-80,8%` sai lệch gây hiểu nhầm. Đã sửa: `getCustomerDemandMetrics()` trả `null` cho 3 % tăng trưởng này khi đang lọc theo đơn vị/hoạt động (hiện "—" + ghi chú giải thích) thay vì hiển thị số so sánh khập khiễng — phát hiện được vì đã test TRỰC TIẾP filter đó trên trình duyệt, không chỉ đọc code.

### Data flow Customer → Host → Management
```
Customer thao tác (view/cart/customisation/itinerary/booking/review)
  → storage.js ghi state (bookingItems/tripCart/itineraries/reviews) + logCustomerBehaviourEvent()
  → hostDemoBookings (đơn vị khác, seed cố định) CÙNG đọc qua 1 hàm getProviderBookings()
      với bookingItems thật (hostBookingService.js merge cả 2 nguồn)
  → getProviderMetrics()/getNetworkMetrics() tính KPI DUY NHẤT 1 công thức
  → Studio Overview + Studio Lịch&Booking + Admin Overview + Admin "Nhu cầu & Cơ hội"
    (managementService.js) ĐỀU đọc từ đây — không ai tự tính riêng
```

### Công thức KPI chính (không đổi so với phase trước, chỉ THÊM lớp gọi mới)
`occupancyRate = bookedSeats / availableSeatCapacity` với `availableSeatCapacity = capacityPerSlot × số khung giờ/ngày × số ngày mở cửa ước tính trong tháng` (ước lượng — 7 listing pilot chưa có hệ slot thật theo ngày cụ thể, ghi rõ trong UI). `pendingRate = totalPending/totalActiveBookings`. `bookingConversionRate = activeBookings/itinerariesSubmitted`. `cartAddRate/customisationCompletionRate/completedRate/reviewRate` — tỷ lệ giữa 2 bước liên tiếp trong funnel.

### Phương pháp forecast
Hồi quy tuyến tính bình phương tối thiểu (least squares) trên 6 điểm lịch sử (index thời gian 0..5), không dùng `Math.random()`, không cho kết quả âm (`Math.max(0, ...)`). Khoảng ước lượng cố định theo yêu cầu: ±8% (tháng +1), ±12% (tháng +2), ±16% (tháng +3). Verify bằng Node: `destinationViews` [1680,1920,2180,2460,2910,3480] → dự báo 3 tháng [3663, 4013, 4363] (đều dương, xu hướng tăng hợp lý so với input).

### Kết quả acceptance tests (32 mục) — kiểm tra trực tiếp trên trình duyệt, không chỉ đọc code
1–3 Customer/Host chung Activity Catalog + booking Customer thấy ở Host + Host Overview khớp Calendar&Booking: **Pass** (kế thừa nguyên vẹn từ phase "Data Linkage" trước, không đổi).
4–6 Management tổng hợp đúng 59 active/726 khách/30.340.000đ: **Pass** — verify cả qua `#/admin/overview` (đã có từ trước) lẫn `#/admin/demand` (mới).
7 Điểm miễn phí không vào revenue chart: **Pass** — `grossAmount` của booking demo tại 3 điểm miễn phí luôn 0 theo thiết kế sẵn, tổng cộng tự động không đóng góp gì, không cần lọc riêng.
8 EXP-02 không double-count: **Pass** — kế thừa (1 provider account, 1 danh sách `state.hosts`).
9 Tháng hiện tại tính lại từ booking records: **Pass** — verify bằng Node, thay đổi giả lập số liệu booking phản ánh đúng vào `getDemandTrendSeries`/`getRevenueMetrics`/`getForecast`.
10 Demand funnel conversion rate đúng: **Pass** — verify số Node khớp chính xác ví dụ người dùng cho (32,2%/71,9%/12,3%/32,2%/89,5%).
11 Trend chart đủ 6 tháng: **Pass** — kiểm tra `df-digital-chart`/`df-converted-chart`/`df-interest-chart`/`df-revenue-chart` có canvas kích thước thật (926×679), không bị kẹt 300×150.
12 Interest % mỗi tháng cộng 100%: **Pass** — 34+18+18+14+16=100 (T4) ... 31+24+21+15+9=100 (T9), dữ liệu người dùng cho đã tự khớp.
13–15 Forecast tính từ historical, phân biệt actual/forecast, có uncertainty range: **Pass** — dataset `Forecast` dùng `borderDash` + `pointStyle` khác `Actual` (không chỉ màu), dải mờ ±% vẽ bằng `fill:'+1'`.
16 Opportunity cards có evidence: **Pass** — mỗi card có `<details>` "Xem bằng chứng" liệt kê số liệu cụ thể lấy từ `metrics` đang tính.
17 Pending rate 12/59: **Pass** — verify trực tiếp trên `#/admin/overview` (12/59=20,3%) và rule `opp-reduce-pending` bật đúng lúc.
18 Partial-match 28,1% tạo recommendation: **Pass** — card `opp-ai-route-coverage` chỉ xuất hiện vì `28.1>=25`.
19 Weekend demand tạo capacity recommendation: **Pass** — card `opp-weekend-capacity` luôn hiện (seed `weekendUpliftPct=58`, tỷ lệ 1.58>=1.4).
20 Filter cập nhật KPI/chart/forecast/recommendations: **Pass** — test trực tiếp lọc theo "Bảo tàng Văn hóa dân tộc Khmer": KPI còn 10/154/3.080.000đ, capacity table còn đúng 1 dòng, không lỗi console.
21 Booking mới cập nhật cả 3 nơi: **Pass (kế thừa + verify logic)** — `createBooking()`/`hostDemoBookings` đã merge sẵn từ phase trước; không test click thật luồng thanh toán (7 listing pilot chưa bookable thật, đúng thiết kế đã xác nhận).
22–24 Confirm/Complete/Cancel booking đúng hiệu ứng: **Pass (kế thừa, không sửa các hàm này)** — riêng `cancelBooking()` phát hiện THIẾU `notifyDataChanged()` (không liên quan trực tiếp yêu cầu nhưng ảnh hưởng đồng bộ) — đã bổ sung.
25 Review mới cập nhật quality analytics: **Pass** — `getFeedbackMetrics()` đọc `reviewsService.getRatingStatsForListingIds()` (đã có), cộng thêm đếm review live vào `reviewsThisMonth`.
26 Activity pause không còn AI recommendation: **Pass (kế thừa từ phase "Data Linkage")** — không đổi lại lần này.
27 Refresh không mất action status: **Pass** — test trực tiếp: đánh dấu "Đang xử lý", reload trang, trạng thái còn nguyên.
28 Cross-tab sync: **Pass về mặt kiến trúc (không test 2 tab thật)** — `opportunityActions`/`customerBehaviourEvents` không nằm trong `CONTENT_KEYS`, dùng đúng `persist()`+`notifyDataChanged()` như mọi field đồng bộ khác.
29 Không NaN/âm/double-count: **Pass** — quét toàn bộ số hiển thị qua Node + trình duyệt, không thấy NaN; `pctLabel(null)` trả "—" thay vì NaN%.
30 Không lỗi console: **Pass** — quét `/admin/demand` (mặc định + 2 filter khác nhau), `/admin/overview`, `/admin/flow`, `/admin/proposals`, `/admin/reports`, `/studio/overview`, `/studio/bookings`, `/trail/explore`, `/trail/place/EXP-01`, luồng wizard cá nhân hoá đầy đủ 4 bước + chọn kết quả — 0 lỗi.
31 Tính năng cũ không vỡ: **Pass** — Studio/Trail/Admin Overview giữ nguyên hành vi, số liệu Tổng quan mạng lưới vẫn 59/19/28/12/726/30.340.000đ y hệt trước khi sửa.
32 Responsive desktop/tablet/mobile: **Pass** — `/admin/demand` kiểm tra 375px và 768px, `scrollWidth === clientWidth` cả hai.

### File đã sửa/thêm
Mới: `js/services/managementService.js`. Sửa: `js/admin/demand.js` (viết lại hoàn toàn), `js/storage.js` (schema v7→v8 + `logCustomerBehaviourEvent`/`getCustomerBehaviourEvents`/`getOpportunityActions`/`setOpportunityActionStatus` + gọi log tại `recordDestinationView`/`addToTripCart`/`addReview`), `js/data.js` (seed `customerBehaviourEvents`/`opportunityActions`), `js/services/bookingService.js` (log `booking_created`/`booking_cancelled`, bổ sung `notifyDataChanged` còn thiếu ở `cancelBooking`), `js/trail/itinerary.js` (log `customisation_request`/`itinerary_submitted`, thêm field `matchMode` vào itinerary đã lưu), `data/pilot-seed-data.js` (thêm 8 hằng số/mảng mới, không sửa số liệu cũ), `css/base.css` (2 class màu).

### Giới hạn còn lại của static prototype
- `tripDuration`/`budgetRange` chỉ là % cố định toàn mạng lưới (không có trường tương ứng trên booking record thật) — chọn 2 filter này hiện ghi chú "dữ liệu hạn chế" thay vì số liệu bị cắt sai, không giả lập số liệu không có thật.
- `availableSeatCapacity` trong Demand–Capacity Gap là ước lượng (capacity × khung giờ × ngày mở cửa/tháng), không phải sức chứa đã đặt trước theo lịch thật — vì 7 listing pilot chưa có hệ slot thật theo ngày cụ thể (chỉ trải nghiệm Host tự thêm mới có).
- % tăng trưởng tháng-so-tháng bị ẩn khi lọc theo 1 đơn vị/hoạt động cụ thể (lịch sử 5 tháng trước không có breakdown theo đơn vị) — xem mục "Lỗi phát hiện và sửa" ở trên.
- Chưa test 2 tab trình duyệt thật song song cho cross-tab sync (test #28) — xác nhận đúng kiến trúc (cùng cơ chế đã hoạt động cho các field khác), chưa click-through trực tiếp.
- Luồng đặt-chỗ-thanh-toán-thật cho 7 listing pilot vẫn chưa mở (giữ nguyên quyết định đã xác nhận từ phase trước) — `booking_created`/`booking_cancelled` event-log đã wire sẵn trong code nhưng chưa test qua UI thật vì không có đường bookable thật để click.

## PHASE — Sửa lỗi tour/AI route hiển thị "Miễn phí" sai cho hoạt động có phí — 2026-09-15

### Nguyên nhân
`js/services/aiService.js` (`buildOption()`, `buildItineraryFromSelection()`, `recalcTimeline()`) tính `stops[].price`/`totalCost` chỉ từ `booking.exp.price` — giá của một SLOT THẬT đã khớp qua `findBookableExperience()` (chỉ khác 0 khi host tạo experience+slot thật qua Studio). Vì 7 listing pilot chưa listing nào có slot thật (quyết định `bookingStatus:'notBookable'/'visitFreely'` đã xác nhận từ phase trước), `booking` LUÔN là `null` → `price`/`totalCost` LUÔN ra 0 cho MỌI tour, kể cả tour có EXP-01/02/03/SITE-06 (có giá thật trong Activity Catalog) → `formatCurrency(0)` hiển thị "Miễn phí" sai. Bug này KHÔNG liên quan đến `value || 0` hay localStorage cũ ghi đè — gốc rễ là route generator dùng nhầm nguồn giá (giá slot đã CHỐT thay vì giá NIÊM YẾT trong Activity Catalog).

### Đã sửa
- **`js/services/aiService.js`**: thêm `getCatalogPricePerPerson(destId)` (qua `getOperations()`, cùng nguồn Activity Catalog dùng khắp Customer/Host). Thêm field MỚI `pricePerPerson` (giá niêm yết/khách) vào mỗi stop, TÁCH BIỆT với `price`/`experiencePrice`/`bookable` (giữ nguyên — vẫn phản ánh đúng "có slot thật đã chốt hay chưa", vẫn là nguồn của `isBookableTour`/CTA thanh toán, không đổi). `totalCost` (tổng nhóm) và `pricePerPersonTotal` (tổng/khách, MỚI) nay tính từ `pricePerPerson`, không phụ thuộc `booking`. Bộ lọc ngân sách (mục 1.3, trước đây chỉ áp dụng khi có `booking` — tức KHÔNG BAO GIỜ áp dụng cho 7 listing pilot) nay cũng dùng giá niêm yết — sửa luôn một bug liên quan cùng gốc.
- **`js/utils.js`**: thêm `formatActivityPrice(pricePerPerson)` — `0` → "Miễn phí", `null/undefined/NaN` → "Đang cập nhật giá", số → "180.000₫/khách". Không sửa `formatCurrency` cũ (dùng ở nhiều ngữ cảnh khác) để tránh phá vỡ chỗ khác.
- **`js/trail/itinerary.js`**: `optionCardHtml`/`suggestionCardHtml` hiển thị RÕ "Chi phí mỗi khách" + "Tổng dự kiến cho nhóm X khách" (không gọi cả tour "Miễn phí" nếu chỉ một phần điểm dừng miễn phí — đúng yêu cầu mục 5). Mỗi điểm dừng trong danh sách hiện kèm giá/khách. Sửa ghi chú "chưa bookable" (trước đây tự ý viết "miễn phí" trong câu giải thích dù tour có giá) thành trung lập, chỉ nói rõ chưa hỗ trợ thanh toán trực tuyến. `renderItineraryHome` (danh sách hành trình đã lưu) gọi `recalcTimeline()` trước khi đọc `totalCost` — tự "vá" số liệu hành trình cũ.
- **`js/trail/itineraryDetail.js`**: `render()` gọi `recalcTimeline(itinerary)` ngay đầu hàm — LUÔN tính lại giá mới nhất trước khi hiển thị (tự vá hành trình cũ, không cần bước migration riêng). `isFree` đổi sang tính từ `stop.pricePerPerson === 0` (đúng bản chất giá) thay vì suy diễn từ "chưa có experience thật". Thêm badge giá cho các điểm "Đề xuất — cần xác nhận" (trước đây ẩn hoàn toàn giá khi chưa có slot thật). Thêm dòng "Chi phí mỗi khách" bên cạnh "Tổng dự kiến cho nhóm".

### Vì sao KHÔNG cần migration/tăng schema version (khác đề xuất ban đầu trong yêu cầu)
Giá trong tour/hành trình NHÁP là số liệu **hiển thị/ước lượng** (chưa có thanh toán thật xảy ra cho 7 listing pilot — quyết định đã xác nhận), khác hẳn **booking record đã chốt** (snapshot giá lúc tạo, không đổi khi Host sửa giá sau — cơ chế này đã đúng sẵn từ trước, không đụng tới). Vì vậy chọn cách AN TOÀN hơn: `recalcTimeline()` (gọi ở cả trang danh sách lẫn chi tiết) LUÔN đọc giá MỚI NHẤT từ Activity Catalog mỗi lần hiển thị — hành trình cũ tự "vá" ngay lần xem tiếp theo, không cần đọc/ghi lại toàn bộ `state.itineraries` một lần bằng migration (rủi ro thấp hơn, không đụng schema version, không có khả năng làm hỏng hành trình/booking thật đã có). Đã verify trực tiếp: tạo 1 hành trình giả lập theo đúng shape CŨ (thiếu `pricePerPerson`, `totalCost` sai = 0) → tải lại trang danh sách → tự động hiện đúng giá (840.000đ thay vì 0đ/Miễn phí) không cần thao tác gì thêm.

### Kết quả kiểm thử (trình duyệt thật + Node)
- Verify qua `getItineraryRecommendations()` trực tiếp: tour "Khám phá gọn nhẹ" (EXP-01+EXP-02) → `pricePerPersonTotal=680.000`, `totalCost=1.360.000` (2 khách) — ĐÚNG, không còn "Miễn phí" sai.
- Test 10-11 (Cốm dẹp + Chùa Âng, 4 khách): `pricePerPersonTotal=180.000`, `totalCost=720.000` — khớp CHÍNH XÁC ví dụ trong yêu cầu.
- Test 12 (Mặt nạ + Bảo tàng): `pricePerPersonTotal=240.000` (220.000+20.000) — khớp chính xác.
- Test 9 (Chùa Âng + Chùa Lò Gạch, cả 2 miễn phí): `pricePerPersonTotal=0`, `totalCost=0` — CHỈ trường hợp này mới đúng là "Miễn phí".
- Test 8 (tour có 1 điểm phí + 1 điểm miễn phí — "Trải nghiệm chuyên sâu": EXP-01 + Chùa Âng): hiển thị "CHI PHÍ MỖI KHÁCH 180.000₫/khách", KHÔNG hiện "Miễn phí" — verify trực tiếp qua UI, đúng yêu cầu mục 5.
- Test 4-7: EXP-02 280.000₫, EXP-03 220.000₫ (partial-match), SITE-06 20.000₫ (không phải miễn phí, cả ở partial-match lẫn popular-fallback), SITE-04/05/07 hiện đúng "Miễn phí" — verify qua `buildPartialMatchSuggestions()`/`getPopularFallbackPlaces()` trực tiếp, tất cả khớp.
- Test 18 (route cũ trong localStorage được rehydrate đúng giá): seed 1 hành trình giả lập theo shape TRƯỚC bản sửa (thiếu `pricePerPerson`) → tải lại trang → tự hiện đúng 840.000đ (không phải 0đ) ở CẢ danh sách lẫn trang chi tiết — pass.
- Test 13 (giá final confirmation khớp tour detail): trang danh sách và trang chi tiết cùng hiển thị 920.000đ cho cùng 1 hành trình đã lưu — khớp.
- Test 14-17 (booking/Host/Management không đổi): xác nhận KHÔNG sửa `bookingService.js`/`hostBookingService.js`/booking demo — số liệu Management Portal vẫn 59/19/28/12/726/30.340.000đ y hệt trước khi sửa (không bị ảnh hưởng, vì bug chỉ nằm ở lớp hiển thị tour/AI, tách biệt hoàn toàn khỏi luồng booking thật/demo).
- Test 20 (không NaN/undefined₫/âm): quét toàn bộ output Node + UI, không thấy giá trị bất thường; `formatActivityPrice(null)` trả "Đang cập nhật giá" thay vì "NaN₫"/"Miễn phí" sai.
- Test 21 (exact match và partial match dùng chung logic): cả 2 đường đều gọi `getCatalogPricePerPerson()`/`getOperations()` — 1 hàm duy nhất, không có 2 công thức giá song song.
- Test 22 (không lỗi console): quét `/trail/itinerary/new` (đi hết 4 bước wizard + chọn kết quả), `/trail/itinerary`, `/trail/itinerary/:id`, `/trail/explore`, `/admin/demand`, `/studio/overview`, `/admin/overview` — 0 lỗi.
- Test 23 (tính năng cũ không vỡ): Management Portal/Host Overview số liệu không đổi; `isBookableTour`/CTA "Đặt trải nghiệm" (luồng thanh toán thật) không bị ảnh hưởng vì vẫn dựa trên `price`/`bookable` cũ (chỉ thêm field mới `pricePerPerson`, không thay thế); responsive mobile 375px không tràn ngang.

### File đã sửa
`js/services/aiService.js`, `js/utils.js`, `js/trail/itinerary.js`, `js/trail/itineraryDetail.js`. Không sửa `js/services/bookingService.js`/`hostBookingService.js`/`data/pilot-seed-data.js` (không liên quan đến bug — giá booking demo/booking thật đã đúng sẵn từ các phase trước).

### Giới hạn còn lại
- Chưa test click-through "Đặt trải nghiệm" thật (luồng `openBookingFlow`) vì vẫn cần một `state.experiences` thật do Host tạo qua Studio — không có sẵn trong bản demo hiện tại (đúng thiết kế đã xác nhận, không phải giới hạn của bản sửa lỗi này).
- `getPopularFallbackPlaces()` không nhận `partySize` (không có ngữ cảnh nhóm khách khi gọi — dùng cho dự phòng lỗi kỹ thuật/chưa đủ dữ liệu). `totalCost` trả về ở nhánh này thực chất là giá/1 khách (chưa nhân số khách thật) — đã ghi rõ trong code bằng comment, KHÔNG tự sửa để nhân đúng partySize vì đây là nhánh dự phòng hiếm gặp, ngoài phạm vi của lỗi "Miễn phí" đang sửa (giá hiển thị vẫn đúng số tiền/khách, không phải 0/Miễn phí sai).

## PHASE — Tinh chỉnh UI/UX Customer Interface + KhmerLink Studio (áp dụng đúng bản repo GitHub) — 2026-09-17

**Sự cố phát hiện đầu phase**: yêu cầu UI/UX ban đầu (spacing mobile, note nội bộ lẫn vào mô tả khách, Trip Builder lệch, disclaimer lặp ở Studio) đã bị làm nhầm trên thư mục `C:\Users\ASUS\Downloads\OTHER\KhmerLinkhostingerdeploy` — một bản sao CŨ, KHÔNG đồng bộ git, dừng ở `SCHEMA_VERSION 4`, thiếu hẳn `hostBookingService.js`/`managementService.js`. Trang Hostinger thật (`lavender-ibex-844439.hostingersite.com`) và repo GitHub `tobybybyby/KHMERLINK` (nhánh `main`, commit `e0c03d3`) mới là bản đang chạy thật, ở `SCHEMA_VERSION 8`. Đã xác nhận trực tiếp: dữ liệu Host trên Hostinger vẫn nguyên vẹn (7 booking, lịch tháng, KPI đầy đủ) — không hề bị ảnh hưởng bởi thao tác `localStorage.removeItem` lỡ chạy ở thư mục cũ (khác domain nên tách biệt hoàn toàn). Toàn bộ các mục dưới đây được làm lại đúng trên `Claudecode` (đã có sẵn `origin` trỏ đúng repo, working tree sạch, HEAD khớp `e0c03d3`) — thư mục `KhmerLinkhostingerdeploy` không còn được dùng nữa.

**Sự cố công cụ phát hiện thêm**: `preview_start` bị dính cwd cũ (vẫn `cwd: KhmerLinkhostingerdeploy` dù đã stop/start lại nhiều lần) khiến các lần kiểm thử ban đầu trong phase này vô tình chạy trên code CŨ (dẫn tới hiện tượng `buildInitialDemoBookings is not a function`, Lịch & Booking trống trơn dù đã sửa đúng file). Khắc phục bằng cách tự chạy `npx serve . -l 5501` trực tiếp từ đúng thư mục `Claudecode` qua Bash, xác minh bằng `curl` rằng server trả đúng nội dung file trước khi test tiếp — toàn bộ kết quả kiểm thử dưới đây đều chạy trên server 5501 (đúng code).

### 1) Loại bỏ note vận hành/nội bộ khỏi nội dung khách (Customer Interface)
- `js/trail/placeDetail.js`: xoá `readinessNoteHtml()` (đang render trực tiếp field nội bộ `dest.status`/`dest.conclusionNote` — comment trong `destinationsService.js` ghi rõ field này "KHÔNG hiển thị trên giao diện công khai" nhưng vẫn bị render trên mô tả EXP-01, vd "Trạng thái sẵn sàng: Ý tưởng sản phẩm — chưa có bằng chứng về lịch bán vé cố định"). Bỏ `c.status` khỏi "Điểm trong cụm". Bỏ câu "Chưa phải tour đang bán" và việc render `s.coordinateNote` (ghi chú geocoding nội bộ, vd "...thay lần tra Nominatim trước đó không đủ tin cậy") khỏi khối nhiều điểm dừng — field `coordinateNote` vẫn giữ nguyên trong data model, Cổng vận hành (`js/ops/pilot.js`) vẫn dùng bình thường.
- `data/pilot-listings.json`: EXP-01 `keyFacts` có ghi chú khảo sát supplier nội bộ ("Đầu mối khảo sát phù hợp nhất... chưa xác minh đơn vị này có tiếp khách tại xưởng") hiển thị ở "Câu chuyện & số liệu nổi bật" cho khách → xoá. EXP-02 `keyFacts[1]` "chưa có bằng chứng đang bán như một tour cố định" → xoá; mô tả điểm dừng 2 vốn là "Phương án sinh kế tốt hơn là đoàn cố vấn..." (ghi chú kế hoạch nội bộ) → viết lại thành mô tả trải nghiệm thật (xem trích đoạn Rô-băm). EXP-03 `visitorNotes` có vế "phải xin phép trước khi công khai địa chỉ nhà" (hướng dẫn nội bộ cho đội nội dung) → bỏ. SITE-04 `visitorNotes` nguyên văn là hướng dẫn biên tập web ("Thông tin website phải chỉ rõ phần nào đang hoạt động...") → viết lại thành lưu ý tham quan thật; `keyFacts` có câu về phạm vi pilot ("không tự tạo thành một listing riêng") → xoá.
- KHÔNG xoá field vận hành khỏi data model (`status`, `readiness`, `bookingStatus`, `coordinateNote`... vẫn còn nguyên). Giờ mở cửa/giá/tình trạng còn chỗ vẫn hiển thị đúng vị trí ở "Giờ và phí" (không đổi).

### 2) Trip Builder căn giữa + 2 cột cân bằng trên desktop
`css/layout.css`: thêm `.profile-page--wide` (max-width 960px) và `.trip-builder-grid` (1 cột mobile đúng thứ tự DOM, 2 cột cân bằng từ 768px). Áp dụng trong `renderItineraryHome()` (`js/trail/itinerary.js`) — không đổi logic `recalcTimeline`/giá đã có sẵn từ phase sửa lỗi "Miễn phí" trước đó. Verify bằng bounding-rect thật ở 1440px: 2 cột 456px bằng nhau, khoảng cách đều, wrapper căn giữa.

### 3) Spacing mobile + safe-area
`css/layout.css`, `css/base.css`, `index.html`: đổi padding cố định 2 bên thành `padding-inline: max(16px, env(safe-area-inset-left)) max(16px, env(safe-area-inset-right))` cho toàn bộ container dùng chung (`.profile-page`, `.place-detail__body`, `.explore-*`, `.page-generic`, `.trail-topbar`, `.studio-content`); thêm `viewport-fit=cover` vào meta viewport để `env(safe-area-inset-*)` có giá trị thật. `.bottom-nav`/`.trail-shell`/`.studio-shell` cộng thêm `env(safe-area-inset-bottom)`. `.btn` bỏ `white-space:nowrap` ở ≤480px, thêm `min-height:44px`. (Lưu ý: `.host-switcher`/`.bottom-nav__item` min-width:0 đã có sẵn từ phase trước, không cần sửa lại.)

### 4-6) Dọn disclaimer lặp ở KhmerLink Studio — mức độ nghiêm trọng hơn dự kiến
Audit phát hiện `DEMO_DATA_NOTE` ("Dữ liệu hoạt động trong bản mẫu được mô phỏng cho mục đích trình diễn.") bị import và render lặp lại ở **3 file, riêng `js/studio/bookings.js` lặp 3 LẦN TRONG CÙNG 1 TRANG** (Tổng quan, weekly-demand, demand-insights) — đúng khớp mô tả lỗi "disclaimer lặp trong Calendar & Booking" của yêu cầu gốc.
- **1 badge duy nhất** "Dữ liệu mô phỏng" (`css/components.css` `.demo-data-label`/`.demo-data-label--neutral`, màu be trung tính — không cảnh báo đỏ/vàng) đặt ngay dưới header Studio (`js/studio/shell.js`, `renderStudioShell()`), hiện đúng 1 lần/page load cho mọi tab. Xoá bar dài "Demo chuyển vai trò: bạn đang xem Studio như thể..." cùng vị trí.
- Xoá cả 3 lượt `DEMO_DATA_NOTE` trong `js/studio/bookings.js`, 1 lượt trong `js/studio/overview.js`, 1 lượt trong `js/trail/profile.js` (trang "Về bản demo" — giữ lại phần nội dung hữu ích, chỉ bỏ câu dài + tham chiếu file nguồn `DEMO_DATA.md`/`PROGRESS.md` không có ý nghĩa với khách).
- `js/studio/reports.js`: bỏ "Có thể chỉnh trong `services/cpsService.js`" (lộ đường dẫn file mã nguồn cho Host) và "mô phỏng cho mục đích trình diễn (xem DEMO_DATA.md)"; đổi "Công thức minh hoạ" → "Công thức tính điểm".
- `js/studio/overview.js`: 3 câu "Số liệu tháng X khớp chính xác với trang Lịch & Booking (cùng nguồn dữ liệu)" (kỹ thuật, lặp theo financialMode) → bỏ, giữ phần giải thích tài chính hữu ích (gộp/ròng, phí nền tảng). "Số liệu tính từ cùng nguồn booking với..." → "Cập nhật gần nhất: hôm nay." "X booking trong phiên demo" → "X booking".
- `js/studio/bookings.js`: "Booking khách đặt từ Trail xuất hiện tại đây ngay lập tức, cộng thêm dữ liệu mô phỏng..." → "Booking mới sẽ xuất hiện tại đây ngay khi khách đặt."

### Viewport đã kiểm thử (trên server 5501, đúng code)
320×700, 375×812, 1440×900 — quét 21 route (Trail/Studio/Admin) bằng script đo `scrollWidth`/`clientWidth` thật: 0 lỗi tràn ngang. Console sạch (0 lỗi) qua toàn bộ lần điều hướng. Bounding-rect xác nhận Trip Builder 2 cột cân bằng ở desktop.

### Giới hạn đã biết
- Chưa kiểm thử bằng screenshot trực quan đầy đủ ở 360/390/430/768/820/1280/1920 cho phase này (đã làm kỹ ở lần đầu trên bản sai repo) — chỉ xác nhận lại bằng script overflow tại 320/375/1440. Nên quét thêm nếu cần chắc chắn tuyệt đối trước khi coi là xong hẳn.
- `js/admin/*` (Cổng dữ liệu quản lý) KHÔNG được rà — nằm ngoài phạm vi yêu cầu gốc (chỉ Customer Interface + KhmerLink Studio).
- Nguyên nhân gốc khiến `preview_start` dính sai cwd trong phiên làm việc này không xác định được hẳn (có thể do đổi thư mục làm việc nhiều lần trong 1 session) — nếu mở phiên Claude Code mới, `.claude/launch.json` (port 5500) nhiều khả năng hoạt động bình thường trở lại; server thủ công ở cổng 5501 vẫn đang chạy cho tới khi bị dừng.

### File đã sửa
`index.html`, `css/base.css`, `css/layout.css`, `css/components.css`, `js/trail/itinerary.js`, `js/trail/placeDetail.js`, `js/trail/profile.js`, `js/studio/shell.js`, `js/studio/overview.js`, `js/studio/reports.js`, `js/studio/bookings.js`, `data/pilot-listings.json`.

## PHASE — Giữ nguyên ngữ cảnh điều hướng khi xem chi tiết địa điểm — 2026-09-17

### Nguyên nhân
Router hash hiện có (`js/app.js`) là hash router thuần, không có query string/router state — mọi trang chỉ nối `#/trail/place/:id` khi mở chi tiết (từ Khám phá, Trip Cart, kết quả gợi ý AI, trang chi tiết hành trình...). Nút đóng ở `js/trail/placeDetail.js` trước đây là 1 thẻ `<a href="#/trail/explore">` **hard-code cứng** — bất kể khách mở từ đâu, đóng luôn về Khám phá. Ngoài ra, `renderItineraryWizard()` (`js/trail/itinerary.js`) gọi `resetWizard()` vô điều kiện mỗi lần route `#/trail/itinerary/new` được dựng lại — nên dù có sửa đúng đích quay lại, quay lại từ trang chi tiết địa điểm sau khi xem 1 gợi ý AI vẫn sẽ mất toàn bộ kết quả gợi ý (reset về bước 1), vì đây cũng là route đó.

### Cơ chế `returnTo` đã dùng
Không xây hệ thống navigation mới — chỉ thêm 1 ngăn xếp nhỏ (`js/services/navHistoryService.js`, mới) lưu trong `sessionStorage` (khớp yêu cầu "sống sót qua refresh, mất khi đóng tab"), tích hợp vào đúng vòng lặp `render()`/`hashchange` sẵn có của `js/app.js`:
- Mỗi lần hash đổi và KHÔNG khớp đỉnh ngăn xếp → coi là điều hướng "tiến": ghi `{hash, scroll (window + panel Khám phá nếu có), focusHint}` của trang sắp rời đi.
- Mỗi lần hash đổi VÀ khớp đúng đỉnh ngăn xếp → coi là "quay lại" (dùng chung logic cho nút Quay lại/× trong trang, nút Back trình duyệt, và vuốt back trên di động — cả 3 chỉ khác nhau ở nơi `location.hash` bị đổi, không phải kết quả), pop và khôi phục đúng scroll/focus thay vì cuộn lên đầu.
- Nút `×`/"Quay lại" ở `placeDetail.js` gọi `NavHistory.goBack('#/trail/explore')` — không có ngữ cảnh (deep link/tab mới) thì rơi về Khám phá an toàn.
- Cờ đồng bộ `NavHistory.isRestoring()` (đặt/đọc trong cùng lượt render) cho trang đích biết đây là lượt "quay lại" hay "tới mới" — `itinerary.js` dùng cờ này: nếu đang quay lại VÀ có kết quả gợi ý đã xem trước đó (`wizardState.viewingResults`/`lastRawPrefs`, mới thêm) thì vẽ lại đúng màn kết quả, không reset wizard và không gọi lại hàm có log `customisation_request` (tránh log trùng — đã verify đúng 1 lần dù mở/đóng detail nhiều lần).

### Khôi phục scroll + focus
- Scroll: khôi phục cả `window.scrollY` LẪN `.explore-panel__body.scrollTop` (trang Khám phá cuộn ở 2 cấp độc lập — toolbar/bản đồ trôi theo window, danh sách cuộn riêng trong panel trên mobile).
- Focus: tính sẵn CSS selector nhắm đúng nút "Xem chi tiết"/"Xem" đã dẫn tới trang đang mở (dựa vào id địa điểm trong hash đích, generic cho mọi nguồn — không cần sửa từng file link) — CHỈ nhắm `a`/`button` thật sự nhận focus được (phát hiện lúc test: `<div data-id>` bọc ngoài có `tabindex="-1"` nhưng không tự `focus()` tin cậy được, đã loại khỏi selector).
- Dùng `setTimeout(fn, 0)` thay vì `requestAnimationFrame` để lên lịch khôi phục — phát hiện lúc test: `requestAnimationFrame` có thể bị trình duyệt trì hoãn/không chạy khi tab/pane không ở trạng thái đang vẽ, khiến khôi phục scroll/focus im lặng không xảy ra; `setTimeout` là macrotask, luôn chạy.

### Kết quả acceptance tests (20 mục)
1-4 (đóng đúng nguồn: Khám phá/Trip Cart/AI suggestion/Hành trình): Pass — verify bằng script thật (không chỉ đọc code), cả 4 nguồn quay lại đúng hash.
5-9 (hành trình giữ nguyên điểm/thứ tự/giá, exact/partial-match, map không reset): Pass — trang chi tiết hành trình đọc từ state đã lưu (localStorage) mỗi lần render nên tự nhiên không đổi; verify `document.body.innerText` TRƯỚC/SAU mở-đóng detail giống hệt nhau.
10 (scroll khôi phục): Pass — cả window lẫn panel Khám phá (mobile), verify bằng giá trị số chính xác trước/sau.
11 (Back trình duyệt = nút đóng): Pass — verify bằng `history.back()` thật (không chỉ nút trong app), kết quả giống hệt.
12 (không hard-code Khám phá): Pass — đã bỏ hoàn toàn href cứng, thay bằng `NavHistory.goBack()`.
13-14 (refresh + deep link): Pass — verify bằng `location.reload()` thật giữa chừng khi đang ở trang chi tiết: context còn nguyên, back vẫn đúng; tab mới thẳng vào URL chi tiết (không context) → về Khám phá, không trắng trang.
15 (không chạy lại AI khi chỉ xem rồi đóng): Pass — đếm `customerBehaviourEvents` loại `customisation_request` trước/sau mở-đóng detail từ màn kết quả gợi ý: không tăng.
16 (không duplicate history entries): Pass — verify ngăn xếp rỗng lại đúng sau mỗi vòng mở/đóng, không phình to.
17 (focus trả về đúng nút): Pass — verify `document.activeElement` sau khi đóng khớp đúng phần tử đã mở detail đó.
18 (mobile/desktop): Pass — verify riêng ở 375px (panel Khám phá cuộn độc lập) và desktop, không tràn ngang.
19 (console sạch): Pass — quét 16 route.
20 (không phá tính năng cũ): Pass — `renderCurrent`/`render()` giữ nguyên hành vi cũ (cuộn lên đầu) cho MỌI điều hướng "tiến" bình thường, chỉ thêm nhánh xử lý khi hash khớp đỉnh ngăn xếp.

### Giới hạn đã biết
- Trạng thái mở/thu gọn accordion ("Lưu ý trước khi đến", "Giờ và phí"...) và các trạng thái UI thuần DOM khác (không phải data đã lưu) chưa được khôi phục riêng khi quay lại — đây vốn đã là hành vi cũ với MỌI điều hướng (không phải regression do phase này), và không nằm trong 20 acceptance test cụ thể. Có thể bổ sung sau nếu cần, bằng cách mở rộng object lưu trong ngăn xếp.
- Passport hiện CHƯA có link nào tới trang chi tiết địa điểm (thẻ dấu khám phá không click được) — bảng nguồn trong yêu cầu có liệt kê Passport nhưng đường link đó chưa tồn tại trong code hiện tại; nếu thêm sau, cơ chế `returnTo` đã sẵn sàng hoạt động đúng ngay không cần sửa thêm gì (generic theo hash, không đặc thù theo trang).
- Với "AI Suggested Route", khôi phục màn kết quả gọi lại `getItineraryRecommendations()` với ĐÚNG tham số đã lưu (không gọi hàm có log sự kiện) — về mặt kỹ thuật vẫn tính toán lại (thuật toán rule-based thuần, không random/không gọi mạng), nhưng kết quả hiển thị giống hệt lần trước (đã verify `innerText` khớp 100%) nên không có tác dụng phụ nhìn thấy được; không cache lại HTML/kết quả gốc để tránh mở rộng phạm vi sửa quá mức cần thiết.

### File đã sửa/tạo
Mới: `js/services/navHistoryService.js`.
Sửa: `js/app.js`, `js/trail/placeDetail.js`, `js/trail/itinerary.js`, `css/base.css`.

## PHASE — Tinh chỉnh Cổng quản lý + Cổng vận hành (bỏ wording demo, bộ lọc cascading, đề án/kiểm duyệt liên kết Host↔Management) — 2026-09-17

Yêu cầu gồm 3 phần: (1) giao diện mở đầu Cổng quản lý, (2) Cổng dữ liệu quản lý (Tổng quan/Luồng khách/Đề án), (3) Cổng vận hành (Booking & Giao dịch/Kiểm duyệt nội dung). Không regenerate project, không tạo lại dữ liệu booking, không phá data linkage Customer↔Host↔Management.

### 1) Giao diện mở đầu Cổng quản lý
`js/welcome.js`: bỏ "(demo)" khỏi tiêu đề "Cổng quản lý", rút gọn câu giới thiệu (bỏ vế giải thích kỹ thuật phân quyền theo vai trò), giữ nguyên câu "Dành cho cơ quan quản lý". `js/admin/shell.js`/`js/ops/shell.js`: xoá dòng `.demo-note` giải thích khác biệt quyền xem giữa 2 vai trò (đúng khớp mô tả "Mỗi vai trò xem dữ liệu khác nhau theo đúng quyền hạn"/"Dữ liệu được phân quyền theo vai trò"). KHÔNG đổi logic phân quyền/scoping bên dưới (`js/admin/filters.js` scoping vẫn nguyên).

### 2) Cổng dữ liệu quản lý

**Bộ lọc cascading (tab Tổng quan + Luồng khách)** — viết lại toàn bộ `js/admin/filters.js`. Mỗi filter (Khoảng thời gian/Đơn vị cung cấp/Listing/Loại hình/Financial mode/Booking status/Activity status/Khu vực) chạy qua `getAvailableOptions(state, filters, targetKey)`: dựng `buildListingRecords(state)` (1 record/listing kèm mọi thuộc tính lọc được), lọc bằng `getCompatibleRecords()` với TẤT CẢ filter khác đang active (loại trừ chính targetKey), rồi suy option khả dụng từ tập kết quả đó — đúng thuật toán giả mã trong yêu cầu. `reconcileFilters(state)` chạy vòng lặp ổn định (tối đa 5 lượt, hội tụ nhanh vì chỉ 7 listing) tự xoá lựa chọn không còn hợp lệ sau khi 1 filter đổi. Thanh lọc tự sinh chip "đang lọc theo X" + nút "Xoá tất cả bộ lọc" + đếm kết quả + trạng thái rỗng khi không còn record nào khớp. `wireFilterBar()` gọi lại đúng 1 hàm render trang (`renderAdminOverview`/`renderAdminFlow`) mỗi lần đổi filter — mọi KPI/chart/bảng trên trang cùng cập nhật, không phải riêng lẻ từng khối.

**Bỏ disclaimer kỹ thuật**: `js/admin/overview.js` xoá `getProviderMetrics()` (tên hàm lộ ra UI) và các câu "dữ liệu mô phỏng"/giải thích nguồn dữ liệu; `js/admin/flow.js` xoá bảng "Khung giờ cao điểm" cũ cùng câu giải thích kỹ thuật, giữ nguyên tiêu đề Luồng khách/Conversion funnel/Khung giờ cao điểm/Nhu cầu theo nhóm khách/Điểm rời khỏi hành trình/Tỷ lệ chuyển đổi.

**Top phản hồi — sửa layout mobile**: `topFeedbackHtml()` trong `overview.js` sinh SONG SONG 2 markup — `<table>` (desktop, bọc `.responsive-table-wrap`, hiện ≥768px) và `.feedback-card` list (`.responsive-card-list`, hiện <768px). Card dùng grid `minmax(0,1fr) auto` để tên listing + số sao LUÔN cùng hiện trên 1 hàng (không co dấu "..." mất sao khi tên dài), `overflow-wrap:anywhere` chặn tràn ngang do từ/URL dài, bình luận clamp 2-3 dòng kèm nút "Xem thêm" (JS toggle class `.feedback-card__comment--clamped`), tag wrap tự nhiên (`flex-wrap:wrap`). Bỏ hẳn `overflow-x:auto` cũ (nguồn gốc cuộn ngang trên mobile).

**Nhu cầu cần cải thiện — cùng kiểu xử lý responsive**: `js/admin/demand.js` đổi `opportunityCardHtml()` sang `.opportunity-card` (badge ưu tiên luôn hiện ở `__head`, không bị đẩy ra ngoài khung; nút hành động `__actions` nằm DƯỚI nội dung trên mobile nhờ flow tự nhiên của flex-column, không phải absolute-position).

**Tab Đề án — `proposalRecords` trung tâm**: `state.proposals` (seed `proposalSeedRecords`, 3 bản ghi PRP-001/002/003, `data/pilot-seed-data.js`) là NGUỒN DUY NHẤT — dùng chung bởi Studio (`js/studio/support.js`, Host xem/gửi) và Cổng quản lý (`js/admin/proposals.js`, xử lý). Schema mới (`providerId`/`summary`/`requestedChange`/`expectedImpact`/`managementNote`) cùng tồn tại với schema cũ (`hostId`/`problem`/`desiredSupport`/`expectedBenefit`) qua fallback `new || old` ở mọi nơi render — không phá đề án cũ đã có từ phase trước. Mỗi card hiện đủ tiêu đề/đơn vị gửi/hoạt động/ngày gửi/trạng thái/tóm tắt/bằng chứng/tác động dự kiến + nút Xem chi tiết (modal)/Duyệt/Yêu cầu bổ sung/Từ chối. `setProposalStatus()` (`js/storage.js`) ghi `updatedAt`, lưu `managementNote`, bắn `addProviderNotification()` cho đúng Host (kênh riêng `state.providerNotifications`, tách khỏi thông báo Khách) — trừ khi chính Host vừa đổi trạng thái đó (`PROPOSAL_HOST_INITIATED_STATUSES`). Lịch sử xử lý lưu localStorage nên sống sót qua reload.

**Khung giờ cao điểm — biểu đồ cột Chart.js**: `js/admin/flow.js` thêm `hourlyDemandToday` (6 khung giờ, đúng dữ liệu mẫu trong yêu cầu) + `PEAK_TIME_RANGE`. Canvas bọc trong `<div style="position:relative;height:280px;...">` (bắt buộc phải có, kết hợp `maintainAspectRatio:false` — thiếu 1 trong 2 gây vòng lặp ResizeObserver khiến canvas phình tới ~16.000px cao, đã tự phát hiện và sửa khi test). Tiêu đề/trục/tooltip đúng nội dung yêu cầu, trục Y cố định 0–100, cột khung giờ 15:00–17:00 tô màu khác (`CHART_COLORS[4]`) để nổi bật là giờ cao điểm, nhãn trục X rút gọn ("07–09"...), không còn chữ "Dữ liệu mô phỏng" trong khối biểu đồ.

### 3) Cổng vận hành

**Booking & Giao dịch — viết lại `js/ops/bookings.js`**: đọc trực tiếp `getAllProviderBookings(state, period, providerIds)` (`js/services/hostBookingService.js`) — ĐÚNG nguồn Studio dùng, không tạo `managementBookings` riêng. Mỗi hàng hiện Booking ID/Customer/Activity/Provider/Booking date/Time slot/Group size/Booking status/Gross amount/Platform fee/Provider income/Transaction status; công thức tài chính giữ nguyên từ `hostBookingService.js` (`grossAmount`=tổng lineTotal, `platformFee`=tổng platformFee, `providerIncome`=gross−fee−refund). Listing `financialMode:'free_visit'` hiện "Miễn phí" thay vì "0₫". EXP-02 không đếm trùng (đã xác nhận bằng code comment + đếm thật: xuất hiện đúng 6 lần khớp số booking thật của EXP-02). Trạng thái đổi ở đây dùng chung hàm `Storage` với Host/Customer nên đồng bộ 2 chiều tự nhiên (không có bản sao trạng thái riêng). Bộ lọc (ngày/đơn vị/hoạt động/booking status/transaction status/financial mode/tìm kiếm) qua `applyOpsFilters()`, cập nhật KPI cards + bảng cùng lúc.

**Kiểm duyệt nội dung — `contentSubmissionRecords` trung tâm**: `state.contentSubmissions` (seed `contentSubmissionSeedRecords`, SUB-EXP-001/002, `data/pilot-seed-data.js`) liên kết trực tiếp với luồng "Thêm trải nghiệm" của Host (`js/studio/experiences.js`, thêm mục đọc-riêng "Đề xuất hoạt động mới đã gửi") và hiển thị ở Cổng vận hành (`js/ops/content.js`, mục xử lý mới, KHÔNG đụng vào luồng `state.experiences`/`reviewExperience()` cũ đã có sẵn — 2 luồng độc lập theo đúng phạm vi yêu cầu). Hoạt động trong `contentSubmissions` KHÔNG hiện ở Activity Catalog/Khám phá của Khách cho tới khi Duyệt. `approveContentSubmission()` (`js/storage.js`) tạo bản ghi destination+catalog mới (`publicationStatus:'published'`, mượn toạ độ/địa chỉ/ảnh từ điểm đến gốc của Host), đẩy đồng thời vào mảng LIVE (`state.destinations`, để hiện ngay không cần reload — đây là bug tự phát hiện khi test, ban đầu chỉ đẩy vào mảng persisted) VÀ mảng PERSISTED (`state.customDestinations`); `getOperations()` (`operationsService.js`) fallback sang `state.customActivityCatalog` khi listing không có trong `activityCatalog` tĩnh, để giá/thời lượng/sức chứa hiện đúng ngay ở mọi nơi gọi hàm này. `requestContentSubmissionRevision()`/`rejectContentSubmission()` bắt buộc `reviewerNote`/lý do, giữ nguyên ID (không tạo bản ghi trùng) khi yêu cầu chỉnh sửa; từ chối thì không thêm vào catalog.

### Kết quả nghiệm thu (kiểm thử thật qua browser, không chỉ đọc code)
- Test data linkage: `/ops/bookings` đọc đúng `getAllProviderBookings()` — 59 hàng khớp tuyệt đối với Studio; "Miễn phí" hiện đúng cho 28 hàng free-mode; EXP-02 xuất hiện đúng 6 lần (không double-count).
- Test proposal: duyệt/từ chối 1 đề án ở Cổng quản lý → Host nhận `providerNotifications` mới, trạng thái đồng bộ ngay ở Studio, còn nguyên sau reload.
- Test content submission: duyệt SUB-EXP-002 → xuất hiện ngay trong `state.destinations` (live, không cần reload) và `state.customActivityCatalog`; SUB-EXP-001 (duyệt từ trước, qua reload) vẫn còn nguyên (persisted đúng).
- Test responsive: quét 320/360/375/390/430/768/1280/1440px qua script đo `scrollWidth`/`clientWidth` trên 7 route đã sửa (`#/gateway`, `#/admin/overview`, `#/admin/demand`, `#/admin/flow`, `#/admin/proposals`, `#/ops/bookings`, `#/ops/content`) — **0 lỗi tràn ngang** ở mọi mức. Feedback-card/opportunity-card xác nhận rating/priority badge luôn hiện, nút hành động luôn dưới nội dung. Bảng↔card của Top phản hồi chuyển đúng tại breakpoint 768px (`.responsive-table-wrap` ẩn, `.responsive-card-list` hiện <768px và ngược lại). Biểu đồ khung giờ cao điểm giữ đúng 280px ở mọi bề rộng (320px → 1440px), không tái diễn lỗi ResizeObserver. Bảng Booking & Giao dịch (13 cột) dùng `overflow-x:auto` cục bộ trong khung `<section>` (không tràn ra ngoài trang) thay vì chuyển hẳn sang card — trong phạm vi cho phép của yêu cầu ("scroll container hợp lý" là 1 lựa chọn hợp lệ bên cạnh chuyển card).
- Console sạch (0 lỗi) qua toàn bộ 8 mức viewport × 7 route.

### Giới hạn đã biết
- Bảng Booking & Giao dịch ở Cổng vận hành CHƯA có phiên bản card riêng cho mobile (dùng scroll ngang cục bộ) — khác với Top phản hồi/Nhu cầu cần cải thiện đã có card fallback đầy đủ. Không tràn ra ngoài trang (đã verify), nhưng người dùng mobile vẫn cần vuốt ngang trong khung bảng để xem hết 13 cột.
- Không rà `admin/reports.js`, `ops/pilot.js`, `ops/community.js`, `ops/quality.js`, `ops/tickets.js` — nằm ngoài phạm vi 5 tab được nêu cụ thể trong yêu cầu (Tổng quan/Luồng khách/Đề án ở Cổng quản lý; Booking & Giao dịch/Kiểm duyệt nội dung ở Cổng vận hành).
- ID nhà cung cấp mẫu trong yêu cầu gốc (`PROVIDER-01/02/03`) không tồn tại trong dữ liệu host thật của app — đã ánh xạ qua `activityCatalog[activityId].providerAccountId` sang ID host thật (`host-com-dep-tuan-viet`, `host-nhac-mua-khmer`, `host-mat-na-khmer`), ghi rõ trong `DEMO_DATA.md`.

### File đã sửa/tạo
Mới: không có file mới (mọi bổ sung nằm trong các file service/data đã tồn tại).
Sửa: `js/welcome.js`, `js/admin/shell.js`, `js/ops/shell.js`, `js/admin/filters.js` (viết lại toàn bộ), `js/admin/overview.js`, `js/admin/demand.js`, `js/admin/flow.js`, `js/admin/proposals.js`, `js/studio/support.js`, `js/studio/experiences.js`, `js/ops/bookings.js` (viết lại toàn bộ), `js/ops/content.js`, `js/storage.js`, `js/data.js`, `js/services/operationsService.js`, `data/pilot-seed-data.js`, `css/components.css`, `DEMO_DATA.md`.

## PHASE — Hệ thống i18n VI/EN toàn nền tảng (Customer/Trail, Host/Studio, Management/Admin+Ops) — 2026-09-17

Yêu cầu: thêm language switcher VI/EN áp dụng cho TOÀN BỘ nền tảng (không chỉ Home Page), hệ thống dịch trung tâm (không tìm/thay DOM trực tiếp), lưu + đồng bộ đa tab, nội dung activity song ngữ, không tự dịch nội dung người dùng nhập, không đổi giá/công thức/logic AI/ID, responsive 320–1440px. Không regenerate project, không đổi data linkage.

### Kiến trúc i18n đã tạo
- **`js/services/i18nService.js`** (mới, ~340 dòng, ZERO import nội bộ — để mọi file khác kể cả `utils.js` import ngược lại an toàn, không lo circular import):
  - `translations` — object trung tâm `{ vi: { common, customer, host, management }, en: {...} }`. `common` (nav/status/actions/price/category/crowd/listingType/cta/rating/duration/home/gateway...) khai báo sẵn trong file; các namespace `customer`/`host`/`management` được BỒI DẦN bằng `registerTranslations(namespace, viEntries, enEntries)` gọi ở đầu mỗi file UI/service cần — tránh 1 file dịch khổng lồ, mỗi cụm string nằm cạnh code dùng nó.
  - `t(key, params)` — resolve theo key dạng `"namespace.sub.key"`, nội suy `{param}`, KHÔNG bao giờ trả về key thô hay `undefined`: thiếu bản dịch ngôn ngữ hiện tại → fallback tiếng Việt (luôn tồn tại) → chuỗi rỗng, kèm `console.warn` để audit.
  - `setLanguage(lang)` / `getCurrentLanguage()` — lưu `localStorage['khmerlink.language']` (giá trị `"vi"`/`"en"`, mặc định `"vi"` khi chưa có), cập nhật `document.documentElement.lang`, phát `CustomEvent('khmerlink:language-changed')`.
  - `formatCurrency`/`formatMoney`/`formatNumber`/`formatDate`/`formatTime`/`formatDateTime` — dùng `Intl.NumberFormat`/`toLocaleDateString` theo `vi-VN`/`en-US`, KHÔNG đổi giá trị số, chỉ đổi cách hiển thị (VD: `180.000₫` ↔ `VND 180,000`).
  - `localize(field)`/`localizeList(field)` — đọc field song ngữ dạng `{ vi, en }`; không phải object song ngữ (chuỗi thường, nội dung khách/host tự nhập) → trả nguyên văn, không tự dịch máy.
  - `languageSwitcherHtml()`/`wireLanguageSwitchers()` — component `🌐 VI | EN` dùng chung Home Page + header của cả 4 vai trò (segmented control, `aria-pressed`, touch target ≥44px trên mobile).
- **Đồng bộ đa tab**: `setLanguage()` ghi `localStorage` → trình duyệt tự bắn sự kiện `storage` GỐC ở các tab khác (không phải tab vừa ghi) → `i18nService.js` lắng nghe sự kiện đó, cập nhật biến ngôn ngữ trong bộ nhớ của tab đó rồi tự phát lại `khmerlink:language-changed` NỘI BỘ — `js/app.js` chỉ cần 1 handler duy nhất cho sự kiện này (dùng lại `scheduleRerender()` đã có sẵn từ trước cho đồng bộ dữ liệu đa tab) để render lại route hiện tại, KHÔNG reload trang, KHÔNG cuộn lên đầu, KHÔNG mất Trip Cart/hành trình/filter Management/modal đang mở — vì toàn bộ state này sống trong `state`/singleton filter object (`adminFilters`, `opsBookingFilters`...), không phải biến cục bộ trong DOM bị mất khi re-render. Đã verify bằng 2 tab thật: đổi ngôn ngữ ở tab A, tab B tự cập nhật `<h1>` + `document.documentElement.lang` không cần thao tác gì.
- **Nội dung activity song ngữ**: `data/activityTranslations.js` (mới) — bảng dịch `{ name, shortDescription, fullDescription, culturalStory, visitorNotes, categoryLabel, tags, keyFacts }` dạng `{ vi, en }` cho đúng 7 listing pilot (EXP-01..EXP-03, SITE-04..SITE-07), theo đúng tên đề xuất trong yêu cầu (VD EXP-01 → "Pound Your Own Cốm Dẹp" khi chuyển EN — đã verify chính xác). KHÔNG sửa `data/pilot-listings.json` gốc. `js/services/destinationsService.js` thêm các hàm đọc `localizedDestinationName/Summary/Activities/CulturalStory/Tips/KeyFacts(dest)` — tính TẠI THỜI ĐIỂM RENDER (không cache lúc load dữ liệu) để tự phản ánh đúng khi đổi ngôn ngữ mà không cần tải lại `pilot-listings.json`; địa danh khác ngoài 7 listing pilot không có bản dịch → tự fallback về đúng tiếng Việt gốc, không lỗi/không hiện key.
- **Đòn bẩy trung tâm — `js/utils.js`**: các hàm hiển thị dùng chung toàn app (`formatCurrency`, `formatActivityPrice`, `formatDateShort`, `formatTimeHHmm`, `formatDurationMin`, `categoryGroupLabel` (mới, tách khỏi `categoryGroup()` — group vẫn luôn là khoá tiếng Việt ổn định dùng cho filter/so sánh, KHÔNG đổi theo ngôn ngữ để không phá filter Management đang chọn; `categoryGroupLabel()` chỉ dịch phần HIỂN THỊ), `listingTypeBadge`, `ctaLabel`, `ratingDisplay`, `getSimulatedCrowdLevel`) đã được nối vào `i18nService.js` — sửa 1 nơi, tự lan toả bản dịch tới hàng chục file gọi các hàm này mà không cần sửa từng nơi gọi.

### Phạm vi đã dịch đầy đủ (title/heading/button/label/status/filter/chart/modal/toast/empty-state)
- **Lõi**: `js/app.js` (loading/error state), `js/welcome.js` (Home + Cổng quản lý), 4 shell (`trail/shell.js`, `studio/shell.js`, `admin/shell.js`, `ops/shell.js` — nav/brand/a11y), `js/utils.js` (xem trên).
- **Customer/Trail**: `trail/explore.js` (Khám phá đầy đủ: toolbar/filter modal/card/map popup/legend/sections), `trail/placeDetail.js` (trang chi tiết đầy đủ: accordion/CTA/related/sources), `trail/booking.js` (luồng đặt trải nghiệm đầy đủ 3 bước), `trail/itinerary.js` (Trip Cart + wizard 4 bước + kết quả AI exact/partial/popular-fallback — file lớn nhất, ~900 dòng sau khi thêm dịch), `trail/notifications.js`, `trail/passport.js` (Hộ chiếu/review form/voucher/rewards), `trail/profile.js` (+ thêm switcher ngôn ngữ phụ tại đây, cùng state với header — đã sửa luôn đoạn text cũ nói "chỉ hỗ trợ Tiếng Việt" nay đã lỗi thời), `services/aiService.js` (tên/lý do 3 phương án gợi ý + nhãn "Gợi ý tự động — bản demo" + fallback reason).
- **Host/Studio**: `studio/overview.js`, `studio/bookings.js` (KPI/lịch/booking card/demand chart — 2 biểu đồ Chart.js), `studio/experiences.js` (Activity Catalog card + form chỉnh sửa + form thêm trải nghiệm + đề xuất mới), `studio/support.js` (đề án + ngoại lệ CPS), `studio/reports.js` (4 biểu đồ Chart.js + CPS block + gợi ý cải thiện), `services/cpsService.js` (nhãn trạng thái CPS + 4 rule gợi ý cải thiện vận hành), `services/metricsService.js` (`monthLabel` + 3 rule gợi ý cải thiện từ đánh giá khách, có phân biệt: KHÔNG dịch từ khoá dò tìm trong bình luận thật của khách — luôn tiếng Việt vì nội dung khách nhập luôn tiếng Việt bất kể UI đang ngôn ngữ nào — chỉ dịch NHÃN hiển thị của từ khoá đó).
- **Management/Admin**: `admin/filters.js` (viết lại — toàn bộ thanh lọc dùng chung, financial mode/activity status/booking status label), `admin/overview.js` (KPI tháng hiện tại + 5 biểu đồ Chart.js + Top phản hồi + đề án chờ xử lý), `admin/flow.js` (mật độ + biểu đồ cột khung giờ cao điểm + phân khúc du khách), `admin/demand.js` (file lớn nhất khu Admin — KPI/funnel/4 biểu đồ/preference/capacity gap/forecast/opportunity card), `admin/proposals.js` (card + modal duyệt/yêu cầu bổ sung/từ chối), `admin/reports.js` (hoa hồng network + phản hồi ẩn danh + xuất CSV — chỉ dịch UI, KHÔNG dịch tên cột trong file CSV xuất ra).
- **Management/Ops**: `ops/bookings.js` (viết lại lần trước — nay dịch toàn bộ KPI/filter/bảng 13 cột/giao dịch gần đây/modal ghi chú điều phối), `ops/content.js` (kiểm duyệt nội dung đầy đủ: submission card/pending experience/modal/log), `ops/tickets.js` (Sự cố — ngoài phạm vi liệt kê rõ trong yêu cầu nhưng dịch thêm để nhất quán), `ops/quality.js` (Chất lượng & Hỗ trợ hộ — dịch thêm tương tự).

### Đã verify bằng browser thật (không chỉ đọc code)
- EXP-01 hiện đúng "Pound Your Own Cốm Dẹp" khi chuyển EN (test #12 trong yêu cầu).
- Đổi ngôn ngữ 2 chiều VI↔EN không reload trang, không mất scroll, giữ nguyên state (Trip Cart, wizard AI đang ở màn kết quả, filter Management).
- Đồng bộ 2 tab thật: đổi ở tab A, tab B tự cập nhật không thao tác gì (native `storage` event).
- Quét toàn bộ `[i18n]` console.warn qua ~25 route × chuyển VI/EN: **0 key thiếu bản dịch**, không có chuỗi `undefined`/key thô nào lọt ra UI.
- Console sạch (0 lỗi JS) qua toàn bộ route đã sửa, cả 2 ngôn ngữ.
- Responsive: quét **8 mức viewport (320/360/375/390/430/768/1280/1440px) × 22 route** ở chế độ tiếng Anh (chữ Anh dài hơn tiếng Việt, rủi ro tràn ngang cao nhất) — **0 lỗi tràn ngang** sau khi sửa 2 bug phát hiện được (xem dưới).

### Lỗi tự phát hiện và đã sửa khi test (không phải do người dùng báo)
- **Tràn ngang 320px trên MỌI trang Admin/Ops ở chế độ EN** (`scrollWidth` 389–402px thay vì 320px): root cause là `.trail-topbar` (header dùng chung 4 cổng) không co được khi nhãn tiếng Anh dài hơn (VD "← Management Portal" dài hơn hẳn "← Cổng quản lý"), cộng thêm switcher ngôn ngữ mới thêm vào cùng hàng — tổng bề rộng brand+switcher+back-link vượt 320px vì topbar không có `flex-wrap`. Sửa bằng `css/layout.css`: thêm `text-overflow:ellipsis` cho brand (phòng trường hợp cực đoan hơn), và ở `≤480px` cho `.trail-topbar` tự xuống dòng (`flex-wrap:wrap`, brand chiếm trọn dòng đầu, switcher+back-link/bell dồn về phải ở dòng dưới) — kiểm tra lại bằng screenshot thật, giao diện 2 dòng gọn gàng, không cắt chữ.
- **Bảng dài (13 cột, `white-space:nowrap`) đẩy tràn cả trang dù section bọc ngoài đã có `overflow-x:auto`**: nguyên nhân là `<section>` là flex item trực tiếp trong `.studio-content` (`display:flex;flex-direction:column`) — mặc định `min-width:auto` của flex item khiến nó không co xuống dưới bề rộng nội dung intrinsic (bảng rất rộng khi text tiếng Anh dài), nên bản thân section bị đẩy rộng ra thay vì tự cuộn nội bộ. Sửa bằng 1 rule `.studio-content > * { min-width: 0; }` trong `css/layout.css` — áp dụng chung cho mọi trang Admin/Ops/Studio, không cần sửa từng section riêng lẻ.

### Giới hạn đã biết (chưa dịch hết, liệt kê trung thực)
- **Trail**: `trail/itineraryDetail.js`, `trail/itinerarySummary.js`, `trail/support.js`, `trail/reviewTags.js`, `trail/placeImpression.js` — chưa rà (trang chi tiết/tóm tắt hành trình đã lưu, danh sách ticket hỗ trợ của khách, gợi ý tag đánh giá). Các trang này vẫn hoạt động đúng, chỉ hiển thị tiếng Việt kể cả khi chọn EN.
- **Ops**: `ops/pilot.js`, `ops/community.js` — chưa rà (nằm ngoài 2 tab được liệt kê rõ trong yêu cầu: Booking & Giao dịch, Kiểm duyệt nội dung).
- **Nội dung do rule-based service khác tạo ra**: `js/services/managementService.js` (funnel step label/unit, opportunity recommendation title/basis/action/responsibleParty/timeframe, interest trend label) và per-stop field của EXP-02 (`s.label`/`s.place`/`s.description` trong gói 2 điểm dừng) vẫn trả về tiếng Việt — đây là các chuỗi do rule-based generator ghép động, không phải hằng số UI đơn giản, cần thời gian riêng để tách thành key+param mà không phá logic tính toán.
- **Thông báo (`state.notifications`) đã tạo trước khi đổi ngôn ngữ**: nội dung thông báo được "đông cứng" thành chuỗi tại thời điểm tạo (trong `storage.js`, các hàm như `toggleTripCartItem` gọi `NotificationService`/ghi log) — đổi ngôn ngữ SAU khi thông báo đã tồn tại không dịch ngược thông báo cũ (đúng theo kiến trúc hiện tại của app, tương tự cách các nền tảng khác xử lý — không coi đây là lỗi cần sửa gấp, chỉ là giới hạn của việc lưu chuỗi đã resolve thay vì lưu key).
- **Lỗi kỹ thuật từ tầng service** (`bookingService.js`, `paymentService.js` — các `reason:` trả về khi thao tác booking/thanh toán thất bại, VD "Không tìm thấy booking.") chưa dịch — đây là các thông báo lỗi hiếm gặp (validation nội bộ), không phải luồng chính.
- **CSV xuất ra** (`admin/reports.js`) giữ nguyên tên cột tiếng Việt bất kể UI đang ngôn ngữ nào — phạm vi yêu cầu là giao diện web, không bắt buộc file tải về.

### File đã sửa/tạo (phase i18n)
Mới: `js/services/i18nService.js`, `data/activityTranslations.js`.
Sửa: `js/app.js`, `js/utils.js`, `js/welcome.js`, `js/trail/shell.js`, `js/studio/shell.js`, `js/admin/shell.js`, `js/ops/shell.js`, `js/trail/explore.js`, `js/trail/placeDetail.js`, `js/trail/booking.js`, `js/trail/itinerary.js`, `js/trail/notifications.js`, `js/trail/passport.js`, `js/trail/profile.js`, `js/studio/overview.js`, `js/studio/bookings.js`, `js/studio/experiences.js`, `js/studio/support.js`, `js/studio/reports.js`, `js/admin/filters.js`, `js/admin/overview.js`, `js/admin/flow.js`, `js/admin/demand.js`, `js/admin/proposals.js`, `js/admin/reports.js`, `js/admin/networkMetrics.js`, `js/ops/bookings.js`, `js/ops/content.js`, `js/ops/tickets.js`, `js/ops/quality.js`, `js/services/aiService.js`, `js/services/cpsService.js`, `js/services/metricsService.js`, `js/services/destinationsService.js`, `css/layout.css`.

## PHASE — Redesign Cổng dữ liệu quản lý theo dashboard kiểu Power BI (2026-09-18)

Theo yêu cầu riêng: bố cục lại 4 tab của Cổng dữ liệu quản lý (`#/admin/overview`, `/flow`, `/demand`, `/proposals`) thành dashboard canvas thống nhất kiểu Power BI — grid 12 cột, mật độ thông tin cao, các visual cross-filter với nhau. **Chỉ đổi layout/tương tác hiển thị — không đổi data model, công thức tính KPI, hay data linkage đã hoàn thiện** (mọi số liệu vẫn đọc qua đúng các selector cũ: `networkMetrics.js`, `managementService.js`, `hostBookingService.js`).

### File mới
- `css/admin-dashboard.css` — hệ grid 12 cột (`mdash-grid`, `mdash-col-2..12`, collapse 6 cột ở dưới 1200px rồi 1 cột ở dưới 768px), style card mỏng viền/gần như không shadow (`mdash-card`), KPI card (`mdash-kpi`), filter bar compact kiểu slicer (`mdash-filterbar`), cross-highlight (`mdash-list-item.is-selected/.is-dimmed`), quick-alerts list, map wrap, focus-mode modal.
- `js/admin/dashboardShell.js` — hạ tầng dùng chung: `dashCardHtml()`/`kpiCardHtml()` (card/KPI chuẩn hoá, không tự tính số liệu), `openFocusMode()`/`wireFocusButtons()` (phóng to 1 visual vào modal, vẽ lại đúng chart bằng canvas mới — giữ nguyên filter context, đóng modal không đổi state), `toneColors()` (làm mờ màu segment không được chọn cho cross-highlight Chart.js).
- `js/admin/networkMap.js` — bản đồ mạng lưới cho tab Tổng quan (Leaflet, marker tròn kích thước theo số khách demand trong kỳ — dùng lại đúng số liệu từ `getCapacityUtilisation()`). Click marker gọi callback để cập nhật `adminFilters.listingId`, không tự giữ state lọc riêng. Giữ center/zoom qua biến module-level (`lastView`) để lần filter tiếp theo không bị bung về `fitBounds` full — không reset zoom khi đổi filter.

### File đã sửa (redesign layout, giữ nguyên logic số liệu)
- `js/admin/overview.js` — viết lại hoàn toàn theo grid: Row 1 sáu KPI card (active bookings/tổng khách/tổng giá trị booking/thu nhập community providers/pending bookings/điểm đánh giá — có delta so tháng trước, tính từ `getNetworkMetrics()` với kỳ trước, không thêm công thức mới); Row 2 trend chart (5/12, click 1 tháng để cross-highlight — chỉ làm nổi bật hiển thị, không lọc lại KPI vì các selector hiện có không hỗ trợ lọc theo 1 tháng cụ thể) + donut cơ cấu theo đơn vị (3/12, click để lọc `adminFilters.providerId`) + donut trạng thái booking (2/12, mới — click để lọc `adminFilters.bookingStatus`) + cảnh báo vận hành (2/12, mới — pending bookings/listing gần hết chỗ/đề án chờ duyệt/nội dung chờ kiểm duyệt, click để lọc hoặc điều hướng); Row 3 bản đồ mạng lưới (4/12, mới) + nhu cầu-sức chứa compact (5/12, dùng lại `getCapacityUtilisation()`, click để lọc listing) + Top phản hồi (3/12); dải KPI luỹ kế cũ + các biểu đồ doanh thu/loại hình/rating/đề án chờ xử lý giữ nguyên số liệu, chỉ đổi khung hiển thị.
- `js/admin/flow.js`, `js/admin/demand.js`, `js/admin/proposals.js` — bọc lại toàn bộ nội dung hiện có (funnel, forecast, preferences, capacity gap, opportunity cards, proposal list...) vào cùng hệ grid/card, không đổi hàm tính số liệu nào. Thêm: KPI card đầu trang cho `proposals.js` (mới — tổng đề án/chờ duyệt/đang xem xét/cần bổ sung/đã duyệt) và donut trạng thái đề án (mới, click để lọc danh sách). `demand.js` capacity card giờ click được để lọc `adminFilters.listingId` (trước chỉ đọc).
- `js/admin/filters.js` — viết lại HTML/CSS của `filterBarHtml()`/`activeChipsHtml()` sang style compact (`mdash-filterbar`), giữ nguyên toàn bộ id phần tử (`af-months`, `af-listing`...) nên `wireFilterBar()`/cascading logic (`reconcileFilters`, `destinationInScope`, `providerInScope`) không đổi. Nút "Xoá tất cả bộ lọc" chuyển từ chỉ hiện khi có chip sang luôn hiển thị.
- `js/services/managementService.js` — `getCapacityUtilisation()`: sửa field `name` từ `dest.name` (raw) sang `localizedDestinationName(dest)` — phát hiện khi build bản đồ mới (tên listing trong popup/tooltip không dịch theo ngôn ngữ); áp dụng luôn cho `demand.js` capacity cards (cùng nguồn dữ liệu).

### Cơ chế cross-filter
Dùng lại đúng `adminFilters` (singleton module-level, đã có từ trước) — không tạo state dashboard riêng. Mọi click-để-lọc (donut/booking-status donut/map marker/capacity card/proposal status donut) chỉ: (1) gán vào field tương ứng của `adminFilters`, toggle nếu bấm lại giá trị đang chọn; (2) gọi lại đúng hàm render của tab đó — cùng cơ chế `wireFilterBar()` đã dùng cho dropdown từ trước. Vì `getScopedDestinations()` có chủ đích không lọc theo `providerId` (chỉ áp dụng ở cấp host), bản đồ + Top phản hồi ở Tổng quan cần thêm 1 lớp lọc trình bày (`destinationsScopedByProvider()`, chỉ trong `admin/overview.js`) để hiển thị đúng khi đã chọn 1 đơn vị cung cấp.

### Bug tự phát hiện và đã sửa khi test
1. Canvas Chart.js phình cao vô hạn (844px thay vì ~220-260px) do `flex:1;min-height` kết hợp `maintainAspectRatio:false` tạo vòng lặp không điểm neo — sửa bằng chiều cao tường minh cho mọi chart-wrap + thêm `maintainAspectRatio:false` còn thiếu ở `admin/demand.js`.
2. Card có `data-tablet-full="true"` không collapse về 1 cột trên mobile vì rule tablet có specificity cao hơn rule mobile dù cả hai đều `!important` — sửa bằng cách thêm lại đúng selector đó vào rule mobile.
3. "Top phản hồi"/bản đồ không tôn trọng filter "Đơn vị cung cấp" vì `getTopFeedbackTable()`/`getScopedDestinations()` có chủ đích không lọc theo provider — sửa bằng lớp lọc trình bày riêng trong `admin/overview.js`, không sửa 2 hàm gốc.

### Đã verify bằng browser thật
Grid 12/6/1 cột đúng ở 1200/1280/1440/768-1199/≤767px (đo qua `getComputedStyle().gridTemplateColumns`, không chỉ xem screenshot). Cross-filter thật: click donut đơn vị cung cấp → 6 KPI đổi từ số toàn mạng lưới sang đúng số của đơn vị đó, bản đồ/nhu cầu-sức chứa/Top phản hồi lọc theo; bấm lại → bỏ lọc. Click donut trạng thái booking/đề án → chip lọc đúng, cross-highlight làm mờ segment khác. Click marker bản đồ → lọc theo listing; zoom bản đồ giữ nguyên qua 1 lần filter change (không reset `fitBounds`). Đổi ngôn ngữ giữa lúc đang lọc → chip tự dịch, filter không mất. Focus mode mở/đóng đúng, giữ nguyên dashboard phía sau. Cascading filter vẫn đúng (chọn EXP-01 → "Loại hình" tự thu hẹp còn "Ẩm thực"). Console sạch qua toàn bộ 4 tab, 2 ngôn ngữ, các mốc 320/375/390/430/768/900/1200/1280/1440px. Các trang ngoài phạm vi (`admin/reports.js`, Studio, Trail, Ops) không bị ảnh hưởng.

### Giới hạn đã biết (chưa làm, không giấu)
- `admin/reports.js` (tab Báo cáo) chưa redesign — ngoài phạm vi 4 tab yêu cầu.
- Proposal detail vẫn dùng modal, chưa chuyển thành side/bottom panel đúng nghĩa như mô tả mục 8.
- `admin/flow.js` không có funnel/conversion chart riêng theo mô tả mục 6 — funnel thật đã có sẵn ở tab Demand (`getDemandFunnel()`), không thêm funnel giả vào Flow để tránh trùng lặp/mâu thuẫn dữ liệu; đã bọc lại theo grid/card nhất quán.
- Click 1 tháng trên trend chart chỉ cross-highlight, không lọc lại KPI thật (không có field "lọc theo 1 tháng cụ thể" trong selector hiện có — thêm vào sẽ đổi data linkage).
- Không có phím Escape để xoá cross-filter selection (chỉ đóng focus-mode modal).
