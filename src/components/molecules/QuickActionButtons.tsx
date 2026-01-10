"use client";

import * as React from "react";
import { Brain, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuickActionButtonsProps {
  /**
   * Callback when "Log Headache" button is clicked
   */
  onLogHeadache: () => void;
  /**
   * Callback when "Quick Check-in" button is clicked
   */
  onCheckIn: () => void;
  /**
   * Disable both buttons
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuickActionButtons - Primary action buttons for dashboard
 *
 * Two prominent buttons for the main user actions:
 * - Log Headache (primary) - Record a headache episode
 * - Quick Check-in (secondary) - Record wellness check-in
 *
 * Mobile-first design with large touch targets.
 * Positioned above the fold for easy access.
 *
 * @example
 * ```tsx
 * <QuickActionButtons
 *   onLogHeadache={() => router.push('/log-headache')}
 *   onCheckIn={() => router.push('/check-in')}
 * />
 * ```
 */
export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onLogHeadache,
  onCheckIn,
  disabled = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
        className,
      )}
      data-testid="quick-action-buttons"
    >
      {/* Log Headache - Primary Action */}
      <Button
        size="lg"
        onClick={onLogHeadache}
        disabled={disabled}
        className={cn(
          "h-20 sm:h-24 w-full",
          "flex flex-col items-center justify-center gap-2",
          "text-base sm:text-lg font-semibold",
          "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
          "text-white",
          "shadow-md hover:shadow-lg",
          "transition-all duration-200",
          "active:scale-95",
        )}
        aria-label="Log a headache episode"
        data-testid="log-headache-button"
      >
        <Brain className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
        <span>Log Headache</span>
      </Button>

      {/* Quick Check-in - Secondary Action */}
      <Button
        size="lg"
        variant="outline"
        onClick={onCheckIn}
        disabled={disabled}
        className={cn(
          "h-20 sm:h-24 w-full",
          "flex flex-col items-center justify-center gap-2",
          "text-base sm:text-lg font-semibold",
          "border-2 border-blue-600 dark:border-blue-500",
          "text-blue-700 dark:text-blue-400",
          "hover:bg-blue-50 dark:hover:bg-blue-950/20",
          "shadow-md hover:shadow-lg",
          "transition-all duration-200",
          "active:scale-95",
        )}
        aria-label="Record a wellness check-in"
        data-testid="check-in-button"
      >
        <ClipboardList className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
        <span>Quick Check-in</span>
      </Button>
    </div>
  );
};

QuickActionButtons.displayName = "QuickActionButtons";
