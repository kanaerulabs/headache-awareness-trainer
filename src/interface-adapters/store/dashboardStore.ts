import { create } from "zustand";
import { useLoggingStore, HeadacheEntry } from "./loggingStore";
import { useCheckInStore, CheckInEntry } from "./checkinStore";

/**
 * Trend type for dashboard
 */
export type TrendType = "improving" | "stable" | "declining";

/**
 * Combined entry type for recent activity
 */
export type CombinedEntry =
  | { type: "headache"; entry: HeadacheEntry }
  | { type: "checkin"; entry: CheckInEntry };

/**
 * Dashboard Store State
 */
export interface DashboardState {
  // Computed/Aggregated data
  currentStreak: number;
  thisWeekHeadaches: number;
  thisWeekCheckins: number;
  trend: TrendType;
  currentInsight: string;
  recentEntries: CombinedEntry[];

  // Loading state
  isLoading: boolean;

  // Actions
  refreshDashboard: () => Promise<void>;
  calculateTrend: () => Promise<TrendType>;
  generateInsight: () => string;
  getRecentEntries: (limit: number) => Promise<CombinedEntry[]>;
}

/**
 * Get date range for current week (Monday to today)
 */
const getThisWeekDateRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6

  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(23, 59, 59, 999);

  return { start: monday, end: today };
};

/**
 * Get date range for last week (Monday to Sunday)
 */
const getLastWeekDateRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - diff - 7);
  lastMonday.setHours(0, 0, 0, 0);

  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);

  return { start: lastMonday, end: lastSunday };
};

/**
 * Count entries within a date range
 */
const countEntriesInRange = (
  entries: { timestamp: Date }[],
  start: Date,
  end: Date,
): number => {
  return entries.filter((entry) => {
    const timestamp = entry.timestamp.getTime();
    return timestamp >= start.getTime() && timestamp <= end.getTime();
  }).length;
};

/**
 * Zustand store for dashboard aggregated data
 */
export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  currentStreak: 0,
  thisWeekHeadaches: 0,
  thisWeekCheckins: 0,
  trend: "stable",
  currentInsight: "Welcome! Start tracking to see your progress.",
  recentEntries: [],
  isLoading: false,

  /**
   * Refresh all dashboard data
   */
  refreshDashboard: async () => {
    set({ isLoading: true });

    try {
      // Get streak from logging store metadata
      const loggingMetadata = useLoggingStore.getState().metadata;
      const currentStreak = loggingMetadata.currentStreak;

      // Get this week's data
      const thisWeek = getThisWeekDateRange();

      // Get all headache entries and count this week's
      const allHeadacheEntries = await useLoggingStore
        .getState()
        .getAllEntries();
      const thisWeekHeadaches = countEntriesInRange(
        allHeadacheEntries,
        thisWeek.start,
        thisWeek.end,
      );

      // Get all check-in entries and count this week's
      const allCheckInEntries = await useCheckInStore
        .getState()
        .getAllCheckIns();
      const thisWeekCheckins = countEntriesInRange(
        allCheckInEntries,
        thisWeek.start,
        thisWeek.end,
      );

      // Calculate trend
      const trend = await get().calculateTrend();

      // Get recent entries
      const recentEntries = await get().getRecentEntries(5);

      // Generate insight
      const currentInsight = get().generateInsight();

      // Update state
      set({
        currentStreak,
        thisWeekHeadaches,
        thisWeekCheckins,
        trend,
        currentInsight,
        recentEntries,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
      set({ isLoading: false });
    }
  },

  /**
   * Calculate trend based on this week vs last week headache count
   */
  calculateTrend: async (): Promise<TrendType> => {
    try {
      const allHeadacheEntries = await useLoggingStore
        .getState()
        .getAllEntries();

      const thisWeek = getThisWeekDateRange();
      const lastWeek = getLastWeekDateRange();

      const thisWeekCount = countEntriesInRange(
        allHeadacheEntries,
        thisWeek.start,
        thisWeek.end,
      );
      const lastWeekCount = countEntriesInRange(
        allHeadacheEntries,
        lastWeek.start,
        lastWeek.end,
      );

      // If last week had no entries, can't determine trend
      if (lastWeekCount === 0) {
        return thisWeekCount === 0 ? "stable" : "declining";
      }

      // Calculate percentage change
      const percentageChange =
        ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;

      // Determine trend based on 20% threshold
      if (percentageChange <= -20) {
        return "improving"; // Fewer headaches = improving
      } else if (percentageChange >= 20) {
        return "declining"; // More headaches = declining
      } else {
        return "stable";
      }
    } catch (error) {
      console.error("Failed to calculate trend:", error);
      return "stable";
    }
  },

  /**
   * Generate contextual insight based on user data
   */
  generateInsight: (): string => {
    const { currentStreak, thisWeekHeadaches, thisWeekCheckins, trend } = get();
    const loggingMetadata = useLoggingStore.getState().metadata;
    const totalEntries = loggingMetadata.totalEntries;

    // No data yet
    if (totalEntries === 0 && thisWeekCheckins === 0) {
      return "Welcome! Start tracking to see your progress.";
    }

    // Prioritize streak achievements
    if (currentStreak >= 30) {
      return `Amazing! You've maintained a ${currentStreak}-day streak. You're building incredible awareness!`;
    } else if (currentStreak >= 14) {
      return `Excellent! ${currentStreak} days of consistent tracking. Keep it up!`;
    } else if (currentStreak >= 7) {
      return `Great job! You've logged consistently for ${currentStreak} days - building great awareness!`;
    } else if (currentStreak >= 3) {
      return `You're on a ${currentStreak}-day streak! Consistency is key to understanding your patterns.`;
    }

    // Trend-based insights
    if (trend === "improving") {
      return "Great job! Your headache frequency is down this week.";
    } else if (trend === "declining") {
      return "Your headache frequency increased this week. Let's identify patterns together.";
    }

    // Check-in specific insights
    if (thisWeekCheckins >= 5 && thisWeekHeadaches < thisWeekCheckins) {
      return "Morning check-ins help identify patterns early. Great proactive tracking!";
    } else if (thisWeekCheckins > 0) {
      return `You've completed ${thisWeekCheckins} check-ins this week. Consistent tracking reveals helpful patterns.`;
    }

    // General encouragement
    if (thisWeekHeadaches === 0) {
      return "No headaches logged this week - that's wonderful!";
    } else if (thisWeekHeadaches === 1) {
      return "Only one headache this week. Keep tracking to spot what helps!";
    } else {
      return `${thisWeekHeadaches} headaches logged this week. Tracking helps us find your triggers.`;
    }
  },

  /**
   * Get recent entries from both stores, combined and sorted
   */
  getRecentEntries: async (limit: number): Promise<CombinedEntry[]> => {
    try {
      // Get recent headache entries
      const headacheEntries = await useLoggingStore
        .getState()
        .getRecentEntries(limit);

      // Get recent check-in entries
      const checkInEntries = await useCheckInStore
        .getState()
        .getRecentCheckIns(limit);

      // Combine entries with type tags
      const combined: CombinedEntry[] = [
        ...headacheEntries.map(
          (entry): CombinedEntry => ({ type: "headache", entry }),
        ),
        ...checkInEntries.map(
          (entry): CombinedEntry => ({ type: "checkin", entry }),
        ),
      ];

      // Sort by timestamp descending
      combined.sort((a, b) => {
        const aTime = a.entry.timestamp.getTime();
        const bTime = b.entry.timestamp.getTime();
        return bTime - aTime;
      });

      // Return limited results
      return combined.slice(0, limit);
    } catch (error) {
      console.error("Failed to get recent entries:", error);
      return [];
    }
  },
}));
