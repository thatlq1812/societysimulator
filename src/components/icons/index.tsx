import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
  size?: number
}

function Icon({ className, size = 24, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('inline-block flex-shrink-0', className)}
    >
      {children}
    </svg>
  )
}

// --- Role Icons ---

export function WorkerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Steering wheel / delivery */}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
    </Icon>
  )
}

export function FarmerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Wheat stalk */}
      <path d="M12 21V10" />
      <path d="M9 10c0-2.5 3-3 3-6" />
      <path d="M15 10c0-2.5-3-3-3-6" />
      <path d="M7 13c0-2 2.5-2.5 5-4" />
      <path d="M17 13c0-2-2.5-2.5-5-4" />
      <path d="M8 17c0-1.5 2-2 4-3" />
      <path d="M16 17c0-1.5-2-2-4-3" />
    </Icon>
  )
}

export function IntellectualIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Code brackets */}
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </Icon>
  )
}

export function StartupIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Rising rocket */}
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </Icon>
  )
}

// --- Award Icons ---

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Icon>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </Icon>
  )
}

export function WarningIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  )
}

// --- UI Icons ---

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Icon>
  )
}

export function GamepadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h4" />
      <path d="M8 10v4" />
      <circle cx="17" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function ChartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </Icon>
  )
}

export function BrainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" />
    </Icon>
  )
}

export function PlantIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 22V12" />
      <path d="M7 12c0-4 3-6 5-8 2 2 5 4 5 8" />
      <path d="M5 17c0-3 2.5-5 7-5" />
      <path d="M19 17c0-3-2.5-5-7-5" />
    </Icon>
  )
}

export function BoltIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" />
    </Icon>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Icon>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Icon>
  )
}

// --- Icon lookup by key ---

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  worker: WorkerIcon,
  farmer: FarmerIcon,
  intellectual: IntellectualIcon,
  startup: StartupIcon,
  trophy: TrophyIcon,
  shield: ShieldIcon,
  warning: WarningIcon,
  globe: GlobeIcon,
  gamepad: GamepadIcon,
  chart: ChartIcon,
  brain: BrainIcon,
  plant: PlantIcon,
  bolt: BoltIcon,
  star: StarIcon,
}

export function IconByKey({ name, ...props }: IconProps & { name: string }) {
  const Component = ICON_MAP[name]
  if (!Component) return null
  return <Component {...props} />
}
