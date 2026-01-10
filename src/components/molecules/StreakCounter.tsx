"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface StreakCounterProps {
  /**
   * Current streak in days
   */
  currentStreak: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * StreakCounter - Displays current streak with progress to next milestone
 *
 * Shows the current logging streak with a fire emoji and progress bar
 * indicating progress toward the next streak achievement milestone.
 *
 * Milestones: 3, 7, 14, 30, 60, 90 days
 *
 * @example
 * ```tsx
 * const currentStreak = useLoggingStore((state) => state.metadata.currentStreak);
 * <StreakCounter currentStreak={currentStreak} />
 * ```
 */
export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  className,
}) => {
  // Streak milestones for achievements
  const milestones = [3, 7, 14, 30, 60, 90];

  // Find next milestone
  const nextMilestone =
    milestones.find((m) => m > currentStreak) ||
    milestones[milestones.length - 1];

  // Calculate progress to next milestone
  const previousMilestone =
    milestones
      .slice()
      .reverse()
      .find((m) => m <= currentStreak) || 0;
  const progress =
    currentStreak >= nextMilestone
      ? 100
      : ((currentStreak - previousMilestone) /
          (nextMilestone - previousMilestone)) *
        100;

  // Determine color scheme based on streak
  const getStreakColor = () => {
    if (currentStreak === 0) return "text-gray-400";
    if (currentStreak < 7) return "text-blue-500";
    if (currentStreak < 14) return "text-green-500";
    if (currentStreak < 30) return "text-orange-500";
    return "text-red-500";
  };

  const getMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak >= nextMilestone)
      return "You've reached the max milestone!";
    const daysToGo = nextMilestone - currentStreak;
    return `${daysToGo} ${daysToGo === 1 ? "day" : "days"} to ${nextMilestone}-day streak!`;
  };

  return (
    <Card className={cn("w-full", className)} data-testid="streak-counter">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Streak display */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-3xl transition-all duration-300",
                currentStreak > 0 ? "animate-pulse" : "",
              )}
              aria-hidden="true"
            >
              {currentStreak > 0 ? "🔥" : "⚪"}
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-3xl font-bold tabular-nums transition-colors",
                    getStreakColor(),
                  )}
                >
                  {currentStreak}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStreak === 1 ? "day" : "days"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current Streak
              </p>
            </div>
          </div>

          {/* Next milestone */}
          {currentStreak < nextMilestone && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                {nextMilestone}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Next Goal
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            {getMessage()}
          </p>
        </div>

        {/* Milestone celebration */}
        {currentStreak >= nextMilestone && currentStreak > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm font-semibold text-center text-yellow-900 dark:text-yellow-100">
              🎉 Amazing! You&apos;ve reached {currentStreak} days!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

StreakCounter.displayName = "StreakCounter";
