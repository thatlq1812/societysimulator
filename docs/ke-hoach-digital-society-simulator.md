# Kế hoạch Hoạt động Tương tác — *Digital Society Simulator*

**Môn học:** Chủ nghĩa Xã hội Khoa học (MLN131) — Đại học FPT
**Nhóm:** Nhóm 4 — Lớp GD1812 — Half 2 - Spring 2026
**Chủ đề thuyết trình:** Thanh niên Việt Nam trong cơ cấu xã hội
**Căn cứ nội dung:** Chương 5 — *Cơ cấu xã hội – giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội*
**Thành viên:** Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa
**URL:** societysimulator.elixverse.com

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
[Bước 2 — 6-7 phút]  6 tình huống × 30 giây/tình huống (chọn ngẫu nhiên từ pool 12)
        ↓
[Bước 3 — Realtime]  Biểu đồ vĩ mô cập nhật liên tục + AI bình luận sau mỗi vòng
        ↓
[Bước 4 — 2 phút]  AI tổng hợp dữ liệu → "Bản tin Xã hội 2030"
        ↓
[Bước 5 — 1 phút]  Công bố 3 danh hiệu → Cầu nối sang phần thuyết trình
```

**Chi tiết từng bước:**

**Bước 1 — Phân bổ vai trò (1 phút)**
Sinh viên quét QR, truy cập web. Hệ thống ngẫu nhiên gán một trong bốn vai trò. Màn hình điện thoại hiển thị profile nhân vật với hình minh họa AI-generated, bối cảnh xuất phát điểm và chỉ số khởi đầu.

**Bước 2 — Chuỗi quyết định sinh tồn (6–7 phút)**
Hệ thống chọn ngẫu nhiên **6 trong 12 tình huống** (Fisher-Yates shuffle) thực tế về chuyển đổi số, mỗi tình huống 30 giây. Người chơi chọn một trong ba hành động. Mỗi lựa chọn tác động đồng thời lên hai cấp độ: biến số vi mô (cá nhân) và biến số vĩ mô (xã hội giả lập). Mỗi phiên chơi có tổ hợp tình huống khác nhau, tăng tính replay.

**Bước 3 — Hiệu ứng cánh bướm (thời gian thực)**
Sau mỗi tình huống, màn hình chiếu cập nhật trực tiếp: biểu đồ *Chỉ số Liên minh*, *Chỉ số Phân hóa*, và *Lực lượng Sản xuất* thay đổi theo tổng hợp quyết định của 35 người. **AI Tier 1** (Gemini 2.0 Flash) đưa ra bình luận ngắn 2-3 câu sau mỗi vòng, hiển thị trên màn hình chiếu. **AI Tier 2** (Gemini 2.5 Flash) phân tích xu hướng chi tiết hơn, hiển thị cho host để hỗ trợ bình luận trực tiếp.

**Bước 4 — AI phân tích và tổng kết (2 phút)**
Toàn bộ dữ liệu lựa chọn của 35 sinh viên được đẩy qua **Google Gemini 2.5 Flash API** (Tier 3). AI sinh ra **"Bản tin Xã hội 2030"** — mô tả hình thái xã hội mà lớp học vừa tạo ra, dựa trên nền tảng lý luận Chương 5. Bản tin hiển thị minh bạch ghi chú: *"Nội dung được tổng hợp bởi AI từ dữ liệu hành vi tập thể, phục vụ mục đích học thuật."*

**Bước 5 — Tuyên bố kết quả (1 phút)**
Hệ thống công bố 3 danh hiệu cá nhân (đảm bảo mỗi người chỉ nhận 1 danh hiệu). Nhóm thuyết trình dùng kết quả làm cầu nối: *"Những gì các bạn vừa trải nghiệm — sự phân hóa, mâu thuẫn lợi ích, vai trò của liên minh — chính là những khái niệm mà Chủ nghĩa Xã hội Khoa học đã phân tích từ thế kỷ XIX và còn nguyên giá trị đến hôm nay."*

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

### 3.5 Ba kịch bản kết thúc

> **Nguyên tắc thiết kế:** Xã hội luôn tồn tại ở cả ba kịch bản — chỉ *chất lượng* khác nhau. Không có trường hợp "toàn lớp thua" gây không khí nặng nề trước phần thuyết trình.

**Kịch bản 1 — Chuyển đổi số Bền vững**

*Điều kiện:* Phân hóa < 50% · Liên minh > 60% · Sản xuất > 40%

*Hệ quả:* AI tổng hợp bản tin về phát triển, thanh niên tiên phong, liên minh vững chắc. Kích hoạt trao 3 danh hiệu cá nhân.

**Kịch bản 2 — Đứt gãy Cơ cấu**

*Điều kiện:* Phân hóa > 70% · Liên minh < 30%, HOẶC Sản xuất < 20% · Liên minh < 40%

*Hệ quả:* AI tổng hợp thành bản tin về thất nghiệp, đứt gãy liên minh, bất ổn xã hội — minh chứng trực tiếp cho lý luận: tích lũy của một nhóm nhỏ là vô nghĩa khi cơ cấu xã hội sụp đổ.

**Kịch bản 3 — Trạng thái Bất ổn**

*Điều kiện:* Không đạt ngưỡng Bền vững cũng không đạt ngưỡng Đứt gãy

*Hệ quả:* AI mô tả xã hội ở trạng thái lấp lửng — có thể tiến, có thể lùi. Là trạng thái thường gặp nhất trong thực tế, tạo cơ hội thảo luận về vai trò chủ động của thanh niên.

---

### 3.6 Ba danh hiệu — Phân định kết quả

Mỗi người chơi chỉ nhận tối đa 1 danh hiệu (hệ thống dedup tự động loại trừ).

| Danh hiệu | Tiêu chí xét tặng | Ý nghĩa học thuật |
|---|---|---|
| **Ngọn cờ Liên minh** | Điểm Đóng góp Liên minh cao nhất | Thanh niên kiến tạo — đặt lợi ích tập thể lên trên lợi ích cá nhân |
| **Kẻ sinh tồn Tối ưu** | Điểm Tích lũy cao nhất *trong số người chưa nhận giải* + không làm giảm Chỉ số Liên minh | Làm giàu hợp pháp trong kinh tế thị trường định hướng xã hội chủ nghĩa |
| **Mắt xích Rủi ro** | Tỷ lệ lợi ích cá nhân / đóng góp vĩ mô mất cân bằng nhất *trong số người chưa nhận giải* | Case study: *"Nếu tất cả 35 người đều chọn như vậy, xã hội sẽ ra sao?"* |

---

### 3.7 Ngân hàng 12 tình huống

Hệ thống chọn ngẫu nhiên 6/12 mỗi phiên. Không có đáp án đúng/sai tuyệt đối — mỗi lựa chọn kéo biến số theo hướng khác nhau.

| # | Tên tình huống | Chủ đề |
|---|---|---|
| 1 | Cú sốc Tự động hóa | AI thay thế lao động, sa thải vs. tái đào tạo vs. quỹ chuyển đổi |
| 2 | Độc quyền Dữ liệu | Bán dữ liệu nông nghiệp cho tập đoàn nước ngoài vs. hợp tác xã số |
| 3 | Bằng sáng chế vs. Mã nguồn Mở | Patent vs. open-source vs. hợp tác xã công nghệ |
| 4 | Cuộc đình công Gig | Vận động quyền lợi lao động nền tảng vs. im lặng sinh tồn |
| 5 | Đề nghị Mua lại | Startup bị Big Tech mua lại vs. phát triển độc lập |
| 6 | Khoảng cách Số | Đầu tư hạ tầng nông thôn vs. ưu tiên đô thị ROI cao |
| 7 | Chia sẻ Nền tảng Số | Hoa hồng TMĐT vs. mô hình hợp tác xã |
| 8 | Khủng hoảng Nhà ở | Thuế BĐS vs. tự do thị trường vs. nhà ở hợp tác xã |
| 9 | Giáo dục Online | EdTech nước ngoài vs. nền tảng công lập mã nguồn mở |
| 10 | AI Tuyển dụng | AI sàng lọc CV có thiên kiến vs. kiểm toán vs. kết hợp |
| 11 | Blockchain Tự quản | DAO thay hành chính vs. giữ nguyên vs. mô hình kết hợp |
| 12 | Thu nhập Cơ bản Phổ quát | UBI vô điều kiện vs. phản đối vs. UBI có điều kiện |

---

## 4. Kiến trúc Hệ thống AI — 3 tầng

### 4.1 Tổng quan

| Tier | Mô hình | Thời điểm | Đối tượng | Mục đích |
|---|---|---|---|---|
| **Tier 1** — Bình luận | Gemini 2.0 Flash | Sau mỗi vòng | Màn hình chiếu | Nhận xét ngắn 2-3 câu về xu hướng lựa chọn |
| **Tier 2** — Xu hướng | Gemini 2.5 Flash | Sau mỗi vòng | Host (giảng viên) | Phân tích 3-5 câu + gợi ý bình luận |
| **Tier 3** — Bản tin | Gemini 2.5 Flash | Cuối game | Tất cả | "Bản tin Xã hội 2030" hoàn chỉnh |

### 4.2 Nguyên tắc AI có trách nhiệm

Theo yêu cầu CLO10 và tiêu chí chấm điểm:

**AI làm gì:**
- Tier 1+2: Bình luận xu hướng tập thể theo lý luận Chương 5 (fire-and-forget, không block gameplay)
- Tier 3: Tổng hợp dữ liệu hành vi tập thể → diễn giải hệ quả xã hội
- Tất cả prompt đều chứa system context với nền tảng lý luận Mác–Lênin Chương 5

**AI không làm:**
- Không chấm điểm đúng/sai lựa chọn của từng người
- Không đưa ra phán xét đạo đức về quyết định cá nhân
- Không thay thế nhận xét của giảng viên

**Tính minh bạch:**
- Màn hình hiển thị rõ ràng: *"Bản tin được tổng hợp bởi AI từ dữ liệu hành vi tập thể của lớp, phục vụ mục đích học thuật."*
- Sinh viên biết rằng kết quả phản ánh **hành động của chính họ**, không phải phán xét của máy

### 4.3 AI Image Generation

Hệ thống sử dụng **Gemini 2.5 Flash Image** để generate 20 hình minh họa:
- 4 hình vai trò (worker, farmer, intellectual, startup)
- 12 hình tình huống (mỗi scenario 1 hình)
- 3 hình kết quả (bền vững, đứt gãy, bất ổn)
- 1 hình hero (mạng lưới xã hội)

**Style rules thống nhất:** Dark background (#0d0d0d), accent đỏ cách mạng (#dc2626), vàng (#eab308), flat vector/geometric minimalism, không có chữ trong ảnh, palette giới hạn.

---

## 5. Kiến trúc Kỹ thuật

### 5.1 Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript strict |
| Styling | Tailwind CSS v3, dark-only, CSS variables |
| Real-time (màn chiếu) | Server-Sent Events (SSE) |
| Real-time (điện thoại) | REST polling mỗi 1.5 giây |
| State management | In-memory Map singleton (HMR-safe) |
| AI | Google Gemini API (`@google/generative-ai` + `@google/genai`) |
| Charts | Recharts (dynamic import, SSR disabled) |
| Icons | Custom SVG icon system (16 icons, không emoji) |
| Deploy | GCP Cloud Run, region asia-southeast1, max 1 instance |
| Domain | societysimulator.elixverse.com |

### 5.2 Pages

| Route | Mục đích |
|---|---|
| `/` | Landing page — hero image + 2 CTA |
| `/join` | Sinh viên nhập PIN + tên |
| `/play/[pin]` | Giao diện chơi trên điện thoại |
| `/host` | Tạo phòng mới |
| `/host/[pin]` | Bảng điều khiển giảng viên |
| `/screen/[pin]` | Màn hình chiếu (projector) |

### 5.3 API Routes

| Endpoint | Phương thức | Chức năng |
|---|---|---|
| `/api/room/create` | POST | Tạo phòng, trả PIN + host secret |
| `/api/room/[pin]/join` | POST | Sinh viên tham gia |
| `/api/room/[pin]/state` | GET | Polling trạng thái |
| `/api/room/[pin]/events` | GET (SSE) | Stream real-time cho màn chiếu |
| `/api/room/[pin]/choice` | POST | Ghi nhận lựa chọn |
| `/api/room/[pin]/advance` | POST | Host điều khiển game flow |
| `/api/room/[pin]/generate` | POST | Trigger AI Tier 3 |

---

## 6. Đánh giá theo 5 Tiêu chí của Giảng viên

| # | Tiêu chí | Cách thể hiện trong hoạt động |
|---|---|---|
| 1 | **Chiều sâu học thuật** | Hệ thống biến số lượng hóa trực tiếp các phạm trù Mác–Lênin: mâu thuẫn giai cấp, liên minh công–nông–trí thức, tư liệu sản xuất trong kinh tế số |
| 2 | **Sáng tạo hình thức** | Web app realtime với biểu đồ động, 12 tình huống xoay vòng, AI 3 tầng bình luận real-time, hình ảnh AI-generated — không dùng Kahoot, Quizizz hay bất kỳ nền tảng quiz có sẵn nào |
| 3 | **Tính tương tác** | 100% sinh viên ra quyết định cá nhân liên tục trong 10 phút; quyết định của mỗi người ảnh hưởng trực tiếp đến trạng thái xã hội chung |
| 4 | **Ứng dụng AI có trách nhiệm** | AI 3 tầng: bình luận real-time (Tier 1+2) + tổng kết cuối (Tier 3). Không chấm điểm độc đoán; kết quả AI được ghi nguồn và giải thích rõ cơ chế hoạt động |
| 5 | **Gắn kết thực tiễn** | 12 bối cảnh tình huống xoay quanh thanh niên Việt Nam trong nền kinh tế số 2025–2030: tự động hóa, gig economy, độc quyền dữ liệu, khởi nghiệp, UBI, blockchain, giáo dục online |

---

## 7. Kế hoạch Triển khai

| Giai đoạn | Nội dung công việc | Trạng thái |
|---|---|---|
| **Thiết kế & Duyệt** | Concept design; chốt 12 tình huống; thiết kế ma trận điểm cho 4 vai trò × 3 lựa chọn | Hoàn thành |
| **Build Frontend** | Giao diện player (điện thoại) + host + màn chiếu (projector); biểu đồ realtime; SVG icon system | Hoàn thành |
| **Backend & Real-time** | SSE streaming, REST API, in-memory state, Fisher-Yates shuffle | Hoàn thành |
| **Tích hợp AI** | 3 tầng AI Gemini: commentary, trend, bản tin; AI image generation cho 20 asset | Hoàn thành |
| **Deploy** | GCP Cloud Run, CI/CD GitHub Actions, custom domain | Hoàn thành |
| **Test & Tinh chỉnh** | Chạy thử, cân bằng điểm số, audit code, fix bugs | Hoàn thành |
| **Showcase** | Chạy thật trong buổi thuyết trình; thu dữ liệu làm minh chứng học thuật | Ngày trình |

---

## 8. Phụ lục — Cơ sở So sánh với Hình thức Truyền thống

| Tiêu chí | Quiz / Kahoot | Digital Society Simulator |
|---|---|---|
| Cơ chế nhận thức | Truy xuất trí nhớ ngắn hạn | Xây dựng hiểu biết qua trải nghiệm |
| Vị trí trong buổi học | Sau thuyết trình — kiểm tra | Trước thuyết trình — khai mở |
| Tính chủ thể | Người chơi nhận đáp án có sẵn | Người chơi *tạo ra* dữ liệu |
| Liên kết lý thuyết | Gián tiếp — qua câu hỏi | Trực tiếp — qua hệ quả của hành động |
| Ứng dụng AI | Không, hoặc chỉ tạo câu hỏi | AI 3 tầng phân tích hành vi tập thể real-time |
| Phù hợp ngành thiết kế | Thấp — không có narrative | Cao — có nhân vật, diễn biến, kết thúc bất ngờ |

---

**Tài liệu tham khảo nội dung:**
Bộ Giáo dục và Đào tạo. (2021). *Giáo trình Chủ nghĩa xã hội khoa học* (dành cho sinh viên đại học hệ không chuyên lý luận chính trị). NXB Chính trị Quốc gia Sự thật. Chương 5, tr. 173–205.
