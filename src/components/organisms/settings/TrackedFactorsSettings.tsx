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
import { useTranslations } from "next-intl";

export interface TrackedFactorsSettingsProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

const FACTOR_CONFIG: {
  key: keyof TrackedFactors;
  icon: string;
}[] = [
  { key: "sleep", icon: "😴" },
  { key: "hydration", icon: "💧" },
  { key: "caffeine", icon: "☕" },
  { key: "alcohol", icon: "🍷" },
  { key: "stress", icon: "😰" },
  { key: "weather", icon: "🌤️" },
  { key: "menstrual", icon: "📅" },
  { key: "medication", icon: "💊" },
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
  const t = useTranslations("settings");
  const { trackedFactors, toggleTrackedFactor } = useSettingsStore();

  return (
    <Card className={cn("", className)} data-testid="tracked-factors-settings">
      <CardHeader>
        <CardTitle>{t("trackedFactors")}</CardTitle>
        <CardDescription>{t("trackedFactorsDesc")}</CardDescription>
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
                  {t(`factors.${factor.key}`)}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t(`factors.${factor.key}Desc`)}
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
