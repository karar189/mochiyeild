'use client'

/** Illustrative parity bar — PT + YT vs underlying with 5% threshold. */
export function ParityDriftBar() {
  const underlying = 1.0
  const pt = 0.58
  const yt = 0.36
  const combined = pt + yt
  const driftPct = Math.abs(combined - underlying) / underlying * 100
  const threshold = 5

  return (
    <div className="space-y-5 py-2">
      <div>
        <div className="flex justify-between text-[10px] text-[#71717A] mb-1.5 uppercase tracking-wider">
          <span>Underlying</span>
          <span className="tabular-nums">{underlying.toFixed(2)}</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full w-full bg-[#71717A]/40 rounded-full" />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-[#71717A] mb-1.5 uppercase tracking-wider">
          <span>PT + YT (combined)</span>
          <span className="tabular-nums text-[#F5D76E]">{combined.toFixed(2)} · {driftPct.toFixed(1)}% drift</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden flex">
          <div
            className="h-full bg-[#A6D95B]/70"
            style={{ width: `${(pt / underlying) * 100}%` }}
            title={`PT ${pt}`}
          />
          <div
            className="h-full bg-[#FF92B3]/70"
            style={{ width: `${(yt / underlying) * 100}%` }}
            title={`YT ${yt}`}
          />
          <div className="h-full flex-1 bg-transparent" />
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-[#71717A]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#A6D95B]/70" /> PT
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#FF92B3]/70" /> YT
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
        <span className="text-[10px] text-[#71717A]">Alert threshold</span>
        <span className="ml-auto text-[10px] font-mono text-[#FF92B3]">{threshold}%</span>
        <span className="text-[10px] text-[#71717A]">→ ParityDriftDetected</span>
      </div>
    </div>
  )
}
