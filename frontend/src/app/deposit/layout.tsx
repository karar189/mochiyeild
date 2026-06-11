import { createPageMetadata } from '@/lib/site'

export const metadata = createPageMetadata({
  title: 'Vaults',
  description:
    'Deposit wstETH on mochiyeild to mint PT and YT tokens. Manage yield positions and redeem principal at maturity.',
  path: '/deposit',
})

export default function DepositLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
