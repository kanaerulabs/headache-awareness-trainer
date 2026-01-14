"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore, useHasHydrated } from "@/interface-adapters/store/onboardingStore";
import { WizardContainer } from "@/components/organisms/WizardContainer";
import {
  WelcomeStep,
  HeadacheTypeStep,
  FrequencyStep,
  ReminderStep,
} from "@/components/organisms/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const { isCompleted, currentStep, totalSteps } = useOnboardingStore();
  const hasHydrated = useHasHydrated();

  // Redirect to homepage if onboarding is already completed (only after hydration)
  useEffect(() => {
    if (hasHydrated && isCompleted) {
      router.push("/");
    }
  }, [hasHydrated, isCompleted, router]);

  // Show loading skeleton until hydration completes
  if (!hasHydrated) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center"
        data-testid="onboarding-loading"
      >
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Render the appropriate step based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <HeadacheTypeStep />;
      case 2:
        return <FrequencyStep />;
      case 3:
        return <ReminderStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div
      className="bg-gradient-to-b from-background to-muted/20"
      data-testid="onboarding-page"
    >
      <WizardContainer currentStep={currentStep} totalSteps={totalSteps}>
        {renderStep()}
      </WizardContainer>
    </div>
  );
}
