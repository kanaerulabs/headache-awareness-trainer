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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("settings");
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
      alert(t("clearDataSuccess"));

      // Reload the page to reset all state
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear data:", error);
      onClearError?.(error as Error);
      alert(t("clearDataFailed"));
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
        <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
        <CardDescription>{t("dangerZoneDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="space-y-1">
              <h4 className="font-medium text-destructive">{t("clearData")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("clearDataDesc")}
              </p>
            </div>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isClearing}
                data-testid="clear-data-trigger"
                aria-label={t("clearData")}
              >
                {t("clearDataButton")}
              </Button>
            </AlertDialogTrigger>
          </div>

          <AlertDialogContent data-testid="clear-data-confirmation">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("clearDataConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>{t("clearDataConfirmDesc")}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t("clearDataItems.entries")}</li>
                  <li>{t("clearDataItems.checkins")}</li>
                  <li>{t("clearDataItems.custom")}</li>
                  <li>{t("clearDataItems.education")}</li>
                  <li>{t("clearDataItems.settings")}</li>
                </ul>
                <p className="font-semibold text-foreground mt-3">
                  {t("clearDataFinalWarning")}
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
                {isClearing ? t("clearing") : t("clearDataConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Warning Info */}
        <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/30">
          <p className="text-xs text-muted-foreground">
            <strong className="text-destructive">Warning:</strong>{" "}
            {t("clearDataWarning")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
