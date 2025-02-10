import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { StealthProvider } from "../provider";

export const watchLimitOrderExecutionsAction: Action = {
    name: "STEALTH_WATCH_LIMIT_ORDER_EXECUTIONS",
    similes: [
        "STEALTH",
        "LIMIT",
        "ORDER",
        "WATCH",
        "EXECUTIONS"
    ],
    description: "Watch for stealth limit order executions",
    validate: async (runtime: IAgentRuntime) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            const fromBlock = options.fromBlock ? BigInt(options.fromBlock as string) : 0n;

            const provider = new StealthProvider();
            const executions = await provider.watchLimitOrderExecutions(fromBlock);

            elizaLogger.success(
                `Successfully retrieved limit order executions`
            );

            if (callback) {
                callback({
                    text: `Found ${executions.length} limit order executions:
${executions.map(exec => `
• Order ID: ${exec.orderId}
  Executor: ${exec.executor}
  Amount In: ${exec.amountIn.toString()}
  Amount Out: ${exec.amountOut.toString()}`).join('\n')}`,
                    content: executions
                });
                return true;
            }
            return true;
        } catch (error: any) {
            elizaLogger.error("Error watching limit order executions:", error);
            callback({
                text: `Error watching limit order executions: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [] as ActionExample[][],
} as Action; 