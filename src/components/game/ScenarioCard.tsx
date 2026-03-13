import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SCENARIO_IMAGE_MAP } from '@/lib/image-maps'
import type { Scenario } from '@/types/game'

interface ScenarioCardProps {
  scenario: Scenario
  scenarioNumber: number
  totalScenarios?: number
  className?: string
}

export function ScenarioCard({ scenario, scenarioNumber, totalScenarios = 6, className }: ScenarioCardProps) {
  const imageSrc = SCENARIO_IMAGE_MAP[scenario.id]

  return (
    <div className={cn('rounded-2xl border border-border bg-card overflow-hidden', className)}>
      {/* Scenario image */}
      {imageSrc && (
        <div className="relative w-full h-32 overflow-hidden">
          <Image
            src={imageSrc}
            alt={scenario.title}
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card" />
        </div>
      )}

      <div className="p-5 space-y-3">
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
    </div>
  )
}
