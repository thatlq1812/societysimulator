import { NextResponse } from 'next/server'
import { getRoom, serializeRoom } from '@/lib/game-store'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { pin: string } },
): Promise<NextResponse> {
  const room = getRoom(params.pin)
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  return NextResponse.json(serializeRoom(room))
}
