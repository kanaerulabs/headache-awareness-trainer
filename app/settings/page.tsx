"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ReminderSettings,
  TrackedFactorsSettings,
  CustomFactorsEditor,
  HeadacheTypeSettings,
  IntensityScaleSettings,
  DataExport,
  ClearDataDialog,
  ThemeToggle,
  AboutHelp,
} from "@/components/organisms/settings";
import { ArrowLeft } from "lucide-react";

/**
 * Settings Page
 *
 * Comprehensive settings screen for the Headache Awareness Trainer PWA.
 *
 * Features:
 * - Reminder configuration (enable/disable, times, days, style)
 * - Tracking preferences (tracked factors, custom factors)
 * - Headache type customization
 * - Display settings (theme, intensity scale)
 * - Data management (export, clear data)
 * - About & help information
 *
 * Layout:
 * - Mobile: Accordion sections for compact display
 * - Desktop: Expanded card sections
 * - All sections have clear visual separation
 * - Responsive design with mobile-first approach
 *
 * Accessibility:
 * - Keyboard navigation support
 * - Screen reader friendly
 * - ARIA labels and landmarks
 * - Focus management
 */
export default function SettingsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 sm:p-6"
      data-testid="settings-page"
      role="main"
      aria-label="Settings"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              data-testid="back-button"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customize your headache tracking experience
              </p>
            </div>
          </div>
        </header>

        {/* Mobile: Accordion Layout */}
        <div className="lg:hidden" data-testid="settings-accordion-mobile">
          <Accordion
            type="multiple"
            defaultValue={["reminders"]}
            className="space-y-4"
          >
            {/* Reminders Section */}
            <AccordionItem value="reminders" data-testid="accordion-reminders">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle>Reminders</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <ReminderSettings />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Tracking Preferences Section */}
            <AccordionItem value="tracking" data-testid="accordion-tracking">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle>Tracking Preferences</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <TrackedFactorsSettings />
                    <Separator />
                    <CustomFactorsEditor />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Headache Types Section */}
            <AccordionItem
              value="headache-types"
              data-testid="accordion-headache-types"
            >
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle>Headache Types</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <HeadacheTypeSettings />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Display Section */}
            <AccordionItem value="display" data-testid="accordion-display">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle>Display</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <ThemeToggle />
                    <Separator />
                    <IntensityScaleSettings />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Data Management Section */}
            <AccordionItem value="data" data-testid="accordion-data">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle>Data Management</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <DataExport />
                    <Separator />
                    <div data-testid="danger-zone">
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                        Danger Zone
                      </h3>
                      <ClearDataDialog />
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* About & Help Section */}
            <AccordionItem value="about" data-testid="accordion-about">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle>About & Help</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <AboutHelp />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Desktop: Expanded Card Layout */}
        <div
          className="hidden lg:block space-y-6"
          data-testid="settings-cards-desktop"
        >
          {/* Reminders Section */}
          <section
            aria-labelledby="reminders-heading"
            data-testid="section-reminders"
          >
            <Card>
              <CardHeader>
                <CardTitle id="reminders-heading">Reminders</CardTitle>
                <CardDescription>
                  Configure when and how you want to be reminded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReminderSettings />
              </CardContent>
            </Card>
          </section>

          {/* Tracking Preferences Section */}
          <section
            aria-labelledby="tracking-heading"
            data-testid="section-tracking"
          >
            <Card>
              <CardHeader>
                <CardTitle id="tracking-heading">
                  Tracking Preferences
                </CardTitle>
                <CardDescription>
                  Choose what factors to track for your headaches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <TrackedFactorsSettings />
                <Separator />
                <CustomFactorsEditor />
              </CardContent>
            </Card>
          </section>

          {/* Headache Types Section */}
          <section
            aria-labelledby="headache-types-heading"
            data-testid="section-headache-types"
          >
            <Card>
              <CardHeader>
                <CardTitle id="headache-types-heading">
                  Headache Types
                </CardTitle>
                <CardDescription>
                  Customize headache types you experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeadacheTypeSettings />
              </CardContent>
            </Card>
          </section>

          {/* Display Section */}
          <section
            aria-labelledby="display-heading"
            data-testid="section-display"
          >
            <Card>
              <CardHeader>
                <CardTitle id="display-heading">Display</CardTitle>
                <CardDescription>
                  Customize appearance and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ThemeToggle />
                <Separator />
                <IntensityScaleSettings />
              </CardContent>
            </Card>
          </section>

          {/* Data Management Section */}
          <section aria-labelledby="data-heading" data-testid="section-data">
            <Card>
              <CardHeader>
                <CardTitle id="data-heading">Data Management</CardTitle>
                <CardDescription>
                  Export or delete your headache tracking data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <DataExport />
                <Separator />
                <div data-testid="danger-zone">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Irreversible actions that will permanently delete your data
                  </p>
                  <ClearDataDialog />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* About & Help Section */}
          <section aria-labelledby="about-heading" data-testid="section-about">
            <Card>
              <CardHeader>
                <CardTitle id="about-heading">About & Help</CardTitle>
                <CardDescription>
                  Learn more about this app and get help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AboutHelp />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
