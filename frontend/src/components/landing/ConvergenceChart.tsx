'use client'

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
import { MotionSection } from '@/components/motion'

const TERM_DAYS = 90
const YT_START = 0.42

// Illustrative convergence: underlying normalized to 1.0, so PT + YT = 1.0.
// YT decays toward 0 as yield runs out; PT rises toward 1.0 (redeems 1:1).
function buildData() {
  const data: { days: number; pt: number; yt: number }[] = []
  for (let days = TERM_DAYS; days >= 0; days -= 2) {
    const t = days / TERM_DAYS
    const yt = YT_START * Math.pow(t, 1.25)
    data.push({ days, yt, pt: 1 - yt })
  }
  return data
}

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
    <div className="rounded-xl border border-white/[0.08] bg-[#161616] px-3 py-2.5 min-w-[140px]">
      <p className="text-[11px] text-[#71717A] mb-1.5">
        {label === 0 ? 'At maturity' : `${label}d to maturity`}
      </p>
      <p className="text-sm text-[#A6D95B] tabular-nums">PT {pt.toFixed(3)}</p>
      <p className="text-sm text-[#FF92B3] tabular-nums">YT {yt.toFixed(3)}</p>
    </div>
  )
}

export function ConvergenceChart() {
  const stats = useLandingStats()

  const data = buildData()
  const todayDays =
    stats.isLive && stats.daysToMaturity > 0 && stats.daysToMaturity <= TERM_DAYS
      ? stats.daysToMaturity
      : 45

  return (
    <MotionSection className="section-padding py-24 lg:py-32">
      <div className="content-max">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#FF92B3] mb-4">
              PT / YT CONVERGENCE
            </p>
            <h2 className="font-clash text-4xl md:text-5xl font-semibold text-[#F6F5F2]">
              From now to maturity.
            </h2>
            <p className="mt-5 text-[#A1A1AA] text-base leading-relaxed max-w-md">
              Split one yield-bearing asset into two. PT climbs toward{' '}
              <span className="text-[#D8F2C2]">1.0</span> and redeems for
              principal at maturity. YT carries the yield and decays toward{' '}
              <span className="text-[#FFB4C8]">0</span> as it&apos;s earned.
              Together they always reconcile to the underlying — that&apos;s the
              parity the hook watches.
            </p>
            <div className="mt-7 flex flex-wrap gap-5">
              <span className="inline-flex items-center gap-2 text-sm text-[#A1A1AA]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#A6D95B]" />
                Principal Token (PT)
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-[#A1A1AA]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF92B3]" />
                Yield Token (YT)
              </span>
            </div>
          </div>

          <div className="rounded-[32px] bg-[#0C0C0C] border border-white/[0.06] p-6 sm:p-8">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
                  >
                    <ReferenceArea
                      x1={TERM_DAYS}
                      x2={todayDays}
                      fill="#FFFFFF"
                      fillOpacity={0.025}
                    />
                    <ReferenceLine
                      y={1}
                      stroke="rgba(255,255,255,0.22)"
                      strokeDasharray="4 4"
                      label={{
                        value: 'underlying = 1.0',
                        position: 'insideBottomLeft',
                        fill: '#D4D4D8',
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    />
                    <XAxis
                      dataKey="days"
                      tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'Inter, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                      ticks={[90, 60, 30, 0]}
                      tickFormatter={(v) => (v === 0 ? 'maturity' : `${v}d`)}
                    />
                    <YAxis
                      domain={[0, 1.08]}
                      tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'Inter, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                      ticks={[0, 0.5, 1]}
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
                    <Line
                      type="monotone"
                      dataKey="pt"
                      stroke="#A6D95B"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: '#A6D95B' }}
                      isAnimationActive
                      animationDuration={900}
                    />
                    <Line
                      type="monotone"
                      dataKey="yt"
                      stroke="#FF92B3"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: '#FF92B3' }}
                      isAnimationActive
                      animationDuration={900}
                    />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-xs text-[#71717A]">
              Illustrative — normalized to underlying = 1.0. Shaded band marks
              yield earned so far.
            </p>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
