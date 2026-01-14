"use client";

import { useState, useEffect, useCallback } from "react";

export type ServiceWorkerStatus =
  | "unsupported"
  | "installing"
  | "installed"
  | "activating"
  | "activated"
  | "redundant"
  | "error";

interface UseServiceWorkerReturn {
  /** Current service worker status */
  status: ServiceWorkerStatus;
  /** Whether a new version is available */
  updateAvailable: boolean;
  /** Trigger update to new service worker */
  applyUpdate: () => void;
  /** Service worker registration object */
  registration: ServiceWorkerRegistration | null;
  /** Whether the app is running in standalone/installed mode */
  isStandalone: boolean;
  /** Whether service workers are supported */
  isSupported: boolean;
}

/**
 * Hook for monitoring service worker status and updates
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [status, setStatus] = useState<ServiceWorkerStatus>("unsupported");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      setIsSupported(false);
      setStatus("unsupported");
      return;
    }

    setIsSupported(true);

    // Check if running in standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    // Helper functions defined inside useEffect to avoid dependency issues
    const getStatus = (reg: ServiceWorkerRegistration) => {
      const sw = reg.installing || reg.waiting || reg.active;
      if (!sw) return "error" as const;
      return sw.state as ServiceWorkerStatus;
    };

    const setupListener = (reg: ServiceWorkerRegistration) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setUpdateAvailable(true);
          }
        });
      });
      setInterval(() => reg.update(), 60 * 60 * 1000);
    };

    // Get existing registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setRegistration(reg);
        setStatus(getStatus(reg));
        if (reg.waiting) setUpdateAvailable(true);
        setupListener(reg);
      }
    });

    // Listen for controller changes (new SW taking over)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) return;

    // Tell the waiting service worker to take over
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  return {
    status,
    updateAvailable,
    applyUpdate,
    registration,
    isStandalone,
    isSupported,
  };
}

/**
 * Component to show update notification
 */
export function UpdatePrompt({
  onUpdate,
  onDismiss,
}: {
  onUpdate: () => void;
  onDismiss: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onDismiss();
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-labelledby="update-prompt-title"
      aria-describedby="update-prompt-description"
      className="fixed top-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
      onKeyDown={handleKeyDown}
      data-testid="update-prompt"
    >
      <h3
        id="update-prompt-title"
        className="font-semibold text-gray-900 dark:text-gray-100 mb-2"
      >
        Update Available
      </h3>
      <p
        id="update-prompt-description"
        className="text-sm text-gray-600 dark:text-gray-400 mb-3"
      >
        A new version of the app is available. Update now for the latest
        features.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onUpdate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onUpdate();
            }
          }}
          className="flex-1 bg-purple-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          data-testid="update-button"
        >
          Update Now
        </button>
        <button
          onClick={onDismiss}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onDismiss();
            }
          }}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          data-testid="later-button"
        >
          Later
        </button>
      </div>
    </div>
  );
}
