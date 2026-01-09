import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContentViewer } from "./ContentViewer";
import { useEducationStore, ContentType, initialContentProgress } from "@/interface-adapters/store/educationStore";
import { useEffect } from "react";

// Mock Next.js router for Storybook
const mockRouter = {
  push: (url: string) => console.log("Navigate to:", url),
  back: () => console.log("Navigate back"),
  forward: () => console.log("Navigate forward"),
  refresh: () => console.log("Refresh"),
  replace: (url: string) => console.log("Replace with:", url),
  prefetch: () => Promise.resolve(),
};

const meta: Meta<typeof ContentViewer> = {
  title: "Organisms/ContentViewer",
  component: ContentViewer,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      router: mockRouter,
    },
    docs: {
      description: {
        component: `
ContentViewer displays educational content section by section with progress tracking.

## Features
- Section-by-section navigation with Previous/Next buttons
- Progress bar tracking section completion
- Back button with ChevronLeft icon (no emoji)
- Section navigation dots with keyboard support (Enter/Space)
- Auto-save progress to store
- Markdown-like content rendering (bold, italic, lists)
- Locked content detection

## Accessibility
- Section dots have keyboard navigation (Enter/Space)
- ARIA labels on navigation dots
- aria-current on active section dot
- Focus ring styles on interactive elements
- Screen reader friendly navigation

## States
- **First Section**: Previous button disabled
- **Middle Section**: Both buttons enabled
- **Last Section**: Next button shows "Complete"
- **Locked**: Shows lock screen
- **Not Found**: Shows error message
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentViewer>;

/**
 * First section of Tension Headache content.
 */
export const FirstSection: Story = {
  args: {
    contentId: "tension-headache",
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        // Reset progress
        useEducationStore.setState({
          contentProgress: initialContentProgress,
        });
      }, []);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
First section state.

**Characteristics:**
- Previous button disabled
- Section 1/4 badge
- Progress bar at 25%
- Section dots show first as active
        `,
      },
    },
  },
};

/**
 * Middle section with partial progress.
 */
export const MiddleSection: Story = {
  args: {
    contentId: "body-scan",
  },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        // Set progress to middle section
        useEducationStore.setState({
          contentProgress: {
            ...initialContentProgress,
            "body-scan": {
              ...initialContentProgress["body-scan"],
              viewed: true,
              completed: false,
              progressPercent: 50,
              lastViewedAt: new Date(),
            },
          },
        });
      }, []);

      return <Story args={args} />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Middle section state (section 2 of 5).

**Characteristics:**
- Both Previous and Next buttons enabled
- Section 2/5 badge
- Progress bar at 40%
- Section dots show progress
        `,
      },
    },
  },
};

/**
 * Last section - Complete button shown.
 */
export const LastSection: Story = {
  args: {
    contentId: "vocabulary-builder",
  },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        // Manually set to last section
        useEducationStore.setState({
          contentProgress: {
            ...initialContentProgress,
            "vocabulary-builder": {
              ...initialContentProgress["vocabulary-builder"],
              viewed: true,
              completed: false,
              progressPercent: 80,
              lastViewedAt: new Date(),
            },
          },
        });
      }, []);

      return <Story args={args} />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Last section state.

**Characteristics:**
- Previous button enabled
- Next button shows "Complete" instead of "Next"
- Section 5/5 badge
- Progress bar at 100%
- Clicking Complete marks content as completed and navigates back
        `,
      },
    },
  },
};

/**
 * Locked content state.
 */
export const LockedContent: Story = {
  args: {
    contentId: "advanced-patterns",
  },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        // Ensure advanced content is locked
        useEducationStore.setState({
          contentProgress: initialContentProgress,
        });
      }, []);

      return <Story args={args} />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Locked content state.

**Characteristics:**
- Shows lock icon (🔒)
- Displays unlock requirement message
- Back button to return to Learn page
- No content or navigation visible
        `,
      },
    },
  },
};

/**
 * Content not found state.
 */
export const NotFound: Story = {
  args: {
    contentId: "non-existent-content" as unknown as ContentType,
  },
  parameters: {
    docs: {
      description: {
        story: `
Error state when content ID doesn't exist.

**Characteristics:**
- Shows "Content not found" message
- Back link to Learn page
- No content or navigation visible
        `,
      },
    },
  },
};

/**
 * Keyboard navigation demo - section dots.
 */
export const KeyboardNavigation: Story = {
  args: {
    contentId: "tension-headache",
  },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        useEducationStore.setState({
          contentProgress: initialContentProgress,
        });
      }, []);

      return (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
              Keyboard Navigation Test
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Try using keyboard to navigate section dots:
            </p>
            <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
              <li>• Press Tab to focus on section dots</li>
              <li>• Press Enter or Space to jump to a section</li>
              <li>• Focus ring should be visible on focused dot</li>
            </ul>
          </div>
          <Story args={args} />
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates keyboard navigation on section dots.

**Keyboard Support:**
- Tab: Focus on section dots
- Enter: Jump to section
- Space: Jump to section
- Focus ring visible (ring-2 ring-primary ring-offset-2)
        `,
      },
    },
  },
};

/**
 * Content rendering demo - shows all formatting types.
 */
export const ContentFormatting: Story = {
  args: {
    contentId: "body-scan",
  },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        useEducationStore.setState({
          contentProgress: initialContentProgress,
        });
      }, []);

      return (
        <div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
            <p className="text-purple-800 dark:text-purple-200 font-medium mb-2">
              Content Formatting Demo
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              This content demonstrates all formatting types:
            </p>
            <ul className="text-sm text-purple-600 dark:text-purple-400 mt-2 space-y-1">
              <li>• **Bold text** (asterisks)</li>
              <li>• *Italic text* (single asterisk)</li>
              <li>• Bullet lists (•, -, 🔹, ⚡)</li>
              <li>• Numbered lists (1., 2., etc.)</li>
              <li>• Paragraphs (double newline)</li>
            </ul>
          </div>
          <Story args={args} />
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Shows content rendering with various formatting.

**Supported Formats:**
- Bold: **text** → <strong>text</strong>
- Italic: *text* → <em>text</em>
- Bullet lists: •, -, 🔹, ⚡
- Numbered lists: 1., 2., 3.
- Paragraphs: Separated by blank lines
        `,
      },
    },
  },
};

/**
 * Progress tracking demo.
 */
export const ProgressTracking: Story = {
  args: {
    contentId: "body-signals",
  },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        useEducationStore.setState({
          contentProgress: {
            ...initialContentProgress,
            "body-signals": {
              ...initialContentProgress["body-signals"],
              viewed: true,
              completed: false,
              progressPercent: 50,
              lastViewedAt: new Date(),
            },
          },
        });
      }, []);

      return (
        <div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <p className="text-green-800 dark:text-green-200 font-medium mb-2">
              Progress Tracking Active
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Progress updates automatically as you navigate sections.
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Current: 50% (Section 2/4)
            </p>
          </div>
          <Story args={args} />
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates automatic progress tracking.

**Behavior:**
- Progress updates on section change
- Calculated as (currentSection + 1) / totalSections * 100
- Saved to education store
- Displayed in progress bar
        `,
      },
    },
  },
};

/**
 * Mobile view.
 */
export const MobileView: Story = {
  ...FirstSection,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: `
Mobile view (375px width).

**Layout:**
- Compact header
- Stacked navigation buttons
- Smaller section dots
- Readable content width
        `,
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  args: {
    contentId: "tension-headache",
  },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        document.documentElement.classList.add("dark");
        useEducationStore.setState({
          contentProgress: initialContentProgress,
        });

        return () => {
          document.documentElement.classList.remove("dark");
        };
      }, []);

      return (
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto py-8">
            <Story args={args} />
          </div>
        </div>
      );
    },
  ],
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story: `
Dark mode variant with Tailwind dark mode classes.

**Styling:**
- Card background adapts to dark theme
- Text colors maintain proper contrast
- Section dots visible in dark mode
- ChevronLeft icon visible
        `,
      },
    },
  },
};

/**
 * Interactive playground.
 */
export const Playground: Story = {
  args: {
    contentId: "tension-headache",
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try:**
1. Navigate between sections with Previous/Next
2. Click section dots to jump
3. Test keyboard navigation (Tab, Enter, Space)
4. Complete content to see "Complete" button
5. Test with screen reader
        `,
      },
    },
  },
};
