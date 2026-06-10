'use client'

import { Clock, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MaturityCountdownProps {
  maturityTimestamp: number
}

export function MaturityCountdown({ maturityTimestamp }: MaturityCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000)
      const difference = maturityTimestamp - now

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
      }

      return {
        days: Math.floor(difference / 86400),
        hours: Math.floor((difference % 86400) / 3600),
        minutes: Math.floor((difference % 3600) / 60),
        seconds: difference % 60,
        total: difference,
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [maturityTimestamp])

  const isMatured = timeLeft.total <= 0
  const totalDuration = 30 * 86400
  const elapsed = totalDuration - timeLeft.total
  const progress = Math.min((elapsed / totalDuration) * 100, 100)

  if (isMatured) {
    return (
      <div className="card bg-[#A6D95B]/10 border-[#A6D95B]/25">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-[#A6D95B]" strokeWidth={1.75} />
          <h3 className="text-[#A6D95B] font-medium">Matured</h3>
        </div>
        <p className="text-secondary text-sm">
          PT tokens can now be redeemed for underlying assets.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-[#A6D95B]" strokeWidth={1.75} />
        <h3 className="text-secondary text-sm font-medium">Time to Maturity</h3>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Min' },
          { value: timeLeft.seconds, label: 'Sec' },
        ].map((item) => (
          <div key={item.label} className="bg-cream rounded-xl p-3 text-center">
            <div className="text-2xl font-semibold text-primary">
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-muted text-xs">{item.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted mb-2">
          <span>Start</span>
          <span>{progress.toFixed(1)}% elapsed</span>
          <span>Maturity</span>
        </div>
        <div className="h-2 bg-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A6D95B] rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
