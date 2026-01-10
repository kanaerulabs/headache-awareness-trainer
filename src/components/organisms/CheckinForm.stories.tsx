import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CheckinForm } from "./CheckinForm";
import { fn } from "@storybook/test";

const meta: Meta<typeof CheckinForm> = {
  title: "Organisms/CheckinForm",
  component: CheckinForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Quick daily check-in form designed to be completed in under 15 seconds. " +
          "Includes quick dismiss option and detailed form with mood, body tension, " +
          "sleep quality, physical factors, and optional notes.",
      },
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disable all form interactions",
    },
    onSubmit: {
      action: "submitted",
      description: "Callback when form is submitted with full details",
    },
    onQuickDismiss: {
      action: "quick-dismissed",
      description: "Callback when quick dismiss button is clicked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckinForm>;

// Interactive wrapper that shows submission feedback
const InteractiveCheckinForm = (args: {
  disabled?: boolean;
  onSubmit?: (id: string) => void;
  onQuickDismiss?: (id: string) => void;
}) => {
  const [lastSubmission, setLastSubmission] = useState<{
    type: "submit" | "quick-dismiss";
    id: string;
  } | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      <CheckinForm
        {...args}
        onSubmit={(id) => {
          setLastSubmission({ type: "submit", id });
          args.onSubmit?.(id);
        }}
        onQuickDismiss={(id) => {
          setLastSubmission({ type: "quick-dismiss", id });
          args.onQuickDismiss?.(id);
        }}
      />

      {/* Feedback display */}
      {lastSubmission && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            ✓ Check-in Logged!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Type: <strong>{lastSubmission.type}</strong>
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ID: {lastSubmission.id}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Default state - empty form ready for user input
 */
export const Default: Story = {
  render: (args) => <InteractiveCheckinForm {...args} />,
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default empty form. Users can either tap 'All good! 👍' for quick dismiss or fill in details.",
      },
    },
  },
};

/**
 * Quick dismiss flow - primary use case for good days
 */
export const QuickDismissFlow: Story = {
  render: (args) => (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Quick Dismiss Flow
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          For days when you&apos;re feeling great, just tap the &quot;All good!
          👍&quot; button. This logs a check-in with default positive values in
          one tap.
        </p>
      </div>
      <InteractiveCheckinForm {...args} />
    </div>
  ),
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Quick dismiss flow demonstration. Single tap logs check-in with calm mood, no tension, good sleep.",
      },
    },
  },
};

/**
 * Detailed entry flow - for tracking specific factors
 */
export const DetailedEntryFlow: Story = {
  render: (args) => (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
          📝 Detailed Entry Flow
        </h3>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          When you want to track specific factors like mood, body tension, or
          sleep quality, use the detailed form below the quick dismiss button.
        </p>
      </div>
      <InteractiveCheckinForm {...args} />
    </div>
  ),
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Detailed entry flow. Fill in mood (required), body tension (optional), sleep quality (required), and notes.",
      },
    },
  },
};

/**
 * Mobile view - primary target platform
 */
export const MobileView: Story = {
  render: (args) => <InteractiveCheckinForm {...args} />,
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Mobile view (375px). Form is optimized for mobile-first with minimal scrolling required.",
      },
    },
  },
};

/**
 * Tablet view
 */
export const TabletView: Story = {
  render: (args) => <InteractiveCheckinForm {...args} />,
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "Tablet view (768px). Form scales well to larger screens.",
      },
    },
  },
};

/**
 * Disabled state - form cannot be interacted with
 */
export const Disabled: Story = {
  render: (args) => <InteractiveCheckinForm {...args} />,
  args: {
    disabled: true,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Disabled state. All interactions are blocked (e.g., while submitting or during initialization).",
      },
    },
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  render: (args) => <InteractiveCheckinForm {...args} />,
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Dark mode theme with proper contrast and visibility.",
      },
    },
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
 * Complete example with all sections filled
 */
export const CompleteExample: Story = {
  render: (args) => (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          📋 Complete Example
        </h3>
        <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
          <li>Select a mood (e.g., &quot;Stressed&quot;)</li>
          <li>
            Select body tension areas (e.g., &quot;Neck&quot;,
            &quot;Shoulders&quot;)
          </li>
          <li>Select sleep quality (e.g., &quot;OK&quot;)</li>
          <li>
            Optional: Select physical factors (e.g., &quot;Fatigue&quot;) and
            add notes
          </li>
          <li>Tap &quot;Log Check-in ✓&quot; to submit</li>
        </ol>
      </div>
      <InteractiveCheckinForm {...args} />
    </div>
  ),
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complete example showing all form sections. Follow the steps above to see validation in action.",
      },
    },
  },
};

/**
 * Accessibility showcase
 */
export const AccessibilityShowcase: Story = {
  render: (args) => (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
          ♿ Accessibility Features
        </h3>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
          <li>
            <strong>Keyboard navigation:</strong> Tab through all interactive
            elements
          </li>
          <li>
            <strong>ARIA labels:</strong> Screen reader support for all inputs
          </li>
          <li>
            <strong>Focus indicators:</strong> Visible focus rings on all
            buttons
          </li>
          <li>
            <strong>Required field indicators:</strong> Visual and semantic
            marking
          </li>
          <li>
            <strong>Error messages:</strong> Clear validation feedback
          </li>
        </ul>
      </div>
      <InteractiveCheckinForm {...args} />
    </div>
  ),
  args: {
    disabled: false,
    onSubmit: fn(),
    onQuickDismiss: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Accessibility demonstration. Try using keyboard only (Tab, Enter, Space) to navigate and submit.",
      },
    },
  },
};
