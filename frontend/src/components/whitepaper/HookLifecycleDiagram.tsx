export function HookLifecycleDiagram() {
  const steps = [
    { phase: 'beforeSwap()', detail: 'Rate bounds + fee override', color: '#FF92B3' },
    { phase: 'swap', detail: 'v4 core executes', color: '#71717A' },
    { phase: 'afterSwap()', detail: 'APY update + parity check', color: '#A6D95B' },
  ]

  return (
    <div className="space-y-0 py-2">
      {steps.map((step, i) => (
        <div key={step.phase} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full shrink-0 mt-1"
              style={{ background: step.color }}
            />
            {i < steps.length - 1 && (
              <div className="w-px flex-1 min-h-[36px] bg-white/[0.08] my-1" />
            )}
          </div>
          <div className="pb-5">
            <p className="font-mono text-sm text-[#F6F5F2]">{step.phase}</p>
            <p className="text-xs text-[#71717A] mt-0.5">{step.detail}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-4 pt-1 border-t border-white/[0.06]">
        <div className="w-3 shrink-0" />
        <p className="text-[10px] text-[#71717A] font-mono">
          emit: FeeAdjustedForMaturity · ImpliedRateUpdated · ParityDriftDetected
        </p>
      </div>
    </div>
  )
}
