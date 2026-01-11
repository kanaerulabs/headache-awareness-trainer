"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain, Zap, Target, Wind, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export type HeadacheType =
  | "tension"
  | "migraine"
  | "cluster"
  | "sinus"
  | "other";

export interface HeadacheTypeSelectorProps {
  /**
   * Current selected headache type
   */
  value: HeadacheType | null;
  /**
   * Callback when headache type changes
   */
  onChange: (value: HeadacheType) => void;
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

const headacheTypeConfig = [
  {
    value: "tension" as const,
    icon: Brain,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    activeColor: "ring-blue-500",
  },
  {
    value: "migraine" as const,
    icon: Zap,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    activeColor: "ring-purple-500",
  },
  {
    value: "cluster" as const,
    icon: Target,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    activeColor: "ring-red-500",
  },
  {
    value: "sinus" as const,
    icon: Wind,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    activeColor: "ring-green-500",
  },
  {
    value: "other" as const,
    icon: HelpCircle,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    activeColor: "ring-gray-500",
  },
] as const;

/**
 * HeadacheTypeSelector - Single-select for headache type (Week 2+ feature)
 *
 * Visual icons for each headache type:
 * - Tension: Brain icon (tight band around head)
 * - Migraine: Zap icon (throbbing, one-sided)
 * - Cluster: Target icon (intense, behind eye)
 * - Sinus: Wind icon (face/forehead pressure)
 * - Other: HelpCircle icon (different pattern)
 *
 * Fully accessible with keyboard navigation and ARIA labels.
 *
 * @example
 * ```tsx
 * const [headacheType, setHeadacheType] = useState<HeadacheType | null>(null);
 * <HeadacheTypeSelector value={headacheType} onChange={setHeadacheType} />
 * ```
 */
export const HeadacheTypeSelector: React.FC<HeadacheTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const t = useTranslations("components.headacheTypeSelector");

  const handleKeyDown = (
    event: React.KeyboardEvent,
    newValue: HeadacheType,
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
        id="headache-type-label"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {t("label")}
      </label>

      {/* Type buttons */}
      <div
        role="radiogroup"
        aria-labelledby="headache-type-label"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
      >
        {headacheTypeConfig.map((config) => {
          const isSelected = value === config.value;
          const Icon = config.icon;
          const typeLabel = t(`types.${config.value}.label`);
          const typeDesc = t(`types.${config.value}.description`);

          return (
            <button
              key={config.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${typeLabel} - ${typeDesc}`}
              disabled={disabled}
              onClick={() => onChange(config.value)}
              onKeyDown={(e) => handleKeyDown(e, config.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-2",
                "rounded-lg p-4 transition-all",
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
              <Icon className="h-8 w-8" aria-hidden="true" />
              <span className="text-sm font-semibold">{typeLabel}</span>
              <span className="text-xs text-center opacity-90">
                {typeDesc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current selection display */}
      {value && (
        <div
          className="text-center text-sm text-gray-600 dark:text-gray-400"
          aria-live="polite"
          aria-atomic="true"
        >
          {t("selectedType")}{" "}
          <span className="font-semibold">
            {t(`types.${value}.label`)}
          </span>
        </div>
      )}
    </div>
  );
};

HeadacheTypeSelector.displayName = "HeadacheTypeSelector";
