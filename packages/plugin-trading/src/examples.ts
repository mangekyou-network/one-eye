import { ActionExample } from "@elizaos/core";

export const analyzeOpportunitiesExample: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Find trading opportunities in the agent market",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll analyze the market for momentum trading opportunities.",
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
                text: "What are the best long-term investment opportunities?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll analyze the market using the trend following strategy for long-term opportunities.",
                action: "ANALYZE_TRADING_OPPORTUNITIES",
                options: {
                    strategy: "TREND_FOLLOWING"
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Look for accumulation opportunities in the market",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll search for tokens showing strong fundamentals but temporary weakness.",
                action: "ANALYZE_TRADING_OPPORTUNITIES",
                options: {
                    strategy: "ACCUMULATION"
                }
            },
        }
    ]
];

export const executeTradeExample: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Execute this trade signal",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll execute the trade according to the signal parameters.",
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
                        stopLoss: 0.45,
                        metrics: {
                            mindshare: 5.2,
                            mindshareDelta: 0.15,
                            marketCap: 2500000,
                            marketCapDelta: 0.08,
                            volume24h: 150000,
                            volumeDelta: 0.25,
                            holdersCount: 2500,
                            holdersDelta: 0.05,
                            socialEngagement: 250,
                            socialEngagementDelta: 0.12
                        }
                    }
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Sell my position in this token",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll execute the sell order based on the current market conditions.",
                action: "EXECUTE_TRADE",
                options: {
                    signal: {
                        symbol: "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
                        action: "SELL",
                        confidence: 0.75,
                        reason: "Take profit target reached",
                        timeframe: "SHORT",
                        platform: "DEX",
                        suggestedSize: 1.0, // Full position
                        metrics: {
                            mindshare: 4.8,
                            mindshareDelta: -0.05,
                            marketCap: 2800000,
                            marketCapDelta: -0.02,
                            volume24h: 180000,
                            volumeDelta: 0.15,
                            holdersCount: 2600,
                            holdersDelta: 0.02,
                            socialEngagement: 220,
                            socialEngagementDelta: -0.08
                        }
                    }
                }
            },
        }
    ]
]; 