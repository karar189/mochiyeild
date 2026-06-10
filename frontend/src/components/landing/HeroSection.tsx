'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { MOCHI } from '@/lib/mochi-colors'
import SideRays from '@/components/landing/SideRays'
import { HeroMarketCards } from '@/components/landing/HeroMarketCards'
import { HeroTiltedDashboard } from '@/components/landing/HeroTiltedDashboard'
import GradualBlur from '@/components/GradualBlur'

const EASE = [0.22, 1, 0.36, 1] as const

const TAG_CHIPS = [
  'Maturity-aware fees',
  'Implied-rate guard',
  'Cross-pool parity',
  'Reactive callbacks',
] as const

const headlineLines: {
  words: { text: string; yieldGradient?: boolean }[]
}[] = [
  { words: [{ text: 'TRADE' }, { text: 'YIELD.', yieldGradient: true }] },
  { words: [{ text: 'KEEP' }, { text: 'PRINCIPAL.' }] },
]

interface HeroSectionProps {
  bebasClassName: string
}

function WordsPullUp({ bebasClassName }: { bebasClassName: string }) {
  return (
    <h1
      className={`${bebasClassName} text-[#F6F5F2] leading-[0.9] text-[18vw] md:text-[12vw] lg:text-[6.4vw] select-none`}
      aria-label="Trade yield. Keep principal."
    >
      {headlineLines.map((line, lineIdx) => (
        <span key={lineIdx} className="block overflow-hidden whitespace-nowrap pb-[0.06em]">
          {line.words.map((word, wordIdx) => (
            <motion.span
              key={wordIdx}
              className={`inline-block ${
                word.yieldGradient ? 'text-yield-gradient' : ''
              }`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: EASE,
                delay: (lineIdx * line.words.length + wordIdx) * 0.08,
              }}
            >
              {word.text}
              {wordIdx < line.words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  )
}

export function HeroSection({ bebasClassName }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-start overflow-x-visible section-padding pt-24 pb-8 lg:pt-[96px] lg:pb-12">
      <div className="absolute inset-0 z-0">
        <SideRays
          speed={2}
          rayColor1="#eeb817"
          rayColor2="#f6abf6"
          intensity={1.6}
          spread={2}
          origin="top-right"
          tilt={14}
          saturation={1.5}
          blend={0.78}
          falloff={1.9}
          opacity={0.75}
        />
      </div>

      <div className="hero-max w-full relative z-10 mt-8 sm:mt-10 xl:mt-32">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-12 xl:gap-x-14 xl:gap-y-0 items-start pt-2 lg:pt-4">
          <div className="relative z-20 min-w-0">
            <motion.div
              className="mb-6 w-fit"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#A6D95B]/25 bg-[#A6D95B]/[0.08] px-4 py-2 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A6D95B] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#A6D95B]" />
                </span>
                <p className="text-sm leading-none">
                  <span className="font-medium text-[#D8F2C2]">MochiYieldHook</span>
                  <span className="text-[#A1A1AA]"> · live on </span>
                  <span className="font-medium" style={{ color: MOCHI.strawberry }}>
                    Uniswap v4
                  </span>
                </p>
              </div>
            </motion.div>

            <WordsPullUp bebasClassName={bebasClassName} />

            <motion.div
              className="mt-8 max-w-[440px]"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
            >
              <p className="text-[#A1A1AA] text-sm sm:text-base leading-relaxed">
                A Uniswap v4 hook that prices liquidity by{' '}
                <span className="text-[#F6F5F2]">time to maturity</span> — fees
                scale with risk, implied rates stay sane, and PT/YT parity stays
                honest.
              </p>
            </motion.div>

            <motion.div
              className="mt-6 flex flex-wrap gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.52 }}
            >
              {TAG_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#A1A1AA]"
                >
                  {chip}
                </span>
              ))}
            </motion.div>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-start gap-4"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
            >
              <Link
                href="/markets"
                className="inline-flex items-center justify-center gap-2 h-14 px-9 bg-[#FF92B3] hover:bg-[#FFA8C3] text-[#1C1C1C] font-semibold text-[15px] rounded-full hover:scale-[1.02] transition-all"
              >
                Launch App
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </Link>
              <Link
                href="#architecture"
                className="inline-flex items-center justify-center gap-2 h-14 px-9 border border-white/20 text-[#F6F5F2] font-semibold text-[15px] rounded-full hover:scale-[1.02] hover:border-[#FF92B3]/40 hover:bg-[#FF92B3]/08 transition-all"
              >
                Read Architecture
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="relative z-10 min-w-0 w-full flex justify-center items-start overflow-visible pr-12 sm:pr-20 xl:pr-28"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
          >
            <div className="relative w-full max-w-[420px] sm:max-w-[460px] mt-10 overflow-visible">
              <motion.div
                className="relative z-0"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
              >
                <HeroMarketCards showPopularMarkets={false} />
              </motion.div>

              <motion.div
                className="absolute bottom-0 right-0 z-30 flex flex-col items-center pointer-events-none translate-y-[68%] translate-x-[110px] sm:translate-x-[140px] lg:translate-x-[160px]"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
              >
                <div
                  className="w-[280px] h-[280px] absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(255,146,179,0.14), rgba(166,217,91,0.06) 50%, transparent 70%)`,
                  }}
                  aria-hidden
                />

                <video
                  src="/mochi.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="relative z-[1] block h-[250px] sm:h-[285px] lg:h-[310px] w-auto animate-float"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <HeroTiltedDashboard />

      <GradualBlur
        target="parent"
        position="bottom"
        height="10rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
        zIndex={20}
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.35) 55%, transparent 100%)',
        }}
      />
    </section>
  )
}
