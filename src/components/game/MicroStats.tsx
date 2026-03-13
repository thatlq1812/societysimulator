import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import type { RoleId } from '@/types/game'

interface MicroStatsProps {
  roleId: RoleId
  wealth: number
  control: number
  className?: string
}

const MAX_WEALTH = 100

export function MicroStats({ roleId, wealth, control, className }: MicroStatsProps) {
  const role = ROLES[roleId]

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Chỉ số cá nhân</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/80">Tích lũy Cá nhân</span>
          <span className={cn('font-bold tabular-nums', role.colorClass)}>{Math.round(wealth)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700')}
            style={{
              width: `${Math.min(100, (wealth / MAX_WEALTH) * 100)}%`,
              backgroundColor: 'hsl(var(--primary))',
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
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
    </div>
  )
}
