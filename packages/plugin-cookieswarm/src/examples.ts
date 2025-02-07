import { z } from "zod";
import { ActionExample } from "@elizaos/core";

export const getAgentByTwitterExample: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you check the stats for @cookiedotfun?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll fetch the agent details for @cookiedotfun over the last 7 days.",
                action: "COOKIESWARM_GET_TWITTER_AGENT",
                options: {
                    twitterUsername: "cookiedotfun",
                    interval: "_7Days"
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What's the performance of cookiedotfun in the last 3 days?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll analyze @cookiedotfun's metrics for the past 3 days.",
                action: "COOKIESWARM_GET_TWITTER_AGENT",
                options: {
                    twitterUsername: "cookiedotfun",
                    interval: "_3Days"
                }
            },
        }
    ]
];

export const getAgentByContractExample: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Show me the stats for contract 0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll fetch the agent details for this contract over the last 7 days.",
                action: "COOKIESWARM_GET_CONTRACT_AGENT",
                options: {
                    contractAddress: "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
                    interval: "_7Days"
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What's the 3-day performance of 0xc0041ef357b183448b235a8ea73ce4e4ec8c265f?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll analyze this contract's metrics for the past 3 days.",
                action: "COOKIESWARM_GET_CONTRACT_AGENT",
                options: {
                    contractAddress: "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
                    interval: "_3Days"
                }
            },
        }
    ]
];

export const getAgentsPagedExample: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Show me the top agents by mindshare",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll fetch the first page of top 10 agents by mindshare over the last 7 days.",
                action: "COOKIESWARM_GET_AGENTS_PAGED",
                options: {
                    interval: "_7Days",
                    page: 1,
                    pageSize: 10
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What are the trending agents in the last 3 days?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll get you the top agents based on 3-day mindshare metrics.",
                action: "COOKIESWARM_GET_AGENTS_PAGED",
                options: {
                    interval: "_3Days",
                    page: 1,
                    pageSize: 10
                }
            },
        }
    ]
];

export const searchTweetsExample: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Find tweets about cookie token utility from January",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll search for tweets containing 'cookie token utility' between January 1st and January 31st.",
                action: "COOKIESWARM_SEARCH_TWEETS",
                options: {
                    searchQuery: "cookie token utility",
                    from: "2024-01-01",
                    to: "2024-01-31"
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What are people saying about agent mindshare this month?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll search for recent discussions about agent mindshare.",
                action: "COOKIESWARM_SEARCH_TWEETS",
                options: {
                    searchQuery: "agent mindshare analytics",
                    from: "2024-02-01",
                    to: "2024-02-29"
                }
            },
        }
    ]
];
