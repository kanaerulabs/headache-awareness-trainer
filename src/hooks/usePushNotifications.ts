"use client";

import { useState, useEffect, useCallback } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

interface UsePushNotificationsReturn {
  /** Current permission state */
  permission: NotificationPermission;
  /** Whether push notifications are supported */
  isSupported: boolean;
  /** Whether the user is subscribed to push notifications */
  isSubscribed: boolean;
  /** Request permission from the user */
  requestPermission: () => Promise<boolean>;
  /** Subscribe to push notifications */
  subscribe: () => Promise<boolean>;
  /** Unsubscribe from push notifications */
  unsubscribe: () => Promise<boolean>;
  /** Schedule a local notification */
  scheduleNotification: (title: string, options?: NotificationOptions) => void;
}

/**
 * Hook for managing push notifications in the PWA
 * Handles permission requests, subscription, and local notifications
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission as NotificationPermission);

      // Check if already subscribed
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== "granted") return false;

    try {
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // For now, we're using local notifications only
      // In production, you would get a VAPID key from your server
      // const subscription = await registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: '<your-vapid-public-key>',
      // });

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return false;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  }, [isSupported]);

  const scheduleNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted") return;

      // Use the service worker to show notifications
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: "/icon-192x192.svg",
          badge: "/icon-192x192.svg",
          ...options,
        });
      });
    },
    [isSupported, permission],
  );

  return {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    scheduleNotification,
  };
}

/**
 * Preset notification schedules for check-in reminders
 */
export const REMINDER_PRESETS = {
  morning: { hour: 9, minute: 0 },
  midday: { hour: 12, minute: 0 },
  evening: { hour: 18, minute: 0 },
  custom: null,
} as const;

/**
 * Schedule daily check-in reminder
 * Note: This requires a more complex implementation with service worker
 * For MVP, we'll use a simpler localStorage-based approach
 */
export function scheduleCheckInReminder(
  timePreset: keyof typeof REMINDER_PRESETS,
): void {
  const preset = REMINDER_PRESETS[timePreset];
  if (!preset) return;

  localStorage.setItem("checkInReminderTime", JSON.stringify(preset));
  localStorage.setItem("checkInReminderEnabled", "true");
}

export function cancelCheckInReminder(): void {
  localStorage.removeItem("checkInReminderTime");
  localStorage.setItem("checkInReminderEnabled", "false");
}
