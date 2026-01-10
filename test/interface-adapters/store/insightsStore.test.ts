import { useInsightsStore } from "@/interface-adapters/store/insightsStore";
import {
  useLoggingStore,
  HeadacheEntry,
} from "@/interface-adapters/store/loggingStore";
import {
  useCheckInStore,
  CheckInEntry,
} from "@/interface-adapters/store/checkinStore";

// Mock the logging store
jest.mock("@/interface-adapters/store/loggingStore", () => ({
  useLoggingStore: {
    getState: jest.fn(() => ({
      metadata: {
        registrationDate: new Date("2025-01-01"),
        firstEntryDate: new Date("2025-01-05"),
        totalEntries: 0,
      },
      getAllEntries: jest.fn().mockResolvedValue([]),
    })),
  },
}));

// Mock the check-in store
jest.mock("@/interface-adapters/store/checkinStore", () => ({
  useCheckInStore: {
    getState: jest.fn(() => ({
      getAllCheckIns: jest.fn().mockResolvedValue([]),
    })),
  },
}));

describe("insightsStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useInsightsStore.setState({
      correlations: [],
      personalInsights: [],
      generalInsights: [],
      isLoading: false,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useInsightsStore.getState();

      expect(state.correlations).toEqual([]);
      expect(state.personalInsights).toEqual([]);
      expect(state.generalInsights).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("getCalendarData", () => {
    it("should return empty array when no entries exist", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(startDate, endDate);

      // Assert
      expect(calendarData).toEqual([]);
    });

    it("should return calendar data with single headache per day", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-05");

      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 3,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-04T14:00:00Z"),
          intensity: 5,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(startDate, endDate);

      // Assert
      expect(calendarData).toHaveLength(2);
      expect(calendarData[0].date).toEqual(new Date("2025-01-02"));
      expect(calendarData[0].headacheCount).toBe(1);
      expect(calendarData[0].maxIntensity).toBe(3);
      expect(calendarData[1].date).toEqual(new Date("2025-01-04"));
      expect(calendarData[1].maxIntensity).toBe(5);
    });

    it("should calculate max intensity from multiple headaches on same day", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-05");

      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 3,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-02T14:00:00Z"),
          intensity: 5,
        },
        {
          id: "h3",
          timestamp: new Date("2025-01-02T18:00:00Z"),
          intensity: 2,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(startDate, endDate);

      // Assert
      expect(calendarData).toHaveLength(1);
      expect(calendarData[0].headacheCount).toBe(3);
      expect(calendarData[0].maxIntensity).toBe(5);
    });

    it("should combine headache and checkin entries for same day", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-05");

      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 3,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-02T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(startDate, endDate);

      // Assert
      expect(calendarData).toHaveLength(1);
      expect(calendarData[0].headacheCount).toBe(1);
      expect(calendarData[0].checkinCount).toBe(1);
      expect(calendarData[0].entries).toHaveLength(2);
      expect(calendarData[0].entries).toContainEqual({
        type: "headache",
        id: "h1",
      });
      expect(calendarData[0].entries).toContainEqual({
        type: "checkin",
        id: "c1",
      });
    });

    it("should filter entries by date range", async () => {
      // Arrange
      const startDate = new Date("2025-01-05");
      const endDate = new Date("2025-01-10");

      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"), // Before range
          intensity: 3,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-07T10:00:00Z"), // Within range
          intensity: 4,
        },
        {
          id: "h3",
          timestamp: new Date("2025-01-15T10:00:00Z"), // After range
          intensity: 5,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(startDate, endDate);

      // Assert
      expect(calendarData).toHaveLength(1);
      expect(calendarData[0].date).toEqual(new Date("2025-01-07"));
    });

    it("should return 0 maxIntensity for days with only check-ins", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-05");

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-02T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(startDate, endDate);

      // Assert
      expect(calendarData).toHaveLength(1);
      expect(calendarData[0].headacheCount).toBe(0);
      expect(calendarData[0].maxIntensity).toBe(0);
      expect(calendarData[0].checkinCount).toBe(1);
    });
  });

  describe("calculateCorrelations", () => {
    it("should return empty array when insufficient data", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const correlations = await useInsightsStore
        .getState()
        .calculateCorrelations();

      // Assert
      expect(correlations).toEqual([]);
    });

    it("should calculate sleep quality correlation", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 4,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-03T10:00:00Z"),
          intensity: 5,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-02T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "poor" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
        {
          id: "c2",
          timestamp: new Date("2025-01-03T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "poor" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const correlations = await useInsightsStore
        .getState()
        .calculateCorrelations();

      // Assert
      const sleepCorrelation = correlations.find((c) => c.factor === "sleep");
      expect(sleepCorrelation).toBeDefined();
      expect(sleepCorrelation?.strength).toBeGreaterThanOrEqual(0);
      expect(sleepCorrelation?.strength).toBeLessThanOrEqual(100);
      expect(sleepCorrelation?.trend).toBe("negative");
      expect(sleepCorrelation?.description).toBeDefined();
    });

    it("should calculate stress correlation", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 5,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-02T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "stressed" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const correlations = await useInsightsStore
        .getState()
        .calculateCorrelations();

      // Assert
      const stressCorrelation = correlations.find((c) => c.factor === "stress");
      expect(stressCorrelation).toBeDefined();
      expect(stressCorrelation?.trend).toBe("positive");
    });

    it("should calculate jaw tension correlation", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 4,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-02T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: ["jaw", "neck"],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const correlations = await useInsightsStore
        .getState()
        .calculateCorrelations();

      // Assert
      const jawTensionCorrelation = correlations.find(
        (c) => c.factor === "jawTension",
      );
      expect(jawTensionCorrelation).toBeDefined();
      expect(jawTensionCorrelation?.trend).toBe("positive");
    });

    it("should return strength within 0-100 range", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 4,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-02T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "stressed" as const,
          bodyTension: ["jaw"],
          sleepQuality: "poor" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const correlations = await useInsightsStore
        .getState()
        .calculateCorrelations();

      // Assert
      correlations.forEach((correlation) => {
        expect(correlation.strength).toBeGreaterThanOrEqual(0);
        expect(correlation.strength).toBeLessThanOrEqual(100);
      });
    });

    it("should determine correct trend direction", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-02T10:00:00Z"),
          intensity: 2,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-02T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "calm" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const correlations = await useInsightsStore
        .getState()
        .calculateCorrelations();

      // Assert
      correlations.forEach((correlation) => {
        expect(["positive", "negative", "neutral"]).toContain(
          correlation.trend,
        );
      });
    });
  });

  describe("getWeeklyTrends", () => {
    beforeEach(() => {
      const now = new Date("2025-01-15T12:00:00Z");
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should return weekly trends for 30-day filter", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-01T10:00:00Z"),
          intensity: 3,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-08T10:00:00Z"),
          intensity: 4,
        },
        {
          id: "h3",
          timestamp: new Date("2025-01-14T10:00:00Z"),
          intensity: 5,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const trends = await useInsightsStore.getState().getWeeklyTrends(30);

      // Assert
      expect(trends.length).toBeGreaterThan(0);
      trends.forEach((trend) => {
        expect(trend.weekStart).toBeInstanceOf(Date);
        expect(trend.weekEnd).toBeInstanceOf(Date);
        expect(trend.headacheCount).toBeGreaterThanOrEqual(0);
        expect(trend.averageIntensity).toBeGreaterThanOrEqual(0);
      });
    });

    it("should return weekly trends for 90-day filter", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2024-11-01T10:00:00Z"),
          intensity: 3,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const trends = await useInsightsStore.getState().getWeeklyTrends(90);

      // Assert
      expect(trends).toBeDefined();
    });

    it("should return weekly trends for all time filter", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2024-01-01T10:00:00Z"),
          intensity: 3,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const trends = await useInsightsStore.getState().getWeeklyTrends("all");

      // Assert
      expect(trends).toBeDefined();
    });

    it("should handle weeks with no data", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const trends = await useInsightsStore.getState().getWeeklyTrends(30);

      // Assert
      expect(trends).toBeDefined();
      trends.forEach((trend) => {
        expect(trend.headacheCount).toBe(0);
        expect(trend.averageIntensity).toBe(0);
      });
    });

    it("should correctly calculate average intensity per week", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-06T10:00:00Z"),
          intensity: 2,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-07T10:00:00Z"),
          intensity: 4,
        },
        {
          id: "h3",
          timestamp: new Date("2025-01-08T10:00:00Z"),
          intensity: 3,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const trends = await useInsightsStore.getState().getWeeklyTrends(30);

      // Assert
      const weekWithData = trends.find((trend) => trend.headacheCount > 0);
      expect(weekWithData).toBeDefined();
      expect(weekWithData?.averageIntensity).toBe(3); // (2+4+3)/3 = 3
    });

    it("should include checkin counts in weekly trends", async () => {
      // Arrange
      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-06T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const trends = await useInsightsStore.getState().getWeeklyTrends(30);

      // Assert
      const weekWithData = trends.find((trend) => trend.checkinCount > 0);
      expect(weekWithData).toBeDefined();
      expect(weekWithData?.checkinCount).toBe(1);
    });
  });

  describe("getTimeOfDayAnalysis", () => {
    it("should return empty array when no data", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      // Act
      const timeOfDayData = await useInsightsStore
        .getState()
        .getTimeOfDayAnalysis();

      // Assert
      expect(timeOfDayData).toEqual([]);
    });

    it("should categorize headaches by time of day", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-01T08:00:00Z"), // morning
          intensity: 3,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-01T14:00:00Z"), // afternoon
          intensity: 4,
        },
        {
          id: "h3",
          timestamp: new Date("2025-01-01T19:00:00Z"), // evening
          intensity: 5,
        },
        {
          id: "h4",
          timestamp: new Date("2025-01-01T23:00:00Z"), // night
          intensity: 2,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      // Act
      const timeOfDayData = await useInsightsStore
        .getState()
        .getTimeOfDayAnalysis();

      // Assert
      expect(timeOfDayData).toHaveLength(4);
      const morning = timeOfDayData.find((t) => t.timeOfDay === "morning");
      const afternoon = timeOfDayData.find((t) => t.timeOfDay === "afternoon");
      const evening = timeOfDayData.find((t) => t.timeOfDay === "evening");
      const night = timeOfDayData.find((t) => t.timeOfDay === "night");

      expect(morning?.count).toBe(1);
      expect(afternoon?.count).toBe(1);
      expect(evening?.count).toBe(1);
      expect(night?.count).toBe(1);
    });

    it("should return percentages summing to 100", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-01T08:00:00Z"),
          intensity: 3,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-01T14:00:00Z"),
          intensity: 4,
        },
        {
          id: "h3",
          timestamp: new Date("2025-01-01T19:00:00Z"),
          intensity: 5,
        },
        {
          id: "h4",
          timestamp: new Date("2025-01-01T23:00:00Z"),
          intensity: 2,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      // Act
      const timeOfDayData = await useInsightsStore
        .getState()
        .getTimeOfDayAnalysis();

      // Assert
      const totalPercentage = timeOfDayData.reduce(
        (sum, t) => sum + t.percentage,
        0,
      );
      expect(totalPercentage).toBe(100);
    });

    it("should correctly categorize by hour ranges", async () => {
      // Arrange - morning 5-12, afternoon 12-17, evening 17-21, night 21-5
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-01T05:00:00Z"), // morning
          intensity: 3,
        },
        {
          id: "h2",
          timestamp: new Date("2025-01-01T12:00:00Z"), // afternoon (exactly 12)
          intensity: 4,
        },
        {
          id: "h3",
          timestamp: new Date("2025-01-01T17:00:00Z"), // evening (exactly 17)
          intensity: 5,
        },
        {
          id: "h4",
          timestamp: new Date("2025-01-01T21:00:00Z"), // night (exactly 21)
          intensity: 2,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      // Act
      const timeOfDayData = await useInsightsStore
        .getState()
        .getTimeOfDayAnalysis();

      // Assert
      const morning = timeOfDayData.find((t) => t.timeOfDay === "morning");
      const afternoon = timeOfDayData.find((t) => t.timeOfDay === "afternoon");
      const evening = timeOfDayData.find((t) => t.timeOfDay === "evening");
      const night = timeOfDayData.find((t) => t.timeOfDay === "night");

      expect(morning?.count).toBe(1);
      expect(afternoon?.count).toBe(1);
      expect(evening?.count).toBe(1);
      expect(night?.count).toBe(1);
    });
  });

  describe("insights", () => {
    describe("generalInsights", () => {
      it("should have general insights available on Day 1", () => {
        // Arrange
        (useLoggingStore.getState as any).mockReturnValue({
          metadata: {
            registrationDate: new Date("2025-01-15"),
            firstEntryDate: new Date("2025-01-15"),
            totalEntries: 1,
          },
        });

        // Act
        useInsightsStore.getState().checkInsightUnlocks();
        const state = useInsightsStore.getState();

        // Assert
        expect(state.generalInsights.length).toBeGreaterThan(0);
        state.generalInsights.forEach((insight) => {
          expect(insight.isPersonal).toBe(false);
          expect(insight.isUnlocked).toBe(true);
        });
      });

      it("should have required fields for general insights", () => {
        // Arrange
        useInsightsStore.getState().checkInsightUnlocks();

        // Act
        const state = useInsightsStore.getState();

        // Assert
        state.generalInsights.forEach((insight) => {
          expect(insight.id).toBeDefined();
          expect(insight.title).toBeDefined();
          expect(insight.description).toBeDefined();
          expect(["pattern", "trigger", "tip", "achievement"]).toContain(
            insight.category,
          );
          expect(insight.isPersonal).toBe(false);
        });
      });
    });

    describe("personalInsights", () => {
      it("should be locked initially", () => {
        // Arrange
        (useLoggingStore.getState as any).mockReturnValue({
          metadata: {
            registrationDate: new Date("2025-01-15"),
            firstEntryDate: new Date("2025-01-15"),
            totalEntries: 5,
          },
        });

        const now = new Date("2025-01-15");
        jest.useFakeTimers();
        jest.setSystemTime(now);

        // Act
        useInsightsStore.getState().checkInsightUnlocks();
        const state = useInsightsStore.getState();

        // Assert
        const lockedInsights = state.personalInsights.filter(
          (i) => !i.isUnlocked,
        );
        expect(lockedInsights.length).toBeGreaterThan(0);

        jest.useRealTimers();
      });

      it("should unlock personal insights after Week 2 (14+ days)", () => {
        // Arrange
        const fifteenDaysAgo = new Date("2025-01-01");
        (useLoggingStore.getState as any).mockReturnValue({
          metadata: {
            registrationDate: fifteenDaysAgo,
            firstEntryDate: fifteenDaysAgo,
            totalEntries: 20,
          },
        });

        const now = new Date("2025-01-16");
        jest.useFakeTimers();
        jest.setSystemTime(now);

        // Act
        useInsightsStore.getState().checkInsightUnlocks();
        const state = useInsightsStore.getState();

        // Assert
        const unlockedPersonalInsights = state.personalInsights.filter(
          (i) => i.isUnlocked,
        );
        expect(unlockedPersonalInsights.length).toBeGreaterThan(0);

        jest.useRealTimers();
      });

      it("should not unlock personal insights before Week 2", () => {
        // Arrange
        const tenDaysAgo = new Date("2025-01-05");
        (useLoggingStore.getState as any).mockReturnValue({
          metadata: {
            registrationDate: tenDaysAgo,
            firstEntryDate: tenDaysAgo,
            totalEntries: 10,
          },
        });

        const now = new Date("2025-01-15");
        jest.useFakeTimers();
        jest.setSystemTime(now);

        // Act
        useInsightsStore.getState().checkInsightUnlocks();
        const state = useInsightsStore.getState();

        // Assert
        const unlockedPersonalInsights = state.personalInsights.filter(
          (i) => i.isUnlocked,
        );
        expect(unlockedPersonalInsights.length).toBe(0);

        jest.useRealTimers();
      });

      it("should update unlock status when checkInsightUnlocks is called", () => {
        // Arrange
        const twentyDaysAgo = new Date("2024-12-26");
        (useLoggingStore.getState as any).mockReturnValue({
          metadata: {
            registrationDate: twentyDaysAgo,
            firstEntryDate: twentyDaysAgo,
            totalEntries: 30,
          },
        });

        const now = new Date("2025-01-15");
        jest.useFakeTimers();
        jest.setSystemTime(now);

        // Initially locked
        useInsightsStore.setState({
          personalInsights: [
            {
              id: "1",
              title: "Test insight",
              description: "Test",
              category: "pattern",
              isPersonal: true,
              isUnlocked: false,
              unlockCondition: "Week 2+",
            },
          ],
        });

        // Act
        useInsightsStore.getState().checkInsightUnlocks();
        const state = useInsightsStore.getState();

        // Assert
        expect(state.personalInsights[0].isUnlocked).toBe(true);

        jest.useRealTimers();
      });

      it("should have unlockCondition field for locked insights", () => {
        // Arrange
        (useLoggingStore.getState as any).mockReturnValue({
          metadata: {
            registrationDate: new Date("2025-01-15"),
            firstEntryDate: new Date("2025-01-15"),
            totalEntries: 5,
          },
        });

        // Act
        useInsightsStore.getState().checkInsightUnlocks();
        const state = useInsightsStore.getState();

        // Assert
        const lockedInsights = state.personalInsights.filter(
          (i) => !i.isUnlocked,
        );
        lockedInsights.forEach((insight) => {
          expect(insight.unlockCondition).toBeDefined();
        });
      });

      it("should have required fields for personal insights", () => {
        // Arrange
        useInsightsStore.getState().checkInsightUnlocks();

        // Act
        const state = useInsightsStore.getState();

        // Assert
        state.personalInsights.forEach((insight) => {
          expect(insight.id).toBeDefined();
          expect(insight.title).toBeDefined();
          expect(insight.description).toBeDefined();
          expect(["pattern", "trigger", "tip", "achievement"]).toContain(
            insight.category,
          );
          expect(insight.isPersonal).toBe(true);
        });
      });
    });
  });

  describe("refreshInsights", () => {
    it("should update all computed values", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "h1",
          timestamp: new Date("2025-01-10T10:00:00Z"),
          intensity: 3,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-10T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: {
          registrationDate: new Date("2025-01-01"),
          firstEntryDate: new Date("2025-01-05"),
          totalEntries: 10,
        },
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      await useInsightsStore.getState().refreshInsights();

      // Assert
      const state = useInsightsStore.getState();
      expect(state.correlations).toBeDefined();
      expect(state.isLoading).toBe(false);
    });

    it("should set isLoading to true during refresh", async () => {
      // Arrange
      let loadingState = false;
      const unsubscribe = useInsightsStore.subscribe((state) => {
        if (state.isLoading) {
          loadingState = true;
        }
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: {
          registrationDate: new Date("2025-01-01"),
          firstEntryDate: new Date("2025-01-05"),
          totalEntries: 10,
        },
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const refreshPromise = useInsightsStore.getState().refreshInsights();

      // Assert - loading should be true immediately
      expect(useInsightsStore.getState().isLoading).toBe(true);

      await refreshPromise;
      expect(useInsightsStore.getState().isLoading).toBe(false);
      expect(loadingState).toBe(true);

      unsubscribe();
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        metadata: {
          registrationDate: new Date("2025-01-01"),
          firstEntryDate: new Date("2025-01-05"),
          totalEntries: 10,
        },
        getAllEntries: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      await useInsightsStore.getState().refreshInsights();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(useInsightsStore.getState().isLoading).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("error handling", () => {
    it("should handle missing logging store data", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        metadata: null,
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      await useInsightsStore.getState().refreshInsights();

      // Assert - should not throw
      expect(useInsightsStore.getState().isLoading).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it("should handle missing check-in store data", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        metadata: {
          registrationDate: new Date("2025-01-01"),
          firstEntryDate: new Date("2025-01-05"),
          totalEntries: 10,
        },
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest
          .fn()
          .mockRejectedValue(new Error("DB not initialized")),
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      await useInsightsStore.getState().refreshInsights();

      // Assert - should not throw
      expect(useInsightsStore.getState().isLoading).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle concurrent refresh calls", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        metadata: {
          registrationDate: new Date("2025-01-01"),
          firstEntryDate: new Date("2025-01-05"),
          totalEntries: 10,
        },
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const promise1 = useInsightsStore.getState().refreshInsights();
      const promise2 = useInsightsStore.getState().refreshInsights();

      // Assert - should not throw
      await expect(Promise.all([promise1, promise2])).resolves.toBeDefined();
    });

    it("should handle date range edge cases", async () => {
      // Arrange - same start and end date
      const sameDate = new Date("2025-01-15");

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(sameDate, sameDate);

      // Assert - should handle gracefully
      expect(calendarData).toBeDefined();
    });

    it("should handle end date before start date", async () => {
      // Arrange
      const startDate = new Date("2025-01-15");
      const endDate = new Date("2025-01-01");

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const calendarData = await useInsightsStore
        .getState()
        .getCalendarData(startDate, endDate);

      // Assert - should return empty or handle gracefully
      expect(calendarData).toBeDefined();
    });
  });
});
