import { cn } from '@/lib/utils'
import { FramedImage } from '@/components/game/FramedImage'
import { SCENARIO_IMAGE_MAP } from '@/lib/image-maps'
import type { Scenario } from '@/types/game'

interface ScenarioCardProps {
  scenario: Scenario
  scenarioNumber: number
  totalScenarios?: number
  className?: string
}

export function ScenarioCard({ scenario, scenarioNumber, totalScenarios = 10, className }: ScenarioCardProps) {
  const imageSrc = SCENARIO_IMAGE_MAP[scenario.id]

  return (
    <div className={cn('rounded-2xl border border-border bg-card overflow-hidden animate-phase-enter', className)}>
      {/* Scenario image */}
      {imageSrc && (
        <FramedImage src={imageSrc} alt={scenario.title} variant="banner" frameClassName="h-40" />
      )}

      <div className="p-6 space-y-3">
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
        <h2 className="text-xl font-bold text-foreground">{scenario.title}</h2>
        <p className="text-base text-foreground/80 leading-relaxed">{scenario.context}</p>
      </div>
    </div>
  )
}
