import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { getCurrentUserId } from "@/lib/indexeddb";

const STORAGE_KEY_PREFIX = "onboarding-storage";

/**
 * Get the storage key scoped to the current user
 */
function getStorageKey(): string {
  const userId = getCurrentUserId();
  if (userId) {
    return `${STORAGE_KEY_PREFIX}-${userId}`;
  }
  return `${STORAGE_KEY_PREFIX}-anonymous`;
}

/**
 * Custom storage adapter that scopes localStorage to the current user
 */
const userScopedStorage: StateStorage = {
  getItem: (): string | null => {
    if (typeof window === "undefined") return null;
    const key = getStorageKey();
    return localStorage.getItem(key);
  },
  setItem: (_name: string, value: string): void => {
    if (typeof window === "undefined") return;
    const key = getStorageKey();
    localStorage.setItem(key, value);
  },
  removeItem: (): void => {
    if (typeof window === "undefined") return;
    const key = getStorageKey();
    localStorage.removeItem(key);
  },
};

export type HeadacheType = "tension" | "migraine" | "mixed" | "unsure";
export type Frequency = "daily" | "few-times-week" | "weekly" | "occasional";
export type ReminderPreference = "yes-gently" | "maybe-later";

export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  headacheType: HeadacheType | null;
  frequency: Frequency | null;
  reminderPreference: ReminderPreference | null;
  skipped: boolean;
  _hasHydrated: boolean;
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

const TOTAL_STEPS = 4; // Welcome → Type → Frequency → Reminders

const initialState: OnboardingState = {
  isCompleted: false,
  currentStep: 0,
  totalSteps: TOTAL_STEPS,
  headacheType: null,
  frequency: null,
  reminderPreference: null,
  skipped: false,
  _hasHydrated: false,
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
      name: "onboarding-storage", // Used for consistency, actual key is computed by userScopedStorage
      storage: createJSONStorage(() => userScopedStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
      partialize: (state) => ({
        isCompleted: state.isCompleted,
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
        headacheType: state.headacheType,
        frequency: state.frequency,
        reminderPreference: state.reminderPreference,
        skipped: state.skipped,
        // Don't persist _hasHydrated
      }),
    },
  ),
);

// Hook to check hydration status
export const useHasHydrated = () => useOnboardingStore((state) => state._hasHydrated);
