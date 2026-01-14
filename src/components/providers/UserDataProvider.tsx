"use client";

import { useUserDataInit } from "@/interface-adapters/hooks/useUserDataInit";

/**
 * Provider component that initializes user-scoped data storage.
 *
 * This should be placed inside SessionProvider to ensure user ID is available.
 * It sets the current user ID for IndexedDB and localStorage namespacing.
 */
export function UserDataProvider({ children }: { children: React.ReactNode }) {
  // Initialize user data namespace
  useUserDataInit();

  return <>{children}</>;
}
