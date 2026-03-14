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
import { FramedImage } from '@/components/game/FramedImage'
import { GlobeIcon, BrainIcon, PlantIcon, BoltIcon } from '@/components/icons'
import { SCENARIO_IMAGE_MAP, OUTCOME_IMAGE_MAP } from '@/lib/image-maps'
import { getStratificationLevel } from '@/lib/stratification-theme'
import { cn } from '@/lib/utils'
import type { RoomStatePublic } from '@/types/game'

export default function ScreenPage() {
  const params = useParams()
  const pin = String(params.pin).toUpperCase()

  const [state, setState] = useState<RoomStatePublic | null>(null)
  const [joinUrl, setJoinUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Generate QR
    async function fetchQR() {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const url = `${appUrl}/join?pin=${pin}`
      setJoinUrl(url)
      try {
        const QRCode = (await import('qrcode')).default
        const dataUrl = await QRCode.toDataURL(url, {
          width: 300,
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
      setState((prev) => prev ? { ...prev, players: data.players, playerCount: data.playerCount } : prev)
    })

    es.addEventListener('scenario-start', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) =>
        prev ? { ...prev, phase: 'playing', currentScenarioIndex: data.scenarioIndex, currentScenario: data.scenario, scenarioStartedAt: data.scenarioStartedAt, voteCount: 0, lastBreakdown: undefined, aiCommentary: undefined } : prev,
      )
    })

    es.addEventListener('vote-update', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, voteCount: data.voteCount } : prev)
    })

    es.addEventListener('scenario-result', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, phase: 'between', macro: data.macro, lastBreakdown: data.breakdown } : prev)
    })

    es.addEventListener('ai-generating', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, phase: 'ai-generating', outcome: data.outcome } : prev)
    })

    es.addEventListener('game-ended', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) =>
        prev ? { ...prev, phase: 'results', outcome: data.outcome, macro: data.macro, socialNews: data.socialNews, awards: data.awards } : prev,
      )
    })

    es.addEventListener('ai-commentary', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, aiCommentary: data.commentary } : prev)
    })

    es.addEventListener('ai-trend', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, aiTrend: data.trend } : prev)
    })

    es.onerror = () => {
      // Reconnect automatically (browser handles this for SSE)
    }

    return () => es.close()
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
      <div className="min-h-screen bg-background p-8 flex flex-col relative overflow-hidden">
        {/* Background hero image */}
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/hero-network.png" alt="" fill className="object-cover" />
        </div>

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

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-muted-foreground mb-1 text-sm">Sinh viên đã tham gia</p>
              <p className="projection-value text-primary">{state.playerCount}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {qrDataUrl && <QRDisplay qrDataUrl={qrDataUrl} joinUrl={joinUrl} pin={pin} />}
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
        'min-h-screen bg-background p-8 space-y-8 animate-phase-enter',
        stratLevel === 'warning' && 'bg-amber-50/50',
        stratLevel === 'danger' && 'bg-red-50',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Digital Society Simulator
            </p>
            {scenario && (
              <h2 className="text-2xl font-bold mt-1">
                T{state.currentScenarioIndex + 1}/{state.totalScenarios}: {scenario.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-6">
            {state.phase === 'playing' && state.scenarioStartedAt && (
              <CountdownTimer startedAt={state.scenarioStartedAt} duration={30} className="scale-125" />
            )}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Người chơi</p>
              <p className="text-3xl font-bold text-primary">{state.playerCount}</p>
              {state.phase === 'playing' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Đã vote: <span className="font-bold text-emerald-600">{state.voteCount ?? 0}</span>/{state.playerCount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scenario context */}
        {scenario && state.phase === 'playing' && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden animate-fade-in">
            {SCENARIO_IMAGE_MAP[scenario.id] && (
              <FramedImage
                src={SCENARIO_IMAGE_MAP[scenario.id]}
                alt={scenario.title}
                variant="banner"
                frameClassName="h-40"
              />
            )}
            <div className="p-5">
              <p className="text-base leading-relaxed text-foreground/90">{scenario.context}</p>
            </div>
          </div>
        )}

        {/* Macro gauges */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5">
            Chỉ số Vĩ mô · Cập nhật thời gian thực
          </p>
          <MacroGauges
            alliance={state.macro.alliance}
            stratification={state.macro.stratification}
            production={state.macro.production}
          />
        </div>

        {/* Chart history */}
        {state.macro.history.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Diễn biến theo tình huống</p>
            <MacroCharts macro={state.macro} />
          </div>
        )}

        {state.phase === 'between' && state.lastBreakdown && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-fade-in">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Phân bố lựa chọn</p>
            <div className="grid grid-cols-3 gap-4">
              {(['A', 'B', 'C'] as const).map((opt) => {
                const count = state.lastBreakdown![opt]
                const pct = state.lastBreakdown!.total > 0 ? Math.round((count / state.lastBreakdown!.total) * 100) : 0
                const colors = { A: 'bg-amber-500', B: 'bg-emerald-500', C: 'bg-blue-500' }
                const labels = { A: 'text-amber-600', B: 'text-emerald-600', C: 'text-blue-600' }
                return (
                  <div key={opt} className="text-center space-y-2">
                    <p className={`text-3xl font-bold tabular-nums ${labels[opt]}`}>{count}</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${colors[opt]}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-sm text-muted-foreground">Lựa chọn {opt} · {pct}%</p>
                  </div>
                )
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground">Đang chuẩn bị tình huống tiếp theo...</p>
          </div>
        )}
        {state.phase === 'between' && !state.lastBreakdown && (
          <div className="rounded-2xl border border-border bg-card/80 p-4 text-center text-muted-foreground">
            Đang chuẩn bị tình huống tiếp theo...
          </div>
        )}

        {/* AI Commentary — Tier 1 */}
        {state.phase === 'between' && state.aiCommentary && (
          <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm p-5 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <BrainIcon size={18} className="text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Bình luận AI</p>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{state.aiCommentary}</p>
          </div>
        )}

        {/* AI Trend — Tier 2 */}
        {state.phase === 'between' && state.aiTrend && (
          <div className="rounded-2xl border border-violet-200 bg-card/80 backdrop-blur-sm p-5 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <BrainIcon size={18} className="text-violet-600" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Phân tích Xu hướng</p>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{state.aiTrend}</p>
          </div>
        )}
      </div>
    )
  }

  // ─── AI Generating ─────────────────────────────────────────────────────────
  if (state.phase === 'ai-generating') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8">
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
        <MacroGauges
          alliance={state.macro.alliance}
          stratification={state.macro.stratification}
          production={state.macro.production}
        />
      </div>
    )
  }

  // ─── Results ───────────────────────────────────────────────────────────────
  if (state.phase === 'results') {
    const outcomeImage = state.outcome ? OUTCOME_IMAGE_MAP[state.outcome] : undefined

    return (
      <div className="min-h-screen bg-background p-8 space-y-8 animate-phase-enter">
        {/* Outcome header with image */}
        <div className="text-center space-y-3">
          {outcomeImage && (
            <FramedImage
              src={outcomeImage}
              alt="Outcome"
              variant="card"
              frameClassName="w-48 h-48 mx-auto mb-4 animate-celebrate"
            />
          )}
          {!outcomeImage && (
            <div className="flex justify-center animate-celebrate">
              {state.outcome === 'ben-vung' ? <PlantIcon size={56} className="text-emerald-600" /> : state.outcome === 'dut-gay' ? <BoltIcon size={56} className="text-red-600" /> : <BoltIcon size={56} className="text-amber-600" />}
            </div>
          )}
          <h1 className="projection-title">
            {state.outcome === 'ben-vung' && 'Chuyển đổi số Bền vững'}
            {state.outcome === 'dut-gay' && 'Đứt gãy Cơ cấu'}
            {state.outcome === 'trung-tinh' && 'Trạng thái Bất ổn'}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Macro summary */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Kết quả Vĩ mô Cuối cùng</p>
            <MacroGauges
              alliance={state.macro.alliance}
              stratification={state.macro.stratification}
              production={state.macro.production}
            />
          </div>

          {/* Awards */}
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Danh hiệu</p>
            {state.awards?.map((award) => (
              <AwardCard key={award.id} award={award} />
            ))}
          </div>
        </div>

        {/* AI news */}
        {state.socialNews && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Bản tin Xã hội 2030</p>
            <SocialNewsBanner text={state.socialNews} />
          </div>
        )}
      </div>
    )
  }

  return null
}
