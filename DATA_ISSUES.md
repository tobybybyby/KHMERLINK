# DATA_ISSUES — Báo cáo chất lượng dữ liệu

> **Cập nhật 2026-09-10 — Thu gọn thành pilot 7 listing Khmer**: website hiện chỉ hiển thị 7 listing từ `data/pilot-listings.json`, xem mục "Pilot 7 listing Khmer" cuối file để biết đầy đủ vấn đề dữ liệu của bộ này. Toàn bộ nội dung Phase 2 bên dưới (37 địa danh cũ) là **lịch sử** — dữ liệu đó đã chuyển sang [`data/archive/destinations-vinhlong-37.json`](data/archive/destinations-vinhlong-37.json) và **không còn hiển thị trên giao diện**, giữ nguyên phần ghi chép cũ để không viết lại lịch sử và để tái sử dụng khi mở rộng phạm vi trở lại.

## Lịch sử — Phase 2 (37 địa danh, đã archive)

Nguồn: `30-dia-diem-Vinh-Long-Tra-Vinh.md` (đối chiếu 08/09/2026) + bảng giá/giờ/đánh giá ước lượng do người dùng cung cấp trong hội thoại Phase 2. Dữ liệu đã chuẩn hoá tại [`data/archive/destinations-vinhlong-37.json`](data/archive/destinations-vinhlong-37.json) (trước đây `data/destinations.json`) — 37 địa danh (30 từ đợt nghiên cứu mới + 7 từ Phase 1 chưa được xác minh lại).

Mỗi trường dữ liệu mang một trong ba trạng thái: **verified** (đã xác minh, có trích dẫn nguồn cụ thể, không hedge) · **estimated** (ước lượng cho mockup, có gắn nhãn) · **missing** (chưa có dữ liệu, không suy diễn).

## 1. Địa danh thiếu toạ độ (23/37)

Nguồn chỉ cung cấp link tìm-kiếm-theo-tên (`mapSearchUrl`), không có toạ độ khảo sát thực địa — theo đúng nguyên tắc "không tự bịa tọa độ", các mục này để `coordinates.status = "missing"`, `lat/lng = null`. Trang chi tiết dùng `mapSearchUrl` thay cho nút chỉ đường; bản đồ Khám phá không hiển thị marker cho các mục này (vẫn hiện trong danh sách).

Chùa Hang (KomPong Chray) · Chùa Ông Mẹt · Phước Minh Cung · Chùa Nôdol (Chùa Cò) · Biển Ba Động · Đền thờ Bác Hồ tại Long Đức · Du lịch cộng đồng Cồn Hô · Nhà cổ Huỳnh Kỳ · Khu tưởng niệm Út Tịch · Sokfarm · Khu du lịch Huỳnh Kha · Bảo tàng Dừa Sáp Trà Vinh · Chùa Giác Linh (Chùa Dơi) · Bảo tàng Vĩnh Long · Khu tưởng niệm Phạm Hùng · Khu tưởng niệm Võ Văn Kiệt · Khu lưu niệm Trần Đại Nghĩa · Chùa Tiên Châu · Chùa Phước Hậu · Nhà cổ Cai Cường · Nhà dừa CocoHome · Làng gốm Tư Buôi · Khu du lịch Vinh Sang.

14 địa danh còn lại (7 trùng với Phase 1 + 7 legacy khác + 2 hộ demo) giữ toạ độ **ước lượng** từ Phase 1 (đánh dấu rõ `estimated`, chưa khảo sát thực địa) để bản đồ vẫn trình diễn được các điểm nổi bật.

## 2. Ảnh địa danh (cập nhật ở Phase tích hợp ảnh — sau Phase 2)

**17/37 địa danh đã có ảnh thật** tải về từ nguồn công khai (báo chí/cổng du lịch), ghép đúng theo `destinationId` (không suy đoán theo tên gần giống): Ao Bà Om · Chùa Âng · Bảo tàng Văn hóa dân tộc Khmer Trà Vinh · Chùa Hang (KomPong Chray) · Chùa Vàm Ray · Chùa Nôdol · Du lịch cộng đồng Cồn Chim · Văn Thánh Miếu Vĩnh Long · Bảo tàng Vĩnh Long · Khu tưởng niệm Phạm Hùng · Khu tưởng niệm Võ Văn Kiệt · Chùa Tiên Châu · Chùa Phước Hậu · Nhà cổ Cai Cường · Nhà dừa CocoHome · Làng gốm Tư Buôi · Khu du lịch Vinh Sang.

Ảnh hiển thị trên site đã được **nén sang WebP** (giảm ~78% dung lượng, tổng 17 ảnh từ 9,4MB còn ~2,1MB — xem `scripts/optimize-images.js`); **bản gốc chưa nén được giữ lại** ở `assets/images/destinations/originals/` và tham chiếu qua `imageRef.originalLocalPath` trong `data/destinations.json`, phòng khi cần chất lượng cao hơn sau này. Tên file đã chuẩn hoá không dấu/không khoảng trắng (vd `ao-ba-om.webp`).

**⚠️ Cần xin phép trước khi dùng thương mại**: các ảnh này lấy từ nguồn công khai (báo chí/cổng du lịch) để dùng trong bản demo phi thương mại — xem `imageRef.note` từng địa danh. Chưa liên hệ đơn vị giữ bản quyền.

**20/37 địa danh còn lại** chưa có ảnh thật, đang dùng **ảnh placeholder tự sinh** (SVG theo danh mục): Chùa Ông Mẹt · Phước Minh Cung · Biển Ba Động · Đền thờ Bác Hồ tại Long Đức · Du lịch cộng đồng Cồn Hô · Nhà cổ Huỳnh Kỳ · Khu tưởng niệm Nguyễn Thị Út · Sokfarm · Khu du lịch Huỳnh Kha · Bảo tàng Dừa Sáp Trà Vinh · Chùa Giác Linh · Khu lưu niệm Trần Đại Nghĩa · Chùa Phật Ngọc Xá Lợi Vĩnh Long · Miếu Công Thần Vĩnh Long · Vương quốc gạch gốm Mang Thít · Cù lao An Bình · Cồn Phụng · Làng nghề kẹo dừa Mỏ Cày · Nhà vườn Cô Ba (demo) · Xưởng đan lát Chú Sáu (demo). Trong đó phần lớn vẫn có link ảnh/trang nguồn tham khảo ở `imageRef.url` (trạng thái `external-not-downloaded`) — chưa tải vì chưa xác nhận quyền dùng lại; 7 mục legacy hoàn toàn không có link tham khảo nào.

**Gallery nhiều ảnh**: kiến trúc dữ liệu đã hỗ trợ trường `gallery` (mảng ảnh bổ sung, hiển thị ở trang chi tiết ngay sau ảnh đại diện) cho từng địa danh trong `data/destinations.json`, nhưng **hiện chưa có địa danh nào có quá 1 ảnh thật** nên trường này để trống ở tất cả 37 mục — không bịa thêm ảnh phụ khi chưa có nguồn.

Không có trường hợp nào ảnh bị ghép nhầm địa danh cần đưa vào mục này — toàn bộ 17 ảnh đã tải đều được ghép trực tiếp theo `destinationId` lúc tải (không qua dò tên gần giống), nên không có ca "chưa chắc chắn" nào tồn đọng.

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

## Pilot 7 listing Khmer (2026-09-10) — dữ liệu ĐANG hiển thị trên site

Nguồn: `data/source/Du_lieu_7_diem_Khmer_Vinh_Long.xlsx` (bàn giao 10/09/2026, 4 sheet: Tổng quan/Hồ sơ website/Supplier & khảo sát/Nguồn & hình ảnh). Đã chuẩn hoá tại [`data/pilot-listings.json`](data/pilot-listings.json) (công khai, dùng cho Trail) và [`data/pilot-suppliers.json`](data/pilot-suppliers.json) (chỉ nội bộ, dùng cho `#/ops/pilot`). Không tự thêm số liệu/giá/giờ/trạng thái booking ngoài file nguồn — mọi khoảng trống trong Excel giữ nguyên là khoảng trống trong dữ liệu (status `unavailable`/`needsFieldVerification`), không suy diễn.

### Toạ độ — 1/7 listing có toạ độ chính thức trên bản đồ; các địa chỉ mới (2 đợt) hầu hết chưa geocode được qua OpenStreetMap
Duy nhất **SITE-07 (Chùa Lò Gạch)** có toạ độ tham chiếu công khai (9.917500, 106.295833, `coordinateStatus: reference`, nguồn Cổng tổng hợp Vietnam.vn) — có marker trên bản đồ Khám phá.

**Đợt 1 (2026-09-10, từ `Danh_sach_7_dia_diem_Khmer_Vinh_Long.xlsx`)**: EXP-02 Dừng 2 khi đó có "Số 507 Nguyễn Đáng, khóm 10, phường Trà Vinh" — geocode được gần đúng qua Nominatim.

**Đợt 2 (2026-09-10, người dùng cung cấp trực tiếp qua chat, địa chỉ chi tiết hơn/khác với đợt 1 cho EXP-01 và EXP-02 Dừng 2)** — đã thử geocode lại toàn bộ qua **OpenStreetMap Nominatim**, kết quả:
- **EXP-03**: người dùng cung cấp **Google Plus Code** ("W8FH+W3H, QL53, phường Nguyệt Hóa") — giải mã được bằng thư viện Open Location Code chính thức (dùng tâm phường Nguyệt Hóa làm điểm tham chiếu để khôi phục full code), độ chính xác cao (~3m). **Đây là nhà riêng nghệ nhân Lâm Phên** — theo đúng nguyên tắc đã thống nhất ("không công khai pin nhà riêng khi chưa có sự đồng thuận"), toạ độ này được lưu **chỉ ở nội bộ** (`data/pilot-suppliers.json`, mục `sup-lam-phen.preciseLocationInternal`, cờ `doNotPublish: true`), xem đầy đủ ở `#/ops/pilot`. **Chưa đưa vào bản đồ/trang chi tiết công khai** — đã hỏi lại người dùng có muốn công khai không trước khi đổi.
- **EXP-01** ("98/27 Ấp Ba, xã Song Lộc"): địa chỉ này **khác hẳn** xã Nhị Trường/làng Ba So ghi trong hồ sơ Excel gốc (nơi gắn với câu chuyện văn hoá cốm dẹp Ok Om Bok) — đã cập nhật trường địa chỉ theo yêu cầu nhưng gắn cờ `addressConflictNote` cảnh báo rõ, cần người dùng xác nhận đây có đúng là cùng một cơ sở hay không trước khi dùng làm pin chính thức. Nominatim không có kết quả cho địa chỉ này (OSM chưa lập bản đồ ở mức ấp).
- **EXP-02 Dừng 2** ("207A Nguyễn Du, khóm 3, phường Nguyệt Hóa"), **SITE-04** ("68 Nguyễn Du, khóm 3..."), **SITE-06** ("Nguyễn Du, khóm 3...") — cả 3 đều nằm trên đường "Nguyễn Du" theo địa chỉ người dùng cho, nhưng Nominatim **chỉ có DUY NHẤT một đường "Nguyễn Du"** trong toàn khu vực và nó được gắn thuộc **Khóm Bến Có, xã Song Lộc** — không khớp phường Nguyệt Hóa. Có thể do ranh giới hành chính sau sắp xếp 2025 (xem mục "Địa chỉ" cuối file) chưa cập nhật trên OpenStreetMap, hoặc là 2 con đường trùng tên khác nhau ở 2 khu vực — **không đủ tin cậy để dùng làm pin**, đã cập nhật địa chỉ text theo yêu cầu nhưng giữ toạ độ trống, gắn `coordinateNote` giải thích rõ trong dữ liệu.
- **SITE-05** ("QL53, khóm 13..."): Nominatim không có "QL53" theo đúng khóm; tra theo tên tiếng Anh "National Route 53" khớp với đường **Võ Nguyên Giáp** ở Khóm 6/Khóm 8 phường Nguyệt Hóa (có thể là tên gọi khác của cùng quốc lộ) nhưng không khớp khóm 13 — không đủ tin cậy để dùng làm pin.

**Không có listing/điểm nào bị vẽ marker giả trên bản đồ Khám phá** — mọi toạ độ chưa đủ tin cậy đều giữ `coordinates: {lat:null,lng:null}`.

**Thông tin cần bổ sung để thêm pin chính thức** (đã báo lại người dùng lần 2): cách đáng tin cậy nhất là **Google Plus Code** cho từng địa điểm còn lại (giống cách đã dùng thành công cho EXP-03) — vào Google Maps, giữ chạm đúng vị trí, sao chép Plus Code hiện ra. Cách khác: toạ độ GPS đo tại thực địa. EXP-01 cần xác nhận thêm liệu đây có đúng là cùng cơ sở với hồ sơ Excel gốc hay không (xem `addressConflictNote`).

### Giờ mở cửa & giá — 0/7 listing có cả hai trường đã xác minh đầy đủ
Không listing pilot nào có giá vé chính thức đã xác minh; SITE-06 có giá/giờ trạng thái `needsFieldVerification` (cần gọi lại xác nhận), 6 listing còn lại là `unavailable` (chưa công bố/chưa có lịch cố định). Card và trang chi tiết hiển thị "Đang xác minh giá" / "Vui lòng kiểm tra trước khi đến" thay vì để trống hoặc bịa số — không có trường hợp nào hiển thị giá/giờ cụ thể chưa qua xác minh.

### Booking — 0/7 listing bookable trong phase này
EXP-01/02/03 đều ở trạng thái ý tưởng sản phẩm/chờ khảo sát/chờ liên hệ supplier — **không có supplier nào đã xác nhận nhận khách**. `js/data.js` **có** seed lại 7 host (khôi phục 2026-09-10, mỗi host gắn 1 listing, dùng tên/vai trò thật từ `pilot-suppliers.json`) để hồ sơ "người cung cấp dịch vụ" trong Studio không còn trống, nhưng **không** seed bất kỳ `experience`/booking/doanh thu giả nào — vì vậy không tồn tại luồng đặt chỗ/thanh toán nào có thể vô tình kích hoạt cho các listing chưa sẵn sàng, và không có số liệu tài chính bịa gắn cho các tổ chức/cá nhân thật chưa xác nhận đồng ý. Khi có supplier xác nhận thật, cần bổ sung `experience` tương ứng qua Studio (không sửa trực tiếp `pilot-listings.json`).

### Ảnh — đã tải 7 ảnh đại diện về project (2026-09-10)
`representativeImage` của cả 7 listing đã được **tải về và nén WebP** tại `assets/images/pilot/*.webp` (bản gốc lưu ở `assets/images/pilot/originals/`) — card Khám phá và ảnh đại diện trang chi tiết đều dùng ảnh thật này thay vì placeholder. **Vẫn chưa xác nhận quyền sử dụng thương mại** — dùng cho demo phi thương mại, cần xin phép đơn vị giữ bản quyền (báo chí/cổng du lịch) trước khi dùng cho production, đúng caveat đã áp dụng cho bộ ảnh 37 địa danh cũ. Trường `images: []` (gallery nhiều ảnh) vẫn để trống — chưa có ảnh phụ nào cho listing nào.

### SITE-04 và Ao Bà Om
Ao Bà Om là **điểm neo** của cụm SITE-04, không phải một listing riêng thứ 8 — số liệu Ao Bà Om (>300 ha, ao 15 ha, ~500 cây cổ thụ, di tích quốc gia 1994) được đưa vào phần "Câu chuyện & số liệu nổi bật" của SITE-04, không tạo trang riêng.

### SITE-07 — hai lớp di tích tách biệt
Chùa Lò Gạch (di tích lịch sử cấp **tỉnh**, 21/11/2022) và khu khảo cổ Bờ Lũy (di tích khảo cổ cấp **quốc gia**, 2018) là hai hồ sơ xếp hạng khác nhau — nội dung `culturalStory`/`keyFacts` của SITE-07 nêu rõ cả hai, không gộp danh hiệu.

### Khuyến nghị tiếp theo
- Khảo sát thực địa theo đúng `verificationChecklist` của từng listing (xem `#/ops/pilot`) trước khi chuyển bất kỳ listing nào sang trạng thái "Sẵn sàng pilot"/"Được công khai" với booking thật.
- Xin đồng thuận NNƯT Lâm Phên trước khi công khai bất kỳ toạ độ nào liên quan EXP-02 (dừng 1)/EXP-03.
- Liên hệ xin phép sử dụng ảnh trước khi chuyển từ URL tham khảo sang tải về chính thức (phase sau, chưa thực hiện theo đúng yêu cầu phase này).
- "Cù lao An Bình" (Phase 1, mục tổng quan vùng) hiện trùng lặp nội dung một phần với 4 địa danh cụ thể hơn trên cùng cù lao (Chùa Tiên Châu, Nhà cổ Cai Cường, Nhà dừa CocoHome, Khu du lịch Vinh Sang) — cân nhắc gộp thành một trang "vùng" liên kết tới các điểm cụ thể ở phase sau, thay vì hai lớp thông tin song song.

## Cập nhật 2026-09-11 — Toạ độ pilot: từ 1/7 lên 7/7 có pin công khai

Người dùng cung cấp bảng toạ độ đầy đủ (xác nhận qua Google Maps listing/Plus Code) cho cả 7 listing, thay thế toàn bộ trạng thái "chưa đủ tin cậy qua Nominatim" ghi nhận ở mục "Pilot 7 listing Khmer" phía trên. Cập nhật lại tình trạng từng mục:

| id | Toạ độ trước (2026-09-10) | Toạ độ sau (2026-09-11) | Nguồn |
|---|---|---|---|
| EXP-01 | `null` (Nominatim không có kết quả) | 9.9153125, 106.2945625 | Google Maps listing + Plus Code `6PX8W78V+4R` |
| EXP-02 (meetingPoint = Dừng 2) | `null` (đường không khớp phường) | 9.9147744, 106.3060206 | Google Maps, khớp `addressMatched` |
| EXP-02 Dừng 1 (xưởng Lâm Phên) | `null` | **vẫn `null`** — không có trong bảng mới, giữ riêng tư | — |
| EXP-03 | `null` công khai (có toạ độ riêng tư nội bộ, `doNotPublish:true`) | 9.9248125, 106.3276875, `publicPin:true` | Google Maps + Plus Code `6PX8W8FH+W3H` — **đổi từ riêng tư sang công khai theo yêu cầu mới, xem cảnh báo ở PROGRESS.md** |
| SITE-04 | `null` (đường không khớp phường) | 9.9174375, 106.3015625 (`markerRole: clusterAnchor`) | Google Maps + Plus Code `6PX8W882+XJ` |
| SITE-05 | `null` (QL53 không khớp khóm) | 9.9158125, 106.3035625 | Google Maps + Plus Code `6PX8W883+8C` |
| SITE-06 | `null` (đường không khớp phường) | 9.9161875, 106.3049375 | Google Maps + Plus Code `6PX8W883+FX` |
| SITE-07 | 9.917500, 106.295833 (`reference`, thực ra là toạ độ khảo cổ Bờ Lũy chứ không phải pin chùa) | 9.9171875, 106.2955625 (pin chùa đúng); 9.917500, 106.295833 giữ lại riêng ở `archaeologicalReferenceCoordinates` | Google Maps + Plus Code `6PX8W78W+V6P` (pin chùa); vietnam.vn (tham chiếu khảo cổ) |

**Vấn đề còn tồn đọng, cần người dùng xác nhận lại:**
1. **EXP-03 công khai toạ độ nhà riêng nghệ nhân** — xem cảnh báo chi tiết ở `PROGRESS.md` mục PHASE 11/09/2026. Nếu không đúng chủ đích, cần báo lại để gỡ `publicPin`/`coordinates` và khôi phục `doNotPublish:true`.
2. **EXP-02 Dừng 1** (cùng địa điểm với EXP-03) vẫn chưa có pin công khai — nếu người dùng đã đồng ý công khai vị trí này qua quyết định EXP-03, có thể cân nhắc áp dụng toạ độ tương tự cho Dừng 1 ở phase sau (hiện chưa tự suy diễn, cần xác nhận rõ).
3. Các toạ độ mới đều dán nhãn nguồn "Google Maps listing/Plus Code do người dùng cung cấp" — chưa phải đo GPS thực địa hay đối chiếu hồ sơ di tích chính thức; vẫn nên đưa vào `verificationChecklist` khảo sát thực địa trước khi listing chuyển sang "Sẵn sàng pilot" có booking thật.
