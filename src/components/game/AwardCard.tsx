import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import { IconByKey } from '@/components/icons'
import { AWARD_IMAGE_MAP } from '@/lib/image-maps'
import type { Award } from '@/types/game'

interface AwardCardProps {
  award: Award
  index?: number
  className?: string
}

const AWARD_STYLES: Record<string, { border: string; bg: string; text: string; accent: string; neon1: string; neon2: string }> = {
  'ngon-co':       { border: 'border-yellow-400/50', bg: 'bg-gradient-to-b from-yellow-950/90 via-amber-950/70 to-yellow-950/90', text: 'text-yellow-300', accent: 'from-yellow-500 to-amber-500', neon1: '#eab308', neon2: '#f59e0b' },
  'ke-sinh-ton':   { border: 'border-emerald-400/50', bg: 'bg-gradient-to-b from-emerald-950/90 via-green-950/70 to-emerald-950/90', text: 'text-emerald-300', accent: 'from-emerald-500 to-teal-500', neon1: '#10b981', neon2: '#14b8a6' },
  'mat-xich':      { border: 'border-orange-400/50', bg: 'bg-gradient-to-b from-orange-950/90 via-red-950/70 to-orange-950/90', text: 'text-orange-300', accent: 'from-orange-500 to-red-500', neon1: '#f97316', neon2: '#ef4444' },
  'nha-cach-tan':  { border: 'border-violet-400/50', bg: 'bg-gradient-to-b from-violet-950/90 via-purple-950/70 to-violet-950/90', text: 'text-violet-300', accent: 'from-violet-500 to-purple-500', neon1: '#8b5cf6', neon2: '#a855f7' },
  'la-chan-xa-hoi': { border: 'border-cyan-400/50', bg: 'bg-gradient-to-b from-cyan-950/90 via-sky-950/70 to-cyan-950/90', text: 'text-cyan-300', accent: 'from-cyan-500 to-blue-500', neon1: '#06b6d4', neon2: '#3b82f6' },
}

// Generate sparkle positions deterministically
const SPARKLES = Array.from({ length: 20 }, (_, i) => ({
  top: `${5 + ((i * 37) % 85)}%`,
  left: `${3 + ((i * 53) % 90)}%`,
  size: i % 3 === 0 ? 'w-1 h-1' : 'w-0.5 h-0.5',
  opacity: i % 4 === 0 ? 'bg-white/80' : i % 3 === 0 ? 'bg-white/60' : 'bg-white/40',
  delay: `${(i * 0.31) % 2.5}s`,
}))

export function AwardCard({ award, index = 0, className }: AwardCardProps) {
  const style = AWARD_STYLES[award.id] ?? AWARD_STYLES['ngon-co']
  const role = ROLES[award.playerRoleId]
  const awardImage = AWARD_IMAGE_MAP[award.id]

  return (
    <div
      className={cn('relative animate-card-reveal', className)}
      style={{
        animationDelay: `${index * 200}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Neon glow wrapper — sits behind the card */}
      <div
        className="award-neon rounded-2xl"
        style={{
          '--neon-color-1': style.neon1,
          '--neon-color-2': style.neon2,
        } as React.CSSProperties}
      >
        <div
          className={cn(
            'relative rounded-2xl border overflow-hidden transition-all duration-500 hover:scale-[1.03]',
            style.border, style.bg,
          )}
        >
          {/* Always-on shimmer sweep */}
          <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]" />

          {/* Mass sparkle particles — always active */}
          {SPARKLES.map((s, i) => (
            <div
              key={i}
              className={cn('absolute rounded-full animate-sparkle z-20 pointer-events-none', s.size, s.opacity)}
              style={{ top: s.top, left: s.left, animationDelay: s.delay }}
            />
          ))}

          {/* Card image */}
          {awardImage && (
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <img
                src={awardImage}
                alt={award.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            </div>
          )}

          {/* Fallback icon when no image */}
          {!awardImage && (
            <div className="w-full aspect-[3/4] flex items-center justify-center relative">
              <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner', style.accent)}>
                <IconByKey name={award.icon} size={36} className="text-white drop-shadow-md" />
              </div>
            </div>
          )}

          {/* Card content — vertical: award name → icon → player name */}
          <div className="relative px-3 py-3 flex flex-col items-center gap-1.5 text-center">
            <h3 className={cn('font-bold text-[10px] leading-tight tracking-widest uppercase whitespace-nowrap', style.text)}>{award.name}</h3>
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-md animate-pulse-soft', style.accent)}>
              <IconByKey name={role.icon} size={14} className="text-white drop-shadow" />
            </div>
            <p className="font-bold text-[10px] text-white/95 truncate max-w-full uppercase tracking-wider">{award.playerName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
