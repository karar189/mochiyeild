'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FileText,
  Gauge,
  Globe,
  Maximize2,
  Minimize2,
  Radar,
  Satellite,
  Sparkles,
  Timer,
  X,
  Zap,
} from 'lucide-react'

/* ---------------------------------------------------------------- */
/* Shared bits                                                       */
/* ---------------------------------------------------------------- */

const PINK = '#FF92B3'
const GREEN = '#A6D95B'
const YELLOW = '#EEB817'
const PURPLE = '#A78BFA'

const GITHUB_URL = 'https://github.com/karar189/mochitrade'
const EXPLORER_URL =
  'https://unichain-sepolia.blockscout.com/address/0x1f592B54a638d55056Ad45ed810814F7880580c0'
const SITE_URL = 'https://mochiyeild.xyz'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2.2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.73-1.34-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.32 1.24-3.14-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.2a11.6 11.6 0 0 1 6 0c2.29-1.52 3.3-1.2 3.3-1.2.66 1.66.24 2.88.12 3.18.77.82 1.23 1.86 1.23 3.14 0 4.5-2.81 5.48-5.49 5.77.43.36.81 1.08.81 2.18v3.23c0 .31.22.68.83.56A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  )
}

function Eyebrow({ children, dot = GREEN }: { children: React.ReactNode; dot?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full"
        style={{ background: dot }}
      />
      {children}
    </span>
  )
}

function SlideCard({
  children,
  className = '',
  accent,
}: {
  children: React.ReactNode
  className?: string
  accent?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#101010] transition-colors ${className}`}
      style={accent ? { borderColor: `${accent}30` } : undefined}
    >
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 1 — Title                                                   */
/* ---------------------------------------------------------------- */

function TitleSlide() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="relative mb-2"
        initial={{ opacity: 0, scale: 0.85, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(255,146,179,0.16), rgba(166,217,91,0.07) 50%, transparent 70%)',
          }}
          aria-hidden
        />
        <video
          src="/mochi.webm"
          autoPlay
          loop
          muted
          playsInline
          className="animate-float relative z-[1] block h-[140px] w-auto sm:h-[170px] lg:h-[190px]"
        />
      </motion.div>

      <Eyebrow>Uniswap v4 Hook · Live on Unichain Sepolia</Eyebrow>

      <h1 className="font-bebas mt-6 text-6xl leading-[0.9] sm:text-8xl lg:text-[9rem]">
        MOCHI <span className="text-yield-gradient">YIELD</span>
      </h1>

      <p className="font-clash mt-6 max-w-2xl text-xl font-medium text-[#F6F5F2] sm:text-2xl">
        Trade future yield without selling your assets.
      </p>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
        A Uniswap v4 hook that prices liquidity by{' '}
        <span className="text-[#F6F5F2]">time to maturity</span> — fees scale
        with risk, implied rates stay sane, and PT/YT parity stays honest.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-[#A1A1AA]">
        {['PT / YT tokenization', 'Maturity fee decay', 'Parity oracle'].map(
          (label) => (
            <span
              key={label}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2"
            >
              {label}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 2 — The Problem                                             */
/* ---------------------------------------------------------------- */

const PROBLEMS = [
  {
    num: '01',
    accent: PINK,
    title: 'Yield is all-or-nothing.',
    desc: 'Holding wstETH means floating yield — there is no native way to lock a rate, or to sell just the yield and keep the principal.',
  },
  {
    num: '02',
    accent: YELLOW,
    title: 'AMMs are time-blind.',
    desc: 'A flat fee sits on a position whose volatility decays every single day as it approaches redemption. LPs are mispriced by default.',
  },
  {
    num: '03',
    accent: GREEN,
    title: 'Two pools, no referee.',
    desc: 'PT and YT trade in separate pools with one underlying truth — and nothing on-chain making sure they still reconcile.',
  },
]

function ProblemSlide() {
  return (
    <div>
      <Eyebrow dot={PINK}>The Problem</Eyebrow>
      <h2 className="font-bebas mt-6 text-5xl sm:text-6xl lg:text-7xl">
        Fixed income on-chain is <span className="text-yield-gradient">broken</span>
      </h2>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PROBLEMS.map((p, i) => (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
          >
            <SlideCard className="h-full p-8">
              <span
                className="font-clash text-4xl font-semibold tracking-tight"
                style={{ color: p.accent }}
              >
                {p.num}
              </span>
              <div
                className="mb-5 mt-5 h-px w-full"
                style={{
                  background: `linear-gradient(90deg, ${p.accent}40, transparent)`,
                }}
              />
              <h3 className="font-clash mb-3 text-lg font-semibold leading-snug text-[#F6F5F2]">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#A1A1AA]">{p.desc}</p>
            </SlideCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 3 — The Split (PT / YT)                                     */
/* ---------------------------------------------------------------- */

function SplitSlide() {
  return (
    <div>
      <Eyebrow>The Primitive</Eyebrow>
      <h2 className="font-bebas mt-6 text-5xl sm:text-6xl lg:text-7xl">
        One deposit. <span className="text-yield-gradient">Two tokens.</span>
      </h2>

      <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
        <SlideCard className="flex flex-col justify-center p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#A1A1AA]">
            You deposit
          </p>
          <p className="font-clash mt-3 text-4xl font-semibold text-[#F6F5F2]">
            wstETH
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
            Into <span className="text-[#F6F5F2]">YieldVault.sol</span> — your
            principal never gets sold.
          </p>
        </SlideCard>

        <div className="hidden items-center lg:flex">
          <ArrowRight className="h-8 w-8 text-[#A1A1AA]" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-5">
          <SlideCard accent={PINK} className="flex-1 p-6">
            <div className="flex items-center justify-between">
              <p className="font-clash text-xl font-semibold" style={{ color: PINK }}>
                PT
              </p>
              <span className="rounded-full border border-[#FF92B3]/25 bg-[#FF92B3]/10 px-2.5 py-1 text-[10px] font-semibold text-[#FFD6E0]">
                Fixed income
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
              <span className="text-[#F6F5F2]">Principal Token.</span> Redeems
              1:1 for the underlying at maturity — a locked, known rate.
            </p>
          </SlideCard>

          <SlideCard accent={GREEN} className="flex-1 p-6">
            <div className="flex items-center justify-between">
              <p className="font-clash text-xl font-semibold" style={{ color: GREEN }}>
                YT
              </p>
              <span className="rounded-full border border-[#A6D95B]/25 bg-[#A6D95B]/10 px-2.5 py-1 text-[10px] font-semibold text-[#D8F2C2]">
                Yield speculation
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
              <span className="text-[#F6F5F2]">Yield Token.</span> Captures all
              yield until maturity — pure exposure to the rate itself.
            </p>
          </SlideCard>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-[#A1A1AA]">
        Each trades in its own Uniswap v4 pool, and{' '}
        <span className="text-yield-gradient font-semibold">PT + YT ≈ underlying</span>{' '}
        — always.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 4 — The Hook                                                */
/* ---------------------------------------------------------------- */

const LAYERS = [
  {
    icon: Gauge,
    accent: PINK,
    title: 'Implied Rate Sentinel',
    desc: 'Derives implied APY from PT price and time-to-maturity, bounds it, and blocks economically irrational negative-yield trades on-chain.',
  },
  {
    icon: Timer,
    accent: YELLOW,
    title: 'Maturity Fee Decay',
    desc: 'Re-prices the swap fee by time to maturity on every trade. Volatility falls as redemption nears — so should the fee.',
  },
  {
    icon: Radar,
    accent: GREEN,
    title: 'Cross-Pool Parity Oracle',
    desc: 'Watches PT + YT combined value against the underlying and emits ParityDriftDetected the moment they diverge.',
  },
]

function HookSlide() {
  return (
    <div>
      <Eyebrow dot={YELLOW}>The Hook</Eyebrow>
      <h2 className="font-bebas mt-6 text-5xl sm:text-6xl lg:text-7xl">
        One hook. <span className="text-yield-gradient">Every swap.</span>
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
        <span className="text-[#F6F5F2]">MochiYieldHook.sol</span> sits on both
        the PT and YT pools and enforces three layers atomically.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {LAYERS.map((layer, i) => (
          <motion.div
            key={layer.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
          >
            <SlideCard className="h-full p-8">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background: `${layer.accent}1a`,
                  border: `1px solid ${layer.accent}33`,
                }}
              >
                <layer.icon
                  className="h-6 w-6"
                  style={{ color: layer.accent }}
                  strokeWidth={1.75}
                />
              </span>
              <h3 className="font-clash mb-3 mt-5 text-lg font-semibold text-[#F6F5F2]">
                {layer.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#A1A1AA]">
                {layer.desc}
              </p>
            </SlideCard>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-[#A1A1AA]">
        <Zap className="mr-1.5 inline h-3.5 w-3.5 text-[#EEB817]" strokeWidth={2} />
        Only Uniswap v4 can enforce cross-pool invariants{' '}
        <span className="text-[#F6F5F2]">atomically</span>.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 5 — Fee Decay                                               */
/* ---------------------------------------------------------------- */

const DECAY_BARS = Array.from({ length: 14 }, (_, i) => {
  const t = i / 13
  return 1 - t * 0.95 // 1.00% → 0.05%
})

function FeeDecaySlide() {
  return (
    <div>
      <Eyebrow dot={GREEN}>Maturity Fee Decay</Eyebrow>
      <h2 className="font-bebas mt-6 text-5xl sm:text-6xl lg:text-7xl">
        Fees that <span className="text-yield-gradient">understand time</span>
      </h2>

      <div className="mt-10 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <SlideCard className="p-8">
          <div className="flex h-48 items-end gap-2 sm:h-56">
            {DECAY_BARS.map((fee, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-lg"
                style={{
                  height: `${Math.max(fee * 100, 4)}%`,
                  background: `linear-gradient(to top, ${PINK}cc, ${GREEN}cc)`,
                  opacity: 0.35 + (fee / 1) * 0.65,
                  transformOrigin: 'bottom',
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: 0.25 + i * 0.045,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-[#A1A1AA]">
            <span>90+ days to maturity</span>
            <span>&lt; 7 days</span>
          </div>
        </SlideCard>

        <div className="flex flex-col gap-5">
          <SlideCard className="flex-1 p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#A1A1AA]">
              Far from maturity
            </p>
            <p className="font-clash mt-2 text-4xl font-semibold" style={{ color: PINK }}>
              1.00%
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
              High volatility, high LP risk — the fee compensates for it.
            </p>
          </SlideCard>
          <SlideCard className="flex-1 p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#A1A1AA]">
              Near maturity
            </p>
            <p className="font-clash mt-2 text-4xl font-semibold" style={{ color: GREEN }}>
              0.05%
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
              PT converges to par — risk collapses, and so does the fee.
            </p>
          </SlideCard>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-[#A1A1AA]">
        Smooth linear interpolation between the two — recomputed{' '}
        <span className="text-[#F6F5F2]">on every swap</span>, no keeper needed.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 6 — Reactive Network                                        */
/* ---------------------------------------------------------------- */

const PIPELINE = [
  {
    icon: Radar,
    accent: PINK,
    chain: 'Unichain Sepolia · 1301',
    name: 'MochiYieldHook',
    desc: 'Watches PT + YT vs underlying on every swap and emits ParityDriftDetected when they diverge.',
    code: 'event ParityDriftDetected(...)',
  },
  {
    icon: Satellite,
    accent: PURPLE,
    chain: 'Reactive Lasna · 5318007',
    name: 'MochiReactiveKeeper',
    desc: 'A Reactive Smart Contract subscribed to the drift topic. When drift ≥ threshold, react() fires a cross-chain callback — no bots, no cron jobs.',
    code: 'react() → Callback',
  },
  {
    icon: Zap,
    accent: GREEN,
    chain: 'Back on origin chain',
    name: 'ArbitrageRouter',
    desc: 'Receives restoreParity(...), re-verifies the drift on-chain, and emits ParityRestored to close the loop.',
    code: 'restoreParity(...) → ParityRestored',
  },
]

function ReactiveSlide() {
  return (
    <div>
      <Eyebrow dot={PURPLE}>Reactive Network</Eyebrow>
      <h2 className="font-bebas mt-6 text-5xl sm:text-6xl lg:text-7xl">
        Drift that <span className="text-yield-gradient">fixes itself</span>
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
        The hook doesn&apos;t just detect parity drift — a{' '}
        <span className="text-[#F6F5F2]">Reactive Smart Contract</span> on Lasna
        listens for it and triggers correction across chains, autonomously.
      </p>

      <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {PIPELINE.map((step, i) => (
          <Fragment key={step.name}>
            {i > 0 && (
              <div className="hidden items-center justify-center lg:flex">
                <ArrowRight className="h-6 w-6 text-[#52525B]" strokeWidth={1.5} />
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.18, duration: 0.5, ease: 'easeOut' }}
            >
              <SlideCard className="flex h-full flex-col p-7">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `${step.accent}1a`,
                      border: `1px solid ${step.accent}33`,
                    }}
                  >
                    <step.icon
                      className="h-5 w-5"
                      style={{ color: step.accent }}
                      strokeWidth={1.75}
                    />
                  </span>
                  <span className="text-right text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                    {step.chain}
                  </span>
                </div>
                <h3 className="font-clash mt-4 text-base font-semibold text-[#F6F5F2]">
                  {step.name}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-[#A1A1AA]">
                  {step.desc}
                </p>
                <p
                  className="mt-4 rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 font-mono text-[11px]"
                  style={{ color: step.accent }}
                >
                  {step.code}
                </p>
              </SlideCard>
            </motion.div>
          </Fragment>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-[#A1A1AA]">
        Parity moves from{' '}
        <span className="text-[#F6F5F2]">passive monitoring</span> to{' '}
        <span className="text-yield-gradient font-semibold">
          autonomous correction
        </span>{' '}
        — full PT/YT swap execution in the router is the next milestone.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 7 — Live & Verified                                         */
/* ---------------------------------------------------------------- */

const STATS = [
  { value: '1301', label: 'Unichain Sepolia · chain ID' },
  { value: '6', label: 'Contracts deployed & verified' },
  { value: '43/43', label: 'Foundry tests passing' },
  { value: '2 + 1', label: 'Pools sharing one hook' },
]

const CONTRACTS = [
  { name: 'MochiYieldHook', addr: '0x1f59…80c0' },
  { name: 'YieldVault', addr: '0xBd3c…AC01' },
  { name: 'PT Token', addr: '0xb2c2…B5D1' },
  { name: 'YT Token', addr: '0x2B21…E115' },
]

function LiveSlide() {
  return (
    <div>
      <Eyebrow>Proof, not promises</Eyebrow>
      <h2 className="font-bebas mt-6 text-5xl sm:text-6xl lg:text-7xl">
        Live on <span className="text-yield-gradient">Unichain Sepolia</span>
      </h2>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
          >
            <SlideCard className="h-full p-6">
              <p className="font-clash text-yield-gradient text-4xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                {stat.label}
              </p>
            </SlideCard>
          </motion.div>
        ))}
      </div>

      <SlideCard className="mt-5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-clash text-sm font-semibold text-[#F6F5F2]">
            Verified contracts
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A6D95B]/25 bg-[#A6D95B]/15 px-2.5 py-1 text-[10px] font-medium text-[#D8F2C2]">
            <Activity className="h-2.5 w-2.5 animate-pulse" strokeWidth={2.5} />
            On-chain
          </span>
        </div>
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {CONTRACTS.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between border-b border-white/[0.05] py-2 text-sm"
            >
              <span className="text-[#F6F5F2]">{c.name}</span>
              <span className="font-mono text-xs text-[#A1A1AA]">{c.addr}</span>
            </div>
          ))}
        </div>
      </SlideCard>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Slide 8 — Closing                                                 */
/* ---------------------------------------------------------------- */

const ROADMAP = [
  {
    accent: PINK,
    title: 'Full ArbitrageRouter execution',
    desc: 'The Reactive callback re-verifies drift today — executing the PT/YT v4 arb swaps is next.',
  },
  {
    accent: YELLOW,
    title: 'More maturities, more assets',
    desc: 'A full yield curve of PT/YT markets across yield-bearing assets beyond wstETH.',
  },
  {
    accent: GREEN,
    title: 'Mainnet on Unichain',
    desc: 'From verified testnet deployment to production fixed-income rails on Uniswap v4.',
  },
]

function ClosingSlide() {
  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow dot={PINK}>What&apos;s next</Eyebrow>

      <h2 className="font-bebas mt-6 text-6xl sm:text-7xl lg:text-8xl">
        Trade <span className="text-yield-gradient">time</span> itself
      </h2>

      <div className="mt-10 grid w-full gap-5 text-left md:grid-cols-3">
        {ROADMAP.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
          >
            <SlideCard className="h-full p-6">
              <Sparkles
                className="h-5 w-5"
                style={{ color: item.accent }}
                strokeWidth={1.75}
              />
              <h3 className="font-clash mb-2 mt-4 text-base font-semibold text-[#F6F5F2]">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-[#A1A1AA]">{item.desc}</p>
            </SlideCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/markets" className="btn-ld-primary">
          Launch App
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
        <Link href="/whitepaper" className="btn-ld-secondary">
          Read the docs
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {[
          {
            href: GITHUB_URL,
            label: 'github.com/karar189/mochitrade',
            icon: <GithubIcon className="h-4 w-4" />,
          },
          {
            href: SITE_URL,
            label: 'mochiyeild.xyz',
            icon: <Globe className="h-4 w-4" strokeWidth={1.75} />,
          },
          {
            href: EXPLORER_URL,
            label: 'Hook on Blockscout',
            icon: <ExternalLink className="h-4 w-4" strokeWidth={1.75} />,
          },
          {
            href: `${SITE_URL}/whitepaper`,
            label: 'Whitepaper',
            icon: <FileText className="h-4 w-4" strokeWidth={1.75} />,
          },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs font-medium text-[#A1A1AA] transition-colors hover:border-[#FF92B3]/35 hover:text-[#F6F5F2]"
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>

      <p className="font-clash mt-8 text-sm font-medium text-[#A1A1AA]">
        mochi<span className="text-yield-gradient">yeild</span> — trade future
        yield without selling your assets.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Deck shell                                                        */
/* ---------------------------------------------------------------- */

const SLIDES = [
  TitleSlide,
  ProblemSlide,
  SplitSlide,
  HookSlide,
  FeeDecaySlide,
  ReactiveSlide,
  LiveSlide,
  ClosingSlide,
]

const TOTAL = SLIDES.length

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 64, scale: 0.985 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -64, scale: 0.985 }),
}

export function SlidesDeck() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(TOTAL - 1, next))
      setIndex((prev) => {
        if (clamped === prev) return prev
        setDirection(clamped > prev ? 1 : -1)
        return clamped
      })
    },
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        setDirection(1)
        setIndex((i) => Math.min(TOTAL - 1, i + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setDirection(-1)
        setIndex((i) => Math.max(0, i - 1))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setDirection(-1)
        setIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setDirection(1)
        setIndex(TOTAL - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Lock body scroll behind the fullscreen deck overlay
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void containerRef.current?.requestFullscreen()
    }
  }, [])

  const Slide = SLIDES[index]

  return (
    <div
      ref={containerRef}
      className="landing-dark fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#050505] text-[#F6F5F2]"
    >
      {/* Ambient glows */}
      <div
        className="ld-glow-pink ld-glow -left-40 -top-40 h-[480px] w-[480px]"
        aria-hidden
      />
      <div
        className="ld-glow -bottom-48 -right-40 h-[520px] w-[520px]"
        aria-hidden
      />

      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-white/[0.05]">
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${PINK}, ${GREEN})` }}
          animate={{ width: `${((index + 1) / TOTAL) * 100}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 pb-2 pt-6 sm:px-10">
        <Link href="/" className="font-clash text-sm font-semibold tracking-tight">
          mochi<span className="text-yield-gradient">yeild</span>
          <span className="ml-2 text-xs font-medium text-[#A1A1AA]">/ slides</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="mr-2 font-mono text-xs tabular-nums text-[#A1A1AA]">
            {String(index + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-[#A1A1AA] transition-colors hover:border-[#FF92B3]/35 hover:text-[#F6F5F2]"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-[#A1A1AA] transition-colors hover:border-[#FF92B3]/35 hover:text-[#F6F5F2]"
            aria-label="Exit slides"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      {/* Slide area */}
      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6 py-4 sm:px-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-6xl"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer controls */}
      <footer className="relative z-10 flex shrink-0 items-center justify-between px-6 pb-6 pt-2 sm:px-10">
        <p className="hidden text-xs text-[#52525B] sm:block">
          Use <span className="text-[#A1A1AA]">←</span> /{' '}
          <span className="text-[#A1A1AA]">→</span> or space to navigate
        </p>

        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                background:
                  i === index
                    ? `linear-gradient(90deg, ${PINK}, ${GREEN})`
                    : 'rgba(255,255,255,0.14)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] text-[#F6F5F2] transition-all hover:border-[#FF92B3]/35 hover:bg-[#FF92B3]/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === TOTAL - 1}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FF92B3] text-[#1C1C1C] transition-all hover:bg-[#FFA8C3] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next slide"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </footer>
    </div>
  )
}
