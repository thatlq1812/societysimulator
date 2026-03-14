import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import { IconByKey } from '@/components/icons'
import type { Award } from '@/types/game'

interface AwardCardProps {
  award: Award
  className?: string
}

const AWARD_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  'ngon-co': { border: 'border-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'ke-sinh-ton': { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'mat-xich': { border: 'border-orange-300', bg: 'bg-orange-50', text: 'text-orange-700' },
}

export function AwardCard({ award, className }: AwardCardProps) {
  const style = AWARD_STYLES[award.id] ?? AWARD_STYLES['ngon-co']
  const role = ROLES[award.playerRoleId]

  return (
    <div className={cn('rounded-2xl border p-4 space-y-3 animate-fade-in', style.border, style.bg, className)}>
      <div className="flex items-center gap-3">
        <IconByKey name={award.icon} size={28} className={style.text} />
        <div>
          <h3 className={cn('font-bold', style.text)}>{award.name}</h3>
          <p className="text-xs text-muted-foreground">{award.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconByKey name={role.icon} size={18} className={role.colorClass} />
        <div>
          <p className="font-semibold text-sm">{award.playerName}</p>
          <p className={cn('text-xs', role.colorClass)}>{role.name}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">{award.reason}</p>
    </div>
  )
}
