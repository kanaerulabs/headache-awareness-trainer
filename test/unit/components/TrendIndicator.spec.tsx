import { render, screen } from "@testing-library/react";
import { TrendIndicator, Trend } from "@/components/molecules/TrendIndicator";

describe("TrendIndicator", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders correctly with improving trend", () => {
      render(<TrendIndicator trend="improving" />);

      expect(screen.getByTestId("trend-indicator")).toBeInTheDocument();
      expect(screen.getByText("Improving")).toBeInTheDocument();
    });

    it("renders correctly with stable trend", () => {
      render(<TrendIndicator trend="stable" />);

      expect(screen.getByTestId("trend-indicator")).toBeInTheDocument();
      expect(screen.getByText("Stable")).toBeInTheDocument();
    });

    it("renders correctly with declining trend", () => {
      render(<TrendIndicator trend="declining" />);

      expect(screen.getByTestId("trend-indicator")).toBeInTheDocument();
      expect(screen.getByText("Declining")).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-test-class";
      render(<TrendIndicator trend="improving" className={customClass} />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass(customClass);
    });
  });

  describe("icons", () => {
    it("displays TrendingUp icon for improving trend", () => {
      render(<TrendIndicator trend="improving" />);

      const icon = screen
        .getByTestId("trend-indicator")
        .querySelector('svg[class*="lucide-trending-up"]');
      expect(icon).toBeInTheDocument();
    });

    it("displays Minus icon for stable trend", () => {
      render(<TrendIndicator trend="stable" />);

      const icon = screen
        .getByTestId("trend-indicator")
        .querySelector('svg[class*="lucide-minus"]');
      expect(icon).toBeInTheDocument();
    });

    it("displays TrendingDown icon for declining trend", () => {
      render(<TrendIndicator trend="declining" />);

      const icon = screen
        .getByTestId("trend-indicator")
        .querySelector('svg[class*="lucide-trending-down"]');
      expect(icon).toBeInTheDocument();
    });

    it("hides icons from screen readers", () => {
      render(<TrendIndicator trend="improving" />);

      const icon = screen
        .getByTestId("trend-indicator")
        .querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe("label display", () => {
    it("shows label by default", () => {
      render(<TrendIndicator trend="improving" />);

      expect(screen.getByText("Improving")).toBeInTheDocument();
    });

    it("shows label when showLabel is true", () => {
      render(<TrendIndicator trend="stable" showLabel={true} />);

      expect(screen.getByText("Stable")).toBeInTheDocument();
    });

    it("hides label when showLabel is false", () => {
      render(<TrendIndicator trend="improving" showLabel={false} />);

      expect(screen.queryByText("Improving")).not.toBeInTheDocument();
    });

    it("still shows icon when label is hidden", () => {
      render(<TrendIndicator trend="improving" showLabel={false} />);

      const icon = screen
        .getByTestId("trend-indicator")
        .querySelector('svg[class*="lucide-trending-up"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe("styling - improving trend", () => {
    it("applies green color to improving trend", () => {
      render(<TrendIndicator trend="improving" />);

      const label = screen.getByText("Improving");
      expect(label).toHaveClass("text-green-600");
    });

    it("applies green background to improving trend", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("bg-green-50");
    });

    it("applies green border to improving trend", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("border-green-200");
    });
  });

  describe("styling - stable trend", () => {
    it("applies gray color to stable trend", () => {
      render(<TrendIndicator trend="stable" />);

      const label = screen.getByText("Stable");
      expect(label).toHaveClass("text-gray-600");
    });

    it("applies gray background to stable trend", () => {
      render(<TrendIndicator trend="stable" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("bg-gray-50");
    });

    it("applies gray border to stable trend", () => {
      render(<TrendIndicator trend="stable" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("border-gray-200");
    });
  });

  describe("styling - declining trend", () => {
    it("applies amber color to declining trend", () => {
      render(<TrendIndicator trend="declining" />);

      const label = screen.getByText("Declining");
      expect(label).toHaveClass("text-amber-600");
    });

    it("applies amber background to declining trend", () => {
      render(<TrendIndicator trend="declining" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("bg-amber-50");
    });

    it("applies amber border to declining trend", () => {
      render(<TrendIndicator trend="declining" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("border-amber-200");
    });
  });

  describe("accessibility", () => {
    it("has role='status' for screen readers", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveAttribute("role", "status");
    });

    it("has appropriate aria-label for improving trend", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveAttribute(
        "aria-label",
        "Headache trend: Improving",
      );
    });

    it("has appropriate aria-label for stable trend", () => {
      render(<TrendIndicator trend="stable" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveAttribute("aria-label", "Headache trend: Stable");
    });

    it("has appropriate aria-label for declining trend", () => {
      render(<TrendIndicator trend="declining" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveAttribute(
        "aria-label",
        "Headache trend: Declining",
      );
    });

    it("maintains aria-label even when visual label is hidden", () => {
      render(<TrendIndicator trend="improving" showLabel={false} />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveAttribute(
        "aria-label",
        "Headache trend: Improving",
      );
    });

    it("icon is hidden from screen readers", () => {
      render(<TrendIndicator trend="improving" />);

      const icon = screen
        .getByTestId("trend-indicator")
        .querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("layout", () => {
    it("uses inline-flex layout", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("inline-flex");
    });

    it("aligns items center", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("items-center");
    });

    it("has gap between icon and label when label is shown", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("gap-2");
    });

    it("has rounded corners", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("rounded-lg");
    });

    it("has border", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("border");
    });

    it("has padding", () => {
      render(<TrendIndicator trend="improving" />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("px-3");
      expect(indicator).toHaveClass("py-2");
    });
  });

  describe("trend transitions", () => {
    it("updates from improving to stable", () => {
      const { rerender } = render(<TrendIndicator trend="improving" />);
      expect(screen.getByText("Improving")).toBeInTheDocument();

      rerender(<TrendIndicator trend="stable" />);
      expect(screen.getByText("Stable")).toBeInTheDocument();
      expect(screen.queryByText("Improving")).not.toBeInTheDocument();
    });

    it("updates from stable to declining", () => {
      const { rerender } = render(<TrendIndicator trend="stable" />);
      expect(screen.getByText("Stable")).toBeInTheDocument();

      rerender(<TrendIndicator trend="declining" />);
      expect(screen.getByText("Declining")).toBeInTheDocument();
      expect(screen.queryByText("Stable")).not.toBeInTheDocument();
    });

    it("updates from declining to improving", () => {
      const { rerender } = render(<TrendIndicator trend="declining" />);
      expect(screen.getByText("Declining")).toBeInTheDocument();

      rerender(<TrendIndicator trend="improving" />);
      expect(screen.getByText("Improving")).toBeInTheDocument();
      expect(screen.queryByText("Declining")).not.toBeInTheDocument();
    });

    it("updates icon when trend changes", () => {
      const { rerender } = render(<TrendIndicator trend="improving" />);
      let icon = screen
        .getByTestId("trend-indicator")
        .querySelector('svg[class*="lucide-trending-up"]');
      expect(icon).toBeInTheDocument();

      rerender(<TrendIndicator trend="declining" />);
      icon = screen
        .getByTestId("trend-indicator")
        .querySelector('svg[class*="lucide-trending-down"]');
      expect(icon).toBeInTheDocument();
    });

    it("updates colors when trend changes", () => {
      const { rerender } = render(<TrendIndicator trend="improving" />);
      let indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("bg-green-50");

      rerender(<TrendIndicator trend="stable" />);
      indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("bg-gray-50");

      rerender(<TrendIndicator trend="declining" />);
      indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass("bg-amber-50");
    });
  });

  describe("edge cases", () => {
    it("renders consistently across multiple re-renders with same trend", () => {
      const { rerender } = render(<TrendIndicator trend="improving" />);
      const firstLabel = screen.getByText("Improving");

      rerender(<TrendIndicator trend="improving" />);
      const secondLabel = screen.getByText("Improving");

      expect(firstLabel.textContent).toBe(secondLabel.textContent);
    });

    it("handles rapid trend changes", () => {
      const trends: Trend[] = [
        "improving",
        "stable",
        "declining",
        "improving",
        "stable",
      ];
      const { rerender } = render(<TrendIndicator trend={trends[0]} />);

      trends.forEach((trend) => {
        rerender(<TrendIndicator trend={trend} />);
        expect(screen.getByTestId("trend-indicator")).toBeInTheDocument();
      });
    });

    it("maintains accessibility when showLabel toggles", () => {
      const { rerender } = render(
        <TrendIndicator trend="improving" showLabel={true} />,
      );
      let indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveAttribute(
        "aria-label",
        "Headache trend: Improving",
      );

      rerender(<TrendIndicator trend="improving" showLabel={false} />);
      indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveAttribute(
        "aria-label",
        "Headache trend: Improving",
      );
    });

    it("handles className override correctly", () => {
      const customClass = "override-test";
      render(<TrendIndicator trend="improving" className={customClass} />);

      const indicator = screen.getByTestId("trend-indicator");
      expect(indicator).toHaveClass(customClass);
      expect(indicator).toHaveClass("inline-flex"); // Base classes still applied
    });
  });

  describe("color contrast accessibility", () => {
    it("uses non-alarming colors for declining trend", () => {
      render(<TrendIndicator trend="declining" />);

      const label = screen.getByText("Declining");
      // Should use amber, not red, to reduce alarm
      expect(label).toHaveClass("text-amber-600");
      expect(label).not.toHaveClass("text-red-600");
    });

    it("uses encouraging green for improving trend", () => {
      render(<TrendIndicator trend="improving" />);

      const label = screen.getByText("Improving");
      expect(label).toHaveClass("text-green-600");
    });

    it("uses neutral gray for stable trend", () => {
      render(<TrendIndicator trend="stable" />);

      const label = screen.getByText("Stable");
      expect(label).toHaveClass("text-gray-600");
    });
  });

  describe("responsive design", () => {
    it("maintains compact size suitable for dashboard", () => {
      render(<TrendIndicator trend="improving" />);

      const label = screen.getByText("Improving");
      expect(label).toHaveClass("text-sm"); // Small text for compact display
    });

    it("uses medium font weight for readability", () => {
      render(<TrendIndicator trend="stable" />);

      const label = screen.getByText("Stable");
      expect(label).toHaveClass("font-medium");
    });
  });
});
