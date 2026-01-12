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
 * Insights Store State
 */
export interface InsightsState {
  // Calendar Data
  getCalendarData: (
    startDate: Date,
    endDate: Date
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

  /**
   * Get calendar data for a date range
   */
  getCalendarData: async (
    startDate: Date,
    endDate: Date
  ): Promise<CalendarDayData[]> => {
    const headacheRepo = createHeadacheRepositoryAdapter();
    const checkinRepo = createCheckinRepositoryAdapter();

    const useCase = new GetCalendarDataUseCase(
      headacheRepo as never,
      checkinRepo as never
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
      checkinRepo as never
    );

    const correlations = await useCase.execute();
    set({ correlations });
    return correlations;
  },

  /**
   * Get weekly trends
   */
  getWeeklyTrends: async (
    filter: 30 | 90 | "all"
  ): Promise<WeeklyTrendData[]> => {
    const headacheRepo = createHeadacheRepositoryAdapter();
    const checkinRepo = createCheckinRepositoryAdapter();

    const useCase = new GetWeeklyTrendsUseCase(
      headacheRepo as never,
      checkinRepo as never
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
      const headacheRepo = createHeadacheRepositoryAdapter();
      const checkinRepo = createCheckinRepositoryAdapter();
      const insightsAgent = new InsightsAgent();

      const useCase = new GenerateAIInsightsUseCase(
        headacheRepo as never,
        checkinRepo as never,
        insightsAgent
      );

      const result = await useCase.execute({ daysToAnalyze });

      if (result.success && result.insights) {
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
            error: result.error ?? { code: "UNKNOWN", message: "Unknown error" },
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
}));
