import { render, screen } from "@testing-library/react";
import { WeeklySummaryCard } from "@/components/molecules/WeeklySummaryCard";

describe("WeeklySummaryCard", () => {
  const defaultProps = {
    headacheCount: 3,
    checkinCount: 5,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders correctly with both counts", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      expect(screen.getByTestId("weekly-summary-card")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.getByTestId("headache-count")).toHaveTextContent("3");
      expect(screen.getByTestId("checkin-count")).toHaveTextContent("5");
    });

    it("renders Brain icon for headaches", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const icon = screen
        .getByTestId("weekly-summary-card")
        .querySelector('svg[class*="lucide-brain"]');
      expect(icon).toBeInTheDocument();
    });

    it("renders ClipboardCheck icon for check-ins", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const icon = screen
        .getByTestId("weekly-summary-card")
        .querySelector('svg[class*="lucide-clipboard-check"]');
      expect(icon).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-test-class";
      render(<WeeklySummaryCard {...defaultProps} className={customClass} />);

      const card = screen.getByTestId("weekly-summary-card");
      expect(card).toHaveClass(customClass);
    });

    it("displays title in header", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const title = screen.getByText("This Week");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("font-semibold");
    });
  });

  describe("headache count display", () => {
    it("displays singular 'Headache' for count of 1", () => {
      render(<WeeklySummaryCard headacheCount={1} checkinCount={0} />);

      expect(screen.getByText("Headache")).toBeInTheDocument();
      expect(screen.queryByText("Headaches")).not.toBeInTheDocument();
    });

    it("displays plural 'Headaches' for count of 0", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={5} />);

      expect(screen.getByText("Headaches")).toBeInTheDocument();
      expect(screen.queryByText("Headache")).not.toBeInTheDocument();
    });

    it("displays plural 'Headaches' for count greater than 1", () => {
      render(<WeeklySummaryCard headacheCount={5} checkinCount={3} />);

      expect(screen.getByText("Headaches")).toBeInTheDocument();
    });

    it("handles large headache counts", () => {
      render(<WeeklySummaryCard headacheCount={99} checkinCount={0} />);

      expect(screen.getByTestId("headache-count")).toHaveTextContent("99");
    });

    it("displays zero headaches correctly", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={5} />);

      expect(screen.getByTestId("headache-count")).toHaveTextContent("0");
    });
  });

  describe("check-in count display", () => {
    it("displays singular 'Check-in' for count of 1", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={1} />);

      expect(screen.getByText("Check-in")).toBeInTheDocument();
      expect(screen.queryByText("Check-ins")).not.toBeInTheDocument();
    });

    it("displays plural 'Check-ins' for count of 0", () => {
      render(<WeeklySummaryCard headacheCount={5} checkinCount={0} />);

      expect(screen.getByText("Check-ins")).toBeInTheDocument();
      expect(screen.queryByText("Check-in")).not.toBeInTheDocument();
    });

    it("displays plural 'Check-ins' for count greater than 1", () => {
      render(<WeeklySummaryCard headacheCount={3} checkinCount={5} />);

      expect(screen.getByText("Check-ins")).toBeInTheDocument();
    });

    it("handles large check-in counts", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={99} />);

      expect(screen.getByTestId("checkin-count")).toHaveTextContent("99");
    });

    it("displays zero check-ins correctly", () => {
      render(<WeeklySummaryCard headacheCount={5} checkinCount={0} />);

      expect(screen.getByTestId("checkin-count")).toHaveTextContent("0");
    });
  });

  describe("summary text", () => {
    it("displays 'No entries yet this week' when both counts are 0", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={0} />);

      expect(screen.getByText("No entries yet this week")).toBeInTheDocument();
    });

    it("displays 'Monday through today' when headache count > 0", () => {
      render(<WeeklySummaryCard headacheCount={1} checkinCount={0} />);

      expect(screen.getByText("Monday through today")).toBeInTheDocument();
      expect(
        screen.queryByText("No entries yet this week"),
      ).not.toBeInTheDocument();
    });

    it("displays 'Monday through today' when check-in count > 0", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={1} />);

      expect(screen.getByText("Monday through today")).toBeInTheDocument();
    });

    it("displays 'Monday through today' when both counts > 0", () => {
      render(<WeeklySummaryCard headacheCount={3} checkinCount={5} />);

      expect(screen.getByText("Monday through today")).toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("uses two-column grid for displaying stats", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const grid = screen
        .getByTestId("weekly-summary-card")
        .querySelector(".grid.grid-cols-2");
      expect(grid).toBeInTheDocument();
    });

    it("displays headache column on the left", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const columns = screen
        .getByTestId("weekly-summary-card")
        .querySelectorAll(".grid-cols-2 > div");
      expect(columns[0]).toContainElement(screen.getByTestId("headache-count"));
    });

    it("displays check-in column on the right", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const columns = screen
        .getByTestId("weekly-summary-card")
        .querySelectorAll(".grid-cols-2 > div");
      expect(columns[1]).toContainElement(screen.getByTestId("checkin-count"));
    });
  });

  describe("accessibility", () => {
    it("has proper card structure", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const card = screen.getByTestId("weekly-summary-card");
      expect(card).toBeInTheDocument();
    });

    it("hides decorative icons from screen readers", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const ariaHiddenElements = screen
        .getByTestId("weekly-summary-card")
        .querySelectorAll('[aria-hidden="true"]');
      expect(ariaHiddenElements.length).toBeGreaterThanOrEqual(2); // At least 2 icon containers
    });

    it("has accessible title structure", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const title = screen.getByText("This Week");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("font-semibold");
    });

    it("displays counts in accessible format", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const headacheCount = screen.getByTestId("headache-count");
      const checkinCount = screen.getByTestId("checkin-count");

      expect(headacheCount).toBeVisible();
      expect(checkinCount).toBeVisible();
    });

    it("provides context with labels for screen readers", () => {
      render(<WeeklySummaryCard headacheCount={5} checkinCount={3} />);

      expect(screen.getByText("Headaches")).toBeInTheDocument();
      expect(screen.getByText("Check-ins")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("applies red styling to headache column", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const headacheColumn = screen.getByTestId("headache-count").parentElement;
      expect(headacheColumn).toHaveClass("bg-red-50");
    });

    it("applies teal styling to check-in column", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const checkinColumn = screen.getByTestId("checkin-count").parentElement;
      expect(checkinColumn).toHaveClass("bg-teal-50");
    });

    it("has proper border styling on columns", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const headacheColumn = screen.getByTestId("headache-count").parentElement;
      const checkinColumn = screen.getByTestId("checkin-count").parentElement;

      expect(headacheColumn).toHaveClass("border");
      expect(checkinColumn).toHaveClass("border");
    });
  });

  describe("edge cases", () => {
    it("handles maximum safe integer counts", () => {
      const maxCount = Number.MAX_SAFE_INTEGER;
      render(
        <WeeklySummaryCard headacheCount={maxCount} checkinCount={maxCount} />,
      );

      expect(screen.getByTestId("headache-count")).toHaveTextContent(
        String(maxCount),
      );
      expect(screen.getByTestId("checkin-count")).toHaveTextContent(
        String(maxCount),
      );
    });

    it("handles negative counts gracefully", () => {
      render(<WeeklySummaryCard headacheCount={-1} checkinCount={-5} />);

      expect(screen.getByTestId("headache-count")).toHaveTextContent("-1");
      expect(screen.getByTestId("checkin-count")).toHaveTextContent("-5");
    });

    it("updates display when counts change", () => {
      const { rerender } = render(
        <WeeklySummaryCard headacheCount={3} checkinCount={5} />,
      );

      expect(screen.getByTestId("headache-count")).toHaveTextContent("3");
      expect(screen.getByTestId("checkin-count")).toHaveTextContent("5");

      rerender(<WeeklySummaryCard headacheCount={10} checkinCount={15} />);

      expect(screen.getByTestId("headache-count")).toHaveTextContent("10");
      expect(screen.getByTestId("checkin-count")).toHaveTextContent("15");
    });

    it("renders consistently across multiple re-renders", () => {
      const { rerender } = render(<WeeklySummaryCard {...defaultProps} />);
      const firstHeadacheCount = screen.getByTestId("headache-count");

      rerender(<WeeklySummaryCard {...defaultProps} />);
      const secondHeadacheCount = screen.getByTestId("headache-count");

      expect(firstHeadacheCount.textContent).toBe(
        secondHeadacheCount.textContent,
      );
    });

    it("handles rapid prop changes", () => {
      const { rerender } = render(
        <WeeklySummaryCard headacheCount={0} checkinCount={0} />,
      );

      for (let i = 1; i <= 10; i++) {
        rerender(<WeeklySummaryCard headacheCount={i} checkinCount={i} />);
        expect(screen.getByTestId("headache-count")).toHaveTextContent(
          String(i),
        );
        expect(screen.getByTestId("checkin-count")).toHaveTextContent(
          String(i),
        );
      }
    });
  });

  describe("responsiveness", () => {
    it("maintains two-column layout structure", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const grid = screen
        .getByTestId("weekly-summary-card")
        .querySelector(".grid-cols-2");
      expect(grid).toBeInTheDocument();
    });

    it("applies gap between columns", () => {
      render(<WeeklySummaryCard {...defaultProps} />);

      const grid = screen
        .getByTestId("weekly-summary-card")
        .querySelector(".gap-4");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty state when no entries exist", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={0} />);

      expect(screen.getByText("No entries yet this week")).toBeInTheDocument();
    });

    it("still displays 0 counts in empty state", () => {
      render(<WeeklySummaryCard headacheCount={0} checkinCount={0} />);

      expect(screen.getByTestId("headache-count")).toHaveTextContent("0");
      expect(screen.getByTestId("checkin-count")).toHaveTextContent("0");
    });

    it("exits empty state when any count becomes > 0", () => {
      const { rerender } = render(
        <WeeklySummaryCard headacheCount={0} checkinCount={0} />,
      );
      expect(screen.getByText("No entries yet this week")).toBeInTheDocument();

      rerender(<WeeklySummaryCard headacheCount={1} checkinCount={0} />);
      expect(
        screen.queryByText("No entries yet this week"),
      ).not.toBeInTheDocument();
    });
  });
});
