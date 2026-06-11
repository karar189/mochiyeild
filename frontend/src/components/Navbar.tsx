'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BrandLogo } from './BrandLogo'
import { WalletConnect } from './WalletConnect'

const SPRING = {
  stiffness: 260,
  damping: 34,
  mass: 0.85,
} as const

const INSTANT_SPRING = {
  stiffness: 10000,
  damping: 100,
  mass: 1,
} as const

const MotionLink = motion.create(Link)

const navItems = [
  { href: '/markets', label: 'Markets' },
  { href: '/deposit', label: 'Vaults' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/whitepaper', label: 'Docs' },
]

export function Navbar() {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const reduceMotion = useReducedMotion()

  const [scrolled, setScrolled] = useState(!isLanding)

  const progress = useSpring(isLanding ? 0 : 1, {
    ...(reduceMotion ? INSTANT_SPRING : SPRING),
  })

  useEffect(() => {
    if (!isLanding) {
      setScrolled(true)
      progress.set(1)
      return
    }

    setScrolled(false)
    progress.set(0)

    let ticking = false

    const update = () => {
      const y = window.scrollY
      setScrolled((prev) => {
        if (!prev && y > 56) return true
        if (prev && y < 20) return false
        return prev
      })
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isLanding, progress])

  useEffect(() => {
    progress.set(scrolled ? 1 : 0)
  }, [scrolled, progress])

  const outerPaddingTop = useTransform(progress, [0, 1], [32, 16])
  const maxWidth = useTransform(progress, [0, 1], [1400, 720])
  const barPaddingY = useTransform(progress, [0, 1], [4, 6])
  const barPaddingX = useTransform(progress, [0, 1], [0, 16])
  const barGap = useTransform(progress, [0, 1], [16, 10])
  const borderRadius = useTransform(progress, [0, 1], [0, 9999])
  const glassOpacity = useTransform(progress, [0, 1], [0, 1])
  const navGap = useTransform(progress, [0, 1], [32, 14])
  const linkPadX = useTransform(progress, [0, 1], [0, 8])
  const btnHeight = useTransform(progress, [0, 1], [44, 40])
  const btnPadX = useTransform(progress, [0, 1], [24, 18])

  return (
    <motion.nav
      className="fixed inset-x-0 top-0 z-50 section-padding"
      style={{ paddingTop: outerPaddingTop }}
    >
      <motion.div
        className="relative mx-auto flex w-full items-center"
        style={{
          maxWidth,
          paddingTop: barPaddingY,
          paddingBottom: barPaddingY,
          paddingLeft: barPaddingX,
          paddingRight: barPaddingX,
          borderRadius,
          gap: barGap,
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            opacity: glassOpacity,
            borderRadius,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
          aria-hidden
        />

        <div className="relative z-10 shrink-0">
          <BrandLogo />
        </div>

        <motion.nav
          className="hidden min-w-0 flex-1 md:flex items-center justify-center"
          style={{ gap: navGap }}
          aria-label="Main"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/whitepaper' && pathname.startsWith('/whitepaper'))

            return (
              <motion.div
                key={item.label}
                className="shrink-0"
                style={{ paddingLeft: linkPadX, paddingRight: linkPadX }}
              >
                <Link
                  href={item.href}
                  className={`block text-sm font-medium leading-none transition-colors ${
                    isActive
                      ? 'text-[#F6F5F2]'
                      : 'text-[#A1A1AA] hover:text-[#F6F5F2]'
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            )
          })}
        </motion.nav>

        <div className="relative z-10 ml-auto shrink-0">
          {isLanding ? (
            <MotionLink
              href="/markets"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#FF92B3] text-[#1C1C1C] text-sm font-semibold transition-colors hover:bg-[#FFA8C3]"
              style={{
                height: btnHeight,
                paddingLeft: btnPadX,
                paddingRight: btnPadX,
              }}
            >
              Launch App
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </MotionLink>
          ) : (
            <WalletConnect variant="landing" />
          )}
        </div>
      </motion.div>
    </motion.nav>
  )
}
