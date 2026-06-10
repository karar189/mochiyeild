'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletConnect } from './WalletConnect'
import { MochiLogo } from './MochiLogo'

const landingNav = [
  { href: '/markets', label: 'Trade' },
  { href: '/deposit', label: 'Vaults' },
  { href: '/deposit', label: 'Portfolio' },
  { href: '/analytics', label: 'Analytics' },
  { href: '#whitepaper', label: 'Whitepaper' },
]

const appNav = [
  { href: '/markets', label: 'Markets' },
  { href: '/deposit', label: 'Vaults' },
  { href: '/analytics', label: 'Analytics' },
]

export function Navbar() {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const navItems = isLanding ? landingNav : appNav
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navSurfaceClass = isLanding
    ? scrolled
      ? 'navbar-glass'
      : 'bg-transparent'
    : 'bg-surface/90 backdrop-blur-md border-b border-border'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${navSurfaceClass}`}
    >
      <div className={`h-full w-full ${isLanding ? 'section-padding' : 'content-max px-6 lg:px-8'}`}>
        <div className={`${isLanding ? 'content-max' : ''} h-full`}>
          <div className="relative flex h-full items-center justify-between">
            <div className="flex shrink-0 items-center">
              <MochiLogo />
            </div>

            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-7 lg:gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const isAnchor = item.href.startsWith('#')

                const className = `text-sm font-medium leading-none text-[#1C1C1C] transition-opacity hover:opacity-70 ${
                  isActive && !isAnchor ? 'opacity-100' : ''
                }`

                if (isAnchor) {
                  return (
                    <a key={item.label} href={item.href} className={className}>
                      {item.label}
                    </a>
                  )
                }

                return (
                  <Link key={item.label} href={item.href} className={className}>
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="ml-auto flex shrink-0 items-center">
              <WalletConnect variant={isLanding ? 'landing' : 'default'} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
