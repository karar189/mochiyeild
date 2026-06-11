const EXPLORER_ROOTS: Record<number, string> = {
  1301: 'https://unichain-sepolia.blockscout.com',
  5318007: 'https://lasna.blockscout.com',
}

function getExplorerRoot(chainId: number): string | null {
  const custom = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL?.trim()
  if (custom) {
    return custom.replace(/\/address\/?$/, '').replace(/\/$/, '')
  }
  return EXPLORER_ROOTS[chainId] ?? null
}

export function getContractExplorerUrl(chainId: number, address: string): string | null {
  const root = getExplorerRoot(chainId)
  if (!root || !address.startsWith('0x')) return null
  return `${root}/address/${address}`
}

export function getTransactionExplorerUrl(chainId: number, txHash: string): string | null {
  const root = getExplorerRoot(chainId)
  if (!root || !txHash.startsWith('0x')) return null
  return `${root}/tx/${txHash}`
}

export function hasContractExplorer(chainId: number): boolean {
  return getExplorerRoot(chainId) !== null
}
