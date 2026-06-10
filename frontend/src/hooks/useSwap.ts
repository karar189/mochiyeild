'use client'

import { useCallback, useState } from 'react'
import { parseUnits } from 'viem'
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

export function useSwap(pool: PoolConfig | null) {
  const { address } = useAccount()
  const { addresses, isConfigured } = useMochiConfig()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [status, setStatus] = useState<'idle' | 'approving' | 'swapping'>('idle')

  const swap = useCallback(
    async (amount: string, direction: SwapDirection) => {
      if (!address || !addresses || !pool || !isConfigured) {
        throw new Error('Wallet, pool, or deployment not configured')
      }

      const amountWei = parseUnits(amount, 18)
      const sellToken =
        direction === 'sell' ? pool.tradeToken : addresses.weth
      const zeroForOne =
        direction === 'sell' ? pool.tokenIsCurrency0 : !pool.tokenIsCurrency0

      setStatus('approving')
      const allowance = await publicClient!.readContract({
        address: sellToken,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, addresses.swapRouter],
      })

      if (allowance < amountWei) {
        const approveHash = await writeContractAsync({
          address: sellToken,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [addresses.swapRouter, amountWei],
        })
        await publicClient!.waitForTransactionReceipt({ hash: approveHash })
      }

      setStatus('swapping')
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
      await publicClient!.waitForTransactionReceipt({ hash: swapHash })
      setStatus('idle')
    },
    [address, addresses, isConfigured, pool, publicClient, writeContractAsync],
  )

  return { swap, status, isConfigured }
}
