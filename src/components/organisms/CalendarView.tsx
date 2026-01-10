"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarDayData } from "@/interface-adapters/store/insightsStore";

export interface CalendarViewProps {
  /**
   * Calendar data for each day
   */
  calendarData: CalendarDayData[];
  /**
   * Currently selected date (optional)
   */
  selectedDate?: Date;
  /**
   * Callback when a date is selected
   */
  onDateSelect: (date: Date) => void;
  /**
   * Callback when month changes (navigation)
   */
  onMonthChange: (month: Date) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get intensity color classes based on headache intensity
 */
const getIntensityColors = (intensity: number) => {
  if (intensity === 0) {
    return {
      bg: "bg-green-100 dark:bg-green-900",
      border: "border-green-300 dark:border-green-700",
      text: "text-green-800 dark:text-green-200",
    };
  } else if (intensity <= 2) {
    return {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      border: "border-yellow-300 dark:border-yellow-700",
      text: "text-yellow-800 dark:text-yellow-200",
    };
  } else if (intensity === 3) {
    return {
      bg: "bg-orange-100 dark:bg-orange-900",
      border: "border-orange-300 dark:border-orange-700",
      text: "text-orange-800 dark:text-orange-200",
    };
  } else {
    return {
      bg: "bg-red-100 dark:bg-red-900",
      border: "border-red-300 dark:border-red-700",
      text: "text-red-800 dark:text-red-200",
    };
  }
};

/**
 * Format date to YYYY-MM-DD string for comparison
 */
const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateKey(date1) === formatDateKey(date2);
};

/**
 * Get days in month array with proper week alignment
 */
const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days: (Date | null)[] = [];

  // Add empty slots for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days in month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

/**
 * CalendarView - Monthly calendar with headache intensity visualization
 *
 * Displays a monthly calendar with color-coded days based on headache intensity.
 * Shows headache count badges and checkin indicators. Supports navigation and
 * day selection.
 *
 * @example
 * ```tsx
 * const [currentMonth, setCurrentMonth] = useState(new Date());
 * const [selectedDate, setSelectedDate] = useState<Date>();
 * const calendarData = useInsightsStore((state) => state.getCalendarData);
 *
 * <CalendarView
 *   calendarData={calendarData}
 *   selectedDate={selectedDate}
 *   onDateSelect={setSelectedDate}
 *   onMonthChange={setCurrentMonth}
 * />
 * ```
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
  calendarData,
  selectedDate,
  onDateSelect,
  onMonthChange,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const today = new Date();

  // Build lookup map for calendar data by date key
  const dataByDate = React.useMemo(() => {
    const map = new Map<string, CalendarDayData>();
    calendarData.forEach((data) => {
      map.set(formatDateKey(data.date), data);
    });
    return map;
  }, [calendarData]);

  // Get month days array
  const monthDays = React.useMemo(() => {
    return getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
    );
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
    );
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, date: Date | null) => {
    if (!date) return;

    let newDate: Date | null = null;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        newDate = new Date(date);
        newDate.setDate(date.getDate() - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        newDate = new Date(date);
        newDate.setDate(date.getDate() + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        newDate = new Date(date);
        newDate.setDate(date.getDate() - 7);
        break;
      case "ArrowDown":
        e.preventDefault();
        newDate = new Date(date);
        newDate.setDate(date.getDate() + 7);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onDateSelect(date);
        return;
    }

    if (newDate) {
      // If navigated to different month, change month view
      if (newDate.getMonth() !== currentMonth.getMonth()) {
        setCurrentMonth(newDate);
        onMonthChange(newDate);
      }
      onDateSelect(newDate);
    }
  };

  // Format month/year display
  const monthYearLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className={cn("w-full", className)} data-testid="calendar-view">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {monthYearLabel}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              data-testid="prev-month-button"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Next month"
              data-testid="next-month-button"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Day labels */}
        <div
          role="grid"
          aria-label={`Calendar for ${monthYearLabel}`}
          className="grid grid-cols-7 gap-1 mb-2"
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((date, index) => {
            if (!date) {
              // Empty slot
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square"
                  aria-hidden="true"
                />
              );
            }

            const dateKey = formatDateKey(date);
            const dayData = dataByDate.get(dateKey);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const hasData = dayData && dayData.headacheCount > 0;
            const hasCheckin = dayData && dayData.checkinCount > 0;

            // Determine intensity-based styling
            const maxIntensity = dayData?.maxIntensity ?? 0;
            const colors = getIntensityColors(maxIntensity);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onDateSelect(date)}
                onKeyDown={(e) => handleKeyDown(e, date)}
                data-testid={`calendar-day-${dateKey}`}
                className={cn(
                  "relative aspect-square p-1 rounded-md border transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "hover:bg-accent hover:text-accent-foreground",
                  hasData ? colors.bg : "bg-background dark:bg-gray-900",
                  hasData ? colors.border : "border-border",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  isToday && !isSelected && "border-primary border-2",
                )}
                aria-label={`${date.toLocaleDateString("default", { month: "long", day: "numeric" })}${hasData ? `, ${dayData.headacheCount} headache${dayData.headacheCount > 1 ? "s" : ""}` : ""}${hasCheckin ? `, ${dayData.checkinCount} check-in${dayData.checkinCount > 1 ? "s" : ""}` : ""}`}
                aria-current={isToday ? "date" : undefined}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {/* Day number */}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      hasData ? colors.text : "text-foreground",
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {/* Headache count badge */}
                  {hasData && dayData.headacheCount > 1 && (
                    <Badge
                      variant="secondary"
                      className="h-4 px-1 text-[10px] mt-0.5"
                    >
                      {dayData.headacheCount}
                    </Badge>
                  )}

                  {/* Checkin indicator dot */}
                  {hasCheckin && (
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 mt-0.5"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700" />
              <span className="text-muted-foreground">No headache</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700" />
              <span className="text-muted-foreground">Mild (1-2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700" />
              <span className="text-muted-foreground">Moderate (3)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700" />
              <span className="text-muted-foreground">Severe (4-5)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
              <span className="text-muted-foreground">Check-in</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

CalendarView.displayName = "CalendarView";
