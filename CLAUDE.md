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
| AI Tier 1 | `gemini-3.0-flash` — per-round commentary (3-4 sentences) |
| AI Tier 2 | `gemini-3.1-pro-preview` — trend analysis (host-visible) |
| AI Tier 3 | `gemini-3.1-pro-preview` — final "Bản tin Xã hội Số" (auto-generated) |
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
- **20 scenarios in `data/scenarios.json`** — externalized, editable without touching code
- **Scenario data flow:** `data/scenarios.json` → `scenarios.ts` (imports JSON) → `getScenarioById()` / `selectRandomScenarios()`
- **Google Sheets sync:** `node scripts/sync-scenarios.mjs <SHEET_ID>` pulls from published Google Sheet
- **Server resolves by ID:** `room.scenarioIds[]` + `getScenarioById()` + `getCurrentScenario(room)`
- **Client receives resolved data:** `state.currentScenario` (never import SCENARIOS client-side)
- **Image maps split:** `image-maps.ts` (client-safe) vs `ai-image.ts` (server, imports `fs`)
- **Scenario images:** each scenario has `image` field in JSON, mapped in `SCENARIO_IMAGE_MAP`
- **6 macro indicators:** alliance, stratification, production, innovation, welfare, democracy
- **Dampening:** `effects.ts` uses `dampenDelta()` — diminishing returns near 0/100 (harder to hit extremes)
- **4 roles:** cong-nhan, nong-dan, tri-thuc, startup (round-robin assignment)
- **Scenario contexts:** Written as macro-events / social policies — NOT role-specific POV (so all 35 players can engage)
- **Auto AI news:** Game auto-generates "Bản tin Xã hội Số" at end — no manual button

### File Organization
- `src/types/game.ts` — ALL TypeScript interfaces (single source of truth)
- `data/scenarios.json` — 20 scenarios with effects + image fields (editable by team)
- `src/lib/scenarios.ts` — imports JSON, exports SCENARIOS + utility functions
- `src/lib/` — Server logic (effects, game-store, scenarios, AI modules)
- `src/components/game/` — Reusable game UI components
- `src/app/` — Next.js pages and API routes
- `public/images/` — 40 Gemini-generated images (26 original + 14 new)
- `scripts/` — Image generation + Google Sheets sync scripts

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
