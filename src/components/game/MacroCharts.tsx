'use client'

import dynamic from 'next/dynamic'
import type { MacroState } from '@/types/game'

const MacroChartsClient = dynamic(
  () => import('@/components/game/MacroChartsClient'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
)

interface MacroChartsProps {
  macro: MacroState
}

export function MacroCharts({ macro }: MacroChartsProps) {
  return (
    <MacroChartsClient
      history={macro.history}
      current={{
        alliance: macro.alliance,
        stratification: macro.stratification,
        production: macro.production,
        innovation: macro.innovation,
        welfare: macro.welfare,
        democracy: macro.democracy,
      }}
    />
  )
}
