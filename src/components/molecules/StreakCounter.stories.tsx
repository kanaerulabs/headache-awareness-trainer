import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StreakCounter } from "./StreakCounter";

const meta: Meta<typeof StreakCounter> = {
  title: "Molecules/StreakCounter",
  component: StreakCounter,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
StreakCounter displays the current logging streak with progress toward next milestone.

## Features
- Fire emoji animation for active streaks
- Progress bar to next achievement milestone
- Color-coded streak levels
- Days remaining to next goal
- Celebration message at milestones
- Dark mode support
- Responsive design

## Milestones
- 3 days - First streak achievement
- 7 days - One week
- 14 days - Two weeks
- 30 days - One month
- 60 days - Two months
- 90 days - Three months (max)

## Color Coding
- **Gray**: No streak (0 days)
- **Blue**: Building (1-6 days)
- **Green**: One week (7-13 days)
- **Orange**: Two weeks (14-29 days)
- **Red**: One month+ (30+ days)

## Data Source
Streak is calculated by \`loggingStore.metadata.currentStreak\`
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
type Story = StoryObj<typeof StreakCounter>;

/**
 * No streak - initial state
 */
export const NoStreak: Story = {
  args: {
    currentStreak: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Initial state with no active streak. Shows encouragement to start tracking today.",
      },
    },
  },
};

/**
 * 1 day - just started
 */
export const OneDay: Story = {
  args: {
    currentStreak: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "First day of streak. Blue color with fire emoji animation and progress to 3-day goal.",
      },
    },
  },
};

/**
 * 2 days - building momentum
 */
export const TwoDays: Story = {
  args: {
    currentStreak: 2,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Building consistency. Shows 1 day remaining to first milestone (3 days).",
      },
    },
  },
};

/**
 * 3 days - first milestone reached
 */
export const ThreeDays: Story = {
  args: {
    currentStreak: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          "First milestone reached! Progress bar resets and shows path to 7-day goal.",
      },
    },
  },
};

/**
 * 5 days - mid-week
 */
export const FiveDays: Story = {
  args: {
    currentStreak: 5,
  },
  parameters: {
    docs: {
      description: {
        story: "Mid-week progress. 2 days away from one week milestone.",
      },
    },
  },
};

/**
 * 7 days - one week milestone
 */
export const SevenDays: Story = {
  args: {
    currentStreak: 7,
  },
  parameters: {
    docs: {
      description: {
        story:
          "One week milestone! Green color with celebration message. Progress resets for 14-day goal.",
      },
    },
  },
};

/**
 * 10 days - over one week
 */
export const TenDays: Story = {
  args: {
    currentStreak: 10,
  },
  parameters: {
    docs: {
      description: {
        story: "Past one week milestone. 4 days to two week goal.",
      },
    },
  },
};

/**
 * 14 days - two week milestone
 */
export const FourteenDays: Story = {
  args: {
    currentStreak: 14,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Two week milestone! Orange color with celebration. Progress resets for 30-day goal.",
      },
    },
  },
};

/**
 * 20 days - approaching one month
 */
export const TwentyDays: Story = {
  args: {
    currentStreak: 20,
  },
  parameters: {
    docs: {
      description: {
        story: "Approaching one month. 10 days to 30-day milestone.",
      },
    },
  },
};

/**
 * 30 days - one month milestone
 */
export const ThirtyDays: Story = {
  args: {
    currentStreak: 30,
  },
  parameters: {
    docs: {
      description: {
        story:
          "One month milestone! Red color with celebration. Progress resets for 60-day goal.",
      },
    },
  },
};

/**
 * 60 days - two month milestone
 */
export const SixtyDays: Story = {
  args: {
    currentStreak: 60,
  },
  parameters: {
    docs: {
      description: {
        story: "Two month milestone! Shows progress to final 90-day goal.",
      },
    },
  },
};

/**
 * 90 days - max milestone
 */
export const NinetyDays: Story = {
  args: {
    currentStreak: 90,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Maximum milestone reached (90 days)! Special celebration message for reaching the top.",
      },
    },
  },
};

/**
 * 100+ days - beyond max
 */
export const HundredDays: Story = {
  args: {
    currentStreak: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Beyond maximum milestone. Maintains celebration state and encouragement.",
      },
    },
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  args: {
    currentStreak: 14,
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
 * Milestone progression - visual reference
 */
export const MilestoneProgression: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <p className="text-xs text-gray-500 mb-2">No streak</p>
        <StreakCounter currentStreak={0} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Building (2 days)</p>
        <StreakCounter currentStreak={2} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">First milestone (3 days)</p>
        <StreakCounter currentStreak={3} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">One week (7 days)</p>
        <StreakCounter currentStreak={7} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Two weeks (14 days)</p>
        <StreakCounter currentStreak={14} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">One month (30 days)</p>
        <StreakCounter currentStreak={30} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Visual comparison of streak counter at different milestone levels.",
      },
    },
  },
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    currentStreak: 5,
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try different streak values:**
- 0: No streak
- 1-2: Building to first milestone
- 3: First milestone
- 4-6: Building to one week
- 7: One week milestone
- 8-13: Building to two weeks
- 14: Two week milestone
- 15-29: Building to one month
- 30: One month milestone
- 31-59: Building to two months
- 60: Two month milestone
- 61-89: Building to max
- 90+: Maximum milestone
        `,
      },
    },
  },
};
