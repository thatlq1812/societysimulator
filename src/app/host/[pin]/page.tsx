'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { QRDisplay } from '@/components/game/QRDisplay'
import { PlayerRoster } from '@/components/game/PlayerRoster'
import { BrainIcon } from '@/components/icons'
import type { RoomStatePublic, CreateRoomResponse } from '@/types/game'

export default function HostControlPage() {
  const params = useParams()
  const pin = String(params.pin).toUpperCase()

  const [state, setState] = useState<RoomStatePublic | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [joinUrl, setJoinUrl] = useState('')
  const [hostSecret, setHostSecret] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Get host secret from sessionStorage
  useEffect(() => {
    const secret = sessionStorage.getItem(`host-secret-${pin}`)
    if (secret) setHostSecret(secret)
  }, [pin])

  // Regenerate QR from existing room
  useEffect(() => {
    async function fetchQR() {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const url = `${appUrl}/join?pin=${pin}`
      setJoinUrl(url)
      // Generate QR via canvas-less approach — just show URL + PIN
      try {
        const QRCode = (await import('qrcode')).default
        const dataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: { dark: '#ffffff', light: '#0d0d0d' },
        })
        setQrDataUrl(dataUrl)
      } catch {
        setQrDataUrl('')
      }
    }
    fetchQR()
  }, [pin])

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${pin}/state`)
      if (res.ok) setState(await res.json())
    } catch { /* ignore */ }
  }, [pin])

  useEffect(() => {
    fetchState()
    const id = setInterval(fetchState, 2000)
    return () => clearInterval(id)
  }, [fetchState])

  async function advance(action: 'start-game' | 'end-scenario' | 'next-scenario') {
    if (!hostSecret || actionLoading) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/room/${pin}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostSecret, action }),
      })
      if (res.ok) {
        await fetchState()
        setMessage('')
      } else {
        const d = await res.json()
        setMessage(d.error ?? 'Lỗi')
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function generateAI() {
    if (!hostSecret || actionLoading) return
    setActionLoading(true)
    setMessage('AI đang tổng hợp...')
    try {
      const res = await fetch(`/api/room/${pin}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostSecret }),
      })
      if (res.ok) {
        await fetchState()
        setMessage('Xong!')
      } else {
        setMessage('AI generation thất bại')
      }
    } finally {
      setActionLoading(false)
    }
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const scenario = state.currentScenario ?? null
  const isLastScenario = state.currentScenarioIndex >= (state.totalScenarios ?? 6) - 1

  return (
    <div className="min-h-screen p-4 space-y-5 max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Host Control</h1>
          <p className="text-sm text-muted-foreground">
            PIN: <span className="font-bold text-primary">{pin}</span> · Phase: <span className="text-amber-400">{state.phase}</span>
          </p>
        </div>
        <a
          href={`/screen/${pin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
        >
          Màn hình chiếu ↗
        </a>
      </div>

      {/* QR + players */}
      {state.phase === 'lobby' && (
        <div className="grid grid-cols-[auto_1fr] gap-5 items-start">
          {qrDataUrl && <QRDisplay qrDataUrl={qrDataUrl} joinUrl={joinUrl} pin={pin} />}
          <div className="space-y-3">
            <p className="text-sm font-medium">{state.playerCount} người đã tham gia</p>
            <PlayerRoster players={state.players} />
          </div>
        </div>
      )}

      {/* Scenario info */}
      {scenario && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground">Tình huống {state.currentScenarioIndex + 1}/{state.totalScenarios}</p>
          <p className="font-bold">{scenario.title}</p>
          {state.phase === 'playing' && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Đã vote</p>
                <p className="font-bold text-emerald-400">{state.voteCount ?? 0}/{state.playerCount}</p>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: state.playerCount > 0 ? `${((state.voteCount ?? 0) / state.playerCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}
          {state.phase === 'between' && (
            <div className="text-sm space-y-1 pt-2 border-t border-border">
              <p>Liên minh: <span className="text-emerald-400 font-bold">{Math.round(state.macro.alliance)}</span></p>
              <p>Phân hóa: <span className="text-amber-400 font-bold">{Math.round(state.macro.stratification)}</span></p>
              <p>Lực lượng SX: <span className="text-blue-400 font-bold">{Math.round(state.macro.production)}</span></p>
              {state.lastBreakdown && (
                <p className="pt-1 text-muted-foreground">
                  A: {state.lastBreakdown.A} · B: {state.lastBreakdown.B} · C: {state.lastBreakdown.C}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {state.phase === 'lobby' && (
          <button
            onClick={() => advance('start-game')}
            disabled={actionLoading || state.playerCount === 0}
            className="w-full rounded-xl bg-emerald-600 py-4 font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {actionLoading ? '...' : `▶ Bắt đầu Game (${state.playerCount} người)`}
          </button>
        )}

        {state.phase === 'playing' && (
          <button
            onClick={() => advance('end-scenario')}
            disabled={actionLoading}
            className="w-full rounded-xl bg-amber-600 py-4 font-bold text-white transition-all hover:bg-amber-500 disabled:opacity-50"
          >
            {actionLoading ? '...' : '⏹ Kết thúc tình huống'}
          </button>
        )}

        {state.phase === 'between' && (
          <button
            onClick={() => advance('next-scenario')}
            disabled={actionLoading}
            className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {actionLoading ? '...' : isLastScenario ? '→ Kết thúc Game' : '→ Tình huống tiếp theo'}
          </button>
        )}

        {state.phase === 'ai-generating' && (
          <button
            onClick={generateAI}
            disabled={actionLoading}
            className="w-full rounded-xl bg-violet-600 py-4 font-bold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
          >
            {actionLoading ? <><BrainIcon size={16} className="text-white inline-block mr-1" /> AI đang tổng hợp...</> : <><BrainIcon size={16} className="text-white inline-block mr-1" /> Tạo Bản tin AI</>}
          </button>
        )}

        {state.phase === 'results' && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-center text-emerald-400 font-medium">
            ✓ Game hoàn thành — Xem kết quả trên màn hình chiếu
          </div>
        )}
      </div>

      {message && (
        <p className="text-center text-sm text-muted-foreground">{message}</p>
      )}

      {/* AI Trend — Tier 2 (host only) */}
      {state.phase === 'between' && state.aiTrend && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <BrainIcon size={16} className="text-violet-400" />
            <p className="text-xs text-violet-400 uppercase tracking-widest font-medium">Phân tích xu hướng AI</p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{state.aiTrend}</p>
        </div>
      )}

      {/* Macro readout */}
      <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-emerald-400">{Math.round(state.macro.alliance)}</p>
          <p className="text-xs text-muted-foreground">Liên minh</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-400">{Math.round(state.macro.stratification)}</p>
          <p className="text-xs text-muted-foreground">Phân hóa</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-400">{Math.round(state.macro.production)}</p>
          <p className="text-xs text-muted-foreground">SX Quốc gia</p>
        </div>
      </div>
    </div>
  )
}
