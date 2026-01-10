import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CorrelationBars } from "./CorrelationBars";
import type { CorrelationResult } from "./CorrelationBars";

const meta: Meta<typeof CorrelationBars> = {
  title: "Molecules/CorrelationBars",
  component: CorrelationBars,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    onCorrelationTap: { action: "correlation-tapped" },
  },
};

export default meta;
type Story = StoryObj<typeof CorrelationBars>;

const sampleCorrelations: CorrelationResult[] = [
  {
    factor: "stress",
    strength: 85,
    trend: "positive",
    description:
      "High stress levels show a strong positive correlation with headaches. On days when you reported stress levels above 7/10, you were 85% more likely to experience a headache.",
  },
  {
    factor: "sleep",
    strength: 72,
    trend: "negative",
    description:
      "Better sleep quality is strongly associated with fewer headaches. Getting 7+ hours of quality sleep reduced headache likelihood by 72%.",
  },
  {
    factor: "jawTension",
    strength: 68,
    trend: "positive",
    description:
      "Jaw tension is a strong trigger for your headaches. Moderate-to-high jaw tension (5+/10) preceded 68% of your logged headaches.",
  },
  {
    factor: "mood",
    strength: 45,
    trend: "neutral",
    description:
      "Mood shows a moderate correlation with headaches. While lower mood scores appear more often on headache days, the pattern is not yet conclusive.",
  },
  {
    factor: "timeOfDay",
    strength: 28,
    trend: "neutral",
    description:
      "Time of day shows a weak correlation with your headaches. No clear pattern has emerged yet regarding when headaches are most likely to occur.",
  },
];

export const AllStrengths: Story = {
  args: {
    correlations: sampleCorrelations,
  },
};

export const StrongCorrelationsOnly: Story = {
  args: {
    correlations: [
      {
        factor: "stress",
        strength: 88,
        trend: "positive",
        description:
          "Stress is your #1 headache trigger. High stress (8+/10) preceded 88% of headaches.",
      },
      {
        factor: "sleep",
        strength: 75,
        trend: "negative",
        description:
          "Poor sleep (<6 hours) is strongly linked to headaches. Better sleep reduces risk by 75%.",
      },
      {
        factor: "jawTension",
        strength: 71,
        trend: "positive",
        description:
          "Jaw clenching/tension is a major trigger. High tension (7+/10) appears in 71% of headache events.",
      },
    ],
  },
};

export const MediumCorrelations: Story = {
  args: {
    correlations: [
      {
        factor: "mood",
        strength: 55,
        trend: "neutral",
        description:
          "Mood shows moderate correlation. Lower mood tends to co-occur with headaches but causality is unclear.",
      },
      {
        factor: "timeOfDay",
        strength: 48,
        trend: "positive",
        description:
          "Afternoon hours (2-5pm) show moderate association with headache onset.",
      },
    ],
  },
};

export const WeakCorrelations: Story = {
  args: {
    correlations: [
      {
        factor: "timeOfDay",
        strength: 22,
        trend: "neutral",
        description:
          "No clear time-of-day pattern detected yet. Keep logging to identify trends.",
      },
      {
        factor: "mood",
        strength: 18,
        trend: "neutral",
        description:
          "Mood correlation is currently weak. More data needed to establish a clear pattern.",
      },
    ],
  },
};

export const MixedTrends: Story = {
  args: {
    correlations: [
      {
        factor: "stress",
        strength: 90,
        trend: "positive",
        description: "More stress → more headaches (90% correlation)",
      },
      {
        factor: "sleep",
        strength: 78,
        trend: "negative",
        description: "More sleep → fewer headaches (78% correlation)",
      },
      {
        factor: "jawTension",
        strength: 82,
        trend: "positive",
        description: "More jaw tension → more headaches (82% correlation)",
      },
      {
        factor: "mood",
        strength: 35,
        trend: "neutral",
        description: "Mood shows neutral correlation (35%)",
      },
    ],
  },
};

export const SingleCorrelation: Story = {
  args: {
    correlations: [
      {
        factor: "stress",
        strength: 92,
        trend: "positive",
        description:
          "Stress is by far your strongest headache trigger. Managing stress may significantly reduce headache frequency.",
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    correlations: [],
  },
};

export const Interactive: Story = {
  args: {
    correlations: sampleCorrelations,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click on any correlation bar to expand and view the detailed description.",
      },
    },
  },
};

export const WithCustomHandler: Story = {
  args: {
    correlations: sampleCorrelations,
    onCorrelationTap: (factor) => {
      alert(`You tapped: ${factor}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates custom tap handler callback functionality.",
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    correlations: sampleCorrelations,
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
