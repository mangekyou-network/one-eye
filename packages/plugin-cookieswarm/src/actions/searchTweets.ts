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
import { searchTweetsExample } from "../examples";
import { CookieSwarmService } from "../services";

export const searchTweetsAction: Action = {
    name: "COOKIESWARM_SEARCH_TWEETS",
    similes: [
        "SEARCH",
        "TWEETS",
        "SOCIAL",
        "ANALYTICS"
    ],
    description: "Search for tweets containing specific keywords within a date range",
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
            const searchQuery = options.searchQuery as string;
            const from = options.from as string;
            const to = options.to as string;

            if (!searchQuery) {
                throw new Error("Search query is required");
            }
            if (!from || !to) {
                throw new Error("From and to dates are required");
            }

            const response = await cookieService.searchTweets(
                searchQuery,
                from,
                to
            );

            if (!response.success) {
                throw new Error(response.error || "Unknown error occurred");
            }

            elizaLogger.success(
                `Successfully searched tweets for "${searchQuery}"`
            );

            if (callback) {
                const tweets = response.ok;
                if (tweets.length === 0) {
                    callback({
                        text: `No tweets found matching "${searchQuery}" between ${from} and ${to}.`,
                        content: []
                    });
                    return true;
                }

                const topTweets = tweets.slice(0, 3);
                callback({
                    text: `Found ${tweets.length} tweets. Here are the top ${topTweets.length} results:

${topTweets.map((tweet, index) => `${index + 1}. By @${tweet.authorUsername} (${tweet.smartEngagementPoints} engagement points)
   "${tweet.text}"
   Posted: ${new Date(tweet.createdAt).toLocaleDateString()}
   Engagements: ${tweet.engagementsCount} | Impressions: ${tweet.impressionsCount.toLocaleString()}`).join("\n\n")}`,
                    content: response.ok
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in CookieSwarm plugin handler:", error);
            callback({
                text: `Error searching tweets: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [searchTweetsExample] as ActionExample[][],
} as Action; 
