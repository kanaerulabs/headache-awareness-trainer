import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarView } from "./CalendarView";
import { CalendarDayData } from "@/interface-adapters/store/insightsStore";
import { useState } from "react";

const meta: Meta<typeof CalendarView> = {
  title: "Organisms/CalendarView",
  component: CalendarView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

/**
 * Generate sample calendar data for the current month
 */
const generateSampleData = (year: number, month: number): CalendarDayData[] => {
  const data: CalendarDayData[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const random = Math.random();

    // 40% chance of headache
    if (random < 0.4) {
      const headacheCount = Math.random() < 0.8 ? 1 : 2; // 80% single, 20% multiple
      const maxIntensity = Math.floor(Math.random() * 6); // 0-5

      data.push({
        date,
        headacheCount,
        maxIntensity,
        checkinCount: Math.random() < 0.6 ? 1 : 0, // 60% chance of checkin
        entries: [
          { type: "headache", id: `headache-${day}-1` },
          ...(headacheCount > 1
            ? [{ type: "headache" as const, id: `headache-${day}-2` }]
            : []),
        ],
      });
    } else if (random < 0.6) {
      // 20% chance of checkin only (no headache)
      data.push({
        date,
        headacheCount: 0,
        maxIntensity: 0,
        checkinCount: 1,
        entries: [{ type: "checkin", id: `checkin-${day}` }],
      });
    }
  }

  return data;
};

/**
 * Default state with sample data for current month
 */
export const Default: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const calendarData = generateSampleData(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
    );

    return (
      <div className="w-full max-w-2xl">
        <CalendarView
          calendarData={calendarData}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
      </div>
    );
  },
};

/**
 * Empty calendar with no data
 */
export const Empty: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [, setCurrentMonth] = useState(new Date());

    return (
      <div className="w-full max-w-2xl">
        <CalendarView
          calendarData={[]}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
      </div>
    );
  },
};

/**
 * Calendar with severe headaches pattern
 */
export const SevereHeadaches: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const data: CalendarDayData[] = [];
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();

    // Add severe headaches every few days
    for (let day = 1; day <= daysInMonth; day++) {
      if (day % 3 === 0) {
        data.push({
          date: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
          ),
          headacheCount: 2,
          maxIntensity: 5,
          checkinCount: 1,
          entries: [
            { type: "headache", id: `h-${day}-1` },
            { type: "headache", id: `h-${day}-2` },
            { type: "checkin", id: `c-${day}` },
          ],
        });
      }
    }

    return (
      <div className="w-full max-w-2xl">
        <CalendarView
          calendarData={data}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
      </div>
    );
  },
};

/**
 * Calendar with mild headaches only
 */
export const MildHeadaches: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const data: CalendarDayData[] = [];
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();

    // Add mild headaches on most days
    for (let day = 1; day <= daysInMonth; day++) {
      if (day % 2 === 0) {
        data.push({
          date: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
          ),
          headacheCount: 1,
          maxIntensity: 1,
          checkinCount: 1,
          entries: [
            { type: "headache", id: `h-${day}` },
            { type: "checkin", id: `c-${day}` },
          ],
        });
      }
    }

    return (
      <div className="w-full max-w-2xl">
        <CalendarView
          calendarData={data}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
      </div>
    );
  },
};

/**
 * Calendar with selected date
 */
export const WithSelectedDate: Story = {
  render: () => {
    const now = new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(now);
    const [currentMonth, setCurrentMonth] = useState(now);

    const calendarData = generateSampleData(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
    );

    return (
      <div className="w-full max-w-2xl">
        <CalendarView
          calendarData={calendarData}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
        {selectedDate && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Selected: {selectedDate.toLocaleDateString()}
          </div>
        )}
      </div>
    );
  },
};

/**
 * Calendar with only checkins (no headaches)
 */
export const CheckinsOnly: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const data: CalendarDayData[] = [];
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();

    // Add checkins every day (good streak!)
    for (let day = 1; day <= daysInMonth; day++) {
      data.push({
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          day,
        ),
        headacheCount: 0,
        maxIntensity: 0,
        checkinCount: 1,
        entries: [{ type: "checkin", id: `c-${day}` }],
      });
    }

    return (
      <div className="w-full max-w-2xl">
        <CalendarView
          calendarData={data}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
      </div>
    );
  },
};

/**
 * Calendar with mixed intensity levels
 */
export const MixedIntensities: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const data: CalendarDayData[] = [];
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();

    // Show progression of intensity levels
    const intensities = [0, 1, 2, 3, 4, 5];
    for (let day = 1; day <= Math.min(daysInMonth, 18); day++) {
      const intensity = intensities[(day - 1) % 6];
      data.push({
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          day,
        ),
        headacheCount: intensity === 0 ? 0 : 1,
        maxIntensity: intensity,
        checkinCount: 1,
        entries:
          intensity === 0
            ? [{ type: "checkin", id: `c-${day}` }]
            : [
                { type: "headache", id: `h-${day}` },
                { type: "checkin", id: `c-${day}` },
              ],
      });
    }

    return (
      <div className="w-full max-w-2xl">
        <CalendarView
          calendarData={data}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing all intensity levels (0-5)
        </div>
      </div>
    );
  },
};
