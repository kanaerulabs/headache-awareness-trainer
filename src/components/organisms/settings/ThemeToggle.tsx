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
import {
  useSettingsStore,
  type Theme,
} from "@/interface-adapters/store/settingsStore";

export interface ThemeToggleProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Always use light theme",
    icon: "☀️",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use dark theme",
    icon: "🌙",
  },
  {
    value: "system",
    label: "System",
    description: "Follow system preference",
    icon: "💻",
  },
];

/**
 * ThemeToggle Component
 *
 * Allows users to switch between light, dark, and system theme preferences.
 * Theme is applied immediately and persisted across sessions.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useSettingsStore();

  return (
    <Card className={cn("", className)} data-testid="theme-toggle">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how the app looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => {
            const isSelected = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                    : "bg-background hover:bg-accent hover:text-accent-foreground",
                )}
                data-testid={`theme-${option.value}`}
                aria-label={`Switch to ${option.label} theme`}
                aria-pressed={isSelected}
              >
                <span className="text-3xl" aria-hidden="true">
                  {option.icon}
                </span>
                <div className="text-center">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div
                    className={cn(
                      "text-xs mt-1",
                      isSelected
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Theme Info */}
        <div className="mt-4 p-3 rounded-md bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong>{" "}
            {theme === "system"
              ? "The app will automatically switch between light and dark modes based on your device settings."
              : theme === "dark"
                ? "Dark mode reduces eye strain in low-light environments."
                : "Light mode provides better visibility in bright environments."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
