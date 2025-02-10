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
import { type CreateLimitOrderParams } from "../interfaces";

export const createLimitOrderAction: Action = {
    name: "STEALTH_CREATE_LIMIT_ORDER",
    similes: [
        "STEALTH",
        "LIMIT",
        "ORDER",
        "CREATE"
    ],
    description: "Create a stealth limit order on Uniswap V4",
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
            const params: CreateLimitOrderParams = {
                poolKey: options.poolKey as any,
                amountIn: BigInt(options.amountIn as string),
                minAmountOut: BigInt(options.minAmountOut as string),
                deadline: BigInt(options.deadline as string),
                targetTick: Number(options.targetTick),
                stealthCommitment: options.stealthCommitment as `0x${string}`,
                schemeId: BigInt(options.schemeId as string),
                ephemeralPubKey: options.ephemeralPubKey as `0x${string}`,
                viewTag: Number(options.viewTag)
            };

            const provider = new StealthProvider();
            const result = await provider.createLimitOrder(params);

            elizaLogger.success(
                `Successfully created stealth limit order`
            );

            if (callback) {
                callback({
                    text: `Created stealth limit order:
• Order ID: ${result.orderId}
• Token In: ${result.event.tokenIn}
• Token Out: ${result.event.tokenOut}
• Amount In: ${result.event.amountIn.toString()}
• Min Amount Out: ${result.event.minAmountOut.toString()}
• Deadline: ${result.event.deadline.toString()}
• Target Tick: ${result.event.targetTick}`,
                    content: result
                });
                return true;
            }
            return true;
        } catch (error: any) {
            elizaLogger.error("Error in stealth limit order creation:", error);
            callback({
                text: `Error creating stealth limit order: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [] as ActionExample[][],
} as Action; 