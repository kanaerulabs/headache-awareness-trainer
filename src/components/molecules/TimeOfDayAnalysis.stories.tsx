import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { TimeOfDayAnalysis } from "./TimeOfDayAnalysis";

const meta: Meta<typeof TimeOfDayAnalysis> = {
  title: "Molecules/TimeOfDayAnalysis",
  component: TimeOfDayAnalysis,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Donut chart showing when headaches occur throughout the day with color-coded segments and interactive hover states.",
      },
    },
  },
  argTypes: {
    data: {
      description: "Array of time-of-day data points",
      control: { type: "object" },
    },
    onSegmentTap: {
      description: "Callback when a segment is tapped",
      action: "segment-tapped",
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
type Story = StoryObj<typeof TimeOfDayAnalysis>;

// Balanced distribution
export const Balanced: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 25, count: 5 },
      { timeOfDay: "afternoon", percentage: 25, count: 5 },
      { timeOfDay: "evening", percentage: 25, count: 5 },
      { timeOfDay: "night", percentage: 25, count: 5 },
    ],
  },
};

// Afternoon dominant (most common pattern)
export const AfternoonDominant: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 15, count: 3 },
      { timeOfDay: "afternoon", percentage: 50, count: 10 },
      { timeOfDay: "evening", percentage: 25, count: 5 },
      { timeOfDay: "night", percentage: 10, count: 2 },
    ],
  },
};

// Morning headaches
export const MorningHeadaches: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 60, count: 12 },
      { timeOfDay: "afternoon", percentage: 20, count: 4 },
      { timeOfDay: "evening", percentage: 15, count: 3 },
      { timeOfDay: "night", percentage: 5, count: 1 },
    ],
  },
};

// Evening/Night pattern
export const EveningNightPattern: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 10, count: 2 },
      { timeOfDay: "afternoon", percentage: 15, count: 3 },
      { timeOfDay: "evening", percentage: 40, count: 8 },
      { timeOfDay: "night", percentage: 35, count: 7 },
    ],
  },
};

// Only one time period (edge case)
export const SingleTimePeriod: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 0, count: 0 },
      { timeOfDay: "afternoon", percentage: 100, count: 15 },
      { timeOfDay: "evening", percentage: 0, count: 0 },
      { timeOfDay: "night", percentage: 0, count: 0 },
    ],
  },
};

// Two time periods
export const TwoTimePeriods: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 60, count: 9 },
      { timeOfDay: "afternoon", percentage: 0, count: 0 },
      { timeOfDay: "evening", percentage: 40, count: 6 },
      { timeOfDay: "night", percentage: 0, count: 0 },
    ],
  },
};

// Empty state - no data
export const EmptyState: Story = {
  args: {
    data: [],
  },
};

// All zeros (treated as empty)
export const AllZeros: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 0, count: 0 },
      { timeOfDay: "afternoon", percentage: 0, count: 0 },
      { timeOfDay: "evening", percentage: 0, count: 0 },
      { timeOfDay: "night", percentage: 0, count: 0 },
    ],
  },
};

// With segment tap handler
export const WithInteraction: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 25, count: 5 },
      { timeOfDay: "afternoon", percentage: 40, count: 8 },
      { timeOfDay: "evening", percentage: 20, count: 4 },
      { timeOfDay: "night", percentage: 15, count: 3 },
    ],
    onSegmentTap: (timeOfDay: string) => {
      console.log(`Tapped segment: ${timeOfDay}`);
    },
  },
};

// Small counts (early user)
export const SmallCounts: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 33, count: 1 },
      { timeOfDay: "afternoon", percentage: 33, count: 1 },
      { timeOfDay: "evening", percentage: 34, count: 1 },
      { timeOfDay: "night", percentage: 0, count: 0 },
    ],
  },
};

// Large counts (long-time user)
export const LargeCounts: Story = {
  args: {
    data: [
      { timeOfDay: "morning", percentage: 22, count: 45 },
      { timeOfDay: "afternoon", percentage: 38, count: 76 },
      { timeOfDay: "evening", percentage: 28, count: 56 },
      { timeOfDay: "night", percentage: 12, count: 24 },
    ],
  },
};
