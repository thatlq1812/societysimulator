'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { MacroGauges } from '@/components/game/MacroGauges'
import { MacroCharts } from '@/components/game/MacroCharts'
import { PlayerRoster } from '@/components/game/PlayerRoster'
import { QRDisplay } from '@/components/game/QRDisplay'
import { AwardCard } from '@/components/game/AwardCard'
import { SocialNewsBanner } from '@/components/game/SocialNewsBanner'
import { CountdownTimer } from '@/components/game/CountdownTimer'
import { GlobeIcon, BrainIcon, PlantIcon, BoltIcon } from '@/components/icons'
import { SCENARIO_IMAGE_MAP, OUTCOME_IMAGE_MAP, LOBBY_IMAGE, TRANSITION_IMAGE_MAP } from '@/lib/image-maps'
import { getStratificationLevel } from '@/lib/stratification-theme'
import { playSound } from '@/lib/sounds'
import { cn, stripMarkdown } from '@/lib/utils'
import type { RoomStatePublic } from '@/types/game'

export default function ScreenPage() {
  const params = useParams()
  const pin = String(params.pin).toUpperCase()

  const [state, setState] = useState<RoomStatePublic | null>(null)
  const [joinUrl, setJoinUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [commentaryStreaming, setCommentaryStreaming] = useState(false)
  const [trendStreaming, setTrendStreaming] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null)

  /** Call /api/tts, play the returned MP3 audio */
  const BG_VOLUME_NORMAL = 0.25
  const BG_VOLUME_DUCK = 0.05
  const DUCK_FADE_MS = 400

  function duckBgMusic(targetVolume: number) {
    const bg = bgMusicRef.current
    if (!bg) return
    const start = bg.volume
    const diff = targetVolume - start
    const steps = 20
    let step = 0
    const interval = setInterval(() => {
      step++
      bg.volume = Math.max(0, Math.min(1, start + diff * (step / steps)))
      if (step >= steps) clearInterval(interval)
    }, DUCK_FADE_MS / steps)
  }

  async function speakText(text: string) {
    try {
      // Stop any currently playing TTS
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause()
        ttsAudioRef.current = null
      }
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return
      const { audioContent } = await res.json()
      if (!audioContent) return
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`)
      audio.volume = 0.9
      ttsAudioRef.current = audio

      // Duck background music before playing
      duckBgMusic(BG_VOLUME_DUCK)

      audio.addEventListener('ended', () => {
        ttsAudioRef.current = null
        // Restore background music volume after TTS finishes
        duckBgMusic(BG_VOLUME_NORMAL)
      }, { once: true })

      audio.play().catch(() => {
        // If playback fails, restore bg volume
        duckBgMusic(BG_VOLUME_NORMAL)
      })
    } catch { /* ignore */ }
  }

  // Background music — plays /background.mp3 if the file exists
  useEffect(() => {
    const audio = new Audio('/background.mp3')
    audio.loop = true
    audio.volume = 0.25
    bgMusicRef.current = audio

    const tryPlay = () => {
      audio.play().catch(() => {})
    }

    audio.addEventListener('error', () => {
      // File doesn't exist or can't be loaded — silently skip
      bgMusicRef.current = null
    })

    // Try autoplay; if blocked, play on first user interaction
    audio.play().catch(() => {
      document.addEventListener('click', tryPlay, { once: true })
      document.addEventListener('keydown', tryPlay, { once: true })
    })

    return () => {
      audio.pause()
      document.removeEventListener('click', tryPlay)
      document.removeEventListener('keydown', tryPlay)
      bgMusicRef.current = null
    }
  }, [])

  useEffect(() => {
    // Generate QR (larger for projection screen)
    async function fetchQR() {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const url = `${appUrl}/join?pin=${pin}`
      setJoinUrl(url)
      try {
        const QRCode = (await import('qrcode')).default
        const dataUrl = await QRCode.toDataURL(url, {
          width: 500,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        })
        setQrDataUrl(dataUrl)
      } catch { /* ignore */ }
    }
    fetchQR()
  }, [pin])

  useEffect(() => {
    // Connect to SSE for real-time updates
    const es = new EventSource(`/api/room/${pin}/events`)
    eventSourceRef.current = es

    es.addEventListener('init', (e) => {
      setState(JSON.parse(e.data))
    })

    es.addEventListener('player-joined', (e) => {
      const data = JSON.parse(e.data)
      playSound('player-joined')
      setState((prev) => prev ? { ...prev, players: data.players, playerCount: data.playerCount } : prev)
    })

    es.addEventListener('scenario-start', (e) => {
      const data = JSON.parse(e.data)
      playSound('scenario-start')
      setCommentaryStreaming(false)
      setTrendStreaming(false)
      setState((prev) =>
        prev ? { ...prev, phase: 'playing', currentScenarioIndex: data.scenarioIndex, currentScenario: data.scenario, scenarioStartedAt: data.scenarioStartedAt, totalScenarios: data.totalScenarios ?? prev.totalScenarios, voteCount: 0, lastBreakdown: undefined, aiCommentary: undefined, aiTrend: undefined } : prev,
      )
      // TTS: call Google TTS API to read scenario context aloud
      if (data.scenario?.context) {
        speakText(data.scenario.context)
      }
    })

    es.addEventListener('vote-update', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, voteCount: data.voteCount } : prev)
    })

    es.addEventListener('scenario-result', (e) => {
      const data = JSON.parse(e.data)
      playSound('scenario-end')
      setState((prev) => prev ? { ...prev, phase: 'between', macro: data.macro, lastBreakdown: data.breakdown, roleBreakdown: data.roleBreakdown, macroDelta: data.macroDelta } : prev)
    })

    es.addEventListener('ai-generating', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, phase: 'ai-generating', outcome: data.outcome } : prev)
    })

    es.addEventListener('ai-news-stream', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, socialNews: data.socialNews } : prev)
    })

    es.addEventListener('game-ended', (e) => {
      const data = JSON.parse(e.data)
      playSound('game-end')
      setState((prev) =>
        prev ? { ...prev, phase: 'results', outcome: data.outcome, macro: data.macro, socialNews: data.socialNews, awards: data.awards } : prev,
      )
    })

    es.addEventListener('ai-commentary', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, aiCommentary: data.commentary } : prev)
      setCommentaryStreaming(data.streaming === true)
    })

    es.addEventListener('ai-trend', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, aiTrend: data.trend } : prev)
      setTrendStreaming(data.streaming === true)
    })

    es.onerror = () => {
      // Reconnect automatically (browser handles this for SSE)
    }

    return () => {
      es.close()
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause()
        ttsAudioRef.current = null
      }
    }
  }, [pin])

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <GlobeIcon size={30} className="text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Đang kết nối...</p>
        </div>
      </div>
    )
  }

  const scenario = state.currentScenario ?? null

  // ─── Lobby — show QR code prominently ─────────────────────────────────────
  if (state.phase === 'lobby') {
    return (
      <div className="h-screen bg-background p-8 flex flex-col relative overflow-hidden">
        {/* Background hero image */}
        <div className="absolute inset-0 opacity-10">
          <Image src={LOBBY_IMAGE} alt="" fill className="object-cover" />
        </div>
        {/* Floating dots */}
        <div className="absolute top-[8%] left-[5%] w-3 h-3 rounded-full bg-primary/10 animate-float-slow pointer-events-none" />
        <div className="absolute top-[15%] right-[10%] w-2 h-2 rounded-full bg-blue-500/10 animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-[8%] w-1.5 h-1.5 rounded-full bg-violet-500/10 animate-float-slow pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[50%] right-[4%] w-2.5 h-2.5 rounded-full bg-emerald-500/8 animate-float-slow pointer-events-none" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[12%] right-[20%] w-1.5 h-1.5 rounded-full bg-amber-500/8 animate-float-slow pointer-events-none" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[40%] left-[25%] w-1 h-1 rounded-full bg-pink-500/8 animate-float-slow pointer-events-none" style={{ animationDelay: '2.5s' }} />
        {/* Corner accents */}
        <div className="absolute top-6 left-6 w-20 h-20 border-l-2 border-t-2 border-primary/8 rounded-tl-2xl pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-20 h-20 border-r-2 border-b-2 border-primary/8 rounded-br-2xl pointer-events-none" />

        <div className="flex-1 grid grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
                MLN131 — FPT University
              </p>
              <h1 className="projection-title text-foreground">
                Digital Society<br />Simulator
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Trải nghiệm cơ cấu xã hội trong kỷ nguyên chuyển đổi số
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground text-sm">Sinh viên đã tham gia</span>
              </div>
              <p className="projection-value text-primary ml-auto">{state.playerCount}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {qrDataUrl && <QRDisplay qrDataUrl={qrDataUrl} joinUrl={joinUrl} pin={pin} size="large" />}
            <p className="text-muted-foreground text-center text-sm">
              Quét QR hoặc truy cập URL · Nhập tên để bắt đầu
            </p>
          </div>
        </div>

        {state.players.length > 0 && (
          <div className="mt-6">
            <PlayerRoster players={state.players} />
          </div>
        )}
      </div>
    )
  }

  // ─── Playing + Between — macro dashboard ──────────────────────────────────
  if (state.phase === 'playing' || state.phase === 'between') {
    const stratLevel = getStratificationLevel(state.macro.stratification)

    return (
      <div key={`game-${state.currentScenarioIndex}-${state.phase}`} className={cn(
        'h-screen bg-background p-6 flex flex-col gap-4 animate-phase-enter overflow-hidden',
        stratLevel === 'warning' && 'bg-amber-50/50',
        stratLevel === 'danger' && 'bg-red-50',
      )}>
        {/* Floating dots */}
        <div className="absolute top-[6%] right-[4%] w-2 h-2 rounded-full bg-primary/8 animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[10%] left-[3%] w-1.5 h-1.5 rounded-full bg-violet-500/8 animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[2%] w-1 h-1 rounded-full bg-blue-500/8 animate-float-slow pointer-events-none" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[25%] right-[6%] w-2 h-2 rounded-full bg-emerald-500/6 animate-float-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />
        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l border-t border-primary/6 rounded-tl-lg pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r border-b border-primary/6 rounded-br-lg pointer-events-none" />
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Digital Society Simulator
            </p>
            {scenario && (
              <h2 className="text-xl font-bold">
                T{state.currentScenarioIndex + 1}/{state.totalScenarios}: {scenario.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-6">
            {state.phase === 'playing' && state.scenarioStartedAt && (
              <CountdownTimer startedAt={state.scenarioStartedAt} duration={30} className="scale-110" muted />
            )}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Người chơi</p>
              <p className="text-2xl font-bold text-primary">{state.playerCount}</p>
              {state.phase === 'playing' && (
                <p className="text-xs text-muted-foreground">
                  Đã vote: <span className="font-bold text-emerald-600">{state.voteCount ?? 0}</span>/{state.playerCount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vote progress bar — visible during playing phase */}
        {state.phase === 'playing' && state.playerCount > 0 && (
          <div className="flex-shrink-0 space-y-1 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-0.5">
              <span>Tiến độ bỏ phiếu</span>
              <span className="font-medium text-emerald-600 tabular-nums">
                {state.voteCount ?? 0}/{state.playerCount} ({Math.round(((state.voteCount ?? 0) / state.playerCount) * 100)}%)
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((state.voteCount ?? 0) / state.playerCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main content — 2 column layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 overflow-hidden">
          {/* Left column: Scenario + Macro */}
          <div className="flex flex-col gap-3 overflow-y-auto">
            {scenario && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] xl:grid-cols-[1fr_200px] gap-3 animate-fade-in">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-center">
                  <p className="text-sm leading-relaxed text-foreground/90">{scenario.context}</p>
                </div>
                {SCENARIO_IMAGE_MAP[scenario.id] && (
                  <div className="rounded-xl overflow-hidden border border-border shadow-md hidden lg:block relative">
                    <img
                      src={SCENARIO_IMAGE_MAP[scenario.id]}
                      alt={scenario.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10" />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
                Chỉ số Vĩ mô · Thời gian thực
              </p>
              <MacroGauges
                alliance={state.macro.alliance}
                stratification={state.macro.stratification}
                production={state.macro.production}
                innovation={state.macro.innovation}
                welfare={state.macro.welfare}
                democracy={state.macro.democracy}
                deltas={state.macroDelta}
              />
            </div>

            {state.macro.history.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Diễn biến</p>
                <div className="h-[220px] xl:h-[280px]">
                  <MacroCharts macro={state.macro} />
                </div>
              </div>
            )}
          </div>

          {/* Right column: Breakdown + AI */}
          <div className="flex flex-col gap-3 overflow-y-auto">
            {state.phase === 'between' && state.lastBreakdown && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-fade-in">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Phân bố lựa chọn</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['A', 'B', 'C'] as const).map((opt) => {
                    const count = state.lastBreakdown![opt]
                    const pct = state.lastBreakdown!.total > 0 ? Math.round((count / state.lastBreakdown!.total) * 100) : 0
                    const colors = { A: 'bg-amber-500', B: 'bg-emerald-500', C: 'bg-blue-500' }
                    const labels = { A: 'text-amber-600', B: 'text-emerald-600', C: 'text-blue-600' }
                    return (
                      <div key={opt} className="text-center space-y-1">
                        <p className={`text-xl font-bold tabular-nums ${labels[opt]}`}>{count}</p>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${colors[opt]}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Lựa chọn {opt} · {pct}%</p>
                      </div>
                    )
                  })}
                </div>

                {state.roleBreakdown && state.roleBreakdown.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Theo nhóm vai trò</p>
                    {state.roleBreakdown.map((rb) => {
                      const roleColors: Record<string, string> = { 'cong-nhan': 'text-blue-600', 'nong-dan': 'text-emerald-600', 'tri-thuc': 'text-violet-600', 'startup': 'text-amber-600' }
                      return (
                        <div key={rb.roleId} className="flex items-center gap-3 text-xs">
                          <span className={`font-medium min-w-[140px] ${roleColors[rb.roleId] ?? ''}`}>{rb.roleName}</span>
                          <div className="flex-1 flex gap-1.5">
                            {rb.A > 0 && <span className="text-amber-600 tabular-nums">A:{rb.A}</span>}
                            {rb.B > 0 && <span className="text-emerald-600 tabular-nums">B:{rb.B}</span>}
                            {rb.C > 0 && <span className="text-blue-600 tabular-nums">C:{rb.C}</span>}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{rb.total}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {state.macroDelta && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Thay đổi chỉ số</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: 'alliance', label: 'Liên minh' },
                        { key: 'stratification', label: 'Phân hóa' },
                        { key: 'production', label: 'Sản xuất' },
                        { key: 'innovation', label: 'Đổi mới' },
                        { key: 'welfare', label: 'Phúc lợi' },
                        { key: 'democracy', label: 'Dân chủ' },
                      ] as const).map(({ key, label }) => {
                        const delta = state.macroDelta![key as keyof typeof state.macroDelta]
                        const rounded = Math.round(delta * 10) / 10
                        return (
                          <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-2 py-1.5">
                            <span className="text-[10px] text-muted-foreground">{label}</span>
                            <span className={`font-bold tabular-nums text-xs ${rounded > 0 ? 'text-emerald-600' : rounded < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {rounded > 0 ? '+' : ''}{rounded.toFixed(1)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {state.phase === 'between' && !state.lastBreakdown && (
              <div className="rounded-xl border border-border bg-card/80 p-3 text-center text-sm text-muted-foreground">
                Đang chuẩn bị tình huống tiếp theo...
              </div>
            )}

            {state.phase === 'between' && (
              <>
                <div className={cn(
                  'rounded-xl border p-4 space-y-2 animate-fade-in',
                  state.aiTrend ? 'border-violet-200 bg-card/80 backdrop-blur-sm' : 'border-violet-100 bg-violet-50/50',
                )}>
                  <div className="flex items-center gap-2">
                    <BrainIcon size={14} className={state.aiTrend ? 'text-violet-600' : 'text-violet-400 animate-pulse'} />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Phân tích Xu hướng</p>
                  </div>
                  {state.aiTrend ? (
                    <StreamingText text={state.aiTrend} streaming={trendStreaming} className="text-foreground/90" />
                  ) : (
                    <p className="text-xs text-muted-foreground/50">AI đang phân tích xu hướng...</p>
                  )}
                </div>
                <div className={cn(
                  'rounded-xl border p-4 space-y-2 animate-fade-in',
                  state.aiCommentary ? 'border-primary/20 bg-card/80 backdrop-blur-sm' : 'border-primary/10 bg-primary/5',
                )}>
                  <div className="flex items-center gap-2">
                    <BrainIcon size={14} className={state.aiCommentary ? 'text-primary' : 'text-primary/40 animate-pulse'} />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Bình luận</p>
                  </div>
                  {state.aiCommentary ? (
                    <StreamingText text={state.aiCommentary} streaming={commentaryStreaming} />
                  ) : (
                    <p className="text-xs text-muted-foreground/50">AI đang soạn bình luận...</p>
                  )}
                </div>
              </>
            )}

            {state.phase === 'playing' && (
              <div className="rounded-xl border border-border bg-card/80 p-4 flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground animate-pulse">Đang chờ lựa chọn của sinh viên...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── AI Generating ─────────────────────────────────────────────────────────
  if (state.phase === 'ai-generating') {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 opacity-15">
          <Image src={TRANSITION_IMAGE_MAP['analyzing']} alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-4xl px-4">
        <BrainIcon size={80} className="text-primary animate-pulse" />
        <div className="text-center space-y-3">
          <h2 className="projection-title">AI đang phân tích...</h2>
          <p className="text-xl text-muted-foreground">
            Tổng hợp dữ liệu hành vi của {state.playerCount} sinh viên
          </p>
        </div>
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        {/* Live streaming news text */}
        {state.socialNews && (
          <div className="glass-card p-6 w-full animate-fade-in">
            <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <BrainIcon size={20} className="animate-pulse" />
              Bản tin Xã hội Số đang được viết...
            </h3>
            <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
              {stripMarkdown(state.socialNews || '')}
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
            </div>
          </div>
        )}
        <MacroGauges
          alliance={state.macro.alliance}
          stratification={state.macro.stratification}
          production={state.macro.production}
          innovation={state.macro.innovation}
          welfare={state.macro.welfare}
          democracy={state.macro.democracy}
        />
        </div>
      </div>
    )
  }

  // ─── Results ───────────────────────────────────────────────────────────────
  if (state.phase === 'results') {
    const outcomeImage = state.outcome ? OUTCOME_IMAGE_MAP[state.outcome] : undefined

    return (
       <div className="h-screen results-galaxy p-5 flex flex-col gap-3 animate-phase-enter overflow-y-auto overflow-x-hidden relative">
        {/* Galaxy glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-violet-400/10 rounded-full blur-[80px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[25%] left-[8%] w-64 h-64 bg-cyan-400/8 rounded-full blur-[60px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[40%] w-80 h-80 bg-indigo-400/8 rounded-full blur-[100px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[5%] left-[55%] w-48 h-48 bg-purple-400/10 rounded-full blur-[50px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[8%] right-[35%] w-56 h-56 bg-blue-200/8 rounded-full blur-[70px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[70%] left-[20%] w-60 h-60 bg-amber-400/5 rounded-full blur-[80px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '3.5s' }} />

        {/* Star field — many particles */}
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={`star-${i}`}
            className={cn(
              'absolute rounded-full animate-sparkle pointer-events-none',
              i % 4 === 0 ? 'w-1 h-1 bg-white/30' : i % 3 === 0 ? 'w-[3px] h-[3px] bg-white/20' : 'w-0.5 h-0.5 bg-white/25',
            )}
            style={{
              top: `${2 + ((i * 41) % 93)}%`,
              left: `${1 + ((i * 67) % 96)}%`,
              animationDelay: `${(i * 0.17) % 2.5}s`,
              animationDuration: `${1.5 + (i % 5) * 0.4}s`,
            }}
          />
        ))}

        {/* 3×2 grid: Row1=[Macro, Outcome], Row2=[Chart, News(spans 2 rows)], Row3=[Awards, ...] */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto] gap-3 flex-1 min-h-0">
          {/* 1: Macro gauges */}
          <div className="rounded-xl border border-white/15 bg-slate-900/70 backdrop-blur-sm p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-100 uppercase tracking-widest">Kết quả Vĩ mô</p>
            <MacroGauges
              alliance={state.macro.alliance}
              stratification={state.macro.stratification}
              production={state.macro.production}
              innovation={state.macro.innovation}
              welfare={state.macro.welfare}
              democracy={state.macro.democracy}
            />
          </div>

          {/* 2: Outcome card */}
          <div className="rounded-xl border border-white/15 bg-slate-900/70 backdrop-blur-sm p-4 flex items-center gap-5">
            {outcomeImage ? (
              <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white/25 shadow-xl shadow-blue-500/10 animate-celebrate">
                <Image src={outcomeImage} alt="Outcome" className="w-full h-full object-cover" width={128} height={128} />
              </div>
            ) : (
              <div className="w-32 h-32 flex-shrink-0 rounded-xl border-2 border-white/25 bg-slate-800 flex items-center justify-center animate-celebrate">
                {state.outcome === 'ben-vung' ? <PlantIcon size={48} className="text-emerald-300" /> : state.outcome === 'dut-gay' ? <BoltIcon size={48} className="text-red-300" /> : <BoltIcon size={48} className="text-amber-300" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-100 uppercase tracking-widest">Kết quả cuối cùng</p>
              <h2 className="text-2xl font-bold leading-tight mt-1 text-white">
                {state.outcome === 'ben-vung' && 'Chuyển đổi số Bền vững'}
                {state.outcome === 'dut-gay' && 'Đứt gãy Cơ cấu'}
                {state.outcome === 'trung-tinh' && 'Trạng thái Bất ổn'}
              </h2>
            </div>
            <a
              href="/"
              className="flex-shrink-0 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all hover-lift shadow-sm"
            >
              ← Trang chủ
            </a>
          </div>

          {/* 3: Chart (left, row 2) */}
          {state.macro.history.length > 0 && (
            <div className="rounded-xl border border-white/15 bg-slate-900/70 backdrop-blur-sm p-4 flex flex-col" style={{ minHeight: '260px' }}>
              <p className="text-sm font-semibold text-blue-100 uppercase tracking-widest mb-2 flex-shrink-0">Diễn biến</p>
              <div className="flex-1 min-h-0">
                <MacroCharts macro={state.macro} />
              </div>
            </div>
          )}

          {/* 4+6: Social News (right, spans row 2+3) */}
          <div className="rounded-xl border border-white/15 bg-slate-900/70 backdrop-blur-sm flex flex-col overflow-hidden lg:row-span-2">
            {state.socialNews ? (
              <>
                <div className="flex-shrink-0 bg-blue-600/80 px-4 py-1.5 flex items-center gap-2 border-b border-white/10">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Bản tin Xã hội Số</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="text-sm leading-relaxed text-blue-50/90 whitespace-pre-wrap">
                    {stripMarkdown(state.socialNews)}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center space-y-2">
                  <BrainIcon size={36} className="text-blue-300/40 mx-auto animate-pulse" />
                  <p className="text-sm text-blue-100/60">Bản tin Xã hội Số đang được tạo...</p>
                </div>
              </div>
            )}
          </div>

          {/* 5: Awards (left, row 3) */}
          {state.awards && state.awards.length > 0 && (
            <div className="rounded-xl border border-white/15 bg-slate-900/70 backdrop-blur-sm p-4 flex flex-col">
              <p className="text-sm font-semibold text-blue-100 uppercase tracking-widest mb-3 flex-shrink-0">Danh hiệu</p>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center justify-center gap-2 w-full">
                  {state.awards.map((award, i) => (
                    <div
                      key={award.id}
                      className="flex-1 min-w-0 max-w-[140px] animate-card-reveal"
                      style={{
                        animationDelay: `${i * 200}ms`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <AwardCard award={award} index={i} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

/** Streaming text with auto-scroll and blinking cursor */
function StreamingText({ text, streaming, className }: { text: string; streaming: boolean; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (streaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [text, streaming])

  return (
    <div ref={containerRef} className="max-h-[200px] overflow-y-auto">
      <p className={cn('text-sm leading-relaxed text-foreground/90', className)}>
        {text}
        {streaming && <span className="inline-block w-[2px] h-[14px] bg-current ml-0.5 align-middle animate-pulse" />}
      </p>
    </div>
  )
}


