import { openDB, DBSchema, IDBPDatabase } from "idb";

/**
 * IndexedDB schema for Headache Awareness Trainer
 */
interface HeadacheTrackerDB extends DBSchema {
  // Headache logs
  logs: {
    key: string;
    value: {
      id: string;
      timestamp: Date;
      intensity: number;
      location: string[];
      triggers: string[];
      notes?: string;
      bodySignals: string[];
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { "by-timestamp": Date };
  };

  // Daily check-ins
  checkins: {
    key: string;
    value: {
      id: string;
      date: string; // YYYY-MM-DD format
      mood: number;
      energyLevel: number;
      stressLevel: number;
      sleepQuality: number;
      bodyAwareness: string[];
      notes?: string;
      createdAt: Date;
    };
    indexes: { "by-date": string };
  };

  // User settings and preferences
  settings: {
    key: string;
    value: {
      key: string;
      value: unknown;
      updatedAt: Date;
    };
  };

  // Sync queue for background sync
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: "log" | "checkin" | "settings";
      action: "create" | "update" | "delete";
      data: unknown;
      createdAt: Date;
      retryCount: number;
    };
    indexes: { "by-created": Date };
  };
}

const DB_NAME = "headache-tracker-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HeadacheTrackerDB>> | null = null;

/**
 * Get or create the IndexedDB database instance
 */
export async function getDB(): Promise<IDBPDatabase<HeadacheTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HeadacheTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create logs store
        if (!db.objectStoreNames.contains("logs")) {
          const logsStore = db.createObjectStore("logs", { keyPath: "id" });
          logsStore.createIndex("by-timestamp", "timestamp");
        }

        // Create check-ins store
        if (!db.objectStoreNames.contains("checkins")) {
          const checkinsStore = db.createObjectStore("checkins", {
            keyPath: "id",
          });
          checkinsStore.createIndex("by-date", "date");
        }

        // Create settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", {
            keyPath: "id",
          });
          syncStore.createIndex("by-created", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

// =============================================================================
// Headache Log Operations
// =============================================================================

export interface HeadacheLog {
  id: string;
  timestamp: Date;
  intensity: number;
  location: string[];
  triggers: string[];
  notes?: string;
  bodySignals: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function addLog(
  log: Omit<HeadacheLog, "id" | "createdAt" | "updatedAt">,
): Promise<HeadacheLog> {
  const db = await getDB();
  const now = new Date();
  const newLog: HeadacheLog = {
    ...log,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await db.put("logs", newLog);
  return newLog;
}

export async function getLog(id: string): Promise<HeadacheLog | undefined> {
  const db = await getDB();
  return db.get("logs", id);
}

export async function getAllLogs(): Promise<HeadacheLog[]> {
  const db = await getDB();
  return db.getAllFromIndex("logs", "by-timestamp");
}

export async function getLogsByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<HeadacheLog[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex("logs", "by-timestamp", range);
}

export async function updateLog(
  id: string,
  updates: Partial<HeadacheLog>,
): Promise<HeadacheLog | undefined> {
  const db = await getDB();
  const existing = await db.get("logs", id);
  if (!existing) return undefined;

  const updated: HeadacheLog = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  };
  await db.put("logs", updated);
  return updated;
}

export async function deleteLog(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("logs", id);
}

// =============================================================================
// Check-in Operations
// =============================================================================

export interface CheckIn {
  id: string;
  date: string;
  mood: number;
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  bodyAwareness: string[];
  notes?: string;
  createdAt: Date;
}

export async function addCheckIn(
  checkin: Omit<CheckIn, "id" | "createdAt">,
): Promise<CheckIn> {
  const db = await getDB();
  const newCheckin: CheckIn = {
    ...checkin,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
  await db.put("checkins", newCheckin);
  return newCheckin;
}

export async function getCheckInByDate(
  date: string,
): Promise<CheckIn | undefined> {
  const db = await getDB();
  const all = await db.getAllFromIndex("checkins", "by-date", date);
  return all[0]; // Return most recent for that date
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  const db = await getDB();
  return db.getAllFromIndex("checkins", "by-date");
}

// =============================================================================
// Settings Operations
// =============================================================================

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const result = await db.get("settings", key);
  return result?.value as T | undefined;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put("settings", {
    key,
    value,
    updatedAt: new Date(),
  });
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await getDB();
  await db.delete("settings", key);
}

// =============================================================================
// Sync Queue Operations (for background sync)
// =============================================================================

export interface SyncQueueItem {
  id: string;
  type: "log" | "checkin" | "settings";
  action: "create" | "update" | "delete";
  data: unknown;
  createdAt: Date;
  retryCount: number;
}

export async function addToSyncQueue(
  item: Omit<SyncQueueItem, "id" | "createdAt" | "retryCount">,
): Promise<void> {
  const db = await getDB();
  await db.put("syncQueue", {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    retryCount: 0,
  });
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "by-created");
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

export async function incrementRetryCount(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get("syncQueue", id);
  if (item) {
    await db.put("syncQueue", { ...item, retryCount: item.retryCount + 1 });
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Clear all data from the database (useful for testing or user data reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ["logs", "checkins", "settings", "syncQueue"],
    "readwrite",
  );
  await Promise.all([
    tx.objectStore("logs").clear(),
    tx.objectStore("checkins").clear(),
    tx.objectStore("settings").clear(),
    tx.objectStore("syncQueue").clear(),
    tx.done,
  ]);
}

/**
 * Export all data for backup
 */
export async function exportData(): Promise<{
  logs: HeadacheLog[];
  checkins: CheckIn[];
  exportedAt: Date;
}> {
  const [logs, checkins] = await Promise.all([getAllLogs(), getAllCheckIns()]);
  return {
    logs,
    checkins,
    exportedAt: new Date(),
  };
}
