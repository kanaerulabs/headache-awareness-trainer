/**
 * Insights Agent Implementation
 *
 * AI agent adapter that uses Vercel AI SDK to analyze headache data
 * and provide personalized insights.
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import {
  IInsightsAgent,
  InsightsInput,
  InsightsOutput,
  AgentError,
} from '../../../usecases/generate-ai-insights/interfaces/insights-agent.interface';

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
 * Insights Agent - Vercel AI SDK Implementation
 *
 * This adapter wraps the Vercel AI SDK's generateObject function to provide
 * structured insights about headache patterns and correlations with check-in data.
 */
export class InsightsAgent implements IInsightsAgent {
  private readonly model = openai('gpt-4o-mini');

  async execute(input: InsightsInput): Promise<InsightsOutput> {
    const startTime = Date.now();

    try {
      const { object, usage } = await generateObject({
        model: this.model,
        schema: OutputSchema,
        prompt: this.buildPrompt(input),
        temperature: input.options?.temperature ?? 0.7,
      });

      return {
        ...object,
        metadata: {
          tokensUsed: usage?.totalTokens,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Build prompt from input data
   *
   * Constructs a detailed prompt that:
   * 1. Summarizes the headache data
   * 2. Includes check-in correlation data
   * 3. Requests pattern analysis
   * 4. Asks for actionable recommendations
   */
  private buildPrompt(input: InsightsInput): string {
    const { headacheEntries, checkinData } = input.data;

    // Build headache entries text
    const headacheText =
      headacheEntries.length > 0
        ? headacheEntries
            .map((entry) => {
              const parts = [
                `- ${entry.timestamp.toISOString()}: Intensity ${entry.intensity}/10`,
              ];
              if (entry.location && entry.location.length > 0) {
                parts.push(`Location: ${entry.location.join(', ')}`);
              }
              if (entry.triggers && entry.triggers.length > 0) {
                parts.push(`Triggers: ${entry.triggers.join(', ')}`);
              }
              if (entry.notes) {
                parts.push(`Notes: ${entry.notes}`);
              }
              return parts.join(' | ');
            })
            .join('\n')
        : 'No headache entries provided';

    // Build checkin data text
    const checkinText =
      checkinData.length > 0
        ? checkinData
            .map(
              (entry) =>
                `- ${entry.timestamp.toISOString()}: Sleep quality: ${entry.sleepQuality}, Mood: ${entry.mood}, Body tension: ${entry.bodyTension.join(', ')}`,
            )
            .join('\n')
        : 'No check-in data provided';

    // Context with default
    const context =
      input.context ??
      'You are a health awareness assistant analyzing headache patterns for a person with chronic mild-to-moderate tension headaches. Help them build interoception skills by identifying patterns and correlations.';

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
   *
   * Maps common SDK errors to standardized error codes:
   * - Rate limit (429) → RATE_LIMIT
   * - Timeout → TIMEOUT
   * - Authentication (401) → AUTH_ERROR
   * - Parse/schema errors → INVALID_RESPONSE
   * - Network errors → NETWORK_ERROR
   * - Other → UNKNOWN
   */
  private handleError(error: unknown): AgentError {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Rate limit detection
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return new AgentError('Rate limit exceeded', 'RATE_LIMIT', error);
      }

      // Timeout detection
      if (
        errorMessage.includes('timeout') ||
        errorMessage.includes('etimedout')
      ) {
        return new AgentError('Request timeout', 'TIMEOUT', error);
      }

      // Authentication detection
      if (
        errorMessage.includes('authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized')
      ) {
        return new AgentError('Authentication failed', 'AUTH_ERROR', error);
      }

      // Invalid response (parse/schema errors)
      if (
        errorMessage.includes('parse') ||
        errorMessage.includes('schema') ||
        errorMessage.includes('validation')
      ) {
        return new AgentError(
          'Invalid response format',
          'INVALID_RESPONSE',
          error,
        );
      }

      // Network errors
      if (
        errorMessage.includes('network') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('enotfound')
      ) {
        return new AgentError(
          'Network connection failed',
          'NETWORK_ERROR',
          error,
        );
      }
    }

    // Unknown error
    return new AgentError('Unknown error occurred', 'UNKNOWN', error as Error);
  }
}
