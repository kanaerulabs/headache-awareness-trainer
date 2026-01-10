import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { MoodStressTracker, Mood } from "./MoodStressTracker";

const meta: Meta<typeof MoodStressTracker> = {
  title: "Molecules/MoodStressTracker",
  component: MoodStressTracker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mood: {
      control: "select",
      options: ["great", "good", "neutral", "low", "bad", null],
      description: "Current mood selection",
    },
    stressLevel: {
      control: { type: "range", min: 0, max: 10, step: 1 },
      description: "Current stress level (0-10)",
    },
    disabled: {
      control: "boolean",
      description: "Disable the tracker",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MoodStressTracker>;

// Interactive wrapper component
const InteractiveMoodStressTracker = (args: {
  mood?: Mood | null;
  stressLevel?: number;
  disabled?: boolean;
  onMoodChange?: (mood: Mood) => void;
  onStressChange?: (level: number) => void;
}) => {
  const [mood, setMood] = useState<Mood | null>(args.mood ?? null);
  const [stressLevel, setStressLevel] = useState<number>(args.stressLevel ?? 5);

  return (
    <div className="w-full max-w-2xl">
      <MoodStressTracker
        {...args}
        mood={mood}
        stressLevel={stressLevel}
        onMoodChange={(newMood) => {
          setMood(newMood);
          args.onMoodChange?.(newMood);
        }}
        onStressChange={(newLevel) => {
          setStressLevel(newLevel);
          args.onStressChange?.(newLevel);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <InteractiveMoodStressTracker {...args} />,
  args: {
    mood: null,
    stressLevel: 5,
    disabled: false,
  },
};

export const GreatMoodLowStress: Story = {
  render: (args) => <InteractiveMoodStressTracker {...args} />,
  args: {
    mood: "great",
    stressLevel: 2,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Feeling great with low stress - ideal state",
      },
    },
  },
};

export const NeutralMoodModerateStress: Story = {
  render: (args) => <InteractiveMoodStressTracker {...args} />,
  args: {
    mood: "neutral",
    stressLevel: 5,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Neutral mood with moderate stress",
      },
    },
  },
};

export const BadMoodHighStress: Story = {
  render: (args) => <InteractiveMoodStressTracker {...args} />,
  args: {
    mood: "bad",
    stressLevel: 9,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Bad mood with high stress - may need support",
      },
    },
  },
};

export const LowMoodMildStress: Story = {
  render: (args) => <InteractiveMoodStressTracker {...args} />,
  args: {
    mood: "low",
    stressLevel: 4,
    disabled: false,
  },
};

export const Disabled: Story = {
  render: (args) => <InteractiveMoodStressTracker {...args} />,
  args: {
    mood: "neutral",
    stressLevel: 5,
    disabled: true,
  },
};

export const AllMoods: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Great Mood - Low Stress</h3>
        <InteractiveMoodStressTracker
          mood="great"
          stressLevel={1}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Good Mood - Mild Stress</h3>
        <InteractiveMoodStressTracker
          mood="good"
          stressLevel={3}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Neutral Mood - Moderate Stress
        </h3>
        <InteractiveMoodStressTracker
          mood="neutral"
          stressLevel={5}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Low Mood - Moderate Stress
        </h3>
        <InteractiveMoodStressTracker
          mood="low"
          stressLevel={7}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Bad Mood - High Stress</h3>
        <InteractiveMoodStressTracker
          mood="bad"
          stressLevel={9}
          disabled={false}
        />
      </div>
    </div>
  ),
};

export const StressProgression: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Calm (0)</h3>
        <InteractiveMoodStressTracker
          mood="great"
          stressLevel={0}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Mild Stress (3)</h3>
        <InteractiveMoodStressTracker
          mood="good"
          stressLevel={3}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Moderate Stress (7)</h3>
        <InteractiveMoodStressTracker
          mood="neutral"
          stressLevel={7}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">High Stress (10)</h3>
        <InteractiveMoodStressTracker
          mood="low"
          stressLevel={10}
          disabled={false}
        />
      </div>
    </div>
  ),
};
