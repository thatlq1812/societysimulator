import { subscribe } from '@/lib/sse'
import { getRoom, serializeRoom } from '@/lib/game-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: { pin: string } },
): Promise<Response> {
  const pin = params.pin.toUpperCase()
  const room = getRoom(pin)
  if (!room) {
    return new Response('Room not found', { status: 404 })
  }

  const encoder = new TextEncoder()
  let unsubscribe: (() => void) | null = null
  let keepAliveId: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      // Send current state immediately on connect
      const init = `event: init\ndata: ${JSON.stringify(serializeRoom(room))}\n\n`
      controller.enqueue(encoder.encode(init))

      // Subscribe to broadcast events
      unsubscribe = subscribe(pin, (data: string) => {
        try {
          controller.enqueue(encoder.encode(data))
        } catch {
          // Client disconnected
        }
      })

      // Keepalive every 25s to prevent Cloud Run timeout
      keepAliveId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch {
          if (keepAliveId) clearInterval(keepAliveId)
        }
      }, 25000)
    },
    cancel() {
      unsubscribe?.()
      if (keepAliveId) clearInterval(keepAliveId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
