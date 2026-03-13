'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePlayerStore } from '@/stores/player-store'
import { RoleCard } from '@/components/game/RoleCard'
import { ScenarioCard } from '@/components/game/ScenarioCard'
import { ChoiceButton } from '@/components/game/ChoiceButton'
import { CountdownTimer } from '@/components/game/CountdownTimer'
import { MicroStats } from '@/components/game/MicroStats'
import { BrainIcon, PlantIcon, BoltIcon, ChartIcon } from '@/components/icons'
import type { RoomStatePublic, ChoiceId } from '@/types/game'

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

  const currentPlayer = state?.players.find((p) => p.id === playerId)

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${pin}/state`)
      if (!res.ok) return
      const data: RoomStatePublic = await res.json()
      setState((prev) => {
        // Reset choice state when scenario changes
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

  useEffect(() => {
    if (!playerId || !roleId) {
      router.replace(`/join?pin=${pin}`)
      return
    }
    fetchState()
    const id = setInterval(fetchState, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchState, playerId, roleId, pin, router])

  async function submitChoice(choiceId: ChoiceId) {
    if (submitted || !playerId) return
    setSelectedChoice(choiceId)
    setSubmitted(true)
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

  // ─── Lobby ────────────────────────────────────────────────────────────────
  if (state.phase === 'lobby') {
    return (
      <div className="min-h-screen p-4 space-y-4 max-w-sm mx-auto py-8">
        {roleId && playerName && (
          <RoleCard roleId={roleId} playerName={playerName} />
        )}
        <div className="rounded-2xl border border-border bg-card p-5 text-center space-y-2">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse mx-auto" />
          <p className="font-semibold">Chờ giảng viên bắt đầu...</p>
          <p className="text-sm text-muted-foreground">{state.playerCount} người đã tham gia</p>
        </div>
        {currentPlayer && roleId && (
          <MicroStats roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} />
        )}
      </div>
    )
  }

  // ─── Playing ─────────────────────────────────────────────────────────────
  if (state.phase === 'playing' && scenario && state.scenarioStartedAt) {
    return (
      <div className="min-h-screen p-4 space-y-4 max-w-sm mx-auto py-6">
        <div className="flex items-center justify-between">
          <CountdownTimer startedAt={state.scenarioStartedAt} duration={30} />
          {currentPlayer && roleId && (
            <MicroStats roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} className="text-right" />
          )}
        </div>

        <ScenarioCard
          scenario={scenario}
          scenarioNumber={state.currentScenarioIndex + 1}
          totalScenarios={state.totalScenarios}
        />

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Lựa chọn của bạn</p>
          {scenario.choices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              selected={selectedChoice === choice.id}
              submitted={submitted}
              disabled={submitted && selectedChoice !== choice.id}
              onClick={submitChoice}
            />
          ))}
        </div>

        {submitted && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-center text-sm text-primary animate-fade-in">
            Đã ghi nhận lựa chọn ✓
          </div>
        )}
      </div>
    )
  }

  // ─── Between ──────────────────────────────────────────────────────────────
  if (state.phase === 'between') {
    return (
      <div className="min-h-screen p-4 space-y-4 max-w-sm mx-auto py-8">
        <div className="rounded-2xl border border-border bg-card p-5 text-center space-y-3 animate-fade-in">
          <ChartIcon size={30} className="text-primary mx-auto" />
          <h2 className="font-bold">Kết quả vừa cập nhật</h2>
          <p className="text-sm text-muted-foreground">
            Liên minh: <span className="text-primary font-bold">{Math.round(state.macro.alliance)}</span> ·
            Phân hóa: <span className="text-amber-400 font-bold">{Math.round(state.macro.stratification)}</span>
          </p>
          <p className="text-sm text-muted-foreground">Tình huống tiếp theo sắp bắt đầu...</p>
        </div>
        {currentPlayer && roleId && (
          <MicroStats roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} />
        )}
      </div>
    )
  }

  // ─── AI Generating ───────────────────────────────────────────────────────
  if (state.phase === 'ai-generating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        <BrainIcon size={40} className="text-primary animate-pulse" />
        <h2 className="font-bold text-center">AI đang phân tích dữ liệu...</h2>
        <p className="text-sm text-muted-foreground text-center">
          Tổng hợp hành vi của {state.playerCount} người chơi
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ─── Results ──────────────────────────────────────────────────────────────
  if (state.phase === 'results') {
    const myAward = state.awards?.find((a) => a.playerId === playerId)
    return (
      <div className="min-h-screen p-4 space-y-4 max-w-sm mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-xl font-bold">Kết quả hoàn thành</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {state.outcome === 'ben-vung' && <><PlantIcon size={18} className="text-emerald-400 inline-block mr-1" /> Chuyển đổi số Bền vững</>}
            {state.outcome === 'dut-gay' && <><BoltIcon size={18} className="text-red-400 inline-block mr-1" /> Đứt gãy Cơ cấu</>}
            {state.outcome === 'trung-tinh' && <><BoltIcon size={18} className="text-amber-400 inline-block mr-1" /> Trạng thái Bất ổn</>}
          </p>
        </div>

        {myAward && (
          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 text-center space-y-2 animate-slide-up">
            <div className="text-4xl">{myAward.icon}</div>
            <h3 className="font-bold text-primary">{myAward.name}</h3>
            <p className="text-sm text-muted-foreground">{myAward.reason}</p>
          </div>
        )}

        {currentPlayer && roleId && (
          <MicroStats roleId={roleId} wealth={currentPlayer.wealth} control={currentPlayer.control} />
        )}

        {state.socialNews && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Bản tin Xã hội 2030</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{state.socialNews}</p>
          </div>
        )}
      </div>
    )
  }

  return null
}
