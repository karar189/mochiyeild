'use client'

import { ExternalLink } from 'lucide-react'
import { getTransactionExplorerUrl } from '@/lib/explorer'

function truncateHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

export function TxHashLink({
  chainId,
  label,
  hash,
}: {
  chainId: number
  label: string
  hash: `0x${string}`
}) {
  const explorerUrl = getTransactionExplorerUrl(chainId, hash)

  return (
    <div className="flex items-center justify-between gap-2 pl-6 text-xs">
      <span className="text-secondary">{label}</span>
      {explorerUrl ? (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[#A6D95B] hover:underline"
        >
          {truncateHash(hash)}
          <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
        </a>
      ) : (
        <span className="font-mono text-primary">{truncateHash(hash)}</span>
      )}
    </div>
  )
}
