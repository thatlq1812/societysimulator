'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { QRDisplay } from '@/components/game/QRDisplay'
import { PlayerRoster } from '@/components/game/PlayerRoster'
import { CountdownTimer } from '@/components/game/CountdownTimer'
import { BrainIcon } from '@/components/icons'
import { MacroCharts } from '@/components/game/MacroCharts'
import { getStratificationLevel } from '@/lib/stratification-theme'
import { cn } from '@/lib/utils'
import type { RoomStatePublic } from '@/types/game'

export default function HostControlPage() {
  const params = useParams()
  const pin = String(params.pin).toUpperCase()

  const [state, setState] = useState<RoomStatePublic | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [joinUrl, setJoinUrl] = useState('')
  const [hostSecret, setHostSecret] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [roomNotFound, setRoomNotFound] = useState(false)

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
          color: { dark: '#000000', light: '#ffffff' },
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
      if (res.status === 404) {
        setRoomNotFound(true)
        return
      }
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

  if (roomNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <BrainIcon size={40} className="text-destructive" />
          <h2 className="text-lg font-bold">Phòng không tồn tại</h2>
          <p className="text-sm text-muted-foreground">Mã PIN <span className="font-bold text-primary">{pin}</span> không hợp lệ hoặc đã hết hạn.</p>
          <a href="/host" className="inline-block rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground">
            Tạo phòng mới
          </a>
        </div>
      </div>
    )
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
  const stratLevel = getStratificationLevel(state.macro.stratification)

  return (
    <div className={cn('min-h-screen p-4 space-y-5 max-w-4xl mx-auto py-6', stratLevel === 'danger' && 'bg-red-50', stratLevel === 'warning' && 'bg-amber-50/50')}>
      <Navbar pin={pin} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Host Control</h1>
          <p className="text-sm text-muted-foreground">
            PIN: <span className="font-bold text-primary">{pin}</span> · Phase: <span className="text-amber-600">{state.phase}</span>
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
                <p className="font-bold text-emerald-600">{state.voteCount ?? 0}/{state.playerCount}</p>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: state.playerCount > 0 ? `${((state.voteCount ?? 0) / state.playerCount) * 100}%` : '0%' }}
                />
              </div>
              {state.scenarioStartedAt && (
                <CountdownTimer startedAt={state.scenarioStartedAt} duration={30} />
              )}
            </div>
          )}
          {state.phase === 'between' && (
            <div className="text-sm space-y-1 pt-2 border-t border-border">
              <p>Liên minh: <span className="text-emerald-600 font-bold">{Math.round(state.macro.alliance)}</span> · Phân hóa: <span className="text-amber-600 font-bold">{Math.round(state.macro.stratification)}</span> · SX: <span className="text-blue-600 font-bold">{Math.round(state.macro.production)}</span></p>
              <p>Đổi mới: <span className="text-violet-600 font-bold">{Math.round(state.macro.innovation)}</span> · Phúc lợi: <span className="text-pink-500 font-bold">{Math.round(state.macro.welfare)}</span> · Dân chủ: <span className="text-cyan-600 font-bold">{Math.round(state.macro.democracy)}</span></p>
              {state.lastBreakdown && (
                <div className="pt-1 space-y-1">
                  <p className="text-muted-foreground">
                    A: {state.lastBreakdown.A} · B: {state.lastBreakdown.B} · C: {state.lastBreakdown.C}
                  </p>
                  {state.roleBreakdown && state.roleBreakdown.length > 0 && (
                    <div className="text-xs space-y-0.5">
                      {state.roleBreakdown.map((rb) => (
                        <p key={rb.roleId} className="text-muted-foreground">
                          {rb.roleName}: {rb.A > 0 && <span className="text-amber-600">A:{rb.A} </span>}{rb.B > 0 && <span className="text-emerald-600">B:{rb.B} </span>}{rb.C > 0 && <span className="text-blue-600">C:{rb.C}</span>}
                        </p>
                      ))}
                    </div>
                  )}
                  {state.macroDelta && (
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs pt-1 border-t border-border/50">
                      {([
                        { key: 'alliance', label: 'LM' },
                        { key: 'stratification', label: 'PH' },
                        { key: 'production', label: 'SX' },
                        { key: 'innovation', label: 'ĐM' },
                        { key: 'welfare', label: 'PL' },
                        { key: 'democracy', label: 'DC' },
                      ] as const).map(({ key, label }) => {
                        const d = Math.round((state.macroDelta![key as keyof typeof state.macroDelta] ?? 0) * 10) / 10
                        if (d === 0) return null
                        return (
                          <span key={key} className={d > 0 ? 'text-emerald-600' : 'text-red-500'}>
                            {label} {d > 0 ? '+' : ''}{d.toFixed(1)}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
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
          <div className="w-full rounded-xl bg-violet-100 border border-violet-300 py-4 text-center text-violet-700 font-medium flex items-center justify-center gap-2">
            <BrainIcon size={16} className="text-violet-600 animate-pulse" />
            AI đang tự động tổng hợp Bản tin...
          </div>
        )}

        {state.phase === 'results' && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center text-emerald-600 font-medium">
            ✓ Game hoàn thành — Xem kết quả trên màn hình chiếu
          </div>
        )}
      </div>

      {message && (
        <p className="text-center text-sm text-muted-foreground">{message}</p>
      )}

      {/* AI Trend — Tier 2 (host only) + AI Commentary */}
      {state.phase === 'between' && (state.aiTrend || state.aiCommentary) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {state.aiTrend && (
            <div className="rounded-2xl border border-violet-300 bg-violet-50 p-4 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <BrainIcon size={16} className="text-violet-600" />
                <p className="text-xs text-violet-600 uppercase tracking-widest font-medium">Phân tích xu hướng AI</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{state.aiTrend}</p>
            </div>
          )}
          {state.aiCommentary && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <BrainIcon size={16} className="text-primary" />
                <p className="text-xs text-primary uppercase tracking-widest font-medium">Bình luận AI</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{state.aiCommentary}</p>
            </div>
          )}
        </div>
      )}

      {/* Macro Charts */}
      {state.macro.history.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Diễn biến theo tình huống</p>
          <MacroCharts macro={state.macro} />
        </div>
      )}

      {/* Macro readout */}
      <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-3 lg:grid-cols-6 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-emerald-600">{Math.round(state.macro.alliance)}</p>
          <p className="text-xs text-muted-foreground">Liên minh</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-600">{Math.round(state.macro.stratification)}</p>
          <p className="text-xs text-muted-foreground">Phân hóa</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{Math.round(state.macro.production)}</p>
          <p className="text-xs text-muted-foreground">Sản xuất</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-violet-600">{Math.round(state.macro.innovation)}</p>
          <p className="text-xs text-muted-foreground">Đổi mới</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-pink-500">{Math.round(state.macro.welfare)}</p>
          <p className="text-xs text-muted-foreground">Phúc lợi</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-cyan-600">{Math.round(state.macro.democracy)}</p>
          <p className="text-xs text-muted-foreground">Dân chủ</p>
        </div>
      </div>
    </div>
  )
}
