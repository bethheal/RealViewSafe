# RealViewEstate: Production-Ready Real Estate Platform

**Status:** Production-Ready (v1.0)  
**Last Updated:** February 6, 2026

---

## Quick Start

### Prerequisites

- **Node.js:** v18+ (verify with `node --version`)
- **npm:** v9+ (verify with `npm --version`)
- **Database:** PostgreSQL 14+ (or MySQL/MariaDB)
- **API Keys:** Paystack, Google OAuth, Resend (email)

### Backend Setup (5 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5000/realview_dev"
JWT_SECRET="$(openssl rand -base64 32)"
APP_URL="http://localhost:5173"
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug

# Paystack
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PLAN_STANDARD="PLN_..."
PAYSTACK_PLAN_PREMIUM="PLN_..."

# Email
RESEND_API_KEY="re_..."
MAIL_FROM="noreply@realviewgh.com"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."

# Bootstrap admin account
BOOTSTRAP_ADMIN_EMAIL="admin.admin@realviewgh.com"
BOOTSTRAP_ADMIN_NAME="System Admin"
BOOTSTRAP_ADMIN_PASSWORD="ChangeMe@123"
EOF

# Run database migrations
npx prisma migrate deploy

# Seed initial data
node prisma/seedAdmin.js

# Start development server
npm run dev
# Expected output: "🚀 Server running on port 5000"
```

### Frontend Setup (5 minutes)

```bash
cd frontend/real-view-estate

# Install dependencies
npm install

# Create .env.development (or .env)
cat > .env << EOF
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID="..."
VITE_PAYSTACK_PUBLIC_KEY="pk_test_..."
VITE_USE_MOCK=false
VITE_SITE_URL=https://realviewgh.com
EOF

# Start development server (Vite)
npm run dev
# Expected output: "  ➜  Local:   http://localhost:5173/"
```

### Test the App

1. Open http://localhost:5173 in browser
2. Verify no console errors
3. Test login: Navigate to /login
4. Test property browse: Click on homepage "Browse Properties"
5. Test API: `curl http://localhost:5000/api/health`

---

## Project Structure

```
RealViewSafe/
├── backend/                          # Node.js + Express API
│   ├── controllers/                  # Route handlers
│   ├── middleware/                   # Auth, error, logging, rate limit
│   ├── routes/                       # API endpoints
│   ├── services/                     # Business logic
│   ├── utils/                        # Helpers (logger, JWT, email, validation)
│   ├── prisma/                       # Database schema & migrations
│   ├── server.js                     # Express app entry point
│   ├── package.json                  # Dependencies: express, prisma, helmet, etc.
│   └── .env.example                  # Environment template
│
├── frontend/real-view-estate/        # React + Vite SPA
│   ├── src/
│   │   ├── components/               # React components (Seo, ErrorBoundary, etc.)
│   │   ├── pages/                    # Page components
│   │   ├── context/                  # Auth, Redux store
│   │   ├── services/                 # API client, business logic
│   │   ├── lib/                      # Utilities (sanitize, media)
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── layouts/                  # Page layouts (with SiteJsonLd)
│   │   ├── App.jsx                   # Routes & app wrapper
│   │   └── main.jsx                  # React entry point
│   ├── public/                       # Static files (robots.txt, sitemap.xml)
│   ├── scripts/                      # Build scripts (validate-env, generate-sitemap)
│   ├── package.json                  # Dependencies: react, vite, helmet-async
│   ├── vite.config.js                # Vite build config
│   ├── .env.example                  # Environment template
│   └── .env.production               # Production env values
│
├── PRODUCTION_AUDIT.md               # Comprehensive security & env audit
├── SEO_CONTENT_BRIEFS.md             # SEO strategy, keyword clusters, content plan
├── DEPLOYMENT_CHECKLIST.md           # Pre-launch & post-launch checklists
├── README.md                         # This file
└── .gitignore                        # Git ignore rules (include .env, node_modules)
```

---

## Key Features

### ✅ Production-Ready Security

- **HTTP Security Headers** (Helmet.js)
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - Strict-Transport-Security (HSTS for HTTPS)
  - Content Security Policy (CSP)

- **Authentication**
  - JWT-based auth with 7-day expiry
  - Google OAuth support
  - Password hashing with bcrypt
  - Protected routes with role-based access (BUYER, AGENT, ADMIN)

- **Rate Limiting**
  - `/api/auth`: 10 requests per 15 minutes
  - `/api/payments`: 5 requests per 1 hour
  - `/api/properties`: 20 requests per 1 hour

- **Input Validation**
  - Backend: Email, phone, enum validation
  - Frontend: XSS prevention, HTML sanitization helpers

### ✅ Structured Logging & Monitoring

- **Pino Logger**
  - JSON-formatted logs for production
  - Request ID tracking across requests
  - Log levels: debug, info, warn, error

- **Request Tracing**
  - Every request gets unique UUID
  - Logged in response header: `X-Request-Id`
  - Enables correlation of logs across services

### ✅ Error Handling

- **Backend**
  - Centralized error middleware
  - Stack traces hidden in production
  - User-friendly error messages

- **Frontend**
  - React Error Boundary component
  - Error fallback UI with refresh button
  - Optional Sentry integration ready

### ✅ SEO & Social Sharing

- **Dynamic Meta Tags**
  - React Helmet for managing `<head>` tags
  - Unique titles & descriptions per page
  - OG image, Twitter cards

- **Schema Markup** (JSON-LD)
  - Organization & LocalBusiness (site-wide)
  - Product schema (properties)
  - Offer schema (prices)
  - FAQPage schema (FAQ sections)

- **Sitemap & Robots**
  - Pre-built sitemap.xml (static pages)
  - robots.txt (allows crawling, blocks /admin)

### ✅ Performance Optimizations

- **Image Optimization**
  - Lazy loading (`loading="lazy"`)
  - Width/height attributes (prevents layout shift)
  - CDN-ready (serve WebP with fallback)

- **Code Splitting**
  - Route-based lazy loading (React.lazy)
  - Vendor chunks separated

- **Caching**
  - Static assets: cache busting via Vite
  - API responses: Can add Redis (future)
  - Browser cache headers: 1-hour for uploads, long-term for versioned files

---

## Environment Variables

### Backend Required (Server-side Only)

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://...` | Prisma connection string |
| `JWT_SECRET` | `base64-random-32-chars` | Sign/verify auth tokens |
| `APP_URL` | `https://realviewgh.com` | Base URL for links (password reset, callbacks) |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` | Paystack webhook signing |

### Backend Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Set to `production` in prod |
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Pino log level |
| `PAYSTACK_PLAN_STANDARD` | None | Paystack plan ID for BASIC tier |
| `PAYSTACK_PLAN_PREMIUM` | None | Paystack plan ID for PREMIUM tier |
| `PAYSTACK_AMOUNT_STANDARD` | `15000` | Price in pesewas (GHS*100) |
| `PAYSTACK_AMOUNT_PREMIUM` | `25000` | Price in pesewas |
| `RESEND_API_KEY` | None | Resend email service |
| `MAIL_FROM` | None | Email sender address |
| `GOOGLE_CLIENT_ID` | None | Google OAuth for social login |

### Frontend Required (Build-time, Baked into Bundle)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `https://api.realviewgh.com` | Backend API base URL |

### Frontend Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_GOOGLE_CLIENT_ID` | None | Google OAuth public key |
| `VITE_PAYSTACK_PUBLIC_KEY` | None | Paystack public key |
| `VITE_USE_MOCK` | `true` | Enable mock data (dev only) |
| `VITE_SITE_URL` | `https://realviewgh.com` | Canonical site URL (for SEO) |

---

## Deployment

### To Render (Recommended)

**Backend:**
```bash
# Connect GitHub repo, select backend/ as root
# Configure Build Command: npm install && npx prisma migrate deploy
# Configure Start Command: npm start
# Add environment variables in Render dashboard
# Deploy
```

**Frontend:**
```bash
# Connect GitHub repo, select frontend/real-view-estate/ as root
# Framework: Vite
# Build Command: npm run build
# Publish Directory: dist
# Add environment variables
# Deploy
```

### To Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
# Select frontend/real-view-estate as project root
# Vercel auto-detects Vite
# Add .env.production vars in dashboard
```

### Local Production Build

```bash
# Backend
cd backend
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
npm start

# Frontend
cd frontend/real-view-estate
npm run build        # Creates dist/
npm run preview      # Serves at http://localhost:4173
```

---

## Testing Checklist

### Login Flows

- [ ] Email/password login works
- [ ] Google OAuth redirects and authenticates
- [ ] Token stored in localStorage
- [ ] Logout clears token
- [ ] Protected routes redirect unauthenticated users

### Property Listings

- [ ] Browse properties without login
- [ ] Filter by location, price, type
- [ ] Lazy load property images
- [ ] View property details (modal)
- [ ] Save property (requires login)

### Payments

- [ ] Initiate Paystack subscription
- [ ] Verify payment webhook
- [ ] Update subscription status in DB
- [ ] Send confirmation email

### API

- [ ] GET `/api/health` returns `{ ok: true }`
- [ ] GET `/api/properties` returns listing
- [ ] POST `/api/auth/login` returns JWT
- [ ] Rate limiting blocks after threshold
- [ ] Error responses are JSON with status code

---

## Troubleshooting

### Backend Won't Start

```bash
# Check database connection
npx prisma migrate status

# Check .env file exists and DATABASE_URL is set
cat backend/.env | grep DATABASE_URL

# Check port isn't in use
lsof -i :5000

# Check logs
npm start 2>&1 | head -50
```

### Frontend Build Fails

```bash
# Clear cache
rm -rf node_modules/.vite
npm cache clean --force

# Rebuild
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### CORS Errors

```bash
# Verify backend CORS config includes frontend origin
# Check ALLOWED_ORIGINS in server.js
# Ensure VITE_API_URL in frontend matches backend domain
```

### Payment Issues

```bash
# Test Paystack keys
curl -H "Authorization: Bearer sk_test_..." \
  https://api.paystack.co/transaction/verify/ref

# Check webhook signature in logs
grep "Paystack webhook" backend/logs
```

---

## Performance Monitoring

### Core Web Vitals (Google)

```bash
# Test locally
npm run build
npm run preview
# Open http://localhost:4173
# DevTools > Lighthouse > Analyze page load
```

### Bundle Analysis

```bash
npm install --save-dev rollup-plugin-visualizer

# Check bundle size
npm run build
# Open dist/stats.html
```

### Logging & Error Tracking

**View backend logs in production:**
```bash
# Render
render logs --service realview-backend --follow

# Heroku
heroku logs --app realview-backend --tail

# DigitalOcean
doctl apps logs realview-backend --follow
```

---

## Maintenance

### Database

**Backup:**
```bash
# Render/Heroku automatic backups are enabled by default
# Manual backup
pg_dump DATABASE_URL > backup-$(date +%s).sql
```

**Migrate:**
```bash
npx prisma migrate dev --name <migration-name>
npx prisma migrate deploy  # production
```

### Dependencies

```bash
# Check for updates
npm outdated

# Update
npm update

# Audit security
npm audit
npm audit fix
```

### Logs

```bash
# View recent errors
grep ERROR backend/logs/*.json | tail -20

# Analyze by endpoint
grep POST backend/logs/*.json | jq '.url' | sort | uniq -c
```

---

## Support & Documentation

- **Production Audit:** See `PRODUCTION_AUDIT.md` for security audit, env vars, and issues
- **SEO Strategy:** See `SEO_CONTENT_BRIEFS.md` for keyword clusters and content plan
- **Deployment:** See `DEPLOYMENT_CHECKLIST.md` for pre-launch and post-launch checklists
- **API Docs:** Backend routes in `backend/routes/`
- **Component Docs:** Frontend components in `frontend/real-view-estate/src/components/`

---

## License

Proprietary © 2026 RealViewEstate. All rights reserved.

---

**Questions?** Contact: realview@realview.gh

