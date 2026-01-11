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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useSettingsStore,
  type IntensityScale,
} from "@/interface-adapters/store/settingsStore";
import { useTranslations } from "next-intl";

export interface IntensityScaleSettingsProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

const SCALE_OPTIONS: {
  value: IntensityScale;
  labelKey: string;
  descKey: string;
  previewKey: string;
}[] = [
  {
    value: 5,
    labelKey: "scale5",
    descKey: "scale5Desc",
    previewKey: "scale5Preview",
  },
  {
    value: 10,
    labelKey: "scale10",
    descKey: "scale10Desc",
    previewKey: "scale10Preview",
  },
];

/**
 * IntensityScaleSettings Component
 *
 * Allows users to choose between a 1-5 or 1-10 intensity scale
 * for logging headache severity.
 */
export function IntensityScaleSettings({
  className,
}: IntensityScaleSettingsProps) {
  const t = useTranslations("settings");
  const { intensityScale, setIntensityScale } = useSettingsStore();

  return (
    <Card className={cn("", className)} data-testid="intensity-scale-settings">
      <CardHeader>
        <CardTitle>{t("intensityScale")}</CardTitle>
        <CardDescription>{t("intensityScaleDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={intensityScale.toString()}
          onValueChange={(value) =>
            setIntensityScale(parseInt(value) as IntensityScale)
          }
          className="space-y-3"
        >
          {SCALE_OPTIONS.map((option) => {
            const isSelected = intensityScale === option.value;
            return (
              <div
                key={option.value}
                className={cn(
                  "relative flex items-start space-x-3 rounded-lg border p-4 transition-colors",
                  isSelected
                    ? "bg-accent border-primary ring-2 ring-primary ring-offset-2"
                    : "bg-background hover:bg-accent",
                )}
                data-testid={`scale-option-${option.value}`}
              >
                <RadioGroupItem
                  value={option.value.toString()}
                  id={`scale-${option.value}`}
                  className="mt-1"
                  data-testid={`scale-radio-${option.value}`}
                />
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor={`scale-${option.value}`}
                    className="text-base font-medium cursor-pointer"
                  >
                    {t(option.labelKey)}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(option.descKey)}
                  </p>

                  {/* Preview */}
                  <div className="mt-3 space-y-1.5 rounded-md bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("preview")}
                    </p>
                    <div className="space-y-1">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div
                          key={index}
                          className="text-sm text-foreground"
                          data-testid={`preview-${option.value}-${index - 1}`}
                        >
                          {t(`${option.previewKey}.${index}`)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
