'use client'

import { dashboardStyles } from '@/lib/dashboard/styles'

interface FooterStat {
  label: string
  value: string
}

interface DashboardFooterBarProps {
  stats: FooterStat[]
}

export function DashboardFooterBar({ stats }: DashboardFooterBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 sm:px-5 py-3.5 h-full flex flex-col justify-center">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <p className={`${dashboardStyles.subtitle} truncate`}>{stat.label}</p>
            <p className={`text-sm font-semibold text-slate-900 mt-0.5 ${dashboardStyles.number}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
