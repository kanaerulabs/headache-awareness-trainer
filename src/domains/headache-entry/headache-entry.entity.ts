/**
 * Headache Entry Domain Entity
 *
 * Represents a headache log entry with business validation rules.
 * This is the core domain model - framework agnostic.
 */

export type HeadacheType =
  | "tension"
  | "migraine"
  | "cluster"
  | "sinus"
  | "other";

export type MoodType = "great" | "good" | "neutral" | "low" | "bad";

export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

export interface HeadacheLocation {
  head: string[];
  body: string[];
}

export interface HeadacheEntryProps {
  id: string;
  timestamp: Date;
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
 * HeadacheEntry Entity
 *
 * Encapsulates all business rules for headache entries:
 * - Intensity must be 1-5
 * - Body tension must be 0-10
 * - Stress level must be 0-10
 * - Note max length 500 characters
 */
export class HeadacheEntry {
  readonly id: string;
  readonly timestamp: Date;
  readonly intensity: IntensityLevel;
  readonly note?: string;
  readonly naturalLanguageInput?: string;
  readonly headacheType?: HeadacheType;
  readonly location?: HeadacheLocation;
  readonly bodyTension?: number;
  readonly mood?: MoodType;
  readonly stressLevel?: number;
  readonly contextTags: string[];

  private constructor(props: HeadacheEntryProps) {
    this.id = props.id;
    this.timestamp = props.timestamp;
    this.intensity = props.intensity;
    this.note = props.note;
    this.naturalLanguageInput = props.naturalLanguageInput;
    this.headacheType = props.headacheType;
    this.location = props.location;
    this.bodyTension = props.bodyTension;
    this.mood = props.mood;
    this.stressLevel = props.stressLevel;
    this.contextTags = props.contextTags || [];
  }

  /**
   * Factory method - creates and validates HeadacheEntry
   */
  static create(props: HeadacheEntryProps): HeadacheEntry {
    HeadacheEntry.validate(props);
    return new HeadacheEntry(props);
  }

  /**
   * Create from partial input (for new entries)
   */
  static createNew(input: Omit<HeadacheEntryProps, "id" | "timestamp">): HeadacheEntry {
    const id = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    return HeadacheEntry.create({
      ...input,
      id,
      timestamp,
    });
  }

  /**
   * Validation rules for HeadacheEntry
   */
  private static validate(props: HeadacheEntryProps): void {
    // Intensity validation (required, 1-5)
    if (props.intensity === undefined || props.intensity === null) {
      throw new ValidationError("Intensity is required", "intensity");
    }
    if (props.intensity < 1 || props.intensity > 5) {
      throw new ValidationError(
        "Intensity must be between 1 and 5",
        "intensity",
      );
    }

    // Body tension validation (0-10 if provided)
    if (props.bodyTension !== undefined) {
      if (props.bodyTension < 0 || props.bodyTension > 10) {
        throw new ValidationError(
          "Body tension must be between 0 and 10",
          "bodyTension",
        );
      }
    }

    // Stress level validation (0-10 if provided)
    if (props.stressLevel !== undefined) {
      if (props.stressLevel < 0 || props.stressLevel > 10) {
        throw new ValidationError(
          "Stress level must be between 0 and 10",
          "stressLevel",
        );
      }
    }

    // Note max length validation
    if (props.note && props.note.length > 500) {
      throw new ValidationError(
        "Note cannot exceed 500 characters",
        "note",
      );
    }

    // Headache type validation
    if (props.headacheType) {
      const validTypes: HeadacheType[] = [
        "tension",
        "migraine",
        "cluster",
        "sinus",
        "other",
      ];
      if (!validTypes.includes(props.headacheType)) {
        throw new ValidationError(
          "Invalid headache type",
          "headacheType",
        );
      }
    }

    // Mood validation
    if (props.mood) {
      const validMoods: MoodType[] = ["great", "good", "neutral", "low", "bad"];
      if (!validMoods.includes(props.mood)) {
        throw new ValidationError("Invalid mood type", "mood");
      }
    }
  }

  /**
   * Get intensity label for display
   */
  getIntensityLabel(): string {
    const labels: Record<IntensityLevel, string> = {
      1: "Minimal",
      2: "Mild",
      3: "Moderate",
      4: "Severe",
      5: "Extreme",
    };
    return labels[this.intensity];
  }

  /**
   * Check if this is a severe headache (4-5)
   */
  isSevere(): boolean {
    return this.intensity >= 4;
  }

  /**
   * Convert to plain object for persistence
   */
  toPlainObject(): HeadacheEntryProps {
    return {
      id: this.id,
      timestamp: this.timestamp,
      intensity: this.intensity,
      note: this.note,
      naturalLanguageInput: this.naturalLanguageInput,
      headacheType: this.headacheType,
      location: this.location,
      bodyTension: this.bodyTension,
      mood: this.mood,
      stressLevel: this.stressLevel,
      contextTags: this.contextTags,
    };
  }
}
