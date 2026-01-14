"use client";

import React from "react";
import { Check } from "lucide-react";
import { WizardStep } from "@/components/organisms/WizardStep";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useOnboardingStore,
  type Frequency,
} from "@/interface-adapters/store/onboardingStore";
import { useTranslations } from "next-intl";

// Map store values to translation keys
const FREQUENCY_OPTIONS: { value: Frequency; translationKey: string }[] = [
  { value: "daily", translationKey: "daily" },
  { value: "few-times-week", translationKey: "fewTimesWeek" },
  { value: "weekly", translationKey: "weekly" },
  { value: "occasional", translationKey: "occasional" },
];

export function FrequencyStep() {
  const { frequency, setFrequency, nextStep, previousStep } =
    useOnboardingStore();
  const t = useTranslations("onboarding");

  const handleSelect = (value: Frequency) => {
    setFrequency(value);
  };

  const handleContinue = () => {
    if (frequency) {
      nextStep();
    }
  };

  return (
    <WizardStep title={t("frequencyTitle")} description={t("frequencyDesc")}>
      <div className="space-y-3" data-testid="frequency-options">
        {FREQUENCY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "w-full rounded-lg border-2 p-4 text-left transition-all",
              "hover:border-primary/50 hover:bg-accent/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              frequency === option.value
                ? "border-primary bg-accent"
                : "border-border bg-background",
            )}
            data-testid={`frequency-option-${option.value}`}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="font-medium">
                  {t(`frequencyOptions.${option.translationKey}.label`)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(`frequencyOptions.${option.translationKey}.description`)}
                </div>
              </div>
              {frequency === option.value && (
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  data-testid="selected-checkmark"
                >
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={previousStep}
          className="flex-1"
          data-testid="back-button"
          type="button"
        >
          {t("back")}
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!frequency}
          className="flex-1"
          data-testid="continue-button"
          type="button"
        >
          {t("continue")}
        </Button>
      </div>
    </WizardStep>
  );
}
