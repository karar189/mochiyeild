# Mochi Reactive Integration

Pattern 1 from the PRD: auto-respond to `ParityDriftDetected` from `MochiYieldHook`.

## Architecture

```
Origin: Unichain Sepolia (1301)
  MochiYieldHook ──emit──▶ ParityDriftDetected
                                    │
                                    ▼
Reactive Lasna (5318007)
  MochiReactiveKeeper.react() ──Callback──▶
                                    │
                                    ▼
Origin: Unichain Sepolia
  ArbitrageRouter.restoreParity()
```

## Prerequisites

| Item | Value |
|------|-------|
| **Origin chain** | Unichain Sepolia (`1301`) — Mochi stack already deployed |
| **Reactive chain** | Lasna (`5318007`) — RPC `https://lasna-rpc.rnk.dev/` |
| **Callback proxy** | `0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4` (Unichain Sepolia) |
| **Origin gas** | ETH on Unichain Sepolia ([faucet](https://faucet.unichain.org)) |
| **lREACT** | Prepaid in keeper constructor + ongoing subscription fees |

### Get lREACT (Lasna testnet REACT)

Reactive Lasna uses **lREACT**. Send testnet ETH from **Sepolia** or **Base Sepolia** to a Reactive faucet:

| Network | Faucet contract |
|---------|-----------------|
| Ethereum Sepolia | `0x9b9BB25f1A81078C544C829c5EB7822d747Cf434` |
| Base Sepolia | `0x2afaFD298b23b62760711756088F75B7409f5967` |

Rate: **1 ETH → 100 lREACT** (max 5 ETH per tx). Credits arrive on Lasna to the **same wallet address**.

```bash
# Example: request lREACT for your deployer (needs Sepolia ETH)
cast send 0x9b9BB25f1A81078C544C829c5EB7822d747Cf434 \
  --rpc-url https://rpc.sepolia.org \
  --private-key $PRIVATE_KEY \
  "request(address)" $(cast wallet address $PRIVATE_KEY) \
  --value 0.01ether
```

Check balance:

```bash
cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url https://lasna-rpc.rnk.dev/
```

## Deploy (live E2E)

```bash
cp contracts/.env.example contracts/.env
# Edit contracts/.env with PRIVATE_KEY

chmod +x scripts/deploy-reactive.sh

# Check balances + deployed addresses
./scripts/deploy-reactive.sh status

# Step 1 — ArbitrageRouter on Unichain Sepolia
./scripts/deploy-reactive.sh router

# Step 2 — MochiReactiveKeeper on Lasna (needs lREACT)
./scripts/deploy-reactive.sh keeper

# Step 3 — Force parity drift event on origin chain
./scripts/deploy-reactive.sh trigger
```

Addresses are written to `contracts/deployments/mochi.json` under `"reactive"` and synced to the frontend.

## Verify E2E

After `trigger`, confirm the full pipeline:

1. **Origin** — [Uniscan](https://sepolia.uniscan.xyz): `ParityDriftDetected` on hook
2. **Lasna** — [lasna.reactscan.net](https://lasna.reactscan.net): keeper `react()` + `ParityCallbackTriggered`
3. **Origin** — `ParityRestored` on `ArbitrageRouter`

```bash
ROUTER=$(jq -r '.reactive.arbitrageRouter' contracts/deployments/mochi.json)
cast logs --from-block latest --address $ROUTER \
  --rpc-url https://sepolia.unichain.org 'ParityRestored(uint256,uint256,uint256,uint256,bool)'
```

Reactive callback delivery can take **1–3 minutes** after the origin event.

## Contracts

| Contract | Chain | Role |
|----------|-------|------|
| `MochiReactiveKeeper.sol` | Lasna | Subscribes to hook events, emits callbacks |
| `ArbitrageRouter.sol` | Unichain Sepolia | Receives callback, records drift (MVP) |

## Local testing (no Reactive)

```bash
cd mochi/contracts
forge test --match-contract ArbitrageRouterTest
```

Direct-call `restoreParity` simulates what Reactive would invoke on the origin chain.

## Blockers / limits

1. **Anvil (`31337`)** — Reactive cannot subscribe to local chains; use Unichain Sepolia.
2. **Hook address is fixed at subscribe time** — redeploying the hook requires redeploying + resubscribing the keeper.
3. **MVP router** — emits `ParityRestored` but does not execute v4 swaps yet.
4. **Deprecated Callback event** — keeper uses `emit Callback(...)` from reactive-lib; works on Lasna today.

See [Reactive Network docs](https://dev.reactive.network/reactive-contracts).
