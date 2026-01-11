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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/interface-adapters/store/settingsStore";
import { useTranslations } from "next-intl";

export interface CustomFactorsEditorProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * CustomFactorsEditor Component
 *
 * Allows users to add and remove custom factors for tracking.
 * Includes validation to prevent duplicates and empty factors.
 */
export function CustomFactorsEditor({ className }: CustomFactorsEditorProps) {
  const t = useTranslations("settings");
  const { customFactors, addCustomFactor, removeCustomFactor } =
    useSettingsStore();
  const [newFactor, setNewFactor] = useState("");
  const [error, setError] = useState("");

  const handleAddFactor = () => {
    setError("");

    const trimmedFactor = newFactor.trim();

    // Validate input
    if (!trimmedFactor) {
      setError(t("factorEmpty"));
      return;
    }

    if (trimmedFactor.length < 2) {
      setError(t("factorMinLength"));
      return;
    }

    if (trimmedFactor.length > 50) {
      setError(t("factorMaxLength"));
      return;
    }

    // Check for duplicates (case-insensitive)
    const duplicate = customFactors.find(
      (factor) => factor.toLowerCase() === trimmedFactor.toLowerCase(),
    );

    if (duplicate) {
      setError(t("factorExists"));
      return;
    }

    // Add the factor
    addCustomFactor(trimmedFactor);
    setNewFactor("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFactor();
    }
  };

  return (
    <Card className={cn("", className)} data-testid="custom-factors-editor">
      <CardHeader>
        <CardTitle>{t("customFactors")}</CardTitle>
        <CardDescription>{t("customFactorsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Factor Input */}
        <div className="space-y-2">
          <Label htmlFor="new-factor">{t("addCustomFactor")}</Label>
          <div className="flex gap-2">
            <Input
              id="new-factor"
              type="text"
              value={newFactor}
              onChange={(e) => {
                setNewFactor(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder={t("customFactorPlaceholder")}
              className="flex-1"
              data-testid="custom-factor-input"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "factor-error" : undefined}
            />
            <Button
              onClick={handleAddFactor}
              variant="outline"
              data-testid="add-factor-button"
            >
              {t("add")}
            </Button>
          </div>
          {error && (
            <p
              id="factor-error"
              className="text-sm text-destructive"
              role="alert"
              data-testid="factor-error"
            >
              {error}
            </p>
          )}
        </div>

        {/* Custom Factors List */}
        {customFactors.length > 0 ? (
          <div className="space-y-2">
            <Label>
              {t("yourCustomFactors")} ({customFactors.length})
            </Label>
            <div className="space-y-2">
              {customFactors.map((factor) => (
                <div
                  key={factor}
                  className="flex items-center justify-between rounded-md border p-3 bg-background hover:bg-accent transition-colors"
                  data-testid={`custom-factor-${factor}`}
                >
                  <span className="font-medium">{factor}</span>
                  <Button
                    onClick={() => removeCustomFactor(factor)}
                    variant="ghost"
                    size="sm"
                    data-testid={`remove-factor-${factor}`}
                    aria-label={`${t("remove")} ${factor}`}
                  >
                    {t("remove")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">{t("noCustomFactors")}</p>
            <p className="text-sm">{t("addFactorsUnique")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
