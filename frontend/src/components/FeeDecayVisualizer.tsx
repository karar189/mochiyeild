'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Percent } from 'lucide-react'

interface FeeDecayVisualizerProps {
  currentTimeToMaturity: number
}

export function FeeDecayVisualizer({ currentTimeToMaturity }: FeeDecayVisualizerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const calculateFee = (timeToMaturity: number): number => {
    const MAX_FEE_BPS = 100
    const MIN_FEE_BPS = 5
    const MAX_FEE_TIME = 90 * 86400
    const MIN_FEE_TIME = 7 * 86400

    if (timeToMaturity >= MAX_FEE_TIME) return MAX_FEE_BPS
    if (timeToMaturity <= MIN_FEE_TIME) return MIN_FEE_BPS

    const range = MAX_FEE_BPS - MIN_FEE_BPS
    const timeRange = MAX_FEE_TIME - MIN_FEE_TIME
    const timeFromMax = MAX_FEE_TIME - timeToMaturity

    return MAX_FEE_BPS - (range * timeFromMax) / timeRange
  }

  const generateFeeData = () => {
    const data = []
    for (let days = 90; days >= 0; days -= 3) {
      const timeInSeconds = days * 86400
      const fee = calculateFee(timeInSeconds)
      data.push({ days, fee: fee / 100 })
    }
    return data.reverse()
  }

  const data = generateFeeData()
  const currentFee = calculateFee(currentTimeToMaturity)
  const currentDays = Math.floor(currentTimeToMaturity / 86400)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-success" strokeWidth={1.75} />
          <h3 className="text-secondary text-sm font-medium">Fee Decay Curve</h3>
        </div>
        <div className="bg-[#A6D95B]/15 border border-[#A6D95B]/25 px-3 py-1 rounded-full">
          <span className="text-[#A6D95B] text-sm font-medium">
            Current: {(currentFee / 100).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="h-48 mt-4 min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="days"
              stroke="rgba(255,255,255,0.06)"
              tick={{ fill: '#A1A1AA', fontSize: 10 }}
              tickFormatter={(value) => `${value}d`}
            />
            <YAxis
              stroke="rgba(255,255,255,0.06)"
              tick={{ fill: '#A1A1AA', fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 1.2]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#101010',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: '#A1A1AA' }}
              itemStyle={{ color: '#A6D95B' }}
              formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Fee']}
              labelFormatter={(label) => `${label} days to maturity`}
            />
            <ReferenceLine
              x={currentDays}
              stroke="#A6D95B"
              strokeDasharray="3 3"
              label={{ value: 'Now', fill: '#A6D95B', fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="fee"
              stroke="#A6D95B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#A6D95B' }}
            />
          </LineChart>
        </ResponsiveContainer>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-[#A6D95B]/15 border border-[#A6D95B]/25 rounded-xl p-2 text-center">
          <div className="text-[#A6D95B] text-xs">Near Maturity</div>
          <div className="text-primary font-medium text-sm">0.05%</div>
        </div>
        <div className="bg-[#A6D95B]/15 rounded-xl p-2 text-center border border-[#A6D95B]/25">
          <div className="text-secondary text-xs">Current ({currentDays}d)</div>
          <div className="text-primary font-medium text-sm">
            {(currentFee / 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-cream rounded-xl p-2 text-center">
          <div className="text-muted text-xs">Far from Maturity</div>
          <div className="text-primary font-medium text-sm">1.00%</div>
        </div>
      </div>
    </div>
  )
}
