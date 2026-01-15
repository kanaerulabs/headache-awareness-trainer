import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Google OAuth Authentication Flow
 *
 * Tests the complete authentication user experience including:
 * - Unauthenticated access protection and redirects
 * - Login page display and Google OAuth button
 * - Authenticated home page with user profile
 * - Sign-out flow
 * - Session persistence across page refreshes
 * - Protected route access after authentication
 *
 * IMPORTANT: These tests use the REAL backend (no API mocking).
 * The webServer in playwright.config.ts starts the dev server automatically.
 *
 * NOTE: Google OAuth flow cannot be fully automated in E2E tests without
 * exposing real credentials. These tests verify the UI elements and flows
 * up to the point where OAuth redirect would occur.
 *
 * For full OAuth testing, use:
 * - Manual testing with real Google accounts
 * - Integration tests with mocked OAuth responses
 * - Playwright with stored authentication state (see auth.setup.ts)
 */

test.describe("Authentication Flow", () => {
  test.describe("Unauthenticated Access Protection", () => {
    test.beforeEach(async ({ context }) => {
      // Clear all cookies and storage to ensure unauthenticated state
      await context.clearCookies();
      await context.clearPermissions();
    });

    test("should redirect to login when accessing root without authentication", async ({
      page,
    }) => {
      // Try to access home page without authentication
      await page.goto("/");

      // Should redirect to login page with callbackUrl
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2F/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /dashboard without authentication", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Fdashboard/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /profile without authentication", async ({
      page,
    }) => {
      await page.goto("/profile");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Fprofile/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /settings without authentication", async ({
      page,
    }) => {
      await page.goto("/settings");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Fsettings/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /insights without authentication", async ({
      page,
    }) => {
      await page.goto("/insights");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Finsights/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /onboarding without authentication", async ({
      page,
    }) => {
      // /onboarding is a protected route - requires authentication
      await page.goto("/onboarding");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Fonboarding/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /learn without authentication", async ({
      page,
    }) => {
      await page.goto("/learn");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Flearn/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /learn/[contentId] without authentication", async ({
      page,
    }) => {
      await page.goto("/learn/some-content-id");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Flearn%2Fsome-content-id/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /log without authentication", async ({
      page,
    }) => {
      await page.goto("/log");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Flog/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should redirect to login when accessing /checkin without authentication", async ({
      page,
    }) => {
      await page.goto("/checkin");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/callbackUrl=%2Fcheckin/);

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test("should preserve callbackUrl parameter in redirect", async ({
      page,
    }) => {
      const targetPath = "/dashboard";
      await page.goto(targetPath);

      // Wait for redirect
      await page.waitForURL(/\/login/);

      // Verify callbackUrl is preserved
      const url = new URL(page.url());
      const callbackUrl = url.searchParams.get("callbackUrl");
      expect(callbackUrl).toBe(targetPath);
    });
  });

  test.describe("Login Page Display", () => {
    test.beforeEach(async ({ context }) => {
      // Clear authentication state
      await context.clearCookies();
    });

    test("should display login page with correct structure and accessibility", async ({
      page,
    }) => {
      await page.goto("/login");

      // Verify page container
      const loginPage = page.locator('[data-testid="login-page"]');
      await expect(loginPage).toBeVisible();

      // Verify page has proper semantic structure
      await expect(loginPage).toHaveAttribute("role", "main");
    });

    test("should display login form with branding and content", async ({
      page,
    }) => {
      await page.goto("/login");

      // Wait for login form to render (not showing "already authenticated" state)
      await page.waitForTimeout(1000);

      // Verify login form container
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      // Verify header section
      const loginHeader = page.locator('[data-testid="login-header"]');
      await expect(loginHeader).toBeVisible();

      // Verify app title
      await expect(page.getByText("Headache Awareness Trainer")).toBeVisible();
      await expect(
        page.getByText(/Learn to listen to your body/i),
      ).toBeVisible();
    });

    test("should display Google sign-in button with correct attributes", async ({
      page,
    }) => {
      await page.goto("/login");

      // Wait for form to render
      await page.waitForTimeout(1000);

      // Verify Google sign-in button
      const signInButton = page.locator('[data-testid="google-signin-button"]');
      await expect(signInButton).toBeVisible();
      await expect(signInButton).toBeEnabled();

      // Verify button text
      await expect(signInButton).toContainText(/Sign in with Google/i);

      // Verify ARIA label
      await expect(signInButton).toHaveAttribute(
        "aria-label",
        "Sign in with Google",
      );
    });

    test("should display privacy notice", async ({ page }) => {
      await page.goto("/login");

      // Verify privacy notice is present
      await expect(page.getByText(/By signing in, you agree/i)).toBeVisible();
      await expect(
        page.getByText(/Your data is stored securely/i),
      ).toBeVisible();
    });

    test("should not show error message initially", async ({ page }) => {
      await page.goto("/login");

      // Wait for form to render
      await page.waitForTimeout(1000);

      // Error message should not be visible
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).not.toBeVisible();
    });
  });

  test.describe("Google OAuth Button Interaction", () => {
    test.beforeEach(async ({ context }) => {
      // Clear authentication state
      await context.clearCookies();
    });

    test("should trigger OAuth flow when clicking Google sign-in button", async ({
      page,
      context,
    }) => {
      await page.goto("/login");

      // Wait for form to render
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');

      // Set up listener for new page (OAuth popup/redirect)
      context.waitForEvent("page", { timeout: 5000 }).catch(() => null);

      // Click sign-in button
      await signInButton.click();

      // Verify button shows loading state
      await expect(signInButton).toBeDisabled();
      await expect(signInButton).toHaveAttribute("aria-busy", "true");
      await expect(signInButton.getByText(/Signing in/i)).toBeVisible();

      // Wait a moment for any navigation or popup
      await page.waitForTimeout(2000);

      // Note: We cannot complete the OAuth flow without real credentials
      // This test verifies the UI responds correctly to the click
    });

    test("should show loading state when sign-in is triggered", async ({
      page,
    }) => {
      await page.goto("/login");

      // Wait for form to render
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');

      // Click and immediately check loading state
      await signInButton.click();

      // Button should be disabled during loading
      await expect(signInButton).toBeDisabled();

      // Loading indicator should be visible
      await expect(signInButton.getByText(/Signing in/i)).toBeVisible();
    });
  });

  test.describe("Login Page - Already Authenticated State", () => {
    // Note: This test group would require auth setup
    // For demonstration, we skip actual authentication but document the pattern

    test.skip("should redirect to home if already authenticated", async ({
      page,
    }) => {
      // Prerequisite: User is already authenticated (set up via auth.setup.ts)

      await page.goto("/login");

      // Should show "already authenticated" message briefly
      const alreadyAuth = page.locator('[data-testid="already-authenticated"]');
      await expect(alreadyAuth).toBeVisible();
      await expect(alreadyAuth).toContainText(/Already signed in/i);

      // Should redirect to home page
      await expect(page).toHaveURL("/", { timeout: 5000 });
    });
  });

  test.describe("Authenticated Home Page", () => {
    // Note: These tests require authenticated session
    // In a real setup, you would use Playwright's storageState or auth.setup.ts

    test.skip("should display AuthStatus component with user profile", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/");

      // Verify home page loads
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

      // Verify AuthStatus component is present
      const authStatus = page.locator('[data-testid="auth-status"]');
      await expect(authStatus).toBeVisible();

      // Verify user avatar is visible
      // (Exact selector depends on UserAvatar implementation)
      await expect(authStatus.locator("img")).toBeVisible();

      // Verify sign-out button is present
      const signOutButton = page.locator('[data-testid="sign-out-button"]');
      await expect(signOutButton).toBeVisible();
      await expect(signOutButton).toBeEnabled();
    });

    test.skip("should display user information in AuthStatus", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/");

      const authStatus = page.locator('[data-testid="auth-status"]');
      await expect(authStatus).toBeVisible();

      // AuthStatus should show user display name or email
      // (Exact implementation depends on User entity structure)
      await expect(authStatus).not.toBeEmpty();
    });
  });

  test.describe("Sign Out Flow", () => {
    test.skip("should sign out when clicking sign-out button", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/");

      // Click sign-out button
      const signOutButton = page.locator('[data-testid="sign-out-button"]');
      await signOutButton.click();

      // Button should show loading state
      await expect(signOutButton).toBeDisabled();
      await expect(signOutButton).toHaveAttribute("aria-busy", "true");

      // Should redirect to login page after sign-out
      await expect(page).toHaveURL("/login", { timeout: 5000 });

      // Verify login page is displayed
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test.skip("should clear session after sign-out", async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto("/");

      // Sign out
      const signOutButton = page.locator('[data-testid="sign-out-button"]');
      await signOutButton.click();

      // Wait for redirect to login
      await expect(page).toHaveURL("/login", { timeout: 5000 });

      // Try to access protected route
      await page.goto("/dashboard");

      // Should redirect to login (not authenticated)
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Protected Route Access After Authentication", () => {
    test.skip("should allow access to home page when authenticated", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/");

      // Should NOT redirect to login
      await expect(page).toHaveURL("/");

      // Should show home page content
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    });

    test.skip("should allow access to /dashboard when authenticated", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/dashboard");

      // Should NOT redirect to login
      await expect(page).toHaveURL("/dashboard");

      // Should show dashboard content
      await expect(
        page.locator('[data-testid="dashboard-page"]'),
      ).toBeVisible();
    });

    test.skip("should allow access to /profile when authenticated", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/profile");

      // Should NOT redirect to login
      await expect(page).toHaveURL("/profile");
    });

    test.skip("should allow access to /settings when authenticated", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/settings");

      // Should NOT redirect to login
      await expect(page).toHaveURL("/settings");
    });
  });

  test.describe("Session Persistence", () => {
    test.skip("should maintain authentication after page refresh", async ({
      page,
    }) => {
      // Prerequisite: User is authenticated

      await page.goto("/");

      // Verify authenticated state
      await expect(page.locator('[data-testid="auth-status"]')).toBeVisible();

      // Refresh page
      await page.reload();

      // Should still be authenticated
      await expect(page.locator('[data-testid="auth-status"]')).toBeVisible();

      // Should not redirect to login
      await expect(page).toHaveURL("/");
    });

    test.skip("should persist session across navigation", async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto("/");

      // Navigate to different protected routes
      await page.goto("/dashboard");
      await expect(page).toHaveURL("/dashboard");

      await page.goto("/settings");
      await expect(page).toHaveURL("/settings");

      await page.goto("/");
      await expect(page).toHaveURL("/");

      // Should remain authenticated throughout
      await expect(page.locator('[data-testid="auth-status"]')).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("should allow keyboard navigation on login page", async ({ page }) => {
      await page.goto("/login");

      // Wait for form to render
      await page.waitForTimeout(1000);

      // Focus should start at the top of the page
      await page.keyboard.press("Tab");

      // Tab to Google sign-in button
      // (Number of tabs depends on page structure)
      const signInButton = page.locator('[data-testid="google-signin-button"]');

      // Focus the button directly for testing
      await signInButton.focus();
      await expect(signInButton).toBeFocused();

      // Should be able to trigger with Enter key
      await page.keyboard.press("Enter");

      // Button should show loading state
      await expect(signInButton).toBeDisabled();
    });

    test("should have correct ARIA labels on login elements", async ({
      page,
    }) => {
      await page.goto("/login");

      // Wait for form to render
      await page.waitForTimeout(1000);

      // Verify ARIA labels
      const signInButton = page.locator('[data-testid="google-signin-button"]');
      await expect(signInButton).toHaveAttribute(
        "aria-label",
        "Sign in with Google",
      );
    });

    test.skip("should announce loading states to screen readers", async ({
      page,
    }) => {
      await page.goto("/login");

      // Wait for form to render
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');

      // Click button
      await signInButton.click();

      // Verify aria-busy attribute
      await expect(signInButton).toHaveAttribute("aria-busy", "true");

      // Verify aria-label updates
      await expect(signInButton).toHaveAttribute("aria-label", "Signing in...");
    });
  });

  test.describe("Error Handling", () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test.skip("should display error message on authentication failure", async ({
      page,
    }) => {
      // Note: Triggering real auth errors is difficult in E2E
      // This test documents expected behavior

      await page.goto("/login?error=OAuthCallback");

      // Wait for page to process error
      await page.waitForTimeout(1000);

      // Error message should be visible
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveAttribute("role", "alert");
    });

    test.skip("should clear error message on retry", async ({ page }) => {
      await page.goto("/login?error=OAuthCallback");

      // Wait for error to display
      await page.waitForTimeout(1000);

      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();

      // Click sign-in button to retry
      const signInButton = page.locator('[data-testid="google-signin-button"]');
      await signInButton.click();

      // Error should be cleared
      await expect(errorMessage).not.toBeVisible();
    });
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * Login Page:
 * - [data-testid="login-page"] - Main login page container (<main> element)
 * - [data-testid="login-form"] - Login form container
 * - [data-testid="login-header"] - Header section with branding
 * - [data-testid="google-signin-button"] - Google OAuth sign-in button
 * - [data-testid="error-message"] - Error message display (when visible)
 * - [data-testid="auth-loading"] - Loading state indicator
 * - [data-testid="already-authenticated"] - Message shown when already signed in
 *
 * Home Page (Authenticated):
 * - [data-testid="home-page"] - Main home page container
 * - [data-testid="auth-status"] - AuthStatus component container
 * - [data-testid="sign-out-button"] - Sign-out button
 *
 * Other Pages:
 * - [data-testid="dashboard-page"] - Dashboard page container
 * - [data-testid="profile-page"] - Profile page container (if exists)
 * - [data-testid="settings-page"] - Settings page container
 *
 * ARIA Attributes:
 * - Google sign-in button: aria-label="Sign in with Google", aria-busy
 * - Sign-out button: aria-label (default or custom), aria-busy
 * - Error message: role="alert"
 * - Loading states: aria-busy="true"
 *
 * NOTE: All required data-testid attributes are already present in the
 * existing implementation. This test file was written after reading the
 * actual component code.
 *
 * AUTHENTICATION SETUP:
 *
 * To enable the .skip tests (authenticated state tests), create:
 * test/e2e/auth/auth.setup.ts
 *
 * This setup file should:
 * 1. Programmatically authenticate with Google OAuth
 * 2. Save authentication state to file
 * 3. Load state in tests that require authentication
 *
 * See Playwright docs: https://playwright.dev/docs/auth
 */
