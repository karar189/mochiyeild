'use client'

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLandingStats } from '@/hooks'
import { buildFeeDecayData, calculateFeePercent } from '@/lib/whitepaper/chart-utils'

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#161616] px-3 py-2 min-w-[120px]">
      <p className="text-[10px] text-[#71717A] mb-1">
        {label === 0 ? 'At maturity' : `${label}d to maturity`}
      </p>
      <p className="text-xs text-[#A6D95B] tabular-nums">{payload[0].value.toFixed(2)}% fee</p>
    </div>
  )
}

export function InlineFeeDecayChart() {
  const stats = useLandingStats()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const data = buildFeeDecayData()
  const todayDays =
    stats.isLive && stats.daysToMaturity > 0 && stats.daysToMaturity <= 90
      ? stats.daysToMaturity
      : 45

  return (
    <div className="h-[260px] w-full min-w-0">
      {mounted ? (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="wpFeeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A6D95B" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#A6D95B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="days"
            tick={{ fontSize: 10, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
            ticks={[90, 60, 30, 0]}
            tickFormatter={(v) => (v === 0 ? 'maturity' : `${v}d`)}
          />
          <YAxis
            domain={[0, 1.1]}
            tick={{ fontSize: 10, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
            width={32}
            ticks={[0.05, 0.5, 1]}
            tickFormatter={(v) => `${v}%`}
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
          <Area
            type="monotone"
            dataKey="fee"
            stroke="#A6D95B"
            strokeWidth={2}
            fill="url(#wpFeeFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-lg bg-white/[0.02] animate-pulse" />
      )}
      <p className="text-[10px] text-[#71717A] mt-2 text-right tabular-nums">
        Today: {stats.isLive ? stats.currentFeeFormatted : `${calculateFeePercent(todayDays).toFixed(2)}%`}
      </p>
    </div>
  )
}
