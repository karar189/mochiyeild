export type WhitepaperVisualId =
  | 'tokenization-flow'
  | 'convergence'
  | 'fee-decay'
  | 'parity-bar'
  | 'hook-lifecycle'
  | 'reactive-pipeline'

export type WhitepaperSection = {
  id: string
  title: string
  group: 'get-started' | 'core-concepts' | 'architecture' | 'reference'
  paragraphs?: string[]
  list?: string[]
  code?: string
  table?: [string, string][]
  footer?: string
  visual?: WhitepaperVisualId
  visualCaption?: string
}

export const WHITEPAPER_NAV_GROUPS = [
  {
    id: 'get-started',
    label: 'Get Started',
    items: ['abstract', 'tokenization', 'roles'],
  },
  {
    id: 'core-concepts',
    label: 'Core Concepts',
    items: ['implied-rate', 'fee-decay', 'parity'],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    items: ['hook-lifecycle', 'reactive', 'architecture'],
  },
  {
    id: 'reference',
    label: 'Reference',
    items: ['events', 'parameters', 'limitations', 'deployments'],
  },
] as const

export const WHITEPAPER_SECTIONS: WhitepaperSection[] = [
  {
    id: 'abstract',
    title: 'Abstract',
    group: 'get-started',
    paragraphs: [
      'MochiTrade is a yield trading protocol built on Uniswap v4 that splits yield-bearing assets into Principal Tokens (PT) and Yield Tokens (YT). This separation enables investors to independently trade future yield while preserving principal exposure — a capability impossible with traditional vault mechanics.',
      "The protocol's core innovation is MochiYieldHook, a single Uniswap v4 hook that enforces three layers of fixed-income market logic atomically: implied rate bounds, maturity-aware fee decay, and cross-pool PT/YT parity monitoring.",
      'Beyond the hook, MochiTrade closes the loop with a Reactive Smart Contract that subscribes to ParityDriftDetected on the origin chain and triggers a cross-chain callback to an ArbitrageRouter — moving parity enforcement from passive monitoring toward autonomous correction.',
    ],
    visual: 'reactive-pipeline',
    visualCaption:
      'System overview — hook on origin chain, Reactive keeper on Lasna, callback back to ArbitrageRouter.',
  },
  {
    id: 'tokenization',
    title: '1. Tokenization Model',
    group: 'get-started',
    paragraphs: [
      'Users deposit yield-bearing assets (e.g., wstETH) into YieldVault. The vault mints two ERC-20 tokens against deposited value at a 1:1 ratio:',
      'YieldVault.sol accepts the underlying via deposit(amount), mints PT + YT 1:1 against deposited value, and holds underlying until maturity. After maturity, redeem(ptAmount) burns PT and returns underlying 1:1. YT accrual stops at maturity and converges to zero — it is not redeemable for underlying through the vault.',
    ],
    list: [
      'Principal Token (PT) — Represents the underlying principal, redeemable at maturity. PT holders receive fixed-return exposure with capital protection.',
      'Yield Token (YT) — Represents all future yield accrual until maturity. YT holders can trade yield exposure independently, capturing upside from yield rate movements.',
      'deposit() — transfers underlying in, mints equal PT and YT to the depositor, emits Deposited(user, amount, ptMinted, ytMinted)',
      'redeem() — post-maturity only; burns PT, returns underlying 1:1, emits Redeemed(user, ptBurned, underlyingReturned)',
    ],
    footer:
      'At maturity, 1 PT redeems for 1 unit of underlying. YT ceases to accrue yield and converges to zero. PT and YT always reconcile to the underlying — that invariant is what the hook monitors across separate pools.',
    visual: 'tokenization-flow',
    visualCaption: 'Deposit → mint → trade PT and YT in separate v4 pools.',
  },
  {
    id: 'roles',
    title: '2. Roles & Participants',
    group: 'get-started',
    paragraphs: [
      'MochiTrade serves three distinct participants in the same market structure:',
    ],
    table: [
      ['Alice · LP', 'Provides liquidity to PT/WETH or YT/WETH pools. Earns maturity-scaled swap fees — higher far from expiry, lower near redemption.'],
      ['Bob · Yield trader', 'Deposits wstETH, sells PT, keeps YT. Gains leveraged yield exposure without selling the underlying.'],
      ['Charlie · PT holder', 'Buys and holds PT to maturity. Fixed-income exposure — redeems 1:1 for underlying at expiry.'],
    ],
    footer:
      'LPs are compensated by fees that track time-to-maturity risk, not flat meme-coin pool rates.',
    visual: 'convergence',
    visualCaption:
      'Illustrative PT/YT convergence — normalized to underlying = 1.0. Shaded band marks yield earned so far.',
  },
  {
    id: 'implied-rate',
    title: '3. Implied Rate Sentinel',
    group: 'core-concepts',
    paragraphs: [
      'The hook calculates implied APY from PT market price and time-to-maturity using simple annualized discount (matches MochiYieldHook.sol):',
    ],
    code: `// ptPrice below par → positive yield
discount = 1e18 - ptPrice
impliedAPY(bps) = discount / ptPrice × (365 days / timeToMaturity) × 10000

// ptPrice ≥ 1e18 (PT at/above par) → negative yield branch
premium = ptPrice - 1e18
impliedAPY(bps) = -premium / ptPrice × (365 days / timeToMaturity) × 10000`,
    list: [
      'MIN_IMPLIED_APY = 0 bps — negative yield triggers SwapRejectedNegativeYield and MarketStressDetected',
      'MAX_IMPLIED_APY = 10000 bps (100%) — extreme rates trigger stress alerts',
      'beforeSwap() calls _enforceImpliedRateBounds() on the current PT price and, for PT buys (!zeroForOne), on the limit price — reverting ImpliedRateOutOfBounds before the swap executes',
      'afterSwap() recalculates implied APY for observability and emits ImpliedRateUpdated on every PT pool swap',
    ],
    footer:
      'Rate enforcement runs atomically inside the swap callback — no external oracle call required for bounds checking.',
  },
  {
    id: 'fee-decay',
    title: '4. Maturity Fee Decay',
    group: 'core-concepts',
    paragraphs: [
      "Unlike generic dynamic fee hooks that respond to volume, MochiTrade's fees decay with time-to-maturity because volatility decreases as PT approaches redemption:",
    ],
    code: `ttm ≥ 90 days  → 100 bps (1.00%)
ttm ≤ 7 days   →   5 bps (0.05%)
7 < ttm < 90   → linear: 100 - (95 × (90d - ttm) / 83d)

// Applied via v4 dynamic fee override: feeBps × 100 | 0x800000`,
    list: [
      'Far from maturity (>90 days): 1.00% swap fee — premium for LP uncertainty',
      'Near maturity (<7 days): 0.05% swap fee — PT is bond-like, risk is low',
      'Between: smooth linear interpolation via calculateFeeForMaturity()',
    ],
    footer: 'This aligns LP compensation with actual risk exposure over the yield curve.',
    visual: 'fee-decay',
    visualCaption: 'Matches calculateFeeForMaturity() in MochiYieldHook.sol.',
  },
  {
    id: 'parity',
    title: '5. Cross-Pool Parity Oracle',
    group: 'core-concepts',
    paragraphs: [
      'PT and YT trade in separate Uniswap v4 pools but must maintain parity with the underlying asset. After every swap, the hook updates:',
    ],
    code: `combined = ptPrice + ytPrice
driftBps = |combined - underlying| / underlying × 10000

// emit ParityDriftDetected if driftBps > PARITY_DRIFT_THRESHOLD (500 = 5%)`,
    list: [
      'lastPTPrice and lastYTPrice updated from pool slot0 after each swap',
      'underlyingPrice is currently a settable assumption (setUnderlyingPrice) — oracle integration is future work',
      'ParityDriftDetected(ptPrice, ytPrice, underlyingPrice, driftBps, isOverValued) enables Reactive Network subscription',
    ],
    footer:
      'When drift exceeds threshold, the hook emits ParityDriftDetected — the entry point for the cross-chain correction loop.',
    visual: 'parity-bar',
    visualCaption: 'Alert fires when PT + YT drifts more than 5% from underlying.',
  },
  {
    id: 'hook-lifecycle',
    title: '6. Hook Execution Lifecycle',
    group: 'architecture',
    paragraphs: [
      'Every swap through a registered pool passes through MochiYieldHook in two phases:',
    ],
    table: [
      ['beforeSwap', 'Enforce implied rate bounds on PT pool → compute maturity fee → emit FeeAdjustedForMaturity → return dynamic fee override'],
      ['Swap executes', 'Uniswap v4 core executes at the overridden fee tier'],
      ['afterSwap', 'Read slot0 price → recompute implied APY → emit ImpliedRateUpdated / stress events → _updateParityState across PT + YT'],
    ],
    footer:
      'All three hook layers (rate sentinel, fee decay, parity oracle) run atomically within swap callbacks.',
    visual: 'hook-lifecycle',
    visualCaption: 'Sequence for a single swap through MochiYieldHook.',
  },
  {
    id: 'reactive',
    title: '7. Reactive Network Pipeline',
    group: 'architecture',
    paragraphs: [
      'MochiReactiveKeeper (Reactive Lasna 5318007 / mainnet 1597) subscribes to the ParityDriftDetected topic on the origin chain hook at construction via service.subscribe().',
      'On a qualifying event (driftBps ≥ driftThresholdBps), react() decodes the log, emits ParityCallbackTriggered, and emits a Callback carrying a restoreParity(...) payload to ArbitrageRouter on the origin chain. The router re-verifies drift and emits ParityRestored.',
      'Full PT/YT swap execution is the next step — the router currently records drift and emits events. The contract contains: // TODO: execute PT/YT pool swaps via v4 router when callback is funded.',
    ],
    list: [
      'Topic: keccak256("ParityDriftDetected(uint256,uint256,uint256,uint256,bool)")',
      'react() — vmOnly entry; decodes (ptPrice, ytPrice, underlyingPrice, driftBps, isOverValued) from log.data',
      'Callback payload — restoreParity(address, ptPrice, ytPrice, underlyingPrice, isOverValued) on ArbitrageRouter',
      'ArbitrageRouter — authorizedSenderOnly; reverts DriftBelowThreshold if drift < 500 bps',
      'Reactive cannot subscribe to local Anvil (31337) — E2E loop requires Unichain Sepolia (1301) + Lasna (5318007)',
    ],
    footer:
      'The cross-chain loop moves parity from passive monitoring to autonomous correction — with honest status labels on what ships today.',
    visual: 'reactive-pipeline',
    visualCaption: 'Origin chain → Reactive Lasna → callback → ArbitrageRouter on origin.',
  },
  {
    id: 'architecture',
    title: '8. Contract Architecture',
    group: 'architecture',
    table: [
      ['MochiYieldHook.sol', 'beforeSwap / afterSwap — rate sentinel, fee decay, parity oracle'],
      ['YieldVault.sol', 'deposit() underlying → mint PT + YT 1:1; redeem() post-maturity'],
      ['PTToken.sol', 'Principal Token ERC-20 — fixed income leg, redeemable at maturity'],
      ['YTToken.sol', 'Yield Token ERC-20 — yield speculation leg, converges to 0 at maturity'],
      ['MochiReactiveKeeper.sol', 'Reactive RSC on Lasna — subscribes to drift, fires callback'],
      ['ArbitrageRouter.sol', 'Origin-chain callback receiver — restoreParity()'],
      ['MockWstETH.sol', 'Test underlying + faucet for local demo'],
    ],
    footer:
      'All hook logic executes atomically within swap callbacks — no external oracle calls required for fee adjustment or parity checks.',
  },
  {
    id: 'events',
    title: '9. On-Chain Events',
    group: 'reference',
    paragraphs: [
      'Structured events for frontend, analytics, and Reactive Network integration. Full signatures (greppable against ABI):',
    ],
    code: `// MochiYieldHook
event ImpliedRateUpdated(uint256 indexed maturity, int256 impliedAPY, uint256 ptPrice, uint256 timeToMaturity);
event FeeAdjustedForMaturity(bytes32 indexed poolId, uint256 timeToMaturity, uint256 newFeeBps);
event ParityDriftDetected(uint256 ptPrice, uint256 ytPrice, uint256 underlyingPrice, uint256 driftBps, bool isOverValued);
event SwapRejectedNegativeYield(bytes32 indexed poolId, address indexed swapper, int256 impliedAPY);
event MarketStressDetected(uint256 timestamp, string reason);
event PoolRegistered(bytes32 indexed poolId, bool isPTPool, uint256 maturity);

// MochiReactiveKeeper
event ParityCallbackTriggered(uint256 driftBps, bool isOverValued);

// ArbitrageRouter
event ParityRestoreRequested(uint256 ptPrice, uint256 ytPrice, uint256 underlyingPrice, uint256 driftBps, bool isOverValued);
event ParityRestored(uint256 ptPrice, uint256 ytPrice, uint256 underlyingPrice, uint256 driftBps, bool isOverValued);

// YieldVault
event Deposited(address indexed user, uint256 underlyingAmount, uint256 ptMinted, uint256 ytMinted);
event Redeemed(address indexed user, uint256 ptBurned, uint256 underlyingReturned);`,
    list: [
      'ParityDriftDetected — subscribed by MochiReactiveKeeper via topic_0 on origin chain',
      'FeeAdjustedForMaturity — emitted on every swap through a registered pool',
      'ImpliedRateUpdated — PT pool swaps only; drives ImpliedRateGauge in the app',
      'ParityRestored — emitted when ArbitrageRouter receives and validates a Reactive callback',
    ],
  },
  {
    id: 'parameters',
    title: '10. Parameters & Constants',
    group: 'reference',
    table: [
      ['BASE_FEE_BPS', '30 (0.30% — unused default; dynamic fee overrides)'],
      ['MIN_FEE_BPS / MAX_FEE_BPS', '5 / 100 (0.05% – 1.00%)'],
      ['MIN_FEE_TIME / MAX_FEE_TIME', '7 days / 90 days'],
      ['MIN_IMPLIED_APY / MAX_IMPLIED_APY', '0 / 10000 bps (0% – 100%)'],
      ['PARITY_DRIFT_THRESHOLD', '500 bps (5%)'],
      ['DEFAULT_DRIFT_THRESHOLD_BPS (router)', '500 bps (5%)'],
    ],
    footer: 'All constants are defined in MochiYieldHook.sol and ArbitrageRouter.sol.',
  },
  {
    id: 'limitations',
    title: '11. Security & Limitations',
    group: 'reference',
    paragraphs: [
      'This is an MVP built for the UHI9 Hookathon. Known limitations:',
    ],
    list: [
      'underlyingPrice is a settable assumption (setUnderlyingPrice) — not a live Chainlink oracle',
      'registerPool and setUnderlyingPrice have no access control — known limitation, intentional for local demo',
      'ArbitrageRouter.restoreParity() records drift and emits ParityRestored — does not execute full v4 arb swaps yet',
      'Reactive E2E requires testnet — cannot subscribe to Anvil chain 31337',
      'Implied rate formula uses simple annualization, not compound discounting (faceValue/ptPrice)^n',
    ],
    footer:
      'Production deployment would add oracle feeds, access control, and funded swap paths on the router.',
  },
  {
    id: 'deployments',
    title: '12. Deployments',
    group: 'reference',
    paragraphs: [
      'Contract addresses are synced from deployments.json after each deploy. Three environments:',
    ],
    table: [
      ['Anvil (local demo)', 'Chain ID 31337 — hook, vault, markets. Reactive cannot subscribe here.'],
      ['Unichain Sepolia (origin)', 'Chain ID 1301 — Mochi stack + ArbitrageRouter. Event source and callback destination.'],
      ['Reactive Lasna (keeper)', 'Chain ID 5318007 — MochiReactiveKeeper. RPC: lasna-rpc.rnk.dev'],
      ['Reactive mainnet', 'Chain ID 1597 — production Reactive Network (future)'],
    ],
    footer:
      'Local: run ./scripts/deploy-local.sh with plain anvil on port 8545, connect MetaMask to chain 31337. Testnet E2E: ./scripts/deploy-reactive.sh for Unichain Sepolia + Lasna.',
  },
]

export function getSectionById(id: string): WhitepaperSection | undefined {
  return WHITEPAPER_SECTIONS.find((s) => s.id === id)
}
