/**
 * Headache Entry Repository Implementation
 *
 * IndexedDB-based repository for headache entries.
 * Implements the HeadacheEntryRepository interface from use cases.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import {
  HeadacheEntry,
  HeadacheEntryProps,
} from "../../domains/headache-entry/headache-entry.entity";
import { HeadacheEntryRepository } from "../../usecases/log-headache.usecase";

/**
 * Stored format - timestamp serialized as string
 */
type StoredHeadacheEntry = Omit<HeadacheEntryProps, "timestamp"> & { timestamp: string };

/**
 * IndexedDB Schema for Headache Entries
 */
interface HeadacheDB extends DBSchema {
  entries: {
    key: string;
    value: StoredHeadacheEntry;
    indexes: { timestamp: string };
  };
}

// Use the same database as loggingStore for data consistency
const DB_NAME = "headache-logging-db";
const DB_VERSION = 1;

/**
 * IndexedDB Repository Implementation
 */
export class IndexedDBHeadacheEntryRepository implements HeadacheEntryRepository {
  private db: IDBPDatabase<HeadacheDB> | null = null;

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<HeadacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("entries")) {
          const store = db.createObjectStore("entries", { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
        }
      },
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBPDatabase<HeadacheDB>> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  /**
   * Save a headache entry
   */
  async save(entry: HeadacheEntry): Promise<void> {
    const db = await this.ensureDB();
    const props = entry.toPlainObject();

    // Serialize date for IndexedDB
    await db.put("entries", {
      ...props,
      timestamp: props.timestamp.toISOString(),
    });
  }

  /**
   * Find entry by ID
   */
  async findById(id: string): Promise<HeadacheEntry | null> {
    const db = await this.ensureDB();
    const data = await db.get("entries", id);

    if (!data) return null;

    return HeadacheEntry.create({
      ...data,
      timestamp: new Date(data.timestamp),
    });
  }

  /**
   * Find recent entries
   */
  async findRecent(limit: number): Promise<HeadacheEntry[]> {
    const db = await this.ensureDB();
    const tx = db.transaction("entries", "readonly");
    const index = tx.store.index("timestamp");
    const entries: HeadacheEntry[] = [];

    // Use cursor to iterate in reverse order (newest first)
    let cursor = await index.openCursor(null, "prev");
    while (cursor && entries.length < limit) {
      const entry = HeadacheEntry.create({
        ...cursor.value,
        timestamp: new Date(cursor.value.timestamp),
      });
      entries.push(entry);
      cursor = await cursor.continue();
    }

    return entries;
  }

  /**
   * Find all entries
   */
  async findAll(): Promise<HeadacheEntry[]> {
    const db = await this.ensureDB();
    const data = await db.getAll("entries");

    return data
      .map((item) =>
        HeadacheEntry.create({
          ...item,
          timestamp: new Date(item.timestamp),
        }),
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Find entries by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<HeadacheEntry[]> {
    const db = await this.ensureDB();
    const tx = db.transaction("entries", "readonly");
    const index = tx.store.index("timestamp");

    const range = IDBKeyRange.bound(
      startDate.toISOString(),
      endDate.toISOString(),
    );

    const data = await index.getAll(range);

    return data
      .map((item) =>
        HeadacheEntry.create({
          ...item,
          timestamp: new Date(item.timestamp),
        }),
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Delete entry by ID
   */
  async delete(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete("entries", id);
  }
}

/**
 * Singleton instance for convenience
 */
let repositoryInstance: IndexedDBHeadacheEntryRepository | null = null;

export function getHeadacheEntryRepository(): IndexedDBHeadacheEntryRepository {
  if (!repositoryInstance) {
    repositoryInstance = new IndexedDBHeadacheEntryRepository();
  }
  return repositoryInstance;
}
