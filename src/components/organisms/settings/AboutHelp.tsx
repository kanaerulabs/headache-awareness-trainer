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
import { useTranslations } from "next-intl";

export interface AboutHelpProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * App version to display
   * @default "1.0.0"
   */
  version?: string;
}

const HELP_LINK_KEYS = [
  { key: "gettingStarted", url: "/learn" },
  { key: "patterns", url: "/learn/body-signals" },
  { key: "aiSetup", url: "/settings#ai-settings" },
  { key: "privacyHelp", url: "/learn/tracking-basics" },
  { key: "faq", url: "/learn" },
] as const;

const ABOUT_INFO_KEYS = ["purpose", "dataStorage", "privacy"] as const;

/**
 * AboutHelp Component
 *
 * Displays app information, version, and links to help documentation.
 * Provides users with resources to understand and use the app effectively.
 */
export function AboutHelp({ className, version = "1.0.0" }: AboutHelpProps) {
  const t = useTranslations("settings");

  return (
    <Card className={cn("", className)} data-testid="about-help">
      <CardHeader>
        <CardTitle>{t("about")}</CardTitle>
        <CardDescription>{t("aboutDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* App Version */}
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h4 className="font-medium">{t("appVersion")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("currentVersion")}
            </p>
          </div>
          <div className="text-sm font-mono bg-muted px-3 py-1 rounded">
            v{version}
          </div>
        </div>

        {/* About Information */}
        <div className="space-y-3">
          <h4 className="font-medium">{t("aboutThisApp")}</h4>
          {ABOUT_INFO_KEYS.map((key, index) => (
            <div
              key={key}
              className="text-sm"
              data-testid={`about-info-${index}`}
            >
              <span className="font-medium text-foreground">
                {t(`aboutInfo.${key}`)}:
              </span>{" "}
              <span className="text-muted-foreground">
                {t(`aboutInfo.${key}Value`)}
              </span>
            </div>
          ))}
        </div>

        {/* Help Links */}
        <div className="space-y-3">
          <h4 className="font-medium">{t("helpResources")}</h4>
          <div className="space-y-2">
            {HELP_LINK_KEYS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                className="block p-3 rounded-md border bg-background hover:bg-accent transition-colors"
                data-testid={`help-link-${link.url}`}
              >
                <div className="font-medium text-sm">
                  {t(`helpLinks.${link.key}`)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t(`helpLinks.${link.key}Desc`)}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact & Feedback */}
        <div className="p-4 rounded-md bg-muted/50">
          <h4 className="font-medium text-sm mb-2">{t("feedbackSupport")}</h4>
          <p className="text-xs text-muted-foreground">
            {t("feedbackDesc")}{" "}
            <a
              href="mailto:support@headache-trainer.app"
              className="text-primary hover:underline"
            >
              support@headache-trainer.app
            </a>
          </p>
        </div>

        {/* Credits */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {t("credits")}
            <br />
            {t("creditsTagline")}
            <br />
            <span className="text-xs">{t("copyright")}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
