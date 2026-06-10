'use client'

import { useAccount, useChainId } from 'wagmi'
import { getDeployment } from '@/lib/contracts'

export function useMochiConfig() {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const deployment = getDeployment(chainId)

  return {
    chainId,
    isConnected,
    isConfigured: Boolean(deployment),
    deployment,
    addresses: deployment?.addresses ?? null,
    pools: deployment?.pools ?? null,
    maturity: deployment?.maturity ?? 0,
  }
}
