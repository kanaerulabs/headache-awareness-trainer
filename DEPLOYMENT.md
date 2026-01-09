# Deployment Guide

## Overview

This project uses GitHub Actions for continuous integration and automatic deployment to Vercel. Every push to the main branch triggers a production deployment, while pull requests get preview deployments.

## CI/CD Pipeline

### Workflows

#### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on:
- Every pull request to main/master
- Every push to main/master

**Checks:**
- ESLint code quality
- TypeScript type checking
- Unit tests (Jest)
- Production build verification

**Jobs:**
1. `lint-and-typecheck` - Ensures code quality and type safety
2. `test` - Runs unit test suite
3. `build` - Creates production build and uploads artifacts

#### 2. Deploy Preview (`.github/workflows/deploy-preview.yml`)

Runs on:
- Pull request opened/synchronized/reopened

**Process:**
1. Installs dependencies with pnpm
2. Builds the application
3. Deploys to Vercel preview environment
4. Comments on PR with preview URL

**Features:**
- Automatic preview URL generation
- Comment with testing checklist
- Independent preview per PR

#### 3. Deploy Production (`.github/workflows/deploy-production.yml`)

Runs on:
- Push to main/master branch

**Process:**
1. Installs dependencies with pnpm
2. Builds the application
3. Deploys to Vercel production with `--prod` flag
4. Posts deployment summary

## Vercel Configuration

### Setup Instructions

#### 1. Create Vercel Project

1. Visit https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `kanaerulabs/jinit-labs-headache-awareness-trainer`
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm run build`
   - Install Command: `pnpm install`
   - Output Directory: .next

#### 2. Get Vercel Tokens

**Vercel Token:**
```bash
# Visit: https://vercel.com/account/tokens
# Create new token with appropriate permissions
```

**Project IDs:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project (run in project directory)
vercel link

# Get project ID and org ID
cat .vercel/project.json
```

#### 3. Add GitHub Secrets

Go to repository settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Organization ID | `.vercel/project.json` (orgId) |
| `VERCEL_PROJECT_ID` | Project ID | `.vercel/project.json` (projectId) |

### Vercel Configuration File

The `vercel.json` file includes:

**PWA Optimizations:**
- Service Worker caching headers
- Manifest file caching
- Proper MIME types

**Build Settings:**
- Uses pnpm for package management
- Next.js framework detection
- Clean URLs enabled

## Environment Variables

### Current (MVP)

No environment variables required for MVP deployment.

### Future

When adding features, set these in Vercel dashboard:

| Variable | Purpose | Environment |
|----------|---------|-------------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking (opt-in) | Production, Preview |
| `NEXT_PUBLIC_SYNC_ENDPOINT` | Cloud sync API endpoint | Production |
| `DATABASE_URL` | PostgreSQL connection (if added) | Production only |

**To add environment variables:**
1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add variable for appropriate environments
4. Redeploy to apply changes

## Deployment Process

### Automatic Deployments

**Production:**
```bash
# Merge PR or push directly to main
git checkout main
git merge feature-branch
git push origin main

# GitHub Actions automatically:
# 1. Runs CI checks
# 2. Builds application
# 3. Deploys to Vercel production
# 4. Posts deployment summary
```

**Preview:**
```bash
# Create pull request
git checkout -b feature/new-feature
git push origin feature/new-feature

# Open PR on GitHub

# GitHub Actions automatically:
# 1. Runs CI checks
# 2. Deploys preview to Vercel
# 3. Comments PR with preview URL
```

### Manual Deployment

**Using Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## PWA Considerations

### Service Worker

- Generated automatically by next-pwa
- Location: `public/sw.js`
- Cache-Control headers configured in vercel.json
- Disabled in development mode

### Testing PWA Features

**After deployment:**

1. **Installation:**
   - Visit production URL on mobile
   - Tap browser menu → "Add to Home Screen"
   - Verify app icon appears

2. **Offline Mode:**
   - Open app
   - Enable airplane mode
   - Verify app still loads and functions

3. **Caching:**
   - Check Network tab in DevTools
   - Verify assets served from Service Worker
   - Test cache strategies for different resource types

4. **Lighthouse:**
   - Run Lighthouse audit in Chrome DevTools
   - Target scores: 90+ for PWA category
   - Address any warnings

## Monitoring

### Build Status

Check workflow status:
- https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/actions

### Deployment Status

Check Vercel dashboard:
- https://vercel.com/dashboard
- View deployment logs
- Check function logs (if using API routes)

### Performance

Use Vercel Analytics (optional):
1. Enable in Vercel project settings
2. View real user metrics
3. Monitor Web Vitals

## Troubleshooting

### Build Failures

**Issue: pnpm install fails**
```bash
# Solution: Clear cache and reinstall
pnpm store prune
pnpm install --frozen-lockfile
```

**Issue: Type errors during build**
```bash
# Solution: Run type check locally
pnpm run type-check

# Fix errors, then commit
```

**Issue: Build succeeds locally but fails in CI**
```bash
# Check Node.js version matches
node --version  # Should match LTS

# Ensure all dependencies are in package.json
pnpm install
git add package.json pnpm-lock.yaml
```

### Deployment Failures

**Issue: Missing Vercel secrets**
```
Error: Missing required secret: VERCEL_TOKEN
```

**Solution:**
- Verify secrets are added in GitHub repository settings
- Check secret names match exactly (case-sensitive)
- Regenerate Vercel token if expired

**Issue: Deployment succeeds but site not updating**

**Solution:**
- Clear browser cache
- Check Vercel deployment logs for errors
- Verify correct environment (production vs preview)
- Force refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### PWA Issues

**Issue: Service Worker not updating**

**Solution:**
```bash
# In browser DevTools:
# Application → Service Workers → Unregister
# Then hard refresh
```

**Issue: Add to Home Screen not appearing**

**Solution:**
- Verify manifest.json is accessible
- Check manifest in DevTools (Application → Manifest)
- Ensure HTTPS is enabled (required for PWA)
- Test on supported browser (Chrome, Safari, Edge)

## Rollback Procedure

### Using Vercel Dashboard

1. Go to project deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Confirm promotion

### Using Git

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or create hotfix branch
git checkout -b hotfix/revert-broken-feature
git revert <commit-hash>
git push origin hotfix/revert-broken-feature

# Create PR and merge
```

## Best Practices

### Before Merging to Main

1. Ensure CI checks pass
2. Review preview deployment
3. Test PWA features on mobile
4. Verify no console errors
5. Check Lighthouse scores

### Performance Optimization

- Use Next.js Image component for images
- Lazy load components when appropriate
- Minimize bundle size (check build output)
- Monitor Service Worker cache size

### Security

- Never commit secrets to repository
- Use environment variables for sensitive data
- Keep dependencies updated: `pnpm update`
- Review Dependabot alerts

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Check Vercel deployment logs
3. Review this documentation
4. Contact development team

---

**Last Updated:** 2026-01-09
**Maintained By:** jinit-labs development team
**Platform:** Vercel + GitHub Actions
