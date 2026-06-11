import type { Metadata } from 'next'
import { SlidesDeck } from '@/components/slides/SlidesDeck'

export const metadata: Metadata = {
  title: 'Slides',
  description:
    'mochiyeild presentation deck — time-aware fixed income markets on Uniswap v4.',
  robots: { index: false, follow: false },
}

export default function SlidesPage() {
  return <SlidesDeck />
}
