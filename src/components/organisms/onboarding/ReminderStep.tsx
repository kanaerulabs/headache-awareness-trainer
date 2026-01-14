"use client";

import React from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { WizardStep } from "@/components/organisms/WizardStep";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useOnboardingStore,
  type ReminderPreference,
} from "@/interface-adapters/store/onboardingStore";
import { useTranslations } from "next-intl";

// Map store values to translation keys and icons
const REMINDER_OPTIONS: {
  value: ReminderPreference;
  translationKey: string;
  icon: typeof Bell;
}[] = [
  { value: "yes-gently", translationKey: "yesGently", icon: Bell },
  { value: "maybe-later", translationKey: "maybeLater", icon: BellOff },
];

export function ReminderStep() {
  const {
    reminderPreference,
    setReminderPreference,
    previousStep,
    completeOnboarding,
  } = useOnboardingStore();
  const t = useTranslations("onboarding");

  const handleSelect = (value: ReminderPreference) => {
    setReminderPreference(value);
  };

  const handleGetStarted = () => {
    if (reminderPreference) {
      completeOnboarding();
    }
  };

  return (
    <WizardStep title={t("reminderTitle")} description={t("reminderDesc")}>
      <div className="space-y-3" data-testid="reminder-options">
        {REMINDER_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "w-full rounded-lg border-2 p-4 text-left transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                reminderPreference === option.value
                  ? "border-primary bg-accent"
                  : "border-border bg-background",
              )}
              data-testid={`reminder-option-${option.value}`}
              type="button"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    reminderPreference === option.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">
                    {t(`reminderOptions.${option.translationKey}.label`)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t(`reminderOptions.${option.translationKey}.description`)}
                  </div>
                </div>
                {reminderPreference === option.value && (
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    data-testid="selected-checkmark"
                  >
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
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
          onClick={handleGetStarted}
          disabled={!reminderPreference}
          className="flex-1"
          data-testid="get-started-button"
          type="button"
        >
          {t("startTracking")}
        </Button>
      </div>
    </WizardStep>
  );
}
