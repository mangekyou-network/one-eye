import { AgentResponse } from "@elizaos/plugin-cookieswarm";
import { TradeSignal, TradingStrategy } from "./types";

export const STRATEGIES: Record<string, TradingStrategy> = {
    MOMENTUM: {
        name: "Momentum Trading",
        description: "Trade based on strong mindshare and social engagement momentum",
        timeframe: "SHORT",
        minConfidence: 0.7,
        maxPositionSize: 0.1, // 10% of available balance
        stopLossPercentage: 0.05,
        takeProfitPercentage: 0.15,
        metrics: {
            minMindshare: 1.0,
            minMindshareDelta: 0.1,
            minMarketCap: 1000000, // $1M
            minVolume24h: 100000, // $100K
            minHoldersCount: 1000,
            minSocialEngagement: 100
        }
    },
    ACCUMULATION: {
        name: "Accumulation",
        description: "Accumulate tokens showing strong fundamentals but temporary weakness",
        timeframe: "MEDIUM",
        minConfidence: 0.8,
        maxPositionSize: 0.2,
        stopLossPercentage: 0.1,
        takeProfitPercentage: 0.3,
        metrics: {
            minMindshare: 2.0,
            minMindshareDelta: -0.05,
            minMarketCap: 5000000, // $5M
            minVolume24h: 500000, // $500K
            minHoldersCount: 5000,
            minSocialEngagement: 500
        }
    },
    TREND_FOLLOWING: {
        name: "Trend Following",
        description: "Follow established trends in mindshare and holder growth",
        timeframe: "LONG",
        minConfidence: 0.85,
        maxPositionSize: 0.3,
        stopLossPercentage: 0.15,
        takeProfitPercentage: 0.5,
        metrics: {
            minMindshare: 5.0,
            minMindshareDelta: 0.2,
            minMarketCap: 10000000, // $10M
            minVolume24h: 1000000, // $1M
            minHoldersCount: 10000,
            minSocialEngagement: 1000
        }
    }
};

export function analyzeAgent(
    agent: AgentResponse,
    strategy: TradingStrategy
): TradeSignal | null {
    const {
        mindshare,
        mindshareDeltaPercent,
        marketCap,
        marketCapDeltaPercent,
        volume24Hours,
        volume24HoursDeltaPercent,
        holdersCount,
        holdersCountDeltaPercent,
        averageEngagementsCount,
        averageEngagementsCountDeltaPercent
    } = agent;

    // Check minimum requirements
    if (
        mindshare < strategy.metrics.minMindshare ||
        marketCap < strategy.metrics.minMarketCap ||
        volume24Hours < strategy.metrics.minVolume24h ||
        holdersCount < strategy.metrics.minHoldersCount ||
        averageEngagementsCount < strategy.metrics.minSocialEngagement
    ) {
        return null;
    }

    // Calculate confidence score based on metrics
    let confidenceScore = 0;
    let reasons: string[] = [];

    // Mindshare analysis (30% weight)
    if (mindshareDeltaPercent > strategy.metrics.minMindshareDelta) {
        confidenceScore += 0.3 * (mindshareDeltaPercent / 100);
        reasons.push(`Strong mindshare growth: ${mindshareDeltaPercent.toFixed(2)}%`);
    }

    // Market cap momentum (20% weight)
    if (marketCapDeltaPercent > 0) {
        confidenceScore += 0.2 * (marketCapDeltaPercent / 100);
        reasons.push(`Positive market cap growth: ${marketCapDeltaPercent.toFixed(2)}%`);
    }

    // Volume analysis (20% weight)
    if (volume24HoursDeltaPercent > 0) {
        confidenceScore += 0.2 * (volume24HoursDeltaPercent / 100);
        reasons.push(`Increasing volume: ${volume24HoursDeltaPercent.toFixed(2)}%`);
    }

    // Holder growth (15% weight)
    if (holdersCountDeltaPercent > 0) {
        confidenceScore += 0.15 * (holdersCountDeltaPercent / 100);
        reasons.push(`Growing holder base: ${holdersCountDeltaPercent.toFixed(2)}%`);
    }

    // Social engagement (15% weight)
    if (averageEngagementsCountDeltaPercent > 0) {
        confidenceScore += 0.15 * (averageEngagementsCountDeltaPercent / 100);
        reasons.push(`Increasing social engagement: ${averageEngagementsCountDeltaPercent.toFixed(2)}%`);
    }

    // Normalize confidence score to 0-1 range
    confidenceScore = Math.min(Math.max(confidenceScore, 0), 1);

    // Only generate signal if confidence meets minimum threshold
    if (confidenceScore >= strategy.minConfidence) {
        return {
            symbol: agent.contracts[0]?.contractAddress || "",
            action: "BUY",
            confidence: confidenceScore,
            reason: reasons.join("; "),
            timeframe: strategy.timeframe,
            platform: "DEX", // Default to DEX, can be adjusted based on contract chain
            suggestedSize: strategy.maxPositionSize * confidenceScore,
            stopLoss: agent.price * (1 - strategy.stopLossPercentage),
            targetPrice: agent.price * (1 + strategy.takeProfitPercentage),
            metrics: {
                mindshare,
                mindshareDelta: mindshareDeltaPercent,
                marketCap,
                marketCapDelta: marketCapDeltaPercent,
                volume24h: volume24Hours,
                volumeDelta: volume24HoursDeltaPercent,
                holdersCount,
                holdersDelta: holdersCountDeltaPercent,
                socialEngagement: averageEngagementsCount,
                socialEngagementDelta: averageEngagementsCountDeltaPercent
            }
        };
    }

    return null;
} 