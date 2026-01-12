"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useCheckIn } from "@/interface-adapters/hooks/useCheckIn";
import {
  CheckInMood,
  SleepQuality,
  BodyTensionArea,
  PhysicalFactor,
  CheckInProps,
} from "@/domains/checkin/checkin.entity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

/**
 * Quick Check-in Page
 *
 * Fast daily check-ins to track correlating factors even on good days.
 * Target: Complete check-in in under 15 seconds.
 *
 * Features:
 * - Mood selection (emoji taps)
 * - Body tension check (multi-select: jaw/neck/shoulders)
 * - Sleep quality
 * - Physical factors (optional)
 * - Optional note
 * - Quick dismiss "All good!" button
 */

const moodOptions: Array<{ value: CheckInMood; emoji: string; labelKey: string }> =
  [
    { value: "calm", emoji: "😌", labelKey: "moods.calm" },
    { value: "ok", emoji: "🙂", labelKey: "moods.ok" },
    { value: "stressed", emoji: "😰", labelKey: "moods.stressed" },
    { value: "anxious", emoji: "😟", labelKey: "moods.anxious" },
    { value: "avoidant", emoji: "😶", labelKey: "moods.avoidant" },
  ];

const sleepOptions: Array<{
  value: SleepQuality;
  emoji: string;
  labelKey: string;
}> = [
  { value: "good", emoji: "😴", labelKey: "sleep.good" },
  { value: "ok", emoji: "😐", labelKey: "sleep.ok" },
  { value: "poor", emoji: "😩", labelKey: "sleep.poor" },
];

const tensionAreas: Array<{ value: BodyTensionArea; labelKey: string }> = [
  { value: "jaw", labelKey: "tension.jaw" },
  { value: "neck", labelKey: "tension.neck" },
  { value: "shoulders", labelKey: "tension.shoulders" },
];

const physicalOptions: Array<{ value: PhysicalFactor; labelKey: string }> = [
  { value: "acidity", labelKey: "physical.acidity" },
  { value: "fatigue", labelKey: "physical.fatigue" },
  { value: "none", labelKey: "physical.none" },
];

/**
 * Get greeting key based on time of day
 */
function getGreetingKey(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "greetingMorning";
  if (hour >= 12 && hour < 17) return "greetingAfternoon";
  if (hour >= 17 && hour < 21) return "greetingEvening";
  return "greetingNight";
}

export default function CheckinPage() {
  // Use Clean Architecture hook for check-ins
  const {
    isReady,
    createCheckIn,
    quickDismiss,
    recentCheckIns: hookRecentCheckIns,
  } = useCheckIn();
  const t = useTranslations("checkin");

  // Form state
  const [mood, setMood] = useState<CheckInMood | null>(null);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [bodyTension, setBodyTension] = useState<BodyTensionArea[]>([]);
  const [physicalFactors, setPhysicalFactors] = useState<PhysicalFactor[]>([]);
  const [note, setNote] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter to today's check-ins
  const [todayCheckIns, setTodayCheckIns] = useState<CheckInProps[]>([]);
  const [checkInCount, setCheckInCount] = useState(0);

  // Update today's check-ins when recent entries change
  useEffect(() => {
    if (!isReady) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysEntries = hookRecentCheckIns.filter((checkIn) => {
      const entryDate = new Date(checkIn.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    setTodayCheckIns(todaysEntries.slice(0, 3));
    setCheckInCount(todaysEntries.length);
  }, [hookRecentCheckIns, isReady]);

  // Toggle body tension area
  const toggleTension = (area: BodyTensionArea) => {
    setBodyTension((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  // Toggle physical factor
  const togglePhysicalFactor = (factor: PhysicalFactor) => {
    setPhysicalFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  // Handle quick dismiss
  const handleQuickDismiss = async () => {
    if (!isReady) {
      alert("Please wait, initializing...");
      return;
    }
    setIsSubmitting(true);

    try {
      await quickDismiss();
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save quick dismiss:", error);
      alert("Failed to save check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle full check-in submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!mood || !sleepQuality) {
      alert("Please select your mood and sleep quality");
      return;
    }

    if (!isReady) {
      alert("Please wait, initializing...");
      return;
    }

    setIsSubmitting(true);

    try {
      await createCheckIn({
        mood,
        sleepQuality,
        bodyTension,
        physicalFactors,
        note: note.trim() || undefined,
      });

      // Reset form
      setMood(null);
      setSleepQuality(null);
      setBodyTension([]);
      setPhysicalFactors([]);
      setNote("");

      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save check-in:", error);
      alert("Failed to save check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4"
      data-testid="checkin-page"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2" data-testid="checkin-header">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t(getGreetingKey())}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t("subtitle")}
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Card
            className="p-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
            data-testid="success-message"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <span className="text-2xl" aria-hidden="true">✓</span>
              <span className="font-medium">{t("successMessage")}</span>
            </div>
          </Card>
        )}

        {/* Quick Dismiss Button */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("feelingGreat")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("quickTap")}
              </p>
            </div>
            <Button
              onClick={handleQuickDismiss}
              disabled={isSubmitting}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="quick-dismiss-button"
            >
              <span className="text-xl mr-2">👍</span>
              {t("allGood")}
            </Button>
          </div>
        </Card>

        {/* Check-in Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selection */}
            <div className="space-y-3" data-testid="mood-section">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("howFeeling")} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                      mood === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700",
                    )}
                    data-testid={`mood-${option.value}`}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t(option.labelKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body Tension */}
            <div className="space-y-3" data-testid="tension-section">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("bodyTension")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {tensionAreas.map((area) => (
                  <button
                    key={area.value}
                    type="button"
                    onClick={() => toggleTension(area.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                      bodyTension.includes(area.value)
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-700",
                    )}
                    data-testid={`tension-${area.value}`}
                  >
                    {t(area.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="space-y-3" data-testid="sleep-section">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("howSleep")} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sleepOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSleepQuality(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                      sleepQuality === option.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700",
                    )}
                    data-testid={`sleep-${option.value}`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t(option.labelKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Factors (Optional) */}
            <div className="space-y-3" data-testid="physical-factors-section">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("physicalFactors")}{" "}
                <span className="text-gray-500 text-xs">({t("optional")})</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {physicalOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => togglePhysicalFactor(option.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                      physicalFactors.includes(option.value)
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-300 dark:hover:border-yellow-700",
                    )}
                    data-testid={`physical-${option.value}`}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Note (Optional) */}
            <div className="space-y-2" data-testid="note-section">
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {t("anyNotes")}{" "}
                <span className="text-gray-500 text-xs">({t("optional")})</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                data-testid="note-input"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !mood || !sleepQuality}
              className="w-full"
              size="lg"
              data-testid="submit-button"
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Card>

        {/* Recent Check-ins */}
        {todayCheckIns.length > 0 && (
          <Card className="p-6" data-testid="recent-checkins">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("todayCheckins")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("loggedTimes", { count: checkInCount })}
            </p>
            <div className="space-y-3">
              {todayCheckIns.map((checkIn) => {
                const moodData = moodOptions.find(
                  (m) => m.value === checkIn.mood,
                );
                return (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    data-testid="recent-checkin-item"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{moodData?.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {moodData ? t(moodData.labelKey) : ""}{" "}
                          {checkIn.isQuickDismiss && `- ${t("allGood")}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(checkIn.timestamp), "h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
