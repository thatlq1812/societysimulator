# Kế hoạch Hoạt động Tương tác — *Digital Society Simulator*

**Môn học:** Chủ nghĩa Xã hội Khoa học (MLN131) — Đại học FPT  
**Nhóm:** Nhóm 4 — Lớp GD1812 — Half 2  
**Chủ đề thuyết trình:** Thanh niên Việt Nam trong cơ cấu xã hội  
**Căn cứ nội dung:** Chương 5 — *Cơ cấu xã hội – giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội*  
**Thành viên:** Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa

---

## 1. Tổng quan và Căn cứ Thiết kế

### 1.1 Vị trí trong cấu trúc buổi thuyết trình

Buổi thuyết trình kéo dài **45 phút**, được chia thành ba giai đoạn:

| Giai đoạn | Thời lượng | Nội dung |
|-----------|-----------|---------|
| Warm-up | ~10 phút | **Digital Society Simulator** *(hoạt động mô phỏng — chạy trước lý thuyết)* |
| Thuyết trình chính | ~25 phút | Trình bày nội dung Chương 5 |
| Kết — Phân tích dữ liệu | ~10 phút | Dùng kết quả game làm minh chứng học thuật |

> **Lý do đặt game lên đầu thay vì cuối:**  
> Đây là ứng dụng của phương pháp *Experiential Learning* (học qua trải nghiệm). Sinh viên trải nghiệm sự phân hóa giai cấp và mâu thuẫn lợi ích *trước* khi tiếp nhận hệ thống khái niệm. Khi phần thuyết trình bắt đầu, nhóm không cần thuyết phục — chỉ cần **đặt tên cho những gì người nghe vừa cảm nhận**. Đây là cơ chế tạo ra sự đồng thuận học thuật mạnh nhất, đồng thời loại bỏ hoàn toàn tâm thế thụ động của người nghe.

### 1.2 Mục tiêu học tập liên kết (CLO)

Hoạt động này được thiết kế để hỗ trợ trực tiếp các chuẩn đầu ra học phần:

- **CLO5** — Nắm vững cơ cấu xã hội – giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ
- **CLO9** — Hình thành năng lực lý luận và ứng dụng thực tiễn; thích ứng trước biến đổi của khoa học công nghệ
- **CLO10** — Tư duy phản biện; sử dụng AI có trách nhiệm và đạo đức

---

## 2. Cơ sở Lý luận của Thiết kế Game

### 2.1 Các khái niệm Chương 5 được lượng hóa trong trò chơi

Hệ thống biến số của trò chơi không phải điểm thưởng tùy tiện — chúng là **sự lượng hóa trực tiếp các phạm trù học thuật** của Chương 5:

| Biến số trong game | Khái niệm tương ứng trong Chương 5 |
|---|---|
| *Tích lũy Cá nhân* (vi mô) | Mâu thuẫn lợi ích cá nhân vs. lợi ích giai cấp |
| *Quyền lực Tư liệu Sản xuất* (vi mô) | Quan hệ sở hữu tư liệu sản xuất trong kinh tế số |
| *Chỉ số Liên minh Công–Nông–Trí thức* (vĩ mô) | Liên minh giai cấp, tầng lớp (Mục II, Chương 5) |
| *Chỉ số Phân hóa Xã hội* (vĩ mô) | Sự biến đổi phức tạp của cơ cấu xã hội – giai cấp |
| *Lực lượng Sản xuất Quốc gia* (vĩ mô) | Cơ cấu kinh tế quy định cơ cấu xã hội – giai cấp |

### 2.2 Cơ chế định hướng học thuật

Trò chơi định hướng người chơi theo lý luận Mác–Lênin **không phải bằng cách áp đặt đáp án đúng**, mà thông qua **cơ chế nhân quả của hệ thống**:

- Nếu đa số tối đa hóa *Tích lũy Cá nhân* → *Chỉ số Phân hóa* tăng vọt → *Chỉ số Liên minh* sụp đổ → xã hội mất ổn định
- Hệ quả này hiển thị trực tiếp trên màn hình lớp, tạo ra bằng chứng thực nghiệm cho lý luận: *việc giải quyết mâu thuẫn giai cấp và xây dựng khối liên minh là điều kiện sống còn của sự phát triển xã hội bền vững*

> Đây là sự khác biệt cốt lõi so với quiz truyền thống: **quiz kiểm tra trí nhớ, simulation kiểm tra tư duy**.

---

## 3. Thiết kế Trò chơi — Cơ chế Chi tiết

### 3.1 Thông số cơ bản

- **Nền tảng:** Web App — truy cập qua QR code, không cài đặt
- **Số người chơi:** ~35 sinh viên, chơi **cá nhân**, đồng thời
- **Thời lượng:** 10 phút (phần warm-up)
- **Chủ đề bối cảnh:** Thanh niên Việt Nam trong kỷ nguyên chuyển đổi số

### 3.2 Luồng trải nghiệm 5 bước

```
[Bước 1 — 1 phút]  Quét QR → Phân bổ vai trò ngẫu nhiên
        ↓
[Bước 2 — 6-7 phút]  6 tình huống × 30 giây/tình huống
        ↓
[Bước 3 — Realtime]  Biểu đồ vĩ mô cập nhật liên tục trên màn hình lớp
        ↓
[Bước 4 — 2 phút]  AI tổng hợp dữ liệu → "Bản tin Xã hội 2030"
        ↓
[Bước 5 — 1 phút]  Công bố 3 danh hiệu → Cầu nối sang phần thuyết trình
```

**Chi tiết từng bước:**

**Bước 1 — Phân bổ vai trò (1 phút)**  
Sinh viên quét QR, truy cập web. Hệ thống ngẫu nhiên gán một trong bốn vai trò. Màn hình điện thoại hiển thị profile nhân vật, bối cảnh xuất phát điểm và chỉ số khởi đầu.

**Bước 2 — Chuỗi quyết định sinh tồn (6–7 phút)**  
Sáu tình huống thực tế về chuyển đổi số, mỗi tình huống 30 giây. Người chơi chọn một trong ba hành động. Mỗi lựa chọn tác động đồng thời lên hai cấp độ: biến số vi mô (cá nhân) và biến số vĩ mô (xã hội giả lập).

**Bước 3 — Hiệu ứng cánh bướm (thời gian thực)**  
Sau mỗi tình huống, màn hình chiếu cập nhật trực tiếp: biểu đồ *Chỉ số Liên minh* và *Chỉ số Phân hóa* thay đổi theo tổng hợp quyết định của 35 người. Sinh viên thấy ngay hành động cá nhân ảnh hưởng thế nào đến cấu trúc xã hội chung.

**Bước 4 — AI phân tích và tổng kết (2 phút)**  
Toàn bộ dữ liệu lựa chọn của 35 sinh viên được đẩy qua Anthropic API. AI sinh ra **"Bản tin Xã hội 2030"** — mô tả hình thái xã hội mà lớp học vừa tạo ra, dựa trên nền tảng lý luận Chương 5. Bản tin hiển thị minh bạch ghi chú: *"Nội dung được tổng hợp bởi AI từ dữ liệu hành vi tập thể, phục vụ mục đích học thuật."*

**Bước 5 — Tuyên bố kết quả (1 phút)**  
Hệ thống công bố 3 danh hiệu cá nhân. Nhóm thuyết trình dùng kết quả làm cầu nối: *"Những gì các bạn vừa trải nghiệm — sự phân hóa, mâu thuẫn lợi ích, vai trò của liên minh — chính là những khái niệm mà Chủ nghĩa Xã hội Khoa học đã phân tích từ thế kỷ XIX và còn nguyên giá trị đến hôm nay."*

---

### 3.3 Bốn vai trò — Cơ cấu xã hội thu nhỏ

Bốn vai trò được thiết kế để đại diện đầy đủ cho cơ cấu thanh niên Việt Nam trong kỷ nguyên số, bám sát phân loại giai cấp và tầng lớp của Chương 5:

| Vai trò | Hình mẫu thực tế | Đại diện trong Chương 5 | Nhiệm vụ lịch sử |
|---|---|---|---|
| **Công nhân Nền tảng** | Gig worker, tài xế công nghệ, giao hàng | Giai cấp công nhân hiện đại | Sinh tồn và củng cố liên minh |
| **Nông dân 4.0** | Smart farmer, IoT nông nghiệp | Giai cấp nông dân thời số hóa | Tự chủ sản xuất và kết nối tri thức |
| **Trí thức Công nghệ** | Kỹ sư, dev, nhà nghiên cứu | Tầng lớp trí thức thời đại mới | Chia sẻ tư liệu sản xuất tri thức |
| **Chủ Startup / Nền tảng** | Founder, doanh nhân số | Tầng lớp doanh nhân mới nổi | Tăng trưởng không bóc lột |

> **Cơ chế công bằng:** Người thắng không phải người có *điểm tài sản cao nhất*, mà là người **hoàn thành xuất sắc nhất sứ mệnh giai cấp của mình** trong điều kiện lịch sử giả định. Mỗi vai trò có thang điểm tối ưu riêng — giải quyết bài toán bất đối xứng vốn có trong thiết kế game nhiều giai cấp.

---

### 3.4 Hệ thống biến số kép

**Cấp vi mô — hiển thị trên điện thoại người chơi:**

- **Tích lũy Cá nhân:** Tăng khi quyết định tư lợi (chiếm dữ liệu, ép giá lao động, sa thải để tối ưu lợi nhuận)
- **Quyền lực Tư liệu Sản xuất:** Mức độ làm chủ dữ liệu và thuật toán, thay vì chỉ làm thuê cho nền tảng

**Cấp vĩ mô — hiển thị trên màn hình chiếu:**

- **Chỉ số Liên minh Công–Nông–Trí thức:** Tăng khi các vai trò hỗ trợ chéo nhau; giảm khi bóc lột hoặc cạnh tranh triệt tiêu
- **Chỉ số Phân hóa Xã hội:** Khoảng cách chênh lệch giữa người giàu nhất và nghèo nhất trong lớp; cao đồng nghĩa với mất ổn định
- **Lực lượng Sản xuất Quốc gia:** Năng lực kinh tế số tổng thể của xã hội giả lập

---

### 3.5 Hai kịch bản kết thúc

> **Nguyên tắc thiết kế:** Xã hội luôn tồn tại ở cả hai kịch bản — chỉ *chất lượng* khác nhau. Không có trường hợp "toàn lớp thua" gây không khí nặng nề trước phần thuyết trình.

**Kịch bản 1 — Đứt gãy Cơ cấu**

*Điều kiện:* Phân hóa Xã hội > 70% · Liên minh < 30%

*Hệ quả:* AI tổng hợp thành bản tin về thất nghiệp, đứt gãy liên minh, bất ổn xã hội. Người có điểm tích lũy cao nhất được highlight với danh hiệu trào phúng: *"Nhà tư bản cuối cùng trên con tàu đắm"* — minh chứng trực tiếp cho lý luận: tích lũy của một nhóm nhỏ là vô nghĩa khi cơ cấu xã hội sụp đổ.

**Kịch bản 2 — Chuyển đổi số Bền vững**

*Điều kiện:* Phân hóa Xã hội < 50% · Liên minh > 60%

*Hệ quả:* AI tổng hợp bản tin về phát triển, thanh niên tiên phong, liên minh vững chắc. Kích hoạt trao 3 danh hiệu cá nhân.

---

### 3.6 Ba danh hiệu — Phân định kết quả

| Danh hiệu | Tiêu chí xét tặng | Ý nghĩa học thuật |
|---|---|---|
| **Ngọn cờ Liên minh** | Điểm Đóng góp Liên minh cao nhất | Thanh niên kiến tạo — đặt lợi ích tập thể lên trên lợi ích cá nhân |
| **Kẻ sinh tồn Tối ưu** | Điểm Tích lũy cao nhất *và* không làm giảm Chỉ số Liên minh ở bất kỳ vòng nào | Làm giàu hợp pháp trong kinh tế thị trường định hướng xã hội chủ nghĩa |
| **Mắt xích Rủi ro** | Tỷ lệ lợi ích cá nhân / đóng góp vĩ mô mất cân bằng nhất | Case study: *"Nếu tất cả 35 người đều chọn như vậy, xã hội sẽ ra sao?"* |

---

### 3.7 Tình huống mẫu

Dưới đây là hai trong sáu tình huống được thiết kế. Không có đáp án đúng/sai tuyệt đối — mỗi lựa chọn kéo biến số theo hướng khác nhau tùy thuộc vào bối cảnh tổng thể của lớp.

---

**Tình huống 1 — Cú sốc Tự động hóa**

> *Năm 2026. AI và robotics thay thế 40% nhân sự cơ bản tại các khu công nghiệp và nền tảng giao hàng. Bạn là người điều hành một startup logistics.*

- **A.** Sa thải nhân sự hàng loạt, triển khai AI toàn bộ — lợi nhuận tăng 60% ngay lập tức *(Tích lũy Cá nhân +20 · Phân hóa +15 · Liên minh -10)*
- **B.** Tái đào tạo nhân sự hiện tại để vận hành hệ thống AI — tốn chi phí nhưng giữ đội ngũ *(Tích lũy +5 · Lực lượng Sản xuất +10 · Liên minh +8)*
- **C.** Liên kết với các startup khác tạo quỹ hỗ trợ chuyển đổi nghề — hi sinh tăng trưởng cá nhân *(Tích lũy -5 · Liên minh +20 · Phân hóa -10)*

---

**Tình huống 2 — Độc quyền Dữ liệu**

> *Tập đoàn công nghệ nước ngoài đề nghị mua toàn bộ dữ liệu người dùng nông nghiệp mà bạn (Nông dân 4.0) đã thu thập trong 3 năm. Giá đề nghị rất hấp dẫn.*

- **A.** Bán toàn bộ dữ liệu — thu về số tiền lớn để đầu tư mở rộng trang trại cá nhân *(Tích lũy +18 · Quyền lực TLSX -15 · Liên minh -8)*
- **B.** Từ chối bán, tự xây nền tảng hợp tác xã số với các nông dân khác trong vùng *(Tích lũy -5 · Quyền lực TLSX +20 · Liên minh +15)*
- **C.** Bán một phần, giữ lại dữ liệu nhạy cảm — thỏa hiệp để có vốn lẫn tự chủ *(Tích lũy +8 · Quyền lực TLSX +5 · Liên minh +3)*

---

## 4. Ứng dụng AI có Trách nhiệm

Theo yêu cầu của môn học (CLO10) và tiêu chí chấm điểm thứ tư của giảng viên, AI được tích hợp theo nguyên tắc sau:

**AI làm gì trong hệ thống:**
- Tổng hợp dữ liệu hành vi tập thể của 35 sinh viên sau khi kết thúc 6 tình huống
- Sinh ra "Bản tin Xã hội 2030" — diễn giải hệ quả xã hội dựa trên các lựa chọn thực tế
- Sử dụng Anthropic API (Claude), được cấu hình với system prompt chứa nền tảng lý luận Chương 5

**AI không làm:**
- Không chấm điểm đúng/sai lựa chọn của từng người — tránh cơ chế áp đặt học thuật
- Không đưa ra phán xét đạo đức về quyết định cá nhân
- Không thay thế nhận xét của giảng viên hoặc nhóm thuyết trình

**Tính minh bạch:**
- Màn hình hiển thị rõ ràng: *"Bản tin được tổng hợp bởi AI từ dữ liệu hành vi tập thể của lớp, phục vụ mục đích học thuật."*
- Sinh viên biết rằng kết quả phản ánh **hành động của chính họ**, không phải phán xét của máy

---

## 5. Đánh giá theo 5 Tiêu chí của Giảng viên

| # | Tiêu chí | Cách thể hiện trong hoạt động |
|---|---|---|
| 1 | **Chiều sâu học thuật** | Hệ thống biến số lượng hóa trực tiếp các phạm trù Mác–Lênin: mâu thuẫn giai cấp, liên minh công–nông–trí thức, tư liệu sản xuất trong kinh tế số |
| 2 | **Sáng tạo hình thức** | Web app realtime với biểu đồ động — không dùng Kahoot, Quizizz hay bất kỳ nền tảng quiz có sẵn nào |
| 3 | **Tính tương tác** | 100% sinh viên ra quyết định cá nhân liên tục trong 10 phút; quyết định của mỗi người ảnh hưởng trực tiếp đến trạng thái xã hội chung |
| 4 | **Ứng dụng AI có trách nhiệm** | AI đóng vai Bộ máy Phân tích Hệ quả Vĩ mô — không chấm điểm độc đoán; kết quả AI được ghi nguồn và giải thích rõ cơ chế hoạt động |
| 5 | **Gắn kết thực tiễn** | 100% bối cảnh tình huống xoay quanh thanh niên Việt Nam trong nền kinh tế số năm 2025–2026: tự động hóa, gig economy, độc quyền dữ liệu, khởi nghiệp |

---

## 6. Kế hoạch Triển khai

| Giai đoạn | Nội dung công việc | Thời hạn |
|---|---|---|
| **Thiết kế & Duyệt** | Confirm concept với team; chốt 6 tình huống; thiết kế ma trận điểm số cho 4 vai trò × 3 lựa chọn | Tuần 1 |
| **Build Frontend** | Giao diện màn hình player (điện thoại) + màn hình host (chiếu); biểu đồ realtime | Tuần 2 |
| **Tích hợp AI** | Cấu hình Anthropic API; viết system prompt tạo Bản tin Xã hội 2030; test output với dữ liệu giả | Tuần 2–3 |
| **Test & Tinh chỉnh** | Chạy thử nội bộ; cân bằng ma trận điểm; đảm bảo không lag với 35 kết nối đồng thời | Tuần 3 |
| **Showcase** | Chạy thật trong buổi thuyết trình; thu dữ liệu làm minh chứng học thuật cho phần kết | Ngày trình |

---

## 7. Phụ lục — Cơ sở So sánh với Hình thức Truyền thống

Bảng so sánh dưới đây tóm tắt lý do thiết kế lựa chọn mô phỏng thay vì quiz:

| Tiêu chí | Quiz / Kahoot | Digital Society Simulator |
|---|---|---|
| Cơ chế nhận thức | Truy xuất trí nhớ ngắn hạn | Xây dựng hiểu biết qua trải nghiệm |
| Vị trí trong buổi học | Sau thuyết trình — kiểm tra | Trước thuyết trình — khai mở |
| Tính chủ thể | Người chơi nhận đáp án có sẵn | Người chơi *tạo ra* dữ liệu |
| Liên kết lý thuyết | Gián tiếp — qua câu hỏi | Trực tiếp — qua hệ quả của hành động |
| Ứng dụng AI | Không, hoặc chỉ tạo câu hỏi | AI phân tích hành vi tập thể và tổng hợp hệ quả |
| Phù hợp ngành thiết kế | Thấp — không có narrative | Cao — có nhân vật, diễn biến, kết thúc bất ngờ |

---

**Tài liệu tham khảo nội dung:**  
Bộ Giáo dục và Đào tạo. (2021). *Giáo trình Chủ nghĩa xã hội khoa học* (dành cho sinh viên đại học hệ không chuyên lý luận chính trị). NXB Chính trị Quốc gia Sự thật. Chương 5, tr. 173–205.
