'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GamepadIcon } from '@/components/icons'
import { Navbar } from '@/components/Navbar'
import type { CreateRoomResponse } from '@/types/game'

export default function HostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createRoom() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/room/create', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create room')
      const data: CreateRoomResponse = await res.json()
      sessionStorage.setItem(`host-secret-${data.pin}`, data.hostSecret)
      router.push(`/host/${data.pin}`)
    } catch {
      setError('Không thể tạo phòng. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-violet-500/4 rounded-full blur-3xl animate-pulse-soft" />
        {/* Floating dots */}
        <div className="absolute top-[15%] left-[8%] w-2 h-2 rounded-full bg-primary/15 animate-float-slow" />
        <div className="absolute top-[25%] right-[12%] w-1.5 h-1.5 rounded-full bg-blue-500/15 animate-float-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[20%] left-[15%] w-1 h-1 rounded-full bg-violet-500/15 animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[60%] right-[6%] w-2.5 h-2.5 rounded-full bg-emerald-500/10 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[35%] right-[25%] w-1 h-1 rounded-full bg-amber-500/10 animate-float-slow" style={{ animationDelay: '4s' }} />
        {/* Corner accents */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/10 rounded-tl-xl" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/10 rounded-br-xl" />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-8 relative z-10 overflow-hidden">
        <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Hero image (desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 items-center">
            <div className="relative w-full aspect-[4/3] max-w-lg mx-auto rounded-2xl overflow-hidden border-2 border-primary/10 shadow-xl hover-lift">
              <img src="/images/hero-network.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary/80 to-transparent">
                <p className="text-xl font-bold text-white drop-shadow-md">Bảng điều khiển Host</p>
                <p className="text-sm text-white/80 mt-1 drop-shadow-sm">Tạo phòng và điều khiển trò chơi</p>
              </div>
            </div>
            {/* Decorative image strip */}
            <div className="flex gap-3 overflow-hidden w-full max-w-lg">
              {['/images/role-worker.png', '/images/role-farmer.png', '/images/role-intellectual.png', '/images/role-startup.png'].map((src, i) => (
                <div key={i} className="w-1/4 aspect-square rounded-xl overflow-hidden border border-border shadow-md opacity-70 hover:opacity-100 transition-all duration-300 hover-lift hover:shadow-lg" style={{ animationDelay: `${i * 100}ms` }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div className="w-full max-w-md mx-auto space-y-8 text-center animate-slide-up">
            <div>
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-float">
                <GamepadIcon size={40} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Digital Society Simulator</h1>
              <p className="text-muted-foreground mt-2">Bảng điều khiển Giảng viên / Host</p>
              <div className="decorative-line mt-4" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-left space-y-3 hover-lift">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">?</span>
                Hướng dẫn
              </h2>
              <ol className="text-sm text-muted-foreground space-y-2.5 list-none">
                {[
                  'Tạo phòng → nhận PIN + QR code',
                  'Mở /screen/[PIN] trên màn hình chiếu',
                  'Sinh viên quét QR → nhập tên → vào game',
                  'Bắt đầu game khi đủ người',
                  'Điều khiển từng tình huống từ bảng host',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 animate-stagger-in" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <span dangerouslySetInnerHTML={{ __html: text.replace(/\/screen\/\[PIN\]/, '<strong class="text-foreground">/screen/[PIN]</strong>') }} />
                  </li>
                ))}
              </ol>
            </div>

            {/* Mobile: show a small decorative image */}
            <div className="lg:hidden">
              <img src="/images/theme-digital-society.png" alt="" className="w-24 h-24 rounded-xl mx-auto opacity-60 border border-border" />
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={createRoom}
                disabled={loading}
                className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 hover-lift shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Đang tạo phòng...
                  </span>
                ) : '+ Tạo phòng mới'}
              </button>

              {/* View existing room */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">hoặc</span></div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const viewPin = String(formData.get('viewPin') ?? '').trim().toUpperCase()
                  if (viewPin) router.push(`/host/${viewPin}`)
                }}
                className="flex gap-2"
              >
                <input
                  name="viewPin"
                  placeholder="Nhập PIN để xem phòng"
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-mono tracking-widest text-center placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-muted transition-all hover-lift"
                >
                  Xem →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
