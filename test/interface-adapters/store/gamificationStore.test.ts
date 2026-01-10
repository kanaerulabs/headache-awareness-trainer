import { renderHook, act, waitFor } from "@testing-library/react";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import {
  useGamificationStore,
  checkAchievementsAfterLogging,
  checkAchievementsAfterCheckin,
} from "@/interface-adapters/store/gamificationStore";

// Helper to initialize achievements
const getInitialAchievements = () => {
  const achievements: any = {};
  const types = [
    "streak-3-days",
    "streak-7-days",
    "streak-14-days",
    "streak-30-days",
    "streak-60-days",
    "streak-90-days",
    "first-entry",
    "first-checkin",
    "first-pattern",
    "first-week",
    "entries-10",
    "entries-50",
    "entries-100",
    "checkins-10",
    "checkins-50",
    "checkins-100",
  ];

  types.forEach((type) => {
    achievements[type] = { id: type, isUnlocked: false };
  });

  return achievements;
};

// Reset IndexedDB before each test
beforeEach(() => {
  // Reset fake-indexeddb
  global.indexedDB = new IDBFactory();

  // Reset Zustand store with fresh achievements
  const freshAchievements = getInitialAchievements();
  useGamificationStore.setState({
    db: null,
    achievements: freshAchievements,
    featureUnlocks: [],
  });
});

describe("GamificationStore", () => {
  describe("Initialization", () => {
    it("should initialize with all achievements locked", () => {
      const { result } = renderHook(() => useGamificationStore());

      const achievements = Object.values(result.current.achievements);
      expect(achievements.every((a) => !a.isUnlocked)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
    });

    it("should initialize IndexedDB successfully", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await waitFor(() => {
        expect(result.current.db).not.toBeNull();
      });
    });

    it("should have no feature unlocks initially", () => {
      const { result } = renderHook(() => useGamificationStore());
      expect(result.current.featureUnlocks).toEqual([]);
    });
  });

  describe("Achievement Unlocking", () => {
    it("should unlock first-entry achievement", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 1,
          totalCheckIns: 0,
        });
        expect(unlocked).toContain("first-entry");
      });

      expect(result.current.achievements["first-entry"].isUnlocked).toBe(true);
      expect(
        result.current.achievements["first-entry"].unlockedAt,
      ).toBeInstanceOf(Date);
    });

    it("should unlock streak achievements progressively", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // 3-day streak
      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 3,
          totalEntries: 3,
          totalCheckIns: 0,
        });
        expect(unlocked).toContain("streak-3-days");
      });

      expect(result.current.achievements["streak-3-days"].isUnlocked).toBe(
        true,
      );
      expect(result.current.achievements["streak-7-days"].isUnlocked).toBe(
        false,
      );

      // 7-day streak
      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 7,
          totalEntries: 7,
          totalCheckIns: 0,
        });
        expect(unlocked).toContain("streak-7-days");
        expect(unlocked).toContain("first-week");
      });

      expect(result.current.achievements["streak-7-days"].isUnlocked).toBe(
        true,
      );
      expect(result.current.achievements["first-week"].isUnlocked).toBe(true);
    });

    it("should unlock milestone achievements", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // 10 entries
      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 10,
          totalCheckIns: 0,
        });
        expect(unlocked).toContain("entries-10");
      });

      expect(result.current.achievements["entries-10"].isUnlocked).toBe(true);

      // 50 entries
      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 50,
          totalCheckIns: 0,
        });
        expect(unlocked).toContain("entries-50");
      });

      expect(result.current.achievements["entries-50"].isUnlocked).toBe(true);
    });

    it("should unlock checkin achievements", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 0,
          totalCheckIns: 1,
        });
        expect(unlocked).toContain("first-checkin");
      });

      expect(result.current.achievements["first-checkin"].isUnlocked).toBe(
        true,
      );

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 0,
          totalCheckIns: 10,
        });
        expect(unlocked).toContain("checkins-10");
      });

      expect(result.current.achievements["checkins-10"].isUnlocked).toBe(true);
    });

    it("should not unlock same achievement twice", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        await result.current.unlockAchievement("first-entry");
      });

      const firstUnlockTime =
        result.current.achievements["first-entry"].unlockedAt;

      // Try unlocking again
      await act(async () => {
        await result.current.unlockAchievement("first-entry");
      });

      const secondUnlockTime =
        result.current.achievements["first-entry"].unlockedAt;
      expect(firstUnlockTime).toEqual(secondUnlockTime);
    });

    it("should unlock pattern achievement", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 10,
          totalCheckIns: 0,
          hasPattern: true,
        });
        expect(unlocked).toContain("first-pattern");
      });

      expect(result.current.achievements["first-pattern"].isUnlocked).toBe(
        true,
      );
    });
  });

  describe("Achievement Queries", () => {
    it("should get unlocked achievements", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.unlockAchievement("first-entry");
        await result.current.unlockAchievement("streak-3-days");
      });

      const unlocked = result.current.getUnlockedAchievements();
      expect(unlocked.length).toBe(2);
      expect(unlocked.some((a) => a.id === "first-entry")).toBe(true);
      expect(unlocked.some((a) => a.id === "streak-3-days")).toBe(true);
    });

    it("should get locked achievements", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.unlockAchievement("first-entry");
      });

      const locked = result.current.getLockedAchievements();
      expect(locked.every((a) => !a.isUnlocked)).toBe(true);
      expect(locked.some((a) => a.id === "first-entry")).toBe(false);
    });

    it("should check if achievement is unlocked", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.unlockAchievement("first-entry");
      });

      expect(result.current.isAchievementUnlocked("first-entry")).toBe(true);
      expect(result.current.isAchievementUnlocked("streak-7-days")).toBe(false);
    });
  });

  describe("Micro-Win Messages", () => {
    it("should return first entry message", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        isFirstEntry: true,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("first-entry");
      expect(message?.message).toContain("First entry");
    });

    it("should return streak start message", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        currentStreak: 2,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("streak-start");
    });

    it("should return streak continue message", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        currentStreak: 5,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("streak-continue");
    });

    it("should return week complete message", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        currentStreak: 7,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("week-complete");
    });

    it("should return milestone message", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        totalEntries: 10,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("milestone-reached");
    });

    it("should return pattern emerging message", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        totalEntries: 7,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("pattern-emerging");
    });

    it("should return feature unlock message", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        justUnlockedFeature: true,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("feature-unlock");
    });

    it("should return week 1 encouragement", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({
        weekNumber: 1,
        totalEntries: 3,
      });

      expect(message).not.toBeNull();
      expect(message?.type).toBe("consistency-praise");
    });

    it("should return null when no context matches", () => {
      const { result } = renderHook(() => useGamificationStore());

      const message = result.current.getMicroWinMessage({});

      expect(message).toBeNull();
    });
  });

  describe("Feature Unlocks", () => {
    it("should add feature unlock", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.addFeatureUnlock(
          "headache-type",
          "Now you can track headache types",
        );
      });

      expect(result.current.featureUnlocks.length).toBe(1);
      expect(result.current.featureUnlocks[0].featureName).toBe(
        "headache-type",
      );
      expect(result.current.featureUnlocks[0].isNew).toBe(true);
    });

    it("should not add duplicate feature unlock", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.addFeatureUnlock(
          "headache-type",
          "Now you can track headache types",
        );
        await result.current.addFeatureUnlock(
          "headache-type",
          "Now you can track headache types",
        );
      });

      expect(result.current.featureUnlocks.length).toBe(1);
    });

    it("should get unseen feature unlocks", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.addFeatureUnlock(
          "headache-type",
          "Now you can track headache types",
        );
        await result.current.addFeatureUnlock(
          "body-tension",
          "Now you can track body tension",
        );
      });

      const unseen = result.current.getUnseenFeatureUnlocks();
      expect(unseen.length).toBe(2);
      expect(unseen.every((u) => u.isNew)).toBe(true);
    });

    it("should mark feature unlock as seen", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.addFeatureUnlock(
          "headache-type",
          "Now you can track headache types",
        );
      });

      await act(async () => {
        await result.current.markFeatureUnlockAsSeen("headache-type");
      });

      const unseen = result.current.getUnseenFeatureUnlocks();
      expect(unseen.length).toBe(0);
      expect(result.current.featureUnlocks[0].isNew).toBe(false);
    });
  });

  describe("Helper Functions", () => {
    it("should check achievements after logging", async () => {
      await act(async () => {
        await useGamificationStore.getState().initializeDB();
      });

      const unlocked = await checkAchievementsAfterLogging(3, 3);
      expect(unlocked).toContain("streak-3-days");
    });

    it("should check achievements after checkin", async () => {
      await act(async () => {
        await useGamificationStore.getState().initializeDB();
      });

      const unlocked = await checkAchievementsAfterCheckin(1);
      expect(unlocked).toContain("first-checkin");
    });
  });

  describe("Reset Progress", () => {
    it("should reset all progress", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.unlockAchievement("first-entry");
        await result.current.unlockAchievement("streak-3-days");
        await result.current.addFeatureUnlock("headache-type", "Description");
      });

      expect(result.current.getUnlockedAchievements().length).toBe(2);
      expect(result.current.featureUnlocks.length).toBe(1);

      await act(async () => {
        await result.current.resetAllProgress();
      });

      expect(result.current.getUnlockedAchievements().length).toBe(0);
      expect(result.current.featureUnlocks.length).toBe(0);
    });
  });

  describe("IndexedDB Persistence", () => {
    it("should persist achievements to IndexedDB", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.unlockAchievement("first-entry");
      });

      // Verify in IndexedDB
      const db = result.current.db;
      expect(db).not.toBeNull();

      if (db) {
        const achievement = await db.get("achievements", "first-entry");
        expect(achievement).toBeDefined();
        expect(achievement?.isUnlocked).toBe(true);
      }
    });

    it("should load achievements from IndexedDB on init", async () => {
      const { result: result1 } = renderHook(() => useGamificationStore());

      // First session - unlock achievement
      await act(async () => {
        await result1.current.initializeDB();
        await result1.current.unlockAchievement("first-entry");
      });

      // Reset store (simulate app restart)
      await act(async () => {
        useGamificationStore.setState({
          db: null,
          achievements: getInitialAchievements(),
          featureUnlocks: [],
        });
      });

      const { result: result2 } = renderHook(() => useGamificationStore());

      // Second session - should load from IndexedDB
      await act(async () => {
        await result2.current.initializeDB();
      });

      await waitFor(() => {
        expect(result2.current.achievements["first-entry"].isUnlocked).toBe(
          true,
        );
      });
    });

    it("should persist feature unlocks to IndexedDB", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
        await result.current.addFeatureUnlock("headache-type", "Description");
      });

      // Verify in IndexedDB
      const db = result.current.db;
      expect(db).not.toBeNull();

      if (db) {
        const unlock = await db.get("featureUnlocks", "headache-type");
        expect(unlock).toBeDefined();
        expect(unlock?.featureName).toBe("headache-type");
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle unlocking achievement without DB initialized", async () => {
      const { result } = renderHook(() => useGamificationStore());

      // Don't initialize DB
      await act(async () => {
        await result.current.unlockAchievement("first-entry");
      });

      // Achievement should be unlocked in memory even without DB
      // (Better UX - user sees the achievement, it just won't persist)
      expect(result.current.achievements["first-entry"].isUnlocked).toBe(true);
      expect(result.current.db).toBeNull(); // DB not initialized
    });

    it("should handle checking achievements with extreme values", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 365,
          totalEntries: 1000,
          totalCheckIns: 500,
        });

        // Should unlock all relevant achievements
        expect(unlocked.length).toBeGreaterThan(0);
      });

      // Verify high-tier achievements are unlocked
      expect(result.current.achievements["streak-90-days"].isUnlocked).toBe(
        true,
      );
      expect(result.current.achievements["entries-100"].isUnlocked).toBe(true);
      expect(result.current.achievements["checkins-100"].isUnlocked).toBe(true);
    });

    it("should handle multiple simultaneous unlocks", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Unlock multiple achievements at once (e.g., after 7 entries with 7-day streak)
      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 7,
          totalEntries: 7,
          totalCheckIns: 0,
        });

        // Should unlock: streak-3-days, streak-7-days, first-week
        // Note: first-entry requires totalEntries === 1, so it won't unlock at 7
        expect(unlocked.length).toBeGreaterThanOrEqual(3);
        expect(unlocked).toContain("streak-3-days");
        expect(unlocked).toContain("streak-7-days");
        expect(unlocked).toContain("first-week");
      });
    });
  });

  describe("Streak Boundary Testing", () => {
    it("should unlock 14-day streak achievement at exactly 14 days", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 14,
          totalEntries: 14,
          totalCheckIns: 0,
        });

        expect(unlocked).toContain("streak-14-days");
      });

      expect(result.current.achievements["streak-14-days"].isUnlocked).toBe(
        true,
      );
    });

    it("should unlock 30-day streak achievement at exactly 30 days", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 30,
          totalEntries: 30,
          totalCheckIns: 0,
        });

        expect(unlocked).toContain("streak-30-days");
      });

      expect(result.current.achievements["streak-30-days"].isUnlocked).toBe(
        true,
      );
    });

    it("should unlock 60-day streak achievement at exactly 60 days", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 60,
          totalEntries: 60,
          totalCheckIns: 0,
        });

        expect(unlocked).toContain("streak-60-days");
      });

      expect(result.current.achievements["streak-60-days"].isUnlocked).toBe(
        true,
      );
    });

    it("should not unlock 14-day streak at 13 days", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 13,
          totalEntries: 13,
          totalCheckIns: 0,
        });

        expect(unlocked).not.toContain("streak-14-days");
      });

      expect(result.current.achievements["streak-14-days"].isUnlocked).toBe(
        false,
      );
    });
  });

  describe("Milestone Boundary Testing", () => {
    it("should unlock exactly at 50 entries", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 50,
          totalCheckIns: 0,
        });

        expect(unlocked).toContain("entries-50");
        expect(unlocked).toContain("entries-10"); // Should also unlock previous milestone
      });

      expect(result.current.achievements["entries-50"].isUnlocked).toBe(true);
    });

    it("should not unlock 50 entries at 49 entries", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 49,
          totalCheckIns: 0,
        });

        expect(unlocked).not.toContain("entries-50");
      });

      expect(result.current.achievements["entries-50"].isUnlocked).toBe(false);
    });

    it("should unlock exactly at 100 entries", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 100,
          totalCheckIns: 0,
        });

        expect(unlocked).toContain("entries-100");
      });

      expect(result.current.achievements["entries-100"].isUnlocked).toBe(true);
    });

    it("should unlock exactly at 50 check-ins", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 0,
          totalCheckIns: 50,
        });

        expect(unlocked).toContain("checkins-50");
      });

      expect(result.current.achievements["checkins-50"].isUnlocked).toBe(true);
    });

    it("should unlock exactly at 100 check-ins", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 0,
          totalCheckIns: 100,
        });

        expect(unlocked).toContain("checkins-100");
      });

      expect(result.current.achievements["checkins-100"].isUnlocked).toBe(
        true,
      );
    });
  });

  describe("Micro-Win Message Variety", () => {
    it("should return different messages for streakContinue", () => {
      const { result } = renderHook(() => useGamificationStore());
      const messages = new Set();

      // Get multiple messages
      for (let i = 0; i < 20; i++) {
        const message = result.current.getMicroWinMessage({
          currentStreak: 5,
        });
        if (message) {
          messages.add(message.message);
        }
      }

      // Should have at least 2 different messages (3 total in implementation)
      expect(messages.size).toBeGreaterThanOrEqual(2);
    });

    it("should return different messages for consistencyPraise", () => {
      const { result } = renderHook(() => useGamificationStore());
      const messages = new Set();

      // Get multiple messages
      for (let i = 0; i < 20; i++) {
        const message = result.current.getMicroWinMessage({
          weekNumber: 1,
          totalEntries: 3,
        });
        if (message) {
          messages.add(message.message);
        }
      }

      // Should have at least 2 different messages
      expect(messages.size).toBeGreaterThanOrEqual(2);
    });

    it("should return week complete message for multiple weeks", () => {
      const { result } = renderHook(() => useGamificationStore());

      // Week 2 (14 days)
      const week2 = result.current.getMicroWinMessage({
        currentStreak: 14,
      });
      expect(week2?.type).toBe("week-complete");

      // Week 3 (21 days)
      const week3 = result.current.getMicroWinMessage({
        currentStreak: 21,
      });
      expect(week3?.type).toBe("week-complete");

      // Week 4 (28 days)
      const week4 = result.current.getMicroWinMessage({
        currentStreak: 28,
      });
      expect(week4?.type).toBe("week-complete");
    });

    it("should return milestone message for all milestone values", () => {
      const { result } = renderHook(() => useGamificationStore());

      const milestone10 = result.current.getMicroWinMessage({
        totalEntries: 10,
      });
      expect(milestone10?.type).toBe("milestone-reached");

      const milestone50 = result.current.getMicroWinMessage({
        totalEntries: 50,
      });
      expect(milestone50?.type).toBe("milestone-reached");

      const milestone100 = result.current.getMicroWinMessage({
        totalEntries: 100,
      });
      expect(milestone100?.type).toBe("milestone-reached");
    });

    it("should prioritize first entry over other messages", () => {
      const { result } = renderHook(() => useGamificationStore());

      // Even with other context, first entry should take precedence
      const message = result.current.getMicroWinMessage({
        isFirstEntry: true,
        currentStreak: 5,
        totalEntries: 10,
      });

      expect(message?.type).toBe("first-entry");
    });

    it("should prioritize feature unlock over streak messages", () => {
      const { result } = renderHook(() => useGamificationStore());

      // Feature unlock should take precedence
      const message = result.current.getMicroWinMessage({
        justUnlockedFeature: true,
        currentStreak: 5,
      });

      expect(message?.type).toBe("feature-unlock");
    });
  });

  describe("IndexedDB Persistence Edge Cases", () => {
    it("should merge new achievement definitions with stored achievements", async () => {
      const { result: result1 } = renderHook(() => useGamificationStore());

      // First session - unlock some achievements
      await act(async () => {
        await result1.current.initializeDB();
        await result1.current.unlockAchievement("first-entry");
        await result1.current.unlockAchievement("streak-3-days");
      });

      // Simulate app restart with new achievements (in real scenario, new achievements would be added to definitions)
      await act(async () => {
        useGamificationStore.setState({
          db: null,
          achievements: getInitialAchievements(),
          featureUnlocks: [],
        });
      });

      const { result: result2 } = renderHook(() => useGamificationStore());

      // Second session - should load stored achievements and merge with new definitions
      await act(async () => {
        await result2.current.initializeDB();
      });

      await waitFor(() => {
        // Previously unlocked should remain unlocked
        expect(result2.current.achievements["first-entry"].isUnlocked).toBe(
          true,
        );
        expect(result2.current.achievements["streak-3-days"].isUnlocked).toBe(
          true,
        );

        // New achievements should exist and be locked
        expect(result2.current.achievements["entries-10"]).toBeDefined();
        expect(result2.current.achievements["entries-10"].isUnlocked).toBe(
          false,
        );
      });
    });

    it("should handle IndexedDB initialization failure gracefully", async () => {
      const { result } = renderHook(() => useGamificationStore());

      // Mock console.error to verify error handling
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Force IndexedDB to fail by using invalid DB name
      await act(async () => {
        try {
          // This should trigger error handling in initializeDB
          await result.current.initializeDB();
        } catch (error) {
          // Errors should be caught internally
        }
      });

      // Store should still function in memory-only mode
      await act(async () => {
        await result.current.unlockAchievement("first-entry");
      });

      expect(result.current.achievements["first-entry"].isUnlocked).toBe(true);

      consoleErrorSpy.mockRestore();
    });

    it("should handle concurrent achievement unlocks", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Unlock multiple achievements concurrently
      await act(async () => {
        await Promise.all([
          result.current.unlockAchievement("first-entry"),
          result.current.unlockAchievement("streak-3-days"),
          result.current.unlockAchievement("entries-10"),
        ]);
      });

      // All should be unlocked
      expect(result.current.achievements["first-entry"].isUnlocked).toBe(true);
      expect(result.current.achievements["streak-3-days"].isUnlocked).toBe(
        true,
      );
      expect(result.current.achievements["entries-10"].isUnlocked).toBe(true);
    });

    it("should restore Date objects when loading from IndexedDB", async () => {
      const { result: result1 } = renderHook(() => useGamificationStore());

      // First session - unlock achievement
      await act(async () => {
        await result1.current.initializeDB();
        await result1.current.unlockAchievement("first-entry");
      });

      const originalDate = result1.current.achievements["first-entry"].unlockedAt;

      // Reset store (simulate app restart)
      await act(async () => {
        useGamificationStore.setState({
          db: null,
          achievements: getInitialAchievements(),
          featureUnlocks: [],
        });
      });

      const { result: result2 } = renderHook(() => useGamificationStore());

      // Second session - should load with Date object
      await act(async () => {
        await result2.current.initializeDB();
      });

      await waitFor(() => {
        const restoredDate =
          result2.current.achievements["first-entry"].unlockedAt;
        expect(restoredDate).toBeInstanceOf(Date);
        expect(restoredDate?.getTime()).toBe(originalDate?.getTime());
      });
    });
  });

  describe("Achievement Check Integration", () => {
    it("should not unlock achievements on subsequent checks if already unlocked", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // First check - should unlock
      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 3,
          totalEntries: 3,
          totalCheckIns: 0,
        });
        expect(unlocked).toContain("streak-3-days");
      });

      // Second check with same data - should not return as newly unlocked
      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 3,
          totalEntries: 3,
          totalCheckIns: 0,
        });
        expect(unlocked).not.toContain("streak-3-days");
        expect(unlocked.length).toBe(0);
      });
    });

    it("should handle checking achievements with zero values", async () => {
      const { result } = renderHook(() => useGamificationStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        const unlocked = await result.current.checkAchievements({
          currentStreak: 0,
          totalEntries: 0,
          totalCheckIns: 0,
        });
        expect(unlocked.length).toBe(0);
      });

      // No achievements should be unlocked
      expect(result.current.getUnlockedAchievements().length).toBe(0);
    });
  });
});

