import { render, screen } from "@testing-library/react";
import { StreakDisplay } from "@/components/molecules/StreakDisplay";

describe("StreakDisplay", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders correctly with streak count", () => {
      render(<StreakDisplay streak={5} />);

      expect(screen.getByTestId("streak-display")).toBeInTheDocument();
      expect(screen.getByTestId("streak-count")).toHaveTextContent("5");
    });

    it("renders flame icon", () => {
      render(<StreakDisplay streak={5} />);

      const icon = screen
        .getByTestId("streak-display")
        .querySelector('svg[class*="lucide-flame"]');
      expect(icon).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-test-class";
      render(<StreakDisplay streak={5} className={customClass} />);

      const card = screen.getByTestId("streak-display");
      expect(card).toHaveClass(customClass);
    });

    it("displays correct singular form for 1 day", () => {
      render(<StreakDisplay streak={1} />);

      expect(screen.getByText("day")).toBeInTheDocument();
      expect(screen.queryByText("days")).not.toBeInTheDocument();
    });

    it("displays correct plural form for multiple days", () => {
      render(<StreakDisplay streak={5} />);

      expect(screen.getByText("days")).toBeInTheDocument();
      expect(screen.queryByText("day")).not.toBeInTheDocument();
    });

    it("displays correct plural form for 0 days", () => {
      render(<StreakDisplay streak={0} />);

      expect(screen.getByText("days")).toBeInTheDocument();
    });
  });

  describe("milestone styling - no streak (0 days)", () => {
    it("displays 'No streak yet' label for 0 days", () => {
      render(<StreakDisplay streak={0} />);

      expect(screen.getByText("No streak yet")).toBeInTheDocument();
    });

    it("applies gray styling for 0 days", () => {
      render(<StreakDisplay streak={0} />);

      const count = screen.getByTestId("streak-count");
      expect(count).toHaveClass("text-gray-500");
    });

    it("flame icon is not filled for 0 days", () => {
      render(<StreakDisplay streak={0} />);

      const flame = screen
        .getByTestId("streak-display")
        .querySelector('svg[class*="lucide-flame"]');
      expect(flame).not.toHaveAttribute("fill", "currentColor");
    });
  });

  describe("milestone styling - building consistency (1-6 days)", () => {
    it.each([1, 3, 6])(
      "displays 'Building consistency' label for %i days",
      (streak) => {
        render(<StreakDisplay streak={streak} />);

        expect(screen.getByText("Building consistency")).toBeInTheDocument();
      },
    );

    it("applies blue styling for 1-6 days", () => {
      render(<StreakDisplay streak={5} />);

      const count = screen.getByTestId("streak-count");
      expect(count).toHaveClass("text-blue-700");
    });

    it("flame icon is filled for active streak", () => {
      render(<StreakDisplay streak={5} />);

      const flame = screen
        .getByTestId("streak-display")
        .querySelector('svg[class*="lucide-flame"]');
      expect(flame).toHaveAttribute("fill", "currentColor");
    });
  });

  describe("milestone styling - one week (7-13 days)", () => {
    it.each([7, 10, 13])(
      "displays 'One week milestone! 🎉' label for %i days",
      (streak) => {
        render(<StreakDisplay streak={streak} />);

        expect(screen.getByText("One week milestone! 🎉")).toBeInTheDocument();
      },
    );

    it("applies green styling for 7-13 days", () => {
      render(<StreakDisplay streak={10} />);

      const count = screen.getByTestId("streak-count");
      expect(count).toHaveClass("text-green-700");
    });

    it("icon container has pulse animation for 7+ days", () => {
      render(<StreakDisplay streak={7} />);

      const iconContainer = screen
        .getByTestId("streak-display")
        .querySelector('[class*="animate-pulse"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("milestone styling - two weeks (14-29 days)", () => {
    it.each([14, 20, 29])(
      "displays 'Two week milestone! 🔥' label for %i days",
      (streak) => {
        render(<StreakDisplay streak={streak} />);

        expect(screen.getByText("Two week milestone! 🔥")).toBeInTheDocument();
      },
    );

    it("applies orange styling for 14-29 days", () => {
      render(<StreakDisplay streak={20} />);

      const count = screen.getByTestId("streak-count");
      expect(count).toHaveClass("text-orange-700");
    });
  });

  describe("milestone styling - one month (30+ days)", () => {
    it.each([30, 50, 100])(
      "displays 'One month milestone! 🏆' label for %i days",
      (streak) => {
        render(<StreakDisplay streak={streak} />);

        expect(screen.getByText("One month milestone! 🏆")).toBeInTheDocument();
      },
    );

    it("applies gradient text styling for 30+ days", () => {
      render(<StreakDisplay streak={30} />);

      const count = screen.getByTestId("streak-count");
      expect(count).toHaveClass("text-transparent");
      expect(count).toHaveClass("bg-gradient-to-r");
      expect(count).toHaveClass("bg-clip-text");
    });

    it("icon container has pulse animation for 30+ days", () => {
      render(<StreakDisplay streak={30} />);

      const iconContainer = screen
        .getByTestId("streak-display")
        .querySelector('[class*="animate-pulse"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("milestone boundaries", () => {
    it("transitions correctly at 7 day boundary", () => {
      const { rerender } = render(<StreakDisplay streak={6} />);
      expect(screen.getByText("Building consistency")).toBeInTheDocument();

      rerender(<StreakDisplay streak={7} />);
      expect(screen.getByText("One week milestone! 🎉")).toBeInTheDocument();
    });

    it("transitions correctly at 14 day boundary", () => {
      const { rerender } = render(<StreakDisplay streak={13} />);
      expect(screen.getByText("One week milestone! 🎉")).toBeInTheDocument();

      rerender(<StreakDisplay streak={14} />);
      expect(screen.getByText("Two week milestone! 🔥")).toBeInTheDocument();
    });

    it("transitions correctly at 30 day boundary", () => {
      const { rerender } = render(<StreakDisplay streak={29} />);
      expect(screen.getByText("Two week milestone! 🔥")).toBeInTheDocument();

      rerender(<StreakDisplay streak={30} />);
      expect(screen.getByText("One month milestone! 🏆")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has proper card structure", () => {
      render(<StreakDisplay streak={5} />);

      const card = screen.getByTestId("streak-display");
      expect(card).toBeInTheDocument();
    });

    it("hides decorative icon from screen readers", () => {
      render(<StreakDisplay streak={5} />);

      const iconContainer = screen
        .getByTestId("streak-display")
        .querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it("displays streak count in accessible format", () => {
      render(<StreakDisplay streak={15} />);

      const count = screen.getByTestId("streak-count");
      expect(count).toHaveTextContent("15");
      expect(count).toBeVisible();
    });

    it("provides context with days label", () => {
      render(<StreakDisplay streak={5} />);

      expect(screen.getByText("days")).toBeInTheDocument();
      expect(screen.getByText("Building consistency")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("applies gradient background", () => {
      render(<StreakDisplay streak={5} />);

      const card = screen.getByTestId("streak-display");
      expect(card).toHaveClass("bg-gradient-to-br");
    });

    it("applies appropriate border colors based on streak", () => {
      const { rerender } = render(<StreakDisplay streak={0} />);
      let card = screen.getByTestId("streak-display");
      expect(card).toHaveClass("border-gray-200");

      rerender(<StreakDisplay streak={5} />);
      card = screen.getByTestId("streak-display");
      expect(card).toHaveClass("border-blue-200");

      rerender(<StreakDisplay streak={10} />);
      card = screen.getByTestId("streak-display");
      expect(card).toHaveClass("border-green-200");

      rerender(<StreakDisplay streak={20} />);
      card = screen.getByTestId("streak-display");
      expect(card).toHaveClass("border-orange-200");

      rerender(<StreakDisplay streak={30} />);
      card = screen.getByTestId("streak-display");
      expect(card).toHaveClass("border-red-200");
    });
  });

  describe("edge cases", () => {
    it("handles very large streak numbers", () => {
      render(<StreakDisplay streak={365} />);

      expect(screen.getByTestId("streak-count")).toHaveTextContent("365");
      expect(screen.getByText("One month milestone! 🏆")).toBeInTheDocument();
    });

    it("handles negative streak (treated as 0)", () => {
      render(<StreakDisplay streak={-5} />);

      expect(screen.getByTestId("streak-count")).toHaveTextContent("-5");
    });

    it("renders consistently across re-renders with same streak", () => {
      const { rerender } = render(<StreakDisplay streak={10} />);
      const firstLabel = screen.getByText("One week milestone! 🎉");

      rerender(<StreakDisplay streak={10} />);
      const secondLabel = screen.getByText("One week milestone! 🎉");

      expect(firstLabel).toEqual(secondLabel);
    });

    it("updates display when streak changes", () => {
      const { rerender } = render(<StreakDisplay streak={5} />);
      expect(screen.getByTestId("streak-count")).toHaveTextContent("5");

      rerender(<StreakDisplay streak={10} />);
      expect(screen.getByTestId("streak-count")).toHaveTextContent("10");
    });
  });

  describe("visual feedback", () => {
    it("shows pulse animation only for streaks >= 7 days", () => {
      const { rerender } = render(<StreakDisplay streak={6} />);
      let pulseElement = screen
        .getByTestId("streak-display")
        .querySelector('[class*="animate-pulse"]');
      expect(pulseElement).not.toBeInTheDocument();

      rerender(<StreakDisplay streak={7} />);
      pulseElement = screen
        .getByTestId("streak-display")
        .querySelector('[class*="animate-pulse"]');
      expect(pulseElement).toBeInTheDocument();
    });

    it("fills flame icon for active streaks (> 0)", () => {
      const { rerender } = render(<StreakDisplay streak={0} />);
      let flame = screen
        .getByTestId("streak-display")
        .querySelector('svg[class*="lucide-flame"]');
      expect(flame).not.toHaveAttribute("fill", "currentColor");

      rerender(<StreakDisplay streak={1} />);
      flame = screen
        .getByTestId("streak-display")
        .querySelector('svg[class*="lucide-flame"]');
      expect(flame).toHaveAttribute("fill", "currentColor");
    });
  });
});
