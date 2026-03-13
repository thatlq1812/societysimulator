import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function getRoleColor(roleId: string): string {
  const colors: Record<string, string> = {
    'cong-nhan': '#60a5fa',   // blue-400
    'nong-dan': '#34d399',    // emerald-400
    'tri-thuc': '#a78bfa',    // violet-400
    'startup': '#fbbf24',     // amber-400
  }
  return colors[roleId] ?? '#94a3b8'
}
