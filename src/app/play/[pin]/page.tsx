'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePlayerStore } from '@/stores/player-store'
import { Navbar } from '@/components/Navbar'
import { RoleCard } from '@/components/game/RoleCard'
import { ScenarioCard } from '@/components/game/ScenarioCard'
import { ChoiceButton } from '@/components/game/ChoiceButton'
import { CountdownTimer } from '@/components/game/CountdownTimer'
import { MicroStats } from '@/components/game/MicroStats'
import { AwardCard } from '@/components/game/AwardCard'
import { BrainIcon, PlantIcon, BoltIcon, ChartIcon, IconByKey } from '@/components/icons'
import { FramedImage } from '@/components/game/FramedImage'
import { getStratificationLevel } from '@/lib/stratification-theme'
import { playSound } from '@/lib/sounds'
import { cn, stripMarkdown } from '@/lib/utils'
import type { RoomStatePublic, ChoiceId, RoleId, Award } from '@/types/game'
import { getChoicesForRole } from '@/types/game'

const POLL_INTERVAL = 1500

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const pin = String(params.pin).toUpperCase()
  const { playerId, roleId, playerName } = usePlayerStore()

  const [state, setState] = useState<RoomStatePublic | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<ChoiceId | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'polling'>('connecting')

  const currentPlayer = state?.players.find((p) => p.id === playerId)

  // Polling fallback — runs at slower rate when SSE is connected
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${pin}/state`)
      if (res.status === 404) {
        setRoomNotFound(true)
        setLoading(false)
        return
      }
      if (!res.ok) return
      const data: RoomStatePublic = await res.json()
      setState((prev) => {
        if (prev?.currentScenarioIndex !== data.currentScenarioIndex) {
          setSelectedChoice(null)
          setSubmitted(false)
        }
        return data
      })
    } catch {
      // Ignore fetch errors during polling
    } finally {
      setLoading(false)
    }
  }, [pin])

  // Attempt rejoin if playerId exists but player not found in state
  useEffect(() => {
    if (!playerId || !state || state.players.find((p) => p.id === playerId)) return
    // Player exists in store but not in room — try rejoin
    fetch(`/api/room/${pin}/rejoin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    }).then((res) => {
      if (res.status === 404) {
        // Player truly gone — clear store and redirect to join
        router.replace(`/join?pin=${pin}`)
      }
    }).catch(() => {})
  }, [playerId, state, pin, router])

  useEffect(() => {
    if (!playerId || !roleId) {
      router.replace(`/join?pin=${pin}`)
      return
    }

    // Initial fetch
    fetchState()

    // SSE connection for real-time updates
    const es = new EventSource(`/api/room/${pin}/events`)

    es.addEventListener('init', (e) => {
      const data: RoomStatePublic = JSON.parse(e.data)
      setState(data)
      setConnectionStatus('connected')
      setLoading(false)
    })

    es.addEventListener('scenario-start', (e) => {
      const data = JSON.parse(e.data)
      setSelectedChoice(null)
      setSubmitted(false)
      playSound('scenario-start')
      setState((prev) =>
        prev ? { ...prev, phase: 'playing', currentScenarioIndex: data.scenarioIndex, currentScenario: data.scenario, scenarioStartedAt: data.scenarioStartedAt, totalScenarios: data.totalScenarios ?? prev.totalScenarios, voteCount: 0, aiCommentary: undefined } : prev,
      )
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

    es.addEventListener('ai-commentary', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, aiCommentary: data.commentary } : prev)
    })

    es.addEventListener('ai-trend', (e) => {
      const data = JSON.parse(e.data)
      setState((prev) => prev ? { ...prev, aiTrend: data.trend } : prev)
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

    es.onerror = () => {
      setConnectionStatus('polling')
      // Browser auto-reconnects SSE; polling fallback covers the gap
    }

    es.onopen = () => {
      setConnectionStatus('connected')
    }

    // Polling fallback — slower when SSE works, faster when SSE is down
    const id = setInterval(() => {
      // Always poll but at reduced rate — SSE handles real-time, polling handles player stats
      fetchState()
    }, POLL_INTERVAL)

    return () => {
      es.close()
      clearInterval(id)
    }
  }, [fetchState, playerId, roleId, pin, router])

  const awardSoundPlayed = useRef(false)

  useEffect(() => {
    if (state?.awards) {
      const myAw = state.awards.find((a) => a.playerId === playerId)
      if (myAw && !awardSoundPlayed.current) {
        awardSoundPlayed.current = true
        setTimeout(() => playSound('award'), 500)
      }
    }
  }, [state?.awards, playerId])

  async function submitChoice(choiceId: ChoiceId) {
    if (submitted || !playerId) return
    setSelectedChoice(choiceId)
    setSubmitted(true)
    playSound('vote-submit')
    try {
      await fetch(`/api/room/${pin}/choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, choice: choiceId }),
      })
    } catch {
      setSubmitted(false)
    }
  }

  if (roomNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <BoltIcon size={40} className="text-destructive mx-auto" />
          <h2 className="text-lg font-bold">Phòng không tồn tại</h2>
          <p className="text-sm text-muted-foreground">Mã PIN <span className="font-bold text-primary">{pin}</span> không hợp lệ hoặc đã hết hạn.</p>
          <a href="/join" className="inline-block rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground">
            Quay lại
          </a>
        </div>
      </div>
    )
  }

  if (loading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Đang kết nối...</p>
        </div>
      </div>
    )
  }

  const scenario = state.currentScenario ?? null
  const stratLevel = (state.phase === 'playing' || state.phase === 'between') ? getStratificationLevel(state.macro.stratification) : 'normal'
  const myAward = state.awards?.find((a) => a.playerId === playerId)

  return (
    <>
      <Navbar pin={pin} />
      {/* SSE connection indicator */}
      {connectionStatus === 'polling' && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-1">
          Kết nối yếu — đang dùng chế độ dự phòng
        </div>
      )}

      {/* --- Lobby --------------------------------------------------------- */}
      {state.phase === 'lobby' && (
        <div className="h-screen p-3 sm:p-4 lg:px-12 lg:py-4 w-full relative overflow-hidden flex flex-col">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-b-3xl" />
          {/* Floating dots */}
          <div className="absolute top-[10%] right-[6%] w-2 h-2 rounded-full bg-primary/12 animate-float-slow pointer-events-none" />
          <div className="absolute top-[30%] left-[4%] w-1.5 h-1.5 rounded-full bg-blue-500/10 animate-float-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-[15%] right-[10%] w-1 h-1 rounded-full bg-violet-500/10 animate-float-slow pointer-events-none" style={{ animationDelay: '3s' }} />
          <div className="absolute top-[55%] left-[8%] w-2.5 h-2.5 rounded-full bg-emerald-500/8 animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[30%] left-[30%] w-1 h-1 rounded-full bg-amber-500/8 animate-float-slow pointer-events-none" style={{ animationDelay: '4s' }} />
          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-14 h-14 border-l border-t border-primary/8 rounded-tl-xl pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-14 h-14 border-r border-b border-primary/8 rounded-br-xl pointer-events-none" />

          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3 sm:gap-4 items-start overflow-y-auto">
            {/* Left: Role card */}
            <div className="space-y-5">
              {roleId && playerName && (
                <RoleCard roleId={roleId} playerName={playerName} />
              )}

              {currentPlayer && roleId && (
                <MicroStats roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} influence={currentPlayer.influence} resilience={currentPlayer.resilience} allianceContribution={currentPlayer.allianceContribution} choiceCount={currentPlayer.choiceCount} />
              )}
            </div>

            {/* Right: Waiting status + role highlight */}
            <div className="space-y-5">
              {/* Group title */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Các tầng lớp trong xã hội số</p>
                <p className="text-sm text-muted-foreground">Bạn thuộc nhóm được đánh dấu bên dưới</p>
              </div>
              {/* 4-role highlight strip */}
              <div className="grid grid-cols-2 gap-2">
                {(['cong-nhan', 'nong-dan', 'tri-thuc', 'startup'] as const).map((rid) => {
                  const isMe = rid === roleId
                  const roleColors: Record<string, { border: string; bg: string; text: string; ring: string }> = {
                    'cong-nhan': { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-400' },
                    'nong-dan': { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-400' },
                    'tri-thuc': { border: 'border-violet-300', bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-400' },
                    'startup': { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-400' },
                  }
                  const roleNames: Record<string, string> = { 'cong-nhan': 'Công nhân', 'nong-dan': 'Nông dân', 'tri-thuc': 'Trí thức', 'startup': 'Startup' }
                  const roleImages: Record<string, string> = { 'cong-nhan': '/images/role-worker.png', 'nong-dan': '/images/role-farmer.png', 'tri-thuc': '/images/role-intellectual.png', 'startup': '/images/role-startup.png' }
                  const c = roleColors[rid]
                  return (
                    <div
                      key={rid}
                      className={cn(
                        'rounded-xl border-2 p-3 flex items-center gap-3 transition-all',
                        isMe ? `${c.border} ${c.bg} ring-2 ${c.ring} shadow-md scale-[1.02]` : 'border-border bg-card opacity-50',
                      )}
                    >
                      <img src={roleImages[rid]} alt="" className={cn('w-10 h-10 rounded-lg object-cover border', isMe ? c.border : 'border-border')} />
                      <div>
                        <p className={cn('text-sm font-bold', isMe ? c.text : 'text-muted-foreground')}>{roleNames[rid]}</p>
                        {isMe && <p className="text-[10px] text-primary font-medium">Vai trò của bạn</p>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Waiting card */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden animate-fade-in">
                <div className="relative h-28 sm:h-40 overflow-hidden">
                  <img src="/images/lobby-gathering.png" alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <div className="flex justify-center gap-1.5 mb-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                    <p className="font-semibold text-foreground">Trò chơi sắp bắt đầu...</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm"><span className="font-bold text-primary tabular-nums">{state.playerCount}</span> <span className="text-muted-foreground">người đã tham gia</span></span>
                  </div>
                  <span className="text-xs text-muted-foreground">PIN: <span className="font-bold text-foreground tracking-widest">{pin}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Playing ------------------------------------------------------- */}
      {state.phase === 'playing' && scenario && state.scenarioStartedAt && (
        <div className={cn(
          'h-screen p-3 sm:p-4 lg:px-12 lg:py-4 w-full relative overflow-hidden flex flex-col',
          stratLevel === 'danger' && 'bg-red-50',
          stratLevel === 'warning' && 'bg-amber-50/50'
        )}>
          {/* Subtle top gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none rounded-b-3xl" />
          <div className="flex items-center justify-between mb-2">
            <CountdownTimer startedAt={state.scenarioStartedAt} duration={30} muted />
            {currentPlayer && roleId && (
              <MicroStats roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} influence={currentPlayer.influence} resilience={currentPlayer.resilience} className="text-right" />
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3 sm:gap-4 overflow-y-auto">
            {/* Left: Scenario */}
            <ScenarioCard
              scenario={scenario}
              scenarioNumber={state.currentScenarioIndex + 1}
              totalScenarios={state.totalScenarios}
            />

            {/* Right: Choices */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Lựa chọn của bạn</p>
              {getChoicesForRole(scenario, roleId as RoleId).map((choice, idx) => (
                <div key={choice.id} className="choice-btn-enter" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <ChoiceButton
                    choice={choice}
                    selected={selectedChoice === choice.id}
                    submitted={submitted}
                    disabled={submitted && selectedChoice !== choice.id}
                    onClick={submitChoice}
                  />
                </div>
              ))}

              {submitted && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-3 animate-fade-in">
                  <FramedImage
                    src="/images/transition-waiting.png"
                    alt="Đang chờ..."
                    variant="banner"
                    frameClassName="h-24 mb-2"
                  />
                  <div className="flex justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-primary">Đã ghi nhận lựa chọn</p>
                  <p className="text-xs text-muted-foreground">
                    Đang chờ các giai cấp khác quyết định...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Between ------------------------------------------------------- */}
      {state.phase === 'between' && (
        <div className={cn(
          'h-screen p-3 sm:p-4 lg:px-12 lg:py-4 w-full relative overflow-hidden flex flex-col',
          stratLevel === 'danger' && 'bg-red-50',
          stratLevel === 'warning' && 'bg-amber-50/50'
        )}>
          {/* Decorative gradient top */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-b-3xl" />

          <div className="relative z-10 flex-1 flex flex-col gap-3 overflow-y-auto">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3 sm:gap-4">
              {/* Left: Macro indicators */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden animate-fade-in">
                <div className="relative h-14 sm:h-20 overflow-hidden bg-gradient-to-r from-primary/10 via-blue-500/10 to-violet-500/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChartIcon size={32} className="text-primary/30" />
                  </div>
                </div>
                <div className="p-5 space-y-3 -mt-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto -mt-6 border-2 border-card">
                    <ChartIcon size={20} className="text-primary" />
                  </div>
                  <h2 className="font-bold text-center">Kết quả vừa cập nhật</h2>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {[
                      { label: 'Liên minh', desc: 'Đoàn kết giai cấp', value: state.macro.alliance, key: 'alliance', color: 'text-primary', bg: 'bg-emerald-50' },
                      { label: 'Phân hóa', desc: 'Khoảng cách giàu-nghèo', value: state.macro.stratification, key: 'stratification', color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Sản xuất', desc: 'Lực lượng sản xuất', value: state.macro.production, key: 'production', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Đổi mới', desc: 'Sáng tạo công nghệ', value: state.macro.innovation, key: 'innovation', color: 'text-violet-600', bg: 'bg-violet-50' },
                      { label: 'Phúc lợi', desc: 'An sinh xã hội', value: state.macro.welfare, key: 'welfare', color: 'text-pink-500', bg: 'bg-pink-50' },
                      { label: 'Dân chủ', desc: 'Quyết định tập thể', value: state.macro.democracy, key: 'democracy', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    ].map(({ label, desc, value, key, color, bg }) => {
                      const delta = state.macroDelta ? Math.round((state.macroDelta[key as keyof typeof state.macroDelta] ?? 0) * 10) / 10 : 0
                      return (
                        <div key={key} className={cn('rounded-lg p-2', bg)}>
                          <div className="flex items-center justify-center gap-1">
                            <p className={cn(color, 'font-bold tabular-nums text-base')}>{Math.round(value)}</p>
                            {delta !== 0 && (
                              <span className={cn('text-xs font-bold tabular-nums', delta > 0 ? 'text-emerald-500' : 'text-red-500')}>
                                {delta > 0 ? '+' : ''}{delta}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground/80">{label}</p>
                          <p className="text-[10px] text-muted-foreground/60">{desc}</p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Tình huống tiếp theo sắp bắt đầu...</p>
                  </div>
                </div>
              </div>

              {/* Right: Stats + AI */}
              <div className="space-y-4">
                {currentPlayer && roleId && (
                  <MicroStats roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} influence={currentPlayer.influence} resilience={currentPlayer.resilience} allianceContribution={currentPlayer.allianceContribution} choiceCount={currentPlayer.choiceCount} />
                )}
                {state.aiCommentary ? (
                  <div className="rounded-xl border border-primary/20 bg-card p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <BrainIcon size={14} className="text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Bình luận</p>
                    </div>
                    <p className="text-sm leading-relaxed">{state.aiCommentary}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-primary/10 bg-card p-4 flex items-center gap-3 animate-pulse">
                    <BrainIcon size={16} className="text-primary/30" />
                    <p className="text-sm text-muted-foreground/50">AI đang soạn bình luận...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- AI Generating ------------------------------------------------- */}
      {state.phase === 'ai-generating' && (
        <div className="h-screen flex flex-col items-center justify-center p-3 sm:p-4 gap-4 relative overflow-hidden">
          {/* Background pulse effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-2xl px-2 sm:px-4">            <FramedImage
              src="/images/transition-analyzing.png"
              alt="AI đang phân tích"
              variant="card"
              frameClassName="w-40 h-40"
            />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
              <BrainIcon size={32} className="text-primary" />
            </div>
            <h2 className="font-bold text-center text-lg">AI đang phân tích dữ liệu...</h2>
            <p className="text-sm text-muted-foreground text-center">
              Tổng hợp hành vi của {state.playerCount} người chơi qua {state.totalScenarios ?? 10} tình huống
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
            {/* Live streaming news text */}
            {state.socialNews && (
              <div className="glass-card p-4 w-full animate-fade-in mt-4">
                <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                  <BrainIcon size={16} className="animate-pulse" />
                  Bản tin đang được viết...
                </h3>
                <div className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {stripMarkdown(state.socialNews || '')}
                  <span className="inline-block w-1.5 h-3 bg-primary/60 animate-pulse ml-0.5" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Results ------------------------------------------------------- */}
      {state.phase === 'results' && (
        <PlayerResultsView
          state={state}
          myAward={myAward}
          currentPlayer={currentPlayer}
          roleId={roleId}
          playerId={playerId}
        />
      )}
    </>
  )
}

/** Player results with award card below stats */
function PlayerResultsView({
  state,
  myAward,
  currentPlayer,
  roleId,
  playerId,
}: {
  state: RoomStatePublic
  myAward: Award | undefined
  currentPlayer: RoomStatePublic['players'][number] | undefined
  roleId: RoleId | null
  playerId: string | null
}) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    playSound('reveal')
    const t = setTimeout(() => setEntered(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="h-screen w-full relative overflow-y-auto flex flex-col results-galaxy">
      {/* Star particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={`star-${i}`}
          className={cn(
            'absolute rounded-full animate-sparkle pointer-events-none z-0',
            i % 3 === 0 ? 'w-1 h-1 bg-white/25' : 'w-0.5 h-0.5 bg-white/20',
          )}
          style={{
            top: `${3 + ((i * 41) % 90)}%`,
            left: `${2 + ((i * 67) % 94)}%`,
            animationDelay: `${(i * 0.19) % 2.5}s`,
          }}
        />
      ))}

      <div className={cn(
        'relative z-10 flex flex-col gap-3 sm:gap-4 px-3 sm:px-4 lg:px-12 py-4 transition-all duration-700',
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Kết quả hoàn thành</h2>
          <p className="text-sm text-blue-100/80">
            {state.outcome === 'ben-vung' && <><PlantIcon size={18} className="text-emerald-300 inline-block mr-1" /> Chuyển đổi số Bền vững</>}
            {state.outcome === 'dut-gay' && <><BoltIcon size={18} className="text-red-300 inline-block mr-1" /> Đứt gãy Cơ cấu</>}
            {state.outcome === 'trung-tinh' && <><BoltIcon size={18} className="text-amber-300 inline-block mr-1" /> Trạng thái Bất ổn</>}
          </p>
        </div>

        {/* Stats */}
        {currentPlayer && roleId && (
          <div className="rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur-sm p-4">
            <MicroStats darkMode roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} influence={currentPlayer.influence} resilience={currentPlayer.resilience} allianceContribution={currentPlayer.allianceContribution} choiceCount={currentPlayer.choiceCount} />
          </div>
        )}

        {/* Leaderboard: top 5 by totalScore */}
        {state.players && state.players.length > 1 && (
          <div className="rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 bg-amber-600/40">
              <span className="font-bold text-xs uppercase tracking-widest text-amber-200">🏆 Bảng xếp hạng</span>
            </div>
            <div className="divide-y divide-white/10">
              {[...state.players]
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, 5)
                .map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-2 ${p.id === playerId ? 'bg-white/10' : ''}`}>
                    <span className={`text-sm font-bold tabular-nums w-5 text-center ${i === 0 ? 'text-amber-300' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-white/50'}`}>{i + 1}</span>
                    <span className="flex-1 text-sm text-white/90 truncate">{p.name}{p.id === playerId ? ' (bạn)' : ''}</span>
                    <span className="tabular-nums text-sm font-bold text-emerald-300">{p.totalScore > 0 ? '+' : ''}{p.totalScore}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Award card + Social News — side by side on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
          {myAward && (
            <div className="flex-shrink-0 w-[140px] sm:w-[160px] mx-auto sm:mx-0 animate-slide-up">
              <AwardCard award={myAward} index={0} />
            </div>
          )}

          {state.socialNews && (
            <div className="flex-1 min-w-0 rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b bg-blue-600/60 border-white/10 flex items-center gap-2">
                <BrainIcon size={14} className="text-blue-200" />
                <span className="font-bold text-xs uppercase tracking-widest text-white">Bản tin Xã hội Số</span>
              </div>
              <div className="p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-blue-50/90">{stripMarkdown(state.socialNews)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
