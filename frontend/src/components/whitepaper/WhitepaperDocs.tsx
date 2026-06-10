'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { bebasNeue } from '@/lib/fonts'
import { WHITEPAPER_SECTIONS } from '@/lib/whitepaper/sections'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { WhitepaperSidebar, WhitepaperOnPageNav } from './WhitepaperNav'
import { WhitepaperSectionContent } from './WhitepaperSectionContent'

const SECTION_IDS = WHITEPAPER_SECTIONS.map((s) => s.id)

export function WhitepaperDocs() {
  const activeId = useScrollSpy(SECTION_IDS)

  return (
    <div className="min-h-screen bg-[#050505] text-[#F6F5F2] font-[family-name:var(--font-inter)] pt-24 pb-20 section-padding">
      <div className="content-max">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#F6F5F2] transition-colors mb-8 lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to Home
        </Link>

        <div className="flex gap-10 xl:gap-16">
          {/* Left sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin">
              <WhitepaperSidebar activeId={activeId} />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            <header className="mb-12 pb-10 border-b border-white/[0.06]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF92B3]/15 border border-[#FF92B3]/25 rounded-full text-sm font-medium text-[#FF92B3] mb-6">
                <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                Documentation v1.0
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71717A] mb-3">
                Get Started
              </p>
              <h1
                className={`${bebasNeue.className} text-4xl md:text-5xl leading-[0.95] text-[#F6F5F2] mb-4`}
              >
                MochiTrade Technical Specification
              </h1>
              <p className="text-[#A1A1AA] text-lg leading-relaxed">
                Time-aware fixed income markets on Uniswap v4 — PT/YT tokenization,
                maturity fee decay, implied rate guards, and cross-pool parity with
                Reactive Network integration.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mt-8">
                {[
                  { href: '/markets', title: 'Launch Markets', desc: 'Swap PT/YT on v4 pools' },
                  { href: '/analytics', title: 'Hook Analytics', desc: 'Live hook event feed' },
                  { href: '/deposit', title: 'Deposit & Split', desc: 'Mint PT + YT from wstETH' },
                  { href: '#hook-lifecycle', title: 'Hook Lifecycle', desc: 'How beforeSwap works' },
                ].map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group rounded-xl border border-white/[0.06] bg-[#0C0C0C] p-4 hover:border-[#FF92B3]/30 transition-colors"
                  >
                    <p className="text-sm font-semibold text-[#F6F5F2] group-hover:text-[#FF92B3] transition-colors">
                      {card.title} →
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">{card.desc}</p>
                  </Link>
                ))}
              </div>
            </header>

            <article className="space-y-0">
              {WHITEPAPER_SECTIONS.map((section) => (
                <WhitepaperSectionContent key={section.id} section={section} />
              ))}
            </article>
          </main>

          {/* Right "On this page" */}
          <aside className="hidden xl:block w-48 shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <WhitepaperOnPageNav activeId={activeId} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
