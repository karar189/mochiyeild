import deploymentData from './deployments.json'

export type PoolConfig = {
  poolId: string
  currency0: `0x${string}`
  currency1: `0x${string}`
  fee: number
  tickSpacing: number
  hooks: `0x${string}`
  tokenIsCurrency0: boolean
  tradeToken: `0x${string}`
}

export type MochiDeployment = {
  chainId: number
  addresses: {
    underlying: `0x${string}`
    vault: `0x${string}`
    ptToken: `0x${string}`
    ytToken: `0x${string}`
    hook: `0x${string}`
    weth: `0x${string}`
    swapRouter: `0x${string}`
    poolManager: `0x${string}`
    positionManager: `0x${string}`
    permit2: `0x${string}`
  }
  pools: {
    pt: PoolConfig
    yt: PoolConfig
  }
  maturity: number
  reactive?: {
    callbackProxy: `0x${string}`
    arbitrageRouter: `0x${string}`
    keeper?: `0x${string}`
    lasnaChainId: number
  }
}

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`

const DEPLOYMENTS: Record<number, MochiDeployment> = {
  [deploymentData.chainId]: deploymentData as MochiDeployment,
}

export function getDeployment(chainId: number): MochiDeployment | null {
  return DEPLOYMENTS[chainId] ?? null
}

export function getMochiAddresses(chainId: number) {
  const deployment = getDeployment(chainId)
  if (!deployment) {
    return {
      hook: ZERO,
      vault: ZERO,
      ptToken: ZERO,
      ytToken: ZERO,
      underlying: ZERO,
      weth: ZERO,
      swapRouter: ZERO,
      ptPool: ZERO,
      ytPool: ZERO,
    }
  }

  return {
    hook: deployment.addresses.hook,
    vault: deployment.addresses.vault,
    ptToken: deployment.addresses.ptToken,
    ytToken: deployment.addresses.ytToken,
    underlying: deployment.addresses.underlying,
    weth: deployment.addresses.weth,
    swapRouter: deployment.addresses.swapRouter,
    ptPool: deployment.pools.pt.poolId as `0x${string}`,
    ytPool: deployment.pools.yt.poolId as `0x${string}`,
  }
}

export const MOCHI_ADDRESSES = getMochiAddresses(31337)

export const MOCHI_HOOK_ABI = [
  {
    type: 'function',
    name: 'getMarketState',
    inputs: [],
    outputs: [
      { name: 'ptPrice', type: 'uint256' },
      { name: 'ytPrice', type: 'uint256' },
      { name: 'impliedAPY', type: 'int256' },
      { name: 'parityDrift', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateImpliedAPY',
    inputs: [
      { name: 'ptPrice', type: 'uint256' },
      { name: 'timeToMaturity', type: 'uint256' },
    ],
    outputs: [{ name: 'impliedAPY', type: 'int256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'calculateFeeForMaturity',
    inputs: [{ name: 'timeToMaturity', type: 'uint256' }],
    outputs: [{ name: 'feeBps', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'lastPTPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lastYTPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lastImpliedAPY',
    inputs: [],
    outputs: [{ name: '', type: 'int256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lastParityDrift',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'underlyingPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'ImpliedRateUpdated',
    inputs: [
      { name: 'maturity', type: 'uint256', indexed: true },
      { name: 'impliedAPY', type: 'int256', indexed: false },
      { name: 'ptPrice', type: 'uint256', indexed: false },
      { name: 'timeToMaturity', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FeeAdjustedForMaturity',
    inputs: [
      { name: 'poolId', type: 'bytes32', indexed: true },
      { name: 'timeToMaturity', type: 'uint256', indexed: false },
      { name: 'newFeeBps', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ParityDriftDetected',
    inputs: [
      { name: 'ptPrice', type: 'uint256', indexed: false },
      { name: 'ytPrice', type: 'uint256', indexed: false },
      { name: 'underlyingPrice', type: 'uint256', indexed: false },
      { name: 'driftBps', type: 'uint256', indexed: false },
      { name: 'isOverValued', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'SwapRejectedNegativeYield',
    inputs: [
      { name: 'poolId', type: 'bytes32', indexed: true },
      { name: 'swapper', type: 'address', indexed: true },
      { name: 'impliedAPY', type: 'int256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'MarketStressDetected',
    inputs: [
      { name: 'timestamp', type: 'uint256', indexed: false },
      { name: 'reason', type: 'string', indexed: false },
    ],
  },
] as const

export const POOL_MANAGER_ABI = [
  {
    type: 'function',
    name: 'extsload',
    inputs: [{ name: 'slot', type: 'bytes32' }],
    outputs: [{ name: 'value', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

export const ARBITRAGE_ROUTER_ABI = [
  {
    type: 'event',
    name: 'ParityRestored',
    inputs: [
      { name: 'ptPrice', type: 'uint256', indexed: false },
      { name: 'ytPrice', type: 'uint256', indexed: false },
      { name: 'underlyingPrice', type: 'uint256', indexed: false },
      { name: 'driftBps', type: 'uint256', indexed: false },
      { name: 'isOverValued', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'restoreCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

export const YIELD_VAULT_ABI = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [
      { name: 'ptAmount', type: 'uint256' },
      { name: 'ytAmount', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'redeem',
    inputs: [{ name: 'ptAmount', type: 'uint256' }],
    outputs: [{ name: 'underlyingAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'maturity',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'timeToMaturity',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isMatured',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalUnderlying',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalDeposited',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'underlyingAmount', type: 'uint256', indexed: false },
      { name: 'ptMinted', type: 'uint256', indexed: false },
      { name: 'ytMinted', type: 'uint256', indexed: false },
    ],
  },
] as const

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const SWAP_ROUTER_ABI = [
  {
    type: 'function',
    name: 'swapExactTokensForTokens',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'zeroForOne', type: 'bool' },
      {
        name: 'poolKey',
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
      { name: 'hookData', type: 'bytes' },
      { name: 'receiver', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'int256' }],
    stateMutability: 'payable',
  },
] as const

export function buildPoolKey(pool: PoolConfig) {
  return {
    currency0: pool.currency0,
    currency1: pool.currency1,
    fee: pool.fee,
    tickSpacing: pool.tickSpacing,
    hooks: pool.hooks,
  } as const
}
