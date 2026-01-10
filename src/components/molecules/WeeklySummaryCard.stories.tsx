import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeeklySummaryCard } from "./WeeklySummaryCard";

const meta: Meta<typeof WeeklySummaryCard> = {
  title: "Molecules/WeeklySummaryCard",
  component: WeeklySummaryCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
WeeklySummaryCard displays this week's headache and check-in counts in a two-column layout.

## Features
- Two-column grid layout
- Icon-coded sections (Brain for headaches, ClipboardCheck for check-ins)
- Prominent number displays
- Proper pluralization
- Color-coded backgrounds
- Dark mode support
- Responsive design

## Week Definition
"This Week" is defined as Monday through today (current day) by the dashboard store's \`getThisWeekDateRange()\` function.

## Data Source
Counts are aggregated by \`dashboardStore\`:
- \`thisWeekHeadaches\`: Count of headache entries logged this week
- \`thisWeekCheckins\`: Count of check-in entries completed this week
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WeeklySummaryCard>;

/**
 * No entries - initial state for new week.
 */
export const NoEntries: Story = {
  args: {
    headacheCount: 0,
    checkinCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Initial state when no entries logged this week. Shows "No entries yet this week" message.',
      },
    },
  },
};

/**
 * Default state with some activity.
 */
export const Default: Story = {
  args: {
    headacheCount: 2,
    checkinCount: 5,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Typical week with 2 headaches and 5 check-ins. This shows a healthy tracking pattern.",
      },
    },
  },
};

/**
 * Only headaches - no check-ins.
 */
export const OnlyHeadaches: Story = {
  args: {
    headacheCount: 3,
    checkinCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Week with headaches logged but no check-ins. User is reactive rather than proactive.",
      },
    },
  },
};

/**
 * Only check-ins - no headaches (ideal week).
 */
export const OnlyCheckIns: Story = {
  args: {
    headacheCount: 0,
    checkinCount: 7,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Ideal week with daily check-ins and no headaches. Great proactive tracking!",
      },
    },
  },
};

/**
 * Single headache - singular label.
 */
export const SingleHeadache: Story = {
  args: {
    headacheCount: 1,
    checkinCount: 4,
  },
  parameters: {
    docs: {
      description: {
        story:
          'One headache logged. Note the singular "Headache" label (not "Headaches").',
      },
    },
  },
};

/**
 * Single check-in - singular label.
 */
export const SingleCheckIn: Story = {
  args: {
    headacheCount: 2,
    checkinCount: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          'One check-in completed. Note the singular "Check-in" label (not "Check-ins").',
      },
    },
  },
};

/**
 * High activity week.
 */
export const HighActivity: Story = {
  args: {
    headacheCount: 5,
    checkinCount: 7,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Week with high activity - 5 headaches and daily check-ins. User is actively tracking.",
      },
    },
  },
};

/**
 * Difficult week - many headaches.
 */
export const DifficultWeek: Story = {
  args: {
    headacheCount: 7,
    checkinCount: 7,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Challenging week with daily headaches. Good that user is tracking consistently.",
      },
    },
  },
};

/**
 * Low headache week - good progress.
 */
export const LowHeadaches: Story = {
  args: {
    headacheCount: 1,
    checkinCount: 6,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Excellent week with only one headache and consistent check-ins. Progress is being made!",
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  args: {
    headacheCount: 2,
    checkinCount: 5,
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story:
          "Component adapts to dark mode with adjusted background colors for optimal contrast.",
      },
    },
  },
};

/**
 * Activity comparison - visual reference.
 */
export const ActivityComparison: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700">No Activity</h3>
        <WeeklySummaryCard headacheCount={0} checkinCount={0} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700">
          Light Activity
        </h3>
        <WeeklySummaryCard headacheCount={1} checkinCount={3} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700">
          Moderate Activity
        </h3>
        <WeeklySummaryCard headacheCount={3} checkinCount={5} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700">
          High Activity
        </h3>
        <WeeklySummaryCard headacheCount={5} checkinCount={7} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Visual comparison of different activity levels throughout the week.",
      },
    },
  },
};

/**
 * Interactive playground.
 */
export const Playground: Story = {
  args: {
    headacheCount: 2,
    checkinCount: 5,
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try different values:**
- 0 for both: "No entries yet this week" message
- 1 for either: Singular labels ("Headache" / "Check-in")
- Various combinations to see color-coded sections

**Notice:**
- Brain icon (red) for headaches
- ClipboardCheck icon (teal) for check-ins
- Proper pluralization for both counters
- "Monday through today" for weeks with activity
        `,
      },
    },
  },
};
