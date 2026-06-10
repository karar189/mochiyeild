'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Droplets, Activity, Shield, Sparkles } from 'lucide-react'
import { PoolConfig } from '@/lib/contracts'
import { SwapModal } from './SwapModal'

interface PoolCardProps {
  type: 'PT' | 'YT'
  price: number
  liquidity?: number
  volume24h?: number
  fee: number
  priceChange24h?: number
  pool?: PoolConfig | null
}

export function PoolCard({
  type,
  price,
  liquidity = 0,
  volume24h = 0,
  fee,
  priceChange24h = 0,
  pool,
}: PoolCardProps) {
  const [showSwap, setShowSwap] = useState(false)
  const isPT = type === 'PT'
  const isPositiveChange = priceChange24h >= 0

  const formatUSD = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <>
      <div
        className={`card ${isPT ? '' : 'border-[#A6D95B]/25 bg-[#A6D95B]/5'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isPT
                  ? 'bg-[#151515] border border-white/[0.06]'
                  : 'bg-[#A6D95B]/15 border border-[#A6D95B]/25'
              }`}
            >
              {isPT ? (
                <Shield className="w-5 h-5 text-primary" strokeWidth={1.75} />
              ) : (
                <Sparkles className="w-5 h-5 text-[#A6D95B]" strokeWidth={1.75} />
              )}
            </div>
            <div>
              <h3 className="text-primary font-medium">{type}-wstETH / WETH</h3>
              <p className="text-muted text-sm">
                {isPT ? 'Principal Token Pool' : 'Yield Token Pool'}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full flex items-center gap-1 text-sm ${
              isPositiveChange
                ? 'bg-[#A6D95B]/15 text-[#A6D95B] border border-[#A6D95B]/25'
                : 'bg-[#FF92B3]/15 text-[#FF92B3] border border-[#FF92B3]/25'
            }`}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-3 h-3" strokeWidth={1.75} />
            ) : (
              <TrendingDown className="w-3 h-3" strokeWidth={1.75} />
            )}
            <span>
              {isPositiveChange ? '+' : ''}
              {priceChange24h.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-muted text-sm">Price</span>
          <div className="text-3xl font-bold text-primary">
            {(price / 1e18).toFixed(4)}{' '}
            <span className="text-lg text-secondary font-sans">ETH</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-cream rounded-xl p-3">
            <div className="flex items-center gap-1 text-muted text-xs mb-1">
              <Droplets className="w-3 h-3" strokeWidth={1.75} />
              Liquidity
            </div>
            <div className="text-primary font-medium text-sm">{formatUSD(liquidity)}</div>
          </div>
          <div className="bg-cream rounded-xl p-3">
            <div className="flex items-center gap-1 text-muted text-xs mb-1">
              <Activity className="w-3 h-3" strokeWidth={1.75} />
              24h Volume
            </div>
            <div className="text-primary font-medium text-sm">{formatUSD(volume24h)}</div>
          </div>
          <div className="bg-cream rounded-xl p-3">
            <div className="text-muted text-xs mb-1">Dynamic Fee</div>
            <div className={`font-medium text-sm ${isPT ? 'text-primary' : 'text-[#A6D95B]'}`}>
              {(fee / 100).toFixed(2)}%
            </div>
          </div>
        </div>

        <button
          onClick={() => pool && setShowSwap(true)}
          disabled={!pool}
          className={`w-full mt-4 py-3 rounded-full font-medium transition-colors disabled:opacity-50 ${
            isPT
              ? 'bg-transparent border border-white/[0.12] text-primary hover:border-[#FF92B3]/35 hover:bg-[#FF92B3]/6'
              : 'bg-[#FF92B3] text-[#1C1C1C] hover:bg-[#FFA8C3]'
          }`}
        >
          Trade {type}
        </button>
      </div>

      {showSwap && pool && (
        <SwapModal type={type} pool={pool} onClose={() => setShowSwap(false)} />
      )}
    </>
  )
}
