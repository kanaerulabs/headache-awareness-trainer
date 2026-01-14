import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useBackgroundSync,
  registerBackgroundSync,
} from "@/interface-adapters/hooks/useBackgroundSync";
import * as indexeddb from "@/lib/indexeddb";

// Mock IndexedDB operations
jest.mock("@/lib/indexeddb", () => ({
  getSyncQueue: jest.fn(),
  removeFromSyncQueue: jest.fn(),
  incrementRetryCount: jest.fn(),
}));

// Mock service worker APIs
const mockServiceWorkerRegistration = {
  sync: {
    register: jest.fn(),
  },
};

describe("useBackgroundSync", () => {
  const mockSyncQueue = [
    {
      id: "1",
      type: "log" as const,
      action: "create" as const,
      data: { intensity: 5 },
      createdAt: new Date(),
      retryCount: 0,
    },
    {
      id: "2",
      type: "checkin" as const,
      action: "update" as const,
      data: { mood: 7 },
      createdAt: new Date(),
      retryCount: 1,
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });

    // Mock SyncManager
    Object.defineProperty(window, "SyncManager", {
      writable: true,
      value: {},
    });

    // Mock service worker in navigator
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      value: {
        ready: Promise.resolve(mockServiceWorkerRegistration),
      },
    });

    // Default mock implementations
    (indexeddb.getSyncQueue as jest.Mock).mockResolvedValue(mockSyncQueue);
    (indexeddb.removeFromSyncQueue as jest.Mock).mockResolvedValue(undefined);
    (indexeddb.incrementRetryCount as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useBackgroundSync());

      expect(result.current.pendingCount).toBe(0);
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.isSupported).toBe(true);
      expect(result.current.lastSyncAt).toBeNull();
      expect(typeof result.current.triggerSync).toBe("function");
    });

    it("should detect if background sync is not supported", () => {
      // Remove SyncManager to simulate unsupported browser
      delete (window as { SyncManager?: unknown }).SyncManager;

      const { result } = renderHook(() => useBackgroundSync());

      expect(result.current.isSupported).toBe(false);
    });

    it("should load pending count on mount", async () => {
      const { result } = renderHook(() => useBackgroundSync());

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(2);
      });

      expect(indexeddb.getSyncQueue).toHaveBeenCalledTimes(1);
    });

    it("should handle error when loading sync queue fails", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (indexeddb.getSyncQueue as jest.Mock).mockRejectedValueOnce(
        new Error("Database error"),
      );

      renderHook(() => useBackgroundSync());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("online/offline handling", () => {
    it("should listen for online events", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      renderHook(() => useBackgroundSync());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "online",
        expect.any(Function),
      );
    });

    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useBackgroundSync());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "online",
        expect.any(Function),
      );
    });
  });

  describe("triggerSync", () => {
    it("should sync all pending items successfully", async () => {
      const { result } = renderHook(() => useBackgroundSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(result.current.isSyncing).toBe(false);
      expect(indexeddb.getSyncQueue).toHaveBeenCalled();
      expect(indexeddb.removeFromSyncQueue).toHaveBeenCalledWith("1");
      expect(indexeddb.removeFromSyncQueue).toHaveBeenCalledWith("2");
      expect(result.current.lastSyncAt).toBeInstanceOf(Date);
    });

    it("should not sync when already syncing", async () => {
      const { result } = renderHook(() => useBackgroundSync());

      // Start first sync
      const firstSync = act(async () => {
        await result.current.triggerSync();
      });

      // Try to start second sync immediately
      await act(async () => {
        await result.current.triggerSync();
      });

      await firstSync;

      // getSyncQueue should only be called once (for the first sync)
      // Plus once on mount
      expect(indexeddb.getSyncQueue).toHaveBeenCalledTimes(2);
    });

    it("should not sync when offline", async () => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useBackgroundSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      // Only called once on mount, not during triggerSync
      expect(indexeddb.getSyncQueue).toHaveBeenCalledTimes(1);
    });

    it("should increment retry count on sync failure", async () => {
      const failingItem = {
        id: "3",
        type: "log" as const,
        action: "create" as const,
        data: { intensity: 5 },
        createdAt: new Date(),
        retryCount: 0,
      };

      (indexeddb.getSyncQueue as jest.Mock).mockResolvedValue([failingItem]);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useBackgroundSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(indexeddb.incrementRetryCount).toHaveBeenCalledWith("3");
      expect(indexeddb.removeFromSyncQueue).not.toHaveBeenCalledWith("3");

      consoleErrorSpy.mockRestore();
    });

    it("should remove item after max retries", async () => {
      const maxRetriedItem = {
        id: "4",
        type: "log" as const,
        action: "create" as const,
        data: { intensity: 5 },
        createdAt: new Date(),
        retryCount: 3, // MAX_RETRIES
      };

      (indexeddb.getSyncQueue as jest.Mock).mockResolvedValue([maxRetriedItem]);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      const { result } = renderHook(() => useBackgroundSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(indexeddb.removeFromSyncQueue).toHaveBeenCalledWith("4");
      expect(indexeddb.incrementRetryCount).not.toHaveBeenCalledWith("4");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Removed item 4 after 3 failed attempts"),
      );

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it("should update pending count after sync", async () => {
      (indexeddb.getSyncQueue as jest.Mock)
        .mockResolvedValueOnce(mockSyncQueue) // Initial load
        .mockResolvedValueOnce(mockSyncQueue) // During sync
        .mockResolvedValueOnce([]); // After sync

      const { result } = renderHook(() => useBackgroundSync());

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(2);
      });

      await act(async () => {
        await result.current.triggerSync();
      });

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(0);
      });
    });

    it("should set isSyncing to true during sync", async () => {
      const { result } = renderHook(() => useBackgroundSync());

      let isSyncingDuringExecution = false;

      await act(async () => {
        const syncPromise = result.current.triggerSync();
        // Check if isSyncing is true during execution
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (result.current.isSyncing) {
          isSyncingDuringExecution = true;
        }
        await syncPromise;
      });

      expect(isSyncingDuringExecution).toBe(true);
      expect(result.current.isSyncing).toBe(false);
    });

    it("should process multiple items in sequence", async () => {
      const { result } = renderHook(() => useBackgroundSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(indexeddb.removeFromSyncQueue).toHaveBeenCalledTimes(2);
      expect(indexeddb.removeFromSyncQueue).toHaveBeenNthCalledWith(1, "1");
      expect(indexeddb.removeFromSyncQueue).toHaveBeenNthCalledWith(2, "2");
    });
  });

  describe("registerBackgroundSync", () => {
    it("should register background sync with default tag", async () => {
      const result = await registerBackgroundSync();

      expect(result).toBe(true);
      expect(mockServiceWorkerRegistration.sync.register).toHaveBeenCalledWith(
        "headache-sync",
      );
    });

    it("should register background sync with custom tag", async () => {
      const result = await registerBackgroundSync("custom-sync");

      expect(result).toBe(true);
      expect(mockServiceWorkerRegistration.sync.register).toHaveBeenCalledWith(
        "custom-sync",
      );
    });

    it("should return false if service worker not supported", async () => {
      delete (navigator as { serviceWorker?: unknown }).serviceWorker;

      const result = await registerBackgroundSync();

      expect(result).toBe(false);
    });

    it("should return false if SyncManager not supported", async () => {
      delete (window as { SyncManager?: unknown }).SyncManager;

      const result = await registerBackgroundSync();

      expect(result).toBe(false);
    });

    it("should handle registration errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockServiceWorkerRegistration.sync.register.mockRejectedValueOnce(
        new Error("Registration failed"),
      );

      const result = await registerBackgroundSync();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Background sync registration failed:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle empty sync queue", async () => {
      (indexeddb.getSyncQueue as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useBackgroundSync());

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(0);
      });

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(indexeddb.removeFromSyncQueue).not.toHaveBeenCalled();
      expect(result.current.lastSyncAt).toBeInstanceOf(Date);
    });

    it("should handle sync queue with mixed success and failure", async () => {
      const mixedQueue = [
        mockSyncQueue[0], // Will succeed (retryCount < 3)
        {
          ...mockSyncQueue[1],
          retryCount: 3, // Will be removed (max retries)
        },
      ];

      (indexeddb.getSyncQueue as jest.Mock).mockResolvedValue(mixedQueue);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      const { result } = renderHook(() => useBackgroundSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      // Both items should be removed (one succeeded, one hit max retries)
      expect(indexeddb.removeFromSyncQueue).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });
});
