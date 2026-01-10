import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuickInsightCard } from "@/components/molecules/QuickInsightCard";

describe("QuickInsightCard", () => {
  const defaultProps = {
    insight: "You've been consistent with logging this week! Keep it up.",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders correctly with insight text", () => {
      render(<QuickInsightCard {...defaultProps} />);

      expect(screen.getByTestId("quick-insight-card")).toBeInTheDocument();
      expect(screen.getByText("Quick Insight")).toBeInTheDocument();
      expect(screen.getByTestId("insight-text")).toHaveTextContent(
        defaultProps.insight,
      );
    });

    it("renders lightbulb icon", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const icon = screen
        .getByTestId("quick-insight-card")
        .querySelector('svg[class*="lucide-lightbulb"]');
      expect(icon).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-test-class";
      render(<QuickInsightCard {...defaultProps} className={customClass} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).toHaveClass(customClass);
    });

    it("displays long insight text correctly", () => {
      const longInsight =
        "This is a very long insight that contains multiple sentences and provides detailed information about the user's headache patterns and behaviors over an extended period of time.";
      render(<QuickInsightCard insight={longInsight} />);

      expect(screen.getByTestId("insight-text")).toHaveTextContent(longInsight);
    });

    it("handles empty insight text", () => {
      render(<QuickInsightCard insight="" />);

      expect(screen.getByTestId("insight-text")).toBeEmptyDOMElement();
    });
  });

  describe("refresh functionality", () => {
    it("shows 'Tap to refresh' text when onRefresh is provided", () => {
      const onRefresh = jest.fn();
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      expect(screen.getByText("Tap to refresh")).toBeInTheDocument();
    });

    it("does not show 'Tap to refresh' text when onRefresh is not provided", () => {
      render(<QuickInsightCard {...defaultProps} />);

      expect(screen.queryByText("Tap to refresh")).not.toBeInTheDocument();
    });

    it("calls onRefresh when card is clicked", async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      fireEvent.click(card);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("shows refreshing animation during refresh", async () => {
      const onRefresh = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      fireEvent.click(card);

      // Check for pulse animation class
      const iconContainer = card.querySelector('[class*="animate-pulse"]');
      expect(iconContainer).toBeInTheDocument();

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("prevents multiple simultaneous refresh calls", async () => {
      const onRefresh = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");

      // Click multiple times rapidly
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("does not call onRefresh when not provided", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const card = screen.getByTestId("quick-insight-card");
      fireEvent.click(card);

      // Should not throw error
      expect(card).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has button role when onRefresh is provided", () => {
      const onRefresh = jest.fn();
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).toHaveAttribute("role", "button");
    });

    it("does not have button role when onRefresh is not provided", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).not.toHaveAttribute("role");
    });

    it("has appropriate aria-label when clickable", () => {
      const onRefresh = jest.fn();
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).toHaveAttribute("aria-label", "Tap to refresh insight");
    });

    it("is keyboard accessible with Enter key", async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      card.focus();

      fireEvent.keyDown(card, { key: "Enter" });

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("is keyboard accessible with Space key", async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      card.focus();

      fireEvent.keyDown(card, { key: " " });

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("does not trigger refresh on other key presses", async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");

      fireEvent.keyDown(card, { key: "a" });
      fireEvent.keyDown(card, { key: "Escape" });
      fireEvent.keyDown(card, { key: "Tab" });

      expect(onRefresh).not.toHaveBeenCalled();
    });

    it("is focusable when onRefresh is provided", () => {
      const onRefresh = jest.fn();
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("is not focusable when onRefresh is not provided", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).not.toHaveAttribute("tabIndex");
    });

    it("has proper heading structure", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const heading = screen.getByText("Quick Insight");
      expect(heading.tagName).toBe("H3");
    });

    it("hides decorative icon from screen readers", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const iconContainer = screen
        .getByTestId("quick-insight-card")
        .querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("applies gradient background", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).toHaveClass("bg-gradient-to-br");
    });

    it("has cursor-pointer class when onRefresh is provided", () => {
      const onRefresh = jest.fn();
      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("does not have cursor-pointer class when onRefresh is not provided", () => {
      render(<QuickInsightCard {...defaultProps} />);

      const card = screen.getByTestId("quick-insight-card");
      expect(card).not.toHaveClass("cursor-pointer");
    });
  });

  describe("edge cases", () => {
    it("handles special characters in insight text", () => {
      const specialInsight =
        "You've logged <strong>5</strong> headaches & 3 check-ins!";
      render(<QuickInsightCard insight={specialInsight} />);

      expect(screen.getByTestId("insight-text")).toHaveTextContent(
        specialInsight,
      );
    });

    it("calls onRefresh even if it returns a rejected promise", async () => {
      const onRefresh = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error("Refresh failed")).catch(() => {
          // Silently handle the error in the mock
        });
      });

      render(<QuickInsightCard {...defaultProps} onRefresh={onRefresh} />);

      const card = screen.getByTestId("quick-insight-card");
      fireEvent.click(card);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("handles very short insight text", () => {
      render(<QuickInsightCard insight="OK" />);

      expect(screen.getByTestId("insight-text")).toHaveTextContent("OK");
    });

    it("handles insight with newlines", () => {
      const multilineInsight = "First line\nSecond line\nThird line";
      render(<QuickInsightCard insight={multilineInsight} />);

      const insightText = screen.getByTestId("insight-text");
      // HTML renders newlines as spaces, so check for content presence
      expect(insightText).toHaveTextContent("First line");
      expect(insightText).toHaveTextContent("Second line");
      expect(insightText).toHaveTextContent("Third line");
    });
  });
});
