import { createPageMetadata } from '@/lib/site'

export const metadata = createPageMetadata({
  title: 'Hook Analytics',
  description:
    'Monitor mochiyeild hook activity in real time — fee adjustments, implied rate updates, parity drift, and swap protection events.',
  path: '/analytics',
})

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
