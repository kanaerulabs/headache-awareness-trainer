/**
 * CheckIn Domain Entity
 *
 * Represents a daily check-in entry with business validation rules.
 * This is the core domain model - framework agnostic.
 */

export type CheckInMood = "calm" | "ok" | "stressed" | "anxious" | "avoidant";
export type SleepQuality = "good" | "ok" | "poor";
export type BodyTensionArea = "jaw" | "neck" | "shoulders";
export type PhysicalFactor = "acidity" | "fatigue" | "none";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface CheckInProps {
  id: string;
  timestamp: Date;
  timeOfDay: TimeOfDay;
  mood: CheckInMood;
  bodyTension: BodyTensionArea[];
  sleepQuality: SleepQuality;
  physicalFactors: PhysicalFactor[];
  note?: string;
  isQuickDismiss: boolean;
  linkedHeadacheEntryId?: string;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * CheckIn Entity
 *
 * Encapsulates all business rules for check-in entries:
 * - Mood and sleep quality are required for regular check-ins
 * - Quick dismiss entries use default values
 * - Note max length 500 characters
 */
export class CheckIn {
  readonly id: string;
  readonly timestamp: Date;
  readonly timeOfDay: TimeOfDay;
  readonly mood: CheckInMood;
  readonly bodyTension: BodyTensionArea[];
  readonly sleepQuality: SleepQuality;
  readonly physicalFactors: PhysicalFactor[];
  readonly note?: string;
  readonly isQuickDismiss: boolean;
  readonly linkedHeadacheEntryId?: string;

  private constructor(props: CheckInProps) {
    this.id = props.id;
    this.timestamp = props.timestamp;
    this.timeOfDay = props.timeOfDay;
    this.mood = props.mood;
    this.bodyTension = props.bodyTension;
    this.sleepQuality = props.sleepQuality;
    this.physicalFactors = props.physicalFactors;
    this.note = props.note;
    this.isQuickDismiss = props.isQuickDismiss;
    this.linkedHeadacheEntryId = props.linkedHeadacheEntryId;
  }

  /**
   * Factory method - creates and validates CheckIn
   */
  static create(props: CheckInProps): CheckIn {
    CheckIn.validate(props);
    return new CheckIn(props);
  }

  /**
   * Create a new regular check-in
   */
  static createNew(
    input: Omit<
      CheckInProps,
      "id" | "timestamp" | "timeOfDay" | "isQuickDismiss"
    >,
  ): CheckIn {
    const id = `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    const timeOfDay = CheckIn.determineTimeOfDay();

    return CheckIn.create({
      ...input,
      id,
      timestamp,
      timeOfDay,
      isQuickDismiss: false,
    });
  }

  /**
   * Create a quick dismiss entry ("All good!")
   */
  static createQuickDismiss(): CheckIn {
    const id = `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    const timeOfDay = CheckIn.determineTimeOfDay();

    return new CheckIn({
      id,
      timestamp,
      timeOfDay,
      mood: "calm",
      bodyTension: [],
      sleepQuality: "good",
      physicalFactors: ["none"],
      isQuickDismiss: true,
    });
  }

  /**
   * Determine time of day based on current hour
   */
  static determineTimeOfDay(date: Date = new Date()): TimeOfDay {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      return "morning";
    } else if (hour >= 12 && hour < 17) {
      return "afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "evening";
    } else {
      return "night";
    }
  }

  /**
   * Validation rules for CheckIn
   */
  private static validate(props: CheckInProps): void {
    // Skip validation for quick dismiss entries
    if (props.isQuickDismiss) {
      return;
    }

    // Mood validation (required for regular check-ins)
    const validMoods: CheckInMood[] = [
      "calm",
      "ok",
      "stressed",
      "anxious",
      "avoidant",
    ];
    if (!props.mood || !validMoods.includes(props.mood)) {
      throw new ValidationError("Valid mood is required for check-in", "mood");
    }

    // Sleep quality validation (required for regular check-ins)
    const validSleepQualities: SleepQuality[] = ["good", "ok", "poor"];
    if (
      !props.sleepQuality ||
      !validSleepQualities.includes(props.sleepQuality)
    ) {
      throw new ValidationError(
        "Valid sleep quality is required for check-in",
        "sleepQuality",
      );
    }

    // Body tension validation
    const validTensionAreas: BodyTensionArea[] = ["jaw", "neck", "shoulders"];
    if (props.bodyTension.some((area) => !validTensionAreas.includes(area))) {
      throw new ValidationError("Invalid body tension area", "bodyTension");
    }

    // Physical factors validation
    const validPhysicalFactors: PhysicalFactor[] = [
      "acidity",
      "fatigue",
      "none",
    ];
    if (
      props.physicalFactors.some(
        (factor) => !validPhysicalFactors.includes(factor),
      )
    ) {
      throw new ValidationError("Invalid physical factor", "physicalFactors");
    }

    // Note max length validation
    if (props.note && props.note.length > 500) {
      throw new ValidationError("Note cannot exceed 500 characters", "note");
    }

    // Time of day validation
    const validTimesOfDay: TimeOfDay[] = [
      "morning",
      "afternoon",
      "evening",
      "night",
    ];
    if (!validTimesOfDay.includes(props.timeOfDay)) {
      throw new ValidationError("Invalid time of day", "timeOfDay");
    }
  }

  /**
   * Check if this is a stressed or anxious check-in
   */
  isHighStress(): boolean {
    return this.mood === "stressed" || this.mood === "anxious";
  }

  /**
   * Check if sleep was poor
   */
  hadPoorSleep(): boolean {
    return this.sleepQuality === "poor";
  }

  /**
   * Check if has body tension
   */
  hasBodyTension(): boolean {
    return this.bodyTension.length > 0;
  }

  /**
   * Get mood label for display
   */
  getMoodLabel(): string {
    const labels: Record<CheckInMood, string> = {
      calm: "Calm",
      ok: "OK",
      stressed: "Stressed",
      anxious: "Anxious",
      avoidant: "Avoidant",
    };
    return labels[this.mood];
  }

  /**
   * Link to a headache entry for correlation
   */
  withLinkedHeadacheEntry(headacheEntryId: string): CheckIn {
    return new CheckIn({
      ...this.toPlainObject(),
      linkedHeadacheEntryId: headacheEntryId,
    });
  }

  /**
   * Convert to plain object for persistence
   */
  toPlainObject(): CheckInProps {
    return {
      id: this.id,
      timestamp: this.timestamp,
      timeOfDay: this.timeOfDay,
      mood: this.mood,
      bodyTension: this.bodyTension,
      sleepQuality: this.sleepQuality,
      physicalFactors: this.physicalFactors,
      note: this.note,
      isQuickDismiss: this.isQuickDismiss,
      linkedHeadacheEntryId: this.linkedHeadacheEntryId,
    };
  }
}
