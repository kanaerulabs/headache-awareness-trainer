"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Brain, ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export interface WeeklySummaryCardProps {
  /**
   * Number of headaches logged this week
   */
  headacheCount: number;
  /**
   * Number of check-ins completed this week
   */
  checkinCount: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * WeeklySummaryCard - Shows this week's headache and check-in counts
 *
 * A two-column card displaying weekly summary statistics for headaches
 * and check-ins. Features prominent number displays with icons.
 *
 * @example
 * ```tsx
 * const { thisWeekHeadaches, thisWeekCheckins } = useDashboardStore((state) => ({
 *   thisWeekHeadaches: state.thisWeekHeadaches,
 *   thisWeekCheckins: state.thisWeekCheckins,
 * }));
 * <WeeklySummaryCard headacheCount={thisWeekHeadaches} checkinCount={thisWeekCheckins} />
 * ```
 */
export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  headacheCount,
  checkinCount,
  className,
}) => {
  const t = useTranslations("weeklySummary");

  return (
    <Card className={cn("w-full", className)} data-testid="weekly-summary-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Headaches Column */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
            <div
              className="flex-shrink-0 rounded-full bg-red-100 dark:bg-red-900 p-2 mb-2"
              aria-hidden="true"
            >
              <Brain className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span
              className="text-3xl font-bold text-red-700 dark:text-red-300"
              data-testid="headache-count"
            >
              {headacheCount}
            </span>
            <span className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
              {headacheCount === 1 ? t("headache") : t("headaches")}
            </span>
          </div>

          {/* Check-ins Column */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-100 dark:border-teal-900">
            <div
              className="flex-shrink-0 rounded-full bg-teal-100 dark:bg-teal-900 p-2 mb-2"
              aria-hidden="true"
            >
              <ClipboardCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <span
              className="text-3xl font-bold text-teal-700 dark:text-teal-300"
              data-testid="checkin-count"
            >
              {checkinCount}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-medium">
              {checkinCount === 1 ? t("checkin") : t("checkins")}
            </span>
          </div>
        </div>

        {/* Summary text */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
          {headacheCount === 0 && checkinCount === 0
            ? t("noEntriesYet")
            : t("mondayThroughToday")}
        </p>
      </CardContent>
    </Card>
  );
};

WeeklySummaryCard.displayName = "WeeklySummaryCard";
