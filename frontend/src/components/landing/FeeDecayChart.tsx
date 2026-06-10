'use client'

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
import { MotionSection } from '@/components/motion'

const MAX_FEE_BPS = 100
const MIN_FEE_BPS = 5
const MAX_FEE_DAYS = 90
const MIN_FEE_DAYS = 7

// Mirrors MochiYieldHook.calculateFeeForMaturity (whitepaper §3).
function calculateFeePercent(days: number): number {
  if (days >= MAX_FEE_DAYS) return MAX_FEE_BPS / 100
  if (days <= MIN_FEE_DAYS) return MIN_FEE_BPS / 100
  const range = MAX_FEE_BPS - MIN_FEE_BPS
  const timeRange = MAX_FEE_DAYS - MIN_FEE_DAYS
  const fromMax = MAX_FEE_DAYS - days
  return (MAX_FEE_BPS - (range * fromMax) / timeRange) / 100
}

function buildData() {
  const data: { days: number; fee: number }[] = []
  for (let days = MAX_FEE_DAYS; days >= 0; days -= 2) {
    data.push({ days, fee: calculateFeePercent(days) })
  }
  return data
}

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
    <div className="rounded-xl border border-white/[0.08] bg-[#161616] px-3 py-2.5 min-w-[130px]">
      <p className="text-[11px] text-[#71717A] mb-1">
        {label === 0 ? 'At maturity' : `${label}d to maturity`}
      </p>
      <p className="text-sm text-[#A6D95B] tabular-nums">
        {payload[0].value.toFixed(2)}% fee
      </p>
    </div>
  )
}

export function FeeDecayChart() {
  const stats = useLandingStats()

  const data = buildData()
  const todayDays =
    stats.isLive && stats.daysToMaturity > 0 && stats.daysToMaturity <= MAX_FEE_DAYS
      ? stats.daysToMaturity
      : 45
  const currentFee = stats.isLive
    ? stats.currentFeeFormatted
    : `${calculateFeePercent(todayDays).toFixed(2)}%`

  return (
    <MotionSection className="section-padding py-24 lg:py-32">
      <div className="content-max">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 rounded-[32px] bg-[#0C0C0C] border border-white/[0.06] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#A1A1AA]">
                Swap fee
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#A6D95B]/12 border border-[#A6D95B]/30 px-3 py-1 text-xs font-semibold text-[#D8F2C2]">
                Current {currentFee}
              </span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="feeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A6D95B" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#A6D95B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="days"
                      tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'Inter, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                      ticks={[90, 60, 30, 0]}
                      tickFormatter={(v) => (v === 0 ? 'maturity' : `${v}d`)}
                    />
                    <YAxis
                      domain={[0, 1.1]}
                      tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'Inter, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      ticks={[0.05, 0.5, 1]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{
                        stroke: 'rgba(255,255,255,0.12)',
                        strokeWidth: 1,
                        strokeDasharray: '4 4',
                      }}
                    />
                    <ReferenceLine
                      x={todayDays}
                      stroke="#F6F5F2"
                      strokeOpacity={0.45}
                      strokeDasharray="3 3"
                      label={{
                        value: 'Today',
                        position: 'top',
                        fill: '#F6F5F2',
                        fontSize: 10,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="fee"
                      stroke="#A6D95B"
                      strokeWidth={2.5}
                      fill="url(#feeFill)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#A6D95B' }}
                      isAnimationActive
                      animationDuration={900}
                    />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold tracking-[0.2em] text-[#A6D95B] mb-4">
              MATURITY FEE CURVE
            </p>
            <h2 className="font-clash text-4xl md:text-5xl font-semibold text-[#F6F5F2]">
              Fees scale with risk.
            </h2>
            <p className="mt-5 text-[#A1A1AA] text-base leading-relaxed max-w-md">
              ~1% far from maturity, decaying to ~0.05% near redemption.
              Volatility falls as PT approaches par, so LP compensation tracks
              the risk that&apos;s actually there — not a flat number that
              overpays early and underpays late.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 max-w-sm">
              <div className="rounded-2xl border border-white/[0.06] bg-[#101010] p-4">
                <p className="text-xs text-[#A1A1AA]">Far ({'>'}90d)</p>
                <p className="mt-1 font-clash text-2xl font-semibold text-[#F6F5F2]">
                  1.00%
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#101010] p-4">
                <p className="text-xs text-[#A1A1AA]">Near ({'<'}7d)</p>
                <p className="mt-1 font-clash text-2xl font-semibold text-[#D8F2C2]">
                  0.05%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
