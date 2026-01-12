/**
 * CheckIn Repository Implementation
 *
 * IndexedDB-based repository for check-in entries.
 * Implements the CheckInRepository interface from use cases.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { CheckIn, CheckInProps } from "../../domains/checkin/checkin.entity";
import { CheckInRepository } from "../../usecases/manage-checkin.usecase";

/**
 * Stored format - timestamp serialized as string
 */
type StoredCheckIn = Omit<CheckInProps, "timestamp"> & { timestamp: string };

/**
 * IndexedDB Schema for CheckIn Entries
 */
interface CheckInDB extends DBSchema {
  checkins: {
    key: string;
    value: StoredCheckIn;
    indexes: { timestamp: string; timeOfDay: string };
  };
}

const DB_NAME = "headache-checkin-db";
const DB_VERSION = 2;

/**
 * IndexedDB Repository Implementation
 */
export class IndexedDBCheckInRepository implements CheckInRepository {
  private db: IDBPDatabase<CheckInDB> | null = null;

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<CheckInDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("checkins")) {
          const store = db.createObjectStore("checkins", { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("timeOfDay", "timeOfDay");
        }
      },
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBPDatabase<CheckInDB>> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  /**
   * Save a check-in entry
   */
  async save(entry: CheckIn): Promise<void> {
    const db = await this.ensureDB();
    const props = entry.toPlainObject();

    // Serialize date for IndexedDB
    await db.add("checkins", {
      ...props,
      timestamp: props.timestamp.toISOString(),
    });
  }

  /**
   * Update an existing check-in entry
   */
  async update(entry: CheckIn): Promise<void> {
    const db = await this.ensureDB();
    const props = entry.toPlainObject();

    await db.put("checkins", {
      ...props,
      timestamp: props.timestamp.toISOString(),
    });
  }

  /**
   * Find entry by ID
   */
  async findById(id: string): Promise<CheckIn | null> {
    const db = await this.ensureDB();
    const data = await db.get("checkins", id);

    if (!data) return null;

    return CheckIn.create({
      ...data,
      timestamp: new Date(data.timestamp),
    });
  }

  /**
   * Find recent entries
   */
  async findRecent(limit: number): Promise<CheckIn[]> {
    const db = await this.ensureDB();
    const tx = db.transaction("checkins", "readonly");
    const index = tx.store.index("timestamp");
    const entries: CheckIn[] = [];

    // Use cursor to iterate in reverse order (newest first)
    let cursor = await index.openCursor(null, "prev");
    while (cursor && entries.length < limit) {
      const entry = CheckIn.create({
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
  async findAll(): Promise<CheckIn[]> {
    const db = await this.ensureDB();
    const data = await db.getAll("checkins");

    return data
      .map((item) =>
        CheckIn.create({
          ...item,
          timestamp: new Date(item.timestamp),
        }),
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Find entries for a specific date
   */
  async findByDate(date: Date): Promise<CheckIn[]> {
    const db = await this.ensureDB();
    const data = await db.getAll("checkins");

    // Filter entries for the specified date
    const targetDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    return data
      .filter((item) => {
        const entryDate = new Date(item.timestamp);
        const entryDateOnly = new Date(
          entryDate.getFullYear(),
          entryDate.getMonth(),
          entryDate.getDate(),
        );
        return entryDateOnly.getTime() === targetDate.getTime();
      })
      .map((item) =>
        CheckIn.create({
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
    await db.delete("checkins", id);
  }
}

/**
 * Singleton instance for convenience
 */
let repositoryInstance: IndexedDBCheckInRepository | null = null;

export function getCheckInRepository(): IndexedDBCheckInRepository {
  if (!repositoryInstance) {
    repositoryInstance = new IndexedDBCheckInRepository();
  }
  return repositoryInstance;
}
