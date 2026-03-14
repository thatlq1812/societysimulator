// All TypeScript interfaces for Digital Society Simulator

export type RoleId = 'cong-nhan' | 'nong-dan' | 'tri-thuc' | 'startup'
export type GamePhase = 'lobby' | 'playing' | 'between' | 'ai-generating' | 'results'
export type OutcomeId = 'ben-vung' | 'dut-gay' | 'trung-tinh'
export type ChoiceId = 'A' | 'B' | 'C'
export type AwardId = 'ngon-co' | 'ke-sinh-ton' | 'mat-xich'

export interface ChoiceEffects {
  wealthDelta: number          // vi mô: Tích lũy Cá nhân
  controlDelta: number         // vi mô: Quyền lực Tư liệu Sản xuất
  allianceDelta: number        // vĩ mô: Chỉ số Liên minh
  stratificationDelta: number  // vĩ mô: Chỉ số Phân hóa Xã hội
  productionDelta: number      // vĩ mô: Lực lượng Sản xuất Quốc gia
  innovationDelta: number      // vĩ mô: Đổi mới Công nghệ
  welfareDelta: number         // vĩ mô: Phúc lợi Xã hội
  democracyDelta: number       // vĩ mô: Dân chủ & Minh bạch
}

export interface Choice {
  id: ChoiceId
  text: string
  effects: ChoiceEffects
}

export interface Scenario {
  id: string
  title: string
  context: string
  choices: [Choice, Choice, Choice]
}

export interface MacroSnapshot {
  alliance: number
  stratification: number
  production: number
  innovation: number       // Đổi mới Công nghệ & Chuyển đổi số
  welfare: number          // Phúc lợi Xã hội & Dịch vụ Công
  democracy: number        // Dân chủ & Minh bạch
}

export interface MacroState extends MacroSnapshot {
  history: MacroSnapshot[]  // one entry per completed scenario
}

export interface Role {
  id: RoleId
  name: string
  nameEn: string
  icon: string
  description: string
  historicalMission: string
  colorClass: string
  bgClass: string
  borderClass: string
  startWealth: number
  startControl: number
}

export interface Player {
  id: string
  name: string
  roleId: RoleId
  wealth: number
  control: number
  allianceContribution: number
  neverHurtAlliance: boolean
  choices: Record<string, ChoiceId>  // scenarioId → choice
}

export interface Award {
  id: AwardId
  name: string
  icon: string
  description: string
  playerId: string
  playerName: string
  playerRoleId: RoleId
  reason: string
}

export interface GameRoom {
  id: string
  pin: string
  hostSecret: string
  phase: GamePhase
  currentScenarioIndex: number  // -1 = not started, 0-5 = active scenario
  scenarioIds: string[]         // IDs of randomly-selected scenarios for this session
  scenarioStartedAt?: number    // Date.now() when scenario became 'playing'
  players: Map<string, Player>
  macro: MacroState
  outcome?: OutcomeId
  socialNews?: string
  aiCommentary?: string         // Tier 1: per-round AI commentary
  aiTrend?: string              // Tier 2: host-visible trend analysis
  awards?: Award[]
  lastBreakdown?: ChoiceBreakdown
  createdAt: number
}

// ─── API response types (serializable — Maps converted to arrays) ─────────────

export interface PlayerPublic {
  id: string
  name: string
  roleId: RoleId
  wealth: number
  control: number
  allianceContribution: number
}

export interface ChoiceBreakdown {
  A: number
  B: number
  C: number
  total: number
}

export interface RoomStatePublic {
  pin: string
  phase: GamePhase
  currentScenarioIndex: number
  totalScenarios: number
  currentScenario?: Scenario                // resolved scenario for current index
  scenarioStartedAt?: number
  players: PlayerPublic[]
  macro: MacroState
  outcome?: OutcomeId
  socialNews?: string
  aiCommentary?: string                     // Tier 1: per-round commentary
  aiTrend?: string                          // Tier 2: host trend analysis
  awards?: Award[]
  playerCount: number
  voteCount: number                     // votes cast in current scenario
  lastBreakdown?: ChoiceBreakdown       // A/B/C distribution from last scenario
}

export interface JoinResponse {
  playerId: string
  roleId: RoleId
  player: PlayerPublic
  macro: MacroState
}

export interface CreateRoomResponse {
  pin: string
  hostSecret: string
  joinUrl: string
  qrDataUrl: string
}

// ─── SSE Event payloads ────────────────────────────────────────────────────────

export type SSEEventType =
  | 'init'
  | 'player-joined'
  | 'vote-update'
  | 'scenario-start'
  | 'scenario-result'
  | 'game-ended'
  | 'ai-generating'
  | 'ai-commentary'
  | 'ai-trend'

export interface SSEPlayerJoined {
  playerCount: number
  players: PlayerPublic[]
}

export interface SSEVoteUpdate {
  voteCount: number
}

export interface SSEScenarioStart {
  scenarioIndex: number
  scenario: Scenario
  scenarioStartedAt: number
}

export interface SSEScenarioResult {
  scenarioIndex: number
  macro: MacroState
  breakdown: ChoiceBreakdown
}

export interface SSEAiGenerating {
  outcome: OutcomeId
}

export interface SSEAiCommentary {
  commentary: string
}

export interface SSEAiTrend {
  trend: string
}

export interface SSEGameEnded {
  outcome: OutcomeId
  macro: MacroState
  socialNews: string
  awards: Award[]
}
