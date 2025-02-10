import type { Plugin } from '@elizaos/core';
import { StealthProvider } from './provider';
import {
    generateStealthAddressAction,
    createLimitOrderAction,
    getLimitOrderAction,
    watchLimitOrderExecutionsAction
} from './actions';

// Initial banner
console.log("\n┌════════════════════════════════════════┐");
console.log("│          STEALTH PLUGIN                │");
console.log("├────────────────────────────────────────┤");
console.log("│  Initializing Stealth Plugin...        │");
console.log("│  Version: 0.1.0                        │");
console.log("└════════════════════════════════════════┘");

const provider = new StealthProvider();

export const stealthPlugin: Plugin = {
    name: "[Stealth] Integration",
    description: "Stealth address and limit order integration plugin",
    providers: [provider],
    evaluators: [],
    services: [],
    actions: [
        generateStealthAddressAction,
        createLimitOrderAction,
        getLimitOrderAction,
        watchLimitOrderExecutionsAction
    ]
};

export default stealthPlugin;
export * from './interfaces';
export * from './provider';
export * from './actions'; 