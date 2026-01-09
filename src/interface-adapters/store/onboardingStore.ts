import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HeadacheType = "tension" | "migraine" | "mixed" | "unsure";
export type Frequency = "daily" | "few-times-week" | "weekly" | "occasional";
export type ReminderPreference = "yes-gently" | "maybe-later";

export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  headacheType: HeadacheType | null;
  frequency: Frequency | null;
  reminderPreference: ReminderPreference | null;
  skipped: boolean;
}

export interface OnboardingActions {
  setHeadacheType: (type: HeadacheType) => void;
  setFrequency: (frequency: Frequency) => void;
  setReminderPreference: (preference: ReminderPreference) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
  isCompleted: false,
  currentStep: 0,
  headacheType: null,
  frequency: null,
  reminderPreference: null,
  skipped: false,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...initialState,

      setHeadacheType: (type) => set({ headacheType: type }),

      setFrequency: (frequency) => set({ frequency }),

      setReminderPreference: (preference) =>
        set({ reminderPreference: preference }),

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),

      goToStep: (step) => set({ currentStep: step }),

      completeOnboarding: () =>
        set({
          isCompleted: true,
          skipped: false,
        }),

      skipOnboarding: () =>
        set({
          isCompleted: true,
          skipped: true,
        }),

      resetOnboarding: () => set(initialState),
    }),
    {
      name: "onboarding-storage",
    },
  ),
);
