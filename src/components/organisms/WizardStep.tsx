import React from "react";
import { cn } from "@/lib/utils";

interface WizardStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardStep({
  title,
  description,
  children,
  className,
}: WizardStepProps) {
  return (
    <div className={cn("space-y-6", className)} data-testid="wizard-step">
      <div className="space-y-2 text-center">
        <h2
          className="text-2xl font-semibold tracking-tight"
          data-testid="step-title"
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-sm text-muted-foreground"
            data-testid="step-description"
          >
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
