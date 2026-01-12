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
import { useTranslations } from "next-intl";

const HEADACHE_TYPE_KEYS: HeadacheType[] = ["tension", "migraine", "mixed", "unsure"];

export function HeadacheTypeStep() {
  const { headacheType, setHeadacheType, nextStep, previousStep } =
    useOnboardingStore();
  const t = useTranslations("onboarding");

  const handleContinue = () => {
    if (headacheType) {
      nextStep();
    }
  };

  return (
    <WizardStep
      title={t("headacheTypeTitle")}
      description={t("headacheTypeDesc")}
    >
      <div className="flex flex-col space-y-4" data-testid="headache-type-step">
        {/* Headache Type Options */}
        <div className="space-y-3">
          {HEADACHE_TYPE_KEYS.map((typeKey) => {
            const isSelected = headacheType === typeKey;

            return (
              <button
                key={typeKey}
                onClick={() => setHeadacheType(typeKey)}
                className={cn(
                  "w-full rounded-lg border-2 p-4 text-left transition-all",
                  "hover:border-primary/50 hover:bg-accent/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "min-h-[80px]",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card",
                )}
                data-testid={`headache-type-option-${typeKey}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{t(`headacheTypes.${typeKey}.label`)}</div>
                    <div className="text-sm text-muted-foreground">
                      {t(`headacheTypes.${typeKey}.description`)}
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
            {t("back")}
          </Button>

          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full"
            disabled={!headacheType}
            data-testid="continue-button"
          >
            {t("continue")}
          </Button>
        </div>
      </div>
    </WizardStep>
  );
}
