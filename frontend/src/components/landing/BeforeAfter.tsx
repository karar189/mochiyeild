import { Check, X } from 'lucide-react'
import { MotionSection } from '@/components/motion'

const before = [
  'Flat fee, regardless of risk',
  'No implied-rate sanity check',
  'Parity left unmonitored',
  'LP eats impermanent loss blind',
]

const after = [
  'Maturity-scaled fee',
  'Bounded, sane implied rate',
  'PT/YT parity watched every swap',
  'Drift triggers a Reactive callback',
]

export function BeforeAfter() {
  return (
    <MotionSection className="section-padding py-24 lg:py-32">
      <div className="content-max">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#FF92B3] mb-4">
            BEFORE / AFTER
          </p>
          <h2 className="font-clash text-4xl md:text-5xl font-semibold text-[#F6F5F2]">
            What the hook changes for LPs.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-[32px] bg-[#0C0C0C] border border-white/[0.06] p-8 lg:p-10">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#A1A1AA]">
              Before — flat-fee AMM
            </span>
            <ul className="mt-7 space-y-4">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF9B9B]/12 border border-[#FF9B9B]/25">
                    <X className="w-3 h-3 text-[#FF9B9B]" strokeWidth={2.5} />
                  </span>
                  <span className="text-[#A1A1AA] text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[32px] bg-[#101010] border border-[#A6D95B]/20 p-8 lg:p-10 relative overflow-hidden">
            <div
              className="ld-glow w-[300px] h-[300px] absolute -top-24 -right-16 blur-3xl"
              aria-hidden
            />
            <span className="relative text-xs font-semibold tracking-[0.2em] uppercase text-[#D8F2C2]">
              After — MochiYieldHook
            </span>
            <ul className="relative mt-7 space-y-4">
              {after.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#A6D95B]/15 border border-[#A6D95B]/30">
                    <Check className="w-3 h-3 text-[#A6D95B]" strokeWidth={2.5} />
                  </span>
                  <span className="text-[#F6F5F2] text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
