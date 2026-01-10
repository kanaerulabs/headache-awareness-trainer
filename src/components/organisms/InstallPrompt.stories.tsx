import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InstallPrompt } from "./InstallPrompt";
import { useEffect } from "react";

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const meta: Meta<typeof InstallPrompt> = {
  title: "PWA/InstallPrompt",
  component: InstallPrompt,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
InstallPrompt is a custom A2HS (Add to Home Screen) prompt component that provides a better user experience than the default browser prompt.

## Features
- Detects Android/Chrome install capability
- Shows iOS-specific instructions
- Hides when app is already installed (standalone mode)
- Accessible with ARIA labels and keyboard navigation
- Dismissible with localStorage persistence for iOS

## States
- **Android/Chrome**: Shows install button that triggers native prompt
- **iOS**: Shows instructions for manual installation via Share menu
- **Standalone**: Hidden when app is already installed
- **Dismissed**: Can be dismissed permanently (iOS remembers via localStorage)

## Accessibility
- ARIA role="dialog" for screen readers
- Keyboard support (Escape to dismiss)
- Focus management
- Descriptive labels for all interactive elements
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
          {
            id: "button-name",
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold mb-2">Sample App Content</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The install prompt appears at the bottom of the screen. Scroll
              down to see it.
            </p>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InstallPrompt>;

/**
 * Android/Chrome install prompt with native install button.
 * This is shown when the beforeinstallprompt event is available.
 */
export const AndroidPrompt: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Mock the beforeinstallprompt event for Android/Chrome
        const mockEvent = {
          preventDefault: () => {},
          prompt: async () => {},
          userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
          platforms: ["web"],
        } as BeforeInstallPromptEvent;

        // Trigger the event after a short delay
        const timer = setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("beforeinstallprompt", {
              detail: mockEvent,
            }) as Event,
          );
        }, 500);

        return () => clearTimeout(timer);
      }, []);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Shows the Android/Chrome variant with an install button. The button triggers the native browser install prompt.

**User Experience:**
1. Prompt appears 3 seconds after page load
2. User can click "Install App" to trigger native prompt
3. User can dismiss with X button (won't show again this session)
        `,
      },
    },
  },
};

/**
 * iOS install instructions.
 * Shows manual installation steps since iOS doesn't support programmatic install.
 */
export const IOSInstructions: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Mock iOS user agent
        Object.defineProperty(window.navigator, "userAgent", {
          value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
          configurable: true,
        });

        // Mock display-mode to NOT be standalone
        Object.defineProperty(window, "matchMedia", {
          value: (query: string) => ({
            matches: query === "(display-mode: standalone)" ? false : true,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
          }),
          configurable: true,
        });

        // Clear the localStorage flag to show prompt
        localStorage.removeItem("hasSeenIOSInstallPrompt");

        // Trigger a re-render
        window.dispatchEvent(new Event("resize"));
      }, []);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Shows the iOS variant with manual installation instructions. Since iOS doesn't support the beforeinstallprompt event, we provide clear visual instructions.

**User Experience:**
1. Prompt appears 3 seconds after page load (if not previously dismissed)
2. Shows share icon and instructions
3. Dismissal is saved to localStorage (won't show again)

**iOS Detection:**
- Checks for iPad/iPhone/iPod in user agent
- Verifies NOT in standalone mode
- Respects localStorage dismissal
        `,
      },
    },
  },
};

/**
 * Hidden state when app is already installed (standalone mode).
 * The component returns null and doesn't render anything.
 */
export const AlreadyInstalled: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Mock standalone mode
        Object.defineProperty(window, "matchMedia", {
          value: (query: string) => ({
            matches: query === "(display-mode: standalone)",
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
          }),
          configurable: true,
        });

        // Mock navigator.standalone for iOS
        Object.defineProperty(window.navigator, "standalone", {
          value: true,
          configurable: true,
        });
      }, []);

      return (
        <div>
          <Story />
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
            <p className="text-green-800 dark:text-green-200 font-medium">
              App is installed - InstallPrompt is hidden
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              The component detects standalone mode and returns null.
            </p>
          </div>
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
When the app is already installed (running in standalone mode), the InstallPrompt component returns null and doesn't render anything.

**Detection Methods:**
1. \`window.matchMedia('(display-mode: standalone)')\` - Standard way
2. \`navigator.standalone\` - iOS-specific property

This ensures users don't see install prompts when they've already installed the app.
        `,
      },
    },
  },
};

/**
 * Dismissed state - prompt is hidden after user clicks X.
 * On iOS, this persists in localStorage.
 */
export const Dismissed: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Mock iOS
        Object.defineProperty(window.navigator, "userAgent", {
          value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
          configurable: true,
        });

        // Set localStorage flag to simulate previous dismissal
        localStorage.setItem("hasSeenIOSInstallPrompt", "true");
      }, []);

      return (
        <div>
          <Story />
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Prompt dismissed (iOS)
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              localStorage flag: hasSeenIOSInstallPrompt = true
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("hasSeenIOSInstallPrompt");
                window.location.reload();
              }}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 underline"
            >
              Clear localStorage and reload
            </button>
          </div>
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
On iOS, dismissal is persistent via localStorage. This prevents the prompt from showing again even after page reload.

**Implementation:**
- \`localStorage.setItem('hasSeenIOSInstallPrompt', 'true')\`
- Checked on component mount
- Can be cleared by user (e.g., in settings)

Android/Chrome dismissal is session-based only.
        `,
      },
    },
  },
};

/**
 * Dark mode variant of the Android prompt.
 * Shows how the component adapts to dark theme.
 */
export const DarkModeAndroid: Story = {
  ...AndroidPrompt,
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story: `
Dark mode variant using Tailwind's dark mode classes. All colors, borders, and text adapt automatically.

**Dark Mode Classes:**
- \`dark:bg-gray-800\` - Background
- \`dark:text-gray-100\` - Title text
- \`dark:text-gray-400\` - Description text
- \`dark:border-gray-700\` - Border
        `,
      },
    },
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        document.documentElement.classList.add("dark");
        const mockEvent = {
          preventDefault: () => {},
          prompt: async () => {},
          userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
          platforms: ["web"],
        } as BeforeInstallPromptEvent;

        const timer = setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("beforeinstallprompt", {
              detail: mockEvent,
            }) as Event,
          );
        }, 500);

        return () => {
          document.documentElement.classList.remove("dark");
          clearTimeout(timer);
        };
      }, []);

      return (
        <div className="min-h-screen bg-gray-900 p-4">
          <div className="max-w-md mx-auto pt-20">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

/**
 * Dark mode variant of iOS instructions.
 */
export const DarkModeIOS: Story = {
  ...IOSInstructions,
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story:
          "iOS instructions in dark mode. The share icon and text adapt to dark theme.",
      },
    },
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        document.documentElement.classList.add("dark");
        Object.defineProperty(window.navigator, "userAgent", {
          value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
          configurable: true,
        });
        localStorage.removeItem("hasSeenIOSInstallPrompt");

        return () => {
          document.documentElement.classList.remove("dark");
        };
      }, []);

      return (
        <div className="min-h-screen bg-gray-900 p-4">
          <div className="max-w-md mx-auto pt-20">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

/**
 * Interactive playground to test all states and interactions.
 */
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component. Use Storybook controls to toggle between states.

**Try:**
1. Clicking the install button (Android)
2. Dismissing with X button
3. Testing keyboard navigation (Tab, Enter, Escape)
4. Testing with screen reader
        `,
      },
    },
  },
};
