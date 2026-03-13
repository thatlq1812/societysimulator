import { NextResponse } from 'next/server'
import { getRoom } from '@/lib/game-store'
import { broadcast } from '@/lib/sse'
import { computeAwards } from '@/lib/awards'
import { generateSocialNews } from '@/lib/ai-news'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { pin: string } },
): Promise<NextResponse> {
  const room = getRoom(params.pin)
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  if (room.hostSecret !== body.hostSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  if (room.phase !== 'ai-generating') {
    return NextResponse.json({ error: 'Not ready for AI generation' }, { status: 400 })
  }
  if (!room.outcome) {
    return NextResponse.json({ error: 'No outcome determined' }, { status: 400 })
  }

  try {
    const [socialNews, awards] = await Promise.all([
      generateSocialNews({ macro: room.macro, outcome: room.outcome, room }),
      Promise.resolve(computeAwards(room)),
    ])

    room.socialNews = socialNews
    room.awards = awards
    room.phase = 'results'

    broadcast(params.pin.toUpperCase(), 'game-ended', {
      outcome: room.outcome,
      macro: room.macro,
      socialNews,
      awards,
    })

    return NextResponse.json({ ok: true, socialNews, awards, outcome: room.outcome })
  } catch (err) {
    console.error('AI generation failed:', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
