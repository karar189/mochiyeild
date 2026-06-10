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

  const isDark = variant === 'landing'

  useEffect(() => {
    setMounted(true)
  }, [])

  const buttonClass = isDark
    ? 'inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full bg-[#FF92B3] hover:bg-[#FFA8C3] text-[#1C1C1C] text-sm font-semibold transition-colors disabled:opacity-50'
    : 'btn-primary text-sm disabled:opacity-50'

  if (!mounted) {
    return (
      <button type="button" className={buttonClass} disabled aria-hidden>
        <Wallet className="w-4 h-4" strokeWidth={1.75} />
        Connect Wallet
        {isDark ? (
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
        <div
          className={`px-4 py-2 rounded-full flex items-center gap-2 ${
            isDark
              ? 'bg-white/[0.06] border border-white/[0.08]'
              : 'bg-cream border border-border'
          }`}
        >
          <div className="w-2 h-2 bg-[#A6D95B] rounded-full" />
          <span
            className={`text-sm font-medium ${
              isDark ? 'text-[#F6F5F2]' : 'text-secondary'
            }`}
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? 'bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1]'
              : 'bg-cream border border-border hover:bg-yield-green/50'
          }`}
          aria-label="Disconnect wallet"
        >
          <LogOut
            className={`w-4 h-4 ${isDark ? 'text-[#A1A1AA]' : 'text-secondary'}`}
            strokeWidth={1.75}
          />
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
        {isDark ? (
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 mt-2 w-56 rounded-2xl z-50 ${
            isDark
              ? 'bg-[#101010] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
              : 'bg-surface border border-border shadow-[var(--shadow-card)]'
          }`}
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
              className={`w-full px-4 py-3 text-left text-sm first:rounded-t-2xl last:rounded-b-2xl transition-colors disabled:opacity-50 ${
                isDark
                  ? 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-[#F6F5F2]'
                  : 'text-secondary hover:bg-cream'
              }`}
            >
              {connector.name}
            </button>
          ))}
          {error && (
            <p
              className={`px-4 py-2 text-xs border-t ${
                isDark
                  ? 'text-[#FF92B3] border-white/[0.06]'
                  : 'text-red-600 border-border'
              }`}
            >
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
