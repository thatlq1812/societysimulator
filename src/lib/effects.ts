import type { GameRoom, MacroState, MacroSnapshot, OutcomeId, ChoiceId, ChoiceEffects } from '@/types/game'
import { getChoicesForRole } from '@/types/game'
import { getCurrentScenario } from '@/lib/game-store'
import { clamp, clampMin } from '@/lib/utils'

/**
 * Dampening function: diminishing returns near extremes (0 and 100).
 * At center (value=50): ~65% of raw delta applied.
 * Near extreme (value=5 or 95): ~33% of raw delta applied.
 */
function dampenDelta(current: number, delta: number): number {
  if (delta === 0) return 0
  const remaining = delta > 0 ? (100 - current) : current
  const factor = 0.3 + 0.7 * (remaining / 100)
  return delta * factor
}

/**
 * Dynamic Scoring with Cross-Penalty/Reward mechanics.
 * Adjusts base effects based on current macro state to create
 * realistic interdependencies between indicators.
 */
function dynamicScore(base: ChoiceEffects, macro: MacroState): ChoiceEffects {
  const fx = { ...base }

  // ── Cross-Penalty Mechanics ──────────────────────────────────────────────

  // 1. Production Multiplier: wealth gains scale with national production
  if (fx.wealthDelta > 0) {
    fx.wealthDelta = Math.round(fx.wealthDelta * (0.5 + 0.5 * macro.production / 100))
  }

  // 2. Stratification Snowball: high inequality amplifies further inequality
  if (macro.stratification > 70 && fx.stratificationDelta > 0) {
    fx.stratificationDelta = Math.round(fx.stratificationDelta * 1.5)
  }

  // 3. Democracy Penalty: low democracy suppresses political voice
  if (macro.democracy < 30 && fx.influenceDelta > 0) {
    fx.influenceDelta = Math.round(fx.influenceDelta * 0.5)
  }

  // 4. Welfare-Production tension: very high welfare spending drags production
  if (macro.welfare > 75 && fx.welfareDelta > 0 && fx.productionDelta >= 0) {
    fx.productionDelta = fx.productionDelta - Math.round(fx.welfareDelta * 0.2)
  }

  // 5. Innovation-Stratification link: rapid innovation without welfare → more inequality
  if (macro.welfare < 35 && fx.innovationDelta > 5) {
    fx.stratificationDelta = fx.stratificationDelta + Math.round(fx.innovationDelta * 0.25)
  }

  // 6. Low production crisis: selfish choices hurt resilience in recession
  if (macro.production < 30 && fx.allianceDelta < 0) {
    fx.resilienceDelta = (fx.resilienceDelta || 0) - 3
  }

  // ── Cross-Reward Mechanics ───────────────────────────────────────────────

  // 7. Alliance Buff: strong alliance rewards cooperative choices with resilience
  if (macro.alliance > 65 && fx.allianceDelta > 0) {
    fx.resilienceDelta = (fx.resilienceDelta || 0) + Math.round(fx.allianceDelta * 0.3)
  }

  // 8. Democracy-Innovation synergy: open society boosts innovation gains
  if (macro.democracy > 65 && fx.innovationDelta > 0) {
    fx.innovationDelta = Math.round(fx.innovationDelta * 1.25)
  }

  // 9. Production-Welfare dividend: strong economy amplifies welfare improvements
  if (macro.production > 70 && fx.welfareDelta > 0) {
    fx.welfareDelta = Math.round(fx.welfareDelta * 1.2)
  }

  // 10. Low alliance → weakened collective bargaining, wealth gains for elites
  if (macro.alliance < 30 && fx.wealthDelta > 5 && fx.allianceDelta < 0) {
    fx.stratificationDelta = fx.stratificationDelta + 3
  }

  return fx
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
    // Baseline cost of living every round — economic pressure means stats don't always rise
    player.wealth = clampMin(player.wealth - 2)
    player.resilience = clampMin(player.resilience - 1)

    const choiceId = player.choices[scenario.id] as ChoiceId | undefined
    if (!choiceId) {
      // Heavy non-participation penalty: absent from social decisions, lose ground fast
      player.wealth = clampMin(player.wealth - 8)
      player.control = clampMin(player.control - 3)
      player.influence = clampMin(player.influence - 6)
      player.resilience = clampMin(player.resilience - 4)
      continue
    }

    // Look up the role-specific choices for this player
    const roleChoices = scenario.roleSpecificChoices[player.roleId]
    const choice = roleChoices?.find((c) => c.id === choiceId)
    if (!choice) continue

    // Apply dynamic scoring based on current macro state
    const fx = dynamicScore(choice.effects, room.macro)

    // Update player micro stats — no upper ceiling, only lower bound of 0
    player.wealth = clampMin(player.wealth + fx.wealthDelta)
    player.control = clampMin(player.control + fx.controlDelta)
    player.influence = clampMin(player.influence + (fx.influenceDelta || 0))
    player.resilience = clampMin(player.resilience + (fx.resilienceDelta || 0))
    player.allianceContribution += fx.allianceDelta

    if (fx.allianceDelta < 0) {
      player.neverHurtAlliance = false
    }

    // Accumulate macro deltas (weighted by player influence)
    const influenceWeight = 0.7 + 0.3 * (player.influence / 100)
    totalAllianceDelta += fx.allianceDelta * influenceWeight
    totalStratDelta += fx.stratificationDelta * influenceWeight
    totalProdDelta += fx.productionDelta * influenceWeight
    totalInnovationDelta += fx.innovationDelta * influenceWeight
    totalWelfareDelta += fx.welfareDelta * influenceWeight
    totalDemocracyDelta += fx.democracyDelta * influenceWeight
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
