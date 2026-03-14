import type { GameRoom, Award } from '@/types/game'
import { ROLES } from '@/lib/roles'

export function computeAwards(room: GameRoom): Award[] {
  const players = [...room.players.values()]
  if (players.length === 0) return []

  const awards: Award[] = []
  const awardedPlayerIds = new Set<string>()

  // ─── Award 1: Ngọn cờ Liên minh ──────────────────────────────────────────
  const byAlliance = [...players].sort((a, b) => b.allianceContribution - a.allianceContribution)
  const allianceWinner = byAlliance[0]
  if (allianceWinner) {
    awards.push({
      id: 'ngon-co',
      name: 'Ngọn cờ Liên minh',
      icon: 'trophy',
      description:
        'Người đóng góp nhiều nhất cho khối liên minh công–nông–trí thức. Đặt lợi ích tập thể lên trên lợi ích cá nhân.',
      playerId: allianceWinner.id,
      playerName: allianceWinner.name,
      playerRoleId: allianceWinner.roleId,
      reason: `Tổng đóng góp Liên minh: +${Math.round(allianceWinner.allianceContribution)} điểm`,
    })
    awardedPlayerIds.add(allianceWinner.id)
  }

  // ─── Award 2: Kẻ sinh tồn Tối ưu ────────────────────────────────────────
  // Highest wealth among players who NEVER hurt alliance (excluding already awarded)
  const eligible = players.filter((p) => !awardedPlayerIds.has(p.id) && p.neverHurtAlliance)
  const survivorPool = eligible.length > 0 ? eligible : players.filter((p) => !awardedPlayerIds.has(p.id) && p.allianceContribution >= 0)
  const finalPool = survivorPool.length > 0 ? survivorPool : players.filter((p) => !awardedPlayerIds.has(p.id))
  const survivalWinner = [...finalPool].sort((a, b) => b.wealth - a.wealth)[0]

  if (survivalWinner) {
    const startWealth = ROLES[survivalWinner.roleId].startWealth
    const gained = Math.round(survivalWinner.wealth - startWealth)
    awards.push({
      id: 'ke-sinh-ton',
      name: 'Kẻ sinh tồn Tối ưu',
      icon: 'shield',
      description:
        'Tích lũy cao nhất mà không làm suy yếu liên minh — làm giàu hợp pháp trong KTTT định hướng XHCN.',
      playerId: survivalWinner.id,
      playerName: survivalWinner.name,
      playerRoleId: survivalWinner.roleId,
      reason: eligible.length > 0
        ? `Tích lũy cuối: ${Math.round(survivalWinner.wealth)} (+${gained} từ khởi điểm), không làm hại Liên minh`
        : `Tích lũy cuối: ${Math.round(survivalWinner.wealth)} (+${gained} từ khởi điểm)`,
    })
    awardedPlayerIds.add(survivalWinner.id)
  }

  // ─── Award 3: Mắt xích Rủi ro ────────────────────────────────────────────
  // Most imbalanced: high wealth gain relative to alliance contribution (excluding already awarded)
  const remainingPlayers = players.filter((p) => !awardedPlayerIds.has(p.id))
  const withRiskScore = remainingPlayers.map((p) => ({
    player: p,
    riskScore: (p.wealth - ROLES[p.roleId].startWealth) - p.allianceContribution,
  }))
  const riskWinner = [...withRiskScore].sort((a, b) => b.riskScore - a.riskScore)[0]

  if (riskWinner) {
    const startWealth = ROLES[riskWinner.player.roleId].startWealth
    const gained = Math.round(riskWinner.player.wealth - startWealth)
    awards.push({
      id: 'mat-xich',
      name: 'Mắt xích Rủi ro',
      icon: 'warning',
      description:
        'Tỷ lệ lợi ích cá nhân / đóng góp vĩ mô mất cân bằng nhất — case study về giới hạn của tối ưu cá nhân.',
      playerId: riskWinner.player.id,
      playerName: riskWinner.player.name,
      playerRoleId: riskWinner.player.roleId,
      reason: `Tích lũy +${gained}, đóng góp Liên minh ${Math.round(riskWinner.player.allianceContribution)} — chênh lệch: ${Math.round(riskWinner.riskScore)}`,
    })
  }

  return awards
}
