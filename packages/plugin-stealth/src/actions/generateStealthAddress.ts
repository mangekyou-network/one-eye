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

export const generateStealthAddressAction: Action = {
    name: "STEALTH_GENERATE_ADDRESS",
    similes: [
        "STEALTH",
        "ADDRESS",
        "GENERATE",
        "PRIVACY"
    ],
    description: "Generate a stealth address and commitment for private transactions",
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
            const recipientPublicKey = options.recipientPublicKey as string;
            if (!recipientPublicKey) {
                throw new Error("Recipient public key is required");
            }

            const provider = new StealthProvider();
            const result = await provider.generateStealthAddress(recipientPublicKey);

            elizaLogger.success(
                `Successfully generated stealth address`
            );

            if (callback) {
                callback({
                    text: `Generated stealth address details:
• Stealth Address: ${result.stealthAddress}
• Ephemeral Public Key: ${result.ephemeralPubKey}
• View Tag: ${result.viewTag}
• Stealth Commitment: ${result.stealthCommitment}`,
                    content: result
                });
                return true;
            }
            return true;
        } catch (error: any) {
            elizaLogger.error("Error in stealth address generation:", error);
            callback({
                text: `Error generating stealth address: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [] as ActionExample[][],
} as Action; 