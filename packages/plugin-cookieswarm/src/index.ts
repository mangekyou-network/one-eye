import { Plugin } from "@elizaos/core";
import {
    getTwitterAgentAction,
    getContractAgentAction,
    getAgentsPagedAction,
    searchTweetsAction
} from "./actions";

export const cookieSwarmPlugin: Plugin = {
    name: "cookieswarm",
    description: "CookieSwarm plugin for agent market analytics",
    actions: [
        getTwitterAgentAction,
        getContractAgentAction,
        getAgentsPagedAction,
        searchTweetsAction
    ],
    evaluators: [],
    providers: []
};

export * from "./environment";
export * from "./services";
export * from "./types";
export * from "./examples";

export default cookieSwarmPlugin;
