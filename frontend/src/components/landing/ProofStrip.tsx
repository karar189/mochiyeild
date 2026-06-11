'use client'

import { Activity } from 'lucide-react'
import { useLandingStats } from '@/hooks'
import { MotionSection } from '@/components/motion'

export function ProofStrip() {
  const stats = useLandingStats()
  const isLive = stats.isLive

  const metrics = [
    {
      label: 'TVL',
      value: isLive ? `${stats.tvl} wstETH` : '— wstETH',
    },
    {
      label: 'Current fee',
      value: isLive ? stats.currentFeeFormatted : '—',
    },
    {
      label: 'Days to maturity',
      value: isLive ? String(stats.daysToMaturity) : '—',
    },
    {
      label: 'Parity drift',
      value: isLive ? `${stats.parityDriftPercent}%` : '—',
    },
  ]

  return (
    <MotionSection className="section-padding py-24 lg:py-32">
      <div className="content-max">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#FF92B3] mb-4">
              PROOF
            </p>
            <h2 className="font-clash text-4xl md:text-5xl font-semibold text-[#F6F5F2]">
              Live numbers, straight from the hook.
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold border ${
              isLive
                ? 'text-[#D8F2C2] bg-[#A6D95B]/12 border-[#A6D95B]/30'
                : 'text-[#A1A1AA] bg-white/[0.04] border-white/[0.1]'
            }`}
          >
            <Activity
              className={`w-3 h-3 ${isLive ? 'animate-pulse' : ''}`}
              strokeWidth={2.5}
            />
            {isLive ? 'Live on-chain' : 'Demo data — connect to a deployed network'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[28px] bg-[#101010] border border-white/[0.06] p-7"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                {m.label}
              </p>
              <p
                className={`mt-3 font-clash text-3xl font-semibold tracking-tight ${
                  isLive ? 'text-[#F6F5F2]' : 'text-[#52525B]'
                }`}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {!isLive && (
          <p className="mt-6 text-xs text-[#71717A]">
            Figures populate from <code className="font-mono">useLandingStats()</code>{' '}
            once connected to a network with a mochiyeild deployment.
          </p>
        )}
      </div>
    </MotionSection>
  )
}
