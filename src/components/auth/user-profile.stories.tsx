/**
 * UserProfile Storybook Stories
 *
 * Demonstrates different states and variants of the UserProfile component.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserProfile } from "./user-profile";
import { User } from "@/domains/auth/entities/user.entity";
import { useAuthStore } from "@/interface-adapters/store/auth";
import { Session } from "@/domains/auth/value-objects/session.vo";
import { useEffect } from "react";

// Mock users for stories
const userWithImage = User.load({
  id: "1",
  email: "john.doe@example.com",
  name: "John Doe",
  image: "https://i.pravatar.cc/150?img=12",
  emailVerified: new Date("2024-01-01"),
});

const userWithoutImage = User.load({
  id: "2",
  email: "jane.smith@example.com",
  name: "Jane Smith",
  emailVerified: new Date("2024-01-15"),
});

const userUnverified = User.load({
  id: "3",
  email: "alice.jones@example.com",
  name: "Alice Jones",
  image: "https://i.pravatar.cc/150?img=5",
});

const userLongEmail = User.load({
  id: "4",
  email: "bob.johnson.williams@verylongdomain.example.com",
  name: "Bob Johnson Williams",
  emailVerified: new Date("2024-01-10"),
});

const meta: Meta<typeof UserProfile> = {
  title: "Auth/UserProfile",
  component: UserProfile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => {
      // Reset auth store before each story
      useEffect(() => {
        const store = useAuthStore.getState();
        store.reset();
      }, []);

      return (
        <div className="w-[500px]">
          <Story />
        </div>
      );
    },
  ],
  argTypes: {
    showSignOut: {
      control: "boolean",
      description: "Show sign-out button",
    },
    callbackUrl: {
      control: "text",
      description: "Callback URL for sign-out",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

/**
 * Authenticated user with profile image and verified email
 */
export const Authenticated: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userWithImage,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000), // 1 hour from now
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return <Story />;
    },
  ],
  args: {
    showSignOut: true,
  },
};

/**
 * Authenticated user without profile image (shows initials)
 */
export const WithoutImage: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userWithoutImage,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000),
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return <Story />;
    },
  ],
  args: {
    showSignOut: true,
  },
};

/**
 * Authenticated user without email verification
 */
export const Unverified: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userUnverified,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000),
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return <Story />;
    },
  ],
  args: {
    showSignOut: true,
  },
};

/**
 * User with long email and name
 */
export const LongContent: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userLongEmail,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000),
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return <Story />;
    },
  ],
  args: {
    showSignOut: true,
  },
};

/**
 * Profile without sign-out button
 */
export const WithoutSignOut: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userWithImage,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000),
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return <Story />;
    },
  ],
  args: {
    showSignOut: false,
  },
};

/**
 * Loading state (while fetching user data)
 */
export const Loading: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useAuthStore.getState().setLoading(true);
      }, []);

      return <Story />;
    },
  ],
  args: {
    showSignOut: true,
  },
};

/**
 * Unauthenticated state (shows nothing)
 */
export const Unauthenticated: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useAuthStore.getState().reset();
      }, []);

      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Component returns null when unauthenticated
          </p>
          <Story />
        </div>
      );
    },
  ],
  args: {
    showSignOut: true,
    onUnauthenticated: () => console.log("User not authenticated"),
  },
};

/**
 * Custom callback URL
 */
export const CustomCallbackUrl: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userWithImage,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000),
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return <Story />;
    },
  ],
  args: {
    showSignOut: true,
    callbackUrl: "/login",
  },
};

/**
 * Responsive layout demonstration
 */
export const ResponsiveLayout: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userWithImage,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000),
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return (
        <div className="flex flex-col gap-4">
          <div className="w-[300px]">
            <p className="mb-2 text-xs text-muted-foreground">Mobile (300px)</p>
            <Story />
          </div>
          <div className="w-[500px]">
            <p className="mb-2 text-xs text-muted-foreground">
              Desktop (500px)
            </p>
            <Story />
          </div>
        </div>
      );
    },
  ],
  args: {
    showSignOut: true,
  },
  parameters: {
    layout: "padded",
  },
};

/**
 * Dark mode demonstration
 */
export const DarkMode: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const session = Session.create({
          user: userWithImage,
          accessToken: "mock-token",
          expires: new Date(Date.now() + 3600000),
        });
        useAuthStore.getState().setSession(session);
      }, []);

      return (
        <div className="dark bg-background p-4">
          <Story />
        </div>
      );
    },
  ],
  args: {
    showSignOut: true,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
