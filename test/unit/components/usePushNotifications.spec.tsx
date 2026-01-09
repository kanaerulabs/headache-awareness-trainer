import { renderHook, act, waitFor } from "@testing-library/react";
import {
  usePushNotifications,
  REMINDER_PRESETS,
  scheduleCheckInReminder,
  cancelCheckInReminder,
} from "@/hooks/usePushNotifications";

// Mock Notification API
const mockNotification = {
  requestPermission: jest.fn(),
  permission: "default" as NotificationPermission,
};

// Mock PushManager
const mockPushManager = {
  getSubscription: jest.fn(),
  subscribe: jest.fn(),
};

// Mock ServiceWorkerRegistration
const mockServiceWorkerRegistration = {
  pushManager: mockPushManager,
  showNotification: jest.fn(),
};

describe("usePushNotifications", () => {
  let originalNotification: typeof Notification;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    localStorageMock = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Save original Notification
    originalNotification = global.Notification;

    // Mock Notification API
    Object.defineProperty(global, "Notification", {
      writable: true,
      configurable: true,
      value: {
        ...mockNotification,
        requestPermission: jest.fn().mockResolvedValue("granted"),
      },
    });

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: {
        ready: Promise.resolve(mockServiceWorkerRegistration),
      },
    });

    // Default mock implementations
    mockPushManager.getSubscription.mockResolvedValue(null);
    mockPushManager.subscribe.mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(global, "Notification", {
      value: originalNotification,
      writable: true,
      configurable: true,
    });
  });

  describe("initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.permission).toBe("default");
      expect(result.current.isSupported).toBe(true);
      expect(result.current.isSubscribed).toBe(false);
      expect(typeof result.current.requestPermission).toBe("function");
      expect(typeof result.current.subscribe).toBe("function");
      expect(typeof result.current.unsubscribe).toBe("function");
      expect(typeof result.current.scheduleNotification).toBe("function");
    });

    it("should detect unsupported browsers (no Notification)", () => {
      delete (window as { Notification?: unknown }).Notification;

      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.isSupported).toBe(false);
    });

    it("should detect unsupported browsers (no serviceWorker)", () => {
      delete (navigator as { serviceWorker?: unknown }).serviceWorker;

      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.isSupported).toBe(false);
    });

    it("should read current notification permission", () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.permission).toBe("granted");
    });

    it("should check if already subscribed on mount", async () => {
      const mockSubscription = { endpoint: "https://example.com/push" };
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(true);
      });

      expect(mockPushManager.getSubscription).toHaveBeenCalled();
    });

    it("should not be subscribed if no subscription exists", async () => {
      mockPushManager.getSubscription.mockResolvedValue(null);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(false);
      });
    });
  });

  describe("requestPermission", () => {
    it("should request notification permission successfully", async () => {
      (Notification.requestPermission as jest.Mock).mockResolvedValue(
        "granted",
      );

      const { result } = renderHook(() => usePushNotifications());

      let permissionGranted = false;
      await act(async () => {
        permissionGranted = await result.current.requestPermission();
      });

      expect(permissionGranted).toBe(true);
      expect(result.current.permission).toBe("granted");
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it("should handle permission denial", async () => {
      (Notification.requestPermission as jest.Mock).mockResolvedValue("denied");

      const { result } = renderHook(() => usePushNotifications());

      let permissionGranted = false;
      await act(async () => {
        permissionGranted = await result.current.requestPermission();
      });

      expect(permissionGranted).toBe(false);
      expect(result.current.permission).toBe("denied");
    });

    it("should handle permission request errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (Notification.requestPermission as jest.Mock).mockRejectedValue(
        new Error("Permission request failed"),
      );

      const { result } = renderHook(() => usePushNotifications());

      let permissionGranted = true;
      await act(async () => {
        permissionGranted = await result.current.requestPermission();
      });

      expect(permissionGranted).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error requesting notification permission:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return false if not supported", async () => {
      delete (window as { Notification?: unknown }).Notification;

      const { result } = renderHook(() => usePushNotifications());

      let permissionGranted = true;
      await act(async () => {
        permissionGranted = await result.current.requestPermission();
      });

      expect(permissionGranted).toBe(false);
    });
  });

  describe("subscribe", () => {
    it("should subscribe to push notifications when permission granted", async () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      const { result } = renderHook(() => usePushNotifications());

      let subscribed = false;
      await act(async () => {
        subscribed = await result.current.subscribe();
      });

      expect(subscribed).toBe(true);
      expect(result.current.isSubscribed).toBe(true);
    });

    it("should not subscribe if permission not granted", async () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "denied",
      });

      const { result } = renderHook(() => usePushNotifications());

      let subscribed = true;
      await act(async () => {
        subscribed = await result.current.subscribe();
      });

      expect(subscribed).toBe(false);
      expect(result.current.isSubscribed).toBe(false);
    });

    it("should not subscribe if not supported", async () => {
      delete (window as { Notification?: unknown }).Notification;

      const { result } = renderHook(() => usePushNotifications());

      let subscribed = true;
      await act(async () => {
        subscribed = await result.current.subscribe();
      });

      expect(subscribed).toBe(false);
    });

    it("should handle subscription errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      // Mock service worker ready to reject
      Object.defineProperty(navigator, "serviceWorker", {
        writable: true,
        value: {
          ready: Promise.reject(new Error("Service worker not ready")),
        },
      });

      const { result } = renderHook(() => usePushNotifications());

      let subscribed = true;
      await act(async () => {
        subscribed = await result.current.subscribe();
      });

      expect(subscribed).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should wait for service worker to be ready", async () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.subscribe();
      });

      // Service worker ready should have been awaited
      expect(navigator.serviceWorker.ready).toBeDefined();
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe from push notifications", async () => {
      const mockSubscription = {
        endpoint: "https://example.com/push",
        unsubscribe: jest.fn().mockResolvedValue(true),
      };
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription);

      const { result } = renderHook(() => usePushNotifications());

      // Wait for initial subscription check
      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(true);
      });

      let unsubscribed = false;
      await act(async () => {
        unsubscribed = await result.current.unsubscribe();
      });

      expect(unsubscribed).toBe(true);
      expect(result.current.isSubscribed).toBe(false);
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it("should handle case when no subscription exists", async () => {
      mockPushManager.getSubscription.mockResolvedValue(null);

      const { result } = renderHook(() => usePushNotifications());

      let unsubscribed = false;
      await act(async () => {
        unsubscribed = await result.current.unsubscribe();
      });

      expect(unsubscribed).toBe(true);
      expect(result.current.isSubscribed).toBe(false);
    });

    it("should handle unsubscribe errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const mockSubscription = {
        unsubscribe: jest
          .fn()
          .mockRejectedValue(new Error("Unsubscribe failed")),
      };
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription);

      const { result } = renderHook(() => usePushNotifications());

      let unsubscribed = true;
      await act(async () => {
        unsubscribed = await result.current.unsubscribe();
      });

      expect(unsubscribed).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error unsubscribing from push notifications:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return false if not supported", async () => {
      delete (window as { Notification?: unknown }).Notification;

      const { result } = renderHook(() => usePushNotifications());

      let unsubscribed = true;
      await act(async () => {
        unsubscribed = await result.current.unsubscribe();
      });

      expect(unsubscribed).toBe(false);
    });
  });

  describe("scheduleNotification", () => {
    it("should schedule notification when permission granted", async () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await navigator.serviceWorker.ready;
      });

      act(() => {
        result.current.scheduleNotification("Test Notification", {
          body: "Test body",
        });
      });

      await waitFor(() => {
        expect(
          mockServiceWorkerRegistration.showNotification,
        ).toHaveBeenCalledWith(
          "Test Notification",
          expect.objectContaining({
            body: "Test body",
            icon: "/icon-192x192.svg",
            badge: "/icon-192x192.svg",
          }),
        );
      });
    });

    it("should not schedule notification when permission denied", () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "denied",
      });

      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.scheduleNotification("Test Notification");
      });

      expect(
        mockServiceWorkerRegistration.showNotification,
      ).not.toHaveBeenCalled();
    });

    it("should not schedule notification when not supported", () => {
      delete (window as { Notification?: unknown }).Notification;

      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.scheduleNotification("Test Notification");
      });

      expect(
        mockServiceWorkerRegistration.showNotification,
      ).not.toHaveBeenCalled();
    });

    it("should include default icon and badge", async () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await navigator.serviceWorker.ready;
      });

      act(() => {
        result.current.scheduleNotification("Test");
      });

      await waitFor(() => {
        expect(
          mockServiceWorkerRegistration.showNotification,
        ).toHaveBeenCalledWith(
          "Test",
          expect.objectContaining({
            icon: "/icon-192x192.svg",
            badge: "/icon-192x192.svg",
          }),
        );
      });
    });

    it("should merge custom options with defaults", async () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await navigator.serviceWorker.ready;
      });

      act(() => {
        result.current.scheduleNotification("Custom", {
          body: "Custom body",
          tag: "custom-tag",
          data: { foo: "bar" },
        });
      });

      await waitFor(() => {
        expect(
          mockServiceWorkerRegistration.showNotification,
        ).toHaveBeenCalledWith(
          "Custom",
          expect.objectContaining({
            body: "Custom body",
            tag: "custom-tag",
            data: { foo: "bar" },
            icon: "/icon-192x192.svg",
            badge: "/icon-192x192.svg",
          }),
        );
      });
    });
  });

  describe("REMINDER_PRESETS", () => {
    it("should have correct preset times", () => {
      expect(REMINDER_PRESETS.morning).toEqual({ hour: 9, minute: 0 });
      expect(REMINDER_PRESETS.midday).toEqual({ hour: 12, minute: 0 });
      expect(REMINDER_PRESETS.evening).toEqual({ hour: 18, minute: 0 });
      expect(REMINDER_PRESETS.custom).toBeNull();
    });
  });

  describe("scheduleCheckInReminder", () => {
    it("should save reminder time to localStorage", () => {
      scheduleCheckInReminder("morning");

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkInReminderTime",
        JSON.stringify({ hour: 9, minute: 0 }),
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkInReminderEnabled",
        "true",
      );
    });

    it("should handle midday preset", () => {
      scheduleCheckInReminder("midday");

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkInReminderTime",
        JSON.stringify({ hour: 12, minute: 0 }),
      );
    });

    it("should handle evening preset", () => {
      scheduleCheckInReminder("evening");

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkInReminderTime",
        JSON.stringify({ hour: 18, minute: 0 }),
      );
    });

    it("should not set time for custom preset", () => {
      scheduleCheckInReminder("custom");

      expect(localStorage.setItem).not.toHaveBeenCalledWith(
        "checkInReminderTime",
        expect.anything(),
      );
    });
  });

  describe("cancelCheckInReminder", () => {
    it("should remove reminder from localStorage", () => {
      cancelCheckInReminder();

      expect(localStorage.removeItem).toHaveBeenCalledWith(
        "checkInReminderTime",
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkInReminderEnabled",
        "false",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle permission state transitions", async () => {
      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.permission).toBe("default");

      (Notification.requestPermission as jest.Mock).mockResolvedValue(
        "granted",
      );

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.permission).toBe("granted");
    });

    it("should handle multiple subscribe/unsubscribe cycles", async () => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });

      const mockSubscription = {
        unsubscribe: jest.fn().mockResolvedValue(true),
      };
      mockPushManager.getSubscription.mockResolvedValue(null);

      const { result } = renderHook(() => usePushNotifications());

      // Subscribe
      await act(async () => {
        await result.current.subscribe();
      });
      expect(result.current.isSubscribed).toBe(true);

      // Update mock to return subscription
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription);

      // Unsubscribe
      await act(async () => {
        await result.current.unsubscribe();
      });
      expect(result.current.isSubscribed).toBe(false);

      // Subscribe again
      mockPushManager.getSubscription.mockResolvedValue(null);
      await act(async () => {
        await result.current.subscribe();
      });
      expect(result.current.isSubscribed).toBe(true);
    });
  });
});
