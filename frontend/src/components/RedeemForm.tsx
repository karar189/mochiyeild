'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, Unlock } from 'lucide-react'

interface RedeemFormProps {
  ptBalance?: bigint
  isMatured?: boolean
  onRedeem?: (amount: string) => Promise<void>
  redeemStatus?: 'idle' | 'redeeming'
}

export function RedeemForm({
  ptBalance = BigInt(0),
  isMatured = false,
  onRedeem,
  redeemStatus = 'idle',
}: RedeemFormProps) {
  const [amount, setAmount] = useState('')
  const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const balanceFormatted = Number(ptBalance) / 1e18
  const amountNumber = parseFloat(amount) || 0
  const isTxPending = redeemStatus === 'redeeming'

  const handleRedeem = async () => {
    if (!amount || !onRedeem) return

    setTxStatus('idle')
    try {
      await onRedeem(amount)
      setTxStatus('success')
      setAmount('')
    } catch {
      setTxStatus('error')
    }
  }

  const handleMax = () => {
    setAmount(balanceFormatted.toString())
  }

  if (!isMatured) {
    return (
      <div className="card border-border/60 bg-cream/40">
        <div className="flex items-start gap-3">
          <Unlock className="w-5 h-5 text-muted mt-0.5" strokeWidth={1.75} />
          <div>
            <h3 className="text-primary font-medium mb-1">Redeem PT (after maturity)</h3>
            <p className="text-secondary text-sm">
              PT tokens can be redeemed 1:1 for underlying wstETH once the market matures.
              Redemption unlocks automatically when the countdown reaches zero.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card border-yield-green/40 bg-yield-green/10">
      <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
        <Unlock className="w-5 h-5 text-success" strokeWidth={1.75} />
        Redeem PT for wstETH
      </h3>

      <div className="bg-cream rounded-xl p-4 mb-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-sm">PT to redeem</span>
          <span className="text-muted text-sm">Balance: {balanceFormatted.toFixed(4)} PT</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl text-primary font-medium outline-none placeholder:text-muted/50"
          />
          <button
            onClick={handleMax}
            className="px-2 py-1 bg-surface border border-border rounded-lg text-xs text-secondary hover:bg-yield-green/30 transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      <p className="text-secondary text-sm mb-4">
        Burning PT returns underlying wstETH 1:1. YT tokens are not required for redemption.
      </p>

      <button
        onClick={handleRedeem}
        disabled={isTxPending || !amount || amountNumber <= 0 || !onRedeem}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTxPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redeeming...
          </>
        ) : (
          'Redeem PT'
        )}
      </button>

      {txStatus === 'success' && (
        <div className="mt-4 p-3 bg-yield-green/30 border border-yield-green rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" strokeWidth={1.75} />
          <span className="text-success text-sm">Redemption successful!</span>
        </div>
      )}
      {txStatus === 'error' && (
        <div className="mt-4 p-3 bg-rose/30 border border-rose rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" strokeWidth={1.75} />
          <span className="text-primary text-sm">Redemption failed. Check PT balance and maturity.</span>
        </div>
      )}
    </div>
  )
}
