import { cn } from '@/lib/utils'
import type { Scenario } from '@/types/game'

interface ScenarioCardProps {
  scenario: Scenario
  scenarioNumber: number
  totalScenarios?: number
  className?: string
}

export function ScenarioCard({ scenario, scenarioNumber, totalScenarios = 6, className }: ScenarioCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          Tình huống {scenarioNumber}/{totalScenarios}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalScenarios }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i < scenarioNumber ? 'bg-primary' : i === scenarioNumber - 1 ? 'bg-primary animate-pulse' : 'bg-muted',
              )}
            />
          ))}
        </div>
      </div>
      <h2 className="text-lg font-bold text-foreground">{scenario.title}</h2>
      <p className="text-sm text-foreground/80 leading-relaxed">{scenario.context}</p>
    </div>
  )
}
