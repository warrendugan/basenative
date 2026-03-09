# AGENTS.md — Persistent Learnings

This file accumulates learnings and discovered patterns across development iterations to prevent repeated mistakes and ensure every AI agent follows the project standards.

## READ FIRST

Before doing ANY work, read these files:
1. `.spec-kit/memory/constitution.md` — The 8 inviolable architecture standards
2. `CLAUDE.md` — Quick reference for token patterns and project structure
3. `prd.json` — Current story backlog

## Core Architecture — MEMORIZE THIS

### The 8 Standards (Summary)
1. **Semantic HTML** — No div/span. Use article, section, nav, dl, table, dialog, etc.
2. **Relational CSS** — No class names. Element selectors, attribute selectors, :has(), combinators.
3. **DTCG Tokens** — All values from tokens.json → var(--color-*), var(--space-*), etc.
4. **Page Model** — All strings in TypeScript. Zero magic strings in HTML.
5. **Dedicated Files** — Separate .ts, .html, .css per component. No inline templates/styles.
6. **Modern Angular 21** — Signals, inject(), @if/@for, standalone only.
7. **Multi-Tenant** — Every query scoped by tenant_id.
8. **Cloudflare-Native** — Pages + Workers + D1 + KV.

### Entity Map
| Entity | Domain | Purpose |
|--------|--------|---------|
| Dugan Labs | duganlabs.com | Parent umbrella, R&D |
| BaseNative | basenative.com | Open source + hardware |
| GreenPut | greenput.com | Fintech engine, CRM |

## CSS Token Variable Reference

The ONLY valid CSS custom property prefixes (generated from tokens.json):

```
--color-*           Colors (oklch)
--space-*           Spacing (4px scale)
--radius-*          Border radii
--shadow-*          Box shadows
--blur-*            Backdrop blurs
--size-*            Fixed dimensions
--z-index-*         Stacking order
--typography-*      Fonts, sizes, weights, line-heights
--transition-*      Timing functions
--breakpoint-*      Media query widths
```

### NEVER use these legacy prefixes:
- `--gp-*` (old GreenPut prefix)
- `--pb-*` (old Pending Business prefix)
- `--yp-*` (old YieldPay prefix)
- `--bn-*` (old BaseNative prefix)

### Semantic Element → CSS Selector Mapping

| Instead of... | Use... |
|---|---|
| `.card` | `article` |
| `.badge` | `mark[data-type]` or `output[data-status]` |
| `.sidebar` | `aside` |
| `.nav-section` | `nav > menu` |
| `.header` | `header` or `hgroup` |
| `.container` | `section` or `main` |
| `.form-group` | `fieldset` or `label` |
| `.toggle-switch` | `input[type="checkbox"]` with appearance:none |
| `.modal` | `dialog` |
| `.accordion` | `details > summary` |
| `.tab-content` | `section[data-tab]` |
| `.breadcrumb` | `nav[aria-label="breadcrumb"]` |

### Page Model Pattern

```typescript
// EVERY component must have this:
readonly page = {
  title: 'Component Title',
  subtitle: 'Description text',
  labels: { /* all visible strings */ },
  actions: { /* button labels */ },
  columns: { /* table headers */ },
} as const;
```

Template: `{{ page.title }}`, never `'Dashboard'` directly.

## Common Pitfalls — AVOID THESE

### CSS Pitfalls

❌ `class="card-header"` → ✅ `header` (element selector)
❌ `background: #10b981` → ✅ `background: var(--color-accent)`
❌ `padding: 1rem` → ✅ `padding: var(--space-4)`
❌ `border-radius: 8px` → ✅ `border-radius: var(--radius-md)`
❌ `font-size: 0.875rem` → ✅ `font-size: var(--typography-size-sm)`
❌ `transition: all 0.2s` → ✅ `transition: all var(--transition-normal)`

### HTML Pitfalls

❌ `<div class="sweep-card">` → ✅ `<article data-enabled="true">`
❌ `<span class="badge">Active</span>` → ✅ `<output data-status="active">Active</output>`
❌ `<div class="toggle-switch"><span class="slider">` → ✅ `<input type="checkbox" />`
❌ `<div class="detail-row"><span>Label</span><span>Value</span>` → ✅ `<dl><dt>Label</dt><dd>Value</dd></dl>`

### Angular Pitfalls

❌ `@Input() count: number` → ✅ `count = input<number>(0)`
❌ `constructor(private svc: MyService)` → ✅ `private svc = inject(MyService)`
❌ `*ngFor="let item of items"` → ✅ `@for (item of items(); track item.id)`
❌ `template: \`...\`` → ✅ `templateUrl: './component.html'`
❌ `styles: [\`...\`]` → ✅ `styleUrl: './component.css'`

### Token Build Pitfalls

❌ Running `npx tsx` in sandbox (socket error) → ✅ Use `node -e` with require()
❌ Referencing `--gp-spacing-lg` → ✅ Use `--space-6`
❌ Hardcoded rgba values → ✅ Use `var(--color-status-*-subtle)` tokens

## Infrastructure

### Cloudflare Resources
- D1 Database: `56e32427-2991-40ac-b9a5-185c119866f4`
- KV Namespace: `bd581f8f43214a1f96463bcaf13b4f82`
- Pages Projects: greenput, duganlabs, basenative

### CI/CD
- `.github/workflows/deploy.yml` — Full ecosystem deploy
- Matrix builds: [greenput, duganlabs, showcase]
- Worker deploy with wrangler-action@v3
- Health checks for all services

### API Endpoints (greenput-api Worker)
- `GET/POST /api/leads`
- `GET/PUT/DELETE /api/leads/:id`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/health`

## Recent Learnings

### 2026-03-08: Architecture Refactor
- Expanded tokens.json from ~60 to 131 CSS custom properties
- Added semantic tokens: status colors, stage colors, account type colors
- Added typography scale, letter spacing, transitions, breakpoints, sizes
- All 8 GreenPut feature components refactored to semantic HTML + relational CSS + page model
- Dashboard uses hgroup, dl, article, time elements
- Deals kanban uses section[data-stage], article[aria-expanded], ol, menu
- Treasury uses proper table element, mark[data-type], output[data-status]
- Sweep uses input[type=checkbox] with appearance:none for toggle (no span.slider)
- Documents uses table, mark[data-type], output[data-status], figure for empty state
- Fixed token prefix inconsistencies: --gp-* and --pb-* replaced with canonical --color-*, --space-*, etc.

### 2026-03-08: Spec-Kit Implementation
- Created .spec-kit directory with constitution, specs, plans, tasks
- Constitution codifies all 8 architecture standards as immutable rules
- Updated CLAUDE.md and AGENTS.md to reference constitution first

---
**Last Updated**: 2026-03-08
