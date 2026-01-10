"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/interface-adapters/store/gamificationStore";

export interface CelebrationModalProps {
  /**
   * Achievement that was unlocked
   */
  achievement: Achievement | null;
  /**
   * Whether modal is open
   */
  open: boolean;
  /**
   * Callback when modal is closed
   */
  onClose: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * CelebrationModal - Modal dialog for celebrating achievement unlocks
 *
 * Displays when a user unlocks an achievement with:
 * - Achievement icon with celebration animation
 * - Achievement name and description
 * - Unlock date
 * - Encouraging message
 * - Continue button to dismiss
 *
 * @example
 * ```tsx
 * const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
 *
 * // After checking achievements
 * const newlyUnlocked = await checkAchievements(...);
 * if (newlyUnlocked.length > 0) {
 *   setCelebrationAchievement(achievements[newlyUnlocked[0]]);
 * }
 *
 * <CelebrationModal
 *   achievement={celebrationAchievement}
 *   open={!!celebrationAchievement}
 *   onClose={() => setCelebrationAchievement(null)}
 * />
 * ```
 */
export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  achievement,
  open,
  onClose,
  className,
}) => {
  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-md bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800",
          className,
        )}
        data-testid="celebration-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-center space-y-4">
            {/* Animated icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div
                  className="text-6xl animate-bounce"
                  role="img"
                  aria-label={achievement.name}
                >
                  {achievement.icon}
                </div>
                {/* Celebration sparkles */}
                <div className="absolute -top-2 -left-2 text-2xl animate-pulse">
                  ✨
                </div>
                <div className="absolute -top-2 -right-2 text-2xl animate-pulse delay-75">
                  ✨
                </div>
              </div>
            </div>

            {/* Achievement unlocked text */}
            <div className="space-y-2">
              <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                🎉 Achievement Unlocked!
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {achievement.name}
              </div>
            </div>
          </DialogTitle>

          <DialogDescription className="text-center space-y-4">
            {/* Description */}
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {achievement.description}
            </p>

            {/* Unlock date */}
            {achievement.unlockedAt && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Earned on{" "}
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}

            {/* Encouraging message */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {getEncouragingMessage(achievement.id)}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

CelebrationModal.displayName = "CelebrationModal";

/**
 * Get contextual encouraging message based on achievement
 */
function getEncouragingMessage(achievementId: string): string {
  const messages: Record<string, string> = {
    "first-entry": "Great start! Every journey begins with a single step.",
    "first-checkin": "You're building awareness! Keep checking in regularly.",
    "first-pattern":
      "Amazing! Understanding patterns is key to managing headaches.",
    "first-week": "One week down! You're building a valuable habit.",
    "streak-3-days": "Three days strong! Consistency is everything.",
    "streak-7-days": "A full week! You're becoming a tracking pro.",
    "streak-14-days": "Two weeks! Your dedication is impressive.",
    "streak-30-days": "One month! This is a true commitment to your health.",
    "streak-60-days": "Two months! You've built an incredible habit.",
    "streak-90-days": "Three months! You're a logging legend!",
    "entries-10": "10 entries logged! Patterns are starting to emerge.",
    "entries-50": "50 entries! You have valuable data to work with.",
    "entries-100": "100 entries! You're a tracking superstar!",
    "checkins-10": "10 check-ins complete! Great awareness building.",
    "checkins-50": "50 check-ins! You're staying consistent.",
    "checkins-100": "100 check-ins! Exceptional dedication!",
  };

  return (
    messages[achievementId] ||
    "Keep up the great work! You're making real progress."
  );
}
