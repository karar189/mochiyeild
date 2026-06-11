import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  Shield,
  TrendingUp,
} from 'lucide-react'
import { MotionSection } from '@/components/motion'

const chapters = [
  {
    num: '01',
    title: 'Protocol Overview',
    desc: 'Yield-bearing assets split into Principal Tokens (PT) and Yield Tokens (YT), enabling independent trading of future yield on Uniswap v4.',
    icon: Layers,
  },
  {
    num: '02',
    title: 'Implied Rate Sentinel',
    desc: 'On-chain implied APY calculation from PT prices with bounds enforcement — preventing negative yields and economically irrational market states.',
    icon: TrendingUp,
  },
  {
    num: '03',
    title: 'Maturity Fee Decay',
    desc: 'Dynamic swap fees that decay as maturity approaches, reflecting lower volatility and reduced LP risk near redemption.',
    icon: FileText,
  },
  {
    num: '04',
    title: 'Cross-Pool Parity',
    desc: 'Atomic monitoring of PT + YT combined value vs underlying, enabling arbitrage alerts and Reactive Network integration.',
    icon: Shield,
  },
]

export function WhitepaperSection() {
  return (
    <MotionSection id="whitepaper" className="section-padding py-20 lg:py-28 bg-surface/50">
      <div className="content-max">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mochi-pink/40 rounded-full text-sm font-medium text-primary mb-6">
              <BookOpen className="w-4 h-4" strokeWidth={1.75} />
              Technical Whitepaper
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Time-Aware Fixed Income Markets
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
              The first Uniswap v4 hook that understands yield curves — enforcing implied
              rate bounds, time-to-maturity fee decay, and cross-pool PT/YT parity in a
              single atomic hook.
            </p>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              mochiyeild introduces a third path for yield-bearing assets: trade the yield
              itself while keeping your principal intact. Our whitepaper details the
              tokenization model, hook architecture, and on-chain invariants that make
              this possible.
            </p>
          </div>

          <div className="glass-card p-8 lg:p-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-muted tracking-widest uppercase mb-1">
                  mochiyeild
                </p>
                <h3 className="text-xl font-bold text-primary">
                  Yield Curve-Aware AMM Hooks
                </h3>
              </div>
              <div className="w-12 h-12 bg-yield-green/60 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" strokeWidth={1.75} />
              </div>
            </div>

            <dl className="space-y-3 mb-8 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Version</dt>
                <dd className="font-medium text-primary">1.0 Draft</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Network</dt>
                <dd className="font-medium text-primary">Uniswap v4</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Contracts</dt>
                <dd className="font-medium text-primary">43 tests passing</dd>
              </div>
            </dl>

            <Link href="/whitepaper" className="btn-primary w-full sm:w-auto">
              Read Whitepaper
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chapters.map((chapter) => {
            const Icon = chapter.icon
            return (
              <div key={chapter.num} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-mochi-pink/40 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-semibold text-muted tracking-widest">
                    CH. {chapter.num}
                  </span>
                </div>
                <h3 className="font-semibold text-primary mb-2">{chapter.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{chapter.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </MotionSection>
  )
}
