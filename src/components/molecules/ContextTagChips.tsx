"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface ContextTagChipsProps {
  /**
   * Currently selected tags
   */
  selectedTags: string[];
  /**
   * Callback when tag selection changes
   */
  onTagToggle: (tag: string) => void;
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

/**
 * Available context tags for headache logging
 */
const availableTags = [
  "woke-up-with-it",
  "came-on-gradually",
  "sudden-onset",
  "morning",
  "evening",
  "after-meal",
  "after-exercise",
  "weather-change",
] as const;

/**
 * ContextTagChips - Multi-select chip-based tag selector
 *
 * Allows users to select multiple context tags to describe their headache situation.
 * Tags can be toggled on/off with tap or click.
 *
 * Available tags:
 * - Woke up with it
 * - Came on gradually
 * - Sudden onset
 * - Morning
 * - Evening
 * - After meal
 * - After exercise
 * - Weather change
 *
 * @example
 * ```tsx
 * const [tags, setTags] = useState<string[]>([]);
 * const handleToggle = (tag: string) => {
 *   setTags(prev =>
 *     prev.includes(tag)
 *       ? prev.filter(t => t !== tag)
 *       : [...prev, tag]
 *   );
 * };
 * <ContextTagChips selectedTags={tags} onTagToggle={handleToggle} />
 * ```
 */
export const ContextTagChips: React.FC<ContextTagChipsProps> = ({
  selectedTags,
  onTagToggle,
  disabled = false,
  className,
}) => {
  const t = useTranslations("components.contextTagChips");

  const handleKeyDown = (event: React.KeyboardEvent, tag: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onTagToggle(tag);
    }
  };

  return (
    <div className={cn("space-y-3 overflow-hidden", className)}>
      {/* Label */}
      <label
        id="context-tags-label"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {t("label")}
      </label>

      {/* Tag chips */}
      <div
        role="group"
        aria-labelledby="context-tags-label"
        className="flex flex-wrap gap-1.5 sm:gap-2"
      >
        {availableTags.map((tagId) => {
          const isSelected = selectedTags.includes(tagId);
          const tagLabel = t(`tags.${tagId}`);

          return (
            <button
              key={tagId}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={tagLabel}
              disabled={disabled}
              onClick={() => onTagToggle(tagId)}
              onKeyDown={(e) => handleKeyDown(e, tagId)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 sm:px-4 sm:py-2",
                "text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                !disabled && "cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? "bg-blue-600 text-white border-2 border-blue-700"
                  : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200",
                isSelected && "dark:bg-blue-700 dark:border-blue-600",
                !isSelected &&
                  "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700",
              )}
            >
              {tagLabel}
            </button>
          );
        })}
      </div>

      {/* Selection count */}
      {selectedTags.length > 0 && (
        <div
          className="text-sm text-gray-600 dark:text-gray-400"
          aria-live="polite"
          aria-atomic="true"
        >
          {t("tagsSelected", { count: selectedTags.length })}
        </div>
      )}
    </div>
  );
};

ContextTagChips.displayName = "ContextTagChips";
