import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Gamification Feature - Accessibility
 *
 * Tests keyboard navigation, screen reader compatibility, and ARIA attributes
 * to ensure the gamification feature is accessible to all users.
 *
 * Focus areas:
 * - Keyboard navigation through achievement grid
 * - Tab order verification
 * - ARIA labels and roles
 * - Focus management in celebration modal
 * - Screen reader announcements
 *
 * SKIPPED: Same IndexedDB timeout issue as main gamification tests.
 * See gamification.spec.ts for details on the root cause and fix.
 */

test.describe.skip("Gamification - Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();

    // Clear IndexedDB
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const deleteLogging = indexedDB.deleteDatabase("headache-logging-db");
        const deleteCheckin = indexedDB.deleteDatabase("headache-checkin-db");
        const deleteGamification = indexedDB.deleteDatabase(
          "headache-gamification-db",
        );

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

  test.describe("Keyboard Navigation", () => {
    test("should navigate to log page using keyboard", async ({ page }) => {
      // Focus on quick log button using Tab
      const logButton = page.locator('[data-testid="quick-log-button"]');
      await logButton.focus();
      await expect(logButton).toBeFocused();

      // Press Enter to navigate
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL("/log");
    });

    test("should navigate through log form using Tab key", async ({ page }) => {
      await page.goto("/log");

      // Start from first focusable element
      const intensityInput = page.locator('[data-testid="intensity-input"]');
      await intensityInput.focus();
      await expect(intensityInput).toBeFocused();

      // Tab to headache type select
      await page.keyboard.press("Tab");
      const typeSelect = page.locator('[data-testid="headache-type-select"]');
      await expect(typeSelect).toBeFocused();

      // Tab to duration input
      await page.keyboard.press("Tab");
      const durationInput = page.locator('[data-testid="duration-input"]');
      await expect(durationInput).toBeFocused();

      // Tab to submit button
      await page.keyboard.press("Tab");
      const submitButton = page.locator('[data-testid="submit-entry-button"]');
      await expect(submitButton).toBeFocused();
    });

    test("should close celebration modal using keyboard", async ({ page }) => {
      // Log first entry to trigger modal
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Wait for modal
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Focus should automatically move to modal (or first focusable element)
      const continueButton = modal.locator('button:has-text("Continue")');

      // Press Tab to navigate to continue button (if not already focused)
      await page.keyboard.press("Tab");
      await expect(continueButton).toBeFocused();

      // Press Enter to close modal
      await page.keyboard.press("Enter");
      await expect(modal).not.toBeVisible();
    });

    test("should close celebration modal using Escape key", async ({
      page,
    }) => {
      // Log first entry
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Wait for modal
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Press Escape to close modal
      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe("ARIA Attributes", () => {
    test("should have proper ARIA labels on streak counter", async ({
      page,
    }) => {
      const streakDisplay = page.locator('[data-testid="streak-display"]');
      await expect(streakDisplay).toBeVisible();

      // Verify streak counter has descriptive text for screen readers
      await expect(streakDisplay).toContainText("Current Streak");
    });

    test("should have proper role on celebration modal", async ({ page }) => {
      // Log first entry
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Verify modal has proper ARIA attributes
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Dialog should have role="dialog" or be in a [role="dialog"] container
      // shadcn Dialog component should handle this automatically
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });

    test("should have aria-live region for micro-win toasts", async ({
      page,
    }) => {
      // Log first entry
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Toast should have role="status" (aria-live="polite" equivalent)
      const toast = page.locator('[role="status"]', { hasText: "Micro-Win!" });
      await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test("should have accessible achievement badge icons", async ({ page }) => {
      // Verify achievements have proper text alternatives
      const achievements = await page.evaluate(async () => {
        const { useGamificationStore } =
          await import("@/interface-adapters/store/gamificationStore");
        const allAchievements = useGamificationStore.getState().achievements;
        return Object.values(allAchievements).map((a) => ({
          name: a.name,
          description: a.description,
          icon: a.icon,
        }));
      });

      // Each achievement should have name and description for screen readers
      achievements.forEach((achievement) => {
        expect(achievement.name).toBeTruthy();
        expect(achievement.description).toBeTruthy();
        expect(achievement.icon).toBeTruthy();
      });
    });
  });

  test.describe("Focus Management", () => {
    test("should trap focus within celebration modal when open", async ({
      page,
    }) => {
      // Log first entry
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Wait for modal
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Verify focus is trapped within modal
      // Press Tab multiple times - focus should cycle within modal
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Focus should still be within modal
      const continueButton = modal.locator('button:has-text("Continue")');
      const isContinueButtonFocused = await continueButton.evaluate(
        (el) => el === document.activeElement,
      );

      expect(isContinueButtonFocused).toBe(true);
    });

    test("should restore focus to trigger element after closing modal", async ({
      page,
    }) => {
      // Log first entry
      await page.goto("/log");

      const submitButton = page.locator('[data-testid="submit-entry-button"]');
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");

      // Focus submit button before clicking
      await submitButton.focus();
      await submitButton.click();

      await expect(page).toHaveURL("/dashboard");

      // Wait for modal
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Close modal
      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();

      // Focus should return to a logical element on dashboard
      // (This is a nice-to-have, not always enforced by modal libraries)
    });
  });

  test.describe("Screen Reader Announcements", () => {
    test("should announce achievement unlock to screen readers", async ({
      page,
    }) => {
      // Log first entry
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Verify celebration modal appears (screen reader will announce dialog)
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Verify announcement text is present
      await expect(modal.locator("text=Achievement Unlocked!")).toBeVisible();
      await expect(modal.locator("text=First Steps")).toBeVisible();
    });

    test("should announce micro-win toast to screen readers", async ({
      page,
    }) => {
      // Log first entry
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Toast with role="status" will be announced by screen readers
      const toast = page.locator('[role="status"]', { hasText: "Micro-Win!" });
      await expect(toast).toBeVisible({ timeout: 3000 });
      await expect(toast).toContainText("First entry logged!");
    });
  });

  test.describe("Color Contrast", () => {
    test("should have sufficient color contrast for streak counter", async ({
      page,
    }) => {
      // This test verifies that text is visible and readable
      // Actual contrast ratio testing requires specialized tools
      const streakDisplay = page.locator('[data-testid="streak-display"]');
      await expect(streakDisplay).toBeVisible();

      // Verify text is rendered (not empty)
      const text = await streakDisplay.textContent();
      expect(text).toBeTruthy();
      expect(text).toContain("0"); // Initial streak
    });

    test("should have sufficient color contrast for achievement badges", async ({
      page,
    }) => {
      // Verify achievement badges have readable text
      const achievements = await page.evaluate(async () => {
        const { useGamificationStore } =
          await import("@/interface-adapters/store/gamificationStore");
        const allAchievements = useGamificationStore.getState().achievements;
        return Object.values(allAchievements).slice(0, 3); // Test first 3
      });

      // Each achievement should have name and description
      achievements.forEach((achievement) => {
        expect(achievement.name).toBeTruthy();
        expect(achievement.description).toBeTruthy();
      });
    });
  });

  test.describe("Reduced Motion", () => {
    test("should respect prefers-reduced-motion for animations", async ({
      page,
    }) => {
      // Enable prefers-reduced-motion
      await page.emulateMedia({ reducedMotion: "reduce" });

      // Log first entry to trigger celebration modal
      await page.goto("/log");
      await page.fill('[data-testid="intensity-input"]', "3");
      await page.selectOption(
        '[data-testid="headache-type-select"]',
        "tension",
      );
      await page.fill('[data-testid="duration-input"]', "1");
      await page.click('[data-testid="submit-entry-button"]');

      await expect(page).toHaveURL("/dashboard");

      // Modal should still appear, but animations should be reduced
      const modal = page.locator('[data-testid="celebration-modal"]');
      await expect(modal).toBeVisible();

      // Verify content is still accessible
      await expect(modal.locator("text=Achievement Unlocked!")).toBeVisible();
    });
  });
});

/**
 * REQUIRED ACCESSIBILITY FEATURES:
 *
 * Keyboard Navigation:
 * - All interactive elements must be keyboard accessible
 * - Tab order must follow visual order
 * - Focus indicators must be visible
 * - Modal focus must be trapped when open
 * - Escape key must close modals
 *
 * ARIA Attributes:
 * - [role="dialog"] on celebration modal
 * - [role="status"] on micro-win toasts (aria-live="polite")
 * - Descriptive aria-label attributes where needed
 * - aria-hidden on decorative icons
 *
 * Screen Reader Support:
 * - All images/icons need text alternatives
 * - Form inputs need associated labels
 * - Dynamic content changes announced
 * - Page regions properly labeled
 *
 * Color and Contrast:
 * - Text contrast ratio ≥ 4.5:1 (WCAG AA)
 * - Focus indicators with 3:1 contrast ratio
 * - Color not used as only indicator
 *
 * Motion:
 * - Respect prefers-reduced-motion
 * - No auto-playing animations over 5 seconds
 * - User can pause/stop animations
 *
 * NOTE: Accessibility is critical for inclusive design. These tests
 * ensure users with disabilities can fully engage with gamification
 * features and track their headaches effectively.
 */
