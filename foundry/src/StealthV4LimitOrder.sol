// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {BaseHook} from "periphery-next/utils/BaseHook.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {IHooks} from "v4-core/interfaces/IHooks.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {TickMath} from "v4-core/libraries/TickMath.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";
import {StateLibrary} from "v4-core/libraries/StateLibrary.sol";
import "forge-std/console.sol";

interface IERC5564Announcer {
    function announce(
        uint256 schemeId,
        address stealthAddress,
        bytes memory ephemeralPubKey,
        bytes memory metadata
    ) external;
}

interface IERC6538Registry {
    function stealthMetaAddressOf(
        address registrant,
        uint256 schemeId
    ) external view returns (bytes memory);
}

contract StealthV4LimitOrder is BaseHook {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    IERC5564Announcer public immutable announcer;
    IERC6538Registry public immutable registry;

    struct LimitOrder {
        address owner;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 deadline;
        bytes32 stealthCommitment;
        bool executed;
    }

    // Pool ID => Tick => Orders
    mapping(PoolId => mapping(int24 => LimitOrder[])) public orders;
    mapping(bytes32 => bool) public orderExists;

    event LimitOrderCreated(
        bytes32 indexed orderId,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline,
        int24 targetTick
    );

    event LimitOrderExecuted(
        bytes32 indexed orderId,
        address indexed executor,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(
        IPoolManager _poolManager,
        address _announcer,
        address _registry
    ) BaseHook(_poolManager) {
        announcer = IERC5564Announcer(_announcer);
        registry = IERC6538Registry(_registry);
    }

    function validateHookAddress(
        BaseHook _this
    ) internal pure virtual override {
        Hooks.Permissions memory permissions = getHookPermissions();
        uint160 flags = uint160(address(_this));

        require(
            !permissions.beforeInitialize ||
                flags & Hooks.BEFORE_INITIALIZE_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterInitialize ||
                flags & Hooks.AFTER_INITIALIZE_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.beforeAddLiquidity ||
                flags & Hooks.BEFORE_ADD_LIQUIDITY_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterAddLiquidity ||
                flags & Hooks.AFTER_ADD_LIQUIDITY_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.beforeRemoveLiquidity ||
                flags & Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterRemoveLiquidity ||
                flags & Hooks.AFTER_REMOVE_LIQUIDITY_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.beforeSwap || flags & Hooks.BEFORE_SWAP_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterSwap || flags & Hooks.AFTER_SWAP_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.beforeDonate || flags & Hooks.BEFORE_DONATE_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterDonate || flags & Hooks.AFTER_DONATE_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.beforeSwapReturnDelta ||
                flags & Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterSwapReturnDelta ||
                flags & Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterAddLiquidityReturnDelta ||
                flags & Hooks.AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG != 0,
            "Invalid hook flags"
        );
        require(
            !permissions.afterRemoveLiquidityReturnDelta ||
                flags & Hooks.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG != 0,
            "Invalid hook flags"
        );
    }

    function getHookPermissions()
        public
        pure
        virtual
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: false,
                beforeAddLiquidity: false,
                afterAddLiquidity: false,
                beforeRemoveLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: false,
                afterSwap: true,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }

    function createLimitOrder(
        PoolKey calldata key,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline,
        int24 targetTick,
        bytes32 stealthCommitment,
        uint256 schemeId,
        bytes memory ephemeralPubKey,
        uint8 viewTag
    ) external returns (bytes32) {
        require(deadline > block.timestamp, "Deadline must be in future");

        address tokenIn = Currency.unwrap(key.currency0);
        address tokenOut = Currency.unwrap(key.currency1);

        // Transfer tokens from user
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "Transfer failed"
        );

        bytes32 orderId = keccak256(
            abi.encodePacked(
                key.toId(),
                tokenIn,
                tokenOut,
                amountIn,
                minAmountOut,
                deadline,
                targetTick,
                stealthCommitment,
                block.number
            )
        );

        require(!orderExists[orderId], "Order already exists");
        orderExists[orderId] = true;

        orders[key.toId()][targetTick].push(
            LimitOrder({
                owner: msg.sender,
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                amountIn: amountIn,
                minAmountOut: minAmountOut,
                deadline: deadline,
                stealthCommitment: stealthCommitment,
                executed: false
            })
        );

        emit LimitOrderCreated(
            orderId,
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            deadline,
            targetTick
        );

        return orderId;
    }

    function _afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) internal virtual override returns (bytes4, int128) {
        (, int24 currentTick, , ) = StateLibrary.getSlot0(
            poolManager,
            key.toId()
        );

        // Check orders at current tick
        LimitOrder[] storage ordersAtTick = orders[key.toId()][currentTick];

        for (uint256 i = 0; i < ordersAtTick.length; i++) {
            LimitOrder storage order = ordersAtTick[i];

            if (!order.executed && block.timestamp <= order.deadline) {
                _executeOrder(key, order, currentTick);
            }
        }

        return (IHooks.afterSwap.selector, 0);
    }

    function _executeOrder(
        PoolKey calldata key,
        LimitOrder storage order,
        int24 currentTick
    ) internal {
        // Prepare swap parameters
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: true, // Assuming token0 to token1 swap
            amountSpecified: int256(order.amountIn),
            sqrtPriceLimitX96: TickMath.getSqrtPriceAtTick(currentTick)
        });

        // Execute the swap through the pool manager
        BalanceDelta delta = abi.decode(
            poolManager.unlock(
                abi.encodeCall(this._handleSwap, (key, params, ""))
            ),
            (BalanceDelta)
        );

        // Mark order as executed
        order.executed = true;
        emit LimitOrderExecuted(
            keccak256(
                abi.encodePacked(
                    order.owner,
                    order.tokenIn,
                    order.amountIn,
                    block.number
                )
            ),
            msg.sender,
            uint256(int256(delta.amount0())),
            uint256(int256(delta.amount1()))
        );
    }

    function _handleSwap(
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes memory
    ) external returns (BalanceDelta) {
        return poolManager.swap(key, params, "");
    }
}
