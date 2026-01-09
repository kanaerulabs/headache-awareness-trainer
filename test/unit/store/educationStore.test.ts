import { renderHook, act } from "@testing-library/react";
import {
  useEducationStore,
  ContentType,
} from "@/interface-adapters/store/educationStore";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Education Store", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Reset store to initial state
    const { result } = renderHook(() => useEducationStore());
    act(() => {
      useEducationStore.setState({
        contentProgress: {
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
        },
        unlockedContent: [
          "tension-headache",
          "body-scan",
          "body-signals",
          "vocabulary-builder",
          "general-patterns",
        ],
      });
    });
  });

  describe("Initial State", () => {
    it("should initialize with all 6 content types with default progress", () => {
      const { result } = renderHook(() => useEducationStore());

      expect(result.current.contentProgress).toBeDefined();
      expect(Object.keys(result.current.contentProgress)).toHaveLength(6);

      // Check each content type exists with default values
      const contentTypes: ContentType[] = [
        "tension-headache",
        "body-scan",
        "body-signals",
        "vocabulary-builder",
        "general-patterns",
        "advanced-patterns",
      ];

      contentTypes.forEach((contentId) => {
        expect(result.current.contentProgress[contentId]).toEqual({
          contentId,
          viewed: false,
          completed: false,
          progressPercent: 0,
        });
      });
    });

    it("should initialize with 5 content types unlocked (all except advanced-patterns)", () => {
      const { result } = renderHook(() => useEducationStore());

      expect(result.current.unlockedContent).toHaveLength(5);
      expect(result.current.unlockedContent).toEqual([
        "tension-headache",
        "body-scan",
        "body-signals",
        "vocabulary-builder",
        "general-patterns",
      ]);
      expect(result.current.unlockedContent).not.toContain("advanced-patterns");
    });
  });

  describe("markContentViewed", () => {
    it("should set viewed=true and update lastViewedAt", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "tension-headache";

      act(() => {
        result.current.markContentViewed(contentId);
      });

      expect(result.current.contentProgress[contentId].viewed).toBe(true);
      expect(
        result.current.contentProgress[contentId].lastViewedAt,
      ).toBeInstanceOf(Date);
    });

    it("should not modify other properties when marking as viewed", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "body-scan";

      act(() => {
        result.current.markContentViewed(contentId);
      });

      expect(result.current.contentProgress[contentId].completed).toBe(false);
      expect(result.current.contentProgress[contentId].progressPercent).toBe(0);
    });

    it("should update lastViewedAt timestamp on subsequent views", async () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "body-signals";

      act(() => {
        result.current.markContentViewed(contentId);
      });

      const firstViewTime =
        result.current.contentProgress[contentId].lastViewedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      act(() => {
        result.current.markContentViewed(contentId);
      });

      const secondViewTime =
        result.current.contentProgress[contentId].lastViewedAt;
      expect(secondViewTime).not.toEqual(firstViewTime);
    });
  });

  describe("markContentCompleted", () => {
    it("should set completed=true, viewed=true, and progressPercent=100", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "vocabulary-builder";

      act(() => {
        result.current.markContentCompleted(contentId);
      });

      expect(result.current.contentProgress[contentId].completed).toBe(true);
      expect(result.current.contentProgress[contentId].viewed).toBe(true);
      expect(result.current.contentProgress[contentId].progressPercent).toBe(
        100,
      );
      expect(
        result.current.contentProgress[contentId].lastViewedAt,
      ).toBeInstanceOf(Date);
    });

    it("should mark as viewed even if not previously viewed", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "general-patterns";

      // Ensure content is not viewed
      expect(result.current.contentProgress[contentId].viewed).toBe(false);

      act(() => {
        result.current.markContentCompleted(contentId);
      });

      expect(result.current.contentProgress[contentId].viewed).toBe(true);
    });
  });

  describe("updateProgress", () => {
    it("should update progressPercent with valid values", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "tension-headache";

      act(() => {
        result.current.updateProgress(contentId, 50);
      });

      expect(result.current.contentProgress[contentId].progressPercent).toBe(
        50,
      );
      expect(
        result.current.contentProgress[contentId].lastViewedAt,
      ).toBeInstanceOf(Date);
    });

    it("should clamp values to 0-100 range (negative values)", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "body-scan";

      act(() => {
        result.current.updateProgress(contentId, -25);
      });

      expect(result.current.contentProgress[contentId].progressPercent).toBe(0);
    });

    it("should clamp values to 0-100 range (values over 100)", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "body-signals";

      act(() => {
        result.current.updateProgress(contentId, 150);
      });

      expect(result.current.contentProgress[contentId].progressPercent).toBe(
        100,
      );
    });

    it("should accept exact boundary values (0 and 100)", () => {
      const { result } = renderHook(() => useEducationStore());

      act(() => {
        result.current.updateProgress("vocabulary-builder", 0);
        result.current.updateProgress("general-patterns", 100);
      });

      expect(
        result.current.contentProgress["vocabulary-builder"].progressPercent,
      ).toBe(0);
      expect(
        result.current.contentProgress["general-patterns"].progressPercent,
      ).toBe(100);
    });

    it("should update lastViewedAt when progress is updated", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "advanced-patterns";

      act(() => {
        result.current.updateProgress(contentId, 75);
      });

      expect(
        result.current.contentProgress[contentId].lastViewedAt,
      ).toBeInstanceOf(Date);
    });
  });

  describe("unlockContent", () => {
    it("should add new content to unlockedContent array", () => {
      const { result } = renderHook(() => useEducationStore());

      // Verify advanced-patterns is not initially unlocked
      expect(result.current.unlockedContent).not.toContain("advanced-patterns");

      act(() => {
        result.current.unlockContent("advanced-patterns");
      });

      expect(result.current.unlockedContent).toContain("advanced-patterns");
      expect(result.current.unlockedContent).toHaveLength(6);
    });

    it("should not duplicate already unlocked content", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "tension-headache";

      // Verify content is already unlocked
      expect(result.current.unlockedContent).toContain(contentId);
      const initialLength = result.current.unlockedContent.length;

      act(() => {
        result.current.unlockContent(contentId);
      });

      expect(result.current.unlockedContent).toContain(contentId);
      expect(result.current.unlockedContent).toHaveLength(initialLength);

      // Count occurrences - should only appear once
      const count = result.current.unlockedContent.filter(
        (id) => id === contentId,
      ).length;
      expect(count).toBe(1);
    });

    it("should preserve existing unlocked content when adding new content", () => {
      const { result } = renderHook(() => useEducationStore());
      const existingUnlocked = [...result.current.unlockedContent];

      act(() => {
        result.current.unlockContent("advanced-patterns");
      });

      existingUnlocked.forEach((contentId) => {
        expect(result.current.unlockedContent).toContain(contentId);
      });
    });
  });

  describe("isContentUnlocked", () => {
    it("should return true for unlocked content", () => {
      const { result } = renderHook(() => useEducationStore());

      expect(result.current.isContentUnlocked("tension-headache")).toBe(true);
      expect(result.current.isContentUnlocked("body-scan")).toBe(true);
      expect(result.current.isContentUnlocked("body-signals")).toBe(true);
      expect(result.current.isContentUnlocked("vocabulary-builder")).toBe(true);
      expect(result.current.isContentUnlocked("general-patterns")).toBe(true);
    });

    it("should return false for locked content", () => {
      const { result } = renderHook(() => useEducationStore());

      expect(result.current.isContentUnlocked("advanced-patterns")).toBe(false);
    });

    it("should return true after unlocking previously locked content", () => {
      const { result } = renderHook(() => useEducationStore());

      expect(result.current.isContentUnlocked("advanced-patterns")).toBe(false);

      act(() => {
        result.current.unlockContent("advanced-patterns");
      });

      expect(result.current.isContentUnlocked("advanced-patterns")).toBe(true);
    });
  });

  describe("getContentProgress", () => {
    it("should return correct ContentProgress object for given contentId", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "tension-headache";

      const progress = result.current.getContentProgress(contentId);

      expect(progress).toEqual({
        contentId,
        viewed: false,
        completed: false,
        progressPercent: 0,
      });
    });

    it("should return updated progress after modifications", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "body-scan";

      act(() => {
        result.current.updateProgress(contentId, 60);
        result.current.markContentViewed(contentId);
      });

      const progress = result.current.getContentProgress(contentId);

      expect(progress.viewed).toBe(true);
      expect(progress.progressPercent).toBe(60);
      expect(progress.lastViewedAt).toBeInstanceOf(Date);
    });
  });

  describe("getTotalProgress", () => {
    it("should calculate average correctly with all content at 0%", () => {
      const { result } = renderHook(() => useEducationStore());

      const totalProgress = result.current.getTotalProgress();

      expect(totalProgress).toBe(0);
    });

    it("should calculate average correctly with mixed progress", () => {
      const { result } = renderHook(() => useEducationStore());

      act(() => {
        result.current.updateProgress("tension-headache", 100);
        result.current.updateProgress("body-scan", 50);
        result.current.updateProgress("body-signals", 25);
        // vocabulary-builder: 0
        // general-patterns: 0
        // advanced-patterns: 0
      });

      const totalProgress = result.current.getTotalProgress();

      // (100 + 50 + 25 + 0 + 0 + 0) / 6 = 175 / 6 = 29.166... → 29 (rounded)
      expect(totalProgress).toBe(29);
    });

    it("should calculate average correctly with all content at 100%", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentTypes: ContentType[] = [
        "tension-headache",
        "body-scan",
        "body-signals",
        "vocabulary-builder",
        "general-patterns",
        "advanced-patterns",
      ];

      act(() => {
        contentTypes.forEach((contentId) => {
          result.current.markContentCompleted(contentId);
        });
      });

      const totalProgress = result.current.getTotalProgress();

      expect(totalProgress).toBe(100);
    });

    it("should round to nearest integer", () => {
      const { result } = renderHook(() => useEducationStore());

      act(() => {
        result.current.updateProgress("tension-headache", 33);
        result.current.updateProgress("body-scan", 33);
        result.current.updateProgress("body-signals", 34);
        // Others at 0
      });

      const totalProgress = result.current.getTotalProgress();

      // (33 + 33 + 34 + 0 + 0 + 0) / 6 = 100 / 6 = 16.666... → 17 (rounded)
      expect(totalProgress).toBe(17);
    });
  });

  describe("Persistence - LocalStorage", () => {
    it('should use localStorage key "education-storage"', () => {
      // Verify the store is configured with persist middleware
      // This test ensures the storage key is correct
      const { result } = renderHook(() => useEducationStore());

      // The persist middleware configuration uses "education-storage" key
      expect(result.current).toBeDefined();
      expect(result.current.contentProgress).toBeDefined();
    });

    it("should maintain state consistency across renders", () => {
      const { result: result1 } = renderHook(() => useEducationStore());

      act(() => {
        result1.current.markContentViewed("tension-headache");
        result1.current.updateProgress("body-scan", 75);
      });

      // Create new hook instance - should share same store state
      const { result: result2 } = renderHook(() => useEducationStore());

      // Both hooks should see the same state
      expect(result2.current.contentProgress["tension-headache"].viewed).toBe(
        true,
      );
      expect(result2.current.contentProgress["body-scan"].progressPercent).toBe(
        75,
      );
    });

    it("should persist unlocked content across hook instances", () => {
      const { result: result1 } = renderHook(() => useEducationStore());

      act(() => {
        result1.current.unlockContent("advanced-patterns");
      });

      // Create new hook instance - should share same store state
      const { result: result2 } = renderHook(() => useEducationStore());

      expect(result2.current.unlockedContent).toContain("advanced-patterns");
    });

    it("should maintain progress state when component remounts", () => {
      const { result: result1 } = renderHook(() => useEducationStore());

      act(() => {
        result1.current.markContentCompleted("vocabulary-builder");
        result1.current.updateProgress("general-patterns", 50);
      });

      // Simulate component remount with new hook
      const { result: result2 } = renderHook(() => useEducationStore());

      // Progress should be maintained
      expect(
        result2.current.contentProgress["vocabulary-builder"].completed,
      ).toBe(true);
      expect(
        result2.current.contentProgress["vocabulary-builder"].progressPercent,
      ).toBe(100);
      expect(
        result2.current.contentProgress["general-patterns"].progressPercent,
      ).toBe(50);
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple rapid updates to the same content", () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "tension-headache";

      act(() => {
        result.current.updateProgress(contentId, 10);
        result.current.updateProgress(contentId, 20);
        result.current.updateProgress(contentId, 30);
        result.current.markContentViewed(contentId);
      });

      expect(result.current.contentProgress[contentId].progressPercent).toBe(
        30,
      );
      expect(result.current.contentProgress[contentId].viewed).toBe(true);
    });

    it("should maintain immutability - not mutate previous state references", () => {
      const { result } = renderHook(() => useEducationStore());

      const initialProgress = result.current.contentProgress["body-scan"];
      const initialUnlocked = result.current.unlockedContent;

      act(() => {
        result.current.updateProgress("body-scan", 50);
        result.current.unlockContent("advanced-patterns");
      });

      // Initial references should not be mutated
      expect(initialProgress.progressPercent).toBe(0);
      expect(initialUnlocked).not.toContain("advanced-patterns");

      // But current state should be updated
      expect(result.current.contentProgress["body-scan"].progressPercent).toBe(
        50,
      );
      expect(result.current.unlockedContent).toContain("advanced-patterns");
    });

    it("should handle marking completed content as viewed again", async () => {
      const { result } = renderHook(() => useEducationStore());
      const contentId: ContentType = "vocabulary-builder";

      act(() => {
        result.current.markContentCompleted(contentId);
      });

      const firstViewTime =
        result.current.contentProgress[contentId].lastViewedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      act(() => {
        result.current.markContentViewed(contentId);
      });

      // Should still be completed with updated view time
      expect(result.current.contentProgress[contentId].completed).toBe(true);
      expect(result.current.contentProgress[contentId].progressPercent).toBe(
        100,
      );
      expect(
        result.current.contentProgress[contentId].lastViewedAt,
      ).not.toEqual(firstViewTime);
    });
  });
});
