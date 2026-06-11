import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { MOCHI } from '@/lib/mochi-colors'

interface BrandLogoProps {
  className?: string
  showLink?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: { icon: 'w-3.5 h-3.5', text: 'text-base' },
  md: { icon: 'w-4 h-4', text: 'text-base' },
  lg: { icon: 'w-4 h-4', text: 'text-xl' },
} as const

export function BrandLogo({
  className = '',
  showLink = true,
  size = 'md',
}: BrandLogoProps) {
  const s = sizeClasses[size]

  const logo = (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Sprout
        className={`${s.icon} shrink-0`}
        style={{ color: MOCHI.matcha }}
        strokeWidth={2.5}
      />
      <span className={`${s.text} font-semibold tracking-tight leading-none`}>
        <span style={{ color: MOCHI.strawberry }}>mochi</span>
        <span style={{ color: MOCHI.matcha }}>yeild</span>
      </span>
    </span>
  )

  if (!showLink) return logo

  return (
    <Link href="/" className="inline-flex items-center">
      {logo}
    </Link>
  )
}
