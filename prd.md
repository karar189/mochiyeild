# Mochi Yield — Product Requirements Document

**Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Hackathon MVP (contracts + frontend scaffolded; Reactive integration planned)

---

## 1. Executive Summary

**Mochi Yield** is an adaptive liquidity protocol built on Uniswap v4 that transforms yield-bearing assets (e.g. wstETH) into customizable risk tranches using Principal Tokens (PT) and Yield Tokens (YT). A single v4 hook enforces yield-curve-aware market rules — implied rate bounds, maturity-based fee decay, and cross-pool PT/YT parity — while **Reactive Network** turns hook events into automated, trustless market maintenance.

### One-Line Pitch

> The first Uniswap v4 hook that understands yield curves — with Reactive Network enabling self-healing PT/YT markets.

### What Makes This Different

| Generic Dynamic Fee Hook | Mochi Yield |
|--------------------------|-------------|
| "Fee changes on volume" | Fee decays as PT approaches maturity (volatility decreases) |
| Any AMM can do this | Only v4 enforces cross-pool invariants atomically in one hook |
| No fixed-income logic | Implied APY bounds prevent negative yields on-chain |
| Events are just logs | Reactive Network auto-executes corrective actions |

---

## 2. Problem Statement

### User Problems

1. **Yield exposure is all-or-nothing** — Holders of stETH/wstETH cannot easily separate principal safety from yield speculation without selling the asset.
2. **PT/YT markets lack fixed-income discipline** — Without yield-curve awareness, PT can trade above par (negative implied yield), creating irrational market states.
3. **LP risk is time-dependent** — Fee structures that ignore time-to-maturity misprice liquidity provision risk near vs. far from maturity.
4. **Cross-pool arbitrage is manual** — When PT + YT ≠ underlying, someone must run a keeper bot. Most protocols emit events and hope.

### Protocol Problems

- v3/custom AMMs cannot atomically coordinate two pools (PT + YT) under one policy engine.
- Hook events (`ParityDriftDetected`, `MarketStressDetected`) are inert without an execution layer.
- Maturity settlement requires manual triggers.

---

## 3. Target Users

| Persona | Goal | Primary Flow |
|---------|------|--------------|
| **Conservative Yield Farmer** | Preserve principal, earn predictable return | Deposit wstETH → hold PT → redeem at maturity |
| **Yield Speculator** | Leverage yield exposure without selling underlying | Deposit wstETH → sell PT, hold YT → trade yield |
| **LP / Market Maker** | Provide liquidity with time-aware fees | Add liquidity to PT/WETH or YT/WETH pools |
| **Arbitrageur** | Profit from parity drift | React to `ParityDriftDetected` (or let Reactive auto-execute) |
| **Integrator (Lending, etc.)** | Price PT collateral using implied APY | Read cross-chain oracle propagated by Reactive |

---

## 4. Product Scope

### 4.1 In Scope (Hackathon MVP)

- [x] YieldVault: deposit wstETH → mint PT + YT 1:1
- [x] PTToken / YTToken with maturity enforcement
- [x] MochiYieldHook with three layers (see §5)
- [x] Foundry test suite (41+ tests passing)
- [x] Next.js frontend (landing, deposit, markets, analytics)
- [ ] Testnet deployment (Sepolia / Base Sepolia)
- [ ] Frontend wired to deployed contracts
- [ ] Reactive Network keeper (Pattern 1: parity auto-rebalance)

### 4.2 Out of Scope (Post-Hackathon)

- Mainnet deployment
- Multi-asset vaults beyond wstETH
- Governance / fee routing to token holders
- Full cross-chain oracle mesh (Pattern 3)
- Mobile app

---

## 5. Core Product Features

### 5.1 Yield Tokenization (YieldVault)

**User story:** As a user, I deposit wstETH and receive equal amounts of PT-wstETH and YT-wstETH so I can choose my risk exposure.

| Requirement | Detail |
|-------------|--------|
| Deposit | `deposit(amount)` mints PT + YT 1:1 |
| Redeem | After maturity, `redeem(ptAmount)` returns underlying |
| Underlying | wstETH (non-rebasing; simplifies accounting) |
| Maturity | Fixed timestamp set at vault creation |
| Safety | `nonReentrant`, zero-address checks, maturity guards |

### 5.2 MochiYieldHook — Three Layers

#### Layer 1: Implied Rate Sentinel

- Calculates implied APY from PT price and time-to-maturity
- Rejects or alerts on negative implied yield (PT above par)
- Emits `ImpliedRateUpdated`, `SwapRejectedNegativeYield`

**Formula (simplified):**

```
impliedAPY (bps) = ((1e18 / ptPrice) - 1e18) * 365 days * 10000 / timeToMaturity
```

#### Layer 2: Maturity Fee Decay

- Dynamic swap fees based on time-to-maturity
- Far from maturity (>90 days): **1.00%** max fee
- Near maturity (<7 days): **0.05%** min fee
- Linear interpolation between thresholds
- Emits `FeeAdjustedForMaturity`

#### Layer 3: Cross-Pool Parity Oracle

- Monitors PT price + YT price vs underlying
- Alerts when drift exceeds **5%** (500 bps)
- Emits `ParityDriftDetected` for arbitrageurs and Reactive Network
- Emits `MarketStressDetected` on abnormal conditions

### 5.3 Reactive Network Integration

Reactive Network enables **reactive smart contracts** — contracts that automatically execute in response to on-chain events without external keepers or bots.

**Problem Mochi solves with Reactive:** Hook events are useful but inert. Reactive subscribes to them and triggers automated responses.

#### Pattern 1: Auto-Rebalancer on Parity Drift (Hackathon Priority)

```
MochiYieldHook emits ParityDriftDetected(driftBps > 500)
        │
        ▼
Reactive Network: MochiReactiveKeeper.react()
        │
        ▼
ArbitrageRouter.executeParity(ptPool, ytPool)
        │
        ▼
Parity restored — no external keeper
```

**Contract sketch:**

```solidity
contract MochiReactiveKeeper is IReactive {
    function react(uint256 chainId, address origin, bytes calldata eventData) external override {
        (, , , uint256 drift, bool over) = abi.decode(eventData, (uint256, uint256, uint256, uint256, bool));
        if (drift > 500) {
            IArbitrageRouter(arbitrageRouter).executeParity(ptPrice, ytPrice, underlying, over);
        }
    }

    function subscribe() external {
        IReactiveNetwork(REACTIVE).subscribe(ETHEREUM_CHAIN_ID, mochiHook, ParityDriftDetected.selector);
    }
}
```

#### Pattern 2: Maturity Auto-Settlement

When `block.timestamp >= maturity`:

- `YieldVault.enableRedemptionMode()`
- `MochiYieldHook.setMatured(poolId)`
- Optional holder notification

No manual "mature" transaction required.

#### Pattern 3: Cross-Chain Implied Rate Oracle

`ImpliedRateUpdated` on Ethereum → Reactive propagates to L2 receivers (Arbitrum, Base) for lending/collateral pricing.

#### Pattern 4: Market Stress Circuit Breaker

On `MarketStressDetected` (e.g. implied APY > 100%):

- `MochiYieldHook.pausePool(poolId)`
- Alert webhook / Telegram
- Auto-resume when conditions normalize

#### Hackathon Recommendation

Implement **Pattern 1** (parity auto-rebalance) or **Pattern 2** (maturity settlement) — most demo-able.

| Without Reactive | With Reactive |
|------------------|---------------|
| Hook emits events, nothing listens | Events trigger automated responses |
| Need keeper bots for arbitrage | Arbitrage executes automatically |
| Manual maturity settlement | Auto-settlement at maturity |
| Single-chain implied rate | Cross-chain rate oracle |
| Manual pause on stress | Automatic circuit breaker |

**Judge pitch:**

> "Mochi Yield uses Reactive Network to create self-healing markets. When our hook detects parity drift or market stress, Reactive Network automatically triggers corrective actions — no centralized keepers, no multisig delays."

---

## 6. Frontend Requirements

### 6.1 Design Direction

Light, dashboard-style UI (reference: workspace overview dashboards) with:

- KPI cards at top (TVL, implied APY, PT price, YT price)
- Treasury / rate chart over time
- Recent activity feed (hook + Reactive events)
- Donut / distribution charts (pool liquidity split, completed vs pending actions)
- Sidebar navigation: Overview, Markets, Portfolio, Settings

Current implementation uses a dark theme landing + dedicated pages. **Phase 2:** migrate analytics to a unified Overview dashboard matching the reference layout.

### 6.2 Pages

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| Landing | `/` | Pitch, PT vs YT, hook features, dashboard preview | Done |
| Whitepaper | `/whitepaper` | Technical narrative | Done |
| Deposit | `/deposit` | Deposit wstETH, view positions, maturity countdown | Done (mock data) |
| Markets | `/markets` | PT/YT pool cards, fee decay, parity alert | Done (mock data) |
| Analytics | `/analytics` | Live hook event feed, implied rate, fee curve | Done (mock data) |
| Overview (planned) | `/overview` | Unified dashboard — KPIs, charts, activity | Not started |

### 6.3 Key Components

| Component | Data Source | Notes |
|-----------|-------------|-------|
| `ImpliedRateGauge` | `lastImpliedAPY`, `lastPTPrice` | APY % with color coding |
| `FeeDecayVisualizer` | `calculateFeeForMaturity()` | Recharts line chart |
| `ParityDriftAlert` | `lastPTPrice`, `lastYTPrice`, `underlyingPrice` | Alert when drift > 5% |
| `HookEventFeed` | Contract events via viem `watchContractEvent` | Currently mocked |
| `MaturityCountdown` | `vault.maturity()` | Live countdown |
| `DepositForm` | `vault.deposit()`, ERC20 approve | Wallet-gated |
| `PoolCard` | Pool state + hook fee | PT and YT pools |

### 6.4 Wallet & Chain Support

- wagmi + viem
- Chains: Anvil (local), Sepolia, Mainnet
- Connectors: MetaMask, injected

### 6.5 Contract Integration Checklist

- [ ] Update `src/lib/contracts.ts` with deployed addresses
- [ ] Read vault state (maturity, TVL, user balances)
- [ ] Subscribe to hook events for live feed
- [ ] Wire deposit flow (approve + deposit)
- [ ] Display Reactive callback status in activity feed

---

## 7. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ETHEREUM (or Sepolia)                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │ YieldVault  │    │  PT/WETH    │    │       YT/WETH           │  │
│  │  (wstETH)   │    │   Pool      │    │        Pool             │  │
│  └─────────────┘    └──────┬──────┘    └───────────┬─────────────┘  │
│                            │                       │                 │
│                            └───────────┬───────────┘                 │
│                                        ▼                             │
│                            ┌───────────────────────┐                 │
│                            │   MochiYieldHook      │                 │
│                            │   beforeSwap / afterSwap                 │
│                            └───────────┬───────────┘                 │
│                                        │                             │
│              Events: ImpliedRateUpdated, FeeAdjustedForMaturity,     │
│                      ParityDriftDetected, SwapRejectedNegativeYield, │
│                      MarketStressDetected                           │
└────────────────────────────────────────┼────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       REACTIVE NETWORK                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  MochiReactiveKeeper                                         │   │
│  │  - Subscribed to ParityDriftDetected / ImpliedRateUpdated    │   │
│  │  - Triggers callbacks: arbitrage, settlement, circuit breaker│   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────┘
                                         │
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                    ┌──────────┐   ┌──────────┐   ┌──────────┐
                    │ Arbitrage│   │ Maturity │   │ Cross-   │
                    │ Router   │   │ Settler  │   │ Chain    │
                    │          │   │          │   │ Oracle   │
                    └──────────┘   └──────────┘   └──────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│  wagmi ──► contracts ──► event subscriptions ──► dashboard UI        │
└─────────────────────────────────────────────────────────────────────┘
```

### Contract Inventory

| Contract | Path | Status |
|----------|------|--------|
| `MochiYieldHook.sol` | `contracts/src/hook/` | Implemented, tested |
| `YieldVault.sol` | `contracts/src/vault/` | Implemented, tested |
| `PTToken.sol` | `contracts/src/tokens/` | Implemented, tested |
| `YTToken.sol` | `contracts/src/tokens/` | Implemented, tested |
| `MockWstETH.sol` | `contracts/src/mocks/` | Implemented |
| `MochiReactiveKeeper.sol` | `contracts/src/reactive/` | Planned |
| `ArbitrageRouter.sol` | `contracts/src/reactive/` | Planned |

### Hook Permissions

```
BEFORE_SWAP_FLAG | AFTER_SWAP_FLAG
```

---

## 8. On-Chain Events (Integration Contract)

```solidity
event ImpliedRateUpdated(uint256 maturity, int256 impliedAPY, uint256 ptPrice, uint256 timeToMaturity);
event FeeAdjustedForMaturity(PoolId poolId, uint256 timeToMaturity, uint256 newFeeBps);
event ParityDriftDetected(uint256 ptPrice, uint256 ytPrice, uint256 underlyingPrice, uint256 driftBps, bool isOverValued);
event SwapRejectedNegativeYield(PoolId poolId, address swapper, int256 impliedAPY);
event MarketStressDetected(uint256 timestamp, string reason);
event Deposited(address indexed user, uint256 underlyingAmount, uint256 ptMinted, uint256 ytMinted);
event Redeemed(address indexed user, uint256 ptBurned, uint256 underlyingReturned);
```

Frontend and Reactive both subscribe to these events.

---

## 9. Demo Script (Hackathon)

### Act 1: Deposit & Split (2 min)

1. Connect wallet on Deposit page
2. Deposit 1 wstETH → receive 1 PT + 1 YT
3. Explain PT = principal, YT = yield speculation

### Act 2: Markets & Hook Intelligence (3 min)

4. Navigate to Markets — show implied APY gauge (~12.4%)
5. Show fee decay curve (0.42% at 28 days to maturity)
6. Show parity in equilibrium (PT + YT ≈ underlying)

### Act 3: Parity Drift & Reactive (3 min)

7. Execute trades that push PT price up (create drift)
8. `ParityDriftDetected` fires — visible in Analytics event feed
9. Show Reactive Network detecting event (explorer / logs)
10. Arbitrage auto-executes — parity restored
11. Pitch: "The protocol heals itself. No keeper bots."

### Act 4: Judge Q&A Hooks

- **Why v4?** Cross-pool invariants in one atomic hook — v3 cannot do this cleanly.
- **Why wstETH?** Non-rebasing simplifies 1:1 PT/YT minting math.
- **Why Reactive?** Events → actions. Self-maintaining infrastructure.

---

## 10. Implementation Phases

### Phase 1 — Core Protocol ✅

- [x] Token contracts (PT, YT)
- [x] YieldVault
- [x] MochiYieldHook (3 layers)
- [x] Foundry tests
- [x] Basic deploy script

### Phase 2 — Frontend MVP ✅

- [x] Next.js app with wagmi
- [x] Landing, deposit, markets, analytics pages
- [x] Hook visualization components
- [x] Mock data for demo

### Phase 3 — Deploy & Wire (Current)

- [ ] Deploy to Sepolia / Anvil demo
- [ ] Update contract addresses in frontend
- [ ] Live event subscriptions
- [ ] End-to-end deposit on testnet

### Phase 4 — Reactive Integration

- [ ] `MochiReactiveKeeper.sol`
- [ ] Subscribe to `ParityDriftDetected`
- [ ] `ArbitrageRouter.executeParity()` callback
- [ ] Show Reactive tx in frontend activity feed

### Phase 5 — Polish

- [ ] Unified Overview dashboard (KPI layout)
- [ ] Maturity auto-settlement (Pattern 2)
- [ ] Demo video / slide deck
- [ ] Circuit breaker (Pattern 4) if time permits

---

## 11. Success Metrics

| Metric | Target (Hackathon) |
|--------|-------------------|
| Tests passing | 100% (currently 41+) |
| Hook layers demonstrated live | 3/3 |
| Reactive callback demonstrated | 1+ pattern |
| Frontend pages functional | 4+ |
| End-to-end deposit on testnet | Yes |
| Demo under 10 minutes | Yes |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hook address mining fails | Use v4-template `HookMiner` script |
| Reactive integration too complex | Ship Pattern 1 only; mock callback in demo if needed |
| wstETH not on testnet | Use `MockWstETH` for demo |
| Frontend contract reads fail | Graceful fallback to mock data with "demo mode" banner |
| Implied APY edge cases | Hook tests cover negative yield rejection |

---

## 13. Open Questions

1. **Target chain for demo?** Sepolia vs Base Sepolia vs Anvil-only
2. **Reactive Network testnet availability?** Confirm subscription API before Phase 4
3. **Real wstETH integration?** Mainnet fork vs mock for hackathon
4. **Overview dashboard redesign?** Migrate from dark theme to light dashboard (reference screenshot)

---

## 14. Appendix

### A. Relationship to Existing PTYT Code

The `ptyt/` repo contains earlier Pendle-style contracts (`GenericYieldTokenization`, `PTYTAMM`). Mochi Yield is a **greenfield v4 hook architecture** — conceptual similarity (PT/YT split) but different execution layer (Uniswap v4 pools + hook vs custom AMM).

### B. File Structure

```
mochi/
├── README.md          # Quick start, architecture summary
├── prd.md             # This document
├── contracts/         # Foundry + Uniswap v4
│   └── src/
│       ├── hook/      # MochiYieldHook
│       ├── vault/     # YieldVault
│       ├── tokens/    # PT, YT
│       ├── mocks/     # MockWstETH
│       └── reactive/  # (planned) MochiReactiveKeeper
└── frontend/          # Next.js app
    └── src/
        ├── app/       # Pages
        ├── components/
        └── lib/       # wagmi, ABIs, addresses
```

### C. References

- [Uniswap v4 Template](https://github.com/Uniswap/v4-template)
- [Reactive Network Docs](https://reactive.network)
- Pendle PT/YT model (conceptual reference in `ptyt/` and `pendle-core-v2-public-main/`)

---

*This PRD supersedes informal chat specs. Update version and status as phases complete.*
