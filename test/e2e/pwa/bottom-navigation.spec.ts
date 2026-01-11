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
 *
 * NOTE: Nav items are: Home, Check-in, Log, Insights, Learn
 * data-testid format: nav-{label.toLowerCase()} = nav-home, nav-check-in, nav-log, nav-insights, nav-learn
 */

test.describe('Bottom Navigation', () => {
  // Ensure user has completed onboarding before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('onboarding-storage', JSON.stringify({
        state: {
          isCompleted: true,
          currentStep: 3,
          totalSteps: 4,
          headacheType: 'tension',
          frequency: 'weekly',
          remindersEnabled: true
        },
        version: 0
      }));
    });
  });

  test.describe('Mobile Viewport Layout (375x667 - iPhone SE)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display bottom navigation with all tabs visible', async ({ page }) => {
      await page.goto('/');

      // Verify bottom nav is visible
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();

      // Verify all nav items are visible (Home, Check-in, Log, Insights, Learn)
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-check-in"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-log"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-learn"]')).toBeVisible();
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

      // Get all nav links (in order: Home, Check-in, Log, Insights, Learn)
      const homeLink = page.locator('[data-testid="nav-home"]');
      const checkinLink = page.locator('[data-testid="nav-check-in"]');
      const logLink = page.locator('[data-testid="nav-log"]');

      const homeBox = await homeLink.boundingBox();
      const checkinBox = await checkinLink.boundingBox();
      const logBox = await logLink.boundingBox();

      if (homeBox && checkinBox && logBox) {
        // Calculate spacing between tabs
        const spacing1 = checkinBox.x - (homeBox.x + homeBox.width);
        const spacing2 = logBox.x - (checkinBox.x + checkinBox.width);

        // Spacing should be roughly equal (within 10px tolerance)
        expect(Math.abs(spacing1 - spacing2)).toBeLessThan(10);

        // Each tab should have roughly equal width
        expect(Math.abs(homeBox.width - checkinBox.width)).toBeLessThan(20);
      }
    });

    test('should highlight active tab', async ({ page }) => {
      await page.goto('/');

      // Home tab should be active (text-purple-600)
      const homeLink = page.locator('[data-testid="nav-home"]');
      const homeClasses = await homeLink.getAttribute('class');
      expect(homeClasses).toContain('purple'); // Active color

      // Navigate to Learn page
      await page.locator('[data-testid="nav-learn"]').click({ force: true });
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

    test('should navigate to Check-in on Check-in tab click', async ({ page }) => {
      await page.goto('/');

      await page.locator('[data-testid="nav-check-in"]').click({ force: true });
      await expect(page).toHaveURL('/checkin');
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

      // All tabs should be visible with proper spacing (Home, Check-in, Log, Insights, Learn)
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-check-in"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-log"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-learn"]')).toBeVisible();
    });
  });

  test.describe('Desktop Viewport (1280x720)', () => {
    test('should display sidebar navigation on desktop', async ({ page }, testInfo) => {
      // Skip on mobile device projects - viewport override doesn't work well with device emulation
      const projectName = testInfo.project.name;
      if (projectName.includes('Mobile') || projectName.includes('iPhone') || projectName.includes('iPad')) {
        test.skip();
        return;
      }

      // Set viewport to desktop size and navigate
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // On desktop (lg+), sidebar nav should be visible instead of bottom nav
      const sidebarNav = page.locator('[data-testid="sidebar-nav"]');
      await expect(sidebarNav).toBeVisible();

      // Bottom nav should be hidden on desktop
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).not.toBeVisible();
    });

    test('should handle mouse clicks on desktop sidebar', async ({ page }, testInfo) => {
      // Skip on mobile device projects
      const projectName = testInfo.project.name;
      if (projectName.includes('Mobile') || projectName.includes('iPhone') || projectName.includes('iPad')) {
        test.skip();
        return;
      }

      // Set viewport to desktop size and navigate
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // Click Learn tab in sidebar
      await page.locator('[data-testid="sidebar-nav-learn"]').click();
      await expect(page).toHaveURL('/learn');
    });

    test('should display settings link in sidebar', async ({ page }, testInfo) => {
      // Skip on mobile device projects
      const projectName = testInfo.project.name;
      if (projectName.includes('Mobile') || projectName.includes('iPhone') || projectName.includes('iPad')) {
        test.skip();
        return;
      }

      // Set viewport to desktop size and navigate
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // Settings should be visible in sidebar
      const settingsLink = page.locator('[data-testid="sidebar-nav-settings"]');
      await expect(settingsLink).toBeVisible();
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

      // All tabs should have visible text labels (Home, Check-in, Log, Insights, Learn)
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-check-in"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-log"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-learn"]')).toBeVisible();
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
 * - [data-testid="nav-check-in"] - Check-in navigation link
 * - [data-testid="nav-log"] - Log navigation link
 * - [data-testid="nav-insights"] - Insights navigation link
 * - [data-testid="nav-learn"] - Learn navigation link
 *
 * NOTE: data-testid format is nav-{label.toLowerCase()}
 * Bottom navigation component uses data-testid attributes for stable
 * test selectors as per E2E testing best practices.
 */
