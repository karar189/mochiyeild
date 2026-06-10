type NodeStatus = 'live' | 'partial' | 'testnet'

const STATUS: Record<NodeStatus, { label: string; color: string; bg: string }> = {
  live: { label: 'live', color: '#A6D95B', bg: 'rgba(166,217,91,0.15)' },
  partial: { label: 'partial', color: '#F5D76E', bg: 'rgba(245,215,110,0.15)' },
  testnet: { label: 'testnet', color: '#FF92B3', bg: 'rgba(255,146,179,0.15)' },
}

function StatusPill({ status }: { status: NodeStatus }) {
  const s = STATUS[status]
  return (
    <span
      className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  )
}

export function ReactivePipelineDiagram() {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-center">
        <div className="rounded-xl border border-white/[0.08] bg-[#151515] p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] text-[#71717A] uppercase">Origin chain</span>
            <StatusPill status="live" />
          </div>
          <p className="font-mono text-xs text-[#F6F5F2]">MochiYieldHook</p>
          <p className="text-[10px] text-[#FF92B3] mt-1">ParityDriftDetected</p>
        </div>

        <div className="hidden sm:flex flex-col items-center text-[#71717A]">
          <span className="text-[10px]">event</span>
          <span className="text-lg">→</span>
        </div>

        <div className="rounded-xl border border-[#A78BFA]/25 bg-[#151515] p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] text-[#71717A] uppercase">Reactive Lasna</span>
            <StatusPill status="testnet" />
          </div>
          <p className="font-mono text-xs text-[#F6F5F2]">MochiReactiveKeeper</p>
          <p className="text-[10px] text-[#A78BFA] mt-1">react() · Callback</p>
        </div>

        <div className="hidden sm:flex flex-col items-center text-[#71717A]">
          <span className="text-[10px]">callback</span>
          <span className="text-lg">→</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#151515] p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] text-[#71717A] uppercase">Origin chain</span>
            <StatusPill status="partial" />
          </div>
          <p className="font-mono text-xs text-[#F6F5F2]">ArbitrageRouter</p>
          <p className="text-[10px] text-[#A6D95B] mt-1">restoreParity() · ParityRestored</p>
        </div>
      </div>

      <p className="text-[10px] text-[#71717A] border-t border-white/[0.06] pt-3">
        Full PT/YT swap execution on callback is next — MVP records drift and emits events.
      </p>
    </div>
  )
}
