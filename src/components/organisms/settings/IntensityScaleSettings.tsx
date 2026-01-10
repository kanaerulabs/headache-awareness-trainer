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

export interface IntensityScaleSettingsProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

const SCALE_OPTIONS: {
  value: IntensityScale;
  label: string;
  description: string;
  preview: string[];
}[] = [
  {
    value: 5,
    label: "Simple Scale (1-5)",
    description: "Quick and easy, fewer options to choose from",
    preview: [
      "1 - Very Mild",
      "2 - Mild",
      "3 - Moderate",
      "4 - Severe",
      "5 - Very Severe",
    ],
  },
  {
    value: 10,
    label: "Detailed Scale (1-10)",
    description: "More precise tracking with finer gradations",
    preview: [
      "1-2 - Barely noticeable",
      "3-4 - Mild discomfort",
      "5-6 - Moderate pain",
      "7-8 - Severe pain",
      "9-10 - Extreme pain",
    ],
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
  const { intensityScale, setIntensityScale } = useSettingsStore();

  return (
    <Card className={cn("", className)} data-testid="intensity-scale-settings">
      <CardHeader>
        <CardTitle>Intensity Scale</CardTitle>
        <CardDescription>
          Choose how you want to rate headache intensity
        </CardDescription>
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
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>

                  {/* Preview */}
                  <div className="mt-3 space-y-1.5 rounded-md bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Preview
                    </p>
                    <div className="space-y-1">
                      {option.preview.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm text-foreground"
                          data-testid={`preview-${option.value}-${index}`}
                        >
                          {item}
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
