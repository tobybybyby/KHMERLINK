# PROGRESS — Vĩnh Long Trail & Studio

Cập nhật lần cuối: Phase 1 — 2026-09-09

Quy ước trạng thái: **Done** (đã thao tác được thật, đã kiểm tra) / **In progress** / **Later** (đúng roadmap, chưa tới lượt).

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Nền tảng (scaffolding, data layer, adapter, routing) | Done | Xem chi tiết bên dưới |
| 1 | Trail — Khám phá (bản đồ + danh sách + lọc/tìm kiếm) | Done | Leaflet, fallback khi lỗi mạng |
| 1 | Trail — Hồ sơ địa điểm/trải nghiệm | Done | Lưu yêu thích hoạt động, đặt/booking để Phase 3 |
| 1 | Trail — Cá nhân (Về bản demo + khôi phục dữ liệu mẫu) | Done | Điểm thưởng/Passport đầy đủ ở Phase 5 |
| 2 | Cá nhân hóa & tạo hành trình | Later | |
| 3 | Booking, thanh toán demo, giữ chỗ | Later | |
| 4 | Trong chuyến đi, heatmap, QR/audio, hỗ trợ | Later | |
| 5 | Sau chuyến đi: đánh giá, Passport, điểm thưởng | Later | |
| 6 | Studio (hộ dân/nghệ nhân) | Later | Route đã có, hiện placeholder |
| 7 | Cổng dữ liệu quản lý | Later | Route đã có, hiện placeholder |
| 8 | Cổng vận hành & cố vấn cộng đồng | Later | Route đã có, hiện placeholder |
| 9 | Hoàn thiện, nghiệm thu đủ 12 kịch bản, deploy GitHub Pages + Hostinger | Later | |

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
- Màn chào 2 lựa chọn + link "Cổng quản lý" (điều hướng thật, portal thật xây ở Phase 6-8).
- Hash routing, F5 ở trang con không lỗi 404, route lạ tự chuyển về trang chào.
- Dữ liệu mẫu 14 địa điểm/trải nghiệm + 5 trải nghiệm trả phí + 1 sự kiện, khởi tạo vào localStorage có `schemaVersion`, không mất khi reload.
- Nút "Khôi phục dữ liệu mẫu" (tab Cá nhân) có hộp xác nhận, reseed toàn bộ dữ liệu.
- Xử lý dữ liệu localStorage bị hỏng (JSON lỗi) — tự seed lại, không crash trắng trang.
- Bản đồ Leaflet: pan/zoom, marker theo loại (màu/icon khác nhau), nút "Vị trí của tôi" (xin quyền khi bấm; từ chối/không hỗ trợ → chuyển sang chọn điểm trên bản đồ). Gom cụm marker (marker clustering) tạm để lại Phase sau — thư viện plugin clustering gây lỗi hiển thị không ổn định khi thử nghiệm, đã gỡ để ưu tiên độ ổn định với 14 điểm hiện tại (chưa cần thiết ở quy mô này).
- Danh sách card đồng bộ 2 chiều với marker (lọc/tìm kiếm cập nhật cả hai; bấm marker mở popup có nút "Xem chi tiết"; bấm card highlight marker).
- Tìm kiếm không phân biệt dấu; lọc theo loại hình, sở thích, thời gian, khoảng cách (khi đã có điểm xuất phát), còn chỗ, đánh giá cao, mới.
- Khối "Mới trên mạng lưới", "Thường trải nghiệm cùng nhau", "Sự kiện sắp tới".
- Hồ sơ địa điểm: thông tin rút gọn theo lớp, mục mở rộng (Bạn có thể làm gì/Câu chuyện/Cần biết trước khi đến/Đánh giá), card hoạt động trả phí riêng biệt hoạt động miễn phí.
- "Lưu địa điểm" (yêu thích) — bấm là lưu ngay vào localStorage, còn nguyên sau reload, danh sách yêu thích không tăng trùng khi bấm nhiều lần.
- "Thêm vào hành trình" — lưu nháp vào bộ nhớ dùng chung, có thông báo rõ phần sắp xếp lịch trình hoàn thiện ở Phase 2.
- "Đặt trải nghiệm" — thông báo rõ ràng tính năng đặt chỗ/thanh toán ở Phase 3, không giả vờ đã đặt thành công.
- Fallback khi Leaflet không tải được (chặn mạng) — vẫn xem được danh sách địa điểm.
- Responsive 375/768/1440px, focus-visible rõ, nút hỗ trợ và điều hướng dùng được bằng bàn phím.

### Cách kiểm tra
1. `npm run dev` (hoặc mở `index.html` bằng bất kỳ static server nào, xem README).
2. Từ trang chào bấm "Tôi là du khách" → tab Khám phá.
3. Gõ tìm kiếm không dấu (vd: "chua"), bật lọc "Còn chỗ"/"Đánh giá cao" → danh sách và marker cùng đổi.
4. Bấm một card → xem hồ sơ chi tiết → bấm "Lưu địa điểm" → quay lại → F5 trang → vào lại Khám phá vẫn thấy trạng thái đã lưu (kiểm tra qua tab Cá nhân đếm số đã lưu).
5. Vào tab Cá nhân → bấm "Khôi phục dữ liệu mẫu" → xác nhận → dữ liệu reseed.
6. Thử tắt mạng/chặn domain `unpkg.com` trong DevTools → tải lại tab Khám phá → vẫn thấy danh sách, có thông báo bản đồ không tải được.

### Đã kiểm thử thực tế trong phiên này
- Chạy local server, duyệt qua Console/Network bằng Browser tool: ghi kết quả thật (pass/fail) ở mục "Kiểm thử thực tế" trong `README.md` sau khi chạy xong — không đánh dấu Done nếu chưa chạy được.

### Còn lại (không phải bỏ sót, đúng roadmap)
Toàn bộ mục 6–14 của spec: tạo hành trình, booking/thanh toán, heatmap, QR/audio, Passport/điểm thưởng, Studio, Cổng quản lý, Cổng vận hành, và hoàn thiện deploy GitHub Pages/Hostinger — thực hiện ở Phase 2–9 theo kế hoạch đã duyệt.
