"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { Achievement } from "@/interface-adapters/store/gamificationStore";

export interface AchievementBadgeProps {
  /**
   * Achievement data to display
   */
  achievement: Achievement;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when achievement is clicked
   */
  onClick?: () => void;
}

/**
 * AchievementBadge - Displays individual achievement with locked/unlocked state
 *
 * Shows achievement icon, name, description, and unlock date (if unlocked).
 * Locked achievements appear muted with a lock icon overlay.
 *
 * @example
 * ```tsx
 * const achievement = useGamificationStore((state) => state.achievements["streak-7-days"]);
 * <AchievementBadge achievement={achievement} />
 * ```
 */
export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  className,
  onClick,
}) => {
  const isLocked = !achievement.isUnlocked;

  return (
    <Card
      className={cn(
        "w-full transition-all duration-200",
        isLocked
          ? "opacity-50 grayscale bg-gray-50 dark:bg-gray-900"
          : "hover:shadow-md cursor-pointer",
        onClick && !isLocked && "active:scale-[0.98]",
        className,
      )}
      onClick={() => !isLocked && onClick?.()}
      role={onClick && !isLocked ? "button" : undefined}
      tabIndex={onClick && !isLocked ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isLocked && onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      data-testid="achievement-badge"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon with lock overlay */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full text-2xl",
                isLocked
                  ? "bg-gray-200 dark:bg-gray-800"
                  : "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900",
              )}
              aria-hidden="true"
            >
              {achievement.icon}
            </div>
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isLocked
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-gray-900 dark:text-gray-100",
                )}
              >
                {achievement.name}
              </h3>
              {!isLocked && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  Unlocked
                </Badge>
              )}
            </div>

            <p
              className={cn(
                "text-xs leading-relaxed mb-2",
                isLocked
                  ? "text-gray-500 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-300",
              )}
            >
              {achievement.description}
            </p>

            {!isLocked && achievement.unlockedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Earned {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
            {isLocked && (
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                Keep going to unlock
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

AchievementBadge.displayName = "AchievementBadge";
