import { type Action } from '@elizaos/core';
import { StealthProvider } from './provider';

export const generateStealthAddress: Action = {
    name: 'generateStealthAddress',
    description: 'Generate a stealth address for a recipient',
    parameters: {
        type: 'object',
        properties: {
            recipientPublicKey: {
                type: 'string',
                description: 'The recipient\'s public key'
            }
        },
        required: ['recipientPublicKey']
    },
    handler: async ({ recipientPublicKey }, { provider }) => {
        const stealthProvider = provider as StealthProvider;
        return await stealthProvider.generateStealthAddress(recipientPublicKey);
    }
};

export const announceTransfer: Action = {
    name: 'announceTransfer',
    description: 'Announce a transfer to a stealth address',
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
        const stealthProvider = provider as StealthProvider;
        return await stealthProvider.announceTransfer(stealthAddress, ephemeralPubKey, viewTag);
    }
};

export const scanAnnouncements: Action = {
    name: 'scanAnnouncements',
    description: 'Scan for stealth address announcements',
    parameters: {
        type: 'object',
        properties: {
            viewingKey: {
                type: 'string',
                description: 'The viewing key to scan for announcements'
            },
            fromBlock: {
                type: 'string',
                description: 'The starting block number to scan from'
            },
            toBlock: {
                type: 'string',
                description: 'The ending block number to scan to'
            }
        },
        required: ['viewingKey', 'fromBlock', 'toBlock']
    },
    handler: async ({ viewingKey, fromBlock, toBlock }, { provider }) => {
        const stealthProvider = provider as StealthProvider;
        return await stealthProvider.scanAnnouncements(
            viewingKey,
            BigInt(fromBlock),
            BigInt(toBlock)
        );
    }
}; 