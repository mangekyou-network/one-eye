import { Plugin } from "@elizaos/core";
import {
    getTwitterAgentAction,
    getContractAgentAction,
    getAgentsPagedAction,
    searchTweetsAction
} from "./actions";

export const cookieSwarmPlugin: Plugin = {
    name: "cookieswarm",
    description: "CookieSwarm plugin for AI agent market analytics",
    actions: [
        getTwitterAgentAction,
        getContractAgentAction,
        getAgentsPagedAction,
        searchTweetsAction
    ]
}; 