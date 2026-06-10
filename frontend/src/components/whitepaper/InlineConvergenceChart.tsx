'use client'

import { useEffect, useState } from 'react'
import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLandingStats } from '@/hooks'
import { buildConvergenceData, TERM_DAYS } from '@/lib/whitepaper/chart-utils'

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  const pt = payload.find((p) => p.dataKey === 'pt')?.value ?? 0
  const yt = payload.find((p) => p.dataKey === 'yt')?.value ?? 0
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#161616] px-3 py-2 min-w-[130px]">
      <p className="text-[10px] text-[#71717A] mb-1">
        {label === 0 ? 'At maturity' : `${label}d to maturity`}
      </p>
      <p className="text-xs text-[#A6D95B] tabular-nums">PT {pt.toFixed(3)}</p>
      <p className="text-xs text-[#FF92B3] tabular-nums">YT {yt.toFixed(3)}</p>
    </div>
  )
}

export function InlineConvergenceChart() {
  const stats = useLandingStats()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const data = buildConvergenceData()
  const todayDays =
    stats.isLive && stats.daysToMaturity > 0 && stats.daysToMaturity <= TERM_DAYS
      ? stats.daysToMaturity
      : 45

  return (
    <div className="h-[260px] w-full min-w-0">
      {mounted ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
          <ReferenceArea x1={TERM_DAYS} x2={todayDays} fill="#FFFFFF" fillOpacity={0.03} />
          <ReferenceLine
            y={1}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="days"
            tick={{ fontSize: 10, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
            ticks={[90, 60, 30, 0]}
            tickFormatter={(v) => (v === 0 ? 'maturity' : `${v}d`)}
          />
          <YAxis
            domain={[0, 1.08]}
            tick={{ fontSize: 10, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
            width={28}
            ticks={[0, 0.5, 1]}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }}
          />
          <ReferenceLine
            x={todayDays}
            stroke="#F6F5F2"
            strokeOpacity={0.4}
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="pt"
            stroke="#A6D95B"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="yt"
            stroke="#FF92B3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-lg bg-white/[0.02] animate-pulse" />
      )}
    </div>
  )
}
