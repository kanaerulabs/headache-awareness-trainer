import { renderHook, act, waitFor } from "@testing-library/react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useServiceWorker, UpdatePrompt } from "@/interface-adapters/hooks/useServiceWorker";

// Mock service worker APIs
const mockServiceWorkerRegistration = {
  installing: null as ServiceWorker | null,
  waiting: null as ServiceWorker | null,
  active: {
    state: "activated",
  } as ServiceWorker,
  addEventListener: jest.fn(),
  update: jest.fn(),
};

const mockServiceWorker = {
  state: "activated" as ServiceWorkerState,
  addEventListener: jest.fn(),
  postMessage: jest.fn(),
} as unknown as ServiceWorker;

describe("useServiceWorker", () => {
  let originalNavigator: typeof navigator;

  beforeEach(() => {
    jest.clearAllMocks();

    // Save original navigator
    originalNavigator = global.navigator;

    // Mock navigator.serviceWorker
    Object.defineProperty(global.navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: {
        getRegistration: jest.fn(),
        addEventListener: jest.fn(),
        controller: null,
      },
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

    // Mock setInterval
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: originalNavigator.serviceWorker,
      writable: true,
      configurable: true,
    });
  });

  describe("initialization", () => {
    it("should initialize with correct default values when supported", () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        null,
      );

      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.status).toBe("unsupported");
      expect(result.current.updateAvailable).toBe(false);
      expect(result.current.registration).toBeNull();
      expect(result.current.isSupported).toBe(true);
      expect(result.current.isStandalone).toBe(false);
      expect(typeof result.current.applyUpdate).toBe("function");
    });

    it("should detect unsupported browsers", () => {
      delete (navigator as { serviceWorker?: unknown }).serviceWorker;

      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.status).toBe("unsupported");
      expect(result.current.isSupported).toBe(false);
    });

    it("should detect standalone mode (PWA installed)", () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => {
        if (query === "(display-mode: standalone)") {
          return { matches: true };
        }
        return { matches: false };
      });

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        null,
      );

      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.isStandalone).toBe(true);
    });

    it("should detect standalone mode on iOS", () => {
      Object.defineProperty(navigator, "standalone", {
        writable: true,
        configurable: true,
        value: true,
      });

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        null,
      );

      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.isStandalone).toBe(true);
    });
  });

  describe("service worker status tracking", () => {
    it("should get status from active service worker", async () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue({
        ...mockServiceWorkerRegistration,
        active: { state: "activated" },
      });

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.status).toBe("activated");
      });
    });

    it("should get status from installing service worker", async () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue({
        ...mockServiceWorkerRegistration,
        installing: { state: "installing" },
        active: null,
      });

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.status).toBe("installing");
      });
    });

    it("should get status from waiting service worker", async () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue({
        ...mockServiceWorkerRegistration,
        waiting: { state: "installed" },
        installing: null,
        active: null,
      });

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.status).toBe("installed");
      });
    });

    it("should return error status when no worker present", async () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue({
        ...mockServiceWorkerRegistration,
        installing: null,
        waiting: null,
        active: null,
      });

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.status).toBe("error");
      });
    });

    it("should store registration object", async () => {
      const mockReg = {
        ...mockServiceWorkerRegistration,
        active: { state: "activated" },
      };

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        mockReg,
      );

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.registration).toEqual(mockReg);
      });
    });
  });

  describe("update detection", () => {
    it("should detect update when waiting worker exists", async () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue({
        ...mockServiceWorkerRegistration,
        waiting: { state: "installed" },
      });

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.updateAvailable).toBe(true);
      });
    });

    it("should set up updatefound listener", async () => {
      const mockReg = {
        ...mockServiceWorkerRegistration,
        addEventListener: jest.fn(),
      };

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        mockReg,
      );

      renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(mockReg.addEventListener).toHaveBeenCalledWith(
          "updatefound",
          expect.any(Function),
        );
      });
    });

    it("should detect update when new worker installed with controller present", async () => {
      const mockNewWorker = {
        state: "installing",
        addEventListener: jest.fn(),
      } as unknown as ServiceWorker;

      const mockReg = {
        ...mockServiceWorkerRegistration,
        installing: mockNewWorker,
        addEventListener: jest.fn((event, handler) => {
          if (event === "updatefound") {
            // Simulate updatefound event
            setTimeout(() => handler(), 0);
          }
        }),
      };

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        mockReg,
      );
      Object.defineProperty(navigator.serviceWorker, "controller", {
        writable: true,
        value: mockServiceWorker,
      });

      const { result } = renderHook(() => useServiceWorker());

      // Get the statechange handler
      await waitFor(() => {
        expect(mockNewWorker.addEventListener).toHaveBeenCalled();
      });

      // Simulate state change to installed
      const stateChangeHandler = (
        mockNewWorker.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "statechange")?.[1];

      if (stateChangeHandler) {
        (mockNewWorker as { state: string }).state = "installed";
        act(() => {
          stateChangeHandler();
        });

        await waitFor(() => {
          expect(result.current.updateAvailable).toBe(true);
        });
      }
    });

    it("should set up periodic update check", async () => {
      const mockReg = {
        ...mockServiceWorkerRegistration,
        update: jest.fn(),
        addEventListener: jest.fn(),
      };

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        mockReg,
      );

      renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(mockReg.addEventListener).toHaveBeenCalled();
      });

      // Fast-forward 1 hour
      act(() => {
        jest.advanceTimersByTime(60 * 60 * 1000);
      });

      expect(mockReg.update).toHaveBeenCalled();
    });
  });

  describe("applyUpdate", () => {
    it("should post SKIP_WAITING message to waiting worker", async () => {
      const mockWaitingWorker = {
        state: "installed",
        postMessage: jest.fn(),
      } as unknown as ServiceWorker;

      const mockReg = {
        ...mockServiceWorkerRegistration,
        waiting: mockWaitingWorker,
      };

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        mockReg,
      );

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.registration).toBeTruthy();
      });

      act(() => {
        result.current.applyUpdate();
      });

      expect(mockWaitingWorker.postMessage).toHaveBeenCalledWith({
        type: "SKIP_WAITING",
      });
    });

    it("should do nothing if no waiting worker", async () => {
      const mockReg = {
        ...mockServiceWorkerRegistration,
        waiting: null,
      };

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        mockReg,
      );

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.registration).toBeTruthy();
      });

      // Should not throw
      act(() => {
        result.current.applyUpdate();
      });
    });

    it("should do nothing if no registration", () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        null,
      );

      const { result } = renderHook(() => useServiceWorker());

      // Should not throw
      act(() => {
        result.current.applyUpdate();
      });
    });
  });

  describe("controller change handling", () => {
    it("should reload page on controller change", async () => {
      const mockReload = jest.fn();
      Object.defineProperty(window, "location", {
        writable: true,
        value: { reload: mockReload },
      });

      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        mockServiceWorkerRegistration,
      );

      renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(navigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
          "controllerchange",
          expect.any(Function),
        );
      });

      // Get the controllerchange handler
      const controllerChangeHandler = (
        navigator.serviceWorker.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "controllerchange")?.[1];

      // Simulate controller change
      if (controllerChangeHandler) {
        act(() => {
          controllerChangeHandler();
        });

        expect(mockReload).toHaveBeenCalled();
      }
    });
  });

  describe("edge cases", () => {
    it("should handle null registration gracefully", async () => {
      (navigator.serviceWorker.getRegistration as jest.Mock).mockResolvedValue(
        null,
      );

      const { result } = renderHook(() => useServiceWorker());

      await waitFor(() => {
        expect(result.current.registration).toBeNull();
      });

      expect(result.current.status).toBe("unsupported");
      expect(result.current.updateAvailable).toBe(false);
    });

    it("should handle registration promise rejection", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (navigator.serviceWorker.getRegistration as jest.Mock).mockRejectedValue(
        new Error("Registration error"),
      );

      renderHook(() => useServiceWorker());

      // Wait for potential error handling
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      consoleErrorSpy.mockRestore();
    });
  });
});

describe("UpdatePrompt", () => {
  it("should render update notification", () => {
    const onUpdate = jest.fn();
    const onDismiss = jest.fn();

    render(<UpdatePrompt onUpdate={onUpdate} onDismiss={onDismiss} />);

    expect(screen.getByText("Update Available")).toBeInTheDocument();
    expect(
      screen.getByText(/A new version of the app is available/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Update Now/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Later/i })).toBeInTheDocument();
  });

  it("should call onUpdate when Update Now is clicked", () => {
    const onUpdate = jest.fn();
    const onDismiss = jest.fn();

    render(<UpdatePrompt onUpdate={onUpdate} onDismiss={onDismiss} />);

    const updateButton = screen.getByRole("button", { name: /Update Now/i });
    fireEvent.click(updateButton);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("should call onDismiss when Later is clicked", () => {
    const onUpdate = jest.fn();
    const onDismiss = jest.fn();

    render(<UpdatePrompt onUpdate={onUpdate} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole("button", { name: /Later/i });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("should have proper styling classes", () => {
    const onUpdate = jest.fn();
    const onDismiss = jest.fn();

    const { container } = render(
      <UpdatePrompt onUpdate={onUpdate} onDismiss={onDismiss} />,
    );

    const wrapper = container.querySelector(".fixed.top-4");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("z-50", "bg-white", "rounded-lg", "shadow-lg");
  });

  it("should render with accessible structure", () => {
    const onUpdate = jest.fn();
    const onDismiss = jest.fn();

    render(<UpdatePrompt onUpdate={onUpdate} onDismiss={onDismiss} />);

    const updateButton = screen.getByRole("button", { name: /Update Now/i });
    const dismissButton = screen.getByRole("button", { name: /Later/i });

    expect(updateButton).toBeEnabled();
    expect(dismissButton).toBeEnabled();
  });
});
