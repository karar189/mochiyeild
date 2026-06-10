'use client'

import {
  Shield,
  Sparkles,
  Link2,
  LayoutDashboard,
  BarChart3,
  Wallet,
  Settings,
  Radio,
} from 'lucide-react'
import { useLandingStats } from '@/hooks'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: BarChart3, label: 'Markets' },
  { icon: Wallet, label: 'Portfolio' },
  { icon: Settings, label: 'Settings' },
]

const chartPoints = [28, 35, 32, 45, 42, 58, 55, 68, 72, 78, 85, 92]

const features = [
  {
    icon: Shield,
    title: 'Principal Protected',
    desc: 'PT tokens preserve your underlying exposure with fixed-return clarity.',
    accent: 'bg-[#FFD6E0]/60 text-[#FF92B3]',
  },
  {
    icon: Sparkles,
    title: 'Yield Unbundled',
    desc: 'Trade future yield independently without selling your assets.',
    accent: 'bg-yield-green/80 text-success',
  },
  {
    icon: Link2,
    title: 'Powered By Hooks',
    desc: 'Adaptive fees and yield curve awareness via Uniswap v4 Hooks.',
    accent: 'bg-[#FEF3C7] text-[#D97706]',
  },
]

export function DashboardPreview() {
  const stats = useLandingStats()

  const overviewStats = stats.isLive
    ? [
        { label: 'Total Value Locked', value: `${stats.tvl} wstETH`, change: 'On-chain' },
        { label: 'Implied APY', value: stats.impliedAPYFormatted, change: `PT @ ${stats.ptPriceEth} ETH` },
        { label: 'Pool Fee', value: stats.currentFeeFormatted, change: `${stats.daysToMaturity}d to maturity` },
        { label: 'Parity Drift', value: `${stats.parityDriftPercent}%`, change: 'PT + YT vs underlying' },
      ]
    : [
        { label: 'Total Value Locked', value: '$125.4M', change: '+12.4%' },
        { label: 'Portfolio Value', value: '$12,840', change: '+3.2%' },
        { label: '24H Volume', value: '$23.7M', change: '+8.1%' },
        { label: 'Avg APY', value: '5.84%', change: '+0.4%' },
      ]

  const topMarkets = stats.isLive
    ? [
        {
          name: 'wstETH PT',
          apy: stats.impliedAPYFormatted,
          tvl: `${stats.ptPriceEth} ETH`,
          up: stats.impliedAPY >= 0,
        },
        {
          name: 'wstETH YT',
          apy: `${stats.ytPriceEth} ETH`,
          tvl: stats.currentFeeFormatted + ' fee',
          up: true,
        },
      ]
    : [
        { name: 'wstETH PT', apy: '4.32%', tvl: '$42.1M', up: true },
        { name: 'USDC YT', apy: '7.81%', tvl: '$18.4M', up: false },
        { name: 'rETH PT', apy: '3.94%', tvl: '$31.2M', up: true },
      ]

  return (
    <section className="section-padding pb-20 lg:pb-28">
      <div className="content-max">
        {stats.isLive && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-success">
            <Radio className="w-4 h-4" strokeWidth={2} />
            <span>Live data from Anvil — connect wallet on chain 31337</span>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-stretch">
          <div className="glass-card-heavy rounded-[32px] overflow-hidden flex flex-col">
            <div className="flex flex-1 min-h-[520px] lg:min-h-[560px]">
              <div className="hidden sm:flex flex-col w-52 border-r border-border/50 bg-cream/30 p-5 gap-1 shrink-0">
                <div className="mb-6 px-2">
                  <span className="text-sm font-semibold text-[#FF92B3]">mochi</span>
                  <span className="text-sm font-semibold text-[#A6D95B]">trade</span>
                </div>
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${
                        item.active
                          ? 'bg-yield-green/50 text-primary font-medium'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                      {item.label}
                    </div>
                  )
                })}
              </div>

              <div className="flex-1 p-6 sm:p-8 min-w-0 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-semibold text-primary text-lg">Overview</h3>
                  <span className="text-xs text-[#6B7280] bg-cream px-2.5 py-1 rounded-full">
                    {stats.isLive && stats.maturityLabel
                      ? `Maturity ${stats.maturityLabel}`
                      : 'Last 30 days'}
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {overviewStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-cream/60 rounded-2xl p-4 border border-border/30"
                    >
                      <p className="text-[10px] sm:text-xs text-[#6B7280] mb-1.5 truncate">
                        {stat.label}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        {stat.value}
                      </p>
                      <p className="text-[10px] sm:text-xs text-success font-medium mt-0.5 truncate">
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-5 flex-1 min-h-0">
                  <div className="lg:col-span-3 bg-cream/40 rounded-2xl p-5 border border-border/30 flex flex-col min-h-[220px]">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-sm font-medium text-primary">
                        {stats.isLive ? 'Vault TVL' : 'TVL Growth'}
                      </span>
                      <span className="text-xs text-success font-medium">
                        {stats.isLive ? stats.impliedAPYFormatted : '+12.4%'}
                      </span>
                    </div>
                    <div className="flex items-end gap-1.5 flex-1 min-h-[160px]">
                      {chartPoints.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-[#B7E36D] to-[#D8F2C2]"
                          style={{
                            height: stats.isLive
                              ? `${Math.min(100, Math.max(12, (Number(stats.tvl) / 1000) * 100 + h * 0.3))}%`
                              : `${h}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-cream/40 rounded-2xl p-5 border border-border/30 flex flex-col min-h-[220px]">
                    <span className="text-sm font-medium text-primary mb-4">
                      {stats.isLive ? 'Live Markets' : 'Top Markets'}
                    </span>
                    <div className="flex-1 space-y-4">
                      {topMarkets.map((m) => (
                        <div
                          key={m.name}
                          className="flex items-center justify-between text-xs sm:text-sm py-1"
                        >
                          <span className="text-primary font-medium">{m.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#6B7280]">{m.tvl}</span>
                            <span
                              className={`font-semibold ${m.up ? 'text-success' : 'text-[#EF4444]'}`}
                            >
                              {m.apy}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:min-h-[560px]">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="glass-card p-5 flex-1 flex flex-col justify-center"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${feature.accent}`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <h4 className="font-semibold text-primary text-sm mb-1.5">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
