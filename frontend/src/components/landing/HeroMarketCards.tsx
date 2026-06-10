'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LineChart, ChevronRight, Radio } from 'lucide-react'
import { useLandingStats } from '@/hooks'

function TokenLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden bg-white/50 backdrop-blur-sm border border-white/60">
      <Image
        src={src}
        alt={alt}
        width={36}
        height={36}
        className="w-full h-full object-cover"
        unoptimized
      />
    </div>
  )
}

export function HeroMarketCards() {
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

  return (
    <div className="w-full lg:w-[340px] xl:w-[360px] flex flex-col gap-5 h-full min-h-0 lg:pb-0">
      <div className="hero-market-card p-6 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-yield-green/50 backdrop-blur-sm border border-white/40 flex items-center justify-center shrink-0">
              <LineChart className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-primary">Market Overview</h3>
          </div>
          {stats.isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success bg-yield-green/40 px-2 py-0.5 rounded-full shrink-0">
              <Radio className="w-2.5 h-2.5" strokeWidth={2} />
              Live
            </span>
          )}
        </div>

        <p className="text-xs text-[#6B7280] mb-1">Total Value Locked</p>
        <div className="flex items-baseline gap-2 mb-5">
          <span className="text-[32px] font-bold text-primary leading-none tracking-tight">
            {tvlDisplay}
          </span>
          {stats.isLive && (
            <span className="text-sm font-semibold text-success">
              {stats.impliedAPYFormatted} APY
            </span>
          )}
          {!stats.isLive && (
            <span className="text-sm font-semibold text-success">+12.45%</span>
          )}
        </div>

        <div className="border-t border-white/35 pt-4">
          <div className="grid grid-cols-2 divide-x divide-white/35">
            <div className="pr-4">
              <p className="text-xs text-[#6B7280] mb-1">Active Markets</p>
              <p className="text-2xl font-bold text-primary">{activeMarkets}</p>
            </div>
            <div className="pl-4">
              <p className="text-xs text-[#6B7280] mb-1">{volumeLabel}</p>
              <p className="text-2xl font-bold text-primary">{volumeDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-market-card p-6 flex flex-col flex-1 min-h-0">
        <h3 className="text-lg font-semibold text-primary mb-4 shrink-0">
          {stats.isLive ? 'Live Markets' : 'Popular Markets'}
        </h3>

        <div className="flex-1 flex flex-col min-h-0">
          {popularMarkets.map((market, i) => (
            <div
              key={market.name}
              className={`flex items-center justify-between gap-3 py-4 shrink-0 ${
                i > 0 ? 'border-t border-white/35' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <TokenLogo src="/tokens/wsteth.png" alt="wstETH" />
                <span className="text-sm text-primary truncate">{market.name}</span>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-bold leading-tight ${
                    market.positive ? 'text-success' : 'text-primary'
                  }`}
                >
                  {market.yield}
                </p>
                <p
                  className={`text-xs font-medium leading-tight mt-0.5 ${
                    market.positive ? 'text-success' : 'text-[#EF4444]'
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
          className="mt-auto pt-5 pb-1 border-t border-white/35 flex items-center justify-between text-sm text-[#6B7280] hover:text-primary transition-colors shrink-0"
        >
          View All Markets
          <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}
