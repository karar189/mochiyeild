'use client'

import Link from 'next/link'
import { ChevronRight, TrendingUp, ArrowUpRight, Activity } from 'lucide-react'
import { TokenIcon } from '@/components/TokenIcon'
import { useLandingStats } from '@/hooks'

const SPARK_BARS = [
  36, 38, 37, 40, 39, 42, 41, 44, 43, 46, 45, 48, 47, 50, 49, 52, 51, 54, 53, 56,
  55, 58, 57, 60, 59, 62, 61, 64, 63, 66, 65, 68, 67, 70, 69, 72, 71, 74, 73, 76,
  75, 78, 77, 80, 79, 82, 81, 84, 83, 86, 85, 88, 87, 90, 89, 92, 91, 94, 93, 96,
]

function Sparkline() {
  return (
    <div className="flex items-end justify-between gap-[2px] h-14 w-full" aria-hidden>
      {SPARK_BARS.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full shrink-0"
          style={{
            height: `${h}%`,
            background: 'linear-gradient(to top, #A6D95B 0%, #C8E890 55%, #E8F5D0 100%)',
            opacity: 0.45 + (i / SPARK_BARS.length) * 0.55,
          }}
        />
      ))}
    </div>
  )
}

interface HeroMarketCardsProps {
  compact?: boolean
  showPopularMarkets?: boolean
}

export function HeroMarketCards({
  compact = false,
  showPopularMarkets = true,
}: HeroMarketCardsProps) {
  const stats = useLandingStats()

  const tvlDisplay = stats.isLive ? `${stats.tvl} wstETH` : '$125.4M'
  const activeMarkets = stats.isLive ? String(stats.activeMarkets) : '86'
  const volumeDisplay = stats.isLive ? `${stats.totalDeposited} wstETH` : '$23.7M'
  const volumeLabel = stats.isLive ? 'Vault Deposits' : '24H Volume'

  const ptMarket = {
    name: stats.maturityLabel
      ? `wstETH PT ${stats.maturityLabel}`
      : 'wstETH PT',
    yield: stats.isLive ? stats.impliedAPYFormatted : '4.32%',
    change: stats.isLive ? `${stats.ptPriceEth} ETH` : '+1.14%',
    positive: stats.isLive ? stats.impliedAPY >= 0 : true,
  }

  const ytMarket = {
    name: stats.maturityLabel
      ? `wstETH YT ${stats.maturityLabel}`
      : 'wstETH YT',
    yield: stats.isLive ? `${stats.ytPriceEth} ETH` : '7.81%',
    change: stats.isLive ? stats.currentFeeFormatted + ' fee' : '-1.03%',
    positive: stats.isLive ? true : false,
  }

  const popularMarkets = [ptMarket, ytMarket]
  const cardClass = `hero-market-card-dark shrink-0 ${compact ? 'p-4 rounded-2xl' : 'p-6'}`

  return (
    <div
      className={`flex flex-col ${
        compact ? 'w-[248px] gap-3 shrink-0' : 'w-full gap-4'
      }`}
    >
      <div className={`${cardClass} relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute -top-16 -right-12 w-44 h-44 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(166,217,91,0.22), rgba(255,146,179,0.08) 55%, transparent 75%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          }}
          aria-hidden
        />

        <div className={`relative flex items-center justify-between gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
          <h3 className={`font-semibold text-[#F6F5F2] tracking-tight ${compact ? 'text-sm' : 'text-lg'}`}>
            Market Overview
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#D8F2C2] bg-[#A6D95B]/15 border border-[#A6D95B]/25 px-2 py-1 rounded-full shrink-0">
            <Activity className="w-2.5 h-2.5 animate-pulse" strokeWidth={2.5} />
            Live
          </span>
        </div>

        <div className="relative mb-1 flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#A1A1AA]">
            Total Value Locked
          </p>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#A6D95B] bg-[#A6D95B]/12 border border-[#A6D95B]/25 px-1.5 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
            {stats.isLive ? stats.impliedAPYFormatted : '+12.45%'}
          </span>
        </div>
        <div className={`relative flex items-baseline gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
          <span
            className={`font-bold text-[#F6F5F2] leading-none tracking-tight ${
              compact ? 'text-2xl' : 'text-[34px]'
            }`}
          >
            {tvlDisplay}
          </span>
        </div>

        {!compact && (
          <div className="relative mb-4">
            <Sparkline />
          </div>
        )}

        <div className="relative border-t border-white/[0.1] pt-3">
          <div className="grid grid-cols-2 divide-x divide-white/[0.1]">
            <div className="pr-3">
              <p className="text-[11px] text-[#A1A1AA] mb-1">Active Markets</p>
              <div className="flex items-center gap-1.5">
                <p className={`font-bold text-[#F6F5F2] leading-none ${compact ? 'text-lg' : 'text-2xl'}`}>
                  {activeMarkets}
                </p>
                <span className="inline-flex items-center text-[10px] font-semibold text-[#A6D95B]">
                  <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />
                </span>
              </div>
            </div>
            <div className="pl-4">
              <p className="text-[11px] text-[#A1A1AA] mb-1">{volumeLabel}</p>
              <div className="flex items-center gap-1.5">
                <p className={`font-bold text-[#F6F5F2] leading-none ${compact ? 'text-lg' : 'text-2xl'}`}>
                  {volumeDisplay}
                </p>
                <span className="inline-flex items-center text-[10px] font-semibold text-[#A6D95B]">
                  <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopularMarkets && (
      <div className={`hero-market-card-dark flex flex-col ${compact ? 'p-4 rounded-2xl' : 'p-6 flex-1 min-h-0'}`}>
        <h3 className={`font-semibold text-[#F6F5F2] shrink-0 ${compact ? 'text-sm mb-2.5' : 'text-lg mb-4'}`}>
          {stats.isLive ? 'Live Markets' : 'Popular Markets'}
        </h3>

        <div className={compact ? '' : 'flex-1 flex flex-col min-h-0'}>
          {popularMarkets.map((market, i) => (
            <div
              key={market.name}
              className={`flex items-center justify-between gap-2 shrink-0 ${
                compact ? 'py-2.5' : 'py-4'
              } ${i > 0 ? 'border-t border-white/[0.1]' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <TokenIcon
                  label={market.name}
                  size={compact ? 28 : 36}
                  className="rounded-full border-white/[0.14]"
                />
                <span className={`text-[#E4E4E7] truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                  {market.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`font-bold leading-tight ${compact ? 'text-xs' : 'text-sm'} ${
                    market.positive ? 'text-[#D8F2C2]' : 'text-[#F6F5F2]'
                  }`}
                >
                  {market.yield}
                </p>
                <p
                  className={`font-medium leading-tight mt-0.5 ${compact ? 'text-[10px]' : 'text-xs'} ${
                    market.positive ? 'text-[#A6D95B]' : 'text-[#FF9B9B]'
                  }`}
                >
                  {market.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/markets"
          className={`border-t border-white/[0.1] flex items-center justify-between text-[#A1A1AA] hover:text-[#F6F5F2] transition-colors shrink-0 ${
            compact ? 'pt-3 mt-1 text-xs' : 'mt-auto pt-5 pb-1 text-sm'
          }`}
        >
          View All Markets
          <ChevronRight className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} strokeWidth={1.75} />
        </Link>
      </div>
      )}
    </div>
  )
}
