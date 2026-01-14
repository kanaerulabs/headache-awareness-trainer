/**
 * Generate AI Insights Use Case
 *
 * Orchestrates the generation of AI-powered insights from headache and check-in data.
 * Uses the InsightsAgent adapter for LLM-powered pattern analysis.
 */

import { HeadacheEntryRepository } from "../log-headache.usecase";
import { CheckInRepository } from "../manage-checkin.usecase";
import {
  IInsightsAgent,
  InsightsOutput,
  AgentError,
} from "./interfaces/insights-agent.interface";

/**
 * Input port for generating AI insights
 */
export interface GenerateAIInsightsInput {
  /** Number of days to analyze (default: 30) */
  daysToAnalyze?: number;
  /** Additional context for the AI */
  context?: string;
  /** AI options */
  options?: {
    maxTokens?: number;
    temperature?: number;
  };
}

/**
 * Output port - result of AI insights generation
 */
export interface GenerateAIInsightsOutput {
  success: boolean;
  insights?: InsightsOutput;
  error?: {
    code: string;
    message: string;
  };
  dataStats: {
    headacheCount: number;
    checkinCount: number;
    analyzedDays: number;
  };
}

/**
 * Generate AI Insights Use Case
 *
 * Retrieves user data from repositories and passes it to the AI agent
 * for pattern analysis and personalized recommendations.
 */
export class GenerateAIInsightsUseCase {
  constructor(
    private readonly headacheRepository: HeadacheEntryRepository,
    private readonly checkinRepository: CheckInRepository,
    private readonly insightsAgent: IInsightsAgent,
  ) {}

  /**
   * Execute the use case
   */
  async execute(
    input: GenerateAIInsightsInput = {},
  ): Promise<GenerateAIInsightsOutput> {
    const daysToAnalyze = input.daysToAnalyze ?? 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    // Fetch data from repositories
    const [headacheEntries, checkinEntries] = await Promise.all([
      this.headacheRepository.findByDateRange(startDate, endDate),
      this.checkinRepository.findAll(), // Filter by date range manually
    ]);

    // Filter checkins to date range
    const filteredCheckins = checkinEntries.filter((entry) => {
      const props = entry.toPlainObject();
      return props.timestamp >= startDate && props.timestamp <= endDate;
    });

    // Check if we have enough data
    const headacheCount = headacheEntries.length;
    const checkinCount = filteredCheckins.length;

    if (headacheCount === 0 && checkinCount === 0) {
      return {
        success: false,
        error: {
          code: "INSUFFICIENT_DATA",
          message:
            "No data available for analysis. Please log some headaches or check-ins first.",
        },
        dataStats: {
          headacheCount: 0,
          checkinCount: 0,
          analyzedDays: daysToAnalyze,
        },
      };
    }

    // Transform data for the agent - convert domain types to string DTOs
    const headacheData = headacheEntries.map((entry) => {
      const props = entry.toPlainObject();
      return {
        id: props.id,
        timestamp: props.timestamp,
        intensity: props.intensity as number,
        location: props.location ? [String(props.location)] : undefined,
        triggers: props.contextTags,
        notes: props.note,
      };
    });

    const checkinData = filteredCheckins.map((entry) => {
      const props = entry.toPlainObject();
      return {
        id: props.id,
        timestamp: props.timestamp,
        sleepQuality: String(props.sleepQuality),
        mood: String(props.mood),
        bodyTension: props.bodyTension.map(String),
      };
    });

    // Call the AI agent
    try {
      const insights = await this.insightsAgent.execute({
        data: {
          headacheEntries: headacheData,
          checkinData,
        },
        context:
          input.context ??
          "Analyze this headache tracking data to identify patterns and provide actionable recommendations.",
        options: input.options,
      });

      return {
        success: true,
        insights,
        dataStats: {
          headacheCount,
          checkinCount,
          analyzedDays: daysToAnalyze,
        },
      };
    } catch (error) {
      if (error instanceof AgentError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
          dataStats: {
            headacheCount,
            checkinCount,
            analyzedDays: daysToAnalyze,
          },
        };
      }

      // Unknown error
      return {
        success: false,
        error: {
          code: "UNKNOWN",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
        dataStats: {
          headacheCount,
          checkinCount,
          analyzedDays: daysToAnalyze,
        },
      };
    }
  }
}
