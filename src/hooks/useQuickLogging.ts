"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useLoggingStore,
  type HeadacheType,
  type HeadacheLocation,
  type Mood,
} from "@/interface-adapters/store/loggingStore";

export interface QuickLoggingFormState {
  // Required fields (Week 1)
  intensity: 1 | 2 | 3 | 4 | 5;
  note: string;

  // Context tags (always available)
  contextTags: string[];

  // Week 2+ fields
  headacheType: HeadacheType | null;
  locations: HeadacheLocation[];

  // Week 3+ fields
  bodyTension: number;
  mood: Mood | null;
  stressLevel: number;
}

export interface QuickLoggingHook {
  // Form state
  formState: QuickLoggingFormState;

  // State setters
  setIntensity: (value: 1 | 2 | 3 | 4 | 5) => void;
  setNote: (value: string) => void;
  toggleContextTag: (tag: string) => void;
  setHeadacheType: (type: HeadacheType) => void;
  toggleLocation: (location: HeadacheLocation) => void;
  setBodyTension: (value: number) => void;
  setMood: (mood: Mood) => void;
  setStressLevel: (value: number) => void;

  // Feature unlock state
  unlockedFeatures: {
    week1Features: boolean;
    week2Features: boolean;
    week3Features: boolean;
  };

  // Actions
  handleSubmit: () => Promise<void>;
  handleImFine: () => void;

  // UI state
  isSubmitting: boolean;
  submitError: string | null;
}

const initialFormState: QuickLoggingFormState = {
  intensity: 3,
  note: "",
  contextTags: [],
  headacheType: null,
  locations: [],
  bodyTension: 0,
  mood: null,
  stressLevel: 0,
};

/**
 * Custom hook for Quick Logging form state and store integration
 *
 * Manages:
 * - Form state for all headache entry fields
 * - Progressive feature unlocking based on user metadata
 * - Submission to logging store (IndexedDB)
 * - Navigation after successful submission
 * - Error handling
 */
export function useQuickLogging(): QuickLoggingHook {
  const router = useRouter();
  const loggingStore = useLoggingStore();

  // Form state
  const [formState, setFormState] =
    useState<QuickLoggingFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize database on mount
  useEffect(() => {
    if (!loggingStore.db) {
      loggingStore.initializeDB();
    }
  }, [loggingStore]);

  // Individual field setters
  const setIntensity = useCallback((value: 1 | 2 | 3 | 4 | 5) => {
    setFormState((prev) => ({ ...prev, intensity: value }));
  }, []);

  const setNote = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, note: value }));
  }, []);

  const toggleContextTag = useCallback((tag: string) => {
    setFormState((prev) => ({
      ...prev,
      contextTags: prev.contextTags.includes(tag)
        ? prev.contextTags.filter((t) => t !== tag)
        : [...prev.contextTags, tag],
    }));
  }, []);

  const setHeadacheType = useCallback((type: HeadacheType) => {
    setFormState((prev) => ({ ...prev, headacheType: type }));
  }, []);

  const toggleLocation = useCallback((location: HeadacheLocation) => {
    setFormState((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  }, []);

  const setBodyTension = useCallback((value: number) => {
    setFormState((prev) => ({ ...prev, bodyTension: value }));
  }, []);

  const setMood = useCallback((mood: Mood) => {
    setFormState((prev) => ({ ...prev, mood }));
  }, []);

  const setStressLevel = useCallback((value: number) => {
    setFormState((prev) => ({ ...prev, stressLevel: value }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build entry object based on unlocked features
      const entry = {
        intensity: formState.intensity,
        note: formState.note.trim() || undefined,
        contextTags: formState.contextTags,
      };

      // Add Week 2+ fields if unlocked
      if (loggingStore.unlockedFeatures.week2Features) {
        Object.assign(entry, {
          headacheType: formState.headacheType || undefined,
          location:
            formState.locations.length > 0
              ? { head: formState.locations, body: [] }
              : undefined,
        });
      }

      // Add Week 3+ fields if unlocked
      if (loggingStore.unlockedFeatures.week3Features) {
        Object.assign(entry, {
          bodyTension: formState.bodyTension,
          mood: formState.mood || undefined,
          stressLevel: formState.stressLevel,
        });
      }

      // Save to store
      const entryId = await loggingStore.addEntry(entry);

      // Reset form
      setFormState(initialFormState);

      // Navigate to success page or home
      router.push(`/?logged=true&entryId=${entryId}`);
    } catch (error) {
      console.error("Failed to log entry:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to save entry. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, loggingStore, router]);

  // "I'm fine" handler
  const handleImFine = useCallback(() => {
    // Navigate back to home without logging
    router.push("/?dismissed=true");
  }, [router]);

  return {
    formState,
    setIntensity,
    setNote,
    toggleContextTag,
    setHeadacheType,
    toggleLocation,
    setBodyTension,
    setMood,
    setStressLevel,
    unlockedFeatures: loggingStore.unlockedFeatures,
    handleSubmit,
    handleImFine,
    isSubmitting,
    submitError,
  };
}
