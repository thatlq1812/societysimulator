import type { GameRoom, MacroState, OutcomeId, ChoiceId } from '@/types/game'
import { getCurrentScenario } from '@/lib/game-store'
import { clamp } from '@/lib/utils'

export function computeScenarioEffects(
  room: GameRoom,
): { newMacro: MacroState } {
  const scenario = getCurrentScenario(room)
  if (!scenario) return { newMacro: room.macro }

  let totalAllianceDelta = 0
  let totalStratDelta = 0
  let totalProdDelta = 0

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
  }

  // Divide by total players so non-participation dampens collective gains
  const n = room.players.size || 1

  const snapshot = {
    alliance: room.macro.alliance,
    stratification: room.macro.stratification,
    production: room.macro.production,
  }

  const newMacro: MacroState = {
    alliance: clamp(room.macro.alliance + totalAllianceDelta / n),
    stratification: clamp(room.macro.stratification + totalStratDelta / n),
    production: clamp(room.macro.production + totalProdDelta / n),
    history: [...room.macro.history, snapshot],
  }

  return { newMacro }
}

export function determineOutcome(macro: MacroState): OutcomeId {
  if (macro.stratification > 70 && macro.alliance < 30) return 'dut-gay'
  if (macro.stratification < 50 && macro.alliance > 60) return 'ben-vung'
  return 'trung-tinh'
}
