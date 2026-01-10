# Railway Deployment Setup Checklist

## ✅ Setup Status

This document tracks the completion of Railway deployment setup for the Headache Awareness Trainer PWA.

---

## 📋 Pre-Deployment Configuration

### Files Created

- [x] `railway.json` - Railway build and deploy configuration
- [x] `.github/workflows/deploy-railway.yml` - GitHub Actions workflow for automated deployment
- [x] `DEPLOYMENT-RAILWAY.md` - Comprehensive Railway deployment guide

### Configuration Summary

**railway.json:**
- Builder: NIXPACKS (auto-detects Node.js/Next.js)
- Build Command: `pnpm install && pnpm run build`
- Start Command: `pnpm start`
- Restart Policy: ON_FAILURE (max 10 retries)
- Health Check: Enabled at `/` path

**GitHub Actions Workflow:**
- Triggers: Push to `main`/`master`, manual workflow dispatch
- Steps: Type check → Build → Deploy → Monitor
- Uses Railway GraphQL API for deployment
- Posts deployment summary with URL

---

## 🚀 Required Actions (To Complete Deployment)

### Step 1: Create Railway Project

**Status:** ⏳ PENDING

**Actions:**
1. [ ] Go to https://railway.app/new
2. [ ] Click "New Project"
3. [ ] Select "Deploy from GitHub repo"
4. [ ] Choose repository: `jinit-labs/headache-awareness-trainer`
5. [ ] Wait for initial deployment to complete

**Verification:**
- Railway project created
- Service deployed successfully
- Service URL accessible

---

### Step 2: Get Railway Credentials

**Status:** ⏳ PENDING

#### 2a. Get API Token

1. [ ] Go to https://railway.app/account/tokens
2. [ ] Click "Create Token"
3. [ ] Name: "GitHub Actions Deploy"
4. [ ] Copy token value
5. [ ] Save securely (will be added to GitHub Secrets)

**Expected format:** `railway-token-abc123...`

#### 2b. Get Project, Service, and Environment IDs

**Option A: Using Railway CLI (Recommended)**

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to project directory
cd /path/to/headache-awareness-trainer

# Link to Railway project
railway link

# Get IDs
cat .railway/config.json
railway status
```

**Option B: Using GraphQL API**

```bash
# Set your token
export RAILWAY_TOKEN="your-token-here"

# Get projects
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { me { projects { edges { node { id name } } } } }"}' | jq

# Get service and environment IDs (replace PROJECT_ID)
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { project(id: \"PROJECT_ID\") { services { edges { node { id name } } } environments { edges { node { id name } } } } }"}' | jq
```

**Record these values:**
- [ ] Project ID: `_____________________________`
- [ ] Service ID: `_____________________________`
- [ ] Environment ID: `_____________________________`
- [ ] API Token: `_____________________________` (securely stored)

---

### Step 3: Configure GitHub Secrets

**Status:** ⏳ PENDING

**Location:** GitHub repository → Settings → Secrets and variables → Actions

**Required Secrets:**

| Secret Name | Value | Status |
|-------------|-------|--------|
| `RAILWAY_TOKEN` | API token from Step 2a | [ ] |
| `RAILWAY_PROJECT_ID` | Project ID from Step 2b | [ ] |
| `RAILWAY_SERVICE_ID` | Service ID from Step 2b | [ ] |
| `RAILWAY_ENVIRONMENT_ID` | Environment ID from Step 2b | [ ] |

**To add secrets:**
1. [ ] Go to https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/settings/secrets/actions
2. [ ] Click "New repository secret"
3. [ ] Add each secret with exact name and value
4. [ ] Verify all 4 secrets are added

**Verification:**
```bash
# Test API access with token
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { me { id email } }"}' | jq
```

Expected: Returns your Railway user info (not error)

---

### Step 4: Trigger First Deployment

**Status:** ⏳ PENDING

**Option A: Automatic (via Git push)**

```bash
# Commit the Railway configuration files
git add railway.json .github/workflows/deploy-railway.yml DEPLOYMENT-RAILWAY.md RAILWAY-SETUP-CHECKLIST.md
git commit -m "feat: add Railway deployment configuration

- Add railway.json with build/deploy settings
- Add GitHub Actions workflow for automated deployment
- Add comprehensive deployment documentation
- Configure health checks and restart policy

🤖 Generated with Kanaeru AI Platform"

# Push to main branch
git push origin main
```

**Option B: Manual (via GitHub Actions)**

1. [ ] Go to https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/actions
2. [ ] Click "Deploy to Railway" workflow
3. [ ] Click "Run workflow"
4. [ ] Select branch: `main`
5. [ ] Click "Run workflow" button

**Verification:**
- [ ] GitHub Actions workflow starts
- [ ] All steps complete successfully (green checkmarks)
- [ ] Deployment URL appears in workflow summary
- [ ] Railway dashboard shows successful deployment

---

### Step 5: Verify Deployment

**Status:** ⏳ PENDING

**Test Checklist:**

#### Basic Functionality
- [ ] Visit deployment URL (shown in GitHub Actions summary)
- [ ] Home page loads without errors
- [ ] Navigation works (Today, Calendar, Insights, Settings)
- [ ] Quick Check-in button functional
- [ ] Settings page accessible

#### PWA Features
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker is registered and active
- [ ] Test "Add to Home Screen" on mobile device
- [ ] Enable airplane mode → verify offline functionality
- [ ] Check manifest.json loads correctly

#### Performance
- [ ] Run Lighthouse audit (Chrome DevTools)
  - [ ] Performance: 90+
  - [ ] Accessibility: 95+
  - [ ] Best Practices: 90+
  - [ ] SEO: 90+
  - [ ] PWA: 90+
- [ ] Check network tab for proper caching
- [ ] Verify page load time < 2s

#### Data Persistence
- [ ] Create a check-in entry
- [ ] Reload page → verify data persists
- [ ] Clear browser cache → data still persists (IndexedDB)
- [ ] Test on incognito mode

**Record Results:**
- Deployment URL: `_________________________________`
- Lighthouse Performance: `_____`
- Lighthouse PWA: `_____`
- Service Worker Status: `_____________________`
- Offline Mode: `Working / Not Working`

---

### Step 6: Monitor and Maintain

**Status:** ⏳ PENDING

#### Setup Monitoring

**Railway Dashboard:**
1. [ ] Bookmark project URL: https://railway.app/project/[PROJECT_ID]
2. [ ] Review metrics (CPU, memory, network)
3. [ ] Set up alerts (optional)

**GitHub Actions:**
1. [ ] Bookmark actions page
2. [ ] Review workflow runs
3. [ ] Check for failed deployments

#### Regular Maintenance

**Weekly:**
- [ ] Check Railway dashboard for errors
- [ ] Review deployment logs
- [ ] Monitor resource usage

**Monthly:**
- [ ] Update dependencies (`pnpm update`)
- [ ] Re-run Lighthouse audit
- [ ] Review Railway billing/usage

**As Needed:**
- [ ] Roll back if deployment fails
- [ ] Update environment variables
- [ ] Scale resources if needed

---

## 📊 Deployment Metrics

**First Deployment:**
- Date: `_______________`
- Deployment Time: `_______________`
- Build Duration: `_______________`
- Deploy Duration: `_______________`
- Total Time: `_______________`

**Performance Baseline:**
- Lighthouse Performance: `_____`
- Lighthouse PWA: `_____`
- First Contentful Paint: `_____`
- Time to Interactive: `_____`
- Total Bundle Size: `_____`

---

## 🐛 Troubleshooting Reference

### Common Issues

**Build Fails:**
1. Check GitHub Actions logs
2. Verify `pnpm run build` works locally
3. Ensure Node.js version matches (LTS)
4. Check Railway build logs

**Deployment Succeeds but App Crashes:**
1. Check Railway logs for startup errors
2. Verify environment variables
3. Test `pnpm start` locally after build
4. Check for port binding issues

**Service Worker Not Updating:**
1. DevTools → Application → Service Workers → Unregister
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Clear browser cache
4. Verify deployment completed successfully

**GitHub Actions Fails:**
1. Verify all 4 secrets are added
2. Check secret names match exactly (case-sensitive)
3. Test Railway API token with curl
4. Review workflow logs for specific error

### Support Resources

- **Railway Docs:** https://docs.railway.app
- **Railway API:** https://docs.railway.app/reference/public-api
- **Deployment Guide:** See `DEPLOYMENT-RAILWAY.md`
- **GitHub Actions:** https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/actions

---

## ✅ Sign-Off

**Deployment Ready:** ⏳ PENDING

Once all steps are completed and verified:

- [ ] All configuration files created
- [ ] Railway project created
- [ ] GitHub secrets configured
- [ ] First deployment successful
- [ ] PWA features verified
- [ ] Performance targets met
- [ ] Monitoring configured

**Completed By:** `_________________`
**Date:** `_________________`
**Deployment URL:** `_________________________________`

---

**Last Updated:** 2026-01-10
**Next Review:** After first successful deployment
