# WooCommerce Status Page - Deployment Guide

This guide will help you deploy your custom WooCommerce status page to Cloudflare Workers using the free tier.

## Overview

Your status page will monitor:
- **Homepage** - Main website availability
- **Shop Page** - WooCommerce storefront
- **WordPress REST API** - Backend API health
- **WooCommerce REST API** - WooCommerce backend availability

It will check these endpoints every 3 minutes and send email notifications when any endpoint goes down or comes back up.

## Deployment Options

You have **two ways** to deploy this status page:

### Option A: Automatic Deployment via GitHub Actions (Recommended)
- Push to `main` branch and GitHub automatically deploys
- Requires GitHub repository secrets setup
- Best for continuous updates
- **See: GitHub Actions Deployment Section below**

### Option B: Manual Deployment via Wrangler CLI
- Deploy manually from your computer using Wrangler
- No GitHub secrets needed
- Best for one-time setup or testing
- **See: Manual Deployment Section below**

---

## GitHub Actions Deployment (Option A)

### Prerequisites

1. **Cloudflare Account** (free tier) - Sign up at https://dash.cloudflare.com/sign-up
2. **Resend Account** (free tier) - Sign up at https://resend.com/signup
3. **GitHub repository** with this code pushed to it

### Step 1: Get Your Cloudflare Credentials

#### 1.1 Get Account ID
1. Log in to https://dash.cloudflare.com/
2. Click on "Workers & Pages" in the left sidebar
3. Copy your **Account ID** from the right sidebar

#### 1.2 Create API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template or create custom token with:
   - Permissions: `Account.Cloudflare Workers Scripts = Edit`
4. Copy the API token (you'll only see it once!)

### Step 2: Get Your Resend API Key

1. Log in to https://resend.com
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Name it "CloudflareWorkerStatus" (or any name you prefer)
5. Copy the API key (you'll only see it once!)

### Step 3: Configure Your WooCommerce URLs

Open `config.yaml` in the repository and replace the placeholder URLs with your actual WooCommerce site URLs:

```yaml
settings:
  title: 'WooCommerce Status'
  url: 'https://your-worker-name.workers.dev' # You'll update this after deployment

monitors:
  - id: homepage
    name: 'Your Site Name' # Replace with your actual site name (e.g., "My Store")
    url: 'https://your-woocommerce-site.com' # Replace with your actual domain

  - id: shop
    name: 'Shop Page'
    url: 'https://your-woocommerce-site.com/shop' # Replace with your shop URL

  - id: wp-api
    name: 'WordPress REST API'
    url: 'https://your-woocommerce-site.com/wp-json/' # Replace with your WP API URL

  - id: wc-api
    name: 'WooCommerce REST API'
    url: 'https://your-woocommerce-site.com/wp-json/wc/v3/' # Replace with your WC API URL
    expectStatus: 401 # 401 means WooCommerce is responding (just requires auth)
```

**Important:** The WooCommerce REST API endpoint should return `401` (unauthorized) when accessed without authentication. This is normal and expected - it means WooCommerce is working. If your site returns a different status code (like `200` or `404`), update the `expectStatus` value accordingly.

### Step 4: Set Up GitHub Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

**Required secrets:**
- Name: `CF_API_TOKEN` → Value: Your Cloudflare API token (from Step 1.2)
- Name: `CF_ACCOUNT_ID` → Value: Your Cloudflare account ID (from Step 1.1)
- Name: `SECRET_RESEND_API_KEY` → Value: Your Resend API key (from Step 2)
- Name: `SECRET_EMAIL_TO` → Value: Your email address for notifications

**Optional secrets** (if you want additional notification channels):
- `SECRET_SLACK_WEBHOOK_URL` - Slack webhook URL
- `SECRET_TELEGRAM_API_TOKEN` - Telegram bot token
- `SECRET_TELEGRAM_CHAT_ID` - Telegram chat ID
- `SECRET_DISCORD_WEBHOOK_URL` - Discord webhook URL

### Step 5: Commit and Push to Main Branch

1. Commit your `config.yaml` changes to GitHub
2. Push to the `main` branch
3. GitHub Actions will automatically:
   - Build the project
   - Create KV namespace
   - Deploy to Cloudflare Workers
   - Set up all secrets

4. Check the **Actions** tab in your GitHub repo to see deployment progress
5. Once complete, your status page will be live at `https://cf-workers-status-page.<your-account>.workers.dev`

### Step 6: Update Worker URL in config.yaml

After deployment, update `config.yaml` with your actual worker URL and push again:

```yaml
settings:
  url: 'https://cf-workers-status-page.<your-account>.workers.dev'
```

**Done!** Your status page is now deployed and will automatically redeploy on every push to `main`.

---

## Manual Deployment via Wrangler CLI (Option B)

### Prerequisites

1. **Cloudflare Account** (free tier) - Sign up at https://dash.cloudflare.com/sign-up
2. **Resend Account** (free tier) - Sign up at https://resend.com/signup
3. **Node.js and npm** installed on your computer

### Step 1: Get Your Cloudflare Account ID

1. Log in to https://dash.cloudflare.com/
2. Click on "Workers & Pages" in the left sidebar
3. Copy your **Account ID** from the right sidebar (you'll need this later)

### Step 2: Get Your Resend API Key

1. Log in to https://resend.com
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Name it "CloudflareWorkerStatus" (or any name you prefer)
5. Copy the API key (you'll only see it once!)

### Step 3: Configure Your WooCommerce URLs

Same as GitHub Actions Step 3 above - update `config.yaml` with your actual URLs.

### Step 4: Update wrangler.toml

Open `wrangler.toml` and add your Cloudflare account ID:

```toml
name = "cf-workers-status-page"
workers_dev = true
account_id = "YOUR_ACCOUNT_ID_HERE" # Paste your account ID from Step 1
```

The CRON schedule is already configured to run every 3 minutes (`*/3 * * * *`), which is free-tier compatible.

### Step 5: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### Step 6: Install Wrangler CLI

If you don't have Wrangler installed globally, install it:

```bash
npm install -g wrangler
```

### Step 7: Login to Cloudflare via Wrangler

```bash
wrangler login
```

This will open a browser window for you to authorize Wrangler with your Cloudflare account.

### Step 8: Create KV Namespace

Create a KV namespace to store monitoring data:

```bash
wrangler kv:namespace create KV_STATUS_PAGE
```

This will output something like:
```
{ binding = "KV_STATUS_PAGE", id = "abc123def456" }
```

Copy the `id` value (e.g., `abc123def456`).

### Step 9: Add KV Namespace to wrangler.toml

Add the KV namespace configuration to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV_STATUS_PAGE"
id = "abc123def456" # Use the ID from Step 8
```

### Step 10: Add Secrets

Add your Resend API key and email address as Cloudflare Worker secrets:

```bash
wrangler secret put SECRET_RESEND_API_KEY
# Paste your Resend API key when prompted

wrangler secret put SECRET_EMAIL_TO
# Enter the email address where you want to receive notifications
```

### Step 11: Build the Project

Build the status page:

```bash
npm run build
```

### Step 12: Deploy to Cloudflare

Deploy your worker:

```bash
wrangler publish
```

After successful deployment, you'll see output like:
```
Published cf-workers-status-page (X.XX sec)
  https://cf-workers-status-page.your-account.workers.dev
```

Copy the URL - this is your status page!

### Step 13: Update config.yaml with Your Worker URL

Go back to `config.yaml` and update the `settings.url` with your actual worker URL:

```yaml
settings:
  url: 'https://cf-workers-status-page.your-account.workers.dev'
```

Then rebuild and redeploy:

```bash
npm run build
wrangler publish
```

### Step 14: Test Your Status Page

1. Visit your status page URL (e.g., `https://cf-workers-status-page.your-account.workers.dev`)
2. You should see all 4 monitors listed
3. Initially, they may show "No data" - wait 3-4 minutes for the first check to complete
4. After the first check, monitors should show as "Operational" or "Not Operational"

### Step 15: Test Email Notifications

To test email notifications, temporarily change one monitor's expected status in `config.yaml`:

```yaml
  - id: homepage
    name: 'Your Site Name'
    url: 'https://your-woocommerce-site.com'
    expectStatus: 500 # Temporarily change to 500 to trigger a failure
```

Rebuild and redeploy:

```bash
npm run build
wrangler publish
```

Within 3-4 minutes, you should receive an email notification saying the homepage is down. Change it back to `200`, rebuild, redeploy, and you should receive another email saying it's back online.

---

## Which Deployment Method Should I Use?

### Use GitHub Actions (Option A) if:
- ✅ You want automatic deployment on every code change
- ✅ You're comfortable setting up GitHub secrets
- ✅ You plan to make frequent updates to monitoring configuration
- ✅ You want a "push and forget" workflow

### Use Wrangler CLI (Option B) if:
- ✅ You prefer manual control over deployments
- ✅ You don't want to set up GitHub secrets
- ✅ You're doing a one-time setup
- ✅ You want to test locally before deploying

**Both methods work equally well and use the same free tier resources!**

---

## Monitoring Free Tier Usage

To ensure you stay within Cloudflare's free tier limits:

1. Log in to https://dash.cloudflare.com/
2. Go to "Workers & Pages"
3. Click on your worker
4. Navigate to the "Metrics" tab
5. Monitor your KV reads/writes and requests

**Expected usage with 4 monitors, 3-minute checks:**
- CRON executions: ~480 per day
- KV writes: ~960 per day (well within the 1,000/day limit)
- Requests: Very low (only CRON triggers + status page visits)

## Adjusting Check Frequency

If you need faster alerts or want to conserve KV quota:

**2-minute checks** (more frequent, near free tier limit):
```toml
crons = ["*/2 * * * *"]
```

**5-minute checks** (more conservative):
```toml
crons = ["*/5 * * * *"]
```

After changing, rebuild and redeploy.

## Troubleshooting

### Status Page Shows "No data"
- Wait 3-4 minutes for the first CRON trigger to run
- Check Cloudflare dashboard logs for errors

### Email Notifications Not Working
- Verify secrets are set correctly: `wrangler secret list`
- Check Resend dashboard for email logs and errors
- Verify your email address is correct
- Check spam folder

### Monitor Shows "Not Operational" But Site is Up
- Verify the `expectStatus` matches what your endpoint actually returns
- Test your endpoints manually in a browser or with `curl`
- For WooCommerce API (`/wp-json/wc/v3/`), it should return `401` if working

### WooCommerce API Returns 200 Instead of 401
Some WooCommerce configurations may return different status codes. Update `expectStatus` in `config.yaml` to match:

```yaml
  - id: wc-api
    name: 'WooCommerce REST API'
    url: 'https://your-woocommerce-site.com/wp-json/wc/v3/'
    expectStatus: 200 # Or whatever your site returns
```

### Deployment Fails
- Verify `account_id` is correct in `wrangler.toml`
- Ensure you're logged in: `wrangler whoami`
- Check that KV namespace was created and ID is correct

## What This Status Page Monitors

✅ **What it can detect:**
- Website is down (server not responding)
- Shop page not loading (WooCommerce frontend issues)
- WordPress REST API not responding
- WooCommerce not active or not responding
- Slow response times (tracked in histograms)
- SSL certificate issues
- DNS resolution failures

❌ **What it cannot detect:**
- Payment gateway failures (requires authentication)
- Order processing issues (requires testing actual orders)
- Database connection issues (unless they cause page errors)
- Plugin errors that don't show on monitored pages
- Admin panel issues (wp-admin is not monitored)

## Additional Features

### Adding More Monitors

You can add more endpoints to monitor by editing `config.yaml`:

```yaml
  - id: my-account
    name: 'My Account Page'
    description: 'Customer account area'
    url: 'https://your-woocommerce-site.com/my-account/'
    method: GET
    expectStatus: 200
    linkable: true
```

After adding monitors, rebuild and redeploy.

### Slack/Discord/Telegram Notifications

This status page also supports Slack, Discord, and Telegram notifications. To enable:

1. Get webhook URL from your preferred platform
2. Add it as a secret:
   ```bash
   wrangler secret put SECRET_SLACK_WEBHOOK_URL
   # or
   wrangler secret put SECRET_DISCORD_WEBHOOK_URL
   # or
   wrangler secret put SECRET_TELEGRAM_API_TOKEN
   wrangler secret put SECRET_TELEGRAM_CHAT_ID
   ```
3. Redeploy

### Custom Domain (Optional - Requires Paid Cloudflare Plan)

If you have a domain connected to Cloudflare, you can use a custom domain for your status page. Update `wrangler.toml`:

```toml
workers_dev = false
route = "status.yourdomain.com/*"
zone_id = "your-zone-id"
```

## Support

- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Resend Docs:** https://resend.com/docs
- **Original Project:** https://github.com/eidam/cf-workers-status-page

## Summary

You now have a fully functional WooCommerce status page that:
- Monitors 4 critical endpoints every 3 minutes
- Sends email notifications on status changes
- Displays 90-day uptime history
- Tracks response times
- Runs entirely on free tier (Cloudflare + Resend)
- Requires no custom domain

Visit your status page URL anytime to check the health of your WooCommerce site!
