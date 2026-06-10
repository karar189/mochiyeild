'use client'

import { useCallback, useState } from 'react'
import { parseUnits } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { ERC20_ABI, YIELD_VAULT_ABI } from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'

export function useDeposit() {
  const { address } = useAccount()
  const { addresses, isConfigured } = useMochiConfig()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [status, setStatus] = useState<'idle' | 'approving' | 'depositing'>('idle')

  const deposit = useCallback(
    async (amount: string) => {
      if (!address || !addresses || !isConfigured) {
        throw new Error('Wallet or deployment not configured')
      }

      const amountWei = parseUnits(amount, 18)

      setStatus('approving')
      const allowance = await publicClient!.readContract({
        address: addresses.underlying,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, addresses.vault],
      })

      if (allowance < amountWei) {
        const approveHash = await writeContractAsync({
          address: addresses.underlying,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [addresses.vault, amountWei],
        })
        await publicClient!.waitForTransactionReceipt({ hash: approveHash })
      }

      setStatus('depositing')
      const depositHash = await writeContractAsync({
        address: addresses.vault,
        abi: YIELD_VAULT_ABI,
        functionName: 'deposit',
        args: [amountWei],
      })
      await publicClient!.waitForTransactionReceipt({ hash: depositHash })
      setStatus('idle')
    },
    [address, addresses, isConfigured, publicClient, writeContractAsync],
  )

  const mintTestTokens = useCallback(async () => {
    if (!address || !addresses || !isConfigured) return

    const hash = await writeContractAsync({
      address: addresses.underlying,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [address, parseUnits('100', 18)],
    })
    await publicClient!.waitForTransactionReceipt({ hash })
  }, [address, addresses, isConfigured, publicClient, writeContractAsync])

  return { deposit, mintTestTokens, status, isConfigured }
}
