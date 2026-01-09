import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EducationHub } from "./EducationHub";
import { useEducationStore, initialContentProgress } from "@/interface-adapters/store/educationStore";
import { useEffect } from "react";

const meta: Meta<typeof EducationHub> = {
  title: "Organisms/EducationHub",
  component: EducationHub,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
EducationHub displays all educational content with progress tracking.

## Features
- Overall progress bar with ARIA labels
- Available content grid (responsive: 2 cols on sm, 3 cols on lg)
- Locked content section (shows when content requires unlock)
- Responsive typography (text scales on md/lg breakpoints)
- Accessible section headings with aria-labelledby

## Accessibility
- Progress component has descriptive aria-label
- Section headings use aria-labelledby for proper navigation
- Responsive design with md: and lg: breakpoints
- Keyboard navigation support via ContentCard

## States
- **No Progress**: User just started, 0% complete
- **Partial Progress**: Some content viewed/completed
- **All Available Complete**: All unlocked content done
- **With Locked Content**: Shows "Coming Soon" section
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
            id: "heading-order",
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
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EducationHub>;

/**
 * Initial state - user just started, no progress.
 */
export const NoProgress: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Reset store to initial state
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
Initial state when user first accesses the Learn page.

**Characteristics:**
- Overall progress: 0%
- All available content shows 0% progress
- Locked content visible with unlock requirements
        `,
      },
    },
  },
};

/**
 * Partial progress - some content viewed and completed.
 */
export const PartialProgress: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Set partial progress
        useEducationStore.setState({
          contentProgress: {
            ...initialContentProgress,
            "tension-headache": {
              ...initialContentProgress["tension-headache"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "body-scan": {
              ...initialContentProgress["body-scan"],
              viewed: true,
              completed: false,
              progressPercent: 50,
              lastViewedAt: new Date(),
            },
            "body-signals": {
              ...initialContentProgress["body-signals"],
              viewed: true,
              completed: false,
              progressPercent: 25,
              lastViewedAt: new Date(),
            },
          },
        });
      }, []);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
User has started learning, with mixed progress across content.

**Progress:**
- Tension Headache: 100% (completed)
- Body Scan: 50% (in progress)
- Body Signals: 25% (started)
- Vocabulary Builder: 0% (not started)
- General Patterns: 0% (not started)
        `,
      },
    },
  },
};

/**
 * All available content completed.
 */
export const AllAvailableComplete: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Mark all available content as completed
        useEducationStore.setState({
          contentProgress: {
            ...initialContentProgress,
            "tension-headache": {
              ...initialContentProgress["tension-headache"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "body-scan": {
              ...initialContentProgress["body-scan"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "body-signals": {
              ...initialContentProgress["body-signals"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "vocabulary-builder": {
              ...initialContentProgress["vocabulary-builder"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "general-patterns": {
              ...initialContentProgress["general-patterns"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
          },
        });
      }, []);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
User has completed all available content.

**State:**
- Overall progress: High percentage (all unlocked content done)
- All cards show 100% completion
- Locked content still visible, prompting user to unlock
        `,
      },
    },
  },
};

/**
 * With locked content unlocked (7+ days tracked).
 */
export const WithUnlockedAdvanced: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        // Mock store with advanced content unlocked
        useEducationStore.setState({
          contentProgress: {
            ...initialContentProgress,
            "tension-headache": {
              ...initialContentProgress["tension-headache"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "body-scan": {
              ...initialContentProgress["body-scan"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "body-signals": {
              ...initialContentProgress["body-signals"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "vocabulary-builder": {
              ...initialContentProgress["vocabulary-builder"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "general-patterns": {
              ...initialContentProgress["general-patterns"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "advanced-patterns": {
              ...initialContentProgress["advanced-patterns"],
              viewed: false,
              completed: false,
              progressPercent: 0,
            },
          },
        });

        // Mock unlock check to return true for advanced content
        const originalIsUnlocked = useEducationStore.getState().isContentUnlocked;
        useEducationStore.setState({
          isContentUnlocked: (id) => {
            if (id === "advanced-patterns") return true;
            return originalIsUnlocked(id);
          },
        });
      }, []);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Advanced content unlocked after 7 days of tracking.

**State:**
- All basic content completed
- Advanced Patterns now available (unlocked)
- User can access personalized insights
        `,
      },
    },
  },
};

/**
 * Responsive preview - mobile view.
 */
export const MobileView: Story = {
  ...NoProgress,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: `
Mobile view (375px width).

**Layout:**
- Single column grid (sm:grid-cols-2 not applied)
- Smaller text sizes (before md: breakpoint)
- Compact spacing
        `,
      },
    },
  },
};

/**
 * Responsive preview - tablet view.
 */
export const TabletView: Story = {
  ...PartialProgress,
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: `
Tablet view (768px width).

**Layout:**
- 2-column grid (md:grid-cols-2 applied)
- Medium text sizes (md: breakpoint active)
- Balanced spacing
        `,
      },
    },
  },
};

/**
 * Responsive preview - desktop view.
 */
export const DesktopView: Story = {
  ...PartialProgress,
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story: `
Desktop view (1024px+ width).

**Layout:**
- 3-column grid (lg:grid-cols-3 applied)
- Large text sizes (lg: breakpoint active)
- Spacious layout with optimal content density
        `,
      },
    },
  },
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  ...PartialProgress,
  decorators: [
    (Story) => {
      useEffect(() => {
        document.documentElement.classList.add("dark");

        // Set partial progress
        useEducationStore.setState({
          contentProgress: {
            ...initialContentProgress,
            "tension-headache": {
              ...initialContentProgress["tension-headache"],
              viewed: true,
              completed: true,
              progressPercent: 100,
              lastViewedAt: new Date(),
            },
            "body-scan": {
              ...initialContentProgress["body-scan"],
              viewed: true,
              completed: false,
              progressPercent: 50,
              lastViewedAt: new Date(),
            },
          },
        });

        return () => {
          document.documentElement.classList.remove("dark");
        };
      }, []);

      return (
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-6xl mx-auto">
            <Story />
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
- Adapts to dark theme automatically
- Proper contrast ratios maintained
- Progress bar visible in dark mode
        `,
      },
    },
  },
};

/**
 * Interactive playground.
 */
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Interactive playground to test the component.

**Try:**
1. Clicking content cards to navigate
2. Viewing progress updates
3. Testing responsive breakpoints
4. Testing keyboard navigation
5. Testing with screen reader
        `,
      },
    },
  },
};
