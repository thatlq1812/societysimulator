interface QRDisplayProps {
  qrDataUrl: string
  joinUrl: string
  pin: string
}

export function QRDisplay({ qrDataUrl, joinUrl, pin }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="rounded-2xl overflow-hidden border-2 border-primary/20 p-3 bg-white shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-5xl font-bold tracking-[0.3em] text-accent">{pin}</p>
        <p className="text-sm text-muted-foreground">{joinUrl}</p>
      </div>
    </div>
  )
}
