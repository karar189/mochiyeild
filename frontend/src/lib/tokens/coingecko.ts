/** CoinGecko CDN token logos — assets.coingecko.com/coins/images/... */
export const COINGECKO_TOKEN_IMAGES = {
  wstETH: 'https://assets.coingecko.com/coins/images/18834/small/wstETH.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  rETH: 'https://assets.coingecko.com/coins/images/20764/small/reth.png',
  sUSDe: 'https://assets.coingecko.com/coins/images/33669/small/sUSDe-Symbol-Color.png',
  stETH: 'https://assets.coingecko.com/coins/images/13442/small/steth_logo.png',
} as const

export type CoingeckoToken = keyof typeof COINGECKO_TOKEN_IMAGES

const SYMBOL_ALIASES: Record<string, CoingeckoToken> = {
  WSTETH: 'wstETH',
  STETH: 'stETH',
  USDC: 'USDC',
  RETH: 'rETH',
  SUSDE: 'sUSDe',
  ETH: 'ETH',
}

/** Resolve a market label like "wstETH PT" → wstETH */
export function resolveTokenSymbol(label: string): CoingeckoToken | null {
  const upper = label.toUpperCase()
  const keys = Object.keys(SYMBOL_ALIASES).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (upper.includes(key)) return SYMBOL_ALIASES[key]
  }
  return null
}

export function getCoingeckoImageUrl(labelOrSymbol: string): string | null {
  const direct = COINGECKO_TOKEN_IMAGES[labelOrSymbol as CoingeckoToken]
  if (direct) return direct
  const resolved = resolveTokenSymbol(labelOrSymbol)
  return resolved ? COINGECKO_TOKEN_IMAGES[resolved] : null
}
