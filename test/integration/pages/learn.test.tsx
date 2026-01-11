/**
 * Learn Page Integration Tests
 *
 * Tests the /learn page which displays the education hub.
 * This is a Server Component that renders the EducationHub client component.
 */

import { render, screen } from "@testing-library/react";
import LearnPage, { metadata } from "../../../src/app/learn/page";
import "@testing-library/jest-dom";

// Mock the EducationHub component
jest.mock("@/components/organisms/EducationHub", () => ({
  EducationHub: () => (
    <div data-testid="education-hub-mock">EducationHub Component</div>
  ),
}));

describe("LearnPage Integration", () => {
  describe("page rendering", () => {
    it('should render page with data-testid="learn-page"', () => {
      render(<LearnPage />);

      const page = screen.getByTestId("learn-page");
      expect(page).toBeInTheDocument();
    });

    it("should have correct CSS classes for layout", () => {
      render(<LearnPage />);

      const page = screen.getByTestId("learn-page");
      expect(page).toHaveClass(
        "container",
        "max-w-2xl",
        "mx-auto",
        "px-4",
        "py-8",
      );
    });

    it("should render as a main element", () => {
      render(<LearnPage />);

      const page = screen.getByTestId("learn-page");
      expect(page.tagName).toBe("MAIN");
    });

    it("should contain EducationHub component", () => {
      render(<LearnPage />);

      expect(screen.getByTestId("education-hub-mock")).toBeInTheDocument();
    });
  });

  describe("SEO metadata", () => {
    it("should have correct title", () => {
      expect(metadata.title).toBe("Learn | Headache Awareness Trainer");
    });

    it("should have descriptive metadata", () => {
      expect(metadata.description).toBe(
        "Educational content about headache types and body awareness",
      );
    });

    it("should include keywords for discoverability", () => {
      const description = metadata.description?.toLowerCase() || "";
      expect(description).toContain("educational");
      expect(description).toContain("headache");
      expect(description).toContain("awareness");
    });
  });

  describe("page structure", () => {
    it("should have semantic HTML structure", () => {
      render(<LearnPage />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("should be container-constrained for readability", () => {
      render(<LearnPage />);

      const page = screen.getByTestId("learn-page");
      expect(page).toHaveClass("max-w-2xl");
    });

    it("should have proper spacing", () => {
      render(<LearnPage />);

      const page = screen.getByTestId("learn-page");
      expect(page).toHaveClass("px-4", "py-8");
    });
  });

  describe("component integration", () => {
    it("should render EducationHub within the page layout", () => {
      const { container } = render(<LearnPage />);

      const page = container.querySelector('[data-testid="learn-page"]');
      const hub = container.querySelector('[data-testid="education-hub-mock"]');

      expect(page).toContainElement(hub as HTMLElement | null);
    });
  });

  describe("accessibility", () => {
    it("should have main landmark for screen readers", () => {
      render(<LearnPage />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("should have testid for E2E testing", () => {
      render(<LearnPage />);

      expect(screen.getByTestId("learn-page")).toBeInTheDocument();
    });
  });
});
