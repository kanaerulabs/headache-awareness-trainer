import { useDashboardStore } from "@/interface-adapters/store/dashboardStore";
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
        currentStreak: 0,
        registrationDate: new Date("2025-01-01"),
        firstEntryDate: new Date("2025-01-01"),
        totalEntries: 0,
      },
      getAllEntries: jest.fn().mockResolvedValue([]),
      getRecentEntries: jest.fn().mockResolvedValue([]),
    })),
  },
}));

// Mock the check-in store
jest.mock("@/interface-adapters/store/checkinStore", () => ({
  useCheckInStore: {
    getState: jest.fn(() => ({
      getAllCheckIns: jest.fn().mockResolvedValue([]),
      getRecentCheckIns: jest.fn().mockResolvedValue([]),
    })),
  },
}));

describe("dashboardStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useDashboardStore.setState({
      currentStreak: 0,
      thisWeekHeadaches: 0,
      thisWeekCheckins: 0,
      trend: "stable",
      currentInsight: "Welcome! Start tracking to see your progress.",
      recentEntries: [],
      isLoading: false,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useDashboardStore.getState();

      expect(state.currentStreak).toBe(0);
      expect(state.thisWeekHeadaches).toBe(0);
      expect(state.thisWeekCheckins).toBe(0);
      expect(state.trend).toBe("stable");
      expect(state.currentInsight).toBe(
        "Welcome! Start tracking to see your progress.",
      );
      expect(state.recentEntries).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("refreshDashboard", () => {
    it("should update all dashboard data", async () => {
      // Arrange
      const now = new Date("2025-01-10T12:00:00Z");
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const mockHeadacheEntries: HeadacheEntry[] = [
        {
          id: "1",
          timestamp: new Date("2025-01-08T10:00:00Z"), // This week (Wed)
          intensity: 3,
        },
        {
          id: "2",
          timestamp: new Date("2025-01-09T14:00:00Z"), // This week (Thu)
          intensity: 4,
        },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-08T08:00:00Z"), // This week
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
          currentStreak: 5,
          registrationDate: new Date("2025-01-01"),
          firstEntryDate: new Date("2025-01-05"),
          totalEntries: 10,
        },
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
        getRecentEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
        getRecentCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      await useDashboardStore.getState().refreshDashboard();

      // Assert
      const state = useDashboardStore.getState();
      expect(state.currentStreak).toBe(5);
      expect(state.thisWeekHeadaches).toBe(2);
      expect(state.thisWeekCheckins).toBe(1);
      expect(state.isLoading).toBe(false);
      expect(state.trend).toBeDefined();
      expect(state.currentInsight).toBeDefined();
      expect(state.recentEntries).toBeDefined();

      jest.useRealTimers();
    });

    it("should set isLoading to true during refresh", async () => {
      // Arrange
      let loadingState = false;
      const unsubscribe = useDashboardStore.subscribe((state) => {
        if (state.isLoading) {
          loadingState = true;
        }
      });

      // Act
      const refreshPromise = useDashboardStore.getState().refreshDashboard();

      // Assert - loading should be true immediately
      expect(useDashboardStore.getState().isLoading).toBe(true);

      await refreshPromise;
      expect(useDashboardStore.getState().isLoading).toBe(false);
      expect(loadingState).toBe(true);

      unsubscribe();
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { currentStreak: 0 },
        getAllEntries: jest.fn().mockRejectedValue(new Error("Database error")),
        getRecentEntries: jest.fn().mockResolvedValue([]),
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      await useDashboardStore.getState().refreshDashboard();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(useDashboardStore.getState().isLoading).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("calculateTrend", () => {
    beforeEach(() => {
      const now = new Date("2025-01-10T12:00:00Z"); // Friday
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "improving" when this week has 20%+ fewer headaches', async () => {
      // Arrange - Last week: 5 headaches, This week: 3 headaches (40% decrease)
      const mockHeadacheEntries: HeadacheEntry[] = [
        // Last week (Jan 1-5, Wed-Sun)
        { id: "1", timestamp: new Date("2025-01-01T10:00:00Z"), intensity: 3 },
        { id: "2", timestamp: new Date("2025-01-02T10:00:00Z"), intensity: 3 },
        { id: "3", timestamp: new Date("2025-01-03T10:00:00Z"), intensity: 3 },
        { id: "4", timestamp: new Date("2025-01-04T10:00:00Z"), intensity: 3 },
        { id: "5", timestamp: new Date("2025-01-05T10:00:00Z"), intensity: 3 },
        // This week (Jan 6-10, Mon-Fri)
        { id: "6", timestamp: new Date("2025-01-06T10:00:00Z"), intensity: 3 },
        { id: "7", timestamp: new Date("2025-01-08T10:00:00Z"), intensity: 3 },
        { id: "8", timestamp: new Date("2025-01-09T10:00:00Z"), intensity: 3 },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      // Act
      const trend = await useDashboardStore.getState().calculateTrend();

      // Assert
      expect(trend).toBe("improving");
    });

    it('should return "declining" when this week has 20%+ more headaches', async () => {
      // Arrange - Last week: 2 headaches, This week: 5 headaches (150% increase)
      const mockHeadacheEntries: HeadacheEntry[] = [
        // Last week
        { id: "1", timestamp: new Date("2025-01-01T10:00:00Z"), intensity: 3 },
        { id: "2", timestamp: new Date("2025-01-02T10:00:00Z"), intensity: 3 },
        // This week
        { id: "3", timestamp: new Date("2025-01-06T10:00:00Z"), intensity: 3 },
        { id: "4", timestamp: new Date("2025-01-07T10:00:00Z"), intensity: 3 },
        { id: "5", timestamp: new Date("2025-01-08T10:00:00Z"), intensity: 3 },
        { id: "6", timestamp: new Date("2025-01-09T10:00:00Z"), intensity: 3 },
        { id: "7", timestamp: new Date("2025-01-10T10:00:00Z"), intensity: 3 },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      // Act
      const trend = await useDashboardStore.getState().calculateTrend();

      // Assert
      expect(trend).toBe("declining");
    });

    it('should return "stable" when within 20% threshold', async () => {
      // Arrange - Last week: 5 headaches, This week: 5 headaches (0% change)
      const mockHeadacheEntries: HeadacheEntry[] = [
        // Last week
        { id: "1", timestamp: new Date("2025-01-01T10:00:00Z"), intensity: 3 },
        { id: "2", timestamp: new Date("2025-01-02T10:00:00Z"), intensity: 3 },
        { id: "3", timestamp: new Date("2025-01-03T10:00:00Z"), intensity: 3 },
        { id: "4", timestamp: new Date("2025-01-04T10:00:00Z"), intensity: 3 },
        { id: "5", timestamp: new Date("2025-01-05T10:00:00Z"), intensity: 3 },
        // This week
        { id: "6", timestamp: new Date("2025-01-06T10:00:00Z"), intensity: 3 },
        { id: "7", timestamp: new Date("2025-01-07T10:00:00Z"), intensity: 3 },
        { id: "8", timestamp: new Date("2025-01-08T10:00:00Z"), intensity: 3 },
        { id: "9", timestamp: new Date("2025-01-09T10:00:00Z"), intensity: 3 },
        { id: "10", timestamp: new Date("2025-01-10T10:00:00Z"), intensity: 3 },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      // Act
      const trend = await useDashboardStore.getState().calculateTrend();

      // Assert
      expect(trend).toBe("stable");
    });

    it('should return "stable" when last week had 0 entries and this week has 0 entries', async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue([]),
      });

      // Act
      const trend = await useDashboardStore.getState().calculateTrend();

      // Assert
      expect(trend).toBe("stable");
    });

    it('should return "declining" when last week had 0 entries and this week has entries', async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        // This week only
        { id: "1", timestamp: new Date("2025-01-06T10:00:00Z"), intensity: 3 },
        { id: "2", timestamp: new Date("2025-01-08T10:00:00Z"), intensity: 3 },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      // Act
      const trend = await useDashboardStore.getState().calculateTrend();

      // Assert
      expect(trend).toBe("declining");
    });

    it('should handle errors and return "stable"', async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const trend = await useDashboardStore.getState().calculateTrend();

      // Assert
      expect(trend).toBe("stable");
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("generateInsight", () => {
    it("should return welcome message when no data", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 0,
        thisWeekCheckins: 0,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 0 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toBe("Welcome! Start tracking to see your progress.");
    });

    it("should return streak insight for 30+ day streak", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 35,
        thisWeekHeadaches: 2,
        thisWeekCheckins: 3,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 50 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toContain("Amazing!");
      expect(insight).toContain("35-day streak");
    });

    it("should return streak insight for 14-29 day streak", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 20,
        thisWeekHeadaches: 2,
        thisWeekCheckins: 3,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 30 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toContain("Excellent!");
      expect(insight).toContain("20 days");
    });

    it("should return streak insight for 7-13 day streak", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 10,
        thisWeekHeadaches: 2,
        thisWeekCheckins: 3,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 15 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toContain("Great job!");
      expect(insight).toContain("10 days");
    });

    it("should return streak insight for 3-6 day streak", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 5,
        thisWeekHeadaches: 2,
        thisWeekCheckins: 3,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 8 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toContain("5-day streak");
      expect(insight).toContain("Consistency is key");
    });

    it("should return improving trend insight when no streak", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 2,
        thisWeekCheckins: 1,
        trend: "improving",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 5 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toBe(
        "Great job! Your headache frequency is down this week.",
      );
    });

    it("should return declining trend insight when no streak", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 5,
        thisWeekCheckins: 1,
        trend: "declining",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 8 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toBe(
        "Your headache frequency increased this week. Let's identify patterns together.",
      );
    });

    it("should return check-in insight when check-ins exceed headaches", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 2,
        thisWeekCheckins: 5,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 5 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toContain(
        "Morning check-ins help identify patterns early",
      );
    });

    it("should return check-in count insight", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 0,
        thisWeekCheckins: 3,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 5 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toContain("3 check-ins this week");
    });

    it("should return no headaches insight", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 0,
        thisWeekCheckins: 0,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 5 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toBe("No headaches logged this week - that's wonderful!");
    });

    it("should return single headache insight", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 1,
        thisWeekCheckins: 0,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 5 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toBe(
        "Only one headache this week. Keep tracking to spot what helps!",
      );
    });

    it("should return multiple headaches insight", () => {
      // Arrange
      useDashboardStore.setState({
        currentStreak: 0,
        thisWeekHeadaches: 3,
        thisWeekCheckins: 0,
        trend: "stable",
      });

      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { totalEntries: 5 },
      });

      // Act
      const insight = useDashboardStore.getState().generateInsight();

      // Assert
      expect(insight).toBe(
        "3 headaches logged this week. Tracking helps us find your triggers.",
      );
    });
  });

  describe("getRecentEntries", () => {
    it("should combine and sort entries from both stores", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        { id: "h1", timestamp: new Date("2025-01-10T10:00:00Z"), intensity: 3 },
        { id: "h2", timestamp: new Date("2025-01-08T14:00:00Z"), intensity: 4 },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-09T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
        {
          id: "c2",
          timestamp: new Date("2025-01-07T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "calm" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: true,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getRecentEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getRecentCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const entries = await useDashboardStore.getState().getRecentEntries(5);

      // Assert
      expect(entries).toHaveLength(4);
      // Should be sorted by timestamp descending
      expect(entries[0].entry.id).toBe("h1"); // Jan 10
      expect(entries[1].entry.id).toBe("c1"); // Jan 9
      expect(entries[2].entry.id).toBe("h2"); // Jan 8
      expect(entries[3].entry.id).toBe("c2"); // Jan 7
    });

    it("should respect the limit parameter", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        { id: "h1", timestamp: new Date("2025-01-10T10:00:00Z"), intensity: 3 },
        { id: "h2", timestamp: new Date("2025-01-08T14:00:00Z"), intensity: 4 },
        { id: "h3", timestamp: new Date("2025-01-06T14:00:00Z"), intensity: 2 },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-09T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
        {
          id: "c2",
          timestamp: new Date("2025-01-07T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "calm" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: true,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getRecentEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getRecentCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const entries = await useDashboardStore.getState().getRecentEntries(3);

      // Assert
      expect(entries).toHaveLength(3);
      expect(entries[0].entry.id).toBe("h1"); // Most recent
      expect(entries[1].entry.id).toBe("c1");
      expect(entries[2].entry.id).toBe("h2");
    });

    it("should handle empty entries", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        getRecentEntries: jest.fn().mockResolvedValue([]),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getRecentCheckIns: jest.fn().mockResolvedValue([]),
      });

      // Act
      const entries = await useDashboardStore.getState().getRecentEntries(5);

      // Assert
      expect(entries).toEqual([]);
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        getRecentEntries: jest
          .fn()
          .mockRejectedValue(new Error("Database error")),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getRecentCheckIns: jest.fn().mockResolvedValue([]),
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const entries = await useDashboardStore.getState().getRecentEntries(5);

      // Assert
      expect(entries).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should tag entries with correct types", async () => {
      // Arrange
      const mockHeadacheEntries: HeadacheEntry[] = [
        { id: "h1", timestamp: new Date("2025-01-10T10:00:00Z"), intensity: 3 },
      ];

      const mockCheckInEntries: CheckInEntry[] = [
        {
          id: "c1",
          timestamp: new Date("2025-01-09T08:00:00Z"),
          timeOfDay: "morning" as const,
          mood: "ok" as const,
          bodyTension: [],
          sleepQuality: "good" as const,
          physicalFactors: [],
          isQuickDismiss: false,
        },
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getRecentEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getRecentCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
      });

      // Act
      const entries = await useDashboardStore.getState().getRecentEntries(5);

      // Assert
      expect(entries[0].type).toBe("headache");
      expect(entries[1].type).toBe("checkin");
    });
  });

  describe("error handling", () => {
    it("should handle database initialization errors", async () => {
      // Arrange
      (useLoggingStore.getState as any).mockReturnValue({
        metadata: { currentStreak: 0 },
        getAllEntries: jest
          .fn()
          .mockRejectedValue(new Error("DB not initialized")),
        getRecentEntries: jest
          .fn()
          .mockRejectedValue(new Error("DB not initialized")),
      });

      (useCheckInStore.getState as any).mockReturnValue({
        getAllCheckIns: jest
          .fn()
          .mockRejectedValue(new Error("DB not initialized")),
        getRecentCheckIns: jest
          .fn()
          .mockRejectedValue(new Error("DB not initialized")),
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      await useDashboardStore.getState().refreshDashboard();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(useDashboardStore.getState().isLoading).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle week boundaries correctly", async () => {
      // Test on Sunday (end of week)
      const sunday = new Date("2025-01-12T23:59:59Z"); // Sunday
      jest.useFakeTimers();
      jest.setSystemTime(sunday);

      const mockHeadacheEntries: HeadacheEntry[] = [
        { id: "1", timestamp: new Date("2025-01-06T10:00:00Z"), intensity: 3 }, // Monday
        { id: "2", timestamp: new Date("2025-01-12T10:00:00Z"), intensity: 3 }, // Sunday
      ];

      (useLoggingStore.getState as any).mockReturnValue({
        getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
      });

      const trend = await useDashboardStore.getState().calculateTrend();

      expect(trend).toBeDefined();

      jest.useRealTimers();
    });

    it("should handle concurrent refresh calls", async () => {
      // Arrange
      const promise1 = useDashboardStore.getState().refreshDashboard();
      const promise2 = useDashboardStore.getState().refreshDashboard();

      // Act & Assert - should not throw
      await expect(Promise.all([promise1, promise2])).resolves.toBeDefined();
    });
  });
});
