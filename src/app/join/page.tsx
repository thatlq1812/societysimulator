'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GlobeIcon } from '@/components/icons'
import { Navbar } from '@/components/Navbar'
import { usePlayerStore } from '@/stores/player-store'
import { playSound } from '@/lib/sounds'
import type { JoinResponse } from '@/types/game'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pin, setPin] = useState(searchParams.get('pin') ?? '')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setPlayer } = usePlayerStore()

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/room/${pin.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Không thể tham gia. Kiểm tra mã PIN.')
        return
      }
      const data: JoinResponse = await res.json()
      setPlayer({ playerId: data.playerId, pin: pin.trim().toUpperCase(), roleId: data.roleId, playerName: name.trim() })
      playSound('join-room')
      router.push(`/play/${pin.trim().toUpperCase()}`)
    } catch {
      setError('Lỗi kết nối. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[10%] w-60 h-60 bg-violet-500/4 rounded-full blur-3xl animate-pulse-soft" />
        {/* Floating dots */}
        <div className="absolute top-[12%] right-[15%] w-2 h-2 rounded-full bg-primary/15 animate-float-slow" />
        <div className="absolute top-[30%] left-[5%] w-1.5 h-1.5 rounded-full bg-blue-500/15 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[25%] right-[8%] w-1 h-1 rounded-full bg-emerald-500/12 animate-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[65%] left-[20%] w-2 h-2 rounded-full bg-amber-500/10 animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[15%] left-[45%] w-1.5 h-1.5 rounded-full bg-violet-500/10 animate-float-slow" style={{ animationDelay: '4s' }} />
        {/* Corner accents */}
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/10 rounded-tr-xl" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/10 rounded-bl-xl" />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-8 relative z-10 overflow-hidden">
        <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Decorative image (desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 items-center">
            <div className="relative w-full aspect-[4/3] max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg hover-lift">
              <img src="/images/lobby-gathering.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary/80 to-transparent">
                <p className="text-lg font-bold text-white drop-shadow-md">Tham gia xã hội giả lập</p>
                <p className="text-sm text-white/80 mt-1 drop-shadow-sm">Quét QR hoặc nhập mã PIN để bắt đầu</p>
              </div>
            </div>
            {/* 4 role preview cards */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {[
                { src: '/images/role-worker.png', name: 'Công nhân' },
                { src: '/images/role-farmer.png', name: 'Nông dân' },
                { src: '/images/role-intellectual.png', name: 'Trí thức' },
                { src: '/images/role-startup.png', name: 'Startup' },
              ].map((role, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card/50 p-2 animate-stagger-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <img src={role.src} alt="" className="w-8 h-8 rounded-md object-cover" />
                  <span className="text-xs text-muted-foreground">{role.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full max-w-md mx-auto space-y-8 animate-slide-up">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3 animate-float">
                <GlobeIcon size={32} className="text-accent" />
              </div>
              <h1 className="text-2xl font-bold">Digital Society Simulator</h1>
              <p className="text-sm text-muted-foreground">MLN131 — FPT University</p>
              <div className="decorative-line mt-3" />
            </div>

            {/* Mobile: decorative role strip */}
            <div className="lg:hidden flex justify-center gap-2">
              {['/images/role-worker.png', '/images/role-farmer.png', '/images/role-intellectual.png', '/images/role-startup.png'].map((src, i) => (
                <img key={i} src={src} alt="" className="w-10 h-10 rounded-lg border border-border object-cover opacity-50" />
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  Mã PIN phòng
                </label>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: AB12CD"
                  maxLength={6}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-xl font-bold tracking-widest text-primary placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  Tên của bạn
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên..."
                  maxLength={30}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pin || !name.trim()}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover-lift shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Đang tham gia...
                  </span>
                ) : 'Vào game →'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Vai trò sẽ được phân bổ ngẫu nhiên sau khi tham gia
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  )
}
