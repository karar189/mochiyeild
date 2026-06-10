'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_PALETTE, getDashboardTheme, type DashboardTheme } from '@/lib/dashboard/styles'
import type { TvlPoint } from '@/lib/dashboard/demo-data'

interface DashboardTvlChartProps {
  data: TvlPoint[]
  changeLabel: string
  title?: string
  theme?: DashboardTheme
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  const value = payload[0].value

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#161616] px-3 py-2.5 min-w-[120px]">
      <p className="text-[11px] text-[#71717A] mb-1">Day {label}</p>
      <p className="dash-value text-base text-[#F6F5F2] tabular-nums">${value}M</p>
      <span className="inline-block mt-1.5 text-[10px] font-medium text-[#A6D95B]">
        +3.5%
      </span>
    </div>
  )
}

export function DashboardTvlChart({
  data,
  changeLabel,
  title = 'Portfolio Performance',
  theme = 'light',
}: DashboardTvlChartProps) {
  const t = getDashboardTheme(theme)
  const isDark = theme === 'dark'

  return (
    <div className={`${t.panel} p-5 flex flex-col min-h-[280px]`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={isDark ? 'dash-title text-[#F6F5F2]' : t.title}>{title}</p>
          <p className={`${t.subtitle} mt-0.5`}>Last 30 days</p>
        </div>
        <span className="text-xs font-medium text-[#FF92B3] tabular-nums">{changeLabel}</span>
      </div>

      <div className="h-[200px] w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={t.fillGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF92B3" stopOpacity={isDark ? 0.2 : 0.35} />
                <stop offset="100%" stopColor="#FF92B3" stopOpacity={0} />
              </linearGradient>
            </defs>
            {isDark && (
              <CartesianGrid
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="0"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: t.chartAxis, fontFamily: 'Inter, sans-serif' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              hide={!isDark}
              orientation="left"
              tick={{ fontSize: 10, fill: t.chartAxis, fontFamily: 'Inter, sans-serif' }}
              axisLine={false}
              tickLine={false}
              width={32}
              domain={['dataMin - 5', 'dataMax + 2']}
              tickFormatter={(v) => `${v}k`}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: 'rgba(255,255,255,0.12)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            <Area
              type="monotone"
              dataKey="tvl"
              stroke={isDark ? '#FF92B3' : CHART_PALETTE.primary}
              strokeWidth={2}
              fill={`url(#${t.fillGradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: '#FF92B3',
                stroke: '#F6F5F2',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
