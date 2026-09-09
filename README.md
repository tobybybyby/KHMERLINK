# Vĩnh Long — Chạm văn hóa, nối hành trình

Prototype web tĩnh (HTML/CSS/JS, không cần bước build) cho hệ sinh thái du lịch cộng đồng Vĩnh Long: **Trail** (du khách), **Studio** (hộ dân/nghệ nhân), **Cổng dữ liệu quản lý** và **Cổng vận hành** (kèm vai trò **Cố vấn cộng đồng** quyền hạn chế). Toàn bộ yêu cầu gốc nằm trong `Prompt-Claude-Vinh-Long.md`.

> Đây là bản demo. Dữ liệu lưu trong `localStorage` của trình duyệt bạn đang dùng — không đồng bộ giữa nhiều người hay nhiều thiết bị. AI, thanh toán, thông báo, bản đồ mật độ, dự báo... đều là mô phỏng, gắn nhãn rõ trong giao diện.

## Trạng thái dự án

Đã hoàn thành toàn bộ 6 phase tính năng (nền tảng, dữ liệu địa danh, cá nhân hóa/booking/hậu chuyến đi, Studio, Cổng dữ liệu quản lý + Cổng vận hành) và đang ở phase cuối — chuẩn bị deploy. Xem `PROGRESS.md` (nhật ký chi tiết từng phase, các lỗi đã phát hiện và sửa khi kiểm thử) và `REQUIREMENTS_MATRIX.md` (đối chiếu từng yêu cầu spec → màn hình → trạng thái). Tóm tắt đối chiếu nhanh ở mục [Đối chiếu specification](#đối-chiếu-specification) bên dưới.

## Chạy thử ở máy local

Cần một static file server (không bắt buộc Node.js, nhưng dự án có sẵn script dùng Node.js cho tiện):

```bash
npm run dev
```

Lệnh trên chạy `npx serve . -l 5500` — mở trình duyệt tại `http://localhost:5500`.

Không có Node.js/npm? Dùng cách khác cũng chạy y hệt vì đây là site tĩnh thuần:

```bash
# Python 3
python -m http.server 5500

# hoặc VS Code: mở thư mục, cài extension "Live Server", bấm "Go Live"
```

Không mở trực tiếp file `index.html` bằng `file://` — trình duyệt sẽ chặn `import` module và fetch dữ liệu; luôn chạy qua một static server (local hoặc production).

## Cấu trúc thư mục

```
index.html            Shell HTML duy nhất, mount nội dung theo hash route
data/
  destinations.json    Dữ liệu địa danh đã chuẩn hoá (verified/estimated/missing theo từng trường)
assets/
  icons/                Favicon SVG
  images/destinations/  Ảnh thật đã tải cho 17/37 địa danh (còn lại dùng placeholder tự sinh)
css/                  tokens (màu/spacing) → base → layout → components → trail, gộp qua styles.css
js/
  app.js              Hash router — toàn bộ route của Trail/Studio/Admin/Ops khai báo tại đây
  storage.js          localStorage có schema version; tách "nội dung" (destinations/hosts/
                      experiences/events/reviews/metrics — nạp mới mỗi phiên) khỏi "dữ liệu
                      người dùng" (yêu thích, hành trình, booking, đề án... mới lưu localStorage)
  data.js             Dữ liệu mẫu hosts/experiences/slot/sự kiện/đánh giá/số liệu báo cáo minh hoạ
  utils.js, ui.js     Hàm dùng chung (escape HTML, tìm kiếm không dấu, toast, modal, tự nhận
                      diện danh mục/màu/icon từ dữ liệu, mô phỏng mật độ khách...)
  services/           Adapter mô phỏng — không có backend thật, sẽ nối API thật sau này:
                      aiService (gợi ý hành trình rule-based), paymentService (thanh toán demo),
                      mapService (bọc Leaflet + fallback), notificationService, bookingService
                      (giữ chỗ/booking/hoàn tiền), cpsService (điểm chất lượng hộ), csvService
                      (xuất CSV), destinationsService (nạp + chuẩn hoá data/destinations.json)
  welcome.js          Màn chào + Cổng quản lý (danh sách 3 vai trò demo)
  trail/              Vai trò du khách: shell, explore (bản đồ+danh sách+lọc), placeDetail,
                      itinerary (form cá nhân hoá + kết quả), itineraryDetail (timeline/heatmap/
                      hỗ trợ), booking, passport, profile
  studio/             Vai trò hộ dân: shell, overview, experiences (đăng/sửa trải nghiệm),
                      bookings, reports (báo cáo + CPS), support (đề án + ngoại lệ CPS)
  admin/              Cổng dữ liệu quản lý: shell, filters (bộ lọc dùng chung), metrics, overview,
                      flow (heatmap+phân khúc), demand (cầu/cơ hội), proposals (hộp thư đề án), reports (CSV)
  ops/                Cổng vận hành: shell, bookings (booking+giao dịch), content (kiểm duyệt),
                      tickets (sự cố), quality (CPS+huy hiệu+ngoại lệ), community (Cố vấn cộng
                      đồng — trang riêng, quyền hạn chế, không dùng chung shell với Ops đầy đủ)
```

## Ghi chú kỹ thuật quan trọng

- **Không có backend/database thật.** Mọi vai trò (du khách/hộ dân/quản lý/vận hành) chạy trên cùng một trình duyệt, dùng chung một bộ dữ liệu `localStorage` để trình diễn luồng liên kết (vd: booking tạo ở Trail hiện ngay trong Studio, đề án gửi từ Studio xử lý được ngay ở Cổng dữ liệu quản lý) — không phải đồng bộ nhiều người dùng thật.
- **Không nhúng API key** nào trong mã nguồn frontend. Đã rà soát toàn bộ `js/` — không có khóa bí mật, mật khẩu hay token nào bị commit.
- Toàn bộ đường dẫn asset/script/import trong dự án đều **tương đối** (`./...`), không có đường dẫn tuyệt đối (`/...`) — chạy đúng cả ở domain gốc lẫn dưới một repo con trên GitHub Pages (`user.github.io/ten-repo/`).
- Định tuyến dùng **hash routing** (`#/trail/explore`...) nên tải lại trang (F5) hoặc mở thẳng một đường dẫn sâu (deep link) ở bất kỳ màn hình nào cũng không bị lỗi 404 — hash không gửi lên server, GitHub Pages chỉ cần phục vụ đúng `index.html` ở gốc. Đã kiểm thử tải lại trực tiếp trên các route: hồ sơ địa điểm, Studio, Cổng dữ liệu quản lý, Cổng vận hành.
- Bản đồ dùng **Leaflet** tải qua CDN (unpkg); biểu đồ báo cáo dùng **Chart.js** tải qua CDN (cdnjs). Cả hai đều có phương án dự phòng khi mạng chặn/CDN lỗi (danh sách thay bản đồ; bảng số liệu chữ thay biểu đồ) — đã kiểm thử thật trong môi trường chặn CDN.
- Dữ liệu địa danh trong `data/destinations.json` (37 mục) đến từ nghiên cứu nguồn công khai có trích dẫn — mỗi trường (địa chỉ, giờ mở, giá, đánh giá, toạ độ...) mang trạng thái `verified` / `estimated` / `missing` rõ ràng, không tự bịa. 23/37 địa danh chưa có toạ độ xác thực nên chưa hiện marker trên bản đồ (vẫn có trong danh sách, dùng link tìm-kiếm-theo-tên để chỉ đường). Xem `DATA_ISSUES.md` để biết chi tiết từng trường hợp và các mâu thuẫn đã phát hiện.
- Số liệu doanh thu/khách 12 tháng ở Studio và Cổng dữ liệu quản lý là **dữ liệu minh hoạ có nhãn rõ**, xác định theo id (ổn định trong phiên, không đổi ngẫu nhiên mỗi lần vẽ lại) — tháng hiện tại luôn được ghi đè bằng số liệu thật tính từ booking thật để biểu đồ không bao giờ mâu thuẫn với bảng dữ liệu.

## Đối chiếu specification

Đối chiếu đầy đủ từng mục spec (16 mục) nằm ở `REQUIREMENTS_MATRIX.md`. Tóm tắt nhanh theo 3 nhóm:

**Đã hoạt động thật với dữ liệu demo** (thao tác được, không chỉ là giao diện tĩnh):
Khám phá + bản đồ + lọc/tìm kiếm; hồ sơ địa điểm + hoạt động trả phí; cá nhân hóa tạo hành trình (thuật toán rule-based) + sửa/xoá/sắp xếp điểm; booking + giữ chỗ có TTL + thanh toán demo; hộ chấp nhận/từ chối booking trong Studio; xác nhận hoàn thành + Passport + điểm thưởng + voucher; đánh giá 2 chiều; hỗ trợ sự cố + hoàn tiền theo chính sách; Studio đầy đủ (đăng trải nghiệm, lịch/booking, báo cáo, CPS, đề án); Cổng dữ liệu quản lý đầy đủ (KPI, luồng khách, nhu cầu/cơ hội, hộp thư đề án, báo cáo + CSV); Cổng vận hành đầy đủ (booking/giao dịch, kiểm duyệt nội dung, sự cố, chất lượng/huy hiệu, duyệt ngoại lệ CPS); Cố vấn cộng đồng (quyền hạn chế); phân quyền hiển thị dữ liệu đã kiểm thử giữa các vai trò (CPS không lộ ra Cổng quản lý/khách).

**Đang mô phỏng, gắn nhãn rõ** (không giả vờ là hệ thống thật):
AI gợi ý hành trình/cải thiện (rule-based, ghi "Gợi ý tự động — bản demo"); thanh toán/hoàn tiền/giải ngân (không chuyển tiền thật); thông báo in-app; heatmap mật độ khách; dự báo doanh thu (ngoại suy tuyến tính, ghi rõ giới hạn); QR/mã booking dạng chữ (không phải ảnh QR quét được); chuyển vai trò giữa Trail/Studio/Admin/Ops (công cụ demo, không phải xác thực thật); dữ liệu báo cáo 12 tháng (minh hoạ, tháng hiện tại là thật).

**Để phát triển sau** (đúng roadmap, không phải bỏ sót):
Ngân sách cá nhân hóa (3 phương án Tiết kiệm/Cân bằng/Trải nghiệm) — cấu hình tắt mặc định theo đúng yêu cầu; B2B/lữ hành; chia sẻ/in hành trình; nhập giọng nói thật (chỉ có phương án gõ tay); bản dịch/audio tiếng Khmer thật; tích hợp production (xem mục dưới).

## Deploy

### GitHub Pages

1. Tạo repository mới trên GitHub (public hoặc private đều bật Pages được), rồi làm theo hướng dẫn ở cuối tài liệu này để đẩy code lên nhánh `main`.
2. Vào repo trên GitHub → **Settings** → mục **Pages** (khung bên trái) → phần **Build and deployment** → **Source** chọn **Deploy from a branch**.
3. Ở **Branch**, chọn `main` và thư mục `/ (root)` → **Save**.
4. Đợi khoảng 1 phút, tải lại trang Settings → Pages sẽ hiện đường dẫn dạng `https://<tên-tài-khoản>.github.io/<tên-repo>/`. Mở link đó để xem site.
5. Không cần chỉnh sửa gì thêm cho đường dẫn repo con: toàn bộ CSS/JS/ảnh trong dự án dùng đường dẫn tương đối và định tuyến hash, nên chạy đúng ngay dưới `/<tên-repo>/` mà không lệch link như khi dùng đường dẫn tuyệt đối.
6. Mỗi lần `git push` lên `main` sau đó, GitHub Pages tự build lại (xem tiến trình ở tab **Actions** của repo) — thường xong sau 1–2 phút.

Lưu ý về cache: nếu vừa deploy bản cập nhật mà trình duyệt vẫn hiện giao diện cũ, hãy tải lại cứng (Ctrl+Shift+R / Cmd+Shift+R) — dự án chưa cấu hình cache-busting cho tên file tĩnh (xem mục "Tích hợp production còn thiếu").

### Hostinger

Vì đây là site tĩnh, chỉ cần tải toàn bộ nội dung thư mục dự án (trừ `.git`, `node_modules` nếu có do lỡ chạy `npm install`) vào `public_html` (hoặc thư mục con) qua File Manager hoặc FTP của hPanel:

1. Nén toàn bộ thư mục dự án thành file `.zip` (giữ nguyên cấu trúc, `index.html` phải nằm ở gốc file zip).
2. Đăng nhập hPanel Hostinger → **File Manager** → vào `public_html` (hoặc thư mục con nếu deploy dưới một đường dẫn phụ, ví dụ `public_html/vinhlong`).
3. Tải file `.zip` lên rồi bấm **Extract** (giải nén) ngay trong File Manager.
4. Xoá file `.zip` sau khi giải nén xong (không bắt buộc, nhưng gọn hơn).
5. Không cần cấu hình Node.js runtime hay build step nào — Hostinger chỉ cần phục vụ file tĩnh. Truy cập domain (hoặc `domain.com/vinhlong` nếu để thư mục con) để xem site.

## Kiểm thử thực tế

Kết quả kiểm thử chi tiết theo từng phase (bằng trình duyệt thật, không suy đoán) nằm trong `PROGRESS.md`. Tóm tắt nhanh 2 phase đầu (nền tảng + dữ liệu) ở bảng dưới đây; Phase 3–6 (cá nhân hoá/booking/hậu chuyến đi, Studio, Cổng dữ liệu quản lý + Cổng vận hành) xem mục "Chi tiết Phase 4/5/6" trong `PROGRESS.md`, bao gồm cả các lỗi thật đã phát hiện và sửa khi kiểm thử qua UI (không chỉ khai báo suông).

| Kịch bản | Kết quả |
|---|---|
| Trang chào → Trail → bản đồ tải, marker/list đồng bộ khi lọc | ✅ Pass |
| Tìm kiếm không dấu | ✅ Pass |
| Mở hồ sơ địa điểm → Lưu địa điểm → reload → còn trong danh sách đã lưu | ✅ Pass |
| Chặn CDN Leaflet (giả lập URL lỗi) → tab Khám phá vẫn hiện danh sách | ✅ Pass |
| Địa điểm bị từ chối định vị (GPS) → chuyển sang chọn điểm trên bản đồ | ✅ Pass |
| Responsive 375 / 768 / 1440px không tràn ngang | ✅ Pass |
| "Khôi phục dữ liệu mẫu" có xác nhận, không tự xoá khi reload thường | ✅ Pass |
| Route lạ (`#/khong-ton-tai`) tự chuyển về `#/` | ✅ Pass |
| Nạp `data/destinations.json` (37 địa danh), tự sinh danh mục/bộ lọc | ✅ Pass |
| Trạng thái verified/estimated/missing hiển thị đúng, mâu thuẫn dữ liệu được cảnh báo công khai | ✅ Pass |

### Kiểm thử cuối cùng trước deploy (phase này)

- Rà soát toàn bộ `js/` không có API key/secret/token bị commit — không tìm thấy.
- Xác nhận mọi import/link/asset dùng đường dẫn tương đối (không có `/...` tuyệt đối nào trong `js/` hoặc CSS).
- Tải lại trang (F5 thật, không phải điều hướng trong SPA) trực tiếp ở nhiều route sâu khác nhau (hồ sơ địa điểm, Studio → Báo cáo, Cổng dữ liệu quản lý → Nhu cầu & Cơ hội) — tất cả tải đúng nội dung, không lỗi console, không màn trắng.
- Route không tồn tại tự chuyển về trang chào, không vỡ giao diện.
- Kiểm tra responsive 375px cho các trang mới (Cổng dữ liệu quản lý, Cổng vận hành) — bảng dữ liệu rộng cuộn ngang trong khung riêng, trang không tràn ngang.
- Dữ liệu người dùng (yêu thích, booking...) sống sót qua nhiều lần tải lại trang liên tiếp — xem mục lỗi nghiêm trọng đã sửa bên dưới.

Hai lỗi thật phát hiện và đã sửa trong lúc kiểm thử phase này (chi tiết đầy đủ ở `PROGRESS.md` — mục "Chi tiết Phase 6"):
1. **Mất dữ liệu người dùng khi tải lại trang thật** — một trường `schemaVersion` cũ sót lại từ Phase 1 trong `js/data.js` bị vòng lặp copy trong `defaultUserData()` (`js/storage.js`) ghi đè nhầm lên giá trị đúng, khiến lần lưu đầu tiên ghi sai phiên bản schema; lần tải lại kế tiếp coi dữ liệu không hợp lệ và xoá sạch. Đã sửa, kiểm thử lại qua 3 lần tải lại liên tiếp.
2. **Tính sai chính sách hoàn tiền theo múi giờ** — `computeRefundAmount` cắt chuỗi ngày ISO (UTC) rồi ghép giờ hẹn local, lệch một ngày ở múi giờ Việt Nam (UTC+7) trong một số trường hợp. Đã sửa bằng getter ngày giờ địa phương, kiểm thử lại đúng qua UI Cổng vận hành.

## Tuỳ biến nhanh

- **Màu sắc/spacing**: sửa biến CSS trong `css/tokens.css`.
- **Địa danh**: sửa/thêm mục trong `data/destinations.json` (giữ đúng cấu trúc `{value, status, note}` cho từng trường) — không cần đụng vào logic hiển thị; danh mục/bộ lọc/thống kê tự cập nhật theo dữ liệu mới.
- **Trải nghiệm trả phí/slot/sự kiện mẫu**: sửa trong `js/data.js` (`buildExperiences`, `buildEvents`), tham chiếu `destinationId` phải khớp `id` trong `data/destinations.json`.
- **Tiêu chí huy hiệu "Được ghi nhận"**: mặc định đọc cờ `badge.recognized` + `badge.note` trên từng địa danh trong `data/destinations.json`; Cổng vận hành (`#/ops/quality`) có thể cấp/thu hồi có lý do ngay trong giao diện, ghi đè cờ tĩnh này (lưu ở `hostRecognitionOverrides` trong `js/storage.js`).
- **Trọng số/ngưỡng CPS** (điểm chất lượng nội bộ hộ): sửa `CPS_WEIGHTS`, `NEW_SPOTLIGHT_MIN_BOOKINGS`, `RECOGNIZED_ELIGIBLE_THRESHOLD`, `NEEDS_IMPROVEMENT_THRESHOLD` ở đầu file `js/services/cpsService.js`.
- **Hoa hồng Network** (Cổng dữ liệu quản lý → Báo cáo): hằng số `NETWORK_COMMISSION_RATE` ở đầu file `js/admin/reports.js`.
- **Ngưỡng ẩn nhóm nhỏ** (phản hồi ẩn danh, tránh nhận diện cá nhân/hộ): hằng số `MIN_OBSERVATIONS` ở đầu file `js/admin/reports.js`.
- **Thêm tính năng mới**: thêm route trong `js/app.js` trỏ tới 1 module mới trong `js/trail/`, `js/studio/`, `js/admin/` hoặc `js/ops/` — không cần sửa các module đã có.

## Tích hợp production còn thiếu

Danh sách đầy đủ những gì cần thay thế/bổ sung để chạy thật (không phải demo):

- **Xác thực & phân quyền server thật** — hiện tại "chuyển vai trò" (chọn hộ ở Studio, vào Cổng quản lý/vận hành) chỉ là công cụ trải nghiệm demo trong một trình duyệt, không có đăng nhập/kiểm tra quyền phía server.
- **Database dùng chung thật** (Postgres/MySQL/Firestore...) thay cho `localStorage` — để nhiều người dùng/thiết bị thấy cùng dữ liệu thời gian thực.
- **Khoá chỗ nguyên tử** phía server cho booking (hiện tại giữ chỗ có TTL chỉ mô phỏng trong một trình duyệt, không chống được overbooking giữa nhiều thiết bị/tab thật).
- **Cổng thanh toán thật** (VNPay/Momo/thẻ...) thay `paymentService.js` — hiện không thu thông tin thẻ thật, không chuyển tiền thật.
- **Dịch vụ gửi thông báo thật** (SMS/email/push) thay `notificationService.js` (hiện chỉ toast trong trang).
- **AI thật** (LLM hoặc dịch vụ gợi ý có huấn luyện) thay thuật toán rule-based trong `aiService.js`/`cpsService.js` — hiện tại minh bạch ghi "bản demo", không giả vờ là AI.
- **Dịch vụ định tuyến bản đồ thật** (thời gian di chuyển ước tính hiện tại chỉ dựa trên khoảng cách đường chim bay).
- **Dữ liệu mật độ khách thật** (cảm biến/check-in thật) thay cơ chế mô phỏng xác định theo giờ trong `getSimulatedCrowdLevel` (`js/utils.js`).
- **Tác vụ nền định kỳ thật** (cron job phía server) cho giải ngân theo thời gian thật, hết hạn giữ chỗ, cập nhật CPS theo tuần — hiện tại dùng nút bấm mô phỏng vì không có server chạy nền khi đóng trình duyệt.
- **Quy trình vận hành thật** cho kiểm duyệt/xử lý ticket/duyệt đề án — hiện tại tài khoản vận hành/quản lý trong demo là giả lập, chưa có hàng đợi phân công thật giữa nhiều nhân sự.
- **Cache-busting cho asset tĩnh** khi deploy bản cập nhật (hiện tại tên file CSS/JS không có hash version, người dùng có thể cần tải lại cứng để thấy bản mới).
