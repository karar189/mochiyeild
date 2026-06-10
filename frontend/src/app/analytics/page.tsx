'use client'

import { HookEventFeed } from '@/components/HookEventFeed'
import { ImpliedRateGauge } from '@/components/ImpliedRateGauge'
import { FeeDecayVisualizer } from '@/components/FeeDecayVisualizer'
import { ParityDriftAlert } from '@/components/ParityDriftAlert'
import { MaturityCountdown } from '@/components/MaturityCountdown'
import { Zap, Shield, Activity } from 'lucide-react'
import { useHookEvents, usePoolState, useVaultState } from '@/hooks'

export default function AnalyticsPage() {
  const { events } = useHookEvents()
  const {
    ptPrice,
    ytPrice,
    underlyingPrice,
    impliedAPY,
    timeToMaturity,
    currentFee,
  } = usePoolState()
  const { maturity } = useVaultState()

  const feeEvents = events.filter((e) => e.type === 'fee_adjusted').length
  const swapRejected = events.filter((e) => e.type === 'swap_rejected').length

  return (
    <div className="min-h-screen py-12 pt-24 section-padding">
      <div className="content-max">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Hook Analytics
          </h1>
          <p className="text-secondary max-w-xl mx-auto">
            Real-time monitoring of MochiTrade hook activity. Watch the protocol adapt.
          </p>
        </div>

        <div className="mb-8">
          <ParityDriftAlert
            ptPrice={ptPrice || 0.97e18}
            ytPrice={ytPrice || 0.03e18}
            underlyingPrice={underlyingPrice || 1e18}
          />
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Activity, label: 'Events (session)', value: String(events.length), color: 'text-success' },
            { icon: Zap, label: 'Fee Adjustments', value: String(feeEvents), color: 'text-success' },
            { icon: Shield, label: 'Swaps Protected', value: String(swapRejected), color: 'text-primary' },
            { icon: null, label: 'Current Fee', value: `${((currentFee || 42) / 100).toFixed(2)}%`, color: 'text-primary' },
          ].map((stat) => (
            <div key={stat.label} className="card py-4">
              <div className="flex items-center gap-2 mb-2">
                {stat.icon && (
                  <stat.icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.75} />
                )}
                <span className="text-muted text-sm">{stat.label}</span>
              </div>
              <div className="text-2xl font-semibold text-primary">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HookEventFeed />
          </div>

          <div className="space-y-6">
            <ImpliedRateGauge
              impliedAPY={impliedAPY || 0}
              ptPrice={ptPrice || 0.97e18}
              timeToMaturity={timeToMaturity || 28 * 24 * 60 * 60}
            />

            <MaturityCountdown maturityTimestamp={maturity} />

            <FeeDecayVisualizer currentTimeToMaturity={timeToMaturity || 28 * 24 * 60 * 60} />
          </div>
        </div>

        <div className="mt-12 card">
          <h2 className="text-2xl font-bold text-primary mb-6">
            How the Hook Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Implied Rate Sentinel',
                desc: 'Before each swap, the hook calculates the implied APY from the PT price. If the swap would result in a negative yield, the hook emits an alert and can reject the transaction.',
              },
              {
                num: '2',
                title: 'Maturity Fee Decay',
                desc: 'Swap fees automatically decrease as maturity approaches. Far from maturity (90+ days): 1% fee. Near maturity (7 days): 0.05% fee.',
              },
              {
                num: '3',
                title: 'Cross-Pool Parity',
                desc: 'The hook monitors both PT and YT pools simultaneously. When PT + YT combined value drifts more than 5% from the underlying price, it emits a ParityDriftDetected event.',
              },
            ].map((item) => (
              <div key={item.num}>
                <div className="w-10 h-10 bg-yield-green rounded-xl flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">{item.num}</span>
                </div>
                <h3 className="text-primary font-semibold mb-2">{item.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
