/**
 * Hook to initialize user-scoped data storage
 *
 * This hook should be used at the app root level to:
 * 1. Set the current user ID for IndexedDB namespacing
 * 2. Force stores to re-hydrate when user changes
 *
 * This ensures each user has isolated data storage.
 */

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { setCurrentUserId } from "@/lib/indexeddb";
import { useOnboardingStore } from "@/interface-adapters/store/onboardingStore";
import { useLoggingStore } from "@/interface-adapters/store/loggingStore";
import { useCheckInStore } from "@/interface-adapters/store/checkinStore";
import { useSettingsStore } from "@/interface-adapters/store/settingsStore";
import { useEducationStore } from "@/interface-adapters/store/educationStore";
import { useGamificationStore } from "@/interface-adapters/store/gamificationStore";

/**
 * Force a Zustand persist store to re-hydrate from storage
 */
function rehydrateStore(store: { persist: { rehydrate: () => void | Promise<void> } }) {
  store.persist.rehydrate();
}

export function useUserDataInit() {
  const { data: session, status } = useSession();
  // Use email as user ID since NextAuth session may not have a consistent user.id
  const userId = session?.user?.email || null;
  const previousUserId = useRef<string | null | undefined>(undefined);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Don't do anything while session is loading
    if (status === "loading") return;

    // Update IndexedDB namespace first
    setCurrentUserId(userId);

    // If this is the first run with a logged-in user, or user changed, re-hydrate all stores
    const userChanged = previousUserId.current !== undefined && previousUserId.current !== userId;
    const firstRunWithUser = !isInitialized.current && userId !== null;

    if (firstRunWithUser || userChanged) {
      // Re-hydrate all stores from their new user-scoped storage keys
      // This ensures we read from the correct localStorage/IndexedDB for this user
      rehydrateStore(useOnboardingStore);
      rehydrateStore(useLoggingStore);
      rehydrateStore(useCheckInStore);
      rehydrateStore(useSettingsStore);
      rehydrateStore(useEducationStore);
      rehydrateStore(useGamificationStore);

      // Re-initialize IndexedDB stores (they need to open new user-scoped DBs)
      useLoggingStore.getState().initializeDB();
      useCheckInStore.getState().initializeDB();
      useGamificationStore.getState().initializeDB();
    }

    previousUserId.current = userId;
    isInitialized.current = true;
  }, [userId, status]);

  return { userId, isReady: isInitialized.current && status !== "loading" };
}
