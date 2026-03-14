# Digital Society Simulator — CLAUDE.md

## Project Overview

Web game mô phỏng xã hội thời gian thực cho ~35 sinh viên môn MLN131 (Chủ nghĩa Xã hội Khoa học) tại FPT University. Sử dụng trong buổi thuyết trình Chương 5: Cơ cấu xã hội — giai cấp và liên minh giai cấp.

**Domain:** `societysimulator.elixverse.com`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router + TypeScript (ES2020) |
| Styling | Tailwind CSS v3, light theme, CSS custom properties |
| Real-time | SSE (`/api/room/[pin]/events`) + REST polling (`/state` every 1.5s) |
| State | In-memory `Map` singleton (HMR-safe via `global.__rooms`) |
| AI Tier 1 | `gemini-2.0-flash` — per-round commentary (2-3 sentences) |
| AI Tier 2 | `gemini-2.5-flash` — trend analysis (host-visible) |
| AI Tier 3 | `gemini-2.5-flash` — final "Bản tin Xã hội Số" (auto-generated) |
| AI Images | `@google/genai` SDK, `gemini-2.5-flash-image`, 26 pre-gen images |
| Charts | Recharts (dynamic import, no SSR) |
| Icons | Custom SVG system — no emojis |
| Deploy | GCP Cloud Run, `output: 'standalone'`, `--max-instances 1` |

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

## Architecture Rules

### Critical Patterns
- **20 scenarios**, Fisher-Yates shuffle picks 10 per session (`selectRandomScenarios`)
- **Server resolves by ID:** `room.scenarioIds[]` + `getScenarioById()` + `getCurrentScenario(room)`
- **Client receives resolved data:** `state.currentScenario` (never import SCENARIOS client-side)
- **Image maps split:** `image-maps.ts` (client-safe) vs `ai-image.ts` (server, imports `fs`)
- **6 macro indicators:** alliance, stratification, production, innovation, welfare, democracy
- **4 roles:** cong-nhan, nong-dan, tri-thuc, startup (round-robin assignment)
- **Auto AI news:** Game auto-generates "Bản tin Xã hội Số" at end — no manual button

### File Organization
- `src/types/game.ts` — ALL TypeScript interfaces (single source of truth)
- `src/lib/` — Server logic (effects, game-store, scenarios, AI modules)
- `src/components/game/` — Reusable game UI components
- `src/app/` — Next.js pages and API routes
- `public/images/` — 26 Gemini-generated images

### Known Gotchas
- `@apply dark` in CSS is INVALID — use `className="dark"` on `<html>`
- tsconfig needs `"target": "ES2020"` for `Map` iterator support
- `ai-image.ts` imports `fs` — CANNOT be imported from client components
- `export const dynamic` is ignored in client components
- Shell commands fail with `_auto_venv_activate` error — use `node -e "..."` subprocess pattern
- npm auto-adds self as dependency with `--prefix` flag

### Coding Conventions
- Vietnamese UI text throughout (tiếng Việt)
- No emojis anywhere — use custom SVG icons
- Responsive: `grid-cols-1 lg:grid-cols-2` for desktop 2-column layouts
- All numeric displays use `tabular-nums` class
- Color mapping: alliance=emerald, stratification=amber, production=blue, innovation=violet, welfare=pink, democracy=cyan
