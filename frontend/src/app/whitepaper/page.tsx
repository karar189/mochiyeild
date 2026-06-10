import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

const sections = [
  {
    id: 'abstract',
    title: 'Abstract',
    paragraphs: [
      'MochiTrade is a yield trading protocol built on Uniswap v4 that splits yield-bearing assets into Principal Tokens (PT) and Yield Tokens (YT). This separation enables investors to independently trade future yield while preserving principal exposure — a capability impossible with traditional vault mechanics.',
      "The protocol's core innovation is MochiYieldHook, a single Uniswap v4 hook that enforces three layers of fixed-income market logic atomically: implied rate bounds, maturity-aware fee decay, and cross-pool PT/YT parity monitoring.",
    ],
  },
  {
    id: 'tokenization',
    title: '1. Tokenization Model',
    paragraphs: [
      'Users deposit yield-bearing assets (e.g., wstETH) into a YieldVault. The vault mints two ERC-20 tokens:',
    ],
    list: [
      'Principal Token (PT) — Represents the underlying principal, redeemable at maturity. PT holders receive fixed-return exposure with capital protection.',
      'Yield Token (YT) — Represents all future yield accrual until maturity. YT holders can trade yield exposure independently, capturing upside from yield rate movements.',
    ],
    footer:
      'At maturity, 1 PT redeems for 1 unit of underlying. YT ceases to accrue yield and converges to zero.',
  },
  {
    id: 'implied-rate',
    title: '2. Implied Rate Sentinel',
    paragraphs: [
      'The hook calculates implied APY from PT market prices and time-to-maturity using standard fixed-income discounting:',
    ],
    code: 'impliedAPY = (faceValue / ptPrice)^(365 / daysToMaturity) - 1',
    footer:
      'When implied rates go negative or exceed configured bounds, the hook emits alerts and can reject swaps that would create economically irrational market states.',
  },
  {
    id: 'fee-decay',
    title: '3. Maturity Fee Decay',
    paragraphs: [
      "Unlike generic dynamic fee hooks that respond to volume, MochiTrade's fees decay with time-to-maturity because volatility decreases as PT approaches redemption:",
    ],
    list: [
      'Far from maturity (>90 days): 1.00% swap fee',
      'Near maturity (<7 days): 0.05% swap fee',
      'Between: Smooth linear interpolation',
    ],
    footer: 'This aligns LP compensation with actual risk exposure over the yield curve.',
  },
  {
    id: 'parity',
    title: '4. Cross-Pool Parity Oracle',
    paragraphs: [
      'PT and YT trade in separate Uniswap v4 pools but must maintain parity with the underlying asset. The hook monitors:',
    ],
    code: 'PT price + YT price ≈ underlying price',
    footer:
      'When drift exceeds a configurable threshold, the hook emits ParityDriftDetected events, enabling Reactive Network integration for automated arbitrage.',
  },
  {
    id: 'architecture',
    title: '5. Contract Architecture',
    table: [
      ['MochiYieldHook.sol', 'v4 hook with rate sentinel, fee decay, parity oracle'],
      ['YieldVault.sol', 'Deposit underlying → mint PT + YT'],
      ['PTToken.sol', 'Principal Token (fixed income)'],
      ['YTToken.sol', 'Yield Token (yield speculation)'],
    ],
    footer:
      'All hook logic executes atomically within swap callbacks — no external oracle calls required for fee adjustment or parity checks.',
  },
  {
    id: 'events',
    title: '6. On-Chain Events',
    paragraphs: [
      'The hook emits structured events for frontend and Reactive Network integration:',
    ],
    list: [
      'ImpliedRateUpdated — APY recalculation on each relevant swap',
      'FeeAdjustedForMaturity — Fee tier change based on time-to-maturity',
      'ParityDriftDetected — PT + YT vs underlying divergence',
      'SwapRejectedNegativeYield — Blocked swap with negative implied APY',
      'MarketStressDetected — Protocol-level stress indicator',
    ],
  },
]

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <div className="content-max section-padding">
        <Link
          href="/#whitepaper"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to Home
        </Link>

        <header className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mochi-pink/40 rounded-full text-sm font-medium text-primary mb-6">
            <BookOpen className="w-4 h-4" strokeWidth={1.75} />
            Whitepaper v1.0 Draft
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            MochiTrade: Time-Aware Fixed Income Markets on Uniswap v4
          </h1>
          <p className="text-[#6B7280] text-lg leading-relaxed">
            A technical specification for yield curve-aware AMM hooks, PT/YT
            tokenization, and on-chain fixed-income market invariants.
          </p>
        </header>

        <nav className="glass-card p-6 mb-12 max-w-3xl">
          <h2 className="font-semibold text-primary text-sm mb-4">Table of Contents</h2>
          <ol className="space-y-2 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[#6B7280] hover:text-primary transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-2xl font-bold text-primary mb-4">
                {section.title}
              </h2>

              {section.paragraphs?.map((p) => (
                <p key={p} className="text-[#6B7280] text-sm leading-relaxed mb-4">
                  {p}
                </p>
              ))}

              {section.code && (
                <pre className="px-4 py-3 bg-surface border border-border rounded-lg text-xs font-mono text-primary mb-4 overflow-x-auto">
                  {section.code}
                </pre>
              )}

              {section.list && (
                <ul className="space-y-2 mb-4">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[#6B7280] text-sm leading-relaxed"
                    >
                      <div className="w-1.5 h-1.5 bg-sage rounded-full mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-surface/80">
                        <th className="text-left px-4 py-3 font-semibold text-primary border-b border-border">
                          Contract
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-primary border-b border-border">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.map(([contract, role]) => (
                        <tr key={contract} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-mono text-xs text-primary">
                            {contract}
                          </td>
                          <td className="px-4 py-3 text-[#6B7280]">{role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.footer && (
                <p className="text-[#6B7280] text-sm leading-relaxed">{section.footer}</p>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
