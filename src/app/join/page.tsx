'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GlobeIcon, ArrowLeftIcon } from '@/components/icons'
import { usePlayerStore } from '@/stores/player-store'
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
      router.push(`/play/${pin.trim().toUpperCase()}`)
    } catch {
      setError('Lỗi kết nối. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon size={16} /> Trang chủ
      </Link>
      <div className="w-full max-w-sm space-y-8 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <GlobeIcon size={40} className="text-accent mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Digital Society Simulator</h1>
          <p className="text-sm text-muted-foreground">MLN131 — FPT University</p>
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
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pin || !name.trim()}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tham gia...' : 'Vào game →'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Vai trò sẽ được phân bổ ngẫu nhiên sau khi tham gia
        </p>
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
