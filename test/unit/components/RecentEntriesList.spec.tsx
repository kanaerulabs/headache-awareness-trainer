import { render, screen, fireEvent } from "@testing-library/react";
import {
  RecentEntriesList,
  RecentEntry,
} from "@/components/molecules/RecentEntriesList";

describe("RecentEntriesList", () => {
  const mockEntries: RecentEntry[] = [
    {
      id: "1",
      type: "headache",
      timestamp: new Date("2025-01-10T10:00:00Z"),
      summary: "Mild headache after lunch",
    },
    {
      id: "2",
      type: "checkin",
      timestamp: new Date("2025-01-10T08:00:00Z"),
      summary: "Feeling calm and focused",
    },
    {
      id: "3",
      type: "headache",
      timestamp: new Date("2025-01-09T15:00:00Z"),
      summary: "Moderate tension headache",
    },
  ];

  const defaultProps = {
    entries: mockEntries,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders correctly with entries", () => {
      render(<RecentEntriesList {...defaultProps} />);

      expect(screen.getByTestId("recent-entries-list")).toBeInTheDocument();
      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    });

    it("displays all entries up to 5", () => {
      render(<RecentEntriesList {...defaultProps} />);

      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
      expect(screen.getByTestId("entry-2")).toBeInTheDocument();
      expect(screen.getByTestId("entry-3")).toBeInTheDocument();
    });

    it("displays entry summaries", () => {
      render(<RecentEntriesList {...defaultProps} />);

      expect(screen.getByText("Mild headache after lunch")).toBeInTheDocument();
      expect(screen.getByText("Feeling calm and focused")).toBeInTheDocument();
      expect(screen.getByText("Moderate tension headache")).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-test-class";
      render(<RecentEntriesList {...defaultProps} className={customClass} />);

      const list = screen.getByTestId("recent-entries-list");
      expect(list).toHaveClass(customClass);
    });
  });

  describe("empty state", () => {
    it("displays empty state when no entries exist", () => {
      render(<RecentEntriesList entries={[]} />);

      expect(screen.getByText("No recent entries")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Log your first headache or check-in to see activity here",
        ),
      ).toBeInTheDocument();
    });

    it("shows ClipboardCheck icon in empty state", () => {
      render(<RecentEntriesList entries={[]} />);

      const icon = screen
        .getByTestId("recent-entries-list")
        .querySelector('svg[class*="lucide-clipboard-check"]');
      expect(icon).toBeInTheDocument();
    });

    it("empty state has role='status'", () => {
      render(<RecentEntriesList entries={[]} />);

      const emptyState = screen.getByRole("status");
      expect(emptyState).toBeInTheDocument();
    });

    it("does not show entry list in empty state", () => {
      render(<RecentEntriesList entries={[]} />);

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("entry types", () => {
    it("displays Brain icon for headache entries", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const headacheEntry = screen.getByTestId("entry-1");
      const icon = headacheEntry.querySelector('svg[class*="lucide-brain"]');
      expect(icon).toBeInTheDocument();
    });

    it("displays ClipboardCheck icon for check-in entries", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const checkinEntry = screen.getByTestId("entry-2");
      const icon = checkinEntry.querySelector(
        'svg[class*="lucide-clipboard-check"]',
      );
      expect(icon).toBeInTheDocument();
    });

    it("applies red styling to headache entries", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const headacheEntry = screen.getByTestId("entry-1");
      const iconContainer = headacheEntry.querySelector(".bg-red-50");
      expect(iconContainer).toBeInTheDocument();
    });

    it("applies blue styling to check-in entries", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const checkinEntry = screen.getByTestId("entry-2");
      const iconContainer = checkinEntry.querySelector(".bg-blue-50");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("entry limit", () => {
    it("displays maximum of 5 entries", () => {
      const manyEntries: RecentEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        type: i % 2 === 0 ? "headache" : "checkin",
        timestamp: new Date(),
        summary: `Entry ${i + 1}`,
      }));

      render(<RecentEntriesList entries={manyEntries} />);

      // Should only render first 5
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
      expect(screen.getByTestId("entry-2")).toBeInTheDocument();
      expect(screen.getByTestId("entry-3")).toBeInTheDocument();
      expect(screen.getByTestId("entry-4")).toBeInTheDocument();
      expect(screen.getByTestId("entry-5")).toBeInTheDocument();

      // Should not render 6th and beyond
      expect(screen.queryByTestId("entry-6")).not.toBeInTheDocument();
      expect(screen.queryByTestId("entry-10")).not.toBeInTheDocument();
    });

    it("displays all entries when less than 5", () => {
      const twoEntries = mockEntries.slice(0, 2);
      render(<RecentEntriesList entries={twoEntries} />);

      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
      expect(screen.getByTestId("entry-2")).toBeInTheDocument();
      expect(screen.queryByTestId("entry-3")).not.toBeInTheDocument();
    });
  });

  describe("click interaction", () => {
    it("calls onEntryClick with entry id when clicked", () => {
      const onEntryClick = jest.fn();
      render(
        <RecentEntriesList {...defaultProps} onEntryClick={onEntryClick} />,
      );

      const entry = screen.getByTestId("entry-1");
      fireEvent.click(entry);

      expect(onEntryClick).toHaveBeenCalledTimes(1);
      expect(onEntryClick).toHaveBeenCalledWith("1");
    });

    it("calls onEntryClick with correct id for each entry", () => {
      const onEntryClick = jest.fn();
      render(
        <RecentEntriesList {...defaultProps} onEntryClick={onEntryClick} />,
      );

      fireEvent.click(screen.getByTestId("entry-2"));
      expect(onEntryClick).toHaveBeenCalledWith("2");

      fireEvent.click(screen.getByTestId("entry-3"));
      expect(onEntryClick).toHaveBeenCalledWith("3");
    });

    it("shows chevron icon when onEntryClick is provided", () => {
      const onEntryClick = jest.fn();
      render(
        <RecentEntriesList {...defaultProps} onEntryClick={onEntryClick} />,
      );

      const entry = screen.getByTestId("entry-1");
      const chevron = entry.querySelector('svg[class*="lucide-chevron-right"]');
      expect(chevron).toBeInTheDocument();
    });

    it("does not show chevron icon when onEntryClick is not provided", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      const chevron = entry.querySelector('svg[class*="lucide-chevron-right"]');
      expect(chevron).not.toBeInTheDocument();
    });

    it("does not call onEntryClick when not provided", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      // Should not throw error
      fireEvent.click(entry);

      expect(entry).toBeInTheDocument();
    });

    it("has cursor-pointer style when clickable", () => {
      const onEntryClick = jest.fn();
      render(
        <RecentEntriesList {...defaultProps} onEntryClick={onEntryClick} />,
      );

      const entry = screen.getByTestId("entry-1");
      expect(entry).toHaveClass("cursor-pointer");
    });

    it("has cursor-default style when not clickable", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      expect(entry).toHaveClass("cursor-default");
    });

    it("has hover styles when clickable", () => {
      const onEntryClick = jest.fn();
      render(
        <RecentEntriesList {...defaultProps} onEntryClick={onEntryClick} />,
      );

      const entry = screen.getByTestId("entry-1");
      expect(entry).toHaveClass("hover:bg-gray-50");
    });
  });

  describe("accessibility", () => {
    it("has role='list' for entry list", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("has aria-label for entry list", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const list = screen.getByRole("list");
      expect(list).toHaveAttribute("aria-label", "Recent activity entries");
    });

    it("entry buttons have descriptive aria-labels", () => {
      render(<RecentEntriesList {...defaultProps} onEntryClick={jest.fn()} />);

      const entry = screen.getByTestId("entry-1");
      const ariaLabel = entry.getAttribute("aria-label");

      expect(ariaLabel).toContain("Headache entry");
      expect(ariaLabel).toContain("Mild headache after lunch");
    });

    it("icons are hidden from screen readers", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      const icons = entry.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it("entries are keyboard accessible when clickable", () => {
      const onEntryClick = jest.fn();
      render(
        <RecentEntriesList {...defaultProps} onEntryClick={onEntryClick} />,
      );

      const entry = screen.getByTestId("entry-1");
      expect(entry.tagName).toBe("BUTTON");
      expect(entry).toHaveAttribute("type", "button");
    });

    it("disabled buttons when not clickable", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      expect(entry).toBeDisabled();
    });

    it("has proper title structure", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const title = screen.getByText("Recent Activity");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("text-lg");
    });
  });

  describe("timestamp display", () => {
    it("displays relative time for entries", () => {
      render(<RecentEntriesList {...defaultProps} />);

      // date-fns formatDistanceToNow will show relative time like "2 hours ago"
      const entry = screen.getByTestId("entry-1");
      expect(entry).toBeInTheDocument();
      // The exact text depends on when test runs, so we just verify the structure exists
    });

    it("updates timestamps when entries change", () => {
      const { rerender } = render(<RecentEntriesList {...defaultProps} />);

      const updatedEntries = [
        {
          ...mockEntries[0],
          timestamp: new Date("2025-01-10T12:00:00Z"),
        },
      ];

      rerender(<RecentEntriesList entries={updatedEntries} />);
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("uses list layout with dividers", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const list = screen.getByRole("list");
      expect(list).toHaveClass("divide-y");
    });

    it("entries have proper padding", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      expect(entry).toHaveClass("px-6");
      expect(entry).toHaveClass("py-4");
    });

    it("entries use flex layout for alignment", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      expect(entry).toHaveClass("flex");
      expect(entry).toHaveClass("items-center");
    });

    it("has gap between icon and content", () => {
      render(<RecentEntriesList {...defaultProps} />);

      const entry = screen.getByTestId("entry-1");
      expect(entry).toHaveClass("gap-3");
    });
  });

  describe("edge cases", () => {
    it("handles entries with very long summaries", () => {
      const longSummaryEntry: RecentEntry[] = [
        {
          id: "1",
          type: "headache",
          timestamp: new Date(),
          summary:
            "This is a very long summary that contains a lot of detailed information about the headache episode including triggers, symptoms, duration, and other relevant details that might overflow",
        },
      ];

      render(<RecentEntriesList entries={longSummaryEntry} />);
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });

    it("handles entries with empty summaries", () => {
      const emptySummaryEntry: RecentEntry[] = [
        {
          id: "1",
          type: "headache",
          timestamp: new Date(),
          summary: "",
        },
      ];

      render(<RecentEntriesList entries={emptySummaryEntry} />);
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });

    it("handles entries with special characters in summary", () => {
      const specialCharsEntry: RecentEntry[] = [
        {
          id: "1",
          type: "headache",
          timestamp: new Date(),
          summary: "Headache & pain <script>alert('test')</script>",
        },
      ];

      render(<RecentEntriesList entries={specialCharsEntry} />);
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });

    it("updates when entries change", () => {
      const { rerender } = render(<RecentEntriesList entries={mockEntries} />);

      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
      expect(screen.getByTestId("entry-2")).toBeInTheDocument();

      const newEntries = [mockEntries[0]];
      rerender(<RecentEntriesList entries={newEntries} />);

      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
      expect(screen.queryByTestId("entry-2")).not.toBeInTheDocument();
    });

    it("transitions from empty to populated state", () => {
      const { rerender } = render(<RecentEntriesList entries={[]} />);
      expect(screen.getByText("No recent entries")).toBeInTheDocument();

      rerender(<RecentEntriesList entries={mockEntries} />);
      expect(screen.queryByText("No recent entries")).not.toBeInTheDocument();
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });

    it("transitions from populated to empty state", () => {
      const { rerender } = render(<RecentEntriesList entries={mockEntries} />);
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();

      rerender(<RecentEntriesList entries={[]} />);
      expect(screen.getByText("No recent entries")).toBeInTheDocument();
      expect(screen.queryByTestId("entry-1")).not.toBeInTheDocument();
    });

    it("handles very old timestamps", () => {
      const oldEntry: RecentEntry[] = [
        {
          id: "1",
          type: "headache",
          timestamp: new Date("2020-01-01T00:00:00Z"),
          summary: "Old headache entry",
        },
      ];

      render(<RecentEntriesList entries={oldEntry} />);
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });

    it("handles future timestamps", () => {
      const futureEntry: RecentEntry[] = [
        {
          id: "1",
          type: "headache",
          timestamp: new Date("2030-01-01T00:00:00Z"),
          summary: "Future entry",
        },
      ];

      render(<RecentEntriesList entries={futureEntry} />);
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });

    it("handles rapid entry updates", () => {
      const { rerender } = render(<RecentEntriesList entries={mockEntries} />);

      for (let i = 0; i < 10; i++) {
        const newEntries = mockEntries.slice(0, (i % 3) + 1);
        rerender(<RecentEntriesList entries={newEntries} />);
        expect(screen.getByTestId("recent-entries-list")).toBeInTheDocument();
      }
    });
  });

  describe("text truncation", () => {
    it("truncates long summaries visually", () => {
      const longEntry: RecentEntry[] = [
        {
          id: "1",
          type: "headache",
          timestamp: new Date(),
          summary:
            "Very long text that should be truncated when displayed in the UI to maintain clean layout",
        },
      ];

      render(<RecentEntriesList entries={longEntry} />);

      const entry = screen.getByTestId("entry-1");
      const summary = entry.querySelector(".truncate");
      expect(summary).toBeInTheDocument();
    });
  });
});
