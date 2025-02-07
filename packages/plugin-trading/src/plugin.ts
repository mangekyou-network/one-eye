import { Plugin } from "@elizaos/core";
import { analyzeOpportunitiesAction, executeTradeAction } from "./actions";

export const tradingPlugin: Plugin = {
    name: "trading",
    description: "AI-powered trading based on agent metrics analysis",
    actions: [
        analyzeOpportunitiesAction,
        executeTradeAction
    ],
    evaluators: [],
    providers: []
}; 