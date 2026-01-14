"use client";

import { useEffect, useState } from "react";
import { useInsightsStore } from "@/interface-adapters/store/insightsStore";
import { useLoggingStore } from "@/interface-adapters/store/loggingStore";
import { useCheckInStore } from "@/interface-adapters/store/checkinStore";
import { CalendarView } from "@/components/organisms/CalendarView";
import { CorrelationBars } from "@/components/molecules/CorrelationBars";
import {
  TrendCharts,
  type TimeFilter,
} from "@/components/molecules/TrendCharts";
import { TimeOfDayAnalysis } from "@/components/molecules/TimeOfDayAnalysis";
import { InsightCard } from "@/components/molecules/InsightCard";
import { AIInsightsCard } from "@/components/molecules/AIInsightsCard";
import { InsightsChatCard } from "@/components/molecules/InsightsChatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

/**
 * Insights & Patterns Page
 *
 * Displays comprehensive pattern analysis and insights from headache logs:
 * - Calendar view with headache intensity visualization
 * - Correlation analysis (sleep, stress, jaw tension)
 * - Trend charts over time (30/90 days, all time)
 * - Time of day analysis (donut chart)
 * - Personal insights (unlocked Week 2+)
 * - General insights (research-backed, always visible)
 *
 * Features:
 * - Mobile-first responsive layout
 * - Real-time data from IndexedDB stores
 * - Interactive visualizations
 * - Collapsible insight sections
 * - Filter tabs for time periods
 * - Accessible keyboard navigation
 * - Loading skeleton states
 *
 * Acceptance Criteria:
 * - Initializes stores on mount
 * - Refreshes insights when filter changes
 * - Shows loading skeleton while fetching
 * - Displays empty states when no data
 * - All components receive correct store data
 * - Mobile responsive layout
 * - Accessible (ARIA labels, keyboard nav)
 */
export default function InsightsPage() {
  const t = useTranslations("insights");

  // Filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(30);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [personalInsightsExpanded, setPersonalInsightsExpanded] =
    useState(false);
  const [generalInsightsExpanded, setGeneralInsightsExpanded] = useState(true);

  // Insights store state
  const {
    refreshInsights,
    isLoading,
    correlations,
    getCalendarData,
    getWeeklyTrends,
    getTimeOfDayAnalysis,
    personalInsights,
    generalInsights,
    aiInsights,
    generateAIInsights,
    checkAndGenerateWeeklyInsight,
    chat,
    sendChatMessage,
  } = useInsightsStore();

  // Store initialization functions
  const initializeLoggingDB = useLoggingStore((state) => state.initializeDB);
  const initializeCheckInDB = useCheckInStore((state) => state.initializeDB);

  // Data state
  const [calendarData, setCalendarData] = useState<
    Awaited<ReturnType<typeof getCalendarData>>
  >([]);
  const [weeklyTrends, setWeeklyTrends] = useState<
    Awaited<ReturnType<typeof getWeeklyTrends>>
  >([]);
  const [timeOfDayData, setTimeOfDayData] = useState<
    Awaited<ReturnType<typeof getTimeOfDayAnalysis>>
  >([]);

  /**
   * Initialize databases and load insights data on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize both databases
        await Promise.all([initializeLoggingDB(), initializeCheckInDB()]);

        // Refresh insights data
        await refreshInsights();

        // Load initial data
        await loadData();

        // Check if we should auto-generate weekly insight
        // This runs silently in the background
        await checkAndGenerateWeeklyInsight();
      } catch (error) {
        console.error("Failed to initialize insights page:", error);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load all data (calendar, trends, time of day)
   */
  const loadData = async () => {
    try {
      // Calculate date range for calendar (current month)
      const start = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      );
      const end = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      );

      // Fetch calendar data
      const calData = await getCalendarData(start, end);
      setCalendarData(calData);

      // Fetch weekly trends
      const trends = await getWeeklyTrends(timeFilter);
      setWeeklyTrends(trends);

      // Fetch time of day analysis
      const todData = await getTimeOfDayAnalysis();
      setTimeOfDayData(todData);
    } catch (error) {
      console.error("Failed to load insights data:", error);
    }
  };

  /**
   * Refresh calendar data when month changes
   */
  useEffect(() => {
    const loadCalendarData = async () => {
      const start = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      );
      const end = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      );
      const data = await getCalendarData(start, end);
      setCalendarData(data);
    };

    loadCalendarData();
  }, [currentMonth, getCalendarData]);

  /**
   * Refresh trends when time filter changes
   */
  useEffect(() => {
    const loadTrends = async () => {
      const trends = await getWeeklyTrends(timeFilter);
      setWeeklyTrends(trends);
    };

    loadTrends();
  }, [timeFilter, getWeeklyTrends]);

  /**
   * Handle date selection in calendar
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Future enhancement: show detailed view for selected date
  };

  /**
   * Handle month navigation in calendar
   */
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  /**
   * Handle time filter change
   */
  const handleFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
  };

  // Loading state (skeleton)
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 sm:p-6"
        data-testid="insights-page"
        role="main"
        aria-label={t("title")}
      >
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Loading announcement for screen readers */}
          <div role="status" aria-live="polite" className="sr-only">
            {t("loading")}
          </div>
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 sm:p-6 pb-24"
      data-testid="insights-page"
      role="main"
      aria-label={t("title")}
    >
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("subtitle")}
          </p>
        </header>

        {/* Filter Tabs */}
        <section aria-labelledby="filter-heading">
          <h2 id="filter-heading" className="sr-only">
            {t("timeRange")}
          </h2>
          <div
            className="flex gap-2 p-1 bg-muted rounded-lg max-w-md"
            role="tablist"
            aria-label={t("timeRange")}
          >
            <Button
              variant={timeFilter === 30 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange(30)}
              className="flex-1"
              role="tab"
              aria-selected={timeFilter === 30}
              data-testid="filter-30"
            >
              {t("days30")}
            </Button>
            <Button
              variant={timeFilter === 90 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange(90)}
              className="flex-1"
              role="tab"
              aria-selected={timeFilter === 90}
              data-testid="filter-90"
            >
              {t("days90")}
            </Button>
            <Button
              variant={timeFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("all")}
              className="flex-1"
              role="tab"
              aria-selected={timeFilter === "all"}
              data-testid="filter-all"
            >
              {t("allTime")}
            </Button>
          </div>
        </section>

        {/* Calendar Section */}
        <section
          aria-labelledby="calendar-heading"
          data-testid="calendar-section"
        >
          <h2 id="calendar-heading" className="sr-only">
            Monthly Calendar View
          </h2>
          <CalendarView
            calendarData={calendarData}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </section>

        {/* AI Insights Section */}
        <section
          aria-labelledby="ai-insights-heading"
          data-testid="ai-insights-section"
        >
          <h2 id="ai-insights-heading" className="sr-only">
            AI-Powered Insights
          </h2>
          <AIInsightsCard
            aiInsights={aiInsights}
            onGenerate={() =>
              generateAIInsights(timeFilter === "all" ? 365 : timeFilter)
            }
          />
        </section>

        {/* Chat Section */}
        <section aria-labelledby="chat-heading" data-testid="chat-section">
          <h2 id="chat-heading" className="sr-only">
            Ask About Your Data
          </h2>
          <InsightsChatCard
            messages={chat.messages}
            isLoading={chat.isLoading}
            error={chat.error}
            onSendMessage={sendChatMessage}
          />
        </section>

        {/* Correlation Section */}
        <section
          aria-labelledby="correlations-heading"
          data-testid="correlations-section"
        >
          <Card>
            <CardHeader>
              <CardTitle
                id="correlations-heading"
                className="text-xl sm:text-2xl"
              >
                {t("whatTriggers")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("correlationDesc")}
              </p>
            </CardHeader>
            <CardContent>
              <CorrelationBars correlations={correlations} />
            </CardContent>
          </Card>
        </section>

        {/* Trends Section */}
        <section aria-labelledby="trends-heading" data-testid="trends-section">
          <Card>
            <CardHeader>
              <CardTitle id="trends-heading" className="text-xl sm:text-2xl">
                {t("headachesOverTime")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t("trendsDesc")}</p>
            </CardHeader>
            <CardContent>
              <TrendCharts
                weeklyTrends={weeklyTrends}
                filter={timeFilter}
                onFilterChange={handleFilterChange}
                showIntensity={true}
              />
            </CardContent>
          </Card>
        </section>

        {/* Time of Day Section */}
        <section
          aria-labelledby="time-of-day-heading"
          data-testid="time-of-day-section"
        >
          <h2 id="time-of-day-heading" className="sr-only">
            {t("byTime")}
          </h2>
          <TimeOfDayAnalysis data={timeOfDayData} />
        </section>

        {/* Personal Insights Section (Collapsible) */}
        <section
          aria-labelledby="personal-insights-heading"
          data-testid="personal-insights-section"
        >
          <Card>
            <CardHeader>
              <button
                className={cn(
                  "w-full flex items-center justify-between text-left",
                  "focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 -m-2",
                )}
                onClick={() =>
                  setPersonalInsightsExpanded(!personalInsightsExpanded)
                }
                aria-expanded={personalInsightsExpanded}
                aria-controls="personal-insights-content"
              >
                <div>
                  <CardTitle
                    id="personal-insights-heading"
                    className="text-xl sm:text-2xl"
                  >
                    {t("personalInsights")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("personalInsightsDesc")}
                  </p>
                </div>
                {personalInsightsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            {personalInsightsExpanded && (
              <CardContent id="personal-insights-content" className="space-y-3">
                {personalInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                {personalInsights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t("noPersonalInsights")}</p>
                    <p className="text-sm mt-2">{t("keepLogging")}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </section>

        {/* General Insights Section (Collapsible) */}
        <section
          aria-labelledby="general-insights-heading"
          data-testid="general-insights-section"
        >
          <Card>
            <CardHeader>
              <button
                className={cn(
                  "w-full flex items-center justify-between text-left",
                  "focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 -m-2",
                )}
                onClick={() =>
                  setGeneralInsightsExpanded(!generalInsightsExpanded)
                }
                aria-expanded={generalInsightsExpanded}
                aria-controls="general-insights-content"
              >
                <div>
                  <CardTitle
                    id="general-insights-heading"
                    className="text-xl sm:text-2xl"
                  >
                    {t("generalInsights")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("generalInsightsDesc")}
                  </p>
                </div>
                {generalInsightsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            {generalInsightsExpanded && (
              <CardContent id="general-insights-content" className="space-y-3">
                {generalInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </CardContent>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
