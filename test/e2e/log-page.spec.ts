import { test, expect } from "@playwright/test";

const BASE_URL =
  process.env.BASE_URL || "https://headache-awareness-trainer.vercel.app";

test.describe("Quick Logging Page - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/log`);
  });

  test("should load the log page with all required elements", async ({
    page,
  }) => {
    // Check page title
    await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-title"]')).toHaveText(
      "How are you feeling?",
    );

    // Check form elements
    await expect(
      page.locator('[data-testid="quick-logging-form"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="im-fine-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="week1-section"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="intensity-section"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="note-section"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="context-tags-section"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
  });

  test("should display intensity selector with 5 levels", async ({ page }) => {
    const intensityButtons = page.locator(
      '[data-testid="intensity-section"] button[role="radio"]',
    );
    await expect(intensityButtons).toHaveCount(5);

    // Verify default intensity is 3 (Moderate)
    const selectedIntensity = page.locator(
      '[data-testid="intensity-section"] button[aria-checked="true"]',
    );
    await expect(selectedIntensity).toContainText("3");
  });

  test("should allow selecting different intensity levels", async ({
    page,
  }) => {
    // Click on intensity 5
    const intensity5 = page.locator(
      '[data-testid="intensity-section"] button[aria-label*="level 5"]',
    );
    await intensity5.click();
    await expect(intensity5).toHaveAttribute("aria-checked", "true");

    // Click on intensity 1
    const intensity1 = page.locator(
      '[data-testid="intensity-section"] button[aria-label*="level 1"]',
    );
    await intensity1.click();
    await expect(intensity1).toHaveAttribute("aria-checked", "true");
  });

  test("should allow entering notes", async ({ page }) => {
    const noteInput = page.locator('[data-testid="note-section"] textarea');
    await noteInput.fill("Test headache note - feeling pressure in temples");
    await expect(noteInput).toHaveValue(
      "Test headache note - feeling pressure in temples",
    );
  });

  test("should allow selecting context tags", async ({ page }) => {
    // Click on "Woke up with it" tag
    const wokeUpTag = page.locator(
      '[data-testid="context-tags-section"] button[aria-label="Woke up with it"]',
    );
    await wokeUpTag.click();
    await expect(wokeUpTag).toHaveAttribute("aria-checked", "true");

    // Click on "Morning" tag
    const morningTag = page.locator(
      '[data-testid="context-tags-section"] button[aria-label="Morning"]',
    );
    await morningTag.click();
    await expect(morningTag).toHaveAttribute("aria-checked", "true");
  });

  test("should navigate home when 'I'm fine' is clicked", async ({ page }) => {
    const imFineButton = page.locator('[data-testid="im-fine-button"]');
    await imFineButton.click();

    // Should navigate to home with dismissed parameter
    await expect(page).toHaveURL(/\?dismissed=true/);
  });

  test("should submit the form and navigate to home", async ({ page }) => {
    // Select intensity
    const intensity4 = page.locator(
      '[data-testid="intensity-section"] button[aria-label*="level 4"]',
    );
    await intensity4.click();

    // Add a note
    const noteInput = page.locator('[data-testid="note-section"] textarea');
    await noteInput.fill("Testing form submission");

    // Select a context tag
    const suddenOnsetTag = page.locator(
      '[data-testid="context-tags-section"] button[aria-label="Sudden onset"]',
    );
    await suddenOnsetTag.click();

    // Submit the form
    const submitButton = page.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should navigate to home with logged parameter
    await expect(page).toHaveURL(/\?logged=true/, { timeout: 10000 });
  });

  test("should show bottom navigation", async ({ page }) => {
    await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-learn"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-log"]')).toBeVisible();
  });

  test("should show week2 unlock hint", async ({ page }) => {
    const unlockHint = page.locator('[data-testid="week2-unlock-hint"]');
    await expect(unlockHint).toBeVisible();
    await expect(unlockHint).toContainText("More features unlock after 7 days");
  });
});
