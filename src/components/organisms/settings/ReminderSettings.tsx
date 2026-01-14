"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useSettingsStore,
  type ReminderStyle,
} from "@/interface-adapters/store/settingsStore";
import { useTranslations } from "next-intl";

export interface ReminderSettingsProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const REMINDER_STYLES: ReminderStyle[] = ["gentle", "persistent"];

/**
 * ReminderSettings Component
 *
 * Allows users to configure reminder preferences including:
 * - Enable/disable reminders
 * - Set reminder times
 * - Select active days
 * - Choose reminder style (gentle/persistent)
 */
export function ReminderSettings({ className }: ReminderSettingsProps) {
  const t = useTranslations("settings");
  const {
    reminders,
    setRemindersEnabled,
    setReminderTimes,
    setReminderDays,
    setReminderStyle,
  } = useSettingsStore();

  const [newTime, setNewTime] = useState("");

  const handleAddTime = () => {
    if (!newTime) return;

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTime)) {
      alert(t("invalidTimeFormat"));
      return;
    }

    // Check if time already exists
    if (reminders.times.includes(newTime)) {
      alert(t("timeAlreadyAdded"));
      return;
    }

    setReminderTimes([...reminders.times, newTime].sort());
    setNewTime("");
  };

  const handleRemoveTime = (time: string) => {
    setReminderTimes(reminders.times.filter((t) => t !== time));
  };

  const handleToggleDay = (day: string) => {
    const isSelected = reminders.days.includes(day);
    if (isSelected) {
      // Don't allow removing the last day
      if (reminders.days.length === 1) {
        alert(t("atLeastOneDay"));
        return;
      }
      setReminderDays(reminders.days.filter((d) => d !== day));
    } else {
      setReminderDays([...reminders.days, day]);
    }
  };

  return (
    <Card className={cn("", className)} data-testid="reminder-settings">
      <CardHeader>
        <CardTitle>{t("reminders")}</CardTitle>
        <CardDescription>{t("remindersDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reminders-enabled" className="text-base">
              {t("enableReminders")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("enableRemindersDesc")}
            </p>
          </div>
          <Switch
            id="reminders-enabled"
            checked={reminders.enabled}
            onCheckedChange={setRemindersEnabled}
            data-testid="reminders-enabled-switch"
          />
        </div>

        {reminders.enabled && (
          <>
            {/* Reminder Times */}
            <div className="space-y-3">
              <Label className="text-base">{t("reminderTimes")}</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="09:00"
                  className="flex-1"
                  data-testid="time-input"
                />
                <Button
                  onClick={handleAddTime}
                  variant="outline"
                  data-testid="add-time-button"
                >
                  {t("addTime")}
                </Button>
              </div>

              {/* Time List */}
              {reminders.times.length > 0 && (
                <div className="space-y-2">
                  {reminders.times.map((time) => (
                    <div
                      key={time}
                      className="flex items-center justify-between rounded-md border p-3"
                      data-testid={`time-item-${time}`}
                    >
                      <span className="font-medium">{time}</span>
                      <Button
                        onClick={() => handleRemoveTime(time)}
                        variant="ghost"
                        size="sm"
                        data-testid={`remove-time-${time}`}
                      >
                        {t("remove")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {reminders.times.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("noTimesSet")}
                </p>
              )}
            </div>

            {/* Active Days */}
            <div className="space-y-3">
              <Label className="text-base">{t("activeDays")}</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => {
                  const isSelected = reminders.days.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={cn(
                        "px-4 py-2 rounded-md border font-medium transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent hover:text-accent-foreground",
                      )}
                      data-testid={`day-toggle-${day}`}
                    >
                      {t(`days.${day}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder Style */}
            <div className="space-y-3">
              <Label className="text-base">{t("reminderStyle")}</Label>
              <div className="space-y-2">
                {REMINDER_STYLES.map((style) => {
                  const isSelected = reminders.style === style;
                  return (
                    <button
                      key={style}
                      onClick={() => setReminderStyle(style)}
                      className={cn(
                        "w-full text-left p-4 rounded-md border transition-colors",
                        isSelected
                          ? "bg-accent border-primary ring-2 ring-primary ring-offset-2"
                          : "bg-background hover:bg-accent",
                      )}
                      data-testid={`style-${style}`}
                    >
                      <div className="font-medium">{t(style)}</div>
                      <div className="text-sm text-muted-foreground">
                        {t(`${style}Desc`)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
