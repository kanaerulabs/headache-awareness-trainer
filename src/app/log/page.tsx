"use client";

import * as React from "react";
import { useQuickLogging } from "@/hooks/useQuickLogging";
import { ImFineButton } from "@/components/atoms/ImFineButton";
import { IntensitySlider } from "@/components/molecules/IntensitySlider";
import { NoteInput } from "@/components/molecules/NoteInput";
import { ContextTagChips } from "@/components/molecules/ContextTagChips";
import { HeadacheTypeSelector } from "@/components/molecules/HeadacheTypeSelector";
import { LocationPicker } from "@/components/molecules/LocationPicker";
import { TensionTracker } from "@/components/molecules/TensionTracker";
import { MoodStressTracker } from "@/components/molecules/MoodStressTracker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";

/**
 * Quick Logging Page - Frictionless headache entry with progressive feature unlocking
 *
 * Features:
 * - Week 1: Intensity (1-5) + free text note only
 * - Week 2+: Headache type selection and location picker
 * - Week 3+: Body tension and mood/stress tracking
 * - Natural language input option always available
 * - Context tags always available
 * - "I'm fine" dismiss button
 *
 * Target performance:
 * - Week 1 logging under 15 seconds
 * - Full logging under 60 seconds
 */
export default function QuickLoggingPage() {
  const {
    formState,
    setIntensity,
    setNote,
    toggleContextTag,
    setHeadacheType,
    toggleLocation,
    setBodyTension,
    setMood,
    setStressLevel,
    unlockedFeatures,
    handleSubmit,
    handleImFine,
    isSubmitting,
    submitError,
  } = useQuickLogging();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <h1
            data-testid="page-title"
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center"
          >
            How are you feeling?
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          data-testid="quick-logging-form"
          className="space-y-8"
        >
          {/* Quick Dismiss Button */}
          <div data-testid="im-fine-section">
            <ImFineButton
              onClick={handleImFine}
              disabled={isSubmitting}
              data-testid="im-fine-button"
            />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                or log your headache
              </span>
            </div>
          </div>

          {/* Required Section: Intensity + Note (Week 1 - Always Available) */}
          <section
            data-testid="week1-section"
            className="space-y-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Required Information
              </h2>
            </div>

            {/* Intensity Slider */}
            <div data-testid="intensity-section">
              <IntensitySlider
                value={formState.intensity}
                onChange={setIntensity}
                disabled={isSubmitting}
              />
            </div>

            {/* Note Input */}
            <div data-testid="note-section">
              <NoteInput
                value={formState.note}
                onChange={setNote}
                disabled={isSubmitting}
                placeholder="Describe what you're feeling (optional)"
              />
            </div>
          </section>

          {/* Context Tags (Always Available) */}
          <section
            data-testid="context-tags-section"
            className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <ContextTagChips
              selectedTags={formState.contextTags}
              onTagToggle={toggleContextTag}
              disabled={isSubmitting}
            />
          </section>

          {/* Week 2+ Features: Headache Type + Location */}
          {unlockedFeatures.week2Features && (
            <section
              data-testid="week2-section"
              className="space-y-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700 p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Additional Details
                </h2>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                  Week 2+
                </span>
              </div>

              {/* Headache Type Selector */}
              <div data-testid="headache-type-section">
                <HeadacheTypeSelector
                  value={formState.headacheType}
                  onChange={setHeadacheType}
                  disabled={isSubmitting}
                />
              </div>

              {/* Location Picker */}
              <div data-testid="location-picker-section">
                <LocationPicker
                  selectedLocations={formState.locations}
                  onLocationToggle={toggleLocation}
                  disabled={isSubmitting}
                />
              </div>
            </section>
          )}

          {/* Week 3+ Features: Body Tension + Mood/Stress */}
          {unlockedFeatures.week3Features && (
            <section
              data-testid="week3-section"
              className="space-y-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-700 p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Mind & Body Tracking
                </h2>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium">
                  Week 3+
                </span>
              </div>

              {/* Body Tension Tracker */}
              <div data-testid="tension-tracker-section">
                <TensionTracker
                  value={formState.bodyTension}
                  onChange={setBodyTension}
                  disabled={isSubmitting}
                />
              </div>

              {/* Mood & Stress Tracker */}
              <div data-testid="mood-stress-section">
                <MoodStressTracker
                  mood={formState.mood}
                  stressLevel={formState.stressLevel}
                  onMoodChange={setMood}
                  onStressChange={setStressLevel}
                  disabled={isSubmitting}
                />
              </div>
            </section>
          )}

          {/* Error Display */}
          {submitError && (
            <div
              data-testid="submit-error"
              className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Submission Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {submitError}
                </p>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Fixed Bottom Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            data-testid="submit-button"
            className={cn(
              "w-full text-base font-semibold",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "dark:bg-blue-700 dark:hover:bg-blue-600",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Logging Entry...
              </>
            ) : (
              "Log Entry"
            )}
          </Button>

          {/* Feature unlock hints */}
          <div className="mt-2 text-center">
            {!unlockedFeatures.week2Features && (
              <p
                className="text-xs text-gray-500 dark:text-gray-400"
                data-testid="week2-unlock-hint"
              >
                🔒 More features unlock after 7 days of use
              </p>
            )}
            {unlockedFeatures.week2Features &&
              !unlockedFeatures.week3Features && (
                <p
                  className="text-xs text-gray-500 dark:text-gray-400"
                  data-testid="week3-unlock-hint"
                >
                  🔒 Advanced tracking unlocks after 14 days
                </p>
              )}
            {unlockedFeatures.week3Features && (
              <p
                className="text-xs text-green-600 dark:text-green-400"
                data-testid="all-features-unlocked"
              >
                ✨ All features unlocked!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
