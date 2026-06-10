/** Shared dashboard showcase design tokens */
export type DashboardTheme = 'light' | 'dark'

export const dashboardThemes = {
  light: {
    shell: 'rounded-[28px] border border-slate-200/90 bg-white shadow-sm overflow-hidden',
    panel: 'rounded-2xl border border-slate-200/90 bg-white shadow-sm',
    title: 'text-sm font-semibold text-slate-900',
    subtitle: 'text-xs text-slate-500',
    value: 'text-slate-900',
    muted: 'text-slate-400',
    label: 'text-slate-800',
    divider: 'border-slate-100',
    iconTile: 'h-7 w-7 rounded-lg bg-[#A6D95B]/12 flex items-center justify-center shrink-0',
    sidebar: 'border-r border-slate-200/80 bg-[#FAFAF8]',
    sidebarActive: 'bg-[#D8F2C2]/70 text-slate-900 font-medium',
    sidebarInactive: 'text-slate-500',
    mainBg: 'bg-white',
    badge: 'text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full',
    number: 'tabular-nums tracking-tight',
    chartAxis: '#94A3B8',
    tooltipBg: '#ffffff',
    tooltipBorder: '#E2E8F0',
    fillGradientId: 'tvlFillLight',
  },
  dark: {
    shell: 'rounded-[28px] border border-white/[0.06] bg-[#0c0c0c] overflow-hidden',
    panel: 'dash-card',
    title: 'text-sm font-semibold text-[#F6F5F2]',
    subtitle: 'text-xs text-[#71717A]',
    value: 'text-[#F6F5F2]',
    muted: 'text-[#71717A]',
    label: 'text-[#E4E4E7]',
    divider: 'border-white/[0.06]',
    iconTile:
      'h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0',
    sidebar: 'border-r border-white/[0.06] bg-[#0a0a0a]',
    sidebarActive: 'bg-[#A6D95B]/15 text-[#D8F2C2] font-medium',
    sidebarInactive: 'text-[#71717A]',
    mainBg: 'bg-[#0a0a0a]',
    badge:
      'text-[11px] text-[#71717A] bg-transparent border border-white/[0.1] px-3 py-1 rounded-full',
    number: 'tabular-nums tracking-tight',
    chartAxis: '#52525B',
    tooltipBg: '#161616',
    tooltipBorder: 'rgba(255,255,255,0.08)',
    fillGradientId: 'tvlFillDark',
  },
} as const

/** @deprecated use dashboardThemes.light */
export const dashboardStyles = dashboardThemes.light

export const CHART_PALETTE = {
  primary: '#A6D95B',
  secondary: '#EEB817',
  tertiary: '#FF92B3',
  fill: '#D8F2C2',
  fillSoft: '#EEF8DC',
  fillSoftDark: 'rgba(166,217,91,0.05)',
  warn: '#EEB817',
  danger: '#EF4444',
  pt: '#A6D95B',
  yt: '#FF92B3',
  lp: '#94A3B8',
} as const

export function getDashboardTheme(theme: DashboardTheme = 'light') {
  return dashboardThemes[theme]
}

export type DashboardAccent = 'green' | 'pink' | 'yellow'

export const DASHBOARD_ACCENTS: Record<
  DashboardAccent,
  {
    color: string
    iconTile: string
    changeText: string
    badgeBg: string
  }
> = {
  green: {
    color: '#A6D95B',
    iconTile:
      'h-8 w-8 rounded-lg bg-[#A6D95B]/10 border border-[#A6D95B]/15 flex items-center justify-center shrink-0',
    changeText: 'text-[#A6D95B]',
    badgeBg: 'text-[#A6D95B]',
  },
  pink: {
    color: '#FF92B3',
    iconTile:
      'h-8 w-8 rounded-lg bg-[#FF92B3]/10 border border-[#FF92B3]/15 flex items-center justify-center shrink-0',
    changeText: 'text-[#FF92B3]',
    badgeBg: 'text-[#FF92B3]',
  },
  yellow: {
    color: '#EEB817',
    iconTile:
      'h-8 w-8 rounded-lg bg-[#EEB817]/10 border border-[#EEB817]/15 flex items-center justify-center shrink-0',
    changeText: 'text-[#EEB817]',
    badgeBg: 'text-[#EEB817]',
  },
}

export const KPI_ACCENT_CYCLE: DashboardAccent[] = ['green', 'pink', 'yellow', 'green']

export function marketAccent(name: string): DashboardAccent {
  if (name.includes('YT')) return 'pink'
  if (name.includes('PT')) return 'green'
  return 'yellow'
}
