import type { GameRoom, Player, MacroState, RoleId } from '@/types/game'
import { ROLES } from '@/lib/roles'
import { SCENARIOS } from '@/lib/scenarios'
import { generateSecret } from '@/lib/pin'
import { randomUUID } from 'crypto'

// HMR-safe in-memory singleton
const g = global as typeof global & { __rooms?: Map<string, GameRoom> }
export const rooms: Map<string, GameRoom> = g.__rooms ?? (g.__rooms = new Map())

const INITIAL_MACRO: Omit<MacroState, 'history'> = {
  alliance: 50,
  stratification: 30,
  production: 50,
}

function generateUniquePIN(): string {
  let pin: string
  let attempts = 0
  do {
    pin = generateSecret().slice(0, 6).toUpperCase()
    attempts++
  } while (rooms.has(pin) && attempts < 100)
  return pin
}

export function createRoom(): GameRoom {
  // Cleanup old rooms (> 3 hours)
  const cutoff = Date.now() - 3 * 60 * 60 * 1000
  for (const [pin, room] of rooms) {
    if (room.createdAt < cutoff) rooms.delete(pin)
  }

  const pin = generateUniquePIN()
  const hostSecret = generateSecret()
  const room: GameRoom = {
    id: randomUUID(),
    pin,
    hostSecret,
    phase: 'lobby',
    currentScenarioIndex: -1,
    players: new Map(),
    macro: { ...INITIAL_MACRO, history: [] },
    createdAt: Date.now(),
  }
  rooms.set(pin, room)
  return room
}

export function getRoom(pin: string): GameRoom | undefined {
  return rooms.get(pin.toUpperCase())
}

export function addPlayer(room: GameRoom, id: string, name: string, roleId: RoleId): Player {
  const role = ROLES[roleId]
  const player: Player = {
    id,
    name,
    roleId,
    wealth: role.startWealth,
    control: role.startControl,
    allianceContribution: 0,
    neverHurtAlliance: true,
    choices: {},
  }
  room.players.set(id, player)
  return player
}

export function serializeRoom(room: GameRoom) {
  return {
    pin: room.pin,
    phase: room.phase,
    currentScenarioIndex: room.currentScenarioIndex,
    scenarioStartedAt: room.scenarioStartedAt,
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      roleId: p.roleId,
      wealth: p.wealth,
      control: p.control,
      allianceContribution: p.allianceContribution,
    })),
    macro: room.macro,
    outcome: room.outcome,
    socialNews: room.socialNews,
    awards: room.awards,
    playerCount: room.players.size,
    voteCount: computeVoteCount(room),
    lastBreakdown: room.lastBreakdown,
  }
}

function computeVoteCount(room: GameRoom): number {
  const scenario = SCENARIOS[room.currentScenarioIndex]
  if (!scenario) return 0
  let count = 0
  for (const player of room.players.values()) {
    if (player.choices[scenario.id]) count++
  }
  return count
}
