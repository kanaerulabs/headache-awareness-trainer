"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useCheckInStore,
  type CheckInMood,
  type SleepQuality,
  type BodyTensionArea,
  type PhysicalFactor,
} from "@/interface-adapters/store/checkinStore";

export interface CheckinFormProps {
  /**
   * Callback when form is submitted
   */
  onSubmit?: (id: string) => void;
  /**
   * Callback when quick dismiss is triggered
   */
  onQuickDismiss?: (id: string) => void;
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

// Mood configuration
const moodConfig = [
  {
    value: "calm" as CheckInMood,
    label: "Calm",
    emoji: "😌",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    activeColor: "ring-green-500",
  },
  {
    value: "ok" as CheckInMood,
    label: "OK",
    emoji: "🙂",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    activeColor: "ring-blue-500",
  },
  {
    value: "stressed" as CheckInMood,
    label: "Stressed",
    emoji: "😰",
    color: "bg-yellow-500",
    hoverColor: "hover:bg-yellow-600",
    activeColor: "ring-yellow-500",
  },
  {
    value: "anxious" as CheckInMood,
    label: "Anxious",
    emoji: "😟",
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    activeColor: "ring-orange-500",
  },
  {
    value: "avoidant" as CheckInMood,
    label: "Avoidant",
    emoji: "😶",
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    activeColor: "ring-gray-500",
  },
] as const;

// Sleep quality configuration
const sleepConfig = [
  {
    value: "good" as SleepQuality,
    label: "Good",
    emoji: "😴",
  },
  {
    value: "ok" as SleepQuality,
    label: "OK",
    emoji: "😐",
  },
  {
    value: "poor" as SleepQuality,
    label: "Poor",
    emoji: "😫",
  },
] as const;

// Body tension areas
const tensionAreas: { value: BodyTensionArea; label: string }[] = [
  { value: "jaw", label: "Jaw" },
  { value: "neck", label: "Neck" },
  { value: "shoulders", label: "Shoulders" },
];

// Physical factors
const physicalFactors: { value: PhysicalFactor; label: string }[] = [
  { value: "acidity", label: "Acidity" },
  { value: "fatigue", label: "Fatigue" },
  { value: "none", label: "None" },
];

/**
 * CheckinForm - Quick daily check-in form (complete in under 15 seconds)
 *
 * Features:
 * - Quick dismiss button "All good! 👍" with one-tap submission
 * - Mood selection with emoji taps (calm/ok/stressed/anxious/avoidant)
 * - Body tension multi-select (jaw/neck/shoulders)
 * - Sleep quality selector (good/ok/poor)
 * - Optional physical factors (acidity/fatigue/none)
 * - Optional free text note
 * - Mobile-first, minimal scrolling
 * - Integrates with zustand checkinStore
 *
 * @example
 * ```tsx
 * <CheckinForm
 *   onSubmit={(id) => console.log("Submitted:", id)}
 *   onQuickDismiss={(id) => console.log("Quick dismiss:", id)}
 * />
 * ```
 */
export const CheckinForm: React.FC<CheckinFormProps> = ({
  onSubmit,
  onQuickDismiss,
  disabled = false,
  className,
}) => {
  const { addCheckIn, addQuickDismiss } = useCheckInStore();

  // Form state
  const [mood, setMood] = useState<CheckInMood | null>(null);
  const [bodyTension, setBodyTension] = useState<BodyTensionArea[]>([]);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [selectedPhysicalFactors, setSelectedPhysicalFactors] = useState<
    PhysicalFactor[]
  >([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle body tension area
  const toggleTensionArea = (area: BodyTensionArea) => {
    setBodyTension((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  // Toggle physical factor
  const togglePhysicalFactor = (factor: PhysicalFactor) => {
    setSelectedPhysicalFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  // Handle quick dismiss
  const handleQuickDismiss = async () => {
    if (disabled || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const id = await addQuickDismiss();
      onQuickDismiss?.(id);
      resetForm();
    } catch (error) {
      console.error("Failed to submit quick dismiss:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled || isSubmitting || !mood || !sleepQuality) {
      return;
    }

    try {
      setIsSubmitting(true);
      const id = await addCheckIn({
        mood,
        bodyTension,
        sleepQuality,
        physicalFactors: selectedPhysicalFactors,
        note: note.trim() || undefined,
        isQuickDismiss: false,
      });
      onSubmit?.(id);
      resetForm();
    } catch (error) {
      console.error("Failed to submit check-in:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setMood(null);
    setBodyTension([]);
    setSleepQuality(null);
    setSelectedPhysicalFactors([]);
    setNote("");
  };

  const isFormValid = mood && sleepQuality;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6 max-w-2xl mx-auto", className)}
      data-testid="checkin-form"
    >
      {/* Quick Dismiss Button */}
      <div className="mb-6">
        <Button
          type="button"
          onClick={handleQuickDismiss}
          disabled={disabled || isSubmitting}
          size="lg"
          variant="outline"
          className={cn(
            "w-full h-14 text-lg font-semibold",
            "border-2 border-green-500 text-green-700",
            "hover:bg-green-50 hover:border-green-600",
            "dark:border-green-400 dark:text-green-400",
            "dark:hover:bg-green-950",
          )}
          data-testid="quick-dismiss-button"
        >
          All good! 👍
        </Button>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Tap here if you&apos;re feeling great and want to quickly log it
        </p>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400">
            Or provide details
          </span>
        </div>
      </div>

      {/* Mood Selection */}
      <div className="space-y-3">
        <label
          id="mood-label"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          How are you feeling? <span className="text-red-500">*</span>
        </label>
        <div
          role="radiogroup"
          aria-labelledby="mood-label"
          aria-required="true"
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
                disabled={disabled || isSubmitting}
                onClick={() => setMood(config.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "rounded-lg p-2 sm:p-3 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "border-2",
                  !(disabled || isSubmitting) && "cursor-pointer",
                  (disabled || isSubmitting) && "opacity-50 cursor-not-allowed",
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
                    !(disabled || isSubmitting) && config.hoverColor,
                    !(disabled || isSubmitting) &&
                      "hover:border-transparent hover:text-white",
                  ],
                )}
                data-testid={`mood-${config.value}`}
              >
                <span className="text-2xl sm:text-3xl" aria-hidden="true">
                  {config.emoji}
                </span>
                <span className="text-xs font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body Tension */}
      <div className="space-y-3">
        <label
          id="tension-label"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Any body tension?
        </label>
        <div
          role="group"
          aria-labelledby="tension-label"
          className="flex flex-wrap gap-2"
        >
          {tensionAreas.map(({ value, label }) => {
            const isSelected = bodyTension.includes(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleTensionArea(value)}
                disabled={disabled || isSubmitting}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium",
                  "border-2 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                  !(disabled || isSubmitting) && "cursor-pointer",
                  (disabled || isSubmitting) && "opacity-50 cursor-not-allowed",
                  isSelected && [
                    "bg-blue-600 border-blue-600 text-white",
                    "hover:bg-blue-700",
                  ],
                  !isSelected && [
                    "bg-white dark:bg-gray-800",
                    "border-gray-300 dark:border-gray-600",
                    "text-gray-700 dark:text-gray-300",
                    "hover:border-blue-500 hover:text-blue-600",
                    "dark:hover:border-blue-400 dark:hover:text-blue-400",
                  ],
                )}
                data-testid={`tension-${value}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleep Quality */}
      <div className="space-y-3">
        <label
          id="sleep-label"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          How did you sleep? <span className="text-red-500">*</span>
        </label>
        <div
          role="radiogroup"
          aria-labelledby="sleep-label"
          aria-required="true"
          className="grid grid-cols-3 gap-2"
        >
          {sleepConfig.map((config) => {
            const isSelected = sleepQuality === config.value;

            return (
              <button
                key={config.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Sleep quality: ${config.label}`}
                disabled={disabled || isSubmitting}
                onClick={() => setSleepQuality(config.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "rounded-lg p-3 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                  "border-2",
                  !(disabled || isSubmitting) && "cursor-pointer",
                  (disabled || isSubmitting) && "opacity-50 cursor-not-allowed",
                  isSelected && [
                    "border-blue-600 bg-blue-600 text-white",
                    "ring-4 ring-blue-500 ring-offset-2",
                  ],
                  !isSelected && [
                    "border-gray-300 dark:border-gray-600",
                    "bg-white dark:bg-gray-800",
                    "text-gray-700 dark:text-gray-300",
                    "hover:border-blue-500 hover:bg-blue-50",
                    "dark:hover:border-blue-400 dark:hover:bg-blue-950",
                  ],
                )}
                data-testid={`sleep-${config.value}`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {config.emoji}
                </span>
                <span className="text-sm font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Factors (Optional) */}
      <div className="space-y-3">
        <label
          id="physical-label"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Any physical factors?{" "}
          <span className="text-gray-400">(optional)</span>
        </label>
        <div
          role="group"
          aria-labelledby="physical-label"
          className="flex flex-wrap gap-2"
        >
          {physicalFactors.map(({ value, label }) => {
            const isSelected = selectedPhysicalFactors.includes(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => togglePhysicalFactor(value)}
                disabled={disabled || isSubmitting}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium",
                  "border-2 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                  !(disabled || isSubmitting) && "cursor-pointer",
                  (disabled || isSubmitting) && "opacity-50 cursor-not-allowed",
                  isSelected && [
                    "bg-purple-600 border-purple-600 text-white",
                    "hover:bg-purple-700",
                  ],
                  !isSelected && [
                    "bg-white dark:bg-gray-800",
                    "border-gray-300 dark:border-gray-600",
                    "text-gray-700 dark:text-gray-300",
                    "hover:border-purple-500 hover:text-purple-600",
                    "dark:hover:border-purple-400 dark:hover:text-purple-400",
                  ],
                )}
                data-testid={`physical-${value}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note (Optional) */}
      <div className="space-y-2">
        <label
          htmlFor="checkin-note"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Any quick notes? <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="checkin-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any quick notes?"
          disabled={disabled || isSubmitting}
          maxLength={200}
          rows={2}
          aria-label="Check-in notes"
          className={cn(
            "w-full rounded-lg border-2 border-gray-300 px-4 py-2",
            "text-base placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
            "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
            "dark:placeholder:text-gray-500 dark:focus:ring-blue-400",
            "dark:disabled:bg-gray-900",
            "resize-none",
          )}
          data-testid="checkin-note"
        />
        <div className="text-xs text-right text-gray-500 dark:text-gray-400">
          {note.length} / 200 characters
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormValid || disabled || isSubmitting}
        size="lg"
        className="w-full"
        data-testid="submit-button"
      >
        {isSubmitting ? "Logging..." : "Log Check-in ✓"}
      </Button>

      {/* Validation message */}
      {!isFormValid && (
        <p
          className="text-sm text-center text-gray-500 dark:text-gray-400"
          role="alert"
        >
          Please select your mood and sleep quality to continue
        </p>
      )}
    </form>
  );
};

CheckinForm.displayName = "CheckinForm";
