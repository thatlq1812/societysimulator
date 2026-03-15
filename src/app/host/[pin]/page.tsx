'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { QRDisplay } from '@/components/game/QRDisplay'
import { PlayerRoster } from '@/components/game/PlayerRoster'
import { CountdownTimer } from '@/components/game/CountdownTimer'
import { BrainIcon } from '@/components/icons'
import { MacroCharts } from '@/components/game/MacroCharts'
import { SocialNewsBanner } from '@/components/game/SocialNewsBanner'
import { SCENARIO_IMAGE_MAP } from '@/lib/image-maps'
import { getStratificationLevel } from '@/lib/stratification-theme'
import { cn, stripMarkdown } from '@/lib/utils'
import { playSound } from '@/lib/sounds'
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
  const autoEndFiredRef = useRef(false)
  const prevPlayerCountRef = useRef(0)

  // Sound on new player join
  useEffect(() => {
    if (state && state.playerCount > prevPlayerCountRef.current && prevPlayerCountRef.current > 0) {
      playSound('player-joined')
    }
    if (state) prevPlayerCountRef.current = state.playerCount
  }, [state?.playerCount])

  // Auto-end scenario when timer expires
  const handleTimerExpire = useCallback(async () => {
    if (autoEndFiredRef.current) return
    const secret = sessionStorage.getItem(`host-secret-${pin}`)
    if (!secret) return
    autoEndFiredRef.current = true
    try {
      await fetch(`/api/room/${pin}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostSecret: secret, action: 'end-scenario' }),
      })
    } catch { /* ignore */ }
  }, [pin])

  // Reset auto-end flag when phase changes to playing
  useEffect(() => {
    if (state?.phase === 'playing') {
      autoEndFiredRef.current = false
    }
  }, [state?.phase, state?.currentScenarioIndex])

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
        if (action === 'start-game') playSound('scenario-start')
        else if (action === 'end-scenario') playSound('scenario-end')
        else if (action === 'next-scenario') playSound('phase-transition')
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
    <div className={cn('h-screen flex flex-col relative overflow-hidden', stratLevel === 'danger' && 'bg-red-50', stratLevel === 'warning' && 'bg-amber-50/50')}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-[15%] w-56 h-56 bg-blue-500/3 rounded-full blur-3xl animate-pulse-soft" />
        {/* Floating dots */}
        <div className="absolute top-[10%] left-[5%] w-2 h-2 rounded-full bg-primary/10 animate-float-slow" />
        <div className="absolute top-[20%] right-[8%] w-1.5 h-1.5 rounded-full bg-violet-500/10 animate-float-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[15%] left-[12%] w-1 h-1 rounded-full bg-emerald-500/8 animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[55%] right-[3%] w-2 h-2 rounded-full bg-amber-500/8 animate-float-slow" style={{ animationDelay: '2.5s' }} />
        <div className="absolute bottom-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-blue-500/8 animate-float-slow" style={{ animationDelay: '4s' }} />
        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-14 h-14 border-l border-t border-primary/8 rounded-tl-lg" />
        <div className="absolute bottom-4 right-4 w-14 h-14 border-r border-b border-primary/8 rounded-br-lg" />
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-y-auto px-6 py-3 w-full space-y-3">
        <Navbar pin={pin} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BrainIcon size={16} className="text-primary" />
              </span>
              Host Control
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              PIN: <span className="font-bold text-primary">{pin}</span> · <span className="text-amber-600 font-medium">{
                ({ lobby: 'Phòng chờ', playing: 'Đang chơi', between: 'Giữa tình huống', 'ai-generating': 'AI đang tổng hợp', results: 'Kết quả' } as Record<string, string>)[state.phase] ?? state.phase
              }</span>
            </p>
          </div>
          <a
            href={`/screen/${pin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium hover:bg-muted transition-all hover-lift shadow-sm"
          >
            Màn hình chiếu ↗
          </a>
        </div>

        {/* QR + players */}
        {state.phase === 'lobby' && (
          <div className="grid grid-cols-[auto_1fr] gap-5 items-start animate-fade-in">
            {qrDataUrl && <QRDisplay qrDataUrl={qrDataUrl} joinUrl={joinUrl} pin={pin} />}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                <p className="text-sm font-medium">{state.playerCount} người đã tham gia</p>
              </div>
              <PlayerRoster players={state.players} />
            </div>
          </div>
        )}

        {/* Scenario info — side-by-side with image */}
        {scenario && (state.phase === 'playing' || state.phase === 'between') && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 animate-fade-in">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Scenario header bar */}
              <div className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-violet-500/5 px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">Tình huống {state.currentScenarioIndex + 1}/{state.totalScenarios}</p>
                {state.phase === 'playing' && (
                  <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Đang diễn ra
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="font-bold">{scenario.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{scenario.context}</p>
                {state.phase === 'playing' && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Đã vote</p>
                      <p className="font-bold text-emerald-600 tabular-nums">{state.voteCount ?? 0}/{state.playerCount}</p>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: state.playerCount > 0 ? `${((state.voteCount ?? 0) / state.playerCount) * 100}%` : '0%' }}
                      />
                    </div>
                    {state.scenarioStartedAt && (
                      <CountdownTimer startedAt={state.scenarioStartedAt} duration={30} onExpire={handleTimerExpire} />
                    )}
                  </div>
                )}
              {state.phase === 'between' && (
                <div className="text-sm space-y-2 pt-2 border-t border-border">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Liên minh', value: state.macro.alliance, color: 'text-emerald-600' },
                      { label: 'Phân hóa', value: state.macro.stratification, color: 'text-amber-600' },
                      { label: 'Sản xuất', value: state.macro.production, color: 'text-blue-600' },
                      { label: 'Đổi mới', value: state.macro.innovation, color: 'text-violet-600' },
                      { label: 'Phúc lợi', value: state.macro.welfare, color: 'text-pink-600' },
                      { label: 'Dân chủ', value: state.macro.democracy, color: 'text-cyan-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center rounded-lg bg-muted/50 p-1.5">
                        <p className={cn(color, 'font-bold tabular-nums')}>{Math.round(value)}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  {state.lastBreakdown && (
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-medium">A: {state.lastBreakdown.A}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium">B: {state.lastBreakdown.B}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">C: {state.lastBreakdown.C}</span>
                      </div>
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
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs pt-1 border-t border-border/50">
                          {([
                            { key: 'alliance', label: 'Liên minh' },
                            { key: 'stratification', label: 'Phân hóa' },
                            { key: 'production', label: 'Sản xuất' },
                            { key: 'innovation', label: 'Đổi mới' },
                            { key: 'welfare', label: 'Phúc lợi' },
                            { key: 'democracy', label: 'Dân chủ' },
                          ] as const).map(({ key, label }) => {
                            const d = Math.round((state.macroDelta![key as keyof typeof state.macroDelta] ?? 0) * 10) / 10
                            if (d === 0) return null
                            return (
                              <span key={key} className={cn('font-medium px-1.5 py-0.5 rounded', d > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50')}>
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
          </div>
          {/* Scenario image — square + action button */}
          <div className="hidden lg:flex flex-col gap-3">
            {SCENARIO_IMAGE_MAP[scenario.id] && (
              <div className="rounded-2xl overflow-hidden border border-border shadow-md aspect-square">
                <img
                  src={SCENARIO_IMAGE_MAP[scenario.id]}
                  alt={scenario.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Action button under image */}
            {state.phase === 'playing' && (
              <button
                onClick={() => advance('end-scenario')}
                disabled={actionLoading}
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white transition-all hover:bg-amber-500 disabled:opacity-50 hover-lift shadow-lg shadow-amber-600/20 active:scale-[0.98]"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </span>
                ) : '⏹ Kết thúc tình huống'}
              </button>
            )}
            {state.phase === 'between' && (
              <button
                onClick={() => advance('next-scenario')}
                disabled={actionLoading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 hover-lift shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  </span>
                ) : isLastScenario ? '→ Kết thúc Game' : '→ Tình huống tiếp theo'}
              </button>
            )}
          </div>
        </div>
        )}

        {/* AI-generating / Results — reuses scenario card slot */}
        {(state.phase === 'ai-generating' || state.phase === 'results') && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 animate-fade-in relative">
            {/* Subtle glow behind card */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-violet-500/5 via-primary/5 to-violet-500/5 blur-xl pointer-events-none animate-pulse-soft" />

            {/* Left: Social news replaces scenario content */}
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
              <div className={cn(
                'px-4 py-2.5 border-b border-border/50 flex items-center justify-between',
                state.phase === 'ai-generating'
                  ? 'bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent'
                  : 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
              )}>
                <p className="text-xs font-medium flex items-center gap-2">
                  <BrainIcon size={14} className={state.phase === 'ai-generating' ? 'text-violet-500 animate-pulse' : 'text-primary'} />
                  <span className={state.phase === 'ai-generating' ? 'text-violet-600' : 'text-muted-foreground'}>
                    {state.phase === 'ai-generating' ? 'Bản tin Xã hội Số đang được viết...' : 'Bản tin Xã hội Số'}
                  </span>
                </p>
                {state.phase === 'results' && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Game hoàn thành
                  </span>
                )}
              </div>
              <div className="p-4">
                {state.socialNews ? (
                  <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {stripMarkdown(state.socialNews)}
                    {state.phase === 'ai-generating' && (
                      <span className="inline-block w-1.5 h-3 bg-violet-400 animate-pulse ml-0.5" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-4">
                    <BrainIcon size={24} className="text-violet-400 animate-pulse" />
                    <p className="text-sm text-muted-foreground">AI đang tổng hợp bản tin...</p>
                  </div>
                )}
              </div>
            </div>
            {/* Right: Completion image replaces scenario image */}
            <div className="hidden lg:flex flex-col gap-3">
              <div className="rounded-2xl overflow-hidden border border-border shadow-xl aspect-square relative group animate-celebrate">
                <img src="/images/theme-collective-choice.png" alt="Game hoàn thành" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>
            </div>
          </div>
        )}

        {/* Action buttons — only lobby */}
        <div className="space-y-3">
          {state.phase === 'lobby' && (
            <button
              onClick={() => advance('start-game')}
              disabled={actionLoading || state.playerCount === 0}
              className="w-full rounded-xl bg-emerald-600 py-4 font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-50 hover-lift shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
            >
              {actionLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : `▶ Bắt đầu Game (${state.playerCount} người)`}
            </button>
          )}
        </div>

        {message && (
          <p className="text-center text-sm text-muted-foreground animate-fade-in">{message}</p>
        )}

        {/* AI Trend + Commentary — between phase */}
        {state.phase === 'between' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {state.aiTrend ? (
              <div className="rounded-2xl border border-violet-300 bg-violet-50 p-4 space-y-2 animate-fade-in hover-lift">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-violet-200 flex items-center justify-center">
                    <BrainIcon size={14} className="text-violet-600" />
                  </div>
                  <p className="text-xs text-violet-600 uppercase tracking-widest font-medium">Phân tích xu hướng</p>
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  <p className="text-sm leading-relaxed text-foreground/80">{state.aiTrend}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4 flex items-center gap-3 animate-pulse">
                <BrainIcon size={16} className="text-violet-400" />
                <p className="text-sm text-violet-400">Đang phân tích xu hướng...</p>
              </div>
            )}
            {state.aiCommentary ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2 animate-fade-in hover-lift">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <BrainIcon size={14} className="text-primary" />
                  </div>
                  <p className="text-xs text-primary uppercase tracking-widest font-medium">Bình luận</p>
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  <p className="text-sm leading-relaxed text-foreground/80">{state.aiCommentary}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 flex items-center gap-3 animate-pulse">
                <BrainIcon size={16} className="text-primary/40" />
                <p className="text-sm text-primary/40">Đang soạn bình luận...</p>
              </div>
            )}
          </div>
        )}

        {/* Macro Charts — only show in results phase */}
        {state.phase === 'results' && state.macro.history.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 hover-lift">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium">Diễn biến theo tình huống</p>
            <div className="h-[280px]">
              <MacroCharts macro={state.macro} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
