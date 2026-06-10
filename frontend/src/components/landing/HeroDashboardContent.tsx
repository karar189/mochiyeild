'use client'

import { useLandingStats } from '@/hooks'
import {
  DEMO_KPIS,
  DEMO_TVL_SERIES,
  DEMO_TOP_MARKETS,
  type KpiMetric,
} from '@/lib/dashboard/demo-data'
import { getDashboardTheme } from '@/lib/dashboard/styles'
import { DashboardSidebar } from './dashboard/DashboardSidebar'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { DashboardKpiStrip } from './dashboard/DashboardKpiStrip'
import { DashboardTvlChart } from './dashboard/DashboardTvlChart'
import { DashboardTopMarkets } from './dashboard/DashboardTopMarkets'

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

/** Dense dashboard UI for hero embed — flat pink-tinted Helios style */
export function HeroDashboardContent() {
  const stats = useLandingStats()
  const isLive = stats.isLive
  const t = getDashboardTheme('dark')

  const kpis = isLive ? buildLiveKpis(stats) : DEMO_KPIS
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
    : DEMO_TOP_MARKETS.slice(0, 3)

  const tvlChange = isLive ? stats.impliedAPYFormatted : '+12.4%'

  return (
    <div className={`hero-dashboard relative flex min-h-[480px] ${t.mainBg}`}>
      <DashboardSidebar theme="dark" />

      <div className="flex-1 p-4 sm:p-5 lg:p-6 min-w-0 flex flex-col">
        <DashboardHeader />

        <div className="space-y-4 flex-1">
          <DashboardKpiStrip metrics={kpis} theme="dark" />

          <div className="grid lg:grid-cols-12 gap-3">
            <div className="lg:col-span-7">
              <DashboardTvlChart
                data={DEMO_TVL_SERIES}
                changeLabel={tvlChange}
                theme="dark"
              />
            </div>
            <div className="lg:col-span-5">
              <DashboardTopMarkets markets={topMarkets} theme="dark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
