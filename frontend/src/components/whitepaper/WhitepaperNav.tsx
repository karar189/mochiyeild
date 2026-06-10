'use client'

import Link from 'next/link'
import {
  WHITEPAPER_NAV_GROUPS,
  WHITEPAPER_SECTIONS,
  getSectionById,
} from '@/lib/whitepaper/sections'

interface WhitepaperSidebarProps {
  activeId: string
}

export function WhitepaperSidebar({ activeId }: WhitepaperSidebarProps) {

  return (
    <nav className="space-y-8" aria-label="Documentation">
      {WHITEPAPER_NAV_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#71717A] mb-3">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((itemId) => {
              const section = getSectionById(itemId)
              if (!section) return null
              const isActive = activeId === itemId
              return (
                <li key={itemId}>
                  <a
                    href={`#${itemId}`}
                    className={`block text-sm py-1.5 px-2 -mx-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-[#FF92B3] bg-[#FF92B3]/10 font-medium'
                        : 'text-[#A1A1AA] hover:text-[#F6F5F2] hover:bg-white/[0.03]'
                    }`}
                  >
                    {section.title.replace(/^\d+\.\s*/, '')}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <div className="pt-4 border-t border-white/[0.06] space-y-2">
        <Link
          href="/markets"
          className="block text-sm text-[#A1A1AA] hover:text-[#F6F5F2] transition-colors"
        >
          Launch App →
        </Link>
        <Link
          href="/analytics"
          className="block text-sm text-[#A1A1AA] hover:text-[#F6F5F2] transition-colors"
        >
          Hook Analytics →
        </Link>
      </div>
    </nav>
  )
}

export function WhitepaperOnPageNav({ activeId }: WhitepaperSidebarProps) {
  return (
    <nav aria-label="On this page">
      <p className="text-[11px] font-semibold text-[#71717A] mb-4 flex items-center gap-2">
        <span className="inline-block w-3 h-px bg-[#71717A]" />
        On this page
      </p>
      <ul className="space-y-2 border-l border-white/[0.06]">
        {WHITEPAPER_SECTIONS.map((section) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`block text-[13px] pl-3 -ml-px border-l transition-colors ${
                  isActive
                    ? 'border-[#FF92B3] text-[#F6F5F2] font-medium'
                    : 'border-transparent text-[#71717A] hover:text-[#A1A1AA] hover:border-white/[0.12]'
                }`}
              >
                {section.title.replace(/^\d+\.\s*/, '')}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
