# Authentication E2E Tests

Comprehensive end-to-end tests for the Google OAuth authentication flow in the Headache Awareness Trainer PWA.

## Test Files

### 1. `authentication.spec.ts`
**Main authentication flow tests**

Tests covered:
- ✅ Unauthenticated access protection (redirects to login)
- ✅ Login page display and structure
- ✅ Google OAuth button interaction
- ✅ Loading states during authentication
- ✅ Error handling and display
- ⏸️ Authenticated home page (requires auth setup)
- ⏸️ Sign-out flow (requires auth setup)
- ⏸️ Protected route access after auth (requires auth setup)
- ⏸️ Session persistence (requires auth setup)
- ✅ Accessibility (keyboard navigation, ARIA labels)

**Note:** Tests marked with `.skip` require authenticated state setup. See [Authentication Setup](#authentication-setup) below.

### 2. `navigation.spec.ts`
**Navigation behavior across authentication states**

Tests covered:
- ✅ Redirects between login and protected routes
- ✅ Deep linking with callbackUrl preservation
- ✅ Query parameter preservation in redirects
- ✅ Browser back/forward button behavior
- ✅ No infinite redirect loops
- ⏸️ Authenticated navigation between protected routes
- ⏸️ Session persistence across navigation
- ✅ Edge cases (rapid navigation, invalid callbacks)

### 3. `responsive.spec.ts`
**Responsive design across viewports**

Viewports tested:
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1280x720

Tests covered:
- ✅ Login page layout adapts correctly
- ✅ Full-width buttons on mobile
- ✅ Touch interactions (tap)
- ✅ No horizontal scroll on any viewport
- ✅ Centered form on tablet/desktop
- ✅ Hover states on desktop
- ✅ Viewport resize handling
- ✅ Portrait/landscape orientation changes
- ✅ Text scaling accessibility

## Running Tests

### Run all authentication tests
```bash
pnpm playwright test test/e2e/auth/
```

### Run specific test file
```bash
pnpm playwright test test/e2e/auth/authentication.spec.ts
pnpm playwright test test/e2e/auth/navigation.spec.ts
pnpm playwright test test/e2e/auth/responsive.spec.ts
```

### Run tests in specific browser
```bash
pnpm playwright test test/e2e/auth/ --project="Desktop Chrome"
pnpm playwright test test/e2e/auth/ --project="Mobile Chrome"
pnpm playwright test test/e2e/auth/ --project="iPad"
```

### Run with UI mode (recommended for debugging)
```bash
pnpm playwright test test/e2e/auth/ --ui
```

### Run specific test
```bash
pnpm playwright test test/e2e/auth/authentication.spec.ts -g "should redirect to login"
```

## Authentication Setup

### Why Some Tests Are Skipped

Tests that require authenticated state (marked with `.skip`) cannot run without:
1. Real Google OAuth credentials
2. Programmatic authentication flow
3. Saved authentication state

These tests verify:
- Authenticated home page display
- Sign-out functionality
- Protected route access
- Session persistence

### Enabling Authenticated Tests

To enable skipped tests, create `test/e2e/auth/auth.setup.ts`:

```typescript
import { test as setup, expect } from '@playwright/test';

const authFile = 'test/e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login
  await page.goto('/login');

  // Perform Google OAuth authentication
  // Option 1: Use test Google account credentials (requires env vars)
  // Option 2: Use mocked OAuth response (requires test mode)
  // Option 3: Load pre-authenticated session (fastest for local dev)

  // Wait for authentication to complete
  await expect(page).toHaveURL('/');

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
```

Then update `playwright.config.ts`:

```typescript
export default defineConfig({
  projects: [
    // Setup project - runs first
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Tests that need authentication
    {
      name: 'authenticated',
      testMatch: /auth\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: 'test/e2e/.auth/user.json',
      },
    },
  ],
});
```

### Testing Without Real OAuth

For CI/CD environments or local testing without Google credentials:

**Option 1: Mock OAuth in Test Mode**
```typescript
// Add test mode to auth.ts
if (process.env.TEST_MODE === 'true') {
  // Bypass OAuth, create test session
}
```

**Option 2: Use Playwright's Request Context**
```typescript
// Set up authenticated request context manually
await page.context().addCookies([
  {
    name: '__Secure-next-auth.session-token',
    value: 'test-session-token',
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  },
]);
```

## Test Coverage

### What Is Tested
- ✅ Middleware route protection logic
- ✅ Login page UI and accessibility
- ✅ Google OAuth button behavior (up to redirect)
- ✅ Loading states and error display
- ✅ Navigation and redirects
- ✅ CallbackUrl preservation
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Touch interactions
- ✅ Keyboard navigation

### What Is NOT Fully Tested
- ❌ Complete OAuth flow with Google (requires real credentials)
- ❌ Session token validation (requires backend integration)
- ❌ Token refresh logic (requires time-based testing)
- ❌ Multi-tab synchronization (requires advanced setup)

These require:
- Integration tests with mocked OAuth
- Backend API tests
- Manual testing with real accounts

## Required Data Attributes

All required `data-testid` attributes are documented at the end of each test file. Summary:

### Login Page
- `data-testid="login-page"` - Main container
- `data-testid="login-form"` - Form container
- `data-testid="login-header"` - Header with branding
- `data-testid="google-signin-button"` - Sign-in button
- `data-testid="error-message"` - Error display
- `data-testid="auth-loading"` - Loading indicator
- `data-testid="already-authenticated"` - Redirect message

### Home Page (Authenticated)
- `data-testid="home-page"` - Main container
- `data-testid="auth-status"` - AuthStatus component
- `data-testid="sign-out-button"` - Sign-out button

### Other Pages
- `data-testid="dashboard-page"` - Dashboard
- `data-testid="settings-page"` - Settings
- `data-testid="profile-page"` - Profile (if exists)

**All attributes are already present in the codebase.**

## Common Issues

### Issue: Tests Timeout on OAuth Redirect
**Solution:** This is expected. OAuth tests verify UI up to the redirect point. Full OAuth requires authentication setup (see above).

### Issue: Session Not Persisting
**Solution:** Ensure `storageState` is configured in playwright.config.ts and auth.setup.ts runs before other tests.

### Issue: Redirect Loops
**Solution:** Clear cookies/storage before each test:
```typescript
test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});
```

### Issue: Mobile Tests Fail
**Solution:** Ensure viewport is set correctly:
```typescript
test.use({ viewport: { width: 375, height: 667 } });
```

## Manual Testing Checklist

Some scenarios are difficult to automate. Manual testing recommended for:

- [ ] Complete Google OAuth flow with real Google account
- [ ] Different Google account types (personal, workspace)
- [ ] OAuth consent screen display
- [ ] OAuth error scenarios (user denies access)
- [ ] Network interruption during OAuth
- [ ] Session expiration and refresh
- [ ] Multiple browser tabs with same session
- [ ] Sign-in from different devices

## CI/CD Integration

For GitHub Actions or similar:

```yaml
- name: Run Authentication E2E Tests
  run: |
    pnpm playwright test test/e2e/auth/ --project="Desktop Chrome"
  env:
    CI: true
    # Optional: Add test credentials for OAuth
    GOOGLE_TEST_EMAIL: ${{ secrets.GOOGLE_TEST_EMAIL }}
    GOOGLE_TEST_PASSWORD: ${{ secrets.GOOGLE_TEST_PASSWORD }}
```

**Security Note:** Never commit real Google credentials. Use GitHub Secrets or test-specific OAuth apps.

## Debugging

### View test report
```bash
pnpm playwright show-report
```

### Run with debug mode
```bash
pnpm playwright test test/e2e/auth/ --debug
```

### Take screenshots on failure
Already configured in `playwright.config.ts`:
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

### View traces
```bash
pnpm playwright show-trace test-results/.../trace.zip
```

## Resources

- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [NextAuth.js Testing](https://next-auth.js.org/getting-started/client#testing)
- [NextAuth.js Session Management](https://next-auth.js.org/getting-started/client#usesession)
- [OAuth 2.0 Testing Best Practices](https://www.oauth.com/oauth2-servers/testing/)

## Contributing

When adding new authentication features:

1. Add corresponding E2E tests in this directory
2. Update required data-testid list in test files
3. Document any new authentication states or flows
4. Update this README with new test scenarios
5. Ensure tests pass on all viewports (mobile, tablet, desktop)

## Questions?

See the main E2E test documentation: `test/e2e/README.md`
