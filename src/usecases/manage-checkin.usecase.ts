/**
 * Manage CheckIn Use Cases
 *
 * Handles the business logic for check-in operations.
 */

import {
  CheckIn,
  CheckInProps,
  CheckInMood,
  SleepQuality,
  BodyTensionArea,
  PhysicalFactor,
} from "../domains/checkin/checkin.entity";

/**
 * Input port for creating a check-in
 */
export interface CreateCheckInInput {
  mood: CheckInMood;
  sleepQuality: SleepQuality;
  bodyTension: BodyTensionArea[];
  physicalFactors: PhysicalFactor[];
  note?: string;
  linkedHeadacheEntryId?: string;
}

/**
 * Output port - result of check-in
 */
export interface CreateCheckInOutput {
  entry: CheckInProps;
  isHighStress: boolean;
  hadPoorSleep: boolean;
  hasBodyTension: boolean;
}

/**
 * Repository interface for check-ins
 */
export interface CheckInRepository {
  save(entry: CheckIn): Promise<void>;
  findById(id: string): Promise<CheckIn | null>;
  findRecent(limit: number): Promise<CheckIn[]>;
  findAll(): Promise<CheckIn[]>;
  findByDate(date: Date): Promise<CheckIn[]>;
  delete(id: string): Promise<void>;
  update(entry: CheckIn): Promise<void>;
}

/**
 * Create Check-In Use Case
 */
export class CreateCheckInUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  async execute(input: CreateCheckInInput): Promise<CreateCheckInOutput> {
    // Create domain entity (validates input)
    const entry = CheckIn.createNew(input);

    // Persist to repository
    await this.repository.save(entry);

    // Return output with computed properties
    return {
      entry: entry.toPlainObject(),
      isHighStress: entry.isHighStress(),
      hadPoorSleep: entry.hadPoorSleep(),
      hasBodyTension: entry.hasBodyTension(),
    };
  }
}

/**
 * Quick Dismiss Use Case ("All good!")
 */
export class QuickDismissUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  async execute(): Promise<CheckInProps> {
    const entry = CheckIn.createQuickDismiss();
    await this.repository.save(entry);
    return entry.toPlainObject();
  }
}

/**
 * Get Recent Check-Ins Use Case
 */
export class GetRecentCheckInsUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  async execute(limit: number = 5): Promise<CheckInProps[]> {
    const entries = await this.repository.findRecent(limit);
    return entries.map((entry) => entry.toPlainObject());
  }
}

/**
 * Link Check-In to Headache Use Case
 */
export class LinkCheckInToHeadacheUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  async execute(checkInId: string, headacheEntryId: string): Promise<void> {
    const checkIn = await this.repository.findById(checkInId);
    if (!checkIn) {
      throw new Error(`Check-in with id ${checkInId} not found`);
    }

    const linkedCheckIn = checkIn.withLinkedHeadacheEntry(headacheEntryId);
    await this.repository.update(linkedCheckIn);
  }
}

/**
 * Delete Check-In Use Case
 */
export class DeleteCheckInUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
