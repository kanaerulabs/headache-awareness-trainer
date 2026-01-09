import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImFineButton } from "./ImFineButton";

const meta: Meta<typeof ImFineButton> = {
  title: "Atoms/ImFineButton",
  component: ImFineButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
ImFineButton is a one-tap dismiss button for headache logging that allows users to quickly indicate they don't have a headache today.

## Features
- Large, tap-friendly button design
- Visual checkmark icon for positive feedback
- Green color scheme to indicate wellness
- Fully accessible with ARIA labels
- Keyboard navigation support

## Accessibility
- ARIA label for screen readers
- Keyboard support (Enter, Space)
- Focus management with visible focus ring
- High color contrast for visibility
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
          {
            id: "button-name",
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "Custom text to display on the button",
    },
    showIcon: {
      control: "boolean",
      description: "Show checkmark icon",
    },
    disabled: {
      control: "boolean",
      description: "Disable button interaction",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImFineButton>;

/**
 * Default state with icon and standard text.
 */
export const Default: Story = {
  args: {
    onClick: () => console.log("I'm fine today clicked"),
  },
  parameters: {
    docs: {
      description: {
        story: `
Default button state with checkmark icon and "I'm fine today" text.
Clicking this button indicates the user has no headache.
        `,
      },
    },
  },
};

/**
 * Button without icon, text only.
 */
export const WithoutIcon: Story = {
  args: {
    showIcon: false,
    onClick: () => console.log("I'm fine today clicked"),
  },
  parameters: {
    docs: {
      description: {
        story: "Button variant without the checkmark icon, showing text only.",
      },
    },
  },
};

/**
 * Custom text variant.
 */
export const CustomText: Story = {
  args: {
    text: "No headache today",
    onClick: () => console.log("Custom text clicked"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Button with custom text. The text prop allows personalization of the message.",
      },
    },
  },
};

/**
 * Disabled state prevents interaction.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: () => console.log("This should not fire when disabled"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Disabled state with reduced opacity. The button cannot be clicked.",
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  args: {
    onClick: () => console.log("Dark mode clicked"),
  },
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
          "Button adapts to dark mode with adjusted colors for better visibility.",
      },
    },
  },
};

/**
 * Interactive playground to test all props.
 */
export const Playground: Story = {
  args: {
    text: "I'm fine today",
    showIcon: true,
    disabled: false,
    onClick: () => alert("Button clicked!"),
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component. Use Storybook controls to modify props.

**Try:**
1. Changing the text
2. Toggling the icon
3. Disabling the button
4. Testing keyboard navigation (Tab, Enter, Space)
        `,
      },
    },
  },
};
