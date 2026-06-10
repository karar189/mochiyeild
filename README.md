# Mochi Yield

**Time-Aware Fixed Income Markets on Uniswap v4**

## One-Line Pitch

The first Uniswap v4 hook that understands yield curves — enforcing implied rate bounds, time-to-maturity fee decay, and cross-pool PT/YT parity in a single atomic hook.

---

## What Makes This Different

| Generic Dynamic Fee Hook | Mochi Yield |
|--------------------------|-------------|
| "Fee changes on volume" | "Fee decays as PT approaches maturity because volatility decreases" |
| Any AMM can do this | **Only v4 can enforce cross-pool invariants atomically** |
| No fixed-income logic | **Implied APY bounds prevent negative yields on-chain** |

---

## Architecture

```
User
  │
  ├─► Deposit wstETH ─────► YieldVault.sol
  │                              │
  │                    ┌────────┴────────┐
  │                    ▼                 ▼
  │                 PT Token          YT Token
  │                    │                 │
  │         ┌──────────┴──────┐   ┌──────┴──────────┐
  │         ▼                 ▼   ▼                 ▼
  │    PT/WETH Pool      YT/WETH Pool
  │         │                 │
  │         └────────┬────────┘
  │                  ▼
  │         MochiYieldHook.sol (single hook, multiple pools)
  │                  │
  │    ┌─────────────┼─────────────┐
  │    ▼             ▼             ▼
  │ Implied Rate  Fee Decay    Parity Oracle
  │ Sentinel      Engine       + Events
```

---

## Contracts

| Contract | Description |
|----------|-------------|
| `MochiYieldHook.sol` | Main v4 hook with implied rate, fee decay, parity oracle |
| `YieldVault.sol` | Deposit underlying → mint PT + YT |
| `PTToken.sol` | Principal Token (fixed income exposure) |
| `YTToken.sol` | Yield Token (yield speculation) |
| `MockWstETH.sol` | Test mock for wstETH |

---

## Hook Features

### Layer 1: Implied Rate Sentinel
- Calculates implied APY from PT price and time-to-maturity
- Emits alerts when implied rate goes negative or extreme
- Prevents economically irrational market states

### Layer 2: Maturity Fee Decay
- Fees decrease as maturity approaches (lower volatility = lower LP risk)
- Far from maturity (>90 days): 1% fee
- Near maturity (<7 days): 0.05% fee
- Smooth linear interpolation between

### Layer 3: Cross-Pool Parity Oracle
- Monitors PT + YT combined value vs underlying
- Emits `ParityDriftDetected` when drift exceeds threshold
- Enables Reactive Network integration for auto-arbitrage

---

## Quick Start

### Contracts

```bash
cd mochi/contracts

# Install dependencies
forge install

# Run tests
forge test

# Build
forge build
```

### Frontend

```bash
cd mochi/frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

The frontend runs on `http://localhost:3000` and includes:
- **Home** - Landing page with PT/YT explanation
- **Deposit** - Deposit wstETH to mint PT + YT
- **Markets** - Trade PT/YT with live fee visualization
- **Analytics** - Real-time hook event monitoring

---

## Test Results

```
43 tests passed, 0 failed
- 13 MochiYieldHook tests
- 11 PTToken tests  
- 11 YieldVault tests
- 8 template utility tests
```

---

## Events (for Frontend/Reactive Integration)

```solidity
event ImpliedRateUpdated(uint256 maturity, int256 impliedAPY, uint256 ptPrice, uint256 timeToMaturity);
event FeeAdjustedForMaturity(PoolId poolId, uint256 timeToMaturity, uint256 newFeeBps);
event ParityDriftDetected(uint256 ptPrice, uint256 ytPrice, uint256 underlyingPrice, uint256 driftBps, bool isOverValued);
event SwapRejectedNegativeYield(PoolId poolId, address swapper, int256 impliedAPY);
event MarketStressDetected(uint256 timestamp, string reason);
```

---

## Next Steps

1. ~~**Deploy Scripts** - Hook address mining and pool initialization~~ (basic done)
2. ~~**Frontend** - Next.js app with event feed and metrics~~ Done
3. **Reactive Network** - Auto-arbitrage on parity drift
4. **Testnet Deploy** - Deploy to Sepolia/Base Sepolia
5. **Contract Integration** - Wire frontend to real contracts

---

## License

MIT
