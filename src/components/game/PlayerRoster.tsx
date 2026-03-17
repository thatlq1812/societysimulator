import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import { IconByKey } from '@/components/icons'
import type { RoleId, PlayerPublic } from '@/types/game'

interface PlayerRosterProps {
  players: PlayerPublic[]
  className?: string
}

const ROLE_IDS: RoleId[] = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']

export function PlayerRoster({ players, className }: PlayerRosterProps) {
  const byRole = ROLE_IDS.reduce<Record<RoleId, PlayerPublic[]>>((acc, rid) => {
    acc[rid] = players.filter((p) => p.roleId === rid)
    return acc
  }, {} as Record<RoleId, PlayerPublic[]>)

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3', className)}>
      {ROLE_IDS.map((rid) => {
        const role = ROLES[rid]
        const rolePlayers = byRole[rid]
        return (
          <div key={rid} className={cn('rounded-xl border p-2.5 min-w-0 overflow-hidden', role.bgClass, role.borderClass)}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <IconByKey name={role.icon} size={16} className={role.colorClass} />
              <span className={cn('text-xs font-semibold truncate', role.colorClass)}>{role.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums flex-shrink-0">{rolePlayers.length}</span>
            </div>
            <div className="flex flex-wrap gap-1 w-full">
              {rolePlayers.map((p) => (
                <span key={p.id} className="text-[11px] bg-background/40 rounded px-1.5 py-0.5 break-all min-w-0 max-w-full">
                  {p.name}
                </span>
              ))}
              {rolePlayers.length === 0 && (
                <span className="text-[11px] text-muted-foreground italic">—</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
