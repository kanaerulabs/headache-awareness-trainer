import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContextTagChips } from "./ContextTagChips";
import { useState } from "react";

const meta: Meta<typeof ContextTagChips> = {
  title: "Molecules/ContextTagChips",
  component: ContextTagChips,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
ContextTagChips is a multi-select chip-based tag selector for adding contextual information to headache entries.

## Features
- 8 pre-defined context tags
- Multi-select capability
- Tap-friendly chip buttons
- Visual feedback (selected chips highlighted in blue)
- Selection count display
- Keyboard navigation and ARIA support

## Available Tags
- **Woke up with it** - Headache present upon waking
- **Came on gradually** - Slow onset
- **Sudden onset** - Rapid onset
- **Morning** - Time-based tag
- **Evening** - Time-based tag
- **After meal** - Trigger-based tag
- **After exercise** - Trigger-based tag
- **Weather change** - Environmental trigger

## Accessibility
- ARIA group role with descriptive label
- Checkbox role for each tag
- Keyboard support (Enter, Space, Tab)
- Live region for selection count
- Focus management with visible focus ring
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
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContextTagChips>;

/**
 * Interactive component with state management.
 */
const ContextTagChipsWithState = (args: {
  initialTags?: string[];
  disabled?: boolean;
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    args.initialTags || [],
  );

  const handleToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <ContextTagChips
      selectedTags={selectedTags}
      onTagToggle={handleToggle}
      disabled={args.disabled}
    />
  );
};

/**
 * Default state with no tags selected.
 */
export const Default: Story = {
  render: () => <ContextTagChipsWithState />,
  parameters: {
    docs: {
      description: {
        story: `
Default state with no tags selected. Users can tap any chip to select it.
Multiple tags can be selected simultaneously.
        `,
      },
    },
  },
};

/**
 * Single tag selected.
 */
export const SingleSelection: Story = {
  render: () => <ContextTagChipsWithState initialTags={["woke-up-with-it"]} />,
  parameters: {
    docs: {
      description: {
        story:
          'One tag selected ("Woke up with it"). The selected chip is highlighted in blue.',
      },
    },
  },
};

/**
 * Multiple tags selected.
 */
export const MultipleSelection: Story = {
  render: () => (
    <ContextTagChipsWithState
      initialTags={["sudden-onset", "evening", "weather-change"]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Multiple tags selected showing how users can combine context information. The selection count is displayed below.",
      },
    },
  },
};

/**
 * All onset-related tags selected.
 */
export const OnsetTags: Story = {
  render: () => (
    <ContextTagChipsWithState
      initialTags={["woke-up-with-it", "came-on-gradually", "sudden-onset"]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Example showing onset-related tags. Note: Users would typically select only one onset tag.",
      },
    },
  },
};

/**
 * Time and trigger tags selected.
 */
export const TimeAndTriggers: Story = {
  render: () => (
    <ContextTagChipsWithState
      initialTags={["morning", "after-meal", "after-exercise"]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Example showing time-based and trigger-based tags selected together.",
      },
    },
  },
};

/**
 * Disabled state prevents interaction.
 */
export const Disabled: Story = {
  render: () => (
    <ContextTagChipsWithState
      initialTags={["evening", "weather-change"]}
      disabled
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Disabled state with reduced opacity. Users cannot change tag selection.",
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  render: () => (
    <ContextTagChipsWithState
      initialTags={["sudden-onset", "after-meal"]}
    />
  ),
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
          "Component adapts to dark mode with adjusted colors for better visibility.",
      },
    },
  },
};

/**
 * Interactive playground to test all functionality.
 */
export const Playground: Story = {
  render: () => <ContextTagChipsWithState />,
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try:**
1. Selecting and deselecting tags
2. Selecting multiple tags
3. Using keyboard navigation (Tab, Enter, Space)
4. Testing with screen reader
5. Observing selection count updates
        `,
      },
    },
  },
};
