"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type CorrelationFactor =
  | "sleep"
  | "stress"
  | "jawTension"
  | "mood"
  | "timeOfDay";
export type CorrelationTrend = "positive" | "negative" | "neutral";

export interface CorrelationResult {
  /**
   * Factor being correlated (sleep, stress, etc.)
   */
  factor: CorrelationFactor;
  /**
   * Correlation strength from 0-100
   */
  strength: number;
  /**
   * Trend direction (positive = more of this → more headaches)
   */
  trend: CorrelationTrend;
  /**
   * Human-readable description of the correlation
   */
  description: string;
}

export interface CorrelationBarsProps {
  /**
   * Array of correlation results to display
   */
  correlations: CorrelationResult[];
  /**
   * Callback when user taps a correlation bar
   */
  onCorrelationTap?: (factor: CorrelationFactor) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Factor label keys for translation
const factorLabelKeys: Record<CorrelationFactor, string> = {
  sleep: "factorSleep",
  stress: "factorStress",
  jawTension: "factorJawTension",
  mood: "factorMood",
  timeOfDay: "factorTimeOfDay",
};

const getStrengthCategory = (
  strength: number,
): "weak" | "medium" | "strong" => {
  if (strength <= 33) return "weak";
  if (strength <= 66) return "medium";
  return "strong";
};

const getBarColor = (strength: number, trend: CorrelationTrend): string => {
  const category = getStrengthCategory(strength);

  if (category === "weak") {
    return "bg-gray-400 dark:bg-gray-600";
  }

  if (category === "medium") {
    return "bg-amber-500 dark:bg-amber-600";
  }

  // Strong correlations
  if (trend === "positive") {
    // Positive trend (more of this → more headaches) = red (warning)
    return "bg-red-500 dark:bg-red-600";
  } else if (trend === "negative") {
    // Negative trend (more of this → fewer headaches) = green (good)
    return "bg-green-500 dark:bg-green-600";
  }

  return "bg-gray-500 dark:bg-gray-600";
};

const getTrendIcon = (trend: CorrelationTrend) => {
  switch (trend) {
    case "positive":
      return TrendingUp;
    case "negative":
      return TrendingDown;
    case "neutral":
      return Minus;
  }
};

/**
 * CorrelationBars - Horizontal bar chart showing headache trigger correlations
 *
 * Displays correlation strength (0-100%) with color coding:
 * - Weak (0-33%): Gray
 * - Medium (34-66%): Amber/Orange
 * - Strong (67-100%): Red (positive trend) or Green (negative trend)
 *
 * Features:
 * - Animated bars on load
 * - Trend indicators (↑ positive, ↓ negative, → neutral)
 * - Tap to expand description
 * - Fully accessible with ARIA labels
 *
 * @example
 * ```tsx
 * <CorrelationBars
 *   correlations={[
 *     { factor: 'stress', strength: 85, trend: 'positive', description: '...' },
 *     { factor: 'sleep', strength: 60, trend: 'negative', description: '...' }
 *   ]}
 *   onCorrelationTap={(factor) => console.log('Tapped:', factor)}
 * />
 * ```
 */
export const CorrelationBars: React.FC<CorrelationBarsProps> = ({
  correlations,
  onCorrelationTap,
  className,
}) => {
  const t = useTranslations("insights");
  const [expandedFactor, setExpandedFactor] =
    React.useState<CorrelationFactor | null>(null);
  const [isAnimated, setIsAnimated] = React.useState(false);

  // Get translated factor label
  const getFactorLabel = (factor: CorrelationFactor) => t(factorLabelKeys[factor]);

  // Get translated strength category
  const getStrengthLabel = (category: "weak" | "medium" | "strong") => {
    return t(`${category}Correlation`);
  };

  // Trigger animation after mount
  React.useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBarClick = (factor: CorrelationFactor) => {
    setExpandedFactor(expandedFactor === factor ? null : factor);
    onCorrelationTap?.(factor);
  };

  return (
    <div
      className={cn("space-y-4", className)}
      data-testid="correlation-bars"
      role="region"
      aria-label={t("correlationsLabel")}
    >
      {correlations.map((correlation) => {
        const TrendIcon = getTrendIcon(correlation.trend);
        const barColor = getBarColor(correlation.strength, correlation.trend);
        const category = getStrengthCategory(correlation.strength);
        const isExpanded = expandedFactor === correlation.factor;

        return (
          <div key={correlation.factor} className="space-y-2">
            <button
              onClick={() => handleBarClick(correlation.factor)}
              className={cn(
                "w-full text-left rounded-lg p-3 transition-all",
                "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring",
                isExpanded && "bg-muted/50",
              )}
              aria-expanded={isExpanded}
              aria-label={`${getFactorLabel(correlation.factor)}: ${correlation.strength}% correlation, ${correlation.trend} trend`}
            >
              {/* Factor label and strength */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {getFactorLabel(correlation.factor)}
                  </span>
                  <TrendIcon
                    className={cn(
                      "h-4 w-4",
                      correlation.trend === "positive" &&
                        "text-red-600 dark:text-red-500",
                      correlation.trend === "negative" &&
                        "text-green-600 dark:text-green-500",
                      correlation.trend === "neutral" &&
                        "text-gray-500 dark:text-gray-400",
                    )}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {correlation.strength}%
                </span>
              </div>

              {/* Correlation bar */}
              <div
                className="h-3 bg-muted rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={correlation.strength}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${correlation.strength}% correlation strength`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    barColor,
                    !isAnimated && "w-0",
                  )}
                  style={{
                    width: isAnimated ? `${correlation.strength}%` : "0%",
                  }}
                />
              </div>

              {/* Strength category label */}
              <div className="flex items-center justify-between mt-2">
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    category === "weak" && "text-gray-500 dark:text-gray-400",
                    category === "medium" &&
                      "text-amber-600 dark:text-amber-500",
                    category === "strong" &&
                      (correlation.trend === "positive"
                        ? "text-red-600 dark:text-red-500"
                        : correlation.trend === "negative"
                          ? "text-green-600 dark:text-green-500"
                          : "text-gray-600 dark:text-gray-400"),
                  )}
                >
                  {getStrengthLabel(category)}
                </span>
              </div>
            </button>

            {/* Expanded description */}
            {isExpanded && (
              <div
                className="px-3 pb-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2"
                role="region"
                aria-label={`Description for ${getFactorLabel(correlation.factor)}`}
              >
                {correlation.description}
              </div>
            )}
          </div>
        );
      })}

      {correlations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground" role="status">
          {t("noCorrelationData")}
        </div>
      )}
    </div>
  );
};

CorrelationBars.displayName = "CorrelationBars";
