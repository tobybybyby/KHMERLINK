# DATA_ISSUES — Báo cáo chất lượng dữ liệu địa danh (Phase 2)

Nguồn: `30-dia-diem-Vinh-Long-Tra-Vinh.md` (đối chiếu 08/09/2026) + bảng giá/giờ/đánh giá ước lượng do người dùng cung cấp trong hội thoại Phase 2. Dữ liệu đã chuẩn hoá tại [`data/destinations.json`](data/destinations.json) — 37 địa danh (30 từ đợt nghiên cứu mới + 7 từ Phase 1 chưa được xác minh lại).

Mỗi trường dữ liệu mang một trong ba trạng thái: **verified** (đã xác minh, có trích dẫn nguồn cụ thể, không hedge) · **estimated** (ước lượng cho mockup, có gắn nhãn) · **missing** (chưa có dữ liệu, không suy diễn).

## 1. Địa danh thiếu toạ độ (23/37)

Nguồn chỉ cung cấp link tìm-kiếm-theo-tên (`mapSearchUrl`), không có toạ độ khảo sát thực địa — theo đúng nguyên tắc "không tự bịa tọa độ", các mục này để `coordinates.status = "missing"`, `lat/lng = null`. Trang chi tiết dùng `mapSearchUrl` thay cho nút chỉ đường; bản đồ Khám phá không hiển thị marker cho các mục này (vẫn hiện trong danh sách).

Chùa Hang (KomPong Chray) · Chùa Ông Mẹt · Phước Minh Cung · Chùa Nôdol (Chùa Cò) · Biển Ba Động · Đền thờ Bác Hồ tại Long Đức · Du lịch cộng đồng Cồn Hô · Nhà cổ Huỳnh Kỳ · Khu tưởng niệm Út Tịch · Sokfarm · Khu du lịch Huỳnh Kha · Bảo tàng Dừa Sáp Trà Vinh · Chùa Giác Linh (Chùa Dơi) · Bảo tàng Vĩnh Long · Khu tưởng niệm Phạm Hùng · Khu tưởng niệm Võ Văn Kiệt · Khu lưu niệm Trần Đại Nghĩa · Chùa Tiên Châu · Chùa Phước Hậu · Nhà cổ Cai Cường · Nhà dừa CocoHome · Làng gốm Tư Buôi · Khu du lịch Vinh Sang.

14 địa danh còn lại (7 trùng với Phase 1 + 7 legacy khác + 2 hộ demo) giữ toạ độ **ước lượng** từ Phase 1 (đánh dấu rõ `estimated`, chưa khảo sát thực địa) để bản đồ vẫn trình diễn được các điểm nổi bật.

## 2. Địa danh thiếu ảnh thật

Toàn bộ 37 địa danh hiện dùng **ảnh placeholder tự sinh** (SVG theo danh mục) theo đúng yêu cầu "chưa tìm/tải ảnh trong phase này". Trong đó:
- 30 địa danh có **link ảnh/trang nguồn tham khảo** do người dùng cung cấp — lưu ở trường `imageRef.url`, trạng thái `external-not-downloaded` (chưa tải về, chưa xác nhận quyền dùng lại). Xem link trong mục "Nguồn dữ liệu" ở trang chi tiết từng địa danh.
- 7 địa danh legacy (Miếu Công Thần, Vương quốc gạch gốm Mang Thít, Cù lao An Bình, Cồn Phụng, Làng nghề kẹo dừa Mỏ Cày, 2 hộ demo) **không có bất kỳ link ảnh tham khảo nào**.

## 3. Địa danh thiếu giờ hoạt động đã xác minh (30/37 chỉ có ước lượng hoặc thiếu)

Chỉ 7 địa danh có giờ mở cửa **verified** (trích dẫn trực tiếp từ website/trang chính thức của đơn vị hoặc cổng du lịch tỉnh, không kèm hedge "chưa xác nhận"): Bảo tàng Dừa Sáp, Bảo tàng Vĩnh Long, Khu tưởng niệm Phạm Hùng, Khu tưởng niệm Võ Văn Kiệt, Làng gốm Tư Buôi, Nhà dừa CocoHome, Khu du lịch Huỳnh Kha (chỉ riêng công viên nước).

13 địa danh **hoàn toàn chưa có giờ mở cửa** (kể cả ước lượng) — nguồn gốc ghi rõ "chưa xác minh được": Ao Bà Om, Chùa Âng, Chùa Ông Mẹt, Phước Minh Cung, Chùa Nôdol, Biển Ba Động, Nhà cổ Huỳnh Kỳ, Chùa Giác Linh, Chùa Tiên Châu, Chùa Phước Hậu, Nhà cổ Cai Cường, Khu du lịch Vinh Sang, Khu lưu niệm Trần Đại Nghĩa. 17 địa danh còn lại dùng giờ **ước lượng** từ bảng mockup.

**Lưu ý quan trọng của nguồn gốc (áp dụng cho mọi địa danh):** không suy diễn trạng thái "đang mở/đóng cửa hôm nay" từ lịch tuần đã công bố — app hiện KHÔNG tính năng này, tránh hiển thị sai.

## 4. Dữ liệu trùng lặp (đã hợp nhất)

7 địa danh trùng giữa dữ liệu Phase 1 (tự soạn, chưa xác minh) và đợt nghiên cứu mới (có nguồn) — đã **hợp nhất, ưu tiên dữ liệu có nguồn mới**, giữ nguyên `id` cũ để không phá vỡ liên kết với trải nghiệm/host đã có ở Phase 1:

| id | Tên | Ghi chú hợp nhất |
|---|---|---|
| `ao-ba-om` | Ao Bà Om | Toạ độ ước lượng Phase 1 giữ nguyên; nội dung/nguồn thay bằng bản mới |
| `chua-ang` | Chùa Âng | nt |
| `bao-tang-khmer-tra-vinh` | Bảo tàng Văn hóa dân tộc Khmer Trà Vinh | nt |
| `chua-vam-ray` | Chùa Vàm Ray | nt |
| `van-thanh-mieu` | Văn Thánh Miếu Vĩnh Long | nt |
| `chua-phat-ngoc-xa-loi` | Chùa Phật Ngọc Xá Lợi Vĩnh Long | nt |
| `con-chim` | Du lịch cộng đồng Cồn Chim | Địa chỉ Phase 1 trùng khớp địa chỉ nguồn mới — không mâu thuẫn |

**Huy hiệu "Được ghi nhận" đã được sửa lại** cho 6 địa danh trên: Phase 1 từng gán `recognized: true` kèm lý do tự bịa; nguồn nghiên cứu mới xác nhận rõ "chưa gắn huy hiệu xác nhận của app" cho toàn bộ 30 điểm — đã đặt lại `recognized: false` cho tất cả 37 địa danh. Tính năng huy hiệu vẫn hoạt động (code không đổi), chỉ là hiện chưa có địa danh nào đạt trạng thái này trong dữ liệu — đúng với thực tế một mạng lưới mới.

**Không phải trùng lặp** (dễ nhầm do tên gọi giống nhau, đã ghi chú riêng trong từng hồ sơ):
- "Miếu Công Thần Vĩnh Long" (Phase 1, Vĩnh Long) ≠ "Phước Minh Cung / Chùa Ông" (đợt mới, Trà Vinh) — hai địa danh khác nhau.
- "Vương quốc gạch gốm Mang Thít" (Phase 1) ≠ "Làng gốm Tư Buôi" (đợt mới) — cùng vùng nghề gốm đỏ Vĩnh Long nhưng là hai địa điểm cụ thể khác nhau.
- "Chùa Giác Linh / Chùa Dơi" (Trà Vinh, đợt mới) ≠ Chùa Dơi nổi tiếng ở Sóc Trăng — nguồn gốc đã cảnh báo rõ, không được nhầm lẫn.

## 5. Thông tin mâu thuẫn phát hiện được

1. **Đánh giá Chùa Âng**: bảng ước lượng do người dùng cung cấp ghi *4,8⭐ · 628 lượt*; hồ sơ gốc có số Tripadvisor đã xác minh (truy xuất 08/09/2026) là **4,2/5 · 18 đánh giá**. Đã ưu tiên số đã xác minh, ghi rõ mâu thuẫn trong `notes` của bản ghi.
2. **Đánh giá Chùa Hang**: tương tự — bảng ước lượng ghi *4,7⭐ · 532 lượt*; số Tripadvisor xác minh là **4,4/5 · 5 đánh giá**. Đã ưu tiên số đã xác minh.
3. **Địa chỉ Bảo tàng Dừa Sáp**: website chính thức ghi xã Thạnh Phú, huyện Cầu Kè (cũ); nguồn khác (Báo Vĩnh Long 07/2026) ghi xã Tam Ngãi. Đã ghi cả hai trong trường địa chỉ, ưu tiên hiển thị theo nguồn gần đây hơn — **cần đơn vị xác nhận lại**.
4. **Diện tích Ao Bà Om**: nguồn gốc tự ghi nhận các bài viết có số liệu diện tích mâu thuẫn nhau — hồ sơ này không đưa số diện tích vào dữ liệu để tránh sai lệch.
5. **Giá Cồn Chim**: bảng ước lượng ghi chung chung "Trải nghiệm từ 25.000đ"; hồ sơ gốc làm rõ đây là giá **một phần bánh lá tại một hộ cụ thể** (Cô Ba Sửa), không phải vé vào cồn hay giá một lớp học làm bánh — đã điều chỉnh mô tả giá cho chính xác, giữ số tiền gốc (verified qua cổng du lịch cộng đồng).

## 6. Khuyến nghị theo dõi tiếp

- 23 địa danh thiếu toạ độ nên được khảo sát GPS thực địa trước khi đưa vào bản đồ production.
- 30 link ảnh tham khảo cần được liên hệ đơn vị xin phép sử dụng (hoặc tự chụp) trước khi tải vào app — **chưa thực hiện trong phase này theo đúng yêu cầu**.
- Toàn bộ số điện thoại liên hệ có trạng thái `verified` vẫn **chưa được gọi xác nhận** (đúng như nguồn gốc ghi chú) — cần một vòng khảo sát thực tế trước khi công bố cho khách thật.
- "Cù lao An Bình" (Phase 1, mục tổng quan vùng) hiện trùng lặp nội dung một phần với 4 địa danh cụ thể hơn trên cùng cù lao (Chùa Tiên Châu, Nhà cổ Cai Cường, Nhà dừa CocoHome, Khu du lịch Vinh Sang) — cân nhắc gộp thành một trang "vùng" liên kết tới các điểm cụ thể ở phase sau, thay vì hai lớp thông tin song song.
