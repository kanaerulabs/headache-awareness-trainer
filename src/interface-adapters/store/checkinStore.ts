import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { openDB, DBSchema, IDBPDatabase } from "idb";

/**
 * Check-in Entry Types
 */
export type CheckInMood = "calm" | "ok" | "stressed" | "anxious" | "avoidant";
export type SleepQuality = "good" | "ok" | "poor";
export type BodyTensionArea = "jaw" | "neck" | "shoulders";
export type PhysicalFactor = "acidity" | "fatigue" | "none";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface CheckInEntry {
  id: string;
  timestamp: Date;
  timeOfDay: TimeOfDay;
  mood: CheckInMood;
  bodyTension: BodyTensionArea[]; // multi-select
  sleepQuality: SleepQuality;
  physicalFactors: PhysicalFactor[]; // optional, can be empty
  note?: string;
  isQuickDismiss: boolean; // true if user tapped 'All good!'
  linkedHeadacheEntryId?: string; // for correlation
}

/**
 * IndexedDB Schema
 */
interface CheckInDB extends DBSchema {
  checkins: {
    key: string;
    value: CheckInEntry;
    indexes: { timestamp: Date; timeOfDay: TimeOfDay };
  };
}

/**
 * Check-in Store State
 */
export interface CheckInState {
  // IndexedDB instance
  db: IDBPDatabase<CheckInDB> | null;

  // Actions
  initializeDB: () => Promise<void>;
  addCheckIn: (entry: Partial<CheckInEntry>) => Promise<string>;
  addQuickDismiss: () => Promise<string>;
  getRecentCheckIns: (limit: number) => Promise<CheckInEntry[]>;
  getCheckInById: (id: string) => Promise<CheckInEntry | undefined>;
  getAllCheckIns: () => Promise<CheckInEntry[]>;
  getCheckInsForDate: (date: Date) => Promise<CheckInEntry[]>;
  deleteCheckIn: (id: string) => Promise<void>;
  linkToHeadacheEntry: (
    checkInId: string,
    headacheEntryId: string,
  ) => Promise<void>;
}

/**
 * Initialize IndexedDB
 */
const initDB = async (): Promise<IDBPDatabase<CheckInDB>> => {
  return openDB<CheckInDB>("headache-checkin-db", 1, {
    upgrade(db) {
      // Create checkins store with indexes
      if (!db.objectStoreNames.contains("checkins")) {
        const checkinStore = db.createObjectStore("checkins", {
          keyPath: "id",
        });
        checkinStore.createIndex("timestamp", "timestamp");
        checkinStore.createIndex("timeOfDay", "timeOfDay");
      }
    },
  });
};

/**
 * Determine time of day based on current hour
 */
const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "evening";
  } else {
    return "night";
  }
};

/**
 * Zustand store for quick check-ins
 * Uses IndexedDB for persistence
 */
export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      db: null,

      /**
       * Initialize IndexedDB connection
       */
      initializeDB: async () => {
        try {
          const db = await initDB();
          set({ db });
        } catch (error) {
          console.error("Failed to initialize CheckIn IndexedDB:", error);
        }
      },

      /**
       * Add a new check-in entry
       */
      addCheckIn: async (entry: Partial<CheckInEntry>): Promise<string> => {
        const { db } = get();
        if (!db) {
          throw new Error("Database not initialized. Call initializeDB first.");
        }

        // Validate required fields for regular check-in
        if (!entry.isQuickDismiss) {
          if (!entry.mood) {
            throw new Error("Mood is required for check-in");
          }
          if (!entry.sleepQuality) {
            throw new Error("Sleep quality is required for check-in");
          }
        }

        // Generate ID and timestamp
        const id = `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date();
        const timeOfDay = getTimeOfDay();

        // Create full entry
        const fullEntry: CheckInEntry = {
          id,
          timestamp,
          timeOfDay,
          mood: entry.mood || "ok",
          bodyTension: entry.bodyTension || [],
          sleepQuality: entry.sleepQuality || "ok",
          physicalFactors: entry.physicalFactors || [],
          note: entry.note,
          isQuickDismiss: entry.isQuickDismiss || false,
          linkedHeadacheEntryId: entry.linkedHeadacheEntryId,
        };

        // Save to IndexedDB
        await db.add("checkins", fullEntry);

        return id;
      },

      /**
       * Add a quick 'All good!' dismiss entry
       */
      addQuickDismiss: async (): Promise<string> => {
        const { db } = get();
        if (!db) {
          throw new Error("Database not initialized. Call initializeDB first.");
        }

        const id = `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date();
        const timeOfDay = getTimeOfDay();

        // Create quick dismiss entry with default values
        const quickDismissEntry: CheckInEntry = {
          id,
          timestamp,
          timeOfDay,
          mood: "calm", // Default mood for 'All good!'
          bodyTension: [], // No tension
          sleepQuality: "good", // Default good sleep
          physicalFactors: ["none"], // No physical factors
          isQuickDismiss: true,
        };

        await db.add("checkins", quickDismissEntry);

        return id;
      },

      /**
       * Get recent check-ins (sorted by timestamp descending)
       * Uses cursor for efficient retrieval without loading all entries
       */
      getRecentCheckIns: async (limit: number): Promise<CheckInEntry[]> => {
        const { db } = get();
        if (!db) return [];

        const tx = db.transaction("checkins", "readonly");
        const index = tx.store.index("timestamp");
        const entries: CheckInEntry[] = [];

        // Use cursor to iterate in reverse order (newest first) - more efficient
        let cursor = await index.openCursor(null, "prev");
        while (cursor && entries.length < limit) {
          entries.push({
            ...cursor.value,
            timestamp: new Date(cursor.value.timestamp),
          });
          cursor = await cursor.continue();
        }

        return entries;
      },

      /**
       * Get a specific check-in by ID
       */
      getCheckInById: async (id: string): Promise<CheckInEntry | undefined> => {
        const { db } = get();
        if (!db) return undefined;

        const entry = await db.get("checkins", id);
        if (!entry) return undefined;

        return {
          ...entry,
          timestamp: new Date(entry.timestamp),
        };
      },

      /**
       * Get all check-ins
       */
      getAllCheckIns: async (): Promise<CheckInEntry[]> => {
        const { db } = get();
        if (!db) return [];

        const entries = await db.getAll("checkins");

        return entries
          .map((entry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      /**
       * Get check-ins for a specific date
       */
      getCheckInsForDate: async (date: Date): Promise<CheckInEntry[]> => {
        const { db } = get();
        if (!db) return [];

        const entries = await db.getAll("checkins");

        // Filter entries for the specified date
        const targetDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );

        return entries
          .filter((entry) => {
            const entryDate = new Date(entry.timestamp);
            const entryDateOnly = new Date(
              entryDate.getFullYear(),
              entryDate.getMonth(),
              entryDate.getDate(),
            );
            return entryDateOnly.getTime() === targetDate.getTime();
          })
          .map((entry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      /**
       * Delete a check-in
       */
      deleteCheckIn: async (id: string): Promise<void> => {
        const { db } = get();
        if (!db) return;

        await db.delete("checkins", id);
      },

      /**
       * Link a check-in to a headache entry for correlation
       */
      linkToHeadacheEntry: async (
        checkInId: string,
        headacheEntryId: string,
      ): Promise<void> => {
        const { db } = get();
        if (!db) return;

        const existingEntry = await db.get("checkins", checkInId);
        if (!existingEntry) {
          throw new Error(`Check-in with id ${checkInId} not found`);
        }

        const updatedEntry: CheckInEntry = {
          ...existingEntry,
          linkedHeadacheEntryId: headacheEntryId,
          timestamp: new Date(existingEntry.timestamp),
        };

        await db.put("checkins", updatedEntry);
      },
    }),
    {
      name: "checkin-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({}), // Don't persist anything to localStorage, use IndexedDB only
    },
  ),
);
