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
| 4 | Studio 5 tab | `js/studio/shell.js` | Hoạt động (demo) — sidebar desktop / bottom-nav mobile |
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
| 6 | Form từng bước tạo hành trình | `trail/itinerary.js` | Hoạt động (demo) — 4 bước |
| 6 | Kết quả 2–3 phương án, thuật toán rule-based | `services/aiService.js` | Hoạt động (demo) — chỉ hiện phương án khác biệt thật, không fake |
| 6 | Thêm/xoá/thay thế/sắp xếp điểm, tính lại giờ/giá | `trail/itineraryDetail.js` | Hoạt động (demo) |
| 6 | Kiểm tra giờ mở/thời lượng/khoảng cách/sức chứa | `services/aiService.js`, `services/bookingService.js` | Hoạt động (demo) — chặn vượt sức chứa đã kiểm thử thật |
| 7 | Booking, giữ chỗ có TTL, thanh toán demo, combo | `trail/booking.js`, `services/bookingService.js`, `services/paymentService.js` | Hoạt động (demo) — hộ phản hồi thật trong Studio (`studio/bookings.js`), không còn mô phỏng ở Trail |
| 7 | Chính sách huỷ/hoàn tiền theo mốc thời gian | `services/bookingService.js` | Hoạt động (demo, minh hoạ) |
| 8 | Hành trình đang diễn ra, đã ghé thăm, hỗ trợ sự cố | `trail/itineraryDetail.js`, `trail/support.js` | Hoạt động (demo) |
| 8 | Heatmap (Khám phá + trong hành trình), đề xuất đổi điểm | `trail/explore.js`, `trail/itineraryDetail.js` | Hoạt động (demo, mô phỏng) |
| 9 | Đánh giá, Traveller Passport, điểm/voucher | `trail/passport.js` | Hoạt động (demo) |
| 10 | Studio: tổng quan/đăng trải nghiệm/booking/báo cáo/CPS/đề án | `js/studio/*.js`, `js/services/cpsService.js` | Hoạt động (demo) — chi tiết ở bảng Phase 5 bên dưới |
| 11 | Cổng dữ liệu quản lý | `js/admin/*.js` | Hoạt động (demo) — chi tiết ở bảng Phase 6 bên dưới |
| 12 | Cổng vận hành & cố vấn cộng đồng | `js/ops/*.js` | Hoạt động (demo) — chi tiết ở bảng Phase 6 bên dưới |
| 13 | Quy tắc dữ liệu dùng chung, trạng thái nhất quán | `js/storage.js`, `js/data.js` | Hoạt động (demo) — đã kiểm thử thật cho booking (Trail↔Studio) và đề án/ngoại lệ CPS/kiểm duyệt (Studio↔Admin/Ops), cùng dữ liệu `state.*`. Phát hiện và sửa lỗi nghiêm trọng ở Phase 6: schema version bị ghi sai khiến dữ liệu người dùng mất khi tải lại trang thật — xem PROGRESS.md |
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

## Phase 5 — Hoàn thiện Studio dành cho hộ cung cấp trải nghiệm (theo yêu cầu riêng của người dùng)

| Yêu cầu (từ hội thoại Phase 5) | Màn hình/chức năng | Trạng thái |
|---|---|---|
| Tổng quan doanh thu, khách, booking, đánh giá | `js/studio/overview.js` | Hoạt động (demo) — tính trực tiếp từ `state.bookingItems`/`state.bookings`, không số liệu giả |
| Tạo và chỉnh sửa trải nghiệm | `js/studio/experiences.js`, `upsertHostExperience` (`js/storage.js`) | Hoạt động (demo) — nháp → gửi duyệt → Cổng vận hành/cố vấn cộng đồng duyệt thật (Phase 6, `js/ops/content.js`) → hiển thị ngay ở hồ sơ địa điểm Trail |
| Quản lý lịch, sức chứa, booking | `js/studio/experiences.js` (slot), `js/studio/bookings.js` | Hoạt động (demo) — thêm/đóng-mở/xoá khung giờ, xoá bị chặn khi đã có khách đặt |
| Chấp nhận / từ chối booking | `js/studio/bookings.js`, `respondToBooking` (`js/services/bookingService.js`) | Hoạt động (demo) — chuyển hẳn từ Trail (Phase 4 mô phỏng) sang Studio (hành động thật) |
| Xác nhận hoàn thành | `completeBookingItem` (`js/services/bookingService.js`) | Hoạt động (demo) — cộng Passport + điểm thưởng bên Trail, đã kiểm thử không cộng trùng |
| Thu nhập, khoản chờ nhận, giải ngân mô phỏng | `js/studio/overview.js`, `releasePayout` (`js/services/bookingService.js`) | Hoạt động (demo) — chặn giải ngân khi còn ticket hỗ trợ mở |
| Báo cáo kinh doanh | `js/studio/reports.js` | Hoạt động (demo) — Chart.js qua CDN có fallback bảng chữ (đã kiểm thử lỗi tải thật); tháng hiện tại luôn khớp dữ liệu booking thật |
| CPS nội bộ | `js/services/cpsService.js` | Hoạt động (demo) — công thức có trọng số công khai, New Spotlight cho hộ mới &lt;3 booking, không gắn nhãn kém chất lượng |
| Gợi ý cải thiện dựa trên dữ liệu | `js/services/cpsService.js` (`generateSuggestions`), `js/studio/reports.js` | Hoạt động (demo) — chỉ dùng lượt xem/booking/sức chứa thật, không bịa số |
| Gửi/theo dõi đề án hỗ trợ | `js/studio/support.js`, `createProposal`/`setProposalStatus` (`js/storage.js`) | Hoạt động (demo) — quản lý xử lý thật ở Cổng dữ liệu quản lý (Phase 6, `js/admin/proposals.js`), có luồng "yêu cầu bổ sung → hộ cập nhật & gửi lại" |
| Yêu cầu xem xét ngoại lệ CPS | `js/studio/support.js`, `requestCpsException`/`decideCpsException` (`js/storage.js`) | Hoạt động (demo) — vận hành/cố vấn cộng đồng duyệt thật (Phase 6, `js/ops/quality.js`, `js/ops/community.js`); ngoại lệ đã duyệt loại trừ đúng booking trong kỳ tính CPS |
| Booking từ Trail xuất hiện trong Studio bằng dữ liệu dùng chung | `js/trail/booking.js` → `js/studio/bookings.js` | Đã kiểm thử thật — đặt ở Trail, đổi hộ trong Studio, booking hiện đúng ngay không cần đồng bộ |

## Phase 6 — Cổng dữ liệu quản lý và Cổng vận hành (theo yêu cầu riêng của người dùng)

| Yêu cầu (từ hội thoại Phase 6) | Màn hình/chức năng | Trạng thái |
|---|---|---|
| Dashboard dữ liệu tổng hợp | `js/admin/overview.js` | Hoạt động (demo) — KPI tính trực tiếp từ `state.bookingItems`, không số ngẫu nhiên riêng |
| Doanh thu, lượng khách và xu hướng theo tháng | `js/admin/metrics.js`, `js/admin/overview.js` | Hoạt động (demo) — tái dùng `state.metrics.monthlyByHost` (cùng nguồn với Studio) + booking thật, lọc theo phạm vi |
| Heatmap luồng khách | `js/admin/flow.js`, `getSimulatedCrowdLevel` (`js/utils.js`) | Hoạt động (demo, mô phỏng) — dùng chung cơ chế mô phỏng mật độ với Trail |
| Nhu cầu chưa được đáp ứng | `js/admin/demand.js` | Hoạt động (demo) — từ slot còn ít chỗ + lượt xem/booking thật |
| Phân tích nhóm du khách | `js/admin/flow.js` (phân khúc) | Hoạt động (demo) — từ `state.itineraries` thật, ghi rõ là mẫu người dùng nền tảng trong phiên demo |
| Hộp thư đề án | `js/admin/proposals.js` | Hoạt động (demo) — lọc/xem hồ sơ/yêu cầu bổ sung/cập nhật kết quả, đồng bộ thật với Studio |
| Kiểm duyệt nội dung | `js/ops/content.js`, `reviewExperience` (`js/storage.js`) | Hoạt động (demo) — nháp → chờ duyệt → duyệt/yêu cầu chỉnh sửa, có nhật ký ai/khi nào |
| Xử lý booking, giao dịch và ticket | `js/ops/bookings.js`, `js/ops/tickets.js` | Hoạt động (demo) — hoàn tiền gọi `cancelBooking` thật đúng chính sách; điều phối chỉ ghi chú nội bộ (không tự đổi giờ/điểm thay khách) |
| Quản lý huy hiệu chất lượng | `js/ops/quality.js`, `setHostRecognition` (`js/storage.js`) | Hoạt động (demo) — cấp/thu hồi có lý do bắt buộc, đè lên cờ tĩnh của destinations.json |
| Duyệt ngoại lệ CPS | `js/ops/quality.js`, `js/ops/community.js` | Hoạt động (demo) — vận hành duyệt mọi danh mục; cố vấn cộng đồng chỉ duyệt danh mục "nghi lễ" |
| Xuất CSV theo bộ lọc | `js/admin/reports.js`, `js/services/csvService.js` | Hoạt động (demo) — CSV khớp đúng dữ liệu đang lọc, có dòng chú thích ngày xuất/phạm vi/nhãn demo |
| Phân quyền hiển thị giữa các vai trò | `js/admin/*`, `js/ops/*` | Đã kiểm thử thật — CPS/doanh thu từng hộ không lộ ở Cổng quản lý (chỉ theo nhóm/ẩn danh); Cố vấn cộng đồng không thấy booking/giao dịch/khách |

Ghi chú: bảng này cập nhật cuối mỗi phase, không xóa dòng cũ — chỉ đổi trạng thái.
