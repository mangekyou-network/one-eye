import { CookieSwarmConfig } from "./environment";
import { AgentResponse, AgentsPagedResponse, ApiResponse, TweetSearchResult } from "./types";

const BASE_URL = "https://api.cookie.fun";

export class CookieSwarmService {
    private apiKey: string;

    constructor(config: CookieSwarmConfig) {
        this.apiKey = config.COOKIESWARM_API_KEY;
    }

    private async fetchWithAuth<T>(endpoint: string): Promise<ApiResponse<T>> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                "x-api-key": this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response.json();
    }

    async getAgentByTwitterUsername(
        twitterUsername: string,
        interval: "_3Days" | "_7Days"
    ): Promise<ApiResponse<AgentResponse>> {
        return this.fetchWithAuth<AgentResponse>(
            `/v2/agents/twitterUsername/${twitterUsername}?interval=${interval}`
        );
    }

    async getAgentByContractAddress(
        contractAddress: string,
        interval: "_3Days" | "_7Days"
    ): Promise<ApiResponse<AgentResponse>> {
        return this.fetchWithAuth<AgentResponse>(
            `/v2/agents/contractAddress/${contractAddress}?interval=${interval}`
        );
    }

    async getAgentsPaged(
        interval: "_3Days" | "_7Days",
        page: number,
        pageSize: number
    ): Promise<ApiResponse<AgentsPagedResponse>> {
        return this.fetchWithAuth<AgentsPagedResponse>(
            `/v2/agents/agentsPaged?interval=${interval}&page=${page}&pageSize=${pageSize}`
        );
    }

    async searchTweets(
        searchQuery: string,
        from: string,
        to: string
    ): Promise<ApiResponse<TweetSearchResult[]>> {
        const encodedQuery = encodeURIComponent(searchQuery);
        return this.fetchWithAuth<TweetSearchResult[]>(
            `/v1/hackathon/search/${encodedQuery}?from=${from}&to=${to}`
        );
    }
}
