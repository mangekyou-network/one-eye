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
import type { Hash } from "viem";

export const getLimitOrderAction: Action = {
    name: "STEALTH_GET_LIMIT_ORDER",
    similes: [
        "STEALTH",
        "LIMIT",
        "ORDER",
        "GET"
    ],
    description: "Get details of a stealth limit order",
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
            const poolId = options.poolId as Hash;
            const tick = Number(options.tick);
            const index = Number(options.index);

            if (!poolId || typeof tick !== 'number' || typeof index !== 'number') {
                throw new Error("Pool ID, tick, and index are required");
            }

            const provider = new StealthProvider();
            const order = await provider.getLimitOrder(poolId, tick, index);

            elizaLogger.success(
                `Successfully retrieved limit order details`
            );

            if (callback) {
                callback({
                    text: `Limit Order Details:
• Owner: ${order.owner}
• Token In: ${order.tokenIn}
• Token Out: ${order.tokenOut}
• Amount In: ${order.amountIn.toString()}
• Min Amount Out: ${order.minAmountOut.toString()}
• Deadline: ${order.deadline.toString()}
• Executed: ${order.executed}`,
                    content: order
                });
                return true;
            }
            return true;
        } catch (error: any) {
            elizaLogger.error("Error retrieving limit order:", error);
            callback({
                text: `Error getting limit order: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [] as ActionExample[][],
} as Action; 