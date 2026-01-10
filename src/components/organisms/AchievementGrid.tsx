"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementBadge } from "@/components/molecules/AchievementBadge";
import { cn } from "@/lib/utils";
import {
  useGamificationStore,
  type Achievement,
  type AchievementType,
} from "@/interface-adapters/store/gamificationStore";

export interface AchievementGridProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when achievement is clicked
   */
  onAchievementClick?: (achievement: Achievement) => void;
}

/**
 * AchievementGrid - Grid display of all achievements organized by category
 *
 * Displays achievements in three categories:
 * - Streak achievements (3, 7, 14, 30, 60, 90 days)
 * - First Actions (first entry, check-in, pattern, week)
 * - Milestones (entry/check-in counts)
 *
 * Integrates with gamificationStore to show real-time unlock status.
 *
 * @example
 * ```tsx
 * <AchievementGrid
 *   onAchievementClick={(achievement) => {
 *     // Show achievement details in modal
 *     showCelebrationModal(achievement);
 *   }}
 * />
 * ```
 */
export const AchievementGrid: React.FC<AchievementGridProps> = ({
  className,
  onAchievementClick,
}) => {
  const achievements = useGamificationStore((state) => state.achievements);

  // Group achievements by category
  const streakAchievements: AchievementType[] = [
    "streak-3-days",
    "streak-7-days",
    "streak-14-days",
    "streak-30-days",
    "streak-60-days",
    "streak-90-days",
  ];

  const firstActionAchievements: AchievementType[] = [
    "first-entry",
    "first-checkin",
    "first-pattern",
    "first-week",
  ];

  const milestoneAchievements: AchievementType[] = [
    "entries-10",
    "entries-50",
    "entries-100",
    "checkins-10",
    "checkins-50",
    "checkins-100",
  ];

  // Calculate progress stats
  const totalAchievements = Object.keys(achievements).length;
  const unlockedCount = Object.values(achievements).filter(
    (a) => a.isUnlocked,
  ).length;
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);

  const renderCategory = (
    title: string,
    achievementIds: AchievementType[],
    icon: string,
  ) => {
    const categoryAchievements = achievementIds.map((id) => achievements[id]);
    const categoryUnlocked = categoryAchievements.filter(
      (a) => a.isUnlocked,
    ).length;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              {icon}
            </span>
            {title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {categoryUnlocked}/{categoryAchievements.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              onClick={() => onAchievementClick?.(achievement)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)} data-testid="achievement-grid">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Achievements</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
              {unlockedCount}/{totalAchievements}
            </span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-500">
              ({progressPercent}%)
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak achievements */}
        {renderCategory("Streak Achievements", streakAchievements, "🔥")}

        {/* First actions */}
        {renderCategory("First Actions", firstActionAchievements, "🌟")}

        {/* Milestones */}
        {renderCategory("Milestones", milestoneAchievements, "🏆")}
      </CardContent>
    </Card>
  );
};

AchievementGrid.displayName = "AchievementGrid";
