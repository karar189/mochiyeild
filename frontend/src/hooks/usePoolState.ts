'use client'

import { useReadContracts } from 'wagmi'
import { MOCHI_HOOK_ABI } from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'
import { useVaultState } from './useVaultState'

export function usePoolState() {
  const { addresses, isConfigured } = useMochiConfig()
  const { timeToMaturity } = useVaultState()

  const contracts = isConfigured && addresses
    ? [
        { address: addresses.hook, abi: MOCHI_HOOK_ABI, functionName: 'getMarketState' as const },
        { address: addresses.hook, abi: MOCHI_HOOK_ABI, functionName: 'underlyingPrice' as const },
        {
          address: addresses.hook,
          abi: MOCHI_HOOK_ABI,
          functionName: 'calculateFeeForMaturity' as const,
          args: [BigInt(timeToMaturity)],
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

  const ptPrice = marketState?.[0] ?? BigInt(0)
  const ytPrice = marketState?.[1] ?? BigInt(0)
  const impliedAPY = marketState?.[2] ?? BigInt(0)
  const parityDrift = marketState?.[3] ?? BigInt(0)
  const underlyingPrice = (data?.[1]?.result as bigint | undefined) ?? BigInt(10 ** 18)
  const currentFee = (data?.[2]?.result as bigint | undefined) ?? BigInt(0)

  return {
    isLoading,
    refetch,
    ptPrice: Number(ptPrice),
    ytPrice: Number(ytPrice),
    impliedAPY: Number(impliedAPY),
    parityDrift: Number(parityDrift),
    underlyingPrice: Number(underlyingPrice),
    currentFee: Number(currentFee),
    timeToMaturity,
  }
}
