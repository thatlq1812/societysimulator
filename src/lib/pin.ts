import { randomUUID } from 'crypto'

// Generate a 6-digit numeric PIN
export function generatePIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a secure host secret (UUID-based)
export function generateSecret(): string {
  return randomUUID().replace(/-/g, '')
}
