"use client";

import { useEffect } from "react";
import { useSettingsStore, initializeTheme } from "@/interface-adapters/store/settingsStore";

/**
 * ThemeProvider Component
 *
 * Initializes and maintains theme state on app load.
 * Must be rendered as a client component in the root layout.
 *
 * This handles:
 * - Applying saved theme from localStorage on mount
 * - Listening for system theme changes when "system" is selected
 * - Preventing flash of wrong theme on hydration
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    // Initialize theme on mount
    const cleanup = initializeTheme();

    // Return cleanup function if provided (for system theme listener)
    return cleanup;
  }, []);

  // Re-apply theme when it changes (handles store rehydration)
  useEffect(() => {
    const { applyTheme } = useSettingsStore.getState();
    applyTheme();
  }, [theme]);

  return <>{children}</>;
}
