import { type Action } from '@elizaos/core';
import { StealthProvider } from './provider';
import type { Hash, Address } from 'viem';
import type { PoolKey, CreateLimitOrderParams } from './interfaces';

export const generateStealthAddress: Action = {
    name: 'generateStealthAddress',
    description: 'Generate a stealth address and commitment for a limit order',
    parameters: {
        type: 'object',
        properties: {
            recipientPublicKey: {
                type: 'string',
                description: 'The recipient\'s public key in hex format'
            }
        },
        required: ['recipientPublicKey']
    },
    handler: async ({ recipientPublicKey }: { recipientPublicKey: string }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            return await stealthProvider.generateStealthAddress(recipientPublicKey);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to generate stealth address: ${error.message}`);
            }
            throw new Error('Failed to generate stealth address: Unknown error');
        }
    }
};

export const createLimitOrder: Action = {
    name: 'createLimitOrder',
    description: 'Create a stealth limit order on Uniswap V4',
    parameters: {
        type: 'object',
        properties: {
            poolKey: {
                type: 'object',
                description: 'The Uniswap V4 pool key',
                properties: {
                    currency0: {
                        type: 'string',
                        description: 'The address of the first token'
                    },
                    currency1: {
                        type: 'string',
                        description: 'The address of the second token'
                    },
                    fee: {
                        type: 'number',
                        description: 'The pool fee in basis points'
                    },
                    tickSpacing: {
                        type: 'number',
                        description: 'The tick spacing'
                    },
                    hooks: {
                        type: 'string',
                        description: 'The hooks contract address'
                    }
                },
                required: ['currency0', 'currency1', 'fee', 'tickSpacing', 'hooks']
            },
            amountIn: {
                type: 'string',
                description: 'The amount of input tokens'
            },
            minAmountOut: {
                type: 'string',
                description: 'The minimum amount of output tokens'
            },
            deadline: {
                type: 'string',
                description: 'The order deadline timestamp'
            },
            targetTick: {
                type: 'number',
                description: 'The target tick price'
            },
            stealthCommitment: {
                type: 'string',
                description: 'The stealth commitment'
            },
            schemeId: {
                type: 'string',
                description: 'The stealth address scheme ID'
            },
            ephemeralPubKey: {
                type: 'string',
                description: 'The ephemeral public key'
            },
            viewTag: {
                type: 'number',
                description: 'The view tag'
            }
        },
        required: [
            'poolKey',
            'amountIn',
            'minAmountOut',
            'deadline',
            'targetTick',
            'stealthCommitment',
            'schemeId',
            'ephemeralPubKey',
            'viewTag'
        ]
    },
    handler: async ({
        poolKey,
        amountIn,
        minAmountOut,
        deadline,
        targetTick,
        stealthCommitment,
        schemeId,
        ephemeralPubKey,
        viewTag
    }: {
        poolKey: PoolKey;
        amountIn: string;
        minAmountOut: string;
        deadline: string;
        targetTick: number;
        stealthCommitment: string;
        schemeId: string;
        ephemeralPubKey: string;
        viewTag: number;
    }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            const params: CreateLimitOrderParams = {
                poolKey,
                amountIn: BigInt(amountIn),
                minAmountOut: BigInt(minAmountOut),
                deadline: BigInt(deadline),
                targetTick,
                stealthCommitment: stealthCommitment as `0x${string}`,
                schemeId: BigInt(schemeId),
                ephemeralPubKey: ephemeralPubKey as `0x${string}`,
                viewTag
            };

            const result = await stealthProvider.createLimitOrder(params);
            return {
                success: true,
                orderId: result.orderId,
                event: result.event,
                message: 'Limit order created successfully'
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to create limit order: ${error.message}`);
            }
            throw new Error('Failed to create limit order: Unknown error');
        }
    }
};

export const getLimitOrder: Action = {
    name: 'getLimitOrder',
    description: 'Get a limit order by pool ID, tick, and index',
    parameters: {
        type: 'object',
        properties: {
            poolId: {
                type: 'string',
                description: 'The pool ID'
            },
            tick: {
                type: 'number',
                description: 'The tick price'
            },
            index: {
                type: 'number',
                description: 'The order index'
            }
        },
        required: ['poolId', 'tick', 'index']
    },
    handler: async ({
        poolId,
        tick,
        index
    }: {
        poolId: string;
        tick: number;
        index: number;
    }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            const order = await stealthProvider.getLimitOrder(
                poolId as Hash,
                tick,
                index
            );
            return {
                success: true,
                order,
                message: 'Limit order retrieved successfully'
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to get limit order: ${error.message}`);
            }
            throw new Error('Failed to get limit order: Unknown error');
        }
    }
};

export const watchLimitOrderExecutions: Action = {
    name: 'watchLimitOrderExecutions',
    description: 'Watch for limit order executions from a specific block',
    parameters: {
        type: 'object',
        properties: {
            fromBlock: {
                type: 'string',
                description: 'The starting block number'
            }
        },
        required: []
    },
    handler: async ({ fromBlock = '0' }: { fromBlock?: string }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            const executions = await stealthProvider.watchLimitOrderExecutions(
                BigInt(fromBlock)
            );
            return {
                success: true,
                executions,
                message: `Found ${executions.length} limit order executions`
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to watch limit order executions: ${error.message}`);
            }
            throw new Error('Failed to watch limit order executions: Unknown error');
        }
    }
};

export const announceTransfer: Action = {
    name: 'announceTransfer',
    description: 'Announce a transfer to a stealth address on Base mainnet',
    parameters: {
        type: 'object',
        properties: {
            stealthAddress: {
                type: 'string',
                description: 'The generated stealth address'
            },
            ephemeralPubKey: {
                type: 'string',
                description: 'The ephemeral public key used to generate the stealth address'
            },
            viewTag: {
                type: 'string',
                description: 'The view tag for the stealth address'
            }
        },
        required: ['stealthAddress', 'ephemeralPubKey', 'viewTag']
    },
    handler: async ({ stealthAddress, ephemeralPubKey, viewTag }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            const txHash = await stealthProvider.announceTransfer(
                stealthAddress,
                ephemeralPubKey,
                viewTag
            );
            return {
                success: true,
                transactionHash: txHash,
                message: 'Transfer announced successfully'
            };
        } catch (error) {
            throw new Error(`Failed to announce transfer: ${error.message}`);
        }
    }
};

export const registerStealthMetaAddress: Action = {
    name: 'registerStealthMetaAddress',
    description: 'Register stealth meta-address keys in the ERC-6538 registry',
    parameters: {
        type: 'object',
        properties: {
            schemeId: {
                type: 'number',
                description: 'The scheme ID (1 for secp256k1)',
                default: 1
            },
            spendingPubKey: {
                type: 'string',
                description: 'The spending public key in hex format'
            },
            viewingPubKey: {
                type: 'string',
                description: 'The viewing public key in hex format'
            }
        },
        required: ['spendingPubKey', 'viewingPubKey']
    },
    handler: async ({ schemeId, spendingPubKey, viewingPubKey }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            const txHash = await stealthProvider.registerStealthMetaAddress(
                schemeId,
                spendingPubKey,
                viewingPubKey
            );
            return {
                success: true,
                transactionHash: txHash,
                message: 'Stealth meta-address registered successfully'
            };
        } catch (error) {
            throw new Error(`Failed to register stealth meta-address: ${error.message}`);
        }
    }
};

export const getStealthMetaAddress: Action = {
    name: 'getStealthMetaAddress',
    description: 'Get the registered stealth meta-address for an account',
    parameters: {
        type: 'object',
        properties: {
            registrant: {
                type: 'string',
                description: 'The address of the registrant'
            },
            schemeId: {
                type: 'number',
                description: 'The scheme ID (1 for secp256k1)',
                default: 1
            }
        },
        required: ['registrant']
    },
    handler: async ({ registrant, schemeId = 1 }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            const metaAddress = await stealthProvider.getStealthMetaAddress(registrant, schemeId);
            return {
                success: true,
                stealthMetaAddress: metaAddress,
                message: 'Stealth meta-address retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get stealth meta-address: ${error.message}`);
        }
    }
};

export const scanAnnouncements: Action = {
    name: 'scanAnnouncements',
    description: 'Scan for stealth address announcements on Base mainnet',
    parameters: {
        type: 'object',
        properties: {
            viewingKey: {
                type: 'string',
                description: 'The viewing private key to scan for announcements'
            },
            fromBlock: {
                type: 'string',
                description: 'The starting block number to scan from'
            },
            toBlock: {
                type: 'string',
                description: 'The ending block number to scan to (or "latest")'
            }
        },
        required: ['viewingKey', 'fromBlock']
    },
    handler: async ({ viewingKey, fromBlock, toBlock = 'latest' }, { provider }) => {
        try {
            const stealthProvider = provider as StealthProvider;
            const fromBlockBigInt = BigInt(fromBlock);
            const toBlockBigInt = toBlock === 'latest'
                ? await provider.getBlockNumber()
                : BigInt(toBlock);

            const announcements = await stealthProvider.scanAnnouncements(
                viewingKey,
                fromBlockBigInt,
                toBlockBigInt
            );

            return {
                success: true,
                announcements,
                message: `Found ${announcements.length} announcements`
            };
        } catch (error) {
            throw new Error(`Failed to scan announcements: ${error.message}`);
        }
    }
}; 