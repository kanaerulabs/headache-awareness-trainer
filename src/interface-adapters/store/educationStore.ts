import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Educational content types
 */
export type ContentType =
  | "tension-headache"
  | "body-scan"
  | "body-signals"
  | "vocabulary-builder"
  | "general-patterns"
  | "advanced-patterns";

export interface ContentProgress {
  contentId: ContentType;
  viewed: boolean;
  completed: boolean;
  lastViewedAt?: Date;
  progressPercent: number;
}

export interface EducationState {
  // Content progress tracking
  contentProgress: Record<ContentType, ContentProgress>;

  // Unlockable content
  unlockedContent: ContentType[];

  // Actions
  markContentViewed: (contentId: ContentType) => void;
  markContentCompleted: (contentId: ContentType) => void;
  updateProgress: (contentId: ContentType, percent: number) => void;
  unlockContent: (contentId: ContentType) => void;

  // Getters
  isContentUnlocked: (contentId: ContentType) => boolean;
  getContentProgress: (contentId: ContentType) => ContentProgress;
  getTotalProgress: () => number;
}

/**
 * Initial content progress state
 */
const initialContentProgress: Record<ContentType, ContentProgress> = {
  "tension-headache": {
    contentId: "tension-headache",
    viewed: false,
    completed: false,
    progressPercent: 0,
  },
  "body-scan": {
    contentId: "body-scan",
    viewed: false,
    completed: false,
    progressPercent: 0,
  },
  "body-signals": {
    contentId: "body-signals",
    viewed: false,
    completed: false,
    progressPercent: 0,
  },
  "vocabulary-builder": {
    contentId: "vocabulary-builder",
    viewed: false,
    completed: false,
    progressPercent: 0,
  },
  "general-patterns": {
    contentId: "general-patterns",
    viewed: false,
    completed: false,
    progressPercent: 0,
  },
  "advanced-patterns": {
    contentId: "advanced-patterns",
    viewed: false,
    completed: false,
    progressPercent: 0,
  },
};

/**
 * Content available from Day 1 (no unlock required)
 */
const initialUnlockedContent: ContentType[] = [
  "tension-headache",
  "body-scan",
  "body-signals",
  "vocabulary-builder",
  "general-patterns",
];

/**
 * Zustand store for educational content progress
 * Persisted to localStorage for offline access
 */
export const useEducationStore = create<EducationState>()(
  persist(
    (set, get) => ({
      contentProgress: initialContentProgress,
      unlockedContent: initialUnlockedContent,

      markContentViewed: (contentId: ContentType) => {
        set((state) => ({
          contentProgress: {
            ...state.contentProgress,
            [contentId]: {
              ...state.contentProgress[contentId],
              viewed: true,
              lastViewedAt: new Date(),
            },
          },
        }));
      },

      markContentCompleted: (contentId: ContentType) => {
        set((state) => ({
          contentProgress: {
            ...state.contentProgress,
            [contentId]: {
              ...state.contentProgress[contentId],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
          },
        }));
      },

      updateProgress: (contentId: ContentType, percent: number) => {
        set((state) => ({
          contentProgress: {
            ...state.contentProgress,
            [contentId]: {
              ...state.contentProgress[contentId],
              progressPercent: Math.min(100, Math.max(0, percent)),
              lastViewedAt: new Date(),
            },
          },
        }));
      },

      unlockContent: (contentId: ContentType) => {
        set((state) => ({
          unlockedContent: state.unlockedContent.includes(contentId)
            ? state.unlockedContent
            : [...state.unlockedContent, contentId],
        }));
      },

      isContentUnlocked: (contentId: ContentType) => {
        return get().unlockedContent.includes(contentId);
      },

      getContentProgress: (contentId: ContentType) => {
        return get().contentProgress[contentId];
      },

      getTotalProgress: () => {
        const progress = get().contentProgress;
        const allContent = Object.values(progress);
        const totalPercent = allContent.reduce(
          (sum, content) => sum + content.progressPercent,
          0,
        );
        return Math.round(totalPercent / allContent.length);
      },
    }),
    {
      name: "education-storage",
    },
  ),
);
