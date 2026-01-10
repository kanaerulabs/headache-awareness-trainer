import { create } from 'zustand';
import { useLoggingStore } from './loggingStore';
import { useCheckInStore } from './checkinStore';

/**
 * Calendar Day Data
 */
export interface CalendarDayData {
  date: Date;
  headacheCount: number;
  maxIntensity: number; // 0-5, 0 = no headache
  checkinCount: number;
  entries: { type: 'headache' | 'checkin'; id: string }[];
}

/**
 * Correlation Result
 */
export interface CorrelationResult {
  factor: 'sleep' | 'stress' | 'jawTension' | 'mood' | 'timeOfDay';
  strength: number; // 0-100
  trend: 'positive' | 'negative' | 'neutral';
  description: string;
}

/**
 * Weekly Trend Data
 */
export interface WeeklyTrendData {
  weekStart: Date;
  weekEnd: Date;
  headacheCount: number;
  averageIntensity: number;
  checkinCount: number;
}

/**
 * Time of Day Data
 */
export interface TimeOfDayData {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  percentage: number; // 0-100
  count: number;
}

/**
 * Insight
 */
export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'pattern' | 'trigger' | 'tip' | 'achievement';
  isPersonal: boolean;
  isUnlocked: boolean;
  unlockCondition?: string;
}

/**
 * Insights Store State
 */
export interface InsightsState {
  // Calendar Data
  getCalendarData: (startDate: Date, endDate: Date) => Promise<CalendarDayData[]>;

  // Correlation Analysis
  correlations: CorrelationResult[];
  calculateCorrelations: () => Promise<CorrelationResult[]>;

  // Trend Analysis
  getWeeklyTrends: (filter: 30 | 90 | 'all') => Promise<WeeklyTrendData[]>;

  // Time of Day
  getTimeOfDayAnalysis: () => Promise<TimeOfDayData[]>;

  // Insights
  personalInsights: Insight[];
  generalInsights: Insight[];
  checkInsightUnlocks: () => void;

  // Data Refresh
  refreshInsights: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Helper: Get date only (no time)
 */
const getDateOnly = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Helper: Format date to ISO string for map key
 */
const getDateKey = (date: Date): string => {
  return getDateOnly(date).toISOString();
};

/**
 * Helper: Get time of day from hour
 */
const getTimeOfDay = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

/**
 * Helper: Get week start (Monday) for a date
 */
const getWeekStart = (date: Date): Date => {
  const d = getDateOnly(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  d.setDate(d.getDate() - diff);
  return d;
};

/**
 * Helper: Get week end (Sunday) for a date
 */
const getWeekEnd = (weekStart: Date): Date => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
};

/**
 * General insights (research-backed, available from Day 1)
 */
const GENERAL_INSIGHTS: Insight[] = [
  {
    id: 'gen-1',
    title: 'Hydration Matters',
    description: 'Studies show dehydration is a common headache trigger. Try drinking 8 glasses of water daily.',
    category: 'tip',
    isPersonal: false,
    isUnlocked: true,
  },
  {
    id: 'gen-2',
    title: 'Sleep Consistency',
    description: 'Research indicates irregular sleep patterns can trigger headaches. Aim for consistent sleep times.',
    category: 'tip',
    isPersonal: false,
    isUnlocked: true,
  },
  {
    id: 'gen-3',
    title: 'Jaw Tension Connection',
    description: 'TMJ disorders and jaw clenching are strongly linked to tension headaches.',
    category: 'trigger',
    isPersonal: false,
    isUnlocked: true,
  },
];

/**
 * Personal insights (unlocked after Week 2)
 */
const PERSONAL_INSIGHTS: Insight[] = [
  {
    id: 'pers-1',
    title: 'Your Sleep Pattern',
    description: 'Based on your data, poor sleep quality appears linked to headaches the following day.',
    category: 'pattern',
    isPersonal: true,
    isUnlocked: false,
    unlockCondition: 'Week 2+',
  },
  {
    id: 'pers-2',
    title: 'Stress Trigger',
    description: 'Your headaches correlate with high stress levels. Consider stress management techniques.',
    category: 'trigger',
    isPersonal: true,
    isUnlocked: false,
    unlockCondition: 'Week 2+',
  },
  {
    id: 'pers-3',
    title: 'Morning Headaches',
    description: 'You experience most headaches in the morning, which may indicate sleep-related triggers.',
    category: 'pattern',
    isPersonal: true,
    isUnlocked: false,
    unlockCondition: 'Week 2+',
  },
];

/**
 * Zustand store for insights and pattern analysis
 */
export const useInsightsStore = create<InsightsState>((set, get) => ({
  correlations: [],
  personalInsights: [...PERSONAL_INSIGHTS],
  generalInsights: [...GENERAL_INSIGHTS],
  isLoading: false,

  /**
   * Get calendar data for a date range
   */
  getCalendarData: async (startDate: Date, endDate: Date): Promise<CalendarDayData[]> => {
    const loggingStore = useLoggingStore.getState();
    const checkinStore = useCheckInStore.getState();

    // Fetch all entries
    const headacheEntries = await loggingStore.getAllEntries();
    const checkinEntries = await checkinStore.getAllCheckIns();

    // Normalize dates for comparison
    const start = getDateOnly(startDate);
    const end = getDateOnly(endDate);

    // Group by date
    const dataByDate = new Map<string, CalendarDayData>();

    // Process headache entries
    headacheEntries.forEach((entry) => {
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
        dayData.entries.push({ type: 'headache', id: entry.id });
      }
    });

    // Process checkin entries
    checkinEntries.forEach((entry) => {
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
        dayData.entries.push({ type: 'checkin', id: entry.id });
      }
    });

    // Convert to array and sort by date
    return Array.from(dataByDate.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  },

  /**
   * Calculate correlations between factors and headaches
   */
  calculateCorrelations: async (): Promise<CorrelationResult[]> => {
    const loggingStore = useLoggingStore.getState();
    const checkinStore = useCheckInStore.getState();

    const headacheEntries = await loggingStore.getAllEntries();
    const checkinEntries = await checkinStore.getAllCheckIns();

    if (headacheEntries.length === 0 && checkinEntries.length === 0) {
      return [];
    }

    const correlations: CorrelationResult[] = [];

    // Group headaches and checkins by date
    const headachesByDate = new Map<string, typeof headacheEntries>();
    headacheEntries.forEach((entry) => {
      const key = getDateKey(entry.timestamp);
      if (!headachesByDate.has(key)) {
        headachesByDate.set(key, []);
      }
      headachesByDate.get(key)!.push(entry);
    });

    const checkinsByDate = new Map<string, typeof checkinEntries>();
    checkinEntries.forEach((entry) => {
      const key = getDateKey(entry.timestamp);
      if (!checkinsByDate.has(key)) {
        checkinsByDate.set(key, []);
      }
      checkinsByDate.get(key)!.push(entry);
    });

    // Calculate sleep correlation
    let poorSleepDays = 0;
    let poorSleepHeadacheDays = 0;
    let goodSleepDays = 0;
    let goodSleepHeadacheDays = 0;

    checkinsByDate.forEach((checkins, dateKey) => {
      const hasPoorSleep = checkins.some((c) => c.sleepQuality === 'poor');
      const hasHeadache = headachesByDate.has(dateKey);

      if (hasPoorSleep) {
        poorSleepDays++;
        if (hasHeadache) poorSleepHeadacheDays++;
      } else {
        goodSleepDays++;
        if (hasHeadache) goodSleepHeadacheDays++;
      }
    });

    if (poorSleepDays > 0 || goodSleepDays > 0) {
      const poorSleepRate = poorSleepDays > 0 ? poorSleepHeadacheDays / poorSleepDays : 0;
      const goodSleepRate = goodSleepDays > 0 ? goodSleepHeadacheDays / goodSleepDays : 0;
      const strength = Math.min(100, Math.abs(poorSleepRate - goodSleepRate) * 100);

      correlations.push({
        factor: 'sleep',
        strength: Math.round(strength),
        trend: poorSleepRate > goodSleepRate ? 'negative' : 'positive',
        description: `Poor sleep is associated with ${Math.round(poorSleepRate * 100)}% headache rate vs ${Math.round(goodSleepRate * 100)}% on good sleep days.`,
      });
    }

    // Calculate stress correlation
    let stressedDays = 0;
    let stressedHeadacheDays = 0;
    let calmDays = 0;
    let calmHeadacheDays = 0;

    checkinsByDate.forEach((checkins, dateKey) => {
      const hasStress = checkins.some((c) => c.mood === 'stressed' || c.mood === 'anxious');
      const hasHeadache = headachesByDate.has(dateKey);

      if (hasStress) {
        stressedDays++;
        if (hasHeadache) stressedHeadacheDays++;
      } else {
        calmDays++;
        if (hasHeadache) calmHeadacheDays++;
      }
    });

    if (stressedDays > 0 || calmDays > 0) {
      const stressRate = stressedDays > 0 ? stressedHeadacheDays / stressedDays : 0;
      const calmRate = calmDays > 0 ? calmHeadacheDays / calmDays : 0;
      const strength = Math.min(100, Math.abs(stressRate - calmRate) * 100);

      correlations.push({
        factor: 'stress',
        strength: Math.round(strength),
        trend: stressRate > calmRate ? 'positive' : 'neutral',
        description: `Stress days show ${Math.round(stressRate * 100)}% headache rate vs ${Math.round(calmRate * 100)}% on calm days.`,
      });
    }

    // Calculate jaw tension correlation
    let jawTensionDays = 0;
    let jawTensionHeadacheDays = 0;
    let noJawTensionDays = 0;
    let noJawTensionHeadacheDays = 0;

    checkinsByDate.forEach((checkins, dateKey) => {
      const hasJawTension = checkins.some((c) => c.bodyTension.includes('jaw'));
      const hasHeadache = headachesByDate.has(dateKey);

      if (hasJawTension) {
        jawTensionDays++;
        if (hasHeadache) jawTensionHeadacheDays++;
      } else {
        noJawTensionDays++;
        if (hasHeadache) noJawTensionHeadacheDays++;
      }
    });

    if (jawTensionDays > 0 || noJawTensionDays > 0) {
      const jawRate = jawTensionDays > 0 ? jawTensionHeadacheDays / jawTensionDays : 0;
      const noJawRate = noJawTensionDays > 0 ? noJawTensionHeadacheDays / noJawTensionDays : 0;
      const strength = Math.min(100, Math.abs(jawRate - noJawRate) * 100);

      correlations.push({
        factor: 'jawTension',
        strength: Math.round(strength),
        trend: jawRate > noJawRate ? 'positive' : 'neutral',
        description: `Jaw tension days show ${Math.round(jawRate * 100)}% headache rate vs ${Math.round(noJawRate * 100)}% without tension.`,
      });
    }

    set({ correlations });
    return correlations;
  },

  /**
   * Get weekly trends
   */
  getWeeklyTrends: async (filter: 30 | 90 | 'all'): Promise<WeeklyTrendData[]> => {
    const loggingStore = useLoggingStore.getState();
    const checkinStore = useCheckInStore.getState();

    const headacheEntries = await loggingStore.getAllEntries();
    const checkinEntries = await checkinStore.getAllCheckIns();

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    if (filter === 'all') {
      // Use earliest entry date
      const allDates = [
        ...headacheEntries.map((e) => e.timestamp),
        ...checkinEntries.map((e) => e.timestamp),
      ];
      startDate = allDates.length > 0 ? new Date(Math.min(...allDates.map((d) => d.getTime()))) : now;
    } else {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - filter);
    }

    // Group by week
    const weekDataMap = new Map<string, WeeklyTrendData>();

    // Process headache entries
    headacheEntries.forEach((entry) => {
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
        const newTotal = weekData.averageIntensity * weekData.headacheCount + entry.intensity;
        weekData.headacheCount++;
        weekData.averageIntensity = newTotal / weekData.headacheCount;
      }
    });

    // Process checkin entries
    checkinEntries.forEach((entry) => {
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

    // Generate all weeks in range (including weeks with no data)
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

      // Create new Date to avoid const mutation lint error
      const nextDate = new Date(weekCursor);
      nextDate.setDate(nextDate.getDate() + 7);
      weekCursor = nextDate;
    }

    return allWeeks.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  },

  /**
   * Get time of day analysis
   */
  getTimeOfDayAnalysis: async (): Promise<TimeOfDayData[]> => {
    const loggingStore = useLoggingStore.getState();
    const headacheEntries = await loggingStore.getAllEntries();

    if (headacheEntries.length === 0) {
      return [];
    }

    // Count by time of day
    const counts = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    headacheEntries.forEach((entry) => {
      const hour = entry.timestamp.getHours();
      const timeOfDay = getTimeOfDay(hour);
      counts[timeOfDay]++;
    });

    const total = headacheEntries.length;

    return [
      {
        timeOfDay: 'morning',
        count: counts.morning,
        percentage: Math.round((counts.morning / total) * 100),
      },
      {
        timeOfDay: 'afternoon',
        count: counts.afternoon,
        percentage: Math.round((counts.afternoon / total) * 100),
      },
      {
        timeOfDay: 'evening',
        count: counts.evening,
        percentage: Math.round((counts.evening / total) * 100),
      },
      {
        timeOfDay: 'night',
        count: counts.night,
        percentage: Math.round((counts.night / total) * 100),
      },
    ];
  },

  /**
   * Check and update insight unlocks
   */
  checkInsightUnlocks: () => {
    const loggingStore = useLoggingStore.getState();
    const metadata = loggingStore.metadata;

    if (!metadata || !metadata.registrationDate) {
      return;
    }

    // Calculate days since registration
    const now = new Date();
    const registrationDate = new Date(metadata.registrationDate);
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
    const daysSinceRegistration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Personal insights unlock after 14+ days (Week 2)
    const shouldUnlockPersonal = daysSinceRegistration >= 14;

    set({
      personalInsights: PERSONAL_INSIGHTS.map((insight) => ({
        ...insight,
        isUnlocked: shouldUnlockPersonal,
      })),
      generalInsights: GENERAL_INSIGHTS.map((insight) => ({
        ...insight,
        isUnlocked: true,
      })),
    });
  },

  /**
   * Refresh all insights data
   */
  refreshInsights: async () => {
    set({ isLoading: true });

    try {
      // Calculate correlations
      await get().calculateCorrelations();

      // Update insight unlocks
      get().checkInsightUnlocks();

      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to refresh insights:', error);
      set({ isLoading: false });
    }
  },
}));
