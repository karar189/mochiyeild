'use client'

import { useCallback, useState } from 'react'
import { maxUint256, parseUnits } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWriteContract,
} from 'wagmi'
import {
  buildPoolKey,
  ERC20_ABI,
  PoolConfig,
  SWAP_ROUTER_ABI,
} from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'

type SwapDirection = 'sell' | 'buy'

export type SwapStatus =
  | 'idle'
  | 'preparing'
  | 'awaiting_approval'
  | 'approving'
  | 'awaiting_swap'
  | 'confirming'

export type SwapResult = {
  swapHash: `0x${string}`
  approveHash?: `0x${string}`
}

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

export function useSwap(pool: PoolConfig | null) {
  const { address } = useAccount()
  const { addresses, isConfigured } = useMochiConfig()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [status, setStatus] = useState<SwapStatus>('idle')

  const swap = useCallback(
    async (amount: string, direction: SwapDirection): Promise<SwapResult> => {
      if (!address || !addresses || !pool || !isConfigured) {
        throw new Error('Wallet, pool, or deployment not configured')
      }

      try {
        setStatus('preparing')
        const amountWei = parseUnits(amount, 18)
        const sellToken =
          direction === 'sell' ? pool.tradeToken : addresses.weth
        const zeroForOne =
          direction === 'sell' ? pool.tokenIsCurrency0 : !pool.tokenIsCurrency0

        let approveHash: `0x${string}` | undefined

        const allowance = await publicClient!.readContract({
          address: sellToken,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, addresses.swapRouter],
        })

        if (allowance < amountWei) {
          setStatus('awaiting_approval')
          approveHash = await writeContractAsync({
            address: sellToken,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [addresses.swapRouter, maxUint256],
          })
          setStatus('approving')
          await publicClient!.waitForTransactionReceipt({ hash: approveHash })
          await waitForNonceSync(publicClient!, address)
        }

        setStatus('awaiting_swap')
        const swapHash = await writeContractAsync({
          address: addresses.swapRouter,
          abi: SWAP_ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [
            amountWei,
            BigInt(0),
            zeroForOne,
            buildPoolKey(pool),
            '0x',
            address,
            BigInt(Math.floor(Date.now() / 1000) + 600),
          ],
        })
        setStatus('confirming')
        await publicClient!.waitForTransactionReceipt({ hash: swapHash })

        return { swapHash, approveHash }
      } finally {
        setStatus('idle')
      }
    },
    [address, addresses, isConfigured, pool, publicClient, writeContractAsync],
  )

  return { swap, status, isConfigured }
}

export function getSwapStatusMessage(status: SwapStatus): string {
  switch (status) {
    case 'preparing':
      return 'Preparing transaction…'
    case 'awaiting_approval':
      return 'Confirm the spending cap in your wallet'
    case 'approving':
      return 'Approval confirming on chain…'
    case 'awaiting_swap':
      return 'Confirm the swap in your wallet'
    case 'confirming':
      return 'Swap confirming on chain…'
    default:
      return ''
  }
}
