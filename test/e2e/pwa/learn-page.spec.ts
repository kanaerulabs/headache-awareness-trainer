import { test, expect } from '@playwright/test';

/**
 * Learn Page E2E Tests
 *
 * Tests educational content navigation:
 * - Content card display
 * - Navigation to content detail pages
 * - Progress tracking
 * - Responsive layout
 * - Touch interactions
 */

test.describe('Learn Page', () => {
  // Ensure user has completed onboarding before each test
  test.beforeEach(async ({ page }) => {
    // Set onboarding as completed
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

  test.describe('Page Load and Content Display', () => {
    test('should load learn page successfully', async ({ page }) => {
      await page.goto('/learn');

      // Verify page loads
      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();

      // Verify EducationHub is displayed
      await expect(page.locator('[data-testid="education-hub"]')).toBeVisible();

      // Verify page title
      await expect(page.locator('text=Learn').first()).toBeVisible();
    });

    test('should display educational content cards', async ({ page }) => {
      await page.goto('/learn');

      // Verify content cards are visible
      const contentCards = page.locator('[role="article"]').or(page.locator('a[href^="/learn/"]'));
      await expect(contentCards.first()).toBeVisible();

      // Should have multiple content cards
      const cardCount = await contentCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should display overall progress bar', async ({ page }) => {
      await page.goto('/learn');

      // Verify progress section
      await expect(page.locator('text=Your progress')).toBeVisible();

      // Verify progress percentage is displayed
      const progressText = page.locator('text=/%/');
      await expect(progressText).toBeVisible();

      // Progress bar should be visible
      const progressBar = page.locator('[role="progressbar"]').or(page.locator('[aria-label*="progress"]'));
      await expect(progressBar.first()).toBeVisible();
    });

    test('should display "Start Learning" section', async ({ page }) => {
      await page.goto('/learn');

      // Verify section heading
      await expect(page.locator('#available-content-heading, text=Start Learning')).toBeVisible();
    });
  });

  test.describe('Content Navigation', () => {
    test('should navigate to content detail page when card clicked', async ({ page }) => {
      await page.goto('/learn');

      // Click first content card
      const firstCard = page.locator('a[href^="/learn/"]').first();
      await firstCard.click();

      // Should navigate to content detail page
      await expect(page).toHaveURL(/\/learn\/.+/);
    });

    test('should display different content IDs for multiple cards', async ({ page }) => {
      await page.goto('/learn');

      // Get all content card links
      const contentLinks = page.locator('a[href^="/learn/"]');
      const linkCount = await contentLinks.count();

      if (linkCount >= 2) {
        // Get href of first two cards
        const href1 = await contentLinks.nth(0).getAttribute('href');
        const href2 = await contentLinks.nth(1).getAttribute('href');

        // Should have different content IDs
        expect(href1).not.toEqual(href2);
      }
    });

    test('should return to learn page from content detail', async ({ page }) => {
      await page.goto('/learn');

      // Navigate to content detail
      const firstCard = page.locator('a[href^="/learn/"]').first();
      await firstCard.click();
      await expect(page).toHaveURL(/\/learn\/.+/);

      // Use browser back button
      await page.goBack();

      // Should be back on learn page
      await expect(page).toHaveURL('/learn');
      await expect(page.locator('[data-testid="education-hub"]')).toBeVisible();
    });
  });

  test.describe('Mobile Viewport (375x667 - iPhone SE)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display learn page responsively on mobile', async ({ page }) => {
      await page.goto('/learn');

      // Page should load
      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();

      // Content should fit viewport
      const pageContainer = page.locator('[data-testid="learn-page"]');
      const containerBox = await pageContainer.boundingBox();

      if (containerBox) {
        expect(containerBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('should display content cards in single column on mobile', async ({ page }) => {
      await page.goto('/learn');

      // Get first two content cards
      const cards = page.locator('a[href^="/learn/"]');
      if (await cards.count() >= 2) {
        const card1Box = await cards.nth(0).boundingBox();
        const card2Box = await cards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // Cards should be stacked vertically (similar X position)
          expect(Math.abs(card1Box.x - card2Box.x)).toBeLessThan(50);

          // Second card should be below first
          expect(card2Box.y).toBeGreaterThan(card1Box.y + card1Box.height - 10);
        }
      }
    });

    test('should display touch-friendly content cards on mobile', async ({ page }) => {
      await page.goto('/learn');

      // Content cards should be large enough for touch
      const firstCard = page.locator('a[href^="/learn/"]').first();
      const cardBox = await firstCard.boundingBox();

      if (cardBox) {
        // Card should be at least 44px tall (accessibility minimum)
        expect(cardBox.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should not overflow viewport horizontally on mobile', async ({ page }) => {
      await page.goto('/learn');

      // Page should not require horizontal scrolling
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(375);
    });

    test('should display readable text on mobile', async ({ page }) => {
      await page.goto('/learn');

      // Page title should be visible and readable
      const pageTitle = page.locator('h1').filter({ hasText: 'Learn' }).first();
      await expect(pageTitle).toBeVisible();

      // Font should be large enough (at least 16px)
      const fontSize = await pageTitle.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(16);
    });
  });

  test.describe('Tablet Viewport (768x1024 - iPad)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should display learn page on tablet', async ({ page }) => {
      await page.goto('/learn');

      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="education-hub"]')).toBeVisible();
    });

    test('should display content cards in grid on tablet', async ({ page }) => {
      await page.goto('/learn');

      // Get first three content cards
      const cards = page.locator('a[href^="/learn/"]');
      if (await cards.count() >= 3) {
        const card1Box = await cards.nth(0).boundingBox();
        const card2Box = await cards.nth(1).boundingBox();
        const card3Box = await cards.nth(2).boundingBox();

        if (card1Box && card2Box && card3Box) {
          // On tablet (sm:grid-cols-2), first two cards should be side-by-side
          expect(Math.abs(card1Box.y - card2Box.y)).toBeLessThan(50); // Same row

          // Cards should have different X positions (side by side)
          expect(Math.abs(card1Box.x - card2Box.x)).toBeGreaterThan(100);
        }
      }
    });

    test('should utilize tablet screen space efficiently', async ({ page }) => {
      await page.goto('/learn');

      // Container should use available space (max-w-2xl = 672px)
      const hubContainer = page.locator('[data-testid="education-hub"]');
      const containerBox = await hubContainer.boundingBox();

      if (containerBox) {
        // Should be centered with reasonable width
        expect(containerBox.width).toBeGreaterThan(400);
        expect(containerBox.width).toBeLessThanOrEqual(672);
      }
    });
  });

  test.describe('Desktop Viewport (1280x720)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display learn page on desktop', async ({ page }) => {
      await page.goto('/learn');

      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="education-hub"]')).toBeVisible();
    });

    test('should display content cards in multi-column grid on desktop', async ({ page }) => {
      await page.goto('/learn');

      // Get content cards
      const cards = page.locator('a[href^="/learn/"]');
      const cardCount = await cards.count();

      if (cardCount >= 3) {
        const card1Box = await cards.nth(0).boundingBox();
        const card2Box = await cards.nth(1).boundingBox();
        const card3Box = await cards.nth(2).boundingBox();

        if (card1Box && card2Box && card3Box) {
          // On desktop (lg:grid-cols-3), first three cards should be in same row
          expect(Math.abs(card1Box.y - card2Box.y)).toBeLessThan(50);
          expect(Math.abs(card1Box.y - card3Box.y)).toBeLessThan(50);
        }
      }
    });

    test('should center content container on desktop', async ({ page }) => {
      await page.goto('/learn');

      const hubContainer = page.locator('[data-testid="education-hub"]');
      const containerBox = await hubContainer.boundingBox();

      if (containerBox) {
        // Container should be centered
        const centerX = containerBox.x + containerBox.width / 2;
        const viewportCenterX = 1280 / 2;

        expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(100);
      }
    });
  });

  test.describe('Touch Interactions', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      hasTouch: true
    });

    test('should handle tap on content card', async ({ page }) => {
      await page.goto('/learn');

      // Tap first content card
      const firstCard = page.locator('a[href^="/learn/"]').first();
      await firstCard.tap();

      // Should navigate to content detail
      await expect(page).toHaveURL(/\/learn\/.+/);
    });

    test('should provide visual feedback on touch', async ({ page }) => {
      await page.goto('/learn');

      const firstCard = page.locator('a[href^="/learn/"]').first();

      // Card should have transition/hover styles
      const classes = await firstCard.getAttribute('class');
      // Most card components have transition classes
      expect(classes).toBeTruthy();
    });
  });

  test.describe('Progress Tracking', () => {
    test('should display progress percentage', async ({ page }) => {
      await page.goto('/learn');

      // Progress should be 0% initially
      const progressText = page.locator('text=/\\d+%/').first();
      await expect(progressText).toBeVisible();

      const progressValue = await progressText.textContent();
      expect(progressValue).toMatch(/\d+%/);
    });

    test('should display progress bar visually', async ({ page }) => {
      await page.goto('/learn');

      // Progress bar should be visible
      const progressBar = page.locator('[role="progressbar"]').or(page.locator('[aria-label*="progress"]'));
      await expect(progressBar.first()).toBeVisible();

      // Should have width style or value attribute
      const firstProgressBar = progressBar.first();
      const hasValue = await firstProgressBar.getAttribute('aria-valuenow').catch(() => null);
      const hasStyle = await firstProgressBar.getAttribute('style').catch(() => null);

      expect(hasValue || hasStyle).toBeTruthy();
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible page structure', async ({ page }) => {
      await page.goto('/learn');

      // Page should have main heading
      const heading = page.locator('h1').filter({ hasText: 'Learn' }).first();
      await expect(heading).toBeVisible();

      // Section headings should be present
      await expect(page.locator('#available-content-heading, h2').first()).toBeVisible();
    });

    test('should have accessible content cards', async ({ page }) => {
      await page.goto('/learn');

      // Content cards should be links
      const firstCard = page.locator('a[href^="/learn/"]').first();
      await expect(firstCard).toHaveAttribute('href');

      // Links should be keyboard accessible
      await page.keyboard.press('Tab');
      // After a few tabs, should reach content cards
    });

    test('should have accessible progress indicator', async ({ page }) => {
      await page.goto('/learn');

      // Progress bar should have aria-label
      const progressBar = page.locator('[role="progressbar"]').or(page.locator('[aria-label*="progress"]'));
      const firstBar = progressBar.first();

      if (await firstBar.isVisible()) {
        const ariaLabel = await firstBar.getAttribute('aria-label').catch(() => null);
        expect(ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Navigation via Bottom Nav', () => {
    test('should navigate to learn page from home via bottom nav', async ({ page }) => {
      await page.goto('/');

      // Click Learn tab in bottom nav
      await page.click('text=Learn');

      // Should navigate to learn page
      await expect(page).toHaveURL('/learn');
      await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();
    });

    test('should show Learn tab as active on learn page', async ({ page }) => {
      await page.goto('/learn');

      // Learn tab should have active styling
      const learnTab = page.locator('a[href="/learn"]').first();
      const classes = await learnTab.getAttribute('class');

      // Active tabs typically have purple color class
      expect(classes).toContain('purple');
    });
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * Learn page:
 * - [data-testid="learn-page"] - Main learn page container
 *
 * EducationHub component:
 * - [data-testid="education-hub"] - Education hub container
 *
 * Content structure:
 * - a[href^="/learn/"] - Content card links (semantic HTML)
 * - [role="progressbar"] or [aria-label*="progress"] - Progress bar
 * - [role="article"] - Optional: content card articles
 * - h1 with text "Learn" - Page title
 * - #available-content-heading - Available content section heading
 *
 * NOTE: Most tests rely on semantic HTML (a, h1, h2, role attributes).
 * The learn page and education-hub testids are the primary requirements.
 */
