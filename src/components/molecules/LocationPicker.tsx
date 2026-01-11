"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type HeadacheLocation =
  | "front"
  | "back"
  | "top"
  | "left-side"
  | "right-side"
  | "behind-eyes"
  | "neck"
  | "shoulders"
  | "jaw";

export interface LocationPickerProps {
  /**
   * Current selected locations (multi-select)
   */
  selectedLocations: HeadacheLocation[];
  /**
   * Callback when location is toggled
   */
  onLocationToggle: (location: HeadacheLocation) => void;
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

const locationConfig = [
  {
    value: "front" as const,
    position: "top-[25%] left-[50%] -translate-x-1/2",
    size: "w-16 h-12",
  },
  {
    value: "back" as const,
    position: "top-[30%] left-[50%] -translate-x-1/2",
    size: "w-16 h-12",
  },
  {
    value: "top" as const,
    position: "top-[15%] left-[50%] -translate-x-1/2",
    size: "w-14 h-10",
  },
  {
    value: "left-side" as const,
    position: "top-[25%] left-[20%]",
    size: "w-12 h-12",
  },
  {
    value: "right-side" as const,
    position: "top-[25%] right-[20%]",
    size: "w-12 h-12",
  },
  {
    value: "behind-eyes" as const,
    position: "top-[28%] left-[50%] -translate-x-1/2",
    size: "w-20 h-8",
  },
  {
    value: "neck" as const,
    position: "top-[50%] left-[50%] -translate-x-1/2",
    size: "w-12 h-16",
  },
  {
    value: "shoulders" as const,
    position: "top-[55%] left-[50%] -translate-x-1/2",
    size: "w-32 h-12",
  },
  {
    value: "jaw" as const,
    position: "top-[38%] left-[50%] -translate-x-1/2",
    size: "w-16 h-10",
  },
] as const;

/**
 * LocationPicker - Tap-friendly body/head diagram for selecting pain location (Week 2+ feature)
 *
 * Multi-select locations:
 * - Front, Back, Top (head regions)
 * - Left Side, Right Side (temples)
 * - Behind Eyes
 * - Neck, Shoulders, Jaw (extended areas)
 *
 * Visual highlight of selected areas with tap-friendly zones.
 * Fully accessible with keyboard navigation and ARIA labels.
 *
 * @example
 * ```tsx
 * const [locations, setLocations] = useState<HeadacheLocation[]>([]);
 * const handleToggle = (location: HeadacheLocation) => {
 *   setLocations(prev =>
 *     prev.includes(location)
 *       ? prev.filter(l => l !== location)
 *       : [...prev, location]
 *   );
 * };
 * <LocationPicker selectedLocations={locations} onLocationToggle={handleToggle} />
 * ```
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocations,
  onLocationToggle,
  disabled = false,
  className,
}) => {
  const t = useTranslations("components.locationPicker");

  const handleKeyDown = (
    event: React.KeyboardEvent,
    location: HeadacheLocation,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onLocationToggle(location);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Label */}
      <label
        id="location-label"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {t("label")}
      </label>

      {/* Interactive body diagram */}
      <div className="relative mx-auto w-full max-w-md">
        {/* Simple body outline using CSS */}
        <div className="relative aspect-[3/4] w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          {/* Head outline */}
          <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-24 h-28 rounded-full border-2 border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700" />

          {/* Neck */}
          <div className="absolute top-[35%] left-[50%] -translate-x-1/2 w-12 h-16 border-2 border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700" />

          {/* Shoulders */}
          <div className="absolute top-[48%] left-[50%] -translate-x-1/2 w-36 h-10 rounded-t-3xl border-2 border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700" />

          {/* Interactive location buttons - overlay on diagram */}
          <div
            role="group"
            aria-labelledby="location-label"
            className="absolute inset-0"
          >
            {locationConfig.map((config) => {
              const isSelected = selectedLocations.includes(config.value);
              const locationLabel = t(`locations.${config.value}`);

              return (
                <button
                  key={config.value}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`${locationLabel}`}
                  disabled={disabled}
                  onClick={() => onLocationToggle(config.value)}
                  onKeyDown={(e) => handleKeyDown(e, config.value)}
                  className={cn(
                    "absolute",
                    config.position,
                    config.size,
                    "rounded-lg transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                    !disabled && "cursor-pointer",
                    disabled && "opacity-50 cursor-not-allowed",
                    isSelected && [
                      "bg-red-500 hover:bg-red-600",
                      "border-2 border-red-700",
                      "opacity-80",
                    ],
                    !isSelected && [
                      "bg-transparent hover:bg-blue-200/50 dark:hover:bg-blue-800/50",
                      "border-2 border-dashed border-gray-400/50 dark:border-gray-500/50",
                      "hover:border-blue-400 dark:hover:border-blue-500",
                    ],
                  )}
                >
                  {/* Label overlay on hover */}
                  <span
                    className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      "text-[10px] font-semibold text-center px-1",
                      "opacity-0 hover:opacity-100 transition-opacity",
                      isSelected
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-900/90 rounded-lg",
                    )}
                  >
                    {locationLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend below diagram */}
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 text-center">
          {t("tapToMark")}
        </div>
      </div>

      {/* Selected locations chips */}
      {selectedLocations.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("selectedLocations")}
          </div>
          <div
            className="flex flex-wrap gap-2"
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedLocations.map((location) => {
              const locationLabel = t(`locations.${location}`);
              return (
                <span
                  key={location}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                >
                  {locationLabel}
                  <button
                    type="button"
                    onClick={() => onLocationToggle(location)}
                    disabled={disabled}
                    aria-label={t("removeLocation", { location: locationLabel })}
                    className="ml-1 hover:text-red-600 dark:hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

LocationPicker.displayName = "LocationPicker";
