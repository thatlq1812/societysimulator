# Digital Society Simulator

Web game mô phỏng cơ cấu xã hội trong kỷ nguyên chuyển đổi số. Dùng cho buổi thuyết trình Chương 5 — Chủ nghĩa Xã hội Khoa học (MLN131), Đại học FPT.

**Live:** [societysimulator.elixverse.com](https://societysimulator.elixverse.com)

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Cơ chế Game](#cơ-chế-game)
- [Hướng dẫn dẫn Game](#hướng-dẫn-dẫn-game)
- [Kiến thức áp dụng](#kiến-thức-áp-dụng)
- [Tech Stack](#tech-stack)
- [Cài đặt](#cài-đặt)
- [Kiến trúc kỹ thuật](#kiến-trúc-kỹ-thuật)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy-gcp-cloud-run)
- [Scripts](#scripts)
- [Team](#team)

---

## Tổng quan

~35 sinh viên truy cập web qua QR code, được phân vai ngẫu nhiên vào 4 giai cấp (Công nhân, Nông dân, Trí thức, Startup), trải qua 10 tình huống chuyển đổi số. Mỗi giai cấp nhận được bộ lựa chọn riêng biệt phản ánh lợi ích và góc nhìn của vai trò đó. Quyết định tập thể ảnh hưởng đến 6 chỉ số vĩ mô xã hội + 4 chỉ số vi mô cá nhân, hiển thị real-time trên màn chiếu. AI phân tích hành vi tập thể và tạo "Bản tin Xã hội Số".

### Tính năng chính

- **20 tình huống × 4 bộ lựa chọn** — Ma trận bất đối xứng 20×4: mỗi scenario có bộ A/B/C riêng cho từng giai cấp (240 lựa chọn tổng cộng)
- **10 tình huống mỗi phiên** — chọn ngẫu nhiên từ pool 20 (Fisher-Yates shuffle), không bao giờ lặp lại
- **4 vai trò** đại diện cơ cấu giai cấp Chương 5: Công nhân Nền tảng, Nông dân 4.0, Trí thức Công nghệ, Chủ Startup
- **6 chỉ số vĩ mô**: Liên minh, Phân hóa, Sản xuất, Đổi mới, Phúc lợi, Dân chủ
- **4 chỉ số vi mô**: Tích lũy (wealth), Quyền lực TLSX (control), Ảnh hưởng (influence), Sức chống chịu (resilience)
- **Hệ thống tính điểm động** — 10 cơ chế thưởng/phạt chéo giữa các chỉ số + dampening (giảm tốc gần cực trị)
- **3 kết cục** xã hội: Bền vững / Đứt gãy / Bất ổn
- **AI 3 tầng** (Google Gemini): bình luận real-time + phân tích xu hướng + bản tin cuối
- **5 danh hiệu** cá nhân với ảnh anime AI-generated
- **44 hình AI-generated** (Gemini) — scenario, role, theme, indicator, outcome, award illustrations
- **13 hiệu ứng âm thanh** — Web Audio API (countdown, vote, scenario, award, reveal, v.v.)
- **SSE + REST polling** — dual real-time cho cả projection screen và mobile
- **Dữ liệu ngoại hóa** — scenarios lưu trong `data/scenarios.json`, team edit không cần code

### Hiệu ứng & UI

- **Landing page** kiểu photo album galaxy — 3×3 ảnh với parallax, glow orbs, floating particles
- **Trang trí tất cả các trang** — corner accents, floating dots, shimmer borders, gradient backgrounds
- **Award cards** — ảnh anime Makoto Shinkai, neon CSS border glow, sparkle particles, shimmer overlay
- **Scroll-driven zoom** — award cards phóng to mượt mà theo cuộn chuột (continuous interpolation)
- **Player award reveal** — animation 4 phase: darken → card zoom → settle → galaxy background
- **Dynamic charts** — Y-axis tự scale theo dữ liệu, dark theme colors
- **Galaxy results** — nền tối lấp lánh trời sao khi kết thúc game (60 star particles, 8 glow orbs)
- **20+ CSS animations** — float, shimmer, sparkle, aura-pulse, card-reveal, neon-rotate, neon-breathe, v.v.
- **Sound design** — 13 âm thanh synthesized bằng Web Audio API (không cần file audio)

---

## Cơ chế Game

### Flow tổng thể

```
Lobby → Vòng 1 → AI bình luận → Vòng 2 → ... → Vòng 10 → AI Bản tin → Kết quả + Danh hiệu
```

**Giai đoạn chi tiết:**

| Giai đoạn | Mô tả | Thời gian |
|-----------|-------|-----------|
| `lobby` | Chờ người chơi tham gia, phân vai round-robin | Không giới hạn |
| `playing` | Hiển thị tình huống, người chơi bỏ phiếu A/B/C | 30 giây/tình huống |
| `between` | AI bình luận + phân tích xu hướng, host xem kết quả | Chờ host bấm tiếp |
| `ai-generating` | Vòng cuối: AI tạo "Bản tin Xã hội Số" + tính danh hiệu | ~5-10 giây |
| `results` | Hiển thị kết cục, bản tin, danh hiệu trên tất cả màn hình | Kết thúc |

### 4 Vai trò (Giai cấp)

Mỗi người chơi được phân vai theo round-robin khi tham gia:

| Vai trò | Mô tả | Wealth khởi đầu | Control khởi đầu |
|---------|-------|:---:|:---:|
| **Công nhân Nền tảng** | Tài xế công nghệ, shipper, gig worker — đại diện giai cấp công nhân hiện đại | 5 | 8 |
| **Nông dân 4.0** | Nông dân IoT, nông nghiệp dữ liệu — giành lại chủ quyền dữ liệu | 8 | 12 |
| **Trí thức Công nghệ** | Kỹ sư phần mềm, nhà nghiên cứu AI — kiểm soát sản xuất tri thức | 12 | 20 |
| **Chủ Startup** | Chủ nền tảng, kiểm soát thuật toán — sở hữu tư liệu sản xuất số | 20 | 25 |

> Chênh lệch wealth/control khởi đầu phản ánh quan hệ sở hữu tư liệu sản xuất trong kinh tế số — đây là cốt lõi lý thuyết Chương 5.

### Ma trận bất đối xứng 20×4

Mỗi tình huống (macro-event) có 4 bộ lựa chọn A/B/C cho 4 vai trò:

```
Scenario "Cú sốc Tự động hóa"
├── Công nhân:  A=Chấp nhận sa thải  B=Đình công  C=Hợp tác xã lao động số
├── Nông dân:   A=Bán đất cho robot  B=HTX nông nghiệp  C=Liên kết doanh nghiệp
├── Trí thức:   A=Tư vấn tập đoàn   B=Đào tạo miễn phí  C=Nghiên cứu chính sách
└── Startup:    A=Triển khai AI max  B=Chia sẻ lợi nhuận  C=Mô hình hybrid
```

Mỗi lựa chọn ảnh hưởng khác nhau đến cả 6 chỉ số vĩ mô và 4 chỉ số vi mô — tạo ra game theory nhiều chiều, không có lựa chọn "đúng" tuyệt đối.

### 6 Chỉ số Vĩ mô

| Chỉ số | Ý nghĩa | Màu sắc |
|--------|---------|---------|
| **Liên minh** (alliance) | Mức độ đoàn kết giữa các giai cấp | Emerald |
| **Phân hóa** (stratification) | Khoảng cách giàu-nghèo xã hội (càng thấp càng tốt) | Amber |
| **Sản xuất** (production) | Năng lực lực lượng sản xuất | Blue |
| **Đổi mới** (innovation) | Trình độ sáng tạo & công nghệ | Violet |
| **Phúc lợi** (welfare) | An sinh xã hội & chất lượng sống | Pink |
| **Dân chủ** (democracy) | Mức độ tham gia quyết định tập thể | Cyan |

Tất cả bắt đầu từ 50 (trung bình), dao động 0-100. Mỗi delta bị giới hạn ±15.

### 4 Chỉ số Vi mô (Cá nhân)

| Chỉ số | Ý nghĩa |
|--------|---------|
| **Tích lũy** (wealth) | Tài sản cá nhân tích lũy qua các vòng |
| **Quyền lực TLSX** (control) | Mức kiểm soát tư liệu sản xuất |
| **Ảnh hưởng** (influence) | Sức ảnh hưởng đến quyết định tập thể |
| **Sức chống chịu** (resilience) | Khả năng chịu đựng khủng hoảng |

> **Influence Weight:** Đóng góp của mỗi người chơi vào chỉ số vĩ mô được nhân trọng số `0.7 + 0.3 × influence/100`. Người có ảnh hưởng cao sẽ tác động mạnh hơn đến xã hội.

### Hệ thống tính điểm động

**10 cơ chế thưởng/phạt chéo** tạo ra tương tác phức tạp giữa các chỉ số:

| # | Tên | Điều kiện | Hiệu ứng |
|---|-----|-----------|-----------|
| 1 | Production Multiplier | Sản xuất thấp | Wealth gains giảm (×0.5 đến ×1.0) |
| 2 | Stratification Snowball | Phân hóa > 70 | Phân hóa tăng thêm ×1.5 (bất bình đẳng tự tăng) |
| 3 | Democracy Penalty | Dân chủ < 30 | Influence gains giảm 50% |
| 4 | Welfare-Production Tension | Phúc lợi > 75 | Phúc lợi tăng → Sản xuất giảm 20% |
| 5 | Innovation-Stratification | Phúc lợi < 35 | Đổi mới cao → Phân hóa tăng |
| 6 | Recession Crisis | Sản xuất < 30 | Lựa chọn ích kỷ → Resilience giảm -3 |
| 7 | Alliance Buff | Liên minh > 65 | Hợp tác → Resilience tăng thêm |
| 8 | Democracy-Innovation Synergy | Dân chủ > 65 | Innovation gains ×1.25 |
| 9 | Production Dividend | Sản xuất > 70 | Welfare gains ×1.2 |
| 10 | Broken Alliance | Liên minh < 30 | Elite wealth → Phân hóa tăng +3 |

**Dampening (giảm tốc gần cực trị):** Công thức `factor = 0.3 + 0.7 × remaining/100`. Khi chỉ số gần 0 hoặc 100, hiệu ứng thay đổi giảm mạnh, ngăn chặn tình trạng "snowball" quá cực đoan.

### 3 Kết cục

| Kết cục | Điều kiện |
|---------|-----------|
| **Chuyển đổi số Bền vững** | ≥4 chỉ số tốt (alliance >60, stratification <50, production >40, innovation >45, welfare >45, democracy >50) VÀ stratification <55 |
| **Đứt gãy Cơ cấu** | Phân hóa >70 & Liên minh <30, HOẶC Sản xuất <20 & Liên minh <40, HOẶC Phúc lợi <20 & Dân chủ <25 |
| **Trạng thái Bất ổn** | Không thuộc hai trường hợp trên (mặc định) |

### 5 Danh hiệu

| Danh hiệu | Tiêu chí | Ý nghĩa |
|-----------|----------|---------|
| **Ngọn cờ Liên minh** | Đóng góp alliance cao nhất (tổng allianceDelta qua các vòng) | Người dẫn đầu đoàn kết giai cấp |
| **Kẻ sinh tồn Tối ưu** | Wealth cao nhất mà không hại alliance (allianceContribution ≥ 0) | Vừa giàu vừa không phá đoàn kết |
| **Mắt xích Rủi ro** | Chênh lệch (wealth gained − alliance contribution) lớn nhất | Người ích kỷ nhất, mối nguy cho tập thể |
| **Nhà Cách tân** | Influence cao nhất (ngưỡng >30) | Người có sức ảnh hưởng lớn nhất |
| **Lá chắn Xã hội** | Resilience cao nhất (ngưỡng >40) | Trụ cột bảo vệ xã hội |

### AI 3 tầng

| Tầng | Khi nào | Nội dung |
|------|---------|----------|
| **Tier 1 — Bình luận** | Sau mỗi tình huống | Phân tích hành vi tập thể, mâu thuẫn giai cấp, hệ quả cơ cấu (3-4 câu) |
| **Tier 2 — Phân tích xu hướng** | Sau mỗi tình huống (host) | Xu hướng dài hạn, cảnh báo cho host |
| **Tier 3 — Bản tin Xã hội Số** | Kết thúc game | Bản tin phân tích tổng kết 200-280 từ, liên hệ lý thuyết CNXHKH |

AI được prompt với vai trò nhà xã hội học phân tích mâu thuẫn giai cấp, quan hệ sản xuất, và hệ quả cơ cấu — không bao giờ liệt kê dữ liệu mà phải rút ra nhận xét sâu.

---

## Hướng dẫn dẫn Game

### Chuẩn bị (trước buổi thuyết trình)

1. Đảm bảo server đang chạy (GCP Cloud Run hoặc local)
2. Chuẩn bị QR code trỏ đến `https://societysimulator.elixverse.com/join`
3. Mở projector/màn hình phụ để chiếu Screen view
4. Test nhanh: tạo phòng → join 2-3 test → chạy 1-2 vòng → xóa phòng

### Dẫn Game (trong buổi thuyết trình)

**Bước 1 — Tạo phòng**

Truy cập `/host` → bấm **Tạo phòng** → nhận mã PIN 6 ký tự.

**Bước 2 — Sinh viên tham gia**

Quét QR code hoặc truy cập `/join` → nhập PIN + tên → được phân vai ngẫu nhiên (round-robin 4 giai cấp).

**Bước 3 — Mở màn chiếu**

Bấm **"Màn hình chiếu"** trên host page → mở tab `/screen/[pin]` fullscreen trên projector.

**Bước 4 — Chạy game**

Host bấm **"Bắt đầu Game"** → mỗi tình huống có 30 giây để bỏ phiếu:

```
[Host bấm "Bắt đầu"] → Tình huống hiện lên (30s) → [Hết giờ / Host bấm "Kết thúc"]
→ AI bình luận (5-10s) → Host đọc/thảo luận → [Host bấm "Tiếp theo"] → Tình huống kế
```

**Bước 5 — Kết thúc**

Sau vòng 10, game tự động:
1. Xác định kết cục (Bền vững / Đứt gãy / Bất ổn)
2. Tạo "Bản tin Xã hội Số" bằng AI
3. Tính và trao 5 danh hiệu cá nhân
4. Hiển thị kết quả trên tất cả màn hình (galaxy effect)

### Tips cho người dẫn

- **Sau mỗi tình huống:** Đọc bình luận AI cho cả lớp, hỏi sinh viên giải thích lựa chọn
- **Khi phân hóa tăng cao:** Hỏi "Tại sao bất bình đẳng tăng? Ai hưởng lợi?"
- **Khi liên minh giảm:** Liên hệ lý thuyết về mâu thuẫn lợi ích giai cấp
- **Kết thúc game:** Thảo luận kết cục — tại sao bền vững/đứt gãy? Liên hệ thực tiễn VN
- **Danh hiệu:** Mời người đạt danh hiệu chia sẻ chiến lược, thảo luận "ích kỷ vs tập thể"

### Xử lý sự cố

| Vấn đề | Giải pháp |
|--------|-----------|
| Mất mạng | Refresh trang → sessionStorage phục hồi → SSE tự reconnect |
| Join trễ | Sau khi game bắt đầu, không cho phép join mới (trả 400) |
| Vote đồng thời | SSE broadcast debounce 150ms — 35 vote cùng lúc chỉ tạo 1 event |
| AI chậm | Bình luận mất 5-10s, bản tin cuối mất 10-15s — chờ loading animation |
| Projector đứng | Refresh `/screen/[pin]` — SSE tự reconnect, state tự đồng bộ |

---

## Kiến thức áp dụng

### Chương 5: Cơ cấu xã hội — Giai cấp và Liên minh giai cấp

Game mô phỏng trực tiếp các khái niệm cốt lõi của Chương 5, Giáo trình Chủ nghĩa Xã hội Khoa học:

**1. Quan hệ sở hữu tư liệu sản xuất**
- 4 vai trò có wealth/control khởi đầu khác nhau → phản ánh sự bất bình đẳng cấu trúc trong kinh tế số
- Startup (wealth=20, control=25) vs Công nhân (wealth=5, control=8) → chênh lệch sở hữu TLSX

**2. Mâu thuẫn giai cấp**
- Ma trận bất đối xứng: cùng tình huống, mỗi giai cấp có lựa chọn khác nhau phản ánh lợi ích riêng
- Lựa chọn "có lợi cho mình" thường hại các chỉ số tập thể → thể hiện mâu thuẫn lợi ích

**3. Liên minh giai cấp**
- Chỉ số Alliance đo mức đoàn kết → giảm khi các giai cấp hành động ích kỷ
- Rule #7 (Alliance Buff): liên minh mạnh → tăng sức chống chịu cho tất cả
- Rule #10 (Broken Alliance): liên minh yếu → bất bình đẳng tự tăng

**4. Phân hóa xã hội (Phân tầng)**
- Chỉ số Stratification tăng khi chênh lệch lớn → phản ánh quy luật tích tụ tư bản
- Rule #2 (Snowball): phân hóa >70 → tự tăng ×1.5, mô phỏng "bẫy bất bình đẳng"

**5. Vai trò của dân chủ**
- Chỉ số Democracy ảnh hưởng đến khả năng đổi mới và ảnh hưởng cá nhân
- Rule #8: dân chủ cao → đổi mới tăng (synergy)
- Rule #3: dân chủ thấp → ảnh hưởng cá nhân giảm (penalty)

**6. Biện chứng sản xuất — phúc lợi**
- Rule #4: phúc lợi quá cao có thể kìm hãm sản xuất
- Rule #9: sản xuất mạnh tạo điều kiện cho phúc lợi
- → Thể hiện mối quan hệ biện chứng giữa lực lượng sản xuất và an sinh

**7. Kết cục xã hội**
- 3 kết cục phản ánh 3 xu hướng phát triển xã hội:
  - **Bền vững** = phát triển cân bằng, đoàn kết cao
  - **Đứt gãy** = bất bình đẳng cực độ, tan rã liên minh
  - **Bất ổn** = phát triển mất cân bằng, tiềm ẩn rủi ro

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router + TypeScript (ES2020) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Real-time | SSE (`/api/room/[pin]/events`) + REST polling (`/state` mỗi 1.5s) |
| State | In-memory `Map` singleton (HMR-safe via `global.__rooms`) |
| AI Tier 1 | `gemini-3-flash-preview` — bình luận mỗi vòng (3-4 câu) |
| AI Tier 2 | `gemini-3-flash-preview` — phân tích xu hướng (host-visible) |
| AI Tier 3 | `gemini-3-flash-preview` — "Bản tin Xã hội Số" cuối game |
| AI Images | `gemini-2.5-flash-image` — 44 pre-generated images (scenarios, awards, themes) |
| Charts | Recharts (dynamic import, no SSR) |
| Icons | Custom SVG system (16 icons) — no emojis |
| Sound | Web Audio API — 13 synthesized sound effects (no audio files) |
| Deploy | GCP Cloud Run, `output: 'standalone'`, `--max-instances 1` |

---

## Cài đặt

```bash
git clone <repo-url>
cd project
npm install

# Environment
cp .env.local.example .env.local
# Thêm GEMINI_API_KEY vào .env.local

npm run dev
```

### Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI API key cho Gemini |
| `NEXT_PUBLIC_APP_URL` | No | URL public (default: `window.location.origin`) |

---

## Kiến trúc kỹ thuật

### Luồng dữ liệu

```
data/scenarios.json → scenarios.ts → getScenarioById()
                                   → selectRandomScenarios(10)
                                   → server resolves → state.currentScenario
                                                     → client filters by roleId
```

### Luồng game

```
Host: /host/[pin]                  Screen: /screen/[pin]               Player: /play/[pin]
      │                                  │                                    │
      ├─ POST /advance ──────────────────┼── SSE scenario-start ─────────────┤
      │  (start-game)                    │                                    │
      │                                  │  ◄── Hiển thị tình huống ──►      │  ◄── Chọn A/B/C
      │                                  │                                    │
      │                                  │  ◄── SSE vote-update ────────────  ├─ POST /choice
      │                                  │                                    │
      ├─ POST /advance ──────────────────┼── SSE scenario-result ────────────┤
      │  (end-scenario)                  │                                    │
      │                                  │  ◄── AI bình luận (streaming) ──►  │
      │                                  │  ◄── SSE ai-commentary ──────────  │
      │                                  │  ◄── SSE ai-trend ───────────────  │
      │                                  │                                    │
      ├─ POST /advance ──────────────────┼── SSE scenario-start ─────────────┤
      │  (next-scenario)                 │      (vòng tiếp theo)              │
      │         ...                      │         ...                        │         ...
      │                                  │                                    │
      │  (vòng cuối)                     │  ◄── SSE ai-generating ─────────  │
      │                                  │  ◄── AI tạo bản tin (~10s) ────►  │
      │                                  │  ◄── SSE game-ended ─────────────  │
      │                                  │                                    │
      │  Hiển thị kết quả                │  Galaxy background + awards        │  Award reveal animation
```

### Cấu trúc dự án

```
data/
└── scenarios.json              # 20 tình huống (ngoại hóa, team edit trực tiếp)

src/
├── app/
│   ├── page.tsx                # Landing page (photo album + game guide)
│   ├── join/page.tsx           # Sinh viên tham gia
│   ├── host/page.tsx           # Tạo phòng
│   ├── host/[pin]/page.tsx     # Host control panel
│   ├── play/[pin]/page.tsx     # Giao diện chơi (mobile, SSE + polling)
│   ├── screen/[pin]/page.tsx   # Projection screen (SSE)
│   └── api/room/
│       ├── create/             # POST: tạo phòng
│       └── [pin]/
│           ├── join/           # POST: tham gia
│           ├── rejoin/         # POST: reconnect player
│           ├── state/          # GET: polling state
│           ├── events/         # GET: SSE stream
│           ├── choice/         # POST: gửi lựa chọn (debounced broadcast)
│           ├── advance/        # POST: host control flow
│           └── generate/       # POST: trigger AI Tier 3
├── components/
│   ├── game/                   # 13 game UI components
│   │   ├── ScenarioCard.tsx    # Hiển thị tình huống + ảnh
│   │   ├── ChoiceButton.tsx    # Nút lựa chọn A/B/C
│   │   ├── MicroStats.tsx      # 4 chỉ số vi mô
│   │   ├── MacroGauges.tsx     # 6 gauge vĩ mô
│   │   ├── MacroCharts*.tsx    # Recharts biểu đồ lịch sử (dynamic Y-axis)
│   │   ├── AwardCard.tsx       # Danh hiệu (neon glow, anime images, sparkles)
│   │   └── ...                 # CountdownTimer, FramedImage, PlayerRoster, etc.
│   ├── icons/index.tsx         # 16 custom SVG icons + IconByKey mapper
│   └── Navbar.tsx
├── lib/
│   ├── scenarios.ts            # Import JSON → SCENARIOS array + helpers
│   ├── effects.ts              # Dynamic scoring (10 rules) + dampening + outcome
│   ├── awards.ts               # 5 danh hiệu + dedup logic
│   ├── game-store.ts           # In-memory state (rooms, players, serialize)
│   ├── sse.ts                  # SSE broadcast registry
│   ├── sounds.ts               # 13 Web Audio API sound effects
│   ├── ai-commentary.ts        # Tier 1: bình luận mỗi vòng
│   ├── ai-trend.ts             # Tier 2: phân tích xu hướng
│   ├── ai-news.ts              # Tier 3: bản tin cuối
│   ├── ai-image.ts             # Image generation (server-only, imports fs)
│   ├── image-maps.ts           # Image path maps (client-safe)
│   ├── roles.ts                # 4 roles definition + assignment
│   ├── pin.ts                  # PIN generation
│   ├── stratification-theme.ts # Visual theming by inequality level
│   └── utils.ts                # clamp, cn, helpers
├── stores/player-store.ts      # Zustand + sessionStorage
└── types/game.ts               # ALL TypeScript interfaces (single source of truth)

scripts/
├── gen-role-choices.mjs        # Gemini 3.1 Pro: generate 240 role-specific choices
├── gen-images-v2.mjs           # Gemini: generate scenario/theme images
├── gen-new-images.mjs          # Gemini: generate additional images
├── gen-award-images.mjs        # Gemini: generate 5 anime-style award card portraits
├── fix-balance.mjs             # Cap deltas ±15 + dialectical trade-offs
└── sync-scenarios.mjs          # Google Sheets → scenarios.json sync

public/images/                  # 44 AI-generated images (scenarios, awards, themes)

docs/
├── ke-hoach-digital-society-simulator.md
├── GTCNXHKH2021.md            # Trích Chương 5 giáo trình
└── review.md
```

---

## API Endpoints

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/room/create` | POST | Tạo phòng, trả PIN + hostSecret |
| `/api/room/[pin]/join` | POST | Tham gia phòng (chỉ ở lobby) |
| `/api/room/[pin]/rejoin` | POST | Reconnect player bằng playerId |
| `/api/room/[pin]/state` | GET | Polling state (fallback) |
| `/api/room/[pin]/events` | GET | SSE stream (init + 8 event types) |
| `/api/room/[pin]/choice` | POST | Gửi lựa chọn A/B/C (debounced broadcast) |
| `/api/room/[pin]/advance` | POST | Host: start-game / end-scenario / next-scenario |
| `/api/room/[pin]/generate` | POST | Manual trigger AI Tier 3 (fallback) |

### SSE Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `init` | Full `RoomStatePublic` | On connect |
| `player-joined` | `{ playerCount, players }` | New player joins |
| `scenario-start` | `{ scenarioIndex, scenario, scenarioStartedAt }` | Host starts scenario |
| `vote-update` | `{ voteCount, playerCount }` | Player votes (debounced 150ms) |
| `scenario-result` | `{ macro, breakdown, roleBreakdown, macroDelta }` | Host ends scenario |
| `ai-commentary` | `{ commentary }` | Tier 1 AI completes |
| `ai-trend` | `{ trend }` | Tier 2 AI completes |
| `ai-generating` | `{ outcome }` | Final round → AI starts |
| `game-ended` | `{ outcome, macro, socialNews, awards }` | AI news + awards done |

---

## Deploy (GCP Cloud Run)

```bash
# QUAN TRỌNG: max-instances 1 vì in-memory state
gcloud run deploy digital-society-simulator \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --max-instances 1 \
  --timeout 600 \
  --set-env-vars GEMINI_API_KEY=xxx,NEXT_PUBLIC_APP_URL=https://societysimulator.elixverse.com
```

CI/CD: GitHub Actions tự động build + deploy khi push `main`. Xem `.github/workflows/`.

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production
npm run lint         # ESLint
npm run type-check   # TypeScript validation
```

### Utility Scripts

```bash
# Sync scenarios từ Google Sheets
node scripts/sync-scenarios.mjs <SHEET_ID>

# Generate role-specific choices (Gemini 3.1 Pro)
node scripts/gen-role-choices.mjs

# Generate AI images
node scripts/gen-images-v2.mjs
node scripts/gen-new-images.mjs

# Generate 5 anime-style award card images
node scripts/gen-award-images.mjs

# Rebalance scenario deltas (cap ±15 + trade-offs)
node scripts/fix-balance.mjs
```

---

## Team

**Nhóm 4** — Lớp GD1812 — MLN131 — FPT University — Half 2 — Spring 2024

Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa
