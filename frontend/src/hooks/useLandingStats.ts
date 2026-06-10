'use client'

import { useMochiConfig } from './useMochiConfig'
import { usePoolState } from './usePoolState'
import { useVaultState } from './useVaultState'

function formatWstEth(amount: bigint, decimals = 2) {
  return (Number(amount) / 1e18).toFixed(decimals)
}

export function useLandingStats() {
  const { isConfigured, maturity } = useMochiConfig()
  const { totalDeposited, totalUnderlying, timeToMaturity } = useVaultState()
  const { impliedAPY, ptPrice, ytPrice, currentFee, parityDrift } = usePoolState()

  const tvlWei = totalUnderlying > BigInt(0) ? totalUnderlying : totalDeposited
  const apyPercent = impliedAPY / 100
  const feePercent = currentFee / 100
  const daysToMaturity = Math.floor(timeToMaturity / 86400)

  const maturityLabel = maturity
    ? new Date(maturity * 1000).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return {
    isConfigured,
    isLive: isConfigured,
    tvl: formatWstEth(tvlWei),
    totalDeposited: formatWstEth(totalDeposited),
    impliedAPY: apyPercent,
    impliedAPYFormatted: `${apyPercent.toFixed(2)}%`,
    currentFee: feePercent,
    currentFeeFormatted: `${feePercent.toFixed(2)}%`,
    ptPriceEth: (ptPrice / 1e18).toFixed(4),
    ytPriceEth: (ytPrice / 1e18).toFixed(4),
    parityDriftPercent: (parityDrift / 100).toFixed(2),
    daysToMaturity,
    maturityLabel,
    activeMarkets: isConfigured ? 2 : 0,
  }
}
