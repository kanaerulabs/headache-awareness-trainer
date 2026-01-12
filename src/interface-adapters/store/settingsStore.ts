import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useLoggingStore, HeadacheEntry } from "./loggingStore";
import { useCheckInStore, CheckInEntry } from "./checkinStore";
import { useEducationStore } from "./educationStore";
import { useOnboardingStore } from "./onboardingStore";

/**
 * Reminder Settings Types
 */
export type ReminderStyle = "gentle" | "persistent";

export interface ReminderSettings {
  enabled: boolean;
  times: string[]; // e.g., ['09:00', '21:00']
  days: string[]; // e.g., ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  style: ReminderStyle;
}

/**
 * Tracked Factors Configuration
 */
export interface TrackedFactors {
  sleep: boolean;
  hydration: boolean;
  caffeine: boolean;
  alcohol: boolean;
  stress: boolean;
  weather: boolean;
  menstrual: boolean;
  medication: boolean;
}

/**
 * Theme Settings
 */
export type Theme = "light" | "dark" | "system";

/**
 * Intensity Scale Preference
 */
export type IntensityScale = 5 | 10;

/**
 * Export Format
 */
export type ExportFormat = "json" | "csv";

/**
 * AI Provider Selection
 */
export type AIProvider = "openai" | "openrouter";

/**
 * Available models per provider
 */
export const AI_MODELS = {
  openai: {
    "gpt-4o-mini": { name: "GPT-4o Mini", description: "Fast and affordable" },
    "gpt-4o": { name: "GPT-4o", description: "Best quality" },
  },
  openrouter: {
    // Latest Anthropic models
    "anthropic/claude-sonnet-4": { name: "Claude Sonnet 4", description: "Latest Claude, best balance" },
    "anthropic/claude-opus-4": { name: "Claude Opus 4", description: "Most capable Claude" },
    "anthropic/claude-3.5-sonnet": { name: "Claude 3.5 Sonnet", description: "Great quality, proven" },
    // Latest OpenAI models
    "openai/gpt-4.1": { name: "GPT-4.1", description: "Latest GPT model" },
    "openai/gpt-4.1-mini": { name: "GPT-4.1 Mini", description: "Fast and affordable" },
    "openai/o3-mini": { name: "o3-mini", description: "Reasoning model" },
    // Latest Google models
    "google/gemini-2.5-flash-preview": { name: "Gemini 2.5 Flash", description: "Very fast, latest" },
    "google/gemini-2.5-pro-preview": { name: "Gemini 2.5 Pro", description: "Best Google model" },
    // DeepSeek models (affordable/free)
    "deepseek/deepseek-chat": { name: "DeepSeek V3", description: "Affordable, high quality" },
    "deepseek/deepseek-r1:free": { name: "DeepSeek R1", description: "Free tier!" },
  },
} as const;

export type OpenAIModel = keyof typeof AI_MODELS.openai;
export type OpenRouterModel = keyof typeof AI_MODELS.openrouter;

/**
 * Export Data Structure
 */
export interface ExportData {
  metadata: {
    exportedAt: string;
    appVersion: string;
    totalHeadacheEntries: number;
    totalCheckIns: number;
  };
  headacheEntries: HeadacheEntry[];
  checkInEntries: CheckInEntry[];
  settings: {
    reminders: ReminderSettings;
    trackedFactors: TrackedFactors;
    customFactors: string[];
    headacheTypes: string[];
    customHeadacheTypes: string[];
    intensityScale: IntensityScale;
    theme: Theme;
  };
  educationProgress: {
    contentId: string;
    viewed: boolean;
    completed: boolean;
    progressPercent: number;
  }[];
}

/**
 * Settings Store State
 */
export interface SettingsState {
  // Reminder settings
  reminders: ReminderSettings;

  // Tracked factors
  trackedFactors: TrackedFactors;
  customFactors: string[];

  // Headache types
  headacheTypes: string[];
  customHeadacheTypes: string[];

  // Preferences
  intensityScale: IntensityScale;
  theme: Theme;

  // AI Settings
  aiProvider: AIProvider;
  openaiApiKey: string;
  openrouterApiKey: string;
  selectedModel: string; // Model ID varies by provider

  // Reminder Actions
  setRemindersEnabled: (enabled: boolean) => void;
  setReminderTimes: (times: string[]) => void;
  setReminderDays: (days: string[]) => void;
  setReminderStyle: (style: ReminderStyle) => void;

  // Tracked Factors Actions
  toggleTrackedFactor: (factor: keyof TrackedFactors) => void;
  addCustomFactor: (factor: string) => void;
  removeCustomFactor: (factor: string) => void;

  // Headache Types Actions
  addCustomHeadacheType: (type: string) => void;
  removeCustomHeadacheType: (type: string) => void;

  // Preferences Actions
  setIntensityScale: (scale: IntensityScale) => void;
  setTheme: (theme: Theme) => void;
  applyTheme: () => void;

  // AI Settings Actions
  setAiProvider: (provider: AIProvider) => void;
  setOpenaiApiKey: (key: string) => void;
  setOpenrouterApiKey: (key: string) => void;
  setSelectedModel: (modelId: string) => void;
  hasApiKey: () => boolean;
  getActiveApiKey: () => string;
  hasOpenaiApiKey: () => boolean; // Deprecated: use hasApiKey()

  // Data Management Actions
  exportData: (format: ExportFormat) => Promise<string>;
  clearAllData: () => Promise<void>;
  resetToDefaults: () => void;
}

/**
 * Default reminder settings
 */
const defaultReminders: ReminderSettings = {
  enabled: false,
  times: ["09:00", "21:00"], // Morning and evening
  days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], // All days
  style: "gentle",
};

/**
 * Default tracked factors (all enabled initially)
 */
const defaultTrackedFactors: TrackedFactors = {
  sleep: true,
  hydration: true,
  caffeine: true,
  alcohol: true,
  stress: true,
  weather: true,
  menstrual: true,
  medication: true,
};

/**
 * Default headache types
 */
const defaultHeadacheTypes = ["tension", "migraine", "cluster", "sinus"];

/**
 * Default theme
 */
const defaultTheme: Theme = "system";

/**
 * Default intensity scale
 */
const defaultIntensityScale: IntensityScale = 5;

/**
 * Convert data to CSV format
 */
const convertToCSV = (data: ExportData): string => {
  const lines: string[] = [];

  // Add metadata section
  lines.push("# Headache Awareness Trainer - Data Export");
  lines.push(`# Exported at: ${data.metadata.exportedAt}`);
  lines.push(`# App version: ${data.metadata.appVersion}`);
  lines.push("");

  // Add headache entries
  lines.push("# Headache Entries");
  lines.push(
    "ID,Timestamp,Intensity,Type,Note,BodyTension,Mood,StressLevel,ContextTags",
  );
  data.headacheEntries.forEach((entry) => {
    const row = [
      entry.id,
      entry.timestamp.toISOString(),
      entry.intensity,
      entry.headacheType || "",
      `"${(entry.note || "").replace(/"/g, '""')}"`, // Escape quotes
      entry.bodyTension || "",
      entry.mood || "",
      entry.stressLevel || "",
      `"${(entry.contextTags || []).join(", ")}"`,
    ];
    lines.push(row.join(","));
  });

  lines.push("");

  // Add check-in entries
  lines.push("# Check-in Entries");
  lines.push(
    "ID,Timestamp,TimeOfDay,Mood,BodyTension,SleepQuality,PhysicalFactors,Note,IsQuickDismiss",
  );
  data.checkInEntries.forEach((entry) => {
    const row = [
      entry.id,
      entry.timestamp.toISOString(),
      entry.timeOfDay,
      entry.mood,
      `"${entry.bodyTension.join(", ")}"`,
      entry.sleepQuality,
      `"${entry.physicalFactors.join(", ")}"`,
      `"${(entry.note || "").replace(/"/g, '""')}"`,
      entry.isQuickDismiss,
    ];
    lines.push(row.join(","));
  });

  lines.push("");

  // Add education progress
  lines.push("# Education Progress");
  lines.push("ContentID,Viewed,Completed,ProgressPercent");
  data.educationProgress.forEach((progress) => {
    const row = [
      progress.contentId,
      progress.viewed,
      progress.completed,
      progress.progressPercent,
    ];
    lines.push(row.join(","));
  });

  return lines.join("\n");
};

/**
 * Apply theme to document
 */
const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;

  if (theme === "system") {
    // Use system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    // Apply explicit theme
    root.classList.toggle("dark", theme === "dark");
  }
};

/**
 * Zustand store for settings and customization
 * Persisted to localStorage for offline access
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      reminders: defaultReminders,
      trackedFactors: defaultTrackedFactors,
      customFactors: [],
      headacheTypes: defaultHeadacheTypes,
      customHeadacheTypes: [],
      intensityScale: defaultIntensityScale,
      theme: defaultTheme,
      aiProvider: "openrouter" as AIProvider,
      openaiApiKey: "",
      openrouterApiKey: "",
      selectedModel: "deepseek/deepseek-chat", // DeepSeek V3 - affordable default

      /**
       * Set reminders enabled/disabled
       */
      setRemindersEnabled: (enabled: boolean) => {
        set((state) => ({
          reminders: { ...state.reminders, enabled },
        }));
      },

      /**
       * Set reminder times
       */
      setReminderTimes: (times: string[]) => {
        set((state) => ({
          reminders: { ...state.reminders, times },
        }));
      },

      /**
       * Set reminder days
       */
      setReminderDays: (days: string[]) => {
        set((state) => ({
          reminders: { ...state.reminders, days },
        }));
      },

      /**
       * Set reminder style
       */
      setReminderStyle: (style: ReminderStyle) => {
        set((state) => ({
          reminders: { ...state.reminders, style },
        }));
      },

      /**
       * Toggle a tracked factor on/off
       */
      toggleTrackedFactor: (factor: keyof TrackedFactors) => {
        set((state) => ({
          trackedFactors: {
            ...state.trackedFactors,
            [factor]: !state.trackedFactors[factor],
          },
        }));
      },

      /**
       * Add a custom factor
       */
      addCustomFactor: (factor: string) => {
        const trimmedFactor = factor.trim();
        if (!trimmedFactor) return;

        set((state) => {
          // Check if factor already exists (case-insensitive)
          const exists = state.customFactors.some(
            (f) => f.toLowerCase() === trimmedFactor.toLowerCase(),
          );
          if (exists) return state;

          return {
            customFactors: [...state.customFactors, trimmedFactor],
          };
        });
      },

      /**
       * Remove a custom factor
       */
      removeCustomFactor: (factor: string) => {
        set((state) => ({
          customFactors: state.customFactors.filter((f) => f !== factor),
        }));
      },

      /**
       * Add a custom headache type
       */
      addCustomHeadacheType: (type: string) => {
        const trimmedType = type.trim();
        if (!trimmedType) return;

        set((state) => {
          // Check if type already exists (case-insensitive)
          const existsInDefault = state.headacheTypes.some(
            (t) => t.toLowerCase() === trimmedType.toLowerCase(),
          );
          const existsInCustom = state.customHeadacheTypes.some(
            (t) => t.toLowerCase() === trimmedType.toLowerCase(),
          );

          if (existsInDefault || existsInCustom) return state;

          return {
            customHeadacheTypes: [...state.customHeadacheTypes, trimmedType],
          };
        });
      },

      /**
       * Remove a custom headache type
       */
      removeCustomHeadacheType: (type: string) => {
        set((state) => ({
          customHeadacheTypes: state.customHeadacheTypes.filter(
            (t) => t !== type,
          ),
        }));
      },

      /**
       * Set intensity scale preference
       */
      setIntensityScale: (scale: IntensityScale) => {
        set({ intensityScale: scale });
      },

      /**
       * Set theme
       */
      setTheme: (theme: Theme) => {
        set({ theme });
        applyThemeToDocument(theme);
      },

      /**
       * Apply current theme to document
       */
      applyTheme: () => {
        const { theme } = get();
        applyThemeToDocument(theme);
      },

      /**
       * Set AI provider
       */
      setAiProvider: (provider: AIProvider) => {
        const defaultModels: Record<AIProvider, string> = {
          openai: "gpt-4o-mini",
          openrouter: "deepseek/deepseek-chat", // DeepSeek V3 - affordable default
        };
        set({
          aiProvider: provider,
          selectedModel: defaultModels[provider],
        });
      },

      /**
       * Set OpenAI API key
       */
      setOpenaiApiKey: (key: string) => {
        set({ openaiApiKey: key.trim() });
      },

      /**
       * Set OpenRouter API key
       */
      setOpenrouterApiKey: (key: string) => {
        set({ openrouterApiKey: key.trim() });
      },

      /**
       * Set selected model
       */
      setSelectedModel: (modelId: string) => {
        set({ selectedModel: modelId });
      },

      /**
       * Check if API key is set for current provider
       */
      hasApiKey: () => {
        const { aiProvider, openaiApiKey, openrouterApiKey } = get();
        if (aiProvider === "openai") {
          return openaiApiKey.length > 0;
        }
        return openrouterApiKey.length > 0;
      },

      /**
       * Get the active API key based on current provider
       */
      getActiveApiKey: () => {
        const { aiProvider, openaiApiKey, openrouterApiKey } = get();
        if (aiProvider === "openai") {
          return openaiApiKey;
        }
        return openrouterApiKey;
      },

      /**
       * Check if OpenAI API key is set (deprecated: use hasApiKey())
       */
      hasOpenaiApiKey: () => {
        return get().hasApiKey();
      },

      /**
       * Export all data in specified format
       */
      exportData: async (format: ExportFormat): Promise<string> => {
        try {
          // Gather data from all stores
          const headacheEntries = await useLoggingStore
            .getState()
            .getAllEntries();
          const checkInEntries = await useCheckInStore
            .getState()
            .getAllCheckIns();
          const educationStore = useEducationStore.getState();

          // Get current settings
          const {
            reminders,
            trackedFactors,
            customFactors,
            headacheTypes,
            customHeadacheTypes,
            intensityScale,
            theme,
          } = get();

          // Build export data structure
          const exportData: ExportData = {
            metadata: {
              exportedAt: new Date().toISOString(),
              appVersion: "1.0.0", // Update this based on your app version
              totalHeadacheEntries: headacheEntries.length,
              totalCheckIns: checkInEntries.length,
            },
            headacheEntries,
            checkInEntries,
            settings: {
              reminders,
              trackedFactors,
              customFactors,
              headacheTypes,
              customHeadacheTypes,
              intensityScale,
              theme,
            },
            educationProgress: Object.values(
              educationStore.contentProgress,
            ).map((progress) => ({
              contentId: progress.contentId,
              viewed: progress.viewed,
              completed: progress.completed,
              progressPercent: progress.progressPercent,
            })),
          };

          // Convert to requested format
          if (format === "json") {
            return JSON.stringify(exportData, null, 2);
          } else {
            return convertToCSV(exportData);
          }
        } catch (error) {
          console.error("Failed to export data:", error);
          throw new Error("Failed to export data. Please try again.");
        }
      },

      /**
       * Clear all data from all stores and IndexedDB
       */
      clearAllData: async (): Promise<void> => {
        try {
          // Clear logging store data
          const loggingDB = useLoggingStore.getState().db;
          if (loggingDB) {
            const tx = loggingDB.transaction(
              ["entries", "metadata"],
              "readwrite",
            );
            await tx.objectStore("entries").clear();
            await tx.objectStore("metadata").clear();
            await tx.done;
          }

          // Clear check-in store data
          const checkInDB = useCheckInStore.getState().db;
          if (checkInDB) {
            const tx = checkInDB.transaction("checkins", "readwrite");
            await tx.objectStore("checkins").clear();
            await tx.done;
          }

          // Clear localStorage for all stores
          localStorage.removeItem("logging-storage");
          localStorage.removeItem("checkin-storage");
          localStorage.removeItem("education-storage");
          localStorage.removeItem("onboarding-storage");
          localStorage.removeItem("settings-storage");

          // Reset all stores to initial state
          useLoggingStore.setState({
            metadata: {
              registrationDate: new Date(),
              firstEntryDate: null,
              totalEntries: 0,
              currentStreak: 0,
            },
            unlockedFeatures: {
              week1Features: true,
              week2Features: false,
              week3Features: false,
            },
          });

          useOnboardingStore.getState().resetOnboarding();

          // Reset settings to defaults
          get().resetToDefaults();

          console.log("All data cleared successfully");
        } catch (error) {
          console.error("Failed to clear all data:", error);
          throw new Error("Failed to clear all data. Please try again.");
        }
      },

      /**
       * Reset settings to defaults
       * Note: Does NOT reset API key - user would need to re-enter it
       */
      resetToDefaults: () => {
        set({
          reminders: defaultReminders,
          trackedFactors: defaultTrackedFactors,
          customFactors: [],
          headacheTypes: defaultHeadacheTypes,
          customHeadacheTypes: [],
          intensityScale: defaultIntensityScale,
          theme: defaultTheme,
          // Note: openaiApiKey is intentionally NOT reset
        });
        applyThemeToDocument(defaultTheme);
      },
    }),
    {
      name: "settings-storage",
    },
  ),
);

/**
 * Initialize theme on app load
 * Call this in your app's entry point (e.g., _app.tsx or layout.tsx)
 */
export const initializeTheme = () => {
  const theme = useSettingsStore.getState().theme;
  applyThemeToDocument(theme);

  // Listen for system theme changes if using 'system' theme
  if (theme === "system") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (useSettingsStore.getState().theme === "system") {
        applyThemeToDocument("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    // Return cleanup function
    return () => mediaQuery.removeEventListener("change", handleChange);
  }
};
