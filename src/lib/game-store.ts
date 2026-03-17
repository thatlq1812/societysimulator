import type { GameRoom, Player, MacroState, RoleId } from '@/types/game'
import { ROLES } from '@/lib/roles'
import { getScenarioById } from '@/lib/scenarios'
import { generateSecret } from '@/lib/pin'
import { randomUUID } from 'crypto'

// HMR-safe in-memory singleton
const g = global as typeof global & { __rooms?: Map<string, GameRoom> }
export const rooms: Map<string, GameRoom> = g.__rooms ?? (g.__rooms = new Map())

const INITIAL_MACRO: Omit<MacroState, 'history'> = {
  alliance: 50,
  stratification: 30,
  production: 50,
  innovation: 40,
  welfare: 45,
  democracy: 40,
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
    scenarioIds: [],
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
    influence: 30,
    resilience: 50,
    allianceContribution: 0,
    neverHurtAlliance: true,
    choices: {},
  }
  room.players.set(id, player)
  return player
}

/** Resolve the current scenario from room.scenarioIds[index] */
export function getCurrentScenario(room: GameRoom) {
  if (room.currentScenarioIndex < 0 || room.currentScenarioIndex >= room.scenarioIds.length) return undefined
  return getScenarioById(room.scenarioIds[room.currentScenarioIndex])
}

export function serializeRoom(room: GameRoom) {
  return {
    pin: room.pin,
    phase: room.phase,
    currentScenarioIndex: room.currentScenarioIndex,
    totalScenarios: room.scenarioIds.length,
    currentScenario: getCurrentScenario(room),
    scenarioStartedAt: room.scenarioStartedAt,
    players: [...room.players.values()].map((p) => {
      const role = ROLES[p.roleId]
      // totalScore = net gain from starting position across all 4 micro stats + alliance bonus
      // Weights: wealth/control at 1.0 (economic), influence/resilience at 0.8 (social), alliance at 0.5 (collective)
      const totalScore = Math.round(
        (p.wealth - role.startWealth) * 1.0 +
        (p.control - role.startControl) * 1.0 +
        (p.influence - 30) * 0.8 +
        (p.resilience - 50) * 0.8 +
        p.allianceContribution * 0.5
      )
      return {
        id: p.id,
        name: p.name,
        roleId: p.roleId,
        wealth: p.wealth,
        control: p.control,
        influence: p.influence,
        resilience: p.resilience,
        allianceContribution: p.allianceContribution,
        choiceCount: Object.keys(p.choices).length,
        totalScore,
      }
    }),
    macro: room.macro,
    outcome: room.outcome,
    socialNews: room.socialNews,
    aiCommentary: room.aiCommentary,
    aiTrend: room.aiTrend,
    awards: room.awards,
    playerCount: room.players.size,
    voteCount: computeVoteCount(room),
    lastBreakdown: room.lastBreakdown,
    roleBreakdown: room.roleBreakdown,
    macroDelta: room.macroDelta,
  }
}

function computeVoteCount(room: GameRoom): number {
  const scenario = getCurrentScenario(room)
  if (!scenario) return 0
  let count = 0
  for (const player of room.players.values()) {
    if (player.choices[scenario.id]) count++
  }
  return count
}
