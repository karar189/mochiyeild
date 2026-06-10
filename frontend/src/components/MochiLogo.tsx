import Link from 'next/link'
import { Sprout } from 'lucide-react'

interface MochiLogoProps {
  className?: string
  showLink?: boolean
}

export function MochiLogo({ className = '', showLink = true }: MochiLogoProps) {
  const logo = (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Sprout
        className="w-3.5 h-3.5 text-[#A6D95B] shrink-0"
        strokeWidth={2.5}
      />
      <span className="text-xl font-semibold tracking-tight leading-none">
        <span className="text-[#FF92B3]">mochi</span>
        <span className="text-[#A6D95B]">trade</span>
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
