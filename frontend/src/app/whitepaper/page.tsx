import { WhitepaperDocs } from '@/components/whitepaper/WhitepaperDocs'
import { createPageMetadata } from '@/lib/site'

export const metadata = createPageMetadata({
  title: 'Documentation',
  description:
    'Technical specification for mochiyeild — PT/YT tokenization, MochiYieldHook, maturity fee decay, and Reactive Network parity pipeline.',
  path: '/whitepaper',
})

export default function WhitepaperPage() {
  return <WhitepaperDocs />
}
