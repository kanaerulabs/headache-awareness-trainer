import {
  useSettingsStore,
  ReminderSettings,
  TrackedFactors,
  Theme,
  IntensityScale,
  ExportFormat,
} from "@/interface-adapters/store/settingsStore";
import {
  useLoggingStore,
  HeadacheEntry,
} from "@/interface-adapters/store/loggingStore";
import {
  useCheckInStore,
  CheckInEntry,
} from "@/interface-adapters/store/checkinStore";
import { useEducationStore } from "@/interface-adapters/store/educationStore";
import { useOnboardingStore } from "@/interface-adapters/store/onboardingStore";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
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
  writable: true,
});

// Mock document for theme testing
const mockDocumentElement = {
  classList: {
    toggle: jest.fn(),
  },
};

Object.defineProperty(document, "documentElement", {
  value: mockDocumentElement,
  writable: true,
});

// Mock window.matchMedia for system theme
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the logging store
jest.mock("@/interface-adapters/store/loggingStore", () => ({
  useLoggingStore: {
    getState: jest.fn(() => ({
      db: null,
      metadata: {
        registrationDate: new Date("2025-01-01"),
        firstEntryDate: new Date("2025-01-01"),
        totalEntries: 0,
        currentStreak: 0,
      },
      getAllEntries: jest.fn().mockResolvedValue([]),
    })),
    setState: jest.fn(),
  },
}));

// Mock the check-in store
jest.mock("@/interface-adapters/store/checkinStore", () => ({
  useCheckInStore: {
    getState: jest.fn(() => ({
      db: null,
      getAllCheckIns: jest.fn().mockResolvedValue([]),
    })),
  },
}));

// Mock the education store
jest.mock("@/interface-adapters/store/educationStore", () => ({
  useEducationStore: {
    getState: jest.fn(() => ({
      contentProgress: {},
    })),
  },
}));

// Mock the onboarding store
jest.mock("@/interface-adapters/store/onboardingStore", () => ({
  useOnboardingStore: {
    getState: jest.fn(() => ({
      resetOnboarding: jest.fn(),
    })),
  },
}));

describe("settingsStore", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset store to initial/default state
    useSettingsStore.setState({
      reminders: {
        enabled: false,
        times: ["09:00", "21:00"],
        days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        style: "gentle",
      },
      trackedFactors: {
        sleep: true,
        hydration: true,
        caffeine: true,
        alcohol: true,
        stress: true,
        weather: true,
        menstrual: true,
        medication: true,
      },
      customFactors: [],
      headacheTypes: ["tension", "migraine", "cluster", "sinus"],
      customHeadacheTypes: [],
      intensityScale: 5,
      theme: "system",
    });

    jest.clearAllMocks();
    mockDocumentElement.classList.toggle.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct default values", () => {
      const state = useSettingsStore.getState();

      expect(state.reminders).toEqual({
        enabled: false,
        times: ["09:00", "21:00"],
        days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        style: "gentle",
      });

      expect(state.trackedFactors).toEqual({
        sleep: true,
        hydration: true,
        caffeine: true,
        alcohol: true,
        stress: true,
        weather: true,
        menstrual: true,
        medication: true,
      });

      expect(state.customFactors).toEqual([]);
      expect(state.headacheTypes).toEqual([
        "tension",
        "migraine",
        "cluster",
        "sinus",
      ]);
      expect(state.customHeadacheTypes).toEqual([]);
      expect(state.intensityScale).toBe(5);
      expect(state.theme).toBe("system");
    });
  });

  describe("reminder settings", () => {
    describe("setRemindersEnabled", () => {
      it("should enable reminders", () => {
        const { setRemindersEnabled } = useSettingsStore.getState();

        setRemindersEnabled(true);

        const state = useSettingsStore.getState();
        expect(state.reminders.enabled).toBe(true);
      });

      it("should disable reminders", () => {
        const { setRemindersEnabled } = useSettingsStore.getState();

        // First enable
        setRemindersEnabled(true);
        expect(useSettingsStore.getState().reminders.enabled).toBe(true);

        // Then disable
        setRemindersEnabled(false);
        expect(useSettingsStore.getState().reminders.enabled).toBe(false);
      });

      it("should preserve other reminder settings when toggling enabled", () => {
        const { setRemindersEnabled, setReminderTimes } =
          useSettingsStore.getState();

        // Set custom times
        setReminderTimes(["08:00", "12:00", "20:00"]);

        // Toggle enabled
        setRemindersEnabled(true);

        const state = useSettingsStore.getState();
        expect(state.reminders.times).toEqual(["08:00", "12:00", "20:00"]);
        expect(state.reminders.days).toEqual([
          "mon",
          "tue",
          "wed",
          "thu",
          "fri",
          "sat",
          "sun",
        ]);
        expect(state.reminders.style).toBe("gentle");
      });
    });

    describe("setReminderTimes", () => {
      it("should update reminder times", () => {
        const { setReminderTimes } = useSettingsStore.getState();

        setReminderTimes(["08:00", "12:00", "18:00"]);

        const state = useSettingsStore.getState();
        expect(state.reminders.times).toEqual(["08:00", "12:00", "18:00"]);
      });

      it("should handle empty array of times", () => {
        const { setReminderTimes } = useSettingsStore.getState();

        setReminderTimes([]);

        const state = useSettingsStore.getState();
        expect(state.reminders.times).toEqual([]);
      });

      it("should handle single time", () => {
        const { setReminderTimes } = useSettingsStore.getState();

        setReminderTimes(["10:00"]);

        const state = useSettingsStore.getState();
        expect(state.reminders.times).toEqual(["10:00"]);
      });
    });

    describe("setReminderDays", () => {
      it("should update reminder days", () => {
        const { setReminderDays } = useSettingsStore.getState();

        setReminderDays(["mon", "wed", "fri"]);

        const state = useSettingsStore.getState();
        expect(state.reminders.days).toEqual(["mon", "wed", "fri"]);
      });

      it("should handle empty array of days", () => {
        const { setReminderDays } = useSettingsStore.getState();

        setReminderDays([]);

        const state = useSettingsStore.getState();
        expect(state.reminders.days).toEqual([]);
      });

      it("should handle weekend only", () => {
        const { setReminderDays } = useSettingsStore.getState();

        setReminderDays(["sat", "sun"]);

        const state = useSettingsStore.getState();
        expect(state.reminders.days).toEqual(["sat", "sun"]);
      });
    });

    describe("setReminderStyle", () => {
      it("should set reminder style to gentle", () => {
        const { setReminderStyle } = useSettingsStore.getState();

        setReminderStyle("gentle");

        const state = useSettingsStore.getState();
        expect(state.reminders.style).toBe("gentle");
      });

      it("should set reminder style to persistent", () => {
        const { setReminderStyle } = useSettingsStore.getState();

        setReminderStyle("persistent");

        const state = useSettingsStore.getState();
        expect(state.reminders.style).toBe("persistent");
      });

      it("should switch between styles", () => {
        const { setReminderStyle } = useSettingsStore.getState();

        setReminderStyle("persistent");
        expect(useSettingsStore.getState().reminders.style).toBe("persistent");

        setReminderStyle("gentle");
        expect(useSettingsStore.getState().reminders.style).toBe("gentle");
      });
    });
  });

  describe("tracked factors", () => {
    describe("toggleTrackedFactor", () => {
      it("should toggle sleep factor off", () => {
        const { toggleTrackedFactor } = useSettingsStore.getState();

        toggleTrackedFactor("sleep");

        const state = useSettingsStore.getState();
        expect(state.trackedFactors.sleep).toBe(false);
      });

      it("should toggle sleep factor on after turning off", () => {
        const { toggleTrackedFactor } = useSettingsStore.getState();

        // Toggle off
        toggleTrackedFactor("sleep");
        expect(useSettingsStore.getState().trackedFactors.sleep).toBe(false);

        // Toggle back on
        toggleTrackedFactor("sleep");
        expect(useSettingsStore.getState().trackedFactors.sleep).toBe(true);
      });

      it("should toggle each factor independently", () => {
        const { toggleTrackedFactor } = useSettingsStore.getState();

        toggleTrackedFactor("sleep");
        toggleTrackedFactor("caffeine");
        toggleTrackedFactor("stress");

        const state = useSettingsStore.getState();
        expect(state.trackedFactors.sleep).toBe(false);
        expect(state.trackedFactors.caffeine).toBe(false);
        expect(state.trackedFactors.stress).toBe(false);
        // Others remain unchanged
        expect(state.trackedFactors.hydration).toBe(true);
        expect(state.trackedFactors.alcohol).toBe(true);
      });

      it("should toggle all factors", () => {
        const { toggleTrackedFactor } = useSettingsStore.getState();

        const factors: (keyof TrackedFactors)[] = [
          "sleep",
          "hydration",
          "caffeine",
          "alcohol",
          "stress",
          "weather",
          "menstrual",
          "medication",
        ];

        factors.forEach((factor) => toggleTrackedFactor(factor));

        const state = useSettingsStore.getState();
        factors.forEach((factor) => {
          expect(state.trackedFactors[factor]).toBe(false);
        });
      });
    });

    describe("addCustomFactor", () => {
      it("should add a custom factor", () => {
        const { addCustomFactor } = useSettingsStore.getState();

        addCustomFactor("exercise");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toContain("exercise");
      });

      it("should add multiple custom factors", () => {
        const { addCustomFactor } = useSettingsStore.getState();

        addCustomFactor("exercise");
        addCustomFactor("meditation");
        addCustomFactor("reading");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual([
          "exercise",
          "meditation",
          "reading",
        ]);
      });

      it("should prevent duplicate custom factors (case-insensitive)", () => {
        const { addCustomFactor } = useSettingsStore.getState();

        addCustomFactor("exercise");
        addCustomFactor("Exercise"); // Different case
        addCustomFactor("EXERCISE"); // All caps

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual(["exercise"]);
      });

      it("should ignore empty strings", () => {
        const { addCustomFactor } = useSettingsStore.getState();

        addCustomFactor("");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual([]);
      });

      it("should ignore whitespace-only strings", () => {
        const { addCustomFactor } = useSettingsStore.getState();

        addCustomFactor("   ");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual([]);
      });

      it("should trim whitespace from custom factors", () => {
        const { addCustomFactor } = useSettingsStore.getState();

        addCustomFactor("  exercise  ");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual(["exercise"]);
      });
    });

    describe("removeCustomFactor", () => {
      it("should remove a custom factor", () => {
        const { addCustomFactor, removeCustomFactor } =
          useSettingsStore.getState();

        addCustomFactor("exercise");
        addCustomFactor("meditation");

        removeCustomFactor("exercise");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual(["meditation"]);
      });

      it("should handle removing non-existent factor gracefully", () => {
        const { addCustomFactor, removeCustomFactor } =
          useSettingsStore.getState();

        addCustomFactor("exercise");

        removeCustomFactor("nonexistent");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual(["exercise"]);
      });

      it("should remove all custom factors", () => {
        const { addCustomFactor, removeCustomFactor } =
          useSettingsStore.getState();

        addCustomFactor("exercise");
        addCustomFactor("meditation");
        addCustomFactor("reading");

        removeCustomFactor("exercise");
        removeCustomFactor("meditation");
        removeCustomFactor("reading");

        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual([]);
      });
    });
  });

  describe("headache types", () => {
    describe("addCustomHeadacheType", () => {
      it("should add a custom headache type", () => {
        const { addCustomHeadacheType } = useSettingsStore.getState();

        addCustomHeadacheType("hormonal");

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toContain("hormonal");
      });

      it("should add multiple custom headache types", () => {
        const { addCustomHeadacheType } = useSettingsStore.getState();

        addCustomHeadacheType("hormonal");
        addCustomHeadacheType("rebound");
        addCustomHeadacheType("cervicogenic");

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual([
          "hormonal",
          "rebound",
          "cervicogenic",
        ]);
      });

      it("should prevent duplicate custom types (case-insensitive)", () => {
        const { addCustomHeadacheType } = useSettingsStore.getState();

        addCustomHeadacheType("hormonal");
        addCustomHeadacheType("Hormonal"); // Different case
        addCustomHeadacheType("HORMONAL"); // All caps

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual(["hormonal"]);
      });

      it("should prevent adding type that exists in default types (case-insensitive)", () => {
        const { addCustomHeadacheType } = useSettingsStore.getState();

        addCustomHeadacheType("tension"); // Default type
        addCustomHeadacheType("Migraine"); // Default type, different case

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual([]);
        // Default types remain unchanged
        expect(state.headacheTypes).toEqual([
          "tension",
          "migraine",
          "cluster",
          "sinus",
        ]);
      });

      it("should ignore empty strings", () => {
        const { addCustomHeadacheType } = useSettingsStore.getState();

        addCustomHeadacheType("");

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual([]);
      });

      it("should ignore whitespace-only strings", () => {
        const { addCustomHeadacheType } = useSettingsStore.getState();

        addCustomHeadacheType("   ");

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual([]);
      });

      it("should trim whitespace from custom headache types", () => {
        const { addCustomHeadacheType } = useSettingsStore.getState();

        addCustomHeadacheType("  hormonal  ");

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual(["hormonal"]);
      });
    });

    describe("removeCustomHeadacheType", () => {
      it("should remove a custom headache type", () => {
        const { addCustomHeadacheType, removeCustomHeadacheType } =
          useSettingsStore.getState();

        addCustomHeadacheType("hormonal");
        addCustomHeadacheType("rebound");

        removeCustomHeadacheType("hormonal");

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual(["rebound"]);
      });

      it("should handle removing non-existent type gracefully", () => {
        const { addCustomHeadacheType, removeCustomHeadacheType } =
          useSettingsStore.getState();

        addCustomHeadacheType("hormonal");

        removeCustomHeadacheType("nonexistent");

        const state = useSettingsStore.getState();
        expect(state.customHeadacheTypes).toEqual(["hormonal"]);
      });

      it("should not remove default headache types", () => {
        const { removeCustomHeadacheType } = useSettingsStore.getState();

        // Attempt to remove default type (should have no effect on customHeadacheTypes)
        removeCustomHeadacheType("tension");

        const state = useSettingsStore.getState();
        expect(state.headacheTypes).toEqual([
          "tension",
          "migraine",
          "cluster",
          "sinus",
        ]);
        expect(state.customHeadacheTypes).toEqual([]);
      });
    });
  });

  describe("preferences", () => {
    describe("setIntensityScale", () => {
      it("should set intensity scale to 5", () => {
        const { setIntensityScale } = useSettingsStore.getState();

        setIntensityScale(5);

        const state = useSettingsStore.getState();
        expect(state.intensityScale).toBe(5);
      });

      it("should set intensity scale to 10", () => {
        const { setIntensityScale } = useSettingsStore.getState();

        setIntensityScale(10);

        const state = useSettingsStore.getState();
        expect(state.intensityScale).toBe(10);
      });

      it("should switch between scales", () => {
        const { setIntensityScale } = useSettingsStore.getState();

        setIntensityScale(10);
        expect(useSettingsStore.getState().intensityScale).toBe(10);

        setIntensityScale(5);
        expect(useSettingsStore.getState().intensityScale).toBe(5);
      });
    });

    describe("setTheme", () => {
      it("should set theme to light", () => {
        const { setTheme } = useSettingsStore.getState();

        setTheme("light");

        const state = useSettingsStore.getState();
        expect(state.theme).toBe("light");
        expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith(
          "dark",
          false,
        );
      });

      it("should set theme to dark", () => {
        const { setTheme } = useSettingsStore.getState();

        setTheme("dark");

        const state = useSettingsStore.getState();
        expect(state.theme).toBe("dark");
        expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith(
          "dark",
          true,
        );
      });

      it("should set theme to system", () => {
        const { setTheme } = useSettingsStore.getState();

        setTheme("system");

        const state = useSettingsStore.getState();
        expect(state.theme).toBe("system");
        expect(mockDocumentElement.classList.toggle).toHaveBeenCalled();
      });

      it("should apply theme to document when system theme is dark", () => {
        (window.matchMedia as jest.Mock).mockImplementation((query) => ({
          matches: query === "(prefers-color-scheme: dark)",
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));

        const { setTheme } = useSettingsStore.getState();

        setTheme("system");

        expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith(
          "dark",
          true,
        );
      });

      it("should apply theme to document when system theme is light", () => {
        (window.matchMedia as jest.Mock).mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));

        const { setTheme } = useSettingsStore.getState();

        setTheme("system");

        expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith(
          "dark",
          false,
        );
      });
    });

    describe("applyTheme", () => {
      it("should apply current theme to document", () => {
        const { setTheme, applyTheme } = useSettingsStore.getState();

        setTheme("dark");
        mockDocumentElement.classList.toggle.mockClear();

        applyTheme();

        expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith(
          "dark",
          true,
        );
      });

      it("should apply light theme", () => {
        const { setTheme, applyTheme } = useSettingsStore.getState();

        setTheme("light");
        mockDocumentElement.classList.toggle.mockClear();

        applyTheme();

        expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith(
          "dark",
          false,
        );
      });
    });
  });

  describe("data management", () => {
    describe("exportData", () => {
      it("should export data in JSON format", async () => {
        const mockHeadacheEntries: HeadacheEntry[] = [
          {
            id: "1",
            timestamp: new Date("2025-01-10T12:00:00Z"),
            intensity: 3,
          },
        ];

        const mockCheckInEntries: CheckInEntry[] = [
          {
            id: "c1",
            timestamp: new Date("2025-01-10T08:00:00Z"),
            timeOfDay: "morning",
            mood: "ok",
            bodyTension: ["neck"],
            sleepQuality: "good",
            physicalFactors: [],
            isQuickDismiss: false,
          },
        ];

        (useLoggingStore.getState as any).mockReturnValue({
          db: null,
          getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
        });

        (useCheckInStore.getState as any).mockReturnValue({
          db: null,
          getAllCheckIns: jest.fn().mockResolvedValue(mockCheckInEntries),
        });

        (useEducationStore.getState as any).mockReturnValue({
          contentProgress: {
            "content-1": {
              contentId: "content-1",
              viewed: true,
              completed: false,
              progressPercent: 50,
            },
          },
        });

        const { exportData } = useSettingsStore.getState();

        const result = await exportData("json");

        expect(result).toBeTruthy();
        const parsed = JSON.parse(result);

        expect(parsed.metadata).toBeDefined();
        expect(parsed.metadata.totalHeadacheEntries).toBe(1);
        expect(parsed.metadata.totalCheckIns).toBe(1);
        expect(parsed.metadata.exportedAt).toBeDefined();
        expect(parsed.metadata.appVersion).toBe("1.0.0");

        // Check data structure (dates will be serialized to strings in JSON)
        expect(parsed.headacheEntries).toHaveLength(1);
        expect(parsed.headacheEntries[0].id).toBe("1");
        expect(parsed.headacheEntries[0].intensity).toBe(3);

        expect(parsed.checkInEntries).toHaveLength(1);
        expect(parsed.checkInEntries[0].id).toBe("c1");

        expect(parsed.settings).toBeDefined();
        expect(parsed.settings.reminders).toBeDefined();
        expect(parsed.settings.trackedFactors).toBeDefined();
        expect(parsed.settings.intensityScale).toBe(5);

        expect(parsed.educationProgress).toHaveLength(1);
        expect(parsed.educationProgress[0].contentId).toBe("content-1");
      });

      it("should export data in CSV format", async () => {
        const mockHeadacheEntries: HeadacheEntry[] = [
          {
            id: "1",
            timestamp: new Date("2025-01-10T12:00:00Z"),
            intensity: 3,
            note: "Test headache",
            headacheType: "tension",
          },
        ];

        (useLoggingStore.getState as any).mockReturnValue({
          db: null,
          getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
        });

        (useCheckInStore.getState as any).mockReturnValue({
          db: null,
          getAllCheckIns: jest.fn().mockResolvedValue([]),
        });

        (useEducationStore.getState as any).mockReturnValue({
          contentProgress: {},
        });

        const { exportData } = useSettingsStore.getState();

        const result = await exportData("csv");

        expect(result).toBeTruthy();
        expect(result).toContain("# Headache Awareness Trainer - Data Export");
        expect(result).toContain("# Headache Entries");
        expect(result).toContain("ID,Timestamp,Intensity,Type,Note");
        expect(result).toContain("1,");
        expect(result).toContain("3,");
      });

      it("should handle CSV with special characters in notes", async () => {
        const mockHeadacheEntries: HeadacheEntry[] = [
          {
            id: "1",
            timestamp: new Date("2025-01-10T12:00:00Z"),
            intensity: 3,
            note: 'Note with "quotes" and commas, test',
          },
        ];

        (useLoggingStore.getState as any).mockReturnValue({
          db: null,
          getAllEntries: jest.fn().mockResolvedValue(mockHeadacheEntries),
        });

        (useCheckInStore.getState as any).mockReturnValue({
          db: null,
          getAllCheckIns: jest.fn().mockResolvedValue([]),
        });

        (useEducationStore.getState as any).mockReturnValue({
          contentProgress: {},
        });

        const { exportData } = useSettingsStore.getState();

        const result = await exportData("csv");

        expect(result).toContain('Note with ""quotes"" and commas, test');
      });

      it("should include current settings in export", async () => {
        const { setRemindersEnabled, addCustomFactor, exportData } =
          useSettingsStore.getState();

        setRemindersEnabled(true);
        addCustomFactor("exercise");

        (useLoggingStore.getState as any).mockReturnValue({
          db: null,
          getAllEntries: jest.fn().mockResolvedValue([]),
        });

        (useCheckInStore.getState as any).mockReturnValue({
          db: null,
          getAllCheckIns: jest.fn().mockResolvedValue([]),
        });

        (useEducationStore.getState as any).mockReturnValue({
          contentProgress: {},
        });

        const result = await exportData("json");
        const parsed = JSON.parse(result);

        expect(parsed.settings.reminders.enabled).toBe(true);
        expect(parsed.settings.customFactors).toContain("exercise");
      });

      it("should handle export error gracefully", async () => {
        (useLoggingStore.getState as any).mockReturnValue({
          db: null,
          getAllEntries: jest
            .fn()
            .mockRejectedValue(new Error("Database error")),
        });

        const { exportData } = useSettingsStore.getState();

        await expect(exportData("json")).rejects.toThrow(
          "Failed to export data. Please try again.",
        );
      });
    });

    describe("clearAllData", () => {
      it("should clear all data and reset stores", async () => {
        const mockLoggingDB = {
          transaction: jest.fn().mockReturnValue({
            objectStore: jest.fn().mockReturnValue({
              clear: jest.fn(),
            }),
            done: Promise.resolve(),
          }),
        };

        const mockCheckInDB = {
          transaction: jest.fn().mockReturnValue({
            objectStore: jest.fn().mockReturnValue({
              clear: jest.fn(),
            }),
            done: Promise.resolve(),
          }),
        };

        (useLoggingStore.getState as any).mockReturnValue({
          db: mockLoggingDB,
        });

        (useCheckInStore.getState as any).mockReturnValue({
          db: mockCheckInDB,
        });

        const mockResetOnboarding = jest.fn();
        (useOnboardingStore.getState as any).mockReturnValue({
          resetOnboarding: mockResetOnboarding,
        });

        const { clearAllData, addCustomFactor } = useSettingsStore.getState();

        // Add some custom data first
        addCustomFactor("exercise");

        await clearAllData();

        // Verify localStorage was cleared
        expect(localStorage.getItem("settings-storage")).toBeNull();

        // Verify stores were reset
        expect(useLoggingStore.setState).toHaveBeenCalled();
        expect(mockResetOnboarding).toHaveBeenCalled();

        // Verify settings were reset to defaults
        const state = useSettingsStore.getState();
        expect(state.customFactors).toEqual([]);
        expect(state.reminders.enabled).toBe(false);
      });

      it("should handle null databases gracefully", async () => {
        (useLoggingStore.getState as any).mockReturnValue({
          db: null,
        });

        (useCheckInStore.getState as any).mockReturnValue({
          db: null,
        });

        (useOnboardingStore.getState as any).mockReturnValue({
          resetOnboarding: jest.fn(),
        });

        const { clearAllData } = useSettingsStore.getState();

        // Should not throw error
        await expect(clearAllData()).resolves.toBeUndefined();
      });

      it("should handle clearAllData error", async () => {
        const mockLoggingDB = {
          transaction: jest.fn().mockImplementation(() => {
            throw new Error("Transaction error");
          }),
        };

        (useLoggingStore.getState as any).mockReturnValue({
          db: mockLoggingDB,
        });

        const { clearAllData } = useSettingsStore.getState();

        await expect(clearAllData()).rejects.toThrow(
          "Failed to clear all data. Please try again.",
        );
      });
    });

    describe("resetToDefaults", () => {
      it("should reset all settings to defaults", () => {
        const {
          setRemindersEnabled,
          addCustomFactor,
          addCustomHeadacheType,
          setIntensityScale,
          setTheme,
          toggleTrackedFactor,
          resetToDefaults,
        } = useSettingsStore.getState();

        // Make changes
        setRemindersEnabled(true);
        addCustomFactor("exercise");
        addCustomHeadacheType("hormonal");
        setIntensityScale(10);
        setTheme("dark");
        toggleTrackedFactor("sleep");

        // Reset
        resetToDefaults();

        const state = useSettingsStore.getState();

        expect(state.reminders).toEqual({
          enabled: false,
          times: ["09:00", "21:00"],
          days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          style: "gentle",
        });
        expect(state.customFactors).toEqual([]);
        expect(state.customHeadacheTypes).toEqual([]);
        expect(state.intensityScale).toBe(5);
        expect(state.theme).toBe("system");
        expect(state.trackedFactors.sleep).toBe(true);
      });

      it("should apply theme after reset", () => {
        const { setTheme, resetToDefaults } = useSettingsStore.getState();

        setTheme("dark");
        mockDocumentElement.classList.toggle.mockClear();

        resetToDefaults();

        expect(mockDocumentElement.classList.toggle).toHaveBeenCalled();
      });
    });
  });

  describe("state persistence behavior", () => {
    it("should maintain reminder state after updates", () => {
      const { setRemindersEnabled } = useSettingsStore.getState();

      setRemindersEnabled(true);

      // Verify state persists in the store
      const state = useSettingsStore.getState();
      expect(state.reminders.enabled).toBe(true);

      // Verify state remains after multiple operations
      setRemindersEnabled(false);
      expect(useSettingsStore.getState().reminders.enabled).toBe(false);

      setRemindersEnabled(true);
      expect(useSettingsStore.getState().reminders.enabled).toBe(true);
    });

    it("should maintain custom factors across operations", () => {
      const { addCustomFactor, removeCustomFactor } =
        useSettingsStore.getState();

      addCustomFactor("exercise");
      expect(useSettingsStore.getState().customFactors).toContain("exercise");

      addCustomFactor("meditation");
      expect(useSettingsStore.getState().customFactors).toEqual([
        "exercise",
        "meditation",
      ]);

      removeCustomFactor("exercise");
      expect(useSettingsStore.getState().customFactors).toEqual(["meditation"]);
    });

    it("should maintain theme across operations", () => {
      const { setTheme } = useSettingsStore.getState();

      setTheme("dark");
      expect(useSettingsStore.getState().theme).toBe("dark");

      setTheme("light");
      expect(useSettingsStore.getState().theme).toBe("light");

      setTheme("system");
      expect(useSettingsStore.getState().theme).toBe("system");
    });

    it("should maintain state after resetToDefaults", () => {
      const { setRemindersEnabled, addCustomFactor, resetToDefaults } =
        useSettingsStore.getState();

      // Make changes
      setRemindersEnabled(true);
      addCustomFactor("exercise");

      // Reset
      resetToDefaults();

      // Verify defaults are restored
      const state = useSettingsStore.getState();
      expect(state.reminders.enabled).toBe(false);
      expect(state.customFactors).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle rapid reminder toggles", () => {
      const { setRemindersEnabled } = useSettingsStore.getState();

      setRemindersEnabled(true);
      setRemindersEnabled(false);
      setRemindersEnabled(true);
      setRemindersEnabled(false);

      const state = useSettingsStore.getState();
      expect(state.reminders.enabled).toBe(false);
    });

    it("should handle adding same custom factor multiple times", () => {
      const { addCustomFactor } = useSettingsStore.getState();

      addCustomFactor("exercise");
      addCustomFactor("exercise");
      addCustomFactor("exercise");

      const state = useSettingsStore.getState();
      expect(state.customFactors).toEqual(["exercise"]);
    });

    it("should handle removing custom factor that does not exist", () => {
      const { removeCustomFactor } = useSettingsStore.getState();

      removeCustomFactor("nonexistent");

      const state = useSettingsStore.getState();
      expect(state.customFactors).toEqual([]);
    });

    it("should handle empty reminder times array", () => {
      const { setReminderTimes } = useSettingsStore.getState();

      setReminderTimes([]);

      const state = useSettingsStore.getState();
      expect(state.reminders.times).toEqual([]);
    });

    it("should handle empty reminder days array", () => {
      const { setReminderDays } = useSettingsStore.getState();

      setReminderDays([]);

      const state = useSettingsStore.getState();
      expect(state.reminders.days).toEqual([]);
    });
  });
});
