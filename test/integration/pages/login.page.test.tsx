/**
 * @jest-environment jsdom
 */

/**
 * Login Page Integration Tests
 *
 * Tests the /login page which handles Google OAuth authentication.
 * This is a Server Component that renders the LoginForm client component.
 *
 * Test Coverage:
 * - Server component rendering
 * - SEO metadata
 * - Page structure and accessibility
 * - Authentication state handling
 * - Navigation and redirects
 * - Error handling
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage, { metadata } from "../../../src/app/login/page";
import "@testing-library/jest-dom";

// Mock next-auth
const mockSignIn = jest.fn();
const mockUseSession = jest.fn();
const mockPush = jest.fn();

jest.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
  useSession: () => mockUseSession(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

describe("LoginPage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to unauthenticated state
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });
  });

  describe("page rendering", () => {
    it('should render page with data-testid="login-page"', () => {
      render(<LoginPage />);

      const page = screen.getByTestId("login-page");
      expect(page).toBeInTheDocument();
    });

    it("should have correct CSS classes for layout", () => {
      render(<LoginPage />);

      const page = screen.getByTestId("login-page");
      expect(page).toHaveClass(
        "flex",
        "min-h-screen",
        "flex-col",
        "items-center",
        "justify-center",
        "p-6",
      );
    });

    it("should render as a main element with role", () => {
      render(<LoginPage />);

      const page = screen.getByTestId("login-page");
      expect(page.tagName).toBe("MAIN");
      expect(page).toHaveAttribute("role", "main");
    });

    it("should contain LoginForm component", () => {
      render(<LoginPage />);

      expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    it("should have gradient background styling", () => {
      render(<LoginPage />);

      const page = screen.getByTestId("login-page");
      expect(page.className).toContain("bg-gradient-to-br");
    });
  });

  describe("SEO metadata", () => {
    it("should have correct title", () => {
      expect(metadata.title).toBe("Sign In | Headache Awareness Trainer");
    });

    it("should have descriptive metadata", () => {
      expect(metadata.description).toBe(
        "Sign in to Headache Awareness Trainer with your Google account to track and manage your headaches.",
      );
    });

    it("should have OpenGraph metadata", () => {
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(
        "Sign In | Headache Awareness Trainer",
      );
      expect(metadata.openGraph?.description).toBe(
        "Sign in to Headache Awareness Trainer with your Google account",
      );
      expect(metadata.openGraph?.type).toBe("website");
    });

    it("should include keywords for SEO", () => {
      const description = metadata.description?.toLowerCase() || "";
      expect(description).toContain("sign in");
      expect(description).toContain("google");
      expect(description).toContain("track");
    });
  });

  describe("LoginForm rendering states", () => {
    it("should render login form when unauthenticated", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<LoginPage />);

      expect(screen.getByTestId("login-form")).toBeInTheDocument();
      expect(screen.getByTestId("login-header")).toBeInTheDocument();
      expect(
        screen.getByText("Headache Awareness Trainer"),
      ).toBeInTheDocument();
    });

    it("should show loading state when session is loading", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<LoginPage />);

      expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
      expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
    });

    it("should show redirect message when already authenticated", () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: "test@example.com" } },
        status: "authenticated",
      });

      render(<LoginPage />);

      expect(screen.getByTestId("already-authenticated")).toBeInTheDocument();
      expect(
        screen.getByText("Already signed in. Redirecting..."),
      ).toBeInTheDocument();
    });
  });

  describe("authentication flow", () => {
    it("should display Google sign-in button", () => {
      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      expect(signInButton).toBeInTheDocument();
      expect(signInButton).toHaveTextContent("Sign in with Google");
    });

    it("should call signIn when Google sign-in button is clicked", async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(undefined);

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      await user.click(signInButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("google", {
          callbackUrl: "/",
          redirect: true,
        });
      });
    });

    it("should show loading state during sign-in", async () => {
      const user = userEvent.setup();
      // Make signIn hang to test loading state
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      await user.click(signInButton);

      // Check loading state is shown
      expect(signInButton).toHaveTextContent("Signing in...");
      expect(signInButton).toHaveAttribute("aria-busy", "true");
      expect(signInButton).toBeDisabled();
    });

    it("should display error message when sign-in fails", async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error("Sign in failed"));

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      await user.click(signInButton);

      await waitFor(() => {
        const errorMessage = screen.getByTestId("error-message");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(
          "An unexpected error occurred. Please try again.",
        );
      });
    });

    it("should clear previous error when retrying sign-in", async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValueOnce(new Error("First attempt failed"));

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");

      // First attempt - should fail
      await user.click(signInButton);
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      // Second attempt - should clear error
      mockSignIn.mockResolvedValue(undefined);
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
      });
    });
  });

  describe("navigation and redirects", () => {
    it("should redirect to home when already authenticated", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: "test@example.com" } },
        status: "authenticated",
      });

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("should not redirect when unauthenticated", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<LoginPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should not redirect during loading state", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<LoginPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have main landmark for screen readers", () => {
      render(<LoginPage />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("should have proper ARIA labels on interactive elements", () => {
      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      expect(signInButton).toHaveAttribute("aria-label", "Sign in with Google");
    });

    it("should update ARIA label during loading", async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      await user.click(signInButton);

      expect(signInButton).toHaveAttribute("aria-label", "Signing in...");
      expect(signInButton).toHaveAttribute("aria-busy", "true");
    });

    it("should have aria-live region for error messages", async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error("Sign in failed"));

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      await user.click(signInButton);

      await waitFor(() => {
        const errorMessage = screen.getByTestId("error-message");
        expect(errorMessage).toHaveAttribute("role", "alert");
        expect(errorMessage).toHaveAttribute("aria-live", "assertive");
      });
    });

    it("should have testids for E2E testing", () => {
      render(<LoginPage />);

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
      expect(screen.getByTestId("login-form")).toBeInTheDocument();
      expect(screen.getByTestId("login-header")).toBeInTheDocument();
      expect(screen.getByTestId("google-signin-button")).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      // Tab to button
      await user.tab();
      const signInButton = screen.getByTestId("google-signin-button");
      expect(signInButton).toHaveFocus();

      // Press Enter to activate
      mockSignIn.mockResolvedValue(undefined);
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  describe("page structure and content", () => {
    it("should display app branding with icon", () => {
      render(<LoginPage />);

      const header = screen.getByTestId("login-header");
      expect(header).toBeInTheDocument();
      expect(
        screen.getByText("Headache Awareness Trainer"),
      ).toBeInTheDocument();
    });

    it("should display tagline", () => {
      render(<LoginPage />);

      expect(
        screen.getByText("Learn to listen to your body before the headache speaks"),
      ).toBeInTheDocument();
    });

    it("should display welcome message", () => {
      render(<LoginPage />);

      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(
        screen.getByText("Sign in with your Google account to get started"),
      ).toBeInTheDocument();
    });

    it("should display privacy notice", () => {
      render(<LoginPage />);

      const privacyText = screen.getByText(/By signing in, you agree to/i);
      expect(privacyText).toBeInTheDocument();
      expect(privacyText.textContent).toContain("terms of service");
      expect(privacyText.textContent).toContain("privacy policy");
    });

    it("should have semantic HTML structure", () => {
      const { container } = render(<LoginPage />);

      const main = container.querySelector("main");
      expect(main).toBeInTheDocument();

      const form = container.querySelector('[data-testid="login-form"]');
      expect(form).toBeInTheDocument();
      expect(main).toContainElement(form);
    });

    it("should have card styling for login form", () => {
      render(<LoginPage />);

      const form = screen.getByTestId("login-form");
      expect(form.className).toContain("rounded-lg");
      expect(form.className).toContain("border");
      expect(form.className).toContain("shadow-lg");
    });
  });

  describe("responsive behavior", () => {
    it("should be mobile-friendly with full width and padding", () => {
      render(<LoginPage />);

      const form = screen.getByTestId("login-form");
      expect(form).toHaveClass("w-full", "max-w-md");
    });

    it("should have proper spacing", () => {
      render(<LoginPage />);

      const page = screen.getByTestId("login-page");
      expect(page).toHaveClass("p-6");
    });

    it("should center content vertically and horizontally", () => {
      render(<LoginPage />);

      const page = screen.getByTestId("login-page");
      expect(page).toHaveClass("items-center", "justify-center");
    });
  });

  describe("error handling edge cases", () => {
    it("should handle network errors gracefully", async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error("Network error"));

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      await user.click(signInButton);

      await waitFor(() => {
        const errorMessage = screen.getByTestId("error-message");
        expect(errorMessage).toHaveTextContent(
          "An unexpected error occurred. Please try again.",
        );
      });
    });

    it("should re-enable button after error", async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error("Failed"));

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      // Button should be enabled again
      expect(signInButton).not.toBeDisabled();
    });

    it("should handle multiple rapid clicks gracefully", async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<LoginPage />);

      const signInButton = screen.getByTestId("google-signin-button");

      // Click multiple times rapidly
      await user.click(signInButton);
      await user.click(signInButton);
      await user.click(signInButton);

      // Should be disabled after first click
      expect(signInButton).toBeDisabled();
    });
  });

  describe("authentication state transitions", () => {
    it("should handle transition from loading to unauthenticated", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      const { rerender } = render(<LoginPage />);
      expect(screen.getByTestId("auth-loading")).toBeInTheDocument();

      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      rerender(<LoginPage />);
      expect(screen.queryByTestId("auth-loading")).not.toBeInTheDocument();
      expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    it("should handle transition from unauthenticated to authenticated", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      const { rerender } = render(<LoginPage />);
      expect(screen.getByTestId("login-form")).toBeInTheDocument();

      mockUseSession.mockReturnValue({
        data: { user: { email: "test@example.com" } },
        status: "authenticated",
      });

      rerender(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByTestId("already-authenticated")).toBeInTheDocument();
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });
});
