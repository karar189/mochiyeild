'use client'

import { AppPageShell } from '@/components/AppPageShell'
import { PoolCard } from '@/components/PoolCard'
import { ImpliedRateGauge } from '@/components/ImpliedRateGauge'
import { FeeDecayVisualizer } from '@/components/FeeDecayVisualizer'
import { ParityDriftAlert } from '@/components/ParityDriftAlert'
import { useHookEvents, useMochiConfig, usePoolState } from '@/hooks'

export default function MarketsPage() {
  const { pools, isConfigured } = useMochiConfig()
  const {
    ptPrice,
    ytPrice,
    underlyingPrice,
    impliedAPY,
    timeToMaturity,
    currentFee,
  } = usePoolState()
  const { events } = useHookEvents()

  const recentEvents = events.slice(0, 3)

  return (
    <AppPageShell
      title="Markets"
      subtitle="Trade PT and YT tokens. Fees adapt based on time-to-maturity."
    >
      <div className="mb-8">
        <ParityDriftAlert
          ptPrice={ptPrice}
          ytPrice={ytPrice}
          underlyingPrice={underlyingPrice}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <PoolCard
              type="PT"
              price={ptPrice}
              liquidity={isConfigured ? 500000 : 0}
              volume24h={0}
              fee={currentFee || 42}
              priceChange24h={0}
              pool={pools?.pt ?? null}
            />
            <PoolCard
              type="YT"
              price={ytPrice}
              liquidity={isConfigured ? 500000 : 0}
              volume24h={0}
              fee={currentFee || 42}
              priceChange24h={0}
              pool={pools?.yt ?? null}
            />
          </div>

          <FeeDecayVisualizer currentTimeToMaturity={timeToMaturity || 28 * 24 * 60 * 60} />
        </div>

        <div className="space-y-6">
          <ImpliedRateGauge
            impliedAPY={impliedAPY}
            ptPrice={ptPrice}
            timeToMaturity={timeToMaturity}
          />

          <div className="card">
            <h3 className="font-medium text-primary mb-4">Market Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Value Locked</span>
                <span className="text-primary font-medium">
                  {isConfigured ? '~1,000 ETH' : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Dynamic Fee</span>
                <span className="text-primary font-medium">
                  {((currentFee || 42) / 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Implied APY</span>
                <span className="text-[#A6D95B] font-medium">
                  {(impliedAPY / 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-primary font-medium">Recent Hook Events</h3>
              <a href="/analytics" className="text-[#A6D95B] text-sm hover:underline">
                View All
              </a>
            </div>
            <div className="space-y-2">
              {recentEvents.length === 0 ? (
                <p className="text-muted text-xs">No events yet — swap to trigger hook activity.</p>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-2 bg-cream rounded-xl">
                    <span className="text-secondary text-xs capitalize">{event.type.replace('_', ' ')}</span>
                    <span className="text-primary text-sm font-medium">
                      {event.type === 'fee_adjusted'
                        ? `${(Number(event.data.newFeeBps) / 100).toFixed(2)}%`
                        : event.type === 'implied_rate'
                          ? `${Number(event.data.impliedAPY).toFixed(1)}%`
                          : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppPageShell>
  )
}
