'use client'

import type { WhitepaperVisualId } from '@/lib/whitepaper/sections'
import { InlineConvergenceChart } from './InlineConvergenceChart'
import { InlineFeeDecayChart } from './InlineFeeDecayChart'
import { ParityDriftBar } from './ParityDriftBar'
import { TokenizationFlowDiagram } from './TokenizationFlowDiagram'
import { HookLifecycleDiagram } from './HookLifecycleDiagram'
import { ReactivePipelineDiagram } from './ReactivePipelineDiagram'

interface WhitepaperVisualProps {
  id: WhitepaperVisualId
  caption?: string
}

export function WhitepaperVisual({ id, caption }: WhitepaperVisualProps) {
  return (
    <figure className="my-6 rounded-xl border border-white/[0.06] bg-[#0C0C0C] p-5">
      <VisualContent id={id} />
      {caption && (
        <figcaption className="mt-4 text-[11px] text-[#71717A] leading-relaxed border-t border-white/[0.06] pt-3">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function VisualContent({ id }: { id: WhitepaperVisualId }) {
  switch (id) {
    case 'tokenization-flow':
      return <TokenizationFlowDiagram />
    case 'convergence':
      return <InlineConvergenceChart />
    case 'fee-decay':
      return <InlineFeeDecayChart />
    case 'parity-bar':
      return <ParityDriftBar />
    case 'hook-lifecycle':
      return <HookLifecycleDiagram />
    case 'reactive-pipeline':
      return <ReactivePipelineDiagram />
    default:
      return null
  }
}
