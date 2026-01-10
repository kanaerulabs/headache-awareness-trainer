import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AchievementGrid } from "./AchievementGrid";
import {
  useGamificationStore,
  type AchievementType,
} from "@/interface-adapters/store/gamificationStore";
import { useEffect } from "react";

// Decorator to initialize gamification store
const withGamificationStore = (Story: React.ComponentType) => {
  const initializeDB = useGamificationStore((state) => state.initializeDB);
  const resetAllProgress = useGamificationStore(
    (state) => state.resetAllProgress,
  );

  useEffect(() => {
    initializeDB();
    return () => {
      resetAllProgress();
    };
  }, [initializeDB, resetAllProgress]);

  return <Story />;
};

const meta: Meta<typeof AchievementGrid> = {
  title: "Organisms/AchievementGrid",
  component: AchievementGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
AchievementGrid displays all achievements organized by category with real-time unlock status.

## Features
- Three categories: Streak, First Actions, Milestones
- Grid layout with responsive design
- Progress tracking (X/Y unlocked per category)
- Overall progress percentage
- Integrates with gamificationStore
- Click handler for achievement details
- Dark mode support

## Categories

### 🔥 Streak Achievements
- 3, 7, 14, 30, 60, 90 days

### 🌟 First Actions
- First entry, check-in, pattern, week

### 🏆 Milestones
- Entry counts: 10, 50, 100
- Check-in counts: 10, 50, 100

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
  decorators: [withGamificationStore],
};

export default meta;
type Story = StoryObj<typeof AchievementGrid>;

/**
 * Default - all locked (new user)
 */
export const AllLocked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Initial state for new users with no achievements unlocked yet. Shows all categories with 0/X progress.",
      },
    },
  },
};

/**
 * First entry unlocked - beginner state
 */
export const FirstEntryUnlocked: Story = {
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        unlockAchievement("first-entry");
      }, [unlockAchievement]);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "After logging first headache entry, the 'First Steps' achievement unlocks. Progress: 1/18.",
      },
    },
  },
};

/**
 * Week 1 progress - 3-day streak + first actions
 */
export const Week1Progress: Story = {
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        // Unlock first week achievements
        unlockAchievement("first-entry");
        unlockAchievement("first-checkin");
        unlockAchievement("streak-3-days");
      }, [unlockAchievement]);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "After first week of usage: first entry, first check-in, and 3-day streak unlocked. Progress: 3/18.",
      },
    },
  },
};

/**
 * One month progress - multiple streaks + milestones
 */
export const OneMonthProgress: Story = {
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        // Unlock achievements for one month of usage
        unlockAchievement("first-entry");
        unlockAchievement("first-checkin");
        unlockAchievement("first-pattern");
        unlockAchievement("first-week");
        unlockAchievement("streak-3-days");
        unlockAchievement("streak-7-days");
        unlockAchievement("streak-14-days");
        unlockAchievement("streak-30-days");
        unlockAchievement("entries-10");
        unlockAchievement("checkins-10");
      }, [unlockAchievement]);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "After one month of consistent usage: streak achievements up to 30 days, all first actions, and first milestones. Progress: 10/18.",
      },
    },
  },
};

/**
 * Power user - most achievements unlocked
 */
export const PowerUser: Story = {
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        // Unlock almost all achievements
        const achievementsToUnlock = [
          "first-entry",
          "first-checkin",
          "first-pattern",
          "first-week",
          "streak-3-days",
          "streak-7-days",
          "streak-14-days",
          "streak-30-days",
          "streak-60-days",
          "entries-10",
          "entries-50",
          "entries-100",
          "checkins-10",
          "checkins-50",
        ];

        achievementsToUnlock.forEach((id) => {
          unlockAchievement(id as AchievementType);
        });
      }, [unlockAchievement]);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Power user with most achievements unlocked. Only 90-day streak and 100 check-ins remaining. Progress: 14/18.",
      },
    },
  },
};

/**
 * Complete - all achievements unlocked
 */
export const Complete: Story = {
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        // Unlock all achievements
        const allAchievements = [
          "first-entry",
          "first-checkin",
          "first-pattern",
          "first-week",
          "streak-3-days",
          "streak-7-days",
          "streak-14-days",
          "streak-30-days",
          "streak-60-days",
          "streak-90-days",
          "entries-10",
          "entries-50",
          "entries-100",
          "checkins-10",
          "checkins-50",
          "checkins-100",
        ];

        allAchievements.forEach((id) => {
          unlockAchievement(id as AchievementType);
        });
      }, [unlockAchievement]);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "All achievements unlocked! Perfect 100% completion with 18/18 achievements earned.",
      },
    },
  },
};

/**
 * Interactive with click handler
 */
export const WithClickHandler: Story = {
  args: {
    onAchievementClick: (achievement) => {
      alert(
        `Achievement clicked: ${achievement.name}\n\n${achievement.description}\n\nUnlocked: ${achievement.isUnlocked}`,
      );
    },
  },
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        unlockAchievement("first-entry");
        unlockAchievement("streak-3-days");
      }, [unlockAchievement]);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Click on any unlocked achievement to trigger the click handler. Useful for showing achievement details in a modal.",
      },
    },
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        unlockAchievement("first-entry");
        unlockAchievement("first-checkin");
        unlockAchievement("streak-3-days");
        unlockAchievement("streak-7-days");
      }, [unlockAchievement]);

      return (
        <div className="bg-gray-900 p-8 rounded-lg">
          <Story />
        </div>
      );
    },
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
 * Mobile view
 */
export const MobileView: Story = {
  decorators: [
    (Story) => {
      const unlockAchievement = useGamificationStore(
        (state) => state.unlockAchievement,
      );

      useEffect(() => {
        unlockAchievement("first-entry");
        unlockAchievement("streak-3-days");
        unlockAchievement("entries-10");
      }, [unlockAchievement]);

      return (
        <div className="max-w-[375px]">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Grid adapts to mobile viewports with single column layout on small screens.",
      },
    },
  },
};
