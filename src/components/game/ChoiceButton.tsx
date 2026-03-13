'use client'

import { cn } from '@/lib/utils'
import type { Choice, ChoiceId } from '@/types/game'

interface ChoiceButtonProps {
  choice: Choice
  selected: boolean
  disabled?: boolean
  submitted?: boolean
  onClick: (id: ChoiceId) => void
}

export function ChoiceButton({ choice, selected, disabled, submitted, onClick }: ChoiceButtonProps) {
  const labelColors: Record<ChoiceId, string> = {
    A: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
    B: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
    C: 'text-blue-400 border-blue-500/40 bg-blue-950/30',
  }

  const selectedBorder: Record<ChoiceId, string> = {
    A: 'border-amber-400 ring-2 ring-amber-400/30',
    B: 'border-emerald-400 ring-2 ring-emerald-400/30',
    C: 'border-blue-400 ring-2 ring-blue-400/30',
  }

  return (
    <button
      onClick={() => !disabled && onClick(choice.id)}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all duration-200 group',
        'bg-card hover:bg-card/80 active:scale-[0.98]',
        selected ? selectedBorder[choice.id] : 'border-border hover:border-border/80',
        disabled && !selected && 'opacity-50 cursor-not-allowed',
        submitted && selected && 'opacity-90',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold',
            labelColors[choice.id],
          )}
        >
          {choice.id}
        </span>
        <span className="text-sm text-foreground/90 leading-relaxed">{choice.text}</span>
      </div>
      {submitted && selected && (
        <p className="mt-2 ml-10 text-xs text-muted-foreground">✓ Đã chọn</p>
      )}
    </button>
  )
}
