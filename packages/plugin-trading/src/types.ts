import { z } from "zod";

export const TradingPlatformSchema = z.enum(["COINBASE", "BINANCE", "DEX"]);
export type TradingPlatform = z.infer<typeof TradingPlatformSchema>;

export const TradeSignalSchema = z.object({
    symbol: z.string(),
    action: z.enum(["BUY", "SELL", "HOLD"]),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
    suggestedSize: z.number().optional(),
    targetPrice: z.number().optional(),
    stopLoss: z.number().optional(),
    timeframe: z.enum(["SHORT", "MEDIUM", "LONG"]),
    platform: TradingPlatformSchema,
    metrics: z.object({
        mindshare: z.number(),
        mindshareDelta: z.number(),
        marketCap: z.number(),
        marketCapDelta: z.number(),
        volume24h: z.number(),
        volumeDelta: z.number(),
        holdersCount: z.number(),
        holdersDelta: z.number(),
        socialEngagement: z.number(),
        socialEngagementDelta: z.number()
    })
});

export type TradeSignal = z.infer<typeof TradeSignalSchema>;

export const TradeExecutionSchema = z.object({
    signal: TradeSignalSchema,
    executedPrice: z.number(),
    executedSize: z.number(),
    timestamp: z.string(),
    transactionId: z.string(),
    status: z.enum(["SUCCESS", "FAILED", "PENDING"]),
    error: z.string().optional()
});

export type TradeExecution = z.infer<typeof TradeExecutionSchema>;

export interface TradingStrategy {
    name: string;
    description: string;
    timeframe: "SHORT" | "MEDIUM" | "LONG";
    minConfidence: number;
    maxPositionSize: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    metrics: {
        minMindshare: number;
        minMindshareDelta: number;
        minMarketCap: number;
        minVolume24h: number;
        minHoldersCount: number;
        minSocialEngagement: number;
    };
} 