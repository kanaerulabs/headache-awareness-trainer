import { create } from "zustand";
import { useLoggingStore } from "./loggingStore";
import { useCheckInStore } from "./checkinStore";
import {
  CalculateCorrelationsUseCase,
  GetWeeklyTrendsUseCase,
  GetTimeOfDayAnalysisUseCase,
  GetCalendarDataUseCase,
  CheckInsightUnlocksUseCase,
  GenerateAIInsightsUseCase,
  type CorrelationResult,
  type WeeklyTrendData,
  type TimeOfDayData,
  type CalendarDayData,
  type Insight,
  type InsightsOutput,
} from "../../usecases";
import { InsightsAgent } from "../agents/vercel-ai/insights.agent";
import { OpenRouterInsightsAgent } from "../agents/vercel-ai/openrouter-insights.agent";
import { OpenRouterChatAgent } from "../agents/vercel-ai/openrouter-chat.agent";
import { useSettingsStore } from "./settingsStore";
import type { IInsightsAgent } from "../../usecases/generate-ai-insights/interfaces/insights-agent.interface";
import type { ChatMessage } from "../../usecases/chat-insights/interfaces/chat-agent.interface";

// Re-export types for backwards compatibility
export type {
  CorrelationResult,
  WeeklyTrendData,
  TimeOfDayData,
  CalendarDayData,
  Insight,
  InsightsOutput,
};

/**
 * AI Insights State
 */
export interface AIInsightsState {
  data: InsightsOutput | null;
  isLoading: boolean;
  error: { code: string; message: string } | null;
  lastGenerated: Date | null;
}

/**
 * Chat State
 */
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: { code: string; message: string } | null;
}

// Re-export ChatMessage type
export type { ChatMessage };

/**
 * Insights Store State
 */
export interface InsightsState {
  // Calendar Data
  getCalendarData: (
    startDate: Date,
    endDate: Date,
  ) => Promise<CalendarDayData[]>;

  // Correlation Analysis
  correlations: CorrelationResult[];
  calculateCorrelations: () => Promise<CorrelationResult[]>;

  // Trend Analysis
  getWeeklyTrends: (filter: 30 | 90 | "all") => Promise<WeeklyTrendData[]>;

  // Time of Day
  getTimeOfDayAnalysis: () => Promise<TimeOfDayData[]>;

  // Insights
  personalInsights: Insight[];
  generalInsights: Insight[];
  checkInsightUnlocks: () => void;

  // AI Insights
  aiInsights: AIInsightsState;
  generateAIInsights: (daysToAnalyze?: number) => Promise<void>;
  checkAndGenerateWeeklyInsight: () => Promise<boolean>; // Returns true if generated

  // Chat
  chat: ChatState;
  sendChatMessage: (message: string) => Promise<void>;
  clearChat: () => void;

  // Data Refresh
  refreshInsights: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Create repository adapters that bridge Zustand stores to usecase interfaces
 */
const createHeadacheRepositoryAdapter = () => {
  const loggingStore = useLoggingStore.getState();

  return {
    findAll: async () => {
      const entries = await loggingStore.getAllEntries();
      return entries.map((entry) => ({
        toPlainObject: () => entry,
      }));
    },
    findByDateRange: async (startDate: Date, endDate: Date) => {
      const entries = await loggingStore.getAllEntries();
      return entries
        .filter((e) => e.timestamp >= startDate && e.timestamp <= endDate)
        .map((entry) => ({
          toPlainObject: () => entry,
        }));
    },
    save: async () => {},
    findById: async () => null,
    findRecent: async () => [],
    delete: async () => {},
  };
};

const createCheckinRepositoryAdapter = () => {
  const checkinStore = useCheckInStore.getState();

  return {
    findAll: async () => {
      const entries = await checkinStore.getAllCheckIns();
      return entries.map((entry) => ({
        toPlainObject: () => entry,
      }));
    },
    save: async () => {},
    findById: async () => null,
    findRecent: async () => [],
    findByDate: async () => [],
    delete: async () => {},
    update: async () => {},
  };
};

/**
 * Initialize insights state from CheckInsightUnlocksUseCase
 */
const insightUnlocksUseCase = new CheckInsightUnlocksUseCase();
const initialInsights = insightUnlocksUseCase.getInsights(null);

/**
 * Zustand store for insights and pattern analysis
 *
 * This store delegates all business logic to use cases in the usecases layer.
 * It only maintains UI state and orchestrates calls to the appropriate use cases.
 */
export const useInsightsStore = create<InsightsState>((set, get) => ({
  correlations: [],
  personalInsights: initialInsights.personalInsights,
  generalInsights: initialInsights.generalInsights,
  isLoading: false,
  aiInsights: {
    data: null,
    isLoading: false,
    error: null,
    lastGenerated: null,
  },
  chat: {
    messages: [],
    isLoading: false,
    error: null,
  },

  /**
   * Get calendar data for a date range
   */
  getCalendarData: async (
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarDayData[]> => {
    const headacheRepo = createHeadacheRepositoryAdapter();
    const checkinRepo = createCheckinRepositoryAdapter();

    const useCase = new GetCalendarDataUseCase(
      headacheRepo as never,
      checkinRepo as never,
    );

    return useCase.execute(startDate, endDate);
  },

  /**
   * Calculate correlations between factors and headaches
   */
  calculateCorrelations: async (): Promise<CorrelationResult[]> => {
    const headacheRepo = createHeadacheRepositoryAdapter();
    const checkinRepo = createCheckinRepositoryAdapter();

    const useCase = new CalculateCorrelationsUseCase(
      headacheRepo as never,
      checkinRepo as never,
    );

    const correlations = await useCase.execute();
    set({ correlations });
    return correlations;
  },

  /**
   * Get weekly trends
   */
  getWeeklyTrends: async (
    filter: 30 | 90 | "all",
  ): Promise<WeeklyTrendData[]> => {
    const headacheRepo = createHeadacheRepositoryAdapter();
    const checkinRepo = createCheckinRepositoryAdapter();

    const useCase = new GetWeeklyTrendsUseCase(
      headacheRepo as never,
      checkinRepo as never,
    );

    return useCase.execute(filter);
  },

  /**
   * Get time of day analysis
   */
  getTimeOfDayAnalysis: async (): Promise<TimeOfDayData[]> => {
    const headacheRepo = createHeadacheRepositoryAdapter();

    const useCase = new GetTimeOfDayAnalysisUseCase(headacheRepo as never);

    return useCase.execute();
  },

  /**
   * Check and update insight unlocks
   */
  checkInsightUnlocks: () => {
    const loggingStore = useLoggingStore.getState();
    const metadata = loggingStore.metadata;

    const registrationDate = metadata?.registrationDate
      ? new Date(metadata.registrationDate)
      : null;

    const useCase = new CheckInsightUnlocksUseCase();
    const insights = useCase.getInsights(registrationDate);

    set({
      personalInsights: insights.personalInsights,
      generalInsights: insights.generalInsights,
    });
  },

  /**
   * Generate AI-powered insights using LLM
   * Uses the provider and model selected in settings
   */
  generateAIInsights: async (daysToAnalyze = 30) => {
    set({
      aiInsights: {
        ...get().aiInsights,
        isLoading: true,
        error: null,
      },
    });

    try {
      // Get AI settings from settings store
      const settingsState = useSettingsStore.getState();
      const {
        aiProvider,
        selectedModel,
        getActiveApiKey,
        hasApiKey,
        canRequestInsight,
        recordInsightRequest,
        getRemainingInsights,
        getTimeUntilReset,
      } = settingsState;

      // Check rate limiting first
      if (!canRequestInsight()) {
        const remaining = getRemainingInsights();
        const resetMs = getTimeUntilReset();
        const resetMinutes = Math.ceil(resetMs / 60000);
        set({
          aiInsights: {
            ...get().aiInsights,
            isLoading: false,
            error: {
              code: "RATE_LIMITED",
              message: `Rate limit reached (${remaining}/5 insights remaining). Try again in ${resetMinutes} minutes.`,
            },
          },
        });
        return;
      }

      // Check if API key is configured
      if (!hasApiKey()) {
        set({
          aiInsights: {
            ...get().aiInsights,
            isLoading: false,
            error: {
              code: "AUTH_ERROR",
              message: `No API key configured. Please add your ${aiProvider === "openai" ? "OpenAI" : "OpenRouter"} API key in Settings.`,
            },
          },
        });
        return;
      }

      const apiKey = getActiveApiKey();

      // Create the appropriate agent based on provider
      let insightsAgent: IInsightsAgent;
      if (aiProvider === "openrouter") {
        insightsAgent = new OpenRouterInsightsAgent(apiKey, selectedModel);
      } else {
        // OpenAI - use the original agent (it uses env var for key currently)
        // For OpenAI, we need to set the env var or pass the key
        // Since InsightsAgent uses openai() from @ai-sdk/openai which reads OPENAI_API_KEY,
        // we'll need to update that agent too for custom key support
        // For now, fall back to env-based OpenAI if openai provider selected
        insightsAgent = new InsightsAgent();
      }

      const headacheRepo = createHeadacheRepositoryAdapter();
      const checkinRepo = createCheckinRepositoryAdapter();

      const useCase = new GenerateAIInsightsUseCase(
        headacheRepo as never,
        checkinRepo as never,
        insightsAgent,
      );

      const result = await useCase.execute({ daysToAnalyze });

      if (result.success && result.insights) {
        // Record the successful request for rate limiting
        recordInsightRequest();
        set({
          aiInsights: {
            data: result.insights,
            isLoading: false,
            error: null,
            lastGenerated: new Date(),
          },
        });
      } else {
        set({
          aiInsights: {
            ...get().aiInsights,
            isLoading: false,
            error: result.error ?? {
              code: "UNKNOWN",
              message: "Unknown error",
            },
          },
        });
      }
    } catch (error) {
      console.error("Failed to generate AI insights:", error);
      set({
        aiInsights: {
          ...get().aiInsights,
          isLoading: false,
          error: {
            code: "UNKNOWN",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
      });
    }
  },

  /**
   * Refresh all insights data
   */
  refreshInsights: async () => {
    set({ isLoading: true });

    try {
      // Calculate correlations
      await get().calculateCorrelations();

      // Update insight unlocks
      get().checkInsightUnlocks();

      set({ isLoading: false });
    } catch (error) {
      console.error("Failed to refresh insights:", error);
      set({ isLoading: false });
    }
  },

  /**
   * Send a single question and get AI response (single-question mode, no follow-ups)
   * Clears previous chat history to enforce single-question only
   */
  sendChatMessage: async (message: string) => {
    // Single-question mode: clear previous messages and show only current Q&A
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    // Replace previous messages with just the current question
    set({
      chat: {
        messages: [userMessage],
        isLoading: true,
        error: null,
      },
    });

    try {
      // Get AI settings
      const settingsState = useSettingsStore.getState();
      const {
        aiProvider,
        selectedModel,
        getActiveApiKey,
        hasApiKey,
        canRequestInsight,
        recordInsightRequest,
        getRemainingInsights,
        getTimeUntilReset,
      } = settingsState;

      // Check rate limiting first
      if (!canRequestInsight()) {
        const remaining = getRemainingInsights();
        const resetMs = getTimeUntilReset();
        const resetMinutes = Math.ceil(resetMs / 60000);
        set({
          chat: {
            ...get().chat,
            isLoading: false,
            error: {
              code: "RATE_LIMITED",
              message: `Rate limit reached (${remaining}/5 requests remaining). Try again in ${resetMinutes} minutes.`,
            },
          },
        });
        return;
      }

      if (!hasApiKey()) {
        set({
          chat: {
            ...get().chat,
            isLoading: false,
            error: {
              code: "AUTH_ERROR",
              message: `No API key configured. Please add your ${aiProvider === "openai" ? "OpenAI" : "OpenRouter"} API key in Settings.`,
            },
          },
        });
        return;
      }

      const apiKey = getActiveApiKey();

      // Create chat agent (only OpenRouter supported for now)
      const chatAgent = new OpenRouterChatAgent(apiKey, selectedModel);

      // Get health data for context
      const headacheRepo = createHeadacheRepositoryAdapter();
      const checkinRepo = createCheckinRepositoryAdapter();

      const [headacheEntries, checkinEntries] = await Promise.all([
        headacheRepo.findAll(),
        checkinRepo.findAll(),
      ]);

      // Transform for chat agent
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

      const checkinData = checkinEntries.map((entry) => {
        const props = entry.toPlainObject();
        return {
          id: props.id,
          timestamp: props.timestamp,
          sleepQuality: String(props.sleepQuality),
          mood: String(props.mood),
          bodyTension: props.bodyTension.map(String),
        };
      });

      // Build summary stats
      const summary =
        headacheData.length > 0
          ? {
              totalHeadaches: headacheData.length,
              averageIntensity:
                headacheData.reduce((sum, h) => sum + h.intensity, 0) /
                headacheData.length,
              mostCommonTriggers: getMostCommonTriggers(headacheData),
              dateRange: {
                start: new Date(
                  Math.min(...headacheData.map((h) => h.timestamp.getTime())),
                ),
                end: new Date(
                  Math.max(...headacheData.map((h) => h.timestamp.getTime())),
                ),
              },
            }
          : undefined;

      // Single-question mode: no conversation history passed
      const response = await chatAgent.execute({
        message,
        conversationHistory: [], // Always empty for single-question mode
        healthData: {
          headacheEntries: headacheData,
          checkinData,
          summary,
        },
      });

      // Record the successful request for rate limiting
      recordInsightRequest();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      set({
        chat: {
          messages: [userMessage, assistantMessage],
          isLoading: false,
          error: null,
        },
      });
    } catch (error) {
      console.error("Failed to send chat message:", error);
      set({
        chat: {
          ...get().chat,
          isLoading: false,
          error: {
            code: "UNKNOWN",
            message:
              error instanceof Error ? error.message : "Failed to get response",
          },
        },
      });
    }
  },

  /**
   * Clear chat history
   */
  clearChat: () => {
    set({
      chat: {
        messages: [],
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Check if weekly insight should be generated and generate if needed
   * This should be called on app initialization (e.g., insights page load)
   * Returns true if a new weekly insight was generated
   */
  checkAndGenerateWeeklyInsight: async (): Promise<boolean> => {
    const settingsState = useSettingsStore.getState();
    const {
      shouldGenerateWeeklyInsight,
      setLastWeeklyInsightDate,
      hasApiKey,
      canRequestInsight,
    } = settingsState;

    // Skip if no API key configured
    if (!hasApiKey()) {
      return false;
    }

    // Skip if rate limited
    if (!canRequestInsight()) {
      return false;
    }

    // Check if it's time for weekly insight
    if (!shouldGenerateWeeklyInsight()) {
      return false;
    }

    // Check if we have enough data (at least 3 entries in the past week)
    const headacheRepo = createHeadacheRepositoryAdapter();
    const entries = await headacheRepo.findAll();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentEntries = entries.filter((e) => {
      const props = e.toPlainObject();
      return props.timestamp >= oneWeekAgo;
    });

    if (recentEntries.length < 3) {
      // Not enough data for meaningful weekly insight
      return false;
    }

    // Generate the weekly insight (analyze last 7 days)
    await get().generateAIInsights(7);

    // Update the last weekly insight date
    const today = new Date().toISOString().split("T")[0];
    setLastWeeklyInsightDate(today);

    return true;
  },
}));

/**
 * Helper to get most common triggers from headache entries
 */
function getMostCommonTriggers(
  entries: Array<{ triggers?: string[] }>,
): string[] {
  const triggerCounts: Record<string, number> = {};
  for (const entry of entries) {
    for (const trigger of entry.triggers ?? []) {
      triggerCounts[trigger] = (triggerCounts[trigger] ?? 0) + 1;
    }
  }
  return Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger]) => trigger);
}
