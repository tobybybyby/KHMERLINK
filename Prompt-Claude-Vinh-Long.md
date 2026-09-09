# PROMPT TẠO WEBSITE DU LỊCH VĨNH LONG CHẠY TRÊN GITHUB PAGES

Bạn là Senior Product Designer và Front-end Engineer. Hãy xây dựng một website tương tác hoàn chỉnh bằng HTML, CSS và JavaScript để tôi đưa lên GitHub Pages. Hãy thực sự tạo mã nguồn chạy được, không chỉ mô tả ý tưởng hoặc làm landing page.

Tên tạm: **Vĩnh Long — Chạm văn hóa, nối hành trình**. Hai giao diện chính: **Trail** cho du khách và **Studio** cho hộ dân/nghệ nhân/đơn vị cung cấp trải nghiệm. Có thêm cổng dữ liệu cho cơ quan quản lý và cổng vận hành mạng lưới.

## 1. Mục tiêu sản phẩm và phạm vi

- Du khách tìm được nơi đi, việc làm và hành trình phù hợp với sở thích, thời gian, thành viên trong đoàn; dễ kết nối nhiều điểm đến đang rải rác.
- Hộ dân, nghệ nhân, chùa, bảo tàng và đơn vị du lịch giới thiệu trải nghiệm, nhận khách, phối hợp với nhau và cải thiện dịch vụ.
- Cơ quan quản lý xem dữ liệu tổng hợp để nhận diện nhu cầu, phân bổ nguồn hỗ trợ và tiếp nhận đề án của hộ.
- Đội vận hành xử lý nội dung, booking, giao dịch, khiếu nại và hỗ trợ cộng đồng.
- Ưu tiên chuyến đi trong ngày. Chưa xây chức năng đặt khách sạn, phương tiện, chuyến bay hoặc lưu trú.
- Ngân sách cá nhân hóa để giai đoạn sau. Hiện vẫn phải có giá niêm yết, tổng tiền, đặt cọc, thanh toán demo, voucher và báo cáo doanh thu. Đưa lựa chọn theo ngân sách cùng ba phương án “Tiết kiệm – Cân bằng – Trải nghiệm” vào roadmap và cấu hình tắt mặc định; không bỏ mất yêu cầu này.
- Một huy hiệu chất lượng duy nhất cho hộ, nhãn “Được ghi nhận”, tương tự một dấu tick. Không tạo ba huy hiệu trùng ý nghĩa “xác minh”, “uy tín”, “chất lượng”. Quy định tiêu chí và giải thích trong tooltip. New Spotlight là khu vực giới thiệu hộ mới, không phải một huy hiệu xác nhận chất lượng khác. Huy hiệu khám phá của khách thuộc hệ thống Passport riêng.

## 2. Yêu cầu kỹ thuật và mức độ hoàn thiện

- Website tĩnh triển khai được lên GitHub Pages: HTML5, CSS3, JavaScript; ưu tiên không cần bước build. Có thể dùng Leaflet cho bản đồ và Chart.js cho biểu đồ nếu phù hợp.
- Tách mã nguồn: index.html, css/styles.css, js/app.js, js/data.js, các module chức năng và assets; kèm README.md. Dùng đường dẫn tương đối tương thích repository con. Dùng hash routing để tải lại trang con không lỗi 404.
- Mọi nút chính phải hoạt động: điều hướng, lọc, thêm/xóa điểm, tạo lịch trình, đặt trải nghiệm, xử lý booking, gửi đề án, đánh giá, đổi voucher. Không dùng nút chết, liên kết # vô nghĩa hoặc chỉ hiện alert để giả hoàn thành.
- Dữ liệu dùng chung trong một trình duyệt, lưu bằng localStorage có phiên bản schema; chuyển vai trò phải thấy thay đổi liên quan. Không mô tả việc này là đồng bộ nhiều người dùng thật.
- Có dữ liệu khởi tạo, nút “Khôi phục dữ liệu mẫu” trong khu vực demo với xác nhận, xử lý dữ liệu lưu bị lỗi. Không xóa dữ liệu khi reload.
- Phân biệt rõ bản demo và hệ thống thật: AI, lượng khách trực tiếp, dự báo, gửi thông báo, thanh toán, hoàn tiền, giải ngân và phân quyền server được mô phỏng nếu chưa có backend. Gắn nhãn nhẹ ở đúng nơi, tránh để người dùng hiểu là dịch vụ đã vận hành thực tế.
- Không nhúng API key hoặc thông tin bí mật vào frontend. Chuyển vai trò chỉ là công cụ trải nghiệm demo, không phải bảo mật production.
- Tổ chức adapter cho aiService, paymentService, mapService, notificationService, bookingService để có thể kết nối API sau. Chức năng demo không được phụ thuộc vào API trả phí hoặc khóa chưa được cung cấp.
- Có loading, trạng thái trống, lỗi, xác nhận thành công, kiểm tra dữ liệu và phương án dự phòng khi mạng/thư viện ngoài không tải được. Input của người dùng phải được render an toàn, không chèn HTML tùy ý.
- Trên mobile dùng bottom navigation cho Trail; Studio có nút lớn, ít thuật ngữ. Desktop dashboard có sidebar và vùng nội dung rộng.

## 3. Phong cách thiết kế

Thiết kế hiện đại, ấm áp, gần gũi với du lịch cộng đồng miền Tây: xanh lá đậm, kem sáng, vàng đất làm điểm nhấn. Ảnh địa điểm/trải nghiệm làm trọng tâm; khoảng trắng thoáng; card gọn; chữ tiếng Việt dễ đọc. Họa tiết văn hóa chỉ dùng tiết chế và phù hợp, không dùng biểu tượng tôn giáo làm đồ trang trí tùy tiện.

Không biến app thành dashboard số liệu ở mọi màn hình. Trang du khách ưu tiên bản đồ, ảnh và hành động; trang hộ ưu tiên việc cần làm; trang quản lý mới có mật độ biểu đồ cao. Hiển thị thông tin theo từng lớp: tóm tắt trước, mở rộng khi cần. Responsive ở 375px, 768px và 1440px; không tràn ngang. Điều khiển bằng bàn phím được, focus rõ, modal giữ focus hợp lý, độ tương phản tốt; trạng thái đông/vắng có nhãn chữ bên cạnh màu.

Ngôn ngữ chính tiếng Việt. Tiếng Anh là lựa chọn phụ nếu đủ nội dung; tiếng Khmer ưu tiên ở nội dung văn hóa và nhập giọng nói khi được hỗ trợ. Không tạo bản dịch Khmer giả hoặc khẳng định nội dung đã được cộng đồng duyệt khi chưa có.

## 4. Điều hướng và màn hình chào

Màn chào có hai lựa chọn nổi bật: “Tôi là du khách” và “Tôi cung cấp trải nghiệm”. Liên kết nhỏ “Cổng quản lý” mở các vai trò cơ quan quản lý, vận hành và cố vấn cộng đồng trong demo.

Trail: Khám phá / Hành trình / Hộ chiếu / Cá nhân. Sự kiện, ưu đãi, địa điểm đã lưu, thông báo và hỗ trợ đi vào từ vị trí phù hợp, không thêm quá nhiều tab.

Studio: Tổng quan / Trải nghiệm / Lịch & Booking / Báo cáo / Hỗ trợ & Đề án.

Cổng cơ quan quản lý: Tổng quan / Luồng khách / Nhu cầu & Cơ hội / Đề án / Báo cáo.

Cổng vận hành: Booking & Giao dịch / Nội dung / Sự cố / Chất lượng & Hỗ trợ hộ. Cố vấn cộng đồng có hàng chờ duyệt văn hóa và xem xét ngoại lệ theo quyền.

## 5. Trail — Khám phá và hồ sơ địa điểm

### 5.1 Bản đồ là nội dung chính

- Phía trên trang Khám phá là bản đồ tương tác của khu vực dự án Vĩnh Long, có pan, zoom, marker theo loại, nhóm marker khi cần và nút vị trí của tôi.
- Chỉ xin quyền định vị khi người dùng bấm; nếu từ chối cho chọn điểm xuất phát thủ công.
- Có thống kê nhỏ số địa điểm/trải nghiệm trong dữ liệu đang hiển thị. Không lấy những con số ví dụ như “100 chùa, 20 bảo tàng” làm thống kê thật của tỉnh.
- Danh sách card và marker đồng bộ khi lọc; chọn marker mở popup và nút xem chi tiết. Mobile dùng bottom sheet; desktop dùng panel cạnh bản đồ.
- Tìm kiếm không phân biệt dấu; lọc theo loại hình/hoạt động, sở thích, thời gian có sẵn, khoảng cách, còn chỗ, đánh giá cao và trải nghiệm mới. Danh mục gồm thủ công, ẩm thực, tôn giáo, lễ hội, bảo tàng/di tích và thiên nhiên nếu có dữ liệu.
- Khu vực “Mới trên mạng lưới”, “Thường trải nghiệm cùng nhau”, “Sự kiện sắp tới”. Dưới bản đồ có CTA: “Cho chúng tôi biết sở thích để gợi ý hành trình phù hợp với bạn”.
- Bản đồ dùng tọa độ phù hợp với địa điểm; nếu chưa xác minh, đánh dấu vị trí minh họa. Không tự vẽ ranh giới hành chính sai hoặc trộn dữ liệu địa bàn cũ/mới mà không giải thích phạm vi.

### 5.2 Hồ sơ địa điểm gọn, tránh thông tin thừa

Hiển thị ngay: ảnh, tên, loại hình, mô tả 2–3 câu, địa chỉ/nút chỉ đường, giờ mở cửa, giá hoặc miễn phí, thời gian tham quan gợi ý, đánh giá và huy hiệu duy nhất nếu đủ điều kiện.

Bên dưới có các mục mở rộng: “Bạn có thể làm gì?”, “Câu chuyện nơi đây”, “Cần biết trước khi đến”, “Đánh giá”. Hoạt động trả phí có card riêng gồm nội dung, thời lượng, khung giờ, số chỗ còn lại, giá và điều kiện phù hợp. Hiển thị lưu ý trang phục, nghi lễ, trẻ em, khả năng tiếp cận, chỗ nghỉ/ngồi hoặc tiện ích khi có dữ liệu. Không mặc định loại người cao tuổi; mô tả mức vận động và giới hạn cụ thể của hoạt động.

CTA: “Thêm vào hành trình”, “Đặt trải nghiệm”, “Lưu địa điểm”. Có hoạt động/địa điểm gần đó và gợi ý ghép hành trình. Tỷ lệ phản hồi đặt trong thông tin liên hệ/đặt chỗ, không cần chen vào card khám phá.

Không đưa mã địa điểm, đơn vị quản lý, nguồn, người duyệt, điểm CPS hoặc chủ đề trùng với loại hình lên phần hồ sơ chính cho du khách. Những trường cần vận hành vẫn lưu nội bộ. Phân biệt địa điểm tham quan miễn phí với hoạt động cần đặt tại cùng địa điểm; không bắt mua dịch vụ để vào nơi miễn phí. Không mặc định chùa có dịch vụ mâm cúng trả tiền nếu chưa có dữ liệu được chấp thuận.

## 6. Trail — Cá nhân hóa và tạo hành trình

### 6.1 Form từng bước, có tiến trình

Thu thập ngày đi, giờ bắt đầu, thời gian sẵn có, điểm xuất phát, số người; sở thích; nhịp độ “Gọn nhẹ / Vừa phải / Chậm và tìm hiểu sâu”; ưu tiên “Yên tĩnh / Náo nhiệt / Linh hoạt”; phương tiện đang sử dụng để ước tính di chuyển, không phải đặt phương tiện. Hỏi có trẻ nhỏ/người cần hỗ trợ và yêu cầu tiếp cận khi liên quan. Nhóm tuổi và nơi đến là tùy chọn, giải thích mục đích; không bắt nhập ngày sinh, địa chỉ nhà hay dữ liệu không cần thiết. Ngân sách chưa hiện ở phiên bản này.

### 6.2 Kết quả hành trình

- Tạo 2–3 phương án có tên dễ hiểu, khác nhau về nhịp độ/chủ đề, chẳng hạn “Khám phá gọn nhẹ”, “Văn hóa & Ẩm thực”, “Trải nghiệm chuyên sâu”; chỉ hiển thị khi dữ liệu đủ tạo phương án hợp lệ.
- Mỗi phương án có timeline, bản đồ, tổng thời gian, thời gian di chuyển, tổng chi phí hoạt động đang chọn, nội dung nổi bật và giải thích ngắn vì sao phù hợp.
- Mỗi chặng gồm giờ đến/rời, hoạt động, giá, lưu ý, tình trạng đặt chỗ và thời gian đệm.
- Ghép các điểm thành câu chuyện hợp lý, ví dụ tìm hiểu văn hóa → thực hành nghề → thưởng thức ẩm thực, không chỉ chọn ngẫu nhiên vài marker.
- Thêm, xóa, thay thế, sắp xếp điểm bằng nút lên/xuống; kéo thả là bổ sung. Mọi thay đổi phải tính lại lịch, giá và cảnh báo.
- Chỉ dùng trải nghiệm đã công bố, địa điểm có trong dữ liệu, đúng giờ mở, lịch nghi lễ, còn sức chứa, đủ thời gian di chuyển và phù hợp điều kiện tham gia. Một nhóm vượt sức chứa không được lọt qua.
- Trong demo dùng thuật toán có quy tắc, kết quả có thể kiểm tra. Ghi “Gợi ý tự động — bản demo”; không giả vờ gọi AI thật. Thời gian di chuyển chưa có dịch vụ định tuyến phải ghi là ước tính; đường nối minh họa không được gọi là tuyến đường lái xe chính xác.
- Nếu không có lịch phù hợp, nêu lý do và đề xuất đổi thời gian, giảm điểm hoặc thay hoạt động. Không tự tạo chỗ trống hay bịa trải nghiệm.
- CTA “Chọn hành trình này”; cho lưu bản nháp và chia sẻ/in bản tóm tắt không chứa dữ liệu riêng tư.

## 7. Trail — Booking, thanh toán và chuẩn bị

- Đặt một trải nghiệm hoặc nhiều trải nghiệm trong một luồng. Tóm tắt rõ địa điểm, hoạt động, lịch, số người, giá, voucher, số tiền đặt cọc/cần thanh toán và chính sách từng hoạt động.
- Các điểm tham quan tự do vẫn nằm trong lịch nhưng không tạo giao dịch bắt buộc.
- Cho chọn trả trước/đặt cọc khi hoạt động hỗ trợ. Thanh toán demo không thu thông tin thẻ và không chuyển tiền thật.
- Hộ có thể chấp nhận hoặc từ chối. Mỗi hoạt động trong combo có trạng thái riêng; chỉ thông báo toàn bộ hành trình đã xác nhận khi các phần cần xác nhận đã được chấp nhận.
- Có kiểm tra lại sức chứa trước khi xác nhận, xử lý việc bị từ chối/hết chỗ bằng đổi giờ, thay trải nghiệm hoặc hủy phần liên quan; hiện tác động tới tổng tiền.
- Mô hình giữ chỗ có thời hạn. Hết hạn, từ chối hoặc hủy phải trả chỗ đúng một lần. Nêu rõ triển khai thật cần backend để khóa chỗ nguyên tử và ngăn overbooking giữa nhiều thiết bị.
- Sau đặt thành công có mã booking, vé/QR demo, lời chào từ hộ, địa chỉ, giờ hẹn, nội dung, lưu ý văn hóa và hành động xem hành trình.
- Chính sách đổi/hủy có mốc thời gian và phí minh họa cấu hình được; trước khi xác nhận hủy phải hiển thị số tiền hoàn dự kiến.
- Thông báo sự kiện theo mùa và ưu đãi đăng ký sớm: có ngày, điều kiện, hạn dùng, số chỗ và CTA. Người dùng chủ động bật/tắt nhận thông báo.

## 8. Trail — Trong chuyến đi, heatmap và hỗ trợ

- Màn “Hành trình đang diễn ra” có bản đồ, timeline, điểm hiện tại/tiếp theo, giờ hẹn và nút chỉ đường. Có thể mở dịch vụ bản đồ ngoài bằng liên kết hợp lệ.
- Bấm “Đã ghé thăm” để theo dõi tiến độ và chuyển chặng. Tách tiến độ tự đánh dấu khỏi xác nhận booking hoàn thành để không cộng thưởng hoặc giải ngân chỉ bằng một cú tick.
- Heatmap có cả ở Khám phá và trong hành trình: các mức Vắng / Vừa / Đông / Gần hết sức chứa; hiển thị thời điểm cập nhật và loại dữ liệu. Demo phải ghi rõ mô phỏng, không tuyên bố số người thật.
- Khách được lựa chọn tránh đông hoặc đến nơi đông để hòa chung hoạt động. Không mặc định luôn phân tán khách khỏi mọi điểm đông; sức chứa và hạn chế văn hóa vẫn là ràng buộc bắt buộc.
- Khi thay điểm do mật độ, hiển thị lịch trình đề xuất và ảnh hưởng đến booking/chi phí trước khi người dùng đồng ý. Không tự hủy hoặc đổi booking đã xác nhận.
- QR mở câu chuyện ngắn, lựa chọn ngôn ngữ và trải nghiệm gần đó còn chỗ. Có nhập mã/tải ví dụ QR khi camera không dùng được; nếu quét bằng camera phải có thư viện giải mã thật và xử lý quyền truy cập.
- Audio có phát/tạm dừng và bản chép chữ. Chỉ gọi nội dung “đã duyệt” khi dữ liệu có trạng thái phê duyệt. Thiếu audio/giọng Khmer thì hiện văn bản, không giả âm thanh.
- Nút “Cần hỗ trợ” dễ thấy xuyên suốt chuyến đi. Có gửi yêu cầu tới đội hỗ trợ, liên hệ hotline/Zalo cấu hình sẵn; không bịa số điện thoại thật hoặc báo đã kết nối người thật trong demo.
- Báo cáo: hộ không đón khách, giá sai, an toàn, hoạt động khác mô tả, khác. Cho nhập mô tả và đính kèm ảnh minh họa nếu có thể.
- Khách chọn mong muốn đổi giờ, chuyển trải nghiệm tương tự gần đó hoặc hoàn tiền. Tạo ticket, mã yêu cầu, timeline xử lý và kết quả. Mốc 1–2 ngày làm việc là mục tiêu xử lý đề xuất, không trình bày thành bảo đảm vận hành.
- Có thể tiếp tục theo dõi ticket sau chuyến đi. Khi mạng yếu hiển thị hành trình đã lưu và thông tin liên hệ đã tải; không hứa bản đồ offline đầy đủ nếu chưa triển khai.

## 9. Trail — Sau chuyến đi và quay lại

- Booking hoàn thành đủ điều kiện mới được đánh giá 1–5 sao, với các hạng mục chất lượng trải nghiệm, đón tiếp, đúng mô tả và góp ý. Không tạo nhiều đánh giá cho cùng booking.
- Traveller Passport: bản đồ các điểm đã ghé, dấu trải nghiệm đã xác nhận, lịch sử hành trình và bộ sưu tập khám phá. Phân biệt dấu tự lưu và dấu được xác nhận nếu hỗ trợ cả hai.
- Điểm thưởng cho trải nghiệm hoàn thành, đổi voucher có điều kiện/hạn dùng, trừ điểm chính xác; ngăn cộng điểm lặp khi reload hoặc bấm nhiều lần. Có thể thưởng khám phá nhiều hộ khác nhau.
- Hộ đánh giá khách về lịch sự, đúng giờ, tôn trọng văn hóa. Khách xem phản hồi và yêu cầu xem xét nếu có tranh chấp.
- Trạng thái Trusted Traveller có tiêu chí minh họa minh bạch và đặc quyền như ưu đãi khách thân thiết; không công khai danh sách khách điểm thấp hoặc dùng điểm để tự động từ chối phục vụ.
- Có đặt lại, gợi ý các hộ liên quan, ưu đãi và sự kiện sắp tới. Cá nhân hóa theo lịch sử chỉ khi người dùng đồng ý và có đủ dữ liệu; nếu chưa đủ thì dùng nhu cầu đã nhập.

## 10. Studio — Quản lý dịch vụ dễ dùng

### 10.1 Tổng quan

Thẻ tổng doanh thu, khách đã phục vụ, trải nghiệm đã tổ chức, điểm sao và booking cần phản hồi. Tách “Tiền chờ nhận” khỏi “Đã nhận”. Có việc cần làm hôm nay, danh sách dịch vụ và nút “+ Thêm trải nghiệm” nổi bật.

### 10.2 Hồ sơ và đăng trải nghiệm

- Form theo bước: tên/loại hình, ảnh, giới thiệu, câu chuyện, địa chỉ/vị trí, giờ mở, hoạt động, giá, thời lượng, khung giờ, sức chứa, điều kiện nhận khách và lưu ý.
- Tách hồ sơ địa điểm khỏi các trải nghiệm được tổ chức ở đó. Một hộ/đơn vị có thể có nhiều hoạt động.
- Lưu nháp, xem trước giao diện khách, gửi duyệt. Khi sửa nội dung văn hóa đã công bố, giữ bản đang được duyệt cho khách cho tới khi bản mới được chấp thuận.
- Nhập giọng nói Việt/Khmer nếu trình duyệt thực sự hỗ trợ; có phương án gõ tay. AI chỉ gợi ý cấu trúc, chuyển lời nói và bản dịch trong vùng nháp. Hộ/cộng đồng/chùa có quyền duyệt cuối cùng. Không tự viết lại nội dung văn hóa rồi công bố.
- Cho quản lý giá, đóng/mở slot, sức chứa, lịch nghỉ mùa vụ/lịch nghi lễ. Không giảm sức chứa xuống dưới số chỗ đã xác nhận mà bỏ qua xử lý booking liên quan.

### 10.3 Booking, khách và thu nhập

- Xem dạng lịch/danh sách, lọc trạng thái, chấp nhận/từ chối kèm lý do và thông báo cho khách trong demo.
- Chỉ hiện thông tin khách cần để đón tiếp; có giờ, số người, yêu cầu đặc biệt, khoản đã trả/còn lại và hoạt động đã đặt.
- Check-in/xác nhận hoàn thành với lịch sử thao tác. Đánh giá khách sau hoàn thành.
- Thu nhập: doanh thu gộp, hoàn tiền, phí/hoa hồng cấu hình minh họa, khoản hộ nhận, đang giữ và đã giải ngân. Giải thích cách tính.
- Theo đề xuất, khoản đủ điều kiện được giải ngân vào ngày sau khi hoàn thành nếu không có sự cố được báo trước giải ngân. Ticket liên quan đang mở phải giữ khoản tiền tương ứng để vận hành xem xét; demo dùng nút mô phỏng thời gian, không chờ ngày thật.
- Tham gia/rời combo theo lựa chọn; gợi ý đối tác gần đó và khách được giới thiệu chéo.

### 10.4 Báo cáo, CPS và cải thiện

- Biểu đồ cột doanh thu 12 tháng, khách theo tuần; bộ lọc thời gian; đánh giá và góp ý khách. Hiển thị tỷ lệ phản hồi, tỷ lệ hoàn thành, khách quay lại/giới thiệu và xu hướng booking.
- CPS chỉ cho chính hộ và vai trò vận hành có thẩm quyền xem. Phân tích các thành phần trên; nếu tự đề xuất trọng số thì ghi là công thức minh họa, cấu hình được, giải thích cách chuẩn hóa và xử lý thiếu dữ liệu. Không coi hộ mới là chất lượng kém vì chưa có booking.
- Cập nhật điểm theo tuần, xét trạng thái theo tháng bằng mốc dữ liệu mô phỏng rõ ràng. Không giả tác vụ nền vẫn chạy khi website đóng.
- Hộ mới vào New Spotlight; hộ đáp ứng tiêu chí có huy hiệu duy nhất; Standard/Needs Improvement chỉ là trạng thái vận hành nội bộ.
- AI gợi ý thông tin còn thiếu, lượt xem cao nhưng ít booking, nhu cầu đồ uống/chỗ ngồi, slot thiếu cung, sản phẩm mới và combo. Mỗi gợi ý có căn cứ, mẫu số/kỳ đo, hành động đề xuất, nút áp dụng vào nháp/bỏ qua/đánh dấu đã làm. Không tự bịa “80% khách muốn…” nếu dữ liệu không có.
- Quy trình hỗ trợ: hướng dẫn cụ thể → theo dõi tiến bộ → đề xuất ghép combo nếu chưa cải thiện → tổng hợp vấn đề ẩn danh để xin hỗ trợ cấp quản lý. Ngôn ngữ thân thiện, không công khai bêu tên hộ.
- Hộ có thể yêu cầu xem xét thủ công do việc gia đình, mùa vụ hoặc nghi lễ. Khi được duyệt, tạm dừng/loại trừ khoảng thời gian phù hợp khỏi kỳ đánh giá; giữ lý do và lịch sử.

### 10.5 Đề án và hỗ trợ

- Gửi đề án hỗ trợ cơ sở vật chất, đào tạo, quảng bá hoặc phát triển sản phẩm: tiêu đề, vấn đề, hỗ trợ mong muốn, lợi ích dự kiến, minh chứng. Kinh phí đề xuất là trường tùy chọn trong đề án, không phải ngân sách chuyến đi.
- Lưu nháp/gửi, theo dõi trạng thái “Đã gửi / Đang xem xét / Cần bổ sung / Chấp thuận / Chưa chấp thuận”; phản hồi và bổ sung tài liệu. Không tự hứa cấp vốn khi mới duyệt hồ sơ.
- Có hướng dẫn từng bước, kênh tình nguyện viên/người hỗ trợ onboarding, Zalo/hotline cấu hình.
- Hộ có quyền tạm dừng hoặc yêu cầu rút khỏi mạng lưới. Hiển thị việc xử lý booking đang tồn tại trước khi hoàn tất; AI không tự xóa listing.

## 11. Cổng dữ liệu dành cho cơ quan quản lý

Thiết kế như dashboard Power BI nhưng dễ đọc; bộ lọc thời gian, khu vực, loại hình và nhóm khách áp dụng đồng bộ cho biểu đồ, KPI, bảng và file xuất.

- Tổng quan booking, lượt tham gia, tỷ lệ hoàn thành, doanh thu trải nghiệm và xu hướng theo tháng.
- Phân tích doanh thu theo nhóm hoạt động/khu vực; ranking mặc định theo cụm hoặc nhóm, không công khai doanh thu và CPS từng hộ. Nếu cần ranking địa điểm, chỉ dùng dữ liệu công khai/được đồng ý hoặc mã ẩn danh, ghi rõ phạm vi.
- Heatmap và luồng di chuyển tổng hợp, mức tập trung, khung giờ/ngày/mùa cao điểm; không hiện vị trí cá nhân theo thời gian thật.
- Phân khúc dựa trên dữ liệu được đồng ý: đi một mình/theo nhóm, nhóm tuổi tùy chọn, nơi đến, sở thích, thời lượng; ghi rõ đây là mẫu người dùng nền tảng, không phải đại diện mọi du khách của tỉnh.
- Phân tích cầu chưa đáp ứng theo hoạt động/slot, booking tập trung giữa các hộ, cơ hội phát triển sản phẩm và mở rộng mạng lưới.
- Dự báo mô phỏng có cơ sở phương pháp và giới hạn dữ liệu. Không trình bày đường biểu đồ tùy ý như dự báo đã kiểm chứng.
- Tổng hợp phản hồi ẩn danh, nhu cầu đào tạo và hỗ trợ; hiện số quan sát. Ẩn nhóm quá nhỏ bằng ngưỡng cấu hình để giảm nguy cơ nhận diện cá nhân/hộ.
- Tách doanh thu hoa hồng của Network với chi tiêu du khách ước tính trong cụm. Muốn gọi là “mức tăng chi tiêu” phải có kỳ gốc và phương pháp so sánh; nếu chưa có chỉ hiện ước tính, không khẳng định tác động nhân quả.
- Hộp thư đề án: lọc, xem hồ sơ, yêu cầu bổ sung, cập nhật kết quả và phản hồi đồng bộ về Studio. Người thẩm định đề án chỉ xem dữ liệu định danh được cung cấp trong hồ sơ và theo quyền; đây là luồng riêng với báo cáo thống kê ẩn danh.
- Xuất CSV dữ liệu tổng hợp đang lọc; có ngày cập nhật, phạm vi và chú thích dữ liệu mẫu.

## 12. Cổng vận hành và cố vấn cộng đồng

- Hàng chờ onboarding và kiểm duyệt listing/nội dung văn hóa; luồng bản nháp → chờ hộ/cộng đồng duyệt → được duyệt → công bố. Ghi ai làm gì, khi nào và phản hồi; tài khoản demo là giả lập.
- Điều phối booking thủ công, gợi ý giờ/điểm thay thế; khách xác nhận thay đổi có ảnh hưởng tới hành trình và tiền.
- Theo dõi trả trước/đặt cọc, khoản giữ, hoa hồng, hủy, hoàn tiền và giải ngân demo; đối soát theo từng hoạt động trong combo.
- Tiếp nhận ticket, gán người phụ trách, trao đổi, đổi lịch/chuyển hoạt động/hoàn tiền và cập nhật timeline cho khách.
- Theo dõi chất lượng, cấp/thu hồi huy hiệu theo tiêu chí có lý do, hỗ trợ hộ, duyệt ngoại lệ CPS, tham khảo đánh giá hai chiều khi giải quyết tranh chấp.
- Cố vấn cộng đồng Khmer có hàng chờ duyệt văn hóa và ngoại lệ phù hợp; không mặc định quyền xem mọi giao dịch hoặc mọi dữ liệu khách.
- B2B/lữ hành nằm trong roadmap, có mô tả mục đích và điều kiện triển khai sau khi mô hình được kiểm chứng; không tự thêm marketplace B2B phức tạp vào bản hiện tại.

## 13. Dữ liệu, trạng thái và cơ chế dùng chung

Tạo dữ liệu mẫu có quan hệ giữa destinations, hosts, experiences, slots, itineraries, bookings/bookingItems, payments, reviews, travellerReviews, passportStamps, pointsLedger, vouchers, events, supportTickets, proposals, moderationRecords và metrics.

Có khoảng 12–16 địa điểm/trải nghiệm đa dạng và dữ liệu báo cáo 12 tháng. Có thể dùng địa danh có thật như Chùa Âng, Ao Bà Om, bảo tàng và làng nghề khi đã kiểm tra tên/vị trí; không đồng nhất Ao Bà Om với tên một ngôi chùa. Với giá, lịch, nhận xét, hộ, ưu đãi, mật độ và số liệu vận hành chưa xác minh, dùng dữ liệu minh họa có nhãn, không gán chứng nhận hay phát ngôn giả cho đơn vị thật. Không cần có đủ tên thật nếu thiếu nguồn: có thể tạo hộ demo được ghi rõ.

Các quy tắc bắt buộc:

1. Booking phía Trail phải hiện trong Studio và vận hành trong cùng phiên dữ liệu; thay đổi trạng thái cập nhật mọi màn hình liên quan.
2. Phân biệt trạng thái booking, trạng thái thanh toán và trạng thái giải ngân. Mỗi thay đổi hợp lệ, có lịch sử; không từ “đã hủy” nhảy thẳng sang “đã hoàn thành”.
3. Không tính booking bị từ chối/hủy thành lượt hoàn thành. Phân biệt số booking với số khách và số lượt tham gia.
4. Hoàn tiền, trả chỗ, trừ voucher, cộng điểm và giải ngân phải chống thực hiện lặp.
5. Mô hình hành trình giữ các chặng miễn phí, booking trả phí và tình trạng từng chặng rõ ràng.
6. Luân phiên cơ hội hiển thị giữa các hộ phù hợp tương đương; ưu tiên phù hợp, còn chỗ và giới hạn văn hóa trước. Không ép khách sang trải nghiệm không phù hợp để cân bằng số lượt.
7. Dữ liệu xem/lịch sử dùng trong gợi ý và báo cáo phải có nguồn hoặc nhãn demo; không suy ra người có mặt thực tế chỉ từ số booking.
8. Các trạng thái, tiền và số liệu của dữ liệu mẫu phải nhất quán để trình diễn toàn bộ luồng, không tạo biểu đồ ngẫu nhiên khác hẳn bảng.

## 14. Phần bổ sung hợp lý cần có

- Lưu yêu thích, lịch trình nháp và lịch sử đặt.
- Tìm kiếm không dấu, danh sách thay thế khi bản đồ lỗi.
- Hỏi nhu cầu tiếp cận ở đúng ngữ cảnh; không bắt nhập quá nhiều thông tin cá nhân.
- Chia sẻ/in hành trình, thông báo in-app, tùy chọn nhận ưu đãi.
- Giải thích vì sao được gợi ý và nêu rõ tác động trước khi đổi hành trình.
- Nhật ký xử lý booking/đề án/sự cố để trình diễn tính liên kết giữa các bên.
- Trang “Về bản demo” tập trung giải thích giới hạn và roadmap. Không rải jargon kỹ thuật trong giao diện du khách.

## 15. Kịch bản nghiệm thu bắt buộc

Kiểm tra và ghi kết quả thực tế trong README; không nói đã kiểm thử nếu chưa chạy:

1. Chọn du khách → lọc bản đồ → mở chi tiết → thêm yêu thích → reload vẫn còn.
2. Nhập đoàn, giờ, sở thích → tạo lịch hợp lệ → thay/xóa điểm → thời gian và giá cập nhật.
3. Đặt combo → chuyển Studio → chấp nhận một phần, từ chối một phần → Trail thể hiện đúng và cho xử lý phần từ chối.
4. Thử đặt vượt sức chứa hoặc ngoài giờ → bị chặn với thông báo cụ thể.
5. Hoàn thành trải nghiệm đúng luồng → đánh giá → Passport và điểm tăng đúng một lần → đổi voucher không thể dùng lặp trái điều kiện.
6. Bật heatmap → chọn yên tĩnh/náo nhiệt → xem đề xuất đổi lịch, không tự thay booking.
7. Gửi sự cố yêu cầu hoàn tiền → vận hành xử lý → khách thấy tiến trình; khoản đang tranh chấp chưa được giải ngân.
8. Hộ tạo nháp bằng gõ tay → gửi duyệt → cộng đồng/vận hành duyệt → khách mới thấy nội dung công bố.
9. Hộ gửi đề án → cổng quản lý yêu cầu bổ sung → hộ cập nhật → quản lý phản hồi.
10. Hộ gửi ngoại lệ CPS → người có quyền duyệt → kỳ đánh giá cập nhật và có nhật ký.
11. Dashboard lọc thời gian/nhóm → KPI, biểu đồ, bảng và CSV khớp nhau; không lộ CPS cho khách/Sở.
12. Mobile không tràn, modal đóng được, nút hỗ trợ dễ tìm; từ chối GPS/camera hoặc tải bản đồ lỗi vẫn có cách tiếp tục.

## 16. Cách bàn giao

Hãy tự quyết định các chi tiết nhỏ theo brief, không hỏi lại những yêu cầu đã rõ. Bắt đầu bằng kiến trúc ngắn và danh sách màn hình, sau đó tạo đầy đủ mã nguồn.

Bàn giao:

- Toàn bộ file mã nguồn, có cây thư mục và tên từng file rõ ràng; nếu công cụ hỗ trợ thì tạo file tải xuống hoặc ZIP.
- README hướng dẫn chạy local bằng static server, đưa repository lên GitHub Pages, các bước cấu hình xuất bản cần kiểm tra theo giao diện GitHub hiện hành và lưu ý đường dẫn repository.
- Bảng đối chiếu yêu cầu → màn hình/chức năng → đã hoạt động trong demo / mô phỏng / giai đoạn sau. Chỉ ngân sách cá nhân hóa, lịch sử nâng cao khi chưa đủ dữ liệu và B2B được để giai đoạn sau; các luồng còn lại phải thao tác được ít nhất bằng dữ liệu demo.
- Liệt kê ngắn tích hợp production còn thiếu: xác thực và phân quyền server, database dùng chung, khóa chỗ, thanh toán, thông báo, AI, bản đồ định tuyến, dữ liệu mật độ, tác vụ định kỳ và xử lý vận hành thật.
- Hướng dẫn chỉnh màu, nội dung, địa điểm, slot, tiêu chí CPS/huy hiệu và thêm tính năng bằng module mà không tạo lại toàn bộ app.
- Nếu giới hạn đầu ra, chia mã nguồn thành các phần đánh số với manifest file đã xong/chưa xong; không dùng “phần còn lại tương tự”, không âm thầm bỏ tính năng và không tuyên bố hoàn thành khi còn thiếu file.

Kết quả mong muốn: một prototype thực sự có thể trình diễn hành trình từ du khách khám phá → đặt → hộ xác nhận → tham gia → hỗ trợ/đánh giá/điểm thưởng, đồng thời chứng minh dữ liệu liên kết tới quản lý hộ, đề án và dashboard cơ quan quản lý. Ưu tiên trải nghiệm dễ dùng và tính nhất quán xuyên suốt.
