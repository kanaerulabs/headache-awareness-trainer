"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

export interface QuickInsightCardProps {
  /**
   * AI-generated insight text to display
   */
  insight: string;
  /**
   * Optional callback when user taps to refresh insight
   */
  onRefresh?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuickInsightCard - Displays rotating AI-generated insights
 *
 * A card component that shows contextual insights about the user's headache patterns,
 * streak achievements, or general encouragement. Features a calming teal/blue gradient
 * background and optional tap-to-refresh functionality.
 *
 * @example
 * ```tsx
 * const insight = useDashboardStore((state) => state.currentInsight);
 * const refreshDashboard = useDashboardStore((state) => state.refreshDashboard);
 * <QuickInsightCard insight={insight} onRefresh={refreshDashboard} />
 * ```
 */
export const QuickInsightCard: React.FC<QuickInsightCardProps> = ({
  insight,
  onRefresh,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Card
      className={cn(
        "w-full bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950 dark:to-blue-950 border-teal-200 dark:border-teal-800",
        onRefresh && "cursor-pointer active:scale-[0.98] transition-transform",
        className,
      )}
      onClick={handleRefresh}
      role={onRefresh ? "button" : undefined}
      aria-label={onRefresh ? "Tap to refresh insight" : undefined}
      tabIndex={onRefresh ? 0 : undefined}
      onKeyDown={(e) => {
        if (onRefresh && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleRefresh();
        }
      }}
      data-testid="quick-insight-card"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 rounded-full bg-teal-100 dark:bg-teal-900 p-2 transition-transform",
              isRefreshing && "animate-pulse",
            )}
            aria-hidden="true"
          >
            <Lightbulb className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-100 mb-1">
              Quick Insight
            </h3>
            <p
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              data-testid="insight-text"
            >
              {insight}
            </p>
            {onRefresh && (
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                Tap to refresh
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

QuickInsightCard.displayName = "QuickInsightCard";
