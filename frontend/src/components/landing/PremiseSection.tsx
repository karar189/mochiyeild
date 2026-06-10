import { MotionSection } from '@/components/motion'

export function PremiseSection() {
  return (
    <MotionSection
      id="premise"
      className="section-padding py-24 lg:py-32 scroll-mt-24"
    >
      <div className="content-max max-w-4xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-[#FF92B3] mb-8">
          THE PREMISE
        </p>
        <p className="font-clash text-2xl sm:text-3xl md:text-[2.6rem] leading-[1.25] text-[#F6F5F2] font-medium">
          In yield markets, risk isn&apos;t constant — it{' '}
          <span className="text-yield-gradient">decays toward maturity</span>.
          Flat-fee AMMs ignore that. So LPs get overpaid early, underpaid late,
          and nobody watches whether PT and YT still add up.
        </p>
      </div>
    </MotionSection>
  )
}
