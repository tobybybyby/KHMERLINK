# Bảng đối chiếu yêu cầu → màn hình/chức năng → trạng thái

Nguồn yêu cầu: `Prompt-Claude-Vinh-Long.md`. Trạng thái: **Hoạt động (demo)** = thao tác được thật với dữ liệu mẫu · **Mô phỏng** = có luồng nhưng kết quả giả lập rõ nhãn · **Giai đoạn sau** = chưa xây, có trong roadmap.

| Mục spec | Yêu cầu | Màn hình/chức năng | Trạng thái |
|---|---|---|---|
| 1 | Phạm vi tổng thể, ưu tiên trong ngày, ngân sách cá nhân hóa tắt mặc định | Toàn hệ thống | Kiến trúc tuân thủ; ngân sách chưa bật (đúng yêu cầu) |
| 1 | Một huy hiệu duy nhất "Được ghi nhận" | Hồ sơ địa điểm | Hoạt động (demo) |
| 2 | Site tĩnh, không build step, hash routing | Toàn site | Hoạt động (demo) |
| 2 | Tách mã nguồn theo module | Cấu trúc thư mục | Hoạt động (demo) |
| 2 | Mọi nút chính hoạt động thật | Trail Khám phá + Hồ sơ | Hoạt động (demo) trong phạm vi Phase 1 |
| 2 | localStorage có schema version, không mất khi reload | `js/storage.js` | Hoạt động (demo) |
| 2 | Nút "Khôi phục dữ liệu mẫu" có xác nhận | Tab Cá nhân | Hoạt động (demo) |
| 2 | Nhãn demo cho AI/thanh toán/thông báo | Toàn site | Hoạt động (demo) — áp dụng dần theo phase xây tính năng đó |
| 2 | Adapter cho 5 service | `js/services/*.js` | Hoạt động (demo) — interface sẵn, logic đầy đủ theo phase liên quan |
| 2 | Loading/rỗng/lỗi/fallback, render an toàn | Toàn site | Hoạt động (demo) |
| 2 | Mobile bottom nav, desktop sidebar/topnav | Trail shell | Hoạt động (demo) |
| 3 | Phong cách thị giác, responsive 375/768/1440 | `css/*` | Hoạt động (demo) |
| 4 | Màn chào 2 lựa chọn + Cổng quản lý | `welcome.js` | Hoạt động (demo) |
| 4 | Trail 4 tab | `trail/shell.js` | Khám phá + Cá nhân: Hoạt động (demo); Hành trình/Hộ chiếu: Giai đoạn sau |
| 4 | Studio 5 tab | — | Giai đoạn sau (Phase 6) |
| 4 | Cổng quản lý 4 tab | — | Giai đoạn sau (Phase 7) |
| 4 | Cổng vận hành 4 khu | — | Giai đoạn sau (Phase 8) |
| 5.1 | Bản đồ tương tác, pan/zoom/marker/cluster/vị trí của tôi | `trail/explore.js`, `services/mapService.js` | Hoạt động (demo) |
| 5.1 | Thống kê nhỏ, không giả số liệu tỉnh thật | Khám phá | Hoạt động (demo) |
| 5.1 | Danh sách/marker đồng bộ, bottom sheet/panel | Khám phá | Hoạt động (demo) |
| 5.1 | Tìm kiếm không dấu, các bộ lọc | Khám phá | Hoạt động (demo) |
| 5.1 | Mới trên mạng lưới / Thường đi cùng nhau / Sự kiện sắp tới | Khám phá | Hoạt động (demo) |
| 5.2 | Hồ sơ địa điểm gọn theo lớp, mục mở rộng | `trail/placeDetail.js` | Hoạt động (demo) |
| 5.2 | Hoạt động trả phí tách khỏi tham quan miễn phí | Hồ sơ địa điểm | Hoạt động (demo) |
| 5.2 | Không lộ trường vận hành nội bộ cho khách | Hồ sơ địa điểm | Hoạt động (demo) |
| 6 | Form từng bước tạo hành trình | — | Giai đoạn sau (Phase 2) |
| 6 | Kết quả 2–3 phương án, thuật toán rule-based | — | Giai đoạn sau (Phase 2) |
| 7 | Booking, giữ chỗ, thanh toán demo, combo | — | Giai đoạn sau (Phase 3) |
| 8 | Trong chuyến đi, heatmap, QR/audio, hỗ trợ sự cố | — | Giai đoạn sau (Phase 4) |
| 9 | Đánh giá, Traveller Passport, điểm/voucher | — | Giai đoạn sau (Phase 5) |
| 10 | Studio: tổng quan/đăng trải nghiệm/booking/báo cáo/CPS/đề án | — | Giai đoạn sau (Phase 6) |
| 11 | Cổng dữ liệu quản lý | — | Giai đoạn sau (Phase 7) |
| 12 | Cổng vận hành & cố vấn cộng đồng | — | Giai đoạn sau (Phase 8) |
| 13 | Quy tắc dữ liệu dùng chung, trạng thái nhất quán | `js/storage.js`, `js/data.js` | Hoạt động (demo) cho phần đã xây (yêu thích, dữ liệu địa điểm); phần booking/giải ngân áp dụng khi xây phase sau |
| 13 | Dữ liệu minh hoạ có nhãn, không bịa giá/lịch/nhận xét | `data/destinations.json`, `DATA_ISSUES.md` | Hoạt động (demo) — Phase 2: 37 địa danh, mỗi trường gắn trạng thái verified/estimated/missing, mâu thuẫn được ghi nhận công khai thay vì che giấu |
| 14 | Yêu thích/nháp/lịch sử, tìm kiếm không dấu, tiếp cận đúng ngữ cảnh | Khám phá + Hồ sơ | Hoạt động (demo) một phần — chia sẻ/in hành trình chờ phase sau |
| 14 | Trang "Về bản demo" | Tab Cá nhân | Hoạt động (demo) |
| 15 | 12 kịch bản nghiệm thu | — | Chạy đủ và ghi kết quả ở phase cuối; Phase 1-2 chỉ tự kiểm tra phần liên quan (kịch bản 1, 12 một phần) |
| 16 | README, bảng đối chiếu, deploy GitHub Pages/Hostinger | `README.md`, tài liệu này | README hoàn thiện dần; hướng dẫn deploy đầy đủ ở phase cuối |

## Phase 2 — Tích hợp dữ liệu địa danh (theo yêu cầu riêng của người dùng)

| Yêu cầu (từ hội thoại Phase 2) | Màn hình/chức năng | Trạng thái |
|---|---|---|
| Chuẩn hoá dữ liệu 30 địa danh có nguồn thành `data/destinations.json` | `data/destinations.json` | Hoạt động (demo) — 37 mục (30 mới + 7 hợp nhất từ Phase 1) |
| Mỗi trường giữ trạng thái verified/estimated/missing, không bịa toạ độ/địa chỉ/lịch sử | `data/destinations.json`, `js/services/destinationsService.js` | Hoạt động (demo) |
| Tự động tạo danh mục/thống kê/bộ lọc từ dữ liệu | `js/utils.js` (`deriveCategoryVisual`), `js/trail/explore.js` | Hoạt động (demo) — 8 nhóm tự sinh, không hard-code |
| Trang danh sách + trang chi tiết địa danh | `js/trail/explore.js`, `js/trail/placeDetail.js` | Hoạt động (demo) — tái sử dụng màn hình Phase 1, không tạo lại |
| Placeholder cho địa danh chưa có ảnh | `js/utils.js` (`placeholderImageDataUri`) | Hoạt động (demo) — áp dụng cho toàn bộ 37 mục |
| Báo cáo DATA_ISSUES.md (thiếu toạ độ/ảnh/giờ, trùng lặp, mâu thuẫn) | `DATA_ISSUES.md` | Hoàn thành |
| Chưa tìm/tải ảnh từ Internet trong phase này | — | Đúng như yêu cầu — chỉ lưu link tham khảo, chưa tải |

Ghi chú: bảng này cập nhật cuối mỗi phase, không xóa dòng cũ — chỉ đổi trạng thái.
