import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Navigation Flows
 *
 * Tests navigation behavior across authentication states:
 * - Redirects between login and protected routes
 * - Deep linking with callbackUrl preservation
 * - Navigation history and back button behavior
 * - Cross-page navigation with authentication state
 *
 * These tests verify that the authentication middleware and routing
 * work correctly across the entire application.
 */

test.describe('Authentication Navigation', () => {
  test.describe('Unauthenticated Navigation', () => {
    test.beforeEach(async ({ context }) => {
      // Ensure unauthenticated state
      await context.clearCookies();
    });

    test('should allow direct access to login page', async ({ page }) => {
      await page.goto('/login');

      // Should stay on login page (no redirect)
      await expect(page).toHaveURL('/login');
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test('should redirect from root to login', async ({ page }) => {
      await page.goto('/');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test('should preserve deep link in callbackUrl', async ({ page }) => {
      const deepLink = '/dashboard';
      await page.goto(deepLink);

      // Should redirect to login with callbackUrl
      await page.waitForURL(/\/login/);

      const url = new URL(page.url());
      expect(url.pathname).toBe('/login');
      expect(url.searchParams.get('callbackUrl')).toBe(deepLink);
    });

    test('should preserve query parameters in deep link', async ({ page }) => {
      const deepLinkWithQuery = '/settings?tab=notifications';
      await page.goto(deepLinkWithQuery);

      // Should redirect to login
      await page.waitForURL(/\/login/);

      // CallbackUrl should preserve query params
      const url = new URL(page.url());
      const callbackUrl = url.searchParams.get('callbackUrl');
      expect(callbackUrl).toBe('/settings?tab=notifications');
    });

    test('should handle multiple navigation attempts when unauthenticated', async ({ page }) => {
      // Try to navigate to multiple protected routes
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);

      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/);

      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);

      // Should always redirect to login
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test('should not create infinite redirect loop', async ({ page }) => {
      let navigationCount = 0;

      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) {
          navigationCount++;
        }
      });

      await page.goto('/');

      // Wait a moment to ensure no additional redirects
      await page.waitForTimeout(2000);

      // Should have only redirected once (to /login)
      // Exact count may vary, but should be small (< 5)
      expect(navigationCount).toBeLessThan(5);
    });
  });

  test.describe('Login Page Navigation', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should stay on login page when accessing directly', async ({ page }) => {
      await page.goto('/login');

      // Should not redirect away
      await expect(page).toHaveURL('/login');

      // Wait a moment to ensure no redirect occurs
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL('/login');
    });

    test('should handle browser back button from login page', async ({ page }) => {
      // Start at login page
      await page.goto('/login');

      // Try to go back (nothing in history)
      await page.goBack();

      // Should stay on login or go to browser's default
      // (Behavior may vary by browser)
      const url = page.url();
      const isLoginOrBlank = url.includes('/login') || url === 'about:blank';
      expect(isLoginOrBlank).toBeTruthy();
    });

    test('should allow navigation to public routes from login', async ({ page }) => {
      await page.goto('/login');

      // Navigate to API auth routes (public)
      const apiAuthUrl = new URL('/api/auth/signin', page.url());
      await page.goto(apiAuthUrl.toString());

      // Should allow access (no redirect back to login)
      expect(page.url()).toContain('/api/auth');
    });
  });

  test.describe('Authenticated Navigation', () => {
    // Note: These tests require authenticated state

    test.skip('should redirect from login to home when authenticated', async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto('/login');

      // Should redirect to home page
      await expect(page).toHaveURL('/', { timeout: 5000 });
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    });

    test.skip('should allow navigation between protected routes', async ({ page }) => {
      // Prerequisite: User is authenticated

      // Navigate through protected routes
      await page.goto('/');
      await expect(page).toHaveURL('/');

      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');

      await page.goto('/settings');
      await expect(page).toHaveURL('/settings');

      // Should not redirect to login at any point
      await expect(page.locator('[data-testid="login-page"]')).not.toBeVisible();
    });

    test.skip('should allow direct access to protected routes', async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto('/dashboard');

      // Should load directly without redirect
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    });

    test.skip('should handle browser back button when authenticated', async ({ page }) => {
      // Prerequisite: User is authenticated

      // Navigate to dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');

      // Navigate to settings
      await page.goto('/settings');
      await expect(page).toHaveURL('/settings');

      // Go back
      await page.goBack();

      // Should return to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test.skip('should handle browser forward button when authenticated', async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto('/');
      await page.goto('/dashboard');
      await page.goBack();

      // Go forward
      await page.goForward();

      // Should return to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test.skip('should persist authentication across multiple navigations', async ({ page }) => {
      // Prerequisite: User is authenticated

      // Navigate through multiple pages
      const routes = ['/', '/dashboard', '/settings', '/', '/dashboard'];

      for (const route of routes) {
        await page.goto(route);
        await expect(page).toHaveURL(route);

        // Verify AuthStatus is still visible (still authenticated)
        const authStatus = page.locator('[data-testid="auth-status"]');
        await expect(authStatus).toBeVisible();
      }
    });
  });

  test.describe('Deep Linking with CallbackUrl', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should preserve callbackUrl for root path', async ({ page }) => {
      await page.goto('/');

      // Should redirect to login with callbackUrl=/
      await page.waitForURL(/\/login/);

      const url = new URL(page.url());
      expect(url.searchParams.get('callbackUrl')).toBe('/');
    });

    test('should preserve callbackUrl for nested paths', async ({ page }) => {
      await page.goto('/settings/profile');

      // Should redirect to login with full path
      await page.waitForURL(/\/login/);

      const url = new URL(page.url());
      expect(url.searchParams.get('callbackUrl')).toBe('/settings/profile');
    });

    test('should preserve callbackUrl with query parameters', async ({ page }) => {
      await page.goto('/dashboard?filter=recent&sort=date');

      // Should redirect to login with full URL
      await page.waitForURL(/\/login/);

      const url = new URL(page.url());
      const callbackUrl = url.searchParams.get('callbackUrl');
      expect(callbackUrl).toBe('/dashboard?filter=recent&sort=date');
    });

    test('should preserve callbackUrl with hash fragments', async ({ page }) => {
      await page.goto('/settings#notifications');

      // Should redirect to login
      await page.waitForURL(/\/login/);

      const url = new URL(page.url());
      const callbackUrl = url.searchParams.get('callbackUrl');

      // Hash may or may not be preserved depending on middleware implementation
      // This test documents the expected behavior
      expect(callbackUrl).toContain('/settings');
    });

    test.skip('should redirect to callbackUrl after successful login', async ({ page }) => {
      // Set up initial state: unauthenticated, trying to access /dashboard
      await page.goto('/dashboard');

      // Should redirect to login with callbackUrl
      await page.waitForURL(/\/login/);
      const loginUrl = new URL(page.url());
      expect(loginUrl.searchParams.get('callbackUrl')).toBe('/dashboard');

      // Perform authentication (mocked or real)
      // ... authentication process ...

      // After successful auth, should redirect to callbackUrl
      await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
      await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should handle rapid navigation attempts', async ({ page }) => {
      // Rapidly navigate to multiple protected routes
      const navigatePromises = [
        page.goto('/'),
        page.goto('/dashboard'),
        page.goto('/settings'),
      ];

      // Wait for all navigations to settle
      await Promise.allSettled(navigatePromises);

      // Should end up at login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test('should handle invalid callbackUrl gracefully', async ({ page }) => {
      // Try to inject malicious callbackUrl
      await page.goto('/login?callbackUrl=https://evil.com/phishing');

      // Login page should still render
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();

      // After successful auth, should NOT redirect to external URL
      // (This would require actual authentication to test fully)
    });

    test('should handle missing callbackUrl parameter', async ({ page }) => {
      await page.goto('/login');

      // Should render login page without error
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();

      // URL should not have callbackUrl if accessed directly
      const url = new URL(page.url());
      const callbackUrl = url.searchParams.get('callbackUrl');
      expect(callbackUrl).toBeNull();
    });

    test('should handle empty callbackUrl parameter', async ({ page }) => {
      await page.goto('/login?callbackUrl=');

      // Should render login page without error
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });
  });

  test.describe('Navigation Performance', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should redirect quickly from protected route to login', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/dashboard');

      // Wait for redirect to complete
      await page.waitForURL(/\/login/);

      const redirectTime = Date.now() - startTime;

      // Redirect should be fast (< 3 seconds)
      expect(redirectTime).toBeLessThan(3000);
    });

    test('should not cause visible flashing during redirect', async ({ page }) => {
      // Navigate to protected route
      await page.goto('/');

      // Should not see protected content before redirect
      // (This is hard to test reliably, but we can check that
      // we end up at login without seeing home page)

      await page.waitForURL(/\/login/);
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });
  });

  test.describe('Client-Side Navigation', () => {
    test.skip('should handle Next.js Link navigation when authenticated', async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto('/');

      // Click a link to navigate (if available on home page)
      const dashboardLink = page.getByRole('link', { name: /dashboard/i });

      if (await dashboardLink.isVisible()) {
        await dashboardLink.click();

        // Should navigate without full page reload
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
      }
    });

    test.skip('should handle router.push() navigation when authenticated', async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto('/');

      // Trigger programmatic navigation (via button click)
      const navigateButton = page.locator('[data-testid="log-headache-card"]');

      if (await navigateButton.isVisible()) {
        await navigateButton.click();

        // Should navigate to log page
        await expect(page).not.toHaveURL('/');
      }
    });
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * - [data-testid="login-page"] - Login page container
 * - [data-testid="home-page"] - Home page container
 * - [data-testid="dashboard-page"] - Dashboard page container
 * - [data-testid="settings-page"] - Settings page container
 * - [data-testid="profile-page"] - Profile page container (if exists)
 * - [data-testid="auth-status"] - AuthStatus component
 * - [data-testid="log-headache-card"] - Navigation button/card (example)
 *
 * NOTE: These attributes are already present in the existing codebase.
 */
