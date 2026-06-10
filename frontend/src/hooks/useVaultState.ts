'use client'

import { useAccount, useReadContracts } from 'wagmi'
import { ERC20_ABI, YIELD_VAULT_ABI } from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'

export function useVaultState() {
  const { address } = useAccount()
  const { addresses, maturity, isConfigured } = useMochiConfig()

  const vaultContracts = isConfigured && addresses
    ? [
        { address: addresses.vault, abi: YIELD_VAULT_ABI, functionName: 'totalDeposited' as const },
        { address: addresses.vault, abi: YIELD_VAULT_ABI, functionName: 'totalUnderlying' as const },
        { address: addresses.vault, abi: YIELD_VAULT_ABI, functionName: 'timeToMaturity' as const },
        { address: addresses.vault, abi: YIELD_VAULT_ABI, functionName: 'isMatured' as const },
      ]
    : []

  const balanceContracts =
    isConfigured && addresses && address
      ? [
          { address: addresses.ptToken, abi: ERC20_ABI, functionName: 'balanceOf' as const, args: [address] },
          { address: addresses.ytToken, abi: ERC20_ABI, functionName: 'balanceOf' as const, args: [address] },
          { address: addresses.underlying, abi: ERC20_ABI, functionName: 'balanceOf' as const, args: [address] },
        ]
      : []

  const { data: vaultData, refetch: refetchVault } = useReadContracts({
    contracts: vaultContracts,
    query: { enabled: isConfigured },
  })

  const { data: balanceData, refetch: refetchBalances } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled: isConfigured && Boolean(address) },
  })

  const refetch = () => {
    refetchVault()
    refetchBalances()
  }

  return {
    isLoading: false,
    refetch,
    maturity,
    timeToMaturity: Number((vaultData?.[2]?.result as bigint | undefined) ?? BigInt(0)),
    isMatured: Boolean(vaultData?.[3]?.result),
    totalDeposited: (vaultData?.[0]?.result as bigint | undefined) ?? BigInt(0),
    totalUnderlying: (vaultData?.[1]?.result as bigint | undefined) ?? BigInt(0),
    ptBalance: (balanceData?.[0]?.result as bigint | undefined) ?? BigInt(0),
    ytBalance: (balanceData?.[1]?.result as bigint | undefined) ?? BigInt(0),
    underlyingBalance: (balanceData?.[2]?.result as bigint | undefined) ?? BigInt(0),
  }
}
