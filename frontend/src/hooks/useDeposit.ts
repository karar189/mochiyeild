'use client'

import { useCallback, useState } from 'react'
import { maxUint256, parseUnits } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWriteContract,
} from 'wagmi'
import { ERC20_ABI, YIELD_VAULT_ABI } from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'

/** Wait for the wallet nonce to advance after a confirmed tx (avoids MetaMask "nonce too low"). */
async function waitForNonceSync(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  address: `0x${string}`,
) {
  const baseline = await publicClient.getTransactionCount({ address, blockTag: 'latest' })
  for (let i = 0; i < 20; i++) {
    const pending = await publicClient.getTransactionCount({ address, blockTag: 'pending' })
    if (pending > baseline) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

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
      let approveHash: `0x${string}` | undefined

      setStatus('approving')
      const allowance = await publicClient!.readContract({
        address: addresses.underlying,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, addresses.vault],
      })

      if (allowance < amountWei) {
        approveHash = await writeContractAsync({
          address: addresses.underlying,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [addresses.vault, maxUint256],
        })
        await publicClient!.waitForTransactionReceipt({ hash: approveHash })
        await waitForNonceSync(publicClient!, address)
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
      return { depositHash, approveHash }
    },
    [address, addresses, isConfigured, publicClient, writeContractAsync],
  )

  const mintTestTokens = useCallback(async () => {
    if (!address || !addresses || !isConfigured) return undefined

    const hash = await writeContractAsync({
      address: addresses.underlying,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [address, parseUnits('100', 18)],
    })
    await publicClient!.waitForTransactionReceipt({ hash })
    return hash
  }, [address, addresses, isConfigured, publicClient, writeContractAsync])

  return { deposit, mintTestTokens, status, isConfigured }
}
