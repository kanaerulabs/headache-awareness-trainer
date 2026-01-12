"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";

export interface StreakDisplayProps {
  /**
   * Current streak count in days
   */
  streak: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * StreakDisplay - Shows current logging streak with visual flair
 *
 * Displays the user's consecutive days of logging with celebratory styling
 * for milestone achievements. Features a flame icon and color-coded styling
 * based on streak length.
 *
 * Milestones:
 * - 0 days: Muted gray (no streak)
 * - 1-6 days: Blue (building consistency)
 * - 7-13 days: Green (one week milestone)
 * - 14-29 days: Orange (two week milestone)
 * - 30+ days: Red/Gold (one month milestone)
 *
 * @example
 * ```tsx
 * const streak = useDashboardStore((state) => state.currentStreak);
 * <StreakDisplay streak={streak} />
 * ```
 */
export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  className,
}) => {
  const t = useTranslations("streak");

  // Determine styling based on streak milestones
  const getStreakStyle = () => {
    if (streak === 0) {
      return {
        gradient:
          "from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
        border: "border-gray-200 dark:border-gray-700",
        iconBg: "bg-gray-100 dark:bg-gray-800",
        iconColor: "text-gray-400 dark:text-gray-600",
        numberColor: "text-gray-500 dark:text-gray-400",
        textColor: "text-gray-600 dark:text-gray-500",
        labelKey: "noStreakYet" as const,
      };
    } else if (streak < 7) {
      return {
        gradient:
          "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
        border: "border-blue-200 dark:border-blue-800",
        iconBg: "bg-blue-100 dark:bg-blue-900",
        iconColor: "text-blue-500 dark:text-blue-400",
        numberColor: "text-blue-700 dark:text-blue-300",
        textColor: "text-blue-600 dark:text-blue-400",
        labelKey: "buildingConsistency" as const,
      };
    } else if (streak < 14) {
      return {
        gradient:
          "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
        border: "border-green-200 dark:border-green-800",
        iconBg: "bg-green-100 dark:bg-green-900",
        iconColor: "text-green-600 dark:text-green-400",
        numberColor: "text-green-700 dark:text-green-300",
        textColor: "text-green-600 dark:text-green-400",
        labelKey: "oneWeekMilestone" as const,
      };
    } else if (streak < 30) {
      return {
        gradient:
          "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
        border: "border-orange-200 dark:border-orange-800",
        iconBg: "bg-orange-100 dark:bg-orange-900",
        iconColor: "text-orange-600 dark:text-orange-400",
        numberColor: "text-orange-700 dark:text-orange-300",
        textColor: "text-orange-600 dark:text-orange-400",
        labelKey: "twoWeekMilestone" as const,
      };
    } else {
      return {
        gradient: "from-red-50 to-amber-50 dark:from-red-950 dark:to-amber-950",
        border: "border-red-200 dark:border-red-800",
        iconBg:
          "bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-900 dark:to-amber-900",
        iconColor: "text-red-600 dark:text-red-400",
        numberColor:
          "text-transparent bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text dark:from-red-400 dark:to-amber-400",
        textColor: "text-red-600 dark:text-red-400",
        labelKey: "oneMonthMilestone" as const,
      };
    }
  };

  const style = getStreakStyle();

  return (
    <Card
      className={cn(
        "w-full bg-gradient-to-br",
        style.gradient,
        style.border,
        className,
      )}
      data-testid="streak-display"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 rounded-full p-3 transition-all",
              style.iconBg,
              streak >= 7 && "animate-pulse",
            )}
            aria-hidden="true"
          >
            <Flame
              className={cn("h-6 w-6", style.iconColor)}
              fill={streak > 0 ? "currentColor" : "none"}
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-4xl sm:text-5xl font-bold",
                  style.numberColor,
                )}
                data-testid="streak-count"
              >
                {streak}
              </span>
              <span className={cn("text-lg", style.textColor)}>
                {streak === 1 ? t("day") : t("days")}
              </span>
            </div>
            <p className={cn("text-sm font-medium mt-1", style.textColor)}>
              {t(style.labelKey)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

StreakDisplay.displayName = "StreakDisplay";
