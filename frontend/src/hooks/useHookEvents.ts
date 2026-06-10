'use client'

import { useEffect, useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { MOCHI_HOOK_ABI, ARBITRAGE_ROUTER_ABI } from '@/lib/contracts'
import { useMochiConfig } from './useMochiConfig'

export type HookEventType =
  | 'fee_adjusted'
  | 'implied_rate'
  | 'parity_drift'
  | 'reactive_callback'
  | 'swap_rejected'
  | 'market_stress'

export interface HookEvent {
  id: string
  type: HookEventType
  timestamp: number
  data: Record<string, string | number | boolean>
}

const MAX_EVENTS = 20

export function useHookEvents() {
  const { addresses, deployment, isConfigured } = useMochiConfig()
  const [events, setEvents] = useState<HookEvent[]>([])
  const arbitrageRouter = deployment?.reactive?.arbitrageRouter

  const pushEvent = (event: HookEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS))
  }

  useWatchContractEvent({
    address: addresses?.hook,
    abi: MOCHI_HOOK_ABI,
    eventName: 'FeeAdjustedForMaturity',
    enabled: isConfigured,
    onLogs(logs) {
      for (const log of logs) {
        const { timeToMaturity, newFeeBps } = log.args
        pushEvent({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: 'fee_adjusted',
          timestamp: Date.now(),
          data: {
            timeToMaturity: `${Math.floor(Number(timeToMaturity ?? 0) / 86400)}d`,
            newFeeBps: Number(newFeeBps ?? 0),
          },
        })
      }
    },
  })

  useWatchContractEvent({
    address: addresses?.hook,
    abi: MOCHI_HOOK_ABI,
    eventName: 'ImpliedRateUpdated',
    enabled: isConfigured,
    onLogs(logs) {
      for (const log of logs) {
        const { impliedAPY, ptPrice } = log.args
        pushEvent({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: 'implied_rate',
          timestamp: Date.now(),
          data: {
            impliedAPY: Number(impliedAPY ?? 0) / 100,
            ptPrice: Number(ptPrice ?? 0) / 1e18,
          },
        })
      }
    },
  })

  useWatchContractEvent({
    address: addresses?.hook,
    abi: MOCHI_HOOK_ABI,
    eventName: 'ParityDriftDetected',
    enabled: isConfigured,
    onLogs(logs) {
      for (const log of logs) {
        const { driftBps, isOverValued } = log.args
        pushEvent({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: 'parity_drift',
          timestamp: Date.now(),
          data: {
            driftBps: Number(driftBps ?? 0),
            isOverValued: Boolean(isOverValued),
          },
        })
      }
    },
  })

  useWatchContractEvent({
    address: arbitrageRouter,
    abi: ARBITRAGE_ROUTER_ABI,
    eventName: 'ParityRestored',
    enabled: isConfigured && Boolean(arbitrageRouter),
    onLogs(logs) {
      for (const log of logs) {
        const { driftBps, isOverValued } = log.args
        pushEvent({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: 'reactive_callback',
          timestamp: Date.now(),
          data: {
            driftBps: Number(driftBps ?? 0),
            isOverValued: Boolean(isOverValued),
          },
        })
      }
    },
  })

  useWatchContractEvent({
    address: addresses?.hook,
    abi: MOCHI_HOOK_ABI,
    eventName: 'SwapRejectedNegativeYield',
    enabled: isConfigured,
    onLogs(logs) {
      for (const log of logs) {
        pushEvent({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: 'swap_rejected',
          timestamp: Date.now(),
          data: {},
        })
      }
    },
  })

  useWatchContractEvent({
    address: addresses?.hook,
    abi: MOCHI_HOOK_ABI,
    eventName: 'MarketStressDetected',
    enabled: isConfigured,
    onLogs(logs) {
      for (const log of logs) {
        const { reason } = log.args
        pushEvent({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: 'market_stress',
          timestamp: Date.now(),
          data: { reason: String(reason ?? 'Market stress') },
        })
      }
    },
  })

  useEffect(() => {
    if (!isConfigured) setEvents([])
  }, [isConfigured])

  return { events, isLive: isConfigured }
}
