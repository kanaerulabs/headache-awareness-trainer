import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TrendIndicator } from "./TrendIndicator";

const meta: Meta<typeof TrendIndicator> = {
  title: "Molecules/TrendIndicator",
  component: TrendIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    trend: {
      control: "select",
      options: ["improving", "stable", "declining"],
      description: "Current trend direction",
    },
    showLabel: {
      control: "boolean",
      description: "Show text label alongside icon",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrendIndicator>;

/**
 * Default state showing an improving trend with green arrow up.
 * Indicates headaches are getting better.
 */
export const Improving: Story = {
  args: {
    trend: "improving",
  },
};

/**
 * Stable trend with gray horizontal line.
 * Indicates headaches are consistent (neither better nor worse).
 */
export const Stable: Story = {
  args: {
    trend: "stable",
  },
};

/**
 * Declining trend with amber arrow down.
 * Uses amber (not red) to reduce alarm while still indicating concern.
 */
export const Declining: Story = {
  args: {
    trend: "declining",
  },
};

/**
 * Icon-only variant without text label.
 * Useful when space is limited.
 */
export const IconOnly: Story = {
  args: {
    trend: "improving",
    showLabel: false,
  },
};

/**
 * All three states side by side for comparison.
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TrendIndicator trend="improving" />
      <TrendIndicator trend="stable" />
      <TrendIndicator trend="declining" />
    </div>
  ),
};

/**
 * Icon-only variants side by side.
 */
export const AllStatesIconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      <TrendIndicator trend="improving" showLabel={false} />
      <TrendIndicator trend="stable" showLabel={false} />
      <TrendIndicator trend="declining" showLabel={false} />
    </div>
  ),
};
