import Link from 'next/link'
import { HeroSection } from '@/components/landing/HeroSection'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { WhitepaperSection } from '@/components/landing/WhitepaperSection'
import { MotionSection } from '@/components/motion'
import {
  ArrowRight,
  Shield,
  Sparkles,
  Sprout,
  TrendingUp,
  Clock,
  Scale,
  ChevronDown,
  Droplets,
  Zap,
} from 'lucide-react'

const faqs = [
  {
    q: 'What is MochiTrade?',
    a: 'MochiTrade is a yield trading protocol that splits yield-bearing assets into Principal Tokens (PT) and Yield Tokens (YT), making future yield independently tradable on Uniswap v4.',
  },
  {
    q: 'How do PT and YT differ?',
    a: 'PT represents your principal with fixed-return exposure and capital protection. YT represents future yield, letting you trade or speculate on yield movements.',
  },
  {
    q: 'What are Uniswap v4 Hooks?',
    a: 'Hooks are smart contract modules that extend Uniswap v4 pools with custom logic — like adaptive fees, implied rate monitoring, and cross-pool parity checks.',
  },
  {
    q: 'Is my principal protected?',
    a: 'PT tokens are designed for principal protection with stable, predictable exposure. YT carries higher yield upside and corresponding risk.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
        <HeroSection />
        <DashboardPreview />

        {/* Problem Section */}
        <MotionSection className="section-padding py-20 lg:py-28 bg-surface/50">
        <div className="content-max">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Yield Is Locked. Markets Aren&apos;t.
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed">
              Traditional yield-bearing assets force a binary choice: hold for yield or
              sell to exit. MochiTrade introduces a third path — trade the yield itself
              while keeping your principal intact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Illiquid Positions',
                desc: 'Selling means giving up future yield entirely. There was no way to express a yield-only view.',
              },
              {
                title: 'Opaque Returns',
                desc: 'Yield rates are buried in complex vault mechanics. Hard to price, harder to trade.',
              },
              {
                title: 'One-Size-Fits-All',
                desc: 'Every investor gets the same exposure. No way to choose fixed income vs yield speculation.',
              },
            ].map((item) => (
              <div key={item.title} className="card">
                <h3 className="font-semibold text-primary text-lg mb-3">{item.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        </MotionSection>

        {/* How It Works */}
        <MotionSection id="how-it-works" className="section-padding py-20 lg:py-28">
        <div className="content-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-[#6B7280] max-w-xl mx-auto">
              Three simple steps to unlock independently tradable yield markets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Deposit Assets',
                desc: 'Deposit yield-bearing assets like wstETH into a MochiTrade vault.',
                icon: Droplets,
              },
              {
                step: '02',
                title: 'Assets Generate Yield',
                desc: 'Your assets continue earning yield while held in the protocol.',
                icon: Sprout,
              },
              {
                step: '03',
                title: 'Split into PT & YT',
                desc: 'MochiTrade separates principal and future yield into tradable tokens.',
                icon: Scale,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="card text-center">
                  <div className="w-14 h-14 bg-yield-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-7 h-7 text-primary" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-semibold text-muted tracking-widest">
                    STEP {item.step}
                  </span>
                  <h3 className="font-semibold text-primary text-lg mt-2 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
        </MotionSection>

        {/* PT/YT Explainer */}
        <MotionSection id="pt-yt" className="section-padding py-20 lg:py-28 bg-surface/50">
        <div className="content-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Choose Your Exposure
            </h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Split yield-bearing assets into two components. Each serves a different
              risk profile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card border-cream bg-cream/30">
              <div className="w-14 h-14 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                Principal Token (PT)
              </h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">
                Protect principal with fixed-return exposure. Redeemable for underlying
                at maturity.
              </p>
              <ul className="space-y-3">
                {['Protect Principal', 'Fixed Returns', 'Stable Exposure'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#6B7280] text-sm">
                    <div className="w-1.5 h-1.5 bg-sage rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card border-yield-green/50 bg-yield-green/20">
              <div className="w-14 h-14 bg-surface border border-yield-green rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-success" strokeWidth={1.75} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                Yield Token (YT)
              </h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">
                Trade future yield. Capture upside from yield movements without touching
                your principal.
              </p>
              <ul className="space-y-3">
                {['Trade Future Yield', 'Leverage Yield Views', 'Capture Upside'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-[#6B7280] text-sm">
                      <div className="w-1.5 h-1.5 bg-success rounded-full" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
        </MotionSection>

        {/* Uniswap v4 Hooks */}
        <MotionSection className="section-padding py-20 lg:py-28">
        <div className="content-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Uniswap v4 Hooks
            </h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Three layers of intelligent market management bring yield curve awareness
              to Uniswap v4.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Implied Rate Sentinel',
                desc: 'Calculates and monitors implied APY from PT prices. Prevents negative yields and extreme rates.',
              },
              {
                icon: Clock,
                title: 'Maturity Fee Decay',
                desc: 'Fees decrease as maturity approaches. Less volatility means lower LP risk and lower fees.',
              },
              {
                icon: Scale,
                title: 'Cross-Pool Parity',
                desc: 'Monitors PT + YT combined value vs underlying. Alerts for arbitrage opportunities.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="card">
                  <div className="w-12 h-12 bg-mochi-pink/50 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/analytics" className="btn-secondary">
              <Zap className="w-4 h-4" strokeWidth={1.75} />
              View Hook Activity
            </Link>
          </div>
        </div>
        </MotionSection>

        <WhitepaperSection />

        {/* FAQ */}
        <MotionSection id="faq" className="section-padding py-20 lg:py-28 bg-surface/50">
        <div className="content-max max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6B7280]">Grow Smarter with clear answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="card group cursor-pointer">
                <summary className="flex items-center justify-between font-medium text-primary list-none">
                  {faq.q}
                  <ChevronDown
                    className="w-5 h-5 text-muted group-open:rotate-180 transition-transform"
                    strokeWidth={1.75}
                  />
                </summary>
                <p className="mt-4 text-[#6B7280] text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
        </MotionSection>

        {/* CTA */}
        <MotionSection className="section-padding py-20 lg:py-28">
        <div className="content-max">
          <div className="glass-card text-center py-16 px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Ready to Trade Future Yield?
            </h2>
            <p className="text-[#6B7280] mb-8 max-w-lg mx-auto">
              Deposit wstETH and receive PT + YT tokens. Choose your risk profile and grow
              smarter.
            </p>
            <Link href="/deposit" className="btn-hero-primary">
              Start Trading
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
        </MotionSection>
    </div>
  )
}
