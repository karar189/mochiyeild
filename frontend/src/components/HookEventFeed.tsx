'use client'

import { useState } from 'react'
import { Activity, TrendingUp, AlertTriangle, XCircle, Zap, RefreshCw } from 'lucide-react'
import { useHookEvents, HookEvent, HookEventType } from '@/hooks/useHookEvents'

export function HookEventFeed() {
  const { events, isLive } = useHookEvents()
  const [isPaused, setIsPaused] = useState(false)
  const displayEvents = isPaused ? [] : events

  const getEventIcon = (type: HookEventType) => {
    switch (type) {
      case 'fee_adjusted':
        return <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
      case 'implied_rate':
        return <TrendingUp className="w-4 h-4" strokeWidth={1.75} />
      case 'parity_drift':
        return <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
      case 'reactive_callback':
        return <Zap className="w-4 h-4" strokeWidth={1.75} />
      case 'swap_rejected':
        return <XCircle className="w-4 h-4" strokeWidth={1.75} />
      case 'market_stress':
        return <Zap className="w-4 h-4" strokeWidth={1.75} />
    }
  }

  const getEventColor = (type: HookEventType) => {
    switch (type) {
      case 'fee_adjusted':
        return 'text-success bg-yield-green/50'
      case 'implied_rate':
        return 'text-primary bg-cream'
      case 'parity_drift':
        return 'text-primary bg-mochi-pink/50'
      case 'reactive_callback':
        return 'text-success bg-yield-green/50'
      case 'swap_rejected':
        return 'text-primary bg-rose/30'
      case 'market_stress':
        return 'text-primary bg-sage/50'
    }
  }

  const getEventTitle = (type: HookEventType) => {
    switch (type) {
      case 'fee_adjusted':
        return 'Fee Adjusted'
      case 'implied_rate':
        return 'Implied Rate Updated'
      case 'parity_drift':
        return 'Parity Drift'
      case 'reactive_callback':
        return 'Reactive Callback'
      case 'swap_rejected':
        return 'Swap Rejected'
      case 'market_stress':
        return 'Market Stress'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const formatEventData = (event: HookEvent) => {
    switch (event.type) {
      case 'fee_adjusted':
        return `Fee: ${(Number(event.data.newFeeBps) / 100).toFixed(2)}% (${event.data.timeToMaturity} to maturity)`
      case 'implied_rate':
        return `APY: ${Number(event.data.impliedAPY).toFixed(2)}% | PT: ${Number(event.data.ptPrice).toFixed(4)}`
      case 'parity_drift':
        return `Drift: ${(Number(event.data.driftBps) / 100).toFixed(2)}% ${event.data.isOverValued ? '(overvalued)' : '(undervalued)'}`
      case 'reactive_callback':
        return `Reactive restored parity — drift ${(Number(event.data.driftBps) / 100).toFixed(2)}%`
      case 'swap_rejected':
        return 'Negative yield prevented'
      case 'market_stress':
        return String(event.data.reason || 'Market conditions abnormal')
    }
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#A6D95B]" strokeWidth={1.75} />
          <h3 className="text-primary font-medium">Live Hook Activity</h3>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
            isLive && !isPaused ? 'bg-[#A6D95B]/15 text-[#A6D95B] border border-[#A6D95B]/25' : 'bg-cream text-muted'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isLive && !isPaused ? 'bg-[#A6D95B] animate-pulse' : 'bg-muted'}`}
          />
          {isPaused ? 'Paused' : isLive ? 'Live' : 'Offline'}
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {displayEvents.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted text-sm">
            {isLive
              ? 'Waiting for hook events. Execute a swap to see live activity.'
              : 'Connect to Anvil (chain 31337) with deployed contracts.'}
          </div>
        ) : (
          displayEvents.map((event) => (
            <div
              key={event.id}
              className="px-4 py-3 border-b border-border last:border-0 hover:bg-cream/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-sm font-medium">
                      {getEventTitle(event.type)}
                    </span>
                    <span className="text-muted text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-secondary text-xs mt-0.5 truncate">
                    {formatEventData(event)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
