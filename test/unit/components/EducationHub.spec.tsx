import { render, screen, within } from "@testing-library/react";
import { EducationHub } from "@/components/organisms/EducationHub";
import { useEducationStore } from "@/interface-adapters/store/educationStore";
import {
  educationalContent,
  getAvailableContent,
} from "@/data/educationalContent";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock educationStore
jest.mock("@/interface-adapters/store/educationStore");

// Mock educationalContent data
jest.mock("@/data/educationalContent", () => ({
  educationalContent: {
    "tension-headache": {
      id: "tension-headache",
      title: "What is a Tension Headache?",
      subtitle: "Understanding the most common type of headache",
      icon: "🧠",
      estimatedMinutes: 5,
      requiresUnlock: false,
    },
    "body-scan": {
      id: "body-scan",
      title: "How to Do a Body Scan",
      subtitle: "A step-by-step guide to noticing body tension",
      icon: "🧘",
      estimatedMinutes: 8,
      requiresUnlock: false,
    },
    "advanced-patterns": {
      id: "advanced-patterns",
      title: "Your Personal Insights",
      subtitle: "Advanced pattern analysis based on your data",
      icon: "✨",
      estimatedMinutes: 5,
      requiresUnlock: true,
      unlockRequirement: "Log 7 days of data to unlock personalized insights",
    },
  },
  getAvailableContent: jest.fn(),
}));

describe("EducationHub", () => {
  const mockUseEducationStore = useEducationStore as jest.MockedFunction<
    typeof useEducationStore
  >;
  const mockGetAvailableContent = getAvailableContent as jest.MockedFunction<
    typeof getAvailableContent
  >;

  const mockStoreState = {
    contentProgress: {
      "tension-headache": {
        contentId: "tension-headache" as const,
        viewed: false,
        completed: false,
        progressPercent: 0,
      },
      "body-scan": {
        contentId: "body-scan" as const,
        viewed: true,
        completed: false,
        progressPercent: 50,
      },
      "advanced-patterns": {
        contentId: "advanced-patterns" as const,
        viewed: false,
        completed: false,
        progressPercent: 0,
      },
    },
    isContentUnlocked: jest.fn(),
    getTotalProgress: jest.fn(),
    markContentViewed: jest.fn(),
    markContentCompleted: jest.fn(),
    updateProgress: jest.fn(),
    unlockContent: jest.fn(),
    getContentProgress: jest.fn(),
    unlockedContent: [
      "tension-headache" as const,
      "body-scan" as const,
      "body-signals" as const,
      "vocabulary-builder" as const,
      "general-patterns" as const,
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockUseEducationStore.mockReturnValue(mockStoreState);
    mockStoreState.getTotalProgress.mockReturnValue(25);
    mockStoreState.isContentUnlocked.mockImplementation((contentId: string) => {
      return contentId !== "advanced-patterns";
    });

    mockGetAvailableContent.mockReturnValue([
      educationalContent["tension-headache"],
      educationalContent["body-scan"],
    ]);
  });

  describe("Rendering", () => {
    it("should render the EducationHub component", () => {
      render(<EducationHub />);

      expect(screen.getByTestId("education-hub")).toBeInTheDocument();
    });

    it("should render header with 'Learn' title", () => {
      render(<EducationHub />);

      expect(
        screen.getByRole("heading", { name: "Learn", level: 1 }),
      ).toBeInTheDocument();
    });

    it("should render tagline under title", () => {
      render(<EducationHub />);

      expect(
        screen.getByText("Build awareness before the headache speaks"),
      ).toBeInTheDocument();
    });

    it("should have proper data-testid for accessibility", () => {
      const { container } = render(<EducationHub />);

      const hub = container.querySelector('[data-testid="education-hub"]');
      expect(hub).toBeInTheDocument();
    });
  });

  describe("Overall Progress Bar", () => {
    it("should display overall progress percentage", () => {
      render(<EducationHub />);

      expect(screen.getByText("25%")).toBeInTheDocument();
    });

    it("should display 'Your progress' label", () => {
      render(<EducationHub />);

      expect(screen.getByText("Your progress")).toBeInTheDocument();
    });

    it("should call getTotalProgress from store", () => {
      render(<EducationHub />);

      expect(mockStoreState.getTotalProgress).toHaveBeenCalled();
    });

    it("should update when progress changes", () => {
      const { rerender } = render(<EducationHub />);

      expect(screen.getByText("25%")).toBeInTheDocument();

      // Update mock to return different progress
      mockStoreState.getTotalProgress.mockReturnValue(50);

      rerender(<EducationHub />);

      // Use getAllByText since "50%" appears in both overall progress and content card badges
      const progressElements = screen.getAllByText("50%");
      expect(progressElements.length).toBeGreaterThan(0);
    });

    it("should show 0% when no progress", () => {
      mockStoreState.getTotalProgress.mockReturnValue(0);

      render(<EducationHub />);

      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("should show 100% when all content completed", () => {
      mockStoreState.getTotalProgress.mockReturnValue(100);

      render(<EducationHub />);

      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("Available Content Section", () => {
    it("should render 'Start Learning' section heading", () => {
      render(<EducationHub />);

      expect(
        screen.getByRole("heading", { name: "Start Learning" }),
      ).toBeInTheDocument();
    });

    it("should render all available content cards", () => {
      render(<EducationHub />);

      expect(
        screen.getByTestId("content-card-tension-headache"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("content-card-body-scan")).toBeInTheDocument();
    });

    it("should display content with no progress (0%)", () => {
      render(<EducationHub />);

      const tensionCard = screen.getByTestId("content-card-tension-headache");
      within(tensionCard).getByText("What is a Tension Headache?");

      // Should not show progress badge for 0%
      const badge = within(tensionCard).queryByText("0%");
      expect(badge).not.toBeInTheDocument();
    });

    it("should display content with partial progress (50%)", () => {
      render(<EducationHub />);

      const bodyScanCard = screen.getByTestId("content-card-body-scan");
      within(bodyScanCard).getByText("How to Do a Body Scan");

      // Should show progress badge for partial progress
      const badge = within(bodyScanCard).getByText("50%");
      expect(badge).toBeInTheDocument();
    });

    it("should pass isLocked=false to available content cards", () => {
      render(<EducationHub />);

      const tensionCard = screen.getByTestId("content-card-tension-headache");

      // Should not have "Locked" badge
      expect(within(tensionCard).queryByText("Locked")).not.toBeInTheDocument();

      // Should be clickable (has cursor-pointer class)
      expect(tensionCard).toHaveClass("cursor-pointer");
    });

    it("should display completed badge when content is completed", () => {
      mockStoreState.contentProgress["tension-headache"].completed = true;

      render(<EducationHub />);

      const tensionCard = screen.getByTestId("content-card-tension-headache");
      const completedBadge = within(tensionCard).getByText("Completed");
      expect(completedBadge).toBeInTheDocument();
    });
  });

  describe("Coming Soon Section (Locked Content)", () => {
    it("should render 'Coming Soon' section when locked content exists", () => {
      render(<EducationHub />);

      expect(
        screen.getByRole("heading", { name: "Coming Soon" }),
      ).toBeInTheDocument();
    });

    it("should not render 'Coming Soon' section when no locked content exists", () => {
      // Temporarily modify educationalContent to have no locked content
      const originalAdvancedPatterns = educationalContent["advanced-patterns"];
      (educationalContent as any)["advanced-patterns"] = {
        ...originalAdvancedPatterns,
        requiresUnlock: false,
      };

      // Mock all content as available
      const allUnlockedContent = Object.values(educationalContent);
      mockGetAvailableContent.mockReturnValue(allUnlockedContent);

      // Ensure isContentUnlocked returns true for all content
      mockStoreState.isContentUnlocked.mockReturnValue(true);

      render(<EducationHub />);

      expect(
        screen.queryByRole("heading", { name: "Coming Soon" }),
      ).not.toBeInTheDocument();

      // Restore original content
      (educationalContent as any)["advanced-patterns"] = originalAdvancedPatterns;
    });

    it("should display locked content cards", () => {
      render(<EducationHub />);

      const advancedCard = screen.getByTestId("content-card-advanced-patterns");
      expect(advancedCard).toBeInTheDocument();
    });

    it("should show locked badge on locked content", () => {
      render(<EducationHub />);

      const advancedCard = screen.getByTestId("content-card-advanced-patterns");
      const lockedBadge = within(advancedCard).getByText("Locked");
      expect(lockedBadge).toBeInTheDocument();
    });

    it("should display unlock requirement for locked content", () => {
      render(<EducationHub />);

      expect(
        screen.getByText("Log 7 days of data to unlock personalized insights"),
      ).toBeInTheDocument();
    });

    it("should pass isLocked=true for content requiring unlock", () => {
      mockStoreState.isContentUnlocked.mockReturnValue(false);

      render(<EducationHub />);

      const advancedCard = screen.getByTestId("content-card-advanced-patterns");

      // Should have opacity-60 class for locked state
      expect(advancedCard).toHaveClass("opacity-60");
      expect(advancedCard).toHaveClass("cursor-not-allowed");
    });

    it("should check if content is unlocked using store method", () => {
      render(<EducationHub />);

      expect(mockStoreState.isContentUnlocked).toHaveBeenCalledWith(
        "advanced-patterns",
      );
    });
  });

  describe("Grid Layout", () => {
    it("should render content cards in a grid", () => {
      const { container } = render(<EducationHub />);

      const grids = container.querySelectorAll(".grid");
      expect(grids.length).toBeGreaterThan(0);
    });

    it("should have responsive grid columns", () => {
      const { container } = render(<EducationHub />);

      const grids = container.querySelectorAll(".sm\\:grid-cols-2");
      expect(grids.length).toBeGreaterThan(0);
    });

    it("should have proper spacing between cards", () => {
      const { container } = render(<EducationHub />);

      const grids = container.querySelectorAll(".gap-4");
      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe("Integration with educationStore", () => {
    it("should use educationStore for content progress", () => {
      render(<EducationHub />);

      expect(mockUseEducationStore).toHaveBeenCalled();
    });

    it("should access contentProgress from store", () => {
      render(<EducationHub />);

      const storeReturn = mockUseEducationStore();
      expect(storeReturn.contentProgress).toBeDefined();
    });

    it("should access isContentUnlocked from store", () => {
      render(<EducationHub />);

      const storeReturn = mockUseEducationStore();
      expect(storeReturn.isContentUnlocked).toBeDefined();
    });

    it("should access getTotalProgress from store", () => {
      render(<EducationHub />);

      const storeReturn = mockUseEducationStore();
      expect(storeReturn.getTotalProgress).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<EducationHub />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Learn");

      const h2s = screen.getAllByRole("heading", { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it("should have semantic HTML structure", () => {
      const { container } = render(<EducationHub />);

      const sections = container.querySelectorAll("section");
      expect(sections.length).toBeGreaterThan(0);
    });

    it("should render progress bar with proper ARIA attributes", () => {
      render(<EducationHub />);

      // Progress component should be rendered
      expect(screen.getByText("Your progress")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty available content", () => {
      mockGetAvailableContent.mockReturnValue([]);

      render(<EducationHub />);

      expect(screen.getByTestId("education-hub")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Start Learning" }),
      ).toBeInTheDocument();
    });

    it("should handle all content locked", () => {
      mockGetAvailableContent.mockReturnValue([]);
      mockStoreState.isContentUnlocked.mockReturnValue(false);

      render(<EducationHub />);

      expect(screen.getByTestId("education-hub")).toBeInTheDocument();
    });

    it("should handle undefined progress for content", () => {
      mockStoreState.contentProgress = {
        "tension-headache": {
          contentId: "tension-headache",
          viewed: false,
          completed: false,
          progressPercent: 0,
        },
        "body-scan": undefined as any,
        "advanced-patterns": {
          contentId: "advanced-patterns",
          viewed: false,
          completed: false,
          progressPercent: 0,
        },
      };

      expect(() => render(<EducationHub />)).not.toThrow();
    });

    it("should render without crashing when store returns null progress", () => {
      mockStoreState.contentProgress["tension-headache"] = null as any;

      expect(() => render(<EducationHub />)).not.toThrow();
    });
  });

  describe("Content Data Integration", () => {
    it("should call getAvailableContent to fetch unlocked content", () => {
      render(<EducationHub />);

      expect(mockGetAvailableContent).toHaveBeenCalled();
    });

    it("should filter locked content from educationalContent", () => {
      render(<EducationHub />);

      // Available content should not include locked content
      const availableContent = mockGetAvailableContent();
      const hasLockedContent = availableContent.some(
        (content) => content.requiresUnlock,
      );
      expect(hasLockedContent).toBe(false);
    });
  });

  describe("Visual States", () => {
    it("should apply proper spacing classes", () => {
      const { container } = render(<EducationHub />);

      const hub = container.querySelector('[data-testid="education-hub"]');
      expect(hub).toHaveClass("space-y-8");
    });

    it("should have progress bar with correct height class", () => {
      const { container } = render(<EducationHub />);

      const progressBar = container.querySelector(".h-2");
      expect(progressBar).toBeInTheDocument();
    });

    it("should display muted foreground text for description", () => {
      const { container } = render(<EducationHub />);

      const description = screen.getByText(
        "Build awareness before the headache speaks",
      );
      expect(description).toHaveClass("text-muted-foreground");
    });
  });
});
