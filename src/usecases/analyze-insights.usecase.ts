/**
 * Analyze Insights Use Cases
 *
 * Business logic for headache pattern analysis, correlations,
 * and personalized insights generation.
 */

import { HeadacheEntryProps } from "../domains/headache-entry/headache-entry.entity";
import { CheckInProps } from "../domains/checkin/checkin.entity";
import { HeadacheEntryRepository } from "./log-headache.usecase";
import { CheckInRepository } from "./manage-checkin.usecase";

// ============================================================================
// Types
// ============================================================================

/**
 * Correlation result between a factor and headache occurrence
 */
export interface CorrelationResult {
  factor: "sleep" | "stress" | "jawTension" | "mood" | "timeOfDay";
  strength: number; // 0-100
  trend: "positive" | "negative" | "neutral";
  description: string;
}

/**
 * Weekly trend data
 */
export interface WeeklyTrendData {
  weekStart: Date;
  weekEnd: Date;
  headacheCount: number;
  averageIntensity: number;
  checkinCount: number;
}

/**
 * Time of day analysis data
 */
export interface TimeOfDayData {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  percentage: number; // 0-100
  count: number;
}

/**
 * Calendar day data for visualization
 */
export interface CalendarDayData {
  date: Date;
  headacheCount: number;
  maxIntensity: number; // 0-5, 0 = no headache
  checkinCount: number;
  entries: { type: "headache" | "checkin"; id: string }[];
}

/**
 * Insight with unlock state
 */
export interface Insight {
  id: string;
  title: string;
  description: string;
  category: "pattern" | "trigger" | "tip" | "achievement";
  isPersonal: boolean;
  isUnlocked: boolean;
  unlockCondition?: string;
}

// ============================================================================
// Helper Functions (Pure Functions)
// ============================================================================

/**
 * Get date only (no time) - using UTC to avoid timezone issues
 */
const getDateOnly = (date: Date): Date => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
};

/**
 * Format date to ISO string for map key
 */
const getDateKey = (date: Date): string => {
  return getDateOnly(date).toISOString();
};

/**
 * Get time of day from timestamp (using UTC hours)
 */
const getTimeOfDay = (
  timestamp: Date
): "morning" | "afternoon" | "evening" | "night" => {
  const hour = timestamp.getUTCHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

/**
 * Get week start (Monday) for a date
 */
const getWeekStart = (date: Date): Date => {
  const d = getDateOnly(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const weekStart = new Date(d);
  weekStart.setUTCDate(d.getUTCDate() - diff);
  return weekStart;
};

/**
 * Get week end (Sunday) for a date
 */
const getWeekEnd = (weekStart: Date): Date => {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 6);
  return d;
};

// ============================================================================
// Use Cases
// ============================================================================

/**
 * Calculate Correlations Use Case
 *
 * Analyzes the relationship between factors (sleep, stress, jaw tension)
 * and headache occurrence using rate comparison.
 */
export class CalculateCorrelationsUseCase {
  constructor(
    private readonly headacheRepository: HeadacheEntryRepository,
    private readonly checkinRepository: CheckInRepository
  ) {}

  async execute(): Promise<CorrelationResult[]> {
    const headacheEntries = await this.headacheRepository.findAll();
    const checkinEntries = await this.checkinRepository.findAll();

    const headaches = headacheEntries.map((e) => e.toPlainObject());
    const checkins = checkinEntries.map((e) => e.toPlainObject());

    return this.calculateFromData(headaches, checkins);
  }

  /**
   * Pure function to calculate correlations from raw data
   * (Useful for testing without repositories)
   */
  calculateFromData(
    headaches: HeadacheEntryProps[],
    checkins: CheckInProps[]
  ): CorrelationResult[] {
    if (headaches.length === 0 && checkins.length === 0) {
      return [];
    }

    const correlations: CorrelationResult[] = [];

    // Group headaches and checkins by date
    const headachesByDate = this.groupByDate(headaches);
    const checkinsByDate = this.groupByDate(checkins);

    // Calculate sleep correlation
    const sleepCorrelation = this.calculateSleepCorrelation(
      headachesByDate,
      checkinsByDate
    );
    if (sleepCorrelation) {
      correlations.push(sleepCorrelation);
    }

    // Calculate stress correlation
    const stressCorrelation = this.calculateStressCorrelation(
      headachesByDate,
      checkinsByDate
    );
    if (stressCorrelation) {
      correlations.push(stressCorrelation);
    }

    // Calculate jaw tension correlation
    const jawCorrelation = this.calculateJawTensionCorrelation(
      headachesByDate,
      checkinsByDate
    );
    if (jawCorrelation) {
      correlations.push(jawCorrelation);
    }

    return correlations;
  }

  private groupByDate<T extends { timestamp: Date }>(
    entries: T[]
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();
    entries.forEach((entry) => {
      const key = getDateKey(entry.timestamp);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(entry);
    });
    return map;
  }

  private calculateSleepCorrelation(
    headachesByDate: Map<string, HeadacheEntryProps[]>,
    checkinsByDate: Map<string, CheckInProps[]>
  ): CorrelationResult | null {
    let poorSleepDays = 0;
    let poorSleepHeadacheDays = 0;
    let goodSleepDays = 0;
    let goodSleepHeadacheDays = 0;

    checkinsByDate.forEach((checkins, dateKey) => {
      const hasPoorSleep = checkins.some((c) => c.sleepQuality === "poor");
      const hasHeadache = headachesByDate.has(dateKey);

      if (hasPoorSleep) {
        poorSleepDays++;
        if (hasHeadache) poorSleepHeadacheDays++;
      } else {
        goodSleepDays++;
        if (hasHeadache) goodSleepHeadacheDays++;
      }
    });

    if (poorSleepDays === 0 && goodSleepDays === 0) {
      return null;
    }

    const poorSleepRate =
      poorSleepDays > 0 ? poorSleepHeadacheDays / poorSleepDays : 0;
    const goodSleepRate =
      goodSleepDays > 0 ? goodSleepHeadacheDays / goodSleepDays : 0;
    const strength = Math.min(
      100,
      Math.abs(poorSleepRate - goodSleepRate) * 100
    );

    return {
      factor: "sleep",
      strength: Math.round(strength),
      trend: poorSleepRate > goodSleepRate ? "negative" : "positive",
      description: `Poor sleep is associated with ${Math.round(poorSleepRate * 100)}% headache rate vs ${Math.round(goodSleepRate * 100)}% on good sleep days.`,
    };
  }

  private calculateStressCorrelation(
    headachesByDate: Map<string, HeadacheEntryProps[]>,
    checkinsByDate: Map<string, CheckInProps[]>
  ): CorrelationResult | null {
    let stressedDays = 0;
    let stressedHeadacheDays = 0;
    let calmDays = 0;
    let calmHeadacheDays = 0;

    checkinsByDate.forEach((checkins, dateKey) => {
      const hasStress = checkins.some(
        (c) => c.mood === "stressed" || c.mood === "anxious"
      );
      const hasHeadache = headachesByDate.has(dateKey);

      if (hasStress) {
        stressedDays++;
        if (hasHeadache) stressedHeadacheDays++;
      } else {
        calmDays++;
        if (hasHeadache) calmHeadacheDays++;
      }
    });

    if (stressedDays === 0 && calmDays === 0) {
      return null;
    }

    const stressRate =
      stressedDays > 0 ? stressedHeadacheDays / stressedDays : 0;
    const calmRate = calmDays > 0 ? calmHeadacheDays / calmDays : 0;
    const strength = Math.min(100, Math.abs(stressRate - calmRate) * 100);

    return {
      factor: "stress",
      strength: Math.round(strength),
      trend: stressRate > calmRate ? "positive" : "neutral",
      description: `Stress days show ${Math.round(stressRate * 100)}% headache rate vs ${Math.round(calmRate * 100)}% on calm days.`,
    };
  }

  private calculateJawTensionCorrelation(
    headachesByDate: Map<string, HeadacheEntryProps[]>,
    checkinsByDate: Map<string, CheckInProps[]>
  ): CorrelationResult | null {
    let jawTensionDays = 0;
    let jawTensionHeadacheDays = 0;
    let noJawTensionDays = 0;
    let noJawTensionHeadacheDays = 0;

    checkinsByDate.forEach((checkins, dateKey) => {
      const hasJawTension = checkins.some((c) => c.bodyTension.includes("jaw"));
      const hasHeadache = headachesByDate.has(dateKey);

      if (hasJawTension) {
        jawTensionDays++;
        if (hasHeadache) jawTensionHeadacheDays++;
      } else {
        noJawTensionDays++;
        if (hasHeadache) noJawTensionHeadacheDays++;
      }
    });

    if (jawTensionDays === 0 && noJawTensionDays === 0) {
      return null;
    }

    const jawRate =
      jawTensionDays > 0 ? jawTensionHeadacheDays / jawTensionDays : 0;
    const noJawRate =
      noJawTensionDays > 0 ? noJawTensionHeadacheDays / noJawTensionDays : 0;
    const strength = Math.min(100, Math.abs(jawRate - noJawRate) * 100);

    return {
      factor: "jawTension",
      strength: Math.round(strength),
      trend: jawRate > noJawRate ? "positive" : "neutral",
      description: `Jaw tension days show ${Math.round(jawRate * 100)}% headache rate vs ${Math.round(noJawRate * 100)}% without tension.`,
    };
  }
}

/**
 * Get Weekly Trends Use Case
 *
 * Aggregates headache and check-in data by week for trend visualization.
 */
export class GetWeeklyTrendsUseCase {
  constructor(
    private readonly headacheRepository: HeadacheEntryRepository,
    private readonly checkinRepository: CheckInRepository
  ) {}

  async execute(filter: 30 | 90 | "all"): Promise<WeeklyTrendData[]> {
    const headacheEntries = await this.headacheRepository.findAll();
    const checkinEntries = await this.checkinRepository.findAll();

    const headaches = headacheEntries.map((e) => e.toPlainObject());
    const checkins = checkinEntries.map((e) => e.toPlainObject());

    return this.calculateFromData(headaches, checkins, filter);
  }

  /**
   * Pure function to calculate weekly trends from raw data
   */
  calculateFromData(
    headaches: HeadacheEntryProps[],
    checkins: CheckInProps[],
    filter: 30 | 90 | "all"
  ): WeeklyTrendData[] {
    const now = new Date();
    let startDate: Date;

    if (filter === "all") {
      const allDates = [
        ...headaches.map((e) => e.timestamp),
        ...checkins.map((e) => e.timestamp),
      ];
      startDate =
        allDates.length > 0
          ? new Date(Math.min(...allDates.map((d) => d.getTime())))
          : now;
    } else {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - filter);
    }

    // Group by week
    const weekDataMap = new Map<string, WeeklyTrendData>();

    // Process headache entries
    headaches.forEach((entry) => {
      if (entry.timestamp >= startDate) {
        const weekStart = getWeekStart(entry.timestamp);
        const key = getDateKey(weekStart);

        if (!weekDataMap.has(key)) {
          weekDataMap.set(key, {
            weekStart,
            weekEnd: getWeekEnd(weekStart),
            headacheCount: 0,
            averageIntensity: 0,
            checkinCount: 0,
          });
        }

        const weekData = weekDataMap.get(key)!;
        const newTotal =
          weekData.averageIntensity * weekData.headacheCount + entry.intensity;
        weekData.headacheCount++;
        weekData.averageIntensity = newTotal / weekData.headacheCount;
      }
    });

    // Process checkin entries
    checkins.forEach((entry) => {
      if (entry.timestamp >= startDate) {
        const weekStart = getWeekStart(entry.timestamp);
        const key = getDateKey(weekStart);

        if (!weekDataMap.has(key)) {
          weekDataMap.set(key, {
            weekStart,
            weekEnd: getWeekEnd(weekStart),
            headacheCount: 0,
            averageIntensity: 0,
            checkinCount: 0,
          });
        }

        const weekData = weekDataMap.get(key)!;
        weekData.checkinCount++;
      }
    });

    // Fill in missing weeks with zero data
    const allWeeks: WeeklyTrendData[] = [];
    const currentWeekStart = getWeekStart(startDate);
    const endWeekStart = getWeekStart(now);

    let weekCursor = new Date(currentWeekStart);
    while (weekCursor <= endWeekStart) {
      const key = getDateKey(weekCursor);
      if (weekDataMap.has(key)) {
        allWeeks.push(weekDataMap.get(key)!);
      } else {
        allWeeks.push({
          weekStart: new Date(weekCursor),
          weekEnd: getWeekEnd(weekCursor),
          headacheCount: 0,
          averageIntensity: 0,
          checkinCount: 0,
        });
      }
      const nextDate = new Date(weekCursor);
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      weekCursor = nextDate;
    }

    return allWeeks.sort(
      (a, b) => a.weekStart.getTime() - b.weekStart.getTime()
    );
  }
}

/**
 * Get Time of Day Analysis Use Case
 *
 * Analyzes distribution of headaches by time of day.
 */
export class GetTimeOfDayAnalysisUseCase {
  constructor(private readonly headacheRepository: HeadacheEntryRepository) {}

  async execute(): Promise<TimeOfDayData[]> {
    const headacheEntries = await this.headacheRepository.findAll();
    const headaches = headacheEntries.map((e) => e.toPlainObject());
    return this.calculateFromData(headaches);
  }

  /**
   * Pure function to calculate time of day distribution
   */
  calculateFromData(headaches: HeadacheEntryProps[]): TimeOfDayData[] {
    if (headaches.length === 0) {
      return [];
    }

    const counts = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    headaches.forEach((entry) => {
      const timeOfDay = getTimeOfDay(entry.timestamp);
      counts[timeOfDay]++;
    });

    const total = headaches.length;

    return [
      {
        timeOfDay: "morning",
        count: counts.morning,
        percentage: Math.round((counts.morning / total) * 100),
      },
      {
        timeOfDay: "afternoon",
        count: counts.afternoon,
        percentage: Math.round((counts.afternoon / total) * 100),
      },
      {
        timeOfDay: "evening",
        count: counts.evening,
        percentage: Math.round((counts.evening / total) * 100),
      },
      {
        timeOfDay: "night",
        count: counts.night,
        percentage: Math.round((counts.night / total) * 100),
      },
    ];
  }
}

/**
 * Get Calendar Data Use Case
 *
 * Aggregates headache and check-in data by day for calendar visualization.
 */
export class GetCalendarDataUseCase {
  constructor(
    private readonly headacheRepository: HeadacheEntryRepository,
    private readonly checkinRepository: CheckInRepository
  ) {}

  async execute(startDate: Date, endDate: Date): Promise<CalendarDayData[]> {
    const [headacheEntries, checkinEntries] = await Promise.all([
      this.headacheRepository.findByDateRange(startDate, endDate),
      this.checkinRepository.findAll(), // CheckInRepository doesn't have findByDateRange
    ]);

    const headaches = headacheEntries.map((e) => e.toPlainObject());
    const checkins = checkinEntries
      .map((e) => e.toPlainObject())
      .filter((c) => c.timestamp >= startDate && c.timestamp <= endDate);

    return this.calculateFromData(headaches, checkins, startDate, endDate);
  }

  /**
   * Pure function to calculate calendar data
   */
  calculateFromData(
    headaches: HeadacheEntryProps[],
    checkins: CheckInProps[],
    startDate: Date,
    endDate: Date
  ): CalendarDayData[] {
    const start = getDateOnly(startDate);
    const end = getDateOnly(endDate);

    const dataByDate = new Map<string, CalendarDayData>();

    // Process headache entries
    headaches.forEach((entry) => {
      const entryDate = getDateOnly(entry.timestamp);
      if (entryDate >= start && entryDate <= end) {
        const key = getDateKey(entryDate);
        if (!dataByDate.has(key)) {
          dataByDate.set(key, {
            date: entryDate,
            headacheCount: 0,
            maxIntensity: 0,
            checkinCount: 0,
            entries: [],
          });
        }

        const dayData = dataByDate.get(key)!;
        dayData.headacheCount++;
        dayData.maxIntensity = Math.max(dayData.maxIntensity, entry.intensity);
        dayData.entries.push({ type: "headache", id: entry.id });
      }
    });

    // Process checkin entries
    checkins.forEach((entry) => {
      const entryDate = getDateOnly(entry.timestamp);
      if (entryDate >= start && entryDate <= end) {
        const key = getDateKey(entryDate);
        if (!dataByDate.has(key)) {
          dataByDate.set(key, {
            date: entryDate,
            headacheCount: 0,
            maxIntensity: 0,
            checkinCount: 0,
            entries: [],
          });
        }

        const dayData = dataByDate.get(key)!;
        dayData.checkinCount++;
        dayData.entries.push({ type: "checkin", id: entry.id });
      }
    });

    return Array.from(dataByDate.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }
}

/**
 * Check Insight Unlocks Use Case
 *
 * Determines which personal insights should be unlocked based on user progress.
 */
export class CheckInsightUnlocksUseCase {
  /**
   * Calculate days since registration
   */
  calculateDaysSinceRegistration(registrationDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if personal insights should be unlocked
   * Personal insights require 14+ days (Week 2) of data
   */
  shouldUnlockPersonalInsights(registrationDate: Date | null): boolean {
    if (!registrationDate) {
      return false;
    }
    const daysSinceRegistration =
      this.calculateDaysSinceRegistration(registrationDate);
    return daysSinceRegistration >= 14;
  }

  /**
   * Get all insights with unlock status
   */
  getInsights(registrationDate: Date | null): {
    personalInsights: Insight[];
    generalInsights: Insight[];
  } {
    const shouldUnlockPersonal =
      this.shouldUnlockPersonalInsights(registrationDate);

    return {
      personalInsights: PERSONAL_INSIGHTS.map((insight) => ({
        ...insight,
        isUnlocked: shouldUnlockPersonal,
      })),
      generalInsights: GENERAL_INSIGHTS.map((insight) => ({
        ...insight,
        isUnlocked: true,
      })),
    };
  }
}

// ============================================================================
// Static Insight Data (Research-backed)
// ============================================================================

/**
 * General insights (research-backed, available from Day 1)
 * NOTE: title and description use translation keys from "insightData" namespace
 */
const GENERAL_INSIGHTS: Insight[] = [
  {
    id: "gen-1",
    title: "insightData.gen1Title",
    description: "insightData.gen1Desc",
    category: "tip",
    isPersonal: false,
    isUnlocked: true,
  },
  {
    id: "gen-2",
    title: "insightData.gen2Title",
    description: "insightData.gen2Desc",
    category: "tip",
    isPersonal: false,
    isUnlocked: true,
  },
  {
    id: "gen-3",
    title: "insightData.gen3Title",
    description: "insightData.gen3Desc",
    category: "trigger",
    isPersonal: false,
    isUnlocked: true,
  },
];

/**
 * Personal insights (unlocked after Week 2)
 * NOTE: title, description, and unlockCondition use translation keys from "insightData" namespace
 */
const PERSONAL_INSIGHTS: Insight[] = [
  {
    id: "pers-1",
    title: "insightData.pers1Title",
    description: "insightData.pers1Desc",
    category: "pattern",
    isPersonal: true,
    isUnlocked: false,
    unlockCondition: "insightData.week2Plus",
  },
  {
    id: "pers-2",
    title: "insightData.pers2Title",
    description: "insightData.pers2Desc",
    category: "trigger",
    isPersonal: true,
    isUnlocked: false,
    unlockCondition: "insightData.week2Plus",
  },
  {
    id: "pers-3",
    title: "insightData.pers3Title",
    description: "insightData.pers3Desc",
    category: "pattern",
    isPersonal: true,
    isUnlocked: false,
    unlockCondition: "insightData.week2Plus",
  },
];
