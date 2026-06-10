'use client'

import {
  DASHBOARD_ACCENTS,
  KPI_ACCENT_CYCLE,
  getDashboardTheme,
  type DashboardTheme,
} from '@/lib/dashboard/styles'
import type { KpiMetric } from '@/lib/dashboard/demo-data'

interface DashboardKpiStripProps {
  metrics: KpiMetric[]
  theme?: DashboardTheme
}

export function DashboardKpiStrip({ metrics, theme = 'light' }: DashboardKpiStripProps) {
  const t = getDashboardTheme(theme)
  const isDark = theme === 'dark'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric, i) => {
        const accentKey = KPI_ACCENT_CYCLE[i % KPI_ACCENT_CYCLE.length]
        const accent = isDark ? DASHBOARD_ACCENTS[accentKey] : null

        return (
          <div key={metric.label} className={`${t.panel} p-4 sm:p-5`}>
            <p className={`${isDark ? 'text-xs text-[#71717A]' : t.subtitle} truncate mb-3`}>
              {metric.label}
            </p>
            <p
              className={`text-xl sm:text-2xl font-semibold ${isDark ? 'dash-value text-[#F6F5F2]' : t.value} tabular-nums tracking-tight leading-none`}
            >
              {metric.value}
            </p>
            <p
              className={`text-xs font-medium mt-1.5 tabular-nums ${
                isDark && accent
                  ? accent.changeText
                  : metric.positive
                    ? 'text-[#7BAE3A]'
                    : 'text-red-500'
              }`}
            >
              {metric.change}
            </p>
          </div>
        )
      })}
    </div>
  )
}
