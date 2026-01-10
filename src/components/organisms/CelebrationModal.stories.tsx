import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CelebrationModal } from "./CelebrationModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/interface-adapters/store/gamificationStore";

// Interactive wrapper for testing
const CelebrationModalDemo = ({
  achievement,
}: {
  achievement: Achievement;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setOpen(true)}>Trigger Achievement</Button>
      <CelebrationModal
        achievement={achievement}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

const meta: Meta<typeof CelebrationModalDemo> = {
  title: "Organisms/CelebrationModal",
  component: CelebrationModalDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
CelebrationModal displays when a user unlocks an achievement with celebration animation.

## Features
- Animated achievement icon with bounce effect
- Sparkle decorations (✨)
- Gradient background styling
- Achievement name and description
- Unlock date display
- Contextual encouraging message
- Continue button to dismiss
- Dark mode support
- Accessible dialog implementation

## Animations
- Icon bounce animation
- Sparkle pulse effect
- Smooth modal transitions

## Usage Pattern
Show modal when \`checkAchievements()\` returns newly unlocked achievement IDs.
Display one modal at a time for best UX.

## Data Source
Achievement data comes from \`gamificationStore.achievements\`
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
type Story = StoryObj<typeof CelebrationModalDemo>;

/**
 * First entry - beginner achievement
 */
export const FirstEntry: Story = {
  args: {
    achievement: {
      id: "first-entry",
      name: "First Steps",
      description: "Logged your first headache entry",
      icon: "🌱",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Celebration for logging first headache entry. Encourages continued tracking.",
      },
    },
  },
};

/**
 * 3-day streak - first streak milestone
 */
export const ThreeDayStreak: Story = {
  args: {
    achievement: {
      id: "streak-3-days",
      name: "3-Day Streak",
      description: "Logged for 3 consecutive days",
      icon: "🔥",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Celebration for reaching first streak milestone (3 days).",
      },
    },
  },
};

/**
 * 7-day streak - one week milestone
 */
export const SevenDayStreak: Story = {
  args: {
    achievement: {
      id: "streak-7-days",
      name: "Week Warrior",
      description: "Logged for 7 consecutive days",
      icon: "⭐",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Celebration for completing a full week of tracking.",
      },
    },
  },
};

/**
 * 30-day streak - one month milestone
 */
export const ThirtyDayStreak: Story = {
  args: {
    achievement: {
      id: "streak-30-days",
      name: "Month Master",
      description: "Logged for 30 consecutive days",
      icon: "🏆",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Major celebration for reaching one month of consistent tracking.",
      },
    },
  },
};

/**
 * 90-day streak - maximum milestone
 */
export const NinetyDayStreak: Story = {
  args: {
    achievement: {
      id: "streak-90-days",
      name: "90-Day Legend",
      description: "Logged for 90 consecutive days",
      icon: "💎",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Epic celebration for reaching maximum streak milestone (90 days).",
      },
    },
  },
};

/**
 * First pattern - discovery achievement
 */
export const FirstPattern: Story = {
  args: {
    achievement: {
      id: "first-pattern",
      name: "Pattern Detective",
      description: "Discovered your first pattern",
      icon: "🔍",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Celebration for discovering first headache pattern. Highlights value of tracking.",
      },
    },
  },
};

/**
 * 100 entries - major milestone
 */
export const HundredEntries: Story = {
  args: {
    achievement: {
      id: "entries-100",
      name: "100 Entries",
      description: "Logged 100 headache entries",
      icon: "🎖️",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Celebration for logging 100 headache entries. Major data milestone.",
      },
    },
  },
};

/**
 * First check-in - quick logging achievement
 */
export const FirstCheckIn: Story = {
  args: {
    achievement: {
      id: "first-checkin",
      name: "Check-In Champion",
      description: "Completed your first check-in",
      icon: "✅",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Celebration for completing first quick check-in.",
      },
    },
  },
};

/**
 * First week complete
 */
export const FirstWeek: Story = {
  args: {
    achievement: {
      id: "first-week",
      name: "Week One Complete",
      description: "Completed your first week of tracking",
      icon: "🎉",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Celebration for completing first week. Major habit formation milestone.",
      },
    },
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  args: {
    achievement: {
      id: "streak-7-days",
      name: "Week Warrior",
      description: "Logged for 7 consecutive days",
      icon: "⭐",
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 p-8 rounded-lg min-h-[400px]">
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
          "Modal adapts to dark mode with adjusted colors for optimal contrast and celebration feel.",
      },
    },
  },
};

/**
 * With custom unlock date
 */
export const WithCustomDate: Story = {
  args: {
    achievement: {
      id: "streak-14-days",
      name: "Two Weeks Strong",
      description: "Logged for 14 consecutive days",
      icon: "💪",
      isUnlocked: true,
      unlockedAt: new Date("2025-01-01"),
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Modal displays the actual date when achievement was unlocked.",
      },
    },
  },
};

/**
 * Sequential achievements - demo workflow
 */
export const SequentialDemo: Story = {
  render: () => {
    const [currentAchievement, setCurrentAchievement] =
      useState<Achievement | null>(null);

    const achievements: Achievement[] = [
      {
        id: "first-entry",
        name: "First Steps",
        description: "Logged your first headache entry",
        icon: "🌱",
        isUnlocked: true,
        unlockedAt: new Date(),
      },
      {
        id: "streak-3-days",
        name: "3-Day Streak",
        description: "Logged for 3 consecutive days",
        icon: "🔥",
        isUnlocked: true,
        unlockedAt: new Date(),
      },
      {
        id: "streak-7-days",
        name: "Week Warrior",
        description: "Logged for 7 consecutive days",
        icon: "⭐",
        isUnlocked: true,
        unlockedAt: new Date(),
      },
    ];

    const [index, setIndex] = useState(0);

    const showNext = () => {
      setCurrentAchievement(achievements[index]);
      setIndex((prev) => (prev + 1) % achievements.length);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={showNext}>Show Next Achievement</Button>
        <p className="text-xs text-gray-500 max-w-xs text-center">
          Click to cycle through multiple achievement celebrations
        </p>
        <CelebrationModal
          achievement={currentAchievement}
          open={!!currentAchievement}
          onClose={() => setCurrentAchievement(null)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstration of sequential achievement celebrations. Click button to show next achievement.",
      },
    },
  },
};
