/**
 * Streak Domain Entity
 *
 * Represents logging streak calculations and analytics.
 * This is a value object that calculates streaks from entries.
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  lastLogDate: Date | null;
}

export interface DailyActivity {
  date: Date;
  hasHeadache: boolean;
  hasCheckIn: boolean;
}

/**
 * Streak Calculator
 *
 * Calculates streak metrics from daily activity data.
 * Business rules:
 * - A day counts if there's either a headache entry OR check-in
 * - Streak breaks if a day is missed
 * - Only consecutive days count for current streak
 */
export class StreakCalculator {
  /**
   * Calculate streak data from daily activities
   */
  static calculate(activities: DailyActivity[]): StreakData {
    if (activities.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysLogged: 0,
        lastLogDate: null,
      };
    }

    // Sort activities by date (newest first)
    const sorted = [...activities].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    // Count total days with any activity
    const daysWithActivity = sorted.filter(
      (a) => a.hasHeadache || a.hasCheckIn,
    );
    const totalDaysLogged = daysWithActivity.length;

    if (totalDaysLogged === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysLogged: 0,
        lastLogDate: null,
      };
    }

    const lastLogDate = daysWithActivity[0].date;

    // Calculate streaks
    const { currentStreak, longestStreak } =
      StreakCalculator.calculateStreaks(sorted);

    return {
      currentStreak,
      longestStreak,
      totalDaysLogged,
      lastLogDate,
    };
  }

  /**
   * Calculate current and longest streaks
   */
  private static calculateStreaks(sortedActivities: DailyActivity[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    const today = StreakCalculator.normalizeDate(new Date());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let isCurrentStreakBroken = false;

    // Create a map of dates with activity
    const activityMap = new Map<string, boolean>();
    for (const activity of sortedActivities) {
      const dateKey = StreakCalculator.getDateKey(activity.date);
      const hasActivity = activity.hasHeadache || activity.hasCheckIn;
      activityMap.set(dateKey, hasActivity);
    }

    // Calculate streaks by walking backwards from today
    const oldestDate = sortedActivities[sortedActivities.length - 1].date;
    const normalizedOldest = StreakCalculator.normalizeDate(oldestDate);
    const daysDiff = Math.ceil(
      (today.getTime() - normalizedOldest.getTime()) / (1000 * 60 * 60 * 24),
    );

    for (let daysBack = 0; daysBack <= daysDiff; daysBack++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - daysBack);
      const dateKey = StreakCalculator.getDateKey(checkDate);
      const hasActivity = activityMap.get(dateKey) || false;

      if (hasActivity) {
        tempStreak++;
        if (!isCurrentStreakBroken) {
          currentStreak = tempStreak;
        }
      } else {
        // Update longest streak before resetting
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
        isCurrentStreakBroken = true;
      }
    }

    // Final check for longest streak
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // If current streak wasn't broken, it equals the temp streak
    if (!isCurrentStreakBroken && currentStreak === 0) {
      currentStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Normalize date to start of day
   */
  private static normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Get date key for map lookup
   */
  private static getDateKey(date: Date): string {
    const normalized = StreakCalculator.normalizeDate(date);
    return normalized.toISOString().split("T")[0];
  }

  /**
   * Check if today has been logged
   */
  static isTodayLogged(activities: DailyActivity[]): boolean {
    const today = StreakCalculator.normalizeDate(new Date());
    const todayKey = StreakCalculator.getDateKey(today);

    return activities.some((a) => {
      const activityKey = StreakCalculator.getDateKey(a.date);
      return activityKey === todayKey && (a.hasHeadache || a.hasCheckIn);
    });
  }

  /**
   * Get streak status message
   */
  static getStreakMessage(streakData: StreakData): string {
    if (streakData.currentStreak === 0) {
      return "Start your streak today!";
    } else if (streakData.currentStreak === 1) {
      return "1 day streak - keep it going!";
    } else if (streakData.currentStreak < 7) {
      return `${streakData.currentStreak} day streak!`;
    } else if (streakData.currentStreak < 30) {
      return `${streakData.currentStreak} day streak! 🔥`;
    } else {
      return `${streakData.currentStreak} day streak! 🔥🔥`;
    }
  }
}
