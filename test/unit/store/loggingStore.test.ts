import { renderHook, act } from "@testing-library/react";
import "fake-indexeddb/auto";
import {
  useLoggingStore,
  HeadacheEntry,
  HeadacheType,
  MoodType,
} from "@/interface-adapters/store/loggingStore";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Logging Store", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Reset the Zustand store state
    useLoggingStore.setState({
      metadata: {
        registrationDate: null,
        firstEntryDate: null,
        totalEntries: 0,
        currentStreak: 0,
      },
      unlockedFeatures: {
        week1Features: true,
        week2Features: false,
        week3Features: false,
      },
      db: null,
    });
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  describe("Database Initialization", () => {
    it("should initialize IndexedDB connection", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      expect(result.current.db).toBeDefined();
      expect(result.current.db).not.toBeNull();
    });

    it("should set registration date on first initialization", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      expect(result.current.metadata.registrationDate).toBeInstanceOf(Date);
      expect(result.current.metadata.firstEntryDate).toBeNull();
      expect(result.current.metadata.totalEntries).toBe(0);
      expect(result.current.metadata.currentStreak).toBe(0);
    });

    it("should restore metadata from IndexedDB on subsequent initializations", async () => {
      const { result: result1 } = renderHook(() => useLoggingStore());

      // First initialization
      await act(async () => {
        await result1.current.initializeDB();
      });

      const originalRegistrationDate =
        result1.current.metadata.registrationDate;

      // Second initialization (simulating app restart)
      const { result: result2 } = renderHook(() => useLoggingStore());
      await act(async () => {
        await result2.current.initializeDB();
      });

      expect(result2.current.metadata.registrationDate).toEqual(
        originalRegistrationDate,
      );
    });
  });

  describe("Progressive Feature Unlocking", () => {
    it("should initialize with only week1 features unlocked", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      expect(result.current.unlockedFeatures.week1Features).toBe(true);
      expect(result.current.unlockedFeatures.week2Features).toBe(false);
      expect(result.current.unlockedFeatures.week3Features).toBe(false);
    });

    it("should unlock week2 features after 7 days", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Set registration date to 8 days ago
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      await act(async () => {
        result.current.updateMetadata({ registrationDate: eightDaysAgo });
        result.current.checkFeatureUnlocks();
      });

      expect(result.current.unlockedFeatures.week1Features).toBe(true);
      expect(result.current.unlockedFeatures.week2Features).toBe(true);
      expect(result.current.unlockedFeatures.week3Features).toBe(false);
    });

    it("should unlock week3 features after 14 days", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Set registration date to 15 days ago
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      await act(async () => {
        result.current.updateMetadata({ registrationDate: fifteenDaysAgo });
        result.current.checkFeatureUnlocks();
      });

      expect(result.current.unlockedFeatures.week1Features).toBe(true);
      expect(result.current.unlockedFeatures.week2Features).toBe(true);
      expect(result.current.unlockedFeatures.week3Features).toBe(true);
    });

    it("should not unlock week2 features before 7 days", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Set registration date to 5 days ago
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      await act(async () => {
        result.current.updateMetadata({ registrationDate: fiveDaysAgo });
        result.current.checkFeatureUnlocks();
      });

      expect(result.current.unlockedFeatures.week2Features).toBe(false);
    });
  });

  describe("Entry CRUD Operations", () => {
    describe("addEntry", () => {
      it("should add a new entry with required fields", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({
            intensity: 3,
            note: "Moderate headache after work",
          });
        });

        expect(entryId).toBeDefined();
        expect(typeof entryId).toBe("string");
        expect(entryId).toMatch(/^entry-/);
      });

      it("should throw error when intensity is missing", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        await expect(
          act(async () => {
            await result.current.addEntry({ note: "Missing intensity" });
          }),
        ).rejects.toThrow("Intensity is required");
      });

      it("should update metadata after adding entry", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        expect(result.current.metadata.totalEntries).toBe(0);

        await act(async () => {
          await result.current.addEntry({ intensity: 4 });
        });

        expect(result.current.metadata.totalEntries).toBe(1);
        expect(result.current.metadata.firstEntryDate).toBeInstanceOf(Date);
      });

      it("should set firstEntryDate only on first entry", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        await act(async () => {
          await result.current.addEntry({ intensity: 3 });
        });

        const firstEntryDate = result.current.metadata.firstEntryDate;

        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 10));

        await act(async () => {
          await result.current.addEntry({ intensity: 4 });
        });

        // Should be the same
        expect(result.current.metadata.firstEntryDate).toEqual(firstEntryDate);
      });

      it("should generate unique IDs for each entry", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let id1: string = "";
        let id2: string = "";

        await act(async () => {
          id1 = await result.current.addEntry({ intensity: 3 });
          id2 = await result.current.addEntry({ intensity: 4 });
        });

        expect(id1).not.toEqual(id2);
      });

      it("should include optional fields when provided", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({
            intensity: 4,
            note: "Tension headache",
            headacheType: "tension",
            location: { head: ["temples"], body: ["neck"] },
            bodyTension: 7,
            mood: "low",
            stressLevel: 8,
            contextTags: ["after-work", "stressful-day"],
          });
        });

        const entry = await result.current.getEntryById(entryId);

        expect(entry).toBeDefined();
        expect(entry?.intensity).toBe(4);
        expect(entry?.headacheType).toBe("tension");
        expect(entry?.location).toEqual({ head: ["temples"], body: ["neck"] });
        expect(entry?.bodyTension).toBe(7);
        expect(entry?.mood).toBe("low");
        expect(entry?.stressLevel).toBe(8);
        expect(entry?.contextTags).toEqual(["after-work", "stressful-day"]);
      });
    });

    describe("getRecentEntries", () => {
      it("should return empty array when no entries exist", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        const entries = await result.current.getRecentEntries(10);

        expect(entries).toEqual([]);
      });

      it("should return entries in descending timestamp order", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        // Add multiple entries with small delays
        await act(async () => {
          await result.current.addEntry({ intensity: 1 });
          await new Promise((resolve) => setTimeout(resolve, 5));
          await result.current.addEntry({ intensity: 2 });
          await new Promise((resolve) => setTimeout(resolve, 5));
          await result.current.addEntry({ intensity: 3 });
        });

        const entries = await result.current.getRecentEntries(10);

        expect(entries).toHaveLength(3);
        expect(entries[0].intensity).toBe(3); // Most recent
        expect(entries[1].intensity).toBe(2);
        expect(entries[2].intensity).toBe(1); // Oldest
      });

      it("should limit results to specified count", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        // Add 5 entries
        await act(async () => {
          for (let i = 1; i <= 5; i++) {
            await result.current.addEntry({
              intensity: i as 1 | 2 | 3 | 4 | 5,
            });
            await new Promise((resolve) => setTimeout(resolve, 5));
          }
        });

        const entries = await result.current.getRecentEntries(3);

        expect(entries).toHaveLength(3);
        expect(entries[0].intensity).toBe(5); // Most recent
        expect(entries[1].intensity).toBe(4);
        expect(entries[2].intensity).toBe(3);
      });
    });

    describe("getEntryById", () => {
      it("should return entry when ID exists", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({
            intensity: 4,
            note: "Test entry",
          });
        });

        const entry = await result.current.getEntryById(entryId);

        expect(entry).toBeDefined();
        expect(entry?.id).toBe(entryId);
        expect(entry?.intensity).toBe(4);
        expect(entry?.note).toBe("Test entry");
      });

      it("should return undefined when ID does not exist", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        const entry = await result.current.getEntryById("non-existent-id");

        expect(entry).toBeUndefined();
      });
    });

    describe("getAllEntries", () => {
      it("should return all entries sorted by timestamp descending", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        await act(async () => {
          for (let i = 1; i <= 4; i++) {
            await result.current.addEntry({
              intensity: i as 1 | 2 | 3 | 4 | 5,
            });
            await new Promise((resolve) => setTimeout(resolve, 5));
          }
        });

        const entries = await result.current.getAllEntries();

        expect(entries).toHaveLength(4);
        expect(entries[0].intensity).toBe(4);
        expect(entries[3].intensity).toBe(1);
      });
    });

    describe("deleteEntry", () => {
      it("should remove entry from database", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({ intensity: 3 });
        });

        expect(await result.current.getEntryById(entryId)).toBeDefined();

        await act(async () => {
          await result.current.deleteEntry(entryId);
        });

        expect(await result.current.getEntryById(entryId)).toBeUndefined();
      });

      it("should update totalEntries count after deletion", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({ intensity: 3 });
        });

        expect(result.current.metadata.totalEntries).toBe(1);

        await act(async () => {
          await result.current.deleteEntry(entryId);
        });

        expect(result.current.metadata.totalEntries).toBe(0);
      });

      it("should not go below 0 when deleting multiple times", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({ intensity: 3 });
        });

        await act(async () => {
          await result.current.deleteEntry(entryId);
          await result.current.deleteEntry(entryId); // Delete again
        });

        expect(result.current.metadata.totalEntries).toBe(0);
      });

      it("should recalculate streak after deletion", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({ intensity: 3 });
        });

        expect(result.current.metadata.currentStreak).toBeGreaterThan(0);

        await act(async () => {
          await result.current.deleteEntry(entryId);
        });

        expect(result.current.metadata.currentStreak).toBe(0);
      });
    });

    describe("updateEntry", () => {
      it("should update entry fields", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({
            intensity: 3,
            note: "Original note",
          });
        });

        await act(async () => {
          await result.current.updateEntry(entryId, {
            intensity: 5,
            note: "Updated note",
            headacheType: "migraine",
          });
        });

        const entry = await result.current.getEntryById(entryId);

        expect(entry?.intensity).toBe(5);
        expect(entry?.note).toBe("Updated note");
        expect(entry?.headacheType).toBe("migraine");
      });

      it("should preserve original timestamp", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        let entryId: string = "";

        await act(async () => {
          entryId = await result.current.addEntry({ intensity: 3 });
        });

        const originalEntry = await result.current.getEntryById(entryId);
        const originalTimestamp = originalEntry?.timestamp;

        await new Promise((resolve) => setTimeout(resolve, 10));

        await act(async () => {
          await result.current.updateEntry(entryId, { intensity: 4 });
        });

        const updatedEntry = await result.current.getEntryById(entryId);

        expect(updatedEntry?.timestamp).toEqual(originalTimestamp);
      });

      it("should throw error when entry does not exist", async () => {
        const { result } = renderHook(() => useLoggingStore());

        await act(async () => {
          await result.current.initializeDB();
        });

        await expect(
          act(async () => {
            await result.current.updateEntry("non-existent-id", {
              intensity: 5,
            });
          }),
        ).rejects.toThrow("Entry with id non-existent-id not found");
      });
    });
  });

  describe("Streak Calculation", () => {
    it("should return 0 streak when no entries exist", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const streak = await result.current.calculateStreak();

      expect(streak).toBe(0);
    });

    it("should return 1 for single entry today", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        await result.current.addEntry({ intensity: 3 });
      });

      expect(result.current.metadata.currentStreak).toBe(1);
    });

    it("should maintain streak if entry exists yesterday (grace period)", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Manually add entry with yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (result.current.db) {
        const entry: HeadacheEntry = {
          id: "test-entry-1",
          timestamp: yesterday,
          intensity: 3,
          contextTags: [],
        };
        await result.current.db.add("entries", entry);
      }

      const streak = await result.current.calculateStreak();

      expect(streak).toBe(1);
    });

    it("should return 0 if last entry is more than 1 day old", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Add entry 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      if (result.current.db) {
        const entry: HeadacheEntry = {
          id: "test-entry-1",
          timestamp: threeDaysAgo,
          intensity: 3,
          contextTags: [],
        };
        await result.current.db.add("entries", entry);
      }

      const streak = await result.current.calculateStreak();

      expect(streak).toBe(0);
    });

    it("should calculate consecutive days correctly", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Add entries for today, yesterday, and day before yesterday
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(yesterday);
      dayBefore.setDate(dayBefore.getDate() - 1);

      if (result.current.db) {
        await result.current.db.add("entries", {
          id: "entry-1",
          timestamp: dayBefore,
          intensity: 3,
          contextTags: [],
        } as HeadacheEntry);
        await result.current.db.add("entries", {
          id: "entry-2",
          timestamp: yesterday,
          intensity: 3,
          contextTags: [],
        } as HeadacheEntry);
        await result.current.db.add("entries", {
          id: "entry-3",
          timestamp: today,
          intensity: 3,
          contextTags: [],
        } as HeadacheEntry);
      }

      const streak = await result.current.calculateStreak();

      expect(streak).toBe(3);
    });

    it("should handle multiple entries on same day", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        await result.current.addEntry({ intensity: 3 });
        await new Promise((resolve) => setTimeout(resolve, 5));
        await result.current.addEntry({ intensity: 4 });
      });

      expect(result.current.metadata.currentStreak).toBe(1);
    });

    it("should break streak with gap in days", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Add entry today
      const today = new Date();
      // Add entry 3 days ago (gap of 2 days)
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      if (result.current.db) {
        await result.current.db.add("entries", {
          id: "entry-1",
          timestamp: threeDaysAgo,
          intensity: 3,
          contextTags: [],
        } as HeadacheEntry);
        await result.current.db.add("entries", {
          id: "entry-2",
          timestamp: today,
          intensity: 3,
          contextTags: [],
        } as HeadacheEntry);
      }

      const streak = await result.current.calculateStreak();

      // Streak should only count today, not the entry 3 days ago
      expect(streak).toBe(1);
    });
  });

  describe("Natural Language Parsing", () => {
    it("should detect intensity keywords - severe", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "I have a severe headache",
      );

      expect(parsed.intensity).toBe(5);
      expect(parsed.note).toBe("I have a severe headache");
      expect(parsed.naturalLanguageInput).toBe("I have a severe headache");
    });

    it("should detect intensity keywords - terrible", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Terrible headache");

      expect(parsed.intensity).toBe(5);
    });

    it("should detect intensity keywords - bad/strong", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Bad headache today");

      expect(parsed.intensity).toBe(4);
    });

    it("should detect intensity keywords - moderate", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Moderate pain");

      expect(parsed.intensity).toBe(3);
    });

    it("should detect intensity keywords - mild/slight", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "Mild headache this morning",
      );

      expect(parsed.intensity).toBe(2);
    });

    it("should detect intensity keywords - barely", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Barely noticeable");

      expect(parsed.intensity).toBe(1);
    });

    it("should detect headache type - migraine", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "I think this is a migraine",
      );

      expect(parsed.headacheType).toBe("migraine");
    });

    it("should detect headache type - tension", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "Tension headache from stress",
      );

      expect(parsed.headacheType).toBe("tension");
    });

    it("should detect headache type - cluster", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Cluster headache");

      expect(parsed.headacheType).toBe("cluster");
    });

    it("should detect headache type - sinus", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Sinus pressure");

      expect(parsed.headacheType).toBe("sinus");
    });

    it("should detect mood - stressed/anxious", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "Feeling stressed today",
      );

      expect(parsed.mood).toBe("low");
      expect(parsed.stressLevel).toBe(7);
    });

    it("should detect mood - tired/exhausted", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("So tired");

      expect(parsed.mood).toBe("low");
    });

    it("should detect mood - okay/fine", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Feeling okay");

      expect(parsed.mood).toBe("neutral");
    });

    it("should detect context tag - woke-up-with-it", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "Woke up with a headache",
      );

      expect(parsed.contextTags).toContain("woke-up-with-it");
    });

    it("should detect context tag - came-on-gradually", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Came on gradually");

      expect(parsed.contextTags).toContain("came-on-gradually");
    });

    it("should detect context tag - sudden-onset", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "Sudden headache came on quickly",
      );

      expect(parsed.contextTags).toContain("sudden-onset");
    });

    it("should detect context tag - evening/after-work", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "Headache after work in the evening",
      );

      expect(parsed.contextTags).toContain("evening");
    });

    it("should parse complex natural language input", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage(
        "Woke up with a severe migraine this morning, feeling stressed and exhausted",
      );

      expect(parsed.intensity).toBe(5);
      expect(parsed.headacheType).toBe("migraine");
      expect(parsed.mood).toBe("low");
      expect(parsed.stressLevel).toBe(7);
      expect(parsed.contextTags).toContain("woke-up-with-it");
    });

    it("should return only naturalLanguageInput and note when no keywords detected", () => {
      const { result } = renderHook(() => useLoggingStore());

      const parsed = result.current.parseNaturalLanguage("Random text");

      expect(parsed.naturalLanguageInput).toBe("Random text");
      expect(parsed.note).toBe("Random text");
      expect(parsed.intensity).toBeUndefined();
      expect(parsed.headacheType).toBeUndefined();
      expect(parsed.mood).toBeUndefined();
    });
  });

  describe("Metadata Management", () => {
    it("should update metadata fields", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const customDate = new Date("2025-01-01");

      act(() => {
        result.current.updateMetadata({ firstEntryDate: customDate });
      });

      expect(result.current.metadata.firstEntryDate).toEqual(customDate);
    });

    it("should persist metadata to IndexedDB", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const customDate = new Date("2025-01-01");

      await act(async () => {
        result.current.updateMetadata({ firstEntryDate: customDate });
      });

      // Wait for persist to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify it's in IndexedDB
      if (result.current.db) {
        const stored = await result.current.db.get("metadata", "user-metadata");
        expect(stored).toBeDefined();
      }
    });
  });

  describe("Feature Unlock Helpers", () => {
    it("should return current unlocked features", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const features = result.current.getUnlockedFeatures();

      expect(features.week1Features).toBe(true);
      expect(features.week2Features).toBe(false);
      expect(features.week3Features).toBe(false);
    });

    it("should update features when checkFeatureUnlocks is called", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Set registration date to 20 days ago
      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

      await act(async () => {
        result.current.updateMetadata({ registrationDate: twentyDaysAgo });
        result.current.checkFeatureUnlocks();
      });

      const features = result.current.getUnlockedFeatures();

      expect(features.week1Features).toBe(true);
      expect(features.week2Features).toBe(true);
      expect(features.week3Features).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle database not initialized error", async () => {
      const { result } = renderHook(() => useLoggingStore());

      // Wait for hook to render then ensure db is null
      await act(async () => {
        useLoggingStore.setState({ db: null });
      });

      await expect(result.current.addEntry({ intensity: 3 })).rejects.toThrow(
        "Database not initialized. Call initializeDB first.",
      );
    });

    it("should return empty array when database not initialized for getRecentEntries", async () => {
      const { result } = renderHook(() => useLoggingStore());

      // Ensure db is null
      await act(async () => {
        useLoggingStore.setState({ db: null });
      });

      const entries = await result.current.getRecentEntries(10);

      expect(entries).toEqual([]);
    });

    it("should return undefined when database not initialized for getEntryById", async () => {
      const { result } = renderHook(() => useLoggingStore());

      // Ensure db is null
      await act(async () => {
        useLoggingStore.setState({ db: null });
      });

      const entry = await result.current.getEntryById("some-id");

      expect(entry).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive entry additions", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const ids: string[] = [];

      await act(async () => {
        for (let i = 1; i <= 5; i++) {
          const id = await result.current.addEntry({
            intensity: i as 1 | 2 | 3 | 4 | 5,
          });
          ids.push(id);
        }
      });

      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(5); // All unique
      expect(result.current.metadata.totalEntries).toBe(5);
    });

    it("should maintain immutability - not mutate previous state references", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const initialMetadata = { ...result.current.metadata };

      await act(async () => {
        await result.current.addEntry({ intensity: 3 });
      });

      // Initial reference should not be mutated
      expect(initialMetadata.totalEntries).toBe(0);
      expect(result.current.metadata.totalEntries).toBe(1);
    });

    it("should handle empty note gracefully", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let entryId: string = "";

      await act(async () => {
        entryId = await result.current.addEntry({ intensity: 3, note: "" });
      });

      const entry = await result.current.getEntryById(entryId);

      expect(entry?.note).toBe("");
    });

    it("should handle undefined optional fields", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let entryId: string = "";

      await act(async () => {
        entryId = await result.current.addEntry({ intensity: 3 });
      });

      const entry = await result.current.getEntryById(entryId);

      expect(entry?.note).toBeUndefined();
      expect(entry?.headacheType).toBeUndefined();
      expect(entry?.location).toBeUndefined();
    });
  });

  describe("Persistence - IndexedDB", () => {
    it("should persist entries to IndexedDB", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let entryId: string = "";

      await act(async () => {
        entryId = await result.current.addEntry({
          intensity: 4,
          note: "Test persistence",
        });
      });

      // Directly query IndexedDB
      if (result.current.db) {
        const storedEntry = await result.current.db.get("entries", entryId);
        expect(storedEntry).toBeDefined();
        expect(storedEntry?.intensity).toBe(4);
        expect(storedEntry?.note).toBe("Test persistence");
      }
    });

    it("should persist metadata to IndexedDB", async () => {
      const { result } = renderHook(() => useLoggingStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        await result.current.addEntry({ intensity: 3 });
      });

      // Verify metadata is in IndexedDB
      if (result.current.db) {
        const stored = await result.current.db.get("metadata", "user-metadata");
        expect(stored).toBeDefined();
        expect(stored?.totalEntries).toBe(1);
      }
    });
  });
});
