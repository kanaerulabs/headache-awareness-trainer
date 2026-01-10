import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QuickActionButtons } from "./QuickActionButtons";
import { fn } from "@storybook/test";

const meta: Meta<typeof QuickActionButtons> = {
  title: "Molecules/QuickActionButtons",
  component: QuickActionButtons,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    onLogHeadache: {
      action: "logHeadache",
      description: "Callback when Log Headache button is clicked",
    },
    onCheckIn: {
      action: "checkIn",
      description: "Callback when Quick Check-in button is clicked",
    },
    disabled: {
      control: "boolean",
      description: "Disable both buttons",
    },
  },
  args: {
    onLogHeadache: fn(),
    onCheckIn: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof QuickActionButtons>;

/**
 * Default state with both action buttons enabled.
 * Log Headache is the primary action (red), Quick Check-in is secondary (blue outline).
 */
export const Default: Story = {
  args: {},
};

/**
 * Disabled state when actions should not be available.
 * Both buttons are disabled and show reduced opacity.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Mobile viewport demonstration.
 * Buttons stack vertically on smaller screens.
 */
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

/**
 * Tablet viewport demonstration.
 * Buttons display side by side on larger screens.
 */
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};

/**
 * Dark mode demonstration.
 * Shows how buttons adapt to dark theme.
 */
export const DarkMode: Story = {
  args: {},
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

/**
 * Interactive example showing click feedback.
 * Click the buttons to see the active state animation.
 */
export const Interactive: Story = {
  args: {
    onLogHeadache: () => alert("Log Headache clicked!"),
    onCheckIn: () => alert("Quick Check-in clicked!"),
  },
};
