"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type TimeFilter = 30 | 90 | "all";

export interface WeeklyTrendData {
  /**
   * Start date of the week
   */
  weekStart: Date;
  /**
   * End date of the week
   */
  weekEnd: Date;
  /**
   * Number of headaches logged this week
   */
  headacheCount: number;
  /**
   * Average headache intensity (1-10 scale)
   */
  averageIntensity: number;
  /**
   * Total number of check-ins this week
   */
  checkinCount: number;
}

export interface TrendChartsProps {
  /**
   * Weekly trend data to display
   */
  weeklyTrends: WeeklyTrendData[];
  /**
   * Current time filter (30 days, 90 days, or all time)
   */
  filter: TimeFilter;
  /**
   * Callback when filter changes
   */
  onFilterChange: (filter: TimeFilter) => void;
  /**
   * Whether to show average intensity line
   * @default false
   */
  showIntensity?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

interface ChartDataPoint {
  weekLabel: string;
  headacheCount: number;
  averageIntensity: number;
  weekStart: string;
}

const filterOptions: { value: TimeFilter; label: string }[] = [
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
  { value: "all", label: "All Time" },
];

/**
 * TrendCharts - Line chart showing headache trends over time
 *
 * Displays weekly headache frequency with optional average intensity overlay.
 *
 * Features:
 * - Responsive chart sizing
 * - Time period filtering (30/90 days, all time)
 * - Toggle average intensity display
 * - Touch-friendly interactions
 * - Empty state when no data
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <TrendCharts
 *   weeklyTrends={trends}
 *   filter={30}
 *   onFilterChange={(filter) => setFilter(filter)}
 *   showIntensity={true}
 * />
 * ```
 */
export const TrendCharts: React.FC<TrendChartsProps> = ({
  weeklyTrends,
  filter,
  onFilterChange,
  showIntensity = false,
  className,
}) => {
  // Transform data for recharts
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    return weeklyTrends.map((trend) => ({
      weekLabel: format(trend.weekStart, "MMM d"),
      headacheCount: trend.headacheCount,
      averageIntensity: trend.averageIntensity,
      weekStart: trend.weekStart.toISOString(),
    }));
  }, [weeklyTrends]);

  // Filter data based on selected time period
  const filteredData = React.useMemo(() => {
    if (filter === "all") return chartData;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filter);

    return chartData.filter((point) => new Date(point.weekStart) >= cutoffDate);
  }, [chartData, filter]);

  if (weeklyTrends.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 border border-dashed rounded-lg",
          "text-muted-foreground",
          className,
        )}
        data-testid="trend-chart-empty"
        role="status"
      >
        <p className="text-center font-medium mb-2">No trend data available</p>
        <p className="text-sm text-center">
          Keep logging check-ins to track your headache patterns over time.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-4", className)}
      data-testid="trend-chart"
      role="region"
      aria-label="Headache trend chart"
    >
      {/* Filter tabs */}
      <div
        className="flex gap-2 p-1 bg-muted rounded-lg"
        role="tablist"
        aria-label="Time period filter"
      >
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              filter === option.value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            role="tab"
            aria-selected={filter === option.value}
            aria-label={`Show trends for ${option.label}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
            <XAxis
              dataKey="weekLabel"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "currentColor", opacity: 0.3 }}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "currentColor", opacity: 0.3 }}
              label={{
                value: "Headaches per Week",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "currentColor" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
              labelStyle={{ color: "hsl(var(--popover-foreground))" }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
              formatter={(value: number, name: string) => {
                if (name === "headacheCount") {
                  return [value, "Headaches"];
                }
                if (name === "averageIntensity") {
                  return [value.toFixed(1), "Avg Intensity"];
                }
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: "0.875rem" }} iconType="line" />
            <Line
              type="monotone"
              dataKey="headacheCount"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
              name="Headaches per Week"
            />
            {showIntensity && (
              <Line
                type="monotone"
                dataKey="averageIntensity"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                activeDot={{ r: 6 }}
                name="Average Intensity"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Total Headaches</p>
          <p className="text-2xl font-bold">
            {filteredData.reduce((sum, d) => sum + d.headacheCount, 0)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Average per Week</p>
          <p className="text-2xl font-bold">
            {filteredData.length > 0
              ? (
                  filteredData.reduce((sum, d) => sum + d.headacheCount, 0) /
                  filteredData.length
                ).toFixed(1)
              : "0"}
          </p>
        </div>
        {showIntensity && (
          <div className="col-span-2 space-y-1">
            <p className="text-muted-foreground">Average Intensity</p>
            <p className="text-2xl font-bold">
              {filteredData.length > 0
                ? (
                    filteredData.reduce(
                      (sum, d) => sum + d.averageIntensity,
                      0,
                    ) / filteredData.length
                  ).toFixed(1)
                : "0"}
              <span className="text-base text-muted-foreground ml-1">/10</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

TrendCharts.displayName = "TrendCharts";
