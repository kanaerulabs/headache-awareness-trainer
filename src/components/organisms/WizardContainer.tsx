import React from "react";
import { cn } from "@/lib/utils";

interface WizardContainerProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function WizardContainer({
  children,
  currentStep,
  totalSteps,
  className,
}: WizardContainerProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center p-4",
        className,
      )}
      data-testid="wizard-container"
    >
      <div className="w-full max-w-md space-y-8">
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2" data-testid="progress-indicator">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          data-testid="progress-bar"
        />
      </div>
    </div>
  );
}
