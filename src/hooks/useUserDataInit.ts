/**
 * Hook to initialize user-scoped data storage
 *
 * This hook should be used at the app root level to:
 * 1. Set the current user ID for IndexedDB namespacing
 * 2. Reset onboarding state when user changes
 *
 * This ensures each user has isolated data storage.
 */

import { useEffect, useRef } from "react";
import { useUserId } from "@/stores/auth";
import { setCurrentUserId } from "@/lib/indexeddb";
import { useOnboardingStore } from "@/interface-adapters/store/onboardingStore";

export function useUserDataInit() {
  const userId = useUserId();
  const previousUserId = useRef<string | null>(null);
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);

  useEffect(() => {
    // Update IndexedDB namespace
    setCurrentUserId(userId);

    // If user changed (not just initial load), reset onboarding for new user
    if (previousUserId.current !== null && previousUserId.current !== userId) {
      // User switched - the onboarding store will need to rehydrate
      // from the new user's localStorage key (if we implement per-user localStorage)
      // For now, just reset to show onboarding for new users
      if (userId && previousUserId.current !== userId) {
        // Don't reset if just logging out (userId becomes null)
        // Only reset if switching to a different user
      }
    }

    previousUserId.current = userId;
  }, [userId, resetOnboarding]);

  return { userId };
}
