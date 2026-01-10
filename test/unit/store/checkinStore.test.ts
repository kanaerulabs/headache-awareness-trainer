import { renderHook, act } from "@testing-library/react";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import {
  useCheckInStore,
  CheckInEntry,
  CheckInMood,
  SleepQuality,
  BodyTensionArea,
  PhysicalFactor,
  TimeOfDay,
} from "@/interface-adapters/store/checkinStore";

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

describe("CheckIn Store", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Reset IndexedDB - create fresh instance
    (globalThis as any).indexedDB = new IDBFactory();

    // Get initial store state and reset
    const initialState = useCheckInStore.getState();
    useCheckInStore.setState({
      ...initialState,
      db: null,
    }, true); // Replace entire state
  });

  afterEach(async () => {
    // Close any open database connections
    const state = useCheckInStore.getState();
    if (state.db) {
      state.db.close();
    }

    // Clean up after each test
    jest.clearAllMocks();
  });

  describe("Database Initialization", () => {
    it("should initialize IndexedDB connection", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      expect(result.current.db).toBeDefined();
      expect(result.current.db).not.toBeNull();
    });

    it("should create database with correct schema", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      if (result.current.db) {
        // Verify object store exists
        expect(result.current.db.objectStoreNames.contains("checkins")).toBe(
          true
        );

        // Verify we can access the store
        const tx = result.current.db.transaction("checkins", "readonly");
        expect(tx.store).toBeDefined();
      }
    });
  });

  describe("addCheckIn Action", () => {
    it("should add complete check-in with all fields", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "stressed",
          bodyTension: ["jaw", "neck"],
          sleepQuality: "poor",
          physicalFactors: ["acidity", "fatigue"],
          note: "Had a stressful day at work",
        });
      });

      expect(checkInId).toBeDefined();
      expect(typeof checkInId).toBe("string");
      expect(checkInId).toMatch(/^checkin-/);

      const entry = await result.current.getCheckInById(checkInId);
      expect(entry).toBeDefined();
      expect(entry?.mood).toBe("stressed");
      expect(entry?.bodyTension).toEqual(["jaw", "neck"]);
      expect(entry?.sleepQuality).toBe("poor");
      expect(entry?.physicalFactors).toEqual(["acidity", "fatigue"]);
      expect(entry?.note).toBe("Had a stressful day at work");
    });

    it("should throw error when mood is missing for regular check-in", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await expect(
        act(async () => {
          await result.current.addCheckIn({
            sleepQuality: "good",
            isQuickDismiss: false,
          });
        })
      ).rejects.toThrow("Mood is required for check-in");
    });

    it("should throw error when sleepQuality is missing for regular check-in", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await expect(
        act(async () => {
          await result.current.addCheckIn({
            mood: "calm",
            isQuickDismiss: false,
          });
        })
      ).rejects.toThrow("Sleep quality is required for check-in");
    });

    it("should auto-generate timestamp", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const before = new Date();
      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
        });
      });

      const after = new Date();
      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.timestamp).toBeDefined();
      expect(entry?.timestamp).toBeInstanceOf(Date);
      expect(entry!.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(entry!.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should auto-calculate timeOfDay", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "ok",
          sleepQuality: "ok",
        });
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.timeOfDay).toBeDefined();
      expect(["morning", "afternoon", "evening", "night"]).toContain(
        entry?.timeOfDay
      );
    });

    it("should generate unique IDs", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let id1: string = "";
      let id2: string = "";

      await act(async () => {
        id1 = await result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
        });
        id2 = await result.current.addCheckIn({
          mood: "stressed",
          sleepQuality: "poor",
        });
      });

      expect(id1).not.toEqual(id2);
    });

    it("should set default values for optional fields", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
        });
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.bodyTension).toEqual([]);
      expect(entry?.physicalFactors).toEqual([]);
      expect(entry?.isQuickDismiss).toBe(false);
      expect(entry?.note).toBeUndefined();
      expect(entry?.linkedHeadacheEntryId).toBeUndefined();
    });

    it("should throw error when database not initialized", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await expect(
        result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
        })
      ).rejects.toThrow("Database not initialized. Call initializeDB first.");
    });
  });

  describe("addQuickDismiss Action", () => {
    it("should create entry with default calm mood", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addQuickDismiss();
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.mood).toBe("calm");
    });

    it("should create entry with default good sleep", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addQuickDismiss();
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.sleepQuality).toBe("good");
    });

    it("should create entry with no body tension", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addQuickDismiss();
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.bodyTension).toEqual([]);
    });

    it("should set physicalFactors to none", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addQuickDismiss();
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.physicalFactors).toEqual(["none"]);
    });

    it("should set isQuickDismiss flag to true", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addQuickDismiss();
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.isQuickDismiss).toBe(true);
    });

    it("should complete in minimal time (< 3 seconds for logging)", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const startTime = Date.now();

      await act(async () => {
        await result.current.addQuickDismiss();
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete very quickly (under 1000ms in test environment)
      expect(duration).toBeLessThan(1000);
    });

    it("should throw error when database not initialized", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await expect(result.current.addQuickDismiss()).rejects.toThrow(
        "Database not initialized. Call initializeDB first."
      );
    });
  });

  describe("getRecentCheckIns Action", () => {
    it("should return empty array when no entries exist", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const entries = await result.current.getRecentCheckIns(10);

      expect(entries).toEqual([]);
    });

    it("should return entries sorted by timestamp descending", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        await result.current.addCheckIn({ mood: "calm", sleepQuality: "good" });
        await new Promise((resolve) => setTimeout(resolve, 5));
        await result.current.addCheckIn({ mood: "ok", sleepQuality: "ok" });
        await new Promise((resolve) => setTimeout(resolve, 5));
        await result.current.addCheckIn({
          mood: "stressed",
          sleepQuality: "poor",
        });
      });

      const entries = await result.current.getRecentCheckIns(10);

      expect(entries).toHaveLength(3);
      expect(entries[0].mood).toBe("stressed"); // Most recent
      expect(entries[1].mood).toBe("ok");
      expect(entries[2].mood).toBe("calm"); // Oldest
    });

    it("should limit results to specified count", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        for (let i = 0; i < 5; i++) {
          await result.current.addCheckIn({ mood: "ok", sleepQuality: "ok" });
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      });

      const entries = await result.current.getRecentCheckIns(3);

      expect(entries).toHaveLength(3);
    });

    it("should return empty array when database not initialized", async () => {
      const { result } = renderHook(() => useCheckInStore());

      const entries = await result.current.getRecentCheckIns(10);

      expect(entries).toEqual([]);
    });
  });

  describe("getCheckInsForDate Action", () => {
    it("should filter entries for specific date", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const targetDate = new Date();

      // Add entries for today
      await act(async () => {
        await result.current.addCheckIn({ mood: "calm", sleepQuality: "good" });
        await new Promise((resolve) => setTimeout(resolve, 5));
        await result.current.addCheckIn({ mood: "ok", sleepQuality: "ok" });
      });

      const entries = await result.current.getCheckInsForDate(targetDate);

      expect(entries).toHaveLength(2);
      entries.forEach((entry) => {
        const entryDate = new Date(entry.timestamp);
        expect(entryDate.getDate()).toBe(targetDate.getDate());
        expect(entryDate.getMonth()).toBe(targetDate.getMonth());
        expect(entryDate.getFullYear()).toBe(targetDate.getFullYear());
      });
    });

    it("should handle multiple check-ins per day", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const today = new Date();

      await act(async () => {
        for (let i = 0; i < 4; i++) {
          await result.current.addCheckIn({ mood: "ok", sleepQuality: "ok" });
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      });

      const entries = await result.current.getCheckInsForDate(today);

      expect(entries).toHaveLength(4);
    });

    it("should return empty array for dates with no check-ins", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      // Add entry for today
      await act(async () => {
        await result.current.addCheckIn({ mood: "calm", sleepQuality: "good" });
      });

      // Query for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const entries = await result.current.getCheckInsForDate(tomorrow);

      expect(entries).toEqual([]);
    });

    it("should return entries sorted by timestamp descending within the date", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const today = new Date();

      await act(async () => {
        await result.current.addCheckIn({ mood: "calm", sleepQuality: "good" });
        await new Promise((resolve) => setTimeout(resolve, 5));
        await result.current.addCheckIn({ mood: "ok", sleepQuality: "ok" });
        await new Promise((resolve) => setTimeout(resolve, 5));
        await result.current.addCheckIn({
          mood: "stressed",
          sleepQuality: "poor",
        });
      });

      const entries = await result.current.getCheckInsForDate(today);

      expect(entries[0].mood).toBe("stressed"); // Most recent
      expect(entries[2].mood).toBe("calm"); // Oldest
    });

    it("should return empty array when database not initialized", async () => {
      const { result } = renderHook(() => useCheckInStore());

      const entries = await result.current.getCheckInsForDate(new Date());

      expect(entries).toEqual([]);
    });
  });

  describe("linkToHeadacheEntry Action", () => {
    it("should link check-in to headache entry", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "stressed",
          sleepQuality: "poor",
        });
      });

      const headacheEntryId = "headache-entry-123";

      await act(async () => {
        await result.current.linkToHeadacheEntry(checkInId, headacheEntryId);
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.linkedHeadacheEntryId).toBe(headacheEntryId);
    });

    it("should store correlation ID correctly", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "anxious",
          sleepQuality: "poor",
        });
      });

      const headacheEntryId = "headache-xyz-789";

      await act(async () => {
        await result.current.linkToHeadacheEntry(checkInId, headacheEntryId);
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.linkedHeadacheEntryId).toBe(headacheEntryId);
    });

    it("should throw error when check-in does not exist", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await expect(
        act(async () => {
          await result.current.linkToHeadacheEntry(
            "non-existent-id",
            "headache-123"
          );
        })
      ).rejects.toThrow("Check-in with id non-existent-id not found");
    });

    it("should preserve existing check-in data when linking", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "stressed",
          bodyTension: ["jaw", "neck"],
          sleepQuality: "poor",
          physicalFactors: ["acidity"],
          note: "Test note",
        });
      });

      await act(async () => {
        await result.current.linkToHeadacheEntry(checkInId, "headache-123");
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.mood).toBe("stressed");
      expect(entry?.bodyTension).toEqual(["jaw", "neck"]);
      expect(entry?.sleepQuality).toBe("poor");
      expect(entry?.physicalFactors).toEqual(["acidity"]);
      expect(entry?.note).toBe("Test note");
      expect(entry?.linkedHeadacheEntryId).toBe("headache-123");
    });
  });

  describe("deleteCheckIn Action", () => {
    it("should remove entry from database", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
        });
      });

      expect(await result.current.getCheckInById(checkInId)).toBeDefined();

      await act(async () => {
        await result.current.deleteCheckIn(checkInId);
      });

      expect(await result.current.getCheckInById(checkInId)).toBeUndefined();
    });

    it("should not throw error when deleting non-existent ID", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await expect(
        act(async () => {
          await result.current.deleteCheckIn("non-existent-id");
        })
      ).resolves.not.toThrow();
    });

    it("should handle multiple deletions gracefully", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let id1: string = "";
      let id2: string = "";
      let id3: string = "";

      await act(async () => {
        id1 = await result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
        });
        id2 = await result.current.addCheckIn({ mood: "ok", sleepQuality: "ok" });
        id3 = await result.current.addCheckIn({
          mood: "stressed",
          sleepQuality: "poor",
        });
      });

      await act(async () => {
        await result.current.deleteCheckIn(id1);
        await result.current.deleteCheckIn(id3);
      });

      expect(await result.current.getCheckInById(id1)).toBeUndefined();
      expect(await result.current.getCheckInById(id2)).toBeDefined();
      expect(await result.current.getCheckInById(id3)).toBeUndefined();
    });
  });

  describe("getCheckInById Action", () => {
    it("should return entry when ID exists", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "stressed",
          bodyTension: ["neck"],
          sleepQuality: "poor",
          note: "Test note",
        });
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry).toBeDefined();
      expect(entry?.id).toBe(checkInId);
      expect(entry?.mood).toBe("stressed");
      expect(entry?.note).toBe("Test note");
    });

    it("should return undefined when ID does not exist", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const entry = await result.current.getCheckInById("non-existent-id");

      expect(entry).toBeUndefined();
    });

    it("should return undefined when database not initialized", async () => {
      const { result } = renderHook(() => useCheckInStore());

      const entry = await result.current.getCheckInById("some-id");

      expect(entry).toBeUndefined();
    });
  });

  describe("getAllCheckIns Action", () => {
    it("should return all entries sorted by timestamp descending", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      await act(async () => {
        for (let i = 0; i < 4; i++) {
          await result.current.addCheckIn({ mood: "ok", sleepQuality: "ok" });
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      });

      const entries = await result.current.getAllCheckIns();

      expect(entries).toHaveLength(4);

      // Verify descending order
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          entries[i + 1].timestamp.getTime()
        );
      }
    });

    it("should return empty array when no entries exist", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const entries = await result.current.getAllCheckIns();

      expect(entries).toEqual([]);
    });

    it("should return empty array when database not initialized", async () => {
      const { result } = renderHook(() => useCheckInStore());

      const entries = await result.current.getAllCheckIns();

      expect(entries).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive check-in additions", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const ids: string[] = [];

      await act(async () => {
        for (let i = 0; i < 5; i++) {
          const id = await result.current.addCheckIn({
            mood: "ok",
            sleepQuality: "ok",
          });
          ids.push(id);
        }
      });

      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(5); // All unique

      const allEntries = await result.current.getAllCheckIns();
      expect(allEntries).toHaveLength(5);
    });

    it("should handle empty bodyTension array", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "calm",
          bodyTension: [],
          sleepQuality: "good",
        });
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.bodyTension).toEqual([]);
    });

    it("should handle empty physicalFactors array", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
          physicalFactors: [],
        });
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.physicalFactors).toEqual([]);
    });

    it("should handle empty note string", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "calm",
          sleepQuality: "good",
          note: "",
        });
      });

      const entry = await result.current.getCheckInById(checkInId);

      expect(entry?.note).toBe("");
    });

    it("should maintain immutability - not mutate input objects", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const inputData = {
        mood: "calm" as CheckInMood,
        bodyTension: ["jaw"] as BodyTensionArea[],
        sleepQuality: "good" as SleepQuality,
        physicalFactors: ["fatigue"] as PhysicalFactor[],
      };

      const originalBodyTension = [...inputData.bodyTension];
      const originalPhysicalFactors = [...inputData.physicalFactors];

      await act(async () => {
        await result.current.addCheckIn(inputData);
      });

      // Input object should not be mutated
      expect(inputData.bodyTension).toEqual(originalBodyTension);
      expect(inputData.physicalFactors).toEqual(originalPhysicalFactors);
    });

    it("should handle multiple check-ins with same data", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const checkInData = {
        mood: "ok" as CheckInMood,
        sleepQuality: "ok" as SleepQuality,
        bodyTension: ["neck"] as BodyTensionArea[],
      };

      let id1: string = "";
      let id2: string = "";

      await act(async () => {
        id1 = await result.current.addCheckIn(checkInData);
        await new Promise((resolve) => setTimeout(resolve, 5));
        id2 = await result.current.addCheckIn(checkInData);
      });

      expect(id1).not.toEqual(id2);

      const entry1 = await result.current.getCheckInById(id1);
      const entry2 = await result.current.getCheckInById(id2);

      expect(entry1?.mood).toBe(entry2?.mood);
      expect(entry1?.sleepQuality).toBe(entry2?.sleepQuality);
      expect(entry1?.id).not.toBe(entry2?.id);
    });
  });

  describe("Persistence - IndexedDB", () => {
    it("should persist check-ins to IndexedDB", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "stressed",
          bodyTension: ["jaw", "neck"],
          sleepQuality: "poor",
          note: "Test persistence",
        });
      });

      // Directly query IndexedDB
      if (result.current.db) {
        const storedEntry = await result.current.db.get("checkins", checkInId);
        expect(storedEntry).toBeDefined();
        expect(storedEntry?.mood).toBe("stressed");
        expect(storedEntry?.bodyTension).toEqual(["jaw", "neck"]);
        expect(storedEntry?.sleepQuality).toBe("poor");
        expect(storedEntry?.note).toBe("Test persistence");
      }
    });

    it("should persist quick dismiss entries to IndexedDB", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addQuickDismiss();
      });

      // Directly query IndexedDB
      if (result.current.db) {
        const storedEntry = await result.current.db.get("checkins", checkInId);
        expect(storedEntry).toBeDefined();
        expect(storedEntry?.isQuickDismiss).toBe(true);
        expect(storedEntry?.mood).toBe("calm");
        expect(storedEntry?.sleepQuality).toBe("good");
      }
    });

    it("should maintain data integrity across multiple operations", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      let checkInId: string = "";

      await act(async () => {
        checkInId = await result.current.addCheckIn({
          mood: "anxious",
          sleepQuality: "poor",
        });
      });

      await act(async () => {
        await result.current.linkToHeadacheEntry(checkInId, "headache-123");
      });

      // Verify in IndexedDB
      if (result.current.db) {
        const storedEntry = await result.current.db.get("checkins", checkInId);
        expect(storedEntry?.linkedHeadacheEntryId).toBe("headache-123");
        expect(storedEntry?.mood).toBe("anxious");
      }
    });
  });

  describe("Type Safety", () => {
    it("should enforce valid CheckInMood types", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const validMoods: CheckInMood[] = [
        "calm",
        "ok",
        "stressed",
        "anxious",
        "avoidant",
      ];

      for (const mood of validMoods) {
        await act(async () => {
          const checkInId = await result.current.addCheckIn({
            mood,
            sleepQuality: "ok",
          });

          const entry = await result.current.getCheckInById(checkInId);
          expect(entry?.mood).toBe(mood);
        });
      }
    });

    it("should enforce valid SleepQuality types", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const validSleepQualities: SleepQuality[] = ["good", "ok", "poor"];

      for (const sleepQuality of validSleepQualities) {
        await act(async () => {
          const checkInId = await result.current.addCheckIn({
            mood: "ok",
            sleepQuality,
          });

          const entry = await result.current.getCheckInById(checkInId);
          expect(entry?.sleepQuality).toBe(sleepQuality);
        });
      }
    });

    it("should enforce valid BodyTensionArea types", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const validBodyTensionAreas: BodyTensionArea[] = [
        "jaw",
        "neck",
        "shoulders",
      ];

      await act(async () => {
        const checkInId = await result.current.addCheckIn({
          mood: "ok",
          bodyTension: validBodyTensionAreas,
          sleepQuality: "ok",
        });

        const entry = await result.current.getCheckInById(checkInId);
        expect(entry?.bodyTension).toEqual(validBodyTensionAreas);
      });
    });

    it("should enforce valid PhysicalFactor types", async () => {
      const { result } = renderHook(() => useCheckInStore());

      await act(async () => {
        await result.current.initializeDB();
      });

      const validPhysicalFactors: PhysicalFactor[] = [
        "acidity",
        "fatigue",
        "none",
      ];

      await act(async () => {
        const checkInId = await result.current.addCheckIn({
          mood: "ok",
          physicalFactors: validPhysicalFactors,
          sleepQuality: "ok",
        });

        const entry = await result.current.getCheckInById(checkInId);
        expect(entry?.physicalFactors).toEqual(validPhysicalFactors);
      });
    });
  });
});
