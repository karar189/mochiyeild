'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePublicClient, useWatchContractEvent } from 'wagmi'
import type { Log } from 'viem'
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
const LOG_CHUNK_SIZE = BigInt(9999)
const MAX_LOG_CHUNKS = 8

type ParsedHookLog = Log & {
  eventName: string
  args: Record<string, unknown>
}

function logToHookEvent(log: ParsedHookLog, timestamp: number): HookEvent | null {
  const id = `${log.transactionHash}-${log.logIndex}`

  switch (log.eventName) {
    case 'FeeAdjustedForMaturity': {
      const { timeToMaturity, newFeeBps } = log.args
      return {
        id,
        type: 'fee_adjusted',
        timestamp,
        data: {
          timeToMaturity: `${Math.floor(Number(timeToMaturity ?? 0) / 86400)}d`,
          newFeeBps: Number(newFeeBps ?? 0),
        },
      }
    }
    case 'ImpliedRateUpdated': {
      const { impliedAPY, ptPrice } = log.args
      return {
        id,
        type: 'implied_rate',
        timestamp,
        data: {
          impliedAPY: Number(impliedAPY ?? 0) / 100,
          ptPrice: Number(ptPrice ?? 0) / 1e18,
        },
      }
    }
    case 'ParityDriftDetected': {
      const { driftBps, isOverValued } = log.args
      return {
        id,
        type: 'parity_drift',
        timestamp,
        data: {
          driftBps: Number(driftBps ?? 0),
          isOverValued: Boolean(isOverValued),
        },
      }
    }
    case 'ParityRestored': {
      const { driftBps, isOverValued } = log.args
      return {
        id,
        type: 'reactive_callback',
        timestamp,
        data: {
          driftBps: Number(driftBps ?? 0),
          isOverValued: Boolean(isOverValued),
        },
      }
    }
    case 'SwapRejectedNegativeYield':
      return {
        id,
        type: 'swap_rejected',
        timestamp,
        data: {},
      }
    case 'MarketStressDetected': {
      const { reason } = log.args
      return {
        id,
        type: 'market_stress',
        timestamp,
        data: { reason: String(reason ?? 'Market stress') },
      }
    }
    default:
      return null
  }
}

function sortEvents(events: HookEvent[]): HookEvent[] {
  return [...events]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_EVENTS)
}

async function fetchPaginatedEvents(
  publicClient: NonNullable<ReturnType<typeof import('wagmi').usePublicClient>>,
  address: `0x${string}`,
  abi: typeof MOCHI_HOOK_ABI | typeof ARBITRAGE_ROUTER_ABI,
) {
  const latestBlock = await publicClient.getBlockNumber()
  const collected: ParsedHookLog[] = []
  let end = latestBlock

  for (let i = 0; i < MAX_LOG_CHUNKS; i++) {
    const start = end > LOG_CHUNK_SIZE ? end - LOG_CHUNK_SIZE : BigInt(0)
    const chunk = (await publicClient.getContractEvents({
      address,
      abi,
      fromBlock: start,
      toBlock: end,
    })) as ParsedHookLog[]
    collected.push(...chunk)
    if (start === BigInt(0)) break
    end = start - BigInt(1)
  }

  return collected
}

export function useHookEvents() {
  const { addresses, deployment, isConfigured } = useMochiConfig()
  const publicClient = usePublicClient()
  const [events, setEvents] = useState<HookEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const arbitrageRouter = deployment?.reactive?.arbitrageRouter

  const mergeEvent = useCallback((event: HookEvent) => {
    setEvents((prev) => {
      if (prev.some((existing) => existing.id === event.id)) return prev
      return sortEvents([event, ...prev])
    })
  }, [])

  useEffect(() => {
    if (!isConfigured || !addresses?.hook || !publicClient) {
      setEvents([])
      return
    }

    let cancelled = false

    async function loadHistory() {
      setIsLoading(true)
      try {
        const [hookLogs, reactiveLogs] = await Promise.all([
          fetchPaginatedEvents(publicClient, addresses!.hook, MOCHI_HOOK_ABI),
          arbitrageRouter
            ? fetchPaginatedEvents(publicClient, arbitrageRouter, ARBITRAGE_ROUTER_ABI)
            : Promise.resolve([]),
        ])

        const allLogs = [...hookLogs, ...reactiveLogs] as ParsedHookLog[]
        const blockNumbers = [
          ...new Set(
            allLogs
              .map((log) => log.blockNumber)
              .filter((blockNumber): blockNumber is bigint => blockNumber != null),
          ),
        ]
        const blockTimestamps = new Map<bigint, number>()

        await Promise.all(
          blockNumbers.slice(0, 50).map(async (blockNumber) => {
            const block = await publicClient.getBlock({ blockNumber })
            blockTimestamps.set(blockNumber, Number(block.timestamp) * 1000)
          }),
        )

        const historical = allLogs
          .map((log) =>
            logToHookEvent(
              log,
              log.blockNumber != null
                ? (blockTimestamps.get(log.blockNumber) ?? Date.now())
                : Date.now(),
            ),
          )
          .filter((event): event is HookEvent => event !== null)

        if (!cancelled) {
          setEvents(sortEvents(historical))
        }
      } catch {
        if (!cancelled) setEvents([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [addresses?.hook, arbitrageRouter, isConfigured, publicClient])

  useWatchContractEvent({
    address: addresses?.hook,
    abi: MOCHI_HOOK_ABI,
    eventName: 'FeeAdjustedForMaturity',
    enabled: isConfigured,
    onLogs(logs) {
      for (const log of logs) {
        const event = logToHookEvent(log as ParsedHookLog, Date.now())
        if (event) mergeEvent(event)
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
        const event = logToHookEvent(log as ParsedHookLog, Date.now())
        if (event) mergeEvent(event)
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
        const event = logToHookEvent(log as ParsedHookLog, Date.now())
        if (event) mergeEvent(event)
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
        const event = logToHookEvent(log as ParsedHookLog, Date.now())
        if (event) mergeEvent(event)
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
        const event = logToHookEvent(log as ParsedHookLog, Date.now())
        if (event) mergeEvent(event)
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
        const event = logToHookEvent(log as ParsedHookLog, Date.now())
        if (event) mergeEvent(event)
      }
    },
  })

  return { events, isLive: isConfigured, isLoading }
}
