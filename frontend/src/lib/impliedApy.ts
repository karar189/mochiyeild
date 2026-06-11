/** Match MochiYieldHook.calculateImpliedAPY — returns basis points (can be negative). */
export function calculateImpliedAPY(ptPrice: bigint, timeToMaturity: number): number {
  if (timeToMaturity <= 0 || ptPrice <= BigInt(0)) return 0

  const one = BigInt(10 ** 18)
  const secondsPerYear = BigInt(365 * 86400)
  const bpsScale = BigInt(10000)
  const ttm = BigInt(timeToMaturity)

  if (ptPrice >= one) {
    const premium = ptPrice - one
    const annualizedPremium = (premium * secondsPerYear * bpsScale) / (ptPrice * ttm)
    return -Number(annualizedPremium)
  }

  const discount = one - ptPrice
  const annualizedDiscount = (discount * secondsPerYear * bpsScale) / (ptPrice * ttm)
  return Number(annualizedDiscount)
}
