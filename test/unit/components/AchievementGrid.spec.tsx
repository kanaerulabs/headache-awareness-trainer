import { render, screen, fireEvent } from "@testing-library/react";
import { AchievementGrid } from "@/components/organisms/AchievementGrid";
import { useGamificationStore } from "@/interface-adapters/store/gamificationStore";
import type { Achievement } from "@/interface-adapters/store/gamificationStore";

// Mock the gamificationStore
jest.mock("@/interface-adapters/store/gamificationStore", () => ({
  useGamificationStore: jest.fn(),
}));

describe("AchievementGrid", () => {
  const createMockAchievement = (
    id: string,
    name: string,
    isUnlocked: boolean = false,
  ): Achievement => ({
    id: id as any,
    name,
    description: `Description for ${name}`,
    icon: "🏆",
    isUnlocked,
    unlockedAt: isUnlocked ? new Date("2024-01-15T10:00:00Z") : undefined,
  });

  const mockAchievements = {
    // Streak achievements
    "streak-3-days": createMockAchievement("streak-3-days", "3-Day Streak", true),
    "streak-7-days": createMockAchievement("streak-7-days", "Week Warrior", true),
    "streak-14-days": createMockAchievement("streak-14-days", "Two Weeks Strong"),
    "streak-30-days": createMockAchievement("streak-30-days", "Month Master"),
    "streak-60-days": createMockAchievement("streak-60-days", "60-Day Champion"),
    "streak-90-days": createMockAchievement("streak-90-days", "90-Day Legend"),

    // First actions
    "first-entry": createMockAchievement("first-entry", "First Steps", true),
    "first-checkin": createMockAchievement("first-checkin", "Check-In Champion"),
    "first-pattern": createMockAchievement("first-pattern", "Pattern Detective"),
    "first-week": createMockAchievement("first-week", "Week One Complete"),

    // Milestones
    "entries-10": createMockAchievement("entries-10", "10 Entries", true),
    "entries-50": createMockAchievement("entries-50", "50 Entries"),
    "entries-100": createMockAchievement("entries-100", "100 Entries"),
    "checkins-10": createMockAchievement("checkins-10", "10 Check-Ins"),
    "checkins-50": createMockAchievement("checkins-50", "50 Check-Ins"),
    "checkins-100": createMockAchievement("checkins-100", "100 Check-Ins"),
  };

  beforeEach(() => {
    (useGamificationStore as unknown as jest.Mock).mockReturnValue(mockAchievements);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders correctly with achievements", () => {
      render(<AchievementGrid />);

      expect(screen.getByTestId("achievement-grid")).toBeInTheDocument();
      expect(screen.getByText("Achievements")).toBeInTheDocument();
    });

    it("displays all three category sections", () => {
      render(<AchievementGrid />);

      expect(screen.getByText("Streak Achievements")).toBeInTheDocument();
      expect(screen.getByText("First Actions")).toBeInTheDocument();
      expect(screen.getByText("Milestones")).toBeInTheDocument();
    });

    it("displays category icons", () => {
      render(<AchievementGrid />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toContain("🔥"); // Streak
      expect(grid.textContent).toContain("🌟"); // First Actions
      // Note: 🏆 appears multiple times in achievement badges
    });

    it("calculates and displays total progress correctly", () => {
      render(<AchievementGrid />);

      // 4 unlocked out of 16 total = 25%
      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toMatch(/4\/16/);
      expect(grid.textContent).toMatch(/25%/);
    });

    it("displays all streak achievements", () => {
      render(<AchievementGrid />);

      expect(screen.getByText("3-Day Streak")).toBeInTheDocument();
      expect(screen.getByText("Week Warrior")).toBeInTheDocument();
      expect(screen.getByText("Two Weeks Strong")).toBeInTheDocument();
      expect(screen.getByText("Month Master")).toBeInTheDocument();
      expect(screen.getByText("60-Day Champion")).toBeInTheDocument();
      expect(screen.getByText("90-Day Legend")).toBeInTheDocument();
    });

    it("displays all first action achievements", () => {
      render(<AchievementGrid />);

      expect(screen.getByText("First Steps")).toBeInTheDocument();
      expect(screen.getByText("Check-In Champion")).toBeInTheDocument();
      expect(screen.getByText("Pattern Detective")).toBeInTheDocument();
      expect(screen.getByText("Week One Complete")).toBeInTheDocument();
    });

    it("displays all milestone achievements", () => {
      render(<AchievementGrid />);

      expect(screen.getByText("10 Entries")).toBeInTheDocument();
      expect(screen.getByText("50 Entries")).toBeInTheDocument();
      expect(screen.getByText("100 Entries")).toBeInTheDocument();
      expect(screen.getByText("10 Check-Ins")).toBeInTheDocument();
      expect(screen.getByText("50 Check-Ins")).toBeInTheDocument();
      expect(screen.getByText("100 Check-Ins")).toBeInTheDocument();
    });
  });

  describe("category progress", () => {
    it("displays correct count for streak achievements category", () => {
      render(<AchievementGrid />);

      const streakSection = screen.getByText("Streak Achievements").parentElement;
      expect(streakSection).toHaveTextContent("2/6");
    });

    it("displays correct count for first actions category", () => {
      render(<AchievementGrid />);

      const firstActionsSection = screen.getByText("First Actions").parentElement;
      expect(firstActionsSection).toHaveTextContent("1/4");
    });

    it("displays correct count for milestones category", () => {
      render(<AchievementGrid />);

      const milestonesSection = screen.getByText("Milestones").parentElement;
      expect(milestonesSection).toHaveTextContent("1/6");
    });

    it("updates category counts when achievements unlock", () => {
      const { rerender } = render(<AchievementGrid />);

      expect(screen.getByText("Streak Achievements").parentElement).toHaveTextContent("2/6");

      const updatedAchievements = {
        ...mockAchievements,
        "streak-14-days": createMockAchievement("streak-14-days", "Two Weeks Strong", true),
      };

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(updatedAchievements);

      rerender(<AchievementGrid />);

      expect(screen.getByText("Streak Achievements").parentElement).toHaveTextContent("3/6");
    });
  });

  describe("overall progress", () => {
    it("calculates percentage correctly with no unlocked achievements", () => {
      const allLocked = Object.fromEntries(
        Object.entries(mockAchievements).map(([key, val]) => [
          key,
          { ...val, isUnlocked: false },
        ]),
      );

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(allLocked);

      render(<AchievementGrid />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toMatch(/0\/16/);
      expect(grid.textContent).toMatch(/0%/);
    });

    it("calculates percentage correctly with all unlocked achievements", () => {
      const allUnlocked = Object.fromEntries(
        Object.entries(mockAchievements).map(([key, val]) => [
          key,
          { ...val, isUnlocked: true },
        ]),
      );

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(allUnlocked);

      render(<AchievementGrid />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toMatch(/16\/16/);
      expect(grid.textContent).toMatch(/100%/);
    });

    it("rounds percentage correctly", () => {
      // Start with all locked, then unlock exactly 3
      const allLocked = Object.fromEntries(
        Object.entries(mockAchievements).map(([key, val]) => [
          key,
          { ...val, isUnlocked: false, unlockedAt: undefined },
        ]),
      );
      const partiallyUnlocked = {
        ...allLocked,
        "streak-3-days": createMockAchievement("streak-3-days", "3-Day Streak", true),
        "streak-7-days": createMockAchievement("streak-7-days", "Week Warrior", true),
        "first-entry": createMockAchievement("first-entry", "First Steps", true),
      };

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(partiallyUnlocked);

      render(<AchievementGrid />);

      // 3 out of 16 = 18.75% -> rounds to 19%
      const header = screen.getByTestId("achievement-grid");
      expect(header.textContent).toMatch(/3\/16/);
      expect(header.textContent).toMatch(/19%/);
    });
  });

  describe("user interactions", () => {
    it("calls onAchievementClick when unlocked achievement is clicked", () => {
      const handleClick = jest.fn();
      render(<AchievementGrid onAchievementClick={handleClick} />);

      const achievement = screen.getByText("3-Day Streak");
      fireEvent.click(achievement.closest('[data-testid="achievement-badge"]')!);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "streak-3-days",
          isUnlocked: true,
        }),
      );
    });

    it("does not call onAchievementClick for locked achievements", () => {
      const handleClick = jest.fn();
      render(<AchievementGrid onAchievementClick={handleClick} />);

      const achievement = screen.getByText("Two Weeks Strong");
      fireEvent.click(achievement.closest('[data-testid="achievement-badge"]')!);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("handles multiple clicks on different achievements", () => {
      const handleClick = jest.fn();
      render(<AchievementGrid onAchievementClick={handleClick} />);

      const firstAchievement = screen.getByText("3-Day Streak");
      const secondAchievement = screen.getByText("Week Warrior");

      fireEvent.click(firstAchievement.closest('[data-testid="achievement-badge"]')!);
      fireEvent.click(secondAchievement.closest('[data-testid="achievement-badge"]')!);

      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it("works without onAchievementClick callback", () => {
      render(<AchievementGrid />);

      const achievement = screen.getByText("3-Day Streak");
      expect(() => {
        fireEvent.click(achievement.closest('[data-testid="achievement-badge"]')!);
      }).not.toThrow();
    });
  });

  describe("layout", () => {
    it("uses grid layout for achievements", () => {
      render(<AchievementGrid />);

      const grids = screen.getByTestId("achievement-grid").querySelectorAll(".grid");
      expect(grids.length).toBeGreaterThan(0);
    });

    it("applies responsive grid classes", () => {
      render(<AchievementGrid />);

      const grids = screen.getByTestId("achievement-grid").querySelectorAll(".grid-cols-1");
      expect(grids.length).toBeGreaterThan(0);

      grids.forEach((grid) => {
        expect(grid).toHaveClass("sm:grid-cols-2");
      });
    });

    it("maintains spacing between sections", () => {
      render(<AchievementGrid />);

      const content = screen.getByTestId("achievement-grid").querySelector(".space-y-6");
      expect(content).toBeInTheDocument();
    });

    it("maintains spacing between achievements in grid", () => {
      render(<AchievementGrid />);

      const grids = screen.getByTestId("achievement-grid").querySelectorAll(".gap-3");
      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe("accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<AchievementGrid />);

      // CardTitle renders as div, verify title text exists
      const mainTitle = screen.getByText("Achievements");
      expect(mainTitle).toBeInTheDocument();

      // Category titles exist and are visible
      const categoryTitles = screen.getAllByText(/Streak Achievements|First Actions|Milestones/);
      expect(categoryTitles.length).toBe(3);
      categoryTitles.forEach((title) => {
        expect(title).toBeVisible();
      });
    });

    it("hides decorative icons from screen readers", () => {
      render(<AchievementGrid />);

      const ariaHiddenElements = screen
        .getByTestId("achievement-grid")
        .querySelectorAll('[aria-hidden="true"]');
      expect(ariaHiddenElements.length).toBeGreaterThan(0);
    });

    it("provides text context with category counts", () => {
      render(<AchievementGrid />);

      const streakSection = screen.getByText("Streak Achievements").parentElement;
      const firstActionsSection = screen.getByText("First Actions").parentElement;
      const milestonesSection = screen.getByText("Milestones").parentElement;

      expect(streakSection).toHaveTextContent("2/6");
      expect(firstActionsSection).toHaveTextContent("1/4");
      expect(milestonesSection).toHaveTextContent("1/6");
    });

    it("shows overall progress in accessible format", () => {
      render(<AchievementGrid />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toMatch(/4\/16/);
      expect(grid.textContent).toMatch(/25%/);
    });
  });

  describe("styling", () => {
    it("applies custom className when provided", () => {
      const customClass = "custom-grid-class";
      render(<AchievementGrid className={customClass} />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid).toHaveClass(customClass);
    });

    it("maintains base styles with custom className", () => {
      render(<AchievementGrid className="custom-class" />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid).toHaveClass("w-full");
    });

    it("applies proper category title styling", () => {
      render(<AchievementGrid />);

      const categoryTitle = screen.getByText("Streak Achievements");
      expect(categoryTitle).toHaveClass("text-sm");
      expect(categoryTitle).toHaveClass("font-semibold");
    });
  });

  describe("edge cases", () => {
    it("handles all achievements in locked state", () => {
      const allLockedAchievements = Object.fromEntries(
        Object.entries(mockAchievements).map(([key, val]) => [
          key,
          { ...val, isUnlocked: false, unlockedAt: undefined },
        ]),
      );

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(allLockedAchievements);

      render(<AchievementGrid />);

      // Should render without errors
      expect(screen.getByTestId("achievement-grid")).toBeInTheDocument();
      expect(screen.getByText("Achievements")).toBeInTheDocument();
    });

    it("renders all categories even when all locked", () => {
      const allLockedAchievements = Object.fromEntries(
        Object.entries(mockAchievements).map(([key, val]) => [
          key,
          { ...val, isUnlocked: false },
        ]),
      );

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(allLockedAchievements);

      render(<AchievementGrid />);

      expect(screen.getByText("Streak Achievements")).toBeInTheDocument();
      expect(screen.getByText("First Actions")).toBeInTheDocument();
      expect(screen.getByText("Milestones")).toBeInTheDocument();
    });

    it("handles all achievements unlocked", () => {
      const allUnlocked = Object.fromEntries(
        Object.entries(mockAchievements).map(([key, val]) => [
          key,
          { ...val, isUnlocked: true, unlockedAt: new Date() },
        ]),
      );

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(allUnlocked);

      render(<AchievementGrid />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toMatch(/16\/16/);

      const streakSection = screen.getByText("Streak Achievements").parentElement;
      expect(streakSection).toHaveTextContent("6/6");
    });

    it("handles none achievements unlocked", () => {
      const allLocked = Object.fromEntries(
        Object.entries(mockAchievements).map(([key, val]) => [
          key,
          { ...val, isUnlocked: false, unlockedAt: undefined },
        ]),
      );

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(allLocked);

      render(<AchievementGrid />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toMatch(/0\/16/);

      const streakSection = screen.getByText("Streak Achievements").parentElement;
      expect(streakSection).toHaveTextContent("0/6");
    });
  });

  describe("state updates", () => {
    it("updates when new achievement is unlocked", () => {
      const { rerender } = render(<AchievementGrid />);

      const grid = screen.getByTestId("achievement-grid");
      expect(grid.textContent).toMatch(/4\/16/);

      const updatedAchievements = {
        ...mockAchievements,
        "streak-14-days": createMockAchievement("streak-14-days", "Two Weeks Strong", true),
      };

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(updatedAchievements);

      rerender(<AchievementGrid />);

      expect(grid.textContent).toMatch(/5\/16/);
    });

    it("updates percentage when progress changes", () => {
      const { rerender } = render(<AchievementGrid />);

      expect(screen.getByText("(25%)")).toBeInTheDocument();

      const moreUnlocked = {
        ...mockAchievements,
        "streak-14-days": createMockAchievement("streak-14-days", "Two Weeks Strong", true),
        "streak-30-days": createMockAchievement("streak-30-days", "Month Master", true),
        "first-checkin": createMockAchievement("first-checkin", "Check-In Champion", true),
        "first-pattern": createMockAchievement("first-pattern", "Pattern Detective", true),
      };

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(moreUnlocked);

      rerender(<AchievementGrid />);

      // 8 out of 16 = 50%
      expect(screen.getByText("(50%)")).toBeInTheDocument();
    });

    it("updates category counts independently", () => {
      const { rerender } = render(<AchievementGrid />);

      expect(screen.getByText("Streak Achievements").parentElement).toHaveTextContent("2/6");
      expect(screen.getByText("First Actions").parentElement).toHaveTextContent("1/4");

      const updatedAchievements = {
        ...mockAchievements,
        "first-checkin": createMockAchievement("first-checkin", "Check-In Champion", true),
      };

      (useGamificationStore as unknown as jest.Mock).mockReturnValue(updatedAchievements);

      rerender(<AchievementGrid />);

      expect(screen.getByText("Streak Achievements").parentElement).toHaveTextContent("2/6");
      expect(screen.getByText("First Actions").parentElement).toHaveTextContent("2/4");
    });
  });

  describe("display name", () => {
    it("has correct display name", () => {
      expect(AchievementGrid.displayName).toBe("AchievementGrid");
    });
  });

  describe("integration with AchievementBadge", () => {
    it("renders AchievementBadge components for all achievements", () => {
      render(<AchievementGrid />);

      const badges = screen.getAllByTestId("achievement-badge");
      expect(badges.length).toBe(16); // Total achievements
    });

    it("passes correct achievement data to each badge", () => {
      render(<AchievementGrid />);

      expect(screen.getByText("3-Day Streak")).toBeInTheDocument();
      expect(screen.getByText("Week Warrior")).toBeInTheDocument();
      expect(screen.getByText("First Steps")).toBeInTheDocument();
    });

    it("preserves achievement unlock state in badges", () => {
      render(<AchievementGrid />);

      const unlockedBadges = screen.getAllByText("Unlocked");
      expect(unlockedBadges.length).toBe(4); // 4 achievements are unlocked
    });
  });
});
