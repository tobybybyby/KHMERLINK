# PROGRESS — Vĩnh Long Trail & Studio

Cập nhật lần cuối: Phase 5 — 2026-09-09

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
| 6–8 | Cổng dữ liệu quản lý, Cổng vận hành | Later | Route đã có, hiện placeholder |
| — | Hoàn thiện, nghiệm thu đủ 12 kịch bản, deploy GitHub Pages + Hostinger | Later | Thực hiện ở phase cuối cùng |

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
Cổng dữ liệu quản lý (Phase 6), Cổng vận hành & cố vấn cộng đồng (Phase 7), và hoàn thiện deploy GitHub Pages/Hostinger — thực hiện ở các phase tiếp theo.
