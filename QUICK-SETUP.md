# Quick Deployment Setup Guide

## Status: Infrastructure Complete ✅

Your deployment infrastructure is fully configured and ready to use. Follow these steps to enable automatic deployments.

## Prerequisites

- GitHub repository: `kanaerulabs/jinit-labs-headache-awareness-trainer`
- Vercel account (sign up at https://vercel.com)
- GitHub account with repository access

## Step 1: Create Vercel Project (5 minutes)

1. Visit https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Select `kanaerulabs/jinit-labs-headache-awareness-trainer`
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `pnpm run build` (auto-detected)
   - **Install Command:** `pnpm install` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
5. Click "Deploy"

## Step 2: Get Vercel Credentials (3 minutes)

### Get Vercel API Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "GitHub Actions Deployment"
4. Copy the token (you'll only see it once)

### Get Project IDs

**Option A: From Vercel Dashboard (Easiest)**
1. Go to your project settings in Vercel
2. Find "Project ID" in the General tab
3. Find "Org ID" by running: `vercel whoami` (if CLI installed)

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project directory
cd /path/to/headache-awareness-trainer

# Link project
vercel link

# View IDs
cat .vercel/project.json
```

The file will contain:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

## Step 3: Add GitHub Secrets (2 minutes)

1. Go to https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/settings/secrets/actions
2. Click "New repository secret"
3. Add three secrets:

| Name | Value | From |
|------|-------|------|
| `VERCEL_TOKEN` | The token you created | Vercel account tokens page |
| `VERCEL_ORG_ID` | Your org ID | .vercel/project.json or Vercel CLI |
| `VERCEL_PROJECT_ID` | Your project ID | .vercel/project.json or Vercel CLI |

## Step 4: Test Deployment (5 minutes)

### Test Preview Deployment (PR)

```bash
# Create a test branch
git checkout -b test/deployment-check

# Make a small change (e.g., update README)
echo "\n<!-- Deployment test -->" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify deployment pipeline"
git push origin test/deployment-check

# Create PR on GitHub
# Watch for GitHub Actions to run
# Look for bot comment with preview URL
```

### Test Production Deployment

```bash
# Merge the PR or push directly to main
git checkout main
git merge test/deployment-check
git push origin main

# Watch GitHub Actions for production deployment
# Check Vercel dashboard for live URL
```

## Step 5: Verify PWA Features (10 minutes)

After production deployment:

### On Desktop
1. Visit production URL
2. Open Chrome DevTools
3. Run Lighthouse audit
4. Verify PWA score is 90+

### On Mobile
1. Visit production URL on mobile browser
2. Tap browser menu → "Add to Home Screen"
3. Verify app installs correctly
4. Open app from home screen
5. Enable airplane mode
6. Verify app still works offline

## Troubleshooting

### Build Fails in GitHub Actions

**Check Node.js version:**
```bash
node --version  # Should be Node.js LTS (v20+)
```

**Verify dependencies:**
```bash
pnpm install --frozen-lockfile
pnpm run build
```

### Deployment Fails

**Verify secrets are correct:**
- Secret names are case-sensitive
- Token hasn't expired
- Project ID and Org ID match your Vercel project

**Check Vercel logs:**
- Go to Vercel dashboard
- Click on failed deployment
- Review build logs

### PWA Not Working

**Service Worker issues:**
- Open DevTools → Application → Service Workers
- Unregister service worker
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Manifest issues:**
- Open DevTools → Application → Manifest
- Verify manifest.json loads correctly
- Check for console errors

## What's Already Configured

✅ GitHub Actions workflows (CI, preview, production)
✅ Vercel configuration with PWA headers
✅ Service worker with offline support
✅ PWA manifest and icons
✅ Comprehensive documentation (DEPLOYMENT.md)

## Next Actions After Setup

- [ ] Complete Vercel project setup
- [ ] Add GitHub secrets
- [ ] Test preview deployment with a PR
- [ ] Test production deployment
- [ ] Verify PWA features on mobile
- [ ] Optional: Configure custom domain
- [ ] Optional: Enable Vercel Analytics

## Additional Resources

- **Full deployment guide:** See DEPLOYMENT.md
- **Vercel documentation:** https://vercel.com/docs
- **PWA documentation:** https://web.dev/progressive-web-apps/
- **GitHub Actions docs:** https://docs.github.com/en/actions

## Support

For issues:
1. Check DEPLOYMENT.md for detailed troubleshooting
2. Review GitHub Actions logs
3. Check Vercel deployment logs
4. Contact development team

---

**Estimated Total Time:** 20-30 minutes

**Last Updated:** 2026-01-10
