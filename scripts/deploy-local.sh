#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Always target local Anvil — do NOT inherit RPC_URL / ORIGIN_RPC from the shell
ANVIL_RPC_URL="${ANVIL_RPC_URL:-http://127.0.0.1:8545}"
ANVIL_KEY="${ANVIL_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

if ! command -v cast >/dev/null 2>&1; then
  echo "Error: foundry (cast) is not installed. Run: foundryup"
  exit 1
fi

if ! chain_id="$(cast chain-id --rpc-url "$ANVIL_RPC_URL" 2>/dev/null)"; then
  cat <<EOF
Error: nothing is listening on $ANVIL_RPC_URL

Start plain Anvil first (no --fork-url):
  anvil

Then rerun:
  ./scripts/deploy-local.sh
EOF
  exit 1
fi

if [[ "$chain_id" != "31337" ]]; then
  cat <<EOF
Error: expected plain Anvil on chain 31337, got chain $chain_id on $ANVIL_RPC_URL

Local deploy does NOT work with a forked Anvil (e.g. anvil --fork-url https://sepolia.unichain.org).

Fix:
  pkill anvil
  anvil
  ./scripts/deploy-local.sh
EOF
  exit 1
fi

block="$(cast block-number --rpc-url "$ANVIL_RPC_URL" 2>/dev/null || echo 0)"
if [[ "$block" != "0" ]]; then
  cat <<EOF
Error: Anvil already has state from a previous deploy (block $block).

Redeploying on the same Anvil causes CREATE2 collisions (CreateCollision).

Fix — restart Anvil to wipe state:
  1. Ctrl+C in the terminal running \`anvil\`
  2. anvil
  3. ./scripts/deploy-local.sh
EOF
  exit 1
fi

# Avoid forge picking up testnet fork URLs from the shell or .env
unset ETH_RPC_URL FOUNDRY_ETH_RPC_URL RPC_URL ORIGIN_RPC

echo "==> Etching Permit2 on Anvil ($ANVIL_RPC_URL)"
cd "$ROOT/contracts"
forge script script/EtchPermit2.s.sol:EtchPermit2Script --rpc-url "$ANVIL_RPC_URL"

echo "==> Deploying Mochi stack"
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url "$ANVIL_RPC_URL" \
  --broadcast \
  --private-key "$ANVIL_KEY"

DEPLOYMENT="$ROOT/contracts/deployments/mochi.json"
cp "$DEPLOYMENT" "$ROOT/deployments/mochi.json"
cp "$DEPLOYMENT" "$ROOT/frontend/src/lib/deployments.json"
echo "==> Synced deployment to:"
echo "    - deployments/mochi.json"
echo "    - frontend/src/lib/deployments.json"
