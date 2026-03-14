import { NextResponse } from 'next/server'
import { getRoom, getCurrentScenario } from '@/lib/game-store'
import { broadcast } from '@/lib/sse'
import type { ChoiceId } from '@/types/game'

export const dynamic = 'force-dynamic'

// Debounce timers for vote-update broadcasts (prevents 35 broadcasts in quick succession)
const voteDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

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

  const scenario = getCurrentScenario(room)
  if (!scenario) return NextResponse.json({ error: 'No active scenario' }, { status: 400 })

  // Record choice (allow re-selection while window is open)
  player.choices[scenario.id] = choice

  // Compute current vote count — broadcast is debounced to handle 35 simultaneous votes
  let voteCount = 0
  for (const p of room.players.values()) {
    if (p.choices[scenario.id]) voteCount++
  }

  // Debounce vote-update broadcasts: schedule one 150ms from now, cancel any pending
  const pinUpper = params.pin.toUpperCase()
  const debounceKey = `vote-${pinUpper}-${scenario.id}`
  if (voteDebounceTimers.has(debounceKey)) {
    clearTimeout(voteDebounceTimers.get(debounceKey)!)
  }
  voteDebounceTimers.set(debounceKey, setTimeout(() => {
    // Re-count at broadcast time for accuracy
    let latestCount = 0
    for (const p of room.players.values()) {
      if (p.choices[scenario.id]) latestCount++
    }
    broadcast(pinUpper, 'vote-update', {
      voteCount: latestCount,
      playerCount: room.players.size,
    })
    voteDebounceTimers.delete(debounceKey)
  }, 150))

  return NextResponse.json({ ok: true, voteCount })
}
