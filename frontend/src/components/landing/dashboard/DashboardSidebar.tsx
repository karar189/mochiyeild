'use client'

import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Settings,
  Headphones,
  type LucideIcon,
} from 'lucide-react'
import { getDashboardTheme, type DashboardTheme } from '@/lib/dashboard/styles'

const navItems: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: BarChart3, label: 'Markets' },
  { icon: Wallet, label: 'Portfolio' },
]

const bottomItems: { icon: LucideIcon; label: string }[] = [
  { icon: Settings, label: 'Settings' },
  { icon: Headphones, label: 'Support' },
]

interface DashboardSidebarProps {
  theme?: DashboardTheme
}

export function DashboardSidebar({ theme = 'light' }: DashboardSidebarProps) {
  const t = getDashboardTheme(theme)
  const isDark = theme === 'dark'

  return (
    <aside
      className={`hidden sm:flex flex-col w-[68px] lg:w-[200px] py-5 shrink-0 ${t.sidebar}`}
    >
      <div className="mb-8 px-3 lg:px-5 flex justify-center lg:justify-start">
        <div className="hidden lg:block px-1">
          <span className="text-base font-semibold text-[#FF92B3] font-clash">mochi</span>
          <span className="text-base font-semibold text-[#A6D95B] font-clash">yeild</span>
        </div>
        <div className="lg:hidden text-[10px] font-bold font-clash">
          <span className="text-[#FF92B3]">m</span>
          <span className="text-[#A6D95B]">y</span>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 lg:px-3 flex-1">
        {navItems.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            title={label}
            className={`flex items-center justify-center lg:justify-start gap-2.5 px-2.5 lg:px-3 py-2.5 rounded-2xl text-sm ${
              active
                ? isDark
                  ? 'dash-nav-active font-medium'
                  : t.sidebarActive
                : `${t.sidebarInactive} hover:text-[#A1A1AA]`
            }`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0 text-[#F6F5F2]" strokeWidth={1.75} />
            <span className="hidden lg:inline truncate">{label}</span>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 px-2 lg:px-3 mt-auto pt-4 border-t border-white/[0.06] mx-2 lg:mx-3">
        {bottomItems.map(({ icon: Icon, label }) => (
          <div
            key={label}
            title={label}
            className={`flex items-center justify-center lg:justify-start gap-2.5 px-2.5 lg:px-3 py-2.5 rounded-2xl text-sm ${t.sidebarInactive} hover:text-[#A1A1AA]`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            <span className="hidden lg:inline truncate">{label}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

export function DashboardSidebarMobile({ theme = 'light' }: DashboardSidebarProps) {
  const t = getDashboardTheme(theme)
  const isDark = theme === 'dark'

  return (
    <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 -mx-1">
      {navItems.map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
            active
              ? isDark
                ? 'dash-pill-active'
                : `${t.sidebarActive} border border-[#A6D95B]/30`
              : `dash-pill ${t.sidebarInactive}`
          }`}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
          {label}
        </div>
      ))}
    </div>
  )
}
