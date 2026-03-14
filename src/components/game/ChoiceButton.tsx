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
    A: 'text-amber-700 border-amber-300 bg-amber-50',
    B: 'text-emerald-700 border-emerald-300 bg-emerald-50',
    C: 'text-blue-700 border-blue-300 bg-blue-50',
  }

  const selectedBorder: Record<ChoiceId, string> = {
    A: 'border-amber-500 ring-2 ring-amber-200',
    B: 'border-emerald-500 ring-2 ring-emerald-200',
    C: 'border-blue-500 ring-2 ring-blue-200',
  }

  return (
    <button
      onClick={() => !disabled && onClick(choice.id)}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-xl border p-5 transition-all duration-200 group hover:scale-[1.01]',
        'bg-card hover:bg-card/80 active:scale-[0.98]',
        selected ? selectedBorder[choice.id] : 'border-border hover:border-border/80',
        disabled && !selected && 'opacity-50 cursor-not-allowed',
        submitted && selected && 'opacity-90',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-bold',
            labelColors[choice.id],
          )}
        >
          {choice.id}
        </span>
        <div className="flex-1">
          <span className="text-base text-foreground/90 leading-relaxed">{choice.text}</span>
          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
            {choice.effects.allianceDelta !== 0 && (
              <span className={choice.effects.allianceDelta > 0 ? 'text-emerald-600' : 'text-red-500'}>
                LM {choice.effects.allianceDelta > 0 ? '+' : ''}{choice.effects.allianceDelta}
              </span>
            )}
            {choice.effects.stratificationDelta !== 0 && (
              <span className={choice.effects.stratificationDelta < 0 ? 'text-emerald-600' : 'text-red-500'}>
                PH {choice.effects.stratificationDelta > 0 ? '+' : ''}{choice.effects.stratificationDelta}
              </span>
            )}
            {choice.effects.innovationDelta !== 0 && (
              <span className={choice.effects.innovationDelta > 0 ? 'text-violet-600' : 'text-red-500'}>
                ĐM {choice.effects.innovationDelta > 0 ? '+' : ''}{choice.effects.innovationDelta}
              </span>
            )}
            {choice.effects.welfareDelta !== 0 && (
              <span className={choice.effects.welfareDelta > 0 ? 'text-pink-500' : 'text-red-500'}>
                PL {choice.effects.welfareDelta > 0 ? '+' : ''}{choice.effects.welfareDelta}
              </span>
            )}
            {choice.effects.democracyDelta !== 0 && (
              <span className={choice.effects.democracyDelta > 0 ? 'text-cyan-600' : 'text-red-500'}>
                DC {choice.effects.democracyDelta > 0 ? '+' : ''}{choice.effects.democracyDelta}
              </span>
            )}
          </div>
        </div>
      </div>
      {submitted && selected && (
        <div className="mt-2 ml-10 flex items-center gap-1 text-xs text-muted-foreground">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>
          Đã chọn
        </div>
      )}
    </button>
  )
}
