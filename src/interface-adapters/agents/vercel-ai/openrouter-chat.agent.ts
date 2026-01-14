/**
 * OpenRouter Chat Agent Implementation
 *
 * AI agent adapter for conversational Q&A about headache data.
 * Uses OpenRouter via Vercel AI SDK for natural language understanding.
 */

import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  IChatAgent,
  ChatInput,
  ChatOutput,
  AgentError,
} from "../../../usecases/chat-insights/interfaces/chat-agent.interface";

/**
 * OpenRouter Chat Agent
 *
 * Provides conversational AI interface for asking questions about
 * headache patterns, triggers, and recommendations.
 */
export class OpenRouterChatAgent implements IChatAgent {
  private readonly openrouter;
  private readonly modelId: string;

  constructor(apiKey: string, modelId: string = "deepseek/deepseek-chat") {
    this.openrouter = createOpenRouter({ apiKey });
    this.modelId = modelId;
  }

  async execute(input: ChatInput): Promise<ChatOutput> {
    const startTime = Date.now();

    try {
      const model = this.openrouter.chat(this.modelId);

      const { text, usage } = await generateText({
        model,
        messages: this.buildMessages(input),
        temperature: input.options?.temperature ?? 0.7,
        maxOutputTokens: input.options?.maxTokens ?? 500,
      });

      return {
        message: text,
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
   * Build messages array for the chat API
   */
  private buildMessages(
    input: ChatInput,
  ): Array<{ role: "system" | "user" | "assistant"; content: string }> {
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [];

    // System message with health data context
    messages.push({
      role: "system",
      content: this.buildSystemPrompt(input.healthData),
    });

    // Add conversation history
    for (const msg of input.conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: input.message,
    });

    return messages;
  }

  /**
   * Build system prompt with health data context
   */
  private buildSystemPrompt(healthData: ChatInput["healthData"]): string {
    const { headacheEntries, checkinData, summary } = healthData;

    // Format headache entries (last 10 for context)
    const recentHeadaches = headacheEntries.slice(-10);
    const headacheText =
      recentHeadaches.length > 0
        ? recentHeadaches
            .map((entry) => {
              const parts = [
                `${entry.timestamp.toLocaleDateString()}: Intensity ${entry.intensity}/10`,
              ];
              if (entry.triggers?.length)
                parts.push(`Triggers: ${entry.triggers.join(", ")}`);
              if (entry.location?.length)
                parts.push(`Location: ${entry.location.join(", ")}`);
              if (entry.notes) parts.push(`Notes: ${entry.notes}`);
              return `- ${parts.join(" | ")}`;
            })
            .join("\n")
        : "No headache entries yet.";

    // Format check-in data (last 10 for context)
    const recentCheckins = checkinData.slice(-10);
    const checkinText =
      recentCheckins.length > 0
        ? recentCheckins
            .map(
              (entry) =>
                `- ${entry.timestamp.toLocaleDateString()}: Sleep: ${entry.sleepQuality}, Mood: ${entry.mood}, Tension: ${entry.bodyTension.join(", ") || "none"}`,
            )
            .join("\n")
        : "No check-in data yet.";

    // Format summary if available
    const summaryText = summary
      ? `
Summary Statistics:
- Total headaches logged: ${summary.totalHeadaches}
- Average intensity: ${summary.averageIntensity.toFixed(1)}/10
- Most common triggers: ${summary.mostCommonTriggers.join(", ") || "None identified"}
- Data range: ${summary.dateRange.start.toLocaleDateString()} to ${summary.dateRange.end.toLocaleDateString()}`
      : "";

    return `You are a helpful health awareness assistant for someone tracking their headaches. You help them understand patterns and correlations in their data.

You have access to their headache and wellness data:

## Recent Headache Entries:
${headacheText}

## Recent Check-ins (Sleep, Mood, Body Tension):
${checkinText}
${summaryText}

Guidelines:
- Be empathetic and supportive
- Provide specific insights based on their actual data
- Suggest patterns you notice (e.g., "I notice your headaches tend to be worse after poor sleep")
- Offer actionable recommendations when appropriate
- If asked about something not in the data, acknowledge the limitation
- Keep responses concise but helpful (2-4 paragraphs max)
- Don't provide medical diagnoses - encourage consulting a healthcare provider for serious concerns`;
  }

  /**
   * Handle errors and map to AgentError codes
   */
  private handleError(error: unknown): AgentError {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        return new AgentError(
          "Rate limit exceeded. Please wait a moment.",
          "RATE_LIMIT",
          error,
        );
      }

      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("etimedout")
      ) {
        return new AgentError(
          "Request timed out. Please try again.",
          "TIMEOUT",
          error,
        );
      }

      if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("401") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("invalid api key")
      ) {
        return new AgentError(
          "API key invalid. Please check your settings.",
          "AUTH_ERROR",
          error,
        );
      }

      if (
        errorMessage.includes("insufficient") ||
        errorMessage.includes("credits")
      ) {
        return new AgentError(
          "Insufficient credits on OpenRouter. Please add funds.",
          "AUTH_ERROR",
          error,
        );
      }

      if (
        errorMessage.includes("network") ||
        errorMessage.includes("econnrefused")
      ) {
        return new AgentError(
          "Network error. Please check your connection.",
          "NETWORK_ERROR",
          error,
        );
      }
    }

    return new AgentError(
      "Something went wrong. Please try again.",
      "UNKNOWN",
      error as Error,
    );
  }
}
