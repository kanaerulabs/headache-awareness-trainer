/**
 * AuthStatus Storybook Stories
 *
 * Demonstrates different states and variants of the AuthStatus component.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthStatus } from "./auth-status";
import { useAuthStore } from "@/interface-adapters/store/auth";
import { Session } from "@/domains/auth/value-objects/session.vo";
import { User } from "@/domains/auth/entities/user.entity";
import { useEffect } from "react";

// Mock user for authenticated stories (using load() to provide explicit ID)
const mockUser = User.load({
  id: "1",
  email: "john.doe@example.com",
  name: "John Doe",
  image: "https://i.pravatar.cc/150?img=12",
});

const mockSession = Session.create({
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
});

const meta: Meta<typeof AuthStatus> = {
  title: "Auth/AuthStatus",
  component: AuthStatus,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["full", "compact"],
      description: "Display variant",
    },
    showSignOut: {
      control: "boolean",
      description: "Show sign-out button when authenticated",
    },
    callbackUrl: {
      control: "text",
      description: "Callback URL for auth actions",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthStatus>;

/**
 * Wrapper to set authenticated state for stories
 */
function AuthenticatedWrapper({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    setSession(mockSession);
    return () => {
      setSession(null);
    };
  }, [setSession]);

  return <>{children}</>;
}

/**
 * Wrapper to clear auth state for unauthenticated stories
 */
function UnauthenticatedWrapper({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    setSession(null);
  }, [setSession]);

  return <>{children}</>;
}

/**
 * Not authenticated - shows sign-in prompt (full variant)
 */
export const NotAuthenticatedFull: Story = {
  args: {
    variant: "full",
  },
  decorators: [
    (Story) => (
      <UnauthenticatedWrapper>
        <Story />
      </UnauthenticatedWrapper>
    ),
  ],
};

/**
 * Not authenticated - shows sign-in button (compact variant)
 */
export const NotAuthenticatedCompact: Story = {
  args: {
    variant: "compact",
  },
  decorators: [
    (Story) => (
      <UnauthenticatedWrapper>
        <Story />
      </UnauthenticatedWrapper>
    ),
  ],
};

/**
 * Authenticated - shows user info with sign-out button (full variant)
 */
export const AuthenticatedFull: Story = {
  args: {
    variant: "full",
    showSignOut: true,
  },
  decorators: [
    (Story) => (
      <AuthenticatedWrapper>
        <Story />
      </AuthenticatedWrapper>
    ),
  ],
};

/**
 * Authenticated - compact view with avatar and sign-out
 */
export const AuthenticatedCompact: Story = {
  args: {
    variant: "compact",
    showSignOut: true,
  },
  decorators: [
    (Story) => (
      <AuthenticatedWrapper>
        <Story />
      </AuthenticatedWrapper>
    ),
  ],
};

/**
 * Authenticated - without sign-out button
 */
export const AuthenticatedNoSignOut: Story = {
  args: {
    variant: "full",
    showSignOut: false,
  },
  decorators: [
    (Story) => (
      <AuthenticatedWrapper>
        <Story />
      </AuthenticatedWrapper>
    ),
  ],
};

/**
 * Authenticated - compact without sign-out
 */
export const AuthenticatedCompactNoSignOut: Story = {
  args: {
    variant: "compact",
    showSignOut: false,
  },
  decorators: [
    (Story) => (
      <AuthenticatedWrapper>
        <Story />
      </AuthenticatedWrapper>
    ),
  ],
};
