import { cn } from '@/lib/utils'

interface MacroGaugesProps {
  alliance: number
  stratification: number
  production: number
  innovation: number
  welfare: number
  democracy: number
  deltas?: {
    alliance: number
    stratification: number
    production: number
    innovation: number
    welfare: number
    democracy: number
  }
}

interface GaugeProps {
  label: string
  desc: string
  value: number
  color: string
  inverse?: boolean  // higher is worse
  delta?: number
}

function Gauge({ label, desc, value, color, inverse, delta }: GaugeProps) {
  const pct = Math.round(value)
  const danger = inverse ? value > 60 : value < 40
  const warning = inverse ? value > 40 : value < 60

  return (
    <div className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-1.5">
        <div className={cn('projection-value transition-colors duration-700', danger ? 'text-red-600' : warning ? 'text-amber-600' : 'text-emerald-600')}>
          {pct}
        </div>
        {delta !== undefined && delta !== 0 && (
          <span className={cn('text-sm font-bold tabular-nums animate-fade-in', delta > 0 ? 'text-emerald-500' : 'text-red-500')}>
            {delta > 0 ? '+' : ''}{Math.round(delta * 10) / 10}
          </span>
        )}
      </div>
      <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="projection-label">{label}</div>
      <p className="text-[10px] text-muted-foreground/60 leading-tight">{desc}</p>
    </div>
  )
}

export function MacroGauges({ alliance, stratification, production, innovation, welfare, democracy, deltas }: MacroGaugesProps) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
      <Gauge
        label="Liên minh"
        desc="Mức độ đoàn kết giữa các giai cấp"
        value={alliance}
        color="#34d399"
        delta={deltas?.alliance}
      />
      <Gauge
        label="Phân hóa"
        desc="Khoảng cách giàu-nghèo xã hội"
        value={stratification}
        color="#f59e0b"
        inverse
        delta={deltas?.stratification}
      />
      <Gauge
        label="Sản xuất"
        desc="Năng lực lực lượng sản xuất"
        value={production}
        color="#60a5fa"
        delta={deltas?.production}
      />
      <Gauge
        label="Đổi mới"
        desc="Trình độ sáng tạo & công nghệ"
        value={innovation}
        color="#8b5cf6"
        delta={deltas?.innovation}
      />
      <Gauge
        label="Phúc lợi"
        desc="An sinh xã hội & chất lượng sống"
        value={welfare}
        color="#f472b6"
        delta={deltas?.welfare}
      />
      <Gauge
        label="Dân chủ"
        desc="Mức độ tham gia quyết định tập thể"
        value={democracy}
        color="#06b6d4"
        delta={deltas?.democracy}
      />
    </div>
  )
}
