import { NextResponse } from 'next/server'
import { getRoom } from '@/lib/game-store'
import { broadcast } from '@/lib/sse'
import { computeScenarioEffects, determineOutcome } from '@/lib/effects'
import { SCENARIOS } from '@/lib/scenarios'
import type { ChoiceBreakdown, ChoiceId } from '@/types/game'

export const dynamic = 'force-dynamic'

type AdvanceAction = 'start-game' | 'end-scenario' | 'next-scenario'

function computeBreakdown(room: ReturnType<typeof getRoom>, scenarioIndex: number): ChoiceBreakdown {
  const scenario = SCENARIOS[scenarioIndex]
  const bd: ChoiceBreakdown = { A: 0, B: 0, C: 0, total: 0 }
  if (!scenario || !room) return bd
  for (const player of room.players.values()) {
    const choice = player.choices[scenario.id] as ChoiceId | undefined
    if (choice === 'A') bd.A++
    else if (choice === 'B') bd.B++
    else if (choice === 'C') bd.C++
  }
  bd.total = bd.A + bd.B + bd.C
  return bd
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
    room.phase = 'playing'
    room.currentScenarioIndex = 0
    room.scenarioStartedAt = Date.now()

    broadcast(params.pin.toUpperCase(), 'scenario-start', {
      scenarioIndex: 0,
      scenario: SCENARIOS[0],
      scenarioStartedAt: room.scenarioStartedAt,
    })

    return NextResponse.json({ ok: true, phase: room.phase, scenarioIndex: room.currentScenarioIndex })
  }

  // ─── end-scenario: playing → between ─────────────────────────────────────
  if (action === 'end-scenario') {
    if (room.phase !== 'playing') {
      return NextResponse.json({ error: 'No active scenario' }, { status: 400 })
    }

    const breakdown = computeBreakdown(room, room.currentScenarioIndex)
    const { newMacro } = computeScenarioEffects(room, room.currentScenarioIndex)
    room.macro = newMacro
    room.phase = 'between'
    room.lastBreakdown = breakdown

    broadcast(params.pin.toUpperCase(), 'scenario-result', {
      scenarioIndex: room.currentScenarioIndex,
      macro: room.macro,
      breakdown,
    })

    return NextResponse.json({ ok: true, phase: room.phase, macro: room.macro, breakdown })
  }

  // ─── next-scenario: between → playing(i+1) | ai-generating ──────────────
  if (action === 'next-scenario') {
    if (room.phase !== 'between') {
      return NextResponse.json({ error: 'End scenario first' }, { status: 400 })
    }

    const isLast = room.currentScenarioIndex >= SCENARIOS.length - 1

    if (isLast) {
      room.outcome = determineOutcome(room.macro)
      room.phase = 'ai-generating'
      broadcast(params.pin.toUpperCase(), 'ai-generating', { outcome: room.outcome })
      return NextResponse.json({ ok: true, phase: room.phase, outcome: room.outcome })
    }

    room.currentScenarioIndex++
    room.phase = 'playing'
    room.scenarioStartedAt = Date.now()

    broadcast(params.pin.toUpperCase(), 'scenario-start', {
      scenarioIndex: room.currentScenarioIndex,
      scenario: SCENARIOS[room.currentScenarioIndex],
      scenarioStartedAt: room.scenarioStartedAt,
    })

    return NextResponse.json({
      ok: true,
      phase: room.phase,
      scenarioIndex: room.currentScenarioIndex,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
