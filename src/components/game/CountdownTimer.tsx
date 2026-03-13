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
  const circumference = 2 * Math.PI * 54 // r=54

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative">
        <svg viewBox="0 0 120 120" className="w-24 h-24">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={urgent ? '#f87171' : warning ? '#fbbf24' : 'hsl(var(--primary))'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            transform="rotate(-90 60 60)"
            className="transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-3xl font-bold tabular-nums', urgent ? 'text-red-400 animate-pulse' : warning ? 'text-amber-400' : 'text-primary')}>
            {remaining}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">giây còn lại</p>
    </div>
  )
}
