"use client";

import { useRouter } from "next/navigation";
import { useDashboard } from "@/interface-adapters/hooks/useDashboard";
import { QuickInsightCard } from "@/components/molecules/QuickInsightCard";
import { StreakDisplay } from "@/components/molecules/StreakDisplay";
import { WeeklySummaryCard } from "@/components/molecules/WeeklySummaryCard";
import { TrendIndicator } from "@/components/molecules/TrendIndicator";
import { QuickActionButtons } from "@/components/molecules/QuickActionButtons";
import {
  RecentEntriesList,
  type RecentEntry,
} from "@/components/molecules/RecentEntriesList";
import { HeadacheEntryProps } from "@/domains/headache-entry/headache-entry.entity";
import { CheckInProps } from "@/domains/checkin/checkin.entity";
import { useTranslations } from "next-intl";

type IntensityKey = 1 | 2 | 3 | 4 | 5;
type MoodKey = "calm" | "ok" | "stressed" | "anxious" | "avoidant";
type TrendDirection = "improving" | "stable" | "declining";

/**
 * Generate insight message based on current data
 */
function getInsightMessage(
  streak: number,
  trend: TrendDirection,
  headacheCount: number,
  t: ReturnType<typeof useTranslations<"dashboard">>
): string {
  if (streak >= 7) {
    return t("insights.greatStreak", { days: streak });
  }
  if (trend === "improving") {
    return t("insights.improving");
  }
  if (trend === "declining" && headacheCount > 3) {
    return t("insights.concerningTrend");
  }
  if (headacheCount === 0) {
    return t("insights.noHeadachesThisWeek");
  }
  return t("insights.keepTracking");
}

/**
 * Dashboard / Home Screen
 *
 * Main landing screen displaying:
 * - Quick insight card (AI-generated insights or status)
 * - Current streak display (consecutive days logged)
 * - Weekly summary (headaches & check-ins this week)
 * - Trend indicator (improving/stable/declining)
 * - Quick action buttons (Log Headache, Quick Check-in)
 * - Recent entries list (last 5 combined entries)
 *
 * Features:
 * - Real-time data aggregation from IndexedDB
 * - Streak calculation logic
 * - Trend analysis from historical data
 * - Mobile-first responsive layout
 * - Accessible keyboard navigation
 *
 * Acceptance Criteria:
 * - Dashboard loads with current stats within 1 second
 * - All components receive correct data from store
 * - Navigation to /log and /checkin works
 * - Mobile responsive layout
 * - Accessible (keyboard nav, screen reader)
 */
export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations("dashboard");

  // Use Clean Architecture hook for dashboard data
  const {
    isReady,
    isLoading,
    data,
    refreshDashboard,
  } = useDashboard();

  // Extract data with defaults
  const currentStreak = data?.streak.currentStreak ?? 0;
  const thisWeekHeadaches = data?.weeklySummary.headacheCount ?? 0;
  const thisWeekCheckins = data?.weeklySummary.checkInCount ?? 0;
  const trend = data?.trend ?? "stable";
  const recentEntries = data?.recentEntries ?? [];

  // Generate insight message based on streak and trend
  const currentInsight = getInsightMessage(currentStreak, trend, thisWeekHeadaches, t);

  /**
   * Navigate to Log Headache page
   */
  const handleLogHeadache = () => {
    router.push("/log");
  };

  /**
   * Navigate to Quick Check-in page
   */
  const handleCheckIn = () => {
    router.push("/checkin");
  };

  /**
   * Navigate to entry detail page (if implemented)
   */
  const handleEntryClick = (id: string) => {
    // Future enhancement: navigate to entry detail page
    console.log("Entry clicked:", id);
    // router.push(`/entry/${id}`);
  };

  /**
   * Transform recent entries to RecentEntry[] format
   * The use case returns entries with _type property
   */
  const transformedRecentEntries: RecentEntry[] = recentEntries.map(
    (entry) => {
      // Type guard to check if it's a headache entry
      const isHeadache = "_type" in entry && entry._type === "headache" || "intensity" in entry;

      if (isHeadache) {
        const headacheEntry = entry as HeadacheEntryProps & { _type?: string };
        // Generate summary from headache entry using translations
        const intensityKey = headacheEntry.intensity as IntensityKey;
        const intensityText = t(`intensityLabels.${intensityKey}`);
        const typeText = headacheEntry.headacheType ? ` ${headacheEntry.headacheType}` : "";
        const summary = `${intensityText}${typeText} ${t("headache")}`;

        return {
          id: headacheEntry.id,
          type: "headache" as const,
          timestamp: headacheEntry.timestamp,
          summary,
        };
      } else {
        // Check-in entry
        const checkInEntry = entry as CheckInProps & { _type?: string };
        // Generate summary from check-in entry using translations
        const summary = checkInEntry.isQuickDismiss
          ? t("quickCheckinAllGood")
          : t(`moodLabels.${checkInEntry.mood as MoodKey}`);

        return {
          id: checkInEntry.id,
          type: "checkin" as const,
          timestamp: checkInEntry.timestamp,
          summary,
        };
      }
    },
  );

  // Loading state (skeleton) - show while initializing or loading data
  if (!isReady || isLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 sm:p-6"
        data-testid="dashboard-page"
        role="main"
        aria-label="Dashboard"
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Loading announcement for screen readers */}
          <div role="status" aria-live="polite" className="sr-only">
            {t("loadingDashboard")}
          </div>
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 sm:p-6"
      data-testid="dashboard-page"
      role="main"
      aria-label="Dashboard"
    >
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Title */}
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("subtitle")}
          </p>
        </header>

        {/* Quick Insight Card */}
        <QuickInsightCard
          insight={currentInsight}
          onRefresh={refreshDashboard}
        />

        {/* Stats Grid: Streak, Trend, Weekly Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Streak Display */}
          <div className="lg:col-span-1">
            <StreakDisplay streak={currentStreak} />
          </div>

          {/* Trend Indicator + Weekly Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Trend Indicator */}
            <div className="flex justify-center sm:justify-start">
              <TrendIndicator trend={trend} />
            </div>

            {/* Weekly Summary Card */}
            <WeeklySummaryCard
              headacheCount={thisWeekHeadaches}
              checkinCount={thisWeekCheckins}
            />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="sr-only">
            Quick Actions
          </h2>
          <QuickActionButtons
            onLogHeadache={handleLogHeadache}
            onCheckIn={handleCheckIn}
          />
        </section>

        {/* Recent Entries List */}
        <section aria-labelledby="recent-activity-heading">
          <h2 id="recent-activity-heading" className="sr-only">
            Recent Activity
          </h2>
          <RecentEntriesList
            entries={transformedRecentEntries}
            onEntryClick={handleEntryClick}
          />
        </section>

        {/* Educational Content Shortcuts - Future Enhancement */}
        {/* Placeholder for educational content cards */}

        {/* Gamification Badges - Future Enhancement */}
        {/* Placeholder for achievement badges */}
      </div>
    </div>
  );
}
