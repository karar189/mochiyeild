'use client'

import { useCallback, useState } from 'react'
import { parseUnits } from 'viem'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { YIELD_VAULT_ABI } from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'

export function useRedeem() {
  const { address } = useAccount()
  const { addresses, isConfigured } = useMochiConfig()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [status, setStatus] = useState<'idle' | 'redeeming'>('idle')

  const redeem = useCallback(
    async (amount: string) => {
      if (!address || !addresses || !isConfigured) {
        throw new Error('Wallet or deployment not configured')
      }

      const amountWei = parseUnits(amount, 18)

      setStatus('redeeming')
      const hash = await writeContractAsync({
        address: addresses.vault,
        abi: YIELD_VAULT_ABI,
        functionName: 'redeem',
        args: [amountWei],
      })
      await publicClient!.waitForTransactionReceipt({ hash })
      setStatus('idle')
    },
    [address, addresses, isConfigured, publicClient, writeContractAsync],
  )

  return { redeem, status, isConfigured }
}
