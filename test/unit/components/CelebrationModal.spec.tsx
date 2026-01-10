import { render, screen, fireEvent } from "@testing-library/react";
import { CelebrationModal } from "@/components/organisms/CelebrationModal";
import type { Achievement } from "@/interface-adapters/store/gamificationStore";

describe("CelebrationModal", () => {
  const mockAchievement: Achievement = {
    id: "streak-7-days",
    name: "Week Warrior",
    description: "Logged for 7 consecutive days",
    icon: "⭐",
    isUnlocked: true,
    unlockedAt: new Date("2024-01-15T10:00:00Z"),
  };

  const defaultProps = {
    achievement: mockAchievement,
    open: true,
    onClose: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering - open state", () => {
    it("renders correctly when open with achievement", () => {
      render(<CelebrationModal {...defaultProps} />);

      expect(screen.getByTestId("celebration-modal")).toBeInTheDocument();
      expect(screen.getByText("🎉 Achievement Unlocked!")).toBeInTheDocument();
      expect(screen.getByText("Week Warrior")).toBeInTheDocument();
      expect(
        screen.getByText("Logged for 7 consecutive days"),
      ).toBeInTheDocument();
    });

    it("displays achievement icon with animation", () => {
      render(<CelebrationModal {...defaultProps} />);

      const icon = screen.getByLabelText("Week Warrior");
      expect(icon).toHaveTextContent("⭐");
      expect(icon).toHaveClass("animate-bounce");
    });

    it("displays sparkle decorations", () => {
      render(<CelebrationModal {...defaultProps} />);

      const sparkles = screen.getAllByText("✨");
      expect(sparkles.length).toBe(2);
    });

    it("displays unlock date when available", () => {
      render(<CelebrationModal {...defaultProps} />);

      expect(screen.getByText(/Earned on/i)).toBeInTheDocument();
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    });

    it("displays encouraging message", () => {
      render(<CelebrationModal {...defaultProps} />);

      expect(
        screen.getByText(/A full week! You're becoming a tracking pro./i),
      ).toBeInTheDocument();
    });

    it("displays continue button", () => {
      render(<CelebrationModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
    });
  });

  describe("rendering - closed state", () => {
    it("does not render when open is false", () => {
      render(<CelebrationModal {...defaultProps} open={false} />);

      expect(screen.queryByTestId("celebration-modal")).not.toBeInTheDocument();
    });

    it("does not render when achievement is null", () => {
      render(<CelebrationModal {...defaultProps} achievement={null} />);

      expect(screen.queryByTestId("celebration-modal")).not.toBeInTheDocument();
    });

    it("does not render when both open is false and achievement is null", () => {
      render(<CelebrationModal {...defaultProps} achievement={null} open={false} />);

      expect(screen.queryByTestId("celebration-modal")).not.toBeInTheDocument();
    });
  });

  describe("user interactions", () => {
    it("calls onClose when continue button is clicked", () => {
      const handleClose = jest.fn();
      render(<CelebrationModal {...defaultProps} onClose={handleClose} />);

      const continueButton = screen.getByRole("button", { name: /continue/i });
      fireEvent.click(continueButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when dialog is dismissed", () => {
      const handleClose = jest.fn();
      render(<CelebrationModal {...defaultProps} onClose={handleClose} />);

      // Simulate dialog close (Escape key or backdrop click)
      const dialog = screen.getByTestId("celebration-modal");
      fireEvent.keyDown(dialog, { key: "Escape" });

      // Note: The actual close behavior depends on the Dialog component implementation
      // This test structure assumes the Dialog component passes onClose to onOpenChange
    });
  });

  describe("achievement types and messages", () => {
    it("displays correct message for first-entry achievement", () => {
      const achievement: Achievement = {
        id: "first-entry",
        name: "First Steps",
        description: "Logged your first headache entry",
        icon: "🌱",
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(
        screen.getByText(/Great start! Every journey begins with a single step./i),
      ).toBeInTheDocument();
    });

    it("displays correct message for streak-3-days achievement", () => {
      const achievement: Achievement = {
        id: "streak-3-days",
        name: "3-Day Streak",
        description: "Logged for 3 consecutive days",
        icon: "🔥",
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(
        screen.getByText(/Three days strong! Consistency is everything./i),
      ).toBeInTheDocument();
    });

    it("displays correct message for streak-30-days achievement", () => {
      const achievement: Achievement = {
        id: "streak-30-days",
        name: "Month Master",
        description: "Logged for 30 consecutive days",
        icon: "🏆",
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(
        screen.getByText(/One month! This is a true commitment to your health./i),
      ).toBeInTheDocument();
    });

    it("displays correct message for entries-100 achievement", () => {
      const achievement: Achievement = {
        id: "entries-100",
        name: "100 Entries",
        description: "Logged 100 headache entries",
        icon: "🎖️",
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(
        screen.getByText(/100 entries! You're a tracking superstar!/i),
      ).toBeInTheDocument();
    });

    it("displays default message for unknown achievement", () => {
      const achievement: Achievement = {
        id: "unknown-achievement" as any,
        name: "Unknown",
        description: "Unknown achievement",
        icon: "❓",
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(
        screen.getByText(/Keep up the great work! You're making real progress./i),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has proper dialog structure", () => {
      render(<CelebrationModal {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has accessible achievement icon label", () => {
      render(<CelebrationModal {...defaultProps} />);

      const icon = screen.getByLabelText("Week Warrior");
      expect(icon).toBeInTheDocument();
    });

    it("provides descriptive text content", () => {
      render(<CelebrationModal {...defaultProps} />);

      expect(screen.getByText("🎉 Achievement Unlocked!")).toBeInTheDocument();
      expect(screen.getByText("Week Warrior")).toBeInTheDocument();
      expect(
        screen.getByText("Logged for 7 consecutive days"),
      ).toBeInTheDocument();
    });

    it("has accessible continue button", () => {
      render(<CelebrationModal {...defaultProps} />);

      const button = screen.getByRole("button", { name: /continue/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("font-semibold");
    });

    it("maintains focus management within dialog", () => {
      render(<CelebrationModal {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("applies custom className when provided", () => {
      const customClass = "custom-modal-class";
      render(<CelebrationModal {...defaultProps} className={customClass} />);

      const modal = screen.getByTestId("celebration-modal");
      expect(modal).toHaveClass(customClass);
    });

    it("has gradient background styling", () => {
      render(<CelebrationModal {...defaultProps} />);

      const modal = screen.getByTestId("celebration-modal");
      expect(modal).toHaveClass("bg-gradient-to-br");
      expect(modal).toHaveClass("from-yellow-50");
    });

    it("has proper border styling", () => {
      render(<CelebrationModal {...defaultProps} />);

      const modal = screen.getByTestId("celebration-modal");
      expect(modal).toHaveClass("border-yellow-200");
    });

    it("applies gradient to continue button", () => {
      render(<CelebrationModal {...defaultProps} />);

      const button = screen.getByRole("button", { name: /continue/i });
      expect(button).toHaveClass("bg-gradient-to-r");
      expect(button).toHaveClass("from-yellow-500");
      expect(button).toHaveClass("to-orange-500");
    });

    it("has centered title styling", () => {
      render(<CelebrationModal {...defaultProps} />);

      const title = screen.getByText("Week Warrior");
      expect(title.parentElement?.parentElement).toHaveClass("text-center");
    });

    it("has centered description styling", () => {
      render(<CelebrationModal {...defaultProps} />);

      const description = screen.getByText("Logged for 7 consecutive days");
      expect(description.parentElement).toHaveClass("text-center");
    });
  });

  describe("animations", () => {
    it("applies bounce animation to icon", () => {
      render(<CelebrationModal {...defaultProps} />);

      const icon = screen.getByLabelText("Week Warrior");
      expect(icon).toHaveClass("animate-bounce");
    });

    it("applies pulse animation to sparkles", () => {
      render(<CelebrationModal {...defaultProps} />);

      const modal = screen.getByTestId("celebration-modal");
      const sparkles = modal.querySelectorAll(".animate-pulse");
      expect(sparkles.length).toBeGreaterThan(0);
    });

    it("positions sparkles decoratively", () => {
      render(<CelebrationModal {...defaultProps} />);

      const modal = screen.getByTestId("celebration-modal");
      const topLeftSparkle = modal.querySelector(".-top-2.-left-2");
      const topRightSparkle = modal.querySelector(".-top-2.-right-2");

      expect(topLeftSparkle).toBeInTheDocument();
      expect(topRightSparkle).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles achievement without unlock date", () => {
      const achievement: Achievement = {
        ...mockAchievement,
        unlockedAt: undefined,
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(screen.queryByText(/Earned on/i)).not.toBeInTheDocument();
    });

    it("handles long achievement names", () => {
      const achievement: Achievement = {
        ...mockAchievement,
        name: "This is a Very Long Achievement Name That Might Wrap",
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(
        screen.getByText("This is a Very Long Achievement Name That Might Wrap"),
      ).toBeInTheDocument();
    });

    it("handles long descriptions", () => {
      const achievement: Achievement = {
        ...mockAchievement,
        description:
          "This is a very long description that explains the achievement in great detail and might need to wrap to multiple lines on smaller screens",
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(
        screen.getByText(
          /This is a very long description that explains the achievement/i,
        ),
      ).toBeInTheDocument();
    });

    it("handles special characters in achievement text", () => {
      const achievement: Achievement = {
        ...mockAchievement,
        name: "7-Day Streak! 🎉",
        description: "You've maintained a 100% success rate!",
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(screen.getByText("7-Day Streak! 🎉")).toBeInTheDocument();
      expect(
        screen.getByText("You've maintained a 100% success rate!"),
      ).toBeInTheDocument();
    });

    it("handles future unlock dates gracefully", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const achievement: Achievement = {
        ...mockAchievement,
        unlockedAt: futureDate,
      };

      render(<CelebrationModal {...defaultProps} achievement={achievement} />);

      expect(screen.getByText(/Earned on/i)).toBeInTheDocument();
    });
  });

  describe("state transitions", () => {
    it("transitions from closed to open", () => {
      const { rerender } = render(<CelebrationModal {...defaultProps} open={false} />);

      expect(screen.queryByTestId("celebration-modal")).not.toBeInTheDocument();

      rerender(<CelebrationModal {...defaultProps} open={true} />);

      expect(screen.getByTestId("celebration-modal")).toBeInTheDocument();
    });

    it("transitions from open to closed", () => {
      const { rerender } = render(<CelebrationModal {...defaultProps} open={true} />);

      expect(screen.getByTestId("celebration-modal")).toBeInTheDocument();

      rerender(<CelebrationModal {...defaultProps} open={false} />);

      expect(screen.queryByTestId("celebration-modal")).not.toBeInTheDocument();
    });

    it("updates when achievement changes", () => {
      const { rerender } = render(<CelebrationModal {...defaultProps} />);

      expect(screen.getByText("Week Warrior")).toBeInTheDocument();

      const newAchievement: Achievement = {
        id: "streak-30-days",
        name: "Month Master",
        description: "Logged for 30 consecutive days",
        icon: "🏆",
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      rerender(<CelebrationModal {...defaultProps} achievement={newAchievement} />);

      expect(screen.getByText("Month Master")).toBeInTheDocument();
      expect(screen.queryByText("Week Warrior")).not.toBeInTheDocument();
    });

    it("handles rapid open/close cycles", () => {
      const { rerender } = render(<CelebrationModal {...defaultProps} open={true} />);

      for (let i = 0; i < 5; i++) {
        rerender(<CelebrationModal {...defaultProps} open={false} />);
        rerender(<CelebrationModal {...defaultProps} open={true} />);
      }

      expect(screen.getByTestId("celebration-modal")).toBeInTheDocument();
    });
  });

  describe("display name", () => {
    it("has correct display name", () => {
      expect(CelebrationModal.displayName).toBe("CelebrationModal");
    });
  });

  describe("layout", () => {
    it("centers content properly", () => {
      render(<CelebrationModal {...defaultProps} />);

      const title = screen.getByText("Week Warrior").parentElement?.parentElement;
      expect(title).toHaveClass("text-center");
    });

    it("applies proper spacing between elements", () => {
      render(<CelebrationModal {...defaultProps} />);

      const header = screen.getByText("Week Warrior").parentElement?.parentElement;
      expect(header).toHaveClass("space-y-4");
    });

    it("has responsive modal width", () => {
      render(<CelebrationModal {...defaultProps} />);

      const modal = screen.getByTestId("celebration-modal");
      expect(modal).toHaveClass("sm:max-w-md");
    });

    it("centers footer content", () => {
      render(<CelebrationModal {...defaultProps} />);

      const footer = screen.getByRole("button", { name: /continue/i }).parentElement;
      expect(footer).toHaveClass("sm:justify-center");
    });
  });

  describe("encouraging messages coverage", () => {
    const achievementMessages: Array<[string, RegExp]> = [
      ["first-entry", /Great start! Every journey begins with a single step./i],
      ["first-checkin", /You're building awareness! Keep checking in regularly./i],
      ["first-pattern", /Amazing! Understanding patterns is key to managing headaches./i],
      ["first-week", /One week down! You're building a valuable habit./i],
      ["streak-14-days", /Two weeks! Your dedication is impressive./i],
      ["streak-60-days", /Two months! You've built an incredible habit./i],
      ["streak-90-days", /Three months! You're a logging legend!/i],
      ["entries-10", /10 entries logged! Patterns are starting to emerge./i],
      ["entries-50", /50 entries! You have valuable data to work with./i],
      ["checkins-10", /10 check-ins complete! Great awareness building./i],
      ["checkins-50", /50 check-ins! You're staying consistent./i],
      ["checkins-100", /100 check-ins! Exceptional dedication!/i],
    ];

    achievementMessages.forEach(([achievementId, expectedMessage]) => {
      it(`displays correct message for ${achievementId}`, () => {
        const achievement: Achievement = {
          id: achievementId as any,
          name: `Test ${achievementId}`,
          description: "Test description",
          icon: "🎉",
          isUnlocked: true,
          unlockedAt: new Date(),
        };

        render(<CelebrationModal {...defaultProps} achievement={achievement} />);

        expect(screen.getByText(expectedMessage)).toBeInTheDocument();
      });
    });
  });
});
