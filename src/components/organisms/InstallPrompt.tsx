"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * InstallPrompt - A2HS (Add to Home Screen) prompt component
 * Shows a custom install prompt for PWA installation
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if prompt was recently dismissed (within 1 hour)
    const dismissedAt = localStorage.getItem("installPromptDismissedAt");
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const wasRecentlyDismissed =
      dismissedAt && Date.now() - parseInt(dismissedAt, 10) < ONE_HOUR_MS;

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Save the event for later
      setDeferredPrompt(e);
      // Show our custom prompt after a delay, unless recently dismissed
      if (!wasRecentlyDismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS instructions if on iOS and not standalone
    if (isIOSDevice && !isInStandaloneMode) {
      // Check if we've shown this before (for iOS, we only show once ever)
      const hasSeenIOSPrompt = localStorage.getItem("hasSeenIOSInstallPrompt");
      if (!hasSeenIOSPrompt) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    await deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      // For iOS, only show once ever
      localStorage.setItem("hasSeenIOSInstallPrompt", "true");
    } else {
      // For other platforms, show again after 1 hour
      localStorage.setItem("installPromptDismissedAt", Date.now().toString());
    }
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleDismiss();
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
      className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300"
      onKeyDown={handleKeyDown}
      data-testid="install-prompt"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4">
        <button
          onClick={handleDismiss}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleDismiss();
            }
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss install prompt"
          data-testid="dismiss-button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-white" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="install-prompt-title"
              className="font-semibold text-gray-900 dark:text-gray-100 mb-1"
            >
              Install Headache Trainer
            </h3>
            <p
              id="install-prompt-description"
              className="text-sm text-gray-600 dark:text-gray-400 mb-3"
            >
              {isIOS
                ? "Tap the share button and select 'Add to Home Screen' for the best experience"
                : "Install our app for quick access and offline use"}
            </p>

            {!isIOS && deferredPrompt && (
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                data-testid="install-button"
              >
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                Install App
              </Button>
            )}

            {isIOS && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 dark:border-gray-600 rounded"
                  aria-hidden="true"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-testid="ios-share-icon"
                  >
                    <path
                      d="M12 2L12 14M12 2L8 6M12 2L16 6M4 14L4 20L20 20L20 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Tap share, then &quot;Add to Home Screen&quot;</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
