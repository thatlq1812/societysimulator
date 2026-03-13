// SSE client registry — shared across API routes in the same Node.js process

const globalSSE = global as typeof global & {
  __sseClients?: Map<string, Set<(data: string) => void>>
}
const clients: Map<string, Set<(data: string) => void>> =
  globalSSE.__sseClients ?? (globalSSE.__sseClients = new Map())

export function subscribe(pin: string, cb: (data: string) => void): () => void {
  if (!clients.has(pin)) clients.set(pin, new Set())
  clients.get(pin)!.add(cb)
  return () => {
    clients.get(pin)?.delete(cb)
    if (clients.get(pin)?.size === 0) clients.delete(pin)
  }
}

export function broadcast(pin: string, event: string, data: unknown): void {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  clients.get(pin)?.forEach((cb) => cb(msg))
}

export function getClientCount(pin: string): number {
  return clients.get(pin)?.size ?? 0
}
