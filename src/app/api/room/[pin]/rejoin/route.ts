import { NextResponse } from 'next/server'
import { getRoom, serializeRoom } from '@/lib/game-store'
import type { RoleId } from '@/types/game'

export const dynamic = 'force-dynamic'

/**
 * Rejoin endpoint: allows a player who lost connection to reconnect
 * by providing their playerId. Returns current game state + player data.
 */
export async function POST(
  req: Request,
  { params }: { params: { pin: string } },
): Promise<NextResponse> {
  const room = getRoom(params.pin)
  if (!room) return NextResponse.json({ error: 'Mã PIN không hợp lệ' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { playerId } = body as { playerId: string }

  if (!playerId) {
    return NextResponse.json({ error: 'playerId required' }, { status: 400 })
  }

  const player = room.players.get(playerId)
  if (!player) {
    return NextResponse.json({ error: 'Player not found — may need to rejoin from lobby' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    playerId: player.id,
    roleId: player.roleId as RoleId,
    playerName: player.name,
    state: serializeRoom(room),
  })
}
