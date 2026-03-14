import type { Role, RoleId } from '@/types/game'

export const ROLES: Record<RoleId, Role> = {
  'cong-nhan': {
    id: 'cong-nhan',
    name: 'Công nhân Nền tảng',
    nameEn: 'Platform Worker',
    icon: 'worker',
    description:
      'Gig worker: tài xế công nghệ, shipper, lao động hợp đồng ngắn hạn trên các nền tảng số.',
    historicalMission:
      'Đại diện giai cấp công nhân hiện đại — bảo vệ quyền lao động và xây dựng liên minh giai cấp.',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    startWealth: 5,
    startControl: 8,
  },
  'nong-dan': {
    id: 'nong-dan',
    name: 'Nông dân 4.0',
    nameEn: 'Smart Farmer',
    icon: 'farmer',
    description:
      'Smart farmer: ứng dụng IoT, dữ liệu nông nghiệp, kết nối chuỗi cung ứng số.',
    historicalMission:
      'Đại diện giai cấp nông dân thời số hóa — giành lại tự chủ dữ liệu sản xuất và kết nối với tri thức.',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    startWealth: 8,
    startControl: 12,
  },
  'tri-thuc': {
    id: 'tri-thuc',
    name: 'Trí thức Công nghệ',
    nameEn: 'Tech Intellectual',
    icon: 'intellectual',
    description:
      'Kỹ sư phần mềm, nhà nghiên cứu AI, developer — nắm giữ tư liệu sản xuất tri thức số.',
    historicalMission:
      'Tầng lớp trí thức mới — chia sẻ tri thức, không độc quyền hóa tư liệu sản xuất số.',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-200',
    startWealth: 12,
    startControl: 20,
  },
  'startup': {
    id: 'startup',
    name: 'Chủ Startup / Nền tảng',
    nameEn: 'Startup Founder',
    icon: 'startup',
    description:
      'Founder, doanh nhân số, chủ nền tảng gig — kiểm soát thuật toán và dữ liệu người dùng.',
    historicalMission:
      'Tầng lớp doanh nhân mới nổi — tăng trưởng không bóc lột, tạo giá trị thực cho xã hội.',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    startWealth: 20,
    startControl: 25,
  },
}

const ROLE_IDS: RoleId[] = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']

// Balanced round-robin assignment — minimizes role imbalance
export function assignRole(currentPlayers: Map<string, { roleId: RoleId }>): RoleId {
  const counts = new Map<RoleId, number>(ROLE_IDS.map((r) => [r, 0]))
  for (const p of currentPlayers.values()) {
    counts.set(p.roleId, (counts.get(p.roleId) ?? 0) + 1)
  }
  const minCount = Math.min(...counts.values())
  const candidates = ROLE_IDS.filter((r) => counts.get(r) === minCount)
  return candidates[Math.floor(Math.random() * candidates.length)]
}
