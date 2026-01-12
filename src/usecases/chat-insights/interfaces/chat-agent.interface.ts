/**
 * Chat Agent Interface
 *
 * Defines the contract for conversational AI agent that answers
 * questions about headache data in natural language.
 */

import { AgentError } from "../../generate-ai-insights/interfaces/insights-agent.interface";

/**
 * Chat message types
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Health data context for chat
 */
export interface HealthDataContext {
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
  summary?: {
    totalHeadaches: number;
    averageIntensity: number;
    mostCommonTriggers: string[];
    dateRange: { start: Date; end: Date };
  };
}

/**
 * Input for chat agent
 */
export interface ChatInput {
  message: string;
  conversationHistory: ChatMessage[];
  healthData: HealthDataContext;
  options?: {
    maxTokens?: number;
    temperature?: number;
  };
}

/**
 * Output from chat agent
 */
export interface ChatOutput {
  message: string;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    model?: string;
  };
}

/**
 * Chat Agent Dependency Interface
 */
export interface IChatAgent {
  execute(input: ChatInput): Promise<ChatOutput>;
}

// Re-export AgentError for convenience
export { AgentError };
