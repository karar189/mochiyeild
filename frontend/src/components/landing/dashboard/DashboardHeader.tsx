'use client'

import { Bell, Search } from 'lucide-react'

const TIME_RANGES = ['1D', '1W', '1M', '6M', '1Y'] as const

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 mb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#71717A]">Welcome back,</p>
          <h3 className="dash-title text-xl text-[#F6F5F2] mt-0.5">
            <span className="text-[#FF92B3]">Trader</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-full dash-glass flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-[#71717A]" strokeWidth={1.75} />
          </div>
          <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center text-[10px] font-medium text-[#F6F5F2]">
            MY
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 dash-input px-3 py-2.5">
        <Search className="w-4 h-4 text-[#52525B] shrink-0" strokeWidth={1.75} />
        <span className="text-sm text-[#52525B]">Search markets, PT / YT pairs…</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="dash-title text-base text-[#F6F5F2]">Overview</p>
        <div className="flex items-center gap-1.5">
          {TIME_RANGES.map((range) => (
            <span
              key={range}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium tabular-nums ${
                range === '6M' ? 'dash-pill-active' : 'dash-pill'
              }`}
            >
              {range}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
