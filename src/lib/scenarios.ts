import type { Scenario } from '@/types/game'
import rawScenarios from '../../data/scenarios.json'

export const SCENARIOS: Scenario[] = rawScenarios as Scenario[]

// ─── Utility functions ──────────────────────────────────────────────────────

const SCENARIO_MAP = new Map(SCENARIOS.map((s) => [s.id, s]))

/** Look up a scenario by its string ID */
export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIO_MAP.get(id)
}

/** Fisher-Yates shuffle → pick `count` random scenario IDs */
export function selectRandomScenarios(count = 10): string[] {
  const ids = SCENARIOS.map((s) => s.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids.slice(0, count)
}

// ─── Utility functions ──────────────────────────────────────────────────────

const SCENARIO_MAP = new Map(SCENARIOS.map((s) => [s.id, s]))

/** Look up a scenario by its string ID */
export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIO_MAP.get(id)
}

/** Fisher-Yates shuffle → pick `count` random scenario IDs */
export function selectRandomScenarios(count = 10): string[] {
  const ids = SCENARIOS.map((s) => s.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids.slice(0, count)
}
