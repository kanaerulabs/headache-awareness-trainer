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
  LanguageSwitcher,
  InstallAppButton,
} from "@/components/organisms/settings";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("settings");

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 sm:p-6"
      data-testid="settings-page"
      role="main"
      aria-label={t("title")}
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
              aria-label={t("goBack")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                {t("title")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("customize")}
              </p>
            </div>
          </div>
        </header>

        {/* Mobile: Accordion Layout */}
        {/* Note: Each settings component has its own Card, so accordion just provides expand/collapse */}
        <div className="lg:hidden space-y-4" data-testid="settings-accordion-mobile">
          {/* Reminders Section */}
          <section data-testid="accordion-reminders">
            <ReminderSettings />
          </section>

          {/* Tracking Preferences Section */}
          <section data-testid="accordion-tracking" className="space-y-4">
            <TrackedFactorsSettings />
            <CustomFactorsEditor />
          </section>

          {/* Headache Types Section */}
          <section data-testid="accordion-headache-types">
            <HeadacheTypeSettings />
          </section>

          {/* Display Section */}
          <section data-testid="accordion-display" className="space-y-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <IntensityScaleSettings />
            <InstallAppButton />
          </section>

          {/* Data Management Section */}
          <section data-testid="accordion-data" className="space-y-4">
            <DataExport />
            <Card data-testid="danger-zone">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  {t("dangerZone")}
                </CardTitle>
                <CardDescription>
                  {t("dangerZoneDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClearDataDialog />
              </CardContent>
            </Card>
          </section>

          {/* About & Help Section */}
          <section data-testid="accordion-about">
            <AboutHelp />
          </section>
        </div>

        {/* Desktop: Expanded Card Layout */}
        {/* Note: Each settings component has its own Card wrapper, so we don't add extra Cards here */}
        <div
          className="hidden lg:block space-y-6"
          data-testid="settings-cards-desktop"
        >
          {/* Reminders Section */}
          <section
            aria-labelledby="reminders-heading"
            data-testid="section-reminders"
          >
            <ReminderSettings />
          </section>

          {/* Tracking Preferences Section */}
          <section
            aria-labelledby="tracking-heading"
            data-testid="section-tracking"
            className="space-y-6"
          >
            <TrackedFactorsSettings />
            <CustomFactorsEditor />
          </section>

          {/* Headache Types Section */}
          <section
            aria-labelledby="headache-types-heading"
            data-testid="section-headache-types"
          >
            <HeadacheTypeSettings />
          </section>

          {/* Display Section */}
          <section
            aria-labelledby="display-heading"
            data-testid="section-display"
            className="space-y-6"
          >
            <ThemeToggle />
            <LanguageSwitcher />
            <IntensityScaleSettings />
            <InstallAppButton />
          </section>

          {/* Data Management Section */}
          <section
            aria-labelledby="data-heading"
            data-testid="section-data"
            className="space-y-6"
          >
            <DataExport />
            <Card data-testid="danger-zone">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  {t("dangerZone")}
                </CardTitle>
                <CardDescription>
                  {t("dangerZoneDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClearDataDialog />
              </CardContent>
            </Card>
          </section>

          {/* About & Help Section */}
          <section aria-labelledby="about-heading" data-testid="section-about">
            <AboutHelp />
          </section>
        </div>
      </div>
    </div>
  );
}
