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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Hero image (desktop only) */}
          <div className="hidden lg:block">
            <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg">
              <img src="/images/hero-network.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-lg font-bold text-foreground">Bảng điều khiển Host</p>
                <p className="text-sm text-muted-foreground mt-1">Tạo phòng và điều khiển trò chơi</p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="w-full max-w-md mx-auto space-y-8 text-center animate-slide-up">
            <div>
              <GamepadIcon size={48} className="text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Digital Society Simulator</h1>
              <p className="text-muted-foreground mt-2">Bảng điều khiển Giảng viên / Host</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-left space-y-3">
              <h2 className="font-semibold">Hướng dẫn</h2>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Tạo phòng &rarr; nhận PIN + QR code</li>
                <li>Mở <strong className="text-foreground">/screen/[PIN]</strong> trên màn hình chiếu</li>
                <li>Sinh viên quét QR &rarr; nhập tên &rarr; vào game</li>
                <li>Bắt đầu game khi đủ người</li>
                <li>Điều khiển từng tình huống từ bảng host</li>
              </ol>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Đang tạo phòng...' : '+ Tạo phòng mới'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
