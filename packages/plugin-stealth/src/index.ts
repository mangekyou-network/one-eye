import { type Plugin } from '@elizaos/core';
import { StealthProvider } from './provider';
import { generateStealthAddress, announceTransfer, scanAnnouncements } from './actions';

const plugin: Plugin = {
    name: '@elizaos/plugin-stealth',
    version: '0.1.0',
    description: 'Plugin for Base mainnet stealth address system',
    provider: () => new StealthProvider(),
    actions: [
        generateStealthAddress,
        announceTransfer,
        scanAnnouncements
    ]
};

export default plugin;
export * from './provider';
export * from './actions'; 