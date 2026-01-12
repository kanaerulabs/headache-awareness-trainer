/**
 * OpenRouter Insights Agent Implementation
 *
 * AI agent adapter that uses OpenRouter via Vercel AI SDK to analyze headache data
 * and provide personalized insights. Supports multiple models with cost control.
 */

import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import {
  IInsightsAgent,
  InsightsInput,
  InsightsOutput,
  AgentError,
} from "../../../usecases/generate-ai-insights/interfaces/insights-agent.interface";

/**
 * OpenRouter model ID type
 * OpenRouter supports 300+ models with format "provider/model-name"
 * See https://openrouter.ai/models for full list
 */
export type OpenRouterModelId = string;

/**
 * Zod schema for structured AI output validation
 */
const OutputSchema = z.object({
  summary: z.string(),
  patterns: z.array(z.string()),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

/**
 * OpenRouter Insights Agent - Vercel AI SDK Implementation
 *
 * This adapter wraps the OpenRouter provider to provide
 * structured insights about headache patterns with multi-model support.
 */
export class OpenRouterInsightsAgent implements IInsightsAgent {
  private readonly openrouter;
  private readonly modelId: OpenRouterModelId;

  constructor(apiKey: string, modelId: OpenRouterModelId = "deepseek/deepseek-chat") {
    this.openrouter = createOpenRouter({
      apiKey,
    });
    this.modelId = modelId;
  }

  async execute(input: InsightsInput): Promise<InsightsOutput> {
    const startTime = Date.now();

    try {
      const model = this.openrouter.chat(this.modelId);

      const { object, usage } = await generateObject({
        model,
        schema: OutputSchema,
        prompt: this.buildPrompt(input),
        temperature: input.options?.temperature ?? 0.7,
      });

      return {
        ...object,
        metadata: {
          tokensUsed: usage?.totalTokens,
          processingTime: Date.now() - startTime,
          model: this.modelId,
        },
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Build prompt from input data
   */
  private buildPrompt(input: InsightsInput): string {
    const { headacheEntries, checkinData } = input.data;

    const headacheText =
      headacheEntries.length > 0
        ? headacheEntries
            .map((entry) => {
              const parts = [
                `- ${entry.timestamp.toISOString()}: Intensity ${entry.intensity}/10`,
              ];
              if (entry.location && entry.location.length > 0) {
                parts.push(`Location: ${entry.location.join(", ")}`);
              }
              if (entry.triggers && entry.triggers.length > 0) {
                parts.push(`Triggers: ${entry.triggers.join(", ")}`);
              }
              if (entry.notes) {
                parts.push(`Notes: ${entry.notes}`);
              }
              return parts.join(" | ");
            })
            .join("\n")
        : "No headache entries provided";

    const checkinText =
      checkinData.length > 0
        ? checkinData
            .map(
              (entry) =>
                `- ${entry.timestamp.toISOString()}: Sleep quality: ${entry.sleepQuality}, Mood: ${entry.mood}, Body tension: ${entry.bodyTension.join(", ")}`,
            )
            .join("\n")
        : "No check-in data provided";

    const context =
      input.context ??
      "You are a health awareness assistant analyzing headache patterns for a person with chronic mild-to-moderate tension headaches. Help them build interoception skills by identifying patterns and correlations.";

    return `${context}

## Headache Entries:
${headacheText}

## Check-in Data (Sleep, Mood, Body Tension):
${checkinText}

Analyze this data and provide:

1. **summary**: A brief 2-3 sentence overview of the patterns and correlations you observe
2. **patterns**: A list of specific patterns identified (e.g., "Morning headaches after poor sleep", "Jaw tension correlates with higher intensity")
3. **recommendations**: Actionable recommendations to reduce headache frequency or intensity
4. **confidence**: A confidence score (0-1) for your analysis based on data quality and quantity

Be specific, actionable, and empathetic. Focus on building awareness of body signals.`;
  }

  /**
   * Handle errors from Vercel AI SDK and map to AgentError codes
   */
  private handleError(error: unknown): AgentError {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        return new AgentError("Rate limit exceeded", "RATE_LIMIT", error);
      }

      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("etimedout")
      ) {
        return new AgentError("Request timeout", "TIMEOUT", error);
      }

      if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("401") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("invalid api key") ||
        errorMessage.includes("no auth")
      ) {
        return new AgentError("Authentication failed - check your OpenRouter API key", "AUTH_ERROR", error);
      }

      if (
        errorMessage.includes("insufficient") ||
        errorMessage.includes("credits") ||
        errorMessage.includes("balance")
      ) {
        return new AgentError("Insufficient credits - add funds to your OpenRouter account", "AUTH_ERROR", error);
      }

      if (
        errorMessage.includes("parse") ||
        errorMessage.includes("schema") ||
        errorMessage.includes("validation")
      ) {
        return new AgentError(
          "Invalid response format",
          "INVALID_RESPONSE",
          error,
        );
      }

      if (
        errorMessage.includes("network") ||
        errorMessage.includes("econnrefused") ||
        errorMessage.includes("enotfound")
      ) {
        return new AgentError(
          "Network connection failed",
          "NETWORK_ERROR",
          error,
        );
      }
    }

    return new AgentError("Unknown error occurred", "UNKNOWN", error as Error);
  }
}
