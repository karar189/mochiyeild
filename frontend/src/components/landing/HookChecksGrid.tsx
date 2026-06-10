import { MotionSection } from '@/components/motion'

const checks = [
  {
    check: 'Maturity fee',
    fn: 'calculateFeeForMaturity()',
    enforces: '~1% far out → ~0.05% near expiry',
    accent: '#A6D95B',
  },
  {
    check: 'Implied-rate guard',
    fn: 'beforeSwap()',
    enforces: 'rejects economically irrational PT prices',
    accent: '#FF92B3',
  },
  {
    check: 'Parity monitor',
    fn: 'afterSwap()',
    enforces: 'emits ParityDriftDetected across PT/YT',
    accent: '#EEB817',
  },
  {
    check: 'Reactive trigger',
    fn: 'keeper react()',
    enforces: 'cross-chain callback to realign',
    accent: '#A78BFA',
  },
]

export function HookChecksGrid() {
  return (
    <MotionSection className="section-padding py-24 lg:py-32 relative overflow-hidden">
      <div
        className="ld-glow ld-glow-pink w-[600px] h-[600px] absolute -top-48 right-0 blur-3xl"
        aria-hidden
      />
      <div className="content-max relative z-10">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#A6D95B] mb-4">
            THE HOOK DOES FOUR THINGS
          </p>
          <h2 className="font-clash text-4xl md:text-5xl font-semibold text-[#F6F5F2]">
            Four checks, one swap.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {checks.map((item) => (
            <div
              key={item.check}
              className="rounded-[28px] bg-[#101010] border border-white/[0.06] p-8 hover:border-[#FF92B3]/35 transition-colors"
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: item.accent }}
                />
                <h3 className="font-clash text-lg font-semibold text-[#F6F5F2]">
                  {item.check}
                </h3>
              </div>
              <code
                className="inline-block rounded-lg border border-white/[0.08] bg-black/40 px-3 py-1.5 text-[13px] font-mono"
                style={{ color: item.accent }}
              >
                {item.fn}
              </code>
              <p className="mt-5 text-[#A1A1AA] text-sm leading-relaxed">
                {item.enforces}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}
