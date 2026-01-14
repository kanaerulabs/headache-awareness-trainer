import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { useDashboardStore } from "@/interface-adapters/store/dashboardStore";
import { useLoggingStore } from "@/interface-adapters/store/loggingStore";
import { useCheckInStore } from "@/interface-adapters/store/checkinStore";

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock store modules
vi.mock("@/interface-adapters/store/dashboardStore");
vi.mock("@/interface-adapters/store/loggingStore");
vi.mock("@/interface-adapters/store/checkinStore");

describe("DashboardPage Integration Tests", () => {
  // Mock functions
  const mockRefreshDashboard = vi.fn();
  const mockInitializeLoggingDB = vi.fn();
  const mockInitializeCheckInDB = vi.fn();

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    mockPush.mockClear();

    // Setup default dashboard store mock
    vi.mocked(useDashboardStore).mockReturnValue({
      currentStreak: 5,
      thisWeekHeadaches: 3,
      thisWeekCheckins: 7,
      trend: "improving" as const,
      currentInsight: "Great job! You've logged consistently for 5 days.",
      recentEntries: [
        {
          type: "headache" as const,
          entry: {
            id: "entry-1",
            timestamp: new Date("2025-01-10T10:00:00Z"),
            intensity: 3 as const,
            headacheType: "tension" as const,
            note: "Moderate headache",
            contextTags: [],
          },
        },
        {
          type: "checkin" as const,
          entry: {
            id: "checkin-1",
            timestamp: new Date("2025-01-10T08:00:00Z"),
            timeOfDay: "morning" as const,
            mood: "calm" as const,
            bodyTension: [],
            sleepQuality: "good" as const,
            physicalFactors: [],
            isQuickDismiss: false,
          },
        },
      ],
      isLoading: false,
      refreshDashboard: mockRefreshDashboard,
      calculateTrend: vi.fn(),
      generateInsight: vi.fn(),
      getRecentEntries: vi.fn(),
    });

    // Setup logging store mock
    vi.mocked(useLoggingStore).mockReturnValue(mockInitializeLoggingDB);

    // Setup checkin store mock
    vi.mocked(useCheckInStore).mockReturnValue(mockInitializeCheckInDB);
  });

  describe("Page Rendering", () => {
    it("should render dashboard page without crashing", () => {
      render(<DashboardPage />);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveAttribute(
        "aria-label",
        "Dashboard",
      );
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    });

    it("should render page title and subtitle", () => {
      render(<DashboardPage />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(
        screen.getByText("Your headache awareness journey"),
      ).toBeInTheDocument();
    });

    it("should render all 6 main components", () => {
      render(<DashboardPage />);

      // QuickInsightCard
      expect(
        screen.getByText("Great job! You've logged consistently for 5 days."),
      ).toBeInTheDocument();

      // StreakDisplay
      expect(screen.getByText(/5/)).toBeInTheDocument();

      // TrendIndicator
      expect(screen.getByText(/improving/i)).toBeInTheDocument();

      // WeeklySummaryCard
      expect(screen.getByText(/3/)).toBeInTheDocument(); // headache count
      expect(screen.getByText(/7/)).toBeInTheDocument(); // checkin count

      // QuickActionButtons
      expect(screen.getByText(/Log Headache/i)).toBeInTheDocument();
      expect(screen.getByText(/Quick Check-in/i)).toBeInTheDocument();

      // RecentEntriesList
      expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    });

    it("should have data-testid attribute for E2E tests", () => {
      render(<DashboardPage />);

      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    });

    it("should have proper accessibility attributes", () => {
      render(<DashboardPage />);

      // Main landmark
      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label", "Dashboard");

      // Quick actions section
      expect(screen.getByLabelText("Quick Actions")).toBeInTheDocument();

      // Recent activity section
      expect(screen.getByLabelText("Recent Activity")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when isLoading is true", () => {
      // Override mock to return loading state
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 0,
        thisWeekHeadaches: 0,
        thisWeekCheckins: 0,
        trend: "stable" as const,
        currentInsight: "",
        recentEntries: [],
        isLoading: true,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      render(<DashboardPage />);

      // Should show loading skeleton
      const skeletons = screen.getAllByRole("generic");
      const loadingElements = skeletons.filter((el) =>
        el.className.includes("animate-pulse"),
      );
      expect(loadingElements.length).toBeGreaterThan(0);

      // Should not show actual content
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });

    it("should show content after loading completes", async () => {
      // Start with loading state
      const { rerender } = render(<DashboardPage />);

      // Override to show loaded state
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 5,
        thisWeekHeadaches: 3,
        thisWeekCheckins: 7,
        trend: "improving" as const,
        currentInsight: "Great job!",
        recentEntries: [],
        isLoading: false,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      rerender(<DashboardPage />);

      // Should show actual content
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.queryByRole("generic", { hidden: true })).toBeTruthy();
    });
  });

  describe("Store Integration", () => {
    it("should call initializeDB for both stores on mount", async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(mockInitializeLoggingDB).toHaveBeenCalledTimes(1);
        expect(mockInitializeCheckInDB).toHaveBeenCalledTimes(1);
      });
    });

    it("should call refreshDashboard after DB initialization", async () => {
      mockInitializeLoggingDB.mockResolvedValue(undefined);
      mockInitializeCheckInDB.mockResolvedValue(undefined);

      render(<DashboardPage />);

      await waitFor(() => {
        expect(mockRefreshDashboard).toHaveBeenCalledTimes(1);
      });
    });

    it("should display data from dashboard store correctly", () => {
      render(<DashboardPage />);

      // Verify streak display
      expect(screen.getByText(/5/)).toBeInTheDocument();

      // Verify weekly summary counts
      expect(screen.getByText(/3/)).toBeInTheDocument(); // headaches
      expect(screen.getByText(/7/)).toBeInTheDocument(); // checkins

      // Verify trend
      expect(screen.getByText(/improving/i)).toBeInTheDocument();

      // Verify insight
      expect(
        screen.getByText("Great job! You've logged consistently for 5 days."),
      ).toBeInTheDocument();
    });

    it("should handle DB initialization failure gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockInitializeLoggingDB.mockRejectedValue(
        new Error("DB initialization failed"),
      );

      render(<DashboardPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to initialize dashboard:",
          expect.any(Error),
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Navigation", () => {
    it("should navigate to /log when Log Headache button is clicked", async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const logButton = screen.getByText(/Log Headache/i);
      await user.click(logButton);

      expect(mockPush).toHaveBeenCalledWith("/log");
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("should navigate to /checkin when Quick Check-in button is clicked", async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const checkinButton = screen.getByText(/Quick Check-in/i);
      await user.click(checkinButton);

      expect(mockPush).toHaveBeenCalledWith("/checkin");
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("should log entry ID when entry is clicked", async () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const user = userEvent.setup();

      render(<DashboardPage />);

      // Find and click a recent entry
      const entryElement = screen.getByText(/Moderate headache/i);
      await user.click(entryElement);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Entry clicked:",
        expect.any(String),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe("Data Display", () => {
    it("should display streak value correctly", () => {
      render(<DashboardPage />);

      // Verify streak is displayed
      const streakElement = screen.getByText(/5/);
      expect(streakElement).toBeInTheDocument();
    });

    it("should display weekly summary with correct counts", () => {
      render(<DashboardPage />);

      // Verify headache count
      expect(screen.getByText(/3/)).toBeInTheDocument();

      // Verify checkin count
      expect(screen.getByText(/7/)).toBeInTheDocument();
    });

    it("should display trend indicator with correct state", () => {
      render(<DashboardPage />);

      // Verify trend is displayed
      expect(screen.getByText(/improving/i)).toBeInTheDocument();
    });

    it("should display recent entries list with entries", () => {
      render(<DashboardPage />);

      // Verify headache entry is displayed
      expect(screen.getByText(/Moderate headache/i)).toBeInTheDocument();

      // Verify checkin entry is displayed
      expect(screen.getByText(/Feeling calm/i)).toBeInTheDocument();
    });

    it("should transform headache entries correctly", () => {
      render(<DashboardPage />);

      // Verify headache entry summary
      expect(screen.getByText(/Moderate/i)).toBeInTheDocument();
      expect(screen.getByText(/tension/i)).toBeInTheDocument();
    });

    it("should transform checkin entries correctly", () => {
      render(<DashboardPage />);

      // Verify checkin entry summary
      expect(screen.getByText(/Feeling calm/i)).toBeInTheDocument();
    });

    it("should handle quick dismiss checkin entries", () => {
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 5,
        thisWeekHeadaches: 3,
        thisWeekCheckins: 7,
        trend: "improving" as const,
        currentInsight: "Great job!",
        recentEntries: [
          {
            type: "checkin" as const,
            entry: {
              id: "checkin-quick",
              timestamp: new Date("2025-01-10T08:00:00Z"),
              timeOfDay: "morning" as const,
              mood: "calm" as const,
              bodyTension: [],
              sleepQuality: "good" as const,
              physicalFactors: [],
              isQuickDismiss: true,
            },
          },
        ],
        isLoading: false,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      render(<DashboardPage />);

      // Verify quick dismiss summary
      expect(
        screen.getByText(/Quick check-in: All good!/i),
      ).toBeInTheDocument();
    });
  });

  describe("Different Trend States", () => {
    it("should display declining trend correctly", () => {
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 3,
        thisWeekHeadaches: 8,
        thisWeekCheckins: 5,
        trend: "declining" as const,
        currentInsight: "Headache frequency increased this week.",
        recentEntries: [],
        isLoading: false,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(/declining/i)).toBeInTheDocument();
    });

    it("should display stable trend correctly", () => {
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 2,
        thisWeekHeadaches: 4,
        thisWeekCheckins: 6,
        trend: "stable" as const,
        currentInsight: "Consistent tracking!",
        recentEntries: [],
        isLoading: false,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(/stable/i)).toBeInTheDocument();
    });
  });

  describe("Different Headache Intensities", () => {
    it.each([
      [1, "Very mild"],
      [2, "Mild"],
      [3, "Moderate"],
      [4, "Severe"],
      [5, "Very severe"],
    ] as const)(
      "should display intensity %i as %s",
      (intensity, expectedLabel) => {
        vi.mocked(useDashboardStore).mockReturnValue({
          currentStreak: 5,
          thisWeekHeadaches: 3,
          thisWeekCheckins: 7,
          trend: "improving" as const,
          currentInsight: "Great job!",
          recentEntries: [
            {
              type: "headache" as const,
              entry: {
                id: "entry-1",
                timestamp: new Date("2025-01-10T10:00:00Z"),
                intensity,
                headacheType: "tension" as const,
                note: "Test headache",
                contextTags: [],
              },
            },
          ],
          isLoading: false,
          refreshDashboard: mockRefreshDashboard,
          calculateTrend: vi.fn(),
          generateInsight: vi.fn(),
          getRecentEntries: vi.fn(),
        });

        render(<DashboardPage />);

        expect(
          screen.getByText(new RegExp(expectedLabel, "i")),
        ).toBeInTheDocument();
      },
    );
  });

  describe("Different Checkin Moods", () => {
    it.each([
      ["calm", "Feeling calm"],
      ["ok", "Feeling okay"],
      ["stressed", "Feeling stressed"],
      ["anxious", "Feeling anxious"],
      ["avoidant", "Feeling avoidant"],
    ] as const)("should display mood %s as %s", (mood, expectedLabel) => {
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 5,
        thisWeekHeadaches: 3,
        thisWeekCheckins: 7,
        trend: "improving" as const,
        currentInsight: "Great job!",
        recentEntries: [
          {
            type: "checkin" as const,
            entry: {
              id: "checkin-1",
              timestamp: new Date("2025-01-10T08:00:00Z"),
              timeOfDay: "morning" as const,
              mood,
              bodyTension: [],
              sleepQuality: "good" as const,
              physicalFactors: [],
              isQuickDismiss: false,
            },
          },
        ],
        isLoading: false,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should handle zero streak gracefully", () => {
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 0,
        thisWeekHeadaches: 0,
        thisWeekCheckins: 0,
        trend: "stable" as const,
        currentInsight: "Welcome! Start tracking to see your progress.",
        recentEntries: [],
        isLoading: false,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(/0/)).toBeInTheDocument();
      expect(
        screen.getByText("Welcome! Start tracking to see your progress."),
      ).toBeInTheDocument();
    });

    it("should handle no recent entries", () => {
      vi.mocked(useDashboardStore).mockReturnValue({
        currentStreak: 5,
        thisWeekHeadaches: 3,
        thisWeekCheckins: 7,
        trend: "improving" as const,
        currentInsight: "Great job!",
        recentEntries: [],
        isLoading: false,
        refreshDashboard: mockRefreshDashboard,
        calculateTrend: vi.fn(),
        generateInsight: vi.fn(),
        getRecentEntries: vi.fn(),
      });

      render(<DashboardPage />);

      // Should still render the page
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should have responsive container classes", () => {
      render(<DashboardPage />);

      const mainContainer = screen.getByTestId("dashboard-page");
      expect(mainContainer).toHaveClass("p-4", "sm:p-6");

      const contentContainer = mainContainer.querySelector(".max-w-4xl");
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass("space-y-4", "sm:space-y-6");
    });

    it("should have responsive grid layout for stats", () => {
      render(<DashboardPage />);

      const gridContainer = screen
        .getByTestId("dashboard-page")
        .querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass("grid-cols-1", "lg:grid-cols-3");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<DashboardPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Dashboard");

      const h2Elements = screen.getAllByRole("heading", { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it("should have screen reader only text for sections", () => {
      render(<DashboardPage />);

      // Check for sr-only class
      const quickActionsHeading = screen.getByText("Quick Actions");
      expect(quickActionsHeading).toHaveClass("sr-only");

      const recentActivityHeading = screen.getByText("Recent Activity");
      expect(recentActivityHeading).toHaveClass("sr-only");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      // Tab to first interactive element
      await user.tab();

      // Should be able to navigate through interactive elements
      const logButton = screen.getByText(/Log Headache/i);
      const checkinButton = screen.getByText(/Quick Check-in/i);

      expect(logButton).toBeInTheDocument();
      expect(checkinButton).toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes", () => {
      render(<DashboardPage />);

      const mainContainer = screen.getByTestId("dashboard-page");
      expect(mainContainer).toHaveClass(
        "bg-gradient-to-b",
        "from-blue-50",
        "to-white",
        "dark:from-gray-900",
        "dark:to-gray-950",
      );
    });
  });

  describe("Insight Refresh", () => {
    it("should call refreshDashboard when refresh button is clicked", async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      // Find refresh button in QuickInsightCard
      const refreshButtons = screen.getAllByRole("button");
      const refreshButton = refreshButtons.find((btn) =>
        btn.getAttribute("aria-label")?.includes("Refresh"),
      );

      if (refreshButton) {
        await user.click(refreshButton);
        expect(mockRefreshDashboard).toHaveBeenCalled();
      }
    });
  });
});
