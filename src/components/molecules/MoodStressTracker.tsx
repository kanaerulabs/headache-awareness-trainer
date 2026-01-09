"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Mood = "great" | "good" | "neutral" | "low" | "bad";

export interface MoodStressTrackerProps {
  /**
   * Current mood selection
   */
  mood: Mood | null;
  /**
   * Current stress level (0-10)
   */
  stressLevel: number;
  /**
   * Callback when mood changes
   */
  onMoodChange: (mood: Mood) => void;
  /**
   * Callback when stress level changes
   */
  onStressChange: (level: number) => void;
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

const moodConfig = [
  {
    value: "great" as const,
    label: "Great",
    emoji: "😊",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    activeColor: "ring-green-500",
  },
  {
    value: "good" as const,
    label: "Good",
    emoji: "🙂",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    activeColor: "ring-blue-500",
  },
  {
    value: "neutral" as const,
    label: "Neutral",
    emoji: "😐",
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    activeColor: "ring-gray-500",
  },
  {
    value: "low" as const,
    label: "Low",
    emoji: "😔",
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    activeColor: "ring-orange-500",
  },
  {
    value: "bad" as const,
    label: "Bad",
    emoji: "😞",
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    activeColor: "ring-red-500",
  },
] as const;

const stressLabels = [
  {
    min: 0,
    max: 2,
    label: "Calm",
    color: "text-green-600 dark:text-green-400",
  },
  {
    min: 3,
    max: 5,
    label: "Mild Stress",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  {
    min: 6,
    max: 8,
    label: "Moderate Stress",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    min: 9,
    max: 10,
    label: "High Stress",
    color: "text-red-600 dark:text-red-400",
  },
] as const;

/**
 * MoodStressTracker - Emoji-based mood selector and stress level slider (Week 3+ feature)
 *
 * Features:
 * - Mood selector with 5 emoji options (Great → Bad)
 * - Stress level slider (0-10)
 * - Visual feedback with color coding
 *
 * Fully accessible with keyboard navigation and ARIA labels.
 *
 * @example
 * ```tsx
 * const [mood, setMood] = useState<Mood | null>(null);
 * const [stress, setStress] = useState(5);
 * <MoodStressTracker
 *   mood={mood}
 *   stressLevel={stress}
 *   onMoodChange={setMood}
 *   onStressChange={setStress}
 * />
 * ```
 */
export const MoodStressTracker: React.FC<MoodStressTrackerProps> = ({
  mood,
  stressLevel,
  onMoodChange,
  onStressChange,
  disabled = false,
  className,
}) => {
  const handleMoodKeyDown = (event: React.KeyboardEvent, newMood: Mood) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onMoodChange(newMood);
    }
  };

  const currentStressLabel = stressLabels.find(
    (label) => stressLevel >= label.min && stressLevel <= label.max,
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mood Section */}
      <div className="space-y-4">
        {/* Label */}
        <label
          id="mood-label"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          How are you feeling overall?
        </label>

        {/* Mood buttons */}
        <div
          role="radiogroup"
          aria-labelledby="mood-label"
          className="grid grid-cols-5 gap-2"
        >
          {moodConfig.map((config) => {
            const isSelected = mood === config.value;

            return (
              <button
                key={config.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Mood: ${config.label}`}
                disabled={disabled}
                onClick={() => onMoodChange(config.value)}
                onKeyDown={(e) => handleMoodKeyDown(e, config.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "rounded-lg p-3 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "border-2",
                  !disabled && "cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed",
                  isSelected && [
                    "border-transparent",
                    config.color,
                    "text-white",
                    "ring-4 ring-offset-2",
                    config.activeColor,
                  ],
                  !isSelected && [
                    "border-gray-300 dark:border-gray-600",
                    "bg-white dark:bg-gray-800",
                    "text-gray-700 dark:text-gray-300",
                    !disabled && config.hoverColor,
                    !disabled && "hover:border-transparent hover:text-white",
                  ],
                )}
              >
                <span className="text-3xl" aria-hidden="true">
                  {config.emoji}
                </span>
                <span className="text-xs font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Current mood display */}
        {mood && (
          <div
            className="text-center text-sm text-gray-600 dark:text-gray-400"
            aria-live="polite"
            aria-atomic="true"
          >
            Current mood:{" "}
            <span className="font-semibold">
              {moodConfig.find((c) => c.value === mood)?.emoji}{" "}
              {moodConfig.find((c) => c.value === mood)?.label}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Stress Level Section */}
      <div className="space-y-4">
        {/* Label */}
        <label
          id="stress-label"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          What is your stress level?
        </label>

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
              value={stressLevel}
              onChange={(e) => onStressChange(Number(e.target.value))}
              disabled={disabled}
              aria-labelledby="stress-label"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={stressLevel}
              aria-valuetext={`Stress level ${stressLevel} out of 10 - ${currentStressLabel?.label}`}
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
              {stressLevel}
            </div>
            {currentStressLabel && (
              <div
                className={cn(
                  "text-sm font-medium mt-1",
                  currentStressLabel.color,
                )}
              >
                {currentStressLabel.label}
              </div>
            )}
          </div>
        </div>

        {/* Helper text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          0 = No stress, 10 = Extremely stressed
        </div>
      </div>
    </div>
  );
};

MoodStressTracker.displayName = "MoodStressTracker";
