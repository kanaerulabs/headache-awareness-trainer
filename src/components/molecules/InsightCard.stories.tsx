import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { InsightCard } from "./InsightCard";

const meta: Meta<typeof InsightCard> = {
  title: "Molecules/InsightCard",
  component: InsightCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays personalized insights with category-specific gradients, icons, and locked/unlocked states with smooth animations.",
      },
    },
  },
  argTypes: {
    insight: {
      description: "The insight object to display",
      control: { type: "object" },
    },
    onTap: {
      description: "Callback when card is tapped",
      action: "card-tapped",
    },
    className: {
      description: "Additional CSS classes",
      control: { type: "text" },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: "400px", maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InsightCard>;

// Pattern category - Unlocked
export const PatternUnlocked: Story = {
  args: {
    insight: {
      id: "pattern-1",
      title: "Afternoon Pattern Detected",
      description:
        "You tend to get headaches between 2-4 PM on weekdays. This suggests a correlation with afternoon work stress or screen time.",
      category: "pattern",
      isPersonal: false,
      isUnlocked: true,
    },
  },
};

// Trigger category - Unlocked
export const TriggerUnlocked: Story = {
  args: {
    insight: {
      id: "trigger-1",
      title: "Caffeine Sensitivity",
      description:
        "Headaches occur more frequently on days with high caffeine intake (>3 cups). Consider gradually reducing consumption.",
      category: "trigger",
      isPersonal: false,
      isUnlocked: true,
    },
  },
};

// Tip category - Unlocked
export const TipUnlocked: Story = {
  args: {
    insight: {
      id: "tip-1",
      title: "Hydration Reminder",
      description:
        "Try drinking a glass of water at the first sign of a headache. Dehydration is a common trigger that's easy to address.",
      category: "tip",
      isPersonal: false,
      isUnlocked: true,
    },
  },
};

// Achievement category - Unlocked
export const AchievementUnlocked: Story = {
  args: {
    insight: {
      id: "achievement-1",
      title: "7-Day Streak!",
      description:
        "You've logged your headaches consistently for 7 days. This data will help you identify patterns more accurately.",
      category: "achievement",
      isPersonal: false,
      isUnlocked: true,
    },
  },
};

// Personal insight - Locked
export const PersonalLocked: Story = {
  args: {
    insight: {
      id: "locked-1",
      title: "Personal Pattern Insight",
      description: "This is hidden content that will be revealed.",
      category: "pattern",
      isPersonal: true,
      isUnlocked: false,
      unlockCondition: "Log 7 more headaches to unlock",
    },
  },
};

// Personal insight - Locked (different category)
export const TriggerLocked: Story = {
  args: {
    insight: {
      id: "locked-2",
      title: "Personal Trigger Analysis",
      description: "This is hidden content that will be revealed.",
      category: "trigger",
      isPersonal: true,
      isUnlocked: false,
      unlockCondition: "Track triggers for 14 days to unlock",
    },
  },
};

// Personal insight - Locked (no unlock condition)
export const LockedNoCondition: Story = {
  args: {
    insight: {
      id: "locked-3",
      title: "Mystery Achievement",
      description: "This is hidden content that will be revealed.",
      category: "achievement",
      isPersonal: true,
      isUnlocked: false,
    },
  },
};

// With interaction
export const WithInteraction: Story = {
  args: {
    insight: {
      id: "interactive-1",
      title: "Sleep Quality Connection",
      description:
        "Headaches are 60% more likely after nights with less than 6 hours of sleep. Prioritize consistent sleep schedules.",
      category: "pattern",
      isPersonal: false,
      isUnlocked: true,
    },
    onTap: (id: string) => {
      console.log(`Tapped insight: ${id}`);
    },
  },
};

// Long content
export const LongContent: Story = {
  args: {
    insight: {
      id: "long-1",
      title: "Complex Pattern Analysis",
      description:
        "Over the past month, we've identified a complex pattern involving multiple factors: screen time exceeding 8 hours, inadequate water intake (less than 6 glasses), high stress levels during work hours, and insufficient break intervals. These factors appear to compound, with headaches occurring most frequently when 3 or more of these conditions are met simultaneously. Consider addressing these areas systematically, starting with the easiest to modify.",
      category: "pattern",
      isPersonal: false,
      isUnlocked: true,
    },
  },
};

// Short content
export const ShortContent: Story = {
  args: {
    insight: {
      id: "short-1",
      title: "Quick Win!",
      description: "Take regular breaks.",
      category: "tip",
      isPersonal: false,
      isUnlocked: true,
    },
  },
};

// Simulate unlocking animation (requires manual state change)
export const UnlockingAnimation: Story = {
  args: {
    insight: {
      id: "unlock-anim",
      title: "Weekend Warrior Pattern",
      description:
        "Headaches decrease by 40% on weekends. Work-related stress may be a significant factor.",
      category: "pattern",
      isPersonal: true,
      isUnlocked: true, // Set to true to show unlocked state
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story shows the unlocked state. To see the unlock animation, you would need to toggle `isUnlocked` from false to true programmatically.",
      },
    },
  },
};

// All categories showcase
export const AllCategories: Story = {
  render: () => (
    <div className="space-y-4">
      <InsightCard
        insight={{
          id: "cat-1",
          title: "Pattern Insight",
          description: "This is a pattern-based insight with blue gradient.",
          category: "pattern",
          isPersonal: false,
          isUnlocked: true,
        }}
      />
      <InsightCard
        insight={{
          id: "cat-2",
          title: "Trigger Warning",
          description: "This is a trigger-based insight with orange gradient.",
          category: "trigger",
          isPersonal: false,
          isUnlocked: true,
        }}
      />
      <InsightCard
        insight={{
          id: "cat-3",
          title: "Helpful Tip",
          description: "This is a tip-based insight with green gradient.",
          category: "tip",
          isPersonal: false,
          isUnlocked: true,
        }}
      />
      <InsightCard
        insight={{
          id: "cat-4",
          title: "Achievement Unlocked",
          description:
            "This is an achievement-based insight with purple gradient.",
          category: "achievement",
          isPersonal: false,
          isUnlocked: true,
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcases all four category types with their respective color gradients and icons.",
      },
    },
  },
};

// Locked vs Unlocked comparison
export const LockedVsUnlocked: Story = {
  render: () => (
    <div className="space-y-4">
      <InsightCard
        insight={{
          id: "compare-locked",
          title: "Secret Pattern",
          description: "Hidden content goes here.",
          category: "pattern",
          isPersonal: true,
          isUnlocked: false,
          unlockCondition: "Complete 10 more entries",
        }}
      />
      <InsightCard
        insight={{
          id: "compare-unlocked",
          title: "Revealed Pattern",
          description:
            "This insight has been unlocked and is now fully visible with all details.",
          category: "pattern",
          isPersonal: true,
          isUnlocked: true,
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Side-by-side comparison of locked and unlocked states.",
      },
    },
  },
};
