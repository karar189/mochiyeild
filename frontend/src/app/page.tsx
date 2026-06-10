import Link from 'next/link'
import { HeroSection } from '@/components/landing/HeroSection'
import { PremiseSection } from '@/components/landing/PremiseSection'
import { NumberedThesis } from '@/components/landing/NumberedThesis'
import { ConvergenceChart } from '@/components/landing/ConvergenceChart'
import { HookChecksGrid } from '@/components/landing/HookChecksGrid'
import { FeeDecayChart } from '@/components/landing/FeeDecayChart'
import { BeforeAfter } from '@/components/landing/BeforeAfter'
import { ArchitectureStatus } from '@/components/landing/ArchitectureStatus'
import { ProofStrip } from '@/components/landing/ProofStrip'
import { BuildStatus } from '@/components/landing/BuildStatus'
import { MotionSection } from '@/components/motion'
import { bebasNeue } from '@/lib/fonts'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F6F5F2] font-[family-name:var(--font-inter)]">
      <HeroSection bebasClassName={bebasNeue.className} />

      <PremiseSection />
      <NumberedThesis />
      <ConvergenceChart />
      <HookChecksGrid />
      <FeeDecayChart />
      <BeforeAfter />
      <ArchitectureStatus />
      <ProofStrip />
      <BuildStatus />

      {/* Final CTA */}
      <MotionSection className="section-padding py-24 lg:py-36 relative overflow-hidden">
        <div
          className="ld-glow w-[800px] h-[800px] absolute -bottom-96 left-1/2 -translate-x-1/2 blur-3xl"
          aria-hidden
        />
        <div className="content-max relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 text-center lg:text-left">
            <div className="max-w-xl">
              <h2 className={`${bebasNeue.className} text-6xl sm:text-7xl md:text-8xl leading-[0.9] text-[#F6F5F2]`}>
                READY TO TRADE{' '}
                <span className="text-[#D8F2C2]">YIELD?</span>
              </h2>
              <p className="mt-6 text-[#A1A1AA] text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                Deposit wstETH, receive PT + YT, and choose your own risk
                profile.
              </p>
              <div className="mt-10 flex justify-center lg:justify-start">
                <Link
                  href="/markets"
                  className="inline-flex items-center justify-center gap-2 h-14 px-9 bg-[#FF92B3] hover:bg-[#FFA8C3] text-[#1C1C1C] font-semibold text-[15px] rounded-full hover:scale-[1.02] transition-all"
                >
                  Launch App
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </Link>
              </div>
            </div>

            <div className="relative shrink-0">
              <div
                className="ld-glow w-[280px] h-[280px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl"
                aria-hidden
              />
              <video
                src="/mochi.webm"
                autoPlay
                loop
                muted
                playsInline
                className="relative z-[1] block h-[220px] sm:h-[260px] w-auto animate-float"
              />
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  )
}
