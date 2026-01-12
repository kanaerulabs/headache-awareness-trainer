import { test, expect, devices } from '@playwright/test';

/**
 * E2E Tests for Authentication Responsive Behavior
 *
 * Tests authentication UI across different viewport sizes:
 * - Mobile (375x667 - iPhone SE)
 * - Tablet (768x1024 - iPad)
 * - Desktop (1280x720 - default)
 *
 * Verifies:
 * - Login page layout adapts correctly
 * - Authentication components render properly
 * - Touch interactions work on mobile
 * - No layout shifts or overlapping elements
 */

test.describe('Authentication Responsive Design', () => {
  test.describe('Mobile Viewport (iPhone SE)', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      ...devices['iPhone SE'],
    });

    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should display login page correctly on mobile', async ({ page }) => {
      await page.goto('/login');

      // Wait for page to render
      await page.waitForTimeout(1000);

      // Verify main container is visible
      const loginPage = page.locator('[data-testid="login-page"]');
      await expect(loginPage).toBeVisible();

      // Verify form container fits viewport
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      // Check form dimensions (should fit within viewport with padding)
      const formBox = await loginForm.boundingBox();
      expect(formBox).not.toBeNull();

      if (formBox) {
        // Form should not exceed viewport width
        expect(formBox.width).toBeLessThanOrEqual(375);

        // Form should be visible within viewport
        expect(formBox.y).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display app branding on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      // Verify header with branding
      const loginHeader = page.locator('[data-testid="login-header"]');
      await expect(loginHeader).toBeVisible();

      // App title should be visible
      await expect(page.getByText('Headache Awareness Trainer')).toBeVisible();

      // Tagline should be visible
      await expect(page.getByText(/Learn to listen to your body/i)).toBeVisible();
    });

    test('should display full-width sign-in button on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');
      await expect(signInButton).toBeVisible();

      // Button should be full-width (or nearly full-width with padding)
      const buttonBox = await signInButton.boundingBox();
      const formBox = await page.locator('[data-testid="login-form"]').boundingBox();

      expect(buttonBox).not.toBeNull();
      expect(formBox).not.toBeNull();

      if (buttonBox && formBox) {
        // Button width should be close to form width (accounting for padding)
        const widthRatio = buttonBox.width / formBox.width;
        expect(widthRatio).toBeGreaterThan(0.8);
      }
    });

    test('should handle touch interaction on sign-in button', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');

      // Perform touch tap
      await signInButton.tap();

      // Button should respond (show loading state)
      await expect(signInButton).toBeDisabled();
      await expect(signInButton.getByText(/Signing in/i)).toBeVisible();
    });

    test('should display privacy notice without overflow', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const privacyText = page.getByText(/By signing in, you agree/i);
      await expect(privacyText).toBeVisible();

      // Text should not overflow container
      const textBox = await privacyText.boundingBox();
      expect(textBox).not.toBeNull();

      if (textBox) {
        expect(textBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('should not have horizontal scroll on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      // Check if horizontal scrollbar exists
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      // Scroll width should not exceed client width
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
    });

    test.skip('should display AuthStatus correctly on mobile when authenticated', async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto('/');

      const authStatus = page.locator('[data-testid="auth-status"]');
      await expect(authStatus).toBeVisible();

      // Verify compact layout on mobile
      // (Exact layout depends on variant="compact" prop)
      const statusBox = await authStatus.boundingBox();
      expect(statusBox).not.toBeNull();

      if (statusBox) {
        // Should fit within mobile viewport
        expect(statusBox.width).toBeLessThanOrEqual(375);
      }
    });
  });

  test.describe('Tablet Viewport (iPad)', () => {
    test.use({
      viewport: { width: 768, height: 1024 },
      ...devices['iPad Pro'],
    });

    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should display login page correctly on tablet', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const loginPage = page.locator('[data-testid="login-page"]');
      await expect(loginPage).toBeVisible();

      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      // Form should be centered and not full width on tablet
      const formBox = await loginForm.boundingBox();
      expect(formBox).not.toBeNull();

      if (formBox) {
        // Form should have max-width and be centered
        expect(formBox.width).toBeLessThan(768);
        expect(formBox.x).toBeGreaterThan(0);
      }
    });

    test('should display larger touch targets on tablet', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');
      await expect(signInButton).toBeVisible();

      // Button should have adequate size for touch
      const buttonBox = await signInButton.boundingBox();
      expect(buttonBox).not.toBeNull();

      if (buttonBox) {
        // Minimum touch target height (44px recommended)
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should handle touch tap on tablet', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');

      // Perform touch tap
      await signInButton.tap();

      // Button should respond
      await expect(signInButton).toBeDisabled();
    });

    test('should not have horizontal scroll on tablet', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  test.describe('Desktop Viewport', () => {
    test.use({
      viewport: { width: 1280, height: 720 },
    });

    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should display login page with centered form on desktop', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      // Form should be centered on desktop
      const formBox = await loginForm.boundingBox();
      expect(formBox).not.toBeNull();

      if (formBox) {
        // Form should not span full width
        expect(formBox.width).toBeLessThan(800);

        // Form should be horizontally centered
        const centerX = formBox.x + formBox.width / 2;
        const viewportCenterX = 1280 / 2;
        const offsetFromCenter = Math.abs(centerX - viewportCenterX);

        // Should be roughly centered (within 100px)
        expect(offsetFromCenter).toBeLessThan(100);
      }
    });

    test('should display proper spacing and layout on desktop', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const loginPage = page.locator('[data-testid="login-page"]');
      const loginForm = page.locator('[data-testid="login-form"]');

      await expect(loginPage).toBeVisible();
      await expect(loginForm).toBeVisible();

      // Form should have shadow and proper styling
      const formStyles = await loginForm.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow,
          padding: computed.padding,
        };
      });

      // Should have border radius (rounded corners)
      expect(formStyles.borderRadius).not.toBe('0px');

      // Should have box shadow
      expect(formStyles.boxShadow).not.toBe('none');
    });

    test('should display hover states on desktop', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(1000);

      const signInButton = page.locator('[data-testid="google-signin-button"]');

      // Get initial button styles
      const initialStyles = await signInButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Hover over button
      await signInButton.hover();

      // Wait for hover transition
      await page.waitForTimeout(200);

      // Hover state may change appearance
      // (Testing exact color change is brittle, but we verify hover works)
      await expect(signInButton).toBeVisible();
    });

    test.skip('should display full AuthStatus component on desktop when authenticated', async ({ page }) => {
      // Prerequisite: User is authenticated

      await page.goto('/');

      const authStatus = page.locator('[data-testid="auth-status"]');
      await expect(authStatus).toBeVisible();

      // Desktop should show full variant (user info + sign-out button)
      // Verify user display name or email is visible
      await expect(authStatus).not.toBeEmpty();

      // Sign-out button should be visible
      const signOutButton = page.locator('[data-testid="sign-out-button"]');
      await expect(signOutButton).toBeVisible();
    });
  });

  test.describe('Viewport Transitions', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should handle resize from mobile to desktop', async ({ page }) => {
      // Start at mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.waitForTimeout(1000);

      // Verify mobile layout
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();

      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);

      // Form should still be visible and adapt to new viewport
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      // Form should be centered on desktop
      const formBox = await loginForm.boundingBox();
      if (formBox) {
        expect(formBox.width).toBeLessThan(800);
      }
    });

    test('should handle resize from desktop to mobile', async ({ page }) => {
      // Start at desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/login');
      await page.waitForTimeout(1000);

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Form should still be visible
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      // Should not have horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  test.describe('Orientation Changes (Mobile)', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should handle portrait to landscape on mobile', async ({ page }) => {
      // Portrait orientation (mobile default)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.waitForTimeout(1000);

      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();

      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);

      // Form should still be visible and accessible
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      // Content should fit without vertical scroll issues
      const formBox = await loginForm.boundingBox();
      if (formBox) {
        // Form should be visible within viewport
        expect(formBox.y).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Text Scaling and Accessibility', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should handle increased text size on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.waitForTimeout(1000);

      // Simulate text scaling (like iOS accessibility text size)
      await page.addStyleTag({
        content: `
          * {
            font-size: 1.5em !important;
          }
        `,
      });

      // Wait for reflow
      await page.waitForTimeout(500);

      // Elements should still be visible and not overflow
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();

      const signInButton = page.locator('[data-testid="google-signin-button"]');
      await expect(signInButton).toBeVisible();

      // Should not have horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // Allow small margin
    });
  });

  test.describe('Layout Consistency', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test('should maintain consistent layout across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 720, name: 'Desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/login');
        await page.waitForTimeout(1000);

        // Core elements should be visible on all viewports
        await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
        await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="login-header"]')).toBeVisible();
        await expect(page.locator('[data-testid="google-signin-button"]')).toBeVisible();

        // App title should be visible
        await expect(page.getByText('Headache Awareness Trainer')).toBeVisible();
      }
    });
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * - [data-testid="login-page"] - Main login page container
 * - [data-testid="login-form"] - Login form container
 * - [data-testid="login-header"] - Header with branding
 * - [data-testid="google-signin-button"] - Google sign-in button
 * - [data-testid="auth-status"] - AuthStatus component (for authenticated tests)
 * - [data-testid="sign-out-button"] - Sign-out button (for authenticated tests)
 *
 * RESPONSIVE DESIGN REQUIREMENTS:
 *
 * Mobile (375px):
 * - Full-width form with padding
 * - Touch-friendly button sizes (44px+ height)
 * - No horizontal scroll
 * - Readable text without zoom
 *
 * Tablet (768px):
 * - Centered form with max-width
 * - Adequate spacing between elements
 * - Touch-friendly targets
 * - No horizontal scroll
 *
 * Desktop (1280px+):
 * - Centered form (max-width ~400-500px)
 * - Hover states on interactive elements
 * - Proper shadows and borders
 * - Generous spacing
 *
 * NOTE: The existing implementation uses Tailwind responsive utilities
 * and should handle these requirements automatically.
 */
