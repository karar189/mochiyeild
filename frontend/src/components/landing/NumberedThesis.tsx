import { MotionSection } from '@/components/motion'

const points = [
  {
    num: '01',
    title: 'Yield liquidity is mispriced by default.',
    desc: 'Flat fees sit on a position whose risk changes every single day as it approaches redemption.',
    accent: '#FF92B3',
  },
  {
    num: '02',
    title: 'PT and YT can silently drift apart.',
    desc: 'Two pools, one underlying truth, and no referee making sure they still reconcile.',
    accent: '#EEB817',
  },
  {
    num: '03',
    title: 'Mochitrade makes the hook the referee.',
    desc: 'Every swap: re-price the fee by maturity, bound the implied rate, check parity, and emit an event Reactive can act on.',
    accent: '#A6D95B',
  },
]

export function NumberedThesis() {
  return (
    <MotionSection className="section-padding py-24 lg:py-32">
      <div className="content-max">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {points.map((point) => (
            <div
              key={point.num}
              className="rounded-[32px] bg-[#101010] border border-white/[0.06] p-10 hover:border-[#FF92B3]/35 transition-colors"
            >
              <span
                className="font-clash text-5xl font-semibold tracking-tight"
                style={{ color: point.accent }}
              >
                {point.num}
              </span>
              <div
                className="mt-6 mb-6 h-px w-full"
                style={{
                  background: `linear-gradient(90deg, ${point.accent}40, transparent)`,
                }}
              />
              <h3 className="font-clash text-xl font-semibold text-[#F6F5F2] mb-3 leading-snug">
                {point.title}
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}
