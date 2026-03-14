import type { GameRoom, MacroState, MacroSnapshot, OutcomeId, ChoiceId } from '@/types/game'
import { getCurrentScenario } from '@/lib/game-store'
import { clamp } from '@/lib/utils'

/**
 * Dampening function: diminishing returns near extremes (0 and 100).
 * At center (value=50): ~65% of raw delta applied.
 * Near extreme (value=5 or 95): ~33% of raw delta applied.
 * This makes hitting 0 or 100 very difficult, creating richer gameplay.
 */
function dampenDelta(current: number, delta: number): number {
  if (delta === 0) return 0
  const remaining = delta > 0 ? (100 - current) : current
  const factor = 0.3 + 0.7 * (remaining / 100)
  return delta * factor
}

export function computeScenarioEffects(
  room: GameRoom,
): { newMacro: MacroState } {
  const scenario = getCurrentScenario(room)
  if (!scenario) return { newMacro: room.macro }

  let totalAllianceDelta = 0
  let totalStratDelta = 0
  let totalProdDelta = 0
  let totalInnovationDelta = 0
  let totalWelfareDelta = 0
  let totalDemocracyDelta = 0

  for (const player of room.players.values()) {
    const choiceId = player.choices[scenario.id] as ChoiceId | undefined
    if (!choiceId) continue

    const choice = scenario.choices.find((c) => c.id === choiceId)
    if (!choice) continue

    const fx = choice.effects

    // Update player micro stats
    player.wealth = clamp(player.wealth + fx.wealthDelta)
    player.control = clamp(player.control + fx.controlDelta)
    player.allianceContribution += fx.allianceDelta

    if (fx.allianceDelta < 0) {
      player.neverHurtAlliance = false
    }

    // Accumulate macro deltas
    totalAllianceDelta += fx.allianceDelta
    totalStratDelta += fx.stratificationDelta
    totalProdDelta += fx.productionDelta
    totalInnovationDelta += fx.innovationDelta
    totalWelfareDelta += fx.welfareDelta
    totalDemocracyDelta += fx.democracyDelta
  }

  // Divide by total players so non-participation dampens collective gains
  const n = room.players.size || 1

  const snapshot: MacroSnapshot = {
    alliance: room.macro.alliance,
    stratification: room.macro.stratification,
    production: room.macro.production,
    innovation: room.macro.innovation,
    welfare: room.macro.welfare,
    democracy: room.macro.democracy,
  }

  const newMacro: MacroState = {
    alliance: clamp(room.macro.alliance + dampenDelta(room.macro.alliance, totalAllianceDelta / n)),
    stratification: clamp(room.macro.stratification + dampenDelta(room.macro.stratification, totalStratDelta / n)),
    production: clamp(room.macro.production + dampenDelta(room.macro.production, totalProdDelta / n)),
    innovation: clamp(room.macro.innovation + dampenDelta(room.macro.innovation, totalInnovationDelta / n)),
    welfare: clamp(room.macro.welfare + dampenDelta(room.macro.welfare, totalWelfareDelta / n)),
    democracy: clamp(room.macro.democracy + dampenDelta(room.macro.democracy, totalDemocracyDelta / n)),
    history: [...room.macro.history, snapshot],
  }

  return { newMacro }
}

export function determineOutcome(macro: MacroState): OutcomeId {
  const { alliance, stratification, production, welfare, democracy } = macro

  // Collapse conditions
  if (stratification > 70 && alliance < 30) return 'dut-gay'
  if (production < 20 && alliance < 40) return 'dut-gay'
  if (welfare < 20 && democracy < 25) return 'dut-gay'

  // Sustainable: need multiple strengths
  const strengths = [
    alliance > 60,
    stratification < 50,
    production > 40,
    macro.innovation > 45,
    welfare > 45,
    democracy > 50,
  ].filter(Boolean).length

  if (strengths >= 4 && stratification < 55) return 'ben-vung'

  return 'trung-tinh'
}
