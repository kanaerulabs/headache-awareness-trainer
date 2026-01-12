/**
 * Insights Agent Interface
 *
 * This interface defines the contract for AI agent functionality that analyzes
 * headache data and provides personalized insights.
 * Implementation will use Vercel AI SDK in interface-adapters/agents/
 */

/**
 * Agent Error with error codes for proper handling
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'RATE_LIMIT'
      | 'TIMEOUT'
      | 'INVALID_RESPONSE'
      | 'NETWORK_ERROR'
      | 'AUTH_ERROR'
      | 'UNKNOWN',
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

/**
 * Input DTO for the insights agent
 *
 * Uses generic string types to avoid coupling to domain-specific types.
 * The use case is responsible for mapping domain types to these DTOs.
 */
export interface InsightsInput {
  data: {
    headacheEntries: Array<{
      id: string;
      timestamp: Date;
      intensity: number;
      location?: string[];
      triggers?: string[];
      notes?: string;
    }>;
    checkinData: Array<{
      id: string;
      timestamp: Date;
      sleepQuality: string;
      mood: string;
      bodyTension: string[];
    }>;
  };
  context?: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
  };
}

/**
 * Output DTO from the insights agent
 */
export interface InsightsOutput {
  summary: string;
  patterns: string[];
  recommendations: string[];
  confidence: number;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}

/**
 * Agent Dependency Interface
 *
 * This interface defines the contract for AI agent functionality.
 * Implementation will use Vercel AI SDK in interface-adapters/agents/
 */
export interface IInsightsAgent {
  execute(input: InsightsInput): Promise<InsightsOutput>;
}
