"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/interface-adapters/store/dashboardStore";
import { useLoggingStore } from "@/interface-adapters/store/loggingStore";
import { useCheckInStore } from "@/interface-adapters/store/checkinStore";
import { QuickInsightCard } from "@/components/molecules/QuickInsightCard";
import { StreakDisplay } from "@/components/molecules/StreakDisplay";
import { WeeklySummaryCard } from "@/components/molecules/WeeklySummaryCard";
import { TrendIndicator } from "@/components/molecules/TrendIndicator";
import { QuickActionButtons } from "@/components/molecules/QuickActionButtons";
import {
  RecentEntriesList,
  type RecentEntry,
} from "@/components/molecules/RecentEntriesList";

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

  // Dashboard store state
  const {
    currentStreak,
    thisWeekHeadaches,
    thisWeekCheckins,
    trend,
    currentInsight,
    recentEntries,
    isLoading,
    refreshDashboard,
  } = useDashboardStore();

  // Store initialization functions
  const initializeLoggingDB = useLoggingStore((state) => state.initializeDB);
  const initializeCheckInDB = useCheckInStore((state) => state.initializeDB);

  /**
   * Initialize databases and load dashboard data on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize both databases
        await Promise.all([initializeLoggingDB(), initializeCheckInDB()]);

        // Refresh dashboard data after stores are initialized
        await refreshDashboard();
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
      }
    };

    initialize();
  }, [initializeLoggingDB, initializeCheckInDB, refreshDashboard]);

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
   * Transform CombinedEntry[] to RecentEntry[] format
   */
  const transformedRecentEntries: RecentEntry[] = recentEntries.map(
    (combinedEntry) => {
      if (combinedEntry.type === "headache") {
        const entry = combinedEntry.entry;
        // Generate summary from headache entry
        const intensityLabels = {
          1: "Very mild",
          2: "Mild",
          3: "Moderate",
          4: "Severe",
          5: "Very severe",
        } as const;

        const intensityText = intensityLabels[entry.intensity] || "Unknown";
        const typeText = entry.headacheType ? ` ${entry.headacheType}` : "";
        const summary = `${intensityText}${typeText} headache`;

        return {
          id: entry.id,
          type: "headache" as const,
          timestamp: entry.timestamp,
          summary,
        };
      } else {
        // Check-in entry
        const entry = combinedEntry.entry;
        // Generate summary from check-in entry
        const moodLabels = {
          calm: "Feeling calm",
          ok: "Feeling okay",
          stressed: "Feeling stressed",
          anxious: "Feeling anxious",
          avoidant: "Feeling avoidant",
        } as const;

        const summary = entry.isQuickDismiss
          ? "Quick check-in: All good!"
          : moodLabels[entry.mood] || "Check-in";

        return {
          id: entry.id,
          type: "checkin" as const,
          timestamp: entry.timestamp,
          summary,
        };
      }
    },
  );

  // Loading state (skeleton)
  if (isLoading) {
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
            Loading dashboard...
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
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your headache awareness journey
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
