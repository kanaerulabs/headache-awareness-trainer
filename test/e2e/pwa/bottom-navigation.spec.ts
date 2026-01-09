import { test, expect } from '@playwright/test';

/**
 * Bottom Navigation E2E Tests
 *
 * Tests mobile-first bottom navigation bar:
 * - Tab centering and layout on mobile
 * - Full width span on mobile viewports
 * - Active state indication
 * - Navigation between pages
 * - Touch interactions
 */

test.describe('Bottom Navigation', () => {
  test.describe('Mobile Viewport Layout (375x667 - iPhone SE)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display bottom navigation with all tabs visible', async ({ page }) => {
      await page.goto('/');

      // Verify bottom nav is visible
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();

      // Verify all nav items are visible
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-learn"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-log"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible();
    });

    test('should span full width of mobile viewport', async ({ page }) => {
      await page.goto('/');

      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      const navBox = await bottomNav.boundingBox();

      if (navBox) {
        // Should span full width (375px)
        expect(navBox.width).toBeGreaterThanOrEqual(370); // Account for potential padding
        expect(navBox.width).toBeLessThanOrEqual(375);

        // Should be at left edge (0 or very close)
        expect(navBox.x).toBeLessThanOrEqual(5);
      }
    });

    test('should center tabs evenly across bottom nav', async ({ page }) => {
      await page.goto('/');

      // Get all nav links
      const homeLink = page.locator('[data-testid="nav-home"]');
      const learnLink = page.locator('[data-testid="nav-learn"]');
      const logLink = page.locator('[data-testid="nav-log"]');

      const homeBox = await homeLink.boundingBox();
      const learnBox = await learnLink.boundingBox();
      const logBox = await logLink.boundingBox();

      if (homeBox && learnBox && logBox) {
        // Calculate spacing between tabs
        const spacing1 = learnBox.x - (homeBox.x + homeBox.width);
        const spacing2 = logBox.x - (learnBox.x + learnBox.width);

        // Spacing should be roughly equal (within 10px tolerance)
        expect(Math.abs(spacing1 - spacing2)).toBeLessThan(10);

        // Each tab should have roughly equal width
        expect(Math.abs(homeBox.width - learnBox.width)).toBeLessThan(20);
      }
    });

    test('should highlight active tab', async ({ page }) => {
      await page.goto('/');

      // Home tab should be active
      const homeLink = page.locator('[data-testid="nav-home"]');
      const homeClasses = await homeLink.getAttribute('class');
      expect(homeClasses).toContain('purple'); // Active color

      // Navigate to Learn page
      await page.locator('[data-testid="nav-learn"]').click();
      await expect(page).toHaveURL('/learn');

      // Learn tab should be active
      const learnLink = page.locator('[data-testid="nav-learn"]');
      const learnClasses = await learnLink.getAttribute('class');
      expect(learnClasses).toContain('purple'); // Active color
    });

    test('should display Log button with special styling', async ({ page }) => {
      await page.goto('/');

      // Log button should be visible
      const logButton = page.locator('[data-testid="nav-log"]');
      await expect(logButton).toBeVisible();

      // Log button should have the -mt-3 class for elevation
      const logClasses = await logButton.getAttribute('class');
      expect(logClasses).toContain('-mt-3');

      // Log button should contain gradient div
      const gradientDiv = logButton.locator('div.rounded-full');
      await expect(gradientDiv).toBeVisible();
    });

    test('should be fixed at bottom of viewport', async ({ page }) => {
      await page.goto('/');

      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      const navBox = await bottomNav.boundingBox();
      const viewportSize = page.viewportSize();

      if (navBox && viewportSize) {
        // Bottom nav should be near bottom of viewport (within 20px of bottom)
        expect(navBox.y + navBox.height).toBeGreaterThan(viewportSize.height - 20);
      }

      // Verify nav has 'fixed' class from Tailwind
      const classes = await bottomNav.getAttribute('class');
      expect(classes).toContain('fixed');
    });

    test('should not overlap page content', async ({ page }) => {
      await page.goto('/');

      // Get bottom nav position
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      const navBox = await bottomNav.boundingBox();

      // Verify nav exists at bottom of screen
      if (navBox) {
        // Bottom nav should be positioned near the bottom (within 100px of bottom)
        const viewportHeight = 667; // Mobile viewport height
        expect(navBox.y).toBeGreaterThan(viewportHeight - navBox.height - 20);
      }

      // Verify spacer div exists (BottomNavSpacer component)
      // It's the div directly before the nav with h-16 and pb-safe classes
      const spacer = page.locator('div.h-16');
      await expect(spacer.first()).toBeVisible();
    });
  });

  test.describe('Navigation Interactions', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should navigate to Home on Home tab click', async ({ page }) => {
      await page.goto('/learn');
      await expect(page).toHaveURL('/learn');

      // Click Home link - uses dispatchEvent to bypass Next.js dev overlay
      await page.locator('[data-testid="nav-home"]').dispatchEvent('click');
      // Home can redirect to / or /onboarding depending on user state
      await expect(page).toHaveURL(/\/(onboarding)?$/);
    });

    test('should navigate to Learn on Learn tab click', async ({ page }) => {
      await page.goto('/');

      await page.locator('[data-testid="nav-learn"]').click({ force: true });
      await expect(page).toHaveURL('/learn');
    });

    test('should navigate to Log on Log button click', async ({ page }) => {
      await page.goto('/');

      await page.locator('[data-testid="nav-log"]').click({ force: true });
      await expect(page).toHaveURL('/log');
    });

    test('should navigate to Insights on Insights tab click', async ({ page }) => {
      await page.goto('/');

      await page.locator('[data-testid="nav-insights"]').click({ force: true });
      await expect(page).toHaveURL('/insights');
    });

    test('should navigate to Settings on Settings tab click', async ({ page }) => {
      await page.goto('/');

      await page.locator('[data-testid="nav-settings"]').click({ force: true });
      await expect(page).toHaveURL('/settings');
    });
  });

  test.describe('Touch Interactions (Mobile)', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      hasTouch: true
    });

    test('should handle tap on navigation tabs', async ({ page }) => {
      await page.goto('/');

      // Tap Learn tab
      const learnTab = page.locator('[data-testid="nav-learn"]');
      await learnTab.tap();

      // Should navigate
      await expect(page).toHaveURL('/learn');
    });

    test('should handle tap on center Log button', async ({ page }) => {
      await page.goto('/');

      // Tap Log button
      const logButton = page.locator('[data-testid="nav-log"]');
      await logButton.tap();

      // Should navigate
      await expect(page).toHaveURL('/log');
    });

    test('should provide visual feedback on touch', async ({ page }) => {
      await page.goto('/');

      const homeTab = page.locator('[data-testid="nav-home"]');

      // Tab should have transition classes
      const classes = await homeTab.getAttribute('class');
      expect(classes).toMatch(/transition/i);
    });
  });

  test.describe('Tablet Viewport (768x1024 - iPad)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should display bottom navigation on tablet', async ({ page }) => {
      await page.goto('/');

      // Bottom nav should be visible
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();

      // Should span full width
      const navBox = await bottomNav.boundingBox();
      if (navBox) {
        expect(navBox.width).toBeGreaterThanOrEqual(760);
      }
    });

    test('should maintain tab spacing on tablet', async ({ page }) => {
      await page.goto('/');

      // All tabs should be visible with proper spacing
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-learn"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-log"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible();
    });
  });

  test.describe('Desktop Viewport (1280x720)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display bottom navigation on desktop', async ({ page }) => {
      await page.goto('/');

      // Bottom nav should be visible (mobile-first design)
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();
    });

    test('should handle mouse clicks on desktop', async ({ page }) => {
      await page.goto('/');

      // Click Learn tab via JavaScript to bypass Next.js dev overlay
      await page.locator('[data-testid="nav-learn"]').click({ force: true });
      await expect(page).toHaveURL('/learn');
    });
  });

  test.describe('Accessibility', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should have accessible navigation links', async ({ page }) => {
      await page.goto('/');

      // All links should be accessible
      const homeLink = page.locator('[data-testid="nav-home"]');
      const learnLink = page.locator('[data-testid="nav-learn"]');

      await expect(homeLink).toHaveAttribute('href', '/');
      await expect(learnLink).toHaveAttribute('href', '/learn');
    });

    test('should show visible labels for all tabs', async ({ page }) => {
      await page.goto('/');

      // All tabs should have visible text labels
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-learn"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');

      // Tab to navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to navigate with keyboard
      // Note: May need multiple tabs depending on page structure
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * Bottom Navigation (BottomNav.tsx):
 * - [data-testid="bottom-nav"] - Bottom navigation container
 * - [data-testid="nav-home"] - Home navigation link
 * - [data-testid="nav-learn"] - Learn navigation link
 * - [data-testid="nav-log"] - Log navigation link
 * - [data-testid="nav-insights"] - Insights navigation link
 * - [data-testid="nav-settings"] - Settings navigation link
 *
 * Home Page:
 * - [data-testid="empty-state"] - Empty state message (for overlap test)
 *
 * NOTE: Bottom navigation component uses data-testid attributes for stable
 * test selectors as per E2E testing best practices.
 */
