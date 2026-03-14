# Changelog — Digital Society Simulator

Ghi chép các thay đổi qua từng phiên làm việc với Claude.

---

## Session 6 — 2026-03-14

### 1. Cập nhật học kỳ
- Thêm "Spring 2026" vào ticker `SocialNewsBanner.tsx` và footer tất cả trang

### 2. Mở rộng Pool Câu hỏi + Tăng 10 vòng/game

**Pool mở rộng từ 12 → 20 kịch bản (8 kịch bản mới):**
| ID | Tiêu đề | Chủ đề |
|----|---------|--------|
| `khung-hoang-thuat-toan` | Khủng hoảng Thuật toán | Phân phối gig bằng AI |
| `san-xuat-xanh` | Chuyển đổi Sản xuất Xanh | Năng lượng tái tạo vs. lợi nhuận |
| `quyet-dinh-dao` | Quản trị DAO | Dân chủ kỹ thuật số thực sự? |
| `lien-doan-lao-dong-so` | Liên đoàn Lao động Số | Công đoàn gig workers |
| `ro-ri-du-lieu` | Rò rỉ Dữ liệu | Trách nhiệm platform |
| `khoang-cach-the-he-so` | Khoảng cách Số Thế hệ | Người cao tuổi & kinh tế số |
| `bat-dong-san-ao` | Bong bóng Bất động sản Ảo | NFT/metaverse land |
| `thao-tung-thong-tin` | Thao túng AI & Truyền thông | Deepfake, misinformation |

**Số vòng mỗi game:** 6 → 10
- `src/lib/scenarios.ts`: `selectRandomScenarios(count = 10)`
- `src/app/api/room/[pin]/advance/route.ts`: `selectRandomScenarios(10)`

### 3. AI Commentary nâng cao (per-stage, per-role)
- `src/lib/ai-commentary.ts`: Cập nhật system prompt + function signature
- Thêm `roleBreakdown?: RoleBreakdown[]` param
- Commentary giờ đề cập **tên cụ thể nhóm vai trò**, chỉ số thay đổi mạnh nhất
- Cấu trúc 3-4 câu: phân tách giai cấp → chỉ số → lý luận Chương 5 → dự đoán
- `advance/route.ts`: Pass `roleBreakdown` vào `generateCommentary()`

### 4. Đổi tên "Bản tin Xã hội 2030" → "Báo cáo Xã hội học"
Files cập nhật:
- `src/lib/ai-news.ts` — system prompt, user message, disclaimer
- `src/app/screen/[pin]/page.tsx` — section heading
- `src/app/play/[pin]/page.tsx` — section heading
- `src/app/host/[pin]/page.tsx` — AI-generating status message
- `src/components/game/SocialNewsBanner.tsx` — header bar text

### 5. Deep Blue Theme + Landing Page Photo Album

**Global CSS (`src/app/globals.css`):**
- `--primary`: `0 85% 50%` (đỏ) → `220 85% 32%` (xanh đậm FPT/Đoàn thanh niên)
- `--foreground`: `0 0% 8%` → `220 20% 10%` (navy dark)
- `--card/muted/border`: Tất cả sang blue-tinted

**Tailwind (`tailwind.config.ts`):**
- Fix `glow-pulse` dùng `hsl(var(--primary))` thay hardcode red
- Thêm 4 keyframes mới: `float`, `slide-in-left`, `slide-in-right`, `bounce-in`
- Thêm animations: `animate-float`, `animate-slide-in-left`, `animate-slide-in-right`, `animate-bounce-in`

**Landing Page (`src/app/page.tsx`) — Toàn bộ rewrite:**
- Hero section full-width: `bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800`
- **Photo Album Collage**: 8 Polaroid-style cards (`bg-white p-2 pb-7 shadow-2xl rounded-sm`)
  - Mỗi card: ảnh nhân vật/tình huống + caption + rotation random (rotate-3, -rotate-2, ...)
  - `hover:rotate-0 hover:scale-105` transition mượt
  - Staggered `animate-scale-in` với delay 0-560ms
- Title + subtitle overlay: `animate-slide-in-right`
- CTA: white solid + blue outline
- Stat chips: rounded-full với số liệu 10 tình huống / 4 giai cấp / 6 chỉ số
- Info section bên dưới: 3 cards mô tả tính năng chính
- Build: TypeScript OK ✓, Next.js build OK ✓

---

## Session 5 — 2026-03-14 (Phiên hiện tại)

### Giai đoạn 1: Cập nhật Footer
- Thay text footer "Chương 5: Cơ cấu xã hội..." bằng thông tin nhóm
- **Nhóm 4 — Lớp GD1812 — Half 2 — MLN131**
- Chủ đề: Cơ cấu xã hội — Giai cấp và Liên minh
- 6 thành viên: Bảo Ngân, Trường Phúc, Phú Quới, Hiền Vy, Lê Hân, Thục Uyên

### Giai đoạn 2: Mở rộng hệ thống chỉ số (3→6 indicators)

**Types (`game.ts`):**
- Thêm 3 chỉ số mới vào `MacroSnapshot`: `innovation`, `welfare`, `democracy`
- Thêm 3 delta fields vào `ChoiceEffects`: `innovationDelta`, `welfareDelta`, `democracyDelta`

**Game Logic (`effects.ts`, `game-store.ts`):**
- 6 accumulators trong `computeScenarioEffects()`
- `INITIAL_MACRO`: innovation=40, welfare=45, democracy=40
- `determineOutcome()` v2: welfare<20 && democracy<25 → collapse; strengths counting across all 6

**Scenarios (`scenarios.ts`):**
- Cập nhật toàn bộ 36 choices (12 scenarios x 3) với 3 delta fields mới
- Design pattern: worker→democracy, farmer→welfare, intellectual→innovation, startup→production/stratification

### Giai đoạn 3: Mở rộng Visualization

**MacroGauges.tsx:** 3→6 gauges, grid-cols-3/6 responsive
**MacroChartsClient.tsx:** 6-line chart (3 mới dùng dashed stroke)
**MacroCharts.tsx:** Updated wrapper pass all 6 fields
**Call sites:** Updated host/[pin], screen/[pin], play/[pin]

### Giai đoạn 4: Layout Improvements

**Player page:** max-w-sm → max-w-lg
**Host page:** max-w-2xl → max-w-4xl, 2-column AI layout
**ChoiceButton:** p-5, badge w-9 h-9, hover:scale-[1.01], effect preview hints
**ScenarioCard:** title text-xl, image h-40, padding p-6

### Giai đoạn 5: AI System Updates
- `ai-commentary.ts`: 6 indicators in prompts, maxOutputTokens 320
- `ai-trend.ts`: 6 indicators + correlations, maxOutputTokens 640
- `ai-news.ts`: 3 new concepts, all 6 final values

### Giai đoạn 6: New Images & Effects
- 6 new Gemini-generated images (transition-analyzing, transition-waiting, indicator-innovation, indicator-welfare, indicator-democracy, lobby-gathering)
- `tailwind.config.ts`: number-change + shimmer animations
- Integrated into lobby, between, ai-generating screens

### Giai đoạn 7: Web Layout Optimization
- **Landing `/`**: 2-column grid (lg:grid-cols-2, max-w-5xl) — hero left, info right, 3 stat cards
- **Join `/join`**: 2-column — decorative image left, form right (max-w-4xl)
- **Host `/host`**: 2-column — hero image left, instructions right (max-w-4xl)
- **Play `/play/[pin]`**: lobby/between/results → max-w-2xl; playing → max-w-lg

### Giai đoạn 8: 5 Yêu cầu cuối (**MỚI NHẤT**)

#### 8.1 Ẩn effect deltas trên ChoiceButton
- Xóa toàn bộ block hiển thị +/- delta (LM, PH, ĐM, PL, DC) khỏi `ChoiceButton.tsx`
- Player chỉ thấy text lựa chọn, không thấy số liệu gợi ý

#### 8.2 Tự động generate Bản tin AI
- `advance/route.ts`: Khi `isLast=true`, fire-and-forget `generateSocialNews()` + `computeAwards()`
- Auto-advance từ `ai-generating` → `results` khi AI hoàn tất
- Fallback: nếu AI fail, vẫn advance với placeholder message
- Xóa nút "Tạo Bản tin AI" trên host page → thay bằng auto-status indicator
- Xóa hàm `generateAI()` không còn dùng

#### 8.3 Enhanced Breakdown (per-role + macro delta)

**Types mới (`game.ts`):**
```typescript
interface RoleBreakdown {
  roleId: RoleId; roleName: string
  A: number; B: number; C: number; total: number
}
interface MacroDelta {
  alliance: number; stratification: number; production: number
  innovation: number; welfare: number; democracy: number
}
```

**Server (`advance/route.ts`):**
- `computeRoleBreakdown()`: Tính A/B/C theo từng vai trò (4 nhóm)
- `macroDelta`: Compute trước/sau `computeScenarioEffects()`
- Broadcast cả `roleBreakdown` + `macroDelta` trong SSE `scenario-result`

**Screen page (`screen/[pin]/page.tsx`):**
- 2-column between layout: breakdown + per-role (left), 6 indicator deltas (right)
- Per-role: tên vai trò có màu + A:x B:y C:z

**Host page (`host/[pin]/page.tsx`):**
- Inline per-role breakdown + macro delta dưới mỗi scenario result

**Player page (`play/[pin]/page.tsx`):**
- 6-indicator grid thay inline text
- Macro delta display (colored +/-)

#### 8.4 More Individual Micro Stats

**MicroStats.tsx:** Nâng cấp từ 2 chỉ số → 4 chỉ số, 2x2 grid:
- Tích lũy (Wealth) — bar chart
- Quyền lực TLSX (Control) — bar chart
- Đóng góp Liên minh — colored bar (green/red)
- Đã trả lời — count display

**PlayerPublic:** Thêm `choiceCount` field
**game-store.ts:** Serialize `choiceCount` = `Object.keys(p.choices).length`

#### 8.5 AI Commentary Visibility
- Thêm BrainIcon header cho AI commentary section (player page)
- 6-indicator grid display thay vì inline text
- Macro delta hiển thị trực tiếp cho player

---

## Session 4 — 2026-03-13

- UI/UX upgrade: dark→light theme
- Navigation system
- Image effects (`FramedImage`)
- Countdown timer (30s)
- Stratification warning (amber/red background)
- Enhanced pending state
- News ticker (`SocialNewsBanner`)
- AI commentary display on mobile

## Session 3 — 2026-03-12

- Full codebase audit (33 issues fixed)
- Bug fixes, dead code cleanup
- Documentation pass

## Session 2 — 2026-03-11

- Phase 1: Color scheme, SVG icons, landing page
- Phase 2: Scenarios expansion to 12
- AI tier system (3-tier Gemini)
- Image generation with `@google/genai` SDK

## Session 1 — 2026-03-10

- Initial build: Next.js 14 + TypeScript
- Core game loop: lobby → playing → between → results
- SSE + REST polling architecture
- 4 roles, 6 scenarios, 3 macro indicators
- GCP Cloud Run deployment
