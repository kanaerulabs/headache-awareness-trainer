# Google OAuth Deployment Guide - Vercel

This guide covers deploying the headache-awareness-trainer PWA with Google OAuth authentication to Vercel.

## Pre-Deployment Checklist

✅ **Completed:**
- NextAuth.js v5 installed and configured
- Google OAuth credentials created
- Domain layer implemented (User entity, Session VO, IAuthRepository)
- State management with Zustand
- Authentication UI components (SignInButton, SignOutButton, UserAvatar, AuthStatus)
- Login page with OAuth flow
- Middleware for route protection
- SessionProvider wrapper
- E2E tests (77 scenarios, 72 passing)
- Lint checks passed
- Production build successful

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Required Variables

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=https://your-production-domain.vercel.app
NEXTAUTH_SECRET=4plcDybgEqDVNKCaI6P3NsM3WE5vCeX9lu4gt7AYahU=

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=371363897719-7odl825v8hc83v13l5k13gnjlcs4ouuc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Critical Steps

1. **Update NEXTAUTH_URL:**
   - Replace `https://your-production-domain.vercel.app` with your actual Vercel deployment URL
   - This should match your Google OAuth redirect URI

2. **Update Google Cloud Console Authorized Redirect URIs:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select your OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-production-domain.vercel.app/api/auth/callback/google`
   - Click "Save"

3. **Deploy to Vercel:**

   **Option 1: Using Vercel CLI**
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

   **Option 2: Using Git Integration**
   - Push to main branch (already done)
   - Vercel will auto-deploy if GitHub integration is set up
   - Go to: https://vercel.com/dashboard
   - Add environment variables in project settings

## Deployment Architecture

### Protected Routes
The following routes require authentication:
- `/` (Home page)
- `/dashboard`
- `/profile`
- `/settings`

### Public Routes
- `/login` (OAuth login page)
- `/onboarding` (First-time user setup)
- `/api/auth/*` (NextAuth.js API routes)

### Middleware Flow
1. User accesses protected route
2. Middleware checks session via NextAuth
3. If authenticated → Allow access
4. If not authenticated → Redirect to `/login?callbackUrl=<original-url>`
5. After successful OAuth → Redirect back to original URL

## Post-Deployment Verification

### 1. Test OAuth Flow
1. Visit: `https://your-production-domain.vercel.app/login`
2. Click "Continue with Google"
3. Complete OAuth consent
4. Verify redirect to home page
5. Confirm AuthStatus component shows your profile

### 2. Test Route Protection
1. Log out
2. Try accessing: `https://your-production-domain.vercel.app/`
3. Should redirect to `/login?callbackUrl=%2F`
4. Log in again
5. Should redirect back to home page

### 3. Test Session Persistence
1. Refresh page while authenticated
2. Should remain logged in
3. Close and reopen browser
4. Should remain logged in (session cookie)

## Security Considerations

### Environment Variables
- ✅ `.env.local` is gitignored (credentials not in repo)
- ✅ All secrets must be set in Vercel dashboard
- ✅ Use Vercel's encrypted environment variables

### HTTPS Requirement
- ⚠️ Google OAuth requires HTTPS in production
- ✅ Vercel provides HTTPS automatically

### Session Management
- ✅ NextAuth.js uses httpOnly cookies (XSS protection)
- ✅ CSRF tokens built into NextAuth.js
- ✅ Secure session storage (no localStorage)

## Troubleshooting

### "Redirect URI mismatch" error
- Verify `NEXTAUTH_URL` matches your Vercel deployment URL
- Check Google Cloud Console authorized redirect URIs
- Ensure URI includes `/api/auth/callback/google`

### Session not persisting
- Verify `NEXTAUTH_SECRET` is set in Vercel
- Check browser cookies are enabled
- Ensure domain matches (no www vs non-www mismatch)

### Build failures
- Run `pnpm build` locally first
- Check Vercel build logs for specific errors
- Verify all dependencies are in `package.json`

## Git Commits Deployed

The following commits implement Google OAuth:

```
e49a7f1 fix(auth): add SessionProvider wrapper to enable NextAuth hooks
8445508 style: fix linting issues in OAuth implementation
7272c0c test(e2e): add comprehensive E2E tests for OAuth authentication
65d4b68 feat(auth): add NextAuth.js v5 configuration and API routes
c1495d4 feat(auth): add middleware for route protection and integrate AuthStatus
29ea8bd feat(auth): add authentication UI components and login page
b93d827 feat(auth): add Zustand state management for authentication
0a8062d test(auth): add unit tests for auth domain layer
5d4eb73 feat(auth): implement Google OAuth authentication domain layer
```

## Clean Architecture Implementation

### Domain Layer (`src/domains/auth/`)
- `entities/user.entity.ts` - User entity with business logic
- `value-objects/session.vo.ts` - Immutable session value object
- `repositories/auth.repository.interface.ts` - Repository contract

### State Management (`src/stores/auth/`)
- `auth.store.ts` - Zustand store for auth state
- `use-auth-store.ts` - 11 custom hooks for optimized access

### Presentation Layer
- `src/components/auth/` - Reusable auth components
- `src/app/login/` - Login page
- `src/middleware.ts` - Route protection
- `src/lib/auth.ts` - NextAuth configuration

## Support

For issues or questions, contact the development team or open an issue on GitHub.

---

**Deployment Date:** 2026-01-12
**NextAuth.js Version:** 5.0.0-beta.30
**Next.js Version:** 15.5.9
