'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ArrowDown, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface DepositFormProps {
  underlyingBalance?: bigint
  onDeposit?: (amount: string) => Promise<void>
  depositStatus?: 'idle' | 'approving' | 'depositing'
  onMintTestTokens?: () => Promise<void>
  showFaucet?: boolean
}

export function DepositForm({
  underlyingBalance = BigInt(0),
  onDeposit,
  depositStatus = 'idle',
  onMintTestTokens,
  showFaucet = false,
}: DepositFormProps) {
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const balanceFormatted = Number(underlyingBalance) / 1e18
  const amountNumber = parseFloat(amount) || 0
  const isTxPending = isLoading || depositStatus !== 'idle'

  const handleDeposit = async () => {
    if (!amount || !onDeposit) return

    setIsLoading(true)
    setTxStatus('idle')

    try {
      await onDeposit(amount)
      setTxStatus('success')
      setAmount('')
    } catch {
      setTxStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMax = () => {
    setAmount(balanceFormatted.toString())
  }

  const buttonLabel = () => {
    if (depositStatus === 'approving') return 'Approving wstETH...'
    if (depositStatus === 'depositing') return 'Depositing...'
    if (isLoading) return 'Depositing...'
    return 'Deposit'
  }

  return (
    <div className="card">
      <h3 className="text-primary font-medium mb-4">Deposit wstETH</h3>

      {showFaucet && onMintTestTokens && (
        <button
          onClick={onMintTestTokens}
          className="w-full mb-4 py-2 text-sm bg-cream border border-border rounded-full text-secondary hover:bg-yield-green/30"
        >
          Get 100 test wstETH (local faucet)
        </button>
      )}

      <div className="bg-cream rounded-xl p-4 mb-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-sm">You deposit</span>
          <span className="text-muted text-sm">
            Balance: {balanceFormatted.toFixed(4)} wstETH
          </span>
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
            className="px-2 py-1 bg-[#151515] border border-white/[0.06] rounded-lg text-xs text-secondary hover:bg-[#A6D95B]/10 transition-colors"
          >
            MAX
          </button>
          <div className="px-3 py-1 bg-[#151515] border border-white/[0.06] rounded-lg flex items-center gap-2">
            <div className="w-5 h-5 bg-[#A6D95B]/30 rounded-full" />
            <span className="text-primary text-sm">wstETH</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <div className="bg-[#151515] border border-white/[0.06] rounded-xl p-2">
          <ArrowDown className="w-4 h-4 text-muted" strokeWidth={1.75} />
        </div>
      </div>

      <div className="bg-cream rounded-xl p-4 mb-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-sm">You receive</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xl text-primary font-medium">
              {amountNumber.toFixed(4)}
            </span>
            <div className="px-3 py-1 bg-surface border border-border rounded-lg">
              <span className="text-primary text-sm">PT-wstETH</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl text-primary font-medium">
              {amountNumber.toFixed(4)}
            </span>
            <div className="px-3 py-1 bg-[#A6D95B]/15 border border-[#A6D95B]/25 rounded-lg">
              <span className="text-[#A6D95B] text-sm">YT-wstETH</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-cream rounded-xl p-3 mb-4 text-sm text-secondary border border-border">
        <p>Depositing wstETH mints equal amounts of PT and YT tokens.</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• PT = Principal Token (fixed income exposure)</li>
          <li>• YT = Yield Token (yield speculation)</li>
        </ul>
      </div>

      {!isConnected ? (
        <button
          disabled
          className="w-full py-3 bg-cream rounded-full text-muted font-medium cursor-not-allowed"
        >
          Connect Wallet to Deposit
        </button>
      ) : (
        <button
          onClick={handleDeposit}
          disabled={isTxPending || !amount || amountNumber <= 0 || !onDeposit}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTxPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {buttonLabel()}
            </>
          ) : (
            'Deposit'
          )}
        </button>
      )}

      {txStatus === 'success' && (
        <div className="mt-4 p-3 bg-[#A6D95B]/10 border border-[#A6D95B]/25 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#A6D95B]" strokeWidth={1.75} />
          <span className="text-[#A6D95B] text-sm">Deposit successful!</span>
        </div>
      )}
      {txStatus === 'error' && (
        <div className="mt-4 p-3 bg-rose/30 border border-rose rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" strokeWidth={1.75} />
          <span className="text-primary text-sm">Transaction failed. Please try again.</span>
        </div>
      )}
    </div>
  )
}
