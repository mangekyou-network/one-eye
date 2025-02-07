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
import { TradeSignal } from "../types";

export const executeTradeAction: Action = {
    name: "EXECUTE_TRADE",
    similes: [
        "TRADE",
        "BUY",
        "SELL",
        "PLACE_ORDER",
        "EXECUTE_ORDER"
    ],
    description: "Execute a trade based on a trading signal",
    validate: async (runtime: IAgentRuntime) => {
        return !!(
            runtime.getSetting("COOKIESWARM_API_KEY") &&
            (runtime.getSetting("COINBASE_API_KEY") ||
                runtime.getSetting("BINANCE_API_KEY") ||
                runtime.getSetting("DEX_PRIVATE_KEY"))
        );
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            const signal = options.signal as TradeSignal;
            if (!signal) {
                throw new Error("No trading signal provided");
            }

            const tradingService = new TradingService(runtime);
            await tradingService.init();

            const execution = await tradingService.executeTrade(signal);

            if (execution.status === "FAILED") {
                callback({
                    text: `Failed to execute trade: ${execution.error || "Unknown error"}`,
                    content: execution
                });
                return false;
            }

            const text = `Trade executed successfully:
• Symbol: ${signal.symbol}
• Action: ${signal.action}
• Size: ${execution.executedSize}
• Price: $${execution.executedPrice}
• Platform: ${signal.platform}
• Transaction ID: ${execution.transactionId}
• Time: ${new Date(execution.timestamp).toLocaleString()}`;

            callback({
                text,
                content: execution
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("Error executing trade:", error);
            callback({
                text: `Error executing trade: ${error.message}`,
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
                    text: "Execute this trading opportunity",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll execute the trade according to the signal.",
                    action: "EXECUTE_TRADE",
                    options: {
                        signal: {
                            symbol: "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
                            action: "BUY",
                            confidence: 0.85,
                            reason: "Strong mindshare growth and increasing volume",
                            timeframe: "SHORT",
                            platform: "DEX",
                            suggestedSize: 0.1,
                            targetPrice: 0.65,
                            stopLoss: 0.45
                        }
                    }
                },
            }
        ]
    ] as ActionExample[][],
} as Action; 