import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const cookieSwarmEnvSchema = z.object({
    COOKIESWARM_API_KEY: z.string().min(1, "CookieSwarm API key is required"),
});

export type CookieSwarmConfig = z.infer<typeof cookieSwarmEnvSchema>;

export async function validateCookieSwarmConfig(
    runtime: IAgentRuntime
): Promise<CookieSwarmConfig> {
    try {
        const config = {
            COOKIESWARM_API_KEY: runtime.getSetting("COOKIESWARM_API_KEY"),
        };
        return cookieSwarmEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `CookieSwarm API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
