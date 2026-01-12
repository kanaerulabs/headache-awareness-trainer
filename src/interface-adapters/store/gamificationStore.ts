import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { openDB, DBSchema, IDBPDatabase } from "idb";

/**
 * Achievement Types
 */
export type AchievementType =
  // Streak achievements
  | "streak-3-days"
  | "streak-7-days"
  | "streak-14-days"
  | "streak-30-days"
  | "streak-60-days"
  | "streak-90-days"
  // First actions
  | "first-entry"
  | "first-checkin"
  | "first-pattern"
  | "first-week"
  // Milestone achievements
  | "entries-10"
  | "entries-50"
  | "entries-100"
  | "checkins-10"
  | "checkins-50"
  | "checkins-100";

export interface Achievement {
  id: AchievementType;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  unlockedAt?: Date;
  isUnlocked: boolean;
}

/**
 * Micro-win message types
 */
export type MicroWinType =
  | "first-entry"
  | "streak-start"
  | "streak-continue"
  | "pattern-emerging"
  | "week-complete"
  | "feature-unlock"
  | "milestone-reached"
  | "consistency-praise";

export interface MicroWinMessage {
  type: MicroWinType;
  message: string;
  emoji: string;
}

/**
 * Feature unlock notification
 */
export interface FeatureUnlock {
  featureName: string;
  description: string;
  unlockedAt: Date;
  isNew: boolean; // If user hasn't seen notification yet
}

/**
 * IndexedDB Schema for gamification
 */
interface GamificationDB extends DBSchema {
  achievements: {
    key: AchievementType;
    value: Achievement;
  };
  featureUnlocks: {
    key: string;
    value: FeatureUnlock;
  };
}

/**
 * Gamification Store State
 */
export interface GamificationState {
  // IndexedDB instance
  db: IDBPDatabase<GamificationDB> | null;

  // In-memory state (synced with IndexedDB)
  achievements: Record<AchievementType, Achievement>;
  featureUnlocks: FeatureUnlock[];

  // Actions
  initializeDB: () => Promise<void>;

  // Achievement management
  checkAchievements: (data: {
    currentStreak: number;
    totalEntries: number;
    totalCheckIns: number;
    hasPattern?: boolean;
  }) => Promise<AchievementType[]>;
  unlockAchievement: (achievementId: AchievementType) => Promise<void>;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  isAchievementUnlocked: (achievementId: AchievementType) => boolean;

  // Micro-win messages
  getMicroWinMessage: (context: {
    isFirstEntry?: boolean;
    currentStreak?: number;
    totalEntries?: number;
    justUnlockedFeature?: boolean;
    weekNumber?: number;
  }) => MicroWinMessage | null;

  // Feature unlock notifications
  addFeatureUnlock: (featureName: string, description: string) => Promise<void>;
  getUnseenFeatureUnlocks: () => FeatureUnlock[];
  markFeatureUnlockAsSeen: (featureName: string) => Promise<void>;

  // Utility
  resetAllProgress: () => Promise<void>;
}

/**
 * Achievement definitions
 */
const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  Omit<Achievement, "unlockedAt" | "isUnlocked">
> = {
  // Streak achievements
  "streak-3-days": {
    id: "streak-3-days",
    name: "3-Day Streak",
    description: "Logged for 3 consecutive days",
    icon: "🔥",
  },
  "streak-7-days": {
    id: "streak-7-days",
    name: "Week Warrior",
    description: "Logged for 7 consecutive days",
    icon: "⭐",
  },
  "streak-14-days": {
    id: "streak-14-days",
    name: "Two Weeks Strong",
    description: "Logged for 14 consecutive days",
    icon: "💪",
  },
  "streak-30-days": {
    id: "streak-30-days",
    name: "Month Master",
    description: "Logged for 30 consecutive days",
    icon: "🏆",
  },
  "streak-60-days": {
    id: "streak-60-days",
    name: "60-Day Champion",
    description: "Logged for 60 consecutive days",
    icon: "👑",
  },
  "streak-90-days": {
    id: "streak-90-days",
    name: "90-Day Legend",
    description: "Logged for 90 consecutive days",
    icon: "💎",
  },

  // First actions
  "first-entry": {
    id: "first-entry",
    name: "First Steps",
    description: "Logged your first headache entry",
    icon: "🌱",
  },
  "first-checkin": {
    id: "first-checkin",
    name: "Check-In Champion",
    description: "Completed your first check-in",
    icon: "✅",
  },
  "first-pattern": {
    id: "first-pattern",
    name: "Pattern Detective",
    description: "Discovered your first pattern",
    icon: "🔍",
  },
  "first-week": {
    id: "first-week",
    name: "Week One Complete",
    description: "Completed your first week of tracking",
    icon: "🎉",
  },

  // Milestone achievements
  "entries-10": {
    id: "entries-10",
    name: "10 Entries",
    description: "Logged 10 headache entries",
    icon: "📝",
  },
  "entries-50": {
    id: "entries-50",
    name: "50 Entries",
    description: "Logged 50 headache entries",
    icon: "📚",
  },
  "entries-100": {
    id: "entries-100",
    name: "100 Entries",
    description: "Logged 100 headache entries",
    icon: "🎖️",
  },
  "checkins-10": {
    id: "checkins-10",
    name: "10 Check-Ins",
    description: "Completed 10 check-ins",
    icon: "⚡",
  },
  "checkins-50": {
    id: "checkins-50",
    name: "50 Check-Ins",
    description: "Completed 50 check-ins",
    icon: "💫",
  },
  "checkins-100": {
    id: "checkins-100",
    name: "100 Check-Ins",
    description: "Completed 100 check-ins",
    icon: "🌟",
  },
};

/**
 * Micro-win messages by context
 */
const MICRO_WIN_MESSAGES: Record<string, MicroWinMessage[]> = {
  firstEntry: [
    {
      type: "first-entry",
      message: "First entry logged! Your journey to understanding begins.",
      emoji: "🌱",
    },
  ],
  streakStart: [
    {
      type: "streak-start",
      message: "Day 2! Building consistency one day at a time.",
      emoji: "🔥",
    },
  ],
  streakContinue: [
    {
      type: "streak-continue",
      message: "You're on a roll! Keep up the consistency.",
      emoji: "⚡",
    },
    {
      type: "streak-continue",
      message: "Another day tracked! Patterns are starting to emerge.",
      emoji: "📊",
    },
    {
      type: "streak-continue",
      message: "Consistency is key! You're doing great.",
      emoji: "💪",
    },
  ],
  patternEmerging: [
    {
      type: "pattern-emerging",
      message: "Data is building up! Patterns will emerge soon.",
      emoji: "🔍",
    },
  ],
  weekComplete: [
    {
      type: "week-complete",
      message: "Week complete! You're building a healthy habit.",
      emoji: "🎉",
    },
  ],
  featureUnlock: [
    {
      type: "feature-unlock",
      message: "New feature unlocked! Check it out.",
      emoji: "🎁",
    },
  ],
  milestoneReached: [
    {
      type: "milestone-reached",
      message: "Milestone reached! You're making real progress.",
      emoji: "🏆",
    },
  ],
  consistencyPraise: [
    {
      type: "consistency-praise",
      message: "Your dedication is paying off! Keep going.",
      emoji: "⭐",
    },
    {
      type: "consistency-praise",
      message: "Every entry helps! You're building valuable insights.",
      emoji: "💡",
    },
  ],
};

/**
 * Initialize IndexedDB
 */
const initDB = async (): Promise<IDBPDatabase<GamificationDB>> => {
  return openDB<GamificationDB>("headache-gamification-db", 2, {
    upgrade(db) {
      // Create achievements store
      if (!db.objectStoreNames.contains("achievements")) {
        db.createObjectStore("achievements", { keyPath: "id" });
      }

      // Create feature unlocks store
      if (!db.objectStoreNames.contains("featureUnlocks")) {
        db.createObjectStore("featureUnlocks", { keyPath: "featureName" });
      }
    },
  });
};

/**
 * Initialize all achievements with locked state
 */
const initializeAchievements = (): Record<AchievementType, Achievement> => {
  const achievements: Record<AchievementType, Achievement> = {} as Record<
    AchievementType,
    Achievement
  >;

  for (const [key, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    achievements[key as AchievementType] = {
      ...definition,
      isUnlocked: false,
    };
  }

  return achievements;
};

/**
 * Zustand store for gamification
 * Uses IndexedDB for achievement persistence
 */
export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      db: null,
      achievements: initializeAchievements(),
      featureUnlocks: [],

      /**
       * Initialize IndexedDB connection
       */
      initializeDB: async () => {
        try {
          const db = await initDB();
          set({ db });

          // Load achievements from IndexedDB
          const storedAchievements = await db.getAll("achievements");
          if (storedAchievements.length > 0) {
            const achievementsMap: Record<AchievementType, Achievement> =
              {} as Record<AchievementType, Achievement>;

            for (const achievement of storedAchievements) {
              achievementsMap[achievement.id as AchievementType] = {
                ...achievement,
                unlockedAt: achievement.unlockedAt
                  ? new Date(achievement.unlockedAt)
                  : undefined,
              };
            }

            // Merge with definitions to ensure new achievements are added
            const allAchievements = {
              ...initializeAchievements(),
              ...achievementsMap,
            };
            set({ achievements: allAchievements });
          }

          // Load feature unlocks from IndexedDB
          const storedUnlocks = await db.getAll("featureUnlocks");
          const featureUnlocks = storedUnlocks.map((unlock) => ({
            ...unlock,
            unlockedAt: new Date(unlock.unlockedAt),
          }));
          set({ featureUnlocks });
        } catch (error) {
          console.error("Failed to initialize Gamification IndexedDB:", error);
        }
      },

      /**
       * Check and unlock achievements based on current stats
       * Returns array of newly unlocked achievement IDs
       */
      checkAchievements: async (data): Promise<AchievementType[]> => {
        const { achievements } = get();
        const newlyUnlocked: AchievementType[] = [];

        // Check streak achievements
        if (
          data.currentStreak >= 3 &&
          !achievements["streak-3-days"].isUnlocked
        ) {
          await get().unlockAchievement("streak-3-days");
          newlyUnlocked.push("streak-3-days");
        }
        if (
          data.currentStreak >= 7 &&
          !achievements["streak-7-days"].isUnlocked
        ) {
          await get().unlockAchievement("streak-7-days");
          newlyUnlocked.push("streak-7-days");
        }
        if (
          data.currentStreak >= 14 &&
          !achievements["streak-14-days"].isUnlocked
        ) {
          await get().unlockAchievement("streak-14-days");
          newlyUnlocked.push("streak-14-days");
        }
        if (
          data.currentStreak >= 30 &&
          !achievements["streak-30-days"].isUnlocked
        ) {
          await get().unlockAchievement("streak-30-days");
          newlyUnlocked.push("streak-30-days");
        }
        if (
          data.currentStreak >= 60 &&
          !achievements["streak-60-days"].isUnlocked
        ) {
          await get().unlockAchievement("streak-60-days");
          newlyUnlocked.push("streak-60-days");
        }
        if (
          data.currentStreak >= 90 &&
          !achievements["streak-90-days"].isUnlocked
        ) {
          await get().unlockAchievement("streak-90-days");
          newlyUnlocked.push("streak-90-days");
        }

        // Check first actions
        if (
          data.totalEntries === 1 &&
          !achievements["first-entry"].isUnlocked
        ) {
          await get().unlockAchievement("first-entry");
          newlyUnlocked.push("first-entry");
        }
        if (
          data.totalCheckIns === 1 &&
          !achievements["first-checkin"].isUnlocked
        ) {
          await get().unlockAchievement("first-checkin");
          newlyUnlocked.push("first-checkin");
        }
        if (data.hasPattern && !achievements["first-pattern"].isUnlocked) {
          await get().unlockAchievement("first-pattern");
          newlyUnlocked.push("first-pattern");
        }
        if (data.currentStreak >= 7 && !achievements["first-week"].isUnlocked) {
          await get().unlockAchievement("first-week");
          newlyUnlocked.push("first-week");
        }

        // Check milestone achievements
        if (data.totalEntries >= 10 && !achievements["entries-10"].isUnlocked) {
          await get().unlockAchievement("entries-10");
          newlyUnlocked.push("entries-10");
        }
        if (data.totalEntries >= 50 && !achievements["entries-50"].isUnlocked) {
          await get().unlockAchievement("entries-50");
          newlyUnlocked.push("entries-50");
        }
        if (
          data.totalEntries >= 100 &&
          !achievements["entries-100"].isUnlocked
        ) {
          await get().unlockAchievement("entries-100");
          newlyUnlocked.push("entries-100");
        }
        if (
          data.totalCheckIns >= 10 &&
          !achievements["checkins-10"].isUnlocked
        ) {
          await get().unlockAchievement("checkins-10");
          newlyUnlocked.push("checkins-10");
        }
        if (
          data.totalCheckIns >= 50 &&
          !achievements["checkins-50"].isUnlocked
        ) {
          await get().unlockAchievement("checkins-50");
          newlyUnlocked.push("checkins-50");
        }
        if (
          data.totalCheckIns >= 100 &&
          !achievements["checkins-100"].isUnlocked
        ) {
          await get().unlockAchievement("checkins-100");
          newlyUnlocked.push("checkins-100");
        }

        return newlyUnlocked;
      },

      /**
       * Unlock a specific achievement
       */
      unlockAchievement: async (achievementId: AchievementType) => {
        const { db, achievements } = get();

        if (achievements[achievementId].isUnlocked) {
          return; // Already unlocked
        }

        const unlockedAt = new Date();
        const updatedAchievement: Achievement = {
          ...achievements[achievementId],
          isUnlocked: true,
          unlockedAt,
        };

        // Update in-memory state
        set({
          achievements: {
            ...achievements,
            [achievementId]: updatedAchievement,
          },
        });

        // Persist to IndexedDB if available
        if (db) {
          await db.put("achievements", updatedAchievement);
        }
      },

      /**
       * Get all unlocked achievements
       */
      getUnlockedAchievements: () => {
        const { achievements } = get();
        return Object.values(achievements).filter((a) => a.isUnlocked);
      },

      /**
       * Get all locked achievements
       */
      getLockedAchievements: () => {
        const { achievements } = get();
        return Object.values(achievements).filter((a) => !a.isUnlocked);
      },

      /**
       * Check if specific achievement is unlocked
       */
      isAchievementUnlocked: (achievementId: AchievementType) => {
        const { achievements } = get();
        return achievements[achievementId]?.isUnlocked || false;
      },

      /**
       * Get contextual micro-win message
       */
      getMicroWinMessage: (context) => {
        // First entry - special case
        if (context.isFirstEntry) {
          return MICRO_WIN_MESSAGES.firstEntry[0];
        }

        // Just unlocked a feature
        if (context.justUnlockedFeature) {
          return MICRO_WIN_MESSAGES.featureUnlock[0];
        }

        // Week complete (streak = 7, 14, 21, etc.)
        if (context.currentStreak && context.currentStreak % 7 === 0) {
          return MICRO_WIN_MESSAGES.weekComplete[0];
        }

        // Streak messages
        if (context.currentStreak) {
          if (context.currentStreak === 2) {
            return MICRO_WIN_MESSAGES.streakStart[0];
          } else if (context.currentStreak >= 3) {
            // Random encouraging message
            const messages = MICRO_WIN_MESSAGES.streakContinue;
            return messages[Math.floor(Math.random() * messages.length)];
          }
        }

        // Milestone reached (10, 50, 100 entries)
        if (
          context.totalEntries &&
          [10, 50, 100].includes(context.totalEntries)
        ) {
          return MICRO_WIN_MESSAGES.milestoneReached[0];
        }

        // Pattern emerging (after 5+ entries)
        if (
          context.totalEntries &&
          context.totalEntries >= 5 &&
          context.totalEntries < 10
        ) {
          return MICRO_WIN_MESSAGES.patternEmerging[0];
        }

        // Week 1 encouragement
        if (
          context.weekNumber === 1 &&
          context.totalEntries &&
          context.totalEntries < 7
        ) {
          const messages = MICRO_WIN_MESSAGES.consistencyPraise;
          return messages[Math.floor(Math.random() * messages.length)];
        }

        return null;
      },

      /**
       * Add a feature unlock notification
       */
      addFeatureUnlock: async (featureName: string, description: string) => {
        const { db, featureUnlocks } = get();
        if (!db) return;

        // Check if already exists
        const existing = featureUnlocks.find(
          (unlock) => unlock.featureName === featureName,
        );
        if (existing) return;

        const unlock: FeatureUnlock = {
          featureName,
          description,
          unlockedAt: new Date(),
          isNew: true,
        };

        // Add to in-memory state
        set({ featureUnlocks: [...featureUnlocks, unlock] });

        // Persist to IndexedDB
        await db.put("featureUnlocks", unlock);
      },

      /**
       * Get unseen feature unlocks
       */
      getUnseenFeatureUnlocks: () => {
        const { featureUnlocks } = get();
        return featureUnlocks.filter((unlock) => unlock.isNew);
      },

      /**
       * Mark feature unlock as seen
       */
      markFeatureUnlockAsSeen: async (featureName: string) => {
        const { db, featureUnlocks } = get();
        if (!db) return;

        const updatedUnlocks = featureUnlocks.map((unlock) =>
          unlock.featureName === featureName
            ? { ...unlock, isNew: false }
            : unlock,
        );

        set({ featureUnlocks: updatedUnlocks });

        // Update in IndexedDB
        const unlock = updatedUnlocks.find(
          (u) => u.featureName === featureName,
        );
        if (unlock) {
          await db.put("featureUnlocks", unlock);
        }
      },

      /**
       * Reset all gamification progress (for testing/debugging)
       */
      resetAllProgress: async () => {
        const { db } = get();
        if (!db) return;

        // Clear IndexedDB
        const tx = db.transaction(
          ["achievements", "featureUnlocks"],
          "readwrite",
        );
        await tx.objectStore("achievements").clear();
        await tx.objectStore("featureUnlocks").clear();
        await tx.done;

        // Reset in-memory state
        set({
          achievements: initializeAchievements(),
          featureUnlocks: [],
        });
      },
    }),
    {
      name: "gamification-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({}), // Don't persist to localStorage, use IndexedDB only
    },
  ),
);

/**
 * Helper function to integrate with logging store
 * Call this after adding an entry to check for achievements
 */
export const checkAchievementsAfterLogging = async (
  currentStreak: number,
  totalEntries: number,
) => {
  const gamificationStore = useGamificationStore.getState();
  return gamificationStore.checkAchievements({
    currentStreak,
    totalEntries,
    totalCheckIns: 0, // Will be retrieved from checkinStore if needed
  });
};

/**
 * Helper function to integrate with checkin store
 * Call this after adding a checkin to check for achievements
 */
export const checkAchievementsAfterCheckin = async (totalCheckIns: number) => {
  const gamificationStore = useGamificationStore.getState();
  return gamificationStore.checkAchievements({
    currentStreak: 0, // Not relevant for checkins
    totalEntries: 0, // Not relevant for checkins
    totalCheckIns,
  });
};
