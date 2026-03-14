# Architecture — Digital Society Simulator

## 1. Tổng quan Hệ thống

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Landing  │  │  Player  │  │   Host   │  │  Screen  │     │
│  │ /        │  │ /play/   │  │ /host/   │  │ /screen/ │     │
│  │ /join    │  │  [pin]   │  │  [pin]   │  │  [pin]   │     │
│  └──────────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│                     │ REST        │ REST        │ SSE        │
│                     │ 1.5s poll   │ 2s poll     │ real-time  │
└─────────────────────┼─────────────┼─────────────┼────────────┘
                      │             │             │
┌─────────────────────┴─────────────┴─────────────┴────────────┐
│                    NEXT.JS SERVER                             │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  API Routes (/api/room/[pin]/...)                      │   │
│  │  ┌──────┐ ┌─────────┐ ┌────────┐ ┌───────┐ ┌──────┐  │   │
│  │  │create│ │  join   │ │advance │ │choice │ │state │  │   │
│  │  └──────┘ └─────────┘ └───┬────┘ └───────┘ └──────┘  │   │
│  │                           │                            │   │
│  │  ┌────────┐ ┌──────────┐ ┌▼────────────────────────┐  │   │
│  │  │events  │ │generate │ │ Game Logic               │  │   │
│  │  │(SSE)   │ │(legacy) │ │ effects.ts + game-store  │  │   │
│  │  └────────┘ └──────────┘ └─────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  In-Memory State (global.__rooms: Map<pin, GameRoom>) │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  AI Layer (Google Gemini)                              │   │
│  │  ┌─────────────┐ ┌──────────┐ ┌────────────────────┐  │   │
│  │  │Tier 1: Flash│ │Tier 2:   │ │Tier 3: Flash       │  │   │
│  │  │Commentary   │ │Flash     │ │"Bản tin XH 2030"   │  │   │
│  │  │(per-round)  │ │Trend     │ │(auto, end-of-game) │  │   │
│  │  └─────────────┘ └──────────┘ └────────────────────┘  │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 2. Luồng Game (Game Flow)

```
lobby ──► playing ──► between ──► playing ──► ... ──► ai-generating ──► results
  │         │           │           │                      │               │
  │    Countdown 30s    │      AI commentary          Auto-generate    Awards
  │    Player votes     │      AI trend analysis      Bản tin 2030    Outcome
  │                     │      Per-role breakdown     computeAwards()
  │                     │      Macro delta display
  │                     │
  │              computeScenarioEffects()
  │              → update 6 macro indicators
  │              → update player wealth/control
  └─── 6 scenarios (random from 12) ─────────────────────────►
```

### Trạng thái (Phases)

| Phase | Mô tả | Player | Host | Screen |
|-------|--------|--------|------|--------|
| `lobby` | Chờ người chơi | RoleCard + chờ | QR + player count | QR lớn + roster |
| `playing` | Đang trả lời | ScenarioCard + 3 ChoiceButtons | Vote count + controls | Scenario + countdown |
| `between` | Giữa vòng | 6 macro + AI commentary + MicroStats | Breakdown + role detail + macro delta | Full dashboard + charts |
| `ai-generating` | AI xử lý | Loading animation | Auto-status message | Brain animation + gauges |
| `results` | Kết thúc | Award + MicroStats + Bản tin | Game complete notice | Outcome + awards + charts |

## 3. Hệ thống 6 Chỉ số Vĩ mô

| Chỉ số | Key | Giá trị khởi tạo | Màu | Vai trò chính ảnh hưởng |
|--------|-----|------------------|------|------------------------|
| Liên minh (LM) | `alliance` | 50 | emerald | cong-nhan |
| Phân hóa (PH) | `stratification` | 30 | amber | startup (tăng) |
| Sản xuất (SX) | `production` | 50 | blue | startup |
| Đổi mới (ĐM) | `innovation` | 40 | violet | tri-thuc |
| Phúc lợi (PL) | `welfare` | 45 | pink | nong-dan |
| Dân chủ (DC) | `democracy` | 40 | cyan | cong-nhan |

### Công thức tính:

```
newIndicator = clamp(0, 100, currentValue + sum(playerDeltas) / totalPlayers)
```

Chia cho `totalPlayers` để người không vote sẽ kéo giảm mức tăng tập thể.

### Logic xác định Kết cục (`determineOutcome`):

| Điều kiện | Kết cục |
|-----------|---------|
| `stratification > 70 && alliance < 30` | Đứt gãy (dut-gay) |
| `production < 20 && alliance < 40` | Đứt gãy (dut-gay) |
| `welfare < 20 && democracy < 25` | Đứt gãy (dut-gay) |
| `strengths >= 4 && stratification < 55` | Bền vững (ben-vung) |
| Còn lại | Trung tính (trung-tinh) |

**Strengths** = số điều kiện sau thỏa mãn: alliance>60, stratification<50, production>40, innovation>45, welfare>45, democracy>50.

## 4. Hệ thống 4 Vai trò

| Vai trò | RoleId | Đặc điểm | Wealth khởi tạo | Control khởi tạo |
|---------|--------|----------|-----------------|-----------------|
| Công nhân Nền tảng | `cong-nhan` | Gig worker, shipper | 5 | 8 |
| Nông dân 4.0 | `nong-dan` | Smart farmer, IoT | 8 | 12 |
| Trí thức Công nghệ | `tri-thuc` | Kỹ sư AI, developer | 12 | 20 |
| Chủ Startup | `startup` | Founder, chủ nền tảng | 20 | 25 |

Phân vai: Round-robin cân bằng — vai nào ít người nhất sẽ được gán tiếp.

## 5. Hệ thống 12 Tình huống

Mỗi session chọn ngẫu nhiên 6 từ 12 tình huống (Fisher-Yates shuffle). Mỗi tình huống có 3 lựa chọn:

- **A** — Lợi ích cá nhân/nhóm nhỏ (tăng wealth, giảm alliance/welfare/democracy)
- **B** — Lợi ích tập thể (tăng alliance/welfare, giảm ít wealth)
- **C** — Cân bằng/trung lập (hiệu ứng trung bình)

## 6. Hệ thống AI 3 tầng

### Tier 1: Commentary (`ai-commentary.ts`)
- **Model:** `gemini-2.0-flash`
- **Trigger:** Fire-and-forget sau `end-scenario`
- **Output:** 2-3 câu bình luận về lựa chọn tập thể
- **Hiển thị:** Player (between), Screen (between), Host (between)

### Tier 2: Trend Analysis (`ai-trend.ts`)
- **Model:** `gemini-2.5-flash`
- **Trigger:** Fire-and-forget cùng Tier 1
- **Output:** Phân tích xu hướng dựa trên toàn bộ history
- **Hiển thị:** Screen (between), Host (between)

### Tier 3: Social News (`ai-news.ts`)
- **Model:** `gemini-2.5-flash`
- **Trigger:** Tự động khi game end (fire-and-forget từ `advance` route)
- **Output:** "Bản tin Xã hội 2030" — 350-450 từ, học thuật
- **Hiển thị:** Player (results), Screen (results)

## 7. Hệ thống Dữ liệu Between-phase

Sau mỗi vòng, server tính và broadcast:

| Dữ liệu | Mô tả | Hiển thị |
|----------|--------|----------|
| `lastBreakdown` | Tổng A/B/C + % | Host, Screen, Player |
| `roleBreakdown` | A/B/C theo từng vai trò (4 nhóm) | Host, Screen |
| `macroDelta` | Thay đổi 6 chỉ số lượt này (+/-) | Host, Screen, Player |
| `aiCommentary` | Bình luận AI (Tier 1) | Host, Screen, Player |
| `aiTrend` | Phân tích xu hướng (Tier 2) | Host, Screen |

## 8. Chỉ số Cá nhân (MicroStats)

| Chỉ số | Mô tả | Nguồn |
|--------|--------|-------|
| Tích lũy (Wealth) | Tài sản cá nhân tích lũy | `choice.effects.wealthDelta` |
| Quyền lực TLSX (Control) | Kiểm soát tư liệu sản xuất | `choice.effects.controlDelta` |
| Đóng góp Liên minh | Tổng allianceDelta cộng dồn | Tính từ `player.allianceContribution` |
| Đã trả lời | Số lượt đã chọn | `Object.keys(player.choices).length` |

## 9. Cấu trúc Thư mục

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (2-col desktop)
│   ├── join/page.tsx             # Join form (2-col desktop)
│   ├── host/
│   │   ├── page.tsx              # Create room (2-col desktop)
│   │   └── [pin]/page.tsx        # Host control panel (max-w-4xl)
│   ├── play/[pin]/page.tsx       # Player game view
│   ├── screen/[pin]/page.tsx     # Projection screen (SSE)
│   ├── api/room/
│   │   ├── create/route.ts       # POST: create room
│   │   └── [pin]/
│   │       ├── join/route.ts     # POST: join room
│   │       ├── choice/route.ts   # POST: submit choice
│   │       ├── advance/route.ts  # POST: game flow control
│   │       ├── state/route.ts    # GET: poll state
│   │       ├── events/route.ts   # GET: SSE stream
│   │       └── generate/route.ts # POST: manual AI gen (legacy)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Tailwind + CSS vars
├── components/
│   ├── Navbar.tsx                # Top navigation
│   ├── game/                     # Game-specific components
│   │   ├── AwardCard.tsx
│   │   ├── ChoiceButton.tsx      # A/B/C choice (no delta hints)
│   │   ├── CountdownTimer.tsx    # 30s countdown
│   │   ├── FramedImage.tsx       # Image wrapper
│   │   ├── MacroCharts.tsx       # Recharts wrapper (SSR-safe)
│   │   ├── MacroChartsClient.tsx # 6-line chart component
│   │   ├── MacroGauges.tsx       # 6 circular gauges
│   │   ├── MicroStats.tsx        # 4 personal stats (2x2 grid)
│   │   ├── PlayerRoster.tsx      # Player list
│   │   ├── QRDisplay.tsx         # QR code display
│   │   ├── RoleCard.tsx          # Role description card
│   │   ├── ScenarioCard.tsx      # Scenario display
│   │   └── SocialNewsBanner.tsx  # Ticker with group info
│   └── icons/index.tsx           # 16 custom SVG icons
├── lib/
│   ├── ai-commentary.ts         # Tier 1 AI (gemini-2.0-flash)
│   ├── ai-image.ts              # Image generation (server-only)
│   ├── ai-news.ts               # Tier 3 AI (gemini-2.5-flash)
│   ├── ai-trend.ts              # Tier 2 AI (gemini-2.5-flash)
│   ├── awards.ts                # Award computation
│   ├── effects.ts               # Game effects + outcome logic
│   ├── game-store.ts            # In-memory state + serialization
│   ├── image-maps.ts            # Image path mapping (client-safe)
│   ├── pin.ts                   # PIN generation
│   ├── roles.ts                 # 4 role definitions + assignment
│   ├── scenarios.ts             # 12 scenarios + random selection
│   ├── sse.ts                   # SSE broadcast utility
│   ├── stratification-theme.ts  # Warning/danger thresholds
│   └── utils.ts                 # clamp, cn, etc.
├── stores/
│   └── player-store.ts          # Zustand: playerId, roleId
└── types/
    └── game.ts                  # ALL TypeScript interfaces
```

## 10. Hình ảnh (26 files)

| Nhóm | Files | Mô tả |
|------|-------|--------|
| Scenarios (12) | `scenario-*.png` | 12 tình huống (acquisition, automation, blockchain, data, education, hiring, housing, opensource, platform, rural, strike, ubi) |
| Roles (4) | `role-*.png` | 4 vai trò (farmer, intellectual, startup, worker) |
| Outcomes (3) | `outcome-*.png` | 3 kết cục (collapse, sustainable, unstable) |
| Transitions (2) | `transition-*.png` | analyzing, waiting |
| Indicators (3) | `indicator-*.png` | democracy, innovation, welfare |
| UI (2) | `hero-network.png`, `lobby-gathering.png` | Landing + lobby |

## 11. API Routes

| Method | Route | Mô tả |
|--------|-------|--------|
| POST | `/api/room/create` | Tạo phòng mới |
| POST | `/api/room/[pin]/join` | Tham gia phòng |
| POST | `/api/room/[pin]/choice` | Gửi lựa chọn |
| POST | `/api/room/[pin]/advance` | Điều khiển game flow |
| GET | `/api/room/[pin]/state` | Polling state |
| GET | `/api/room/[pin]/events` | SSE stream |
| POST | `/api/room/[pin]/generate` | Manual AI gen (legacy) |

### Advance Actions

| Action | Transition | Side Effects |
|--------|-----------|-------------|
| `start-game` | lobby → playing | Select 6 scenarios, broadcast `scenario-start` |
| `end-scenario` | playing → between | Compute effects + breakdown + roleBreakdown + macroDelta, fire-and-forget AI Tier 1+2 |
| `next-scenario` | between → playing(i+1) | Broadcast `scenario-start` |
| `next-scenario` (last) | between → ai-generating → results | Auto-generate Bản tin + awards, broadcast `game-ended` |

## 12. SSE Events

| Event | Data | Consumer |
|-------|------|----------|
| `init` | RoomStatePublic | Screen |
| `player-joined` | { playerCount, players } | Screen |
| `vote-update` | { voteCount } | Screen |
| `scenario-start` | { scenarioIndex, scenario, scenarioStartedAt } | Screen |
| `scenario-result` | { scenarioIndex, macro, breakdown, roleBreakdown, macroDelta } | Screen |
| `ai-commentary` | { commentary } | Screen |
| `ai-trend` | { trend } | Screen |
| `ai-generating` | { outcome } | Screen |
| `game-ended` | { outcome, macro, socialNews, awards } | Screen |

## 13. Deploy

```bash
# GCP Cloud Run
gcloud run deploy digital-society-simulator \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --timeout=600 \
  --max-instances=1 \
  --set-env-vars="GEMINI_API_KEY=...,NEXT_PUBLIC_APP_URL=https://societysimulator.elixverse.com"
```

**Lưu ý:** `--max-instances 1` vì state in-memory — nhiều instance sẽ mất đồng bộ.
