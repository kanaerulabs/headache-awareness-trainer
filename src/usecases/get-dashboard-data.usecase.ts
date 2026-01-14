/**
 * Get Dashboard Data Use Case
 *
 * Aggregates data for the dashboard home screen.
 * Combines data from multiple repositories to provide a complete view.
 */

import { HeadacheEntryProps } from "../domains/headache-entry/headache-entry.entity";
import { CheckInProps } from "../domains/checkin/checkin.entity";
import {
  StreakCalculator,
  StreakData,
  DailyActivity,
} from "../domains/streak/streak.entity";
import { HeadacheEntryRepository } from "./log-headache.usecase";
import { CheckInRepository } from "./manage-checkin.usecase";

/**
 * Trend direction type
 */
export type TrendDirection = "improving" | "stable" | "declining";

/**
 * Weekly summary data
 */
export interface WeeklySummary {
  headacheCount: number;
  checkInCount: number;
  averageIntensity: number | null;
  mostCommonTimeOfDay: string | null;
}

/**
 * Dashboard data output
 */
export interface DashboardData {
  streak: StreakData;
  weeklySummary: WeeklySummary;
  trend: TrendDirection;
  recentEntries: (HeadacheEntryProps | CheckInProps)[];
  todayLogged: boolean;
}

/**
 * Get Dashboard Data Use Case
 *
 * Aggregates all data needed for the dashboard home screen.
 */
export class GetDashboardDataUseCase {
  constructor(
    private readonly headacheRepository: HeadacheEntryRepository,
    private readonly checkInRepository: CheckInRepository,
  ) {}

  async execute(): Promise<DashboardData> {
    // Get all entries for calculations
    const [allHeadaches, allCheckIns] = await Promise.all([
      this.headacheRepository.findAll(),
      this.checkInRepository.findAll(),
    ]);

    // Calculate streak
    const activities = this.buildDailyActivities(allHeadaches, allCheckIns);
    const streak = StreakCalculator.calculate(activities);
    const todayLogged = StreakCalculator.isTodayLogged(activities);

    // Calculate weekly summary
    const weeklySummary = this.calculateWeeklySummary(
      allHeadaches,
      allCheckIns,
    );

    // Calculate trend
    const trend = this.calculateTrend(allHeadaches);

    // Get recent entries (last 5 of either type)
    const recentEntries = this.getRecentEntries(allHeadaches, allCheckIns, 5);

    return {
      streak,
      weeklySummary,
      trend,
      recentEntries,
      todayLogged,
    };
  }

  /**
   * Build daily activity list from headaches and check-ins
   */
  private buildDailyActivities(
    headaches: { toPlainObject: () => HeadacheEntryProps }[],
    checkIns: { toPlainObject: () => CheckInProps }[],
  ): DailyActivity[] {
    const activityMap = new Map<string, DailyActivity>();

    // Add headache activities
    for (const headache of headaches) {
      const props = headache.toPlainObject();
      const dateKey = this.getDateKey(props.timestamp);
      const existing = activityMap.get(dateKey);

      if (existing) {
        existing.hasHeadache = true;
      } else {
        activityMap.set(dateKey, {
          date: this.normalizeDate(props.timestamp),
          hasHeadache: true,
          hasCheckIn: false,
        });
      }
    }

    // Add check-in activities
    for (const checkIn of checkIns) {
      const props = checkIn.toPlainObject();
      const dateKey = this.getDateKey(props.timestamp);
      const existing = activityMap.get(dateKey);

      if (existing) {
        existing.hasCheckIn = true;
      } else {
        activityMap.set(dateKey, {
          date: this.normalizeDate(props.timestamp),
          hasHeadache: false,
          hasCheckIn: true,
        });
      }
    }

    return Array.from(activityMap.values());
  }

  /**
   * Calculate weekly summary
   */
  private calculateWeeklySummary(
    headaches: { toPlainObject: () => HeadacheEntryProps }[],
    checkIns: { toPlainObject: () => CheckInProps }[],
  ): WeeklySummary {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Filter to this week
    const weekHeadaches = headaches.filter(
      (h) => h.toPlainObject().timestamp >= oneWeekAgo,
    );
    const weekCheckIns = checkIns.filter(
      (c) => c.toPlainObject().timestamp >= oneWeekAgo,
    );

    // Calculate average intensity
    let averageIntensity: number | null = null;
    if (weekHeadaches.length > 0) {
      const totalIntensity = weekHeadaches.reduce(
        (sum, h) => sum + h.toPlainObject().intensity,
        0,
      );
      averageIntensity = totalIntensity / weekHeadaches.length;
    }

    // Find most common time of day from check-ins
    let mostCommonTimeOfDay: string | null = null;
    if (weekCheckIns.length > 0) {
      const timeCounts = new Map<string, number>();
      for (const checkIn of weekCheckIns) {
        const time = checkIn.toPlainObject().timeOfDay;
        timeCounts.set(time, (timeCounts.get(time) || 0) + 1);
      }

      let maxCount = 0;
      for (const [time, count] of timeCounts) {
        if (count > maxCount) {
          maxCount = count;
          mostCommonTimeOfDay = time;
        }
      }
    }

    return {
      headacheCount: weekHeadaches.length,
      checkInCount: weekCheckIns.length,
      averageIntensity,
      mostCommonTimeOfDay,
    };
  }

  /**
   * Calculate trend by comparing this week to last week
   */
  private calculateTrend(
    headaches: { toPlainObject: () => HeadacheEntryProps }[],
  ): TrendDirection {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // This week's headaches
    const thisWeek = headaches.filter((h) => {
      const timestamp = h.toPlainObject().timestamp;
      return timestamp >= oneWeekAgo && timestamp <= now;
    });

    // Last week's headaches
    const lastWeek = headaches.filter((h) => {
      const timestamp = h.toPlainObject().timestamp;
      return timestamp >= twoWeeksAgo && timestamp < oneWeekAgo;
    });

    // Compare counts
    const thisWeekCount = thisWeek.length;
    const lastWeekCount = lastWeek.length;

    // Also compare average intensity
    const thisWeekAvgIntensity =
      thisWeek.length > 0
        ? thisWeek.reduce((sum, h) => sum + h.toPlainObject().intensity, 0) /
          thisWeek.length
        : 0;

    const lastWeekAvgIntensity =
      lastWeek.length > 0
        ? lastWeek.reduce((sum, h) => sum + h.toPlainObject().intensity, 0) /
          lastWeek.length
        : 0;

    // Determine trend
    // Improving: fewer headaches OR same count but lower intensity
    // Declining: more headaches OR same count but higher intensity
    if (thisWeekCount < lastWeekCount) {
      return "improving";
    } else if (thisWeekCount > lastWeekCount) {
      return "declining";
    } else {
      // Same count, compare intensity
      if (thisWeekAvgIntensity < lastWeekAvgIntensity - 0.5) {
        return "improving";
      } else if (thisWeekAvgIntensity > lastWeekAvgIntensity + 0.5) {
        return "declining";
      }
      return "stable";
    }
  }

  /**
   * Get recent entries (merged and sorted)
   */
  private getRecentEntries(
    headaches: { toPlainObject: () => HeadacheEntryProps }[],
    checkIns: { toPlainObject: () => CheckInProps }[],
    limit: number,
  ): (HeadacheEntryProps | CheckInProps)[] {
    const headacheProps = headaches.map((h) => ({
      ...h.toPlainObject(),
      _type: "headache" as const,
    }));

    const checkInProps = checkIns.map((c) => ({
      ...c.toPlainObject(),
      _type: "checkin" as const,
    }));

    // Merge and sort by timestamp
    const merged = [...headacheProps, ...checkInProps].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    return merged.slice(0, limit);
  }

  /**
   * Normalize date to start of day
   */
  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Get date key for map lookup
   */
  private getDateKey(date: Date): string {
    const normalized = this.normalizeDate(date);
    return normalized.toISOString().split("T")[0];
  }
}
