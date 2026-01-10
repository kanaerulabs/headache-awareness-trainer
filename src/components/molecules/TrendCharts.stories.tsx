import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { TrendCharts } from "./TrendCharts";
import type { WeeklyTrendData, TimeFilter } from "./TrendCharts";

const meta: Meta<typeof TrendCharts> = {
  title: "Molecules/TrendCharts",
  component: TrendCharts,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    onFilterChange: { action: "filter-changed" },
  },
};

export default meta;
type Story = StoryObj<typeof TrendCharts>;

// Generate sample data for the past 12 weeks
const generateSampleData = (weeks: number): WeeklyTrendData[] => {
  const data: WeeklyTrendData[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    data.push({
      weekStart,
      weekEnd,
      headacheCount: Math.floor(Math.random() * 6) + 1, // 1-6 headaches
      averageIntensity: parseFloat((Math.random() * 4 + 3).toFixed(1)), // 3.0-7.0
      checkinCount: Math.floor(Math.random() * 10) + 5, // 5-14 check-ins
    });
  }

  return data;
};

const sampleData12Weeks = generateSampleData(12);
const sampleData24Weeks = generateSampleData(24);

// Interactive wrapper component
const InteractiveWrapper = ({
  weeklyTrends,
  showIntensity,
}: {
  weeklyTrends: WeeklyTrendData[];
  showIntensity?: boolean;
}) => {
  const [filter, setFilter] = useState<TimeFilter>(30);

  return (
    <TrendCharts
      weeklyTrends={weeklyTrends}
      filter={filter}
      onFilterChange={setFilter}
      showIntensity={showIntensity}
    />
  );
};

export const Default: Story = {
  render: () => <InteractiveWrapper weeklyTrends={sampleData12Weeks} />,
};

export const WithIntensity: Story = {
  render: () => (
    <InteractiveWrapper weeklyTrends={sampleData12Weeks} showIntensity />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Shows both headache count and average intensity. The intensity line is dashed and uses a different color.",
      },
    },
  },
};

export const LongTimePeriod: Story = {
  render: () => <InteractiveWrapper weeklyTrends={sampleData24Weeks} />,
  parameters: {
    docs: {
      description: {
        story:
          "Displays 24 weeks of data. Use the filter tabs to view different time periods.",
      },
    },
  },
};

export const Filter30Days: Story = {
  args: {
    weeklyTrends: sampleData12Weeks,
    filter: 30,
    onFilterChange: () => {},
    showIntensity: false,
  },
};

export const Filter90Days: Story = {
  args: {
    weeklyTrends: sampleData24Weeks,
    filter: 90,
    onFilterChange: () => {},
    showIntensity: false,
  },
};

export const FilterAllTime: Story = {
  args: {
    weeklyTrends: sampleData24Weeks,
    filter: "all",
    onFilterChange: () => {},
    showIntensity: true,
  },
};

export const ImprovingTrend: Story = {
  args: {
    weeklyTrends: [
      {
        weekStart: new Date("2024-11-01"),
        weekEnd: new Date("2024-11-07"),
        headacheCount: 6,
        averageIntensity: 7.5,
        checkinCount: 10,
      },
      {
        weekStart: new Date("2024-11-08"),
        weekEnd: new Date("2024-11-14"),
        headacheCount: 5,
        averageIntensity: 6.8,
        checkinCount: 12,
      },
      {
        weekStart: new Date("2024-11-15"),
        weekEnd: new Date("2024-11-21"),
        headacheCount: 4,
        averageIntensity: 6.2,
        checkinCount: 11,
      },
      {
        weekStart: new Date("2024-11-22"),
        weekEnd: new Date("2024-11-28"),
        headacheCount: 3,
        averageIntensity: 5.5,
        checkinCount: 13,
      },
      {
        weekStart: new Date("2024-11-29"),
        weekEnd: new Date("2024-12-05"),
        headacheCount: 2,
        averageIntensity: 4.8,
        checkinCount: 14,
      },
      {
        weekStart: new Date("2024-12-06"),
        weekEnd: new Date("2024-12-12"),
        headacheCount: 2,
        averageIntensity: 4.2,
        checkinCount: 15,
      },
    ],
    filter: "all",
    onFilterChange: () => {},
    showIntensity: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a positive trend where both headache frequency and intensity are decreasing over time.",
      },
    },
  },
};

export const DecliningTrend: Story = {
  args: {
    weeklyTrends: [
      {
        weekStart: new Date("2024-11-01"),
        weekEnd: new Date("2024-11-07"),
        headacheCount: 2,
        averageIntensity: 4.2,
        checkinCount: 15,
      },
      {
        weekStart: new Date("2024-11-08"),
        weekEnd: new Date("2024-11-14"),
        headacheCount: 3,
        averageIntensity: 5.1,
        checkinCount: 13,
      },
      {
        weekStart: new Date("2024-11-15"),
        weekEnd: new Date("2024-11-21"),
        headacheCount: 3,
        averageIntensity: 5.8,
        checkinCount: 12,
      },
      {
        weekStart: new Date("2024-11-22"),
        weekEnd: new Date("2024-11-28"),
        headacheCount: 4,
        averageIntensity: 6.5,
        checkinCount: 11,
      },
      {
        weekStart: new Date("2024-11-29"),
        weekEnd: new Date("2024-12-05"),
        headacheCount: 5,
        averageIntensity: 7.2,
        checkinCount: 10,
      },
      {
        weekStart: new Date("2024-12-06"),
        weekEnd: new Date("2024-12-12"),
        headacheCount: 6,
        averageIntensity: 7.8,
        checkinCount: 9,
      },
    ],
    filter: "all",
    onFilterChange: () => {},
    showIntensity: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a concerning trend where both frequency and intensity are increasing. This pattern would warrant discussion with healthcare provider.",
      },
    },
  },
};

export const StableTrend: Story = {
  args: {
    weeklyTrends: Array.from({ length: 8 }, (_, i) => ({
      weekStart: new Date(2024, 10, 1 + i * 7),
      weekEnd: new Date(2024, 10, 7 + i * 7),
      headacheCount: 3 + (Math.random() > 0.5 ? 1 : -1),
      averageIntensity: 5.5 + (Math.random() - 0.5) * 0.5,
      checkinCount: 12,
    })),
    filter: "all",
    onFilterChange: () => {},
    showIntensity: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a relatively stable pattern with minor fluctuations around a consistent baseline.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    weeklyTrends: [],
    filter: 30,
    onFilterChange: () => {},
    showIntensity: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state shown when no trend data is available yet. Encourages users to continue logging.",
      },
    },
  },
};

export const SingleWeek: Story = {
  args: {
    weeklyTrends: [
      {
        weekStart: new Date("2024-12-01"),
        weekEnd: new Date("2024-12-07"),
        headacheCount: 4,
        averageIntensity: 6.2,
        checkinCount: 10,
      },
    ],
    filter: 30,
    onFilterChange: () => {},
    showIntensity: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows minimal data - just one week of tracking.",
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <InteractiveWrapper weeklyTrends={sampleData12Weeks} showIntensity />
  ),
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

export const MobileView: Story = {
  render: () => (
    <InteractiveWrapper weeklyTrends={sampleData12Weeks} showIntensity />
  ),
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Chart is responsive and adapts to mobile screen sizes with touch-friendly controls.",
      },
    },
  },
};
