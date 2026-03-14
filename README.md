# Digital Society Simulator

Web game mô phỏng cơ cấu xã hội trong kỷ nguyên chuyển đổi số. Dùng cho buổi thuyết trình Chương 5 — Chủ nghĩa Xã hội Khoa học (MLN131), Đại học FPT.

**Live:** [societysimulator.elixverse.com](https://societysimulator.elixverse.com)

---

## Tổng quan

~35 sinh viên truy cập web qua QR code, được phân vai ngẫu nhiên (Công nhân, Nông dân, Trí thức, Startup), trải qua 6 tình huống chuyển đổi số trong 10 phút. Mỗi quyết định cá nhân ảnh hưởng đến chỉ số vĩ mô xã hội hiển thị real-time trên màn chiếu. AI phân tích hành vi tập thể và tạo "Bản tin Xã hội 2030".

### Tính năng

- **12 tình huống**, chọn ngẫu nhiên 6 mỗi phiên (Fisher-Yates shuffle)
- **4 vai trò** đại diện cơ cấu giai cấp Chương 5
- **5 biến số kép** (2 vi mô + 3 vĩ mô) lượng hóa phạm trù Mác–Lênin
- **3 kết cục** xã hội: Bền vững / Đứt gãy / Bất ổn
- **AI 3 tầng** (Google Gemini): bình luận real-time + phân tích xu hướng + bản tin cuối
- **20 hình AI-generated** (Gemini 2.5 Flash Image)
- **3 danh hiệu** cá nhân với dedup tự động
- **SSE** real-time cho projection screen + REST polling cho mobile

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS v3, dark-only |
| AI | Google Gemini (`@google/generative-ai` + `@google/genai`) |
| Charts | Recharts |
| Icons | Custom SVG (16 icons) |
| State | In-memory Map (HMR-safe singleton) |
| Deploy | GCP Cloud Run |

---

## Cài đặt

```bash
# Clone
git clone <repo-url>
cd project

# Install
npm install

# Environment
cp .env.example .env.local
# Thêm GEMINI_API_KEY vào .env.local

# Dev
npm run dev
```

### Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI API key cho Gemini |
| `NEXT_PUBLIC_APP_URL` | No | URL public (default: window.location.origin) |

---

## Sử dụng

### Bước 1 — Tạo phòng
Truy cập `/host` → bấm Tạo phòng → nhận PIN 6 ký tự.

### Bước 2 — Sinh viên tham gia
Quét QR hoặc truy cập `/join` → nhập PIN + tên → được phân vai ngẫu nhiên.

### Bước 3 — Mở màn chiếu
Bấm "Màn hình chiếu" trên host page → mở tab `/screen/[pin]` fullscreen.

### Bước 4 — Chạy game
Host bấm "Bắt đầu Game" → 6 vòng × 30 giây → bấm "Kết thúc tình huống" sau mỗi vòng.

### Bước 5 — AI tổng kết
Sau vòng 6, host bấm "Tạo Bản tin AI" → AI sinh Bản tin Xã hội 2030 + 3 danh hiệu.

---

## Cấu trúc dự án

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── join/page.tsx               # Sinh viên tham gia
│   ├── host/page.tsx               # Tạo phòng
│   ├── host/[pin]/page.tsx         # Host control panel
│   ├── play/[pin]/page.tsx         # Giao diện chơi (mobile)
│   ├── screen/[pin]/page.tsx       # Projection screen
│   └── api/room/                   # REST + SSE endpoints
├── components/
│   ├── game/                       # Game UI components
│   └── icons/index.tsx             # 16 SVG icons
├── lib/
│   ├── scenarios.ts                # 12 tình huống + shuffle
│   ├── effects.ts                  # Tính toán hiệu ứng + outcome
│   ├── awards.ts                   # 3 danh hiệu + dedup
│   ├── game-store.ts               # In-memory state
│   ├── sse.ts                      # SSE broadcast
│   ├── ai-commentary.ts            # Tier 1: Gemini 2.0 Flash
│   ├── ai-trend.ts                 # Tier 2: Gemini 2.5 Flash
│   ├── ai-news.ts                  # Tier 3: Bản tin 2030
│   ├── ai-image.ts                 # Image gen (server-only)
│   └── image-maps.ts               # Image paths (client-safe)
├── stores/player-store.ts          # Zustand store
└── types/game.ts                   # All TypeScript interfaces

docs/
├── ke-hoach-digital-society-simulator.md   # Kế hoạch chi tiết
├── GTCNXHKH2021.md                        # Trích Chương 5 giáo trình
└── review.md                               # Review & audit notes
```

---

## Routes

| Path | Mô tả |
|---|---|
| `/` | Landing page |
| `/join` | Sinh viên nhập PIN + tên |
| `/play/[pin]` | Giao diện chơi (mobile) |
| `/host` | Tạo phòng |
| `/host/[pin]` | Host control panel |
| `/screen/[pin]` | Projection screen (SSE) |

## API

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/room/create` | POST | Tạo phòng |
| `/api/room/[pin]/join` | POST | Tham gia phòng |
| `/api/room/[pin]/state` | GET | Polling state |
| `/api/room/[pin]/events` | GET | SSE stream |
| `/api/room/[pin]/choice` | POST | Gửi lựa chọn |
| `/api/room/[pin]/advance` | POST | Host control flow |
| `/api/room/[pin]/generate` | POST | Trigger AI Tier 3 |

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
npm run type-check   # TypeScript check
```

---

## Team

**Nhóm 4** — Lớp GD1812 — MLN131 — FPT University

Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa
