"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import type { MicroWinMessage } from "@/interface-adapters/store/gamificationStore";

export interface MicroWinToastProps {
  /**
   * Micro-win message to display
   */
  message: MicroWinMessage;
  /**
   * Auto-dismiss duration in milliseconds
   * @default 3000
   */
  duration?: number;
}

/**
 * MicroWinToast - Toast notification for micro-win messages
 *
 * Displays encouraging micro-win messages with auto-dismiss.
 * Uses shadcn Toast component for consistent notification styling.
 *
 * @example
 * ```tsx
 * const message = useGamificationStore((state) =>
 *   state.getMicroWinMessage({ isFirstEntry: true })
 * );
 * if (message) {
 *   showMicroWinToast(message);
 * }
 * ```
 */
export const useMicroWinToast = () => {
  const { toast } = useToast();

  const showMicroWinToast = React.useCallback(
    (message: MicroWinMessage, duration: number = 3000) => {
      toast({
        title: `${message.emoji} Micro-Win!`,
        description: message.message,
        duration,
        className:
          "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800",
      });
    },
    [toast],
  );

  return { showMicroWinToast };
};

/**
 * Hook to automatically show micro-win toast based on context
 *
 * @example
 * ```tsx
 * // In component after logging entry
 * const { showMicroWinForContext } = useAutoMicroWinToast();
 *
 * const handleEntryLogged = async () => {
 *   await logEntry(entry);
 *   showMicroWinForContext({
 *     isFirstEntry: totalEntries === 1,
 *     currentStreak: metadata.currentStreak,
 *     totalEntries,
 *   });
 * };
 * ```
 */
export const useAutoMicroWinToast = () => {
  const { showMicroWinToast } = useMicroWinToast();

  const showMicroWinForContext = React.useCallback(
    (context: {
      isFirstEntry?: boolean;
      currentStreak?: number;
      totalEntries?: number;
      justUnlockedFeature?: boolean;
      weekNumber?: number;
    }) => {
      // Import the store dynamically to avoid circular deps
      const getMicroWinMessage = async () => {
        const { useGamificationStore } =
          await import("@/interface-adapters/store/gamificationStore");
        return useGamificationStore.getState().getMicroWinMessage(context);
      };

      getMicroWinMessage().then((message) => {
        if (message) {
          showMicroWinToast(message);
        }
      });
    },
    [showMicroWinToast],
  );

  return { showMicroWinForContext };
};
