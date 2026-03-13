'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      // Store host secret in sessionStorage, pass in URL hash
      sessionStorage.setItem(`host-secret-${data.pin}`, data.hostSecret)
      router.push(`/host/${data.pin}`)
    } catch {
      setError('Không thể tạo phòng. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center animate-slide-up">
        <div>
          <div className="text-5xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold">Digital Society Simulator</h1>
          <p className="text-muted-foreground mt-2">Bảng điều khiển Giảng viên / Host</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 text-left space-y-3">
          <h2 className="font-semibold">Hướng dẫn</h2>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Tạo phòng → nhận PIN + QR code</li>
            <li>Mở <strong className="text-foreground">/screen/[PIN]</strong> trên màn hình chiếu</li>
            <li>Sinh viên quét QR → nhập tên → vào game</li>
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
  )
}
