import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NoteInput } from "./NoteInput";
import { useState } from "react";

const meta: Meta<typeof NoteInput> = {
  title: "Molecules/NoteInput",
  component: NoteInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
NoteInput is a free-text textarea component with character limit indicator and optional voice input button.

## Features
- Multi-line textarea for detailed notes
- Character limit indicator (default: 500 characters)
- Color-coded limit warnings (orange at 50 chars left, red at 0)
- Voice input button (placeholder for future implementation)
- Auto-resize disabled for consistent UX
- Keyboard and screen reader accessible

## Character Limit Feedback
- **Normal** (>50 chars left): Gray text
- **Warning** (≤50 chars left): Orange text
- **At Limit** (0 chars left): Red text, shows "Limit reached"

## Accessibility
- Proper label association
- aria-describedby for character count
- Live region for character count updates
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
          {
            id: "label",
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
type Story = StoryObj<typeof NoteInput>;

/**
 * Interactive component with state management.
 */
const NoteInputWithState = (args: {
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  withVoiceInput?: boolean;
}) => {
  const [value, setValue] = useState("");

  return (
    <NoteInput
      value={value}
      onChange={setValue}
      onVoiceInput={
        args.withVoiceInput
          ? () => alert("Voice input coming soon!")
          : undefined
      }
      maxLength={args.maxLength}
      placeholder={args.placeholder}
      disabled={args.disabled}
    />
  );
};

/**
 * Default state with empty input.
 */
export const Default: Story = {
  render: () => <NoteInputWithState withVoiceInput />,
  parameters: {
    docs: {
      description: {
        story: `
Default empty state with placeholder text and voice input button.
Character count shows 0 / 500.
        `,
      },
    },
  },
};

/**
 * With some text entered.
 */
export const WithText: Story = {
  args: {
    value: "Headache started after lunch, dull pain on the right side.",
    onChange: (val) => console.log("Note changed:", val),
    onVoiceInput: () => alert("Voice input coming soon!"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Input with text entered. Character count updates as user types.",
      },
    },
  },
};

/**
 * Near character limit (warning state).
 */
export const NearLimit: Story = {
  args: {
    value:
      "This is a longer note that demonstrates the warning state when approaching the character limit. The text color changes to orange when there are 50 or fewer characters remaining. This helps users know they should wrap up their note soon. The character count is displayed prominently below the input field. Notice how the count changes color to orange when you get close to the limit. Users can still type more, but they'll see the warning color to indicate they're running out of space. This visual feedback helps prevent users from hitting the limit unexpectedly.",
    onChange: (val) => console.log("Note changed:", val),
    onVoiceInput: () => alert("Voice input coming soon!"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Warning state with orange text when 50 or fewer characters remain. Shows '30 left' indicator.",
      },
    },
  },
};

/**
 * At character limit (error state).
 */
export const AtLimit: Story = {
  args: {
    value:
      "This note has reached the maximum character limit. When users reach this point, they cannot type any more characters. The character count indicator turns red and displays 'Limit reached' to clearly communicate that no more text can be entered. This provides immediate feedback to users so they know they need to edit their note if they want to add more information. The limit helps keep notes concise and focused, which is beneficial for both the user and any analysis that might be performed on the notes later. Users can still edit and delete text to make room for new information.",
    onChange: (val) => console.log("Note changed:", val),
    onVoiceInput: () => alert("Voice input coming soon!"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "At the 500 character limit. Text is red and shows 'Limit reached'. No more characters can be typed.",
      },
    },
  },
};

/**
 * Without voice input button.
 */
export const WithoutVoiceInput: Story = {
  render: () => <NoteInputWithState withVoiceInput={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "Variant without the voice input button. Use this when voice input is not available or disabled.",
      },
    },
  },
};

/**
 * Custom character limit.
 */
export const CustomLimit: Story = {
  render: () => <NoteInputWithState maxLength={100} withVoiceInput />,
  parameters: {
    docs: {
      description: {
        story:
          "Example with a custom character limit of 100. The maxLength prop allows flexibility for different use cases.",
      },
    },
  },
};

/**
 * Custom placeholder text.
 */
export const CustomPlaceholder: Story = {
  render: () => (
    <NoteInputWithState
      placeholder="Describe your headache symptoms..."
      withVoiceInput
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Example with custom placeholder text for better context.",
      },
    },
  },
};

/**
 * Disabled state.
 */
export const Disabled: Story = {
  args: {
    value: "This note cannot be edited because the input is disabled.",
    onChange: () => {
      // This should not fire when disabled
    },
    disabled: true,
    onVoiceInput: () => alert("This should not fire"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Disabled state with reduced opacity. Neither typing nor voice input is available.",
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  render: () => <NoteInputWithState withVoiceInput />,
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
          "Component adapts to dark mode with adjusted background, text, and border colors.",
      },
    },
  },
};

/**
 * Interactive playground.
 */
export const Playground: Story = {
  render: () => <NoteInputWithState withVoiceInput />,
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try:**
1. Typing text to see character count update
2. Reaching the character limit
3. Clicking the voice input button
4. Using keyboard navigation (Tab)
5. Testing with screen reader
        `,
      },
    },
  },
};
