# Digital Society Simulator

Web game mô phỏng cơ cấu xã hội trong kỷ nguyên chuyển đổi số. Dùng cho buổi thuyết trình Chương 5 — Chủ nghĩa Xã hội Khoa học (MLN131), Đại học FPT.

> **Trạng thái:** Server đã tắt sau buổi thuyết trình ngày 19/03/2026. Repo được giữ lại để các nhóm khóa sau kế thừa. Xem [Hướng dẫn Deploy lại](#deploy-lại-từ-đầu) để chạy lại.

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Cơ chế Game](#cơ-chế-game)
- [Hướng dẫn dẫn Game](#hướng-dẫn-dẫn-game)
- [Kiến thức áp dụng](#kiến-thức-áp-dụng)
- [Tech Stack](#tech-stack)
- [Cài đặt local](#cài-đặt-local)
- [Deploy lại từ đầu](#deploy-lại-từ-đầu)
- [Kiến trúc kỹ thuật](#kiến-trúc-kỹ-thuật)
- [API Endpoints](#api-endpoints)
- [Scripts](#scripts)
- [Tùy chỉnh nội dung](#tùy-chỉnh-nội-dung)
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
- **Hệ thống tính điểm động** — 10 cơ chế thưởng/phạt chéo + dampening + cost-of-living decay mỗi vòng
- **3 kết cục** xã hội: Bền vững / Đứt gãy / Bất ổn
- **AI 3 tầng** (Google Gemini): bình luận real-time + phân tích xu hướng + bản tin cuối
- **Text-to-Speech** — Google Cloud TTS (vi-VN, giọng nữ Chirp3-HD) đọc câu hỏi + bản tin
- **Nhạc nền tự động** — phát `/public/background.mp3` nếu file tồn tại, tự duck khi TTS đọc
- **5 danh hiệu** cá nhân với ảnh anime AI-generated
- **44 hình AI-generated** (Gemini) — scenario, role, theme, indicator, outcome, award
- **13 hiệu ứng âm thanh** — Web Audio API (không cần file audio)
- **SSE + REST polling** — dual real-time cho cả projection screen và mobile

---

## Cơ chế Game

### Flow tổng thể

```
Lobby → Vòng 1 → AI bình luận → Vòng 2 → ... → Vòng 10 → AI Bản tin → Kết quả + Danh hiệu
```

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
| **Công nhân Nền tảng** | Tài xế công nghệ, shipper, gig worker — đại diện giai cấp công nhân hiện đại | 18 | 10 |
| **Nông dân 4.0** | Nông dân IoT, nông nghiệp dữ liệu — giành lại chủ quyền dữ liệu | 22 | 14 |
| **Trí thức Công nghệ** | Kỹ sư phần mềm, nhà nghiên cứu AI — kiểm soát sản xuất tri thức | 28 | 22 |
| **Chủ Startup** | Chủ nền tảng, kiểm soát thuật toán — sở hữu tư liệu sản xuất số | 38 | 28 |

> Chênh lệch wealth/control khởi đầu phản ánh quan hệ sở hữu tư liệu sản xuất trong kinh tế số — cốt lõi lý thuyết Chương 5. Tất cả chỉ số tính theo **tăng trưởng** (gain từ điểm khởi đầu), không phải giá trị tuyệt đối, đảm bảo công bằng giữa các giai cấp.

### Ma trận bất đối xứng 20×4

Mỗi tình huống (macro-event) có 4 bộ lựa chọn A/B/C cho 4 vai trò:

```
Scenario "Cú sốc Tự động hóa"
├── Công nhân:  A=Chấp nhận sa thải  B=Đình công  C=Hợp tác xã lao động số
├── Nông dân:   A=Bán đất cho robot  B=HTX nông nghiệp  C=Liên kết doanh nghiệp
├── Trí thức:   A=Tư vấn tập đoàn   B=Đào tạo miễn phí  C=Nghiên cứu chính sách
└── Startup:    A=Triển khai AI max  B=Chia sẻ lợi nhuận  C=Mô hình hybrid
```

### 6 Chỉ số Vĩ mô (0–100)

| Chỉ số | Ý nghĩa | Màu |
|--------|---------|-----|
| **Liên minh** (alliance) | Mức độ đoàn kết giữa các giai cấp | Emerald |
| **Phân hóa** (stratification) | Khoảng cách giàu-nghèo — càng thấp càng tốt | Amber |
| **Sản xuất** (production) | Năng lực lực lượng sản xuất | Blue |
| **Đổi mới** (innovation) | Trình độ sáng tạo & công nghệ | Violet |
| **Phúc lợi** (welfare) | An sinh xã hội & chất lượng sống | Pink |
| **Dân chủ** (democracy) | Mức độ tham gia quyết định tập thể | Cyan |

Tất cả bắt đầu từ 50. Mỗi delta bị giới hạn ±15. Áp dụng **dampening** — hiệu ứng giảm dần khi chỉ số gần cực trị (0 hoặc 100).

### 4 Chỉ số Vi mô (Cá nhân)

| Chỉ số | Ý nghĩa | Decay mỗi vòng |
|--------|---------|:---:|
| **Tích lũy** (wealth) | Tài sản cá nhân | -1 |
| **Quyền lực TLSX** (control) | Mức kiểm soát tư liệu sản xuất | -1 |
| **Ảnh hưởng** (influence) | Sức ảnh hưởng đến quyết định tập thể | 0 |
| **Sức chống chịu** (resilience) | Khả năng chịu đựng khủng hoảng | -1 |

Không tham gia 1 vòng: `-8 wealth, -3 control, -6 influence, -4 resilience` (thêm vào decay). Không có giới hạn trên — tính bằng **tăng trưởng** so với điểm khởi đầu.

### Hệ thống tính điểm động — 10 cơ chế

| # | Tên | Điều kiện | Hiệu ứng |
|---|-----|-----------|----------|
| 1 | Production Multiplier | Sản xuất thấp | Wealth gains giảm (×0.5→×1.0) |
| 2 | Stratification Snowball | Phân hóa > 70 | Phân hóa tăng thêm ×1.5 |
| 3 | Democracy Penalty | Dân chủ < 30 | Influence gains giảm 50% |
| 4 | Welfare-Production Tension | Phúc lợi > 75 | Phúc lợi tăng → Sản xuất giảm |
| 5 | Innovation-Stratification | Phúc lợi < 35 | Đổi mới cao → Phân hóa tăng |
| 6 | Recession Crisis | Sản xuất < 30 | Lựa chọn ích kỷ → Resilience -3 |
| 7 | Alliance Buff | Liên minh > 65 | Hợp tác → Resilience tăng thêm |
| 8 | Democracy-Innovation Synergy | Dân chủ > 65 | Innovation gains ×1.25 |
| 9 | Production Dividend | Sản xuất > 70 | Welfare gains ×1.2 |
| 10 | Broken Alliance | Liên minh < 30 | Elite wealth → Phân hóa +3 |

**Control modifier (per-player):** `control < 15` → wealthDelta ×0.7 (yếu thế khó đàm phán); `control > 45` → resilience +1 bonus.

### 3 Kết cục

| Kết cục | Điều kiện |
|---------|-----------|
| **Bền vững** | ≥4 trong 6 chỉ số tốt VÀ stratification < 55 |
| **Đứt gãy** | stratification >70 & alliance <30, hoặc production <20 & alliance <40, hoặc welfare <20 & democracy <25 |
| **Bất ổn** | Mặc định |

### 5 Danh hiệu

Chỉ người tham gia **≥ 50% số vòng** mới đủ điều kiện nhận danh hiệu tích cực.

| Danh hiệu | Tiêu chí | Loại |
|-----------|----------|------|
| **Ngọn cờ Liên minh** | allianceContribution cao nhất | Tích cực |
| **Kẻ sinh tồn Tối ưu** | Wealth growth cao nhất mà không hại alliance | Tích cực |
| **Nhà Cách tân** | Influence cao nhất | Tích cực |
| **Lá chắn Xã hội** | Resilience cao nhất | Tích cực |
| **Mắt xích Rủi ro** | (wealth gain − alliance contribution) lớn nhất — nếu chênh > 5 | Phê bình |

### AI 3 tầng

| Tầng | Khi nào | Nội dung |
|------|---------|----------|
| **Tier 1 — Bình luận** | Sau mỗi tình huống | Phân tích hành vi tập thể, mâu thuẫn giai cấp (3-4 câu) |
| **Tier 2 — Xu hướng** | Sau mỗi tình huống (host) | Xu hướng dài hạn, cảnh báo |
| **Tier 3 — Bản tin** | Kết thúc game | Bản tin phân tích tổng kết 200-280 từ, liên hệ lý thuyết CNXHKH |

---

## Hướng dẫn dẫn Game

### Chuẩn bị (trước buổi thuyết trình)

1. Đảm bảo server đang chạy (xem [Deploy lại từ đầu](#deploy-lại-từ-đầu))
2. Mở projector/màn hình phụ để chiếu Screen view
3. Test nhanh: tạo phòng → join 2-3 test → chạy 1-2 vòng

### Dẫn Game

**Bước 1** — Truy cập `/host` → bấm **Tạo phòng** → nhận mã PIN 6 ký tự.

**Bước 2** — Sinh viên quét QR (hiển thị trên `/screen/[pin]`) hoặc truy cập `/join` → nhập PIN + tên.

**Bước 3** — Bấm **"Màn hình chiếu"** → mở tab `/screen/[pin]` fullscreen trên projector. Nhạc nền tự phát, TTS tự đọc câu hỏi.

**Bước 4** — Bấm **"Bắt đầu Game"**. Mỗi tình huống 30 giây bỏ phiếu:

```
[Host bấm "Bắt đầu"] → Tình huống (30s) → [Host bấm "Kết thúc"]
→ AI bình luận (5-10s) → Thảo luận → [Host bấm "Tiếp theo"]
```

**Bước 5** — Sau vòng 10: AI tạo bản tin → 5 danh hiệu → Kết quả.

### Tips cho người dẫn

- **Sau mỗi vòng:** Đọc bình luận AI, hỏi sinh viên giải thích lựa chọn
- **Khi phân hóa tăng:** "Tại sao bất bình đẳng tăng? Ai hưởng lợi?"
- **Khi liên minh giảm:** Liên hệ mâu thuẫn lợi ích giai cấp trong Chương 5
- **Danh hiệu:** Mời người đạt danh hiệu chia sẻ chiến lược → thảo luận "ích kỷ vs tập thể"

### Xử lý sự cố

| Vấn đề | Giải pháp |
|--------|-----------|
| Mất mạng | Refresh trang → sessionStorage phục hồi → SSE tự reconnect |
| Projector đứng | Refresh `/screen/[pin]` — state tự đồng bộ |
| AI chậm | Bình luận mất 5-10s, bản tin cuối 10-15s — chờ loading |
| TTS không phát | Browser chặn autoplay — click bất kỳ đâu trên màn hình trước |

---

## Kiến thức áp dụng

### Chương 5: Cơ cấu xã hội — Giai cấp và Liên minh giai cấp

| Khái niệm | Cơ chế trong game |
|-----------|-------------------|
| **Quan hệ sở hữu TLSX** | 4 vai trò có wealth/control khởi đầu khác nhau |
| **Mâu thuẫn giai cấp** | Cùng tình huống, mỗi giai cấp có lựa chọn phản ánh lợi ích riêng |
| **Liên minh giai cấp** | Chỉ số Alliance + Rule #7/#10 |
| **Phân hóa xã hội** | Chỉ số Stratification + Rule #2 Snowball |
| **Vai trò dân chủ** | Rule #3/#8: dân chủ ảnh hưởng đổi mới và ảnh hưởng cá nhân |
| **Biện chứng sản xuất-phúc lợi** | Rule #4/#9: tension hai chiều |
| **3 xu hướng phát triển** | 3 kết cục: Bền vững / Đứt gãy / Bất ổn |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router + TypeScript (ES2020) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Real-time | SSE (`/api/room/[pin]/events`) + REST polling mỗi 1.5s |
| State | In-memory `Map` singleton (`global.__rooms`) |
| AI Gameplay | `gemini-3-flash-preview` — bình luận, xu hướng, bản tin |
| AI Images | `gemini-2.5-flash-image` — 44 pre-generated images |
| TTS | Google Cloud Text-to-Speech API (`vi-VN-Chirp3-HD-Aoede`) |
| Charts | Recharts (dynamic import, no SSR) |
| Icons | Custom SVG system — no emojis |
| Sound | Web Audio API — 13 synthesized effects (no audio files) |
| Deploy | GCP Cloud Run, `output: 'standalone'`, `--max-instances 1` |

---

## Cài đặt local

```bash
git clone <repo-url>
cd project
npm install
```

Tạo file `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev     # http://localhost:3000
```

> TTS ở local dùng `gcp-github-key.json` (không commit). Nếu không có file này, TTS sẽ lỗi im lặng — game vẫn chạy bình thường, chỉ không có giọng đọc.

### Thêm nhạc nền

Đặt file `background.mp3` vào `public/`. Nếu không có file thì screen view im lặng — không lỗi.

---

## Deploy lại từ đầu

### Yêu cầu

- GCP project với billing enabled
- Có quyền Owner/Editor trên project
- `gcloud` CLI đã cài và đăng nhập

### Bước 1 — Chuẩn bị GCP

```bash
# Đăng nhập
gcloud auth login

# Bật các API cần thiết
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  texttospeech.googleapis.com \
  --project YOUR_PROJECT_ID

# Tạo Artifact Registry repo
gcloud artifacts repositories create society-simulator \
  --repository-format=docker \
  --location=asia-southeast1 \
  --project YOUR_PROJECT_ID
```

### Bước 2 — Build và deploy

```bash
# Build image
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN \
  -t asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/society-simulator/app:latest \
  .

# Push
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
docker push asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/society-simulator/app:latest

# Deploy
gcloud run deploy society-simulator \
  --image asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/society-simulator/app:latest \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --max-instances 1 \
  --min-instances 1 \
  --no-cpu-throttling \
  --memory 1Gi \
  --cpu 2 \
  --timeout 600 \
  --set-env-vars "GEMINI_API_KEY=YOUR_KEY,NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN" \
  --project YOUR_PROJECT_ID
```

> **⚠️ QUAN TRỌNG — `--max-instances 1`:** Game state lưu in-memory. Nhiều hơn 1 instance sẽ khiến các player ở instance khác nhau không thấy nhau.

> **`--min-instances 1` + `--no-cpu-throttling`:** Tránh cold start và giữ SSE responsive. Nhớ tắt sau khi dùng xong để tiết kiệm chi phí.

### Bước 3 — Gán service account quyền TTS

Cloud Run dùng ADC (Application Default Credentials) tự động. Compute service account cần có quyền TTS:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/cloudtexttospeech.user"
```

### Bước 4 — CI/CD (tùy chọn)

Để GitHub Actions tự deploy khi push `main`, cần tạo các secrets trong repo:

| Secret | Giá trị |
|--------|---------|
| `GCP_PROJECT_ID` | ID của GCP project |
| `GCP_SA_KEY` | JSON key của service account có quyền deploy |
| `GEMINI_API_KEY` | Google AI API key |

Sau đó bỏ comment trigger `push` trong `.github/workflows/deploy.yml`. Hiện tại workflow chỉ chạy **thủ công** (Actions tab → Deploy to Cloud Run → Run workflow → nhập "deploy").

### Tắt server sau khi dùng

```bash
# Xóa Cloud Run service
gcloud run services delete society-simulator --region asia-southeast1 --project YOUR_PROJECT_ID

# Xóa Docker images (tiết kiệm storage ~1.7GB)
gcloud artifacts repositories delete society-simulator --location asia-southeast1 --project YOUR_PROJECT_ID
```

---

## Kiến trúc kỹ thuật

### Cấu trúc dự án

```
data/
└── scenarios.json              # 20 tình huống (team edit trực tiếp, không cần code)

src/
├── app/
│   ├── page.tsx                # Landing page
│   ├── join/page.tsx           # Sinh viên tham gia
│   ├── host/page.tsx           # Tạo phòng
│   ├── host/[pin]/page.tsx     # Host control panel
│   ├── play/[pin]/page.tsx     # Giao diện người chơi (mobile)
│   ├── screen/[pin]/page.tsx   # Projection screen (fullscreen)
│   └── api/
│       ├── room/[pin]/...      # Game API endpoints
│       └── tts/route.ts        # Google Cloud TTS proxy
├── components/game/            # 13 game UI components
├── lib/
│   ├── scenarios.ts            # Import JSON + helpers
│   ├── effects.ts              # Dynamic scoring (10 rules + dampening)
│   ├── awards.ts               # 5 danh hiệu + participation threshold
│   ├── game-store.ts           # In-memory state + serialization
│   ├── sse.ts                  # SSE broadcast registry
│   ├── sounds.ts               # 13 Web Audio effects
│   ├── ai-commentary.ts        # Tier 1 AI
│   ├── ai-trend.ts             # Tier 2 AI
│   ├── ai-news.ts              # Tier 3 AI
│   ├── roles.ts                # 4 roles + round-robin assignment
│   └── utils.ts                # clamp, clampMin, cn, stripMarkdown
└── types/game.ts               # ALL TypeScript interfaces

scripts/                        # Utility scripts (xem phần Scripts)
public/images/                  # 44 AI-generated images
docs/                           # Tài liệu thiết kế + giáo trình
```

### Luồng dữ liệu

```
data/scenarios.json
  → src/lib/scenarios.ts (getScenarioById, selectRandomScenarios)
  → Server: room.scenarioIds[] + getCurrentScenario()
  → Client: state.currentScenario (đã resolved)
  → Player: getChoicesForRole(scenario, roleId) — chỉ thấy choices của role mình
```

### Gotchas quan trọng

- `ai-image.ts` imports `fs` → **không import từ client components**
- `image-maps.ts` là client-safe image mapping
- `output: 'standalone'` — `gcp-github-key.json` KHÔNG có trong container → dùng ADC
- TTS route tự detect: key file tồn tại → local dev; không có → ADC (Cloud Run)
- SSE debounce 150ms cho vote broadcast — tránh flood 35 requests đồng thời

---

## API Endpoints

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/room/create` | POST | Tạo phòng → PIN + hostSecret |
| `/api/room/[pin]/join` | POST | Tham gia (lobby only) |
| `/api/room/[pin]/rejoin` | POST | Reconnect bằng playerId |
| `/api/room/[pin]/state` | GET | Polling fallback |
| `/api/room/[pin]/events` | GET | SSE stream |
| `/api/room/[pin]/choice` | POST | Gửi lựa chọn A/B/C |
| `/api/room/[pin]/advance` | POST | Host: start-game / end-scenario / next-scenario |
| `/api/room/[pin]/generate` | POST | Manual trigger AI Tier 3 |
| `/api/tts` | POST | `{ text }` → `{ audioContent: base64 MP3 }` |

### SSE Events

| Event | Payload | Khi nào |
|-------|---------|---------|
| `init` | Full `RoomStatePublic` | On connect |
| `player-joined` | `{ playerCount, players }` | Người mới join |
| `scenario-start` | `{ scenarioIndex, scenario, scenarioStartedAt }` | Host bắt đầu |
| `vote-update` | `{ voteCount, playerCount }` | Có vote mới |
| `scenario-result` | `{ macro, breakdown, macroDelta }` | Host kết thúc vòng |
| `ai-commentary` | `{ commentary }` | AI Tier 1 xong |
| `ai-trend` | `{ trend }` | AI Tier 2 xong |
| `ai-generating` | `{ outcome }` | Vòng cuối bắt đầu |
| `game-ended` | `{ outcome, macro, socialNews, awards }` | Game kết thúc |

---

## Scripts

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

### Utility Scripts

```bash
# Sync tình huống từ Google Sheets
node scripts/sync-scenarios.mjs <SHEET_ID>

# Generate role-specific choices (Gemini)
node scripts/gen-role-choices.mjs

# Generate AI images
node scripts/gen-images-v2.mjs
node scripts/gen-new-images.mjs
node scripts/gen-award-images.mjs    # 5 anime-style award portraits

# Rebalance delta (cap ±15)
node scripts/fix-balance.mjs
```

---

## Tùy chỉnh nội dung

### Chỉnh sửa tình huống

Tình huống lưu trong `data/scenarios.json` — **edit trực tiếp, không cần code**.

Hoặc dùng Google Sheets:
1. Copy sheet mẫu → publish as CSV
2. `node scripts/sync-scenarios.mjs <SHEET_ID>`

### Thêm/bớt tình huống

- Thêm object vào `data/scenarios.json`
- Chạy `node scripts/fix-balance.mjs` để đảm bảo delta ±15
- Thêm entry vào `src/lib/image-maps.ts` (SCENARIO_IMAGE_MAP)
- Thêm ảnh vào `public/images/`

### Thay đổi số vòng (mặc định 10)

Trong `src/app/api/room/create/route.ts`, đổi tham số `selectRandomScenarios(10)`.

### Thêm nhạc nền

Đặt `public/background.mp3` — screen view tự phát vòng lặp, volume 0.25, tự duck khi TTS đọc.

### Điều chỉnh cơ chế scoring

- **Decay**: `src/lib/effects.ts` dòng ~98 (wealth -1, resilience -1, control -1 mỗi round)
- **Penalty bỏ phiếu**: dòng ~104 (wealth -8, control -3, influence -6, resilience -4)
- **Cross-rules**: hàm `dynamicScore()` trong cùng file
- **Điểm khởi đầu**: `src/lib/roles.ts` (startWealth, startControl)

---

## Team

**Nhóm 4** — Lớp GD1812 — MLN131 — FPT University — Spring 2026

Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa

