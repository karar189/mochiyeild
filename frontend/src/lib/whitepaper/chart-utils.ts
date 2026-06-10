/** Mirrors MochiYieldHook.calculateFeeForMaturity — fee in percent (0.05–1.00). */
export function calculateFeePercent(days: number): number {
  const MAX_FEE_BPS = 100
  const MIN_FEE_BPS = 5
  const MAX_FEE_DAYS = 90
  const MIN_FEE_DAYS = 7

  if (days >= MAX_FEE_DAYS) return MAX_FEE_BPS / 100
  if (days <= MIN_FEE_DAYS) return MIN_FEE_BPS / 100

  const range = MAX_FEE_BPS - MIN_FEE_BPS
  const timeRange = MAX_FEE_DAYS - MIN_FEE_DAYS
  const fromMax = MAX_FEE_DAYS - days
  return (MAX_FEE_BPS - (range * fromMax) / timeRange) / 100
}

export function buildFeeDecayData(step = 2) {
  const data: { days: number; fee: number }[] = []
  for (let days = 90; days >= 0; days -= step) {
    data.push({ days, fee: calculateFeePercent(days) })
  }
  return data
}

const TERM_DAYS = 90
const YT_START = 0.42

/** Illustrative PT/YT convergence — normalized to underlying = 1.0. */
export function buildConvergenceData(step = 2) {
  const data: { days: number; pt: number; yt: number }[] = []
  for (let days = TERM_DAYS; days >= 0; days -= step) {
    const t = days / TERM_DAYS
    const yt = YT_START * Math.pow(t, 1.25)
    data.push({ days, yt, pt: 1 - yt })
  }
  return data
}

export { TERM_DAYS }
