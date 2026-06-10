// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";

import {Deployers} from "test/utils/Deployers.sol";

import {MochiYieldHook} from "../src/hook/MochiYieldHook.sol";
import {PTToken} from "../src/tokens/PTToken.sol";
import {YTToken} from "../src/tokens/YTToken.sol";
import {MockWstETH} from "../src/mocks/MockWstETH.sol";
import {YieldVault} from "../src/vault/YieldVault.sol";

struct MochiDeployment {
    MockWstETH wstETH;
    MockERC20 weth;
    YieldVault vault;
    PTToken pt;
    YTToken yt;
    MochiYieldHook hook;
    uint256 maturity;
}

/// @notice Full Mochi stack deployment: tokens, vault, hook, pools, liquidity
contract DeployScript is Script, Deployers {
    using CurrencyLibrary for Currency;
    using PoolIdLibrary for PoolKey;

    uint256 constant MATURITY_DURATION = 30 days;
    uint24 constant LP_FEE = 3000;
    int24 constant TICK_SPACING = 60;

    function _etch(address target, bytes memory bytecode) internal override {
        if (block.chainid == 31337) {
            vm.rpc("anvil_setCode", string.concat('["', vm.toString(target), '",', '"', vm.toString(bytecode), '"]'));
        } else {
            revert("DeployScript: unsupported network for etch");
        }
    }

    function run() external {
        // Permit2 is etched via vm.rpc — must run outside broadcast
        deployPermit2();

        vm.startBroadcast();
        deployPoolManager();
        deployPositionManager();
        deployRouter();

        MochiDeployment memory d = _deployCore();
        PoolKey memory ptPoolKey = _buildPoolKey(address(d.weth), address(d.pt), d.hook);
        PoolKey memory ytPoolKey = _buildPoolKey(address(d.weth), address(d.yt), d.hook);

        _fundAndDeposit(d);
        _initPoolAndAddLiquidity(ptPoolKey, 500e18, 500e18);
        _initPoolAndAddLiquidity(ytPoolKey, 500e18, 500e18);
        _registerPools(d, ptPoolKey, ytPoolKey);
        _approveRouters(d);
        vm.stopBroadcast();

        _writeDeploymentJson(d, ptPoolKey);
        _appendYtPoolJson(d, ytPoolKey);
        _logDeployment(d, ptPoolKey, ytPoolKey);
    }

    function _deployCore() internal returns (MochiDeployment memory d) {
        address deployer = msg.sender;
        d.maturity = block.timestamp + MATURITY_DURATION;

        d.wstETH = new MockWstETH();
        d.weth = new MockERC20("Wrapped Ether", "WETH", 18);

        address vaultAddr = vm.computeCreateAddress(deployer, vm.getNonce(deployer) + 2);
        d.pt = new PTToken("PT wstETH", "PT-wstETH", d.maturity, vaultAddr);
        d.yt = new YTToken("YT wstETH", "YT-wstETH", d.maturity, vaultAddr);
        d.vault = new YieldVault(address(d.wstETH), address(d.pt), address(d.yt));
        require(address(d.vault) == vaultAddr, "DeployScript: vault address mismatch");

        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG);
        bytes memory constructorArgs = abi.encode(poolManager);
        (address hookAddr, bytes32 salt) =
            HookMiner.find(CREATE2_FACTORY, flags, type(MochiYieldHook).creationCode, constructorArgs);
        d.hook = new MochiYieldHook{salt: salt}(poolManager);
        require(address(d.hook) == hookAddr, "DeployScript: hook address mismatch");
    }

    function _fundAndDeposit(MochiDeployment memory d) internal {
        address deployer = msg.sender;
        d.wstETH.mint(deployer, 10_000e18);
        d.weth.mint(deployer, 10_000e18);
        d.wstETH.approve(address(d.vault), 5_000e18);
        d.vault.deposit(5_000e18);
    }

    function _registerPools(MochiDeployment memory d, PoolKey memory ptPoolKey, PoolKey memory ytPoolKey) internal {
        d.hook.registerPool(ptPoolKey, true, address(d.pt), address(d.yt), d.maturity, address(d.wstETH));
        d.hook.registerPool(ytPoolKey, false, address(d.pt), address(d.yt), d.maturity, address(d.wstETH));
    }

    function _approveRouters(MochiDeployment memory d) internal {
        d.weth.approve(address(swapRouter), type(uint256).max);
        d.pt.approve(address(swapRouter), type(uint256).max);
        d.yt.approve(address(swapRouter), type(uint256).max);
        d.wstETH.approve(address(swapRouter), type(uint256).max);
    }

    function _buildPoolKey(address tokenA, address tokenB, MochiYieldHook hook)
        internal
        pure
        returns (PoolKey memory key)
    {
        if (tokenA > tokenB) (tokenA, tokenB) = (tokenB, tokenA);
        key = PoolKey({
            currency0: Currency.wrap(tokenA),
            currency1: Currency.wrap(tokenB),
            fee: LP_FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(hook))
        });
    }

    function _initPoolAndAddLiquidity(PoolKey memory poolKey, uint256 amount0, uint256 amount1) internal {
        bytes memory hookData = Constants.ZERO_BYTES;
        uint160 startingPrice = Constants.SQRT_PRICE_1_1;

        int24 currentTick = TickMath.getTickAtSqrtPrice(startingPrice);
        int24 tickLower = _truncateTickSpacing(currentTick - 750 * TICK_SPACING, TICK_SPACING);
        int24 tickUpper = _truncateTickSpacing(currentTick + 750 * TICK_SPACING, TICK_SPACING);

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            amount0,
            amount1
        );

        (bytes memory actions, bytes[] memory mintParams) = _mintLiquidityParams(
            poolKey, tickLower, tickUpper, liquidity, amount0 + 1, amount1 + 1, msg.sender, hookData
        );

        bytes[] memory params = new bytes[](2);
        params[0] = abi.encodeWithSelector(positionManager.initializePool.selector, poolKey, startingPrice, hookData);
        params[1] = abi.encodeWithSelector(
            positionManager.modifyLiquidities.selector, abi.encode(actions, mintParams), block.timestamp + 3600
        );

        _approveForLiquidity(poolKey);
        positionManager.multicall(params);
    }

    function _approveForLiquidity(PoolKey memory poolKey) internal {
        address token0 = Currency.unwrap(poolKey.currency0);
        address token1 = Currency.unwrap(poolKey.currency1);

        if (token0 != address(0)) {
            MockERC20(token0).approve(address(permit2), type(uint256).max);
            permit2.approve(token0, address(positionManager), type(uint160).max, type(uint48).max);
        }
        if (token1 != address(0)) {
            MockERC20(token1).approve(address(permit2), type(uint256).max);
            permit2.approve(token1, address(positionManager), type(uint160).max, type(uint48).max);
        }
    }

    function _mintLiquidityParams(
        PoolKey memory poolKey,
        int24 tickLower,
        int24 tickUpper,
        uint256 liquidity,
        uint256 amount0Max,
        uint256 amount1Max,
        address recipient,
        bytes memory hookData
    ) internal pure returns (bytes memory actions, bytes[] memory params) {
        actions = abi.encodePacked(
            uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR), uint8(Actions.SWEEP), uint8(Actions.SWEEP)
        );

        params = new bytes[](4);
        params[0] =
            abi.encode(poolKey, tickLower, tickUpper, liquidity, amount0Max, amount1Max, recipient, hookData);
        params[1] = abi.encode(poolKey.currency0, poolKey.currency1);
        params[2] = abi.encode(poolKey.currency0, recipient);
        params[3] = abi.encode(poolKey.currency1, recipient);
    }

    function _truncateTickSpacing(int24 tick, int24 tickSpacing) internal pure returns (int24) {
        return (tick / tickSpacing) * tickSpacing;
    }

    function _writeDeploymentJson(MochiDeployment memory d, PoolKey memory ptPoolKey) internal {
        bool ptIsCurrency0 = Currency.unwrap(ptPoolKey.currency0) == address(d.pt);

        string memory json = string.concat(
            '{\n  "chainId": ',
            vm.toString(block.chainid),
            ',\n  "addresses": {\n    "underlying": "',
            vm.toString(address(d.wstETH)),
            '",\n    "vault": "',
            vm.toString(address(d.vault)),
            '",\n    "ptToken": "',
            vm.toString(address(d.pt)),
            '",\n    "ytToken": "',
            vm.toString(address(d.yt)),
            '",\n    "hook": "',
            vm.toString(address(d.hook)),
            '",\n    "weth": "',
            vm.toString(address(d.weth)),
            '",\n    "swapRouter": "',
            vm.toString(address(swapRouter)),
            '",\n    "poolManager": "',
            vm.toString(address(poolManager)),
            '",\n    "positionManager": "',
            vm.toString(address(positionManager)),
            '",\n    "permit2": "',
            vm.toString(address(permit2)),
            '"\n  },\n  "pools": {\n    "pt": ',
            _poolJson(ptPoolKey, ptIsCurrency0, address(d.pt)),
            ',\n    "yt": PLACEHOLDER\n  },\n  "maturity": ',
            vm.toString(d.maturity),
            '\n}\n'
        );

        vm.writeFile("deployments/mochi.json", json);
    }

    function _appendYtPoolJson(MochiDeployment memory d, PoolKey memory ytPoolKey) internal {
        string memory current = vm.readFile("deployments/mochi.json");
        bool ytIsCurrency0 = Currency.unwrap(ytPoolKey.currency0) == address(d.yt);
        string memory ytSection = _poolJson(ytPoolKey, ytIsCurrency0, address(d.yt));
        string memory updated = vm.replace(current, "PLACEHOLDER", ytSection);
        vm.writeFile("deployments/mochi.json", updated);
    }

    function _poolJson(PoolKey memory poolKey, bool tokenIsCurrency0, address tradeToken)
        internal
        view
        returns (string memory)
    {
        return string.concat(
            '{\n      "poolId": "',
            vm.toString(PoolId.unwrap(poolKey.toId())),
            '",\n      "currency0": "',
            vm.toString(Currency.unwrap(poolKey.currency0)),
            '",\n      "currency1": "',
            vm.toString(Currency.unwrap(poolKey.currency1)),
            '",\n      "fee": ',
            vm.toString(LP_FEE),
            ',\n      "tickSpacing": ',
            vm.toString(TICK_SPACING),
            ',\n      "hooks": "',
            vm.toString(address(poolKey.hooks)),
            '",\n      "tokenIsCurrency0": ',
            tokenIsCurrency0 ? "true" : "false",
            ',\n      "tradeToken": "',
            vm.toString(tradeToken),
            '"\n    }'
        );
    }

    function _logDeployment(MochiDeployment memory d, PoolKey memory ptPoolKey, PoolKey memory ytPoolKey) internal view {
        console2.log("=== Mochi Deployment Complete ===");
        console2.log("underlying:", address(d.wstETH));
        console2.log("vault:", address(d.vault));
        console2.log("ptToken:", address(d.pt));
        console2.log("ytToken:", address(d.yt));
        console2.log("hook:", address(d.hook));
        console2.log("weth:", address(d.weth));
        console2.log("swapRouter:", address(swapRouter));
        console2.log("ptPoolId:", vm.toString(PoolId.unwrap(ptPoolKey.toId())));
        console2.log("ytPoolId:", vm.toString(PoolId.unwrap(ytPoolKey.toId())));
    }
}
