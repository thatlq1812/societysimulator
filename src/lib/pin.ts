import { randomUUID } from 'crypto'

// Generate a secure host secret (UUID-based)
export function generateSecret(): string {
  return randomUUID().replace(/-/g, '')
}
