import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { TensionTracker } from "./TensionTracker";

const meta: Meta<typeof TensionTracker> = {
  title: "Molecules/TensionTracker",
  component: TensionTracker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 10, step: 1 },
      description: "Current tension level (0-10)",
    },
    disabled: {
      control: "boolean",
      description: "Disable the tracker",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TensionTracker>;

// Interactive wrapper component
const InteractiveTensionTracker = (args: { value?: number; disabled?: boolean; onChange?: (value: number) => void }) => {
  const [value, setValue] = useState<number>(args.value ?? 5);

  return (
    <div className="w-full max-w-2xl">
      <TensionTracker
        {...args}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          args.onChange?.(newValue);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <InteractiveTensionTracker {...args} />,
  args: {
    value: 5,
    disabled: false,
  },
};

export const Relaxed: Story = {
  render: (args) => <InteractiveTensionTracker {...args} />,
  args: {
    value: 0,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Completely relaxed state - no body tension",
      },
    },
  },
};

export const MildTension: Story = {
  render: (args) => <InteractiveTensionTracker {...args} />,
  args: {
    value: 3,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Mild tension - slight discomfort",
      },
    },
  },
};

export const ModerateTension: Story = {
  render: (args) => <InteractiveTensionTracker {...args} />,
  args: {
    value: 7,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Moderate tension - noticeable discomfort",
      },
    },
  },
};

export const SevereTension: Story = {
  render: (args) => <InteractiveTensionTracker {...args} />,
  args: {
    value: 10,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Severe tension - extreme discomfort",
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => <InteractiveTensionTracker {...args} />,
  args: {
    value: 5,
    disabled: true,
  },
};

export const AllLevels: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Relaxed (0)</h3>
        <InteractiveTensionTracker value={0} disabled={false} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Mild Tension (3)</h3>
        <InteractiveTensionTracker value={3} disabled={false} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Moderate Tension (7)</h3>
        <InteractiveTensionTracker value={7} disabled={false} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Severe Tension (10)</h3>
        <InteractiveTensionTracker value={10} disabled={false} />
      </div>
    </div>
  ),
};
