'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  startedAt: number
  duration?: number  // seconds, default 30
  onExpire?: () => void
  className?: string
}

export function CountdownTimer({ startedAt, duration = 30, onExpire, className }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(duration)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const left = Math.max(0, duration - elapsed)
      setRemaining(left)
      if (left === 0) onExpireRef.current?.()
    }

    tick() // immediate update
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [startedAt, duration])

  const pct = remaining / duration
  const urgent = remaining <= 5
  const warning = remaining <= 10

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'text-5xl font-bold tabular-nums transition-colors duration-300',
          urgent ? 'text-red-400 animate-pulse' : warning ? 'text-amber-400' : 'text-primary',
        )}
      >
        {remaining}
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            urgent ? 'bg-red-500' : warning ? 'bg-amber-500' : 'bg-primary',
          )}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">giây còn lại</p>
    </div>
  )
}
