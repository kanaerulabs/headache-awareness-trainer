/**
 * Headache Logging Hook
 *
 * Clean Architecture hook that wraps the use cases for headache logging.
 * Provides a clean API while maintaining backward compatibility with the store.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  LogHeadacheUseCase,
  GetRecentHeadachesUseCase,
  DeleteHeadacheUseCase,
  LogHeadacheInput,
  LogHeadacheOutput,
} from "../../usecases/log-headache.usecase";
import { HeadacheEntryProps } from "../../domains/headache-entry/headache-entry.entity";
import { getHeadacheEntryRepository } from "../repositories/headache-entry.repository";

/**
 * Hook result interface
 */
interface UseHeadacheLoggingResult {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;

  // Actions
  logHeadache: (input: LogHeadacheInput) => Promise<LogHeadacheOutput>;
  getRecentEntries: (limit?: number) => Promise<HeadacheEntryProps[]>;
  deleteEntry: (id: string) => Promise<void>;

  // Recent entries cache for convenience
  recentEntries: HeadacheEntryProps[];
  refreshRecentEntries: () => Promise<void>;
}

/**
 * Hook for headache logging using Clean Architecture use cases
 */
export function useHeadacheLogging(): UseHeadacheLoggingResult {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [recentEntries, setRecentEntries] = useState<HeadacheEntryProps[]>([]);

  // Use cases (created once)
  const [useCases, setUseCases] = useState<{
    logHeadache: LogHeadacheUseCase;
    getRecent: GetRecentHeadachesUseCase;
    deleteEntry: DeleteHeadacheUseCase;
  } | null>(null);

  // Initialize repository and use cases
  useEffect(() => {
    const init = async () => {
      try {
        const repository = getHeadacheEntryRepository();
        await repository.initialize();

        setUseCases({
          logHeadache: new LogHeadacheUseCase(repository),
          getRecent: new GetRecentHeadachesUseCase(repository),
          deleteEntry: new DeleteHeadacheUseCase(repository),
        });

        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to initialize"));
      }
    };

    init();
  }, []);

  // Log headache action
  const logHeadache = useCallback(
    async (input: LogHeadacheInput): Promise<LogHeadacheOutput> => {
      if (!useCases) {
        throw new Error("Not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await useCases.logHeadache.execute(input);

        // Update recent entries cache
        setRecentEntries((prev) => [result.entry, ...prev.slice(0, 4)]);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to log");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [useCases],
  );

  // Get recent entries action
  const getRecentEntries = useCallback(
    async (limit: number = 5): Promise<HeadacheEntryProps[]> => {
      if (!useCases) {
        return [];
      }

      setIsLoading(true);
      try {
        return await useCases.getRecent.execute(limit);
      } finally {
        setIsLoading(false);
      }
    },
    [useCases],
  );

  // Delete entry action
  const deleteEntry = useCallback(
    async (id: string): Promise<void> => {
      if (!useCases) {
        throw new Error("Not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        await useCases.deleteEntry.execute(id);

        // Update recent entries cache
        setRecentEntries((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delete");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [useCases],
  );

  // Refresh recent entries
  const refreshRecentEntries = useCallback(async () => {
    if (!useCases) return;

    try {
      const entries = await useCases.getRecent.execute(5);
      setRecentEntries(entries);
    } catch (err) {
      console.error("Failed to refresh entries:", err);
    }
  }, [useCases]);

  // Load initial entries when ready
  useEffect(() => {
    if (isReady) {
      refreshRecentEntries();
    }
  }, [isReady, refreshRecentEntries]);

  return {
    isReady,
    isLoading,
    error,
    logHeadache,
    getRecentEntries,
    deleteEntry,
    recentEntries,
    refreshRecentEntries,
  };
}
