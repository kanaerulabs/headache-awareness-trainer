import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { LocationPicker, HeadacheLocation } from "./LocationPicker";

const meta: Meta<typeof LocationPicker> = {
  title: "Molecules/LocationPicker",
  component: LocationPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disable the picker",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LocationPicker>;

// Interactive wrapper component
const InteractiveLocationPicker = (args: {
  selectedLocations?: HeadacheLocation[];
  disabled?: boolean;
  onLocationToggle?: (location: HeadacheLocation) => void;
}) => {
  const [selectedLocations, setSelectedLocations] = useState<
    HeadacheLocation[]
  >(args.selectedLocations ?? []);

  const handleToggle = (location: HeadacheLocation) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location],
    );
    args.onLocationToggle?.(location);
  };

  return (
    <div className="w-full max-w-2xl">
      <LocationPicker
        {...args}
        selectedLocations={selectedLocations}
        onLocationToggle={handleToggle}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <InteractiveLocationPicker {...args} />,
  args: {
    selectedLocations: [],
    disabled: false,
  },
};

export const FrontSelected: Story = {
  render: (args) => <InteractiveLocationPicker {...args} />,
  args: {
    selectedLocations: ["front"],
    disabled: false,
  },
};

export const MultipleLocations: Story = {
  render: (args) => <InteractiveLocationPicker {...args} />,
  args: {
    selectedLocations: ["front", "behind-eyes", "neck"],
    disabled: false,
  },
};

export const TensionHeadachePattern: Story = {
  render: (args) => <InteractiveLocationPicker {...args} />,
  args: {
    selectedLocations: ["front", "back", "neck", "shoulders"],
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Typical pattern for tension headache - front, back, neck, and shoulders",
      },
    },
  },
};

export const MigrainePattern: Story = {
  render: (args) => <InteractiveLocationPicker {...args} />,
  args: {
    selectedLocations: ["left-side", "behind-eyes"],
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Typical pattern for migraine - one side, behind eyes",
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => <InteractiveLocationPicker {...args} />,
  args: {
    selectedLocations: ["front", "neck"],
    disabled: true,
  },
};

export const AllLocations: Story = {
  render: (args) => <InteractiveLocationPicker {...args} />,
  args: {
    selectedLocations: [
      "front",
      "back",
      "top",
      "left-side",
      "right-side",
      "behind-eyes",
      "neck",
      "shoulders",
      "jaw",
    ],
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "All locations selected - demonstrates full pain coverage",
      },
    },
  },
};
