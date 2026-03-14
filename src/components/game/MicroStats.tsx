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
}

const MAX_WEALTH = 100

function StatBar({ label, desc, value, displayValue, color, barColor, danger }: {
  label: string; desc: string; value: number; displayValue?: string; color: string; barColor: string; danger?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-foreground/80">{label}</span>
        <span className={cn('font-bold tabular-nums', color)}>{displayValue ?? Math.round(value)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${Math.min(100, Math.abs(value))}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground/70 leading-tight">{desc}</p>
    </div>
  )
}

export function MicroStats({ roleId, wealth, control, influence, resilience, allianceContribution, choiceCount, className }: MicroStatsProps) {
  const role = ROLES[roleId]

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Chỉ số cá nhân</h3>

      <div className="grid grid-cols-2 gap-3">
        <StatBar
          label="Tích lũy tư bản"
          desc="Tài sản vật chất hiện có"
          value={(wealth / MAX_WEALTH) * 100}
          displayValue={String(Math.round(wealth))}
          color={role.colorClass}
          barColor="bg-primary"
        />

        <StatBar
          label="Quyền lực Tư liệu SX"
          desc="Sở hữu công nghệ, đất đai, dữ liệu"
          value={control}
          color={role.colorClass}
          barColor="bg-violet-500"
        />

        {influence !== undefined && (
          <StatBar
            label="Ảnh hưởng"
            desc="Tiếng nói chính trị & sức ảnh hưởng"
            value={influence}
            color="text-amber-600"
            barColor="bg-amber-500"
          />
        )}

        {resilience !== undefined && (
          <StatBar
            label="Sức chống chịu"
            desc="Mạng lưới an sinh xã hội cá nhân"
            value={resilience}
            color={resilience > 30 ? 'text-cyan-600' : 'text-red-500'}
            barColor={resilience > 30 ? 'bg-cyan-500' : 'bg-red-400'}
          />
        )}

        {allianceContribution !== undefined && (
          <StatBar
            label="Đóng góp Liên minh"
            desc="Tổng đóng góp vào khối liên minh giai cấp"
            value={Math.abs(allianceContribution) * 2}
            displayValue={`${allianceContribution >= 0 ? '+' : ''}${Math.round(allianceContribution)}`}
            color={allianceContribution >= 0 ? 'text-emerald-600' : 'text-red-500'}
            barColor={allianceContribution >= 0 ? 'bg-emerald-500' : 'bg-red-400'}
          />
        )}

        {choiceCount !== undefined && choiceCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/80">Đã trả lời</span>
            <span className="font-bold tabular-nums text-primary">{choiceCount} lượt</span>
          </div>
        )}
      </div>
    </div>
  )
}
