import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const tradingEnvSchema = z.object({
    COOKIESWARM_API_KEY: z.string().min(1, "CookieSwarm API key is required"),
    COINBASE_API_KEY: z.string().optional(),
    COINBASE_API_SECRET: z.string().optional(),
    BINANCE_API_KEY: z.string().optional(),
    BINANCE_API_SECRET: z.string().optional(),
    AVALANCHE_PRIVATE_KEY: z.string().optional(),
}).refine(
    (data) => {
        // At least one trading platform must be configured
        return !!(
            (data.COINBASE_API_KEY && data.COINBASE_API_SECRET) ||
            (data.BINANCE_API_KEY && data.BINANCE_API_SECRET) ||
            data.AVALANCHE_PRIVATE_KEY
        );
    },
    {
        message: "At least one trading platform (Coinbase, Binance, or Avalanche DEX) must be configured",
    }
);

export type TradingConfig = z.infer<typeof tradingEnvSchema>;

export async function validateTradingConfig(
    runtime: IAgentRuntime
): Promise<TradingConfig> {
    try {
        const config = {
            COOKIESWARM_API_KEY: runtime.getSetting("COOKIESWARM_API_KEY"),
            COINBASE_API_KEY: runtime.getSetting("COINBASE_API_KEY"),
            COINBASE_API_SECRET: runtime.getSetting("COINBASE_API_SECRET"),
            BINANCE_API_KEY: runtime.getSetting("BINANCE_API_KEY"),
            BINANCE_API_SECRET: runtime.getSetting("BINANCE_API_SECRET"),
            AVALANCHE_PRIVATE_KEY: runtime.getSetting("AVALANCHE_PRIVATE_KEY"),
        };
        return tradingEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Trading configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
} 