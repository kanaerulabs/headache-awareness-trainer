import { render, screen, fireEvent } from "@testing-library/react";
import { AchievementBadge } from "@/components/molecules/AchievementBadge";
import type { Achievement } from "@/interface-adapters/store/gamificationStore";

describe("AchievementBadge", () => {
  const unlockedAchievement: Achievement = {
    id: "streak-7-days",
    name: "Week Warrior",
    description: "Logged for 7 consecutive days",
    icon: "⭐",
    isUnlocked: true,
    unlockedAt: new Date("2024-01-15T10:00:00Z"),
  };

  const lockedAchievement: Achievement = {
    id: "streak-30-days",
    name: "Month Master",
    description: "Logged for 30 consecutive days",
    icon: "🏆",
    isUnlocked: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering - unlocked state", () => {
    it("renders correctly with unlocked achievement", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      expect(screen.getByTestId("achievement-badge")).toBeInTheDocument();
      expect(screen.getByText("Week Warrior")).toBeInTheDocument();
      expect(
        screen.getByText("Logged for 7 consecutive days"),
      ).toBeInTheDocument();
      expect(screen.getByText("⭐")).toBeInTheDocument();
    });

    it("displays unlocked badge for unlocked achievements", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      expect(screen.getByText("Unlocked")).toBeInTheDocument();
    });

    it("displays unlock date when available", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      expect(screen.getByText(/Earned/i)).toBeInTheDocument();
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    });

    it("has hover styles for unlocked achievement", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveClass("hover:shadow-md");
      expect(card).not.toHaveClass("opacity-50");
      expect(card).not.toHaveClass("grayscale");
    });

    it("shows gradient background for unlocked icon", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      const iconContainer = screen
        .getByTestId("achievement-badge")
        .querySelector('[aria-hidden="true"]');
      expect(iconContainer).toHaveClass("bg-gradient-to-br");
      expect(iconContainer).toHaveClass("from-yellow-100");
    });
  });

  describe("rendering - locked state", () => {
    it("renders correctly with locked achievement", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      expect(screen.getByTestId("achievement-badge")).toBeInTheDocument();
      expect(screen.getByText("Month Master")).toBeInTheDocument();
      expect(
        screen.getByText("Logged for 30 consecutive days"),
      ).toBeInTheDocument();
    });

    it("does not display unlocked badge for locked achievements", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      expect(screen.queryByText("Unlocked")).not.toBeInTheDocument();
    });

    it("displays lock icon for locked achievements", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      const lockIcon = screen
        .getByTestId("achievement-badge")
        .querySelector("svg.lucide-lock");
      expect(lockIcon).toBeInTheDocument();
    });

    it("displays encouraging message for locked achievements", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      expect(screen.getByText("Keep going to unlock")).toBeInTheDocument();
    });

    it("has muted styles for locked achievement", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveClass("opacity-50");
      expect(card).toHaveClass("grayscale");
    });

    it("does not show unlock date for locked achievements", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      expect(screen.queryByText(/Earned/i)).not.toBeInTheDocument();
    });
  });

  describe("user interactions - unlocked achievement", () => {
    it("calls onClick when unlocked achievement is clicked", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("has button role when onClick is provided for unlocked achievement", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("handles Enter key press for unlocked achievement", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      fireEvent.keyDown(card, { key: "Enter" });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("handles Space key press for unlocked achievement", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      fireEvent.keyDown(card, { key: " " });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not respond to other keys", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      fireEvent.keyDown(card, { key: "Tab" });
      fireEvent.keyDown(card, { key: "Escape" });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("has active scale effect when onClick provided", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveClass("active:scale-[0.98]");
    });
  });

  describe("user interactions - locked achievement", () => {
    it("does not call onClick when locked achievement is clicked", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={lockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      fireEvent.click(card);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not have button role when locked", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={lockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      expect(card).not.toHaveAttribute("role", "button");
      expect(card).not.toHaveAttribute("tabIndex");
    });

    it("does not respond to keyboard events when locked", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={lockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      fireEvent.keyDown(card, { key: "Enter" });
      fireEvent.keyDown(card, { key: " " });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not have cursor pointer for locked achievement", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      const card = screen.getByTestId("achievement-badge");
      expect(card).not.toHaveClass("cursor-pointer");
    });
  });

  describe("accessibility", () => {
    it("hides decorative icon from screen readers", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      const iconContainer = screen
        .getByTestId("achievement-badge")
        .querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it("has proper text hierarchy for screen readers", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      const title = screen.getByText("Week Warrior");
      expect(title.tagName).toBe("H3");
      expect(title).toHaveClass("font-semibold");
    });

    it("provides keyboard navigation for unlocked achievements", () => {
      const handleClick = jest.fn();
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          onClick={handleClick}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("does not trap focus on locked achievements", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      const card = screen.getByTestId("achievement-badge");
      expect(card).not.toHaveAttribute("tabIndex");
    });

    it("has sufficient color contrast for text", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      const title = screen.getByText("Week Warrior");
      expect(title).toHaveClass("text-gray-900");
    });
  });

  describe("styling", () => {
    it("applies custom className when provided", () => {
      const customClass = "custom-achievement-class";
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          className={customClass}
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveClass(customClass);
    });

    it("maintains base styles with custom className", () => {
      render(
        <AchievementBadge
          achievement={unlockedAchievement}
          className="custom-class"
        />,
      );

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveClass("w-full");
      expect(card).toHaveClass("transition-all");
    });

    it("applies dark mode styles correctly", () => {
      render(<AchievementBadge achievement={lockedAchievement} />);

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveClass("dark:bg-gray-900");
    });
  });

  describe("edge cases", () => {
    it("handles achievement without onClick callback", () => {
      render(<AchievementBadge achievement={unlockedAchievement} />);

      const card = screen.getByTestId("achievement-badge");
      expect(() => fireEvent.click(card)).not.toThrow();
    });

    it("handles achievement with missing unlockedAt date", () => {
      const achievementWithoutDate: Achievement = {
        ...unlockedAchievement,
        unlockedAt: undefined,
      };

      render(<AchievementBadge achievement={achievementWithoutDate} />);

      expect(screen.queryByText(/Earned/i)).not.toBeInTheDocument();
    });

    it("handles long achievement names", () => {
      const longNameAchievement: Achievement = {
        ...unlockedAchievement,
        name: "This is a very long achievement name that might wrap to multiple lines",
      };

      render(<AchievementBadge achievement={longNameAchievement} />);

      expect(
        screen.getByText(
          "This is a very long achievement name that might wrap to multiple lines",
        ),
      ).toBeInTheDocument();
    });

    it("handles long descriptions", () => {
      const longDescAchievement: Achievement = {
        ...unlockedAchievement,
        description:
          "This is a very long description that explains the achievement in great detail and might wrap to multiple lines on smaller screens",
      };

      render(<AchievementBadge achievement={longDescAchievement} />);

      expect(
        screen.getByText(
          /This is a very long description that explains the achievement/i,
        ),
      ).toBeInTheDocument();
    });

    it("handles special characters in achievement text", () => {
      const specialCharAchievement: Achievement = {
        ...unlockedAchievement,
        name: "7-Day Streak! 🎉",
        description: "Logged for 7 consecutive days (100% success rate)",
      };

      render(<AchievementBadge achievement={specialCharAchievement} />);

      expect(screen.getByText("7-Day Streak! 🎉")).toBeInTheDocument();
      expect(
        screen.getByText("Logged for 7 consecutive days (100% success rate)"),
      ).toBeInTheDocument();
    });
  });

  describe("state transitions", () => {
    it("updates when achievement unlocks", () => {
      const { rerender } = render(
        <AchievementBadge achievement={lockedAchievement} />,
      );

      expect(screen.getByText("Keep going to unlock")).toBeInTheDocument();
      expect(screen.queryByText("Unlocked")).not.toBeInTheDocument();

      const nowUnlocked: Achievement = {
        ...lockedAchievement,
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      rerender(<AchievementBadge achievement={nowUnlocked} />);

      expect(screen.getByText("Unlocked")).toBeInTheDocument();
      expect(
        screen.queryByText("Keep going to unlock"),
      ).not.toBeInTheDocument();
    });

    it("removes grayscale effect when unlocked", () => {
      const { rerender } = render(
        <AchievementBadge achievement={lockedAchievement} />,
      );

      const card = screen.getByTestId("achievement-badge");
      expect(card).toHaveClass("grayscale");

      const nowUnlocked: Achievement = {
        ...lockedAchievement,
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      rerender(<AchievementBadge achievement={nowUnlocked} />);

      expect(card).not.toHaveClass("grayscale");
    });
  });

  describe("display name", () => {
    it("has correct display name", () => {
      expect(AchievementBadge.displayName).toBe("AchievementBadge");
    });
  });
});
