import { encodePacked, keccak256 } from 'viem'

/** PoolManager storage slot for `mapping(PoolId => Pool.State) pools`. */
const POOLS_SLOT = `0x${'6'.padStart(64, '0')}` as `0x${string}`

export function getPoolStateSlot(poolId: `0x${string}`): `0x${string}` {
  return keccak256(encodePacked(['bytes32', 'bytes32'], [poolId, POOLS_SLOT]))
}

/** Parse sqrtPriceX96 from Pool.State slot0 extsload word (bottom 160 bits). */
export function parseSqrtPriceX96FromSlot(data: `0x${string}`): bigint {
  const mask = (BigInt(1) << BigInt(160)) - BigInt(1)
  return BigInt(data) & mask
}

/** Match MochiYieldHook._sqrtPriceToPrice — WETH-denominated price at 1e18 scale. */
export function sqrtPriceX96ToPrice(sqrtPriceX96: bigint): bigint {
  return (sqrtPriceX96 * sqrtPriceX96 * BigInt(10 ** 18)) >> BigInt(192)
}

export function poolPriceFromExtsload(data: `0x${string}` | undefined): bigint {
  if (!data || data === `0x${'0'.repeat(64)}`) return BigInt(0)
  return sqrtPriceX96ToPrice(parseSqrtPriceX96FromSlot(data))
}
