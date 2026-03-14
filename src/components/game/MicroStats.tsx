import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import type { RoleId } from '@/types/game'

interface MicroStatsProps {
  roleId: RoleId
  wealth: number
  control: number
  allianceContribution?: number
  choiceCount?: number
  className?: string
}

const MAX_WEALTH = 100

export function MicroStats({ roleId, wealth, control, allianceContribution, choiceCount, className }: MicroStatsProps) {
  const role = ROLES[roleId]

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Chỉ số cá nhân</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Wealth */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/80">Tích lũy</span>
            <span className={cn('font-bold tabular-nums', role.colorClass)}>{Math.round(wealth)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (wealth / MAX_WEALTH) * 100)}%`,
                backgroundColor: 'hsl(var(--primary))',
              }}
            />
          </div>
        </div>

        {/* Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/80">Quyền lực TLSX</span>
            <span className={cn('font-bold tabular-nums', role.colorClass)}>{Math.round(control)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-violet-500"
              style={{ width: `${Math.min(100, control)}%` }}
            />
          </div>
        </div>

        {/* Alliance Contribution */}
        {allianceContribution !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/80">Đóng góp LM</span>
              <span className={cn('font-bold tabular-nums', allianceContribution >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {allianceContribution >= 0 ? '+' : ''}{Math.round(allianceContribution)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', allianceContribution >= 0 ? 'bg-emerald-500' : 'bg-red-400')}
                style={{ width: `${Math.min(100, Math.abs(allianceContribution) * 2)}%` }}
              />
            </div>
          </div>
        )}

        {/* Choice count */}
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
