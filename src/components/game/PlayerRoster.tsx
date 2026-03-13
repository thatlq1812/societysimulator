import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
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
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {ROLE_IDS.map((rid) => {
        const role = ROLES[rid]
        const rolePlayers = byRole[rid]
        return (
          <div key={rid} className={cn('rounded-xl border p-3', role.bgClass, role.borderClass)}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{role.emoji}</span>
              <span className={cn('text-sm font-semibold', role.colorClass)}>{role.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{rolePlayers.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {rolePlayers.map((p) => (
                <span key={p.id} className="text-xs bg-background/40 rounded-md px-2 py-0.5">
                  {p.name}
                </span>
              ))}
              {rolePlayers.length === 0 && (
                <span className="text-xs text-muted-foreground italic">Chưa có người</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
