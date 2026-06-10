'use client'

import { DepositForm } from '@/components/DepositForm'
import { RedeemForm } from '@/components/RedeemForm'
import { MaturityCountdown } from '@/components/MaturityCountdown'
import { Wallet, Info } from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { useDeposit, useMochiConfig, useRedeem, useVaultState } from '@/hooks'

function formatToken(amount: bigint) {
  return (Number(amount) / 1e18).toFixed(4)
}

export default function DepositPage() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { isConfigured } = useMochiConfig()
  const {
    underlyingBalance,
    ptBalance,
    ytBalance,
    totalDeposited,
    maturity,
    isMatured,
    refetch,
  } = useVaultState()
  const { deposit, mintTestTokens, status } = useDeposit()
  const { redeem, status: redeemStatus } = useRedeem()

  const handleDeposit = async (amount: string) => {
    await deposit(amount)
    refetch()
  }

  const handleMint = async () => {
    await mintTestTokens()
    refetch()
  }

  const handleRedeem = async (amount: string) => {
    await redeem(amount)
    refetch()
  }

  return (
    <div className="min-h-screen py-12 pt-24 section-padding">
      <div className="content-max">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Vaults</h1>
          <p className="text-secondary max-w-xl mx-auto">
            Deposit your yield-bearing assets to receive Principal Tokens (PT) and Yield
            Tokens (YT).
          </p>
          {!isConfigured && (
            <p className="text-muted text-sm mt-2">
              No deployment for chain {chainId}. Run scripts/deploy-local.sh on Anvil.
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DepositForm
              underlyingBalance={isConnected ? underlyingBalance : BigInt(0)}
              onDeposit={isConfigured ? handleDeposit : undefined}
              depositStatus={status}
              onMintTestTokens={chainId === 31337 ? handleMint : undefined}
              showFaucet={chainId === 31337 && isConfigured}
            />

            <RedeemForm
              ptBalance={isConnected ? ptBalance : BigInt(0)}
              isMatured={isMatured}
              onRedeem={isConfigured && isMatured ? handleRedeem : undefined}
              redeemStatus={redeemStatus}
            />

            <div className="mt-6 card bg-cream/50 border-yield-green/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-success mt-0.5" strokeWidth={1.75} />
                <div>
                  <h4 className="text-primary font-medium mb-2">How it works</h4>
                  <ul className="text-secondary text-sm space-y-2">
                    <li>1. Deposit wstETH into the MochiTrade Vault</li>
                    <li>2. Receive equal amounts of PT-wstETH and YT-wstETH</li>
                    <li>3. Hold PT for fixed-income exposure, or trade YT for yield views</li>
                    <li>4. After maturity, redeem PT for underlying wstETH</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <MaturityCountdown maturityTimestamp={maturity} />

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-success" strokeWidth={1.75} />
                <h3 className="text-primary font-medium">Your Positions</h3>
              </div>

              {!isConnected ? (
                <p className="text-muted text-sm">Connect wallet to view positions</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-cream rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">PT</span>
                      </div>
                      <span className="text-secondary text-sm">PT-wstETH</span>
                    </div>
                    <span className="text-primary font-medium">{formatToken(ptBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cream rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yield-green rounded-lg flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">YT</span>
                      </div>
                      <span className="text-secondary text-sm">YT-wstETH</span>
                    </div>
                    <span className="text-primary font-medium">{formatToken(ytBalance)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-primary font-medium mb-4">Vault Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Total Deposited</span>
                  <span className="text-primary font-medium">
                    {formatToken(totalDeposited)} wstETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">PT Supply</span>
                  <span className="text-primary font-medium">{formatToken(totalDeposited)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">YT Supply</span>
                  <span className="text-primary font-medium">{formatToken(totalDeposited)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
