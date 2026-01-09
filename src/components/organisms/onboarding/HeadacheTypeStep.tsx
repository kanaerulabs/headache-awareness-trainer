"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardStep } from "@/components/organisms/WizardStep";
import {
  useOnboardingStore,
  type HeadacheType,
} from "@/interface-adapters/store/onboardingStore";
import { cn } from "@/lib/utils";

interface HeadacheTypeOption {
  value: HeadacheType;
  label: string;
  description: string;
}

const HEADACHE_TYPES: HeadacheTypeOption[] = [
  {
    value: "tension",
    label: "Tension Headaches",
    description: "Pressure or tightness around the head, often stress-related",
  },
  {
    value: "migraine",
    label: "Migraines",
    description: "Throbbing pain, often with sensitivity to light or sound",
  },
  {
    value: "mixed",
    label: "Mixed/Both Types",
    description: "I experience both tension headaches and migraines",
  },
  {
    value: "unsure",
    label: "Not Sure",
    description: "I'm not certain what type of headaches I get",
  },
];

export function HeadacheTypeStep() {
  const { headacheType, setHeadacheType, nextStep, previousStep } =
    useOnboardingStore();

  const handleContinue = () => {
    if (headacheType) {
      nextStep();
    }
  };

  return (
    <WizardStep
      title="What type of headaches do you experience?"
      description="This helps us provide personalized insights"
    >
      <div
        className="flex flex-col space-y-4"
        data-testid="headache-type-step"
      >
        {/* Headache Type Options */}
        <div className="space-y-3">
          {HEADACHE_TYPES.map((option) => {
            const isSelected = headacheType === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setHeadacheType(option.value)}
                className={cn(
                  "w-full rounded-lg border-2 p-4 text-left transition-all",
                  "hover:border-primary/50 hover:bg-accent/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "min-h-[80px]",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card",
                )}
                data-testid={`headache-type-option-${option.value}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      data-testid="selected-checkmark"
                    >
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={previousStep}
            variant="outline"
            size="lg"
            className="w-full"
            data-testid="back-button"
          >
            Back
          </Button>

          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full"
            disabled={!headacheType}
            data-testid="continue-button"
          >
            Continue
          </Button>
        </div>
      </div>
    </WizardStep>
  );
}
