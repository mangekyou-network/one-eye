export interface Contract {
    chain: number;
    contractAddress: string;
}

export interface Tweet {
    tweetUrl: string;
    tweetAuthorProfileImageUrl: string;
    tweetAuthorDisplayName: string;
    smartEngagementPoints: number;
    impressionsCount: number;
}

export interface AgentResponse {
    agentName: string;
    contracts: Contract[];
    twitterUsernames: string[];
    mindshare: number;
    mindshareDeltaPercent: number;
    marketCap: number;
    marketCapDeltaPercent: number;
    price: number;
    priceDeltaPercent: number;
    liquidity: number;
    volume24Hours: number;
    volume24HoursDeltaPercent: number;
    holdersCount: number;
    holdersCountDeltaPercent: number;
    averageImpressionsCount: number;
    averageImpressionsCountDeltaPercent: number;
    averageEngagementsCount: number;
    averageEngagementsCountDeltaPercent: number;
    followersCount: number;
    smartFollowersCount: number;
    topTweets: Tweet[];
}

export interface AgentsPagedResponse {
    data: AgentResponse[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
}

export interface TweetSearchResult {
    authorUsername: string;
    createdAt: string;
    engagementsCount: number;
    impressionsCount: number;
    isQuote: boolean;
    isReply: boolean;
    likesCount: number;
    quotesCount: number;
    repliesCount: number;
    retweetsCount: number;
    smartEngagementPoints: number;
    text: string;
    matchingScore: number;
}

export interface ApiResponse<T> {
    ok: T;
    success: boolean;
    error: string | null;
}
