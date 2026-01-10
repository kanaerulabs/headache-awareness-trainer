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

const HELP_LINKS = [
  {
    title: "Getting Started Guide",
    description: "Learn how to use the app effectively",
    url: "/help/getting-started",
  },
  {
    title: "Understanding Headache Patterns",
    description: "Tips for identifying your triggers",
    url: "/help/patterns",
  },
  {
    title: "Privacy & Data Security",
    description: "How we protect your information",
    url: "/help/privacy",
  },
  {
    title: "Frequently Asked Questions",
    description: "Common questions and answers",
    url: "/help/faq",
  },
];

const ABOUT_INFO = [
  {
    label: "Purpose",
    value: "Help you build awareness of headache patterns and triggers",
  },
  {
    label: "Data Storage",
    value: "All data is stored locally on your device",
  },
  {
    label: "Privacy",
    value: "No data is sent to external servers",
  },
];

/**
 * AboutHelp Component
 *
 * Displays app information, version, and links to help documentation.
 * Provides users with resources to understand and use the app effectively.
 */
export function AboutHelp({ className, version = "1.0.0" }: AboutHelpProps) {
  return (
    <Card className={cn("", className)} data-testid="about-help">
      <CardHeader>
        <CardTitle>About & Help</CardTitle>
        <CardDescription>
          Learn more about the app and get help when you need it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* App Version */}
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h4 className="font-medium">App Version</h4>
            <p className="text-sm text-muted-foreground">
              Current installed version
            </p>
          </div>
          <div className="text-sm font-mono bg-muted px-3 py-1 rounded">
            v{version}
          </div>
        </div>

        {/* About Information */}
        <div className="space-y-3">
          <h4 className="font-medium">About This App</h4>
          {ABOUT_INFO.map((info, index) => (
            <div
              key={index}
              className="text-sm"
              data-testid={`about-info-${index}`}
            >
              <span className="font-medium text-foreground">{info.label}:</span>{" "}
              <span className="text-muted-foreground">{info.value}</span>
            </div>
          ))}
        </div>

        {/* Help Links */}
        <div className="space-y-3">
          <h4 className="font-medium">Help Resources</h4>
          <div className="space-y-2">
            {HELP_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                className="block p-3 rounded-md border bg-background hover:bg-accent transition-colors"
                data-testid={`help-link-${link.url}`}
              >
                <div className="font-medium text-sm">{link.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {link.description}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact & Feedback */}
        <div className="p-4 rounded-md bg-muted/50">
          <h4 className="font-medium text-sm mb-2">Feedback & Support</h4>
          <p className="text-xs text-muted-foreground">
            Have suggestions or need help? Contact us at{" "}
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
            Headache Awareness Trainer
            <br />
            Helping you understand your headache patterns
            <br />
            <span className="text-xs">© 2025 All rights reserved</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
