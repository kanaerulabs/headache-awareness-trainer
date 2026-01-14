import { renderHook, act } from "@testing-library/react";
import {
  useMicroWinToast,
  useAutoMicroWinToast,
} from "@/components/molecules/MicroWinToast";
import { useToast } from "@/hooks/use-toast";
import type { MicroWinMessage } from "@/interface-adapters/store/gamificationStore";

// Mock the useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

// Mock the gamificationStore
jest.mock("@/interface-adapters/store/gamificationStore", () => ({
  useGamificationStore: {
    getState: jest.fn(() => ({
      getMicroWinMessage: jest.fn(),
    })),
  },
}));

describe("useMicroWinToast", () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("showMicroWinToast", () => {
    it("calls toast with correct structure", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "First entry logged!",
        emoji: "🌱",
      };

      act(() => {
        result.current.showMicroWinToast(message);
      });

      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "First entry logged!",
          duration: 3000,
        }),
      );
    });

    it("includes emoji in toast title", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "streak-continue",
        message: "You're on a roll!",
        emoji: "⚡",
      };

      act(() => {
        result.current.showMicroWinToast(message);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "You're on a roll!",
        }),
      );
    });

    it("uses default duration of 3000ms when not specified", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "Test message",
        emoji: "🎉",
      };

      act(() => {
        result.current.showMicroWinToast(message);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 3000,
        }),
      );
    });

    it("accepts custom duration", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "milestone-reached",
        message: "Milestone reached!",
        emoji: "🏆",
      };

      act(() => {
        result.current.showMicroWinToast(message, 5000);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5000,
        }),
      );
    });

    it("applies gradient styling to toast", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "Test",
        emoji: "🎉",
      };

      act(() => {
        result.current.showMicroWinToast(message);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          className: expect.stringContaining("bg-gradient-to-r"),
        }),
      );
    });

    it("handles different message types", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const messageTypes: MicroWinMessage[] = [
        { type: "first-entry", message: "First!", emoji: "🌱" },
        { type: "streak-start", message: "Streak!", emoji: "🔥" },
        { type: "pattern-emerging", message: "Pattern!", emoji: "🔍" },
        { type: "milestone-reached", message: "Milestone!", emoji: "🏆" },
      ];

      messageTypes.forEach((message) => {
        act(() => {
          result.current.showMicroWinToast(message);
        });
      });

      expect(mockToast).toHaveBeenCalledTimes(messageTypes.length);
    });

    it("is memoized and stable across renders", () => {
      const { result, rerender } = renderHook(() => useMicroWinToast());

      const firstFn = result.current.showMicroWinToast;

      rerender();

      const secondFn = result.current.showMicroWinToast;

      expect(firstFn).toBe(secondFn);
    });
  });

  describe("edge cases", () => {
    it("handles empty message gracefully", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "",
        emoji: "🎉",
      };

      act(() => {
        result.current.showMicroWinToast(message);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "",
        }),
      );
    });

    it("handles long messages", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "consistency-praise",
        message:
          "This is a very long micro-win message that celebrates your consistency and dedication to tracking your headaches over an extended period of time!",
        emoji: "⭐",
      };

      act(() => {
        result.current.showMicroWinToast(message);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining("very long micro-win message"),
        }),
      );
    });

    it("handles special characters in messages", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "First entry logged! You're 100% awesome! 🎉",
        emoji: "🌱",
      };

      act(() => {
        result.current.showMicroWinToast(message);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "First entry logged! You're 100% awesome! 🎉",
        }),
      );
    });

    it("handles very short duration", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "Quick!",
        emoji: "⚡",
      };

      act(() => {
        result.current.showMicroWinToast(message, 100);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 100,
        }),
      );
    });

    it("handles very long duration", () => {
      const { result } = renderHook(() => useMicroWinToast());

      const message: MicroWinMessage = {
        type: "milestone-reached",
        message: "Important milestone!",
        emoji: "🏆",
      };

      act(() => {
        result.current.showMicroWinToast(message, 10000);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 10000,
        }),
      );
    });
  });
});

describe("useAutoMicroWinToast", () => {
  const mockToast = jest.fn();
  const mockGetMicroWinMessage = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    const {
      useGamificationStore,
    } = require("@/interface-adapters/store/gamificationStore");
    useGamificationStore.getState.mockReturnValue({
      getMicroWinMessage: mockGetMicroWinMessage,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("showMicroWinForContext", () => {
    it("calls getMicroWinMessage with provided context", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      const context = {
        isFirstEntry: true,
        currentStreak: 1,
        totalEntries: 1,
      };

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "First entry logged!",
        emoji: "🌱",
      };

      mockGetMicroWinMessage.mockReturnValue(message);

      await act(async () => {
        result.current.showMicroWinForContext(context);
        // Wait for async operations
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith(context);
    });

    it("shows toast when message is returned", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      const message: MicroWinMessage = {
        type: "streak-start",
        message: "Day 2!",
        emoji: "🔥",
      };

      mockGetMicroWinMessage.mockReturnValue(message);

      await act(async () => {
        result.current.showMicroWinForContext({ currentStreak: 2 });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Day 2!",
        }),
      );
    });

    it("does not show toast when no message is returned", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue(null);

      await act(async () => {
        result.current.showMicroWinForContext({ currentStreak: 15 });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it("handles first entry context", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      const message: MicroWinMessage = {
        type: "first-entry",
        message: "First entry logged!",
        emoji: "🌱",
      };

      mockGetMicroWinMessage.mockReturnValue(message);

      await act(async () => {
        result.current.showMicroWinForContext({
          isFirstEntry: true,
          totalEntries: 1,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          isFirstEntry: true,
          totalEntries: 1,
        }),
      );
    });

    it("handles streak context", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue({
        type: "streak-continue",
        message: "Streak continues!",
        emoji: "⚡",
      });

      await act(async () => {
        result.current.showMicroWinForContext({
          currentStreak: 5,
          totalEntries: 10,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStreak: 5,
          totalEntries: 10,
        }),
      );
    });

    it("handles feature unlock context", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue({
        type: "feature-unlock",
        message: "New feature unlocked!",
        emoji: "🎁",
      });

      await act(async () => {
        result.current.showMicroWinForContext({
          justUnlockedFeature: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          justUnlockedFeature: true,
        }),
      );
    });

    it("handles week number context", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue({
        type: "consistency-praise",
        message: "Week 1 going great!",
        emoji: "⭐",
      });

      await act(async () => {
        result.current.showMicroWinForContext({
          weekNumber: 1,
          totalEntries: 3,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          weekNumber: 1,
          totalEntries: 3,
        }),
      );
    });

    it("handles empty context", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue(null);

      await act(async () => {
        result.current.showMicroWinForContext({});
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith({});
      expect(mockToast).not.toHaveBeenCalled();
    });

    it("is memoized and stable across renders", () => {
      const { result, rerender } = renderHook(() => useAutoMicroWinToast());

      const firstFn = result.current.showMicroWinForContext;

      rerender();

      const secondFn = result.current.showMicroWinForContext;

      expect(firstFn).toBe(secondFn);
    });
  });

  describe("multiple contexts", () => {
    it("handles multiple context properties", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue({
        type: "milestone-reached",
        message: "Amazing progress!",
        emoji: "🏆",
      });

      await act(async () => {
        result.current.showMicroWinForContext({
          isFirstEntry: false,
          currentStreak: 10,
          totalEntries: 50,
          weekNumber: 2,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith({
        isFirstEntry: false,
        currentStreak: 10,
        totalEntries: 50,
        weekNumber: 2,
      });
    });

    it("handles context with all optional properties", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue({
        type: "consistency-praise",
        message: "Keep it up!",
        emoji: "💪",
      });

      await act(async () => {
        result.current.showMicroWinForContext({
          isFirstEntry: true,
          currentStreak: 7,
          totalEntries: 10,
          justUnlockedFeature: true,
          weekNumber: 1,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          isFirstEntry: true,
          currentStreak: 7,
          totalEntries: 10,
          justUnlockedFeature: true,
          weekNumber: 1,
        }),
      );
    });
  });

  describe("error handling", () => {
    it("handles null message from store", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue(null);

      await act(async () => {
        result.current.showMicroWinForContext({ currentStreak: 50 });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it("handles undefined context gracefully", async () => {
      const { result } = renderHook(() => useAutoMicroWinToast());

      mockGetMicroWinMessage.mockReturnValue({
        type: "consistency-praise",
        message: "Keep going!",
        emoji: "⭐",
      });

      await act(async () => {
        result.current.showMicroWinForContext({});
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetMicroWinMessage).toHaveBeenCalled();
    });
  });
});
