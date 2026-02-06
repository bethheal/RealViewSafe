# Production Deployment & SEO Verification Checklist

**Date:** February 6, 2026  
**App:** RealViewEstate Real Estate Platform  
**Status:** Ready for Production Deployment

---

## Pre-Deployment Checklist (48 Hours Before Launch)

### Environment Configuration

- [ ] Backend `.env` contains all required vars (see PRODUCTION_AUDIT.md Part 1)
- [ ] Frontend `.env.production` configured with `VITE_API_URL=https://realviewsafe.onrender.com/api`
- [ ] Database backup created
- [ ] SSL certificate valid and auto-renewal configured
- [ ] CORS origins updated to production domains only:
  - `https://realviewgh.com`
  - `https://realviewfrontend.onrender.com` (if using separate frontend)
  - Remove `http://localhost` entries
- [ ] JWT_SECRET is cryptographically random (min 32 chars)
- [ ] PAYSTACK_SECRET_KEY and PAYSTACK_PLAN_* vars set and tested
- [ ] RESEND_API_KEY and MAIL_FROM configured for password reset emails

### Frontend Build & Deployment

```bash
# Run in frontend/real-view-estate/
npm install
npm run build

# Expected output:
# ✓ vite v5.4.21 building for production...
# ✓ env validation passed
# ✓ wrote sitemap to public/sitemap.xml
# ✓ built in XX.XXs
```

- [ ] No build errors or warnings
- [ ] `public/sitemap.xml` generated and contains correct URLs
- [ ] `public/robots.txt` exists and denies /admin
- [ ] Bundle size <500KB (gzip)
- [ ] Deploy to Vercel/Netlify/Firebase:
  ```bash
  npm run build && npm run preview
  # Verify locally on http://localhost:4173
  ```

### Backend Build & Configuration

```bash
# Run in backend/
npm install
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
export JWT_SECRET="$(openssl rand -base64 32)"
export PAYSTACK_SECRET_KEY="sk_live_..."

# Test migrations
npx prisma migrate deploy

# Seed admin (if first time)
node prisma/seedAdmin.js

# Start production server
npm start
# Expected: "✅ Database connected successfully"
# Expected: "🚀 Server running on port 5000"
```

- [ ] Migrations run without errors
- [ ] Admin account created/accessible
- [ ] Server starts and logs are JSON formatted
- [ ] `/api/health` endpoint returns `{ ok: true }`

### Security & Performance Tests (1 Hour Before Launch)

```bash
# Run npm audit
npm audit
# Expected: 0 critical vulnerabilities
```

- [ ] No critical CVEs in dependencies
- [ ] Run local smoke tests:
  - [ ] Login flow works (username/password + Google OAuth)
  - [ ] Browse properties without login
  - [ ] Add property to favorites (requires login)
  - [ ] Initiate payment flow (test Paystack)
  - [ ] Password reset email sends
- [ ] Test Core Web Vitals locally:
  ```bash
  # Use Lighthouse in Chrome DevTools
  # Target: LCP <2.5s, FID <100ms, CLS <0.1
  ```

### DNS & Routing

- [ ] Domain `realviewgh.com` resolves to frontend (CDN or server IP)
- [ ] `api.realviewgh.com` or subdomain routes to backend (if separate)
- [ ] SSL certificate provisioned for both frontend and backend domains
- [ ] HSTS header enables after HTTPS verified

---

## Launch Sequence (Day of Deployment)

### Step 1: Deploy Backend (30 minutes)

1. Push code to `main` branch (or deploy from CI/CD)
2. Rendering/Heroku/DigitalOcean deploys automatically OR:
   ```bash
   # Manual deployment
   git push heroku main
   # or
   render deploy --service <service-id>
   ```
3. Wait for health check: `curl https://realviewsafe.onrender.com/api/health`
   - Expected: `{ ok: true, message: "API healthy" }`
4. Monitor logs for errors:
   ```
   render logs --service <service-id> --follow
   ```

### Step 2: Deploy Frontend (15 minutes)

1. Push code to `main` or trigger build in Vercel/Netlify
2. Frontend automatically rebuilds with:
   - `prebuild`: env validation + sitemap generation
   - `build`: vite production build
   - Deployment to CDN
3. Verify: `curl https://realviewgh.com/sitemap.xml` returns XML
4. Test: Open `https://realviewgh.com` in browser
   - No console errors
   - OG tags visible in Inspect > Head

### Step 3: Smoke Testing (15 minutes)

| Test | Expected | Status |
|------|----------|--------|
| Load homepage | <3s load time | ☐ |
| Login page accessible | Form renders | ☐ |
| Login flow | Token stored in localStorage | ☐ |
| Browse properties | Properties load without cache | ☐ |
| Add to favorites | Heart icon toggles | ☐ |
| Initiate payment | Paystack modal opens | ☐ |
| Forgot password | Email sends within 30s | ☐ |
| 404 page | Custom error message | ☐ |
| Mobile responsive | Hamburger menu works | ☐ |
| HTTPS enforced | No mixed content warnings | ☐ |

### Step 4: SEO & Meta Verification (10 minutes)

**Test in browser:**
```javascript
// Paste in console on any page
console.log(document.title);
console.log(document.querySelector('meta[name="description"]').content);
console.log(document.querySelector('link[rel="canonical"]').href);
console.log(document.querySelector('meta[property="og:image"]').content);
```

- [ ] Title tag matches expected (50–60 chars)
- [ ] Meta description visible (150–160 chars)
- [ ] Canonical URL is absolute HTTPS URL
- [ ] OG image URL is absolute, image exists

**Facebook Sharing Debugger:**
1. Go to https://developers.facebook.com/tools/debug/
2. Enter `https://realviewgh.com`
3. Verify: Title, description, image render correctly

**Google Mobile-Friendly Test:**
1. Go to https://search.google.com/test/mobile-friendly
2. Enter `https://realviewgh.com`
3. Expected: "Page is mobile friendly"

### Step 5: Monitoring Setup (15 minutes)

1. **Google Search Console:**
   - [ ] Add property for `realviewgh.com`
   - [ ] Upload sitemap.xml: https://realviewgh.com/sitemap.xml
   - [ ] Request indexing for home page
   - [ ] Wait 24-48 hours for crawl

2. **Google Analytics:**
   - [ ] GA4 property created and verified
   - [ ] Tracking ID in frontend (if using)
   - [ ] Test event tracking (view page, click CTA)

3. **Uptime Monitoring:**
   - [ ] Set up UptimeRobot for `/api/health`
   - [ ] Set up alerts for response time >3s
   - [ ] Test webhook notifications

4. **Error Tracking:**
   - [ ] Optional: Set up Sentry for JavaScript errors
   - [ ] Backend logs monitored in Render/Heroku dashboard

---

## SEO Verification Checklist

### On-Page SEO

| Element | Expected | Verified |
|---------|----------|----------|
| **Title Tag** | Unique, 50–60 chars, keyword-rich | ☐ |
| **Meta Description** | Unique, 150–160 chars, CTA | ☐ |
| **H1 Tag** | One per page, matches title theme | ☐ |
| **H2/H3 Tags** | Hierarchy visible, keyword-relevant | ☐ |
| **Image Alt Text** | All images have alt, descriptive | ☐ |
| **Canonical URL** | Present, absolute HTTPS URL | ☐ |
| **Internal Links** | Descriptive anchor text, contextual | ☐ |

### Technical SEO

| Element | Expected | Verified |
|---------|----------|----------|
| **Sitemap.xml** | Valid XML, all pages listed | ☐ |
| **robots.txt** | Allows crawling, disallows /admin | ☐ |
| **SSL/HTTPS** | All pages serve over HTTPS | ☐ |
| **Mobile Responsive** | Passes Google Mobile-Friendly Test | ☐ |
| **Core Web Vitals** | LCP <2.5s, FID <100ms, CLS <0.1 | ☐ |
| **Page Speed** | Lighthouse score >80 (mobile) | ☐ |
| **No Duplicate Content** | Canonical tags prevent duplication | ☐ |
| **Clean URLs** | No params, readable slugs | ☐ |

### JSON-LD Schema

| Type | Location | Verified |
|------|----------|----------|
| **Organization** | Homepage & footer | ☐ |
| **LocalBusiness** | Homepage & contact page | ☐ |
| **Offer** | Property detail pages | ☐ |
| **Product** | Property listings | ☐ |
| **FAQPage** | FAQ page | ☐ |

**Test Schema:**
1. Go to https://validator.schema.org/
2. Paste HTML source of each page type
3. No errors or warnings expected

### Open Graph & Twitter Cards

| Meta Tag | Expected | Verified |
|----------|----------|----------|
| `og:title` | Matches or similar to page title | ☐ |
| `og:description` | Matches or similar to meta description | ☐ |
| `og:image` | 1200x630px image, actual URL | ☐ |
| `og:url` | Canonical URL | ☐ |
| `twitter:card` | "summary_large_image" for properties | ☐ |

**Test Social Sharing:**
- [ ] Facebook Sharing Debugger: image/title visible
- [ ] Twitter Card Validator: image previews
- [ ] LinkedIn Post Inspector: content renders

---

## Post-Launch Monitoring (First 7 Days)

### Daily Checks

- [ ] Check uptime: `/api/health` responding <200ms
- [ ] Monitor error logs: no 500s or unhandled exceptions
- [ ] Monitor traffic: GA shows organic traffic inbound
- [ ] Check Core Web Vitals: LCP/FID/CLS remain stable
- [ ] Social media: share test posts, verify preview

### Weekly Checks (Day 7)

- [ ] Google Search Console:
  - Coverage report (any errors?)
  - Index coverage (all pages indexed?)
  - Core Web Vitals performance
- [ ] Lighthouse audit: run again, should be stable
- [ ] Broken links: test with https://www.broken-link-checker.com/
- [ ] Analytics funnel: signup/login/property view events flowing
- [ ] Payment flow: test Paystack in production
- [ ] Email: verify password reset emails arrive

### Monthly Ongoing

- [ ] GA4: review top pages, bounce rates, conversion rates
- [ ] GSC: monitor search queries, impressions, CTR
- [ ] SEMrush/Ahrefs: track keyword rankings
- [ ] Lighthouse: monitor Core Web Vitals and performance score
- [ ] Security: run `npm audit`, update critical deps
- [ ] Backups: verify nightly database backups

---

## Rollback Procedure (If Issues)

### Backend Rollback (< 5 minutes)

**If database migration failed:**
```bash
# Check current migration status
npx prisma migrate status

# Revert to previous migration
npx prisma migrate resolve --rolled-back <migration-name>

# Redeploy previous version
git revert HEAD
git push origin main
# Re-deploy via Render/Heroku
```

**If API endpoints broken:**
```bash
# Redeploy previous commit
git checkout <previous-commit-hash>
git push --force origin main
# or manually restore from backup server
```

### Frontend Rollback (< 2 minutes)

**On Vercel/Netlify:**
1. Go to Dashboard → Deployments
2. Click on previous successful deployment
3. Click "Promote to Production"
4. Verify: `https://realviewgh.com` loads previous version

**Manual fallback:**
```bash
# Serve from CDN cache (if using Cloudflare)
# Disable cache purge, wait for cache to restore
# or revert DNS to previous IP
```

---

## Production Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **LCP (Largest Contentful Paint)** | <2.5s | TBD | ☐ |
| **FID (First Input Delay)** | <100ms | TBD | ☐ |
| **CLS (Cumulative Layout Shift)** | <0.1 | TBD | ☐ |
| **TTFB (Time to First Byte)** | <600ms | TBD | ☐ |
| **Page Load Time (Fully Loaded)** | <3s | TBD | ☐ |
| **Lighthouse Score** | >80 | TBD | ☐ |
| **Uptime** | >99.5% | TBD | ☐ |
| **API Response Time** | <200ms (p95) | TBD | ☐ |

---

## Sign-Off

- [ ] **Dev Lead:** _________________ Date: _______
- [ ] **QA Lead:** _________________ Date: _______
- [ ] **DevOps/Deployment:** _________________ Date: _______
- [ ] **Product Owner:** _________________ Date: _______

**Deployment Timestamp:** _________________  
**Deployed Version:** _________________  
**Notes:** _________________________________________________

---

## Support & Incident Response

**If production is down:**
1. Check status page: https://realviewsafe.onrender.com/api/health
2. Check logs: Render dashboard or Heroku Logs
3. Identify issue (DB, API, frontend CDN?)
4. Follow rollback procedure above
5. Post incident report with root cause analysis

**Escalation:**
- P0 (Full outage): Immediately contact DevOps lead
- P1 (Major feature broken): Notify within 5 minutes
- P2 (Minor issue): Fix in next deployment or wait for scheduled update

**Support Channels:**
- Slack: #production-alerts
- Email: devops@realviewgh.com
- On-call: Check rotation schedule

