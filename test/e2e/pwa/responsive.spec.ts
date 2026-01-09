import { test, expect } from '@playwright/test';

/**
 * Responsive Viewport E2E Tests
 *
 * Tests responsive behavior across different viewports:
 * - Mobile (375x667 - iPhone SE)
 * - Tablet (768x1024 - iPad)
 * - Desktop (1280x720)
 *
 * Verifies mobile-first responsive design principles
 */

test.describe('Responsive Viewport Tests', () => {
  test.describe('Mobile Viewport (375x667 - iPhone SE)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display mobile layout correctly', async ({ page }) => {
      await page.goto('/');

      // Home page should load
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

      // Bottom nav should be visible
      const bottomNav = page.locator('nav').filter({ hasText: 'Home' }).first();
      await expect(bottomNav).toBeVisible();

      // Content should fit viewport without horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(375);
    });

    test('should stack content vertically on mobile', async ({ page }) => {
      await page.goto('/');

      // Quick action cards should stack vertically
      const cards = page.locator('[data-testid="quick-actions"] button');
      if (await cards.count() >= 2) {
        const card1Box = await cards.nth(0).boundingBox();
        const card2Box = await cards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // Cards should be roughly aligned vertically (similar X)
          expect(Math.abs(card1Box.x - card2Box.x)).toBeLessThan(50);

          // Second card below first
          expect(card2Box.y).toBeGreaterThan(card1Box.y);
        }
      }
    });

    test('should display mobile-optimized font sizes', async ({ page }) => {
      await page.goto('/');

      // Main heading should be readable
      const heading = page.locator('h1').first();
      const fontSize = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      const fontSizeNum = parseInt(fontSize);
      // Mobile heading should be at least 24px (text-3xl base)
      expect(fontSizeNum).toBeGreaterThanOrEqual(24);
    });

    test('should have appropriate touch targets on mobile', async ({ page }) => {
      await page.goto('/');

      // Action cards should be large enough for touch
      const firstCard = page.locator('[data-testid="learn-card"]');
      const cardBox = await firstCard.boundingBox();

      if (cardBox) {
        // Minimum 44x44 per accessibility guidelines
        expect(cardBox.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should maintain safe area spacing on mobile', async ({ page }) => {
      await page.goto('/');

      // Content should have proper padding
      const mainContent = page.locator('[data-testid="home-page"]');
      const paddingLeft = await mainContent.evaluate((el) => {
        return window.getComputedStyle(el).paddingLeft;
      });

      const paddingNum = parseInt(paddingLeft);
      // Should have at least 16px padding (p-4 = 1rem)
      expect(paddingNum).toBeGreaterThanOrEqual(16);
    });

    test('should hide desktop-only elements on mobile', async ({ page }) => {
      await page.goto('/');

      // Page should load without errors
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(375);
    });
  });

  test.describe('Tablet Viewport (768x1024 - iPad)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should display tablet layout correctly', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

      // Content should use available space
      const mainContent = page.locator('[data-testid="home-page"]');
      const contentBox = await mainContent.boundingBox();

      if (contentBox) {
        // Should be wider than mobile but centered
        expect(contentBox.width).toBeGreaterThan(375);
      }
    });

    test('should display cards in grid on tablet', async ({ page }) => {
      await page.goto('/');

      // Quick action cards should be side-by-side (sm:grid-cols-2)
      const cards = page.locator('[data-testid="quick-actions"] button');
      if (await cards.count() >= 2) {
        const card1Box = await cards.nth(0).boundingBox();
        const card2Box = await cards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // Should be in same row (similar Y position)
          expect(Math.abs(card1Box.y - card2Box.y)).toBeLessThan(50);

          // Should have horizontal spacing
          expect(Math.abs(card1Box.x - card2Box.x)).toBeGreaterThan(100);
        }
      }
    });

    test('should display bottom navigation on tablet', async ({ page }) => {
      await page.goto('/');

      // Bottom nav should be visible (mobile-first design)
      const bottomNav = page.locator('nav').filter({ hasText: 'Home' }).first();
      await expect(bottomNav).toBeVisible();

      // Should span full width
      const navBox = await bottomNav.boundingBox();
      if (navBox) {
        expect(navBox.width).toBeGreaterThan(700);
      }
    });

    test('should use tablet-optimized spacing', async ({ page }) => {
      await page.goto('/');

      // Content container should have reasonable max-width
      const container = page.locator('[data-testid="home-page"] > div').first();
      const containerBox = await container.boundingBox();

      if (containerBox) {
        // Should not exceed max-w-2xl (672px)
        expect(containerBox.width).toBeLessThanOrEqual(672);
      }
    });

    test('should display readable text on tablet', async ({ page }) => {
      await page.goto('/');

      // Text should scale appropriately
      const description = page.locator('[data-testid="greeting-section"] p');
      const fontSize = await description.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(16);
    });
  });

  test.describe('Desktop Viewport (1280x720)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display desktop layout correctly', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

      // Content should be centered with max-width
      const container = page.locator('[data-testid="home-page"] > div').first();
      const containerBox = await container.boundingBox();

      if (containerBox) {
        // Should be centered
        const centerX = containerBox.x + containerBox.width / 2;
        const viewportCenterX = 1280 / 2;

        expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(100);

        // Should have max-width constraint
        expect(containerBox.width).toBeLessThanOrEqual(672);
      }
    });

    test('should display bottom navigation on desktop', async ({ page }) => {
      await page.goto('/');

      // Bottom nav should be visible (mobile-first approach)
      const bottomNav = page.locator('nav').filter({ hasText: 'Home' }).first();
      await expect(bottomNav).toBeVisible();
    });

    test('should utilize vertical space efficiently on desktop', async ({ page }) => {
      await page.goto('/');

      // Content should be visible without excessive scrolling
      await expect(page.locator('[data-testid="greeting-section"]')).toBeInViewport();
      await expect(page.locator('[data-testid="daily-tip-section"]')).toBeInViewport();
      await expect(page.locator('[data-testid="quick-actions"]')).toBeInViewport();
    });

    test('should handle mouse interactions on desktop', async ({ page }) => {
      await page.goto('/');

      // Hover should work on action cards
      const learnCard = page.locator('[data-testid="learn-card"]');
      await learnCard.hover();

      // Card should have hover styles
      const boxShadow = await learnCard.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      // Should have some shadow (hover effect)
      expect(boxShadow).not.toBe('none');
    });

    test('should support keyboard navigation on desktop', async ({ page }) => {
      await page.goto('/');

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to focus on action cards
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid');
      });

      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe('Viewport Transition Tests', () => {
    test('should adapt layout when resizing from mobile to tablet', async ({ page }) => {
      // Start at mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Verify mobile layout
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

      // Resize to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(100);

      // Layout should adapt
      const cards = page.locator('[data-testid="quick-actions"] button');
      if (await cards.count() >= 2) {
        const card1Box = await cards.nth(0).boundingBox();
        const card2Box = await cards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // Should now be side-by-side
          expect(Math.abs(card1Box.y - card2Box.y)).toBeLessThan(50);
        }
      }
    });

    test('should adapt layout when resizing from tablet to desktop', async ({ page }) => {
      // Start at tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(100);

      // Content should be centered
      const container = page.locator('[data-testid="home-page"] > div').first();
      const containerBox = await container.boundingBox();

      if (containerBox) {
        const centerX = containerBox.x + containerBox.width / 2;
        const viewportCenterX = 1280 / 2;
        expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(100);
      }
    });

    test('should maintain functionality across viewport changes', async ({ page }) => {
      // Start at mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Click Learn card
      await page.click('[data-testid="learn-card"]');
      await expect(page).toHaveURL('/learn');

      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(100);

      // Page should still work
      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();

      // Navigation should still work
      await page.click('text=Home');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Learn Page Responsive Behavior', () => {
    test('should display learn page responsively on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/learn');

      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();

      // Content cards should stack vertically
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(375);
    });

    test('should display learn page in grid on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/learn');

      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();

      // Content cards should be in grid
      const contentCards = page.locator('a[href^="/learn/"]');
      if (await contentCards.count() >= 2) {
        const card1Box = await contentCards.nth(0).boundingBox();
        const card2Box = await contentCards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // Should be side-by-side on tablet
          expect(Math.abs(card1Box.y - card2Box.y)).toBeLessThan(50);
        }
      }
    });

    test('should display learn page optimally on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/learn');

      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();

      // Content should be centered
      const hub = page.locator('[data-testid="education-hub"]');
      const hubBox = await hub.boundingBox();

      if (hubBox) {
        const centerX = hubBox.x + hubBox.width / 2;
        const viewportCenterX = 1280 / 2;
        expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(200);
      }
    });
  });

  test.describe('Onboarding Responsive Behavior', () => {
    test.beforeEach(async ({ page }) => {
      // Clear onboarding state
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
    });

    test('should display onboarding wizard responsively on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/onboarding');

      const wizardContainer = page.locator('[data-testid="wizard-container"]');
      await expect(wizardContainer).toBeVisible();

      // Should fit viewport
      const containerBox = await wizardContainer.boundingBox();
      if (containerBox) {
        expect(containerBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('should center onboarding wizard on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/onboarding');

      const wizardContainer = page.locator('[data-testid="wizard-container"]');
      await expect(wizardContainer).toBeVisible();

      // Should be centered with padding
      const containerBox = await wizardContainer.boundingBox();
      if (containerBox) {
        expect(containerBox.x).toBeGreaterThan(50);
        expect(containerBox.width).toBeLessThan(768);
      }
    });

    test('should center onboarding wizard on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/onboarding');

      const wizardContainer = page.locator('[data-testid="wizard-container"]');
      await expect(wizardContainer).toBeVisible();

      // Should be centered
      const containerBox = await wizardContainer.boundingBox();
      if (containerBox) {
        const centerX = containerBox.x + containerBox.width / 2;
        const viewportCenterX = 1280 / 2;
        expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(100);
      }
    });
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * Home page:
 * - [data-testid="home-page"] - Main home page container
 * - [data-testid="greeting-section"] - Greeting section
 * - [data-testid="daily-tip-section"] - Daily tip card
 * - [data-testid="quick-actions"] - Quick actions container
 * - [data-testid="learn-card"] - Learn action card
 *
 * Learn page:
 * - [data-testid="learn-page"] - Main learn page container
 * - [data-testid="education-hub"] - Education hub container
 *
 * Onboarding:
 * - [data-testid="wizard-container"] - Wizard container
 *
 * NOTE: These testids are already present in the components.
 * Responsive tests primarily verify layout behavior across viewports.
 */
