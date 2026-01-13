/**
 * @jest-environment jsdom
 */

/**
 * UserProfile Component Unit Tests
 *
 * Tests for the UserProfile component covering:
 * - Loading state (skeleton)
 * - Unauthenticated state (returns null, calls onUnauthenticated)
 * - Authenticated state with full user info
 * - Email verification badge display
 * - showSignOut prop behavior
 * - callbackUrl prop propagation
 * - Responsive layout classes
 * - Accessibility (ARIA attributes)
 */

import { render, screen, waitFor } from "@testing-library/react";
import { UserProfile } from "@/components/auth/user-profile";
import { useAuthStore } from "@/stores/auth";
import { User } from "@/domains/auth/entities/user.entity";
import { Session } from "@/domains/auth/value-objects/session.vo";

// Mock child components
jest.mock("@/components/auth/user-avatar", () => ({
  UserAvatar: jest.fn(({ user, size, showBorder }) => (
    <div
      data-testid="user-avatar"
      data-user-id={user.id}
      data-size={size}
      data-show-border={showBorder}
    >
      Avatar: {user.getDisplayName()}
    </div>
  )),
}));

jest.mock("@/components/auth/sign-out-button", () => ({
  SignOutButton: jest.fn(({ callbackUrl, variant, size, className }) => (
    <button
      data-testid="sign-out-button"
      data-callback-url={callbackUrl}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      Sign out
    </button>
  )),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: jest.fn(({ src, alt, fill, className, onError }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill}
      onError={onError}
    />
  )),
}));

describe("UserProfile", () => {
  // Helper function to create mock users
  const createMockUser = (props: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    emailVerified?: Date;
  }) => {
    return User.load({
      id: props.id || "test-user-id",
      name: props.name || "John Doe",
      email: props.email || "john.doe@example.com",
      image: props.image,
      emailVerified: props.emailVerified,
    });
  };

  // Helper function to create mock session
  const createMockSession = (user: User) => {
    return Session.create({
      user,
      accessToken: "mock-token",
      expires: new Date(Date.now() + 3600000), // 1 hour from now
    });
  };

  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  describe("loading state", () => {
    it("renders skeleton when isLoading is true", () => {
      // Arrange
      useAuthStore.getState().setLoading(true);

      // Act
      render(<UserProfile />);

      // Assert
      expect(screen.getByTestId("user-profile-skeleton")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByLabelText("Loading user profile")).toBeInTheDocument();
    });

    it("renders skeleton with correct structure", () => {
      // Arrange
      useAuthStore.getState().setLoading(true);

      // Act
      render(<UserProfile />);

      // Assert
      const skeleton = screen.getByTestId("user-profile-skeleton");
      expect(skeleton).toHaveClass("flex", "items-center", "gap-4");
    });

    it("does not render user profile when loading", () => {
      // Arrange
      useAuthStore.getState().setLoading(true);

      // Act
      render(<UserProfile />);

      // Assert
      expect(screen.queryByTestId("user-profile")).not.toBeInTheDocument();
    });

    it("applies custom className to loading container", () => {
      // Arrange
      useAuthStore.getState().setLoading(true);

      // Act
      const { container } = render(
        <UserProfile className="custom-loading-class" />,
      );

      // Assert
      const loadingContainer = container.firstChild;
      expect(loadingContainer).toHaveClass("w-full", "custom-loading-class");
    });
  });

  describe("unauthenticated state", () => {
    it("returns null when not authenticated", () => {
      // Arrange
      useAuthStore.getState().reset(); // Ensure no session

      // Act
      const { container } = render(<UserProfile />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("calls onUnauthenticated callback when not authenticated", () => {
      // Arrange
      const onUnauthenticated = jest.fn();
      useAuthStore.getState().reset();

      // Act
      render(<UserProfile onUnauthenticated={onUnauthenticated} />);

      // Assert
      expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    });

    it("returns null when user is null", () => {
      // Arrange
      useAuthStore.getState().setSession(null);

      // Act
      const { container } = render(<UserProfile />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("does not call onUnauthenticated when callback not provided", () => {
      // Arrange
      useAuthStore.getState().reset();

      // Act & Assert - should not throw error
      render(<UserProfile />);
    });
  });

  describe("authenticated state - rendering", () => {
    it("renders user profile when authenticated", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      expect(screen.getByRole("region")).toBeInTheDocument();
      expect(screen.getByLabelText("User profile")).toBeInTheDocument();
    });

    it("displays user avatar", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const avatar = screen.getByTestId("user-avatar");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("data-user-id", user.id);
      expect(avatar).toHaveAttribute("data-size", "lg");
      expect(avatar).toHaveAttribute("data-show-border", "true");
    });

    it("displays user display name", () => {
      // Arrange
      const user = createMockUser({
        name: "Jane Smith",
        emailVerified: new Date(),
      });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const nameElement = screen.getByTestId("user-profile-name");
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveTextContent("Jane Smith");
      expect(nameElement).toHaveClass("text-base", "font-semibold");
    });

    it("displays user email", () => {
      // Arrange
      const user = createMockUser({
        email: "test@example.com",
        emailVerified: new Date(),
      });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const emailElement = screen.getByTestId("user-profile-email");
      expect(emailElement).toBeInTheDocument();
      expect(emailElement).toHaveTextContent("test@example.com");
      expect(emailElement).toHaveClass("text-sm", "text-muted-foreground");
    });
  });

  describe("email verification badge", () => {
    it("displays verified badge when email is verified", () => {
      // Arrange
      const user = createMockUser({
        emailVerified: new Date("2024-01-01"),
      });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const badge = screen.getByTestId("user-profile-verified-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Verified");
      expect(badge).toHaveRole("status");
      expect(badge).toHaveAttribute("aria-label", "Email verified");
    });

    it("does not display verified badge when email is not verified", () => {
      // Arrange
      const user = createMockUser({ emailVerified: undefined });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      expect(
        screen.queryByTestId("user-profile-verified-badge"),
      ).not.toBeInTheDocument();
    });

    it("verified badge has correct styling", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const badge = screen.getByTestId("user-profile-verified-badge");
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "gap-1",
        "text-xs",
      );
    });

    it("verified badge includes check icon", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const badge = screen.getByTestId("user-profile-verified-badge");
      const svg = badge.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("showSignOut prop", () => {
    it("displays sign-out button by default", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      expect(screen.getByTestId("sign-out-button")).toBeInTheDocument();
    });

    it("displays sign-out button when showSignOut is true", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile showSignOut={true} />);

      // Assert
      expect(screen.getByTestId("sign-out-button")).toBeInTheDocument();
    });

    it("hides sign-out button when showSignOut is false", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile showSignOut={false} />);

      // Assert
      expect(screen.queryByTestId("sign-out-button")).not.toBeInTheDocument();
    });

    it("sign-out button has correct props", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const button = screen.getByTestId("sign-out-button");
      expect(button).toHaveAttribute("data-callback-url", "/");
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveAttribute("data-size", "sm");
    });
  });

  describe("callbackUrl prop", () => {
    it("uses default callbackUrl '/' when not provided", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const button = screen.getByTestId("sign-out-button");
      expect(button).toHaveAttribute("data-callback-url", "/");
    });

    it("passes custom callbackUrl to SignOutButton", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile callbackUrl="/login" />);

      // Assert
      const button = screen.getByTestId("sign-out-button");
      expect(button).toHaveAttribute("data-callback-url", "/login");
    });

    it("supports complex callbackUrl paths", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile callbackUrl="/auth/login?redirect=/dashboard" />);

      // Assert
      const button = screen.getByTestId("sign-out-button");
      expect(button).toHaveAttribute(
        "data-callback-url",
        "/auth/login?redirect=/dashboard",
      );
    });
  });

  describe("responsive layout", () => {
    it("applies responsive layout classes to container", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const container = screen.getByTestId("user-profile");
      expect(container).toHaveClass(
        "flex",
        "w-full",
        "flex-col",
        "gap-3",
        "sm:flex-row",
        "sm:items-center",
        "sm:justify-between",
      );
    });

    it("applies responsive padding classes", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const container = screen.getByTestId("user-profile");
      expect(container).toHaveClass("p-3", "sm:p-4", "md:p-5");
    });

    it("applies card styling classes", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const container = screen.getByTestId("user-profile");
      expect(container).toHaveClass(
        "rounded-lg",
        "border",
        "border-border",
        "bg-card",
        "shadow-sm",
      );
    });

    it("applies custom className to container", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile className="custom-profile-class" />);

      // Assert
      const container = screen.getByTestId("user-profile");
      expect(container).toHaveClass("custom-profile-class");
    });

    it("sign-out button container has responsive width classes", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const buttonContainer = screen
        .getByTestId("sign-out-button")
        .closest("div");
      expect(buttonContainer).toHaveClass("w-full", "sm:w-auto");
    });

    it("sign-out button has responsive width classes", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const button = screen.getByTestId("sign-out-button");
      expect(button).toHaveClass("w-full", "sm:w-auto");
    });
  });

  describe("accessibility", () => {
    it("has proper ARIA role for main container", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const container = screen.getByRole("region");
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute("aria-label", "User profile");
    });

    it("skeleton has proper ARIA attributes", () => {
      // Arrange
      useAuthStore.getState().setLoading(true);

      // Act
      render(<UserProfile />);

      // Assert
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveAttribute("aria-label", "Loading user profile");
    });

    it("verified badge has proper ARIA attributes", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const badge = screen.getByTestId("user-profile-verified-badge");
      expect(badge).toHaveRole("status");
      expect(badge).toHaveAttribute("aria-label", "Email verified");
    });

    it("decorative icon in badge is hidden from screen readers", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const badge = screen.getByTestId("user-profile-verified-badge");
      const svg = badge.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("user info section has proper semantic structure", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const nameElement = screen.getByTestId("user-profile-name");
      expect(nameElement.tagName).toBe("H2");
      expect(nameElement).toHaveClass("font-semibold");
    });
  });

  describe("user info variations", () => {
    it("handles user with image", () => {
      // Arrange
      const user = createMockUser({
        image: "https://example.com/avatar.jpg",
        emailVerified: new Date(),
      });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const avatar = screen.getByTestId("user-avatar");
      expect(avatar).toHaveAttribute("data-user-id", user.id);
    });

    it("handles user without image", () => {
      // Arrange
      const user = createMockUser({ image: undefined, emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const avatar = screen.getByTestId("user-avatar");
      expect(avatar).toBeInTheDocument();
    });

    it("handles long user names", () => {
      // Arrange
      const user = createMockUser({
        name: "Dr. Alexander Benjamin Christopher Davidson III",
        emailVerified: new Date(),
      });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const nameElement = screen.getByTestId("user-profile-name");
      expect(nameElement).toHaveTextContent(
        "Dr. Alexander Benjamin Christopher Davidson III",
      );
    });

    it("handles long email addresses", () => {
      // Arrange
      const user = createMockUser({
        email: "very.long.email.address@subdomain.example.com",
        emailVerified: new Date(),
      });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert
      const emailElement = screen.getByTestId("user-profile-email");
      expect(emailElement).toHaveTextContent(
        "very.long.email.address@subdomain.example.com",
      );
    });
  });

  describe("edge cases", () => {
    it("handles switching from loading to authenticated", () => {
      // Arrange
      useAuthStore.getState().setLoading(true);
      const { rerender } = render(<UserProfile />);

      // Assert initial loading state
      expect(screen.getByTestId("user-profile-skeleton")).toBeInTheDocument();

      // Act - switch to authenticated
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);
      useAuthStore.getState().setLoading(false);
      rerender(<UserProfile />);

      // Assert authenticated state
      expect(
        screen.queryByTestId("user-profile-skeleton"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    it("handles switching from authenticated to unauthenticated", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);
      const { rerender, container } = render(<UserProfile />);

      // Assert initial authenticated state
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();

      // Act - switch to unauthenticated
      useAuthStore.getState().reset();
      rerender(<UserProfile />);

      // Assert unauthenticated state (returns null)
      expect(container.firstChild).toBeNull();
    });

    it("handles onUnauthenticated callback being called multiple times", () => {
      // Arrange
      const onUnauthenticated = jest.fn();
      useAuthStore.getState().reset();

      // Act - render multiple times
      const { rerender } = render(
        <UserProfile onUnauthenticated={onUnauthenticated} />,
      );
      rerender(<UserProfile onUnauthenticated={onUnauthenticated} />);

      // Assert - callback called on each render when unauthenticated
      expect(onUnauthenticated.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it("handles all props together", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);
      const onUnauthenticated = jest.fn();

      // Act
      render(
        <UserProfile
          className="custom-class"
          showSignOut={true}
          callbackUrl="/custom-callback"
          onUnauthenticated={onUnauthenticated}
        />,
      );

      // Assert
      const container = screen.getByTestId("user-profile");
      expect(container).toHaveClass("custom-class");

      const button = screen.getByTestId("sign-out-button");
      expect(button).toHaveAttribute("data-callback-url", "/custom-callback");

      expect(onUnauthenticated).not.toHaveBeenCalled(); // Only called when unauthenticated
    });
  });

  describe("state management integration", () => {
    it("responds to store changes", async () => {
      // Arrange
      useAuthStore.getState().setLoading(true);
      const { rerender } = render(<UserProfile />);

      // Assert initial state
      expect(screen.getByTestId("user-profile-skeleton")).toBeInTheDocument();

      // Act - update store
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);
      useAuthStore.getState().setLoading(false);

      // Rerender to pick up store changes
      rerender(<UserProfile />);

      // Assert updated state
      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      });
    });

    it("uses correct store selectors", () => {
      // Arrange
      const user = createMockUser({ emailVerified: new Date() });
      const session = createMockSession(user);
      useAuthStore.getState().setSession(session);

      // Act
      render(<UserProfile />);

      // Assert - verify component uses the correct derived state
      expect(screen.getByTestId("user-profile-name")).toHaveTextContent(
        user.getDisplayName(),
      );
      expect(screen.getByTestId("user-profile-email")).toHaveTextContent(
        user.email,
      );
    });
  });
});
