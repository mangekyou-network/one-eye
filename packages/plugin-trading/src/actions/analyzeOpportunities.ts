import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { TradingService } from "../services";

export const analyzeOpportunitiesAction: Action = {
    name: "ANALYZE_TRADING_OPPORTUNITIES",
    similes: [
        "ANALYZE_MARKET",
        "FIND_TRADES",
        "SCAN_OPPORTUNITIES",
        "CHECK_SIGNALS"
    ],
    description: "Analyze trading opportunities based on agent metrics",
    validate: async (runtime: IAgentRuntime) => {
        return !!runtime.getSetting("COOKIESWARM_API_KEY");
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            const strategy = (options.strategy as string) || "MOMENTUM";
            const tradingService = new TradingService(runtime);
            await tradingService.init();

            const signals = await tradingService.analyzeTradingOpportunities(strategy);

            if (signals.length === 0) {
                callback({
                    text: "No trading opportunities found that meet the strategy criteria.",
                    content: { signals }
                });
                return true;
            }

            // Format signals into readable text
            const signalText = signals.map((signal, index) => `
${index + 1}. ${signal.symbol}
   • Action: ${signal.action}
   • Confidence: ${(signal.confidence * 100).toFixed(1)}%
   • Timeframe: ${signal.timeframe}
   • Reason: ${signal.reason}
   • Suggested Size: ${signal.suggestedSize?.toFixed(4) || "N/A"}
   • Target Price: $${signal.targetPrice?.toFixed(6) || "N/A"}
   • Stop Loss: $${signal.stopLoss?.toFixed(6) || "N/A"}`).join("\n");

            callback({
                text: `Found ${signals.length} trading opportunities using ${strategy} strategy:\n${signalText}`,
                content: { signals }
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("Error in trading analysis:", error);
            callback({
                text: `Error analyzing trading opportunities: ${error.message}`,
                content: { error: error.message }
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Find trading opportunities based on agent metrics",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll analyze the market for trading opportunities using the momentum strategy.",
                    action: "ANALYZE_TRADING_OPPORTUNITIES",
                    options: {
                        strategy: "MOMENTUM"
                    }
                },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Look for long-term investment opportunities",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll scan for trading opportunities using the trend following strategy.",
                    action: "ANALYZE_TRADING_OPPORTUNITIES",
                    options: {
                        strategy: "TREND_FOLLOWING"
                    }
                },
            }
        ]
    ] as ActionExample[][],
} as Action; 