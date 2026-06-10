'use client'

import { Radio } from 'lucide-react'
import { useLandingStats } from '@/hooks'
import {
  DEMO_KPIS,
  DEMO_TVL_SERIES,
  DEMO_TOP_MARKETS,
  DEMO_YIELD_SLICES,
  DEMO_FOOTER_STATS,
  type KpiMetric,
} from '@/lib/dashboard/demo-data'
import { dashboardStyles } from '@/lib/dashboard/styles'
import { DashboardSidebar, DashboardSidebarMobile } from './dashboard/DashboardSidebar'
import { DashboardKpiStrip } from './dashboard/DashboardKpiStrip'
import { DashboardTvlChart } from './dashboard/DashboardTvlChart'
import { DashboardTopMarkets } from './dashboard/DashboardTopMarkets'
import { DashboardYieldDonut } from './dashboard/DashboardYieldDonut'
import { DashboardFooterBar } from './dashboard/DashboardFooterBar'

function buildLiveKpis(stats: ReturnType<typeof useLandingStats>): KpiMetric[] {
  return [
    {
      label: 'Total Value Locked',
      value: `${stats.tvl} wstETH`,
      change: stats.impliedAPYFormatted,
      positive: stats.impliedAPY >= 0,
    },
    {
      label: 'Implied APY',
      value: stats.impliedAPYFormatted,
      change: `PT @ ${stats.ptPriceEth} ETH`,
      positive: true,
    },
    {
      label: 'Pool Fee',
      value: stats.currentFeeFormatted,
      change: `${stats.daysToMaturity}d to maturity`,
      positive: true,
    },
    {
      label: 'Parity Drift',
      value: `${stats.parityDriftPercent}%`,
      change: 'PT + YT vs underlying',
      positive: true,
    },
  ]
}

export function DashboardPreview() {
  const stats = useLandingStats()
  const isLive = stats.isLive

  const kpis = isLive ? buildLiveKpis(stats) : DEMO_KPIS
  const tvlSeries = DEMO_TVL_SERIES
  const topMarkets = isLive
    ? [
        {
          name: 'wstETH PT',
          tvl: `${stats.ptPriceEth} ETH`,
          apy: stats.impliedAPYFormatted,
          positive: stats.impliedAPY >= 0,
        },
        {
          name: 'wstETH YT',
          tvl: `${stats.ytPriceEth} ETH`,
          apy: stats.currentFeeFormatted + ' fee',
          positive: true,
        },
      ]
    : DEMO_TOP_MARKETS

  const tvlChange = isLive ? stats.impliedAPYFormatted : '+12.4%'
  const periodLabel = isLive && stats.maturityLabel ? stats.maturityLabel : 'Last 30 days'

  return (
    <section className="section-padding pb-20 lg:pb-28">
      <div className="content-max">
        <div className="text-center mb-10 lg:mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#A6D95B] mb-3">
            PRODUCT PREVIEW
          </p>
          <h2 className="font-clash text-3xl sm:text-4xl font-semibold text-[#F6F5F2]">
            Your yield command center.
          </h2>
          <p className="mt-3 text-[#A1A1AA] text-sm sm:text-base max-w-lg mx-auto">
            Track TVL, monitor markets, and manage PT / YT positions — all in one place.
          </p>
        </div>

        {isLive && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-[#A6D95B]">
            <Radio className="w-4 h-4 animate-pulse" strokeWidth={2} />
            <span>Live data from Anvil — connect wallet on chain 31337</span>
          </div>
        )}

        <div className={dashboardStyles.shell}>
          <div className="flex min-h-[520px] lg:min-h-[580px]">
            <DashboardSidebar />

            <div className="flex-1 p-5 sm:p-6 lg:p-8 min-w-0 flex flex-col bg-white">
              <DashboardSidebarMobile />

              <div className="flex items-center justify-between gap-3 mb-6 mt-4 sm:mt-0">
                <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {periodLabel}
                </span>
              </div>

              <div className="space-y-4 sm:space-y-5 flex-1">
                <DashboardKpiStrip metrics={kpis} />

                <div className="grid lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7">
                    <DashboardTvlChart data={tvlSeries} changeLabel={tvlChange} />
                  </div>
                  <div className="lg:col-span-5">
                    <DashboardTopMarkets markets={topMarkets} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-5">
                    <DashboardYieldDonut slices={DEMO_YIELD_SLICES} />
                  </div>
                  <div className="lg:col-span-7">
                    <DashboardFooterBar stats={DEMO_FOOTER_STATS} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
