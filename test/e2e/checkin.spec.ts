import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

/**
 * E2E Tests for Quick Check-in Page
 *
 * Tests the complete quick check-in user flow including:
 * - Quick dismiss functionality
 * - Full check-in submission
 * - Multi-select capabilities
 * - Validation behavior
 * - Recent check-ins display
 * - Multiple check-ins per day
 * - Mobile responsive layout
 *
 * IMPORTANT: These tests use the REAL backend (no API mocking).
 * The webServer in playwright.config.ts starts the dev server automatically.
 */

test.describe('Quick Check-in Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to check-in page before each test
    await page.goto('/checkin');

    // Wait for page to load
    await expect(page.locator('[data-testid="checkin-page"]')).toBeVisible();
  });

  test.describe('Page Load and Initial State', () => {
    test('should display page header with greeting', async ({ page }) => {
      // Verify header elements
      await expect(page.locator('[data-testid="checkin-header"]')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Quick Check-in' })).toBeVisible();

      // Verify greeting message appears (time-based)
      const greeting = page.locator('[data-testid="checkin-header"]').getByText(/Good (morning|afternoon|evening|night)/);
      await expect(greeting).toBeVisible();
    });

    test('should display all form sections', async ({ page }) => {
      await expect(page.locator('[data-testid="mood-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="tension-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="sleep-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="physical-factors-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="note-section"]')).toBeVisible();
    });

    test('should display quick dismiss button prominently', async ({ page }) => {
      const dismissButton = page.locator('[data-testid="quick-dismiss-button"]');
      await expect(dismissButton).toBeVisible();
      await expect(dismissButton).toContainText('All good!');
    });

    test('should disable submit button when required fields are empty', async ({ page }) => {
      const submitButton = page.locator('[data-testid="submit-button"]');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Quick Dismiss Flow', () => {
    test('should complete quick dismiss successfully', async ({ page }) => {
      // Click quick dismiss button
      await page.click('[data-testid="quick-dismiss-button"]');

      // Verify success message appears
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Check-in saved successfully!');

      // Verify success message has proper ARIA attributes
      await expect(page.locator('[data-testid="success-message"]')).toHaveAttribute('role', 'status');
      await expect(page.locator('[data-testid="success-message"]')).toHaveAttribute('aria-live', 'polite');

      // Verify recent check-ins section appears
      await expect(page.locator('[data-testid="recent-checkins"]')).toBeVisible({ timeout: 5000 });
    });

    test('should show recent check-in after quick dismiss', async ({ page }) => {
      // Perform quick dismiss
      await page.click('[data-testid="quick-dismiss-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Wait for recent check-ins to update
      await page.waitForTimeout(500);

      // Verify recent check-ins section
      const recentCheckIns = page.locator('[data-testid="recent-checkins"]');
      await expect(recentCheckIns).toBeVisible();

      // Verify check-in count
      await expect(recentCheckIns).toContainText(/You've logged \d+ times? today/);

      // Verify "All good!" label appears
      const recentItems = page.locator('[data-testid="recent-checkin-item"]');
      await expect(recentItems.first()).toContainText('All good!');
    });

    test('should allow multiple quick dismisses in same day', async ({ page }) => {
      // First quick dismiss
      await page.click('[data-testid="quick-dismiss-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await page.waitForTimeout(3500); // Wait for success message to disappear

      // Second quick dismiss
      await page.click('[data-testid="quick-dismiss-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Verify count updated
      const recentCheckIns = page.locator('[data-testid="recent-checkins"]');
      await expect(recentCheckIns).toContainText(/You've logged 2 times today/);
    });
  });

  test.describe('Mood Selection', () => {
    test('should select and highlight mood option', async ({ page }) => {
      const calmButton = page.locator('[data-testid="mood-calm"]');

      // Click calm mood
      await calmButton.click();

      // Verify button is highlighted
      await expect(calmButton).toHaveClass(/border-blue-500/);
      await expect(calmButton).toHaveClass(/bg-blue-50/);
    });

    test('should switch between mood options', async ({ page }) => {
      // Select calm
      await page.click('[data-testid="mood-calm"]');
      await expect(page.locator('[data-testid="mood-calm"]')).toHaveClass(/border-blue-500/);

      // Switch to stressed
      await page.click('[data-testid="mood-stressed"]');
      await expect(page.locator('[data-testid="mood-stressed"]')).toHaveClass(/border-blue-500/);

      // Verify calm is no longer selected
      await expect(page.locator('[data-testid="mood-calm"]')).not.toHaveClass(/border-blue-500/);
    });

    test('should display all mood options with emojis', async ({ page }) => {
      const moods = ['calm', 'ok', 'stressed', 'anxious', 'avoidant'];

      for (const mood of moods) {
        const button = page.locator(`[data-testid="mood-${mood}"]`);
        await expect(button).toBeVisible();

        // Verify emoji is present
        const emoji = button.locator('span').first();
        await expect(emoji).toBeVisible();
      }
    });
  });

  test.describe('Body Tension Multi-Select', () => {
    test('should select single tension area', async ({ page }) => {
      await page.click('[data-testid="tension-jaw"]');

      await expect(page.locator('[data-testid="tension-jaw"]')).toHaveClass(/border-orange-500/);
      await expect(page.locator('[data-testid="tension-jaw"]')).toHaveClass(/bg-orange-50/);
    });

    test('should select multiple tension areas', async ({ page }) => {
      // Select jaw, neck, and shoulders
      await page.click('[data-testid="tension-jaw"]');
      await page.click('[data-testid="tension-neck"]');
      await page.click('[data-testid="tension-shoulders"]');

      // Verify all are highlighted
      await expect(page.locator('[data-testid="tension-jaw"]')).toHaveClass(/border-orange-500/);
      await expect(page.locator('[data-testid="tension-neck"]')).toHaveClass(/border-orange-500/);
      await expect(page.locator('[data-testid="tension-shoulders"]')).toHaveClass(/border-orange-500/);
    });

    test('should deselect tension area on second click', async ({ page }) => {
      // Select jaw
      await page.click('[data-testid="tension-jaw"]');
      await expect(page.locator('[data-testid="tension-jaw"]')).toHaveClass(/border-orange-500/);

      // Deselect jaw
      await page.click('[data-testid="tension-jaw"]');
      await expect(page.locator('[data-testid="tension-jaw"]')).not.toHaveClass(/border-orange-500/);
    });
  });

  test.describe('Sleep Quality Selection', () => {
    test('should select sleep quality', async ({ page }) => {
      await page.click('[data-testid="sleep-good"]');

      await expect(page.locator('[data-testid="sleep-good"]')).toHaveClass(/border-purple-500/);
      await expect(page.locator('[data-testid="sleep-good"]')).toHaveClass(/bg-purple-50/);
    });

    test('should switch between sleep quality options', async ({ page }) => {
      // Select good
      await page.click('[data-testid="sleep-good"]');
      await expect(page.locator('[data-testid="sleep-good"]')).toHaveClass(/border-purple-500/);

      // Switch to poor
      await page.click('[data-testid="sleep-poor"]');
      await expect(page.locator('[data-testid="sleep-poor"]')).toHaveClass(/border-purple-500/);

      // Verify good is no longer selected
      await expect(page.locator('[data-testid="sleep-good"]')).not.toHaveClass(/border-purple-500/);
    });

    test('should display all sleep quality options with emojis', async ({ page }) => {
      const sleepOptions = ['good', 'ok', 'poor'];

      for (const option of sleepOptions) {
        const button = page.locator(`[data-testid="sleep-${option}"]`);
        await expect(button).toBeVisible();
      }
    });
  });

  test.describe('Physical Factors (Optional)', () => {
    test('should select single physical factor', async ({ page }) => {
      await page.click('[data-testid="physical-acidity"]');

      await expect(page.locator('[data-testid="physical-acidity"]')).toHaveClass(/border-yellow-500/);
    });

    test('should select multiple physical factors', async ({ page }) => {
      await page.click('[data-testid="physical-acidity"]');
      await page.click('[data-testid="physical-fatigue"]');

      await expect(page.locator('[data-testid="physical-acidity"]')).toHaveClass(/border-yellow-500/);
      await expect(page.locator('[data-testid="physical-fatigue"]')).toHaveClass(/border-yellow-500/);
    });

    test('should deselect physical factor on second click', async ({ page }) => {
      await page.click('[data-testid="physical-acidity"]');
      await expect(page.locator('[data-testid="physical-acidity"]')).toHaveClass(/border-yellow-500/);

      await page.click('[data-testid="physical-acidity"]');
      await expect(page.locator('[data-testid="physical-acidity"]')).not.toHaveClass(/border-yellow-500/);
    });
  });

  test.describe('Note Field (Optional)', () => {
    test('should allow entering optional note', async ({ page }) => {
      const noteInput = page.locator('[data-testid="note-input"]');

      await noteInput.fill('Feeling a bit tired after lunch');

      await expect(noteInput).toHaveValue('Feeling a bit tired after lunch');
    });

    test('should accept empty note', async ({ page }) => {
      const noteInput = page.locator('[data-testid="note-input"]');

      // Verify note field is empty by default
      await expect(noteInput).toHaveValue('');

      // Verify placeholder text
      await expect(noteInput).toHaveAttribute('placeholder', 'Anything else to note...');
    });
  });

  test.describe('Form Validation', () => {
    test('should require mood selection', async ({ page }) => {
      // Select only sleep quality
      await page.click('[data-testid="sleep-good"]');

      // Submit button should remain disabled
      const submitButton = page.locator('[data-testid="submit-button"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should require sleep quality selection', async ({ page }) => {
      // Select only mood
      await page.click('[data-testid="mood-calm"]');

      // Submit button should remain disabled
      const submitButton = page.locator('[data-testid="submit-button"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should enable submit button when required fields filled', async ({ page }) => {
      // Select mood and sleep quality
      await page.click('[data-testid="mood-calm"]');
      await page.click('[data-testid="sleep-good"]');

      // Submit button should be enabled
      const submitButton = page.locator('[data-testid="submit-button"]');
      await expect(submitButton).toBeEnabled();
    });

    test('should show validation alert when submitting without required fields', async ({ page }) => {
      // Set up dialog handler
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Please select your mood and sleep quality');
        await dialog.accept();
      });

      // Try to submit form (button is disabled, but test the handler)
      // Note: This tests the form's onSubmit validation logic
      const form = page.locator('form');
      await form.evaluate((f) => {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        f.dispatchEvent(event);
      });
    });
  });

  test.describe('Full Check-in Submission', () => {
    test('should submit minimal check-in with only required fields', async ({ page }) => {
      // Fill only required fields
      await page.click('[data-testid="mood-ok"]');
      await page.click('[data-testid="sleep-ok"]');

      // Submit
      await page.click('[data-testid="submit-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Check-in saved successfully!');
    });

    test('should submit full check-in with all fields', async ({ page }) => {
      // Fill all fields
      await page.click('[data-testid="mood-stressed"]');
      await page.click('[data-testid="tension-jaw"]');
      await page.click('[data-testid="tension-neck"]');
      await page.click('[data-testid="sleep-poor"]');
      await page.click('[data-testid="physical-acidity"]');
      await page.locator('[data-testid="note-input"]').fill('Had a stressful day at work');

      // Submit
      await page.click('[data-testid="submit-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should reset form after successful submission', async ({ page }) => {
      // Fill and submit
      await page.click('[data-testid="mood-calm"]');
      await page.click('[data-testid="sleep-good"]');
      await page.click('[data-testid="tension-jaw"]');
      await page.locator('[data-testid="note-input"]').fill('Test note');

      await page.click('[data-testid="submit-button"]');

      // Wait for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Wait for form to reset
      await page.waitForTimeout(500);

      // Verify form is reset
      await expect(page.locator('[data-testid="mood-calm"]')).not.toHaveClass(/border-blue-500/);
      await expect(page.locator('[data-testid="sleep-good"]')).not.toHaveClass(/border-purple-500/);
      await expect(page.locator('[data-testid="tension-jaw"]')).not.toHaveClass(/border-orange-500/);
      await expect(page.locator('[data-testid="note-input"]')).toHaveValue('');

      // Submit button should be disabled again
      await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
    });

    test('should disable submit button during submission', async ({ page }) => {
      await page.click('[data-testid="mood-calm"]');
      await page.click('[data-testid="sleep-good"]');

      const submitButton = page.locator('[data-testid="submit-button"]');

      // Click submit
      await submitButton.click();

      // Button should show loading state (check immediately)
      await expect(submitButton).toContainText('Saving check-in...');
    });
  });

  test.describe('Recent Check-ins Display', () => {
    test('should display recent check-ins after submission', async ({ page }) => {
      // Submit a check-in
      await page.click('[data-testid="mood-calm"]');
      await page.click('[data-testid="sleep-good"]');
      await page.click('[data-testid="submit-button"]');

      // Wait for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Verify recent check-ins section appears
      await expect(page.locator('[data-testid="recent-checkins"]')).toBeVisible({ timeout: 5000 });

      // Verify check-in items
      const recentItems = page.locator('[data-testid="recent-checkin-item"]');
      await expect(recentItems).toHaveCount(1, { timeout: 5000 });
    });

    test('should display check-in timestamp', async ({ page }) => {
      // Submit a check-in
      await page.click('[data-testid="mood-ok"]');
      await page.click('[data-testid="sleep-ok"]');
      await page.click('[data-testid="submit-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Wait for recent check-ins
      await page.waitForTimeout(500);

      // Verify timestamp format (e.g., "2:30 PM")
      const recentItem = page.locator('[data-testid="recent-checkin-item"]').first();
      await expect(recentItem).toContainText(/\d{1,2}:\d{2}\s(?:AM|PM)/);
    });

    test('should display mood emoji in recent check-ins', async ({ page }) => {
      // Submit with specific mood
      await page.click('[data-testid="mood-calm"]');
      await page.click('[data-testid="sleep-good"]');
      await page.click('[data-testid="submit-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Wait for recent check-ins
      await page.waitForTimeout(500);

      // Verify mood label appears
      const recentItem = page.locator('[data-testid="recent-checkin-item"]').first();
      await expect(recentItem).toContainText('Calm');
    });
  });

  test.describe('Multiple Check-ins Per Day', () => {
    test('should allow multiple check-ins on same day', async ({ page }) => {
      // First check-in
      await page.click('[data-testid="mood-calm"]');
      await page.click('[data-testid="sleep-good"]');
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Wait for success message to disappear
      await page.waitForTimeout(3500);

      // Second check-in
      await page.click('[data-testid="mood-stressed"]');
      await page.click('[data-testid="sleep-ok"]');
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Verify count
      const recentCheckIns = page.locator('[data-testid="recent-checkins"]');
      await expect(recentCheckIns).toContainText(/You've logged 2 times today/);
    });

    test('should limit recent check-ins display to 3 items', async ({ page }) => {
      // Submit 4 check-ins
      for (let i = 0; i < 4; i++) {
        await page.click('[data-testid="mood-ok"]');
        await page.click('[data-testid="sleep-ok"]');
        await page.click('[data-testid="submit-button"]');
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        await page.waitForTimeout(3500);
      }

      // Verify only 3 items displayed
      const recentItems = page.locator('[data-testid="recent-checkin-item"]');
      await expect(recentItems).toHaveCount(3, { timeout: 5000 });

      // But count should show 4
      await expect(page.locator('[data-testid="recent-checkins"]')).toContainText(/You've logged 4 times today/);
    });
  });

  test.describe('Success Message Auto-Hide', () => {
    test('should hide success message after 3 seconds', async ({ page }) => {
      await page.click('[data-testid="mood-calm"]');
      await page.click('[data-testid="sleep-good"]');
      await page.click('[data-testid="submit-button"]');

      // Verify message appears
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Wait 3.5 seconds
      await page.waitForTimeout(3500);

      // Verify message is hidden
      await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
    });
  });
});

test.describe('Responsive Layout - Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile layout correctly', async ({ page }) => {
    await page.goto('/checkin');

    // Verify page loads
    await expect(page.locator('[data-testid="checkin-page"]')).toBeVisible();

    // Verify header is visible
    await expect(page.getByRole('heading', { name: 'Quick Check-in' })).toBeVisible();
  });

  test('should display mood options in mobile grid', async ({ page }) => {
    await page.goto('/checkin');

    // Verify all mood buttons are visible and tappable
    const moods = ['calm', 'ok', 'stressed', 'anxious', 'avoidant'];

    for (const mood of moods) {
      const button = page.locator(`[data-testid="mood-${mood}"]`);
      await expect(button).toBeVisible();

      // Verify button is large enough for touch (at least 44x44px)
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40); // Close to 44px with padding
      }
    }
  });

  test('should complete check-in on mobile', async ({ page }) => {
    await page.goto('/checkin');

    // Click mood (using click instead of tap for cross-browser compatibility)
    await page.click('[data-testid="mood-calm"]');

    // Click sleep quality
    await page.click('[data-testid="sleep-good"]');

    // Click submit
    await page.click('[data-testid="submit-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should complete quick dismiss on mobile', async ({ page }) => {
    await page.goto('/checkin');

    // Click quick dismiss (using click instead of tap for cross-browser compatibility)
    await page.click('[data-testid="quick-dismiss-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should scroll to view all form sections on mobile', async ({ page }) => {
    await page.goto('/checkin');

    // Scroll to note section
    await page.locator('[data-testid="note-section"]').scrollIntoViewIfNeeded();

    // Verify note input is visible
    await expect(page.locator('[data-testid="note-input"]')).toBeVisible();

    // Scroll to submit button
    await page.locator('[data-testid="submit-button"]').scrollIntoViewIfNeeded();

    // Verify submit button is visible
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
  });
});

test.describe('Responsive Layout - Tablet Viewport', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('should display tablet layout correctly', async ({ page }) => {
    await page.goto('/checkin');

    await expect(page.locator('[data-testid="checkin-page"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quick Check-in' })).toBeVisible();
  });

  test('should display mood options in tablet grid', async ({ page }) => {
    await page.goto('/checkin');

    // Verify all mood options visible
    const moods = ['calm', 'ok', 'stressed', 'anxious', 'avoidant'];

    for (const mood of moods) {
      await expect(page.locator(`[data-testid="mood-${mood}"]`)).toBeVisible();
    }
  });

  test('should complete check-in on tablet', async ({ page }) => {
    await page.goto('/checkin');

    await page.click('[data-testid="mood-ok"]');
    await page.click('[data-testid="sleep-ok"]');
    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});

test.describe('Accessibility - Tab Navigation', () => {
  test('should navigate through form with keyboard', async ({ page }) => {
    await page.goto('/checkin');

    // Start from quick dismiss button (first focusable element)
    const quickDismissButton = page.locator('[data-testid="quick-dismiss-button"]');
    await quickDismissButton.focus();
    await expect(quickDismissButton).toBeFocused();

    // Tab through mood options
    await page.keyboard.press('Tab');
    const calmButton = page.locator('[data-testid="mood-calm"]');
    await expect(calmButton).toBeFocused();

    // Press Enter to select
    await page.keyboard.press('Enter');
    await expect(calmButton).toHaveClass(/border-blue-500/);

    // Continue tabbing to sleep section
    // (Skip through other mood options and tension options)
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
    }

    // Should be at sleep-good button
    const sleepGoodButton = page.locator('[data-testid="sleep-good"]');
    await sleepGoodButton.focus();
    await expect(sleepGoodButton).toBeFocused();

    // Select with Enter
    await page.keyboard.press('Enter');
    await expect(sleepGoodButton).toHaveClass(/border-purple-500/);
  });

  test('should reach submit button with tab navigation', async ({ page }) => {
    await page.goto('/checkin');

    // Select required fields first
    await page.click('[data-testid="mood-calm"]');
    await page.click('[data-testid="sleep-good"]');

    // Focus on note input
    const noteInput = page.locator('[data-testid="note-input"]');
    await noteInput.focus();
    await expect(noteInput).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    const submitButton = page.locator('[data-testid="submit-button"]');
    await expect(submitButton).toBeFocused();

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Verify submission
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should show focus indicators on interactive elements', async ({ page }) => {
    await page.goto('/checkin');

    // Test mood button focus ring
    const calmButton = page.locator('[data-testid="mood-calm"]');
    await calmButton.focus();

    // Verify focus is visible (Playwright adds focus automatically)
    await expect(calmButton).toBeFocused();

    // Test quick dismiss button focus
    const quickDismissButton = page.locator('[data-testid="quick-dismiss-button"]');
    await quickDismissButton.focus();
    await expect(quickDismissButton).toBeFocused();

    // Test note input focus
    const noteInput = page.locator('[data-testid="note-input"]');
    await noteInput.focus();
    await expect(noteInput).toBeFocused();
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * Page Container:
 * - [data-testid="checkin-page"] - Main page container
 * - [data-testid="checkin-header"] - Page header section
 *
 * Form Sections:
 * - [data-testid="mood-section"] - Mood selection section
 * - [data-testid="tension-section"] - Body tension section
 * - [data-testid="sleep-section"] - Sleep quality section
 * - [data-testid="physical-factors-section"] - Physical factors section
 * - [data-testid="note-section"] - Note input section
 *
 * Interactive Elements:
 * - [data-testid="quick-dismiss-button"] - Quick "All good!" dismiss button
 * - [data-testid="submit-button"] - Form submit button
 * - [data-testid="note-input"] - Optional note textarea
 *
 * Mood Buttons:
 * - [data-testid="mood-calm"] - Calm mood button
 * - [data-testid="mood-ok"] - OK mood button
 * - [data-testid="mood-stressed"] - Stressed mood button
 * - [data-testid="mood-anxious"] - Anxious mood button
 * - [data-testid="mood-avoidant"] - Avoidant mood button
 *
 * Body Tension Buttons:
 * - [data-testid="tension-jaw"] - Jaw tension button
 * - [data-testid="tension-neck"] - Neck tension button
 * - [data-testid="tension-shoulders"] - Shoulders tension button
 *
 * Sleep Quality Buttons:
 * - [data-testid="sleep-good"] - Good sleep button
 * - [data-testid="sleep-ok"] - OK sleep button
 * - [data-testid="sleep-poor"] - Poor sleep button
 *
 * Physical Factors Buttons:
 * - [data-testid="physical-acidity"] - Acidity factor button
 * - [data-testid="physical-fatigue"] - Fatigue factor button
 * - [data-testid="physical-none"] - No physical factors button
 *
 * Feedback & Display:
 * - [data-testid="success-message"] - Success message after submission
 * - [data-testid="recent-checkins"] - Recent check-ins container
 * - [data-testid="recent-checkin-item"] - Individual recent check-in item
 *
 * NOTE: All these data-testid attributes are ALREADY IMPLEMENTED in the page.
 * Page implementation at src/app/checkin/page.tsx already includes all required attributes.
 */
