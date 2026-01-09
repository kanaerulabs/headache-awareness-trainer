import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { UpdatePrompt } from './useServiceWorker';
import { useState } from 'react';

const meta: Meta<typeof UpdatePrompt> = {
  title: 'PWA/UpdatePrompt',
  component: UpdatePrompt,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
UpdatePrompt notifies users when a new version of the PWA is available and allows them to update immediately.

## Features
- Shows when service worker update is detected
- Allows immediate update or deferral
- Accessible with ARIA live region
- Keyboard navigation support (Escape to dismiss)
- Positioned at top of screen for visibility

## Usage
Typically used with the \`useServiceWorker\` hook:

\`\`\`tsx
const { updateAvailable, applyUpdate } = useServiceWorker();
const [dismissed, setDismissed] = useState(false);

{updateAvailable && !dismissed && (
  <UpdatePrompt
    onUpdate={applyUpdate}
    onDismiss={() => setDismissed(true)}
  />
)}
\`\`\`

## Accessibility
- ARIA role="alert" with aria-live="polite"
- Keyboard support (Escape to dismiss, Enter/Space on buttons)
- Focus management
- Descriptive labels
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'button-name',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onUpdate: () => console.log('Update clicked'),
    onDismiss: () => console.log('Dismiss clicked'),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto">
          <Story />
          <div className="mt-20 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">App Content</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The update prompt appears at the top of the screen when a new version is available.
            </p>
          </div>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UpdatePrompt>;

/**
 * Default update prompt showing new version available.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Default state of the update prompt. Shows when a new service worker is waiting to activate.

**User Actions:**
1. Click "Update Now" to apply the update (triggers page reload)
2. Click "Later" to dismiss (can be shown again later)

**Service Worker Flow:**
1. New SW is installed but waiting
2. \`useServiceWorker\` hook detects waiting SW
3. UpdatePrompt is shown
4. User clicks "Update Now"
5. \`applyUpdate()\` sends SKIP_WAITING message
6. Page reloads with new version
        `,
      },
    },
  },
};

/**
 * Update prompt in dark mode.
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: `
Dark mode variant using Tailwind's dark mode classes.

**Dark Mode Adaptations:**
- Background: \`dark:bg-gray-800\`
- Border: \`dark:border-gray-700\`
- Title: \`dark:text-gray-100\`
- Description: \`dark:text-gray-400\`
- Button focus ring: \`dark:focus:ring-offset-gray-800\`
        `,
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <div className="min-h-screen bg-gray-900 p-4">
          <div className="max-w-md mx-auto dark">
            <Story />
            <div className="mt-20 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2 text-gray-100">App Content</h2>
              <p className="text-gray-400">
                The update prompt appears at the top of the screen.
              </p>
            </div>
          </div>
        </div>
      );
    },
  ],
};

/**
 * Interactive demo with dismissible state.
 */
export const InteractiveDismiss: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(true);

    if (!visible) {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            Update prompt dismissed
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            User clicked &quot;Later&quot;. Prompt can be shown again if needed.
          </p>
          <button
            onClick={() => setVisible(true)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Show Again
          </button>
        </div>
      );
    }

    return (
      <UpdatePrompt
        onUpdate={() => {
          args.onUpdate();
          // In real app, this would reload the page
          alert('Update applied! Page would reload now.');
        }}
        onDismiss={() => {
          args.onDismiss();
          setVisible(false);
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive demo showing dismiss behavior. Click "Later" to hide the prompt, then use the button to show it again.

**Implementation Pattern:**
\`\`\`tsx
const [dismissed, setDismissed] = useState(false);

{updateAvailable && !dismissed && (
  <UpdatePrompt
    onUpdate={applyUpdate}
    onDismiss={() => setDismissed(true)}
  />
)}
\`\`\`

**Note:** In a real app, you might want to:
- Show the prompt again after some time
- Store dismissal in localStorage
- Show a subtle indicator that an update is available
        `,
      },
    },
  },
};

/**
 * Demo showing update action.
 */
export const InteractiveUpdate: Story = {
  render: (args) => {
    const [updated, setUpdated] = useState(false);

    if (updated) {
      return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200 font-medium">
            Update triggered!
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            In a real app, the page would reload now with the new version.
          </p>
          <button
            onClick={() => setUpdated(false)}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Reset Demo
          </button>
        </div>
      );
    }

    return (
      <UpdatePrompt
        onUpdate={() => {
          args.onUpdate();
          setUpdated(true);
        }}
        onDismiss={args.onDismiss}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Demo showing what happens when user clicks "Update Now".

**Update Flow:**
1. User clicks "Update Now"
2. \`onUpdate()\` callback is triggered
3. App calls \`applyUpdate()\` from useServiceWorker hook
4. Service worker receives SKIP_WAITING message
5. New SW activates immediately
6. Page reloads automatically via \`controllerchange\` event

**Service Worker Code:**
\`\`\`javascript
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
\`\`\`
        `,
      },
    },
  },
};

/**
 * Keyboard navigation demo.
 */
export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Test keyboard navigation and accessibility.

**Keyboard Support:**
- **Tab**: Navigate between "Update Now" and "Later" buttons
- **Enter/Space**: Activate focused button
- **Escape**: Dismiss the prompt (calls onDismiss)

**Screen Reader Experience:**
1. Announced as an alert (role="alert", aria-live="polite")
2. Title read: "Update Available"
3. Description read: "A new version of the app is available..."
4. Buttons read with their labels

**Testing:**
1. Tab to focus "Update Now"
2. Press Enter to trigger update
3. Or press Escape to dismiss
        `,
      },
    },
  },
};

/**
 * Positioned within app layout.
 */
export const WithinAppLayout: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* App Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <h1 className="text-xl font-bold">Headache Awareness Trainer</h1>
        </header>

        {/* Update Prompt */}
        <Story />

        {/* App Content */}
        <main className="max-w-md mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4">
            <h2 className="text-lg font-semibold mb-2">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Notice how the update prompt appears at the top, over the content,
              but doesn&apos;t block interaction with the rest of the page.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Recent Entries</h2>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                Entry 1
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                Entry 2
              </div>
            </div>
          </div>
        </main>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Shows how the update prompt integrates with the app layout.

**Positioning:**
- \`position: fixed\`
- \`top: 1rem\` (16px from top)
- \`left: 1rem; right: 1rem\` (16px padding on sides)
- \`z-index: 50\` (above normal content)

**UX Considerations:**
- Non-blocking: Users can still interact with the page
- Prominent: Positioned at top for immediate visibility
- Mobile-friendly: Full width on small screens with padding
- Dismissible: Users can postpone the update if busy
        `,
      },
    },
  },
};

/**
 * Comparison of different timing scenarios.
 */
export const TimingScenarios: Story = {
  decorators: [
    () => (
      <div className="space-y-8 p-8">
        <div>
          <h3 className="font-bold mb-2">Scenario 1: Immediate Update</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            User is on the home page, not doing anything critical. Safe to update immediately.
          </p>
          <UpdatePrompt
            onUpdate={() => alert('Updating immediately')}
            onDismiss={() => alert('Dismissed')}
          />
        </div>

        <div className="border-t pt-8">
          <h3 className="font-bold mb-2">Scenario 2: During Entry</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Warning: User is in the middle of creating an entry. They should click &quot;Later&quot;
              to finish their work before updating.
            </p>
          </div>
          <UpdatePrompt
            onUpdate={() => alert('User might lose work! Consider blocking this.')}
            onDismiss={() => alert('Good choice - finish entry first')}
          />
        </div>

        <div className="border-t pt-8">
          <h3 className="font-bold mb-2">Best Practice</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              <strong>Recommended Pattern:</strong>
            </p>
            <ol className="text-sm text-blue-600 dark:text-blue-400 list-decimal list-inside space-y-1">
              <li>Detect update while user is active</li>
              <li>Store flag but don&apos;t show prompt immediately</li>
              <li>Wait for idle time or page change</li>
              <li>Show prompt when safe to reload</li>
              <li>Or show subtle indicator with manual trigger</li>
            </ol>
          </div>
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: `
Different scenarios for when to show the update prompt.

**Timing Strategies:**

1. **Immediate (Low-risk pages)**
   - Home page
   - Settings page
   - Help/About pages

2. **Deferred (High-risk pages)**
   - Form entry pages
   - During video playback
   - During active tasks

3. **Idle Detection**
   - Wait for user inactivity (30s+)
   - Show on next navigation
   - Show when app regains focus

**Implementation:**
\`\`\`tsx
const [canShowUpdate, setCanShowUpdate] = useState(false);
const isFormDirty = useFormDirty();

useEffect(() => {
  if (updateAvailable && !isFormDirty) {
    setCanShowUpdate(true);
  }
}, [updateAvailable, isFormDirty]);
\`\`\`
        `,
      },
    },
  },
};

/**
 * Playground for testing all interactions.
 */
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try:**
1. Click "Update Now" - check console for callback
2. Click "Later" - check console for callback
3. Press Escape - should dismiss
4. Tab between buttons - test focus styles
5. Test with screen reader - verify announcements
        `,
      },
    },
  },
};
