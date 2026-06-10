import { bebasNeue } from '@/lib/fonts'
import type { ReactNode } from 'react'

interface AppPageShellProps {
  title?: string
  subtitle?: string
  children: ReactNode
  headerExtra?: ReactNode
  centered?: boolean
}

export function AppPageShell({
  title,
  subtitle,
  children,
  headerExtra,
  centered = true,
}: AppPageShellProps) {
  const showHeader = title || subtitle || headerExtra

  return (
    <div className="min-h-screen bg-[#050505] text-[#F6F5F2] font-[family-name:var(--font-inter)] pt-28 pb-20 section-padding">
      <div className="content-max">
        {showHeader && (
          <header className={`mb-12 ${centered ? 'text-center' : ''}`}>
            {title && (
              <h1
                className={`${bebasNeue.className} text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-[#F6F5F2] mb-4`}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                className={`text-[#A1A1AA] text-base md:text-lg leading-relaxed ${
                  centered ? 'max-w-xl mx-auto' : 'max-w-2xl'
                }`}
              >
                {subtitle}
              </p>
            )}
            {headerExtra}
          </header>
        )}
        {children}
      </div>
    </div>
  )
}
