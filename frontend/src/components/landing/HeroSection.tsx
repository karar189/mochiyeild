import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { MotionSection } from '@/components/motion'
import { HeroMarketCards } from './HeroMarketCards'

export function HeroSection() {
  return (
    <MotionSection className="relative overflow-hidden section-padding pt-24 pb-20 lg:pt-28 lg:pb-28">
      <div className="absolute inset-0 bg-cream pointer-events-none" />
      <div className="hero-glow hero-glow-pink pointer-events-none" />
      <div className="hero-glow hero-glow-cream pointer-events-none" />
      <div className="hero-glow hero-glow-green pointer-events-none" />
      <div className="hero-glow hero-glow-peach pointer-events-none" />

      <div className="content-max relative z-10 lg:min-h-[520px] xl:min-h-[560px] 2xl:min-h-[600px]">
        <div className="hero-cards-pink-glow hidden lg:block" aria-hidden />

        {/* Mascot — feet flush with container bottom */}
        <div
          className="hidden lg:block absolute bottom-0 left-[52%] xl:left-[54%] 2xl:left-[55%] -translate-x-1/2 z-0 pointer-events-none"
          aria-hidden
        >
          <div className="relative animate-float leading-none">
            <div className="relative inline-block">
              <div className="hero-avatar-blob hero-avatar-blob-green" aria-hidden />
              <div className="hero-avatar-blob hero-avatar-blob-pink" aria-hidden />
              <video
                src="/mochi.webm"
                autoPlay
                loop
                muted
                playsInline
                className="relative z-[1] block h-[380px] xl:h-[440px] 2xl:h-[480px] w-auto max-w-none translate-y-8 xl:translate-y-12 2xl:translate-y-14 drop-shadow-[0_32px_64px_rgba(255,146,179,0.35)]"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-8 items-stretch relative z-10 h-full min-h-[520px] xl:min-h-[560px] 2xl:min-h-[600px]">
          {/* Left — marketing; buttons pinned to mascot base on lg */}
          <div className="max-w-xl xl:max-w-2xl flex flex-col h-full">
            <div className="leading-[0.95] text-[#111827] mb-6 font-sans" role="heading" aria-level={1}>
              <span className="block font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] 2xl:text-[72px]">
                Trade
              </span>
              <span className="block font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] 2xl:text-[72px]">
                <span className="hero-yield-gradient">Future Yield</span>
              </span>
              <span className="block font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] 2xl:text-[72px]">
                Without Selling
              </span>
              <span className="block font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] 2xl:text-[72px]">
                Your Assets
              </span>
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] leading-relaxed mb-8 lg:mb-0 max-w-lg font-sans">
              Split principal and yield, trade them independently, and access adaptive
              yield markets powered by{' '}
              <span className="text-[#FF92B3] font-medium">Uniswap v4 Hooks</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mt-auto lg:pt-10">
              <Link href="/deposit" className="btn-hero-primary">
                Start Trading
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </Link>
              <Link href="/markets" className="btn-hero-secondary">
                Explore Markets
                <ChevronRight className="w-5 h-5" strokeWidth={2} />
              </Link>
            </div>
          </div>

          {/* Right — market cards stretch to mascot base */}
          <div className="w-full lg:justify-self-end flex flex-col h-full min-h-0">
            <HeroMarketCards />
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
