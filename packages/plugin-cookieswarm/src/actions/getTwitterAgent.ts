import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateCookieSwarmConfig } from "../environment";
import { getAgentByTwitterExample } from "../examples";
import { CookieSwarmService } from "../services";

export const getTwitterAgentAction: Action = {
    name: "COOKIESWARM_GET_TWITTER_AGENT",
    similes: [
        "AGENT",
        "TWITTER",
        "CRYPTO",
        "ANALYTICS"
    ],
    description: "Get agent details and statistics by Twitter username",
    validate: async (runtime: IAgentRuntime) => {
        await validateCookieSwarmConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateCookieSwarmConfig(runtime);
        const cookieService = new CookieSwarmService(config);

        try {
            const twitterUsername = options.twitterUsername as string;
            const interval = (options.interval as "_3Days" | "_7Days") || "_7Days";

            if (!twitterUsername) {
                throw new Error("Twitter username is required");
            }

            const response = await cookieService.getAgentByTwitterUsername(
                twitterUsername,
                interval
            );

            if (!response.success) {
                throw new Error(response.error || "Unknown error occurred");
            }

            elizaLogger.success(
                `Successfully fetched agent data for @${twitterUsername}`
            );

            if (callback) {
                const agent = response.ok;
                callback({
                    text: `Here are the details for agent ${agent.agentName}:
• Mindshare: ${agent.mindshare.toFixed(2)} (${agent.mindshareDeltaPercent > 0 ? '+' : ''}${agent.mindshareDeltaPercent.toFixed(2)}%)
• Market Cap: $${(agent.marketCap / 1000000).toFixed(2)}M (${agent.marketCapDeltaPercent > 0 ? '+' : ''}${agent.marketCapDeltaPercent.toFixed(2)}%)
• Price: $${agent.price.toFixed(6)} (${agent.priceDeltaPercent > 0 ? '+' : ''}${agent.priceDeltaPercent.toFixed(2)}%)
• 24h Volume: $${(agent.volume24Hours / 1000000).toFixed(2)}M
• Holders: ${agent.holdersCount.toLocaleString()} (${agent.holdersCountDeltaPercent > 0 ? '+' : ''}${agent.holdersCountDeltaPercent.toFixed(2)}%)`,
                    content: response.ok
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in CookieSwarm plugin handler:", error);
            callback({
                text: `Error fetching agent data: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [getAgentByTwitterExample] as ActionExample[][],
} as Action;
