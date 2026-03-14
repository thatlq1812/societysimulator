/** Client-safe image path mappings. No Node.js imports here. */

// ─── Scenario ID → image filename mapping ────────────────────────────────────

export const SCENARIO_IMAGE_MAP: Record<string, string> = {
  'tu-dong-hoa': '/images/scenario-automation.png',
  'doc-quyen-du-lieu': '/images/scenario-data.png',
  'bang-sang-che': '/images/scenario-opensource.png',
  'dinh-cong-gig': '/images/scenario-strike.png',
  'mua-lai-startup': '/images/scenario-acquisition.png',
  'ha-tang-nong-thon': '/images/scenario-rural.png',
  'chia-se-nen-tang': '/images/scenario-platform.png',
  'khung-hoang-nha-o': '/images/scenario-housing.png',
  'giao-duc-online': '/images/scenario-education.png',
  'ai-tuyen-dung': '/images/scenario-hiring.png',
  'blockchain-tu-quan': '/images/scenario-blockchain.png',
  'ubi': '/images/scenario-ubi.png',
}

export const ROLE_IMAGE_MAP: Record<string, string> = {
  'cong-nhan': '/images/role-worker.png',
  'nong-dan': '/images/role-farmer.png',
  'tri-thuc': '/images/role-intellectual.png',
  'startup': '/images/role-startup.png',
}

export const OUTCOME_IMAGE_MAP: Record<string, string> = {
  'ben-vung': '/images/outcome-sustainable.png',
  'dut-gay': '/images/outcome-collapse.png',
  'trung-tinh': '/images/outcome-unstable.png',
}

export const TRANSITION_IMAGE_MAP: Record<string, string> = {
  'analyzing': '/images/transition-analyzing.png',
  'waiting': '/images/transition-waiting.png',
}

export const INDICATOR_IMAGE_MAP: Record<string, string> = {
  'innovation': '/images/indicator-innovation.png',
  'welfare': '/images/indicator-welfare.png',
  'democracy': '/images/indicator-democracy.png',
}

export const LOBBY_IMAGE = '/images/lobby-gathering.png'
