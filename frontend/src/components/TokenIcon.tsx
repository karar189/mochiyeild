'use client'

import Image from 'next/image'
import { getCoingeckoImageUrl, resolveTokenSymbol } from '@/lib/tokens/coingecko'

interface TokenIconProps {
  /** Market name ("wstETH PT") or symbol ("wstETH") */
  label: string
  size?: number
  className?: string
}

export function TokenIcon({ label, size = 32, className = '' }: TokenIconProps) {
  const src = getCoingeckoImageUrl(label)
  const symbol = resolveTokenSymbol(label) ?? label
  const dim = `${size}px`

  if (!src) {
    return (
      <div
        className={`rounded-lg shrink-0 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-[9px] font-semibold text-[#71717A] ${className}`}
        style={{ width: dim, height: dim }}
        aria-hidden
      >
        {symbol.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg shrink-0 overflow-hidden bg-white/[0.04] border border-white/[0.06] ${className}`}
      style={{ width: dim, height: dim }}
    >
      <Image
        src={src}
        alt={symbol}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized
      />
    </div>
  )
}
