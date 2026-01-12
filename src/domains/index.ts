/**
 * Domain Entities Index
 *
 * Export all domain entities and value objects.
 */

// Headache Entry Domain
export {
  HeadacheEntry,
  ValidationError as HeadacheValidationError,
  type HeadacheEntryProps,
  type HeadacheType,
  type MoodType,
  type IntensityLevel,
  type HeadacheLocation,
} from "./headache-entry/headache-entry.entity";

// CheckIn Domain
export {
  CheckIn,
  ValidationError as CheckInValidationError,
  type CheckInProps,
  type CheckInMood,
  type SleepQuality,
  type BodyTensionArea,
  type PhysicalFactor,
  type TimeOfDay,
} from "./checkin/checkin.entity";

// Streak Value Object
export {
  StreakCalculator,
  type StreakData,
  type DailyActivity,
} from "./streak/streak.entity";
