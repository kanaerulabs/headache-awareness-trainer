"use client";

import * as React from "react";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Trend = "improving" | "stable" | "declining";

export interface TrendIndicatorProps {
  /**
   * Current trend status
   */
  trend: Trend;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show text label alongside icon
   * @default true
   */
  showLabel?: boolean;
}

const trendConfig = {
  improving: {
    icon: TrendingUp,
    label: "Improving",
    color: "text-green-600 dark:text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  stable: {
    icon: Minus,
    label: "Stable",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-700",
  },
  declining: {
    icon: TrendingDown,
    label: "Declining",
    color: "text-amber-600 dark:text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
} as const;

/**
 * TrendIndicator - Visual indicator showing headache trend direction
 *
 * Displays an icon and label indicating whether headaches are:
 * - Improving (green arrow up)
 * - Stable (gray horizontal line)
 * - Declining (amber arrow down - not red to reduce alarm)
 *
 * Fully accessible with proper ARIA labels and color-contrast.
 *
 * @example
 * ```tsx
 * <TrendIndicator trend="improving" />
 * <TrendIndicator trend="stable" showLabel={false} />
 * <TrendIndicator trend="declining" />
 * ```
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  className,
  showLabel = true,
}) => {
  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2",
        config.bgColor,
        config.borderColor,
        className,
      )}
      role="status"
      aria-label={`Headache trend: ${config.label}`}
      data-testid="trend-indicator"
    >
      <Icon className={cn("h-5 w-5", config.color)} aria-hidden="true" />
      {showLabel && (
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
};

TrendIndicator.displayName = "TrendIndicator";
