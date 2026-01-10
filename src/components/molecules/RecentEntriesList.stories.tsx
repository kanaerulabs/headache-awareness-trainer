import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RecentEntriesList } from "./RecentEntriesList";
import { fn } from "@storybook/test";
import { subHours, subDays, subMinutes } from "date-fns";

const meta: Meta<typeof RecentEntriesList> = {
  title: "Molecules/RecentEntriesList",
  component: RecentEntriesList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    entries: {
      description: "Array of recent entries (max 5 displayed)",
    },
    onEntryClick: {
      action: "entryClick",
      description: "Callback when an entry is clicked",
    },
  },
  args: {
    onEntryClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof RecentEntriesList>;

/**
 * Default state with mixed headache and check-in entries.
 * Shows relative timestamps and icons.
 */
export const Default: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 30),
        summary: "Mild headache in temples",
      },
      {
        id: "2",
        type: "checkin",
        timestamp: subHours(new Date(), 3),
        summary: "Feeling calm and focused",
      },
      {
        id: "3",
        type: "headache",
        timestamp: subHours(new Date(), 8),
        summary: "Moderate tension headache",
      },
      {
        id: "4",
        type: "checkin",
        timestamp: subDays(new Date(), 1),
        summary: "Slightly stressed but okay",
      },
    ],
  },
};

/**
 * Empty state when no entries exist yet.
 * Shows helpful message for first-time users.
 */
export const Empty: Story = {
  args: {
    entries: [],
  },
};

/**
 * List with maximum entries (5).
 * Additional entries beyond 5 are automatically hidden.
 */
export const MaxEntries: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 15),
        summary: "Mild frontal headache",
      },
      {
        id: "2",
        type: "checkin",
        timestamp: subHours(new Date(), 2),
        summary: "Feeling good today",
      },
      {
        id: "3",
        type: "headache",
        timestamp: subHours(new Date(), 5),
        summary: "Severe migraine with aura",
      },
      {
        id: "4",
        type: "checkin",
        timestamp: subHours(new Date(), 12),
        summary: "High stress, neck tension",
      },
      {
        id: "5",
        type: "headache",
        timestamp: subDays(new Date(), 1),
        summary: "Moderate bilateral headache",
      },
      {
        id: "6",
        type: "checkin",
        timestamp: subDays(new Date(), 2),
        summary: "This entry should not appear (7th entry)",
      },
    ],
  },
};

/**
 * Only headache entries.
 * Shows how the list looks with a single entry type.
 */
export const HeadachesOnly: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 45),
        summary: "Mild tension headache",
      },
      {
        id: "2",
        type: "headache",
        timestamp: subHours(new Date(), 6),
        summary: "Moderate frontal pain",
      },
      {
        id: "3",
        type: "headache",
        timestamp: subDays(new Date(), 1),
        summary: "Severe migraine",
      },
    ],
  },
};

/**
 * Only check-in entries.
 * Shows how the list looks with wellness check-ins only.
 */
export const CheckInsOnly: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "checkin",
        timestamp: subHours(new Date(), 1),
        summary: "Feeling great, no issues",
      },
      {
        id: "2",
        type: "checkin",
        timestamp: subHours(new Date(), 8),
        summary: "Slightly tired but okay",
      },
      {
        id: "3",
        type: "checkin",
        timestamp: subDays(new Date(), 1),
        summary: "Well-rested and energized",
      },
    ],
  },
};

/**
 * Single entry in the list.
 */
export const SingleEntry: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 10),
        summary: "Mild headache just started",
      },
    ],
  },
};

/**
 * Non-clickable entries (no callback provided).
 * Entries don't show chevron and don't respond to clicks.
 */
export const NonClickable: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 30),
        summary: "Mild headache in temples",
      },
      {
        id: "2",
        type: "checkin",
        timestamp: subHours(new Date(), 3),
        summary: "Feeling calm and focused",
      },
    ],
    onEntryClick: undefined,
  },
};

/**
 * Dark mode demonstration.
 */
export const DarkMode: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 30),
        summary: "Mild headache in temples",
      },
      {
        id: "2",
        type: "checkin",
        timestamp: subHours(new Date(), 3),
        summary: "Feeling calm and focused",
      },
      {
        id: "3",
        type: "headache",
        timestamp: subHours(new Date(), 8),
        summary: "Moderate tension headache",
      },
    ],
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile viewport demonstration.
 */
export const Mobile: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 30),
        summary: "Mild headache in temples",
      },
      {
        id: "2",
        type: "checkin",
        timestamp: subHours(new Date(), 3),
        summary: "Feeling calm and focused",
      },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

/**
 * Long summary text truncation.
 * Shows how long summary text is handled with ellipsis.
 */
export const LongSummaries: Story = {
  args: {
    entries: [
      {
        id: "1",
        type: "headache",
        timestamp: subMinutes(new Date(), 30),
        summary:
          "Very long summary text that should be truncated with an ellipsis when it exceeds the available width of the container",
      },
      {
        id: "2",
        type: "checkin",
        timestamp: subHours(new Date(), 3),
        summary:
          "Another extremely long summary that demonstrates how the component handles text overflow in a graceful manner",
      },
    ],
  },
};
