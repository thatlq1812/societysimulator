import { NextResponse } from 'next/server'
import { getRoom, addPlayer } from '@/lib/game-store'
import { assignRole } from '@/lib/roles'
import { broadcast } from '@/lib/sse'
import { randomUUID } from 'crypto'
import type { JoinResponse, RoleId } from '@/types/game'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { pin: string } },
): Promise<NextResponse> {
  const room = getRoom(params.pin)
  if (!room) return NextResponse.json({ error: 'Mã PIN không hợp lệ' }, { status: 404 })
  if (room.phase !== 'lobby') {
    const msg = room.phase === 'results'
      ? 'Game đã kết thúc'
      : 'Game đang diễn ra, không thể tham gia lúc này'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? '').trim().slice(0, 30)
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const playerId = randomUUID()
  const roleId = assignRole(room.players as Map<string, { roleId: RoleId }>)
  const player = addPlayer(room, playerId, name, roleId)

  // Broadcast to projection screen
  broadcast(params.pin.toUpperCase(), 'player-joined', {
    playerCount: room.players.size,
    players: [...room.players.values()].map((p) => ({
      id: p.id, name: p.name, roleId: p.roleId,
      wealth: p.wealth, control: p.control, allianceContribution: p.allianceContribution,
      choiceCount: Object.keys(p.choices).length,
    })),
  })

  const response: JoinResponse = {
    playerId: player.id,
    roleId: player.roleId,
    player: {
      id: player.id, name: player.name, roleId: player.roleId,
      wealth: player.wealth, control: player.control,
      influence: player.influence, resilience: player.resilience,
      allianceContribution: player.allianceContribution,
      choiceCount: 0,
      totalScore: 0,
    },
    macro: room.macro,
  }

  return NextResponse.json(response)
}
