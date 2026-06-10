export type KpiMetric = {
  label: string
  value: string
  change: string
  positive: boolean
}

export type TvlPoint = { day: string; tvl: number }

export type TopMarket = {
  name: string
  tvl: string
  apy: string
  positive: boolean
}

export type YieldSlice = {
  name: string
  value: number
  color: string
}

export const DEMO_KPIS: KpiMetric[] = [
  { label: 'Total Value Locked', value: '$125.4M', change: '+12.4%', positive: true },
  { label: 'Portfolio Value', value: '$12,840', change: '+3.2%', positive: true },
  { label: '24H Volume', value: '$23.7M', change: '+8.1%', positive: true },
  { label: 'Avg APY', value: '5.84%', change: '+0.4%', positive: true },
]

export const DEMO_TVL_SERIES: TvlPoint[] = [
  { day: '1', tvl: 82 },
  { day: '3', tvl: 78 },
  { day: '5', tvl: 85 },
  { day: '7', tvl: 80 },
  { day: '9', tvl: 88 },
  { day: '11', tvl: 84 },
  { day: '13', tvl: 91 },
  { day: '15', tvl: 87 },
  { day: '17', tvl: 94 },
  { day: '19', tvl: 90 },
  { day: '21', tvl: 96 },
  { day: '23', tvl: 93 },
  { day: '25', tvl: 98 },
  { day: '27', tvl: 95 },
  { day: '30', tvl: 100 },
]

export const DEMO_TOP_MARKETS: TopMarket[] = [
  { name: 'wstETH PT', tvl: '$42.1M', apy: '4.32%', positive: true },
  { name: 'USDC YT', tvl: '$18.4M', apy: '7.81%', positive: false },
  { name: 'rETH PT', tvl: '$31.2M', apy: '3.94%', positive: true },
  { name: 'sUSDe YT', tvl: '$12.6M', apy: '9.17%', positive: true },
]

export const DEMO_YIELD_SLICES: YieldSlice[] = [
  { name: 'PT Holdings', value: 48, color: '#A6D95B' },
  { name: 'YT Positions', value: 32, color: '#FF92B3' },
  { name: 'LP Fees', value: 20, color: '#94A3B8' },
]

export const DEMO_FOOTER_STATS = [
  { label: 'Open PT Positions', value: '1,284' },
  { label: 'Active YT Traders', value: '412' },
  { label: 'Hook Events (24h)', value: '8,902' },
  { label: 'Avg Maturity', value: '142d' },
]
