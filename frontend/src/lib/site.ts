import type { Metadata } from 'next'

export const SITE_NAME = 'mochiyeild'
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mochiyeild.xyz'

export const SITE_TAGLINE = 'Trade future yield without selling your assets'

export const SITE_DESCRIPTION =
  'mochiyeild splits yield-bearing assets into Principal Tokens (PT) and Yield Tokens (YT) on Uniswap v4. Trade future yield without selling your underlying — with maturity-aware fees, implied-rate guards, and cross-pool parity monitoring.'

export const SITE_KEYWORDS = [
  'mochiyeild',
  'yield trading',
  'Principal Token',
  'Yield Token',
  'PT YT',
  'Uniswap v4 hooks',
  'fixed income DeFi',
  'wstETH yield',
  'maturity fee decay',
  'yield curve AMM',
  'Reactive Network',
  'DeFi fixed income',
]

export const FAQ_ITEMS = [
  {
    question: 'What is mochiyeild?',
    answer:
      'mochiyeild is a yield trading protocol on Uniswap v4 that splits yield-bearing assets like wstETH into Principal Tokens (PT) and Yield Tokens (YT), so you can trade future yield without selling the underlying asset.',
  },
  {
    question: 'What are PT and YT tokens?',
    answer:
      'Principal Tokens (PT) represent fixed-income exposure redeemable at maturity. Yield Tokens (YT) represent future yield accrual until maturity and can be traded independently for yield speculation.',
  },
  {
    question: 'How does the MochiYieldHook work?',
    answer:
      'The MochiYieldHook enforces three layers on every swap: implied rate bounds to block negative-yield trades, maturity-aware fee decay as expiration approaches, and cross-pool PT/YT parity monitoring against the underlying price.',
  },
  {
    question: 'Can I deposit wstETH on mochiyeild?',
    answer:
      'Yes. Deposit wstETH into the mochiyeild vault to receive equal amounts of PT-wstETH and YT-wstETH. After maturity, redeem PT 1:1 for underlying wstETH.',
  },
] as const

export function createPageMetadata({
  title,
  description,
  path = '',
}: {
  title: string
  description: string
  path?: string
}): Metadata {
  const url = `${SITE_URL}${path}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'finance',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-US',
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    sameAs: ['https://github.com/karar189/mochitrade'],
  }
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: SITE_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
