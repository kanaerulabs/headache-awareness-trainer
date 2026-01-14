import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { openDB, DBSchema, IDBPDatabase } from "idb";

/**
 * Headache Entry Types
 */
export type HeadacheType =
  | "tension"
  | "migraine"
  | "cluster"
  | "sinus"
  | "other";
export type MoodType = "great" | "good" | "neutral" | "low" | "bad";

export interface HeadacheEntry {
  id: string;
  timestamp: Date;
  intensity: 1 | 2 | 3 | 4 | 5;
  note?: string;
  naturalLanguageInput?: string;

  // Week 2+ fields
  headacheType?: HeadacheType;
  location?: {
    head: string[];
    body: string[];
  };

  // Week 3+ fields
  bodyTension?: number; // 0-10 scale
  mood?: MoodType;
  stressLevel?: number; // 0-10 scale

  // Context tags
  contextTags?: string[];
}

/**
 * Progressive feature unlock configuration
 */
export interface FeatureUnlockState {
  week1Features: boolean; // Always true (intensity + note)
  week2Features: boolean; // Headache type + location
  week3Features: boolean; // Body tension + mood/stress
}

/**
 * User metadata for progressive unlocking
 */
export interface UserMetadata {
  registrationDate: Date | null;
  firstEntryDate: Date | null;
  totalEntries: number;
  currentStreak: number;
}

/**
 * Stored metadata with key for IndexedDB
 */
interface StoredMetadata extends UserMetadata {
  key: string;
}

/**
 * IndexedDB Schema
 */
interface LoggingDB extends DBSchema {
  entries: {
    key: string;
    value: HeadacheEntry;
    indexes: { timestamp: Date };
  };
  metadata: {
    key: string;
    value: StoredMetadata;
  };
}

/**
 * Logging Store State
 */
export interface LoggingState {
  // User metadata
  metadata: UserMetadata;

  // Feature unlock state
  unlockedFeatures: FeatureUnlockState;

  // IndexedDB instance
  db: IDBPDatabase<LoggingDB> | null;

  // Actions
  initializeDB: () => Promise<void>;
  addEntry: (entry: Partial<HeadacheEntry>) => Promise<string>;
  getRecentEntries: (limit: number) => Promise<HeadacheEntry[]>;
  getEntryById: (id: string) => Promise<HeadacheEntry | undefined>;
  getAllEntries: () => Promise<HeadacheEntry[]>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<HeadacheEntry>) => Promise<void>;

  // Feature unlock helpers
  getUnlockedFeatures: () => FeatureUnlockState;
  checkFeatureUnlocks: () => void;

  // Natural language parsing placeholder
  parseNaturalLanguage: (text: string) => Partial<HeadacheEntry>;

  // Metadata management
  updateMetadata: (updates: Partial<UserMetadata>) => void;
  calculateStreak: () => Promise<number>;
}

/**
 * Initialize IndexedDB
 */
const initDB = async (): Promise<IDBPDatabase<LoggingDB>> => {
  return openDB<LoggingDB>("headache-logging-db", 2, {
    upgrade(db) {
      // Create entries store with timestamp index
      if (!db.objectStoreNames.contains("entries")) {
        const entryStore = db.createObjectStore("entries", { keyPath: "id" });
        entryStore.createIndex("timestamp", "timestamp");
      }

      // Create metadata store
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", { keyPath: "key" });
      }
    },
  });
};

/**
 * Calculate days since registration
 */
const getDaysSinceRegistration = (registrationDate: Date | null): number => {
  if (!registrationDate) return 0;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Determine unlocked features based on usage
 */
const calculateUnlockedFeatures = (
  metadata: UserMetadata,
): FeatureUnlockState => {
  const daysSinceRegistration = getDaysSinceRegistration(
    metadata.registrationDate,
  );

  return {
    week1Features: true, // Always unlocked
    week2Features: daysSinceRegistration >= 7, // Week 2+
    week3Features: daysSinceRegistration >= 14, // Week 3+
  };
};

/**
 * Initial metadata state
 */
const initialMetadata: UserMetadata = {
  registrationDate: null,
  firstEntryDate: null,
  totalEntries: 0,
  currentStreak: 0,
};

/**
 * Zustand store for headache logging
 * Uses IndexedDB for persistence instead of localStorage
 */
export const useLoggingStore = create<LoggingState>()(
  persist(
    (set, get) => ({
      metadata: initialMetadata,
      unlockedFeatures: {
        week1Features: true,
        week2Features: false,
        week3Features: false,
      },
      db: null,

      /**
       * Initialize IndexedDB connection
       */
      initializeDB: async () => {
        try {
          const db = await initDB();
          set({ db });

          // Load metadata from IndexedDB
          const storedMetadata = await db.get("metadata", "user-metadata");
          if (storedMetadata) {
            // Convert Date strings back to Date objects
            const metadata: UserMetadata = {
              ...storedMetadata,
              registrationDate: storedMetadata.registrationDate
                ? new Date(storedMetadata.registrationDate)
                : null,
              firstEntryDate: storedMetadata.firstEntryDate
                ? new Date(storedMetadata.firstEntryDate)
                : null,
            };
            set({ metadata });

            // Calculate unlocked features
            const unlockedFeatures = calculateUnlockedFeatures(metadata);
            set({ unlockedFeatures });
          } else {
            // First time user - set registration date
            const now = new Date();
            const newMetadata: UserMetadata = {
              ...initialMetadata,
              registrationDate: now,
            };
            await db.put("metadata", { ...newMetadata, key: "user-metadata" });
            set({ metadata: newMetadata });
          }
        } catch (error) {
          console.error("Failed to initialize IndexedDB:", error);
        }
      },

      /**
       * Add a new headache entry
       */
      addEntry: async (entry: Partial<HeadacheEntry>): Promise<string> => {
        const { db, metadata } = get();
        if (!db) {
          throw new Error("Database not initialized. Call initializeDB first.");
        }

        // Validate required fields
        if (!entry.intensity) {
          throw new Error("Intensity is required");
        }

        // Generate ID and timestamp
        const id = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date();

        // Create full entry
        const fullEntry: HeadacheEntry = {
          id,
          timestamp,
          intensity: entry.intensity,
          note: entry.note,
          naturalLanguageInput: entry.naturalLanguageInput,
          headacheType: entry.headacheType,
          location: entry.location,
          bodyTension: entry.bodyTension,
          mood: entry.mood,
          stressLevel: entry.stressLevel,
          contextTags: entry.contextTags || [],
        };

        // Calculate new streak BEFORE the write (optimistic)
        // A new entry today either continues or starts a streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get the most recent entry to calculate streak correctly
        // Note: We query the DB for the latest entry, not metadata.firstEntryDate
        const index = db.transaction("entries").store.index("timestamp");
        const cursor = await index.openCursor(null, "prev");
        const lastEntryDate = cursor ? new Date(cursor.value.timestamp) : null;
        let newStreak = metadata.currentStreak;

        // If we have entries, check if the last one was today or yesterday
        if (lastEntryDate) {
          const lastDate = new Date(lastEntryDate);
          lastDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor(
            (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diffDays === 0) {
            // Same day, streak continues
          } else if (diffDays === 1) {
            // Yesterday, streak increases
            newStreak = metadata.currentStreak + 1;
          } else {
            // Gap, streak resets to 1
            newStreak = 1;
          }
        } else {
          newStreak = 1; // First entry starts streak
        }

        // Create updated metadata with all changes
        const updatedMetadata: UserMetadata = {
          ...metadata,
          firstEntryDate: metadata.firstEntryDate || timestamp,
          totalEntries: metadata.totalEntries + 1,
          currentStreak: newStreak,
        };

        // Single transaction for both writes
        const tx = db.transaction(["entries", "metadata"], "readwrite");
        await Promise.all([
          tx.objectStore("entries").add(fullEntry),
          tx
            .objectStore("metadata")
            .put({ ...updatedMetadata, key: "user-metadata" }),
          tx.done,
        ]);

        set({ metadata: updatedMetadata });

        // Check for feature unlocks (lightweight, no DB access)
        get().checkFeatureUnlocks();

        return id;
      },

      /**
       * Get recent entries (sorted by timestamp descending)
       * Uses cursor for efficient retrieval without loading all entries
       */
      getRecentEntries: async (limit: number): Promise<HeadacheEntry[]> => {
        const { db } = get();
        if (!db) return [];

        const tx = db.transaction("entries", "readonly");
        const index = tx.store.index("timestamp");
        const entries: HeadacheEntry[] = [];

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
       * Get a specific entry by ID
       */
      getEntryById: async (id: string): Promise<HeadacheEntry | undefined> => {
        const { db } = get();
        if (!db) return undefined;

        const entry = await db.get("entries", id);
        if (!entry) return undefined;

        return {
          ...entry,
          timestamp: new Date(entry.timestamp),
        };
      },

      /**
       * Get all entries
       */
      getAllEntries: async (): Promise<HeadacheEntry[]> => {
        const { db } = get();
        if (!db) return [];

        const entries = await db.getAll("entries");

        return entries
          .map((entry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      /**
       * Delete an entry
       */
      deleteEntry: async (id: string): Promise<void> => {
        const { db, metadata } = get();
        if (!db) return;

        await db.delete("entries", id);

        // Update total entries count
        const updatedMetadata: UserMetadata = {
          ...metadata,
          totalEntries: Math.max(0, metadata.totalEntries - 1),
        };

        await db.put("metadata", { ...updatedMetadata, key: "user-metadata" });
        set({ metadata: updatedMetadata });

        // Recalculate streak
        const newStreak = await get().calculateStreak();
        const metadataWithStreak: UserMetadata = {
          ...updatedMetadata,
          currentStreak: newStreak,
        };
        await db.put("metadata", {
          ...metadataWithStreak,
          key: "user-metadata",
        });
        set({ metadata: metadataWithStreak });
      },

      /**
       * Update an existing entry
       */
      updateEntry: async (
        id: string,
        updates: Partial<HeadacheEntry>,
      ): Promise<void> => {
        const { db } = get();
        if (!db) return;

        const existingEntry = await db.get("entries", id);
        if (!existingEntry) {
          throw new Error(`Entry with id ${id} not found`);
        }

        const updatedEntry: HeadacheEntry = {
          ...existingEntry,
          ...updates,
          id, // Preserve original ID
          timestamp: new Date(existingEntry.timestamp), // Preserve original timestamp
        };

        await db.put("entries", updatedEntry);
      },

      /**
       * Get currently unlocked features
       */
      getUnlockedFeatures: (): FeatureUnlockState => {
        return get().unlockedFeatures;
      },

      /**
       * Check and update feature unlocks based on current metadata
       */
      checkFeatureUnlocks: () => {
        const { metadata } = get();
        const newUnlockedFeatures = calculateUnlockedFeatures(metadata);
        set({ unlockedFeatures: newUnlockedFeatures });
      },

      /**
       * Parse natural language input into structured data
       * Placeholder for AI parsing - returns basic parsing for now
       */
      parseNaturalLanguage: (text: string): Partial<HeadacheEntry> => {
        const parsed: Partial<HeadacheEntry> = {
          naturalLanguageInput: text,
          note: text,
        };

        // Basic keyword detection (to be replaced with AI parsing)
        const lowerText = text.toLowerCase();

        // Detect intensity keywords
        if (lowerText.includes("severe") || lowerText.includes("terrible")) {
          parsed.intensity = 5;
        } else if (lowerText.includes("bad") || lowerText.includes("strong")) {
          parsed.intensity = 4;
        } else if (lowerText.includes("moderate")) {
          parsed.intensity = 3;
        } else if (lowerText.includes("mild") || lowerText.includes("slight")) {
          parsed.intensity = 2;
        } else if (lowerText.includes("barely")) {
          parsed.intensity = 1;
        }

        // Detect headache type
        if (lowerText.includes("migraine")) {
          parsed.headacheType = "migraine";
        } else if (lowerText.includes("tension")) {
          parsed.headacheType = "tension";
        } else if (lowerText.includes("cluster")) {
          parsed.headacheType = "cluster";
        } else if (lowerText.includes("sinus")) {
          parsed.headacheType = "sinus";
        }

        // Detect context tags
        const tags: string[] = [];
        if (
          lowerText.includes("woke up") ||
          lowerText.includes("woke with") ||
          lowerText.includes("morning")
        ) {
          tags.push("woke-up-with-it");
        }
        if (
          lowerText.includes("gradually") ||
          lowerText.includes("came on slowly")
        ) {
          tags.push("came-on-gradually");
        }
        if (
          lowerText.includes("sudden") ||
          lowerText.includes("came on quickly")
        ) {
          tags.push("sudden-onset");
        }
        if (lowerText.includes("after work") || lowerText.includes("evening")) {
          tags.push("evening");
        }
        if (tags.length > 0) {
          parsed.contextTags = tags;
        }

        // Detect mood
        if (lowerText.includes("stressed") || lowerText.includes("anxious")) {
          parsed.mood = "low";
          parsed.stressLevel = 7;
        } else if (
          lowerText.includes("tired") ||
          lowerText.includes("exhausted")
        ) {
          parsed.mood = "low";
        } else if (lowerText.includes("okay") || lowerText.includes("fine")) {
          parsed.mood = "neutral";
        }

        return parsed;
      },

      /**
       * Update user metadata
       */
      updateMetadata: (updates: Partial<UserMetadata>) => {
        const { metadata, db } = get();
        const updatedMetadata = { ...metadata, ...updates };
        set({ metadata: updatedMetadata });

        // Persist to IndexedDB
        if (db) {
          db.put("metadata", { ...updatedMetadata, key: "user-metadata" });
        }
      },

      /**
       * Calculate current streak (consecutive days with entries)
       */
      calculateStreak: async (): Promise<number> => {
        const { db } = get();
        if (!db) return 0;

        // Use cursor for efficient streak calculation - stop as soon as we find a gap
        const tx = db.transaction("entries", "readonly");
        const index = tx.store.index("timestamp");

        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get first entry to check if streak is broken
        let cursor = await index.openCursor(null, "prev");
        if (!cursor) return 0;

        const mostRecentEntry = new Date(cursor.value.timestamp);
        const mostRecentDate = new Date(
          mostRecentEntry.getFullYear(),
          mostRecentEntry.getMonth(),
          mostRecentEntry.getDate(),
        );

        // Streak broken if no entry today or yesterday
        if (
          mostRecentDate.getTime() !== today.getTime() &&
          mostRecentDate.getTime() !== yesterday.getTime()
        ) {
          return 0;
        }

        // Count consecutive days using cursor
        let streak = 1;
        const currentDate = new Date(mostRecentDate);
        currentDate.setDate(currentDate.getDate() - 1);
        let lastSeenDate = mostRecentDate.getTime();

        cursor = await cursor.continue();
        while (cursor) {
          const entryDate = new Date(cursor.value.timestamp);
          const entryDateOnly = new Date(
            entryDate.getFullYear(),
            entryDate.getMonth(),
            entryDate.getDate(),
          );

          // Skip entries from the same day
          if (entryDateOnly.getTime() === lastSeenDate) {
            cursor = await cursor.continue();
            continue;
          }

          if (entryDateOnly.getTime() === currentDate.getTime()) {
            streak++;
            lastSeenDate = entryDateOnly.getTime();
            currentDate.setDate(currentDate.getDate() - 1);
            cursor = await cursor.continue();
          } else {
            // Gap in streak, stop early
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: "logging-storage",
      storage: createJSONStorage(() => localStorage), // Only for metadata, entries go to IndexedDB
      partialize: (state) => ({
        metadata: state.metadata,
        unlockedFeatures: state.unlockedFeatures,
      }),
    },
  ),
);
