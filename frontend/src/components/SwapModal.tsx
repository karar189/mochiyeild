'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { useSwap } from '@/hooks/useSwap'
import { PoolConfig } from '@/lib/contracts'

interface SwapModalProps {
  type: 'PT' | 'YT'
  pool: PoolConfig
  onClose: () => void
}

export function SwapModal({ type, pool, onClose }: SwapModalProps) {
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<'sell' | 'buy'>('sell')
  const { swap, status } = useSwap(pool)
  const [error, setError] = useState<string | null>(null)

  const handleSwap = async () => {
    if (!amount) return
    setError(null)
    try {
      await swap(amount, direction)
      setAmount('')
      onClose()
    } catch {
      setError('Swap failed. Check balance and try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary font-medium">Trade {type}-wstETH</h3>
          <button onClick={onClose} className="p-1 hover:bg-cream rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['sell', 'buy'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`flex-1 py-2 rounded-full text-sm font-medium ${
                direction === d
                  ? 'bg-[#FF92B3] text-[#1C1C1C]'
                  : 'bg-cream text-secondary'
              }`}
            >
              {d === 'sell' ? `Sell ${type}` : `Buy ${type}`}
            </button>
          ))}
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-cream rounded-xl p-4 text-xl text-primary outline-none border border-border mb-4"
        />

        <button
          onClick={handleSwap}
          disabled={!amount || status !== 'idle'}
          className="w-full btn-primary disabled:opacity-50"
        >
          {status === 'approving' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Approving...
            </>
          )}
          {status === 'swapping' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Swapping...
            </>
          )}
          {status === 'idle' && 'Confirm Swap'}
        </button>

        {error && <p className="mt-3 text-sm text-primary">{error}</p>}
      </div>
    </div>
  )
}
