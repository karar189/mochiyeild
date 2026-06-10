'use client'

import { TokenIcon } from '@/components/TokenIcon'
import {
  DASHBOARD_ACCENTS,
  getDashboardTheme,
  marketAccent,
  type DashboardTheme,
} from '@/lib/dashboard/styles'
import type { TopMarket } from '@/lib/dashboard/demo-data'

interface DashboardTopMarketsProps {
  markets: TopMarket[]
  title?: string
  theme?: DashboardTheme
}

const FILTER_TABS = ['Most Viewed', 'Gain', 'Lose'] as const

export function DashboardTopMarkets({
  markets,
  title = 'Watchlist',
  theme = 'light',
}: DashboardTopMarketsProps) {
  const t = getDashboardTheme(theme)
  const isDark = theme === 'dark'

  return (
    <div className={`${t.panel} p-5 flex flex-col min-h-[280px]`}>
      <p className={`${isDark ? 'dash-title text-[#F6F5F2]' : t.title} mb-3`}>{title}</p>

      {isDark && (
        <div className="flex items-center gap-2 mb-4">
          {FILTER_TABS.map((tab) => (
            <span
              key={tab}
              className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                tab === 'Most Viewed' ? 'dash-pill-active' : 'dash-pill'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1">
        {markets.map((market, i) => {
          const accentKey = isDark ? marketAccent(market.name) : null
          const accent = accentKey ? DASHBOARD_ACCENTS[accentKey] : null

          return (
            <div
              key={market.name}
              className={`flex items-center gap-3 py-3 ${
                i > 0 ? `border-t ${t.divider}` : ''
              }`}
            >
              <TokenIcon label={market.name} size={32} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${t.label}`}>{market.name}</p>
                <p className={`text-xs mt-0.5 ${t.muted}`}>{market.tvl}</p>
              </div>
              <span
                className={`text-sm font-semibold tabular-nums shrink-0 ${
                  isDark && accent
                    ? accent.badgeBg
                    : market.positive
                      ? 'text-[#A6D95B]'
                      : 'text-[#FF92B3]'
                }`}
              >
                {market.apy}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
