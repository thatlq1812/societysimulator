import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FramedImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  frameClassName?: string
  variant?: 'banner' | 'card' | 'hero'
}

const frameStyles = {
  banner: 'rounded-t-2xl border-b-2 border-primary/20',
  card: 'rounded-xl border-2 border-border shadow-md',
  hero: 'rounded-2xl border-2 border-primary/20 shadow-lg shadow-primary/5',
}

export function FramedImage({ src, alt, fill = true, className, frameClassName, variant = 'banner' }: FramedImageProps) {
  return (
    <div className={cn('relative overflow-hidden', frameStyles[variant], frameClassName)}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={cn('object-cover', className)}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/70" />
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[inherit]" />
    </div>
  )
}
