import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IntensitySlider } from "./IntensitySlider";
import { useState } from "react";

const meta: Meta<typeof IntensitySlider> = {
  title: "Molecules/IntensitySlider",
  component: IntensitySlider,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
IntensitySlider is a large, tap-friendly intensity selector for headache logging with color-coded visual feedback.

## Features
- 5 intensity levels (Minimal to Extreme)
- Color-coded buttons: Green → Yellow → Orange → Red → Dark Red
- Visual feedback with ring around selected value
- Keyboard navigation and ARIA support
- Current selection display with live region
- Responsive grid layout

## Intensity Levels
1. **Minimal** (Green) - Barely noticeable
2. **Mild** (Yellow) - Present but manageable
3. **Moderate** (Orange) - Distracting
4. **Severe** (Red) - Very painful
5. **Extreme** (Dark Red) - Unbearable

## Accessibility
- ARIA radiogroup role
- Live region for selection announcements
- Keyboard support (Enter, Space, Arrow keys)
- Focus management with visible focus ring
- Descriptive labels for each intensity level
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
type Story = StoryObj<typeof IntensitySlider>;

/**
 * Interactive component with state management.
 */
const IntensitySliderWithState = (args: { disabled?: boolean }) => {
  const [value, setValue] = useState<1 | 2 | 3 | 4 | 5>(3);

  return (
    <IntensitySlider
      value={value}
      onChange={setValue}
      disabled={args.disabled}
    />
  );
};

/**
 * Default state with moderate intensity selected.
 */
export const Default: Story = {
  render: () => <IntensitySliderWithState />,
  parameters: {
    docs: {
      description: {
        story: `
Default state with intensity level 3 (Moderate) selected.
Users can tap any button to change the intensity level.
        `,
      },
    },
  },
};

/**
 * Level 1 - Minimal intensity (Green).
 */
export const Minimal: Story = {
  args: {
    value: 1,
    onChange: (val) => console.log("Intensity changed to:", val),
  },
  parameters: {
    docs: {
      description: {
        story: "Intensity level 1 (Minimal) selected, shown in green color.",
      },
    },
  },
};

/**
 * Level 2 - Mild intensity (Yellow).
 */
export const Mild: Story = {
  args: {
    value: 2,
    onChange: (val) => console.log("Intensity changed to:", val),
  },
  parameters: {
    docs: {
      description: {
        story: "Intensity level 2 (Mild) selected, shown in yellow color.",
      },
    },
  },
};

/**
 * Level 3 - Moderate intensity (Orange).
 */
export const Moderate: Story = {
  args: {
    value: 3,
    onChange: (val) => console.log("Intensity changed to:", val),
  },
  parameters: {
    docs: {
      description: {
        story: "Intensity level 3 (Moderate) selected, shown in orange color.",
      },
    },
  },
};

/**
 * Level 4 - Severe intensity (Red).
 */
export const Severe: Story = {
  args: {
    value: 4,
    onChange: (val) => console.log("Intensity changed to:", val),
  },
  parameters: {
    docs: {
      description: {
        story: "Intensity level 4 (Severe) selected, shown in red color.",
      },
    },
  },
};

/**
 * Level 5 - Extreme intensity (Dark Red).
 */
export const Extreme: Story = {
  args: {
    value: 5,
    onChange: (val) => console.log("Intensity changed to:", val),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Intensity level 5 (Extreme) selected, shown in dark red color.",
      },
    },
  },
};

/**
 * Disabled state prevents interaction.
 */
export const Disabled: Story = {
  render: () => <IntensitySliderWithState disabled />,
  parameters: {
    docs: {
      description: {
        story:
          "Disabled state with reduced opacity. Users cannot change the intensity.",
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  render: () => <IntensitySliderWithState />,
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
          "Component adapts to dark mode with adjusted text colors for better visibility.",
      },
    },
  },
};

/**
 * Interactive playground to test all states.
 */
export const Playground: Story = {
  render: () => <IntensitySliderWithState />,
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try:**
1. Clicking different intensity levels
2. Using keyboard navigation (Tab, Enter, Space)
3. Testing with screen reader
4. Observing color feedback and selection ring
        `,
      },
    },
  },
};
