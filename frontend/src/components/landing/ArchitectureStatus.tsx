import { MotionSection } from '@/components/motion'

type Status = 'live' | 'partial' | 'testnet'

const STATUS_STYLES: Record<
  Status,
  { label: string; color: string; bg: string; border: string }
> = {
  live: {
    label: 'live',
    color: '#D8F2C2',
    bg: 'rgba(166,217,91,0.12)',
    border: 'rgba(166,217,91,0.3)',
  },
  partial: {
    label: 'partial',
    color: '#F5D76E',
    bg: 'rgba(238,184,23,0.12)',
    border: 'rgba(238,184,23,0.3)',
  },
  testnet: {
    label: 'testnet',
    color: '#FFB4C8',
    bg: 'rgba(255,146,179,0.12)',
    border: 'rgba(255,146,179,0.3)',
  },
}

const layers: {
  name: string
  detail: string
  status: Status
  note?: string
}[] = [
  {
    name: 'Hook',
    detail: 'beforeSwap / afterSwap',
    status: 'live',
  },
  {
    name: 'YieldVault',
    detail: 'PT / YT mint + redeem',
    status: 'live',
  },
  {
    name: 'Markets UI + live hook events',
    detail: 'on-chain event feed',
    status: 'live',
  },
  {
    name: 'ArbitrageRouter.restoreParity',
    detail: 'records drift; full arb next',
    status: 'partial',
  },
  {
    name: 'Reactive Keeper E2E',
    detail: 'Lasna; not on local Anvil',
    status: 'testnet',
  },
]

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  )
}

export function ArchitectureStatus() {
  return (
    <MotionSection
      id="architecture"
      className="section-padding py-24 lg:py-32 scroll-mt-24"
    >
      <div className="content-max max-w-4xl">
        <div className="mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#A6D95B] mb-4">
            ARCHITECTURE
          </p>
          <h2 className="font-clash text-4xl md:text-5xl font-semibold text-[#F6F5F2]">
            What&apos;s live, and what&apos;s honest about being next.
          </h2>
          <p className="mt-5 text-[#A1A1AA] text-base leading-relaxed max-w-2xl">
            The hook and vault run on Uniswap v4 today. The cross-chain loop is
            wired and tested on testnet — here&apos;s exactly where each layer
            stands.
          </p>
        </div>

        <div className="rounded-[32px] bg-[#0C0C0C] border border-white/[0.06] overflow-hidden">
          {layers.map((layer, i) => (
            <div
              key={layer.name}
              className={`flex items-center justify-between gap-4 px-6 sm:px-8 py-5 ${
                i > 0 ? 'border-t border-white/[0.06]' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="font-mono text-sm sm:text-[15px] text-[#F6F5F2] truncate">
                  {layer.name}
                </p>
                <p className="text-xs text-[#A1A1AA] mt-1">{layer.detail}</p>
              </div>
              <StatusBadge status={layer.status} />
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}
