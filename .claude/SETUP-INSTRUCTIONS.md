# Quick Setup Instructions

## Deployment Infrastructure Setup Complete

The CI/CD pipeline and Vercel deployment infrastructure has been successfully configured. Follow these steps to complete the setup.

## What Was Created

### GitHub Actions Workflows
- `.github/workflows/ci.yml` - Runs on all PRs (lint, typecheck, test, build)
- `.github/workflows/deploy-production.yml` - Deploys to production on main branch
- `.github/workflows/deploy-preview.yml` - Creates preview deployments for PRs

### Configuration Files
- `vercel.json` - Vercel deployment configuration with PWA headers
- `DEPLOYMENT.md` - Comprehensive deployment guide (368 lines)
- `README.md` - Updated with deployment status badges

### Commit
- SHA: `badc6ce`
- Files changed: 6 files, 636 insertions
- URL: https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/commit/badc6ce

## Setup Steps (10 minutes)

### Step 1: Create Vercel Project (2 min)

1. Visit https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import: `kanaerulabs/jinit-labs-headache-awareness-trainer`
5. Accept default settings (Next.js detected automatically)
6. Click "Deploy" (first deployment)

### Step 2: Get Vercel Credentials (3 min)

#### A. Generate API Token
1. Visit https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "GitHub Actions Deployment"
4. Scope: Full Access
5. Copy token (save securely - shown only once)

#### B. Get Project IDs

**Option 1: From Vercel CLI (recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd /path/to/headache-awareness-trainer

# Link project
vercel link

# View project configuration
cat .vercel/project.json
```

You'll see:
```json
{
  "projectId": "prj_xxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxx"
}
```

**Option 2: From Vercel Dashboard**
1. Go to project settings
2. Copy Project ID from URL: `vercel.com/[org]/[project]/settings`
3. Copy Org/Team ID from organization settings

### Step 3: Add GitHub Secrets (2 min)

1. Go to repository: https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret" for each:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `VERCEL_TOKEN` | Token from Step 2A | Vercel account tokens page |
| `VERCEL_ORG_ID` | orgId from Step 2B | `.vercel/project.json` or dashboard |
| `VERCEL_PROJECT_ID` | projectId from Step 2B | `.vercel/project.json` or dashboard |

### Step 4: Test Preview Deployment (3 min)

```bash
# Create test branch
git checkout -b test/deployment-verification

# Make small change (add comment to README)
echo "\n<!-- Deployment test -->" >> README.md

# Push branch
git add README.md
git commit -m "test: verify preview deployment"
git push origin test/deployment-verification

# Create PR on GitHub
gh pr create --title "Test: Verify deployment" --body "Testing preview deployment"
```

**Expected Result:**
- GitHub Actions runs CI workflow
- Preview deployment created on Vercel
- Bot comments on PR with preview URL
- All checks pass

### Step 5: Test Production Deployment (optional)

Only if Step 4 succeeded:

```bash
# Merge test PR
gh pr merge --squash

# Check Actions tab for production deployment
# Visit production URL from deployment summary
```

## Verification Checklist

After setup:

- [ ] Vercel project created and linked
- [ ] All three GitHub secrets added
- [ ] Test PR triggers preview deployment
- [ ] PR comment shows preview URL
- [ ] CI checks pass (lint, typecheck, test, build)
- [ ] Merge to main triggers production deployment
- [ ] Deployment badges appear in README
- [ ] PWA features work (Add to Home Screen)
- [ ] Offline mode functional

## PWA Testing

Test these features on production/preview URL:

### Mobile Testing
1. Open URL on mobile device (Chrome or Safari)
2. Tap browser menu → "Add to Home Screen"
3. Verify app icon appears on home screen
4. Open from home screen (should look like native app)

### Offline Mode
1. Open app while online
2. Navigate through app to cache pages
3. Enable airplane mode
4. Verify app still loads and functions
5. Check cached data is accessible

### Lighthouse Audit
1. Open production URL in Chrome
2. Open DevTools (F12)
3. Go to Lighthouse tab
4. Run audit (Mobile, All categories)
5. Target scores:
   - Performance: 90+
   - PWA: 90+
   - Accessibility: 90+

## Troubleshooting

### "Missing required secret: VERCEL_TOKEN"

**Cause:** GitHub secret not configured or misspelled

**Fix:**
- Verify secret names are EXACTLY:
  - `VERCEL_TOKEN` (not `VERCEL_API_TOKEN`)
  - `VERCEL_ORG_ID` (not `VERCEL_TEAM_ID`)
  - `VERCEL_PROJECT_ID` (not `VERCEL_ID`)
- Secrets are case-sensitive
- Regenerate token if expired

### Preview deployment succeeds but no PR comment

**Cause:** GitHub token permissions issue

**Fix:**
- Go to repository Settings → Actions → General
- Scroll to "Workflow permissions"
- Select "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

### Build fails in CI but works locally

**Cause:** Node version mismatch or missing dependencies

**Fix:**
```bash
# Check local Node version
node --version

# Should match LTS (20.x or 22.x)
# Update if different

# Ensure lock file is committed
git add pnpm-lock.yaml
git commit -m "chore: update lock file"
```

### PWA features not working

**Cause:** Service worker not registered or HTTPS required

**Fix:**
- Verify production URL uses HTTPS (required for PWA)
- Check DevTools → Application → Service Workers
- Clear cache and hard refresh
- Unregister old service workers

## Next Steps

After successful setup:

1. **Remove test branch:**
   ```bash
   git checkout main
   git branch -D test/deployment-verification
   git push origin --delete test/deployment-verification
   ```

2. **Enable Vercel Analytics (optional):**
   - Go to Vercel project settings
   - Enable Analytics
   - View real user metrics

3. **Set up notifications:**
   - Go to Vercel project settings → Notifications
   - Add Slack/Discord webhook for deployment alerts

4. **Configure branch protection:**
   - Go to GitHub repository settings → Branches
   - Add rule for `main` branch:
     - Require status checks (CI workflow)
     - Require pull request reviews
     - Require branches to be up to date

## Support

For detailed information, see:
- **DEPLOYMENT.md** - Full deployment guide
- **GitHub Actions logs** - https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/actions
- **Vercel dashboard** - https://vercel.com/dashboard

## Summary

**Status:** ✅ Ready for deployment

**Time to Deploy:** ~10 minutes for initial setup

**What's Automated:**
- Linting and type checking on every PR
- Unit tests on every PR
- Production builds verification
- Preview deployments for PRs (with PR comments)
- Production deployments on merge to main

**Manual Steps Required:**
- Add Vercel secrets to GitHub (one-time setup)
- Verify first deployment works
- Test PWA features

---

**Generated:** 2026-01-09
**Commit:** badc6ce
**Agent:** deployment-setup-agent
