import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReminderSettings } from "./ReminderSettings";
import { TrackedFactorsSettings } from "./TrackedFactorsSettings";
import { CustomFactorsEditor } from "./CustomFactorsEditor";
import { HeadacheTypeSettings } from "./HeadacheTypeSettings";
import { IntensityScaleSettings } from "./IntensityScaleSettings";
import { DataExport } from "./DataExport";
import { ClearDataDialog } from "./ClearDataDialog";
import { ThemeToggle } from "./ThemeToggle";
import { AboutHelp } from "./AboutHelp";

/**
 * Settings Components
 *
 * A collection of settings components for the Headache Awareness Trainer PWA.
 * These components allow users to customize their experience, manage data,
 * and configure tracking preferences.
 */

// ReminderSettings Stories
const reminderMeta: Meta<typeof ReminderSettings> = {
  title: "Organisms/Settings/ReminderSettings",
  component: ReminderSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Configure reminder preferences including enable/disable, times, days, and style.",
      },
    },
  },
};

export default reminderMeta;
type ReminderStory = StoryObj<typeof ReminderSettings>;

export const Default: ReminderStory = {
  args: {},
};

export const TrackedFactorsDefault: StoryObj<typeof TrackedFactorsSettings> = {
  args: {},
};

export const CustomFactorsDefault: StoryObj<typeof CustomFactorsEditor> = {
  args: {},
};

export const HeadacheTypeDefault: StoryObj<typeof HeadacheTypeSettings> = {
  args: {},
};

export const IntensityScaleDefault: StoryObj<typeof IntensityScaleSettings> = {
  args: {},
};

export const DataExportDefault: StoryObj<typeof DataExport> = {
  args: {},
};

export const DataExportWithCallbacks: StoryObj<typeof DataExport> = {
  args: {
    onExportStart: (format: string) => console.log(`Export started: ${format}`),
    onExportComplete: (format: string) =>
      console.log(`Export completed: ${format}`),
    onExportError: (format: string, error: Error) =>
      console.error(`Export failed (${format}):`, error),
  },
};

export const ClearDataDefault: StoryObj<typeof ClearDataDialog> = {
  args: {},
};

export const ClearDataWithCallbacks: StoryObj<typeof ClearDataDialog> = {
  args: {
    onDataCleared: () => console.log("Data cleared successfully"),
    onClearError: (error: Error) => console.error("Clear failed:", error),
  },
};

export const ThemeDefault: StoryObj<typeof ThemeToggle> = {
  args: {},
};

export const AboutDefault: StoryObj<typeof AboutHelp> = {
  args: {},
};

export const AboutCustomVersion: StoryObj<typeof AboutHelp> = {
  args: {
    version: "2.1.0",
  },
};

export const CompleteSettings: StoryObj = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your headache tracking experience
        </p>
      </div>

      <ThemeToggle />
      <ReminderSettings />
      <TrackedFactorsSettings />
      <CustomFactorsEditor />
      <HeadacheTypeSettings />
      <IntensityScaleSettings />
      <DataExport />
      <ClearDataDialog />
      <AboutHelp />
    </div>
  ),
};
