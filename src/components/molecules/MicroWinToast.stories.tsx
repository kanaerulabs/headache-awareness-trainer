import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMicroWinToast } from "./MicroWinToast";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import type { MicroWinMessage } from "@/interface-adapters/store/gamificationStore";

const MicroWinToastDemo = ({
  message,
  duration,
}: {
  message: MicroWinMessage;
  duration?: number;
}) => {
  const { showMicroWinToast } = useMicroWinToast();

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => showMicroWinToast(message, duration)}>
        Show Micro-Win Toast
      </Button>
      <Toaster />
    </div>
  );
};

const meta: Meta<typeof MicroWinToastDemo> = {
  title: "Molecules/MicroWinToast",
  component: MicroWinToastDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
MicroWinToast displays encouraging micro-win messages as toast notifications.

## Features
- Auto-dismiss after 3 seconds (configurable)
- Gradient background styling
- Emoji + message display
- Non-blocking notification
- Accessible toast implementation
- Dark mode support

## Usage Pattern
This is a hook-based component that provides toast functionality.
Use \`useMicroWinToast()\` to get \`showMicroWinToast\` function,
or \`useAutoMicroWinToast()\` to automatically show toasts based on context.

## Message Types
- **first-entry**: First logging action
- **streak-start**: Day 2 of streak
- **streak-continue**: Ongoing streak encouragement
- **pattern-emerging**: After 5+ entries
- **week-complete**: 7-day intervals
- **feature-unlock**: New feature unlocked
- **milestone-reached**: Entry count milestones
- **consistency-praise**: General encouragement

## Data Source
Messages come from \`gamificationStore.getMicroWinMessage(context)\`
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
};

export default meta;
type Story = StoryObj<typeof MicroWinToastDemo>;

/**
 * First entry - celebrating first action
 */
export const FirstEntry: Story = {
  args: {
    message: {
      type: "first-entry",
      message: "First entry logged! Your journey to understanding begins.",
      emoji: "🌱",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast shown when user logs their very first headache entry.",
      },
    },
  },
};

/**
 * Streak start - day 2
 */
export const StreakStart: Story = {
  args: {
    message: {
      type: "streak-start",
      message: "Day 2! Building consistency one day at a time.",
      emoji: "🔥",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast shown on second consecutive day of logging.",
      },
    },
  },
};

/**
 * Streak continue - ongoing encouragement
 */
export const StreakContinue: Story = {
  args: {
    message: {
      type: "streak-continue",
      message: "You're on a roll! Keep up the consistency.",
      emoji: "⚡",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast shown for continued streak (day 3+).",
      },
    },
  },
};

/**
 * Pattern emerging - after 5+ entries
 */
export const PatternEmerging: Story = {
  args: {
    message: {
      type: "pattern-emerging",
      message: "Data is building up! Patterns will emerge soon.",
      emoji: "🔍",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast shown after 5-9 entries to encourage continued tracking.",
      },
    },
  },
};

/**
 * Week complete - 7-day milestone
 */
export const WeekComplete: Story = {
  args: {
    message: {
      type: "week-complete",
      message: "Week complete! You're building a healthy habit.",
      emoji: "🎉",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast shown when user completes a full week of tracking.",
      },
    },
  },
};

/**
 * Feature unlock - new feature available
 */
export const FeatureUnlock: Story = {
  args: {
    message: {
      type: "feature-unlock",
      message: "New feature unlocked! Check it out.",
      emoji: "🎁",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast shown when a new app feature becomes available.",
      },
    },
  },
};

/**
 * Milestone reached - entry count milestone
 */
export const MilestoneReached: Story = {
  args: {
    message: {
      type: "milestone-reached",
      message: "Milestone reached! You're making real progress.",
      emoji: "🏆",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Toast shown when user reaches entry count milestones (10, 50, 100).",
      },
    },
  },
};

/**
 * Consistency praise - general encouragement
 */
export const ConsistencyPraise: Story = {
  args: {
    message: {
      type: "consistency-praise",
      message: "Your dedication is paying off! Keep going.",
      emoji: "⭐",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast shown to provide general encouragement during week 1.",
      },
    },
  },
};

/**
 * Custom duration - 5 seconds
 */
export const LongerDuration: Story = {
  args: {
    message: {
      type: "milestone-reached",
      message: "Milestone reached! You're making real progress.",
      emoji: "🏆",
    },
    duration: 5000,
  },
  parameters: {
    docs: {
      description: {
        story: "Toast with custom 5-second duration before auto-dismissing.",
      },
    },
  },
};

/**
 * Multiple toasts - sequential display
 */
export const MultipleToasts: Story = {
  render: () => {
    const { showMicroWinToast } = useMicroWinToast();

    const showMultiple = () => {
      const messages: MicroWinMessage[] = [
        {
          type: "first-entry",
          message: "First entry logged! Your journey to understanding begins.",
          emoji: "🌱",
        },
        {
          type: "streak-start",
          message: "Day 2! Building consistency one day at a time.",
          emoji: "🔥",
        },
        {
          type: "week-complete",
          message: "Week complete! You're building a healthy habit.",
          emoji: "🎉",
        },
      ];

      messages.forEach((msg, index) => {
        setTimeout(() => {
          showMicroWinToast(msg);
        }, index * 1000);
      });
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={showMultiple}>Show Multiple Toasts</Button>
        <p className="text-xs text-gray-500 max-w-xs text-center">
          Click to see 3 toasts appear sequentially (1 second apart)
        </p>
        <Toaster />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstration of multiple toasts appearing in sequence.",
      },
    },
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  args: {
    message: {
      type: "week-complete",
      message: "Week complete! You're building a healthy habit.",
      emoji: "🎉",
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 p-8 rounded-lg min-h-[200px]">
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
          "Toast adapts to dark mode with adjusted colors for optimal contrast.",
      },
    },
  },
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    message: {
      type: "streak-continue",
      message: "You're on a roll! Keep up the consistency.",
      emoji: "⚡",
    },
    duration: 3000,
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try different:**
- Message text
- Emojis (🌱, 🔥, ⚡, 🎉, 🏆, ⭐, 🔍, 🎁)
- Durations (1000-10000ms)
        `,
      },
    },
  },
};
