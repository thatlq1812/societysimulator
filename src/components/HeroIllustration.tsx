export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background grid lines */}
      <g stroke="hsl(0 0% 20%)" strokeWidth="0.5" opacity="0.3">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 37.5} x2="400" y2={i * 37.5} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" />
        ))}
      </g>

      {/* Connection lines between nodes */}
      <g stroke="hsl(0 85% 50%)" strokeWidth="1" opacity="0.25">
        <line x1="120" y1="80" x2="200" y2="150" />
        <line x1="280" y1="80" x2="200" y2="150" />
        <line x1="120" y1="80" x2="280" y2="80" />
        <line x1="200" y1="150" x2="100" y2="220" />
        <line x1="200" y1="150" x2="300" y2="220" />
        <line x1="100" y1="220" x2="300" y2="220" />
        <line x1="60" y1="150" x2="120" y2="80" />
        <line x1="60" y1="150" x2="100" y2="220" />
        <line x1="340" y1="150" x2="280" y2="80" />
        <line x1="340" y1="150" x2="300" y2="220" />
      </g>

      {/* Accent connection lines */}
      <g stroke="hsl(45 100% 55%)" strokeWidth="1.5" opacity="0.35">
        <line x1="120" y1="80" x2="200" y2="150" />
        <line x1="200" y1="150" x2="300" y2="220" />
        <line x1="60" y1="150" x2="340" y2="150" />
      </g>

      {/* Outer glow rings */}
      <circle cx="200" cy="150" r="40" stroke="hsl(0 85% 50%)" strokeWidth="1" opacity="0.15" />
      <circle cx="200" cy="150" r="70" stroke="hsl(0 85% 50%)" strokeWidth="0.5" opacity="0.08" />
      <circle cx="200" cy="150" r="100" stroke="hsl(45 100% 55%)" strokeWidth="0.5" opacity="0.05" />

      {/* Society nodes — 4 classes */}
      {/* Worker - blue */}
      <circle cx="120" cy="80" r="14" fill="hsl(217 91% 60%)" opacity="0.9" />
      <circle cx="120" cy="80" r="20" stroke="hsl(217 91% 60%)" strokeWidth="1" opacity="0.3" />

      {/* Farmer - emerald */}
      <circle cx="100" cy="220" r="14" fill="hsl(160 60% 45%)" opacity="0.9" />
      <circle cx="100" cy="220" r="20" stroke="hsl(160 60% 45%)" strokeWidth="1" opacity="0.3" />

      {/* Intellectual - violet */}
      <circle cx="280" cy="80" r="14" fill="hsl(263 70% 60%)" opacity="0.9" />
      <circle cx="280" cy="80" r="20" stroke="hsl(263 70% 60%)" strokeWidth="1" opacity="0.3" />

      {/* Startup - amber */}
      <circle cx="300" cy="220" r="14" fill="hsl(38 92% 50%)" opacity="0.9" />
      <circle cx="300" cy="220" r="20" stroke="hsl(38 92% 50%)" strokeWidth="1" opacity="0.3" />

      {/* Center node — Alliance */}
      <circle cx="200" cy="150" r="18" fill="hsl(0 85% 50%)" opacity="0.95" />
      <circle cx="200" cy="150" r="10" fill="hsl(45 100% 55%)" opacity="0.8" />

      {/* Secondary nodes */}
      <circle cx="60" cy="150" r="8" fill="hsl(0 0% 30%)" opacity="0.6" />
      <circle cx="340" cy="150" r="8" fill="hsl(0 0% 30%)" opacity="0.6" />

      {/* Pulse effect on center */}
      <circle cx="200" cy="150" r="25" stroke="hsl(0 85% 50%)" strokeWidth="2" opacity="0.2">
        <animate attributeName="r" values="25;35;25" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
