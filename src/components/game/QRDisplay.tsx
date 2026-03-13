interface QRDisplayProps {
  qrDataUrl: string
  joinUrl: string
  pin: string
}

export function QRDisplay({ qrDataUrl, joinUrl, pin }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl overflow-hidden border border-border p-2 bg-[#0d0d0d]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-4xl font-bold tracking-[0.3em] text-accent">{pin}</p>
        <p className="text-xs text-muted-foreground">{joinUrl}</p>
      </div>
    </div>
  )
}
