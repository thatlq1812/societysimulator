import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import type { RoleId } from '@/types/game'

interface MicroStatsProps {
  roleId: RoleId
  wealth: number
  control: number
  influence?: number
  resilience?: number
  allianceContribution?: number
  choiceCount?: number
  className?: string
  darkMode?: boolean
}

const MAX_WEALTH = 100
const BAR_MAX = 200  // Visual bar fills at 200 — allows scores to grow beyond old cap

function StatBar({ label, desc, value, displayValue, color, barColor, darkMode }: {
  label: string; desc: string; value: number; displayValue?: string; color: string; barColor: string; darkMode?: boolean
}) {
  const barPct = Math.min(100, Math.max(0, value))
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={darkMode ? 'text-blue-100/80' : 'text-foreground/80'}>{label}</span>
        <span className={cn('font-bold tabular-nums', color)}>{displayValue ?? Math.round(value * BAR_MAX / 100)}</span>
      </div>
      <div className={cn('h-2 rounded-full overflow-hidden', darkMode ? 'bg-white/15' : 'bg-muted')}>
        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${barPct}%` }} />
      </div>
      <p className={cn('text-[10px] leading-tight', darkMode ? 'text-blue-200/50' : 'text-muted-foreground/70')}>{desc}</p>
    </div>
  )
}

export function MicroStats({ roleId, wealth, control, influence, resilience, allianceContribution, choiceCount, className, darkMode }: MicroStatsProps) {
  const role = ROLES[roleId]

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className={cn('text-xs uppercase tracking-widest', darkMode ? 'text-blue-200/70' : 'text-muted-foreground')}>Chỉ số cá nhân</h3>

      <div className="grid grid-cols-2 gap-3">
        <StatBar
          label="Tích lũy tư bản"
          desc="Tài sản vật chất hiện có"
          value={(wealth / BAR_MAX) * 100}
          displayValue={String(Math.round(wealth))}
          color={darkMode ? 'text-blue-300' : role.colorClass}
          barColor="bg-primary"
          darkMode={darkMode}
        />

        <StatBar
          label="Quyền lực Tư liệu SX"
          desc="Sở hữu công nghệ, đất đai, dữ liệu"
          value={(control / BAR_MAX) * 100}
          displayValue={String(Math.round(control))}
          color={darkMode ? 'text-violet-300' : role.colorClass}
          barColor="bg-violet-500"
          darkMode={darkMode}
        />

        {influence !== undefined && (
          <StatBar
            label="Ảnh hưởng"
            desc="Tiếng nói chính trị & sức ảnh hưởng"
            value={(influence / BAR_MAX) * 100}
            displayValue={String(Math.round(influence))}
            color={darkMode ? 'text-amber-300' : 'text-amber-600'}
            barColor="bg-amber-500"
            darkMode={darkMode}
          />
        )}

        {resilience !== undefined && (
          <StatBar
            label="Sức chống chịu"
            desc="Mạng lưới an sinh xã hội cá nhân"
            value={(resilience / BAR_MAX) * 100}
            displayValue={String(Math.round(resilience))}
            color={resilience > 20 ? (darkMode ? 'text-cyan-300' : 'text-cyan-600') : 'text-red-400'}
            barColor={resilience > 20 ? 'bg-cyan-500' : 'bg-red-400'}
            darkMode={darkMode}
          />
        )}

        {allianceContribution !== undefined && (
          <StatBar
            label="Đóng góp Liên minh"
            desc="Tổng đóng góp vào khối liên minh giai cấp"
            value={Math.min(100, Math.abs(allianceContribution))}
            displayValue={`${allianceContribution >= 0 ? '+' : ''}${Math.round(allianceContribution)}`}
            color={allianceContribution >= 0 ? (darkMode ? 'text-emerald-300' : 'text-emerald-600') : 'text-red-400'}
            barColor={allianceContribution >= 0 ? 'bg-emerald-500' : 'bg-red-400'}
            darkMode={darkMode}
          />
        )}

        {choiceCount !== undefined && choiceCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className={darkMode ? 'text-blue-100/80' : 'text-foreground/80'}>Đã trả lời</span>
            <span className={cn('font-bold tabular-nums', darkMode ? 'text-blue-300' : 'text-primary')}>{choiceCount} lượt</span>
          </div>
        )}
      </div>
    </div>
  )
}
