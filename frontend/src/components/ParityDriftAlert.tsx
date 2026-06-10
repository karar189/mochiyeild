'use client'

import { AlertTriangle, CheckCircle, Scale } from 'lucide-react'

interface ParityDriftAlertProps {
  ptPrice: number
  ytPrice: number
  underlyingPrice: number
  driftThreshold?: number
}

export function ParityDriftAlert({
  ptPrice,
  ytPrice,
  underlyingPrice,
  driftThreshold = 500,
}: ParityDriftAlertProps) {
  const combinedValue = ptPrice + ytPrice

  let driftBps: number
  let isOverValued: boolean

  if (combinedValue > underlyingPrice) {
    driftBps = ((combinedValue - underlyingPrice) * 10000) / underlyingPrice
    isOverValued = true
  } else {
    driftBps = ((underlyingPrice - combinedValue) * 10000) / underlyingPrice
    isOverValued = false
  }

  const driftPercent = driftBps / 100
  const hasSignificantDrift = driftBps > driftThreshold

  const ptPriceETH = ptPrice / 1e18
  const ytPriceETH = ytPrice / 1e18
  const underlyingPriceETH = underlyingPrice / 1e18
  const combinedETH = combinedValue / 1e18

  if (hasSignificantDrift) {
    return (
      <div className="card bg-rose/20 border-rose animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-primary" strokeWidth={1.75} />
          <h3 className="text-primary font-medium">Parity Drift Detected</h3>
        </div>

        <div className="bg-cream rounded-xl p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-muted text-xs mb-1">PT Price</div>
              <div className="text-primary font-medium">{ptPriceETH.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-muted text-xs mb-1">YT Price</div>
              <div className="text-primary font-medium">{ytPriceETH.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-muted text-xs mb-1">Combined</div>
              <div className="text-primary font-bold">{combinedETH.toFixed(4)}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-secondary text-sm">Underlying: </span>
            <span className="text-primary font-medium">
              {underlyingPriceETH.toFixed(4)} ETH
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-rose/40 text-primary text-sm">
            {isOverValued ? '+' : '-'}
            {driftPercent.toFixed(2)}% {isOverValued ? 'Overvalued' : 'Undervalued'}
          </div>
        </div>

        <p className="text-secondary text-sm mt-4">
          Arbitrage opportunity detected. Reactive Network may auto-correct.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="w-5 h-5 text-success" strokeWidth={1.75} />
        <h3 className="text-secondary text-sm font-medium">PT + YT Parity</h3>
        <CheckCircle className="w-4 h-4 text-success ml-auto" strokeWidth={1.75} />
      </div>

      <div className="bg-cream rounded-xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-muted text-xs mb-1">PT Price</div>
            <div className="text-primary font-medium text-sm">{ptPriceETH.toFixed(4)}</div>
          </div>
          <div className="text-muted">+</div>
          <div>
            <div className="text-muted text-xs mb-1">YT Price</div>
            <div className="text-primary font-medium text-sm">{ytPriceETH.toFixed(4)}</div>
          </div>
        </div>

        <div className="border-t border-border mt-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">Combined Value:</span>
            <span className="text-primary font-medium">{combinedETH.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-muted text-sm">Underlying:</span>
            <span className="text-primary font-medium">
              {underlyingPriceETH.toFixed(4)} ETH
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted text-sm">Drift:</span>
        <span className="text-success font-medium">
          {driftPercent.toFixed(2)}% (within bounds)
        </span>
      </div>
    </div>
  )
}
