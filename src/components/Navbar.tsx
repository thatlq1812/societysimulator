'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GlobeIcon, ArrowLeftIcon } from '@/components/icons'

interface NavbarProps {
  pin?: string
  showBack?: boolean
}

export function Navbar({ pin, showBack = true }: NavbarProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && !isHome && (
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon size={14} />
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2">
            <GlobeIcon size={18} className="text-primary" />
            <span className="font-bold text-sm">Society Simulator</span>
          </Link>
        </div>

        {pin && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            PIN: <span className="font-bold text-primary tracking-widest">{pin}</span>
          </div>
        )}
      </div>
    </nav>
  )
}
