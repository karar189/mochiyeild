'use client'

import { useState } from 'react'
import { useChainId } from 'wagmi'
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'
import { TxHashLink } from '@/components/TxHashLink'
import { getSwapStatusMessage, SwapResult, useSwap } from '@/hooks/useSwap'
import { PoolConfig } from '@/lib/contracts'

interface SwapModalProps {
  type: 'PT' | 'YT'
  pool: PoolConfig
  onClose: () => void
}

export function SwapModal({ type, pool, onClose }: SwapModalProps) {
  const chainId = useChainId()
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<'sell' | 'buy'>('sell')
  const { swap, status } = useSwap(pool)
  const [error, setError] = useState<string | null>(null)
  const [successTx, setSuccessTx] = useState<SwapResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isBusy = isSubmitting || status !== 'idle'
  const statusMessage = getSwapStatusMessage(status)

  const handleSwap = async () => {
    if (!amount || isBusy) return
    setError(null)
    setSuccessTx(null)
    setIsSubmitting(true)

    try {
      const result = await swap(amount, direction)
      setSuccessTx(result)
      setAmount('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Swap failed. Check balance and try again.'
      setError(
        message.includes('nonce too low')
          ? 'Wallet nonce out of sync — try the swap again.'
          : message.includes('User rejected')
            ? 'Transaction cancelled in wallet.'
            : 'Swap failed. Check balance and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isBusy) return
    onClose()
  }

  if (successTx) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="card w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-primary font-medium">Swap successful</h3>
            <button onClick={handleClose} className="p-1 hover:bg-cream rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-[#A6D95B]/10 border border-[#A6D95B]/25 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#A6D95B] shrink-0" strokeWidth={1.75} />
              <span className="text-[#A6D95B] text-sm font-medium">
                {direction === 'sell' ? `Sold ${type}` : `Bought ${type}`} — confirmed on chain
              </span>
            </div>
            <TxHashLink chainId={chainId} label="Swap tx" hash={successTx.swapHash} />
            {successTx.approveHash && (
              <TxHashLink chainId={chainId} label="Approve tx" hash={successTx.approveHash} />
            )}
          </div>

          <p className="mt-4 text-muted text-xs">
            Click the transaction hash to verify on Blockscout.
          </p>

          <button onClick={handleClose} className="w-full btn-primary mt-4">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary font-medium">Trade {type}-wstETH</h3>
          <button
            onClick={handleClose}
            disabled={isBusy}
            className="p-1 hover:bg-cream rounded-lg disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['sell', 'buy'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              disabled={isBusy}
              className={`flex-1 py-2 rounded-full text-sm font-medium disabled:opacity-50 ${
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
          disabled={isBusy}
          className="w-full bg-cream rounded-xl p-4 text-xl text-primary outline-none border border-border mb-4 disabled:opacity-50"
        />

        {isBusy && statusMessage && (
          <div className="mb-4 p-3 bg-cream border border-border rounded-xl flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#A6D95B] shrink-0" />
            <span className="text-secondary text-sm">{statusMessage}</span>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={!amount || isBusy}
          className="w-full btn-primary disabled:opacity-50"
        >
          {isBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {statusMessage || 'Processing…'}
            </>
          ) : (
            'Confirm Swap'
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-rose/30 border border-rose rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} />
            <span className="text-primary text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
