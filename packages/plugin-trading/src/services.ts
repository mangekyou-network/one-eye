import { IAgentRuntime, elizaLogger } from "@elizaos/core";
import { CookieSwarmService } from "@elizaos/plugin-cookieswarm";
import { plugins as coinbasePlugins } from "@elizaos/plugin-coinbase";
import { plugins as binancePlugins } from "@elizaos/plugin-binance";
import { createRabbiTraderPlugin } from "@elizaos/plugin-rabbi-trader";
import { TradeExecution, TradeSignal, TradingPlatform } from "./types";
import { STRATEGIES, analyzeAgent } from "./strategies";

export class TradingService {
    private cookieSwarmService: CookieSwarmService;
    private rabbiTraderPlugin: any; // Will be initialized in constructor

    constructor(private runtime: IAgentRuntime) {
        this.cookieSwarmService = new CookieSwarmService({
            COOKIESWARM_API_KEY: runtime.getSetting("COOKIESWARM_API_KEY") || ""
        });
    }

    async init() {
        this.rabbiTraderPlugin = await createRabbiTraderPlugin(
            this.runtime.getSetting
        );
    }

    async analyzeTradingOpportunities(strategy = "MOMENTUM") {
        try {
            // Get top agents by mindshare
            const response = await this.cookieSwarmService.getAgentsPaged(
                "_7Days",
                1,
                25
            );

            if (!response.success) {
                throw new Error(response.error || "Failed to fetch agents");
            }

            const signals: TradeSignal[] = [];
            const selectedStrategy = STRATEGIES[strategy];

            if (!selectedStrategy) {
                throw new Error(`Strategy ${strategy} not found`);
            }

            // Analyze each agent
            for (const agent of response.ok.data) {
                const signal = analyzeAgent(agent, selectedStrategy);
                if (signal) {
                    signals.push(signal);
                }
            }

            return signals;
        } catch (error) {
            elizaLogger.error("Error analyzing trading opportunities:", error);
            throw error;
        }
    }

    async executeTrade(signal: TradeSignal): Promise<TradeExecution> {
        try {
            let execution: TradeExecution;

            switch (signal.platform) {
                case "COINBASE":
                    execution = await this.executeCoinbaseTrade(signal);
                    break;
                case "BINANCE":
                    execution = await this.executeBinanceTrade(signal);
                    break;
                case "DEX":
                    execution = await this.executeDEXTrade(signal);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${signal.platform}`);
            }

            return execution;
        } catch (error) {
            elizaLogger.error("Error executing trade:", error);
            return {
                signal,
                executedPrice: 0,
                executedSize: 0,
                timestamp: new Date().toISOString(),
                transactionId: "",
                status: "FAILED",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }

    private async executeCoinbaseTrade(signal: TradeSignal): Promise<TradeExecution> {
        const { executeAdvancedTradeAction } = coinbasePlugins.advancedTradePlugin.actions[0];

        try {
            const result = await executeAdvancedTradeAction.handler(
                this.runtime,
                { content: { text: "" } },
                {},
                {
                    productId: signal.symbol,
                    side: signal.action,
                    amount: signal.suggestedSize || 0,
                    orderType: "MARKET"
                },
                () => { }
            );

            return {
                signal,
                executedPrice: 0, // Would come from actual execution
                executedSize: signal.suggestedSize || 0,
                timestamp: new Date().toISOString(),
                transactionId: "", // Would come from actual execution
                status: result ? "SUCCESS" : "FAILED"
            };
        } catch (error) {
            throw error;
        }
    }

    private async executeBinanceTrade(signal: TradeSignal): Promise<TradeExecution> {
        // Implementation would be similar to Coinbase
        throw new Error("Binance trading not implemented yet");
    }

    private async executeDEXTrade(signal: TradeSignal): Promise<TradeExecution> {
        try {
            const avalanchePrivateKey = this.runtime.getSetting("AVALANCHE_PRIVATE_KEY");
            if (!avalanchePrivateKey) {
                throw new Error("Avalanche private key not configured for DEX trading");
            }

            const result = await this.rabbiTraderPlugin.providers[0].executeTrade({
                tokenAddress: signal.symbol,
                amount: signal.suggestedSize || 0,
                side: signal.action,
                privateKey: avalanchePrivateKey
            });

            return {
                signal,
                executedPrice: 0, // Would come from actual execution
                executedSize: signal.suggestedSize || 0,
                timestamp: new Date().toISOString(),
                transactionId: "", // Would come from actual execution
                status: result.success ? "SUCCESS" : "FAILED"
            };
        } catch (error) {
            throw error;
        }
    }

    async getPlatformForToken(contractAddress: string): Promise<TradingPlatform> {
        // Logic to determine best platform based on liquidity, fees, etc.
        return "DEX"; // Default to DEX for now
    }
} 