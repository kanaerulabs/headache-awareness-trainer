"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NoteInputProps {
  /**
   * Current note value
   */
  value: string;
  /**
   * Callback when note changes
   */
  onChange: (value: string) => void;
  /**
   * Callback when voice input is requested (placeholder for future feature)
   */
  onVoiceInput?: () => void;
  /**
   * Maximum character limit
   * @default 500
   */
  maxLength?: number;
  /**
   * Placeholder text
   * @default "How are you feeling?"
   */
  placeholder?: string;
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
 * NoteInput - Free text input with character limit and voice input option
 *
 * Features:
 * - Multi-line textarea for detailed notes
 * - Character limit indicator (default: 500 characters)
 * - Voice input button (placeholder for future implementation)
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * const [note, setNote] = useState("");
 * <NoteInput
 *   value={note}
 *   onChange={setNote}
 *   onVoiceInput={() => console.log("Voice input requested")}
 * />
 * ```
 */
export const NoteInput: React.FC<NoteInputProps> = ({
  value,
  onChange,
  onVoiceInput,
  maxLength = 500,
  placeholder = "How are you feeling?",
  disabled = false,
  className,
}) => {
  const charactersLeft = maxLength - value.length;
  const isNearLimit = charactersLeft <= 50;
  const isAtLimit = charactersLeft <= 0;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <label
        htmlFor="note-input"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        Notes (optional)
      </label>

      {/* Textarea with voice input button */}
      <div className="relative">
        <textarea
          id="note-input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={4}
          aria-label="Headache notes"
          aria-describedby="character-count"
          className={cn(
            "w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-14",
            "text-base placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
            "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
            "dark:placeholder:text-gray-500 dark:focus:ring-blue-400",
            "dark:disabled:bg-gray-900",
            "resize-none",
          )}
        />

        {/* Voice input button (positioned in top-right of textarea) */}
        {onVoiceInput && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onVoiceInput}
            disabled={disabled}
            tabIndex={-1}
            aria-label="Voice input (coming soon)"
            title="Voice input (coming soon)"
            className={cn(
              "absolute top-2 right-2",
              "h-10 w-10",
              "text-gray-500 hover:text-blue-600 hover:bg-blue-50",
              "dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-950",
            )}
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Character count indicator */}
      <div
        id="character-count"
        className={cn(
          "flex items-center justify-between text-sm",
          isAtLimit && "text-red-600 dark:text-red-400",
          isNearLimit && !isAtLimit && "text-orange-600 dark:text-orange-400",
          !isNearLimit && "text-gray-500 dark:text-gray-400",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <span>
          {value.length} / {maxLength} characters
        </span>
        {isNearLimit && (
          <span className="font-medium">
            {isAtLimit ? "Limit reached" : `${charactersLeft} left`}
          </span>
        )}
      </div>
    </div>
  );
};

NoteInput.displayName = "NoteInput";
