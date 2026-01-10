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
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/interface-adapters/store/settingsStore";

export interface HeadacheTypeSettingsProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * HeadacheTypeSettings Component
 *
 * Displays default headache types and allows users to add/remove custom types.
 * Default types cannot be removed.
 */
export function HeadacheTypeSettings({ className }: HeadacheTypeSettingsProps) {
  const {
    headacheTypes,
    customHeadacheTypes,
    addCustomHeadacheType,
    removeCustomHeadacheType,
  } = useSettingsStore();

  const [newType, setNewType] = useState("");
  const [error, setError] = useState("");

  const handleAddType = () => {
    setError("");

    const trimmedType = newType.trim();

    // Validate input
    if (!trimmedType) {
      setError("Headache type cannot be empty");
      return;
    }

    if (trimmedType.length < 2) {
      setError("Headache type must be at least 2 characters");
      return;
    }

    if (trimmedType.length > 30) {
      setError("Headache type must be less than 30 characters");
      return;
    }

    // Check for duplicates (case-insensitive)
    const duplicateInDefault = headacheTypes.find(
      (type) => type.toLowerCase() === trimmedType.toLowerCase(),
    );

    const duplicateInCustom = customHeadacheTypes.find(
      (type) => type.toLowerCase() === trimmedType.toLowerCase(),
    );

    if (duplicateInDefault || duplicateInCustom) {
      setError("This headache type already exists");
      return;
    }

    // Add the type
    addCustomHeadacheType(trimmedType);
    setNewType("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddType();
    }
  };

  return (
    <Card className={cn("", className)} data-testid="headache-type-settings">
      <CardHeader>
        <CardTitle>Headache Types</CardTitle>
        <CardDescription>
          Default headache types and your custom types for logging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Default Types */}
        <div className="space-y-2">
          <Label>Default Types</Label>
          <div className="flex flex-wrap gap-2">
            {headacheTypes.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="px-3 py-1.5 text-sm capitalize"
                data-testid={`default-type-${type}`}
              >
                {type}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Default types cannot be removed
          </p>
        </div>

        {/* Add Custom Type Input */}
        <div className="space-y-2">
          <Label htmlFor="new-type">Add Custom Type</Label>
          <div className="flex gap-2">
            <Input
              id="new-type"
              type="text"
              value={newType}
              onChange={(e) => {
                setNewType(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Allergy, Hunger, Eye strain"
              className="flex-1"
              data-testid="custom-type-input"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "type-error" : undefined}
            />
            <Button
              onClick={handleAddType}
              variant="outline"
              data-testid="add-type-button"
            >
              Add
            </Button>
          </div>
          {error && (
            <p
              id="type-error"
              className="text-sm text-destructive"
              role="alert"
              data-testid="type-error"
            >
              {error}
            </p>
          )}
        </div>

        {/* Custom Types List */}
        {customHeadacheTypes.length > 0 ? (
          <div className="space-y-2">
            <Label>Your Custom Types ({customHeadacheTypes.length})</Label>
            <div className="space-y-2">
              {customHeadacheTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-md border p-3 bg-background hover:bg-accent transition-colors"
                  data-testid={`custom-type-${type}`}
                >
                  <span className="font-medium capitalize">{type}</span>
                  <Button
                    onClick={() => removeCustomHeadacheType(type)}
                    variant="ghost"
                    size="sm"
                    data-testid={`remove-type-${type}`}
                    aria-label={`Remove ${type}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No custom headache types added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
