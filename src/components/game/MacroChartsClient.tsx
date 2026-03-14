'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MacroSnapshot } from '@/types/game'

interface MacroChartsClientProps {
  history: MacroSnapshot[]
  current: MacroSnapshot
}

export default function MacroChartsClient({ history, current }: MacroChartsClientProps) {
  const data = [
    { name: 'Khởi đầu', alliance: 50, stratification: 30, production: 50, innovation: 40, welfare: 45, democracy: 40 },
    ...history.map((h, i) => ({
      name: `T${i + 1}`,
      alliance: Math.round(h.alliance),
      stratification: Math.round(h.stratification),
      production: Math.round(h.production),
      innovation: Math.round(h.innovation),
      welfare: Math.round(h.welfare),
      democracy: Math.round(h.democracy),
    })),
    ...(history.length > 0
      ? [{
          name: 'Hiện tại',
          alliance: Math.round(current.alliance),
          stratification: Math.round(current.stratification),
          production: Math.round(current.production),
          innovation: Math.round(current.innovation),
          welfare: Math.round(current.welfare),
          democracy: Math.round(current.democracy),
        }]
      : []),
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8 }}
          labelStyle={{ color: '#475569' }}
        />
        <Legend wrapperStyle={{ fontSize: 13, color: '#475569' }} />
        <Line type="monotone" dataKey="alliance" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4 }} name="Liên minh" />
        <Line type="monotone" dataKey="stratification" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Phân hóa" />
        <Line type="monotone" dataKey="production" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 4 }} name="Sản xuất" />
        <Line type="monotone" dataKey="innovation" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" name="Đổi mới" />
        <Line type="monotone" dataKey="welfare" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" name="Phúc lợi" />
        <Line type="monotone" dataKey="democracy" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" name="Dân chủ" />
      </LineChart>
    </ResponsiveContainer>
  )
}
