import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StreakDisplay } from "./StreakDisplay";

const meta: Meta<typeof StreakDisplay> = {
  title: "Molecules/StreakDisplay",
  component: StreakDisplay,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
StreakDisplay shows the user's current logging streak with celebratory visual styling.

## Features
- Large, prominent number display
- Flame icon (filled when streak > 0)
- Color-coded milestones
- Proper pluralization (day vs days)
- Pulse animation for active streaks
- Dark mode support
- Responsive design

## Milestone Styling
- **0 days**: Gray, muted (no streak)
- **1-6 days**: Blue (building consistency)
- **7-13 days**: Green (one week milestone)
- **14-29 days**: Orange (two week milestone)
- **30+ days**: Red/Gold gradient (one month milestone)

## Data Source
Streak is calculated by \`loggingStore.metadata.currentStreak\` based on consecutive days with at least one entry.
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
type Story = StoryObj<typeof StreakDisplay>;

/**
 * No streak - initial state for new users.
 */
export const NoStreak: Story = {
  args: {
    streak: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Initial state when user has no active streak. Muted gray styling with hollow flame icon.",
      },
    },
  },
};

/**
 * 1 day streak - singular "day" label.
 */
export const OneDay: Story = {
  args: {
    streak: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          'First day of tracking. Note the singular "day" label and filled flame icon.',
      },
    },
  },
};

/**
 * 3 days - building consistency (blue).
 */
export const ThreeDays: Story = {
  args: {
    streak: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Building consistency phase (1-6 days) shown in blue with encouraging message.",
      },
    },
  },
};

/**
 * 7 days - one week milestone (green).
 */
export const SevenDays: Story = {
  args: {
    streak: 7,
  },
  parameters: {
    docs: {
      description: {
        story:
          "One week milestone! Green styling with celebration emoji and pulse animation.",
      },
    },
  },
};

/**
 * 14 days - two week milestone (orange).
 */
export const FourteenDays: Story = {
  args: {
    streak: 14,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Two week milestone! Orange styling with fire emoji and pulse animation.",
      },
    },
  },
};

/**
 * 30 days - one month milestone (red/gold).
 */
export const ThirtyDays: Story = {
  args: {
    streak: 30,
  },
  parameters: {
    docs: {
      description: {
        story:
          "One month milestone! Special red/gold gradient styling with trophy emoji and pulse animation.",
      },
    },
  },
};

/**
 * 45 days - extended streak.
 */
export const FortyFiveDays: Story = {
  args: {
    streak: 45,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Extended streak beyond 30 days maintains the gold styling with ongoing celebration.",
      },
    },
  },
};

/**
 * 100 days - exceptional achievement.
 */
export const HundredDays: Story = {
  args: {
    streak: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Exceptional 100-day streak! The gold gradient styling celebrates this major achievement.",
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  args: {
    streak: 14,
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
          "Component adapts to dark mode with adjusted colors for optimal contrast.",
      },
    },
  },
};

/**
 * Milestone comparison - visual reference.
 */
export const MilestoneComparison: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <StreakDisplay streak={0} />
      <StreakDisplay streak={3} />
      <StreakDisplay streak={7} />
      <StreakDisplay streak={14} />
      <StreakDisplay streak={30} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Visual comparison of all milestone states to show color progression.",
      },
    },
  },
};

/**
 * Interactive playground.
 */
export const Playground: Story = {
  args: {
    streak: 7,
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try different streak values:**
- 0: No streak (gray)
- 1-6: Building (blue)
- 7-13: One week (green)
- 14-29: Two weeks (orange)
- 30+: One month (red/gold)

**Notice:**
- Singular "day" for streak = 1
- Plural "days" for all other values
- Pulse animation for streaks >= 7
- Filled flame icon for streak > 0
        `,
      },
    },
  },
};
