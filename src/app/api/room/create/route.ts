import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createRoom } from '@/lib/game-store'
import type { CreateRoomResponse } from '@/types/game'

export const dynamic = 'force-dynamic'

export async function POST(): Promise<NextResponse> {
  const room = createRoom()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const joinUrl = `${appUrl}/join?pin=${room.pin}`

  const qrDataUrl = await QRCode.toDataURL(joinUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#ffffff', light: '#0a0f1e' },
  })

  const response: CreateRoomResponse = {
    pin: room.pin,
    hostSecret: room.hostSecret,
    joinUrl,
    qrDataUrl,
  }

  return NextResponse.json(response)
}
