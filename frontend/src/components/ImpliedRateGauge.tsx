'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ImpliedRateGaugeProps {
  impliedAPY: number
  ptPrice: number
  timeToMaturity: number
}

export function ImpliedRateGauge({
  impliedAPY,
  ptPrice,
  timeToMaturity,
}: ImpliedRateGaugeProps) {
  const apyPercent = impliedAPY / 100

  const getColor = () => {
    if (impliedAPY < 0) return 'text-rose'
    if (impliedAPY < 500) return 'text-success'
    if (impliedAPY < 2000) return 'text-primary'
    return 'text-secondary'
  }

  const getBarColor = () => {
    if (impliedAPY < 0) return 'bg-rose'
    if (impliedAPY < 500) return 'bg-success'
    if (impliedAPY < 2000) return 'bg-yield-green'
    return 'bg-sage'
  }

  const getIcon = () => {
    if (impliedAPY < 0) return <TrendingDown className="w-5 h-5" strokeWidth={1.75} />
    if (impliedAPY === 0) return <Minus className="w-5 h-5" strokeWidth={1.75} />
    return <TrendingUp className="w-5 h-5" strokeWidth={1.75} />
  }

  const gaugePercent = Math.min(Math.max((impliedAPY / 10000) * 100, 0), 100)
  const daysToMaturity = Math.floor(timeToMaturity / 86400)
  const hoursToMaturity = Math.floor((timeToMaturity % 86400) / 3600)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-secondary text-sm font-medium">Implied APY</h3>
        <div className={getColor()}>{getIcon()}</div>
      </div>

      <div className="mb-6">
        <div className={`text-4xl font-bold ${getColor()}`}>
          {apyPercent.toFixed(2)}%
        </div>
        <div className="text-muted text-sm mt-1">Annualized yield from PT discount</div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted mb-2">
          <span>0%</span>
          <span>100%</span>
        </div>
        <div className="h-3 bg-cream rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor()} rounded-full transition-all duration-500`}
            style={{ width: `${gaugePercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-cream rounded-xl p-3">
          <div className="text-muted text-xs mb-1">PT Price</div>
          <div className="text-primary font-medium">{(ptPrice / 1e18).toFixed(4)} ETH</div>
        </div>
        <div className="bg-cream rounded-xl p-3">
          <div className="text-muted text-xs mb-1">Time to Maturity</div>
          <div className="text-primary font-medium">
            {daysToMaturity}d {hoursToMaturity}h
          </div>
        </div>
      </div>
    </div>
  )
}
