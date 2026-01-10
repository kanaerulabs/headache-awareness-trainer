import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Settings & Customization Page
 *
 * Tests comprehensive settings functionality including:
 * - Navigation to settings from dashboard
 * - Reminder configuration
 * - Tracked factors customization
 * - Custom headache types
 * - Display settings (theme, intensity scale)
 * - Data export (JSON/CSV)
 * - Clear data with confirmation
 * - Mobile responsive layout (accordion)
 * - Desktop layout (expanded cards)
 * - Data persistence across page reloads
 *
 * IMPORTANT: These tests use the REAL backend (no API mocking).
 * The webServer in playwright.config.ts starts the dev server automatically.
 */

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page before each test
    await page.goto("/settings");

    // Wait for page to load
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
  });

  test.describe("Page Load and Navigation", () => {
    test("should display settings page with header", async ({ page }) => {
      // Verify page header
      await expect(
        page.getByRole("heading", { name: "Settings" }),
      ).toBeVisible();
      await expect(
        page.getByText("Customize your headache tracking experience"),
      ).toBeVisible();
    });

    test("should have back button that navigates to dashboard", async ({
      page,
    }) => {
      const backButton = page.locator('[data-testid="back-button"]');
      await expect(backButton).toBeVisible();
      await expect(backButton).toHaveAttribute(
        "aria-label",
        "Go back to dashboard",
      );

      // Click back button
      await backButton.click();

      // Verify navigation to home page
      await expect(page).toHaveURL("/");
    });

    test("should display all settings sections", async ({ page }) => {
      // Check for all section headings (visible in desktop or accordion items in mobile)
      const sectionTitles = [
        "Reminders",
        "Tracking Preferences",
        "Headache Types",
        "Display",
        "Data Management",
        "About & Help",
      ];

      for (const title of sectionTitles) {
        await expect(page.getByText(title, { exact: false })).toBeVisible();
      }
    });
  });

  test.describe("Reminder Configuration", () => {
    test("should enable and disable reminders", async ({ page }) => {
      const reminderSwitch = page.locator(
        '[data-testid="reminders-enabled-switch"]',
      );

      // Get initial state
      const initialState = await reminderSwitch.getAttribute("aria-checked");

      // Toggle reminders
      await reminderSwitch.click();

      // Verify state changed
      const newState = await reminderSwitch.getAttribute("aria-checked");
      expect(newState).not.toBe(initialState);

      // Toggle back
      await reminderSwitch.click();
      const finalState = await reminderSwitch.getAttribute("aria-checked");
      expect(finalState).toBe(initialState);
    });

    test("should add a reminder time", async ({ page }) => {
      // Enable reminders first
      const reminderSwitch = page.locator(
        '[data-testid="reminders-enabled-switch"]',
      );
      const isEnabled = await reminderSwitch.getAttribute("aria-checked");

      if (isEnabled !== "true") {
        await reminderSwitch.click();
        await page.waitForTimeout(300);
      }

      // Add a new time
      const timeInput = page.locator('[data-testid="time-input"]');
      await timeInput.fill("14:30");

      const addButton = page.locator('[data-testid="add-time-button"]');
      await addButton.click();

      // Verify time appears in list
      await expect(
        page.locator('[data-testid="time-item-14:30"]'),
      ).toBeVisible();
    });

    test("should remove a reminder time", async ({ page }) => {
      // Enable reminders
      const reminderSwitch = page.locator(
        '[data-testid="reminders-enabled-switch"]',
      );
      const isEnabled = await reminderSwitch.getAttribute("aria-checked");

      if (isEnabled !== "true") {
        await reminderSwitch.click();
        await page.waitForTimeout(300);
      }

      // Add a time first
      const timeInput = page.locator('[data-testid="time-input"]');
      await timeInput.fill("10:00");
      await page.locator('[data-testid="add-time-button"]').click();
      await page.waitForTimeout(300);

      // Remove the time
      const removeButton = page.locator('[data-testid="remove-time-10:00"]');
      await removeButton.click();

      // Verify time is removed
      await expect(
        page.locator('[data-testid="time-item-10:00"]'),
      ).not.toBeVisible();
    });

    test("should toggle reminder days", async ({ page }) => {
      // Enable reminders
      const reminderSwitch = page.locator(
        '[data-testid="reminders-enabled-switch"]',
      );
      const isEnabled = await reminderSwitch.getAttribute("aria-checked");

      if (isEnabled !== "true") {
        await reminderSwitch.click();
        await page.waitForTimeout(300);
      }

      // Toggle Monday
      const mondayToggle = page.locator('[data-testid="day-toggle-mon"]');
      const initialState = await mondayToggle.getAttribute("data-state");

      await mondayToggle.click();
      await page.waitForTimeout(300);

      const newState = await mondayToggle.getAttribute("data-state");
      expect(newState).not.toBe(initialState);
    });

    test("should change reminder style", async ({ page }) => {
      // Enable reminders
      const reminderSwitch = page.locator(
        '[data-testid="reminders-enabled-switch"]',
      );
      const isEnabled = await reminderSwitch.getAttribute("aria-checked");

      if (isEnabled !== "true") {
        await reminderSwitch.click();
        await page.waitForTimeout(300);
      }

      // Select persistent style
      const persistentOption = page.locator('[data-testid="style-persistent"]');
      await persistentOption.click();
      await page.waitForTimeout(300);

      // Verify selection (radio button should be checked)
      const radioButton = persistentOption.locator('button[role="radio"]');
      await expect(radioButton).toHaveAttribute("aria-checked", "true");
    });

    test("should persist reminder settings after page reload", async ({
      page,
    }) => {
      // Enable reminders
      const reminderSwitch = page.locator(
        '[data-testid="reminders-enabled-switch"]',
      );
      await reminderSwitch.click();
      await page.waitForTimeout(500);

      // Add a time
      await page.locator('[data-testid="time-input"]').fill("15:45");
      await page.locator('[data-testid="add-time-button"]').click();
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();

      // Verify settings persisted
      await expect(
        page.locator('[data-testid="reminders-enabled-switch"]'),
      ).toHaveAttribute("aria-checked", "true");
      await expect(
        page.locator('[data-testid="time-item-15:45"]'),
      ).toBeVisible();
    });
  });

  test.describe("Tracked Factors", () => {
    test("should toggle off a default factor", async ({ page }) => {
      const sleepToggle = page.locator('[data-testid="toggle-sleep"]');

      // Get initial state
      const initialState = await sleepToggle.getAttribute("aria-checked");

      // Toggle the factor
      await sleepToggle.click();
      await page.waitForTimeout(300);

      // Verify state changed
      const newState = await sleepToggle.getAttribute("aria-checked");
      expect(newState).not.toBe(initialState);
    });

    test("should add a custom factor", async ({ page }) => {
      const customFactorInput = page.locator(
        '[data-testid="custom-factor-input"]',
      );
      const addButton = page.locator('[data-testid="add-factor-button"]');

      // Add a custom factor
      await customFactorInput.fill("Exercise");
      await addButton.click();
      await page.waitForTimeout(300);

      // Verify factor appears in list
      await expect(
        page.locator('[data-testid="custom-factor-Exercise"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="custom-factor-Exercise"]'),
      ).toContainText("Exercise");
    });

    test("should remove a custom factor", async ({ page }) => {
      // Add a custom factor first
      await page.locator('[data-testid="custom-factor-input"]').fill("Weather");
      await page.locator('[data-testid="add-factor-button"]').click();
      await page.waitForTimeout(300);

      // Verify it appears
      await expect(
        page.locator('[data-testid="custom-factor-Weather"]'),
      ).toBeVisible();

      // Remove it
      await page.locator('[data-testid="remove-factor-Weather"]').click();
      await page.waitForTimeout(300);

      // Verify it's removed
      await expect(
        page.locator('[data-testid="custom-factor-Weather"]'),
      ).not.toBeVisible();
    });

    test("should prevent adding empty custom factor", async ({ page }) => {
      const customFactorInput = page.locator(
        '[data-testid="custom-factor-input"]',
      );
      const addButton = page.locator('[data-testid="add-factor-button"]');

      // Try to add empty factor
      await customFactorInput.fill("");
      await addButton.click();

      // Button should be disabled or no factor added
      // Verify no error state or that button is disabled
      const button = page.locator('[data-testid="add-factor-button"]');
      const isDisabled = await button.isDisabled();

      if (!isDisabled) {
        // If button is not disabled, verify error message appears
        await expect(
          page.locator('[data-testid="factor-error"]'),
        ).toBeVisible();
      }
    });

    test("should persist tracked factors after reload", async ({ page }) => {
      // Toggle hydration off
      await page.locator('[data-testid="toggle-hydration"]').click();
      await page.waitForTimeout(300);

      // Add custom factor
      await page.locator('[data-testid="custom-factor-input"]').fill("Posture");
      await page.locator('[data-testid="add-factor-button"]').click();
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();

      // Verify settings persisted
      await expect(
        page.locator('[data-testid="toggle-hydration"]'),
      ).toHaveAttribute("aria-checked", "false");
      await expect(
        page.locator('[data-testid="custom-factor-Posture"]'),
      ).toBeVisible();
    });
  });

  test.describe("Headache Types", () => {
    test("should display default headache types", async ({ page }) => {
      const defaultTypes = ["tension", "migraine", "cluster", "sinus"];

      for (const type of defaultTypes) {
        await expect(
          page.locator(`[data-testid="default-type-${type}"]`),
        ).toBeVisible();
      }
    });

    test("should add a custom headache type", async ({ page }) => {
      const typeInput = page.locator('[data-testid="custom-type-input"]');
      const addButton = page.locator('[data-testid="add-type-button"]');

      // Add custom type
      await typeInput.fill("Cervicogenic");
      await addButton.click();
      await page.waitForTimeout(300);

      // Verify type appears in list
      await expect(
        page.locator('[data-testid="custom-type-Cervicogenic"]'),
      ).toBeVisible();
    });

    test("should remove a custom headache type", async ({ page }) => {
      // Add a custom type first
      await page.locator('[data-testid="custom-type-input"]').fill("Occipital");
      await page.locator('[data-testid="add-type-button"]').click();
      await page.waitForTimeout(300);

      // Verify it appears
      await expect(
        page.locator('[data-testid="custom-type-Occipital"]'),
      ).toBeVisible();

      // Remove it
      await page.locator('[data-testid="remove-type-Occipital"]').click();
      await page.waitForTimeout(300);

      // Verify it's removed
      await expect(
        page.locator('[data-testid="custom-type-Occipital"]'),
      ).not.toBeVisible();
    });

    test("should persist custom headache types after reload", async ({
      page,
    }) => {
      // Add custom type
      await page.locator('[data-testid="custom-type-input"]').fill("Hormonal");
      await page.locator('[data-testid="add-type-button"]').click();
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();

      // Verify type persisted
      await expect(
        page.locator('[data-testid="custom-type-Hormonal"]'),
      ).toBeVisible();
    });
  });

  test.describe("Display Settings", () => {
    test("should switch theme to dark mode", async ({ page }) => {
      const darkThemeOption = page.locator('[data-testid="theme-dark"]');
      await darkThemeOption.click();
      await page.waitForTimeout(300);

      // Verify theme applied to document
      const htmlElement = page.locator("html");
      await expect(htmlElement).toHaveClass(/dark/);

      // Verify radio button is checked
      const radioButton = darkThemeOption.locator('button[role="radio"]');
      await expect(radioButton).toHaveAttribute("aria-checked", "true");
    });

    test("should switch theme to light mode", async ({ page }) => {
      // First switch to dark
      await page.locator('[data-testid="theme-dark"]').click();
      await page.waitForTimeout(300);

      // Then switch to light
      const lightThemeOption = page.locator('[data-testid="theme-light"]');
      await lightThemeOption.click();
      await page.waitForTimeout(300);

      // Verify theme applied
      const htmlElement = page.locator("html");
      await expect(htmlElement).not.toHaveClass(/dark/);

      // Verify radio button is checked
      const radioButton = lightThemeOption.locator('button[role="radio"]');
      await expect(radioButton).toHaveAttribute("aria-checked", "true");
    });

    test("should switch theme to system mode", async ({ page }) => {
      const systemThemeOption = page.locator('[data-testid="theme-system"]');
      await systemThemeOption.click();
      await page.waitForTimeout(300);

      // Verify radio button is checked
      const radioButton = systemThemeOption.locator('button[role="radio"]');
      await expect(radioButton).toHaveAttribute("aria-checked", "true");
    });

    test("should change intensity scale from 5 to 10", async ({ page }) => {
      const scale10Option = page.locator('[data-testid="scale-option-10"]');
      await scale10Option.click();
      await page.waitForTimeout(300);

      // Verify radio button is checked
      const radioButton = scale10Option.locator(
        '[data-testid="scale-radio-10"]',
      );
      await expect(radioButton).toHaveAttribute("aria-checked", "true");
    });

    test("should change intensity scale from 10 to 5", async ({ page }) => {
      // First switch to 10
      await page.locator('[data-testid="scale-option-10"]').click();
      await page.waitForTimeout(300);

      // Then switch to 5
      const scale5Option = page.locator('[data-testid="scale-option-5"]');
      await scale5Option.click();
      await page.waitForTimeout(300);

      // Verify radio button is checked
      const radioButton = scale5Option.locator('[data-testid="scale-radio-5"]');
      await expect(radioButton).toHaveAttribute("aria-checked", "true");
    });

    test("should persist display settings after reload", async ({ page }) => {
      // Switch to dark theme
      await page.locator('[data-testid="theme-dark"]').click();
      await page.waitForTimeout(300);

      // Switch to 10-point scale
      await page.locator('[data-testid="scale-option-10"]').click();
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();

      // Verify settings persisted
      const htmlElement = page.locator("html");
      await expect(htmlElement).toHaveClass(/dark/);

      const scale10Radio = page.locator('[data-testid="scale-radio-10"]');
      await expect(scale10Radio).toHaveAttribute("aria-checked", "true");
    });
  });

  test.describe("Data Export", () => {
    test("should export data as JSON", async ({ page }) => {
      // Set up download listener
      const downloadPromise = page.waitForEvent("download");

      // Click export JSON button
      await page.locator('[data-testid="export-json-button"]').click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download occurred
      expect(download.suggestedFilename()).toMatch(/headache-data-.*\.json/);
    });

    test("should export data as CSV", async ({ page }) => {
      // Set up download listener
      const downloadPromise = page.waitForEvent("download");

      // Click export CSV button
      await page.locator('[data-testid="export-csv-button"]').click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download occurred
      expect(download.suggestedFilename()).toMatch(/headache-data-.*\.csv/);
    });

    test("should show loading state during export", async ({ page }) => {
      // Click export button
      const exportButton = page.locator('[data-testid="export-json-button"]');
      await exportButton.click();

      // Verify button shows loading state (if implemented)
      // This might be disabled or show spinner
      const isDisabled = await exportButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  test.describe("Clear Data (Danger Zone)", () => {
    test("should show confirmation dialog when clicking clear data", async ({
      page,
    }) => {
      const clearDataButton = page.locator(
        '[data-testid="clear-data-trigger"]',
      );
      await clearDataButton.click();

      // Verify dialog appears
      const confirmationDialog = page.locator(
        '[data-testid="clear-data-confirmation"]',
      );
      await expect(confirmationDialog).toBeVisible();

      // Verify dialog has appropriate warning text
      await expect(confirmationDialog).toContainText(/permanently delete/i);
    });

    test("should cancel clear data and keep data intact", async ({ page }) => {
      // Open dialog
      await page.locator('[data-testid="clear-data-trigger"]').click();
      await expect(
        page.locator('[data-testid="clear-data-confirmation"]'),
      ).toBeVisible();

      // Click cancel
      await page.locator('[data-testid="clear-data-cancel"]').click();

      // Verify dialog closed
      await expect(
        page.locator('[data-testid="clear-data-confirmation"]'),
      ).not.toBeVisible();

      // Navigate to dashboard to verify data still exists (if any)
      await page.goto("/dashboard");
      await expect(
        page.locator('[data-testid="dashboard-page"]'),
      ).toBeVisible();
    });

    test("should clear all data when confirmed", async ({ page }) => {
      // First add some test data to settings
      await page
        .locator('[data-testid="custom-factor-input"]')
        .fill("Test Factor");
      await page.locator('[data-testid="add-factor-button"]').click();
      await page.waitForTimeout(300);

      // Verify test data exists
      await expect(
        page.locator('[data-testid="custom-factor-Test Factor"]'),
      ).toBeVisible();

      // Open clear data dialog
      await page.locator('[data-testid="clear-data-trigger"]').click();
      await expect(
        page.locator('[data-testid="clear-data-confirmation"]'),
      ).toBeVisible();

      // Confirm clear
      await page.locator('[data-testid="clear-data-confirm"]').click();
      await page.waitForTimeout(1000); // Wait for clear to complete

      // Verify dialog closed
      await expect(
        page.locator('[data-testid="clear-data-confirmation"]'),
      ).not.toBeVisible();

      // Reload page and verify data is cleared
      await page.reload();
      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();

      // Custom factor should be gone
      await expect(
        page.locator('[data-testid="custom-factor-Test Factor"]'),
      ).not.toBeVisible();
    });
  });

  test.describe("About & Help", () => {
    test("should display app version", async ({ page }) => {
      const aboutSection = page.locator('[data-testid="about-help"]');
      await expect(aboutSection).toBeVisible();

      // Verify version information exists
      await expect(aboutSection).toContainText(/version/i);
    });

    test("should display help information", async ({ page }) => {
      const aboutSection = page.locator('[data-testid="about-help"]');
      await expect(aboutSection).toBeVisible();

      // Verify help text or links are present
      await expect(aboutSection).toContainText(/headache/i);
    });
  });

  test.describe("Responsive Behavior", () => {
    test("should display accordion layout on mobile", async ({
      page,
      viewport,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify accordion is visible
      await expect(
        page.locator('[data-testid="settings-accordion-mobile"]'),
      ).toBeVisible();

      // Verify desktop cards are hidden
      await expect(
        page.locator('[data-testid="settings-cards-desktop"]'),
      ).not.toBeVisible();
    });

    test("should display card layout on desktop", async ({
      page,
      viewport,
    }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      // Verify desktop cards are visible
      await expect(
        page.locator('[data-testid="settings-cards-desktop"]'),
      ).toBeVisible();

      // Verify mobile accordion is hidden
      await expect(
        page.locator('[data-testid="settings-accordion-mobile"]'),
      ).not.toBeVisible();
    });

    test("should expand and collapse accordion sections on mobile", async ({
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const trackingAccordion = page.locator(
        '[data-testid="accordion-tracking"]',
      );

      // Get initial state
      const initialState = await trackingAccordion.getAttribute("data-state");

      // Click to toggle
      const trigger = trackingAccordion.locator('[role="button"]').first();
      await trigger.click();
      await page.waitForTimeout(300);

      // Verify state changed
      const newState = await trackingAccordion.getAttribute("data-state");
      expect(newState).not.toBe(initialState);
    });

    test("should show all sections expanded on desktop", async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      // All sections should be visible (no accordion collapse)
      await expect(
        page.locator('[data-testid="section-reminders"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="section-tracking"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="section-headache-types"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="section-display"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="section-data"]')).toBeVisible();
      await expect(page.locator('[data-testid="section-about"]')).toBeVisible();
    });
  });

  test.describe("Tab Navigation (Accessibility)", () => {
    test("should navigate through settings with keyboard", async ({ page }) => {
      // Start from back button
      await page.locator('[data-testid="back-button"]').focus();
      await expect(page.locator('[data-testid="back-button"]')).toBeFocused();

      // Tab to reminder switch
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); // May need multiple tabs depending on structure

      // Verify focus is on an interactive element
      const focusedElement = await page.evaluate(() =>
        document.activeElement?.getAttribute("data-testid"),
      );
      expect(focusedElement).toBeTruthy();
    });

    test("should activate switches and buttons with Enter/Space", async ({
      page,
    }) => {
      const reminderSwitch = page.locator(
        '[data-testid="reminders-enabled-switch"]',
      );

      // Focus on switch
      await reminderSwitch.focus();
      await expect(reminderSwitch).toBeFocused();

      // Get initial state
      const initialState = await reminderSwitch.getAttribute("aria-checked");

      // Press Space to toggle
      await page.keyboard.press("Space");
      await page.waitForTimeout(300);

      // Verify state changed
      const newState = await reminderSwitch.getAttribute("aria-checked");
      expect(newState).not.toBe(initialState);
    });
  });
});

test.describe("Settings Page - Mobile Viewport Tests", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("should display mobile layout correctly", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();

    // Verify mobile accordion is visible
    await expect(
      page.locator('[data-testid="settings-accordion-mobile"]'),
    ).toBeVisible();

    // Verify desktop layout is hidden
    await expect(
      page.locator('[data-testid="settings-cards-desktop"]'),
    ).not.toBeVisible();
  });

  test("should expand accordion section on tap", async ({ page }) => {
    await page.goto("/settings");

    const displayAccordion = page.locator('[data-testid="accordion-display"]');
    const trigger = displayAccordion.locator('[role="button"]').first();

    // Tap to expand
    await trigger.click();
    await page.waitForTimeout(300);

    // Verify section is expanded
    const state = await displayAccordion.getAttribute("data-state");
    expect(state).toBe("open");

    // Verify content is visible
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
  });

  test("should maintain accordion state when scrolling", async ({ page }) => {
    await page.goto("/settings");

    // Expand reminders section
    const remindersAccordion = page.locator(
      '[data-testid="accordion-reminders"]',
    );
    await remindersAccordion.locator('[role="button"]').first().click();
    await page.waitForTimeout(300);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Verify accordion still expanded
    const state = await remindersAccordion.getAttribute("data-state");
    expect(state).toBe("open");
  });
});

test.describe("Settings Page - Tablet Viewport Tests", () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test("should display mobile accordion layout on tablet portrait", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();

    // Tablet should use mobile accordion layout
    await expect(
      page.locator('[data-testid="settings-accordion-mobile"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="settings-cards-desktop"]'),
    ).not.toBeVisible();
  });

  test("should handle touch interactions for toggles", async ({ page }) => {
    await page.goto("/settings");

    // Expand tracking section
    const trackingAccordion = page.locator(
      '[data-testid="accordion-tracking"]',
    );
    await trackingAccordion.locator('[role="button"]').first().click();
    await page.waitForTimeout(300);

    // Toggle sleep factor with touch
    const sleepToggle = page.locator('[data-testid="toggle-sleep"]');
    const initialState = await sleepToggle.getAttribute("aria-checked");

    await sleepToggle.click();
    await page.waitForTimeout(300);

    const newState = await sleepToggle.getAttribute("aria-checked");
    expect(newState).not.toBe(initialState);
  });
});

/**
 * REQUIRED DATA-TESTID ATTRIBUTES FOR THIS TEST FILE:
 *
 * Page-level:
 * - [data-testid="settings-page"] - Main settings page container
 * - [data-testid="back-button"] - Back navigation button
 * - [data-testid="settings-accordion-mobile"] - Mobile accordion container
 * - [data-testid="settings-cards-desktop"] - Desktop cards container
 *
 * Accordion sections (mobile):
 * - [data-testid="accordion-reminders"] - Reminders accordion item
 * - [data-testid="accordion-tracking"] - Tracking accordion item
 * - [data-testid="accordion-headache-types"] - Headache types accordion item
 * - [data-testid="accordion-display"] - Display accordion item
 * - [data-testid="accordion-data"] - Data management accordion item
 * - [data-testid="accordion-about"] - About & help accordion item
 *
 * Desktop sections:
 * - [data-testid="section-reminders"] - Reminders section
 * - [data-testid="section-tracking"] - Tracking section
 * - [data-testid="section-headache-types"] - Headache types section
 * - [data-testid="section-display"] - Display section
 * - [data-testid="section-data"] - Data management section
 * - [data-testid="section-about"] - About section
 *
 * Reminder settings:
 * - [data-testid="reminder-settings"] - Reminder settings card
 * - [data-testid="reminders-enabled-switch"] - Enable/disable reminders switch
 * - [data-testid="time-input"] - Time input field
 * - [data-testid="add-time-button"] - Add time button
 * - [data-testid="time-item-{time}"] - Time list item (e.g., time-item-09:00)
 * - [data-testid="remove-time-{time}"] - Remove time button
 * - [data-testid="day-toggle-{day}"] - Day toggle button (e.g., day-toggle-mon)
 * - [data-testid="style-{style}"] - Reminder style option (e.g., style-gentle)
 *
 * Tracked factors:
 * - [data-testid="tracked-factors-settings"] - Tracked factors card
 * - [data-testid="factor-{factor}"] - Factor item (e.g., factor-sleep)
 * - [data-testid="toggle-{factor}"] - Factor toggle switch
 * - [data-testid="custom-factors-editor"] - Custom factors editor card
 * - [data-testid="custom-factor-input"] - Custom factor input field
 * - [data-testid="add-factor-button"] - Add custom factor button
 * - [data-testid="factor-error"] - Factor validation error message
 * - [data-testid="custom-factor-{name}"] - Custom factor item
 * - [data-testid="remove-factor-{name}"] - Remove custom factor button
 *
 * Headache types:
 * - [data-testid="headache-type-settings"] - Headache type settings card
 * - [data-testid="default-type-{type}"] - Default type item (e.g., default-type-tension)
 * - [data-testid="custom-type-input"] - Custom type input field
 * - [data-testid="add-type-button"] - Add custom type button
 * - [data-testid="type-error"] - Type validation error message
 * - [data-testid="custom-type-{name}"] - Custom type item
 * - [data-testid="remove-type-{name}"] - Remove custom type button
 *
 * Display settings:
 * - [data-testid="theme-toggle"] - Theme toggle card
 * - [data-testid="theme-{theme}"] - Theme option (e.g., theme-dark, theme-light, theme-system)
 * - [data-testid="intensity-scale-settings"] - Intensity scale settings card
 * - [data-testid="scale-option-{scale}"] - Scale option container (e.g., scale-option-5)
 * - [data-testid="scale-radio-{scale}"] - Scale radio button
 * - [data-testid="preview-{scale}-{index}"] - Scale preview dot
 *
 * Data management:
 * - [data-testid="data-export"] - Data export card
 * - [data-testid="export-json-button"] - Export JSON button
 * - [data-testid="export-csv-button"] - Export CSV button
 * - [data-testid="danger-zone"] - Danger zone container
 * - [data-testid="clear-data-dialog"] - Clear data dialog component
 * - [data-testid="clear-data-trigger"] - Clear data button
 * - [data-testid="clear-data-confirmation"] - Confirmation dialog
 * - [data-testid="clear-data-cancel"] - Cancel button in dialog
 * - [data-testid="clear-data-confirm"] - Confirm button in dialog
 *
 * About & help:
 * - [data-testid="about-help"] - About & help card
 * - [data-testid="about-info-{index}"] - About information item
 * - [data-testid="help-link-{url}"] - Help link
 *
 * NOTE: Page implementation MUST include all these data-testid attributes
 * for tests to pass. Page implementation agent will read this list.
 */
