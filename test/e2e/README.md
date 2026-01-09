# E2E Tests - Headache Awareness Trainer PWA

End-to-end tests for the Progressive Web App using Playwright.

## Overview

These E2E tests verify the complete user experience across:
- **Mobile devices** (iPhone SE, Pixel 5, iPhone 12)
- **Tablets** (iPad)
- **Desktop browsers** (Chrome, Firefox)

**CRITICAL:** Tests run against the **REAL backend** server (no API mocking). This validates true end-to-end integration.

## Test Structure

```
test/e2e/
├── pwa/
│   ├── pwa-experience.spec.ts      # PWA features (install prompt, manifest)
│   ├── bottom-navigation.spec.ts   # Bottom nav layout and centering
│   ├── onboarding.spec.ts          # Wizard flow and progress indicator
│   ├── learn-page.spec.ts          # Educational content navigation
│   ├── responsive.spec.ts          # Responsive design across viewports
│   └── mobile-touch.spec.ts        # Touch interactions and gestures
├── REQUIRED_DATA_TESTIDS.md        # List of required data-testid attributes
└── README.md                       # This file
```

## Test Coverage

| Test File | Test Count | Focus Areas |
|-----------|------------|-------------|
| `pwa-experience.spec.ts` | 14 | Install prompt, manifest, performance |
| `bottom-navigation.spec.ts` | 22 | Mobile layout, tab centering, navigation |
| `onboarding.spec.ts` | 17 | Wizard flow, progress indicator, persistence |
| `learn-page.spec.ts` | 27 | Content display, navigation, responsive |
| `responsive.spec.ts` | 25 | Mobile, tablet, desktop layouts |
| `mobile-touch.spec.ts` | 27 | Touch tap, targets, feedback, performance |
| **TOTAL** | **132** | **6 categories** |

## Running Tests

### First Time Setup

```bash
# Install Playwright browsers
pnpm playwright install
```

### Run All Tests

```bash
# Run all E2E tests
pnpm playwright test

# Run with UI (interactive mode)
pnpm playwright test --ui

# Run in headed mode (see browser)
pnpm playwright test --headed
```

### Run Specific Tests

```bash
# Run specific test file
pnpm playwright test test/e2e/pwa/onboarding.spec.ts

# Run tests matching pattern
pnpm playwright test onboarding

# Run specific test by name
pnpm playwright test -g "should display correct step count"
```

### Run for Specific Devices

```bash
# iPhone SE only
pnpm playwright test --project="iPhone SE"

# Mobile devices only
pnpm playwright test --project="Mobile Chrome" --project="Mobile Safari"

# Desktop only
pnpm playwright test --project="Desktop Chrome" --project="Desktop Firefox"

# iPad only
pnpm playwright test --project="iPad"
```

### Debug Tests

```bash
# Debug mode (pauses on breakpoints)
pnpm playwright test --debug

# Debug specific test
pnpm playwright test onboarding.spec.ts --debug

# Show trace viewer for failed tests
pnpm playwright show-report
```

## Test Reports

After running tests, view results:

```bash
# Open HTML report
pnpm playwright show-report

# View JSON results
cat test-results/results.json
```

Reports include:
- Screenshots of failures
- Videos of failed tests
- Trace files for debugging
- Detailed error messages

## Critical Test Requirements

### Mobile Viewport Tests (MANDATORY)

All features MUST be tested on mobile viewport (375x667 - iPhone SE):
- ✅ Bottom navigation centering and full width
- ✅ Progress indicator text separation
- ✅ Touch-friendly button sizes (44x44 minimum)
- ✅ No horizontal overflow
- ✅ Proper safe area spacing

### Touch Interaction Tests (MANDATORY)

Tests use `.tap()` method (touch events), NOT `.click()` (mouse events):
- ✅ Touch tap on navigation tabs
- ✅ Touch targets >= 44x44 pixels
- ✅ Visual feedback on touch
- ✅ No 300ms click delay
- ✅ Multi-touch prevention (no zoom)

### Responsive Viewport Tests (MANDATORY)

Tests verify layout across three viewport sizes:
- ✅ Mobile: 375x667 (iPhone SE)
- ✅ Tablet: 768x1024 (iPad)
- ✅ Desktop: 1280x720

## Common Issues & Solutions

### Issue: "Target closed" or "Timeout" errors

**Cause:** Backend server not running or slow to start

**Solution:**
```bash
# Ensure dev server is running
pnpm dev

# Or let Playwright start it (configured in playwright.config.ts)
pnpm playwright test  # Automatically starts pnpm dev
```

### Issue: "locator.boundingBox: Not visible"

**Cause:** Element not visible in viewport or CSS display:none

**Solution:**
- Check element has `data-testid` attribute
- Verify element is not hidden by CSS
- Wait for animations to complete: `await page.waitForTimeout(200)`

### Issue: Tests pass locally but fail in CI

**Cause:** Different viewport sizes or timing issues

**Solution:**
- Use `await expect(element).toBeVisible()` instead of direct checks
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Check CI viewport matches local (usually 1280x720)

### Issue: "Step 1 of 425%" text concatenation

**Cause:** Progress indicator spans not properly separated

**Solution:**
- Verify WizardContainer has separate `<span>` elements
- Check flex justify-between is applied
- Test explicitly verifies proper spacing

## Best Practices

### 1. Use Semantic Selectors

**Prefer:**
```typescript
page.locator('nav').filter({ hasText: 'Home' })
page.locator('a[href="/learn"]')
page.locator('text=Learn')
```

**Avoid:**
```typescript
page.locator('.nav-item-class')  // Fragile, breaks on CSS changes
```

### 2. Use data-testid for Dynamic Content

**Prefer:**
```typescript
page.locator('[data-testid="learn-card"]')
```

**Avoid:**
```typescript
page.locator('button:nth-child(2)')  // Breaks if order changes
```

### 3. Wait for Visibility, Not Fixed Timeouts

**Prefer:**
```typescript
await expect(page.locator('[data-testid="learn-page"]')).toBeVisible();
```

**Avoid:**
```typescript
await page.waitForTimeout(1000);  // Flaky, wastes time
```

### 4. Test Touch, Not Click, on Mobile

**Prefer:**
```typescript
test.use({ hasTouch: true });
await element.tap();
```

**Avoid:**
```typescript
await element.click();  // Uses mouse events, not touch
```

## Test Philosophy

### E2E Tests Verify COMPLETE System Integration

These tests:
- ✅ Use REAL backend server
- ✅ Test complete user journeys
- ✅ Verify REAL data persistence
- ✅ Test actual network requests
- ❌ Do NOT mock backend API
- ❌ Do NOT use fake data

### API Error Testing Belongs in Integration Tests

**E2E tests (this folder):**
- Test real backend responses
- Test validation errors from backend
- Test complete user workflows

**Integration tests (test/integration/):**
- Test API error handling (500, 404)
- Test network failures
- Mock external services only

### When to Add New E2E Tests

Add E2E tests when:
- Adding new pages or features
- Implementing new user workflows
- Changes affect mobile layout
- Adding new interactive components
- Implementing PWA features

## CI/CD Integration

Tests run automatically on:
- Pull requests to main branch
- Commits to main branch
- Manual workflow trigger

CI configuration (example):
```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: pnpm playwright install --with-deps

- name: Run E2E tests
  run: pnpm playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Required Component Setup

Before tests will pass, ensure components have required `data-testid` attributes.

See: [`REQUIRED_DATA_TESTIDS.md`](./REQUIRED_DATA_TESTIDS.md)

**Current status:** 20/21 testids implemented (95%)
**Missing:** `[data-testid="education-hub"]` in EducationHub component

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Mobile Testing Guide](https://playwright.dev/docs/emulation)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Support

For issues with E2E tests:
1. Check this README for common issues
2. Review test file comments for specific requirements
3. Check `REQUIRED_DATA_TESTIDS.md` for missing attributes
4. Review execution log: `repositories/companies/jinit-labs/outcomes/headache-awareness-trainer/logs/pwa-setup/test/e2e-test-generation.log`
