import { render, screen, fireEvent } from "@testing-library/react";
import { QuickActionButtons } from "@/components/molecules/QuickActionButtons";

describe("QuickActionButtons", () => {
  const defaultProps = {
    onLogHeadache: jest.fn(),
    onCheckIn: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders both buttons correctly", () => {
      render(<QuickActionButtons {...defaultProps} />);

      expect(screen.getByTestId("quick-action-buttons")).toBeInTheDocument();
      expect(screen.getByTestId("log-headache-button")).toBeInTheDocument();
      expect(screen.getByTestId("check-in-button")).toBeInTheDocument();
    });

    it("displays 'Log Headache' button text", () => {
      render(<QuickActionButtons {...defaultProps} />);

      expect(screen.getByText("Log Headache")).toBeInTheDocument();
    });

    it("displays 'Quick Check-in' button text", () => {
      render(<QuickActionButtons {...defaultProps} />);

      expect(screen.getByText("Quick Check-in")).toBeInTheDocument();
    });

    it("renders Brain icon for Log Headache button", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("log-headache-button");
      const icon = button.querySelector('svg[class*="lucide-brain"]');
      expect(icon).toBeInTheDocument();
    });

    it("renders ClipboardList icon for Check-in button", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("check-in-button");
      const icon = button.querySelector('svg[class*="lucide-clipboard-list"]');
      expect(icon).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-test-class";
      render(<QuickActionButtons {...defaultProps} className={customClass} />);

      const container = screen.getByTestId("quick-action-buttons");
      expect(container).toHaveClass(customClass);
    });
  });

  describe("click handlers", () => {
    it("calls onLogHeadache when Log Headache button is clicked", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("log-headache-button");
      fireEvent.click(button);

      expect(defaultProps.onLogHeadache).toHaveBeenCalledTimes(1);
      expect(defaultProps.onCheckIn).not.toHaveBeenCalled();
    });

    it("calls onCheckIn when Check-in button is clicked", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("check-in-button");
      fireEvent.click(button);

      expect(defaultProps.onCheckIn).toHaveBeenCalledTimes(1);
      expect(defaultProps.onLogHeadache).not.toHaveBeenCalled();
    });

    it("handles multiple rapid clicks on Log Headache", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("log-headache-button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(defaultProps.onLogHeadache).toHaveBeenCalledTimes(3);
    });

    it("handles multiple rapid clicks on Check-in", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("check-in-button");
      fireEvent.click(button);
      fireEvent.click(button);

      expect(defaultProps.onCheckIn).toHaveBeenCalledTimes(2);
    });

    it("allows clicking both buttons independently", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      fireEvent.click(headacheButton);
      fireEvent.click(checkinButton);
      fireEvent.click(headacheButton);

      expect(defaultProps.onLogHeadache).toHaveBeenCalledTimes(2);
      expect(defaultProps.onCheckIn).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled state", () => {
    it("disables both buttons when disabled prop is true", () => {
      render(<QuickActionButtons {...defaultProps} disabled={true} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).toBeDisabled();
      expect(checkinButton).toBeDisabled();
    });

    it("enables both buttons when disabled prop is false", () => {
      render(<QuickActionButtons {...defaultProps} disabled={false} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).not.toBeDisabled();
      expect(checkinButton).not.toBeDisabled();
    });

    it("enables both buttons by default when disabled is not provided", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).not.toBeDisabled();
      expect(checkinButton).not.toBeDisabled();
    });

    it("does not call handlers when buttons are disabled", () => {
      render(<QuickActionButtons {...defaultProps} disabled={true} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      fireEvent.click(headacheButton);
      fireEvent.click(checkinButton);

      expect(defaultProps.onLogHeadache).not.toHaveBeenCalled();
      expect(defaultProps.onCheckIn).not.toHaveBeenCalled();
    });

    it("re-enables buttons when disabled changes from true to false", () => {
      const { rerender } = render(
        <QuickActionButtons {...defaultProps} disabled={true} />,
      );

      let headacheButton = screen.getByTestId("log-headache-button");
      expect(headacheButton).toBeDisabled();

      rerender(<QuickActionButtons {...defaultProps} disabled={false} />);

      headacheButton = screen.getByTestId("log-headache-button");
      expect(headacheButton).not.toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("Log Headache button has appropriate aria-label", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("log-headache-button");
      expect(button).toHaveAttribute("aria-label", "Log a headache episode");
    });

    it("Check-in button has appropriate aria-label", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("check-in-button");
      expect(button).toHaveAttribute(
        "aria-label",
        "Record a wellness check-in",
      );
    });

    it("icons are hidden from screen readers", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      const headacheIcon = headacheButton.querySelector('svg[aria-hidden]');
      const checkinIcon = checkinButton.querySelector('svg[aria-hidden]');

      expect(headacheIcon).toHaveAttribute("aria-hidden", "true");
      expect(checkinIcon).toHaveAttribute("aria-hidden", "true");
    });

    it("buttons are keyboard accessible", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      headacheButton.focus();
      expect(document.activeElement).toBe(headacheButton);

      checkinButton.focus();
      expect(document.activeElement).toBe(checkinButton);
    });

    it("buttons are rendered as button elements", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton.tagName).toBe("BUTTON");
      expect(checkinButton.tagName).toBe("BUTTON");
    });

    it("disabled buttons are not keyboard accessible", () => {
      render(<QuickActionButtons {...defaultProps} disabled={true} />);

      const headacheButton = screen.getByTestId("log-headache-button");

      headacheButton.focus();
      // Disabled buttons should not receive focus
      expect(document.activeElement).not.toBe(headacheButton);
    });
  });

  describe("layout", () => {
    it("uses grid layout for button container", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const container = screen.getByTestId("quick-action-buttons");
      expect(container).toHaveClass("grid");
    });

    it("displays as single column on mobile (grid-cols-1)", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const container = screen.getByTestId("quick-action-buttons");
      expect(container).toHaveClass("grid-cols-1");
    });

    it("displays as two columns on larger screens (sm:grid-cols-2)", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const container = screen.getByTestId("quick-action-buttons");
      expect(container).toHaveClass("sm:grid-cols-2");
    });

    it("has gap between buttons", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const container = screen.getByTestId("quick-action-buttons");
      expect(container).toHaveClass("gap-3");
    });

    it("buttons use flex column layout to stack icon and text", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      expect(headacheButton).toHaveClass("flex");
      expect(headacheButton).toHaveClass("flex-col");
    });

    it("buttons center their content", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      expect(headacheButton).toHaveClass("items-center");
      expect(headacheButton).toHaveClass("justify-center");
    });
  });

  describe("styling", () => {
    it("Log Headache button has primary red styling", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("log-headache-button");
      expect(button).toHaveClass("bg-red-600");
      expect(button).toHaveClass("text-white");
    });

    it("Check-in button has outline styling", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const button = screen.getByTestId("check-in-button");
      expect(button).toHaveClass("border-2");
      expect(button).toHaveClass("border-blue-600");
    });

    it("buttons have large size", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).toHaveClass("h-20");
      expect(checkinButton).toHaveClass("h-20");
    });

    it("buttons have shadow effects", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).toHaveClass("shadow-md");
      expect(checkinButton).toHaveClass("shadow-md");
    });

    it("buttons have hover shadow effects", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      expect(headacheButton).toHaveClass("hover:shadow-lg");
    });

    it("buttons have active scale animation", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).toHaveClass("active:scale-95");
      expect(checkinButton).toHaveClass("active:scale-95");
    });

    it("buttons have transition effects", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).toHaveClass("transition-all");
      expect(checkinButton).toHaveClass("transition-all");
    });
  });

  describe("touch targets", () => {
    it("buttons have large touch targets for mobile", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      // Minimum 48x48px recommended, these are 80px (h-20)
      expect(headacheButton).toHaveClass("h-20");
      expect(headacheButton).toHaveClass("w-full");
      expect(checkinButton).toHaveClass("h-20");
      expect(checkinButton).toHaveClass("w-full");
    });

    it("buttons expand to full width", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      expect(headacheButton).toHaveClass("w-full");
      expect(checkinButton).toHaveClass("w-full");
    });
  });

  describe("edge cases", () => {
    it("handles callback changes", () => {
      const newOnLogHeadache = jest.fn();
      const { rerender } = render(<QuickActionButtons {...defaultProps} />);

      rerender(
        <QuickActionButtons
          onLogHeadache={newOnLogHeadache}
          onCheckIn={defaultProps.onCheckIn}
        />,
      );

      const button = screen.getByTestId("log-headache-button");
      fireEvent.click(button);

      expect(newOnLogHeadache).toHaveBeenCalledTimes(1);
      expect(defaultProps.onLogHeadache).not.toHaveBeenCalled();
    });

    it("renders consistently across multiple re-renders", () => {
      const { rerender } = render(<QuickActionButtons {...defaultProps} />);
      const firstHeadacheButton = screen.getByTestId("log-headache-button");

      rerender(<QuickActionButtons {...defaultProps} />);
      const secondHeadacheButton = screen.getByTestId("log-headache-button");

      expect(firstHeadacheButton.textContent).toBe(
        secondHeadacheButton.textContent,
      );
    });

    it("handles rapid state changes between enabled and disabled", () => {
      const { rerender } = render(
        <QuickActionButtons {...defaultProps} disabled={false} />,
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <QuickActionButtons {...defaultProps} disabled={i % 2 === 0} />,
        );
        const button = screen.getByTestId("log-headache-button");
        if (i % 2 === 0) {
          expect(button).toBeDisabled();
        } else {
          expect(button).not.toBeDisabled();
        }
      }
    });

    it("maintains visual hierarchy between primary and secondary buttons", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      const checkinButton = screen.getByTestId("check-in-button");

      // Log Headache is primary (filled background)
      expect(headacheButton).toHaveClass("bg-red-600");

      // Check-in is secondary (outline)
      expect(checkinButton).toHaveClass("border-2");
      expect(checkinButton).not.toHaveClass("bg-red-600");
    });
  });

  describe("responsive text sizing", () => {
    it("buttons have responsive text size", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      expect(headacheButton).toHaveClass("text-base");
      expect(headacheButton).toHaveClass("sm:text-lg");
    });

    it("buttons have responsive height", () => {
      render(<QuickActionButtons {...defaultProps} />);

      const headacheButton = screen.getByTestId("log-headache-button");
      expect(headacheButton).toHaveClass("h-20");
      expect(headacheButton).toHaveClass("sm:h-24");
    });
  });
});
