import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AchievementBadge } from "./AchievementBadge";
import type { Achievement } from "@/interface-adapters/store/gamificationStore";

const meta: Meta<typeof AchievementBadge> = {
  title: "Molecules/AchievementBadge",
  component: AchievementBadge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
AchievementBadge displays individual achievement with icon, name, description, and unlock status.

## Features
- Locked/unlocked visual states
- Icon with lock overlay for locked achievements
- Unlock date display for earned achievements
- Grayscale filter for locked state
- Gradient background for unlocked achievements
- Accessible keyboard navigation
- Dark mode support

## Visual States
- **Locked**: Muted colors, grayscale filter, lock icon overlay
- **Unlocked**: Full color, gradient background, unlock badge and date

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
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AchievementBadge>;

const lockedAchievement: Achievement = {
  id: "streak-7-days",
  name: "Week Warrior",
  description: "Logged for 7 consecutive days",
  icon: "⭐",
  isUnlocked: false,
};

const unlockedAchievement: Achievement = {
  id: "first-entry",
  name: "First Steps",
  description: "Logged your first headache entry",
  icon: "🌱",
  isUnlocked: true,
  unlockedAt: new Date("2025-01-05"),
};

/**
 * Locked state - achievement not yet earned
 */
export const Locked: Story = {
  args: {
    achievement: lockedAchievement,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Locked achievement shown with muted colors, grayscale filter, and lock icon overlay. Encourages user to keep going.",
      },
    },
  },
};

/**
 * Unlocked state - achievement earned
 */
export const Unlocked: Story = {
  args: {
    achievement: unlockedAchievement,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Unlocked achievement with full color, gradient background, unlock badge, and earned date display.",
      },
    },
  },
};

/**
 * Streak achievements - different milestones
 */
export const StreakAchievements: Story = {
  render: () => (
    <div className="space-y-3 w-full max-w-md">
      <AchievementBadge
        achievement={{
          id: "streak-3-days",
          name: "3-Day Streak",
          description: "Logged for 3 consecutive days",
          icon: "🔥",
          isUnlocked: true,
          unlockedAt: new Date("2025-01-03"),
        }}
      />
      <AchievementBadge
        achievement={{
          id: "streak-7-days",
          name: "Week Warrior",
          description: "Logged for 7 consecutive days",
          icon: "⭐",
          isUnlocked: false,
        }}
      />
      <AchievementBadge
        achievement={{
          id: "streak-30-days",
          name: "Month Master",
          description: "Logged for 30 consecutive days",
          icon: "🏆",
          isUnlocked: false,
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Visual comparison of streak achievements at different unlock states.",
      },
    },
  },
};

/**
 * First action achievements
 */
export const FirstActions: Story = {
  render: () => (
    <div className="space-y-3 w-full max-w-md">
      <AchievementBadge
        achievement={{
          id: "first-entry",
          name: "First Steps",
          description: "Logged your first headache entry",
          icon: "🌱",
          isUnlocked: true,
          unlockedAt: new Date("2025-01-01"),
        }}
      />
      <AchievementBadge
        achievement={{
          id: "first-checkin",
          name: "Check-In Champion",
          description: "Completed your first check-in",
          icon: "✅",
          isUnlocked: true,
          unlockedAt: new Date("2025-01-02"),
        }}
      />
      <AchievementBadge
        achievement={{
          id: "first-pattern",
          name: "Pattern Detective",
          description: "Discovered your first pattern",
          icon: "🔍",
          isUnlocked: false,
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "First action achievements showing earned and locked states.",
      },
    },
  },
};

/**
 * Milestone achievements
 */
export const MilestoneAchievements: Story = {
  render: () => (
    <div className="space-y-3 w-full max-w-md">
      <AchievementBadge
        achievement={{
          id: "entries-10",
          name: "10 Entries",
          description: "Logged 10 headache entries",
          icon: "📝",
          isUnlocked: true,
          unlockedAt: new Date("2025-01-08"),
        }}
      />
      <AchievementBadge
        achievement={{
          id: "entries-50",
          name: "50 Entries",
          description: "Logged 50 headache entries",
          icon: "📚",
          isUnlocked: false,
        }}
      />
      <AchievementBadge
        achievement={{
          id: "entries-100",
          name: "100 Entries",
          description: "Logged 100 headache entries",
          icon: "🎖️",
          isUnlocked: false,
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Entry count milestone achievements.",
      },
    },
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  args: {
    achievement: unlockedAchievement,
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
 * Interactive with click handler
 */
export const Interactive: Story = {
  args: {
    achievement: unlockedAchievement,
    onClick: () => alert("Achievement clicked!"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Unlocked achievements can be interactive with onClick handler. Useful for showing achievement details in a modal.",
      },
    },
  },
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    achievement: unlockedAchievement,
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try toggling:**
- isUnlocked (true/false)
- Different icons (🔥, ⭐, 🏆, 🌱, etc.)
- Different dates for unlockedAt
        `,
      },
    },
  },
};
