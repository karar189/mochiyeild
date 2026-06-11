import { createPageMetadata } from '@/lib/site'

export const metadata = createPageMetadata({
  title: 'Markets',
  description:
    'Trade PT and YT tokens on mochiyeild. Swap principal and yield exposure with maturity-aware dynamic fees on Uniswap v4.',
  path: '/markets',
})

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
