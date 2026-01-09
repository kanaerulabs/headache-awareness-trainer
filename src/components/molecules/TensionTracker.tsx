"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TensionTrackerProps {
  /**
   * Current body tension level (0-10)
   */
  value: number;
  /**
   * Callback when tension level changes
   */
  onChange: (value: number) => void;
  /**
   * Disable interaction
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const tensionLabels = [
  {
    min: 0,
    max: 2,
    label: "Relaxed",
    color: "text-green-600 dark:text-green-400",
  },
  {
    min: 3,
    max: 5,
    label: "Mild Tension",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  {
    min: 6,
    max: 8,
    label: "Moderate Tension",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    min: 9,
    max: 10,
    label: "Severe Tension",
    color: "text-red-600 dark:text-red-400",
  },
] as const;

/**
 * TensionTracker - Body tension level slider with visual representation (Week 3+ feature)
 *
 * Features:
 * - Slider control (0-10)
 * - Visual body silhouette with color-coded tension indicator
 * - Text labels for tension levels (Relaxed → Severe Tension)
 *
 * Fully accessible with keyboard navigation and ARIA labels.
 *
 * @example
 * ```tsx
 * const [tension, setTension] = useState(5);
 * <TensionTracker value={tension} onChange={setTension} />
 * ```
 */
export const TensionTracker: React.FC<TensionTrackerProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const currentLabel = tensionLabels.find(
    (label) => value >= label.min && value <= label.max,
  );

  // Calculate opacity for body silhouette based on tension level
  const tensionOpacity = Math.min(value / 10, 1);
  const tensionColor = React.useMemo(() => {
    if (value <= 2) return "rgba(34, 197, 94, opacity)"; // green
    if (value <= 5) return "rgba(234, 179, 8, opacity)"; // yellow
    if (value <= 8) return "rgba(249, 115, 22, opacity)"; // orange
    return "rgba(239, 68, 68, opacity)"; // red
  }, [value]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Label */}
      <label
        id="tension-label"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        How tense does your body feel?
      </label>

      {/* Body silhouette visualization */}
      <div className="relative mx-auto w-full max-w-xs">
        <div className="relative aspect-[2/3] w-full flex items-center justify-center">
          {/* Body silhouette SVG */}
          <svg
            viewBox="0 0 200 300"
            className="w-full h-full"
            aria-hidden="true"
          >
            {/* Simple body shape */}
            {/* Head */}
            <ellipse
              cx="100"
              cy="40"
              rx="30"
              ry="35"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.3),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* Neck */}
            <rect
              x="88"
              y="70"
              width="24"
              height="30"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.5),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* Shoulders */}
            <ellipse
              cx="100"
              cy="110"
              rx="60"
              ry="20"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.7),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* Upper body */}
            <rect
              x="70"
              y="120"
              width="60"
              height="80"
              rx="10"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.6),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* Arms */}
            <rect
              x="45"
              y="120"
              width="20"
              height="70"
              rx="10"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.4),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />
            <rect
              x="135"
              y="120"
              width="20"
              height="70"
              rx="10"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.4),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* Lower body */}
            <rect
              x="75"
              y="200"
              width="50"
              height="60"
              rx="10"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.5),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* Legs */}
            <rect
              x="75"
              y="255"
              width="18"
              height="40"
              rx="9"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.3),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />
            <rect
              x="107"
              y="255"
              width="18"
              height="40"
              rx="9"
              fill={tensionColor.replace(
                "opacity",
                String(tensionOpacity * 0.3),
              )}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />
          </svg>
        </div>
      </div>

      {/* Slider control */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
            0
          </span>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            aria-labelledby="tension-label"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={value}
            aria-valuetext={`Tension level ${value} out of 10 - ${currentLabel?.label}`}
            className={cn(
              "flex-1 h-2 rounded-lg appearance-none cursor-pointer",
              "bg-gray-200 dark:bg-gray-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
            10
          </span>
        </div>

        {/* Current value display */}
        <div className="text-center" aria-live="polite" aria-atomic="true">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </div>
          {currentLabel && (
            <div className={cn("text-sm font-medium mt-1", currentLabel.color)}>
              {currentLabel.label}
            </div>
          )}
        </div>
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        0 = Completely relaxed, 10 = Extremely tense
      </div>
    </div>
  );
};

TensionTracker.displayName = "TensionTracker";
