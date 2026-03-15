import { NextResponse } from 'next/server'
import { getRoom, getCurrentScenario } from '@/lib/game-store'
import { broadcast } from '@/lib/sse'
import { computeScenarioEffects, determineOutcome } from '@/lib/effects'
import { selectRandomScenarios } from '@/lib/scenarios'
import { streamCommentary } from '@/lib/ai-commentary'
import { streamTrend } from '@/lib/ai-trend'
import { streamSocialNews } from '@/lib/ai-news'
import { computeAwards } from '@/lib/awards'
import type { ChoiceBreakdown, ChoiceId, RoleBreakdown, MacroDelta, RoleId } from '@/types/game'
import { ROLES } from '@/lib/roles'

export const dynamic = 'force-dynamic'

type AdvanceAction = 'start-game' | 'end-scenario' | 'next-scenario'

function computeBreakdown(room: ReturnType<typeof getRoom>): ChoiceBreakdown {
  const bd: ChoiceBreakdown = { A: 0, B: 0, C: 0, total: 0 }
  if (!room) return bd
  const scenario = getCurrentScenario(room)
  if (!scenario) return bd
  for (const player of room.players.values()) {
    const choice = player.choices[scenario.id] as ChoiceId | undefined
    if (choice === 'A') bd.A++
    else if (choice === 'B') bd.B++
    else if (choice === 'C') bd.C++
  }
  bd.total = bd.A + bd.B + bd.C
  return bd
}

function computeRoleBreakdown(room: ReturnType<typeof getRoom>): RoleBreakdown[] {
  if (!room) return []
  const scenario = getCurrentScenario(room)
  if (!scenario) return []

  const roleIds: RoleId[] = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']
  return roleIds.map((roleId) => {
    const bd: RoleBreakdown = { roleId, roleName: ROLES[roleId].name, A: 0, B: 0, C: 0, total: 0 }
    for (const player of room.players.values()) {
      if (player.roleId !== roleId) continue
      const choice = player.choices[scenario.id] as ChoiceId | undefined
      if (choice === 'A') bd.A++
      else if (choice === 'B') bd.B++
      else if (choice === 'C') bd.C++
    }
    bd.total = bd.A + bd.B + bd.C
    return bd
  }).filter((bd) => bd.total > 0)
}

export async function POST(
  req: Request,
  { params }: { params: { pin: string } },
): Promise<NextResponse> {
  const room = getRoom(params.pin)
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { hostSecret, action } = body as { hostSecret: string; action: AdvanceAction }

  if (room.hostSecret !== hostSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // ─── start-game: lobby → playing (scenario 0) ────────────────────────────
  if (action === 'start-game') {
    if (room.phase !== 'lobby') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 })
    }

    // Select random scenarios for this session
    room.scenarioIds = selectRandomScenarios(10)
    room.phase = 'playing'
    room.currentScenarioIndex = 0
    room.scenarioStartedAt = Date.now()
    room.aiCommentary = undefined
    room.aiTrend = undefined

    const scenario = getCurrentScenario(room)

    broadcast(params.pin.toUpperCase(), 'scenario-start', {
      scenarioIndex: 0,
      scenario,
      scenarioStartedAt: room.scenarioStartedAt,
      totalScenarios: room.scenarioIds.length,
    })

    return NextResponse.json({ ok: true, phase: room.phase, scenarioIndex: room.currentScenarioIndex })
  }

  // ─── end-scenario: playing → between ─────────────────────────────────────
  if (action === 'end-scenario') {
    if (room.phase !== 'playing') {
      return NextResponse.json({ error: 'No active scenario' }, { status: 400 })
    }

    const breakdown = computeBreakdown(room)
    const roleBreakdown = computeRoleBreakdown(room)
    const prevMacro = room.macro
    const { newMacro } = computeScenarioEffects(room)

    // Compute delta (change from this round)
    const macroDelta: MacroDelta = {
      alliance: newMacro.alliance - prevMacro.alliance,
      stratification: newMacro.stratification - prevMacro.stratification,
      production: newMacro.production - prevMacro.production,
      innovation: newMacro.innovation - prevMacro.innovation,
      welfare: newMacro.welfare - prevMacro.welfare,
      democracy: newMacro.democracy - prevMacro.democracy,
    }

    room.macro = newMacro
    room.phase = 'between'
    room.lastBreakdown = breakdown
    room.roleBreakdown = roleBreakdown
    room.macroDelta = macroDelta
    room.aiCommentary = undefined

    broadcast(params.pin.toUpperCase(), 'scenario-result', {
      scenarioIndex: room.currentScenarioIndex,
      macro: room.macro,
      breakdown,
      roleBreakdown,
      macroDelta,
    })

    // Track generation epoch to prevent stale streaming callbacks
    const genEpoch = Date.now()
    ;(room as unknown as Record<string, unknown>).__aiEpoch = genEpoch

    // Fire-and-forget: Tier 1 commentary + Tier 2 trend analysis (streaming)
    const pinUpper = params.pin.toUpperCase()
    Promise.all([
      streamCommentary(
        room, room.currentScenarioIndex, breakdown,
        (text) => {
          if ((room as unknown as Record<string, unknown>).__aiEpoch !== genEpoch) return
          room.aiCommentary = text
          broadcast(pinUpper, 'ai-commentary', { commentary: text, streaming: true })
        },
        roleBreakdown, macroDelta,
      ),
      streamTrend(
        room,
        (text) => {
          if ((room as unknown as Record<string, unknown>).__aiEpoch !== genEpoch) return
          room.aiTrend = text
          broadcast(pinUpper, 'ai-trend', { trend: text, streaming: true })
        },
      ),
    ])
      .then(([commentary, trend]) => {
        if ((room as unknown as Record<string, unknown>).__aiEpoch !== genEpoch) return
        room.aiCommentary = commentary
        room.aiTrend = trend
        broadcast(pinUpper, 'ai-commentary', { commentary, streaming: false })
        broadcast(pinUpper, 'ai-trend', { trend, streaming: false })
      })
      .catch(console.error)

    return NextResponse.json({ ok: true, phase: room.phase, macro: room.macro, breakdown })
  }

  // ─── next-scenario: between → playing(i+1) | ai-generating ──────────────
  if (action === 'next-scenario') {
    if (room.phase !== 'between') {
      return NextResponse.json({ error: 'End scenario first' }, { status: 400 })
    }

    const isLast = room.currentScenarioIndex >= room.scenarioIds.length - 1

    if (isLast) {
      room.outcome = determineOutcome(room.macro)
      room.phase = 'ai-generating'
      broadcast(params.pin.toUpperCase(), 'ai-generating', { outcome: room.outcome })

      // Fire-and-forget: auto-generate AI news (streaming) + awards, then advance to results
      const pinUpper = params.pin.toUpperCase()
      const awards = computeAwards(room)
      room.awards = awards

      streamSocialNews(
        { macro: room.macro, outcome: room.outcome, room },
        (text) => {
          room.socialNews = text
          broadcast(pinUpper, 'ai-news-stream', { socialNews: text, streaming: true })
        },
      )
        .then((socialNews) => {
          room.socialNews = socialNews
          room.phase = 'results'
          broadcast(pinUpper, 'game-ended', {
            outcome: room.outcome,
            macro: room.macro,
            socialNews,
            awards,
          })
        })
        .catch((err) => {
          console.error('Auto AI generation failed:', err)
          room.socialNews = 'Bản tin AI không thể tạo. Vui lòng thử lại.'
          room.phase = 'results'
          broadcast(pinUpper, 'game-ended', {
            outcome: room.outcome,
            macro: room.macro,
            socialNews: room.socialNews,
            awards: room.awards,
          })
        })

      return NextResponse.json({ ok: true, phase: room.phase, outcome: room.outcome })
    }

    room.currentScenarioIndex++
    room.phase = 'playing'
    room.scenarioStartedAt = Date.now()
    room.aiCommentary = undefined
    room.aiTrend = undefined
    ;(room as unknown as Record<string, unknown>).__aiEpoch = Date.now() // Invalidate any stale streaming

    const scenario = getCurrentScenario(room)

    broadcast(params.pin.toUpperCase(), 'scenario-start', {
      scenarioIndex: room.currentScenarioIndex,
      scenario,
      scenarioStartedAt: room.scenarioStartedAt,
      totalScenarios: room.scenarioIds.length,
    })

    return NextResponse.json({
      ok: true,
      phase: room.phase,
      scenarioIndex: room.currentScenarioIndex,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
