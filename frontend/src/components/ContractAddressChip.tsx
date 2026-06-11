'use client'

import { useCallback, useState } from 'react'
import { getContractExplorerUrl } from '@/lib/explorer'

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

const chipClassName =
  'inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs transition-colors cursor-pointer hover:border-[#FF92B3]/35 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF92B3]/40'

interface ContractAddressChipProps {
  label: string
  address: string
  chainId: number
}

export function ContractAddressChip({
  label,
  address,
  chainId,
}: ContractAddressChipProps) {
  const [copied, setCopied] = useState(false)
  const explorerUrl = getContractExplorerUrl(chainId, address)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard without gesture
      window.prompt('Copy contract address:', address)
    }
  }, [address])

  const content = (
    <>
      <span className="font-medium text-[#F6F5F2]">{label}</span>
      <span className="font-mono text-[#A1A1AA]">
        {copied ? 'Copied!' : truncateAddress(address)}
      </span>
    </>
  )

  if (explorerUrl) {
    return (
      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        className={chipClassName}
        title={`View ${label} on block explorer (${address})`}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={chipClassName}
      title={`Copy ${label} address (${address})`}
    >
      {content}
    </button>
  )
}

interface ContractAddressLinkProps {
  address: string
  chainId: number
  className?: string
}

export function ContractAddressLink({
  address,
  chainId,
  className = 'text-[#FF92B3] hover:text-[#FFB4C8] transition-colors',
}: ContractAddressLinkProps) {
  const [copied, setCopied] = useState(false)
  const explorerUrl = getContractExplorerUrl(chainId, address)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy address:', address)
    }
  }, [address])

  const display = copied ? 'Copied!' : truncateAddress(address)

  if (explorerUrl) {
    return (
      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        className={className}
        title={address}
      >
        {display}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${className} cursor-pointer`}
      title={`Copy address (${address})`}
    >
      {display}
    </button>
  )
}
