/**
 * CheckIn Hook
 *
 * Clean Architecture hook that wraps the use cases for check-ins.
 * Provides a clean API while maintaining backward compatibility with the store.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CreateCheckInUseCase,
  QuickDismissUseCase,
  GetRecentCheckInsUseCase,
  DeleteCheckInUseCase,
  CreateCheckInInput,
  CreateCheckInOutput,
} from "../../usecases/manage-checkin.usecase";
import { CheckInProps } from "../../domains/checkin/checkin.entity";
import { getCheckInRepository } from "../repositories/checkin.repository";

/**
 * Hook result interface
 */
interface UseCheckInResult {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;

  // Actions
  createCheckIn: (input: CreateCheckInInput) => Promise<CreateCheckInOutput>;
  quickDismiss: () => Promise<CheckInProps>;
  getRecentCheckIns: (limit?: number) => Promise<CheckInProps[]>;
  deleteCheckIn: (id: string) => Promise<void>;

  // Recent entries cache for convenience
  recentCheckIns: CheckInProps[];
  refreshRecentCheckIns: () => Promise<void>;
}

/**
 * Hook for check-ins using Clean Architecture use cases
 */
export function useCheckIn(): UseCheckInResult {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInProps[]>([]);

  // Use cases (created once)
  const [useCases, setUseCases] = useState<{
    createCheckIn: CreateCheckInUseCase;
    quickDismiss: QuickDismissUseCase;
    getRecent: GetRecentCheckInsUseCase;
    deleteCheckIn: DeleteCheckInUseCase;
  } | null>(null);

  // Initialize repository and use cases
  useEffect(() => {
    const init = async () => {
      try {
        const repository = getCheckInRepository();
        await repository.initialize();

        setUseCases({
          createCheckIn: new CreateCheckInUseCase(repository),
          quickDismiss: new QuickDismissUseCase(repository),
          getRecent: new GetRecentCheckInsUseCase(repository),
          deleteCheckIn: new DeleteCheckInUseCase(repository),
        });

        setIsReady(true);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to initialize"),
        );
      }
    };

    init();
  }, []);

  // Create check-in action
  const createCheckIn = useCallback(
    async (input: CreateCheckInInput): Promise<CreateCheckInOutput> => {
      if (!useCases) {
        throw new Error("Not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await useCases.createCheckIn.execute(input);

        // Update recent entries cache
        setRecentCheckIns((prev) => [result.entry, ...prev.slice(0, 4)]);

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create check-in");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [useCases],
  );

  // Quick dismiss action
  const quickDismiss = useCallback(async (): Promise<CheckInProps> => {
    if (!useCases) {
      throw new Error("Not initialized");
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await useCases.quickDismiss.execute();

      // Update recent entries cache
      setRecentCheckIns((prev) => [result, ...prev.slice(0, 4)]);

      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to quick dismiss");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [useCases]);

  // Get recent check-ins action
  const getRecentCheckIns = useCallback(
    async (limit: number = 5): Promise<CheckInProps[]> => {
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

  // Delete check-in action
  const deleteCheckIn = useCallback(
    async (id: string): Promise<void> => {
      if (!useCases) {
        throw new Error("Not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        await useCases.deleteCheckIn.execute(id);

        // Update recent entries cache
        setRecentCheckIns((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to delete");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [useCases],
  );

  // Refresh recent check-ins
  const refreshRecentCheckIns = useCallback(async () => {
    if (!useCases) return;

    try {
      const entries = await useCases.getRecent.execute(5);
      setRecentCheckIns(entries);
    } catch (err) {
      console.error("Failed to refresh check-ins:", err);
    }
  }, [useCases]);

  // Load initial entries when ready
  useEffect(() => {
    if (isReady) {
      refreshRecentCheckIns();
    }
  }, [isReady, refreshRecentCheckIns]);

  return {
    isReady,
    isLoading,
    error,
    createCheckIn,
    quickDismiss,
    getRecentCheckIns,
    deleteCheckIn,
    recentCheckIns,
    refreshRecentCheckIns,
  };
}
