/**
 * Learn Content Page Integration Tests
 *
 * Tests the /learn/[contentId] dynamic route page.
 * This is a Server Component with SSG (Static Site Generation).
 */

import { render, screen } from "@testing-library/react";
import ContentPage, {
  generateStaticParams,
  generateMetadata,
} from "../../../app/learn/[contentId]/page";
import { educationalContent } from "@/data/educationalContent";
import { notFound } from "next/navigation";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock the ContentViewer component
jest.mock("@/components/organisms/ContentViewer", () => ({
  ContentViewer: ({ contentId }: { contentId: string }) => (
    <div data-testid="content-viewer-mock">ContentViewer for {contentId}</div>
  ),
}));

describe("ContentPage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateStaticParams", () => {
    it("should return all content types for SSG", async () => {
      const params = await generateStaticParams();

      expect(params).toEqual([
        { contentId: "tension-headache" },
        { contentId: "body-scan" },
        { contentId: "body-signals" },
        { contentId: "vocabulary-builder" },
        { contentId: "general-patterns" },
        { contentId: "advanced-patterns" },
      ]);
    });

    it("should return all 6 content types", async () => {
      const params = await generateStaticParams();

      expect(params).toHaveLength(6);
    });

    it("should return params in correct format for Next.js", async () => {
      const params = await generateStaticParams();

      params.forEach((param) => {
        expect(param).toHaveProperty("contentId");
        expect(typeof param.contentId).toBe("string");
      });
    });

    it("should include all content IDs from educationalContent", async () => {
      const params = await generateStaticParams();
      const contentIds = params.map((p) => p.contentId);
      const expectedIds = Object.keys(educationalContent);

      expect(contentIds.sort()).toEqual(expectedIds.sort());
    });
  });

  describe("generateMetadata", () => {
    it("should return correct title for tension-headache", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      expect(metadata.title).toBe(
        "What is a Tension Headache? | Headache Awareness Trainer",
      );
    });

    it("should return correct description for tension-headache", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      expect(metadata.description).toBe(
        "Understanding the most common type of headache",
      );
    });

    it("should return correct title for body-scan", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "body-scan" }),
      });

      expect(metadata.title).toBe(
        "How to Do a Body Scan | Headache Awareness Trainer",
      );
    });

    it("should return correct title for body-signals", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "body-signals" }),
      });

      expect(metadata.title).toBe(
        "Signs Your Body Gives You | Headache Awareness Trainer",
      );
    });

    it("should return correct title for vocabulary-builder", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "vocabulary-builder" }),
      });

      expect(metadata.title).toBe(
        "Headache Type Vocabulary | Headache Awareness Trainer",
      );
    });

    it("should return correct title for general-patterns", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "general-patterns" }),
      });

      expect(metadata.title).toBe(
        "Research-Backed Patterns | Headache Awareness Trainer",
      );
    });

    it("should return correct title for advanced-patterns", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "advanced-patterns" }),
      });

      expect(metadata.title).toBe(
        "Your Personal Insights | Headache Awareness Trainer",
      );
    });

    it('should return "Content Not Found" for invalid contentId', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "invalid-content" }),
      });

      expect(metadata.title).toBe("Content Not Found");
    });

    it("should not include description for invalid contentId", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "invalid-content" }),
      });

      expect(metadata.description).toBeUndefined();
    });

    it("should use content subtitle as description", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ contentId: "body-scan" }),
      });

      const content = educationalContent["body-scan"];
      expect(metadata.description).toBe(content.subtitle);
    });
  });

  describe("page rendering", () => {
    it('should render page with data-testid="content-page"', async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      const page = screen.getByTestId("content-page");
      expect(page).toBeInTheDocument();
    });

    it("should have correct CSS classes for layout", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      const page = screen.getByTestId("content-page");
      expect(page).toHaveClass(
        "container",
        "max-w-2xl",
        "mx-auto",
        "px-4",
        "py-8",
      );
    });

    it("should render as a main element", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      const page = screen.getByTestId("content-page");
      expect(page.tagName).toBe("MAIN");
    });

    it("should pass contentId to ContentViewer", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "body-scan" }),
      });

      render(Page);

      expect(
        screen.getByText(/ContentViewer for body-scan/i),
      ).toBeInTheDocument();
    });

    it("should render ContentViewer for tension-headache", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      expect(
        screen.getByText(/ContentViewer for tension-headache/i),
      ).toBeInTheDocument();
    });

    it("should render ContentViewer for vocabulary-builder", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "vocabulary-builder" }),
      });

      render(Page);

      expect(
        screen.getByText(/ContentViewer for vocabulary-builder/i),
      ).toBeInTheDocument();
    });
  });

  describe("invalid contentId handling", () => {
    it("should call notFound() for invalid contentId", async () => {
      await ContentPage({
        params: Promise.resolve({ contentId: "invalid-content" }),
      });

      expect(notFound).toHaveBeenCalledTimes(1);
    });

    it("should call notFound() for non-existent content", async () => {
      await ContentPage({
        params: Promise.resolve({ contentId: "does-not-exist" }),
      });

      expect(notFound).toHaveBeenCalled();
    });

    it("should call notFound() for empty contentId", async () => {
      await ContentPage({
        params: Promise.resolve({ contentId: "" }),
      });

      expect(notFound).toHaveBeenCalled();
    });

    it("should NOT call notFound() for valid contentId", async () => {
      await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      expect(notFound).not.toHaveBeenCalled();
    });
  });

  describe("page structure", () => {
    it("should have semantic HTML structure", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("should be container-constrained for readability", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      const page = screen.getByTestId("content-page");
      expect(page).toHaveClass("max-w-2xl");
    });

    it("should have proper spacing", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      const page = screen.getByTestId("content-page");
      expect(page).toHaveClass("px-4", "py-8");
    });
  });

  describe("component integration", () => {
    it("should render ContentViewer within the page layout", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      const { container } = render(Page);

      const page = container.querySelector('[data-testid="content-page"]');
      const viewer = container.querySelector(
        '[data-testid="content-viewer-mock"]',
      );

      expect(page).toContainElement(viewer as HTMLElement | null);
    });
  });

  describe("accessibility", () => {
    it("should have main landmark for screen readers", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("should have testid for E2E testing", async () => {
      const Page = await ContentPage({
        params: Promise.resolve({ contentId: "tension-headache" }),
      });

      render(Page);

      expect(screen.getByTestId("content-page")).toBeInTheDocument();
    });
  });

  describe("SSG static generation", () => {
    it("should pre-generate all content pages at build time", async () => {
      const params = await generateStaticParams();

      // Verify all pages can be generated without errors
      for (const { contentId } of params) {
        await expect(
          ContentPage({
            params: Promise.resolve({ contentId }),
          }),
        ).resolves.toBeDefined();
      }
    });

    it("should generate metadata for all static pages", async () => {
      const params = await generateStaticParams();

      // Verify metadata can be generated for all pages
      for (const { contentId } of params) {
        const metadata = await generateMetadata({
          params: Promise.resolve({ contentId }),
        });

        expect(metadata.title).toBeDefined();
        expect(metadata.title).toContain("Headache Awareness Trainer");
      }
    });
  });
});
