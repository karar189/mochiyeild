#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS="$ROOT/contracts"

# Load env: contracts/.env first, then frontend/.env as fallback
if [[ -f "$CONTRACTS/.env" ]]; then
  set -a; source "$CONTRACTS/.env"; set +a
elif [[ -f "$ROOT/frontend/.env" ]]; then
  set -a; source "$ROOT/frontend/.env"; set +a
fi

: "${PRIVATE_KEY:?Set PRIVATE_KEY in contracts/.env or frontend/.env}"

ORIGIN_RPC="${ORIGIN_RPC:-https://sepolia.unichain.org}"
REACTIVE_RPC="${REACTIVE_RPC:-https://lasna-rpc.rnk.dev/}"
ORIGIN_CHAIN_ID="${ORIGIN_CHAIN_ID:-1301}"
REACTIVE_CHAIN_ID="${REACTIVE_CHAIN_ID:-5318007}"

REACTIVE_CALLBACK_PROXY="${REACTIVE_CALLBACK_PROXY:-0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4}"

sync_deployments() {
  cp "$CONTRACTS/deployments/mochi.json" "$ROOT/frontend/src/lib/deployments.json"
  echo "==> Synced deployments/mochi.json -> frontend/src/lib/deployments.json"
}

latest_broadcast_address() {
  local script_name="$1"
  local chain_id="$2"
  python3 -c "
import json, sys
data = json.load(open('$CONTRACTS/broadcast/${script_name}/${chain_id}/run-latest.json'))
addrs = [t['contractAddress'] for t in data.get('transactions', []) if t.get('contractAddress')]
print(addrs[-1] if addrs else '')
"
}

patch_reactive_router() {
  local router="$1"
  python3 -c "
import json
path = '$CONTRACTS/deployments/mochi.json'
with open(path) as f:
    data = json.load(f)
data['reactive'] = {
    'callbackProxy': '$REACTIVE_CALLBACK_PROXY',
    'arbitrageRouter': '$router',
    'lasnaChainId': 5318007,
}
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
"
}

patch_reactive_keeper() {
  local keeper="$1"
  python3 -c "
import json
path = '$CONTRACTS/deployments/mochi.json'
with open(path) as f:
    data = json.load(f)
data.setdefault('reactive', {})['keeper'] = '$keeper'
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
"
}

cmd="${1:-all}"

case "$cmd" in
  router)
    echo "==> Deploy ArbitrageRouter on origin chain ($ORIGIN_CHAIN_ID)"
    cd "$CONTRACTS"
    forge script script/reactive/DeployArbitrageRouter.s.sol:DeployArbitrageRouterScript \
      --rpc-url "$ORIGIN_RPC" \
      --private-key "$PRIVATE_KEY" \
      --broadcast \
      --chain-id "$ORIGIN_CHAIN_ID"
    ROUTER="$(latest_broadcast_address DeployArbitrageRouter.s.sol "$ORIGIN_CHAIN_ID")"
    patch_reactive_router "$ROUTER"
    sync_deployments
    ;;

  keeper)
    echo "==> Deploy MochiReactiveKeeper on Lasna ($REACTIVE_CHAIN_ID)"
    echo "    Requires lREACT balance on Lasna — see reactive/README.md"
    cd "$CONTRACTS"
    forge script script/reactive/DeployMochiReactiveKeeper.s.sol:DeployMochiReactiveKeeperScript \
      --rpc-url "$REACTIVE_RPC" \
      --private-key "$PRIVATE_KEY" \
      --broadcast \
      --chain-id "$REACTIVE_CHAIN_ID"
    KEEPER="$(latest_broadcast_address DeployMochiReactiveKeeper.s.sol "$REACTIVE_CHAIN_ID")"
    patch_reactive_keeper "$KEEPER"
    sync_deployments
    ;;

  trigger)
    echo "==> Trigger ParityDriftDetected on origin chain"
    cd "$CONTRACTS"
    forge script script/reactive/TriggerParityDrift.s.sol:TriggerParityDriftScript \
      --rpc-url "$ORIGIN_RPC" \
      --private-key "$PRIVATE_KEY" \
      --broadcast \
      --chain-id "$ORIGIN_CHAIN_ID"
    ;;

  status)
    DEPLOYER="$(cast wallet address "$PRIVATE_KEY")"
    echo "Deployer: $DEPLOYER"
    echo ""
    echo "Origin ($ORIGIN_CHAIN_ID) ETH:" \
      "$(cast balance "$DEPLOYER" --rpc-url "$ORIGIN_RPC" | xargs cast from-wei)"
    echo "Lasna ($REACTIVE_CHAIN_ID) lREACT:" \
      "$(cast balance "$DEPLOYER" --rpc-url "$REACTIVE_RPC" | xargs cast from-wei)"
    echo ""
    if [[ -f "$CONTRACTS/deployments/mochi.json" ]]; then
      echo "Deployed reactive contracts:"
      python3 -c "import json; print(json.dumps(json.load(open('$CONTRACTS/deployments/mochi.json')).get('reactive'), indent=2))"
    fi
    ;;

  all)
    "$0" router
    echo ""
    echo "Next: fund Lasna with lREACT, then run: $0 keeper"
    ;;

  *)
    echo "Usage: $0 {router|keeper|trigger|status|all}"
    exit 1
    ;;
esac
