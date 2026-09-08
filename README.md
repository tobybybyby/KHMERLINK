# Vĩnh Long — Chạm văn hóa, nối hành trình

Prototype web tĩnh (HTML/CSS/JS, không cần bước build) cho hệ sinh thái du lịch cộng đồng Vĩnh Long: **Trail** (du khách), **Studio** (hộ dân/nghệ nhân), **Cổng dữ liệu quản lý** và **Cổng vận hành**. Toàn bộ yêu cầu gốc nằm trong `Prompt-Claude-Vinh-Long.md`.

> Đây là bản demo. Dữ liệu lưu trong `localStorage` của trình duyệt bạn đang dùng — không đồng bộ giữa nhiều người hay nhiều thiết bị. AI, thanh toán, thông báo, bản đồ mật độ, dự báo... đều là mô phỏng, gắn nhãn rõ trong giao diện.

## Trạng thái dự án

Xem `PROGRESS.md` (trạng thái theo phase) và `REQUIREMENTS_MATRIX.md` (đối chiếu từng yêu cầu spec). Dự án triển khai theo 9 phase, hiện đã hoàn thành **Phase 1**.

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
css/                  tokens (màu/spacing) → base → layout → components → trail, gộp qua styles.css
js/
  app.js              Hash router
  storage.js          localStorage có schema version, seed, reset, xử lý lỗi
  data.js             Dữ liệu mẫu (địa điểm, trải nghiệm, slot, sự kiện...)
  utils.js, ui.js     Hàm dùng chung (escape HTML, tìm kiếm không dấu, toast, modal...)
  services/           Adapter mô phỏng: aiService, paymentService, mapService,
                      notificationService, bookingService — sẽ nối API thật sau này
  welcome.js          Màn chào
  comingSoon.js        Khung "sắp có" dùng chung cho các phần chưa tới phase
  trail/               Các màn của vai trò du khách (shell, explore, placeDetail, profile)
assets/icons/          Icon SVG (favicon...)
```

## Ghi chú kỹ thuật quan trọng

- **Không có backend/database thật.** Mọi vai trò (du khách/hộ dân/quản lý/vận hành) chạy trên cùng một trình duyệt, dùng chung một bộ dữ liệu `localStorage` để trình diễn luồng liên kết — không phải đồng bộ nhiều người dùng thật.
- **Không nhúng API key** nào trong mã nguồn frontend.
- Bản đồ dùng **Leaflet** tải qua CDN (unpkg) khi vào tab Khám phá; nếu mạng chặn/CDN lỗi, trang tự chuyển sang chế độ chỉ-danh-sách, không vỡ giao diện.
- Toạ độ các địa điểm dựa trên vị trí thực tế được biết đến rộng rãi ở mức tương đối (minh hoạ khi chưa xác minh chính xác từng mét) — xem ghi chú `verified: false` trong `js/data.js`.

## Deploy

### GitHub Pages
Sẽ hướng dẫn chi tiết (tạo repo, bật Pages, xử lý đường dẫn repo con) ở **Phase 9** sau khi toàn bộ tính năng hoàn thiện — vì bước cấu hình Pages hiện tại trên GitHub thay đổi theo thời gian, sẽ kiểm tra lại giao diện GitHub thực tế trước khi viết hướng dẫn cuối cùng. Trước mắt, do toàn site dùng đường dẫn tương đối và hash routing, việc đẩy nguyên thư mục lên nhánh `main`/`gh-pages` và bật Pages ở bất kỳ thời điểm nào trong quá trình phát triển đều xem được ngay.

### Hostinger
Vì đây là site tĩnh, chỉ cần tải toàn bộ nội dung thư mục (trừ `node_modules` nếu có) vào `public_html` (hoặc thư mục con) qua File Manager/FTP của Hostinger — không cần cấu hình Node.js runtime. Hướng dẫn từng bước đầy đủ sẽ hoàn thiện ở Phase 9.

## Kiểm thử thực tế (Phase 1)

Đã chạy bằng trình duyệt thật (Chromium) trỏ vào static server local, kiểm tra qua DOM/Console/Network — không phải suy đoán.

| Kịch bản | Kết quả |
|---|---|
| Trang chào → Trail → bản đồ tải, marker/list đồng bộ khi lọc | ✅ Pass — 14 marker hiển thị đúng vị trí; lọc "Chỉ trải nghiệm mới" còn 3 kết quả, marker và danh sách cùng giảm còn 3 |
| Tìm kiếm không dấu | ✅ Pass — gõ "chua" khớp đúng 3 địa điểm có chữ "Chùa" |
| Mở hồ sơ địa điểm → Lưu địa điểm → reload → còn trong danh sách đã lưu | ✅ Pass — `localStorage.vlt_state.favorites` giữ đúng ID sau khi tải lại trang; tab Cá nhân hiện đúng "1 địa điểm đã lưu" |
| Chặn CDN Leaflet (giả lập URL lỗi) → tab Khám phá vẫn hiện danh sách | ✅ Pass — hiện thông báo "Không tải được bản đồ", danh sách 14 địa điểm vẫn đầy đủ |
| Địa điểm bị từ chối định vị (GPS) → chuyển sang chọn điểm trên bản đồ | ✅ Pass — banner hiện nút "Chọn điểm trên bản đồ", bấm bản đồ đặt điểm thành công, banner tự ẩn |
| Responsive 375 / 768 / 1440px không tràn ngang | ✅ Pass — `document.documentElement.scrollWidth` = `clientWidth` ở cả 3 mốc; bottom nav + bottom sheet đúng ở 375px, sidebar/topnav đúng ở 768–1440px |
| "Khôi phục dữ liệu mẫu" có xác nhận, không tự xoá khi reload thường | ✅ Pass — modal xác nhận hiện đúng tiêu đề/nội dung; bấm "Khôi phục" mới xoá dữ liệu, F5 thường không mất dữ liệu |
| Đặt trải nghiệm (chưa xây) hiện thông báo đúng, không giả vờ thành công | ✅ Pass — toast "...sẽ hoàn thiện ở Phase 3" |
| Route lạ (`#/khong-ton-tai`) | ✅ Pass — tự chuyển về `#/` |

Ghi chú: đã phát hiện và sửa 2 lỗi trong lúc kiểm thử — (1) khung bản đồ cao 0px ở desktop do CSS `height:100%` không có cơ sở phần trăm hợp lệ (đổi sang flexbox `flex:1`), (2) chip danh mục bị ngắt dòng ở mobile do thiếu `white-space:nowrap`. Plugin gom cụm marker (Leaflet.markercluster) gây marker không hiển thị dù dữ liệu đã nạp đúng — đã gỡ bỏ, dùng marker đơn cho quy mô 14 điểm hiện tại.

## Tuỳ biến nhanh

- **Màu sắc/spacing**: sửa biến CSS trong `css/tokens.css`.
- **Địa điểm/trải nghiệm/slot**: sửa mảng trong `js/data.js`, không cần đụng vào logic hiển thị.
- **Tiêu chí huy hiệu "Được ghi nhận"**: cờ `recognized` + `recognizedReason` trên từng địa điểm trong `js/data.js`; tooltip đọc trực tiếp từ đó.
- **Thêm tính năng mới**: thêm route trong `js/app.js` trỏ tới 1 module mới trong `js/trail/` (hoặc `js/studio|admin|ops/` ở phase sau) — không cần sửa các module đã có.

## Tích hợp production còn thiếu (liệt kê đầy đủ ở Phase 9)

Xác thực & phân quyền server, database dùng chung thật, khoá chỗ nguyên tử, cổng thanh toán thật, dịch vụ gửi thông báo thật, AI thật, dịch vụ định tuyến bản đồ, dữ liệu mật độ thật, tác vụ nền định kỳ, quy trình vận hành thật.
