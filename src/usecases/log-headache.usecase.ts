/**
 * Log Headache Use Case
 *
 * Handles the business logic for logging headache entries.
 * This use case orchestrates domain entities and repository operations.
 */

import {
  HeadacheEntry,
  HeadacheEntryProps,
  IntensityLevel,
  HeadacheType,
  MoodType,
  HeadacheLocation,
} from "../domains/headache-entry/headache-entry.entity";

/**
 * Input port for logging a headache
 */
export interface LogHeadacheInput {
  intensity: IntensityLevel;
  note?: string;
  naturalLanguageInput?: string;
  headacheType?: HeadacheType;
  location?: HeadacheLocation;
  bodyTension?: number;
  mood?: MoodType;
  stressLevel?: number;
  contextTags?: string[];
}

/**
 * Output port - result of logging
 */
export interface LogHeadacheOutput {
  entry: HeadacheEntryProps;
  isSevere: boolean;
  intensityLabel: string;
}

/**
 * Repository interface for headache entries
 */
export interface HeadacheEntryRepository {
  save(entry: HeadacheEntry): Promise<void>;
  findById(id: string): Promise<HeadacheEntry | null>;
  findRecent(limit: number): Promise<HeadacheEntry[]>;
  findAll(): Promise<HeadacheEntry[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<HeadacheEntry[]>;
  delete(id: string): Promise<void>;
}

/**
 * Log Headache Use Case
 *
 * Creates a new headache entry with validation and persistence.
 */
export class LogHeadacheUseCase {
  constructor(private readonly repository: HeadacheEntryRepository) {}

  /**
   * Execute the use case
   */
  async execute(input: LogHeadacheInput): Promise<LogHeadacheOutput> {
    // Create domain entity (validates input)
    const entry = HeadacheEntry.createNew(input);

    // Persist to repository
    await this.repository.save(entry);

    // Return output
    return {
      entry: entry.toPlainObject(),
      isSevere: entry.isSevere(),
      intensityLabel: entry.getIntensityLabel(),
    };
  }
}

/**
 * Get Recent Headaches Use Case
 */
export class GetRecentHeadachesUseCase {
  constructor(private readonly repository: HeadacheEntryRepository) {}

  async execute(limit: number = 5): Promise<HeadacheEntryProps[]> {
    const entries = await this.repository.findRecent(limit);
    return entries.map((entry) => entry.toPlainObject());
  }
}

/**
 * Delete Headache Use Case
 */
export class DeleteHeadacheUseCase {
  constructor(private readonly repository: HeadacheEntryRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
