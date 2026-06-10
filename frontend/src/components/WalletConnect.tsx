'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, LogOut, ChevronDown, ArrowRight } from 'lucide-react'

interface WalletConnectProps {
  variant?: 'default' | 'landing'
}

function useWalletConnectors() {
  const { connectors } = useConnect()

  return useMemo(() => {
    const targeted = connectors.filter((connector) => connector.id !== 'injected')
    return targeted.length > 0 ? targeted : connectors
  }, [connectors])
}

export function WalletConnect({ variant = 'default' }: WalletConnectProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, isPending, error, reset } = useConnect()
  const walletConnectors = useWalletConnectors()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  const buttonClass =
    variant === 'landing'
      ? 'btn-wallet-landing'
      : 'btn-primary text-sm disabled:opacity-50'

  // Stable SSR shell — wagmi state/connectors differ on server vs client
  if (!mounted) {
    return (
      <button type="button" className={buttonClass} disabled aria-hidden>
        <Wallet className="w-4 h-4" strokeWidth={1.75} />
        Connect Wallet
        {variant === 'landing' ? (
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
        )}
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-cream border border-border rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full" />
          <span className="text-sm text-secondary font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="p-2 bg-cream border border-border rounded-full hover:bg-yield-green/50 transition-colors"
          aria-label="Disconnect wallet"
        >
          <LogOut className="w-4 h-4 text-secondary" strokeWidth={1.75} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={isPending}
        className={buttonClass}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Wallet className="w-4 h-4" strokeWidth={1.75} />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
        {variant === 'landing' ? (
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-[var(--shadow-card)] z-50"
        >
          {walletConnectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => {
                reset()
                connect(
                  { connector },
                  {
                    onSuccess: () => setOpen(false),
                    onError: () => setOpen(true),
                  },
                )
              }}
              className="w-full px-4 py-3 text-left text-sm text-secondary hover:bg-cream first:rounded-t-2xl last:rounded-b-2xl transition-colors disabled:opacity-50"
            >
              {connector.name}
            </button>
          ))}
          {error && (
            <p className="px-4 py-2 text-xs text-red-600 border-t border-border">
              {error.message.includes('rejected')
                ? 'Connection cancelled.'
                : 'Could not connect. Try again or pick another wallet.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
