"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslations } from "next-intl";

export interface TimeOfDayData {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  percentage: number; // 0-100
  count: number;
}

export interface TimeOfDayAnalysisProps {
  /**
   * Array of time-of-day data points
   */
  data: TimeOfDayData[];
  /**
   * Optional callback when a segment is tapped
   */
  onSegmentTap?: (timeOfDay: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Color mapping for each time period
const TIME_COLORS = {
  morning: "#fbbf24", // Yellow/Sun
  afternoon: "#f97316", // Orange
  evening: "#a855f7", // Purple/Dusk
  night: "#1e3a8a", // Dark Blue
} as const;

/**
 * TimeOfDayAnalysis - Donut chart showing when headaches occur
 *
 * Displays a donut/pie chart with color-coded segments for different times of day.
 * Shows the most common time period in the center and percentage labels on hover/tap.
 * Includes an empty state when no data is available.
 *
 * @example
 * ```tsx
 * const data = [
 *   { timeOfDay: 'morning', percentage: 25, count: 5 },
 *   { timeOfDay: 'afternoon', percentage: 40, count: 8 },
 *   { timeOfDay: 'evening', percentage: 20, count: 4 },
 *   { timeOfDay: 'night', percentage: 15, count: 3 }
 * ];
 * <TimeOfDayAnalysis data={data} onSegmentTap={(time) => console.log(time)} />
 * ```
 */
export const TimeOfDayAnalysis: React.FC<TimeOfDayAnalysisProps> = ({
  data,
  onSegmentTap,
  className,
}) => {
  const t = useTranslations("insights");
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Get translated time labels
  const getTimeLabel = (
    timeOfDay: "morning" | "afternoon" | "evening" | "night",
  ) => {
    return t(timeOfDay);
  };

  // Calculate most common time
  const mostCommonTime = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    return data.reduce((max, current) =>
      current.percentage > max.percentage ? current : max,
    );
  }, [data]);

  // Empty state
  if (!data || data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <Card
        className={cn("w-full", className)}
        data-testid="time-of-day-analysis"
      >
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t("timeOfDayTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground text-sm">{t("noTimeData")}</p>
            <p className="text-muted-foreground text-xs mt-2">
              {t("logToSeePatterns")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out zero-count entries for the chart
  const chartData = data.filter((d) => d.count > 0);

  const handlePieClick = (entry: TimeOfDayData) => {
    if (onSegmentTap) {
      onSegmentTap(entry.timeOfDay);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: TimeOfDayData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TimeOfDayData;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm">
            {getTimeLabel(data.timeOfDay)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("headacheCount", { count: data.count })} (
            {data.percentage.toFixed(0)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn("w-full", className)}
      data-testid="time-of-day-analysis"
    >
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {t("timeOfDayTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="percentage"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(entry) => handlePieClick(entry as TimeOfDayData)}
                cursor={onSegmentTap ? "pointer" : "default"}
                aria-label={t("timeOfDayTitle")}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TIME_COLORS[entry.timeOfDay]}
                    opacity={
                      hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                    }
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text - Most common time */}
          {mostCommonTime && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              aria-live="polite"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {t("mostCommon")}
              </p>
              <p className="text-lg sm:text-xl font-bold mt-1">
                {getTimeLabel(mostCommonTime.timeOfDay)}
              </p>
              <p className="text-sm text-muted-foreground">
                {mostCommonTime.percentage.toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {chartData.map((entry) => (
            <button
              key={entry.timeOfDay}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg transition-colors",
                onSegmentTap &&
                  "hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95",
                !onSegmentTap && "cursor-default",
              )}
              onClick={() => onSegmentTap?.(entry.timeOfDay)}
              disabled={!onSegmentTap}
              aria-label={`${getTimeLabel(entry.timeOfDay)}: ${entry.count} headaches, ${entry.percentage.toFixed(0)}%`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: TIME_COLORS[entry.timeOfDay] }}
                aria-hidden="true"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">
                  {getTimeLabel(entry.timeOfDay)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.count} ({entry.percentage.toFixed(0)}%)
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

TimeOfDayAnalysis.displayName = "TimeOfDayAnalysis";
