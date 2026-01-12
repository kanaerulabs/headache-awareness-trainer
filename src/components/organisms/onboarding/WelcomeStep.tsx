"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardStep } from "@/components/organisms/WizardStep";
import { useOnboardingStore } from "@/interface-adapters/store/onboardingStore";
import { useTranslations } from "next-intl";

export function WelcomeStep() {
  const { nextStep, skipOnboarding } = useOnboardingStore();
  const t = useTranslations("onboarding");

  return (
    <WizardStep
      title={t("welcome")}
      description={t("welcomeDesc")}
    >
      <div
        className="flex flex-col items-center space-y-6"
        data-testid="welcome-step"
      >
        {/* Value Proposition */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            data-testid="welcome-icon"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-3 max-w-md">
            <h3 className="text-lg font-medium">
              {t("takeControl")}
            </h3>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>{t("features.trackPatterns")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>{t("features.personalizedInsights")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>{t("features.evidenceBased")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>{t("features.private")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 max-w-md">
          <Button
            onClick={nextStep}
            size="lg"
            className="w-full"
            data-testid="get-started-button"
          >
            {t("getStarted")}
          </Button>

          <Button
            onClick={skipOnboarding}
            variant="ghost"
            size="lg"
            className="w-full"
            data-testid="skip-button"
          >
            {t("skip")}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-md">
          {t("quickSetup")}
        </p>
      </div>
    </WizardStep>
  );
}
