# Railway Deployment Guide

## Overview

This guide covers deploying the Headache Awareness Trainer PWA to Railway using GitHub Actions for automated CI/CD.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository access
- Railway API token
- Project, Service, and Environment IDs from Railway

## Initial Railway Setup

### Step 1: Create Railway Project

1. Visit https://railway.app/new
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `jinit-labs/headache-awareness-trainer`
5. Railway will auto-detect Next.js and configure build settings

### Step 2: Configure Build Settings

Railway should auto-detect the following from `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm run build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Verify in Railway dashboard:**
- Settings → Build → Build Command: `pnpm install && pnpm run build`
- Settings → Deploy → Start Command: `pnpm start`

### Step 3: Get Railway Credentials

#### Get API Token

1. Go to https://railway.app/account/tokens
2. Click "Create Token"
3. Give it a name (e.g., "GitHub Actions Deploy")
4. Copy the token (you won't see it again)
5. Save as `RAILWAY_TOKEN`

#### Get Project, Service, and Environment IDs

**Option A: Using Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
cd /path/to/headache-awareness-trainer
railway link

# Get IDs from .railway/config.json
cat .railway/config.json
```

This will show:
```json
{
  "projectId": "abc123...",
  "environmentId": "def456..."
}
```

Get Service ID:
```bash
railway status
# Look for "Service ID" in output
```

**Option B: Using GraphQL API**

```bash
# Get projects
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { me { projects { edges { node { id name } } } } }"}'

# Replace PROJECT_ID with your project ID from above
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { project(id: \"PROJECT_ID\") { services { edges { node { id name } } } environments { edges { node { id name } } } } }"}'
```

### Step 4: Add GitHub Secrets

Go to your GitHub repository:
1. Settings → Secrets and variables → Actions
2. Click "New repository secret"

Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `RAILWAY_TOKEN` | API token from Step 3 | `abc123def456...` |
| `RAILWAY_PROJECT_ID` | Project ID from Step 3 | `project-abc123` |
| `RAILWAY_SERVICE_ID` | Service ID from Step 3 | `service-def456` |
| `RAILWAY_ENVIRONMENT_ID` | Environment ID (usually "production") | `env-ghi789` |

## GitHub Actions Workflow

The workflow file `.github/workflows/deploy-railway.yml` handles automatic deployment:

### Trigger Conditions

**Automatic deployment on:**
- Push to `main` or `master` branch

**Manual deployment:**
- Go to Actions tab → Deploy to Railway → Run workflow

### Workflow Steps

1. **Checkout code** - Gets latest code from repository
2. **Setup Node.js** - Installs Node.js LTS with pnpm cache
3. **Install dependencies** - Runs `pnpm install --frozen-lockfile`
4. **Type check** - Runs `pnpm run type-check`
5. **Build** - Runs `pnpm run build` to verify production build
6. **Deploy to Railway** - Triggers deployment via GraphQL API
7. **Wait for deployment** - Monitors deployment status
8. **Get deployment URL** - Fetches the deployed service URL
9. **Post summary** - Shows deployment details in GitHub Actions

### Monitoring Deployment

**In GitHub Actions:**
1. Go to repository → Actions tab
2. Click on latest "Deploy to Railway" workflow
3. View real-time logs and deployment status

**In Railway Dashboard:**
1. Go to https://railway.app/dashboard
2. Select your project
3. View deployments, logs, and metrics

## Environment Variables

### Current Configuration

No environment variables needed for MVP deployment.

### Adding Environment Variables (Future)

When you need to add environment variables:

**In Railway Dashboard:**
1. Select your project
2. Go to service settings
3. Click "Variables" tab
4. Add variable and value
5. Click "Deploy" to apply changes

**Common variables for future features:**
- `NODE_ENV=production` (usually auto-set)
- `NEXT_PUBLIC_ANALYTICS_ID` - For analytics tracking
- `NEXT_PUBLIC_SYNC_ENDPOINT` - Cloud sync endpoint
- `DATABASE_URL` - If adding database later

## Deployment Process

### Automatic Deployment (Recommended)

```bash
# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to main branch
git push origin main

# GitHub Actions will automatically:
# 1. Run type checks
# 2. Build the application
# 3. Deploy to Railway
# 4. Post deployment summary
```

### Manual Deployment via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project (first time only)
railway link

# Deploy
railway up
```

### Manual Deployment via API

```bash
# Set your credentials
export RAILWAY_TOKEN="your-token"
export RAILWAY_PROJECT_ID="your-project-id"
export RAILWAY_SERVICE_ID="your-service-id"
export RAILWAY_ENVIRONMENT_ID="your-environment-id"

# Trigger deployment
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { serviceInstanceDeploy(environmentId: \\\"$RAILWAY_ENVIRONMENT_ID\\\", serviceId: \\\"$RAILWAY_SERVICE_ID\\\", latestCommit: true) }\"}"
```

## PWA Features on Railway

### Service Worker

Railway serves the Next.js app with proper caching headers for PWA:

- Service worker: `public/sw.js` (auto-generated by next-pwa)
- Manifest: `public/manifest.json`
- Icons: `public/icons/*`

### Testing PWA After Deployment

1. **Visit deployed URL** (shown in GitHub Actions summary)
2. **Test installation:**
   - On mobile: Browser menu → "Add to Home Screen"
   - On desktop: Chrome address bar → Install icon
3. **Test offline mode:**
   - Open app
   - Enable airplane mode
   - Verify app still functions
4. **Check cache:**
   - Open DevTools → Application → Service Workers
   - Verify service worker is active
   - Check Cache Storage for cached assets

### Lighthouse Audit

```bash
# Run Lighthouse CLI
npm i -g lighthouse

# Test your deployed URL
lighthouse https://your-app.railway.app --view
```

**Target scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
- PWA: 90+

## Monitoring & Logs

### View Application Logs

**Railway Dashboard:**
1. Go to your project
2. Click on your service
3. Click "Logs" tab
4. View real-time application logs

**Railway CLI:**
```bash
railway logs
```

### Metrics

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count

**View in dashboard:**
Project → Service → Metrics tab

## Troubleshooting

### Build Failures

**Issue: Build fails with "pnpm not found"**

Railway should auto-detect pnpm from `package.json`. If it doesn't:

1. Go to Service Settings → Build
2. Add build command: `npm install -g pnpm && pnpm install && pnpm run build`

**Issue: Type errors during build**

```bash
# Test locally first
pnpm run type-check

# Fix errors, then commit and push
```

**Issue: Build succeeds locally but fails on Railway**

Check Node.js version:
```bash
# In Railway Settings → Environment
# Add variable: NODE_VERSION=20
```

### Deployment Failures

**Issue: Deployment triggers but app doesn't update**

Make sure you're using `serviceInstanceDeploy` with `latestCommit: true`:

```graphql
mutation {
  serviceInstanceDeploy(
    environmentId: "ENV_ID",
    serviceId: "SERVICE_ID",
    latestCommit: true
  )
}
```

Not `serviceInstanceRedeploy` (which just restarts existing container).

**Issue: App crashes on startup**

Check Railway logs:
1. Dashboard → Service → Logs
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Port binding (Railway sets $PORT automatically)
   - Build artifacts missing

### GitHub Actions Failures

**Issue: Missing secrets error**

```
Error: Missing required secret: RAILWAY_TOKEN
```

Solution:
- Verify all 4 secrets are added in GitHub repository settings
- Check secret names match exactly (case-sensitive)
- Regenerate Railway token if expired

**Issue: GraphQL API returns error**

Check token permissions:
```bash
# Test API access
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { me { id email } }"}'
```

Should return your Railway user info.

## Rollback Procedure

### Using Railway Dashboard

1. Go to project → Deployments
2. Find previous working deployment
3. Click "..." → "Redeploy"
4. Confirm redeployment

### Using Git

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Automatic deployment will trigger with reverted code
```

### Using Railway CLI

```bash
# View deployment history
railway status

# Rollback to specific deployment
railway redeploy <deployment-id>
```

## Cost Optimization

Railway offers a free tier with limits:
- $5 free credit per month
- 500 hours of execution time
- 100 GB outbound bandwidth

**Optimize costs:**
1. Use automatic sleep (no traffic for 1 hour = sleep)
2. Set healthcheck to reduce unnecessary polls
3. Monitor usage in Railway dashboard

**For production:**
- Consider upgrading to Railway Pro ($20/month)
- Get dedicated resources and custom domains

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Railway project → Service → Settings
2. Click "Domains" section
3. Click "Add Domain"
4. Enter your domain (e.g., `headache-trainer.jinit-labs.com`)
5. Add CNAME record to your DNS:
   ```
   CNAME headache-trainer.jinit-labs.com -> <railway-domain>.railway.app
   ```
6. Wait for DNS propagation (5-60 minutes)
7. Railway automatically provisions SSL certificate

## Best Practices

### Before Deploying

- [ ] All tests pass locally (`pnpm test`)
- [ ] Type check passes (`pnpm run type-check`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Test production build locally (`pnpm start`)
- [ ] Review changes in pull request

### After Deployment

- [ ] Check Railway dashboard for successful deployment
- [ ] Visit deployed URL and verify functionality
- [ ] Test PWA installation on mobile
- [ ] Run Lighthouse audit
- [ ] Monitor logs for errors
- [ ] Test offline functionality

### Security

- [ ] Never commit secrets to repository
- [ ] Use GitHub Secrets for all credentials
- [ ] Keep dependencies updated (`pnpm update`)
- [ ] Review Railway access logs regularly
- [ ] Enable two-factor auth on Railway account

## Support & Resources

**Railway Documentation:**
- https://docs.railway.app
- https://docs.railway.app/reference/public-api

**Deployment Status:**
- GitHub Actions: https://github.com/kanaerulabs/jinit-labs-headache-awareness-trainer/actions
- Railway Dashboard: https://railway.app/dashboard

**For Issues:**
1. Check GitHub Actions logs
2. Check Railway deployment logs
3. Review this documentation
4. Contact development team

---

**Last Updated:** 2026-01-10
**Maintained By:** jinit-labs development team
**Platform:** Railway + GitHub Actions
