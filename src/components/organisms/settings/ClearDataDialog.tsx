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
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSettingsStore } from "@/interface-adapters/store/settingsStore";

export interface ClearDataDialogProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when data is cleared
   */
  onDataCleared?: () => void;
  /**
   * Callback when clear fails
   */
  onClearError?: (error: Error) => void;
}

/**
 * ClearDataDialog Component
 *
 * Provides a dangerous action to clear all data from the application.
 * Includes a confirmation dialog to prevent accidental deletion.
 */
export function ClearDataDialog({
  className,
  onDataCleared,
  onClearError,
}: ClearDataDialogProps) {
  const { clearAllData } = useSettingsStore();
  const [isClearing, setIsClearing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClearData = async () => {
    setIsClearing(true);

    try {
      await clearAllData();
      setIsOpen(false);
      onDataCleared?.();

      // Show success feedback
      alert("All data has been cleared successfully. The app will reload.");

      // Reload the page to reset all state
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear data:", error);
      onClearError?.(error as Error);
      alert("Failed to clear data. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card
      className={cn("border-destructive/50", className)}
      data-testid="clear-data-dialog"
    >
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions that will permanently delete your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="space-y-1">
              <h4 className="font-medium text-destructive">Clear All Data</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete all headache entries, check-ins, settings,
                and education progress. This action cannot be undone.
              </p>
            </div>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isClearing}
                data-testid="clear-data-trigger"
                aria-label="Clear all data"
              >
                Clear Data
              </Button>
            </AlertDialogTrigger>
          </div>

          <AlertDialogContent data-testid="clear-data-confirmation">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>This action will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All headache log entries</li>
                  <li>All daily check-in data</li>
                  <li>Custom factors and headache types</li>
                  <li>Education progress</li>
                  <li>All settings and preferences</li>
                </ul>
                <p className="font-semibold text-foreground mt-3">
                  This action cannot be undone. Consider exporting your data
                  first.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isClearing}
                data-testid="clear-data-cancel"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleClearData();
                }}
                disabled={isClearing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="clear-data-confirm"
              >
                {isClearing ? "Clearing..." : "Yes, delete everything"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Warning Info */}
        <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/30">
          <p className="text-xs text-muted-foreground">
            <strong className="text-destructive">Warning:</strong> Before
            clearing data, export your information using the &quot;Export
            Data&quot; section above. This ensures you have a backup if you need
            it later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
