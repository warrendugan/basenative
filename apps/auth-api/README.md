# WebAuthn Passkey Authentication POC

Self-hosted WebAuthn (passkey) authentication proof of concept using
`@simplewebauthn/server`, `better-sqlite3`, and asymmetric JWT (RS256).

## Architecture

```
  Browser (Angular 21)                   Identity API (Express)
 ┌──────────────────────┐              ┌─────────────────────────────┐
 │  apps/web             │              │  apps/auth-api              │
 │                       │              │                             │
 │  /register            │   HTTP       │  POST /auth/register/start  │
 │  /login            ◄──┼──────────────┼► POST /auth/register/finish │
 │  /dashboard           │              │  POST /auth/authenticate/*  │
 │                       │              │  GET  /auth/.well-known/jwks│
 │  ┌─────────────────┐  │              │  POST /auth/credentials/*   │
 │  │ WebAuthnService  │  │              │  GET  /auth/credentials     │
 │  │ (data-access)    │  │              │                             │
 │  └────────┬────────┘  │              │  ┌───────────┐ ┌──────────┐ │
 │           │           │              │  │ SQLite DB  │ │ RS256    │ │
 │  ┌────────┴────────┐  │              │  │ users      │ │ JWT Keys │ │
 │  │ AuthContext      │  │              │  │ credentials│ └──────────┘ │
 │  │ (shared/auth)    │  │              │  └───────────┘              │
 │  └─────────────────┘  │              │                             │
 └──────────────────────┘              │  ┌────────────────────────┐ │
                                        │  │ In-memory challenge    │ │
  Libraries                             │  │ store (5-min TTL)      │ │
 ┌──────────────────────┐              │  └────────────────────────┘ │
 │ libs/shared/types     │              │                             │
 │  AppClaims            │              │  ┌────────────────────────┐ │
 │  StoredCredential     │◄─────────────┼──│ Event Bus (typed)      │ │
 │  IdentityEvent        │              │  └────────────────────────┘ │
 │  API contracts        │              └─────────────────────────────┘
 ├──────────────────────┤
 │ libs/identity/domain  │
 │  User aggregate       │
 │  Credential VO        │
 │  Event bus            │
 ├──────────────────────┤
 │ libs/shared/auth      │
 │  AuthContext (signals) │
 │  authInterceptor      │
 │  authGuard/noAuthGuard│
 │  JWT decode utility   │
 ├──────────────────────┤
 │ libs/identity/        │
 │  data-access          │
 │  WebAuthnService      │
 └──────────────────────┘
```

## Setup

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run

Start both servers in separate terminals:

```bash
# Terminal 1: Identity API (port 3333)
npx nx serve auth-api

# Terminal 2: Angular app (port 4200)
npx nx serve web
```

### Happy Path

1. Open `http://localhost:4200/register`
2. Enter email + display name, click "Register Passkey"
3. Complete the browser passkey ceremony (Touch ID / Windows Hello / etc.)
4. You land on `/dashboard` showing JWT claims + credentials
5. Click "Sign out"
6. Go to `/login`, enter the same email, click "Sign in with Passkey"
7. Complete the browser assertion ceremony
8. Back on `/dashboard` — click "Revoke" on a credential

## API Endpoints

| Method | Path                          | Auth     | Description                      |
| ------ | ----------------------------- | -------- | -------------------------------- |
| POST   | `/auth/register/start`        | Public   | Get registration options          |
| POST   | `/auth/register/finish`       | Public   | Verify attestation, issue JWT     |
| POST   | `/auth/authenticate/start`    | Public   | Get authentication options        |
| POST   | `/auth/authenticate/finish`   | Public   | Verify assertion, issue JWT       |
| GET    | `/auth/.well-known/jwks`      | Public   | RS256 public key for verification |
| GET    | `/auth/credentials`           | Bearer   | List user credentials             |
| POST   | `/auth/credentials/revoke`    | Bearer   | Revoke a credential by ID         |
| GET    | `/health`                     | Public   | Health check                      |

## JWT Claims Shape

```typescript
interface AppClaims {
  sub: string;       // User ID
  email: string;     // User email
  roles: string[];   // e.g. ["user"]
  tenantId: string;  // Tenant identifier
  iat: number;       // Issued at
  exp: number;       // Expiration
  jti: string;       // Unique token ID
}
```

## Domain Events

```typescript
type IdentityEvent =
  | { type: 'UserRegistered'; userId: string; email: string; tenantId: string }
  | { type: 'UserLoggedIn'; userId: string; credentialId: string; at: Date }
  | { type: 'CredentialRevoked'; userId: string; credentialId: string };
```

Events are published to an in-memory bus and logged to console in the POC.

## Key Design Decisions

- **Asymmetric JWT (RS256)**: Keys generated at startup; JWKS endpoint allows other services to verify tokens without sharing secrets
- **SQLite via better-sqlite3**: Zero-config persistence for the POC
- **Challenge store**: In-memory Map with 5-minute TTL and periodic cleanup
- **Angular signals**: AuthContext exposes only signals (no Observables in public API)
- **authInterceptor**: Single place in the Angular app that touches raw tokens
- **Shared types**: All domain types live in `libs/shared/types` — never duplicated
