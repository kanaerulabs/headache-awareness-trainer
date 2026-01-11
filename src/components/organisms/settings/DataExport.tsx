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
  useSettingsStore,
  type ExportFormat,
} from "@/interface-adapters/store/settingsStore";
import { useTranslations } from "next-intl";

export interface DataExportProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when export starts
   */
  onExportStart?: (format: ExportFormat) => void;
  /**
   * Callback when export completes
   */
  onExportComplete?: (format: ExportFormat) => void;
  /**
   * Callback when export fails
   */
  onExportError?: (format: ExportFormat, error: Error) => void;
}

/**
 * DataExport Component
 *
 * Allows users to export their data in JSON or CSV format.
 * Downloads the file directly to the user's device.
 */
export function DataExport({
  className,
  onExportStart,
  onExportComplete,
  onExportError,
}: DataExportProps) {
  const t = useTranslations("settings");
  const { exportData } = useSettingsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null,
  );

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportingFormat(format);
    onExportStart?.(format);

    try {
      // Export data from store
      const data = await exportData(format);

      // Create blob and download
      const blob = new Blob([data], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `headache-data-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onExportComplete?.(format);
    } catch (error) {
      console.error(`Failed to export data as ${format}:`, error);
      onExportError?.(format, error as Error);
      alert(t("exportFailed"));
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <Card className={cn("", className)} data-testid="data-export">
      <CardHeader>
        <CardTitle>{t("exportData")}</CardTitle>
        <CardDescription>{t("exportDataDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* JSON Export */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-background">
          <div className="space-y-1">
            <h4 className="font-medium">{t("jsonFormat")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("jsonFormatDesc")}
            </p>
          </div>
          <Button
            onClick={() => handleExport("json")}
            disabled={isExporting}
            variant="outline"
            data-testid="export-json-button"
            aria-label={t("exportJSON")}
          >
            {isExporting && exportingFormat === "json"
              ? t("exporting")
              : t("exportJSON")}
          </Button>
        </div>

        {/* CSV Export */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-background">
          <div className="space-y-1">
            <h4 className="font-medium">{t("csvFormat")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("csvFormatDesc")}
            </p>
          </div>
          <Button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            variant="outline"
            data-testid="export-csv-button"
            aria-label={t("exportCSV")}
          >
            {isExporting && exportingFormat === "csv"
              ? t("exporting")
              : t("exportCSV")}
          </Button>
        </div>

        {/* Export Info */}
        <div className="mt-4 p-3 rounded-md bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> {t("exportNote")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
