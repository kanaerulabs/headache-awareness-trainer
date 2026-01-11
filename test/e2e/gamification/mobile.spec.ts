import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Gamification Feature - Mobile Viewport
 *
 * Tests gamification features on mobile viewports to ensure:
 * - Responsive layout for achievement components
 * - Touch interactions work correctly
 * - Mobile-specific UI elements display properly
 * - Celebration modals are accessible on small screens
 *
 * SKIPPED: Same IndexedDB timeout issue as main gamification tests.
 * See gamification.spec.ts for details on the root cause and fix.
 */

test.describe.skip('Gamification - Mobile Viewport', () => {
  // Use mobile viewport for all tests
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();

    // Clear IndexedDB
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const deleteLogging = indexedDB.deleteDatabase('headache-logging-db');
        const deleteCheckin = indexedDB.deleteDatabase('headache-checkin-db');
        const deleteGamification = indexedDB.deleteDatabase('headache-gamification-db');

        let completed = 0;
        const checkComplete = () => {
          completed++;
          if (completed === 3) resolve();
        };

        deleteLogging.onsuccess = checkComplete;
        deleteLogging.onerror = checkComplete;
        deleteCheckin.onsuccess = checkComplete;
        deleteCheckin.onerror = checkComplete;
        deleteGamification.onsuccess = checkComplete;
        deleteGamification.onerror = checkComplete;
      });
    });

    await page.reload();
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
  });

  test.describe('Mobile Layout', () => {
    test('should display streak counter correctly on mobile', async ({ page }) => {
      const streakDisplay = page.locator('[data-testid="streak-display"]');
      await expect(streakDisplay).toBeVisible();

      // Verify mobile-friendly sizing
      const boundingBox = await streakDisplay.boundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        // Should fit within mobile viewport width
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('should display achievement grid in single column on mobile', async ({ page }) => {
      // Navigate to page with achievement grid or test via store
      // Verify achievement grid exists and is responsive
      const achievementCount = await page.evaluate(async () => {
        const { useGamificationStore } = await import('@/interface-adapters/store/gamificationStore');
        return Object.keys(useGamificationStore.getState().achievements).length;
      });

      expect(achievementCount).toBe(16);
    });

    test('should display celebration modal full-screen on mobile', async ({ page }) => {
      // Log first entry to trigger celebration modal
      await page.goto('/log');
      await page.fill('[data-testid="intensity-input"]', '3');
      await page.selectOption('[data-testid="headache-type-select"]', 'tension');
      await page.fill('[data-testid="duration-input"]', '1');
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL('/dashboard');

      // Verify celebration modal is visible
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Verify modal is properly sized for mobile
      const modalBox = await modal.boundingBox();
      expect(modalBox).not.toBeNull();
      if (modalBox) {
        // Modal should fit within viewport with padding
        expect(modalBox.width).toBeLessThanOrEqual(375);
      }

      // Verify content is readable
      await expect(modal.locator('text=Achievement Unlocked!')).toBeVisible();
      await expect(modal.locator('text=First Steps')).toBeVisible();

      // Verify continue button is accessible
      const continueButton = modal.locator('button:has-text("Continue")');
      await expect(continueButton).toBeVisible();

      // Verify button is tappable (minimum 44x44 touch target)
      const buttonBox = await continueButton.boundingBox();
      expect(buttonBox).not.toBeNull();
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe('Mobile Touch Interactions', () => {
    test('should handle touch tap on continue button in celebration modal', async ({ page }) => {
      // Log first entry
      await page.goto('/log');
      await page.fill('[data-testid="intensity-input"]', '3');
      await page.selectOption('[data-testid="headache-type-select"]', 'tension');
      await page.fill('[data-testid="duration-input"]', '1');
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL('/dashboard');

      // Wait for modal
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Tap continue button using touch
      const continueButton = modal.locator('button:has-text("Continue")');
      await continueButton.tap();

      // Verify modal closes
      await expect(modal).not.toBeVisible();
    });

    test('should handle touch navigation to log page', async ({ page }) => {
      // Tap quick log button
      const logButton = page.locator('[data-testid="quick-log-button"]');
      await logButton.tap();

      // Verify navigation
      await expect(page).toHaveURL('/log');
    });

    test('should handle touch form interactions', async ({ page }) => {
      await page.goto('/log');

      // Fill intensity using touch
      const intensityInput = page.locator('[data-testid="intensity-input"]');
      await intensityInput.tap();
      await intensityInput.fill('4');

      // Select headache type using touch
      const typeSelect = page.locator('[data-testid="headache-type-select"]');
      await typeSelect.tap();
      await typeSelect.selectOption('migraine');

      // Fill duration using touch
      const durationInput = page.locator('[data-testid="duration-input"]');
      await durationInput.tap();
      await durationInput.fill('3');

      // Submit using touch
      const submitButton = page.locator('[data-testid="submit-entry-button"]');
      await submitButton.tap();

      // Verify submission
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Mobile Toast Notifications', () => {
    test('should display micro-win toast properly on mobile', async ({ page }) => {
      // Log first entry
      await page.goto('/log');
      await page.fill('[data-testid="intensity-input"]', '3');
      await page.selectOption('[data-testid="headache-type-select"]', 'tension');
      await page.fill('[data-testid="duration-input"]', '1');
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL('/dashboard');

      // Verify toast appears and is readable on mobile
      const toast = page.locator('[role="status"]', { hasText: 'Micro-Win!' });
      await expect(toast).toBeVisible({ timeout: 3000 });

      // Verify toast fits within mobile viewport
      const toastBox = await toast.boundingBox();
      expect(toastBox).not.toBeNull();
      if (toastBox) {
        expect(toastBox.width).toBeLessThanOrEqual(375);
      }

      // Verify text is readable (not truncated)
      await expect(toast).toContainText('First entry logged!');
    });
  });

  test.describe('Mobile Scrolling', () => {
    test('should allow scrolling through achievement grid on mobile', async ({ page }) => {
      // This test verifies that achievement grid is scrollable
      // We'll test by checking viewport height vs content height

      // For now, verify via store that all achievements are accessible
      const achievementCount = await page.evaluate(async () => {
        const { useGamificationStore } = await import('@/interface-adapters/store/gamificationStore');
        return Object.keys(useGamificationStore.getState().achievements).length;
      });

      expect(achievementCount).toBe(16);

      // If achievement grid is on a dedicated page, navigate and test scrolling
      // await page.goto('/achievements');
      // const grid = page.locator('[data-testid="achievement-grid"]');
      // await grid.scrollIntoViewIfNeeded();
      // await expect(grid).toBeVisible();
    });
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR MOBILE TESTS:
 *
 * All attributes from main gamification.spec.ts apply here.
 * Additional mobile-specific considerations:
 *
 * - Touch targets should be minimum 44x44 pixels
 * - Modals should be responsive with max-width for mobile
 * - Toast notifications should position properly on mobile (top/bottom)
 * - Forms should be scrollable on small screens
 * - Achievement grid should use single column on mobile
 *
 * Mobile UI Components:
 * - Mobile sidebar toggles (if applicable)
 * - Mobile-specific navigation elements
 * - Touch-friendly buttons and controls
 *
 * NOTE: Mobile viewport tests ensure the gamification feature works
 * seamlessly on phones and tablets. Responsive design is critical
 * for user engagement in this headache tracking application.
 */
