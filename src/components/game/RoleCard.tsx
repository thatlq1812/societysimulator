import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import type { RoleId } from '@/types/game'

interface RoleCardProps {
  roleId: RoleId
  playerName: string
  className?: string
}

export function RoleCard({ roleId, playerName, className }: RoleCardProps) {
  const role = ROLES[roleId]

  return (
    <div className={cn('rounded-2xl border p-6 space-y-4 animate-slide-up', role.bgClass, role.borderClass, className)}>
      <div className="flex items-center gap-4">
        <span className="text-5xl">{role.emoji}</span>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Vai trò của bạn</p>
          <h2 className={cn('text-2xl font-bold', role.colorClass)}>{role.name}</h2>
          <p className="text-sm text-muted-foreground">{role.nameEn}</p>
        </div>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed">{role.description}</p>

      <div className="rounded-lg bg-background/40 p-3 border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Nhiệm vụ lịch sử</p>
        <p className="text-sm font-medium">{role.historicalMission}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">{playerName[0]?.toUpperCase()}</span>
        </div>
        <span className="font-semibold">{playerName}</span>
      </div>
    </div>
  )
}
