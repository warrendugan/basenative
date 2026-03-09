# GreenPut — Deployment Guide

## What's Already Done (Cloudflare)

The following infrastructure has been provisioned via API:

| Resource | ID | Status |
|---|---|---|
| **D1 Database** `greenput-prod-db` | `56e32427-2991-40ac-b9a5-185c119866f4` | Schema deployed (5 tables, 8 indexes) |
| **KV Namespace** `greenput-sessions` | `bd581f8f43214a1f96463bcaf13b4f82` | Created, empty |
| **Worker** `greenput-api` | Existing | Code updated locally, needs deploy |
| **Admin User** `warren@greenput.com` | `usr_001` | Seeded in D1 |

### D1 Tables

- `users` — Admin, manager, technician, sales roles
- `leads` — Full CRM lead tracking with service types
- `receipts` — Cryptographic consent receipts (GDPR-ready)
- `revocations` — Consent revocation audit trail
- `events` — Calendar/scheduling with ICS feed support

---

## Step 1: Push to GitHub

From your local machine (in the `basenative/` directory):

```bash
# Create a feature branch for the new consolidation
git checkout -b feat/consolidate-to-greenput

# Stage all new and modified files
git add \
  apps/greenput/ \
  apps/api-gateway/ \
  apps/greenput-api/src/index.ts \
  apps/greenput-api/wrangler.toml \
  apps/greenput-api/migrations/ \
  libs/core/src/index.ts \
  libs/core/src/lib/ux-laws/ \
  libs/shared/ \
  libs/navigation/src/ \
  libs/feedback/src/ \
  tsconfig.base.json

# Commit
git commit -m "feat: consolidate pending-business and yield-pay-ui into greenput

- Move deal tracking from pending-business to greenput
- Move treasury/sweep from yield-pay-ui to greenput
- Clean up route defaults and tenant mappings
- Update API routes to use greenput as sole tenant
- Consolidate test simulations to greenput only
- Update ORCHESTRATION.md with Dugan Labs/BaseNative/GreenPut structure
- Update pact configuration for single consumer model"

# Push and create PR
git push -u origin feat/consolidate-to-greenput
```

---

## Step 2: Deploy the Greenput API Worker

From the `apps/greenput-api/` directory:

```bash
cd apps/greenput-api

# Deploy to production
npx wrangler deploy

# Set the JWT secret (do NOT commit this)
npx wrangler secret put JWT_SECRET
# Enter a strong random secret when prompted
```

### Verify the deployment

```bash
# Health check
curl https://greenput-api.<your-subdomain>.workers.dev/health

# Create a test lead
curl -X POST https://greenput-api.<your-subdomain>.workers.dev/leads \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: greenput" \
  -d '{
    "firstName": "Test",
    "lastName": "Lead",
    "email": "test@example.com",
    "phone": "555-0100",
    "serviceType": "ev-charger",
    "purposes": { "lead-contact": "granted", "marketing": "denied" }
  }'

# List leads
curl https://greenput-api.<your-subdomain>.workers.dev/leads \
  -H "X-Tenant-ID: greenput"
```

---

## Step 3: Serve the Greenput Angular App

```bash
# From the workspace root
npx nx serve greenput --configuration=development
# Runs on http://localhost:4300
```

The app connects to the API gateway at `http://localhost:3000` in dev mode
and the Cloudflare Worker in production (configured in environment files).

---

## Step 4: (Optional) Run the Express API Gateway Locally

For local development with the Express gateway instead of the Worker:

```bash
# Build the gateway
npx nx build api-gateway

# Run it
npx nx serve api-gateway
# Runs on http://localhost:3000
```

---

## Architecture Map

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Edge                    │
│                                                     │
│  ┌─────────────┐   ┌───────────────────────────┐   │
│  │ greenput-api │──▶│ D1: greenput-prod-db      │   │
│  │   (Worker)   │   │  ├── users                │   │
│  │              │──▶│  ├── leads                 │   │
│  │              │   │  ├── deals                 │   │
│  │              │   │  ├── receipts              │   │
│  │              │   │  ├── revocations           │   │
│  │              │   │  └── events                │   │
│  │              │──▶│                            │   │
│  │              │   │ KV: greenput-sessions      │   │
│  └─────────────┘   └───────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ▲
         │ HTTPS
         │
┌────────┴────────────────────────────────────────────┐
│                    Nx Monorepo                       │
│                                                     │
│  apps/                                              │
│  ├── greenput/          (Angular 21 Fintech — :4300)│
│  ├── api-gateway/       (Express — :3000, local)    │
│  ├── greenput-api/      (Cloudflare Worker)         │
│  └── showcase/          (BaseNative docs — :4200)   │
│                                                     │
│  libs/                                              │
│  ├── core/              (signals, UX laws, DI)      │
│  ├── tokens/            (theme, CSS vars)           │
│  ├── forms/             (input, wizard)             │
│  ├── layout/            (card, list)                │
│  ├── navigation/        (sidebar, breadcrumbs)      │
│  ├── feedback/          (toast, alert)              │
│  ├── primitives/        (a11y, anchor, dialog, …)   │
│  ├── ui/glass/          (button, icon, logo, …)     │
│  ├── greenput/domain/   (consent state machine)     │
│  ├── greenput/ui/       (consent UI components)     │
│  └── shared/util-auth/  (JWT, guard, interceptor)   │
└─────────────────────────────────────────────────────┘
```

---

## Environment Variables

| Variable | Where | Value |
|---|---|---|
| `JWT_SECRET` | Cloudflare Worker secret | Set via `wrangler secret put` |
| `API_URL` | Greenput app environment.ts | `http://localhost:3000` (dev) / Worker URL (prod) |

---

## Next Steps

1. **Cloudflare Pages** — Deploy the Greenput Angular app via Pages (connect GitHub repo, set build command to `npx nx build greenput --configuration=production`, output dir `dist/apps/greenput/browser`)
2. **Custom Domain** — Point `greenput.com` to the Pages deployment
3. **Worker Custom Route** — Point `api.greenput.com` to the Worker
4. **Auth Flow** — Implement real JWT signing in the Worker (replace mock tokens)
5. **S-Corp Engine** — Plan next consolidated product in the Dugan Labs ecosystem
