'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { dashboardStyles } from '@/lib/dashboard/styles'
import type { YieldSlice } from '@/lib/dashboard/demo-data'

interface DashboardYieldDonutProps {
  slices: YieldSlice[]
}

export function DashboardYieldDonut({ slices }: DashboardYieldDonutProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className={`${dashboardStyles.panel} p-5 flex flex-col min-h-[220px]`}>
      <p className={dashboardStyles.title}>Yield Mix</p>
      <p className={`${dashboardStyles.subtitle} mt-0.5 mb-3`}>Portfolio breakdown</p>
      <div className="flex flex-1 items-center gap-4 min-h-[140px]">
        <div className="relative w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={54}
                paddingAngle={3}
                strokeWidth={0}
              >
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-lg font-bold text-slate-900 ${dashboardStyles.number}`}>
              {total}%
            </span>
            <span className="text-[10px] text-slate-400">Total</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2.5 min-w-0">
          {slices.map((slice) => (
            <li key={slice.name} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: slice.color }}
                />
                <span className="text-slate-600 truncate">{slice.name}</span>
              </div>
              <span className={`font-semibold text-slate-800 ${dashboardStyles.number}`}>
                {slice.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
