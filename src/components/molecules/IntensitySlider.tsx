"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface IntensitySliderProps {
  /**
   * Current intensity value (1-5)
   */
  value: 1 | 2 | 3 | 4 | 5;
  /**
   * Callback when intensity changes
   */
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
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

const intensityConfig = [
  { value: 1 as const, label: "Minimal", color: "bg-green-500", hoverColor: "hover:bg-green-600", activeColor: "ring-green-500" },
  { value: 2 as const, label: "Mild", color: "bg-yellow-500", hoverColor: "hover:bg-yellow-600", activeColor: "ring-yellow-500" },
  { value: 3 as const, label: "Moderate", color: "bg-orange-500", hoverColor: "hover:bg-orange-600", activeColor: "ring-orange-500" },
  { value: 4 as const, label: "Severe", color: "bg-red-500", hoverColor: "hover:bg-red-600", activeColor: "ring-red-500" },
  { value: 5 as const, label: "Extreme", color: "bg-red-800", hoverColor: "hover:bg-red-900", activeColor: "ring-red-800" },
] as const;

/**
 * IntensitySlider - Large tap-friendly intensity selector (1-5)
 *
 * Visual feedback with color-coded intensity levels:
 * - 1 (Minimal): Green
 * - 2 (Mild): Yellow
 * - 3 (Moderate): Orange
 * - 4 (Severe): Red
 * - 5 (Extreme): Dark Red
 *
 * Fully accessible with keyboard navigation and ARIA labels.
 *
 * @example
 * ```tsx
 * const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
 * <IntensitySlider value={intensity} onChange={setIntensity} />
 * ```
 */
export const IntensitySlider: React.FC<IntensitySliderProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const handleKeyDown = (
    event: React.KeyboardEvent,
    newValue: 1 | 2 | 3 | 4 | 5,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange(newValue);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Label */}
      <label
        id="intensity-label"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        How intense is your headache?
      </label>

      {/* Intensity buttons */}
      <div
        role="radiogroup"
        aria-labelledby="intensity-label"
        className="grid grid-cols-5 gap-1 sm:gap-2"
      >
        {intensityConfig.map((config) => {
          const isSelected = value === config.value;

          return (
            <button
              key={config.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Intensity level ${config.value} - ${config.label}`}
              disabled={disabled}
              onClick={() => onChange(config.value)}
              onKeyDown={(e) => handleKeyDown(e, config.value)}
              className={cn(
                "flex flex-col items-center justify-center",
                "rounded-lg p-2 sm:p-4 transition-all min-h-[60px] sm:min-h-[80px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                config.color,
                "text-white font-semibold",
                !disabled && config.hoverColor,
                !disabled && "cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected && "ring-2 sm:ring-4 ring-offset-1 sm:ring-offset-2",
                isSelected && config.activeColor,
                !isSelected && "opacity-70",
              )}
            >
              <span className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">{config.value}</span>
              <span className="text-[10px] sm:text-xs leading-tight">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Current selection display */}
      <div
        className="text-center text-sm text-gray-600 dark:text-gray-400"
        aria-live="polite"
        aria-atomic="true"
      >
        Selected intensity:{" "}
        <span className="font-semibold">
          {value} - {intensityConfig[value - 1].label}
        </span>
      </div>
    </div>
  );
};

IntensitySlider.displayName = "IntensitySlider";
