import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface ImFineButtonProps extends Omit<ButtonProps, "children"> {
  /**
   * Optional custom text to display on the button
   * @default "I'm fine today"
   */
  text?: string;
  /**
   * Show checkmark icon
   * @default true
   */
  showIcon?: boolean;
}

/**
 * ImFineButton - One-tap dismiss button for headache logging
 *
 * Allows users to quickly indicate they don't have a headache today.
 * Designed for quick interaction and accessibility.
 *
 * @example
 * ```tsx
 * <ImFineButton onClick={() => console.log("User is fine")} />
 * ```
 */
export const ImFineButton = React.forwardRef<
  HTMLButtonElement,
  ImFineButtonProps
>(({ text = "I'm fine today", showIcon = true, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        "w-full gap-2 text-base font-medium",
        "border-2 border-green-600 text-green-700",
        "hover:bg-green-50 hover:border-green-700",
        "dark:border-green-500 dark:text-green-400",
        "dark:hover:bg-green-950",
        "focus-visible:ring-green-500",
        className,
      )}
      aria-label={text}
      {...props}
    >
      {showIcon && <Check className="h-5 w-5" aria-hidden="true" />}
      {text}
    </Button>
  );
});

ImFineButton.displayName = "ImFineButton";
