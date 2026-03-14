'use client'

import { useEffect, useState } from 'react'

interface SocialNewsBannerProps {
  text: string
}

export function SocialNewsBanner({ text }: SocialNewsBannerProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 18)
    return () => clearInterval(id)
  }, [text])

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/30">
      {/* Header bar — news style */}
      <div className="bg-primary px-4 py-1.5 flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          Bản tin Xã hội Số
        </span>
      </div>

      {/* Content area */}
      <div className="p-4 bg-card">
        <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {displayed}
          {!done && <span className="typewriter-cursor" />}
        </div>
      </div>

      {/* Bottom ticker */}
      {done && (
        <div className="border-t border-primary/20 bg-primary/5 py-1 overflow-hidden">
          <div className="animate-ticker whitespace-nowrap text-xs text-primary font-medium px-4">
            Digital Society Simulator — Nhóm 4 · GD1812 · Half 2 · Spring 2026 — MLN131 Đại học FPT — Thanh niên Việt Nam trong cơ cấu xã hội — Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa
          </div>
        </div>
      )}
    </div>
  )
}
