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
import { getAgentsPagedExample } from "../examples";
import { CookieSwarmService } from "../services";

export const getAgentsPagedAction: Action = {
    name: "COOKIESWARM_GET_AGENTS_PAGED",
    similes: [
        "LIST",
        "AGENTS",
        "CRYPTO",
        "ANALYTICS"
    ],
    description: "Get a paginated list of agents ordered by mindshare",
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
            const interval = (options.interval as "_3Days" | "_7Days") || "_7Days";
            const page = (options.page as number) || 1;
            const pageSize = Math.min((options.pageSize as number) || 10, 25);

            const response = await cookieService.getAgentsPaged(
                interval,
                page,
                pageSize
            );

            if (!response.success) {
                throw new Error(response.error || "Unknown error occurred");
            }

            elizaLogger.success(
                `Successfully fetched agents page ${page}`
            );

            if (callback) {
                const result = response.ok;
                const agents = result.data;

                if (agents.length === 0) {
                    callback({
                        text: `No agents found on page ${page}.`,
                        content: result
                    });
                    return true;
                }

                callback({
                    text: `Found ${result.totalCount} agents (Page ${result.currentPage}/${result.totalPages}):

${agents.map((agent, index) => `${index + 1}. ${agent.agentName}
   • Mindshare: ${agent.mindshare.toFixed(2)} (${agent.mindshareDeltaPercent > 0 ? '+' : ''}${agent.mindshareDeltaPercent.toFixed(2)}%)
   • Market Cap: $${(agent.marketCap / 1000000).toFixed(2)}M
   • Price: $${agent.price.toFixed(6)}
   • 24h Volume: $${(agent.volume24Hours / 1000000).toFixed(2)}M`).join("\n\n")}`,
                    content: result
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in CookieSwarm plugin handler:", error);
            callback({
                text: `Error fetching agents: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [getAgentsPagedExample] as ActionExample[][],
} as Action; 
