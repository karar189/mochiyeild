'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { ContractAddressChip } from '@/components/ContractAddressChip'
import { getPublicDeployment } from '@/lib/public-deployment'

const GITHUB_URL = 'https://github.com/karar189/mochitrade'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2.2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.73-1.34-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.32 1.24-3.14-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.2a11.6 11.6 0 0 1 6 0c2.29-1.52 3.3-1.2 3.3-1.2.66 1.66.24 2.88.12 3.18.77.82 1.23 1.86 1.23 3.14 0 4.5-2.81 5.48-5.49 5.77.43.36.81 1.08.81 2.18v3.23c0 .31.22.68.83.56A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  )
}

const footerLinks = {
  Product: [
    { href: '/markets', label: 'Markets' },
    { href: '/deposit', label: 'Vaults' },
    { href: '/analytics', label: 'Analytics' },
  ],
  Learn: [
    { href: '/#premise', label: 'The Premise' },
    { href: '/#architecture', label: 'Architecture' },
    { href: '/whitepaper', label: 'Whitepaper' },
  ],
}

const STACK = ['Solidity', 'Uniswap v4', 'Foundry', 'Next.js', 'Reactive Network']

function buildContractList(): { label: string; address: string }[] {
  const { addresses } = getPublicDeployment()
  return [
    { label: 'Hook', address: addresses.hook },
    { label: 'Vault', address: addresses.vault },
    { label: 'PT', address: addresses.ptToken },
    { label: 'YT', address: addresses.ytToken },
  ]
}

export function Footer() {
  const { chainId } = getPublicDeployment()
  const contracts = buildContractList()

  return (
    <footer className="bg-[#050505] text-[#F6F5F2] border-t border-white/[0.06] section-padding py-16">
      <div className="content-max">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <BrandLogo showLink={false} size="lg" />
            <p className="mt-4 text-[#A1A1AA] text-sm max-w-sm leading-relaxed">
              Trade future yield without selling your assets. Yield markets
              powered by Uniswap v4 Hooks.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[#A1A1AA]"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-[#FF92B3] transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                GitHub
              </a>
              <Link
                href="/whitepaper"
                className="inline-flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-[#FF92B3] transition-colors"
              >
                <FileText className="w-4 h-4" strokeWidth={1.75} />
                Whitepaper
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-[#F6F5F2] text-sm mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#A1A1AA] text-sm hover:text-[#FF92B3] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.06]">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#A1A1AA] mb-4">
            Deployed contracts
          </p>
          <div className="flex flex-wrap gap-3">
            {contracts.map((c) => (
              <ContractAddressChip
                key={c.label}
                label={c.label}
                address={c.address}
                chainId={chainId}
              />
            ))}
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#A1A1AA] text-sm">
            © {new Date().getFullYear()} mochiyeild. All rights reserved.
          </p>
          <p className="text-[#A1A1AA]/60 text-xs">
            Trade Yield. Keep Principal.
          </p>
        </div>
      </div>
    </footer>
  )
}
