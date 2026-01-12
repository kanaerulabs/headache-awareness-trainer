/**
 * Use Cases Index
 *
 * Export all use cases and their interfaces.
 */

// Headache Use Cases
export {
  LogHeadacheUseCase,
  GetRecentHeadachesUseCase,
  DeleteHeadacheUseCase,
  type LogHeadacheInput,
  type LogHeadacheOutput,
  type HeadacheEntryRepository,
} from "./log-headache.usecase";

// CheckIn Use Cases
export {
  CreateCheckInUseCase,
  QuickDismissUseCase,
  GetRecentCheckInsUseCase,
  LinkCheckInToHeadacheUseCase,
  DeleteCheckInUseCase,
  type CreateCheckInInput,
  type CreateCheckInOutput,
  type CheckInRepository,
} from "./manage-checkin.usecase";

// Dashboard Use Cases
export {
  GetDashboardDataUseCase,
  type DashboardData,
  type WeeklySummary,
  type TrendDirection,
} from "./get-dashboard-data.usecase";

// Insights/Analysis Use Cases
export {
  CalculateCorrelationsUseCase,
  GetWeeklyTrendsUseCase,
  GetTimeOfDayAnalysisUseCase,
  GetCalendarDataUseCase,
  CheckInsightUnlocksUseCase,
  type CorrelationResult,
  type WeeklyTrendData,
  type TimeOfDayData,
  type CalendarDayData,
  type Insight,
} from "./analyze-insights.usecase";
