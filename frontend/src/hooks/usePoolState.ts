'use client'

import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { calculateImpliedAPY } from '@/lib/impliedApy'
import { getPoolStateSlot, poolPriceFromExtsload } from '@/lib/poolPrice'
import { MOCHI_HOOK_ABI, POOL_MANAGER_ABI } from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'
import { useVaultState } from './useVaultState'

function pickPrice(hookPrice: bigint, poolPrice: bigint): bigint {
  if (hookPrice > BigInt(0)) return hookPrice
  return poolPrice
}

function parityDriftBps(ptPrice: bigint, ytPrice: bigint, underlyingPrice: bigint): number {
  if (underlyingPrice === BigInt(0)) return 0
  const combined = ptPrice + ytPrice
  if (combined > underlyingPrice) {
    return Number(((combined - underlyingPrice) * BigInt(10000)) / underlyingPrice)
  }
  return Number(((underlyingPrice - combined) * BigInt(10000)) / underlyingPrice)
}

export function usePoolState() {
  const { addresses, pools, isConfigured } = useMochiConfig()
  const { timeToMaturity } = useVaultState()

  const ptPoolId = pools?.pt.poolId as `0x${string}` | undefined
  const ytPoolId = pools?.yt.poolId as `0x${string}` | undefined

  const contracts =
    isConfigured && addresses && ptPoolId && ytPoolId
      ? [
          { address: addresses.hook, abi: MOCHI_HOOK_ABI, functionName: 'getMarketState' as const },
          { address: addresses.hook, abi: MOCHI_HOOK_ABI, functionName: 'underlyingPrice' as const },
          {
            address: addresses.hook,
            abi: MOCHI_HOOK_ABI,
            functionName: 'calculateFeeForMaturity' as const,
            args: [BigInt(timeToMaturity)],
          },
          {
            address: addresses.poolManager,
            abi: POOL_MANAGER_ABI,
            functionName: 'extsload' as const,
            args: [getPoolStateSlot(ptPoolId)],
          },
          {
            address: addresses.poolManager,
            abi: POOL_MANAGER_ABI,
            functionName: 'extsload' as const,
            args: [getPoolStateSlot(ytPoolId)],
          },
        ]
      : []

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: isConfigured },
  })

  const marketState = data?.[0]?.result as
    | readonly [bigint, bigint, bigint, bigint]
    | undefined

  const hookPtPrice = marketState?.[0] ?? BigInt(0)
  const hookYtPrice = marketState?.[1] ?? BigInt(0)
  const underlyingPrice = (data?.[1]?.result as bigint | undefined) ?? BigInt(10 ** 18)
  const currentFee = (data?.[2]?.result as bigint | undefined) ?? BigInt(0)
  const ptPoolSlot = data?.[3]?.result as `0x${string}` | undefined
  const ytPoolSlot = data?.[4]?.result as `0x${string}` | undefined

  const poolPtPrice = poolPriceFromExtsload(ptPoolSlot)
  const poolYtPrice = poolPriceFromExtsload(ytPoolSlot)

  const ptPrice = pickPrice(hookPtPrice, poolPtPrice)
  const ytPrice = pickPrice(hookYtPrice, poolYtPrice)

  const impliedAPY = useMemo(
    () => calculateImpliedAPY(ptPrice, timeToMaturity),
    [ptPrice, timeToMaturity],
  )

  const parityDrift = useMemo(
    () => parityDriftBps(ptPrice, ytPrice, underlyingPrice),
    [ptPrice, ytPrice, underlyingPrice],
  )

  return {
    isLoading,
    refetch,
    ptPrice: Number(ptPrice),
    ytPrice: Number(ytPrice),
    impliedAPY,
    parityDrift,
    underlyingPrice: Number(underlyingPrice),
    currentFee: Number(currentFee),
    timeToMaturity,
  }
}
