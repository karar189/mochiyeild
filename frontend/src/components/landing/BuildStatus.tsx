import { Check, CircleDashed } from 'lucide-react'
import { MotionSection } from '@/components/motion'

const live = [
  'MochiYieldHook (beforeSwap / afterSwap)',
  'YieldVault PT/YT mint + redeem',
  'Markets UI + analytics feed',
  'Live on-chain hook events',
]

const next = [
  'Full ArbitrageRouter parity arbitrage',
  'Mainnet Reactive keeper loop',
]

export function BuildStatus() {
  return (
    <MotionSection className="section-padding py-24 lg:py-32">
      <div className="content-max">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#A6D95B] mb-4">
            BUILD STATUS
          </p>
          <h2 className="font-clash text-4xl md:text-5xl font-semibold text-[#F6F5F2]">
            What ships today, what ships next.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-[32px] bg-[#101010] border border-white/[0.06] p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-7">
              <span className="h-2 w-2 rounded-full bg-[#A6D95B]" />
              <h3 className="font-clash text-lg font-semibold text-[#D8F2C2]">
                Live
              </h3>
            </div>
            <ul className="space-y-4">
              {live.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    className="w-4 h-4 mt-0.5 shrink-0 text-[#A6D95B]"
                    strokeWidth={2.5}
                  />
                  <span className="text-[#F6F5F2] text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[32px] bg-[#0C0C0C] border border-white/[0.06] p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-7">
              <span className="h-2 w-2 rounded-full bg-[#F5D76E]" />
              <h3 className="font-clash text-lg font-semibold text-[#F5D76E]">
                Next
              </h3>
            </div>
            <ul className="space-y-4">
              {next.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CircleDashed
                    className="w-4 h-4 mt-0.5 shrink-0 text-[#A1A1AA]"
                    strokeWidth={2}
                  />
                  <span className="text-[#A1A1AA] text-sm leading-relaxed">
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
