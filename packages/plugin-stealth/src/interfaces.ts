import { type Address, type Hash } from 'viem';

export interface LimitOrder {
    owner: Address;
    tokenIn: Address;
    tokenOut: Address;
    amountIn: bigint;
    minAmountOut: bigint;
    deadline: bigint;
    stealthCommitment: `0x${string}`;
    executed: boolean;
}

export interface PoolKey {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
}

export const STEALTH_V4_LIMIT_ORDER_ABI = [
    'function createLimitOrder(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, uint256 amountIn, uint256 minAmountOut, uint256 deadline, int24 targetTick, bytes32 stealthCommitment, uint256 schemeId, bytes memory ephemeralPubKey, uint8 viewTag) external returns (bytes32)',
    'function orders(bytes32 poolId, int24 tick, uint256 index) external view returns (address owner, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, uint256 deadline, bytes32 stealthCommitment, bool executed)',
    'function orderExists(bytes32 orderId) external view returns (bool)',
    'event LimitOrderCreated(bytes32 indexed orderId, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 minAmountOut, uint256 deadline, int24 targetTick)',
    'event LimitOrderExecuted(bytes32 indexed orderId, address indexed executor, uint256 amountIn, uint256 amountOut)'
] as const;

export interface CreateLimitOrderParams {
    poolKey: PoolKey;
    amountIn: bigint;
    minAmountOut: bigint;
    deadline: bigint;
    targetTick: number;
    stealthCommitment: `0x${string}`;
    schemeId: bigint;
    ephemeralPubKey: `0x${string}`;
    viewTag: number;
}

export interface LimitOrderCreatedEvent {
    orderId: Hash;
    tokenIn: Address;
    tokenOut: Address;
    amountIn: bigint;
    minAmountOut: bigint;
    deadline: bigint;
    targetTick: number;
}

export interface LimitOrderExecutedEvent {
    orderId: Hash;
    executor: Address;
    amountIn: bigint;
    amountOut: bigint;
} 