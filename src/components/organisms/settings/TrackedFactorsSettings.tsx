"use client";

import * as React from "react";
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
import {
  useSettingsStore,
  type TrackedFactors,
} from "@/interface-adapters/store/settingsStore";

export interface TrackedFactorsSettingsProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

const FACTOR_CONFIG: {
  key: keyof TrackedFactors;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    key: "sleep",
    label: "Sleep Quality",
    description: "Track sleep patterns and their impact on headaches",
    icon: "😴",
  },
  {
    key: "hydration",
    label: "Hydration",
    description: "Monitor water intake throughout the day",
    icon: "💧",
  },
  {
    key: "caffeine",
    label: "Caffeine Intake",
    description: "Track coffee, tea, and other caffeinated beverages",
    icon: "☕",
  },
  {
    key: "alcohol",
    label: "Alcohol Consumption",
    description: "Monitor alcohol intake and timing",
    icon: "🍷",
  },
  {
    key: "stress",
    label: "Stress Levels",
    description: "Track daily stress and tension",
    icon: "😰",
  },
  {
    key: "weather",
    label: "Weather Changes",
    description: "Note weather patterns and barometric pressure",
    icon: "🌤️",
  },
  {
    key: "menstrual",
    label: "Menstrual Cycle",
    description: "Track cycle phase and hormonal changes",
    icon: "📅",
  },
  {
    key: "medication",
    label: "Medication",
    description: "Log medications taken and timing",
    icon: "💊",
  },
];

/**
 * TrackedFactorsSettings Component
 *
 * Allows users to enable/disable tracking for default factors.
 * Each factor can be toggled independently.
 */
export function TrackedFactorsSettings({
  className,
}: TrackedFactorsSettingsProps) {
  const { trackedFactors, toggleTrackedFactor } = useSettingsStore();

  return (
    <Card className={cn("", className)} data-testid="tracked-factors-settings">
      <CardHeader>
        <CardTitle>Tracked Factors</CardTitle>
        <CardDescription>
          Choose which factors you want to track in your daily check-ins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {FACTOR_CONFIG.map((factor) => (
          <div
            key={factor.key}
            className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0"
            data-testid={`factor-${factor.key}`}
          >
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl" aria-hidden="true">
                {factor.icon}
              </span>
              <div className="space-y-0.5">
                <Label
                  htmlFor={`factor-${factor.key}`}
                  className="text-base cursor-pointer"
                >
                  {factor.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {factor.description}
                </p>
              </div>
            </div>
            <Switch
              id={`factor-${factor.key}`}
              checked={trackedFactors[factor.key]}
              onCheckedChange={() => toggleTrackedFactor(factor.key)}
              data-testid={`toggle-${factor.key}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
