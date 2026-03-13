import { NextResponse } from 'next/server'
import { getRoom } from '@/lib/game-store'
import { broadcast } from '@/lib/sse'
import type { ChoiceId } from '@/types/game'
import { SCENARIOS } from '@/lib/scenarios'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { pin: string } },
): Promise<NextResponse> {
  const room = getRoom(params.pin)
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  if (room.phase !== 'playing') {
    return NextResponse.json({ error: 'No active scenario' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const { playerId, choice } = body as { playerId: string; choice: ChoiceId }

  if (!playerId || !['A', 'B', 'C'].includes(choice)) {
    return NextResponse.json({ error: 'Invalid choice' }, { status: 400 })
  }

  const player = room.players.get(playerId)
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

  const scenario = SCENARIOS[room.currentScenarioIndex]
  if (!scenario) return NextResponse.json({ error: 'No active scenario' }, { status: 400 })

  // Record choice (allow re-selection while window is open)
  player.choices[scenario.id] = choice

  // Compute current vote count and broadcast lightweight update
  let voteCount = 0
  for (const p of room.players.values()) {
    if (p.choices[scenario.id]) voteCount++
  }
  broadcast(params.pin.toUpperCase(), 'vote-update', {
    voteCount,
    playerCount: room.players.size,
  })

  return NextResponse.json({ ok: true, voteCount })
}
