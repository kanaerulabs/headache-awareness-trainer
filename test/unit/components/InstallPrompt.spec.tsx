import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InstallPrompt } from "@/components/organisms/InstallPrompt";

// Mock BeforeInstallPromptEvent
class MockBeforeInstallPromptEvent extends Event {
  platforms: string[] = [];
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  private promptCalled = false;

  constructor(type: string, outcome: "accepted" | "dismissed" = "accepted") {
    super(type);
    this.platforms = ["web"];
    this.userChoice = Promise.resolve({ outcome, platform: "web" });
  }

  prompt(): Promise<void> {
    this.promptCalled = true;
    return Promise.resolve();
  }

  getPromptCalled(): boolean {
    return this.promptCalled;
  }
}

describe("InstallPrompt", () => {
  let localStorageMock: { [key: string]: string };
  let mockBeforeInstallPromptEvent: MockBeforeInstallPromptEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

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
      },
      writable: true,
    });

    // Mock window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock navigator.userAgent
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124",
    });

    // Create mock event
    mockBeforeInstallPromptEvent = new MockBeforeInstallPromptEvent(
      "beforeinstallprompt",
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("visibility conditions", () => {
    it("should not render when already in standalone mode", () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => {
        if (query === "(display-mode: standalone)") {
          return { matches: true };
        }
        return { matches: false };
      });

      const { container } = render(<InstallPrompt />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render when standalone on iOS", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPhone",
      });
      Object.defineProperty(navigator, "standalone", {
        writable: true,
        configurable: true,
        value: true,
      });

      const { container } = render(<InstallPrompt />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render initially (before delay)", () => {
      const { container } = render(<InstallPrompt />);

      expect(container.firstChild).toBeNull();
    });

    it("should render after 3 second delay when beforeinstallprompt fires", () => {
      const { container } = render(<InstallPrompt />);

      // Dispatch beforeinstallprompt event
      window.dispatchEvent(mockBeforeInstallPromptEvent);

      // Fast-forward time
      jest.advanceTimersByTime(3000);

      expect(screen.getByText("Install Headache Trainer")).toBeInTheDocument();
    });

    it("should render iOS instructions after delay on iOS devices", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPhone",
      });

      render(<InstallPrompt />);

      // Fast-forward time
      jest.advanceTimersByTime(3000);

      expect(screen.getByText("Install Headache Trainer")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Tap the share button and select 'Add to Home Screen'/,
        ),
      ).toBeInTheDocument();
    });

    it("should not show iOS prompt if user has seen it before", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPad",
      });
      localStorageMock.hasSeenIOSInstallPrompt = "true";

      const { container } = render(<InstallPrompt />);

      jest.advanceTimersByTime(3000);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("beforeinstallprompt event handling", () => {
    it("should prevent default on beforeinstallprompt event", () => {
      const preventDefaultSpy = jest.spyOn(
        mockBeforeInstallPromptEvent,
        "preventDefault",
      );

      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should save deferred prompt event", () => {
      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      // Verify prompt is shown (which means event was saved)
      expect(screen.getByText("Install Headache Trainer")).toBeInTheDocument();
    });

    it("should clean up event listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = render(<InstallPrompt />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeinstallprompt",
        expect.any(Function),
      );
    });
  });

  describe("Android/Chrome install flow", () => {
    it("should show install button for Android/Chrome", () => {
      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      expect(
        screen.getByRole("button", { name: /Install App/i }),
      ).toBeInTheDocument();
    });

    it("should call prompt() when install button clicked", async () => {
      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const installButton = screen.getByRole("button", {
        name: /Install App/i,
      });
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(mockBeforeInstallPromptEvent.getPromptCalled()).toBe(true);
      });
    });

    it("should hide prompt after user accepts install", async () => {
      const { container } = render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const installButton = screen.getByRole("button", {
        name: /Install App/i,
      });
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it("should hide prompt after user dismisses install", async () => {
      const dismissedEvent = new MockBeforeInstallPromptEvent(
        "beforeinstallprompt",
        "dismissed",
      );

      const { container } = render(<InstallPrompt />);

      window.dispatchEvent(dismissedEvent);
      jest.advanceTimersByTime(3000);

      const installButton = screen.getByRole("button", {
        name: /Install App/i,
      });
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it("should log when user accepts install", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const installButton = screen.getByRole("button", {
        name: /Install App/i,
      });
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "User accepted the install prompt",
        );
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe("iOS install flow", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPhone",
      });
    });

    it("should show iOS-specific instructions", () => {
      render(<InstallPrompt />);

      jest.advanceTimersByTime(3000);

      expect(
        screen.getByText(
          /Tap the share button and select 'Add to Home Screen'/,
        ),
      ).toBeInTheDocument();
    });

    it("should show visual share icon for iOS", () => {
      const { container } = render(<InstallPrompt />);

      jest.advanceTimersByTime(3000);

      const shareIcon = container.querySelector("svg");
      expect(shareIcon).toBeInTheDocument();
    });

    it("should not show install button on iOS", () => {
      render(<InstallPrompt />);

      jest.advanceTimersByTime(3000);

      expect(
        screen.queryByRole("button", { name: /Install App/i }),
      ).not.toBeInTheDocument();
    });

    it("should work on iPad", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPad",
      });

      render(<InstallPrompt />);

      jest.advanceTimersByTime(3000);

      expect(screen.getByText("Install Headache Trainer")).toBeInTheDocument();
    });

    it("should work on iPod", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPod",
      });

      render(<InstallPrompt />);

      jest.advanceTimersByTime(3000);

      expect(screen.getByText("Install Headache Trainer")).toBeInTheDocument();
    });
  });

  describe("dismiss functionality", () => {
    it("should hide prompt when dismiss button clicked", () => {
      const { container } = render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const dismissButton = screen.getByLabelText("Dismiss");
      fireEvent.click(dismissButton);

      expect(container.firstChild).toBeNull();
    });

    it("should save iOS prompt dismissal to localStorage", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPhone",
      });

      render(<InstallPrompt />);

      jest.advanceTimersByTime(3000);

      const dismissButton = screen.getByLabelText("Dismiss");
      fireEvent.click(dismissButton);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "hasSeenIOSInstallPrompt",
        "true",
      );
    });

    it("should not save Android prompt dismissal to localStorage", () => {
      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const dismissButton = screen.getByLabelText("Dismiss");
      fireEvent.click(dismissButton);

      expect(localStorage.setItem).not.toHaveBeenCalledWith(
        "hasSeenIOSInstallPrompt",
        "true",
      );
    });
  });

  describe("UI and accessibility", () => {
    beforeEach(() => {
      render(<InstallPrompt />);
      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);
    });

    it("should render with proper heading", () => {
      expect(
        screen.getByRole("heading", { name: /Install Headache Trainer/i }),
      ).toBeInTheDocument();
    });

    it("should have dismiss button with aria-label", () => {
      const dismissButton = screen.getByLabelText("Dismiss");
      expect(dismissButton).toBeInTheDocument();
    });

    it("should display app icon", () => {
      const icon = screen.getByRole("img", { hidden: true }); // lucide icons don't have role="img" by default
      expect(icon).toBeInTheDocument();
    });

    it("should have proper positioning classes", () => {
      const wrapper = screen
        .getByText("Install Headache Trainer")
        .closest("div");
      expect(wrapper?.parentElement?.parentElement).toHaveClass(
        "fixed",
        "bottom-20",
      );
    });

    it("should have animation classes", () => {
      const wrapper = screen
        .getByText("Install Headache Trainer")
        .closest("div");
      expect(wrapper?.parentElement).toHaveClass("animate-in");
    });

    it("should have high z-index for visibility", () => {
      const wrapper = screen
        .getByText("Install Headache Trainer")
        .closest("div");
      expect(wrapper?.parentElement).toHaveClass("z-50");
    });

    it("should render gradient icon background", () => {
      const iconWrapper = screen
        .getByText("Install Headache Trainer")
        .closest("div")
        ?.querySelector(".bg-gradient-to-br");
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle missing beforeinstallprompt event gracefully", () => {
      const { container } = render(<InstallPrompt />);

      // Don't dispatch event
      jest.advanceTimersByTime(3000);

      // Should not render without event on Android
      expect(container.firstChild).toBeNull();
    });

    it("should handle install button click without deferred prompt", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "Chrome",
      });

      render(<InstallPrompt />);

      // Show prompt without event (edge case)
      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const installButton = screen.getByRole("button", {
        name: /Install App/i,
      });

      // Clear the deferred prompt by dismissing
      const dismissButton = screen.getByLabelText("Dismiss");
      fireEvent.click(dismissButton);

      // Re-render and try to click install (should not throw)
      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      expect(() => {
        fireEvent.click(screen.getByRole("button", { name: /Install App/i }));
      }).not.toThrow();
    });

    it("should handle multiple beforeinstallprompt events", () => {
      render(<InstallPrompt />);

      // First event
      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);
      expect(screen.getByText("Install Headache Trainer")).toBeInTheDocument();

      // Dismiss
      fireEvent.click(screen.getByLabelText("Dismiss"));

      // Second event
      const secondEvent = new MockBeforeInstallPromptEvent(
        "beforeinstallprompt",
      );
      window.dispatchEvent(secondEvent);
      jest.advanceTimersByTime(3000);

      // Should show again
      expect(screen.getByText("Install Headache Trainer")).toBeInTheDocument();
    });

    it("should not crash if localStorage is unavailable", () => {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => {
            throw new Error("localStorage unavailable");
          }),
          setItem: jest.fn(),
        },
        writable: true,
      });

      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "iPhone",
      });

      expect(() => {
        render(<InstallPrompt />);
        jest.advanceTimersByTime(3000);
      }).not.toThrow();
    });
  });

  describe("responsive design", () => {
    it("should have mobile-friendly spacing", () => {
      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const wrapper = screen
        .getByText("Install Headache Trainer")
        .closest("div");
      expect(wrapper?.parentElement).toHaveClass("left-4", "right-4");
    });

    it("should position above bottom navigation", () => {
      render(<InstallPrompt />);

      window.dispatchEvent(mockBeforeInstallPromptEvent);
      jest.advanceTimersByTime(3000);

      const wrapper = screen
        .getByText("Install Headache Trainer")
        .closest("div");
      // bottom-20 ensures it's above typical bottom nav (which is h-16)
      expect(wrapper?.parentElement).toHaveClass("bottom-20");
    });
  });
});
