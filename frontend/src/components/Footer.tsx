import Link from 'next/link'
import { MochiLogo } from './MochiLogo'

const footerLinks = {
  Product: [
    { href: '/markets', label: 'Markets' },
    { href: '/deposit', label: 'Vaults' },
    { href: '/analytics', label: 'Analytics' },
  ],
  Learn: [
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#pt-yt', label: 'PT & YT' },
    { href: '/#whitepaper', label: 'Whitepaper' },
    { href: '/#faq', label: 'FAQ' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface section-padding py-16">
      <div className="content-max">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <MochiLogo showLink={false} />
            <p className="mt-4 text-secondary text-sm max-w-sm leading-relaxed">
              Trade future yield without selling your assets. Soft, transparent yield
              markets powered by Uniswap v4 Hooks.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-primary text-sm mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} MochiTrade. All rights reserved.
          </p>
          <p className="text-muted text-xs">
            Friendly · Confident · Educational
          </p>
        </div>
      </div>
    </footer>
  )
}
