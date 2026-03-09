# Labor Abstraction Ecosystem — Orchestration Guide

## The Ecosystem at a Glance

| Entity | App | Port | Domain (Proposed) | Purpose |
|--------|-----|------|-------------------|---------|
| **Dugan Labs** | — | — | `duganlabs.com` | R&D parent company |
| **BaseNative** | `showcase` | 4200 | `basenative.com` | Design system docs + component showcase |
| **GreenPut** | `greenput` | 4300 | `greenput.com` | Fintech CRM (deals/M&A, treasury, sweep, documents, leads) |
| **S-Corp Engine** | *(planned)* | 4600 | `scorpengine.com` | W-2 to S-Corp transition platform |
| **API** | `greenput-api` | 8787 | `api.greenput.com` | Multi-tenant Cloudflare Worker |
| **Gateway** | `api-gateway` | 3000 | *(local dev only)* | Express gateway for local development |

---

## Monorepo Architecture (26 Nx Projects)

```
basenative/
├── apps/
│   ├── greenput/              Angular 21 — Fintech CRM (:4300)
│   ├── showcase/              Angular 21 — BaseNative Docs (:4200)
│   ├── greenput-api/          Cloudflare Worker (D1 + KV)
│   ├── api-gateway/           Express (local dev JWT gateway)
│   └── showcase-e2e/          Playwright E2E tests
│
├── libs/
│   ├── core/                  Signals, DI, platform detection, UX Laws
│   ├── tokens/                Theme service, CSS variables, design tokens
│   ├── forms/                 Input, Wizard, WizardStep
│   ├── layout/                Card, CardSection, List, ListItem
│   ├── navigation/            Sidebar, Breadcrumbs
│   ├── feedback/              ToastService, ToastContainer, Alert
│   ├── primitives/
│   │   ├── a11y/              VisuallyHidden
│   │   ├── anchor/            CSS Anchor Positioning
│   │   ├── dialog/            DialogService, DialogComponent
│   │   ├── focus/             FocusTrap directive
│   │   ├── portal/            Portal directive
│   │   └── scroll/            Scroll directive
│   ├── ui/glass/              Button, Icon, Logo, ThemeSelector, + 7 more
│   ├── greenput/
│   │   ├── domain/            ConsentStateMachine, ReceiptGenerator
│   │   └── ui/                6 consent UI components
│   ├── shared/
│   │   └── util-auth/         TokenService, authGuard, authInterceptor
│   ├── data/                  Philosophies, domain data
│   ├── docs/                  Documentation routes + components
│   └── features/showcase/     Demo pages (Status, Media, Editor, Desktop)
│
├── tools/
│   ├── pact/                  Consumer-driven contract testing
│   ├── msw/                   Mock Service Worker handlers + fixtures
│   └── rapl/                  RAPL loop deployment gate config
│
└── .github/workflows/
    ├── rapl-pipeline.yml      RED → AMBER → PACT → LIVE gate
    └── deploy-worker.yml      Auto-deploy greenput-api on push
```

---

## Cloudflare Infrastructure (Live)

| Resource | Type | ID | Status |
|----------|------|-----|--------|
| `greenput-api` | Worker | `62c2e7f9...` | Deployed |
| `greenput-prod-db` | D1 Database | `56e32427-2991-40ac-b9a5-185c119866f4` | 5 tables, 8 indexes |
| `greenput-sessions` | KV Namespace | `bd581f8f43214a1f96463bcaf13b4f82` | Created |

### D1 Schema

- `users` — Multi-tenant user management (admin, manager, technician, sales)
- `leads` — Full CRM lead tracking (panel-upgrade, ev-charger, solar, battery-storage, whole-home-rewire)
- `receipts` — Cryptographic consent receipts (GDPR-compliant)
- `revocations` — Consent revocation audit trail
- `events` — Calendar/scheduling with ICS feed

### Seeded Data

- Admin user: `warren@greenput.com` (role: admin, tenant: greenput)

---

## Reliability Stack

### RAPL Loop (Deployment Gates)

Every PR and push to main passes through 4 sequential gates:

1. **RED** — Lint + unit tests (`nx affected --target=test`)
2. **AMBER** — Integration tests with MSW mocks (simulated API)
3. **PACT** — Contract verification against the Worker API
4. **LIVE** — Build, preview deploy, Playwright E2E

Configured in `.github/workflows/rapl-pipeline.yml`.

### Pact.io (Contract Testing)

Each Angular app is a "consumer" of the `greenput-api` "provider." Consumer contracts are generated on every PR, verified against the live API schema, and published to the Pact Broker.

Configuration: `tools/pact/pact-config.ts`
Sample test: `tools/pact/greenput-api.consumer.pact.ts`

### MSW (Mock Service Worker)

Full mock handlers for all API endpoints — used for:
- Local dev when the Worker is unavailable
- Jest integration tests
- Future Storybook stories

Handlers: `tools/msw/handlers.ts`
Fixtures: `tools/msw/fixtures/leads.ts`, `tools/msw/fixtures/users.ts`

### OpenAPI Spec

Full OpenAPI 3.1 specification at `apps/greenput-api/openapi.yaml`. Use with GitHub Speckit for:
- Auto-generated TypeScript types
- API documentation
- SDK generation
- Contract drift detection

---

## Laws of UX (Codified in BaseNative)

The entire UI framework is built on programmatic enforcement of lawsofux.com principles:

**Constants** (`@basenative/core`):
- `DOHERTY_THRESHOLD_MS = 400` — Max acceptable latency
- `FITTS_MIN_TARGET_SIZE_PX = 44` — Minimum touch target
- `HICKS_MAX_VISIBLE_OPTIONS = 7` — Cap on visible choices
- `MILLER_CHUNK_SIZE = 7` — Working memory limit

**Dev-Mode Validators:**
- `assertMinTargetSize(element)` — Warns on small touch targets
- `assertOptionCount(count)` — Warns on choice overload
- `measureLatency(name)` — Warns on slow operations

**Template Directives:**
- `[uxFittsCheck]` — Drop-on enforcement for interactive elements
- `[uxHicksCheck]="count"` — Enforce option limits
- `[uxMillerCheck]="count"` — Enforce chunking limits

**CSS Tokens** (injected into `:root`):
- `--ux-fitts-min-target`, `--ux-transition-base`, `--ux-gap-related`, `--ux-region-radius`, etc.

---

## Figma Integration

Connected as: **Green PUT** (Pro tier, warren@greenput.com)

### Code Connect Strategy

Map BaseNative components to Figma frames so design stays in sync:
- Button variants (primary, secondary, glass, ghost, danger)
- Card component (elevated, outlined, ghost)
- Sidebar navigation
- Form inputs and wizard
- Toast notifications and alerts

Use Figma's Code Connect MCP to push component mappings whenever the codebase changes.

---

## What Needs Your Input

### 1. AWS Credentials
Run `aws configure` in your terminal with your access key. Once connected, I can set up:
- Route 53 DNS for all domains
- CloudFront distributions (if needed alongside Cloudflare)
- S3 for asset storage
- Cognito (if you want AWS-managed auth instead of custom JWT)

### 2. Domain Inventory
Which domains do you already own? I need to know before configuring DNS:
- `greenput.com` — Confirmed (your email domain)
- `basenative.com` — For showcase and component library
- `duganlabs.com` — For parent entity / landing
- `scorpengine.com` — For future S-Corp platform

### 3. Stripe Organization
GreenPut is the primary fintech product under Dugan Labs. Set up Stripe accounts as needed for processing treasury/sweep transactions.

### 4. The RAPL Loop
Red-Amber-Pact-Live deployment gate is configured in `.github/workflows/rapl-pipeline.yml`. Every PR/push passes through unit tests, integration tests, contract tests, and E2E before production deploy.

---

## Quick Start Commands

```bash
# Serve any app
npx nx serve greenput          # :4300
npx nx serve showcase          # :4200

# Run the local API gateway
npx nx serve api-gateway       # :3000

# Run the Cloudflare Worker locally
npx nx serve greenput-api      # :8787

# Test affected projects
npx nx affected --target=test

# Lint affected projects
npx nx affected --target=lint

# Build everything
npx nx run-many --target=build --all

# Deploy the Worker
npx nx deploy greenput-api
```

---

## Next Steps Priority Order

1. Get AWS credentials configured
2. Confirm domain strategy
3. Push branch to GitHub (see DEPLOY.md)
4. Deploy Worker (`npx nx deploy greenput-api`)
5. Set up Cloudflare Pages for each Angular app
6. Configure custom domains
7. Install Pact + MSW npm packages
8. Run first RAPL pipeline
