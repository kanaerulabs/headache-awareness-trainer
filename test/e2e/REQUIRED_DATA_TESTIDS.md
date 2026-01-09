# Required data-testid Attributes for E2E Tests

This document lists all `data-testid` attributes required by E2E tests in `test/e2e/pwa/`.

## Implementation Status

✅ **Already Implemented** - Present in components
⚠️ **Needs Implementation** - Must be added to components

---

## Home Page (app/page.tsx)

### Already Implemented ✅
- `[data-testid="home-page"]` - Main home page container
- `[data-testid="greeting-section"]` - Welcome greeting section
- `[data-testid="daily-tip-section"]` - Daily tip card
- `[data-testid="quick-actions"]` - Quick action cards container
- `[data-testid="learn-card"]` - Learn quick action card
- `[data-testid="log-headache-card"]` - Log headache action card
- `[data-testid="insights-card"]` - Insights action card
- `[data-testid="settings-card"]` - Settings action card
- `[data-testid="empty-state"]` - Empty state message

---

## Learn Page (app/learn/page.tsx)

### Already Implemented ✅
- `[data-testid="learn-page"]` - Main learn page container

---

## EducationHub Component (src/components/organisms/EducationHub.tsx)

### Needs Implementation ⚠️
```tsx
// Add to root div in EducationHub component
<div className="space-y-8" data-testid="education-hub">
```

**Required by:**
- `test/e2e/pwa/learn-page.spec.ts`

---

## Onboarding Page (app/onboarding/page.tsx)

### Already Implemented ✅
- `[data-testid="onboarding-page"]` - Main onboarding page container

---

## WizardContainer Component (src/components/organisms/WizardContainer.tsx)

### Already Implemented ✅
- `[data-testid="wizard-container"]` - Wizard container wrapper
- `[data-testid="progress-indicator"]` - Progress indicator section
- `[data-testid="progress-bar"]` - Visual progress bar element

---

## InstallPrompt Component (src/components/organisms/InstallPrompt.tsx)

### Already Implemented ✅
- `[data-testid="install-prompt"]` - Install prompt container
- `[data-testid="dismiss-button"]` - Dismiss button (X)
- `[data-testid="install-button"]` - Install app button (non-iOS)
- `[data-testid="ios-share-icon"]` - iOS share icon
- `id="install-prompt-title"` - Prompt title (accessible heading)
- `id="install-prompt-description"` - Prompt description (accessible text)

---

## BottomNav Component (src/components/organisms/BottomNav.tsx)

### Already Implemented ✅ (No Additional testids Required)

Component uses semantic HTML which is sufficient for testing:
- `<nav>` element with text "Home"
- `<a href="/">` - Home navigation link
- `<a href="/learn">` - Learn navigation link
- `<a href="/log">` - Log navigation link
- `<a href="/insights">` - Insights navigation link
- `<a href="/settings">` - Settings navigation link

**Tests use semantic selectors:**
```typescript
page.locator('nav').filter({ hasText: 'Home' })
page.locator('a[href="/learn"]')
page.locator('text=Home')
```

---

## Summary

| Component | Total testids | Implemented | Missing |
|-----------|---------------|-------------|---------|
| Home Page | 9 | 9 ✅ | 0 |
| Learn Page | 1 | 1 ✅ | 0 |
| EducationHub | 1 | 0 ⚠️ | 1 |
| Onboarding Page | 1 | 1 ✅ | 0 |
| WizardContainer | 3 | 3 ✅ | 0 |
| InstallPrompt | 6 | 6 ✅ | 0 |
| BottomNav | 0 | N/A | 0 |
| **TOTAL** | **21** | **20** | **1** |

---

## Implementation Guide

### Add Missing testid to EducationHub

**File:** `src/components/organisms/EducationHub.tsx`

**Current:**
```tsx
export function EducationHub() {
  // ...
  return (
    <div className="space-y-8">
```

**Updated:**
```tsx
export function EducationHub() {
  // ...
  return (
    <div className="space-y-8" data-testid="education-hub">
```

---

## Testing

After adding the missing testid, run E2E tests:

```bash
# Install Playwright browsers (first time only)
pnpm playwright install

# Run all E2E tests
pnpm playwright test

# Run specific test file
pnpm playwright test test/e2e/pwa/learn-page.spec.ts

# Run tests with UI
pnpm playwright test --ui

# Run tests for specific device
pnpm playwright test --project="iPhone SE"
```

---

## Accessibility Notes

Most tests rely on semantic HTML and accessibility attributes:
- `<nav>` elements for navigation
- `<h1>`, `<h2>` for headings
- `[role="progressbar"]` for progress indicators
- `[role="article"]` for content cards
- `id` attributes for accessible labels

This approach ensures tests verify both functionality AND accessibility compliance.
