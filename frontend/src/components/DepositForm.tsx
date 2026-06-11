'use client'

import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { ArrowDown, Loader2, CheckCircle, AlertCircle, Droplets } from 'lucide-react'
import { TxHashLink } from '@/components/TxHashLink'

export type DepositResult = {
  depositHash: `0x${string}`
  approveHash?: `0x${string}`
}

interface DepositFormProps {
  underlyingBalance?: bigint
  onDeposit?: (amount: string) => Promise<DepositResult>
  depositStatus?: 'idle' | 'approving' | 'depositing'
  onMintTestTokens?: () => Promise<`0x${string}` | undefined>
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
  const chainId = useChainId()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [txError, setTxError] = useState<string | null>(null)
  const [successTx, setSuccessTx] = useState<DepositResult | null>(null)
  const [faucetStatus, setFaucetStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle')
  const [faucetTx, setFaucetTx] = useState<`0x${string}` | null>(null)

  const balanceFormatted = Number(underlyingBalance) / 1e18
  const amountNumber = parseFloat(amount) || 0
  const isTxPending = isLoading || depositStatus !== 'idle'

  const handleDeposit = async () => {
    if (!amount || !onDeposit) return

    setIsLoading(true)
    setTxStatus('idle')
    setTxError(null)
    setSuccessTx(null)

    try {
      const result = await onDeposit(amount)
      setSuccessTx(result)
      setTxStatus('success')
      setAmount('')
    } catch (err) {
      setTxStatus('error')
      const message =
        err instanceof Error ? err.message : 'Transaction failed. Please try again.'
      setTxError(message.includes('nonce too low') ? 'Wallet nonce out of sync — try Deposit again.' : message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMax = () => {
    setAmount(balanceFormatted.toString())
  }

  const handleFaucet = async () => {
    if (!onMintTestTokens) return

    setFaucetStatus('minting')
    setFaucetTx(null)
    try {
      const hash = await onMintTestTokens()
      setFaucetTx(hash ?? null)
      setFaucetStatus('success')
    } catch {
      setFaucetStatus('error')
    }
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
        <div className="mb-4 rounded-xl border border-[#A6D95B]/25 bg-[#A6D95B]/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Droplets className="w-4 h-4 text-[#A6D95B] shrink-0" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-primary text-sm font-medium">Testnet faucet</p>
                <p className="text-muted text-xs truncate">
                  New here? Mint free test wstETH to try the protocol.
                </p>
              </div>
            </div>
            <button
              onClick={handleFaucet}
              disabled={!isConnected || faucetStatus === 'minting' || isTxPending}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full bg-[#A6D95B]/15 border border-[#A6D95B]/30 text-[#A6D95B] hover:bg-[#A6D95B]/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {faucetStatus === 'minting' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint 100 wstETH'
              )}
            </button>
          </div>

          {!isConnected && (
            <p className="text-muted text-xs mt-2">Connect your wallet to use the faucet.</p>
          )}
          {faucetStatus === 'success' && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#A6D95B]/15 pt-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#A6D95B] shrink-0" strokeWidth={1.75} />
              <span className="text-[#A6D95B] text-xs font-medium">
                100 test wstETH minted to your wallet.
              </span>
              {faucetTx && (
                <TxHashLink chainId={chainId} label="Mint tx" hash={faucetTx} />
              )}
            </div>
          )}
          {faucetStatus === 'error' && (
            <div className="mt-3 flex items-center gap-2 border-t border-[#A6D95B]/15 pt-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.75} />
              <span className="text-primary text-xs">
                Mint failed — check your wallet and try again.
              </span>
            </div>
          )}
        </div>
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

      {txStatus === 'success' && successTx && (
        <div className="mt-4 p-3 bg-[#A6D95B]/10 border border-[#A6D95B]/25 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#A6D95B] shrink-0" strokeWidth={1.75} />
            <span className="text-[#A6D95B] text-sm font-medium">Deposit successful!</span>
          </div>
          <TxHashLink chainId={chainId} label="Deposit tx" hash={successTx.depositHash} />
          {successTx.approveHash && (
            <TxHashLink chainId={chainId} label="Approve tx" hash={successTx.approveHash} />
          )}
        </div>
      )}
      {txStatus === 'error' && (
        <div className="mt-4 p-3 bg-rose/30 border border-rose rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" strokeWidth={1.75} />
          <span className="text-primary text-sm">{txError ?? 'Transaction failed. Please try again.'}</span>
        </div>
      )}
    </div>
  )
}
