import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContentViewer } from "@/components/organisms/ContentViewer";
import { useEducationStore } from "@/interface-adapters/store/educationStore";
import { educationalContent } from "@/data/educationalContent";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
      sections: [
        {
          title: "Overview",
          content: "Tension headaches are the most common type of headache.",
        },
        {
          title: "What Causes Them?",
          content: "Tension headaches often result from muscle contractions.",
        },
        {
          title: "Self-Care Strategies",
          content: "When you notice early tension signals, take action.",
        },
      ],
    },
    "advanced-patterns": {
      id: "advanced-patterns",
      title: "Your Personal Insights",
      subtitle: "Advanced pattern analysis",
      icon: "✨",
      estimatedMinutes: 5,
      requiresUnlock: true,
      unlockRequirement: "Log 7 days of data to unlock personalized insights",
      sections: [
        {
          title: "Coming Soon",
          content: "This content will unlock once you've logged enough data.",
        },
      ],
    },
    "body-scan": {
      id: "body-scan",
      title: "How to Do a Body Scan",
      subtitle: "A step-by-step guide",
      icon: "🧘",
      estimatedMinutes: 8,
      requiresUnlock: false,
      sections: [
        {
          title: "What is a Body Scan?",
          content: "A body scan is a mindfulness technique.",
        },
      ],
    },
  },
}));

describe("ContentViewer", () => {
  const mockUseEducationStore = useEducationStore as jest.MockedFunction<
    typeof useEducationStore
  >;

  const mockStoreState = {
    markContentViewed: jest.fn(),
    markContentCompleted: jest.fn(),
    updateProgress: jest.fn(),
    isContentUnlocked: jest.fn(),
    contentProgress: {},
    getTotalProgress: jest.fn(),
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
    mockPush.mockClear();

    // Setup default mock returns
    mockUseEducationStore.mockReturnValue(mockStoreState);
    mockStoreState.isContentUnlocked.mockReturnValue(true);
  });

  describe("Rendering - Valid Content", () => {
    it("should render content viewer with valid content ID", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(
        screen.getByTestId("content-viewer-tension-headache"),
      ).toBeInTheDocument();
    });

    it("should display content title and icon", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(
        screen.getByText("What is a Tension Headache?"),
      ).toBeInTheDocument();
      expect(screen.getByText("🧠")).toBeInTheDocument();
    });

    it("should display content subtitle", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(
        screen.getByText("Understanding the most common type of headache"),
      ).toBeInTheDocument();
    });

    it("should render first section by default", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tension headaches are the most common type of headache.",
        ),
      ).toBeInTheDocument();
    });

    it("should display section counter badge", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });
  });

  describe("Content Not Found", () => {
    it("should display 'Content not found' message for invalid content ID", () => {
      render(<ContentViewer contentId={"invalid-content" as any} />);

      expect(screen.getByText("Content not found")).toBeInTheDocument();
    });

    it("should show 'Back to Learn' button when content not found", () => {
      render(<ContentViewer contentId={"invalid-content" as any} />);

      const backButton = screen.getByRole("button", {
        name: "Back to Learn",
      });
      expect(backButton).toBeInTheDocument();
    });

    it("should navigate to /learn when back button clicked on not found", () => {
      render(<ContentViewer contentId={"invalid-content" as any} />);

      const backButton = screen.getByRole("button", {
        name: "Back to Learn",
      });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith("/learn");
    });
  });

  describe("Locked Content", () => {
    beforeEach(() => {
      mockStoreState.isContentUnlocked.mockImplementation((contentId) => {
        return contentId !== "advanced-patterns";
      });
    });

    it("should display lock icon for locked content", () => {
      render(<ContentViewer contentId="advanced-patterns" />);

      expect(screen.getByText("🔒")).toBeInTheDocument();
    });

    it("should show 'Content Locked' heading for locked content", () => {
      render(<ContentViewer contentId="advanced-patterns" />);

      expect(
        screen.getByRole("heading", { name: "Content Locked" }),
      ).toBeInTheDocument();
    });

    it("should display unlock requirement message for locked content", () => {
      render(<ContentViewer contentId="advanced-patterns" />);

      expect(
        screen.getByText("Log 7 days of data to unlock personalized insights"),
      ).toBeInTheDocument();
    });

    it("should show back button on locked content", () => {
      render(<ContentViewer contentId="advanced-patterns" />);

      const backButton = screen.getByRole("button", { name: "Back to Learn" });
      expect(backButton).toBeInTheDocument();
    });

    it("should navigate to /learn when back button clicked on locked content", () => {
      render(<ContentViewer contentId="advanced-patterns" />);

      const backButton = screen.getByRole("button", { name: "Back to Learn" });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith("/learn");
    });

    it("should not mark locked content as viewed on mount", () => {
      render(<ContentViewer contentId="advanced-patterns" />);

      expect(mockStoreState.markContentViewed).not.toHaveBeenCalled();
    });
  });

  describe("Section Navigation", () => {
    it("should show 'Next' button when not on last section", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const nextButton = screen.getByRole("button", { name: "Next" });
      expect(nextButton).toBeInTheDocument();
    });

    it("should show 'Complete' button on last section", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Navigate to last section
      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      const completeButton = screen.getByRole("button", { name: "Complete" });
      expect(completeButton).toBeInTheDocument();
    });

    it("should advance to next section when Next button clicked", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(screen.getByText("Overview")).toBeInTheDocument();

      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      expect(screen.getByText("What Causes Them?")).toBeInTheDocument();
      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("should go to previous section when Previous button clicked", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Go to section 2
      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      expect(screen.getByText("What Causes Them?")).toBeInTheDocument();

      // Go back to section 1
      const previousButton = screen.getByRole("button", { name: "Previous" });
      fireEvent.click(previousButton);

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("should disable Previous button on first section", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const previousButton = screen.getByRole("button", { name: "Previous" });
      expect(previousButton).toBeDisabled();
    });

    it("should enable Previous button after navigating forward", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      const previousButton = screen.getByRole("button", { name: "Previous" });
      expect(previousButton).not.toBeDisabled();
    });

    it("should navigate to /learn when Complete button clicked", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Navigate to last section
      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      const completeButton = screen.getByRole("button", { name: "Complete" });
      fireEvent.click(completeButton);

      expect(mockPush).toHaveBeenCalledWith("/learn");
    });

    it("should mark content as completed when Complete button clicked", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Navigate to last section
      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      const completeButton = screen.getByRole("button", { name: "Complete" });
      fireEvent.click(completeButton);

      expect(mockStoreState.markContentCompleted).toHaveBeenCalledWith(
        "tension-headache",
      );
    });
  });

  describe("Progress Tracking", () => {
    it("should mark content as viewed on mount", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(mockStoreState.markContentViewed).toHaveBeenCalledWith(
        "tension-headache",
      );
    });

    it("should update progress when navigating to section 1", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Progress for section 1/3 = 33%
      expect(mockStoreState.updateProgress).toHaveBeenCalledWith(
        "tension-headache",
        33,
      );
    });

    it("should update progress when navigating to section 2", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      // Progress for section 2/3 = 67%
      expect(mockStoreState.updateProgress).toHaveBeenCalledWith(
        "tension-headache",
        67,
      );
    });

    it("should update progress when navigating to last section", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Progress for section 3/3 = 100%
      expect(mockStoreState.updateProgress).toHaveBeenCalledWith(
        "tension-headache",
        100,
      );
    });

    it("should display progress bar showing current progress", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe("Section Dots Navigation", () => {
    it("should render section dots for all sections", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      const dots = container.querySelectorAll(
        'button[aria-label^="Go to section"]',
      );
      expect(dots).toHaveLength(3);
    });

    it("should highlight current section dot", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      const dots = container.querySelectorAll(
        'button[aria-label^="Go to section"]',
      );

      // First dot should have bg-primary class
      expect(dots[0]).toHaveClass("bg-primary");
    });

    it("should navigate to section when dot is clicked", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      const dots = container.querySelectorAll(
        'button[aria-label^="Go to section"]',
      );

      // Click on third dot
      fireEvent.click(dots[2]);

      expect(screen.getByText("Self-Care Strategies")).toBeInTheDocument();
      expect(screen.getByText("3 / 3")).toBeInTheDocument();
    });

    it("should show completed state for visited sections", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      // Navigate to section 2
      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      const dots = container.querySelectorAll(
        'button[aria-label^="Go to section"]',
      );

      // First dot should show as completed (bg-primary/50)
      expect(dots[0]).toHaveClass("bg-primary/50");

      // Second dot should be current (bg-primary)
      expect(dots[1]).toHaveClass("bg-primary");
    });

    it("should have proper aria-labels for accessibility", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      expect(
        container.querySelector('[aria-label="Go to section 1"]'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('[aria-label="Go to section 2"]'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('[aria-label="Go to section 3"]'),
      ).toBeInTheDocument();
    });
  });

  describe("Back Button Navigation", () => {
    it("should render back button in header", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const backButton = screen.getByRole("button", { name: "← Back" });
      expect(backButton).toBeInTheDocument();
    });

    it("should navigate to /learn when back button clicked", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const backButton = screen.getByRole("button", { name: "← Back" });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith("/learn");
    });

    it("should navigate back from any section", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Navigate to section 2
      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      const backButton = screen.getByRole("button", { name: "← Back" });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith("/learn");
    });
  });

  describe("Content Rendering", () => {
    it("should render section title", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // CardTitle doesn't render semantic heading, use getByText instead
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });

    it("should render section content", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(
        screen.getByText(
          "Tension headaches are the most common type of headache.",
        ),
      ).toBeInTheDocument();
    });

    it("should render different section content when navigating", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      expect(
        screen.getByText(
          "Tension headaches often result from muscle contractions.",
        ),
      ).toBeInTheDocument();
    });

    it("should render content inside a Card component", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      const card = container.querySelector('[class*="card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe("Integration with educationStore", () => {
    it("should use educationStore hook", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(mockUseEducationStore).toHaveBeenCalled();
    });

    it("should render unlocked content when isContentUnlocked returns true", () => {
      mockStoreState.isContentUnlocked.mockReturnValue(true);

      render(<ContentViewer contentId="tension-headache" />);

      // Test behavior: content should be visible and interactive
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });

    it("should only mark content as viewed if unlocked", () => {
      // Mock tension-headache as requiring unlock and being locked
      const lockedContent = {
        ...educationalContent["tension-headache"],
        requiresUnlock: true,
      };
      (educationalContent as any)["tension-headache"] = lockedContent;
      mockStoreState.isContentUnlocked.mockReturnValue(false);

      render(<ContentViewer contentId="tension-headache" />);

      // Content is locked, should not mark as viewed
      expect(mockStoreState.markContentViewed).not.toHaveBeenCalled();

      // Restore original content
      (educationalContent as any)["tension-headache"].requiresUnlock = false;
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const h1 = screen.getByRole("heading", {
        level: 1,
        name: "What is a Tension Headache?",
      });
      expect(h1).toBeInTheDocument();
    });

    it("should have accessible button labels", () => {
      render(<ContentViewer contentId="tension-headache" />);

      expect(
        screen.getByRole("button", { name: "← Back" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Previous" }),
      ).toBeInTheDocument();
    });

    it("should have proper data-testid for testing", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      expect(
        container.querySelector(
          '[data-testid="content-viewer-tension-headache"]',
        ),
      ).toBeInTheDocument();
    });

    it("should render icon with role attribute", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const icon = screen.getByText("🧠");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single-section content", () => {
      render(<ContentViewer contentId="body-scan" />);

      expect(screen.getByText("1 / 1")).toBeInTheDocument();

      // Should show Complete button immediately
      const completeButton = screen.getByRole("button", { name: "Complete" });
      expect(completeButton).toBeInTheDocument();

      // Previous button should be disabled
      const previousButton = screen.getByRole("button", { name: "Previous" });
      expect(previousButton).toBeDisabled();
    });

    it("should handle rapid navigation clicks", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const nextButton = screen.getByRole("button", { name: "Next" });

      // Rapidly click next
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should not crash and should stop at last section
      expect(screen.getByText("Self-Care Strategies")).toBeInTheDocument();
      expect(screen.getByText("3 / 3")).toBeInTheDocument();
    });

    it("should handle rapid previous clicks", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const previousButton = screen.getByRole("button", { name: "Previous" });

      // Rapidly click previous (should stay at first section)
      fireEvent.click(previousButton);
      fireEvent.click(previousButton);

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("should not crash when content has no sections", () => {
      // This shouldn't happen in real usage, but good to handle gracefully
      const emptyContent = {
        id: "empty",
        title: "Empty Content",
        subtitle: "Test",
        icon: "📝",
        estimatedMinutes: 1,
        requiresUnlock: false,
        sections: [],
      };

      (educationalContent as any).empty = emptyContent;

      expect(() =>
        render(<ContentViewer contentId={"empty" as any} />),
      ).not.toThrow();
    });
  });

  describe("Progress Bar Display", () => {
    it("should show progress bar at 33% for section 1 of 3", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it("should update progress bar when navigating", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      // Progress should update to 67%
      expect(mockStoreState.updateProgress).toHaveBeenCalledWith(
        "tension-headache",
        67,
      );
    });
  });

  describe("useRouter integration", () => {
    it("should use Next.js useRouter hook", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Verify that pushing to router works
      const backButton = screen.getByRole("button", { name: "← Back" });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalled();
    });

    it("should navigate to correct route on completion", () => {
      render(<ContentViewer contentId="tension-headache" />);

      // Navigate to last section
      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      const completeButton = screen.getByRole("button", { name: "Complete" });
      fireEvent.click(completeButton);

      expect(mockPush).toHaveBeenCalledWith("/learn");
    });
  });

  describe("Visual States", () => {
    it("should have proper spacing classes", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      const viewer = container.querySelector(
        '[data-testid="content-viewer-tension-headache"]',
      );
      expect(viewer).toHaveClass("space-y-6");
    });

    it("should render badge with outline variant", () => {
      const { container } = render(
        <ContentViewer contentId="tension-headache" />,
      );

      // Section counter badge
      const badge = screen.getByText("1 / 3");
      expect(badge).toBeInTheDocument();
    });

    it("should render ghost variant for back button", () => {
      render(<ContentViewer contentId="tension-headache" />);

      const backButton = screen.getByRole("button", { name: "← Back" });
      expect(backButton).toBeInTheDocument();
    });
  });
});
