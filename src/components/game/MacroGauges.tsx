import { cn } from '@/lib/utils'

interface MacroGaugesProps {
  alliance: number
  stratification: number
  production: number
}

interface GaugeProps {
  label: string
  value: number
  color: string
  inverse?: boolean  // higher is worse
}

function Gauge({ label, value, color, inverse }: GaugeProps) {
  const pct = Math.round(value)
  const danger = inverse ? value > 60 : value < 40
  const warning = inverse ? value > 40 : value < 60

  return (
    <div className="space-y-3 text-center">
      <div className={cn('projection-value transition-colors duration-700', danger ? 'text-red-600' : warning ? 'text-amber-600' : 'text-emerald-600')}>
        {pct}
      </div>
      <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="projection-label">{label}</div>
    </div>
  )
}

export function MacroGauges({ alliance, stratification, production }: MacroGaugesProps) {
  return (
    <div className="grid grid-cols-3 gap-8">
      <Gauge
        label="Chỉ số Liên minh"
        value={alliance}
        color="#34d399"
      />
      <Gauge
        label="Chỉ số Phân hóa"
        value={stratification}
        color="#f59e0b"
        inverse
      />
      <Gauge
        label="Lực lượng Sản xuất"
        value={production}
        color="#60a5fa"
      />
    </div>
  )
}
