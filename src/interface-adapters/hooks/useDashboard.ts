/**
 * Dashboard Hook
 *
 * Clean Architecture hook that provides dashboard data using use cases.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GetDashboardDataUseCase,
  DashboardData,
} from "../../usecases/get-dashboard-data.usecase";
import { getHeadacheEntryRepository } from "../repositories/headache-entry.repository";
import { getCheckInRepository } from "../repositories/checkin.repository";
import { StreakCalculator } from "../../domains/streak/streak.entity";

/**
 * Hook result interface
 */
interface UseDashboardResult {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;

  // Dashboard data
  data: DashboardData | null;

  // Actions
  refreshDashboard: () => Promise<void>;

  // Streak message helper
  getStreakMessage: () => string;
}

/**
 * Default dashboard data
 */
const defaultDashboardData: DashboardData = {
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLogged: 0,
    lastLogDate: null,
  },
  weeklySummary: {
    headacheCount: 0,
    checkInCount: 0,
    averageIntensity: null,
    mostCommonTimeOfDay: null,
  },
  trend: "stable",
  recentEntries: [],
  todayLogged: false,
};

/**
 * Hook for dashboard data using Clean Architecture use cases
 */
export function useDashboard(): UseDashboardResult {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [useCase, setUseCase] = useState<GetDashboardDataUseCase | null>(null);

  // Initialize repositories and use case
  useEffect(() => {
    const init = async () => {
      try {
        const headacheRepo = getHeadacheEntryRepository();
        const checkInRepo = getCheckInRepository();

        await Promise.all([
          headacheRepo.initialize(),
          checkInRepo.initialize(),
        ]);

        const dashboardUseCase = new GetDashboardDataUseCase(
          headacheRepo,
          checkInRepo,
        );

        setUseCase(dashboardUseCase);
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to initialize"));
      }
    };

    init();
  }, []);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    if (!useCase) return;

    setIsLoading(true);
    setError(null);

    try {
      const dashboardData = await useCase.execute();
      setData(dashboardData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load dashboard");
      setError(error);
      // Set default data on error
      setData(defaultDashboardData);
    } finally {
      setIsLoading(false);
    }
  }, [useCase]);

  // Load initial data when ready
  useEffect(() => {
    if (isReady) {
      refreshDashboard();
    }
  }, [isReady, refreshDashboard]);

  // Get streak message helper
  const getStreakMessage = useCallback((): string => {
    if (!data) return "Start your streak today!";
    return StreakCalculator.getStreakMessage(data.streak);
  }, [data]);

  return {
    isReady,
    isLoading,
    error,
    data,
    refreshDashboard,
    getStreakMessage,
  };
}
