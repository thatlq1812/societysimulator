# Digital Society Simulator

Web game mô phỏng cơ cấu xã hội trong kỷ nguyên chuyển đổi số. Dùng cho buổi thuyết trình Chương 5 — Chủ nghĩa Xã hội Khoa học (MLN131), Đại học FPT.

**Live:** [societysimulator.elixverse.com](https://societysimulator.elixverse.com)

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
- **5 danh hiệu** cá nhân với ảnh anime AI-generated: Ngọn cờ Liên minh, Kẻ sinh tồn Tối ưu, Mắt xích Rủi ro, Nhà Cách tân, Lá chắn Xã hội
- **44 hình AI-generated** (Gemini) — scenario, role, theme, indicator, outcome, award illustrations
- **SSE + REST polling** — dual real-time cho cả projection screen và mobile
- **Dữ liệu ngoại hóa** — scenarios lưu trong `data/scenarios.json`, team edit không cần code

### Hiệu ứng & UI

- **Landing page** kiểu photo album galaxy — 3×3 ảnh với parallax, glow orbs, floating particles
- **Trang trí tất cả các trang** — corner accents, floating dots, shimmer borders, gradient backgrounds
- **Award cards** kiểu tarot — ảnh anime Makoto Shinkai, aura glow, sparkle particles, shimmer overlay
- **Scroll-triggered reveal** — award cards zoom vào khi cuộn xuống (IntersectionObserver)
- **20+ CSS animations** — float, shimmer, sparkle, aura-pulse, card-reveal, stagger-in, celebrate, v.v.

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

## Hướng dẫn sử dụng

### Bước 1 — Tạo phòng
Truy cập `/host` → bấm **Tạo phòng** → nhận mã PIN 6 ký tự.

### Bước 2 — Sinh viên tham gia
Quét QR code hoặc truy cập `/join` → nhập PIN + tên → được phân vai ngẫu nhiên (round-robin 4 giai cấp).

### Bước 3 — Mở màn chiếu
Bấm **"Màn hình chiếu"** trên host page → mở tab `/screen/[pin]` fullscreen trên projector.

### Bước 4 — Chạy game
Host bấm **"Bắt đầu Game"** → 10 vòng × 30 giây. Sau mỗi vòng, bấm **"Kết thúc tình huống"** → AI bình luận → bấm **"Tình huống tiếp"**.

### Bước 5 — Kết thúc
Sau vòng 10, game tự động tạo **"Bản tin Xã hội Số"** + trao **5 danh hiệu** cá nhân.

### Edge cases
- **Mất mạng**: Refresh trang → sessionStorage phục hồi → SSE tự reconnect. Nếu SSE đứt, polling fallback 1.5s.
- **Join trễ**: Sau khi game bắt đầu, không cho phép join mới (trả 400).
- **Vote đồng thời**: SSE broadcast được debounce 150ms — 35 vote cùng lúc chỉ tạo 1 event.

---

## Kiến trúc

### Luồng dữ liệu

```
data/scenarios.json → scenarios.ts → getScenarioById()
                                   → selectRandomScenarios(10)
                                   → server resolves → state.currentScenario
                                                     → client filters by roleId
```

### Ma trận bất đối xứng 20×4

Mỗi tình huống (macro-event) có 4 bộ lựa chọn A/B/C cho 4 vai trò:

```
Scenario "Cú sốc Tự động hóa"
├── Công nhân:  A=Chấp nhận sa thải  B=Đình công  C=Hợp tác xã lao động số
├── Nông dân:   A=Bán đất cho robot  B=HTX nông nghiệp  C=Liên kết doanh nghiệp
├── Trí thức:   A=Tư vấn tập đoàn   B=Đào tạo miễn phí  C=Nghiên cứu chính sách
└── Startup:    A=Triển khai AI max  B=Chia sẻ lợi nhuận  C=Mô hình hybrid
```

Client nhận full scenario, filter bởi `getChoicesForRole(scenario, roleId)`.

### Hệ thống tính điểm động

**10 cơ chế thưởng/phạt chéo:**

| # | Tên | Điều kiện | Hiệu ứng |
|---|-----|-----------|-----------|
| 1 | Production Multiplier | Sản xuất thấp | Wealth gains giảm |
| 2 | Stratification Snowball | Phân hóa > 70 | Phân hóa tăng ×1.5 |
| 3 | Democracy Penalty | Dân chủ < 30 | Influence gains giảm 50% |
| 4 | Welfare-Production Tension | Phúc lợi > 75 | Phúc lợi tăng → Sản xuất giảm |
| 5 | Innovation-Stratification | Phúc lợi < 35 | Đổi mới cao → Phân hóa tăng |
| 6 | Recession Crisis | Sản xuất < 30 | Lựa chọn ích kỷ → Resilience giảm |
| 7 | Alliance Buff | Liên minh > 65 | Hợp tác → Resilience tăng |
| 8 | Democracy-Innovation Synergy | Dân chủ > 65 | Innovation gains ×1.25 |
| 9 | Production Dividend | Sản xuất > 70 | Welfare gains ×1.2 |
| 10 | Broken Alliance | Liên minh < 30 | Elite wealth → Phân hóa tăng |

**Dampening:** Giảm tốc gần cực trị — `factor = 0.3 + 0.7 × remaining/100`. Tại giá trị 50: ~65% delta áp dụng. Tại giá trị 5: ~33%.

**Influence Weight:** Mỗi người chơi đóng góp vào macro delta theo trọng số `0.7 + 0.3 × influence/100`.

### 5 Danh hiệu

| Danh hiệu | Icon | Tiêu chí |
|-----------|------|----------|
| Ngọn cờ Liên minh | trophy | Đóng góp alliance cao nhất |
| Kẻ sinh tồn Tối ưu | shield | Wealth cao nhất mà không hại alliance |
| Mắt xích Rủi ro | warning | Chênh lệch wealth/alliance lớn nhất |
| Nhà Cách tân | brain | Influence cao nhất |
| Lá chắn Xã hội | globe | Resilience cao nhất |

---

## Cấu trúc dự án

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
│   │   ├── MicroStats.tsx      # 4 chỉ số vi mô (wealth, control, influence, resilience)
│   │   ├── MacroGauges.tsx     # 6 gauge vĩ mô
│   │   ├── MacroCharts*.tsx    # Recharts biểu đồ lịch sử
│   │   ├── AwardCard.tsx       # Danh hiệu (tarot-style, anime images, aura glow)
│   │   ├── SocialNewsBanner.tsx # Bản tin AI
│   │   └── ...                 # CountdownTimer, FramedImage, PlayerRoster, etc.
│   ├── icons/index.tsx         # 16 custom SVG icons + IconByKey mapper
│   └── Navbar.tsx
├── lib/
│   ├── scenarios.ts            # Import JSON → SCENARIOS array + helpers
│   ├── effects.ts              # Dynamic scoring (10 rules) + dampening + outcome
│   ├── awards.ts               # 5 danh hiệu + dedup logic
│   ├── game-store.ts           # In-memory state (rooms, players, serialize)
│   ├── sse.ts                  # SSE broadcast registry
│   ├── ai-commentary.ts        # Tier 1: gemini-3-flash-preview (per-round)
│   ├── ai-trend.ts             # Tier 2: gemini-3-flash-preview (host)
│   ├── ai-news.ts              # Tier 3: gemini-3-flash-preview (final)
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

**Nhóm 4** — Lớp GD1812 — MLN131 — FPT University

Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa
