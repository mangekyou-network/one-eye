import { type Provider } from '@elizaos/core';
import { createPublicClient, http, createWalletClient, type Hash, parseEther, type Address } from 'viem';
import { base } from 'viem/chains';
import { Contract, Wallet, JsonRpcProvider } from 'ethers';
import * as fs from 'node:fs';
import {
    type LimitOrder,
    type PoolKey,
    type CreateLimitOrderParams,
    type LimitOrderCreatedEvent,
    type LimitOrderExecutedEvent,
    STEALTH_V4_LIMIT_ORDER_ABI
} from './interfaces';

const WALLET_DATA_FILE = 'stealth_wallet_data.txt';

// Contract addresses on Base mainnet
const STEALTH_V4_LIMIT_ORDER_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual address
const ERC5564_ANNOUNCER_ADDRESS = '0x5564000000000000000000000000000000000001';
const ERC6538_REGISTRY_ADDRESS = '0x6538000000000000000000000000000000000001';

const ERC5564_ANNOUNCER_ABI = [
    'event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)',
    'function announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata) external'
];

const ERC6538_REGISTRY_ABI = [
    'function stealthMetaAddressOf(address registrant, uint256 schemeId) external view returns (bytes memory)'
];

export interface TokenInfo {
    isERC721: boolean;
    token: Address;
    value: bigint;
}

export class StealthProvider implements Provider {
    private client;
    private limitOrder;
    private announcer;
    private registry;
    private wallet: Wallet;

    constructor() {
        this.client = createPublicClient({
            chain: base,
            transport: http()
        });

        const provider = new JsonRpcProvider('https://mainnet.base.org');

        // Initialize or load existing wallet
        let walletData: string | null = null;
        if (fs.existsSync(WALLET_DATA_FILE)) {
            try {
                walletData = fs.readFileSync(WALLET_DATA_FILE, 'utf8');
                this.wallet = Wallet.fromPhrase(walletData).connect(provider);
            } catch (error) {
                console.error('Error reading wallet data:', error);
                this.wallet = Wallet.createRandom().connect(provider);
                fs.writeFileSync(WALLET_DATA_FILE, this.wallet.mnemonic?.phrase || '');
            }
        } else {
            this.wallet = Wallet.createRandom().connect(provider);
            fs.writeFileSync(WALLET_DATA_FILE, this.wallet.mnemonic?.phrase || '');
        }

        this.limitOrder = new Contract(
            STEALTH_V4_LIMIT_ORDER_ADDRESS,
            STEALTH_V4_LIMIT_ORDER_ABI,
            this.wallet
        );

        this.announcer = new Contract(
            ERC5564_ANNOUNCER_ADDRESS,
            ERC5564_ANNOUNCER_ABI,
            this.wallet
        );

        this.registry = new Contract(
            ERC6538_REGISTRY_ADDRESS,
            ERC6538_REGISTRY_ABI,
            this.wallet
        );
    }

    async generateStealthAddress(recipientPublicKey: string): Promise<{
        stealthAddress: string;
        ephemeralPubKey: string;
        viewTag: string;
        stealthCommitment: `0x${string}`;
    }> {
        // Generate ephemeral key pair
        const ephemeralKeyPair = Wallet.createRandom();

        // Compute shared secret using ECDH
        const recipientPubKeyPoint = Wallet.computeSharedSecret(
            ephemeralKeyPair.privateKey,
            recipientPublicKey
        );

        // Generate stealth address
        const stealthPrivateKey = Wallet.hashMessage(
            Buffer.concat([
                Buffer.from(recipientPubKeyPoint.slice(2), 'hex'),
                Buffer.from('stealth_address')
            ])
        );
        const stealthWallet = new Wallet(stealthPrivateKey);

        // Generate view tag (first byte of shared secret hash)
        const viewTagBuffer = Buffer.from(
            Wallet.hashMessage(
                Buffer.concat([
                    Buffer.from(recipientPubKeyPoint.slice(2), 'hex'),
                    Buffer.from('view_tag')
                ])
            ).slice(2),
            'hex'
        );

        // Generate stealth commitment
        const stealthCommitment = `0x${Buffer.from(
            Wallet.hashMessage(
                Buffer.concat([
                    Buffer.from(stealthWallet.address.slice(2), 'hex'),
                    Buffer.from(ephemeralKeyPair.publicKey.slice(2), 'hex')
                ])
            ).slice(2),
            'hex'
        ).toString('hex')}` as `0x${string}`;

        return {
            stealthAddress: stealthWallet.address,
            ephemeralPubKey: ephemeralKeyPair.publicKey,
            viewTag: '0x' + viewTagBuffer.slice(0, 1).toString('hex'),
            stealthCommitment
        };
    }

    async createLimitOrder(params: CreateLimitOrderParams): Promise<{
        orderId: Hash;
        event: LimitOrderCreatedEvent;
    }> {
        const tx = await this.limitOrder.createLimitOrder(
            params.poolKey,
            params.amountIn,
            params.minAmountOut,
            params.deadline,
            params.targetTick,
            params.stealthCommitment,
            params.schemeId,
            params.ephemeralPubKey,
            params.viewTag,
            {
                gasLimit: 500000
            }
        );

        const receipt = await tx.wait();
        const event = receipt.logs.find(
            log => log.address.toLowerCase() === STEALTH_V4_LIMIT_ORDER_ADDRESS.toLowerCase()
        );

        if (!event) {
            throw new Error('Limit order creation event not found');
        }

        const decodedEvent = this.limitOrder.interface.decodeEventLog(
            'LimitOrderCreated',
            event.data,
            event.topics
        );

        return {
            orderId: decodedEvent.orderId as Hash,
            event: {
                orderId: decodedEvent.orderId,
                tokenIn: decodedEvent.tokenIn,
                tokenOut: decodedEvent.tokenOut,
                amountIn: decodedEvent.amountIn,
                minAmountOut: decodedEvent.minAmountOut,
                deadline: decodedEvent.deadline,
                targetTick: decodedEvent.targetTick
            }
        };
    }

    async getLimitOrder(
        poolId: Hash,
        tick: number,
        index: number
    ): Promise<LimitOrder> {
        const order = await this.limitOrder.orders(poolId, tick, index);
        return {
            owner: order.owner,
            tokenIn: order.tokenIn,
            tokenOut: order.tokenOut,
            amountIn: order.amountIn,
            minAmountOut: order.minAmountOut,
            deadline: order.deadline,
            stealthCommitment: order.stealthCommitment,
            executed: order.executed
        };
    }

    async checkOrderExists(orderId: Hash): Promise<boolean> {
        return await this.limitOrder.orderExists(orderId);
    }

    async getStealthMetaAddress(
        registrant: Address,
        schemeId: number
    ): Promise<string> {
        return await this.registry.stealthMetaAddressOf(registrant, schemeId);
    }

    async scanAnnouncements(
        viewingKey: string,
        fromBlock: bigint,
        toBlock: bigint
    ): Promise<Array<{
        stealthAddress: string;
        ephemeralPubKey: string;
        metadata: string;
        blockNumber: bigint;
    }>> {
        const events = await this.client.getLogs({
            address: ERC5564_ANNOUNCER_ADDRESS,
            event: {
                type: 'event',
                name: 'Announcement',
                inputs: [
                    { type: 'uint256', name: 'schemeId', indexed: true },
                    { type: 'address', name: 'stealthAddress', indexed: true },
                    { type: 'address', name: 'caller', indexed: true },
                    { type: 'bytes', name: 'ephemeralPubKey' },
                    { type: 'bytes', name: 'metadata' }
                ]
            },
            fromBlock,
            toBlock
        });

        // Filter announcements using viewing key
        return events
            .map(event => ({
                stealthAddress: event.args.stealthAddress as string,
                ephemeralPubKey: event.args.ephemeralPubKey as string,
                metadata: event.args.metadata as string,
                blockNumber: event.blockNumber
            }))
            .filter(announcement => {
                // Verify if the announcement is for this viewing key
                const sharedSecret = Wallet.computeSharedSecret(
                    viewingKey,
                    announcement.ephemeralPubKey
                );
                const expectedViewTag = '0x' + Buffer.from(
                    Wallet.hashMessage(
                        Buffer.concat([
                            Buffer.from(sharedSecret.slice(2), 'hex'),
                            Buffer.from('view_tag')
                        ])
                    ).slice(2),
                    'hex'
                ).slice(0, 1).toString('hex');
                const actualViewTag = '0x' + Buffer.from(
                    announcement.metadata.slice(2),
                    'hex'
                ).slice(0, 1).toString('hex');
                return expectedViewTag === actualViewTag;
            });
    }

    async watchLimitOrderExecutions(
        fromBlock: bigint = 0n
    ): Promise<LimitOrderExecutedEvent[]> {
        const events = await this.client.getLogs({
            address: STEALTH_V4_LIMIT_ORDER_ADDRESS,
            event: {
                type: 'event',
                name: 'LimitOrderExecuted',
                inputs: [
                    { type: 'bytes32', name: 'orderId', indexed: true },
                    { type: 'address', name: 'executor', indexed: true },
                    { type: 'uint256', name: 'amountIn' },
                    { type: 'uint256', name: 'amountOut' }
                ]
            },
            fromBlock
        });

        return events.map(event => ({
            orderId: event.args.orderId as Hash,
            executor: event.args.executor as Address,
            amountIn: event.args.amountIn as bigint,
            amountOut: event.args.amountOut as bigint
        }));
    }

    get(): Promise<any> {
        return Promise.resolve({
            client: this.client,
            limitOrder: this.limitOrder,
            announcer: this.announcer,
            registry: this.registry
        });
    }
} 