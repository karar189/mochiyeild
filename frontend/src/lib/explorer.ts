/** Block explorer base URLs for contract address pages (trailing path included). */
const ADDRESS_EXPLORERS: Record<number, string> = {
  1301: 'https://unichain-sepolia.blockscout.com/address/',
  5318007: 'https://lasna.blockscout.com/address/',
}

function getExplorerBase(chainId: number): string | null {
  const custom = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL?.trim()
  if (custom) {
    return custom.endsWith('/') ? custom : `${custom}/`
  }
  return ADDRESS_EXPLORERS[chainId] ?? null
}

export function getContractExplorerUrl(chainId: number, address: string): string | null {
  const base = getExplorerBase(chainId)
  if (!base || !address.startsWith('0x')) return null
  return `${base}${address}`
}

export function hasContractExplorer(chainId: number): boolean {
  return getExplorerBase(chainId) !== null
}
