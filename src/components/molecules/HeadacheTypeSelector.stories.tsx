import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { HeadacheTypeSelector, HeadacheType } from "./HeadacheTypeSelector";

const meta: Meta<typeof HeadacheTypeSelector> = {
  title: "Molecules/HeadacheTypeSelector",
  component: HeadacheTypeSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: {
      control: "select",
      options: ["tension", "migraine", "cluster", "sinus", "other", null],
      description: "Currently selected headache type",
    },
    disabled: {
      control: "boolean",
      description: "Disable the selector",
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeadacheTypeSelector>;

// Interactive wrapper component
const InteractiveHeadacheTypeSelector = (args: {
  value?: HeadacheType | null;
  disabled?: boolean;
  onChange?: (value: HeadacheType) => void;
}) => {
  const [value, setValue] = useState<HeadacheType | null>(args.value ?? null);

  return (
    <div className="w-full max-w-3xl">
      <HeadacheTypeSelector
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
  render: (args) => <InteractiveHeadacheTypeSelector {...args} />,
  args: {
    value: null,
    disabled: false,
  },
};

export const TensionSelected: Story = {
  render: (args) => <InteractiveHeadacheTypeSelector {...args} />,
  args: {
    value: "tension",
    disabled: false,
  },
};

export const MigraineSelected: Story = {
  render: (args) => <InteractiveHeadacheTypeSelector {...args} />,
  args: {
    value: "migraine",
    disabled: false,
  },
};

export const ClusterSelected: Story = {
  render: (args) => <InteractiveHeadacheTypeSelector {...args} />,
  args: {
    value: "cluster",
    disabled: false,
  },
};

export const Disabled: Story = {
  render: (args) => <InteractiveHeadacheTypeSelector {...args} />,
  args: {
    value: "tension",
    disabled: true,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tension Headache</h3>
        <InteractiveHeadacheTypeSelector value="tension" disabled={false} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Migraine</h3>
        <InteractiveHeadacheTypeSelector value="migraine" disabled={false} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Cluster Headache</h3>
        <InteractiveHeadacheTypeSelector value="cluster" disabled={false} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Sinus Headache</h3>
        <InteractiveHeadacheTypeSelector value="sinus" disabled={false} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Other</h3>
        <InteractiveHeadacheTypeSelector value="other" disabled={false} />
      </div>
    </div>
  ),
};
